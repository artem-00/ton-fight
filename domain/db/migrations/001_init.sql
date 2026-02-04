CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  username TEXT,
  balance DECIMAL(20,9) DEFAULT 0
);

CREATE TABLE gifts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rarity TEXT NOT NULL, -- 'common', 'rare', 'epic', 'legendary'
  value_ton DECIMAL(10,6) NOT NULL
);

CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  gift_id INTEGER NOT NULL REFERENCES gifts(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Пример подарков
INSERT INTO gifts (name, image_url, rarity, value_ton) VALUES
  ('Золотая монета', 'https://example.com/coin.png', 'common', 0.1),
  ('Сундук сокровищ', 'https://example.com/chest.png', 'rare', 0.5),
  ('Легендарный артефакт', 'https://example.com/artifact.png', 'legendary', 2.0);