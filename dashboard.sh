#!/bin/bash

# ANSI Color Codes
G='\033[0;32m' # Green
R='\033[0;31m' # Red
Y='\033[1;33m' # Yellow
B='\033[0;34m' # Blue
C='\033[0;36m' # Cyan
NC='\033[0m'   # No Color

draw_header() {
    clear
    echo -e "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "🧠 AI COMMAND CENTER          $(date '+%d %b %y  %H:%M:%S')         ${G}● Status: ACTIVE${NC}"
    echo -e "                              Security: HIGH             ${G}● AI: RUNNING${NC}"
    echo -e "${B}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Connected: [${G}SYSTEM ENGINE${NC}] [${G}SECURITY ENGINE${NC}] [${G}AI ENGINE${NC}]"
}

draw_meters() {
    # Fetch data from local API
    DATA=$(curl -s http://localhost:3000/api/metrics)
    USERS=$(echo $DATA | grep -o '"usersOnline":[0-9]*' | cut -d: -f2)
    TPS=$(echo $DATA | grep -o '"tps":[0-9]*' | cut -d: -f2)
    
    echo -e "\n${C}LIVE BANK METERS:${NC}"
    echo -e "┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐"
    echo -e "│ USERS ONLINE │ │     TPS      │ │ ACTIVE TRANS │ │ FRAUD ALERTS │"
    echo -e "│    ${G}$USERS${NC}      │ │     ${G}$TPS${NC}       │ │     142      │ │   ${R}3 Alerts${NC}   │"
    echo -e "└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘"
}

draw_vault() {
    echo -e "\n${Y}BANK MONEY PANEL (TOTAL VAULT)${NC}"
    echo -e "TOTAL: ${G}KES 2,438,920,440${NC}"
    echo -e "├─ Available: KES 1,900,000,000"
    echo -e "├─ Reserved:  KES 200,000,000"
    echo -e "└─ Frozen:    KES 80,000,000"
}

draw_map() {
    echo -e "\n${B}WORLD ACTIVITY MAP${NC}"
    echo -e " KENYA ${G}→${NC} UK  [${G}ACTIVE${NC}]"
    echo -e " USA   ${G}→${NC} KENYA [${G}ACTIVE${NC}]"
    echo -e " GERMANY ${Y}→${NC} UAE [${Y}PENDING${NC}]"
}

draw_ai_decision() {
    echo -e "\n${C}AI DECISION PANEL${NC}"
    echo -e "> ${Y}\"Fraud risk rising in mobile transfers\"${NC}"
    echo -e "> \"Server load at 65%\""
    echo -e "[ APPLY FIX ]  [ ANALYZE ]"
}

# Main Loop
while true; do
    draw_header
    draw_meters
    draw_vault
    draw_map
    draw_ai_decision
    sleep 2
done
