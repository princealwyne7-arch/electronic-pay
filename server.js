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
    <title>AI COMMAND CENTER - V4 PRO</title>
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

        body {
            margin: 0;
            background: var(--bg-deep);
            color: #e2e8f0;
            font-family: 'Inter', sans-serif;
            display: grid;
            grid-template-columns: 240px 1fr 300px;
            grid-template-rows: auto 1fr auto;
            height: 100vh;
            overflow: hidden;
        }

        /* --- A: MAIN MENU (240px) --- */
        .sidebar {
            grid-row: 1 / 4;
            background: rgba(0,0,0,0.8);
            border-right: var(--border-glow);
            padding: 20px 15px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .brand-header { font-family: 'Orbitron'; font-size: 14px; color: var(--neon-blue); margin-bottom: 25px; text-align: center; }
        .nav-item { 
            padding: 12px 15px; 
            font-size: 13px; 
            border-radius: 6px; 
            cursor: pointer; 
            transition: 0.3s;
            display: flex; align-items: center; gap: 10px;
        }
        .nav-item:hover { background: rgba(0, 210, 255, 0.1); color: var(--neon-blue); }
        .nav-active { background: rgba(30, 58, 138, 0.4); border-left: 3px solid var(--neon-blue); }

        .system-health { margin-top: auto; padding: 15px; background: rgba(0,0,0,0.4); border-radius: 10px; font-size: 11px; }
        .gauge-container { display: flex; justify-content: space-around; margin: 15px 0; }
        .gauge { width: 45px; height: 45px; border-radius: 50%; border: 3px solid #1e293b; border-top-color: var(--neon-green); position: relative; }
        .gauge::after { content: attr(data-val); position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 9px; }

        /* --- HEADER & CONNECTION BAR --- */
        header {
            grid-column: 2 / 4;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 25px;
            background: #020617;
            border-bottom: var(--border-glow);
        }

        .connection-bar {
            grid-column: 2 / 4;
            background: rgba(15, 23, 42, 0.5);
            padding: 5px 20px;
            display: flex;
            gap: 20px;
            font-size: 10px;
            color: #94a3b8;
            border-bottom: var(--border-glow);
        }

        /* --- MAIN CONTENT AREA --- */
        .viewport {
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* B: LIVE METERS */
        .live-meters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .meter-box { 
            background: var(--panel-hex); 
            padding: 15px; 
            border-radius: 8px; 
            border: var(--border-glow);
            text-align: center;
        }
        .meter-val { font-size: 24px; font-weight: bold; font-family: 'Orbitron'; color: var(--neon-blue); }

        /* C: TOTAL BANK MONEY */
        .vault-hero {
            background: radial-gradient(circle at top right, #1e3a8a 0%, #020617 70%);
            padding: 30px;
            border-radius: 12px;
            border: var(--border-glow);
            text-align: center;
            box-shadow: inset 0 0 50px rgba(0, 210, 255, 0.1);
        }
        .money-display { font-size: 42px; font-family: 'Orbitron'; margin: 15px 0; text-shadow: 0 0 20px var(--neon-blue); }
        .vault-stats { display: flex; justify-content: space-around; font-size: 12px; }

        /* G: AI DECISION PANEL */
        .ai-decision {
            background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
            border: 1px solid var(--neon-blue);
            border-radius: 12px;
            display: flex;
            align-items: center;
            padding: 20px;
            gap: 20px;
        }
        .ai-avatar { width: 80px; height: 80px; background: url('https://i.ibb.co/Xz90Cyz/ai-bot.png') center/cover; }
        .ai-btn-group { display: flex; gap: 10px; }
        .btn-core { 
            padding: 8px 20px; border: 1px solid var(--neon-blue); 
            background: transparent; color: white; cursor: pointer; 
            font-family: 'Orbitron'; font-size: 10px;
        }
        .btn-apply { background: var(--neon-green); color: black; border: none; font-weight: bold; }

        /* --- D, F, H: RIGHT SIDEBAR (300px) --- */
        .security-panel {
            background: rgba(10, 15, 30, 0.9);
            border-left: var(--border-glow);
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .alert-card {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid var(--neon-red);
            padding: 12px;
            border-radius: 6px;
            font-size: 12px;
        }

        .map-box {
            height: 180px;
            background: #000 url('https://i.ibb.co/F4pYhX7/map.png') center/cover;
            border-radius: 8px;
            border: var(--border-glow);
            position: relative;
        }

        /* --- I: SYSTEM LOGS --- */
        .logs-container {
            background: var(--panel-hex);
            border: var(--border-glow);
            border-radius: 8px;
            padding: 15px;
        }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
        th { text-align: left; color: #64748b; padding: 10px; border-bottom: 1px solid #1e293b; }
        td { padding: 10px; border-bottom: 1px solid #0f172a; }

        /* --- J: FOOTER --- */
        footer {
            grid-column: 1 / 4;
            background: #010409;
            border-top: var(--border-glow);
            padding: 8px;
            text-align: center;
            font-size: 10px;
            color: #475569;
        }

        .badge-success { color: var(--neon-green); font-weight: bold; }
        .badge-fail { color: var(--neon-red); font-weight: bold; }
    </style>
</head>
<body>
    <aside class="sidebar">
        <div class="brand-header">AI COMMAND CENTER<br><small>VERSION 4 PRO</small></div>
        <div class="nav-item nav-active" onclick="playSfx(1)">Dashboard</div>
        <div class="nav-item" onclick="playSfx(2)">Clients</div>
        <div class="nav-item" onclick="playSfx(3)">Accounts</div>
        <div class="nav-item" onclick="playSfx(4)">Transfers</div>
        <div class="nav-item" onclick="playSfx(5)">Vault</div>
        <div class="nav-item" onclick="playSfx(6)">Digital Assets</div>
        <div class="nav-item" onclick="playSfx(7)">Security</div>
        <div class="nav-item" onclick="playSfx(8)">World Map</div>
        
        <div class="system-health">
            <strong>System Health</strong>
            <div class="gauge-container">
                <div class="gauge" data-val="43%" style="border-top-color: var(--neon-green)"></div>
                <div class="gauge" data-val="62%" style="border-top-color: var(--neon-gold)"></div>
            </div>
            <div style="display:flex; justify-content:space-between">
                <span>Network: <span style="color:var(--neon-green)">FAST</span></span>
                <span>Ping: 120ms</span>
            </div>
        </div>
    </aside>

    <header>
        <div style="font-family:Orbitron; font-size: 18px;">GLOBAL DIGITAL BANK</div>
        <div id="real-clock">25 Feb 2026 | 14:32:18 (EAT)</div>
        <div style="display:flex; gap:15px; font-size:11px">
            <span>System: <b style="color:var(--neon-green)">ACTIVE</b></span>
            <span>Security: <b style="color:var(--neon-red)">HIGH</b></span>
        </div>
    </header>

    <div class="connection-bar">
        <span>● System Engine</span>
        <span>● Security Engine</span>
        <span>● AI Engine</span>
        <span>● DB Connected</span>
        <span style="color:var(--neon-green)">● Live</span>
    </div>

    <main class="viewport">
        <div class="live-meters">
            <div class="meter-box"><small>Users Online</small><div class="meter-val" id="user-count">1,284</div></div>
            <div class="meter-box"><small>Transactions/Sec</small><div class="meter-val">38 TPS</div></div>
            <div class="meter-box"><small>Active Transfers</small><div class="meter-val">142</div></div>
            <div class="meter-box" style="border-color:var(--neon-red)"><small>Fraud Alerts</small><div class="meter-val" style="color:var(--neon-red)">3</div></div>
        </div>

        <section class="vault-hero">
            <small>TOTAL BANK MONEY (Main Center)</small>
            <div class="money-display">KES 2,438,920,440</div>
            <div class="vault-stats">
                <div style="color:var(--neon-green)">Available: 1.90B</div>
                <div style="color:var(--neon-gold)">Reserved: 200M</div>
                <div style="color:var(--neon-red)">Frozen: 80M</div>
                <div style="color:var(--neon-blue)">Moving: 258.92M</div>
            </div>
        </section>

        <div class="logs-container">
            <strong>LIVE TRANSACTION STREAM</strong>
            <table>
                <tr><th>Time</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th></tr>
                <tr><td>14:35</td><td>Alex T</td><td>Deposit</td><td>KES 20,000</td><td class="badge-success">SUCCESS</td></tr>
                <tr><td>14:34</td><td>David O</td><td>Withdraw</td><td>KES 15,000</td><td class="badge-fail">FAILED</td></tr>
                <tr><td>14:33</td><td>John K</td><td>Transfer</td><td>KES 5,000</td><td class="badge-success">SUCCESS</td></tr>
            </table>
        </div>

        <div class="ai-decision">
            <div class="ai-avatar"></div>
            <div style="flex:1">
                <strong style="color:var(--neon-blue)">AI DECISION PANEL</strong>
                <div style="font-size:12px; margin: 10px 0;">
                    <div style="color:var(--neon-red)">● Fraud risk rising in mobile transfers</div>
                    <div style="color:var(--neon-gold)">● Server load at 65%</div>
                    <div style="color:var(--neon-blue)">● Transaction volume +20%</div>
                </div>
            </div>
            <div class="ai-btn-group">
                <button class="btn-core btn-apply" onclick="playSfx(10)">Apply Fix</button>
                <button class="btn-core" onclick="playSfx(11)">Ignore</button>
                <button class="btn-core" onclick="playSfx(12)">Analyze</button>
            </div>
        </div>

        <div class="logs-container">
            <strong>SYSTEM LOGS & UPDATES</strong>
            <table>
                <tr><th>Time</th><th>Event</th><th>Status</th></tr>
                <tr><td>14:32</td><td>New Client Registered</td><td class="badge-success">SUCCESS</td></tr>
                <tr><td>14:30</td><td>Suspicious IP Blocked</td><td class="badge-fail">BLOCKED</td></tr>
            </table>
        </div>
    </main>

    <aside class="security-panel">
        <div class="sec-section">
            <strong style="font-size:12px; color:var(--neon-red)">SECURITY ALERTS</strong>
            <div class="alert-card" style="margin-top:10px">
                <b>Suspicious Login</b><br>
                <small>John Doe - Nairobi [HIGH]</small>
            </div>
            <div class="alert-card" style="border-color:var(--neon-gold); background:rgba(251,191,36,0.1); margin-top:5px">
                <b>Multiple PIN Attempts</b><br>
                <small>Client: 0722***890 [MEDIUM]</small>
            </div>
            <div style="display:flex; gap:5px; margin-top:10px">
                <button class="btn-core" style="flex:1; border-color:var(--neon-gold)">Investigate</button>
                <button class="btn-core" style="flex:1; border-color:var(--neon-red)">Block</button>
            </div>
        </div>

        <div class="map-box">
            <div style="position:absolute; bottom:5px; left:5px; font-size:9px">WORLD ACTIVITY MAP</div>
        </div>

        <div class="quick-actions">
            <strong style="font-size:12px; color:var(--neon-gold)">QUICK ACTIONS</strong>
            <div class="nav-item" style="font-size:11px" onclick="playSfx(13)">+ New Client</div>
            <div class="nav-item" style="font-size:11px" onclick="playSfx(14)">+ New Transfer</div>
            <div class="nav-item" style="font-size:11px" onclick="playSfx(15)">Vault Control</div>
            <div class="nav-item" style="font-size:11px" onclick="playSfx(9)">Admin Settings</div>
        </div>

        <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; font-size:11px">
            <div style="color:var(--neon-green)">● Admin Online</div>
            <div>24/7 System Active</div>
        </div>
    </aside>

    <footer>
        © 2026 Global Digital Bank | Secure | Encrypted | AI Powered | All Rights Reserved
    </footer>

    <script>
        const playSfx = (id) => {
            const audio = new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + id + ".mp3");
            audio.play().catch(() => console.log("Sound error - check connection"));
        };

        // Live Clock
        setInterval(() => {
            const now = new Date();
            document.getElementById('real-clock').innerText = now.toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }) + ' (EAT)';
        }, 1000);

        // Simulated Counter
        setInterval(() => {
            const el = document.getElementById('user-count');
            let val = parseInt(el.innerText.replace(',',''));
            val += Math.floor(Math.random() * 5) - 2;
            el.innerText = val.toLocaleString();
        }, 3000);
    </script>
</body>
</html>
`);
});

app.listen(3000, () => console.log("COMMAND CENTER V4 ENLARGED & ACTIVE ON PORT 3000"));
