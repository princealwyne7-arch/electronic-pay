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

        .vault-core {
            background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
            border: 1px solid rgba(0, 210, 255, 0.4);
            border-radius: 12px; padding: 40px; text-align: center; position: relative;
        }
        .vault-total { font-family: 'Orbitron'; font-size: 48px; margin: 20px 0; text-shadow: 0 0 20px rgba(0, 210, 255, 0.4); }
        .vault-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 30px; }
        .v-box { padding: 15px; background: rgba(0,0,0,0.4); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }

        .section-header { font-family: 'Orbitron'; font-size: 14px; color: var(--neon-blue); margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        .data-wrap { background: var(--bg-panel); border: var(--glass-border); border-radius: 8px; overflow: hidden; }
        .sys-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .sys-table th { background: rgba(0,0,0,0.4); text-align: left; padding: 15px; color: #64748b; font-weight: 500; }
        .sys-table td { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .status-pill { padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: bold; }

        .ai-neural-card {
            background: rgba(0, 210, 255, 0.02); border: 1px solid var(--neon-blue); border-radius: 12px;
            display: grid; grid-template-columns: 200px 1fr; padding: 30px; gap: 30px; position: relative;
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

        .security-side {
            grid-row: 2; background: rgba(1, 4, 9, 0.8); border-left: var(--glass-border);
            padding: 25px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 30px; z-index: 500;
        }
        .alert-card { background: rgba(255, 49, 49, 0.05); border: 1px solid var(--neon-red); padding: 15px; border-radius: 8px; margin-bottom: 15px; position: relative; }
        .map-frame { height: 200px; width: 100%; border-radius: 8px; border: var(--glass-border); background: #000 url('https://i.ibb.co/F4pYhX7/map.png') center/cover; position: relative; }
        .map-blip { position: absolute; width: 6px; height: 6px; background: var(--neon-green); border-radius: 50%; box-shadow: 0 0 10px var(--neon-green); animation: blip 2s infinite; }

        /* OVERLAYS */
        #banking-overlay, #assets-overlay, #clients-overlay {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(1, 4, 9, 0.98); z-index: 10000; backdrop-filter: blur(20px);
            align-items: center; justify-content: center;
        }
        .engine-modal {
            width: 900px; max-height: 85vh; background: var(--bg-panel); border: 1px solid var(--neon-blue);
            border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 0 50px rgba(0, 210, 255, 0.2);
        }
        .modal-header { padding: 25px 35px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .modal-body { flex: 1; overflow-y: auto; padding: 25px 35px; }
        
        .client-search-bar { width: 100%; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 5px; margin-bottom: 20px; font-family: 'Roboto Mono'; }

        footer { grid-column: 1 / 4; background: #000; border-top: var(--glass-border); display: flex; justify-content: center; align-items: center; font-size: 11px; color: #475569; }

        .btn-core { padding: 10px 20px; background: transparent; border: 1px solid var(--neon-blue); color: white; font-family: 'Orbitron'; font-size: 10px; cursor: pointer; transition: 0.3s; }
        .btn-core:hover { background: var(--neon-blue); color: black; }
        .btn-danger { border-color: var(--neon-red); color: var(--neon-red); }
        .btn-success { border-color: var(--neon-green); color: var(--neon-green); }
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
            <div class="header-center" id="main-timer">INITIALIZING SYSTEM...</div>
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
            <div class="nav-link" onclick="openClients()" style="color:var(--neon-green); font-weight:bold; border-left:3px solid var(--neon-green);">Clients Management</div>
            <div class="nav-link" onclick="play(3)">Banking Accounts</div>
            <div class="nav-link" onclick="openBanking()" style="color:var(--neon-blue); font-weight:bold; border-left:3px solid var(--neon-blue);">Transfers & Wire</div>
            <div class="nav-link" onclick="play(5)">Vault Storage</div>
            <div class="nav-link" onclick="openAssets()" style="color:var(--neon-gold); font-weight:bold; border-left:3px solid var(--neon-gold);">Digital Assets</div>
            <div class="nav-link" onclick="play(7)">Transaction History</div>
            <div class="nav-link" onclick="play(8)">AI Neural Center</div>
            <div class="nav-link" onclick="play(10)">Security Gateway</div>
            <div class="nav-link" onclick="play(12)">System Reports</div>
            <div class="nav-link" onclick="play(13)">World Map Activity</div>
            <div class="nav-link" onclick="play(14)">Automation Tasks</div>
            <div class="nav-link" onclick="play(15)">Master Settings</div>
        </aside>

        <main class="workspace">
            <div class="conn-bar">
                <span><span class="conn-dot" style="background:var(--neon-green)"></span>System Engine</span>
                <span style="color:var(--neon-green); margin-left:auto">● LIVE DATA STREAM ACTIVE</span>
            </div>
            <div class="grid-meters">
                <div class="meter-card"><div class="meter-label">Total Clients</div><div class="meter-value" id="total-clients-stat">1,284</div></div>
                <div class="meter-card"><div class="meter-label">Active Nodes</div><div class="meter-value">98%</div></div>
                <div class="meter-card"><div class="meter-label">Liquidity Status</div><div class="meter-value" style="color:var(--neon-green)">HEALTHY</div></div>
                <div class="meter-card"><div class="meter-label">System Tier</div><div class="meter-value">V4 PRO</div></div>
            </div>
        </main>
        
        <footer>© 2026 GLOBAL DIGITAL BANK | ENCRYPTED QUANTUM PROTOCOL</footer>
    </div>

    <div id="clients-overlay">
        <div class="engine-modal" style="border-color:var(--neon-green)">
            <div class="modal-header">
                <h2 style="font-family:'Orbitron'; color:var(--neon-green); margin:0;">CLIENT DATA ENGINE</h2>
                <div style="display:flex; gap:10px;">
                    <button class="btn-core btn-success" onclick="play(11); alert('Open Create Form')">+ NEW CLIENT</button>
                    <button onclick="closeClients()" class="btn-core btn-danger">EXIT</button>
                </div>
            </div>
            <div class="modal-body">
                <input type="text" class="client-search-bar" placeholder="SEARCH BY NAME, ACC, OR PHONE..." onkeyup="searchClients(this.value)">
                <div class="data-wrap">
                    <table class="sys-table">
                        <thead>
                            <tr><th>Client Name</th><th>Account No</th><th>Phone</th><th>Balance</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody id="clients-table-body">
                            <tr>
                                <td>ALEX TRENTON</td>
                                <td>882033910</td>
                                <td>+254 712 345 678</td>
                                <td style="color:var(--neon-green)">KES 1.2M</td>
                                <td><span class="status-pill" style="background:rgba(57,255,20,0.1); color:var(--neon-green)">ACTIVE</span></td>
                                <td><button class="btn-core" style="font-size:8px">MANAGE</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <div id="banking-overlay">...</div>
    <div id="assets-overlay">...</div>

    <script>
        const play = (id) => {
            const sfx = new Audio(\`https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_\${id}.mp3\`);
            sfx.volume = 0.4;
            sfx.play().catch(e => {});
        };

        function openClients() { play(2); document.getElementById('clients-overlay').style.display = 'flex'; }
        function closeClients() { play(10); document.getElementById('clients-overlay').style.display = 'none'; }
        
        function openBanking() { play(4); document.getElementById('banking-overlay').style.display = 'flex'; }
        function closeBanking() { play(10); document.getElementById('banking-overlay').style.display = 'none'; }
        
        function openAssets() { play(6); document.getElementById('assets-overlay').style.display = 'flex'; }
        function closeAssets() { play(10); document.getElementById('assets-overlay').style.display = 'none'; }

        function searchClients(query) {
            console.log("Searching for: " + query);
            // Dynamic filtering logic would go here
        }

        setInterval(() => {
            document.getElementById('main-timer').innerText = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }) + ' (EAT)';
        }, 1000);
    </script>
</body>
</html>
`);
});

app.listen(3000, () => console.log("System Engine V4 Pro Online"));
