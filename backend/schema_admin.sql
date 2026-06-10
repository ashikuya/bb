-- Admin-Erweiterung für Kaelthas (in kaelthas_web ausführen)

-- Ränge / Rollen mit Farben (sichtbar im Forum)
CREATE TABLE IF NOT EXISTS forum_roles (
  slug         VARCHAR(32) PRIMARY KEY,
  name         VARCHAR(60) NOT NULL,
  color        VARCHAR(16) NOT NULL DEFAULT '#cdd9e6',
  badge_bg     VARCHAR(32) NOT NULL DEFAULT 'rgba(78,165,211,0.15)',
  badge_border VARCHAR(32) NOT NULL DEFAULT 'rgba(78,165,211,0.5)',
  icon         VARCHAR(8)  NOT NULL DEFAULT '',
  rank_level   INT         NOT NULL DEFAULT 0,
  sort_order   INT         NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Zuordnung Account → Rang(e) (Account-ID aus acore_auth.account.id)
CREATE TABLE IF NOT EXISTS user_roles (
  account_id  INT UNSIGNED NOT NULL,
  role_slug   VARCHAR(32) NOT NULL,
  granted_by  INT UNSIGNED NOT NULL DEFAULT 0,
  granted_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id, role_slug),
  INDEX (role_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Standard-Ränge (mit gradient/glow-Farben passend zum Frost-Theme)
INSERT IGNORE INTO forum_roles (slug, name, color, badge_bg, badge_border, icon, rank_level, sort_order) VALUES
  ('owner',     'Realm Owner',  '#ff6ad5', 'linear-gradient(135deg, rgba(255,106,213,0.25), rgba(140,82,255,0.25))', 'rgba(255,106,213,0.7)', 'O', 100, 1),
  ('admin',     'Administrator','#ff9b3d', 'linear-gradient(135deg, rgba(255,155,61,0.25), rgba(255,80,80,0.25))',   'rgba(255,155,61,0.7)',  'A',  90, 2),
  ('gm',        'Game Master',  '#3dd9ff', 'linear-gradient(135deg, rgba(61,217,255,0.22), rgba(78,165,211,0.18))',  'rgba(61,217,255,0.7)',  'G',  80, 3),
  ('mod',       'Moderator',    '#7fffd4', 'rgba(127,255,212,0.15)',                                                  'rgba(127,255,212,0.6)', 'M',  60, 4),
  ('developer', 'Developer',    '#c8a2ff', 'rgba(200,162,255,0.15)',                                                  'rgba(200,162,255,0.6)', 'D',  70, 5),
  ('vip',       'VIP Donator',  '#e8c373', 'linear-gradient(135deg, rgba(232,195,115,0.22), rgba(255,215,0,0.15))',   'rgba(232,195,115,0.7)', 'V',  40, 6),
  ('veteran',   'Veteran',      '#9eebff', 'rgba(158,235,255,0.12)',                                                  'rgba(158,235,255,0.5)', 'X',  30, 7),
  ('player',    'Player',       '#cdd9e6', 'rgba(78,165,211,0.10)',                                                   'rgba(78,165,211,0.35)', '*',   0, 99);
