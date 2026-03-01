const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();

// --- INJECTED MONGOOSE LOGIC (KEEPING SYSTEM SECRETS) ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log("--- MONGODB CLUSTER0: ACTIVATED ---"))
    .catch(err => console.error("--- MONGODB ERROR: DEPLOYMENT FAILED ---", err));

// Function to check DB status for the UI dot
const getDbColor = () => mongoose.connection.readyState === 1 ? '#39ff14' : '#ff3131';

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI COMMAND CENTER V4 - FULL SYSTEM ENGINE</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-deep: #020617;
            --bg-sidebar: #010409;
            --bg-panel: rgba(15, 23, 42, 0.98);
            --neon-blue: #00d2ff;
            --neon-green: #39ff14;
            --neon-red: #ff3131;
            --neon-gold: #ffcc00;
            --glass-border: 1px solid rgba(0, 210, 255, 0.2);
            --sidebar-width: 240px;
            --right-panel-width: 300px;
            --header-h: 70px;
        }

        * { box-sizing: border-box; outline: none; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--neon-blue); border-radius: 10px; }

        body, html { 
            margin: 0; padding: 0; width: 100vw; height: 100vh; 
            background: var(--bg-deep); color: #f8fafc; 
            font-family: 'Inter', sans-serif; overflow: hidden; 
        }

        /* MASTER LAYOUT - PREVENTS OVERLAP */
        .app-shell {
            display: grid;
            grid-template-columns: var(--sidebar-width) 1fr var(--right-panel-width);
            grid-template-rows: var(--header-h) 1fr 35px;
            height: 100vh;
            width: 100vw;
        }

        /* --- 1. HEADER ENGINE --- */
        header {
            grid-column: 1 / 4;
            background: #000;
            border-bottom: var(--glass-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 25px;
            z-index: 1000;
        }

        .header-brand { display: flex; align-items: center; gap: 15px; }
        .logo-box { width: 40px; height: 40px; border: 1px solid var(--neon-blue); display: flex; align-items: center; justify-content: center; transform: rotate(45deg); }
        .logo-box i { transform: rotate(-45deg); font-family: 'Orbitron'; font-size: 20px; color: var(--neon-blue); }
        
        .header-center { font-family: 'Roboto Mono'; font-size: 16px; color: var(--neon-gold); letter-spacing: 1px; }

        .admin-profile { display: flex; align-items: center; gap: 10px; font-size: 12px; }
        .avatar { width: 35px; height: 35px; border-radius: 50%; border: 2px solid var(--neon-green); background: url('https://i.ibb.co/9G6vH4P/user-prof.jpg') center/cover; }

        /* --- 2. SIDEBAR ENGINE --- */
        .sidebar {
            grid-row: 2;
            background: var(--bg-sidebar);
            border-right: var(--glass-border);
            padding: 20px 0;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            z-index: 500;
        }

        .menu-label { padding: 0 20px; font-size: 10px; color: #475569; letter-spacing: 2px; margin-bottom: 15px; text-transform: uppercase; }
        .nav-link { 
            padding: 14px 25px; display: flex; align-items: center; gap: 12px; 
            color: #94a3b8; font-size: 13px; cursor: pointer; transition: 0.3s;
            border-left: 3px solid transparent;
        }
        .nav-link:hover { background: rgba(0, 210, 255, 0.05); color: var(--neon-blue); }
        .nav-active { background: rgba(0, 210, 255, 0.1); color: var(--neon-blue); border-left: 3px solid var(--neon-blue); font-weight: 600; }

        .health-module { margin-top: auto; padding: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
        .stat-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 5px; }
        .progress-bg { width: 100%; height: 4px; background: #1e293b; border-radius: 2px; margin-bottom: 15px; }
        .progress-fill { height: 100%; border-radius: 2px; transition: 1s; }

        /* --- 3. MAIN WORKSPACE (SCROLLABLE) --- */
        .workspace {
            grid-row: 2;
            background: radial-gradient(circle at top right, #0a192f 0%, #020617 100%);
            padding: 25px;
            overflow-y: scroll;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        .conn-bar { 
            display: flex; gap: 20px; font-size: 11px; color: #64748b; 
            padding: 12px 20px; background: rgba(0,0,0,0.3); border-radius: 6px; border: var(--glass-border);
        }
        .conn-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 5px; }

        .grid-meters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .meter-card { 
            background: var(--bg-panel); border: var(--glass-border); padding: 20px; border-radius: 8px; 
            text-align: center; position: relative; overflow: hidden;
        }
        .meter-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .meter-value { font-family: 'Orbitron'; font-size: 24px; color: var(--neon-blue); margin-top: 10px; }

        /* HERO VAULT */
        .vault-core {
            background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
            border: 1px solid rgba(0, 210, 255, 0.4);
            border-radius: 12px;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        .vault-total { font-family: 'Orbitron'; font-size: 48px; margin: 20px 0; text-shadow: 0 0 20px rgba(0, 210, 255, 0.4); }
        .vault-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 30px; }
        .v-box { padding: 15px; background: rgba(0,0,0,0.4); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }

        /* DATA TABLES */
        .section-header { font-family: 'Orbitron'; font-size: 14px; color: var(--neon-blue); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .data-wrap { background: var(--bg-panel); border: var(--glass-border); border-radius: 8px; overflow: hidden; }
        .sys-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .sys-table th { background: rgba(0,0,0,0.4); text-align: left; padding: 15px; color: #64748b; font-weight: 500; }
        .sys-table td { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .status-pill { padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; }

        /* AI NEURAL INTERFACE */
        .ai-neural-card {
            background: rgba(0, 210, 255, 0.02);
            border: 1px solid var(--neon-blue);
            border-radius: 12px;
            display: grid;
            grid-template-columns: 200px 1fr;
            padding: 30px;
            gap: 30px;
            position: relative;
        }
        .ai-visual { 
            width: 150px; height: 150px; 
            background: url('https://i.ibb.co/Xz90Cyz/ai-bot.png') center/cover;
            filter: drop-shadow(0 0 15px var(--neon-blue));
            animation: pulse 4s infinite ease-in-out;
        }
        @keyframes pulse { 0%, 100% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }

        .ai-logic-stream { display: flex; flex-direction: column; gap: 12px; }
        .logic-item { padding: 12px; background: rgba(0,0,0,0.4); border-radius: 6px; border-left: 3px solid var(--neon-blue); font-size: 12px; }

        /* --- 4. RIGHT SECURITY PANEL (SCROLLABLE) --- */
        .security-side {
            grid-row: 2;
            background: rgba(1, 4, 9, 0.8);
            border-left: var(--glass-border);
            padding: 25px 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 30px;
            z-index: 500;
        }

        .alert-card {
            background: rgba(255, 49, 49, 0.05);
            border: 1px solid var(--neon-red);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            position: relative;
        }
        .alert-card::before { content: 'HIGH RISK'; position: absolute; top: -10px; right: 10px; background: var(--neon-red); color: white; font-size: 8px; padding: 2px 6px; border-radius: 4px; }

        .map-frame { 
            height: 200px; width: 100%; border-radius: 8px; border: var(--glass-border);
            background: #000 url('https://i.ibb.co/F4pYhX7/map.png') center/cover;
            position: relative;
        }
        .map-blip { position: absolute; width: 6px; height: 6px; background: var(--neon-green); border-radius: 50%; box-shadow: 0 0 10px var(--neon-green); animation: blip 2s infinite; }

        /* --- 5. FOOTER --- */
        footer {
            grid-column: 1 / 4;
            background: #000;
            border-top: var(--glass-border);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 11px;
            color: #475569;
            letter-spacing: 1px;
        }

        .btn-core {
            padding: 10px 20px; background: transparent; border: 1px solid var(--neon-blue);
            color: white; font-family: 'Orbitron'; font-size: 10px; cursor: pointer; transition: 0.3s;
        }
        .btn-core:hover { background: var(--neon-blue); color: black; }
        .btn-danger { border-color: var(--neon-red); color: var(--neon-red); }
        .btn-danger:hover { background: var(--neon-red); color: white; }

    </style>
</head>
<body>
    <div class="app-shell">
        <header>
            <div class="header-brand">
                <div class="logo-box"><i>B</i></div>
                <div style="font-family:'Orbitron'; line-height:1.2;">
                    <div style="font-size:16px; color:var(--neon-blue);">AI COMMAND CENTER</div>
                    <div style="font-size:10px; color:#64748b;">GLOBAL DIGITAL BANK - V4 PRO</div>
                </div>
            </div>
            <div class="header-center" id="main-timer">25 FEB 2026 | 14:32:18 (EAT)</div>
            <div class="admin-profile">
                <div style="text-align:right">
                    <div style="font-weight:bold">Admin: Manager</div>
                    <div style="font-size:10px; color:var(--neon-green)">● SYSTEM ONLINE</div>
                </div>
                <div class="avatar"></div>
            </div>
        </header>

        <aside class="sidebar">
            <div class="menu-label">Main Navigation</div>
            <div class="nav-link nav-active" onclick="play(1)">Dashboard</div>
            <div class="nav-link" onclick="play(2)">Clients Management</div>
            <div class="nav-link" onclick="play(3)">Banking Accounts</div>
            <div class="nav-link" onclick="play(4)">Transfers & Wire</div>
            <div class="nav-link" onclick="play(5)">Vault Storage</div>
            <div class="nav-link" onclick="play(6)">Digital Assets</div>
            <div class="nav-link" onclick="play(7)">Transaction History</div>
            <div class="nav-link" onclick="play(8)">AI Neural Center</div>
            <div class="nav-link" onclick="play(10)">Security Gateway</div>
            <div class="nav-link" onclick="play(12)">System Reports</div>
            <div class="nav-link" onclick="play(13)">World Map Activity</div>
            <div class="nav-link" onclick="play(14)">Automation Tasks</div>
            <div class="nav-link" onclick="play(15)">Master Settings</div>

            <div class="health-module">
                <div class="menu-label">System Health</div>
                <div class="stat-row"><span>CPU Usage</span><span>43%</span></div>
                <div class="progress-bg"><div class="progress-fill" style="width:43%; background:var(--neon-green)"></div></div>
                <div class="stat-row"><span>Memory Load</span><span>62%</span></div>
                <div class="progress-bg"><div class="progress-fill" style="width:62%; background:var(--neon-gold)"></div></div>
                <div class="stat-row" style="color:var(--neon-green)"><span>Network</span><span>FAST</span></div>
                <div class="stat-row"><span>Ping</span><span>120ms</span></div>
            </div>
        </aside>

        <main class="workspace">
            <div class="conn-bar">
                <span><span class="conn-dot" style="background:var(--neon-green)"></span>System Engine</span>
                <span><span class="conn-dot" style="background:var(--neon-green)"></span>Security Engine</span>
                <span><span class="conn-dot" style="background:var(--neon-blue)"></span>AI Neural Engine</span>
                <span><span class="conn-dot" style="background:${getDbColor()}"></span>DB Connected</span>
                <span style="color:var(--neon-green); margin-left:auto">● LIVE DATA STREAM ACTIVE</span>
            </div>

            <div class="grid-meters">
                <div class="meter-card">
                    <div class="meter-label">Users Online</div>
                    <div class="meter-value" id="user-sync">1,284</div>
                </div>
                <div class="meter-card">
                    <div class="meter-label">Transactions/Sec</div>
                    <div class="meter-value">38 TPS</div>
                </div>
                <div class="meter-card">
                    <div class="meter-label">Active Transfers</div>
                    <div class="meter-value">142</div>
                </div>
                <div class="meter-card" style="border-color:var(--neon-red)">
                    <div class="meter-label" style="color:var(--neon-red)">Fraud Alerts</div>
                    <div class="meter-value" style="color:var(--neon-red)">3</div>
                </div>
            </div>

            <section class="vault-core">
                <div style="font-size:12px; color:#94a3b8; letter-spacing:2px;">TOTAL BANK LIQUIDITY (Main Center)</div>
                <div class="vault-total">KES 2,438,920,440</div>
                <div class="vault-grid">
                    <div class="v-box"><div style="color:var(--neon-green); font-size:16px;">1.90B</div><small>Available</small></div>
                    <div class="v-box"><div style="color:var(--neon-gold); font-size:16px;">200M</div><small>Reserved</small></div>
                    <div class="v-box"><div style="color:var(--neon-red); font-size:16px;">80M</div><small>Frozen</small></div>
                    <div class="v-box"><div style="color:var(--neon-blue); font-size:16px;">258.9M</div><small>Moving</small></div>
                </div>
            </section>

            <div class="section-group">
                <div class="section-header">LIVE TRANSACTION STREAM</div>
                <div class="data-wrap">
                    <table class="sys-table">
                        <thead><tr><th>Time</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody id="tx-stream">
                            <tr><td>14:35</td><td>Alex T</td><td>Deposit</td><td>KES 20,000</td><td><span class="status-pill" style="background:rgba(57, 255, 20, 0.1); color:var(--neon-green)">SUCCESS</span></td></tr>
                            <tr><td>14:34</td><td>Susan M</td><td>Transfer</td><td>KES 8,300</td><td><span class="status-pill" style="background:rgba(57, 255, 20, 0.1); color:var(--neon-green)">SUCCESS</span></td></tr>
                            <tr><td>14:34</td><td>David O</td><td>Withdraw</td><td>KES 15,000</td><td><span class="status-pill" style="background:rgba(255, 49, 49, 0.1); color:var(--neon-red)">FAILED</span></td></tr>
                            <tr><td>14:33</td><td>Mary W</td><td>Deposit</td><td>KES 2,000</td><td><span class="status-pill" style="background:rgba(57, 255, 20, 0.1); color:var(--neon-green)">SUCCESS</span></td></tr>
                            <tr><td>14:33</td><td>John K</td><td>Transfer</td><td>KES 5,000</td><td><span class="status-pill" style="background:rgba(57, 255, 20, 0.1); color:var(--neon-green)">SUCCESS</span></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="section-group">
                <div class="section-header">AI DECISION PANEL</div>
                <div class="ai-neural-card">
                    <div class="ai-visual"></div>
                    <div>
                        <div class="ai-logic-stream">
                            <div class="logic-item" style="border-color:var(--neon-red)">Fraud risk rising in <b style="color:var(--neon-red)">mobile transfers</b>. Neural check initiated.</div>
                            <div class="logic-item" style="border-color:var(--neon-gold)">Server load at 65%. Dynamic resource allocation suggested.</div>
                            <div class="logic-item" style="border-color:var(--neon-blue)">Transaction volume +20% from baseline.</div>
                        </div>
                        <div style="display:flex; gap:15px; margin-top:25px;">
                            <button class="btn-core" style="background:var(--neon-green); color:black; border:none; font-weight:bold" onclick="play(11)">APPLY FIX</button>
                            <button class="btn-core" onclick="play(9)">IGNORE</button>
                            <button class="btn-core" onclick="play(10)">ANALYZE</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section-group">
                <div class="section-header">SYSTEM LOGS & UPDATES</div>
                <div class="data-wrap">
                    <table class="sys-table">
                        <tr><th>Time</th><th>Event</th><th>Node</th><th>Status</th></tr>
                        <tr><td>14:32</td><td>New Client Registered</td><td>K-NBO-01</td><td style="color:var(--neon-green)">SUCCESS</td></tr>
                        <tr><td>14:31</td><td>KES 50,000 Transfer</td><td>US-NY-04</td><td style="color:var(--neon-green)">SUCCESS</td></tr>
                        <tr><td>14:30</td><td>Suspicious IP Blocked</td><td>UA-DUB-09</td><td style="color:var(--neon-red)">BLOCKED</td></tr>
                        <tr><td>14:29</td><td>Daily Backup Completed</td><td>CLOUD-01</td><td style="color:var(--neon-green)">SUCCESS</td></tr>
                    </table>
                </div>
            </div>
        </main>

        <aside class="security-side">
            <div>
                <div class="section-header" style="color:var(--neon-red)">SECURITY ALERTS</div>
                <div class="alert-card">
                    <b style="color:var(--neon-red)">Suspicious Login</b><br>
                    <small>John Doe - Nairobi Hub</small>
                </div>
                <div class="alert-card" style="border-color:var(--neon-gold); background:rgba(255,204,0,0.05)">
                    <b style="color:var(--neon-gold)">Multiple PIN Attempts</b><br>
                    <small>User: 0722***890 [MEDIUM]</small>
                </div>
                <div class="alert-card" style="border-color:var(--neon-green); background:rgba(57,255,20,0.05)">
                    <b style="color:var(--neon-green)">New Device Login</b><br>
                    <small>Mary W - Mombasa [LOW]</small>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <button class="btn-core" onclick="play(13)">INVESTIGATE</button>
                    <button class="btn-core btn-danger" onclick="play(14)">BLOCK</button>
                </div>
            </div>

            <div>
                <div class="section-header">WORLD ACTIVITY MAP</div>
                <div class="map-frame">
                    <div class="map-blip" style="top:40%; left:20%;"></div>
                    <div class="map-blip" style="top:30%; left:75%;"></div>
                    <div class="map-blip" style="top:75%; left:60%;"></div>
                </div>
            </div>

            <div>
                <div class="section-header" style="color:var(--neon-gold)">QUICK ACTIONS</div>
                <div style="display:grid; gap:10px;">
                    <button class="btn-core" onclick="play(15)">+ NEW CLIENT</button>
                    <button class="btn-core" onclick="play(1)">+ NEW TRANSFER</button>
                    <button class="btn-core" onclick="play(5)">VAULT CONTROL</button>
                    <button class="btn-core" onclick="play(12)">GENERATE REPORT</button>
                </div>
            </div>

            <div style="margin-top:auto; background:rgba(255,255,255,0.02); padding:15px; border-radius:8px;">
                <div style="display:flex; align-items:center; gap:10px; font-size:12px; margin-bottom:10px;">
                    <div style="width:10px; height:10px; border-radius:50%; background:var(--neon-green);"></div>
                    Live Support Online
                </div>
                <button class="btn-core" style="width:100%; border-color:var(--neon-blue); color:var(--neon-blue)">OPEN CHAT TERMINAL</button>
            </div>
        </aside>

        <footer>
            © 2026 GLOBAL DIGITAL BANK | ENCRYPTED QUANTUM PROTOCOL | POWERED BY AI V4 PRO
        </footer>
    </div>

    <script>
        // 15+ SOUND ENGINE (INTEGRITY MAINTAINED)
        const play = (id) => {
            const sfx = new Audio(\`https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_\${id}.mp3\`);
            sfx.volume = 0.4;
            sfx.play().catch(e => console.log("Sound interaction required"));
        };

        // REAL-TIME CLOCK ENGINE
        setInterval(() => {
            const now = new Date();
            document.getElementById('main-timer').innerText = now.toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }) + ' (EAT)';
        }, 1000);

        // LIVE COUNTER SIMULATION
        setInterval(() => {
            const el = document.getElementById('user-sync');
            if(el) {
                let val = parseInt(el.innerText.replace(',',''));
                val += Math.floor(Math.random() * 3) - 1;
                el.innerText = val.toLocaleString();
            }
        }, 3000);
    </script>
</body>
</html>
`);
});

app.listen(3000, () => console.log("System Engine V4 Pro Online | MongoDB Activation Complete"));
