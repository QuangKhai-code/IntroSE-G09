------------------------------------------ USE CASE 1 ------------------------------------------
----------------------------------- Thêm hồ sơ đăng kí đội bóng --------------------------------
-- Đầu vào : thông tin đội bóng + danh sách thông tin cầu thủ (dưới dạng json)
CREATE OR REPLACE PROCEDURE register_team(
    p_stadium_name VARCHAR(50),
    p_team_name VARCHAR(50),
    p_players JSON
)
LANGUAGE plpgsql AS $$
DECLARE
    rule_record Rule%ROWTYPE;
    player_count INT;
    foreign_count INT;
    player_json JSON;
    player_name VARCHAR(50);
    player_position VARCHAR(30);
    player_birth_date DATE;
    player_is_foreign BOOLEAN;
	player_note TEXT;
    calculated_age INT;
    v_team_id INT;
BEGIN
    -- Lấy quy tắc từ bảng Rule
    SELECT * INTO rule_record FROM Rule LIMIT 1;

    -- Kiểm tra thông tin đội bóng
    IF p_stadium_name IS NULL OR LENGTH(p_stadium_name) < 5 THEN
        RAISE EXCEPTION 'Tên sân vận động phải dài ít nhất 5 ký tự.';
    END IF;
    IF p_team_name IS NULL OR LENGTH(p_team_name) < 3 THEN
        RAISE EXCEPTION 'Tên đội phải dài ít nhất 3 ký tự.';
    END IF;

    -- Đếm số cầu thủ và cầu thủ ngoại từ dữ liệu đầu vào
    player_count := json_array_length(p_players);
    foreign_count := 0;

    -- Kiểm tra số lượng cầu thủ
    IF player_count < rule_record.min_players THEN
        RAISE EXCEPTION 'Số lượng cầu thủ (%) nhỏ hơn mức tối thiểu (%).', player_count, rule_record.min_players;
    END IF;
    IF player_count > rule_record.max_players THEN
        RAISE EXCEPTION 'Số lượng cầu thủ (%) vượt quá mức tối đa (%).', player_count, rule_record.max_players;
    END IF;

    -- Kiểm tra từng cầu thủ
    FOR i IN 0 .. player_count - 1 LOOP
        player_json := p_players->i;
        player_name := player_json->>'name';
        player_position := player_json->>'position';
        player_birth_date := (player_json->>'birth_date')::DATE;
        player_is_foreign := (player_json->>'is_foreign')::BOOLEAN;
		player_note := (player_json->>'note')::TEXT;
		
        -- Tính tuổi cầu thủ
        calculated_age := DATE_PART('year', AGE(CURRENT_DATE, player_birth_date));

        -- Kiểm tra độ tuổi
        IF calculated_age < rule_record.min_age THEN
            RAISE EXCEPTION 'Cầu thủ % quá trẻ (tuổi: %, tối thiểu: %).', player_name, calculated_age, rule_record.min_age;
        END IF;
        IF calculated_age > rule_record.max_age THEN
            RAISE EXCEPTION 'Cầu thủ % lớn tuổi (tuổi: %, tối đa: %).', player_name, calculated_age, rule_record.max_age;
        END IF;

        -- Đếm cầu thủ ngoại
        IF player_is_foreign THEN
            foreign_count := foreign_count + 1;
        END IF;
    END LOOP;

    -- Kiểm tra số lượng cầu thủ ngoại
    IF foreign_count > rule_record.max_foreign_player THEN
        RAISE EXCEPTION 'Số lượng cầu thủ ngoại (%) vượt quá mức tối đa (%).', foreign_count, rule_record.max_foreign_player;
    END IF;

    -- Thêm đội
    INSERT INTO Team (stadium_name, name)
    VALUES (p_stadium_name, p_team_name)
    RETURNING id INTO v_team_id;

    -- Thêm từng cầu thủ
    FOR i IN 0 .. player_count - 1 LOOP
        player_json := p_players->i;
        INSERT INTO Player (team_id, name, position, birth_date, is_foreign, note)
        VALUES (
            v_team_id,
            player_json->>'name',
            player_json->>'position',
            (player_json->>'birth_date')::DATE,
            (player_json->>'is_foreign')::BOOLEAN,
			(player_json->>'note')::TEXT
        );
    END LOOP;
END;
$$;

-- ===========================================================================================--

------------------------------------------ USE CASE 2 ------------------------------------------
------------------------------- chỉnh sửa hồ sơ đăng kí đội bóng -------------------------------
-- Đầu vào: tương tự như thêm một đội bóng
CREATE OR REPLACE PROCEDURE update_team(
    p_team_id INT,
    p_stadium_name VARCHAR(50),
    p_team_name VARCHAR(50),
    p_players JSON
)
LANGUAGE plpgsql AS $$
DECLARE
    rule_record Rule%ROWTYPE;
    player_count INT;
    foreign_count INT;
    player_json JSON;
    player_id INT;
    player_name VARCHAR(50);
    player_position VARCHAR(30);
    player_birth_date DATE;
    player_is_foreign BOOLEAN;
	player_note TEXT;
    calculated_age INT;
BEGIN

    -- Lấy quy tắc từ bảng Rule
    SELECT * INTO rule_record FROM Rule LIMIT 1;

    -- Kiểm tra thông tin đội bóng
    IF NOT EXISTS (SELECT 1 FROM Team WHERE id = p_team_id) THEN
        RAISE EXCEPTION 'Đội bóng với ID % không tồn tại.', p_team_id;
    END IF;
    IF p_stadium_name IS NULL OR LENGTH(p_stadium_name) < 5 THEN
        RAISE EXCEPTION 'Tên sân vận động phải dài ít nhất 5 ký tự.';
    END IF;
    IF p_team_name IS NULL OR LENGTH(p_team_name) < 3 THEN
        RAISE EXCEPTION 'Tên đội phải dài ít nhất 3 ký tự.';
    END IF;

    -- Đếm số cầu thủ và cầu thủ ngoại từ dữ liệu đầu vào
    player_count := json_array_length(p_players);
    foreign_count := 0;

    -- Kiểm tra số lượng cầu thủ
    IF player_count < rule_record.min_players THEN
        RAISE EXCEPTION 'Số lượng cầu thủ (%) nhỏ hơn mức tối thiểu (%).', player_count, rule_record.min_players;
    END IF;
    IF player_count > rule_record.max_players THEN
        RAISE EXCEPTION 'Số lượng cầu thủ (%) vượt quá mức tối đa (%).', player_count, rule_record.max_players;
    END IF;

    -- Kiểm tra từng cầu thủ
    FOR i IN 0 .. player_count - 1 LOOP
        player_json := p_players->i;
        player_id := (player_json->>'id')::INT; -- Có thể NULL nếu là cầu thủ mới
        player_name := player_json->>'name';
        player_position := player_json->>'position';
        player_birth_date := (player_json->>'birth_date')::DATE;
        player_is_foreign := (player_json->>'is_foreign')::BOOLEAN;
		player_note := (player_json->>'note')::TEXT;

        -- Tính tuổi cầu thủ
        calculated_age := DATE_PART('year', AGE(CURRENT_DATE, player_birth_date));

        -- Kiểm tra độ tuổi
        IF calculated_age < rule_record.min_age THEN
            RAISE EXCEPTION 'Cầu thủ % quá trẻ (tuổi: %, tối thiểu: %).', player_name, calculated_age, rule_record.min_age;
        END IF;
        IF calculated_age > rule_record.max_age THEN
            RAISE EXCEPTION 'Cầu thủ % lớn tuổi (tuổi: %, tối đa: %).', player_name, calculated_age, rule_record.max_age;
        END IF;

        -- Đếm cầu thủ ngoại
        IF player_is_foreign THEN
            foreign_count := foreign_count + 1;
        END IF;
    END LOOP;

    -- Kiểm tra số lượng cầu thủ ngoại
    IF foreign_count > rule_record.max_foreign_player THEN
        RAISE EXCEPTION 'Số lượng cầu thủ ngoại (%) vượt quá mức tối đa (%).', foreign_count, rule_record.max_foreign_player;
    END IF;

    -- Cập nhật thông tin đội bóng
    UPDATE Team
    SET stadium_name = p_stadium_name,
        name = p_team_name
    WHERE id = p_team_id;

    -- Xóa các cầu thủ không còn trong danh sách JSON
    DELETE FROM Player
    WHERE team_id = p_team_id
    AND id NOT IN (
        SELECT (p_players->i->>'id')::INT
        FROM generate_series(0, player_count - 1) AS i
        WHERE (p_players->i->>'id')::INT IS NOT NULL
    );

    -- Thêm hoặc cập nhật cầu thủ
    FOR i IN 0 .. player_count - 1 LOOP
        player_json := p_players->i;
        player_id := (player_json->>'id')::INT;
        player_name := player_json->>'name';
        player_position := player_json->>'position';
        player_birth_date := (player_json->>'birth_date')::DATE;
        player_is_foreign := (player_json->>'is_foreign')::BOOLEAN;
		player_note := (player_json->>'note')::TEXT;
		
        IF player_id IS NOT NULL AND EXISTS (SELECT 1 FROM Player WHERE id = player_id AND team_id = p_team_id) THEN
            -- Cập nhật cầu thủ hiện có
            UPDATE Player
            SET name = player_name,
                position = player_position,
                birth_date = player_birth_date,
                is_foreign = player_is_foreign, 
				note = player_note
            WHERE id = player_id AND team_id = p_team_id;
        ELSE
            -- Thêm cầu thủ mới
            INSERT INTO Player (team_id, name, position, birth_date, is_foreign, note)
            VALUES (p_team_id, player_name, player_position, player_birth_date, player_is_foreign, player_note);
        END IF;
    END LOOP;

    -- Commit thay đổi
    -- COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback nếu có lỗi
        RAISE;
END;
$$;
-- ===========================================================================================--

------------------------------------------ USE CASE 3 ------------------------------------------
------------------------------------- xóa hồ sơ đăng kí đội bóng -------------------------------
-- Đầu vào id đội bóng: người dùng sẽ chọn đội bóng để xóa sau đó DB sẽ nhận id của đội bóng
CREATE OR REPLACE PROCEDURE delete_team(
    p_team_id INT
)
LANGUAGE plpgsql AS $$
DECLARE
    v_team_exists BOOLEAN;
    v_has_matches BOOLEAN;
BEGIN
    -- Kiểm tra xem đội bóng có tồn tại không
    SELECT EXISTS (
        SELECT 1 FROM Team WHERE id = p_team_id
    ) INTO v_team_exists;

    IF NOT v_team_exists THEN
        RAISE EXCEPTION 'Đội bóng với ID % không tồn tại.', p_team_id;
    END IF;

    -- Kiểm tra xem đội bóng có lịch thi đấu không
    SELECT EXISTS (
        SELECT 1 FROM Match
        WHERE home_team_id = p_team_id OR away_team_id = p_team_id
    ) INTO v_has_matches;

    IF v_has_matches THEN
        RAISE EXCEPTION 'Không thể xóa đội bóng vì đã được xếp lịch thi đấu.';
    END IF;

    -- Xóa tất cả cầu thủ của đội bóng
    DELETE FROM Player WHERE team_id = p_team_id;

    -- Xóa đội bóng
    DELETE FROM Team WHERE id = p_team_id;

    -- Commit thay đổi
    --COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        -- Rollback nếu có lỗi
        --ROLLBACK;
        RAISE;
END;
$$;
-- ===========================================================================================--


------------------------------------------ USE CASE 4 + 5 ------------------------------------------
------------------------------------- Lập lịch thi đấu -------------------------------
-- đang cần thảo luận lại 

-- ===========================================================================================--

------------------------------------------ USE CASE 6 ------------------------------------------
------------------------------------- Thay đổi lịch thi đấu -------------------------------
--> thay dổi bằng các hàm alter và delete 




-- ===========================================================================================--


------------------------------------------ USE CASE 7 ------------------------------------------
------------------------------------- xem  lịch sử đấu thi đấu -------------------------------

CREATE OR REPLACE FUNCTION get_recent_match(k INT, report_date DATE)
RETURNS TABLE (
    id INT,
    home_team_name VARCHAR,
    away_team_name VARCHAR,
    home_team_goals INT,
    away_team_goals INT,
    match_date DATE,
    match_time TIME,
	time_played INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        ht.name AS home_team_name,
        at.name AS away_team_name,
        m.home_goals,
        m.away_goals,
        m.day_start AS match_date,
        m.time_start AS match_time,
		m.time_played
    FROM 
        Match m
    JOIN 
        Team ht ON m.home_team_id = ht.id
    JOIN 
        Team at ON m.away_team_id = at.id
    WHERE 
        m.day_start <= report_date
        AND m.home_goals IS NOT NULL
        AND m.away_goals IS NOT NULL
    ORDER BY 
        m.day_start DESC, m.time_start DESC
    LIMIT k;
END;
$$ LANGUAGE plpgsql;

-- ===========================================================================================--


------------------------------------------ USE CASE 8 ------------------------------------------
------------------------------------- ghi nhận kết quả đấu thi đấu -------------------------------
 
CREATE OR REPLACE PROCEDURE enter_match_result(
    p_match_id INT,
    p_home_goals INT,
    p_away_goals INT,
    p_time_played INT,
    p_goals JSON -- Danh sách bàn thắng dạng JSON
)
LANGUAGE plpgsql AS $$
DECLARE
    match_record Match%ROWTYPE;
    goal_count INT;
    home_goal_count INT := 0;
    away_goal_count INT := 0;
    goal_json JSON;
    goal_team_id INT;
    goal_time INT;
BEGIN
    -- Kiểm tra xem match_id có tồn tại không
    SELECT * INTO match_record
    FROM Match
    WHERE id = p_match_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trận đấu với ID % không tồn tại.', p_match_id;
    END IF;

    -- Kiểm tra home_team_id và away_team_id có tồn tại trong Team không
    IF NOT EXISTS (SELECT 1 FROM Team WHERE id = match_record.home_team_id) THEN
        RAISE EXCEPTION 'Đội nhà % không tồn tại.', match_record.home_team_id;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM Team WHERE id = match_record.away_team_id) THEN
        RAISE EXCEPTION 'Đội khách % không tồn tại.', match_record.away_team_id;
    END IF;

    -- Kiểm tra p_time_played hợp lệ
    IF p_time_played <= 0 THEN
        RAISE EXCEPTION 'Thời gian thi đấu phải lớn hơn 0.';
    END IF;

    -- Đếm số bàn thắng từ JSON
    goal_count := json_array_length(p_goals);

    -- Kiểm tra số bàn thắng từ JSON với home_goals và away_goals
    FOR i IN 0 .. goal_count - 1 LOOP
        goal_json := p_goals->i;
        goal_team_id := (goal_json->>'team_id')::INT;
        goal_time := (goal_json->>'time')::INT;

        -- Kiểm tra team_id hợp lệ
        IF goal_team_id NOT IN (match_record.home_team_id, match_record.away_team_id) THEN
            RAISE EXCEPTION 'Team_id % không thuộc trận đấu.', goal_team_id;
        END IF;

        -- Kiểm tra thời gian bàn thắng
        IF goal_time < 1 OR goal_time > p_time_played THEN
            RAISE EXCEPTION 'Thời gian bàn thắng % không hợp lệ (phải từ 1 đến %).', goal_time, p_time_played;
        END IF;

        -- Đếm số bàn thắng của từng đội
        IF goal_team_id = match_record.home_team_id THEN
            home_goal_count := home_goal_count + 1;
        ELSIF goal_team_id = match_record.away_team_id THEN
            away_goal_count := away_goal_count + 1;
        END IF;
    END LOOP;

    -- So sánh số bàn thắng từ JSON với input
    IF home_goal_count != p_home_goals OR away_goal_count != p_away_goals THEN
        RAISE EXCEPTION 'Số bàn thắng từ chi tiết (home: %, away: %) không khớp với kết quả (home: %, away: %).',
                        home_goal_count, away_goal_count, p_home_goals, p_away_goals;
    END IF;

    -- Thêm kết quả trận đấu
    UPDATE Match
	SET home_goals = p_home_goals,
	    away_goals = p_away_goals,
		time_played = p_time_played
	WHERE id = p_match_id;

    -- Thêm chi tiết bàn thắng
    FOR i IN 0 .. goal_count - 1 LOOP
        goal_json := p_goals->i;
        INSERT INTO Goal (match_id, player_id, team_id, time, type)
        VALUES (
            p_match_id,
            (goal_json->>'player_id')::INT,
            (goal_json->>'team_id')::INT,
            (goal_json->>'time')::INT,
            goal_json->>'type'
        );
    END LOOP;
END;
$$;


------------------------------------------ USE CASE 9 ------------------------------------------
------------------------------------- xem lịch thi đấu -------------------------------
-- sử dụng hàm get_unplayed_match() đã được định nghĩa trước ở phần hàm hỗ trợ 


------------------------------------------ USE CASE 10 ------------------------------------------
------------------------------------- thay đổi kết quả đấu thi đấu -------------------------------

CREATE OR REPLACE PROCEDURE update_match_result(
    p_match_id INT,
    p_home_goals INT,
    p_away_goals INT,
    p_time_played INT,
    p_goals JSON
)
LANGUAGE plpgsql AS $$
DECLARE
    match_record Match%ROWTYPE;
    goal_count INT;
    home_goal_count INT := 0;
    away_goal_count INT := 0;
    goal_json JSON;
    goal_id INT;
    goal_player_id INT;
    goal_team_id INT;
    goal_time INT;
    goal_type VARCHAR(50);
BEGIN
    -- Kiểm tra xem match_id có tồn tại không
    SELECT * INTO match_record
    FROM Match
    WHERE id = p_match_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trận đấu với ID % không tồn tại.', p_match_id;
    END IF;

    -- Kiểm tra home_team_id và away_team_id có tồn tại trong Team không
    IF NOT EXISTS (SELECT 1 FROM Team WHERE id = match_record.home_team_id) THEN
        RAISE EXCEPTION 'Đội nhà % không tồn tại.', match_record.home_team_id;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM Team WHERE id = match_record.away_team_id) THEN
        RAISE EXCEPTION 'Đội khách % không tồn tại.', match_record.away_team_id;
    END IF;

    -- Kiểm tra p_time_played hợp lệ
    IF p_time_played <= 0 THEN
        RAISE EXCEPTION 'Thời gian thi đấu phải lớn hơn 0.';
    END IF;

    -- Đếm số bàn thắng từ JSON
    goal_count := json_array_length(p_goals);

    -- Kiểm tra số bàn thắng từ JSON với home_goals và away_goals
    FOR i IN 0 .. goal_count - 1 LOOP
        goal_json := p_goals->i;
        goal_id := (goal_json->>'id')::INT; -- Có thể NULL nếu là bàn thắng mới
        goal_player_id := (goal_json->>'player_id')::INT;
        goal_team_id := (goal_json->>'team_id')::INT;
        goal_time := (goal_json->>'time')::INT;
        goal_type := goal_json->>'type';

        -- Kiểm tra player_id hợp lệ
        IF NOT EXISTS (SELECT 1 FROM Player WHERE id = goal_player_id AND team_id = goal_team_id) THEN
            RAISE EXCEPTION 'Cầu thủ % không thuộc đội %.', goal_player_id, goal_team_id;
        END IF;

        -- Kiểm tra team_id hợp lệ
        IF goal_team_id NOT IN (match_record.home_team_id, match_record.away_team_id) THEN
            RAISE EXCEPTION 'Team_id % không thuộc trận đấu.', goal_team_id;
        END IF;

        -- Kiểm tra thời gian bàn thắng
        IF goal_time < 1 OR goal_time > p_time_played THEN
            RAISE EXCEPTION 'Thời gian bàn thắng % không hợp lệ (phải từ 1 đến %).', goal_time, p_time_played;
        END IF;

        -- Đếm số bàn thắng của từng đội
        IF goal_team_id = match_record.home_team_id THEN
            home_goal_count := home_goal_count + 1;
        ELSIF goal_team_id = match_record.away_team_id THEN
            away_goal_count := away_goal_count + 1;
        END IF;
    END LOOP;

    -- So sánh số bàn thắng từ JSON với input
    IF home_goal_count != p_home_goals OR away_goal_count != p_away_goals THEN
        RAISE EXCEPTION 'Số bàn thắng từ chi tiết (home: %, away: %) không khớp với kết quả (home: %, away: %).',
                        home_goal_count, away_goal_count, p_home_goals, p_away_goals;
    END IF;

    -- Cập nhật kết quả trận đấu
    UPDATE Match
    SET home_goals = p_home_goals,
        away_goals = p_away_goals,
        time_played = p_time_played
    WHERE id = p_match_id;

    -- Xóa các bàn thắng không còn trong danh sách JSON
    DELETE FROM Goal
    WHERE match_id = p_match_id
    AND id NOT IN (
        SELECT (p_goals->i->>'id')::INT
        FROM generate_series(0, goal_count - 1) AS i
        WHERE (p_goals->i->>'id')::INT IS NOT NULL
    );

    -- Thêm hoặc cập nhật bàn thắng
    FOR i IN 0 .. goal_count - 1 LOOP
        goal_json := p_goals->i;
        goal_id := (goal_json->>'id')::INT;
        goal_player_id := (goal_json->>'player_id')::INT;
        goal_team_id := (goal_json->>'team_id')::INT;
        goal_time := (goal_json->>'time')::INT;
        goal_type := goal_json->>'type';

        IF goal_id IS NOT NULL AND EXISTS (SELECT 1 FROM Goal WHERE id = goal_id AND match_id = p_match_id) THEN
            -- Cập nhật bàn thắng hiện có
            UPDATE Goal
            SET player_id = goal_player_id,
                team_id = goal_team_id,
                time = goal_time,
                type = goal_type
            WHERE id = goal_id AND match_id = p_match_id;
        ELSE
            -- Thêm bàn thắng mới
            INSERT INTO Goal (match_id, player_id, team_id, time, type)
            VALUES (p_match_id, goal_player_id, goal_team_id, goal_time, goal_type);
        END IF;
    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;


-- ===========================================================================================--

------------------------------------------ USE CASE 11 ------------------------------------------
------------------------------------- Tra cứu cầu thủ   -------------------------------
 
CREATE OR REPLACE FUNCTION search_player(search_text VARCHAR)
RETURNS TABLE (
    id INT,
    player_name VARCHAR,
    team_name VARCHAR,
    player_position VARCHAR,
    birth_date DATE,
    is_foreign BOOLEAN,
    note TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name AS player_name,
        t.name AS team_name,
        p.position AS player_position,
        p.birth_date,
        p.is_foreign,
        p.note
    FROM 
        Player p
    JOIN 
        Team t ON p.team_id = t.id
    WHERE 
        p.name ILIKE '%' || search_text || '%'
        OR t.name ILIKE '%' || search_text || '%'
        OR p.position ILIKE '%' || search_text || '%';
END;
$$ LANGUAGE plpgsql;

-- ===========================================================================================--

------------------------------------------ USE CASE 11 ------------------------------------------
------------------------------------- Xem bảng xếp hạng các cầu thủ -------------------------------
 -- # Lập bảng xếp hạng k cầu thủ có số bàn thắng lớn nhất 
CREATE OR REPLACE FUNCTION get_top_scorers(k INT, date_report DATE)
RETURNS TABLE (
    player_name VARCHAR,
    team_name VARCHAR,
	"position" VARCHAR,
    total_goals BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name AS player_name,
        t.name AS team_name,
		p.position,
        COUNT(g.id) AS total_goals
    FROM 
        player p
    LEFT JOIN goal g ON p.id = g.player_id  -- LEFT JOIN để giữ cả cầu thủ chưa ghi bàn
    JOIN team t ON p.team_id = t.id
	JOIN Match m on g.match_id = m.id  
	WHERE m.day_start <= date_report
    GROUP BY 
        p.id, p.name, t.name  -- group by theo cầu thủ và đội
    ORDER BY 
        total_goals DESC, p.name ASC  -- sort
    LIMIT k;  -- get limit 
END;
$$ LANGUAGE plpgsql;



-- ===========================================================================================--

------------------------------------------ USE CASE 13 ------------------------------------------
------------------------------------- Xem bảng xếp hạng đội bóng  -------------------------------
-- Bảng xếp hạng Team 
CREATE OR REPLACE FUNCTION get_team_rankings(p_report_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    rank BIGINT,
    team_name VARCHAR,
    matches_played BIGINT,
    wins BIGINT,
    draws BIGINT,
    losses BIGINT,
    points BIGINT
) AS $$
DECLARE
    rule_record Rule%ROWTYPE;
BEGIN
    SELECT * INTO rule_record FROM Rule LIMIT 1;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Không tìm thấy quy tắc tính điểm trong bảng Rule.';
    END IF;

    RETURN QUERY
    WITH team_stats AS (
	    SELECT 
	        t.id AS team_id,
	        t.name AS t_name,
	        COUNT(*) AS ts_matches_played,
	        SUM(CASE WHEN m.home_goals > m.away_goals THEN 1 ELSE 0 END) AS ts_wins,
	        SUM(CASE WHEN m.home_goals = m.away_goals THEN 1 ELSE 0 END) AS ts_draws,
	        SUM(CASE WHEN m.home_goals < m.away_goals THEN 1 ELSE 0 END) AS ts_losses
	    FROM Team t
	    LEFT JOIN Match m ON t.id = m.home_team_id
	    WHERE m.home_goals IS NOT NULL 
	        AND m.away_goals IS NOT NULL 
	        AND m.day_start <= p_report_date
	    GROUP BY t.id, t.name
	    UNION ALL
	    SELECT 
	        t.id AS team_id,
	        t.name AS t_name,
	        COUNT(*) AS ts_matches_played,
	        SUM(CASE WHEN m.away_goals > m.home_goals THEN 1 ELSE 0 END) AS ts_wins,
	        SUM(CASE WHEN m.home_goals = m.away_goals THEN 1 ELSE 0 END) AS ts_draws,
	        SUM(CASE WHEN m.home_goals > m.away_goals THEN 1 ELSE 0 END) AS ts_losses
	    FROM Team t
	    LEFT JOIN Match m ON t.id = m.away_team_id
	    WHERE m.home_goals IS NOT NULL 
	        AND m.away_goals IS NOT NULL 
	        AND m.day_start <= p_report_date
	    GROUP BY t.id, t.name
	),
    aggregated_stats AS (
        SELECT 
            team_id,
            t_name AS agg_team_name,
            SUM(ts_matches_played) AS agg_matches_played,
            SUM(ts_wins) AS agg_wins,
            SUM(ts_draws) AS agg_draws,
            SUM(ts_losses) AS agg_losses,
            SUM(ts_wins * rule_record.win_score + ts_draws * rule_record.draw_score + ts_losses * rule_record.lose_score) AS agg_points
        FROM team_stats
        GROUP BY team_id, t_name
    )
    SELECT 
        ROW_NUMBER() OVER (ORDER BY agg_points DESC) AS rank,
        agg_team_name AS team_name,
        CAST(agg_matches_played AS BIGINT) AS matches_played,
        CAST(agg_wins AS BIGINT) AS wins,
        CAST(agg_draws AS BIGINT) AS draws,
        CAST(agg_losses AS BIGINT) AS losses,
        CAST(agg_points AS BIGINT) AS points
    FROM aggregated_stats
    ORDER BY agg_points DESC;
END;
$$ LANGUAGE plpgsql;



-- ===========================================================================================--

------------------------------------------ USE CASE 14 ------------------------------------------
------------------------------------- Thay đổi quy định của giải đấu  -------------------------------
 
-- Hàm hỗ trợ thay đổi các quy định (nhập dữ liệu)
CREATE OR REPLACE FUNCTION upsert_rule(
    p_min_age INT DEFAULT NULL,
    p_max_age INT DEFAULT NULL,
    p_win_score INT DEFAULT NULL,
    p_lose_score INT DEFAULT NULL,
    p_draw_score INT DEFAULT NULL,
    p_goal_type_count INT DEFAULT NULL,
    p_max_goal_time INT DEFAULT NULL,
    p_min_players INT DEFAULT NULL,
    p_max_players INT DEFAULT NULL,
    p_max_foreign_player INT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Kiểm tra xem bảng Rule đã có bản ghi nào chưa
    IF (SELECT COUNT(*) FROM Rule) = 0 THEN
        -- Nếu chưa có, thêm mới và để bảng tự áp dụng giá trị mặc định nếu tham số là NULL
        INSERT INTO Rule (
            min_age, max_age, win_score, lose_score, draw_score,
            goal_type_count, max_goal_time, min_players, max_players, max_foreign_player
        ) VALUES (
            p_min_age, 
            p_max_age, 
            p_win_score, 
            p_lose_score, 
            p_draw_score,
            p_goal_type_count, 
            p_max_goal_time, 
            p_min_players, 
            p_max_players, 
            p_max_foreign_player
        );
    ELSE
        -- Nếu đã có, cập nhật chỉ các trường được cung cấp giá trị (khác NULL)
        UPDATE Rule
        SET
            min_age = COALESCE(p_min_age, min_age),
            max_age = COALESCE(p_max_age, max_age),
            win_score = COALESCE(p_win_score, win_score),
            lose_score = COALESCE(p_lose_score, lose_score),
            draw_score = COALESCE(p_draw_score, draw_score),
            goal_type_count = COALESCE(p_goal_type_count, goal_type_count),
            max_goal_time = COALESCE(p_max_goal_time, max_goal_time),
            min_players = COALESCE(p_min_players, min_players),
            max_players = COALESCE(p_max_players, max_players),
            max_foreign_player = COALESCE(p_max_foreign_player, max_foreign_player);
    END IF;
END;
$$ LANGUAGE plpgsql;


-- ===========================================================================================--

------------------------------------------ USE CASE 15 ------------------------------------------
------------------------------------- Đăng nhập và đăng ký tài khoản  -------------------------------
CREATE OR REPLACE FUNCTION register_user(
    p_username VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR
)
RETURNS VOID AS $$
BEGIN
    -- Kiểm tra mật khẩu không rỗng
    IF p_password IS NULL OR TRIM(p_password) = '' THEN
        RAISE EXCEPTION 'Password cannot be empty';
    END IF;

    -- Chèn người dùng mới
    INSERT INTO Users (
        username,
        email,
        password_hash
    )
    VALUES (
        p_username,
        NULLIF(TRIM(p_email), ''),
        crypt(p_password, gen_salt('bf'))
    );

    -- Thông báo đăng ký thành công
    RAISE NOTICE 'Registration successful for username: %', p_username;
EXCEPTION
    WHEN unique_violation THEN
        IF EXISTS (SELECT 1 FROM Users u WHERE u.username = p_username) THEN
            RAISE EXCEPTION 'Username % already exists', p_username;
        ELSIF EXISTS (SELECT 1 FROM Users u WHERE u.email = NULLIF(TRIM(p_email), '')) THEN
            RAISE EXCEPTION 'Email % already exists', p_email;
        END IF;
        RAISE EXCEPTION 'Unexpected unique constraint violation';
    WHEN others THEN
        RAISE EXCEPTION 'Error creating user: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION login_user(
    p_username VARCHAR,
    p_password VARCHAR
)
RETURNS TABLE (
    user_id INT,
    username VARCHAR,
    email VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id AS user_id,
        u.username,
        u.email
    FROM 
        Users u
    WHERE 
        u.username = p_username
        AND u.password_hash = crypt(p_password, u.password_hash);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid username or password';
    END IF;
END;
$$ LANGUAGE plpgsql;





-- ===========================================================================================--
------------------------------------------ Các Function và Procedure hỗ trợ  ------------------------------------------
-- (có thể sư dụng function sau để lấy thông tin trận dấu chưa được ghi nhận)
-- . Lấy ra k trận đấu chưa được thi đấu (hoặc chưa được ghi nhận)
CREATE OR REPLACE FUNCTION get_unplayed_matches(k INT)
RETURNS TABLE (
	match_id INT, 
    home_team_name VARCHAR,
    away_team_name VARCHAR,
    time_start TIME,
    day_start DATE,
    stadium_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
		m.id AS match_id, 
        ht.name AS home_team_name,
        at.name AS away_team_name,
        m.time_start,
        m.day_start,
        m.stadium_name
    FROM 
        Match m
    JOIN Team ht ON m.home_team_id = ht.id
    JOIN Team at ON m.away_team_id = at.id
    WHERE 
        home_goals IS NULL OR away_goals IS NULL 
    ORDER BY 
        m.day_start ASC, m.time_start ASC  
    LIMIT k;  
END;
$$ LANGUAGE plpgsql;

-- 4. tra cứu thông tin đội bóng
CREATE OR REPLACE FUNCTION search_team_by_name(search_name VARCHAR)
RETURNS TABLE(
	name VARCHAR, 
	stadium_name VARCHAR
) AS $$
BEGIN
	RETURN QUERY 
	SELECT 
		t.name,
		T.stadium_name
	FROM 
		Team t 
	WHERE 
		t.name ILIKE '%' || search_name || '%';
END
$$ LANGUAGE plpgsql;

-- 6: Lấy ra các cầu thủ ghi bàn với ID trận đấu. 
CREATE OR REPLACE FUNCTION get_goal_by_id_match(search_id INT)
RETURNS TABLE (
    team_id INT,
    player_id INT,
    player_name VARCHAR,
    goal_time INT,
    goal_type VARCHAR
) AS $$
BEGIN 
    RETURN QUERY
    SELECT 
        g.team_id,
        g.player_id,
        p.name AS player_name,
        g.time AS goal_time,
        g.type AS goal_type
    FROM 
        Goal g
    JOIN 
        Player p ON p.id = g.player_id AND p.team_id = g.team_id
    WHERE 
        g.match_id = search_id;
END;
$$ LANGUAGE plpgsql; 







