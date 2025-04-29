---- new query test
-----------Bảng RULE----------------
-- kiểm tra việc thêm và thay đổi quy định (using upsert_rule function)
SELECT upsert_rule(
    p_min_age := 18,
    p_max_age := 40,
    p_win_score := 3,
    p_lose_score := 0,
    p_draw_score := 1,
    p_goal_type_count := 2,
    p_max_goal_time := 90,
    p_min_players := 2,
    p_max_players := 11,
    p_max_foreign_player := 2
);

-- chỉ thêm 1 số thuộc tính
SELECT upsert_rule(
    p_win_score := 5,
    p_max_foreign_player := 3
);

select * from rule

-------------------BẢNG TEAM và PLAYER -----------------
-- Kiểm tra việc đăng kí đội bóng và thông tin cầu thủ
-- input 1: Team A 
CALL register_team(
    'Stadium XYZ',
    'Team A',
    '[
        {"name": "Player A1", "position": "Forward", "birth_date": "2000-01-01", "is_foreign": false, "note": ""},
        {"name": "Player A2", "position": "Midfielder", "birth_date": "1998-05-15", "is_foreign": false, "note": ""},
        {"name": "Player A3", "position": "Defender", "birth_date": "1995-09-20", "is_foreign": true, "note": ""}
    ]'::json
);

select * from team

select * from player 


-- input 2: Team B
CALL register_team(
    'Stadium ABC',
    'Team B',
    '[
        {"name": "Player B1", "position": "Goalkeeper", "birth_date": "2002-03-10", "is_foreign": false, "note": ""},
        {"name": "Player B2", "position": "Forward", "birth_date": "1999-07-25", "is_foreign": false, "note": ""},
        {"name": "Player B3", "position": "Midfielder", "birth_date": "2001-11-30", "is_foreign": true, "note": ""},
        {"name": "Player B4", "position": "Defender", "birth_date": "1996-02-14", "is_foreign": false, "note": ""}
    ]'::json
);

select * from team 

select * from player
where team_id = 1

-- input 3: Team C 
CALL register_team(
    'Stadium DEF',
    'Team C',
    '[
        {"name": "Player C1", "position": "Forward", "birth_date": "2003-08-08", "is_foreign": false, "note": ""},
        {"name": "Player C2", "position": "Midfielder", "birth_date": "1997-12-12", "is_foreign": true, "note": ""},
        {"name": "Player C3", "position": "Defender", "birth_date": "2000-04-01", "is_foreign": false, "note": ""}
    ]'::json
);

-- input 4: Team D 
CALL register_team(
    'Stadium GHI',
    'Team D',
    '[
        {"name": "Player D1", "position": "Goalkeeper", "birth_date": "1998-06-06", "is_foreign": false, "note": ""},
        {"name": "Player D2", "position": "Forward", "birth_date": "2001-09-09", "is_foreign": true, "note": ""},
        {"name": "Player D3", "position": "Midfielder", "birth_date": "1999-03-03", "is_foreign": false, "note": ""},
        {"name": "Player D4", "position": "Defender", "birth_date": "2002-12-25", "is_foreign": true, "note": ""}
    ]'::json
);

-- input 5: input sai rule - có quá nhiều cầu thủ nước ngoài
CALL register_team(
    'Stadium JKL',
    'Team E',
    '[
        {"name": "Player E1", "position": "Goalkeeper", "birth_date": "2000-01-01", "is_foreign": true, "note": ""},
        {"name": "Player E2", "position": "Forward", "birth_date": "1998-05-15", "is_foreign": true, "note": ""},
        {"name": "Player E3", "position": "Midfielder", "birth_date": "1995-09-20", "is_foreign": true, "note": ""},
        {"name": "Player E4", "position": "Defender", "birth_date": "2002-03-10", "is_foreign": true, "note": ""},
        {"name": "Player E5", "position": "Forward", "birth_date": "2001-07-01", "is_foreign": true, "note": ""},
        {"name": "Player E6", "position": "Midfielder", "birth_date": "1999-11-11", "is_foreign": true, "note": ""}
    ]'::json
);

-- input 6: input sai: số lượng cầu thủ quá ít. 
CALL register_team(
    'Stadium MNO',
    'Team F',
    '[
        {"name": "Player F1", "position": "Forward", "birth_date": "2000-01-01", "is_foreign": false, "note": ""}
    ]'::json
);

--------------------------------------CHỈNH SỬA HỒ SƠ ĐỘI BÓNG--------------------
-- input 4: Team D 
CALL update_team(
	4,
    'Stadium GHI',
    'Team D',
    '[
        {"name": "Player D1", "position": "Goalkeeper", "birth_date": "1998-06-06", "is_foreign": false, "note": ""},
        {"name": "Player D2", "position": "Forward", "birth_date": "2001-09-09", "is_foreign": true, "note": ""},
    	{"name": "Player D4", "position": "Left winger", "birth_date": "2002-12-25", "is_foreign": true, "note": ""}
	]'::json
);
select * from player
where team_id = 4

-------------------------------------- XÓA HỒ SƠ ĐỘI BÓNG--------------------
-- input trước để thực hiện xóa 
CALL register_team(
    'Stadium JKL',
    'Team E',
    '[
        {"name": "Player E1", "position": "Goalkeeper", "birth_date": "2000-01-01", "is_foreign": true, "note": ""},
        {"name": "Player E2", "position": "Forward", "birth_date": "1998-05-15", "is_foreign": true, "note": ""},
        {"name": "Player E3", "position": "Midfielder", "birth_date": "1995-09-20", "is_foreign": false, "note": ""},
        {"name": "Player E4", "position": "Defender", "birth_date": "2002-03-10", "is_foreign": false, "note": ""},
        {"name": "Player E5", "position": "Forward", "birth_date": "2001-07-01", "is_foreign": false, "note": ""},
        {"name": "Player E6", "position": "Midfielder", "birth_date": "1999-11-11", "is_foreign": false, "note": ""}
    ]'::json
);

-- kiểm tra 


select * from team 

select * from player
where team_id = 5




CALL delete_team(1)


----------------------BẢNG MATCH ----------------------
select * from match

INSERT INTO Match (home_team_id, away_team_id, round, stadium_name, day_start, time_start)
VALUES
    (1, 2, 1, 'Stadium XYZ', '2025-04-10', '15:00:00'), -- Team A vs Team B
    (3, 4, 1, 'Stadium DEF', '2025-04-10', '18:00:00'); -- Team C vs Team D

INSERT INTO Match (home_team_id, away_team_id, round, stadium_name, day_start, time_start)
VALUES
    (2, 3, 2, 'Stadium ABC', '2025-04-17', '15:00:00'), -- Team B vs Team C
    (4, 1, 2, 'Stadium GHI', '2025-04-17', '18:00:00'); -- Team D vs Team A

INSERT INTO Match (home_team_id, away_team_id, round, stadium_name, day_start, time_start)
VALUES
    (1, 3, 3, 'Stadium XYZ', '2025-04-24', '15:00:00'), -- Team A vs Team C
    (2, 4, 3, 'Stadium ABC', '2025-04-24', '18:00:00'); -- Team B vs Team D


INSERT INTO Match (home_team_id, away_team_id, round, stadium_name, day_start, time_start)
VALUES (2, 1, 5, 'Stadium ABC', '2025-05-08', '15:00:00');

-- các input lỗi: 
INSERT INTO Match (home_team_id, away_team_id, round, stadium_name, day_start, time_start)
VALUES (1, 2, 6, 'Stadium XYZ', '2025-05-15', '15:00:00');
-- lỗiL đội 1 và đội 2 đã thi đấu quá 2 lần 

INSERT INTO Match (home_team_id, away_team_id, round, stadium_name, day_start, time_start)
VALUES (1, 4, 1, 'Stadium XYZ', '2025-04-10', '20:00:00');
-- Lỗi: "Đội 1 đã có trận đấu trong vòng 1."

INSERT INTO Match (home_team_id, away_team_id, round, stadium_name, day_start, time_start)
VALUES (1, 3, 4, 'Stadium ABC', '2025-05-01', '15:00:00');
-- Lỗi: "Sân Stadium ABC không phải sân nhà của đội 1."


-- Chỉnh sửa lịch thi đấu

UPDATE Match
SET time_start = '20:00:00'
WHERE id = 1


----------------BẢNG MATCH và GOALS ---------------------
--## lấy ra thông tin các trận chưa được thi đấu hoặc chưa được ghi nhận
select * from get_unplayed_matches(10)
select * from get_unplayed_matches(3)

-- Thêm dữ liệu sử dụng procedure enter_match_result 
CALL enter_match_result(
    1, -- match_id
    2, -- home_goals (Team A)
    1, -- away_goals (Team B)
    90, -- time_played
    '[
        {"player_id": 1, "team_id": 1, "time": 15, "type": "Normal"},
        {"player_id": 2, "team_id": 1, "time": 45, "type": "Penalty"},
        {"player_id": 4, "team_id": 2, "time": 70, "type": "Normal"}
    ]'::json
);

CALL enter_match_result(
    2, -- match_id
    1, -- home_goals (Team C)
    1, -- away_goals (Team D)
    90, -- time_played
    '[
        {"player_id": 8, "team_id": 3, "time": 30, "type": "Normal"},
        {"player_id": 16, "team_id": 4, "time": 85, "type": "Normal"}
    ]'::json
);

select * from player

CALL enter_match_result(
    3, -- match_id
    3, -- home_goals (Team B)
    0, -- away_goals (Team C)
    90, -- time_played
    '[
        {"player_id": 5, "team_id": 2, "time": 20, "type": "Normal"},
        {"player_id": 6, "team_id": 2, "time": 45, "type": "Penalty"},
        {"player_id": 7, "team_id": 2, "time": 88, "type": "Normal"}
    ]'::json
);

CALL enter_match_result(
    4, -- match_id
    3, -- home_goals (Team D)
    1, -- away_goals (Team A)
    90, -- time_played
    '[
        {"player_id": 17, "team_id": 4, "time": 35, "type": "Normal"},
        {"player_id": 3, "team_id": 1, "time": 70, "type": "Normal"},
        {"player_id": 16, "team_id": 4, "time": 15, "type": "Normal"},
		{"player_id": 16, "team_id": 4, "time": 90, "type": "Normal"}
    ]'::json
);


SELECT * FROM Goal
where match_id = 4;
-- Thay đổi kết quả trận đấu 
CALL update_match_result(
    4, -- match_id
    3, -- home_goals (Team D)
    1, -- away_goals (Team A)
    90, -- time_played
    '[
        {"player_id": 16, "team_id": 4, "time": 35, "type": "Normal"},
        {"player_id": 3, "team_id": 1, "time": 70, "type": "Normal"},
        {"player_id": 16, "team_id": 4, "time": 15, "type": "Normal"},
		{"player_id": 16, "team_id": 4, "time": 90, "type": "Normal"}
    ]'::json
)

----------- kiểm tra 1 số use case. 
-- USE CASE 4: Tra cứu cầu thủ. 
-- sử dụng hàm 
select * from search_player('Team A')
select * from search_player('Player D1')
select * from search_player('Player D')
select * from search_player('left winger')

select * from search_team_by_name('Team D')


--# bảng xếp hạng cầu thủ theo ngày nhập ()
select * from get_top_scorers(10, '2025-05-01')

--# bảng xếp hạng điểm số cho tới ngày nhập
select * from get_team_rankings('2025-05-11')

-- #lấy thông tin k trận đấu tính đến này ??? 
select * from get_recent_match(10, '2025-05-01')

----- use case đăng nhập và đăng kí. 
-- Đăng ký người dùng
select * from register_user('barca_manager', 'manager@fcbarcelona.com', 'secure_password123');

select * from register_user('league_admin', 'admin@league.com', 'admin_password456');

select * from Users;
-- đăng nhập 
SELECT * FROM login_user('barca_manager', 'secure_password123');
SELECT * FROM login_user('league_admin', 'admin_password456');

SELECT * FROM login_user('barca_manager', 'wrong_password');
SELECT * FROM login_user('barca_manag', 'secure_password123');


