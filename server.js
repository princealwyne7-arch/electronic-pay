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

        header {
            grid-column: 1 / 4; background: #000; border-bottom: var(--glass-border);
            display: flex; justify-content: space-between; align-items: center; padding: 0 25px; z-index: 1000;
        }
        .header-brand { display: flex; align-items: center; gap: 15px; }
        .logo-box { width: 40px; height: 40px; border: 1px solid var(--neon-blue); display: flex; align-items: center; justify-content: center; transform: rotate(45deg); }
        .logo-box i { transform: rotate(-45deg); font-family: 'Orbitron'; font-size: 20px; color: var(--neon-blue); }
        .header-center { font-family: 'Roboto Mono'; font-size: 14px; color: var(--neon-gold); }

        .sidebar {
            grid-row: 2; background: var(--bg-sidebar); border-right: var(--glass-border);
            padding: 20px 0; display: flex; flex-direction: column; overflow-y: auto;
        }
        .nav-link { padding: 12px 25px; display: flex; align-items: center; gap: 12px; color: #94a3b8; font-size: 13px; cursor: pointer; }
        .nav-active { background: rgba(0, 210, 255, 0.1); color: var(--neon-blue); border-left: 3px solid var(--neon-blue); }

        .workspace { grid-row: 2; padding: 25px; overflow-y: auto; display: flex; flex-direction: column; gap: 30px; background: radial-gradient(circle at top right, #0a192f 0%, #020617 100%); }

        /* OVERLAYS */
        .overlay-gate {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(1, 4, 9, 0.95); z-index: 10000; backdrop-filter: blur(15px);
            align-items: center; justify-content: center;
        }
        .engine-modal {
            width: 850px; background: var(--bg-panel); border: 1px solid var(--neon-blue);
            border-radius: 12px; display: flex; flex-direction: column; box-shadow: 0 0 50px rgba(0, 210, 255, 0.3);
        }
        .modal-header { padding: 25px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 30px; }

        /* TERMINAL SPECIFIC STYLES */
        .terminal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { font-family: 'Orbitron'; font-size: 10px; color: var(--neon-blue); text-transform: uppercase; }
        .terminal-input {
            background: rgba(0,0,0,0.5); border: 1px solid rgba(0, 210, 255, 0.2);
            padding: 12px; color: white; font-family: 'Roboto Mono'; border-radius: 4px;
        }
        .terminal-input:focus { border-color: var(--neon-blue); box-shadow: 0 0 10px rgba(0, 210, 255, 0.2); }
        
        .bank-feature-row {
            display: grid; grid-template-columns: 200px 1fr 140px; align-items: center;
            padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); gap: 20px;
        }

        .status-msg { font-family: 'Roboto Mono'; font-size: 12px; margin-top: 20px; padding: 15px; border-radius: 4px; display: none; }

        .btn-core { padding: 10px 20px; background: transparent; border: 1px solid var(--neon-blue); color: white; font-family: 'Orbitron'; font-size: 10px; cursor: pointer; transition: 0.3s; }
        .btn-core:hover { background: var(--neon-blue); color: black; }
        .btn-danger { border-color: var(--neon-red); color: var(--neon-red); }
    </style>
</head>
<body>
    <div class="app-shell">
        <header>
            <div class="header-brand"><div class="logo-box"><i>B</i></div><div style="font-family:'Orbitron';">AI COMMAND CENTER V4</div></div>
            <div class="header-center" id="main-timer">CONNECTING...</div>
            <div class="admin-profile"><div class="avatar"></div></div>
        </header>

        <aside class="sidebar">
            <div class="nav-link nav-active">Dashboard</div>
            <div class="nav-link" onclick="openBanking()">Transfers & Wire</div>
            <div class="nav-link">Vault Storage</div>
            <div class="nav-link">Security Gateway</div>
            <div class="health-module" style="margin-top:auto; padding:20px;">
                <div style="font-size:10px; color:#475569; margin-bottom:10px;">SYSTEM HEALTH</div>
                <div style="height:4px; background:#1e293b; border-radius:2px;"><div style="width:65%; height:100%; background:var(--neon-green)"></div></div>
            </div>
        </aside>

        <main class="workspace">
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:20px;">
                <div style="background:var(--bg-panel); padding:20px; border:var(--glass-border); border-radius:8px; text-align:center;">
                    <div style="font-size:10px; color:#94a3b8;">LIQUID ASSETS</div>
                    <div style="font-family:'Orbitron'; font-size:20px; color:var(--neon-green); margin-top:5px;">KES 2.43B</div>
                </div>
                </div>
        </main>

        <aside style="grid-row:2; background:#010409; border-left:var(--glass-border); padding:20px;"></aside>

        <footer>© 2026 GLOBAL DIGITAL BANK | POWERED BY AI V4 PRO</footer>
    </div>

    <div id="banking-overlay" class="overlay-gate">
        <div class="engine-modal">
            <div class="modal-header">
                <h2 style="font-family:'Orbitron'; color:var(--neon-blue); margin:0;">BANKING GATEWAY</h2>
                <button onclick="closeBanking()" class="btn-core btn-danger">EXIT</button>
            </div>
            <div class="modal-body">
                <div class="bank-feature-row">
                    <div><div style="font-family:Orbitron;">SEND MONEY</div><small>Node 04</small></div>
                    <div style="font-size:11px; color:#64748b;">Instant Society-to-Bank Protocol</div>
                    <button class="btn-core" onclick="openTerminal('SEND')">ACTIVATE</button>
                </div>
                <div class="bank-feature-row">
                    <div><div style="font-family:Orbitron; color:var(--neon-red);">EXTERNAL WIRE</div><small>SWIFT</small></div>
                    <div style="font-size:11px; color:#64748b;">RTGS Global Node Asset Tunnel</div>
                    <button class="btn-core" style="border-color:var(--neon-red); color:var(--neon-red);" onclick="openTerminal('WIRE')">INITIATE</button>
                </div>
                <div class="bank-feature-row">
                    <div><div style="font-family:Orbitron; color:var(--neon-gold);">STK PUSH</div><small>Paynecta</small></div>
                    <button class="btn-core" style="background:var(--neon-gold); color:black; border:none;" onclick="stkEngine()">EXECUTE</button>
                </div>
            </div>
        </div>
    </div>

    <div id="terminal-overlay" class="overlay-gate">
        <div class="engine-modal" style="width:600px;">
            <div class="modal-header">
                <h2 id="term-title" style="font-family:'Orbitron'; color:var(--neon-blue); margin:0;">TERMINAL</h2>
                <button onclick="closeTerminal()" class="btn-core btn-danger">CANCEL</button>
            </div>
            <div class="modal-body">
                <div class="terminal-grid">
                    <div class="input-group">
                        <label>Source Node</label>
                        <input type="text" class="terminal-input" id="src-node" value="VAULT_01_CORE" readonly>
                    </div>
                    <div class="input-group">
                        <label>Destination Account</label>
                        <input type="text" class="terminal-input" id="dest-acc" placeholder="ACC_NUMBER/PHONE">
                    </div>
                    <div class="input-group">
                        <label>Currency/Asset</label>
                        <select class="terminal-input" id="asset-type">
                            <option>KES - Fiat</option>
                            <option>USD - Fiat</option>
                            <option>BTC - Digital</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Amount</label>
                        <input type="number" class="terminal-input" id="trans-amt" placeholder="0.00">
                    </div>
                </div>
                <div id="terminal-status" class="status-msg"></div>
                <button class="btn-core" id="proc-btn" style="width:100%; margin-top:30px; height:50px; background:var(--neon-blue); color:black; font-weight:bold;" onclick="processTransfer()">EXECUTE SECURE TRANSACTION</button>
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
        
        // TERMINAL LOGIC
        function openTerminal(type) {
            play(4);
            document.getElementById('term-title').innerText = type + " TERMINAL ACTIVE";
            document.getElementById('terminal-overlay').style.display = 'flex';
        }

        function closeTerminal() {
            document.getElementById('terminal-overlay').style.display = 'none';
            document.getElementById('terminal-status').style.display = 'none';
        }

        function processTransfer() {
            const amt = document.getElementById('trans-amt').value;
            const dest = document.getElementById('dest-acc').value;
            if(!amt || !dest) return alert("Missing Parameters");

            play(11);
            const status = document.getElementById('terminal-status');
            const btn = document.getElementById('proc-btn');
            
            status.style.display = 'block';
            status.style.background = 'rgba(0, 210, 255, 0.1)';
            status.style.color = 'var(--neon-blue)';
            btn.disabled = true;
            btn.innerText = "ENCRYPTING...";

            let steps = ["[SECURE_HANDSHAKE]...", "[AUTH_NODE_VALIDATED]...", "[BLOCKCHAIN_CONFIRMATION]...", "[ASSET_MIGRATED]"];
            let i = 0;
            let interval = setInterval(() => {
                status.innerText = steps[i];
                i++;
                if(i >= steps.length) {
                    clearInterval(interval);
                    status.style.background = 'rgba(57, 255, 20, 0.1)';
                    status.style.color = 'var(--neon-green)';
                    status.innerText = "TRANSACTION SUCCESSFUL - HASH: " + Math.random().toString(36).substring(7).toUpperCase();
                    btn.innerText = "DONE";
                    play(1);
                }
            }, 1000);
        }

        function stkEngine() { 
            play(11);
            const p = prompt("PHONE:"); const a = prompt("AMOUNT:");
            if(p && a) alert("PAYNECTA: Sending prompt to " + p);
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
