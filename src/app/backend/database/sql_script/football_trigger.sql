-- các ràng buộc  trigger cho insert, update, delete 

-- ## Trigger bảng RULE ## 
-- 1. Đảm bảo chỉ có một bản ghi duy nhất trong vòng đời của Database. 
-- (không thể thêm vào nếu đã tồn tại 1 bản ghi )
-- 1.1 Tạo function cho trigger 
CREATE OR REPLACE FUNCTION ensure_single_rule_row()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM Rule) > 0 THEN
        RAISE EXCEPTION 'Bảng Rule chỉ được phép có một bản ghi duy nhất. Sử dụng UPDATE để thay đổi.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1.2 Gắn trigger vào bảng Rule
CREATE TRIGGER trg_single_rule_row
BEFORE INSERT ON Rule
FOR EACH ROW
EXECUTE FUNCTION ensure_single_rule_row();

--2. quy định chỉ được thay đổi trước khi mùa giải diễn ra 
-- (tức là quy định phải được xác định trước khi các đội đăng kí, lập lịch các trận đấu)
-- Tạo trigger function
CREATE OR REPLACE FUNCTION restrict_rule_changes_after_season_start()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM Team) THEN
        RAISE EXCEPTION 'Không thể thêm hoặc sửa đổi Rule sau khi mùa giải đã bắt đầu.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gắn trigger vào bảng Rule
CREATE TRIGGER trg_restrict_rule_changes
BEFORE INSERT OR UPDATE ON Rule
FOR EACH ROW
EXECUTE FUNCTION restrict_rule_changes_after_season_start();

-- ## Trigger bảng PLAYER ## 

-- #1. KIỂM TRA KHÔNG TỒN TẠI MỘT CẦU THỦ NÀO ĐÃ TỒN TẠI 
-- Hàm trigger kiểm tra trùng lặp thông tin cầu thủ
CREATE OR REPLACE FUNCTION check_duplicate_player()
RETURNS TRIGGER AS $$
BEGIN
    -- Kiểm tra trùng lặp cho INSERT hoặc UPDATE
    IF EXISTS (
        SELECT 1
        FROM Player
        WHERE name = NEW.name
          AND position = NEW.position
          AND birth_date = NEW.birth_date
          AND is_foreign = NEW.is_foreign
          AND id != NEW.id  -- Loại trừ chính bản ghi đang được thêm/sửa
    ) THEN
        RAISE EXCEPTION 'Cầu thủ với thông tin (name: %, position: %, birth_date: %, is_foreign: %) đã tồn tại.', 
            NEW.name, NEW.position, NEW.birth_date, NEW.is_foreign;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger cho INSERT và UPDATE trên bảng Player
CREATE TRIGGER trigger_check_duplicate_player
BEFORE INSERT OR UPDATE
ON Player
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_player();


-- ## Trigger bảng MATCH ## 
-- #1: Một đội sẽ không thi đấu quá 2 lần với một đội 
CREATE OR REPLACE FUNCTION check_match_frequency()
RETURNS TRIGGER AS $$
DECLARE
    match_count INT;
BEGIN
    -- Đếm số lần hai đội đã gặp nhau (bao gồm cả chiều ngược lại)
    SELECT COUNT(*) INTO match_count
    FROM Match
    WHERE (home_team_id = NEW.home_team_id AND away_team_id = NEW.away_team_id)
       OR (home_team_id = NEW.away_team_id AND away_team_id = NEW.home_team_id);

    IF match_count >= 2 THEN
        RAISE EXCEPTION 'Đội % và % đã thi đấu quá 2 lần.', NEW.home_team_id, NEW.away_team_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_match_frequency
BEFORE INSERT ON Match
FOR EACH ROW
EXECUTE FUNCTION check_match_frequency();

-- #2: Mỗi đội chỉ đấu một trận trong 1 vòng đấu 
CREATE OR REPLACE FUNCTION check_round_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Kiểm tra home_team_id
    IF EXISTS (
        SELECT 1 FROM Match
        WHERE round = NEW.round
          AND (home_team_id = NEW.home_team_id OR away_team_id = NEW.home_team_id)
    ) THEN
        RAISE EXCEPTION 'Đội % đã có trận đấu trong vòng %.', NEW.home_team_id, NEW.round;
    END IF;

    -- Kiểm tra away_team_id
    IF EXISTS (
        SELECT 1 FROM Match
        WHERE round = NEW.round
          AND (home_team_id = NEW.away_team_id OR away_team_id = NEW.away_team_id)
    ) THEN
        RAISE EXCEPTION 'Đội % đã có trận đấu trong vòng %.', NEW.away_team_id, NEW.round;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_round_limit
BEFORE INSERT ON Match
FOR EACH ROW
EXECUTE FUNCTION check_round_limit();

-- #3: Sân thi đấu phải là sân của đội nhà (home_team)
CREATE OR REPLACE FUNCTION check_stadium_match()
RETURNS TRIGGER AS $$
DECLARE
    team_stadium VARCHAR(255);
BEGIN
    -- Lấy sân nhà của home_team_id
    SELECT stadium_name INTO team_stadium
    FROM Team
    WHERE id = NEW.home_team_id;

    IF team_stadium IS NULL THEN
        RAISE EXCEPTION 'Đội % không tồn tại.', NEW.home_team_id;
    END IF;

    IF NEW.stadium_name != team_stadium THEN
        RAISE EXCEPTION 'Sân % không phải sân nhà của đội %.', NEW.stadium_name, NEW.home_team_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_stadium_match
BEFORE INSERT ON Match
FOR EACH ROW
EXECUTE FUNCTION check_stadium_match();

-- #4: Các đội không thi đấu trùng giờ với nhau.  
CREATE OR REPLACE FUNCTION check_schedule_conflict()
RETURNS TRIGGER AS $$
BEGIN
    -- Kiểm tra xem home_team_id hoặc away_team_id có trùng lịch không
    IF EXISTS (
        SELECT 1 FROM Match
        WHERE day_start = NEW.day_start
          AND time_start = NEW.time_start
          AND (home_team_id IN (NEW.home_team_id, NEW.away_team_id)
               OR away_team_id IN (NEW.home_team_id, NEW.away_team_id))
    ) THEN
        RAISE EXCEPTION 'Đội % hoặc % đã có trận đấu vào % lúc %.', 
                        NEW.home_team_id, NEW.away_team_id, NEW.day_start, NEW.time_start;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_schedule_conflict
BEFORE INSERT ON Match
FOR EACH ROW
EXECUTE FUNCTION check_schedule_conflict();

-- TRIGGER bảng match và bảng goal
-- #1: cầu thủ ghi bàn phải thuộc đội bóng ghi bàn 
CREATE OR REPLACE FUNCTION check_goal_validity()
RETURNS TRIGGER AS $$
DECLARE
    player_team_id INT;
BEGIN
    -- Lấy team_id của cầu thủ từ bảng Player
    SELECT team_id INTO player_team_id
    FROM Player
    WHERE id = NEW.player_id;

    IF player_team_id IS NULL THEN
        RAISE EXCEPTION 'Cầu thủ % không tồn tại.', NEW.player_id;
    END IF;

    IF player_team_id != NEW.team_id THEN
        RAISE EXCEPTION 'Cầu thủ % không thuộc đội %.', NEW.player_id, NEW.team_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_goal_validity
BEFORE INSERT ON Goal
FOR EACH ROW
EXECUTE FUNCTION check_goal_validity();

