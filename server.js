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
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--neon-blue); border-radius: 10px; }

        body, html { 
            margin: 0; padding: 0; width: 100vw; height: 100vh; 
            background: var(--bg-deep); color: #f8fafc; 
            font-family: 'Inter', sans-serif; overflow: hidden; 
        }

        /* MASTER GRID LAYOUT */
        .app-shell {
            display: grid;
            grid-template-columns: var(--sidebar-width) 1fr var(--right-panel-width);
            grid-template-rows: var(--header-h) 1fr 35px;
            height: 100vh;
        }

        header {
            grid-column: 1 / 4; background: #000; border-bottom: var(--glass-border);
            display: flex; justify-content: space-between; align-items: center; padding: 0 25px; z-index: 1000;
        }
        
        .sidebar {
            grid-row: 2; background: var(--bg-sidebar); border-right: var(--glass-border);
            padding: 20px 0; display: flex; flex-direction: column; overflow-y: auto;
        }

        .workspace {
            grid-row: 2; padding: 25px; overflow-y: auto; display: flex; flex-direction: column; gap: 25px;
            background: radial-gradient(circle at top right, #0a192f 0%, #020617 100%);
        }

        .security-side {
            grid-row: 2; background: #010409; border-left: var(--glass-border); padding: 20px; overflow-y: auto;
        }

        /* --- UI COMPONENTS FROM IMAGE --- */
        .conn-bar { 
            display: flex; gap: 20px; font-size: 11px; color: #64748b; font-family: 'Roboto Mono';
            padding: 12px 20px; background: rgba(0,0,0,0.3); border-radius: 6px; border: var(--glass-border);
        }
        .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

        .vault-core {
            background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
            border: 1px solid rgba(0, 210, 255, 0.4); border-radius: 12px; padding: 30px; text-align: center;
        }

        .nav-link { 
            padding: 12px 25px; display: flex; align-items: center; gap: 12px; 
            color: #94a3b8; font-size: 13px; cursor: pointer; transition: 0.2s;
        }
        .nav-link:hover { color: var(--neon-blue); background: rgba(0, 210, 255, 0.05); }
        .nav-active { color: var(--neon-blue); background: rgba(0, 210, 255, 0.1); border-left: 3px solid var(--neon-blue); }

        /* --- TERMINAL & MODAL OVERLAYS --- */
        .overlay-gate {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(1, 4, 9, 0.98); z-index: 9999; backdrop-filter: blur(20px);
            align-items: center; justify-content: center;
        }
        .engine-modal {
            width: 800px; max-height: 90vh; background: var(--bg-panel); 
            border: 1px solid var(--neon-blue); border-radius: 12px; overflow: hidden;
            box-shadow: 0 0 100px rgba(0, 210, 255, 0.3);
        }
        .modal-header { padding: 20px 30px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; }
        .modal-body { padding: 30px; overflow-y: auto; }

        .terminal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .term-input { 
            width: 100%; background: #000; border: 1px solid #1e293b; padding: 12px; 
            color: var(--neon-green); font-family: 'Roboto Mono'; border-radius: 4px;
        }

        .btn-core { padding: 10px 20px; background: transparent; border: 1px solid var(--neon-blue); color: #fff; font-family: 'Orbitron'; font-size: 10px; cursor: pointer; }
        .btn-core:hover { background: var(--neon-blue); color: #000; }
        
        footer { grid-column: 1 / 4; background: #000; border-top: var(--glass-border); display: flex; justify-content: center; align-items: center; font-size: 10px; color: #475569; }
    </style>
</head>
<body>
    <div class="app-shell">
        <header>
            <div style="display:flex; align-items:center; gap:15px;">
                <div style="width:35px; height:35px; border:1px solid var(--neon-blue); display:flex; align-items:center; justify-content:center; transform:rotate(45deg);">
                    <i style="transform:rotate(-45deg); font-family:Orbitron; color:var(--neon-blue);">B</i>
                </div>
                <div>
                    <div style="font-family:Orbitron; font-size:16px;">AI COMMAND CENTER</div>
                    <div style="font-size:9px; color:var(--neon-blue);">GLOBAL DIGITAL BANK V4 PRO</div>
                </div>
            </div>
            <div id="main-timer" style="font-family:'Roboto Mono'; color:var(--neon-gold);">INITIALIZING...</div>
            <div style="display:flex; align-items:center; gap:10px;">
                <div style="text-align:right"><div style="font-weight:bold; font-size:12px;">Admin: Manager</div><div style="font-size:9px; color:var(--neon-green)">● ONLINE</div></div>
                <div style="width:35px; height:35px; border-radius:50%; background:url('https://i.ibb.co/9G6vH4P/user-prof.jpg') center/cover; border:2px solid var(--neon-green);"></div>
            </div>
        </header>

        <aside class="sidebar">
            <div style="padding:0 20px; font-size:10px; color:#475569; letter-spacing:2px; margin-bottom:15px;">MAIN MENU</div>
            <div class="nav-link nav-active" onclick="play(1)">Dashboard</div>
            <div class="nav-link" onclick="openBanking()">Transfers & Wire</div>
            <div class="nav-link" onclick="play(5)">Vault Storage</div>
            <div class="nav-link" onclick="play(8)">AI Neural Center</div>
            <div class="nav-link" onclick="play(10)">Security Gateway</div>
            <div class="nav-link" onclick="play(15)">Master Settings</div>
            
            <div style="margin-top:auto; padding:20px; background:rgba(0,0,0,0.2);">
                <div style="font-size:10px; color:#475569; margin-bottom:10px;">SYSTEM HEALTH</div>
                <div style="display:flex; justify-content:space-between; font-size:10px;"><span>CPU</span><span>43%</span></div>
                <div style="height:4px; background:#1e293b; border-radius:2px; margin:5px 0 15px;"><div style="width:43%; height:100%; background:var(--neon-green)"></div></div>
                <div style="display:flex; justify-content:space-between; font-size:10px;"><span>RAM</span><span>62%</span></div>
                <div style="height:4px; background:#1e293b; border-radius:2px; margin-top:5px;"><div style="width:62%; height:100%; background:var(--neon-gold)"></div></div>
            </div>
        </aside>

        <main class="workspace">
            <div class="conn-bar">
                <span><span class="dot" style="background:var(--neon-green)"></span> System Engine</span>
                <span><span class="dot" style="background:var(--neon-green)"></span> Security Engine</span>
                <span><span class="dot" style="background:var(--neon-blue)"></span> AI Neural Engine</span>
                <span style="margin-left:auto; color:var(--neon-green)">● LIVE DATA STREAM ACTIVE</span>
            </div>

            <section class="vault-core">
                <div style="font-size:12px; color:#94a3b8; letter-spacing:2px;">TOTAL LIQUIDITY</div>
                <div style="font-family:Orbitron; font-size:42px; margin:15px 0;">KES 2,438,920,440</div>
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:15px;">
                    <div style="padding:15px; background:rgba(0,0,0,0.3); border-radius:6px; border:1px solid rgba(255,255,255,0.05);"><div style="color:var(--neon-green); font-size:16px;">1.90B</div><small>Available</small></div>
                    <div style="padding:15px; background:rgba(0,0,0,0.3); border-radius:6px; border:1px solid rgba(255,255,255,0.05);"><div style="color:var(--neon-gold); font-size:16px;">200M</div><small>Reserved</small></div>
                    <div style="padding:15px; background:rgba(0,0,0,0.3); border-radius:6px; border:1px solid rgba(255,255,255,0.05);"><div style="color:var(--neon-red); font-size:16px;">80M</div><small>Frozen</small></div>
                    <div style="padding:15px; background:rgba(0,0,0,0.3); border-radius:6px; border:1px solid rgba(255,255,255,0.05);"><div style="color:var(--neon-blue); font-size:16px;">258.9M</div><small>Moving</small></div>
                </div>
            </section>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                <div style="background:var(--bg-panel); border:var(--glass-border); padding:20px; border-radius:8px;">
                    <div style="font-family:Orbitron; color:var(--neon-blue); margin-bottom:15px;">LIVE TRANSACTIONS</div>
                    <table style="width:100%; font-size:12px; border-collapse:collapse;">
                        <tr style="color:#64748b; text-align:left;"><th style="padding:10px;">TIME</th><th>USER</th><th>AMT</th></tr>
                        <tr style="border-top:1px solid rgba(255,255,255,0.05);"><td style="padding:10px;">14:35</td><td>Alex T</td><td style="color:var(--neon-green)">KES 20k</td></tr>
                        <tr style="border-top:1px solid rgba(255,255,255,0.05);"><td style="padding:10px;">14:34</td><td>Susan M</td><td style="color:var(--neon-green)">KES 8.3k</td></tr>
                    </table>
                </div>
                <div style="background:rgba(0, 210, 255, 0.02); border:1px solid var(--neon-blue); padding:20px; border-radius:8px;">
                    <div style="font-family:Orbitron; color:var(--neon-blue); margin-bottom:15px;">AI NEURAL LOGIC</div>
                    <div style="font-size:11px; padding:10px; background:rgba(0,0,0,0.4); border-left:3px solid var(--neon-red); margin-bottom:10px;">Fraud risk rising in mobile transfers.</div>
                    <div style="font-size:11px; padding:10px; background:rgba(0,0,0,0.4); border-left:3px solid var(--neon-gold);">Dynamic resource allocation suggested.</div>
                </div>
            </div>
        </main>

        <aside class="security-side">
            <div style="font-family:Orbitron; color:var(--neon-red); margin-bottom:15px;">SECURITY ALERTS</div>
            <div style="background:rgba(255, 49, 49, 0.1); border:1px solid var(--neon-red); padding:12px; border-radius:4px; font-size:11px;">
                <b>Suspicious Login</b><br>John Doe - Nairobi Hub
            </div>
            <div style="height:150px; background:url('https://i.ibb.co/F4pYhX7/map.png') center/cover; margin:20px 0; border:var(--glass-border); border-radius:4px;"></div>
            <button class="btn-core" style="width:100%; margin-bottom:10px;" onclick="openBanking()">+ NEW TRANSFER</button>
            <button class="btn-core" style="width:100%; border-color:var(--neon-gold); color:var(--neon-gold);">SYSTEM REPORT</button>
        </aside>

        <footer>© 2026 GLOBAL DIGITAL BANK | ENCRYPTED QUANTUM PROTOCOL | V4 PRO</footer>
    </div>

    <div id="banking-overlay" class="overlay-gate">
        <div class="engine-modal">
            <div class="modal-header">
                <h2 style="font-family:Orbitron; color:var(--neon-blue); margin:0;">GATEWAY ACCESS</h2>
                <button onclick="closeBanking()" class="btn-core" style="border-color:var(--neon-red); color:var(--neon-red);">EXIT</button>
            </div>
            <div class="modal-body">
                <div style="display:grid; gap:15px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:rgba(255,255,255,0.02); border-radius:6px;">
                        <div><b>SEND MONEY</b><br><small style="color:var(--neon-blue)">Internal Remittance</small></div>
                        <button class="btn-core" onclick="openTerminal('SEND')">OPEN</button>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:rgba(255,255,255,0.02); border-radius:6px;">
                        <div><b style="color:var(--neon-red)">SWIFT WIRE</b><br><small style="color:var(--neon-blue)">Global RTGS</small></div>
                        <button class="btn-core" style="border-color:var(--neon-red);" onclick="openTerminal('WIRE')">OPEN</button>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:rgba(57, 255, 20, 0.05); border-left:3px solid var(--neon-green); border-radius:6px;">
                        <div><b style="color:var(--neon-green)">STK PUSH</b><br><small>Paynecta Engine</small></div>
                        <button class="btn-core" style="background:var(--neon-green); color:black; border:none;" onclick="stkEngine()">EXECUTE</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="terminal-overlay" class="overlay-gate" style="z-index:10001;">
        <div class="engine-modal" style="width:550px;">
            <div class="modal-header">
                <h2 id="term-title" style="font-family:Orbitron; color:var(--neon-blue); margin:0;">TERMINAL</h2>
                <button onclick="closeTerminal()" class="btn-core" style="border-color:var(--neon-red); color:var(--neon-red);">CANCEL</button>
            </div>
            <div class="modal-body">
                <div class="terminal-grid">
                    <div style="grid-column:1/3;">
                        <label style="font-size:10px; color:var(--neon-blue);">DESTINATION ACCOUNT</label>
                        <input type="text" id="dest-acc" class="term-input" placeholder="ACC_NUM / PHONE">
                    </div>
                    <div>
                        <label style="font-size:10px; color:var(--neon-blue);">AMOUNT</label>
                        <input type="number" id="trans-amt" class="term-input" placeholder="0.00">
                    </div>
                    <div>
                        <label style="font-size:10px; color:var(--neon-blue);">ASSET</label>
                        <select class="term-input"><option>KES - FIAT</option><option>BTC - CRYPTO</option></select>
                    </div>
                </div>
                <div id="term-status" style="margin-top:20px; font-family:'Roboto Mono'; font-size:11px; height:40px; color:var(--neon-gold);"></div>
                <button id="proc-btn" class="btn-core" style="width:100%; background:var(--neon-blue); color:black; font-weight:bold; height:50px; margin-top:10px;" onclick="processTransfer()">INITIATE SECURE TRANSFER</button>
            </div>
        </div>
    </div>

    <script>
        // EXPANDED SOUND SYSTEM (12+ SOUNDS)
        const play = (id) => {
            const sfx = new Audio(\`https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_\${id}.mp3\`);
            sfx.volume = 0.4;
            sfx.play().catch(e => { console.log("Sound error for ID:", id); });
        };

        function openBanking() { play(4); document.getElementById('banking-overlay').style.display = 'flex'; }
        function closeBanking() { play(10); document.getElementById('banking-overlay').style.display = 'none'; }
        
        function openTerminal(type) {
            play(4);
            document.getElementById('term-title').innerText = type + " TERMINAL";
            document.getElementById('terminal-overlay').style.display = 'flex';
        }

        function closeTerminal() {
            play(10);
            document.getElementById('terminal-overlay').style.display = 'none';
        }

        function processTransfer() {
            const amt = document.getElementById('trans-amt').value;
            const dest = document.getElementById('dest-acc').value;
            if(!amt || !dest) return alert("Fill all fields");

            play(11);
            const status = document.getElementById('term-status');
            const btn = document.getElementById('proc-btn');
            btn.disabled = true;
            
            let steps = ["[HANDSHAKE]...", "[ENCRYPTING]...", "[VALIDATING]...", "[MIGRATED]"];
            let i = 0;
            let interval = setInterval(() => {
                status.innerText = steps[i];
                i++;
                if(i >= steps.length) {
                    clearInterval(interval);
                    play(1); // Success sound
                    status.style.color = "var(--neon-green)";
                    status.innerText = "TRANSFER SUCCESSFUL - NODE ACK: 0x" + Math.random().toString(16).slice(2,8).toUpperCase();
                    btn.innerText = "COMPLETE";
                }
            }, 800);
        }

        function stkEngine() { 
            play(11);
            const p = prompt("PHONE:"); const a = prompt("AMOUNT:");
            if(p && a) alert("PAYNECTA: Pushing STK to " + p);
        }

        setInterval(() => {
            document.getElementById('main-timer').innerText = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }) + ' (EAT)';
        }, 1000);
    </script>
</body>
</html>
`);
});

app.listen(3000, () => console.log("System Engine V4 Pro Restored"));
