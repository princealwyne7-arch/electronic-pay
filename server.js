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
    <title>AI COMMAND CENTER V4 - GLOBAL INTELLIGENCE</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
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
        .nav-link { 
            padding: 14px 25px; display: flex; align-items: center; gap: 12px; 
            color: #94a3b8; font-size: 13px; cursor: pointer; transition: 0.3s;
            border-left: 3px solid transparent;
        }
        .nav-link:hover { background: rgba(0, 210, 255, 0.05); color: var(--neon-blue); }
        .nav-active { background: rgba(0, 210, 255, 0.1); color: var(--neon-blue); border-left: 3px solid var(--neon-blue); font-weight: 600; }
        
        .workspace {
            grid-row: 2;
            background: radial-gradient(circle at top right, #0a192f 0%, #020617 100%);
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* CENTRAL WORLD MAP CORE */
        .map-container {
            width: 100%;
            height: 450px;
            background: #000;
            border: 1px solid var(--neon-blue);
            border-radius: 12px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 0 30px rgba(0, 210, 255, 0.15);
        }
        #main-geo-engine { width: 100%; height: 100%; filter: brightness(0.7) contrast(1.2); }
        
        .map-stats-overlay {
            position: absolute; top: 20px; left: 20px; z-index: 1000;
            background: rgba(1, 4, 9, 0.85); padding: 15px; border-radius: 8px; border: var(--glass-border);
            font-family: 'Roboto Mono'; font-size: 11px; pointer-events: none;
        }

        .grid-meters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .meter-card { 
            background: var(--bg-panel); border: var(--glass-border); padding: 15px; border-radius: 8px; 
            text-align: center;
        }
        .meter-value { font-family: 'Orbitron'; font-size: 20px; color: var(--neon-blue); }

        .security-side {
            grid-row: 2; background: rgba(1, 4, 9, 0.9); border-left: var(--glass-border);
            padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px;
        }
        .alert-card { background: rgba(255, 49, 49, 0.1); border: 1px solid var(--neon-red); padding: 12px; border-radius: 8px; font-size: 12px; }

        .sys-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .sys-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.03); }

        footer { grid-column: 1 / 4; background: #000; border-top: var(--glass-border); display: flex; justify-content: center; align-items: center; font-size: 11px; color: #475569; }
        
        #banking-overlay {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(1, 4, 9, 0.98); z-index: 10000; backdrop-filter: blur(20px);
            align-items: center; justify-content: center;
        }
        .engine-modal {
            width: 850px; background: var(--bg-panel); border: 1px solid var(--neon-blue);
            border-radius: 12px; display: flex; flex-direction: column;
        }
        .btn-core { padding: 8px 15px; background: transparent; border: 1px solid var(--neon-blue); color: white; font-family: 'Orbitron'; font-size: 10px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="app-shell">
        <header>
            <div class="header-brand">
                <div class="logo-box"><i>B</i></div>
                <div>
                    <div style="font-size:16px; color:var(--neon-blue); font-family:'Orbitron'">AI COMMAND CENTER</div>
                    <div style="font-size:10px; color:#64748b;">QUANTUM BANKING LEDGER V4</div>
                </div>
            </div>
            <div class="header-center" id="main-timer">CONNECTING...</div>
            <div class="admin-profile">
                <div style="text-align:right"><div style="font-weight:bold">Admin: Manager</div><div style="font-size:10px; color:var(--neon-green)">● SECURE NODE</div></div>
                <div class="avatar"></div>
            </div>
        </header>

        <aside class="sidebar">
            <div class="nav-link nav-active" onclick="play(1)">Dashboard</div>
            <div class="nav-link" onclick="play(2)">Clients</div>
            <div class="nav-link" onclick="openBanking()">Transfers & Wire</div>
            <div class="nav-link" onclick="play(5)">Vault Storage</div>
            <div class="nav-link" onclick="play(8)">AI Neural Center</div>
            <div class="nav-link" onclick="triggerMapScan()" style="color:var(--neon-gold); border-left:3px solid var(--neon-gold);">
                <span id="map-btn-text">World Map Activity</span>
            </div>
            <div class="nav-link" onclick="play(12)">System Reports</div>
            <div class="nav-link" onclick="play(15)">Master Settings</div>

            <div style="margin-top:auto; padding:20px; border-top:1px solid rgba(255,255,255,0.05);">
                <div style="font-size:10px; color:#475569; margin-bottom:10px;">ENGINE HEALTH</div>
                <div style="font-size:11px; margin-bottom:5px;">CPU: 43%</div>
                <div style="height:4px; background:#1e293b; border-radius:2px;"><div style="width:43%; background:var(--neon-green); height:100%;"></div></div>
            </div>
        </aside>

        <main class="workspace">
            <div class="grid-meters">
                <div class="meter-card"><div style="font-size:10px; color:#94a3b8;">GLOBAL LIQUIDITY</div><div class="meter-value">KES 2.43B</div></div>
                <div class="meter-card"><div style="font-size:10px; color:#94a3b8;">SWIFT NODES</div><div class="meter-value" id="node-count">142</div></div>
                <div class="meter-card"><div style="font-size:10px; color:#94a3b8;">ACTIVE SESSIONS</div><div class="meter-value" id="user-sync">1,284</div></div>
                <div class="meter-card" style="border-color:var(--neon-red)"><div style="font-size:10px; color:var(--neon-red);">THREAT LEVEL</div><div class="meter-value" style="color:var(--neon-red)">CRITICAL</div></div>
            </div>

            <div class="map-container">
                <div id="main-geo-engine"></div>
                <div class="map-stats-overlay">
                    <div style="color:var(--neon-blue); border-bottom:1px solid rgba(0,210,255,0.3); padding-bottom:5px; margin-bottom:5px;">LIVE WIRE TRAFFIC</div>
                    <div>INBOUND: <span style="color:var(--neon-green)">KES 1.2M</span></div>
                    <div>OUTBOUND: <span style="color:var(--neon-red)">KES 850K</span></div>
                    <div id="map-status" style="margin-top:5px; font-size:9px; color:var(--neon-gold)">[ MONITORING CROSS-BORDER FLOWS ]</div>
                </div>
            </div>

            <div style="background:var(--bg-panel); border:var(--glass-border); border-radius:12px; padding:20px;">
                <div style="font-family:'Orbitron'; font-size:13px; color:var(--neon-blue); margin-bottom:15px;">LIVE TRANSACTION STREAM</div>
                <table class="sys-table">
                    <tbody id="tx-stream">
                        <tr><td>14:35</td><td><b>New York Node</b></td><td>Cross-Border Transfer</td><td style="color:var(--neon-green)">+ KES 450,000</td><td>SUCCESS</td></tr>
                        <tr><td>14:34</td><td><b>Nairobi Node</b></td><td>Mobile Remittance</td><td style="color:var(--neon-blue)">- KES 12,000</td><td>SUCCESS</td></tr>
                    </tbody>
                </table>
            </div>
        </main>

        <aside class="security-side">
            <div style="font-family:'Orbitron'; font-size:12px; color:var(--neon-red)">SECURITY INTELLIGENCE</div>
            <div class="alert-card">
                <b>AML ALERT</b><br>
                <small>Sudden spike in high-value transfers between Node 04 (Nairobi) and Node 82 (London).</small>
            </div>
            
            <div style="font-family:'Orbitron'; font-size:12px; color:var(--neon-gold); margin-top:20px;">QUICK ACTIONS</div>
            <button class="btn-core" onclick="play(4)">+ NEW SWIFT WIRE</button>
            <button class="btn-core" onclick="play(11)">FREEZE GLOBAL NODES</button>
            
            <div style="font-family:'Orbitron'; font-size:12px; color:var(--neon-blue); margin-top:20px;">SYSTEM LOGS</div>
            <div style="font-family:'Roboto Mono'; font-size:10px; color:#64748b; background:rgba(0,0,0,0.3); padding:10px; border-radius:5px;">
                <div>[10:02:35] SWIFT_MT103_SENT</div>
                <div>[10:02:40] GEO_SYNC_OK</div>
                <div style="color:var(--neon-green)">[10:02:45] ENCRYPTION_SECURE</div>
            </div>
        </aside>

        <footer>© 2026 GLOBAL DIGITAL BANK | QUANTUM ENCRYPTION ACTIVE | POWERED BY AI V4 PRO</footer>
    </div>

    <div id="banking-overlay">
        <div class="engine-modal">
            <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between;">
                <h2 style="font-family:'Orbitron'; color:var(--neon-blue); margin:0;">BANKING GATEWAY</h2>
                <button onclick="closeBanking()" class="btn-core" style="border-color:var(--neon-red); color:var(--neon-red)">CLOSE</button>
            </div>
            <div style="padding:40px; text-align:center; color:#94a3b8;">
                SELECT TRANSFER PROTOCOL FROM SIDEBAR OR MAP NODES.
            </div>
        </div>
    </div>

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        const play = (id) => {
            const sfx = new Audio(\`https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_\${id}.mp3\`);
            sfx.volume = 0.4;
            sfx.play().catch(e => {});
        };

        function openBanking() { play(4); document.getElementById('banking-overlay').style.display = 'flex'; }
        function closeBanking() { play(10); document.getElementById('banking-overlay').style.display = 'none'; }

        /* --- GEO-SPATIAL BANKING ENGINE --- */
        let map = L.map('main-geo-engine', {
            center: [20, 10],
            zoom: 2,
            zoomControl: false,
            attributionControl: false
        });

        // Professional Banking Dark Layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

        const bankingNodes = [
            { name: "Nairobi Hub", coords: [-1.2921, 36.8219], status: "ACTIVE" },
            { name: "London Swift Node", coords: [51.5074, -0.1278], status: "ACTIVE" },
            { name: "New York Fed", coords: [40.7128, -74.0060], status: "MONITORING" },
            { name: "Tokyo Exchange", coords: [35.6762, 139.6503], status: "ACTIVE" },
            { name: "Dubai Finance", coords: [25.2048, 55.2708], status: "ACTIVE" }
        ];

        let markers = [];
        bankingNodes.forEach(node => {
            let m = L.circleMarker(node.coords, {
                radius: 6,
                fillColor: '#00d2ff',
                color: '#fff',
                weight: 1,
                fillOpacity: 0.8
            }).addTo(map).bindTooltip(node.name + " [" + node.status + "]");
            markers.push(m);
        });

        // USES OF THE MAP IN BANKING:
        // 1. AML Visualisation (Arched lines show money movement)
        // 2. Regional Threat Assessment
        // 3. Server Node Latency mapping
        function triggerMapScan() {
            play(13);
            document.getElementById('map-status').innerText = "[ SCANNING GLOBAL AML THREATS... ]";
            document.getElementById('map-status').style.color = 'var(--neon-red)';
            
            // Visualizing a "Swift Transfer" line
            let start = bankingNodes[0].coords; // Nairobi
            let end = bankingNodes[1].coords;   // London
            let line = L.polyline([start, end], {color: 'var(--neon-gold)', weight: 2, dashArray: '10, 10'}).addTo(map);
            
            setTimeout(() => {
                map.removeLayer(line);
                document.getElementById('map-status').innerText = "[ GLOBAL SCAN COMPLETE - 0 THREATS ]";
                document.getElementById('map-status').style.color = 'var(--neon-green)';
            }, 4000);
        }

        setInterval(() => {
            document.getElementById('main-timer').innerText = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }) + ' (EAT)';
        }, 1000);

        setInterval(() => {
            const el = document.getElementById('user-sync');
            let val = parseInt(el.innerText.replace(',',''));
            val += Math.floor(Math.random() * 5) - 2;
            el.innerText = val.toLocaleString();
        }, 3000);
    </script>
</body>
</html>
`);
});

app.listen(3000, () => console.log("Global Banking System V4 Online"));
