-- Kaelthas Webseiten-Tabellen (Forum, Sessions)
-- Account-Daten kommen aus acore_auth.account (AzerothCore)

CREATE TABLE IF NOT EXISTS sessions (
  id          VARCHAR(64) PRIMARY KEY,
  account_id  INT UNSIGNED NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS forum_categories (
  slug        VARCHAR(32) PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  icon        VARCHAR(8)   NOT NULL DEFAULT '*',
  sort_order  INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS forum_threads (
  id              VARCHAR(36) PRIMARY KEY,
  category_slug   VARCHAR(32) NOT NULL,
  title           VARCHAR(160) NOT NULL,
  author_id       INT UNSIGNED NOT NULL,
  author_name     VARCHAR(32) NOT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  views           INT NOT NULL DEFAULT 0,
  pinned          TINYINT NOT NULL DEFAULT 0,
  locked          TINYINT NOT NULL DEFAULT 0,
  reply_count     INT NOT NULL DEFAULT 0,
  last_reply_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_reply_by   VARCHAR(32) NOT NULL DEFAULT '',
  INDEX (category_slug, updated_at),
  INDEX (category_slug, pinned, updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS forum_posts (
  id            VARCHAR(36) PRIMARY KEY,
  thread_id     VARCHAR(36) NOT NULL,
  category_slug VARCHAR(32) NOT NULL,
  author_id     INT UNSIGNED NOT NULL,
  author_name   VARCHAR(32) NOT NULL,
  author_role   VARCHAR(16) NOT NULL DEFAULT 'player',
  content       MEDIUMTEXT NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  edited        TINYINT NOT NULL DEFAULT 0,
  INDEX (thread_id, created_at),
  INDEX (category_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Standard-Kategorien
INSERT IGNORE INTO forum_categories (slug, name, description, icon, sort_order) VALUES
  ('announcements', 'Announcements',     'Official news and patch notes.',           'A', 1),
  ('general',       'General Discussion','Talk about anything Kaelthas-related.',     'G', 2),
  ('guides',        'Guides & Strategy', 'Class guides, raid strategies, professions.','U', 3),
  ('guilds',        'Guild Recruitment', 'Find a guild or recruit members.',          'X', 4),
  ('support',       'Help & Support',    'Connection issues, bug reports, questions.','?', 5);
