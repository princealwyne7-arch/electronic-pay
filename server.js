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
    <title>AI COMMAND CENTER V4 - TERMINAL ACTIVE</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono:wght@400;700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
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

        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
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
        }

        /* FIXED HEADER */
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

        /* FIXED SIDEBAR */
        .sidebar {
            grid-row: 2;
            background: var(--bg-sidebar);
            border-right: var(--glass-border);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        }

        /* SCROLLABLE MAIN ENGINE (Sideways & Vertical) */
        .workspace {
            grid-row: 2;
            background: radial-gradient(circle at center, #0a192f 0%, #020617 100%);
            padding: 25px;
            overflow-y: scroll;
            overflow-x: auto; 
            display: flex;
            flex-direction: column;
            gap: 25px;
        }

        /* SCROLLABLE SECURITY PANEL */
        .security-side {
            grid-row: 2;
            background: rgba(1, 4, 9, 0.9);
            border-left: var(--glass-border);
            padding: 20px;
            overflow-y: auto;
        }

        /* MODULES & CARDS */
        .card { 
            background: var(--bg-panel); 
            border: var(--glass-border); 
            border-radius: 8px; 
            padding: 20px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        /* COMMAND TERMINAL MODULE */
        .terminal-module {
            background: #000;
            border: 1px solid var(--neon-blue);
            font-family: 'Roboto Mono', monospace;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
        }
        .terminal-input-row { display: flex; align-items: center; gap: 10px; color: var(--neon-green); }
        .terminal-input {
            background: transparent; border: none; color: white; width: 100%;
            font-family: 'Roboto Mono'; font-size: 14px; outline: none;
        }

        /* STYLING HELPERS */
        .nav-link { padding: 12px 20px; font-size: 13px; color: #94a3b8; cursor: pointer; transition: 0.2s; border-left: 3px solid transparent; }
        .nav-link:hover { background: rgba(0, 210, 255, 0.05); color: var(--neon-blue); }
        .nav-active { color: var(--neon-blue); background: rgba(0, 210, 255, 0.1); border-left: 3px solid var(--neon-blue); }

        .vault-total { font-family: 'Orbitron'; font-size: 42px; text-align: center; margin: 20px 0; color: #fff; }
        
        .sys-table { width: 100%; border-collapse: collapse; min-width: 600px; }
        .sys-table th { text-align: left; padding: 12px; color: #64748b; border-bottom: 1px solid #1e293b; }
        .sys-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.02); }

        .btn-core { 
            padding: 8px 16px; background: transparent; border: 1px solid var(--neon-blue); 
            color: white; font-family: 'Orbitron'; font-size: 10px; cursor: pointer; 
        }
        .btn-core:hover { background: var(--neon-blue); color: black; }
    </style>
</head>
<body>
    <div class="app-shell">
        <header>
            <div style="font-family:'Orbitron'; color:var(--neon-blue); font-size:18px;">AI COMMAND CENTER V4</div>
            <div id="real-clock" style="font-family:'Roboto Mono'; color:var(--neon-gold);">01 MAR 2026 | 16:30:05 (EAT)</div>
            <div style="font-size:11px; color:var(--neon-green)">NETWORK: FAST | DB: SYNCED</div>
        </header>

        <aside class="sidebar">
            <div class="nav-link nav-active" onclick="sfx(1)">Dashboard</div>
            <div class="nav-link" onclick="sfx(2)">Clients</div>
            <div class="nav-link" onclick="sfx(3)">Accounts</div>
            <div class="nav-link" onclick="sfx(4)">Transfers</div>
            <div class="nav-link" onclick="sfx(5)">Vault Control</div>
            <div class="nav-link" onclick="sfx(8)">AI Neural Logic</div>
            <div class="nav-link" onclick="sfx(10)">Security Nodes</div>
            
            <div style="margin-top:auto; padding:20px; background:rgba(255,255,255,0.02);">
                <small>SYSTEM HEALTH</small>
                <div style="height:4px; background:#1e293b; margin:10px 0;"><div style="width:43%; height:100%; background:var(--neon-green)"></div></div>
                <div style="display:flex; justify-content:space-between; font-size:10px;"><span>CPU: 43%</span><span>MEM: 62%</span></div>
            </div>
        </aside>

        <main class="workspace">
            <div class="card" style="display:flex; justify-content:space-around; text-align:center;">
                <div><small>USERS</small><div style="font-family:Orbitron; font-size:20px; color:var(--neon-blue)">1,284</div></div>
                <div><small>TPS</small><div style="font-family:Orbitron; font-size:20px; color:var(--neon-blue)">38</div></div>
                <div><small>ALERTS</small><div style="font-family:Orbitron; font-size:20px; color:var(--neon-red)">3</div></div>
            </div>

            <section class="card">
                <div style="text-align:center; font-size:12px; color:#64748b;">TOTAL BANK LIQUIDITY</div>
                <div class="vault-total">KES 2,438,920,440</div>
                <div style="display:flex; justify-content:space-between; font-size:11px;">
                    <span style="color:var(--neon-green)">AVAILABLE: 1.9B</span>
                    <span style="color:var(--neon-red)">FROZEN: 80M</span>
                </div>
            </section>

            <div class="card">
                <strong style="font-size:13px; color:var(--neon-blue)">LIVE TRANSACTION STREAM</strong>
                <table class="sys-table">
                    <thead><tr><th>Time</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
                    <tbody id="stream-body">
                        <tr><td>16:30</td><td>Alex T</td><td>Deposit</td><td>KES 20,000</td><td style="color:var(--neon-green)">SUCCESS</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="card" style="display:grid; grid-template-columns: 120px 1fr; align-items:center; border-color:var(--neon-blue)">
                <img src="https://i.ibb.co/Xz90Cyz/ai-bot.png" style="width:100px;">
                <div>
                    <strong>AI DECISION ENGINE</strong>
                    <div style="font-size:12px; margin:10px 0;">Neural Analysis: <span style="color:var(--neon-gold)">Server load optimization required.</span></div>
                    <button class="btn-core" onclick="sfx(11)">APPLY FIX</button>
                </div>
            </div>

            <div class="terminal-module">
                <div id="terminal-output" style="font-size:12px; margin-bottom:10px; color:#64748b;">SYSTEM READY. WAITING FOR COMMAND...</div>
                <div class="terminal-input-row">
                    <span>></span>
                    <input type="text" id="term-input" class="terminal-input" placeholder="ENTER COMMAND (e.g. BLOCK USER)..." onkeypress="handleCommand(event)">
                </div>
            </div>
        </main>

        <aside class="security-side">
            <strong style="color:var(--neon-red)">SECURITY ALERTS</strong>
            <div style="padding:15px; border:1px solid var(--neon-red); background:rgba(255,0,0,0.05); border-radius:4px; margin-top:15px; font-size:12px;">
                <b>Suspicious Login</b><br><small>Nairobi Hub - Node 7</small>
            </div>
            
            <div style="height:150px; background:url('https://i.ibb.co/F4pYhX7/map.png') center/cover; margin:20px 0; border:1px solid rgba(255,255,255,0.1);"></div>

            <strong style="color:var(--neon-gold)">QUICK ACTIONS</strong>
            <div style="display:grid; gap:10px; margin-top:15px;">
                <button class="btn-core" onclick="sfx(13)">+ NEW CLIENT</button>
                <button class="btn-core" onclick="sfx(14)">VAULT ACCESS</button>
            </div>
        </aside>

        <footer>© 2026 GLOBAL DIGITAL BANK | ENCRYPTED V4 | ALL ENGINES ACTIVE</footer>
    </div>

    <script>
        const sfx = (id) => {
            new Audio(\`https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_\${id}.mp3\`).play().catch(()=>{});
        };

        function handleCommand(e) {
            if (e.key === 'Enter') {
                const cmd = e.target.value.toUpperCase();
                const out = document.getElementById('terminal-output');
                sfx(10); 
                
                if (cmd === 'BLOCK USER') {
                    out.innerHTML = "<span style='color:var(--neon-red)'>PROTOCOL INITIATED: USER ACCOUNT LOCKED.</span>";
                    sfx(14);
                } else if (cmd === 'CLEAR LOGS') {
                    out.innerHTML = "<span style='color:var(--neon-blue)'>FLUSHING SYSTEM LOGS... DONE.</span>";
                } else {
                    out.innerHTML = "COMMAND NOT RECOGNIZED. ACCESSING MANUAL...";
                }
                e.target.value = '';
            }
        }

        setInterval(() => {
            const now = new Date();
            document.getElementById('real-clock').innerText = now.toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }) + ' (EAT)';
        }, 1000);
    </script>
</body>
</html>
`);
});

app.listen(3000, () => console.log("System V4 Engine & Terminal Ready"));
