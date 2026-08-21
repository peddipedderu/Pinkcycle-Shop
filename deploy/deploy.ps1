# ============================================================
# DigitalFundi.co.ke - Deployment Launcher
# Run this in YOUR PowerShell (where 'sprite' is available)
# ============================================================

$SPRITE_NAME = "peddipedderu"
$ORG = "roy-khaemba"
$DEPLOY_SCRIPT = "$PSScriptRoot\setup.sh"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host " DigitalFundi.co.ke Deployment Launcher" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# ── Step 1: Copy deploy script to the sprite ─────────────
Write-Host "`n[1/4] Uploading deploy script to sprite..." -ForegroundColor Yellow

# Read the setup.sh content and pipe it to the sprite
$setupContent = Get-Content -Raw $DEPLOY_SCRIPT

# Write script to sprite via heredoc through exec
sprite exec -s $SPRITE_NAME -- bash -c "mkdir -p /home/sprite/deploy && cat > /home/sprite/deploy/setup.sh" << $setupContent

Write-Host "    ✓ Script uploaded" -ForegroundColor Green

# ── Step 2: Get public IP of sprite ──────────────────────
Write-Host "`n[2/4] Getting sprite public URL..." -ForegroundColor Yellow
sprite info -s $SPRITE_NAME -o $ORG

# ── Step 3: Run deploy script on sprite ──────────────────
Write-Host "`n[3/4] Running deployment (this takes ~5-10 mins)..." -ForegroundColor Yellow
sprite exec -s $SPRITE_NAME -- bash /home/sprite/deploy/setup.sh

# ── Step 4: Done ─────────────────────────────────────────
Write-Host "`n[4/4] Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Get this sprite's public IP:  sprite info -s $SPRITE_NAME"
Write-Host "  2. Set your DNS A record: digitalfundi.co.ke → <sprite-IP>"
Write-Host "  3. Create Django admin user:"
Write-Host "     sprite exec -s $SPRITE_NAME -- bash -c 'cd /home/sprite/digitalfundi/backend && source /home/sprite/digitalfundi/venv/bin/activate && python manage.py createsuperuser'"
Write-Host "  4. Enable HTTPS:"
Write-Host "     sprite exec -s $SPRITE_NAME -- sudo certbot --nginx -d digitalfundi.co.ke -d www.digitalfundi.co.ke"
