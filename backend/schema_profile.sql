-- Erweiterung für Avatare + User-Profile (in kaelthas_web ausführen)

CREATE TABLE IF NOT EXISTS user_profiles (
  account_id    INT UNSIGNED PRIMARY KEY,
  avatar_url    VARCHAR(255) DEFAULT NULL,
  signature     TEXT,
  location      VARCHAR(60) DEFAULT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
