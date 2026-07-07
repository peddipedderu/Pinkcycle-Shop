import os
from PIL import Image

assets_dir = "/home/roy/pinkcycle/frontend/assets"
logo_path = os.path.join(assets_dir, "logo.jpeg")

if os.path.exists(logo_path):
    print("Found logo.jpeg, converting to app icons...")
    img = Image.open(logo_path)
    
    # 1. Main Icon (1024x1024 PNG)
    icon_img = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    icon_img.save(os.path.join(assets_dir, "icon.png"), "PNG")
    print("✓ Created icon.png")
    
    # 2. Adaptive Icon (1024x1024 PNG, Android adaptive icon)
    # Typically needs a safe zone padding, but using the logo directly is standard for custom icons
    icon_img.save(os.path.join(assets_dir, "adaptive-icon.png"), "PNG")
    print("✓ Created adaptive-icon.png")
    
    # 3. Favicon (48x48 PNG)
    favicon_img = img.resize((48, 48), Image.Resampling.LANCZOS)
    favicon_img.save(os.path.join(assets_dir, "favicon.png"), "PNG")
    print("✓ Created favicon.png")
else:
    print("Error: logo.jpeg not found in assets directory!")
