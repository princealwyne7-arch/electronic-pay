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

        /* MASTER LAYOUT */
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
        .header-status-ribbon { display: flex; gap: 20px; font-size: 10px; font-family: 'Orbitron'; }
        .status-item { display: flex; align-items: center; gap: 5px; }
        
        /* --- 2. SIDEBAR ENGINE --- */
        .sidebar {
            grid-row: 2;
            background: var(--bg-sidebar);
            border-right: var(--glass-border);
            padding: 20px 0;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        }
        .menu-label { padding: 0 20px; font-size: 10px; color: #475569; letter-spacing: 2px; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px dashed rgba(255,255,255,0.05); }
        .nav-link { 
            padding: 12px 25px; display: flex; align-items: center; gap: 12px; 
            color: #94a3b8; font-size: 13px; cursor: pointer; transition: 0.2s;
        }
        .nav-link:hover { color: var(--neon-blue); background: rgba(0, 210, 255, 0.05); }
        .nav-active { color: var(--neon-blue); background: rgba(0, 210, 255, 0.1); border-left: 3px solid var(--neon-blue); }

        .health-module { margin-top: auto; padding: 20px; background: rgba(0,0,0,0.2); }
        .health-grid { display: grid; gap: 10px; }
        .health-stat { font-size: 11px; display: flex; justify-content: space-between; }
        .progress-bar { width: 100%; height: 5px; background: #1e293b; border-radius: 10px; overflow: hidden; margin-top: 4px; }
        .progress-fill { height: 100%; transition: 1s ease-in-out; }

        /* --- 3. MAIN WORKSPACE --- */
        .workspace {
            grid-row: 2;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 25px;
        }

        .connection-bar-full {
            display: flex; justify-content: space-between; padding: 10px 20px;
            background: rgba(0,0,0,0.4); border: var(--glass-border); border-radius: 4px;
            font-size: 11px; font-family: 'Roboto Mono'; color: #64748b;
        }
        .conn-tag { display: flex; align-items: center; gap: 8px; }
        .dot { width: 6px; height: 6px; border-radius: 50%; }

        .vault-display {
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, #020617 100%);
            border: 1px solid rgba(0, 210, 255, 0.3); border-radius: 8px; padding: 30px; text-align: center;
        }

        .section-header-box {
            font-family: 'Orbitron'; font-size: 12px; color: var(--neon-gold);
            display: flex; align-items: center; gap: 10px; margin-bottom: 15px;
            text-transform: uppercase; letter-spacing: 2px;
        }

        .data-table-container {
            background: var(--bg-panel); border: var(--glass-border); border-radius: 6px; overflow: hidden;
        }
        .heavy-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .heavy-table th { background: rgba(0,0,0,0.5); padding: 12px; text-align: left; color: #475569; }
        .heavy-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.02); }

        /* --- 4. RIGHT SECURITY STACK --- */
        .security-side {
            grid-row: 2; background: #010409; border-left: var(--glass-border);
            padding: 20px; display: flex; flex-direction: column; gap: 20px; overflow-y: auto;
        }
        .security-alert-item {
            background: rgba(255,255,255,0.03); border-radius: 4px; padding: 12px;
            border-left: 3px solid var(--neon-blue); position: relative;
        }
        .alert-high { border-left-color: var(--neon-red); background: rgba(255,49,49,0.05); }
        .severity-tag { position: absolute; top: 12px; right: 12px; font-size: 8px; padding: 2px 5px; border-radius: 2px; }

        .map-container {
            height: 180px; width: 100%; background: #000 url('https://i.ibb.co/F4pYhX7/map.png') center/cover;
            border-radius: 4px; position: relative; border: var(--glass-border);
        }
        .map-marker { position: absolute; width: 8px; height: 8px; background: var(--neon-gold); border-radius: 50%; box-shadow: 0 0 10px var(--neon-gold); animation: pulse 2s infinite; }

        /* --- BUTTONS --- */
        .btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .action-btn { 
            padding: 8px; background: transparent; border: 1px solid var(--neon-blue);
            color: #fff; font-family: 'Orbitron'; font-size: 9px; cursor: pointer; transition: 0.3s;
        }
        .action-btn:hover { background: var(--neon-blue); color: #000; }

        footer { grid-column: 1 / 4; background: #000; border-top: var(--glass-border); display: flex; justify-content: center; align-items: center; font-size: 10px; color: #475569; font-family: 'Orbitron'; }
    </style>
</head>
<body>
    <div class="app-shell">
        <header>
            <div class="header-brand">
                <div class="logo-box"><i>B</i></div>
                <div>
                    <div style="font-family:'Orbitron'; font-size:18px; color:white;">AI COMMAND CENTER</div>
                    <div style="font-size:9px; color:var(--neon-blue); letter-spacing:1px;">GLOBAL DIGITAL BANK - VERSION 4</div>
                </div>
            </div>
            <div class="header-status-ribbon">
                <div class="status-item"><span class="dot" style="background:var(--neon-green)"></span> System: ACTIVE</div>
                <div class="status-item"><span class="dot" style="background:var(--neon-red)"></span> Security: HIGH</div>
                <div class="status-item"><span class="dot" style="background:var(--neon-blue)"></span> AI: RUNNING</div>
            </div>
            <div class="admin-profile">
                <div style="text-align:right; margin-right:10px;">
                    <div style="font-weight:bold; font-size:12px;">Admin: Manager</div>
                    <div id="main-timer" style="font-size:10px; color:var(--neon-gold)">00:00:00</div>
                </div>
                <div class="avatar"></div>
            </div>
        </header>

        <aside class="sidebar">
            <div class="menu-label">240px MAIN MENU</div>
            <div class="nav-link nav-active" onclick="play(1)">Dashboard</div>
            <div class="nav-link" onclick="play(2)">Clients</div>
            <div class="nav-link" onclick="play(3)">Accounts ></div>
            <div class="nav-link" onclick="openBanking()">Transfers ></div>
            <div class="nav-link" onclick="play(5)">Vault ></div>
            <div class="nav-link" onclick="play(6)">Digital Assets</div>
            <div class="nav-link" onclick="play(7)">Transactions ></div>
            <div class="nav-link" onclick="play(8)">AI Center</div>
            <div class="nav-link" onclick="play(10)">Security ></div>
            <div class="nav-link" onclick="play(12)">Reports</div>
            <div class="nav-link" onclick="play(13)">World Map</div>
            <div class="nav-link" onclick="play(14)">Automation</div>
            <div class="nav-link" onclick="play(15)">Settings ></div>

            <div class="health-module">
                <div class="menu-label" style="padding:0; margin-bottom:10px;">System Health</div>
                <div class="health-grid">
                    <div class="health-stat"><span>CPU</span><span>43%</span></div>
                    <div class="progress-bar"><div class="progress-fill" style="width:43%; background:var(--neon-green)"></div></div>
                    <div class="health-stat"><span>Memory</span><span>62%</span></div>
                    <div class="progress-bar"><div class="progress-fill" style="width:62%; background:var(--neon-gold)"></div></div>
                    <div class="health-stat" style="margin-top:5px;"><span>Network</span><span style="color:var(--neon-green)">FAST</span></div>
                    <div class="health-stat"><span>Response</span><span style="color:var(--neon-blue)">120ms</span></div>
                </div>
            </div>
        </aside>

        <main class="workspace">
            <div class="connection-bar-full">
                <div class="conn-tag"><span class="dot" style="background:var(--neon-blue)"></span> System Engine</div>
                <div class="conn-tag"><span class="dot" style="background:var(--neon-green)"></span> Security Engine</div>
                <div class="conn-tag"><span class="dot" style="background:var(--neon-gold)"></span> AI Engine</div>
                <div class="conn-tag"><span class="dot" style="background:var(--neon-blue)"></span> DB Connected</div>
                <div class="conn-tag" style="color:var(--neon-green)">● Live</div>
            </div>

            <div class="grid-meters">
                <div class="meter-card">
                    <div class="meter-label">Users Online</div>
                    <div class="meter-value" id="user-sync">1,284</div>
                </div>
                <div class="meter-card">
                    <div class="meter-label">Transactions/Sec</div>
                    <div class="meter-value">38 <small style="font-size:10px">TPS</small></div>
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

            <section class="vault-display">
                <div class="section-header-box" style="justify-content:center">TOTAL BANK MONEY (Main Center)</div>
                <div style="font-family:'Orbitron'; font-size:42px; margin:10px 0;">KES 2,438,920,440</div>
                <div class="vault-grid">
                    <div class="v-box"><div style="color:var(--neon-green)">KES 1.90B</div><small>Available</small></div>
                    <div class="v-box"><div style="color:var(--neon-gold)">KES 200M</div><small>Reserved</small></div>
                    <div class="v-box"><div style="color:var(--neon-red)">KES 80M</div><small>Frozen</small></div>
                    <div class="v-box"><div style="color:var(--neon-blue)">KES 258.92M</div><small>Moving</small></div>
                </div>
            </section>

            <div class="section-group">
                <div class="section-header-box">LIVE TRANSACTION STREAM</div>
                <div class="data-table-container">
                    <table class="heavy-table">
                        <thead><tr><th>Time</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                            <tr><td>14:33</td><td>John K</td><td style="color:var(--neon-blue)">Transfer</td><td>KES 5,000</td><td><span style="color:var(--neon-green)">SUCCESS</span></td></tr>
                            <tr><td>14:33</td><td>Mary W</td><td style="color:var(--neon-green)">Deposit</td><td>KES 2,000</td><td><span style="color:var(--neon-green)">SUCCESS</span></td></tr>
                            <tr><td>14:34</td><td>David O</td><td style="color:var(--neon-red)">Withdraw</td><td>KES 15,000</td><td><span style="color:var(--neon-red)">FAILED</span></td></tr>
                            <tr><td>14:34</td><td>Susan M</td><td style="color:var(--neon-blue)">Transfer</td><td>KES 8,300</td><td><span style="color:var(--neon-green)">SUCCESS</span></td></tr>
                            <tr><td>14:35</td><td>Alex T</td><td style="color:var(--neon-green)">Deposit</td><td>KES 20,000</td><td><span style="color:var(--neon-green)">SUCCESS</span></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="section-group">
                <div class="section-header-box">AI DECISION PANEL</div>
                <div class="ai-neural-card" style="grid-template-columns: 1fr 200px;">
                    <div>
                        <div class="menu-label" style="padding:0; margin-bottom:10px;">AI Suggestions</div>
                        <div class="ai-logic-stream">
                            <div class="logic-item" style="border-left-color:var(--neon-red)">Fraud risk rising in <span style="color:var(--neon-red)">mobile transfers</span></div>
                            <div class="logic-item" style="border-left-color:var(--neon-gold)">Server load at 65%</div>
                            <div class="logic-item" style="border-left-color:var(--neon-blue)">Transaction volume + 20%</div>
                        </div>
                        <div style="display:flex; gap:10px; margin-top:15px;">
                            <button class="action-btn" style="background:var(--neon-green); color:#000; border:none; font-weight:bold;" onclick="play(11)">Apply Fix</button>
                            <button class="action-btn" onclick="play(9)">Ignore</button>
                            <button class="action-btn" onclick="play(8)">Analyze</button>
                        </div>
                    </div>
                    <div class="ai-visual" style="width:100px; height:100px; margin-left:auto;"></div>
                </div>
            </div>

            <div class="section-group">
                <div class="section-header-box">SYSTEM LOGS & UPDATES (Full Width)</div>
                <div class="data-table-container">
                    <table class="heavy-table">
                        <thead><tr><th>Time</th><th>Event</th><th>Status</th></tr></thead>
                        <tbody>
                            <tr><td>14:32</td><td>New Client Registered</td><td><span style="color:var(--neon-green)">SUCCESS</span></td></tr>
                            <tr><td>14:31</td><td>KES 50,000 Transfer</td><td><span style="color:var(--neon-green)">SUCCESS</span></td></tr>
                            <tr><td>14:30</td><td style="color:var(--neon-red)">Suspicious IP Blocked</td><td><span style="background:var(--neon-red); color:white; padding:2px 5px; font-size:9px;">BLOGRED</span></td></tr>
                            <tr><td>14:29</td><td>Daily Backup Completed</td><td><span style="color:var(--neon-green)">SUCCESS</span></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>

        <aside class="security-side">
            <div class="section-header-box" style="color:var(--neon-red)">SECURITY ALERTS</div>
            <div class="security-alert-stack">
                <div class="security-alert-item alert-high">
                    <span class="severity-tag" style="background:var(--neon-red)">HIGH</span>
                    <div style="font-weight:bold; font-size:12px;">Suspicious Login</div>
                    <div style="font-size:10px; color:#64748b;">John Doe - Nairobi</div>
                </div>
                <div class="security-alert-item" style="border-left-color:var(--neon-gold); margin-top:10px;">
                    <span class="severity-tag" style="background:var(--neon-gold)">MEDIUM</span>
                    <div style="font-weight:bold; font-size:12px;">Multiple PIN Attempts</div>
                    <div style="font-size:10px; color:#64748b;">Client: 0722***890</div>
                </div>
                <div class="security-alert-item" style="border-left-color:var(--neon-green); margin-top:10px;">
                    <span class="severity-tag" style="background:var(--neon-green)">LOW</span>
                    <div style="font-weight:bold; font-size:12px;">New Device Login</div>
                    <div style="font-size:10px; color:#64748b;">Mary W - Mombasa</div>
                </div>
            </div>
            <div class="btn-group">
                <button class="action-btn" style="border-color:var(--neon-gold); color:var(--neon-gold)">Investigate</button>
                <button class="action-btn" style="border-color:var(--neon-red); color:var(--neon-red)">Block</button>
            </div>
            <button class="action-btn" style="width:100%">Ignore</button>

            <div class="section-header-box">WORLD ACTIVITY MAP</div>
            <div class="map-container">
                <div class="map-marker" style="top:30%; left:20%;" title="USA"></div>
                <div class="map-marker" style="top:25%; left:55%;" title="Germany"></div>
                <div class="map-marker" style="top:40%; left:85%;" title="UAE"></div>
                <div class="map-marker" style="top:65%; left:65%;" title="Kenya"></div>
            </div>

            <div class="section-header-box" style="color:var(--neon-gold)">QUICK ACTIONS</div>
            <div style="display:flex; flex-direction:column; gap:8px;">
                <button class="action-btn" style="text-align:left; padding-left:15px;" onclick="play(15)">+ New Client</button>
                <button class="action-btn" style="text-align:left; padding-left:15px; border-color:var(--neon-gold); color:var(--neon-gold)" onclick="openBanking()">+ New Transfer</button>
                <button class="action-btn" style="text-align:left; padding-left:15px; border-color:var(--neon-green); color:var(--neon-green)" onclick="play(5)">Vault Control</button>
                <button class="action-btn" style="text-align:left; padding-left:15px;" onclick="play(12)">Reports</button>
                <button class="action-btn" style="text-align:left; padding-left:15px;" onclick="play(15)">Admin Settings</button>
            </div>

            <div class="section-header-box" style="margin-top:10px;">Live Support</div>
            <div style="background:rgba(255,255,255,0.02); padding:10px; border-radius:4px; font-size:10px;">
                <div style="margin-bottom:5px;"><span class="dot" style="background:var(--neon-green); display:inline-block; margin-right:5px;"></span> Admin Online</div>
                <div style="margin-bottom:10px;"><span class="dot" style="background:var(--neon-green); display:inline-block; margin-right:5px;"></span> 24/7 System Active</div>
                <button class="action-btn" style="width:100%; border-radius:20px; background:var(--neon-blue); color:black;">CHAT NOW</button>
            </div>
        </aside>

        <footer>
            © 2026 Global Digital Bank | Secure | Encrypted | AI Powered | All Rights Reserved
        </footer>
    </div>

    <div id="banking-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:2000; justify-content:center; align-items:center; backdrop-filter:blur(10px);">
        <div class="engine-modal" style="width:800px; background:var(--bg-panel); border:1px solid var(--neon-blue); padding:30px; border-radius:10px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:30px;">
                <h2 style="font-family:'Orbitron'; color:var(--neon-blue); margin:0;">SOCIETY BANKING GATEWAY</h2>
                <button onclick="closeBanking()" class="action-btn" style="border-color:var(--neon-red); color:var(--neon-red)">CLOSE</button>
            </div>
            <div class="bank-feature-row">
                <div><div style="font-family:Orbitron;">STK PUSH</div><small>Paynecta Engine</small></div>
                <button class="action-btn" style="background:var(--neon-green); color:black; border:none;" onclick="stkEngine()">EXECUTE</button>
            </div>
            </div>
    </div>

    <script>
        const play = (id) => {
            const sfx = new Audio(\`https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_\${id}.mp3\`);
            sfx.volume = 0.4;
            sfx.play().catch(e => {});
        };

        function openBanking() { play(4); document.getElementById('banking-overlay').style.display = 'flex'; }
        function closeBanking() { play(10); document.getElementById('banking-overlay').style.display = 'none'; }
        
        function stkEngine() { 
            play(11);
            const p = prompt("PHONE:"); const a = prompt("AMOUNT:");
            if(p && a) alert("PAYNECTA: Sending prompt to " + p);
        }

        setInterval(() => {
            document.getElementById('main-timer').innerText = new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi' }) + ' (EAT)';
        }, 1000);

        setInterval(() => {
            const el = document.getElementById('user-sync');
            let val = parseInt(el.innerText.replace(',',''));
            val += Math.floor(Math.random() * 3) - 1;
            el.innerText = val.toLocaleString();
        }, 3000);
    </script>
</body>
</html>
`);
});

app.listen(3000, () => console.log("System Engine V4 Pro Online"));
