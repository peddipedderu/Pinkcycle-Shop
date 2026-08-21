#!/bin/bash
# =============================================================
# DigitalFundi.co.ke - Sprite Server Setup Script
# Deploys: Django API (backend) + Expo Web (frontend)
# Server: sprites.dev (peddipedderu)
# =============================================================

set -e
REPO="https://github.com/peddipedderu/Pinkcycle-Shop.git"
APP_DIR="/home/sprite/digitalfundi"
VENV_DIR="$APP_DIR/venv"
STATIC_ROOT="/var/www/digitalfundi/static"
MEDIA_ROOT="/var/www/digitalfundi/media"
WEB_ROOT="/var/www/digitalfundi/web"
LOG_DIR="/var/log/digitalfundi"

echo "======================================================"
echo " DigitalFundi.co.ke - Deployment Starting"
echo "======================================================"

# ── 1. System packages ─────────────────────────────────────
echo "[1/9] Installing system packages..."
sudo apt-get update -q
sudo apt-get install -y -q \
  git curl nginx python3 python3-pip python3-venv \
  redis-server sqlite3 supervisor \
  nodejs npm libffi-dev libssl-dev build-essential \
  libpq-dev libjpeg-dev zlib1g-dev

# Install Node 18 (required for Expo web build)
if ! node --version 2>/dev/null | grep -q "v18\|v20\|v22"; then
  echo "  Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "  Node: $(node --version), npm: $(npm --version)"
echo "  Python: $(python3 --version)"

# ── 2. Create directories ──────────────────────────────────
echo "[2/9] Creating directories..."
sudo mkdir -p "$STATIC_ROOT" "$MEDIA_ROOT" "$WEB_ROOT" "$LOG_DIR"
sudo chown -R sprite:sprite /var/www/digitalfundi "$LOG_DIR"

# ── 3. Clone / update repo ────────────────────────────────
echo "[3/9] Cloning repository..."
if [ -d "$APP_DIR/.git" ]; then
  echo "  Repo exists, pulling latest..."
  cd "$APP_DIR" && git pull origin main
else
  git clone "$REPO" "$APP_DIR"
fi

# ── 4. Python virtual environment + backend deps ─────────
echo "[4/9] Setting up Python venv & backend..."
cd "$APP_DIR/backend"
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
pip install --upgrade pip -q
pip install -r requirements.txt -q
pip install daphne channels_redis whitenoise -q

# ── 5. Django local_settings ──────────────────────────────
echo "[5/9] Configuring Django settings..."
SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")

cat > "$APP_DIR/backend/myshop/local_settings.py" << PYEOF
import os

SECRET_KEY = '${SECRET}'
DEBUG = False

ALLOWED_HOSTS = [
    'digitalfundi.co.ke',
    'www.digitalfundi.co.ke',
    '*.sprites.dev',
    'localhost',
    '127.0.0.1',
]

CSRF_TRUSTED_ORIGINS = [
    'https://digitalfundi.co.ke',
    'https://www.digitalfundi.co.ke',
]

CSRF_COOKIE_SECURE = False   # set True once HTTPS is confirmed
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_SAMESITE = 'Lax'

# Static & media paths inside sprite
STATIC_URL = '/static/'
STATIC_ROOT = '${STATIC_ROOT}'
STATICFILES_DIRS = [
    os.path.join('${APP_DIR}/backend', 'static'),
]
MEDIA_URL = '/media/'
MEDIA_ROOT = '${MEDIA_ROOT}'

# Redis (local)
REDIS_HOST = '127.0.0.1'
REDIS_PORT = 6379
REDIS_DB = 1

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('127.0.0.1', 6379)],
        },
    },
}

# Email (update with real SMTP in production)
DEFAULT_FROM_EMAIL = 'noreply@digitalfundi.co.ke'
SERVER_EMAIL = 'noreply@digitalfundi.co.ke'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
PYEOF

# ── 6. Django migrate, collectstatic ─────────────────────
echo "[6/9] Running Django migrations & collectstatic..."
cd "$APP_DIR/backend"
source "$VENV_DIR/bin/activate"
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# ── 7. Build Expo web frontend ───────────────────────────
echo "[7/9] Building Expo web frontend..."
cd "$APP_DIR/frontend"

# Patch package.json to set the correct API URL for production
if [ ! -f .env ]; then
  cat > .env << 'ENVEOF'
API_URL=https://digitalfundi.co.ke/api
EXPO_PUBLIC_API_URL=https://digitalfundi.co.ke/api
ENVEOF
fi

npm install --legacy-peer-deps
npx expo export:web 2>/dev/null || npm run build:web 2>/dev/null || (
  # Fallback: use webpack directly
  npx expo build:web --no-pwa 2>/dev/null || true
)

# Copy built web output to web root
WEB_DIST=""
for d in web-build dist build; do
  if [ -d "$APP_DIR/frontend/$d" ]; then
    WEB_DIST="$APP_DIR/frontend/$d"
    break
  fi
done

if [ -n "$WEB_DIST" ]; then
  echo "  Copying $WEB_DIST → $WEB_ROOT"
  cp -r "$WEB_DIST/." "$WEB_ROOT/"
else
  echo "  WARNING: No web build found, creating placeholder..."
  cat > "$WEB_ROOT/index.html" << 'HTMLEOF'
<!DOCTYPE html>
<html><head><title>DigitalFundi</title></head>
<body><h1>DigitalFundi.co.ke - Deploying...</h1></body></html>
HTMLEOF
fi

# ── 8. Configure services (supervisor + nginx) ───────────
echo "[8/9] Configuring services..."

# ── Gunicorn (Django API) via supervisor ──────────────────
sudo tee /etc/supervisor/conf.d/digitalfundi-api.conf > /dev/null << 'SUPEOF'
[program:digitalfundi-api]
command=/home/sprite/digitalfundi/venv/bin/gunicorn myshop.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile /var/log/digitalfundi/gunicorn-access.log \
    --error-logfile /var/log/digitalfundi/gunicorn-error.log
directory=/home/sprite/digitalfundi/backend
user=sprite
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/digitalfundi/gunicorn.log
environment=DJANGO_SETTINGS_MODULE="myshop.settings"
SUPEOF

# ── Redis supervisor (ensure it's running) ────────────────
sudo tee /etc/supervisor/conf.d/redis.conf > /dev/null << 'REDISEOF'
[program:redis]
command=/usr/bin/redis-server
autostart=true
autorestart=true
stdout_logfile=/var/log/digitalfundi/redis.log
REDISEOF

# ── Nginx configuration ───────────────────────────────────
sudo tee /etc/nginx/sites-available/digitalfundi << 'NGINXEOF'
server {
    listen 80;
    server_name digitalfundi.co.ke www.digitalfundi.co.ke _;

    client_max_body_size 20M;

    # ── Django static files ─────────────────────────────
    location /static/ {
        alias /var/www/digitalfundi/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # ── Django media files ──────────────────────────────
    location /media/ {
        alias /var/www/digitalfundi/media/;
        expires 7d;
    }

    # ── Django API & admin ──────────────────────────────
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /cart/ {
        proxy_pass http://127.0.0.1:8000/cart/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /orders/ {
        proxy_pass http://127.0.0.1:8000/orders/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /payment/ {
        proxy_pass http://127.0.0.1:8000/payment/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # ── React Native Web (frontend SPA) ─────────────────
    location / {
        root /var/www/digitalfundi/web;
        try_files $uri $uri/ /index.html;
        expires 1h;
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/digitalfundi /etc/nginx/sites-enabled/digitalfundi
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo nginx -s reload || sudo service nginx start

# ── Start supervisor services ─────────────────────────────
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start redis || true
sudo supervisorctl restart digitalfundi-api || sudo supervisorctl start digitalfundi-api

# ── 9. Health check ───────────────────────────────────────
echo "[9/9] Running health checks..."
sleep 3
if curl -sf http://127.0.0.1:8000/ > /dev/null 2>&1 || \
   curl -sf http://127.0.0.1:8000/admin/ > /dev/null 2>&1; then
  echo "  ✓ Django API is responding"
else
  echo "  ✗ Django API check (may still be starting)"
fi

if curl -sf http://127.0.0.1:80/ > /dev/null 2>&1; then
  echo "  ✓ Nginx is responding"
else
  echo "  ✗ Nginx check failed"
fi

echo ""
echo "======================================================"
echo " Deployment Complete!"
echo " Frontend : http://digitalfundi.co.ke"
echo " API      : http://digitalfundi.co.ke/api/"
echo " Admin    : http://digitalfundi.co.ke/admin/"
echo " Logs     : $LOG_DIR"
echo "======================================================"
echo ""
echo "NEXT STEPS:"
echo "  1. Point digitalfundi.co.ke DNS → this sprite's public IP"
echo "  2. Create a Django superuser:"
echo "     cd $APP_DIR/backend && source $VENV_DIR/bin/activate"
echo "     python manage.py createsuperuser"
echo "  3. Set up SSL: sudo apt install certbot python3-certbot-nginx"
echo "     sudo certbot --nginx -d digitalfundi.co.ke -d www.digitalfundi.co.ke"
