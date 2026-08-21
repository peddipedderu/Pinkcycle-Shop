# DigitalFundi.co.ke - Quick Deploy Commands
# Paste each block into your sprite console (sprite console / sprite exec)

# ── METHOD A: Via sprite console (interactive SSH) ────────
# Run: sprite console -s peddipedderu
# Then paste this inside the sprite shell:

curl -fsSL https://raw.githubusercontent.com/peddipedderu/Pinkcycle-Shop/main/deploy/setup.sh | bash

# ── METHOD B: Via sprite exec (non-interactive) ──────────
# Run from YOUR PowerShell:

sprite exec -s peddipedderu -- bash -c "curl -fsSL https://raw.githubusercontent.com/peddipedderu/Pinkcycle-Shop/main/deploy/setup.sh | bash"

# ── METHOD C: Upload & run local script ──────────────────
# If setup.sh isn't in the repo yet, upload and run it:

# 1. Copy the script to the sprite:
Get-Content "C:\Users\ROY\digitalfundi-deploy\deploy\setup.sh" | sprite exec -s peddipedderu -- bash -c "cat > /tmp/setup.sh && bash /tmp/setup.sh"

# ── After deployment - useful commands ───────────────────

# Check service status:
sprite exec -s peddipedderu -- sudo supervisorctl status

# View logs:
sprite exec -s peddipedderu -- sudo tail -50 /var/log/digitalfundi/gunicorn.log

# Create Django superuser:
sprite exec -s peddipedderu -- bash -c "cd /home/sprite/digitalfundi/backend && source /home/sprite/digitalfundi/venv/bin/activate && python manage.py createsuperuser"

# Install SSL certificate (after DNS is pointed):
sprite exec -s peddipedderu -- bash -c "sudo apt install -y certbot python3-certbot-nginx && sudo certbot --nginx -d digitalfundi.co.ke -d www.digitalfundi.co.ke --non-interactive --agree-tos -m admin@digitalfundi.co.ke"

# Restart services:
sprite exec -s peddipedderu -- sudo supervisorctl restart digitalfundi-api

# Get sprite's public IP/URL:
sprite info -s peddipedderu -o roy-khaemba
