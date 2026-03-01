const express = require("express");
const app = express();
require("dotenv").config();

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI COMMAND CENTER - V4 SCROLLABLE</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-deep: #020617;
            --panel-hex: rgba(15, 23, 42, 0.95);
            --neon-blue: #00d2ff;
            --neon-green: #39ff14;
            --neon-red: #ef4444;
            --neon-gold: #fbbf24;
            --border-glow: 1px solid rgba(30, 58, 138, 0.8);
        }

        /* REMOVED ZOOM MODE - ENABLED SCROLLING */
        body {
            margin: 0;
            background: var(--bg-deep);
            color: #e2e8f0;
            font-family: 'Inter', sans-serif;
            display: grid;
            grid-template-columns: 240px 1fr 300px;
            min-height: 100vh;
            overflow-y: auto; /* Changed from hidden to auto */
        }

        /* FIXED SIDEBAR & HEADER PREVENT OVERLAP */
        .sidebar {
            grid-column: 1;
            position: sticky;
            top: 0;
            height: 100vh;
            background: rgba(0,0,0,0.9);
            border-right: var(--border-glow);
            padding: 20px 15px;
            display: flex;
            flex-direction: column;
            z-index: 100;
        }

        header {
            grid-column: 2 / 4;
            position: sticky;
            top: 0;
            z-index: 90;
            background: #020617;
            border-bottom: var(--border-glow);
            padding: 15px 25px;
            display: flex;
            justify-content: space-between;
        }

        /* SCROLLABLE MAIN VIEWPORT */
        .viewport {
            grid-column: 2;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* RIGHT PANEL SCROLL SYNC */
        .security-panel {
            grid-column: 3;
            position: sticky;
            top: 60px;
            height: calc(100vh - 60px);
            background: rgba(10, 15, 30, 0.9);
            border-left: var(--border-glow);
            padding: 20px;
            overflow-y: auto;
        }

        /* GRID FIXES FOR ELEMENTS */
        .live-meters { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        
        .meter-box { 
            background: var(--panel-hex); 
            padding: 15px; 
            border-radius: 8px; 
            border: var(--border-glow);
            text-align: center;
        }

        .vault-hero {
            background: radial-gradient(circle at top right, #1e3a8a 0%, #020617 70%);
            padding: 30px;
            border-radius: 12px;
            border: var(--border-glow);
        }

        .ai-decision {
            background: #0f172a;
            border: 1px solid var(--neon-blue);
            border-radius: 12px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 20px;
            position: relative;
            z-index: 10; /* Ensures it sits below dropdowns but above background */
        }

        /* SYSTEM LOGS TABLE - FULL WIDTH */
        .logs-container {
            background: var(--panel-hex);
            border: var(--border-glow);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }

        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { text-align: left; color: #64748b; padding: 12px; border-bottom: 1px solid #1e293b; }
        td { padding: 12px; border-bottom: 1px solid #0f172a; }

        .footer-full {
            grid-column: 1 / 4;
            background: #010409;
            padding: 15px;
            text-align: center;
            border-top: var(--border-glow);
            font-size: 11px;
            margin-top: auto;
        }

        .map-box {
            height: 200px;
            background: url('https://i.ibb.co/F4pYhX7/map.png') center/cover;
            border-radius: 8px;
            border: var(--border-glow);
            margin: 15px 0;
        }

        .btn-core { 
            padding: 10px 15px; border: 1px solid var(--neon-blue); 
            background: transparent; color: white; cursor: pointer; 
            font-family: 'Orbitron'; font-size: 10px; border-radius: 4px;
        }

        /* GAUGE STYLING */
        .gauge { width: 50px; height: 50px; border-radius: 50%; border: 4px solid #1e293b; border-top-color: var(--neon-green); position: relative; }
    </style>
</head>
<body>
    <aside class="sidebar">
        <div style="font-family:Orbitron; color:var(--neon-blue); margin-bottom:30px;">AI COMMAND CENTER V4</div>
        <div class="nav-item">Dashboard</div>
        <div class="nav-item">Clients</div>
        <div class="nav-item">Accounts</div>
        <div class="nav-item">Transfers</div>
        <div class="nav-item">Vault</div>
        <div class="nav-item">Digital Assets</div>
        <div class="nav-item">Security</div>
        
        <div style="margin-top:auto; background:rgba(255,255,255,0.05); padding:15px; border-radius:10px;">
            <strong>System Health</strong>
            <div style="display:flex; justify-content:space-around; margin:10px 0;">
                <div class="gauge" title="CPU"></div>
                <div class="gauge" style="border-top-color:var(--neon-gold)" title="Memory"></div>
            </div>
            <div style="font-size:10px; color:var(--neon-green)">NETWORK: FAST</div>
        </div>
    </aside>

    <header>
        <div style="font-family:Orbitron;">GLOBAL DIGITAL BANK</div>
        <div id="clock">25 Feb 2026 | 14:32:18</div>
        <div style="color:var(--neon-green)">SYSTEM: ACTIVE</div>
    </header>

    <main class="viewport">
        <div class="live-meters">
            <div class="meter-box"><small>Users Online</small><div style="font-size:20px; color:var(--neon-blue)">1,284</div></div>
            <div class="meter-box"><small>Transactions/Sec</small><div style="font-size:20px; color:var(--neon-blue)">38 TPS</div></div>
            <div class="meter-box"><small>Active Transfers</small><div style="font-size:20px; color:var(--neon-blue)">142</div></div>
            <div class="meter-box"><small>Fraud Alerts</small><div style="font-size:20px; color:var(--neon-red)">3</div></div>
        </div>

        <section class="vault-hero">
            <small>TOTAL BANK MONEY (Main Center)</small>
            <div style="font-size:36px; font-family:Orbitron; margin:10px 0;">KES 2,438,920,440</div>
            <div style="display:flex; justify-content:space-between; font-size:12px;">
                <span style="color:var(--neon-green)">Avail: 1.90B</span>
                <span style="color:var(--neon-gold)">Res: 200M</span>
                <span style="color:var(--neon-red)">Frozen: 80M</span>
                <span style="color:var(--neon-blue)">Moving: 258M</span>
            </div>
        </section>

        <div class="logs-container">
            <strong>LIVE TRANSACTION STREAM</strong>
            <table>
                <tr><th>Time</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th></tr>
                <tr><td>14:35</td><td>Alex T</td><td>Deposit</td><td>KES 20,000</td><td style="color:var(--neon-green)">SUCCESS</td></tr>
                <tr><td>14:34</td><td>David O</td><td>Withdraw</td><td>KES 15,000</td><td style="color:var(--neon-red)">FAILED</td></tr>
            </table>
        </div>

        <div class="ai-decision">
            <img src="https://i.ibb.co/Xz90Cyz/ai-bot.png" style="width:60px; height:60px;">
            <div style="flex:1">
                <strong>AI SUGGESTIONS</strong>
                <div style="font-size:11px; margin-top:5px;">
                    <span style="color:var(--neon-gold)">● Server load at 65%</span> | 
                    <span style="color:var(--neon-blue)">● Transaction volume +20%</span>
                </div>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn-core" style="background:var(--neon-green); color:black;" onclick="playSfx(1)">Apply Fix</button>
                <button class="btn-core" onclick="playSfx(2)">Ignore</button>
            </div>
        </div>

        <div class="logs-container">
            <strong>SYSTEM LOGS & UPDATES</strong>
            <table>
                <tr><th>Time</th><th>Event</th><th>Status</th></tr>
                <tr><td>14:32</td><td>New Client Registered</td><td style="color:var(--neon-green)">SUCCESS</td></tr>
                <tr><td>14:30</td><td>Suspicious IP Blocked</td><td style="color:var(--neon-red)">BLOCKED</td></tr>
            </table>
        </div>
    </main>

    <aside class="security-panel">
        <strong style="color:var(--neon-red)">SECURITY ALERTS</strong>
        <div style="background:rgba(239,68,68,0.1); border:1px solid var(--neon-red); padding:10px; border-radius:5px; margin-top:10px; font-size:12px;">
            <b>Suspicious Login</b><br><small>John Doe - Nairobi</small>
        </div>
        
        <div class="map-box"></div>

        <strong style="color:var(--neon-gold)">QUICK ACTIONS</strong>
        <div style="display:grid; gap:10px; margin-top:10px;">
            <button class="btn-core" onclick="playSfx(13)">+ New Client</button>
            <button class="btn-core" onclick="playSfx(14)">+ New Transfer</button>
            <button class="btn-core" onclick="playSfx(15)">Vault Control</button>
        </div>

        <div style="margin-top:30px; font-size:11px; padding:15px; background:rgba(0,0,0,0.3); border-radius:10px;">
            <div style="color:var(--neon-green)">● Admin Online</div>
            <div>24/7 System Active</div>
        </div>
    </aside>

    <footer class="footer-full">
        © 2026 Global Digital Bank | Secure | Encrypted | AI Powered | All Rights Reserved
    </footer>

    <script>
        const playSfx = (id) => {
            new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + id + ".mp3").play().catch(()=>{});
        };
    </script>
</body>
</html>
`);
});

app.listen(3000, () => console.log("System V4 Scrollable Live"));
