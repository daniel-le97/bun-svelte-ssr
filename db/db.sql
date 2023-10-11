-- database: db.sqlite
-- Active: 1696983121886@@127.0.0.1@3306
CREATE TABLE IF NOT EXISTS Todos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed INTEGER DEFAULT 0,
    task TEXT
    );

CREATE TABLE IF NOT EXISTS user(
    id TEXT NOT NULL PRIMARY KEY,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    username TEXT CHECK(length(username) >= 15)
);

CREATE TABLE user_key (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id),
    hashed_password TEXT
);

CREATE TABLE user_session (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id),
    active_expires INTEGER NOT NULL,
    idle_expires INTEGER NOT NULL
);


    DROP TABLE Users;