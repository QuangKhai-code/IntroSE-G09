-- CREATE DATABASE FOOTBALL_MANAGEMENT 

-- -- kết nối vào cơ sở dữ liệu 
-- \c FOOTBALL_MANAGEMENT 

-- Tạo bảng Rules
CREATE TABLE Rule (
    min_age INT DEFAULT 16 CHECK (min_age >= 0),
    max_age INT DEFAULT 40 CHECK (max_age > min_age),
    win_score INT DEFAULT 3 CHECK (win_score > lose_score),
    lose_score INT DEFAULT 0,
    draw_score INT DEFAULT 1 CHECK (draw_score > lose_score),
	goal_type_count INT DEFAULT 3 CHECK (goal_type_count >= 0),
	max_goal_time INT DEFAULT 96,
	min_players INT DEFAULT 18,  
	max_players INT DEFAULT 25, 
    max_foreign_player INT DEFAULT 5 CHECK (max_foreign_player >= 0)
);

-- Tạo bảng Team
CREATE TABLE Team (
    id SERIAL PRIMARY KEY,
    stadium_name VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Tạo bảng Players
CREATE TABLE Player (
    id SERIAL PRIMARY KEY,
    team_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    position VARCHAR(30) NOT NULL,
    birth_date DATE NOT NULL,
	is_foreign BOOLEAN DEFAULT FALSE, 
    note TEXT
);

-- Tạo bảng Match
CREATE TABLE Match (
    id SERIAL PRIMARY KEY,
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    round INT DEFAULT 1,
    stadium_name VARCHAR(50) NOT NULL,
    day_start DATE NOT NULL,
    time_start TIME NOT NULL,
	home_goals INT, 
	away_goals INT,
	time_played INT
);


-- Tạo bảng Goal
CREATE TABLE Goal (
    id SERIAL PRIMARY KEY,  -- sử dụng id vì có thể có một cầu thủ ghi nhiều bàn trong 1 trận đấu
    match_id INT NOT NULL,
    player_id INT NOT NULL,
    team_id INT NOT NULL,
    time INT NOT NULL,
    type VARCHAR(20) NOT NULL
);


CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- cài công cụ hash nếu chưa được cài


-- Tách các khóa ngoại ra ngoài
-- Khóa ngoại giữa Player và Team
ALTER TABLE Player ADD CONSTRAINT fk_player_team FOREIGN KEY (team_id) REFERENCES Team(id) ON DELETE CASCADE;

-- Khóa ngoại giữa Matches và Team (home_team_id và away_team_id)
ALTER TABLE Match ADD CONSTRAINT fk_matches_home_team FOREIGN KEY (home_team_id) REFERENCES Team(id) ON DELETE CASCADE;
ALTER TABLE Match ADD CONSTRAINT fk_matches_away_team FOREIGN KEY (away_team_id) REFERENCES Team(id) ON DELETE CASCADE;

-- Khóa ngoại giữa Goal và các bảng khác (Matches, Player, Team)
ALTER TABLE Goal ADD CONSTRAINT fk_goal_match FOREIGN KEY (match_id) REFERENCES Match(id) ON DELETE CASCADE;
ALTER TABLE Goal ADD CONSTRAINT fk_goal_player FOREIGN KEY (player_id) REFERENCES Player(id) ON DELETE CASCADE;
ALTER TABLE Goal ADD CONSTRAINT fk_goal_team FOREIGN KEY (team_id) REFERENCES Team(id) ON DELETE CASCADE;



-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;


-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
