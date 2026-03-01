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
    <title>AI COMMAND CENTER V4 | GLOBAL DIGITAL BANK</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-body: #050a14;
            --bg-sidebar: #02060c;
            --bg-card: rgba(15, 23, 42, 0.9);
            --neon-blue: #00d2ff;
            --neon-green: #39ff14;
            --neon-red: #ff3131;
            --neon-gold: #ffcc00;
            --border: 1px solid rgba(255, 255, 255, 0.1);
            --header-height: 60px;
        }

        /* RESET & SCROLLABLE ARCHITECTURE */
        * { box-sizing: border-box; }
        body, html { 
            margin: 0; padding: 0; width: 100%; height: 100%; 
            background: var(--bg-body); color: #e2e8f0; 
            font-family: 'Inter', sans-serif; overflow: hidden; 
        }

        .master-container {
            display: grid;
            grid-template-columns: 240px 1fr 300px;
            grid-template-rows: var(--header-height) 1fr 40px;
            height: 100vh;
            width: 100vw;
        }

        /* FIXED HEADER */
        header {
            grid-column: 1 / 4;
            background: #000;
            border-bottom: var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            z-index: 1000;
        }

        /* FIXED SIDEBAR */
        .sidebar {
            grid-row: 2;
            background: var(--bg-sidebar);
            border-right: var(--border);
            display: flex;
            flex-direction: column;
            padding: 20px 10px;
            overflow-y: auto;
        }

        /* MAIN SCROLLABLE VIEWPORT */
        .viewport {
            grid-row: 2;
            padding: 20px;
            overflow-y: auto;
            overflow-x: auto; /* Side scroll allowed for wide tables */
            background: radial-gradient(circle at 50% 50%, #0a192f 0%, #050a14 100%);
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* RIGHT PANEL (SCROLLABLE INDEPENDENTLY) */
        .right-panel {
            grid-row: 2;
            background: rgba(0,0,0,0.4);
            border-left: var(--border);
            padding: 20px 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* FOOTER */
        footer {
            grid-column: 1 / 4;
            background: #000;
            border-top: var(--border);
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 11px;
            color: #475569;
        }

        /* COMPONENTS */
        .card { 
            background: var(--bg-card); 
            border: var(--border); 
            border-radius: 8px; 
            padding: 15px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.5); 
        }

        .nav-item {
            padding: 12px 15px;
            font-size: 13px;
            color: #94a3b8;
            cursor: pointer;
            border-radius: 6px;
            transition: 0.2s;
            margin-bottom: 5px;
        }
        .nav-item:hover { color: var(--neon-blue); background: rgba(0, 210, 255, 0.05); }
        .nav-active { color: var(--neon-blue); background: rgba(0, 210, 255, 0.1); border-left: 3px solid var(--neon-blue); }

        .live-meters { display: flex; gap: 15px; flex-wrap: wrap; }
        .meter { flex: 1; min-width: 140px; text-align: center; border-left: 2px solid var(--neon-blue); }
        .meter-val { font-family: 'Orbitron'; font-size: 20px; color: var(--neon-blue); margin-top: 5px; }

        .vault-hero {
            background: linear-gradient(135deg, #1e293b 0%, #020617 100%);
            border: 1px solid rgba(0, 210, 255, 0.3);
            padding: 25px;
            text-align: center;
        }

        .ai-panel {
            display: grid;
            grid-template-columns: 120px 1fr;
            align-items: center;
            border: 1px solid var(--neon-blue);
            background: rgba(0, 210, 255, 0.03);
        }

        .data-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .data-table th { text-align: left; padding: 12px; color: #64748b; border-bottom: 1px solid #1e293b; }
        .data-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.02); }

        .alert-item { 
            padding: 10px; border-radius: 4px; font-size: 11px; margin-bottom: 10px;
            border-left: 3px solid var(--neon-red); background: rgba(255, 49, 49, 0.05);
        }

        .btn-action {
            background: transparent; border: 1px solid var(--neon-blue); color: #fff;
            padding: 8px 15px; cursor: pointer; font-family: 'Orbitron'; font-size: 10px;
        }
        .btn-action:hover { background: var(--neon-blue); color: #000; }

        .map-container { height: 180px; background: url('https://i.ibb.co/F4pYhX7/map.png') center/cover; border-radius: 4px; border: var(--border); }
        
        /* SCROLLBAR STYLING */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--neon-blue); }
    </style>
</head>
<body>
    <div class="master-container">
        <header>
            <div style="font-family:'Orbitron'; font-weight:700; color:var(--neon-blue); letter-spacing:1px;">
                AI COMMAND CENTER <span style="font-weight:300; font-size:12px; color:#fff;">VERSION 4</span>
            </div>
            <div id="real-clock" style="font-family:'Roboto Mono'; font-size:14px; color:var(--neon-gold);">01 Mar 2026 | 15:58:00 (EAT)</div>
            <div style="display:flex; gap:15px; font-size:11px;">
                <span>System: <b style="color:var(--neon-green)">ACTIVE</b></span>
                <span>Security: <b style="color:var(--neon-red)">HIGH</b></span>
            </div>
        </header>

        <aside class="sidebar">
            <div class="nav-item nav-active" onclick="sfx(1)">Dashboard</div>
            <div class="nav-item" onclick="sfx(2)">Clients Management</div>
            <div class="nav-item" onclick="sfx(3)">Banking Accounts</div>
            <div class="nav-item" onclick="sfx(4)">Global Transfers</div>
            <div class="nav-item" onclick="sfx(5)">Vault Storage</div>
            <div class="nav-item" onclick="sfx(6)">Digital Assets</div>
            <div class="nav-item" onclick="sfx(7)">Security Center</div>
            <div class="nav-item" onclick="sfx(8)">World Map Nodes</div>
            
            <div style="margin-top:auto; padding:15px; background:rgba(255,255,255,0.03); border-radius:8px;">
                <div style="font-size:10px; color:#64748b; margin-bottom:10px;">SYSTEM HEALTH</div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <small>CPU</small><small style="color:var(--neon-green)">43%</small>
                </div>
                <div style="width:100%; height:4px; background:#1e293b;"><div style="width:43%; height:100%; background:var(--neon-green)"></div></div>
                <div style="display:flex; justify-content:space-between; margin:10px 0 5px 0;">
                    <small>MEMORY</small><small style="color:var(--neon-gold)">62%</small>
                </div>
                <div style="width:100%; height:4px; background:#1e293b;"><div style="width:62%; height:100%; background:var(--neon-gold)"></div></div>
            </div>
        </aside>

        <main class="viewport">
            <div class="card" style="padding:10px; display:flex; gap:20px; font-size:10px; color:#94a3b8;">
                <span style="color:var(--neon-green)">● System Engine</span>
                <span style="color:var(--neon-green)">● Security Engine</span>
                <span style="color:var(--neon-blue)">● AI Neural Engine</span>
                <span>● Database Connected</span>
            </div>

            <div class="live-meters">
                <div class="card meter"><small>USERS ONLINE</small><div class="meter-val">1,284</div></div>
                <div class="card meter"><small>TPS RATE</small><div class="meter-val">38 TPS</div></div>
                <div class="card meter"><small>ACTIVE TRANSFERS</small><div class="meter-val">142</div></div>
                <div class="card meter" style="border-left-color:var(--neon-red)"><small>FRAUD ALERTS</small><div class="meter-val" style="color:var(--neon-red)">3</div></div>
            </div>

            <section class="card vault-hero">
                <div style="font-size:12px; color:#94a3b8;">TOTAL BANK MONEY (Main Center)</div>
                <div style="font-family:'Orbitron'; font-size:38px; margin:15px 0;">KES 2,438,920,440</div>
                <div style="display:flex; justify-content:space-around; font-size:12px;">
                    <span style="color:var(--neon-green)">Avail: 1.90B</span>
                    <span style="color:var(--neon-gold)">Res: 200M</span>
                    <span style="color:var(--neon-red)">Frozen: 80M</span>
                    <span style="color:var(--neon-blue)">Moving: 258M</span>
                </div>
            </section>

            <div class="card">
                <strong style="font-size:13px;">LIVE TRANSACTION STREAM</strong>
                <table class="data-table" style="margin-top:15px;">
                    <thead><tr><th>Time</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody>
                        <tr><td>14:35</td><td>Alex T</td><td>Deposit</td><td>KES 20,000</td><td style="color:var(--neon-green)">SUCCESS</td></tr>
                        <tr><td>14:34</td><td>David O</td><td>Withdraw</td><td>KES 15,000</td><td style="color:var(--neon-red)">FAILED</td></tr>
                        <tr><td>14:33</td><td>John K</td><td>Transfer</td><td>KES 5,000</td><td style="color:var(--neon-green)">SUCCESS</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="card ai-panel">
                <div style="text-align:center;">
                    <img src="https://i.ibb.co/Xz90Cyz/ai-bot.png" style="width:80px; filter:drop-shadow(0 0 10px var(--neon-blue));">
                </div>
                <div>
                    <strong style="color:var(--neon-blue)">AI NEURAL SUGGESTIONS</strong>
                    <div style="font-size:12px; margin:10px 0; display:flex; flex-direction:column; gap:5px;">
                        <span>● Server load at <b style="color:var(--neon-gold)">65%</b>. Suggesting optimization.</span>
                        <span>● Transaction volume <b style="color:var(--neon-blue)">+20%</b>. Mesh routing active.</span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-action" style="background:var(--neon-green); border:none; color:#000; font-weight:bold;" onclick="sfx(10)">APPLY FIX</button>
                        <button class="btn-action" onclick="sfx(11)">IGNORE</button>
                        <button class="btn-action" onclick="sfx(12)">ANALYZE</button>
                    </div>
                </div>
            </div>

            <div class="card">
                <strong style="font-size:13px;">SYSTEM LOGS & UPDATES</strong>
                <table class="data-table" style="margin-top:10px;">
                    <tr><th>Time</th><th>Event</th><th>Status</th></tr>
                    <tr><td>14:32</td><td>New Client Registered</td><td style="color:var(--neon-green)">SUCCESS</td></tr>
                    <tr><td>14:30</td><td>Suspicious IP Blocked</td><td style="color:var(--neon-red)">BLOCKED</td></tr>
                </table>
            </div>
        </main>

        <aside class="right-panel">
            <div>
                <strong style="color:var(--neon-red); font-size:13px;">SECURITY ALERTS</strong>
                <div style="margin-top:15px;">
                    <div class="alert-item"><b>Suspicious Login</b><br><small>John Doe - Nairobi Hub</small></div>
                    <div class="alert-item" style="border-left-color:var(--neon-gold)"><b>PIN Attempts Exceeded</b><br><small>User: 0722***890</small></div>
                </div>
                <div style="display:flex; gap:5px;">
                    <button class="btn-action" style="flex:1;" onclick="sfx(13)">INVESTIGATE</button>
                    <button class="btn-action" style="flex:1; border-color:var(--neon-red);" onclick="sfx(14)">BLOCK</button>
                </div>
            </div>

            <div>
                <strong style="font-size:13px;">WORLD ACTIVITY MAP</strong>
                <div class="map-container" style="margin-top:15px;"></div>
            </div>

            <div>
                <strong style="color:var(--neon-gold); font-size:13px;">QUICK ACTIONS</strong>
                <div style="display:grid; gap:8px; margin-top:15px;">
                    <button class="btn-action" onclick="sfx(15)">+ New Client</button>
                    <button class="btn-action" onclick="sfx(9)">+ New Transfer</button>
                    <button class="btn-action" onclick="sfx(5)">Vault Control</button>
                </div>
            </div>

            <div style="margin-top:auto; padding:15px; background:rgba(0,0,0,0.2); border-radius:8px; font-size:11px;">
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:5px;">
                    <div style="width:8px; height:8px; background:var(--neon-green); border-radius:50%;"></div>
                    <span>Admin Online (Manager)</span>
                </div>
                <div style="color:#64748b;">24/7 System Monitor Active</div>
            </div>
        </aside>

        <footer>
            © 2026 GLOBAL DIGITAL BANK | SECURE ENCRYPTED PROTOCOL | POWERED BY AI V4
        </footer>
    </div>

    <script>
        const sfx = (id) => {
            const audio = new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + id + ".mp3");
            audio.play().catch(() => {});
        };

        setInterval(() => {
            const now = new Date();
            document.getElementById('real-clock').innerText = now.toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }) + ' (EAT)';
        }, 1000);
    </script>
</body>
</html>
`);
});

app.listen(3000, () => console.log("Professional Dashboard Active on Port 3000"));
