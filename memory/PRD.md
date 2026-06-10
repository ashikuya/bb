# Kaelthas WoW Private Server - PRD

## Problem Statement
Klone das Repo `https://github.com/ashikuya/bb` und bringe es in der Emergent-Preview-Umgebung zum Laufen. Anschließend Komplett-Lokalisierung auf Deutsch + Redesign mit neuem Lich-King/Frostmourne-Logo.

## App
- Kaelthas WoW Private Server Website (AzerothCore Companion)
- FastAPI Backend (Python, MySQL via aiomysql, SRP6 Passwörter)
- React Frontend (CRA + Craco, Tailwind, Radix UI)
- Forum, Account-Registrierung, Charakter-Liste, Realm-Status

## Architecture
- Backend: `/app/backend/server.py` — pure MySQL
- DBs: `kaelthas_web`, `acore_auth`, `acore_characters`
- MariaDB 10.11 lokal installiert, läuft via Supervisor
- DB-User: `webapp` / `webapp_pass` auf `127.0.0.1:3306`

## Implemented
- **10.06.2026**: Repo geklont, MariaDB + alle DBs eingerichtet, Backend+Frontend laufen
- **10.06.2026 (Redesign)**:
  - Logo getauscht: Neues PNG-Logo (Lich-King/Frostmourne-K) via `mix-blend-mode: screen` integriert (`/app/frontend/src/kaelthas/logo.jsx`)
  - Großes Hero-Logo zentral über dem Titel mit Rune-Ringen + Glow-Animation
  - **Komplette Lokalisierung auf Deutsch**:
    - `data.js` (Navigation, Features, Eigene Völker)
    - `hero.jsx` (Titel, Untertitel, CTA, Stats)
    - `features.jsx`, `journey.jsx`, `footer.jsx`, `cookies.jsx`
    - `header.jsx` (Anmelden-Button)
    - `login-page.jsx`, `register-page.jsx`
    - `account-page.jsx` (Profil/Charaktere/Sicherheit-Tabs)
    - `forum-page.jsx`, `forum-category-page.jsx`, `forum-thread-page.jsx`
    - Forum-Kategorien in der DB übersetzt (`UPDATE forum_categories`)
    - Datumsformate auf `de-DE` umgestellt
  - data-testid Attribute an wichtige interaktive Elemente hinzugefügt

## Services
| Service  | Port | Manager    |
|----------|------|------------|
| backend  | 8001 | supervisor |
| frontend | 3000 | supervisor |
| mariadb  | 3306 | supervisor |

## Offen
- Admin-Panel (`admin-page.jsx`) ist noch auf Englisch (nur für Admins sichtbar — niedrige Priorität)
- Externe AzerothCore-MySQL-Verbindung (User macht selbst, wenn er soweit ist)
