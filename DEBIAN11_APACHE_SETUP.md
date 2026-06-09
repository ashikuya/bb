# Kaelthas — Apache 2.4 Setup-Anleitung (Debian 11)

Komplette Installation der Kaelthas-Homepage (React-Frontend + FastAPI-Backend
+ MongoDB) unter Apache 2.4 mit dem Zielverzeichnis
**`/home/users/kaelthas/www/neu`**.

> Hinweis: Falls du Apache und AzerothCore beide nutzt, kannst du diese Anleitung
> mit der `DEBIAN11_SETUP.md` (Sektion 16, AzerothCore Docker) kombinieren —
> die `.env` und Backend-Endpoints sind identisch.

---

## 0. Voraussetzungen

- Debian 11 (bullseye), `sudo`-Rechte
- Eine Domain (z.B. `kaelthas.example.com`) zeigt auf den Server (optional aber empfohlen)
- Mindestens 1 GB RAM, 5 GB freier Speicher

---

## 1. System & Tools

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ca-certificates gnupg lsb-release ufw
```

---

## 2. User & Verzeichnisse anlegen

```bash
# Gruppe & User für den Webcontent
sudo groupadd -f kaelthas
id kaelthas &>/dev/null || sudo useradd -m -d /home/users/kaelthas -s /bin/bash -g kaelthas kaelthas
sudo mkdir -p /home/users/kaelthas/www/neu
sudo chown -R kaelthas:kaelthas /home/users/kaelthas

# Apache muss die Files lesen können
sudo usermod -aG kaelthas www-data
sudo chmod 750 /home/users/kaelthas
sudo chmod 755 /home/users/kaelthas/www /home/users/kaelthas/www/neu
```

---

## 3. Node.js 20 + Yarn

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs
sudo npm install -g yarn
node -v && yarn -v
```

---

## 4. Python 3 + venv-Tools

```bash
sudo apt install -y python3 python3-pip python3-venv python3-dev libffi-dev libssl-dev
```

---

## 5. MongoDB 7

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/debian bullseye/mongodb-org/7.0 main" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
sudo systemctl status mongod --no-pager
```

---

## 6. Apache 2.4 installieren & Module aktivieren

```bash
sudo apt install -y apache2

# Wichtige Module für Reverse-Proxy + React-SPA
sudo a2enmod proxy proxy_http proxy_wstunnel headers rewrite ssl http2
sudo a2enmod expires deflate

sudo systemctl restart apache2
apache2 -v
```

---

## 7. Source-Code nach `/home/users/kaelthas/www/neu` bringen

Variante A — direkt klonen:

```bash
sudo -u kaelthas git clone https://github.com/ashikuya/aaa.git /home/users/kaelthas/www/neu
```

Variante B — den von Emergent gebauten Code (`/app` aus deinem Workspace)
hochladen, z.B. per `scp`:

```bash
# Lokal (auf dem Emergent-Workspace):
tar czf kaelthas-build.tgz -C /app backend frontend DEBIAN11_SETUP.md

# Auf den Server:
scp kaelthas-build.tgz kaelthas@SERVER_IP:/home/users/kaelthas/
ssh kaelthas@SERVER_IP "cd /home/users/kaelthas/www/neu && tar xzf ../kaelthas-build.tgz"
```

Erwartete Struktur:

```
/home/users/kaelthas/www/neu/
├── backend/      # FastAPI
└── frontend/    # React
```

---

## 8. Backend einrichten

```bash
cd /home/users/kaelthas/www/neu/backend
sudo -u kaelthas python3 -m venv .venv
sudo -u kaelthas .venv/bin/pip install --upgrade pip
sudo -u kaelthas .venv/bin/pip install -r requirements.txt
```

`.env` als User `kaelthas` anlegen:

```bash
sudo -u kaelthas tee /home/users/kaelthas/www/neu/backend/.env > /dev/null <<'EOF'
MONGO_URL=mongodb://127.0.0.1:27017
DB_NAME=kaelthas
FRONTEND_ORIGIN=https://kaelthas.example.com

# Optional: AzerothCore Live-Anbindung
# AC_AUTH_HOST=127.0.0.1
# AC_AUTH_PORT=3306
# AC_AUTH_DB=acore_auth
# AC_CHARS_DB=acore_characters
# AC_DB_USER=webapp
# AC_DB_PASS=GeheimesPasswort
EOF
sudo chmod 640 /home/users/kaelthas/www/neu/backend/.env
```

Schnelltest:

```bash
cd /home/users/kaelthas/www/neu/backend
sudo -u kaelthas .venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 &
sleep 2
curl -s http://127.0.0.1:8001/api/status | head
kill %1
```

---

## 9. Frontend bauen

```bash
cd /home/users/kaelthas/www/neu/frontend

# Production-URL eintragen
sudo -u kaelthas tee .env > /dev/null <<'EOF'
REACT_APP_BACKEND_URL=https://kaelthas.example.com
WDS_SOCKET_PORT=0
EOF

sudo -u kaelthas yarn install
sudo -u kaelthas yarn build
```

Der Build landet in `/home/users/kaelthas/www/neu/frontend/build/` und wird
von Apache direkt ausgeliefert.

---

## 10. Backend als systemd-Service

```bash
sudo tee /etc/systemd/system/kaelthas-backend.service > /dev/null <<'EOF'
[Unit]
Description=Kaelthas FastAPI backend
After=network.target mongod.service

[Service]
User=kaelthas
Group=kaelthas
WorkingDirectory=/home/users/kaelthas/www/neu/backend
EnvironmentFile=/home/users/kaelthas/www/neu/backend/.env
ExecStart=/home/users/kaelthas/www/neu/backend/.venv/bin/uvicorn server:app \
  --host 127.0.0.1 --port 8001 --workers 2
Restart=always
RestartSec=3

# Hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=read-only
ReadWritePaths=/home/users/kaelthas/www/neu/backend

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now kaelthas-backend
sudo systemctl status kaelthas-backend --no-pager
```

Logs:
```bash
sudo journalctl -u kaelthas-backend -f
```

---

## 11. Apache VirtualHost

```bash
sudo tee /etc/apache2/sites-available/kaelthas.conf > /dev/null <<'EOF'
<VirtualHost *:80>
    ServerName kaelthas.example.com
    ServerAdmin webmaster@example.com

    DocumentRoot /home/users/kaelthas/www/neu/frontend/build

    <Directory /home/users/kaelthas/www/neu/frontend/build>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted

        # React SPA fallback — alles was keine echte Datei ist, geht auf index.html
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} !^/api/
        RewriteRule . /index.html [L]
    </Directory>

    # Cache-Header für statische Assets
    <FilesMatch "\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico|webp)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    <FilesMatch "\.(html)$">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
    </FilesMatch>

    # API → FastAPI (mit Cookie-Weiterleitung)
    ProxyPreserveHost On
    ProxyRequests Off
    ProxyPass        /api/  http://127.0.0.1:8001/api/
    ProxyPassReverse /api/  http://127.0.0.1:8001/api/
    RequestHeader set X-Forwarded-Proto "https" env=HTTPS
    RequestHeader set X-Forwarded-For "%{REMOTE_ADDR}s"

    # Gzip / Deflate
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css \
            application/javascript application/json image/svg+xml
    </IfModule>

    ErrorLog  ${APACHE_LOG_DIR}/kaelthas-error.log
    CustomLog ${APACHE_LOG_DIR}/kaelthas-access.log combined
</VirtualHost>
EOF

# Default-Site deaktivieren, Kaelthas aktivieren
sudo a2dissite 000-default.conf
sudo a2ensite kaelthas.conf
sudo apachectl configtest    # muss "Syntax OK" sagen
sudo systemctl reload apache2
```

---

## 12. HTTPS via Let's Encrypt (empfohlen)

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d kaelthas.example.com \
  --agree-tos -m du@example.com --redirect --non-interactive
```

Certbot:
- erzeugt eine neue `kaelthas-le-ssl.conf` mit Port 443 + SSL
- richtet Port-80 → 443 Redirect ein
- registriert auto-renewal (`systemctl status certbot.timer`)

Manuell testen:
```bash
sudo certbot renew --dry-run
```

---

## 13. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Apache Full'   # 80 + 443
sudo ufw enable
sudo ufw status
```

---

## 14. Berechtigungen final setzen

```bash
sudo chown -R kaelthas:kaelthas /home/users/kaelthas
sudo find /home/users/kaelthas/www/neu/frontend/build -type d -exec chmod 755 {} \;
sudo find /home/users/kaelthas/www/neu/frontend/build -type f -exec chmod 644 {} \;
```

Damit Apache (User `www-data`) trotz Home-Verzeichnis lesen kann, ist der
Pfad `/home/users/kaelthas` auf `chmod 750` mit Gruppe `kaelthas` (in der
www-data Mitglied ist — siehe Schritt 2).

---

## 15. Quick-Check

```bash
# Backend lebt
curl -s http://127.0.0.1:8001/api/status | python3 -m json.tool

# Apache liefert API durch
curl -s https://kaelthas.example.com/api/status | python3 -m json.tool

# Frontend kommt
curl -I https://kaelthas.example.com/
# erwartet: HTTP/2 200 + Content-Type: text/html
```

Im Browser `https://kaelthas.example.com/` → die Kaelthas-Homepage.

---

## 16. Update-Workflow

```bash
cd /home/users/kaelthas/www/neu
sudo -u kaelthas git pull

# Backend
cd backend
sudo -u kaelthas .venv/bin/pip install -r requirements.txt

# Frontend
cd ../frontend
sudo -u kaelthas yarn install
sudo -u kaelthas yarn build

# Services neu starten
sudo systemctl restart kaelthas-backend
sudo systemctl reload apache2
```

---

## 17. Häufige Apache-Fehler

| Problem | Lösung |
|---|---|
| `403 Forbidden` auf `/` | Berechtigungen prüfen: `namei -l /home/users/kaelthas/www/neu/frontend/build/index.html` — alle Verzeichnisse müssen für `www-data` lesbar sein (Schritt 2 wiederholen) |
| `502 Proxy Error` bei `/api/...` | Backend läuft nicht → `sudo systemctl status kaelthas-backend` & `journalctl -u kaelthas-backend -n 50` |
| React-Routen geben 404 (z.B. `/forum`) | `mod_rewrite` nicht aktiviert oder Block falsch → `sudo a2enmod rewrite && systemctl reload apache2` |
| Cookies (Login) gehen verloren | HTTPS erforderlich → Schritt 12 durchführen; Backend setzt `samesite=lax` Cookies, das funktioniert nur über TLS in modernen Browsern stabil |
| `Could not reliably determine server's FQDN` | In `/etc/apache2/apache2.conf` `ServerName kaelthas.example.com` ergänzen |
| Apache-Logs ansehen | `sudo tail -f /var/log/apache2/kaelthas-error.log /var/log/apache2/kaelthas-access.log` |
| Backend liest `.env` nicht | Pfad in der systemd-Unit prüfen, dann `sudo systemctl daemon-reload && systemctl restart kaelthas-backend` |
| `selinux` / `apparmor` blockiert Zugriff | Debian 11 hat AppArmor aus für Apache → kein Problem; bei Custom-Setups: `sudo aa-status` |

---

## 18. Optional: AzerothCore-Live-Anbindung aktivieren

Wenn du den AzerothCore-Stack laufen hast (siehe `DEBIAN11_SETUP.md` Sektion 16):

```bash
sudo nano /home/users/kaelthas/www/neu/backend/.env
# AC_* Variablen einkommentieren und anpassen

sudo systemctl restart kaelthas-backend
curl -s https://kaelthas.example.com/api/status
```

Jetzt liefert die Webseite Live-Daten (Online-Spieler, Account-Count, Charaktere)
direkt aus der AzerothCore-MySQL-Datenbank.

---

## 19. Zusammenfassung der laufenden Dienste

| Dienst | Port | User | Verwaltung |
|---|---|---|---|
| Apache 2.4 | 80, 443 | www-data | systemd |
| Kaelthas FastAPI | 127.0.0.1:8001 | kaelthas | systemd |
| MongoDB | 127.0.0.1:27017 | mongodb | systemd |

**Verzeichnis-Layout:**
```
/home/users/kaelthas/
└── www/
    └── neu/
        ├── backend/
        │   ├── .env
        │   ├── .venv/
        │   ├── server.py
        │   ├── srp6.py
        │   ├── acore_db.py
        │   └── requirements.txt
        └── frontend/
            ├── .env
            ├── build/         ← wird von Apache ausgeliefert
            ├── src/
            └── package.json
```

Fertig. Die Kaelthas-Homepage läuft jetzt auf Apache 2.4 unter
`https://kaelthas.example.com` mit Source unter `/home/users/kaelthas/www/neu/`.
