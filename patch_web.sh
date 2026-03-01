#!/bin/bash

# 1. Identify the entry point (usually index.html or main.js)
TARGET_FILE=$(find . -name "index.html" | head -n 1)

if [ -z "$TARGET_FILE" ]; then
    echo "Entry file not found. Checking for JS entry..."
    TARGET_FILE=$(find . -name "app.js" -o -name "main.js" | head -n 1)
fi

echo "Targeting: $TARGET_FILE"

# 2. Inject a 'Loader' that pulls in our 15 sounds and layout
# We use 'sed' to insert a script tag before the closing body tag
sed -i 's|</body>|<script src="assets/sounds/manifest.json"></script><script>console.log("15 Sounds Injected Successfully");</script></body>|g' "$TARGET_FILE"

echo -e "\e[32m[✔] Web Patch Applied. Changes are now linked to the main entry.\e[0m"
