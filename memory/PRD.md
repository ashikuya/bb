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
  - Logo getauscht: Neues PNG-Logo (Lich-King/Frostmourne-K), mix-blend-mode: screen, glow im Header und Footer
  - Komplette Lokalisierung auf Deutsch (alle Public-Seiten + DB-Kategorien)
  - data-testid Attribute an wichtige interaktive Elemente
- **10.06.2026 (Epischer Hero-Hintergrund)**:
  - Custom Hero-Background per **Gemini Nano Banana** generiert (`/app/frontend/public/hero-bg.jpg`)
  - Zeigt frostige Eis-Zitadelle, Aurora Borealis, Eiskristalle, eisige Berge — passend zum Logo
  - Generator-Script: `/tmp/gen_hero.py` (kann erneut ausgeführt werden für andere Versionen)
  - Hero-CSS: subtle bg-zoom Animation, Vignette, Aurora-Glow-Overlay, kein zentrales Logo mehr
  - `EMERGENT_LLM_KEY` in `/app/backend/.env` hinterlegt

## Services
| Service  | Port | Manager    |
|----------|------|------------|
| backend  | 8001 | supervisor |
| frontend | 3000 | supervisor |
| mariadb  | 3306 | supervisor |

## Offen
- Admin-Panel (`admin-page.jsx`) ist noch auf Englisch (nur für Admins sichtbar — niedrige Priorität)
- Externe AzerothCore-MySQL-Verbindung (User macht selbst, wenn er soweit ist)
