# Kaelthas WoW Private Server - PRD

## Problem Statement
Klone das Repo `https://github.com/ashikuya/bb` und bringe es in der Emergent-Preview-Umgebung zum Laufen.

## App
- Kaelthas WoW Private Server Website (AzerothCore Companion)
- FastAPI Backend (Python, MySQL via aiomysql, SRP6 Passwörter)
- React Frontend (CRA + Craco, Tailwind, Radix UI)
- Forum, Account-Registrierung, Charakter-Liste, Realm-Status

## Architecture
- Backend: `/app/backend/server.py` — pure MySQL (kein MongoDB-Fallback in dieser Version)
- DBs:
  - `kaelthas_web` (Forum, Sessions, Rollen, Profile)
  - `acore_auth` (AzerothCore Accounts — minimal schema lokal angelegt)
  - `acore_characters` (Charaktere — leer, optional)
- MariaDB 10.11 lokal installiert, läuft via Supervisor (`/etc/supervisor/conf.d/mariadb.conf`)
- DB-User: `webapp` / `webapp_pass` auf `127.0.0.1:3306`

## Implemented
- 10.06.2026: Repo geklont nach `/app`
- MariaDB Server installiert + via Supervisor verwaltet
- Datenbanken `kaelthas_web`, `acore_auth`, `acore_characters` erstellt
- Schemas aus `schema.sql`, `schema_admin.sql`, `schema_profile.sql` geladen
- Minimales AzerothCore `account` + `account_access` + `characters` Schema angelegt
- Backend `.env` mit MySQL-Credentials konfiguriert
- Python-Deps installiert: `aiomysql`, `ecdsa`, `pillow`
- Frontend `yarn install` ausgeführt
- Beide Services laufen via Supervisor
- API getestet: `/api/status`, `/api/register`, `/api/me`, `/api/forum/categories`, Thread-Erstellung — alles OK
- Frontend lädt unter https://ashikuya-bb.preview.emergentagent.com mit Kaelthas-Theme

## Services
| Service  | Port | Manager    |
|----------|------|------------|
| backend  | 8001 | supervisor |
| frontend | 3000 | supervisor |
| mariadb  | 3306 | supervisor |

## Backlog / Next Steps
- (Optional) Echte AzerothCore-Server-Verbindung statt lokales Schema
- (Optional) Erste Admin-Rolle vergeben für Forum-Moderation
- (Optional) Demo-Accounts/Threads für die Forum-Demo seeden
