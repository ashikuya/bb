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
