#!/bin/bash

# Define the new Sidebar and Navigation Layout
SIDEBAR_WIDTH=20
SOUND_COUNT=15  # Expanded to 15 sounds as requested

echo -e "\e[34m[!] Injecting New Module Layout Structure...\e[0m"

# 1. Create the Sound Assets Directory
mkdir -p ./assets/sounds/

# 2. Generate Sound Metadata (JSON) using 'jq'
# This maps our 12+ sounds for the UI to pick up
echo "[]" > ./assets/sounds/manifest.json
for i in $(seq 1 $SOUND_COUNT); do
    jq ". += [{\"id\": $i, \"name\": \"Sound_$i\", \"path\": \"assets/sounds/sfx_$i.mp3\"}]" ./assets/sounds/manifest.json > tmp.json && mv tmp.json ./assets/sounds/manifest.json
done

# 3. Create a Navigation Mockup (Sidebar)
cat << 'LAYOUT' > ./nav_sidebar.txt
+------------------+---------------------------+
|    NAVIGATION    |      DASHBOARD VIEW       |
+------------------+                           |
| [1] Dashboard    |  Status: Online           |
| [2] Sound Board  |  Sounds Loaded: $SOUND_COUNT       |
| [3] Settings     |                           |
| [4] Logs         |                           |
+------------------+---------------------------+
LAYOUT

echo -e "\e[32m[✔] Layout Injection Complete.\e[0m"
