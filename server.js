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

        .app-shell {
            display: grid;
            grid-template-columns: var(--sidebar-width) 1fr var(--right-panel-width);
            grid-template-rows: var(--header-h) 1fr 35px;
            height: 100vh;
            width: 100vw;
        }

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

        .workspace {
            grid-row: 2;
            background: radial-gradient(circle at top right, #0a192f 0%, #020617 100%);
            padding: 25px;
            overflow-y: scroll;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }

        /* RESTORED GRID METERS */
        .grid-meters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .meter-card { background: var(--bg-panel); border: var(--glass-border); padding: 20px; border-radius: 8px; text-align: center; }
        .meter-value { font-family: 'Orbitron'; font-size: 24px; color: var(--neon-blue); margin-top: 10px; }

        /* RESTORED VAULT CORE */
        .vault-core {
            background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
            border: 1px solid rgba(0, 210, 255, 0.4);
            border-radius: 12px; padding: 40px; text-align: center;
        }
        .vault-total { font-family: 'Orbitron'; font-size: 48px; margin: 20px 0; text-shadow: 0 0 20px rgba(0, 210, 255, 0.4); }
        .vault-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 30px; }
        .v-box { padding: 15px; background: rgba(0,0,0,0.4); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }

        /* --- 4. RIGHT SECURITY PANEL (RESTORED) --- */
        .security-side {
            grid-row: 2; background: rgba(1, 4, 9, 0.8); border-left: var(--glass-border);
            padding: 25px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 30px;
        }
        .map-frame { height: 180px; width: 100%; border-radius: 8px; background: #000 url('https://i.ibb.co/F4pYhX7/map.png') center/cover; position: relative; }
        .map-blip { position: absolute; width: 6px; height: 6px; background: var(--neon-green); border-radius: 50%; animation: blip 2s infinite; }

        /* --- NEW SCROLLABLE BANKING ENGINE LOGIC --- */
        #banking-engine {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(1, 4, 9, 0.98); z-index: 10000; backdrop-filter: blur(25px);
            align-items: center; justify-content: center;
        }
        .engine-content {
            width: 800px; height: 80vh; background: var(--bg-panel); border: 1px solid var(--neon-blue);
            border-radius: 12px; padding: 45px; display: flex; flex-direction: column;
        }
        .scrollable-features {
            flex: 1; overflow-y: auto; padding-right: 15px; margin-top: 20px;
        }
        .logic-row {
            display: grid; grid-template-columns: 200px 1fr 140px; align-items: center;
            padding: 25px; border-bottom: 1px solid rgba(255,255,255,0.05); gap: 20px;
        }

        .btn-core {
            padding: 10px 20px; background: transparent; border: 1px solid var(--neon-blue);
            color: white; font-family: 'Orbitron'; font-size: 10px; cursor: pointer; transition: 0.3s;
        }
        .btn-core:hover { background: var(--neon-blue); color: black; }

        footer { grid-column: 1 / 4; background: #000; border-top: var(--glass-border); display: flex; justify-content: center; align-items: center; font-size: 11px; color: #475569; }
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
            <div class="header-center" id="main-timer">... INITIALIZING ...</div>
            <div class="admin-profile">
                <div style="text-align:right"><div style="font-weight:bold">Admin: Manager</div><div style="font-size:10px; color:var(--neon-green)">● ONLINE</div></div>
                <div class="avatar"></div>
            </div>
        </header>

        <aside class="sidebar">
            <div class="menu-label">Main Navigation</div>
            <div class="nav-link nav-active" onclick="play(1)">Dashboard</div>
            <div class="nav-link" onclick="play(2)">Clients Management</div>
            <div class="nav-link" onclick="openBankingEngine()" style="color:var(--neon-blue); font-weight:bold; border-left:3px solid var(--neon-blue);">Transfers & Wire</div>
            <div class="nav-link" onclick="play(5)">Vault Storage</div>
            <div class="nav-link" onclick="play(8)">AI Neural Center</div>
            <div class="nav-link" onclick="play(13)">World Activity</div>
            <div class="nav-link" onclick="play(15)">Master Settings</div>
            
            <div class="health-module">
                <div class="stat-row"><span>CPU</span><span>43%</span></div>
                <div class="progress-bg"><div class="progress-fill" style="width:43%; background:var(--neon-green)"></div></div>
                <div class="stat-row"><span>RAM</span><span>62%</span></div>
                <div class="progress-bg"><div class="progress-fill" style="width:62%; background:var(--neon-gold)"></div></div>
            </div>
        </aside>

        <main class="workspace">
            <div class="grid-meters">
                <div class="meter-card"><div class="meter-label">Users</div><div class="meter-value" id="user-sync">1,284</div></div>
                <div class="meter-card"><div class="meter-label">TPS</div><div class="meter-value">38</div></div>
                <div class="meter-card"><div class="meter-label">Active</div><div class="meter-value">142</div></div>
                <div class="meter-card" style="border-color:var(--neon-red)"><div style="color:var(--neon-red)">Alerts</div><div class="meter-value" style="color:var(--neon-red)">3</div></div>
            </div>

            <section class="vault-core">
                <div style="font-size:12px; color:#94a3b8; letter-spacing:2px;">TOTAL BANK LIQUIDITY</div>
                <div class="vault-total">KES 2,438,920,440</div>
                <div class="vault-grid">
                    <div class="v-box"><div style="color:var(--neon-green)">1.90B</div><small>Available</small></div>
                    <div class="v-box"><div style="color:var(--neon-gold)">200M</div><small>Reserved</small></div>
                    <div class="v-box"><div style="color:var(--neon-red)">80M</div><small>Frozen</small></div>
                    <div class="v-box"><div style="color:var(--neon-blue)">258.9M</div><small>Moving</small></div>
                </div>
            </section>

            <div class="ai-neural-card">
                <div class="ai-visual"></div>
                <div class="ai-logic-stream">
                    <div class="logic-item" style="border-color:var(--neon-red)">Fraud risk rising in mobile transfers.</div>
                    <div class="logic-item" style="border-color:var(--neon-blue)">Volume +20% from baseline.</div>
                    <button class="btn-core" style="margin-top:10px" onclick="play(11)">APPLY AI FIX</button>
                </div>
            </div>
        </main>

        <aside class="security-side">
            <div class="section-header" style="color:var(--neon-red)">SECURITY ALERTS</div>
            <div class="alert-card"><b style="color:var(--neon-red)">Suspicious Login</b><br><small>Nairobi Hub</small></div>
            <div class="map-frame"><div class="map-blip" style="top:40%; left:20%"></div></div>
            <button class="btn-core" style="width:100%; border-color:var(--neon-gold); color:var(--neon-gold)" onclick="openBankingEngine()">SOCIETY GATEWAY</button>
        </aside>

        <footer>© 2026 GLOBAL DIGITAL BANK | POWERED BY AI V4 PRO</footer>
    </div>

    <div id="banking-engine">
        <div class="engine-content">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h2 style="font-family:'Orbitron'; color:var(--neon-blue); margin:0;">SOCIETY BANKING GATEWAY</h2>
                <button onclick="closeBankingEngine()" style="background:var(--neon-red); color:white; border:none; padding:8px 20px; font-family:Orbitron; cursor:pointer;">RETURN TO CENTER</button>
            </div>

            <div class="scrollable-features">
                <div class="logic-row">
                    <div><div style="font-family:Orbitron;">SEND MONEY</div><small style="color:var(--neon-blue)">Node 04</small></div>
                    <div style="font-size:11px; color:#64748b;">Instant Society-to-Bank Global Remittance</div>
                    <button class="btn-core" onclick="play(4)">ACTIVATE</button>
                </div>
                <div class="logic-row">
                    <div><div style="font-family:Orbitron;">RECEIVE</div><small style="color:var(--neon-blue)">Node 05</small></div>
                    <div style="font-size:11px; color:#64748b;">Merchant Inbound Data Protocol Gateway</div>
                    <button class="btn-core" onclick="play(5)">OPEN</button>
                </div>
                <div class="logic-row" style="background:rgba(57, 255, 20, 0.05); border-left:3px solid var(--neon-green);">
                    <div><div style="font-family:Orbitron; color:var(--neon-green);">STK PUSH</div><small>Paynecta</small></div>
                    <div style="font-size:11px; color:#64748b;">Direct Mobile Society Prompt Trigger</div>
                    <button class="btn-core" style="background:var(--neon-green); color:black; border:none;" onclick="stkLogic()">EXECUTE</button>
                </div>
                <div class="logic-row">
                    <div><div style="font-family:Orbitron;">INTERNAL</div><small style="color:var(--neon-blue)">Node 01</small></div>
                    <div style="font-size:11px; color:#64748b;">System Cross-Vault Asset Synchronization</div>
                    <button class="btn-core" onclick="play(1)">TRANSFER</button>
                </div>
                <div class="logic-row">
                    <div><div style="font-family:Orbitron; color:var(--neon-red);">EXTERNAL WIRE</div><small>SWIFT</small></div>
                    <div style="font-size:11px; color:#64748b;">RTGS Global Banking Asset Tunnel</div>
                    <button class="btn-core" style="border-color:var(--neon-red); color:var(--neon-red);" onclick="play(2)">WIRE</button>
                </div>
                <div class="logic-row">
                    <div><div style="font-family:Orbitron;">CRYPTO GATE</div><small>Node 09</small></div>
                    <div style="font-size:11px; color:#64748b;">Blockchain Ledger Asset Migration</div>
                    <button class="btn-core" onclick="play(6)">BRIDGE</button>
                </div>
                <div class="logic-row">
                    <div><div style="font-family:Orbitron;">ESCROW LOGIC</div><small>Node 12</small></div>
                    <div style="font-size:11px; color:#64748b;">Smart Contract Holding Account</div>
                    <button class="btn-core" onclick="play(7)">HOLD</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const play = (id) => {
            const sfx = new Audio(\`https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_\${id}.mp3\`);
            sfx.volume = 0.4; sfx.play().catch(e => {});
        };

        // NAVIGATION LOGIC
        function openBankingEngine() { 
            play(4); 
            document.getElementById('banking-engine').style.display = 'flex'; 
        }
        function closeBankingEngine() { 
            play(10); // Return sound
            document.getElementById('banking-engine').style.display = 'none'; 
        }
        
        function stkLogic() {
            play(11);
            const p = prompt("PHONE NUMBER:");
            const a = prompt("AMOUNT (KES):");
            if(p && a) alert("STK PUSH Sent to " + p);
        }

        setInterval(() => {
            document.getElementById('main-timer').innerText = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }) + ' (EAT)';
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
