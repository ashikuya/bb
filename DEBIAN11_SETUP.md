# Kaelthas — Debian 11 Setup-Anleitung

Komplette Schritt-für-Schritt-Anleitung, um die Kaelthas-Homepage (React + FastAPI + MongoDB)
auf einem frischen Debian 11 (bullseye) Server zum Laufen zu bekommen.

---

## 0. Voraussetzungen

- Debian 11 (bullseye) mit `sudo`-Rechten
- Mindestens 1 GB RAM, 5 GB freier Speicher
- Optional: Domain + Cloudflare oder direkter Port 80/443

---

## 1. System aktualisieren & Tools installieren

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ca-certificates gnupg lsb-release ufw nginx
```

---

## 2. Node.js 20 + Yarn installieren

```bash
# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Yarn
sudo npm install -g yarn

# Check
node -v   # v20.x
yarn -v   # 1.22.x
```

---

## 3. Python 3.11 (Backend)

Debian 11 hat per Default 3.9 — das funktioniert, FastAPI läuft damit. Falls du 3.11 willst:

```bash
sudo apt install -y python3 python3-pip python3-venv python3-dev libffi-dev libssl-dev
python3 --version   # 3.9 ist ok
```

---

## 4. MongoDB 7 installieren

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
sudo systemctl status mongod   # active (running)
```

---

## 5. Source-Code holen

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone https://github.com/ashikuya/aaa.git kaelthas
cd kaelthas
```

> Hinweis: Der portierte React-/FastAPI-Code, den Emergent für dich gebaut hat,
> liegt unter `/app/` in deinem Emergent-Workspace. Kopier diesen Ordner per
> `scp -r emergent:/app/* /var/www/kaelthas/` auf den Server, oder lade ihn aus
> der Emergent-Oberfläche (Settings → Download Code) herunter und entpacke ihn nach
> `/var/www/kaelthas/`.

Im Folgenden gehe ich von dieser Ordnerstruktur aus:

```
/var/www/kaelthas/
├── backend/       # FastAPI
└── frontend/      # React
```

---

## 6. Backend einrichten

```bash
cd /var/www/kaelthas/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

`.env` anlegen:

```bash
cat > .env <<'EOF'
MONGO_URL=mongodb://127.0.0.1:27017
DB_NAME=kaelthas
FRONTEND_ORIGIN=http://localhost:3000

# Optional: AzerothCore Live-Stats
# AC_AUTH_HOST=127.0.0.1
# AC_AUTH_PORT=3306
# AC_AUTH_DB=acore_auth
# AC_DB_USER=acore
# AC_DB_PASS=acore
EOF
```

Backend manuell testen:

```bash
source .venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001
# in anderem Terminal:
curl http://127.0.0.1:8001/api/status
```

---

## 7. Frontend einrichten

```bash
cd /var/www/kaelthas/frontend
yarn install
```

`.env` anlegen (zeigt im Produktionsbetrieb auf deine Domain):

```bash
cat > .env <<'EOF'
REACT_APP_BACKEND_URL=https://kaelthas.example.com
WDS_SOCKET_PORT=0
EOF
```

Im Dev-Modus testen:

```bash
yarn start    # http://localhost:3000
```

Production-Build:

```bash
yarn build    # erzeugt build/
```

---

## 8. systemd-Dienst für das Backend

```bash
sudo tee /etc/systemd/system/kaelthas-backend.service > /dev/null <<'EOF'
[Unit]
Description=Kaelthas FastAPI backend
After=network.target mongod.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/kaelthas/backend
EnvironmentFile=/var/www/kaelthas/backend/.env
ExecStart=/var/www/kaelthas/backend/.venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 2
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

sudo chown -R www-data:www-data /var/www/kaelthas
sudo systemctl daemon-reload
sudo systemctl enable --now kaelthas-backend
sudo systemctl status kaelthas-backend
```

Logs ansehen:

```bash
sudo journalctl -u kaelthas-backend -f
```

---

## 9. Nginx als Reverse-Proxy + statische Frontend-Files

```bash
sudo tee /etc/nginx/sites-available/kaelthas > /dev/null <<'EOF'
server {
    listen 80;
    server_name kaelthas.example.com;

    # Frontend (statische React build)
    root /var/www/kaelthas/frontend/build;
    index index.html;

    # API → FastAPI Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
    }

    # React SPA Fallback
    location / {
        try_files $uri /index.html;
    }

    client_max_body_size 10M;
}
EOF

sudo ln -sf /etc/nginx/sites-available/kaelthas /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10. HTTPS via Let's Encrypt (optional, empfohlen)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kaelthas.example.com
```

Certbot patcht die Nginx-Config automatisch und richtet auto-renewal ein.

---

## 11. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 12. AzerothCore Live-Stats verbinden (optional)

Falls du eine AzerothCore-Installation auf demselben Server hast:

1. MySQL-User mit Lese-Rechten auf `acore_auth` und `acore_characters` erstellen
2. In `/var/www/kaelthas/backend/.env` die `AC_*` Variablen aktivieren
3. `sudo systemctl restart kaelthas-backend`

`/api/status` liefert dann echte Werte für `playersOnline` und `registeredAccounts`.

Für volle Charakterdaten in der `/api/characters` Route musst du die Funktion in
`backend/server.py` erweitern, um statt der Demo-Daten direkt aus `acore_characters`
zu lesen (`SELECT guid, name, level, race, class, gender, money, totalPlaytime
FROM characters WHERE account=%s`).

---

## 13. Updates einspielen

```bash
cd /var/www/kaelthas
sudo -u www-data git pull
cd backend && sudo -u www-data .venv/bin/pip install -r requirements.txt
cd ../frontend && sudo -u www-data yarn install && sudo -u www-data yarn build
sudo systemctl restart kaelthas-backend
sudo systemctl reload nginx
```

---

## 14. Häufige Fehler

| Problem | Lösung |
|---|---|
| `502 Bad Gateway` | Backend läuft nicht → `sudo systemctl status kaelthas-backend` & `journalctl -u kaelthas-backend -n 50` |
| `CORS error` im Browser | In `backend/.env` `FRONTEND_ORIGIN` auf die echte Domain setzen, Backend neustarten |
| `mongod` startet nicht | `sudo systemctl status mongod`, ggf. `/var/log/mongodb/mongod.log` checken |
| Cookies werden nicht gesetzt | HTTPS notwendig → Certbot ausführen (Schritt 10) |
| `yarn build` schlägt fehl wegen RAM | Swap erstellen: `sudo fallocate -l 2G /swap && sudo chmod 600 /swap && sudo mkswap /swap && sudo swapon /swap` |
| MongoDB Port 27017 von außen offen | Sicherstellen, dass `bindIp: 127.0.0.1` in `/etc/mongod.conf` steht |

---

## 15. Quick-Check nach der Installation

```bash
# Backend lebt
curl -i http://127.0.0.1:8001/api/status

# Über Nginx
curl -i https://kaelthas.example.com/api/status

# Frontend ausgeliefert
curl -I https://kaelthas.example.com/
```

Fertig — die Kaelthas-Homepage läuft auf `https://kaelthas.example.com`.

---

## 16. AzerothCore (WotLK 3.3.5a) komplett aufsetzen — Docker

Wir nehmen den offiziellen Docker-Compose-Stack vom AzerothCore-Projekt
(https://github.com/azerothcore/azerothcore-wotlk). Damit hast du in unter
einer Stunde einen lauffähigen WoW-Server.

### 16.1 Docker & Docker-Compose installieren

```bash
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian bullseye stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

### 16.2 AzerothCore klonen & bauen

```bash
cd /opt
sudo git clone https://github.com/azerothcore/azerothcore-wotlk.git --branch master --single-branch
sudo chown -R $USER:$USER azerothcore-wotlk
cd azerothcore-wotlk

# Daten-Verzeichnisse anlegen
mkdir -p env/dist/data env/dist/logs env/dist/etc

# Docker-Images bauen (dauert ~30-60 min, ~6-8 GB RAM empfohlen)
docker compose --profile app pull
docker compose --profile app build

# Datenbanken initialisieren
docker compose --profile db up -d ac-database
sleep 15
docker compose run --rm ac-db-import

# Client-Daten (dbc, maps, vmaps, mmaps) downloaden — ~6 GB
docker compose run --rm ac-tools

# Server starten
docker compose --profile app up -d
```

Logs ansehen:
```bash
docker compose logs -f ac-worldserver
docker compose logs -f ac-authserver
```

### 16.3 GM-Account anlegen

```bash
docker compose exec ac-worldserver bash -c "echo 'account create admin admin123' > /tmp/cmd"
docker compose exec ac-worldserver ./worldserver -c "/tmp/cmd"
# oder direkt in die laufende worldserver-Konsole:
docker attach azerothcore-wotlk-ac-worldserver-1
> account create admin admin123
> account set gmlevel admin 3 -1
> .quit
# (Ctrl+P, Ctrl+Q zum Detachen ohne zu stoppen)
```

### 16.4 Realm in der Auth-DB konfigurieren

```bash
docker compose exec ac-database mysql -uroot -ppassword -e \
  "UPDATE acore_auth.realmlist SET address='DEINE_SERVER_IP', port=8085 WHERE id=1;"
```

Wenn deine Spieler über Internet verbinden, muss `address` die öffentliche IP
oder DNS-Name deines Servers sein.

### 16.5 Ports öffnen

```bash
sudo ufw allow 3724/tcp comment 'AzerothCore Auth'
sudo ufw allow 8085/tcp comment 'AzerothCore World'
sudo ufw reload
```

### 16.6 Kaelthas-Webseite mit AzerothCore verbinden

Der Docker-Stack exposed MySQL auf Port 3306 (siehe `docker-compose.yml`). Lege
in der Auth-DB einen Read/Write-User für die Webseite an:

```bash
docker compose exec ac-database mysql -uroot -ppassword <<'SQL'
CREATE USER 'webapp'@'%' IDENTIFIED BY 'EinSicheresPasswort';
GRANT SELECT, INSERT, UPDATE, DELETE ON acore_auth.account TO 'webapp'@'%';
GRANT SELECT ON acore_characters.* TO 'webapp'@'%';
FLUSH PRIVILEGES;
SQL
```

In `/var/www/kaelthas/backend/.env` aktivieren:

```ini
AC_AUTH_HOST=127.0.0.1
AC_AUTH_PORT=3306
AC_AUTH_DB=acore_auth
AC_CHARS_DB=acore_characters
AC_DB_USER=webapp
AC_DB_PASS=EinSicheresPasswort
```

Backend neustarten:
```bash
sudo systemctl restart kaelthas-backend
```

Jetzt:
- `/api/register` → schreibt direkt in `acore_auth.account` mit echtem SRP6-Hash → Spieler kann sich sofort im Game einloggen
- `/api/login` → verifiziert gegen SRP6-Salt/Verifier in `acore_auth.account`
- `/api/account/password` → updated Salt+Verifier in `acore_auth.account`
- `/api/characters` → liest live aus `acore_characters.characters`
- `/api/status` → echte `accounts`, `online`, `characters` Counts

### 16.7 WoW-Client verbinden

1. Spieler braucht den **3.3.5a (build 12340)** WoW-Client (legaler Besitz vorausgesetzt)
2. Datei `WoW/Data/enUS/realmlist.wtf` (oder deUS/deDE) öffnen
3. Inhalt ersetzen mit:
   ```
   set realmlist DEINE_SERVER_IP_ODER_DOMAIN
   ```
4. WoW starten → mit dem auf der Webseite registrierten Account einloggen

### 16.8 AzerothCore-Stack verwalten

```bash
# Status
docker compose ps

# Stoppen
docker compose --profile app down

# Updaten
cd /opt/azerothcore-wotlk
git pull
docker compose --profile app pull
docker compose --profile app build
docker compose run --rm ac-db-import
docker compose --profile app up -d

# Backup
docker compose exec ac-database mysqldump -uroot -ppassword \
  --all-databases > /backup/acore-$(date +%F).sql
```

### 16.9 Troubleshooting AzerothCore

| Problem | Lösung |
|---|---|
| `worldserver` startet nicht | `docker compose logs ac-worldserver` — meist fehlen Client-Daten (`ac-tools` erneut laufen lassen) |
| Spieler kann sich nicht einloggen | Realmlist `address` muss von außen erreichbar sein, Ports 3724 + 8085 offen |
| `wrong account name or password` | Username muss in **GROSSBUCHSTABEN** in `acore_auth.account` stehen (macht die Webseite automatisch) |
| Charakter erstellen schlägt fehl | `realmlist.realmflags` darf nicht 0x1 sein → `UPDATE realmlist SET realmflags=0 WHERE id=1;` |
| MySQL Port 3306 belegt | In `docker-compose.yml` MySQL-Port mappen z.B. `3307:3306`, dann in `backend/.env` `AC_AUTH_PORT=3307` |

---

## 17. Komplettübersicht der laufenden Dienste

Nach Abschluss aller Schritte hast du folgende Dienste laufen:

| Dienst | Port | Verwaltet von |
|---|---|---|
| Nginx (Web) | 80, 443 | systemd |
| Kaelthas FastAPI | 8001 (intern) | systemd |
| MongoDB (Forum, Sessions) | 27017 (intern) | systemd |
| AzerothCore Auth | 3724 | Docker |
| AzerothCore World | 8085 | Docker |
| AzerothCore MySQL | 3306 (intern) | Docker |

Spieler verbinden über Port **3724/8085**, Webseiten-Besucher über **80/443**.
Die Webseite synchronisiert Account-Erstellung & Passwort-Änderungen automatisch
in die AzerothCore-Datenbank.

Viel Erfolg mit Kaelthas! ⚔️
