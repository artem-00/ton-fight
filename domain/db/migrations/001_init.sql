CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username TEXT,
  balance DECIMAL(20,9) DEFAULT 0
);
