const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = [];

const getKenyaTime = () => 
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const successfulTxs = transactions.filter(t => t.status.includes('Successful'));
    const todayTotal = successfulTxs.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    const aiScore = Math.min(999, 800 + (successfulTxs.length * 12));
    res.json({ transactions, todayTotal, aiScore, latency: Math.floor(Math.random() * 35) + 10 });
});

app.post('/admin/push', async (req, res) => {
    const { phone, amount, pin } = req.body;
    if (pin !== "5566") return res.status(403).json({ error: "Access Denied" });
    const trackingId = `BNK-${Date.now()}`;
    transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        res.json({ success: true, trackingId });
    } catch (err) { 
        if(transactions[0]) transactions[0].status = "Failed ❌";
        res.status(500).json({ success: false });
    }
});

app.post('/callback', (req, res) => {
    const { merchant_request_id, state, status } = req.body;
    let tx = transactions.find(t => String(t.id).includes(merchant_request_id));
    if (tx) { tx.status = (state === 'completed' || status === 'success') ? "Successful ✅" : "Cancelled ⚠️"; }
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay | Elite Banking</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; --card: #ffffff; --red: #ef4444; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; overflow-x: hidden; transition: background 0.4s ease; }
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .pulse-indicator { font-size: 9px; color: #94a3b8; display: flex; align-items: center; gap: 4px; font-weight: 800; }
        .pulse-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        
        /* Audio Core Visual Haptics */
        .fx-btn { 
            padding:12px; background:#f1f5f9; border:1px solid #e2e8f0; border-radius:12px; 
            font-weight:bold; font-size:10px; transition: 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            cursor: pointer; position: relative; overflow: hidden;
        }
        .fx-btn:active { transform: scale(0.9); background: var(--accent); color: white; box-shadow: 0 0 15px var(--accent); }
        .fx-btn.playing { animation: pulse-glow 0.5s ease; }
        @keyframes pulse-glow {
            0% { box-shadow: 0 0 0 0px rgba(40, 167, 69, 0.4); }
            100% { box-shadow: 0 0 0 15px rgba(40, 167, 69, 0); }
        }

        .side-drawer { position:fixed; left:-280px; top:0; width:280px; height:100%; background:var(--primary); z-index:4000; transition:0.3s cubic-bezier(0.4, 0, 0.2, 1); padding:20px; box-sizing:border-box; color:white; }
        .side-drawer.open { left:0; }
        .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:none; z-index:2999; backdrop-filter: blur(2px); }
        .drawer-item { padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); color:white; text-decoration:none; display:block; font-size:14px; }
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.3s ease; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; } }
        .card { background: var(--card); border-radius: 24px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; position: relative; overflow: hidden; }
        .mode-badge { position: absolute; top: 15px; right: 15px; font-size: 10px; background: var(--accent); padding: 4px 8px; border-radius: 10px; font-weight: bold; }
        input { width:100%; padding:16px; margin:8px 0; border:1px solid #e2e8f0; border-radius:14px; box-sizing:border-box; font-size:16px; outline:none; }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:800; font-size:16px; cursor:pointer; }
        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; cursor:pointer; flex:1; }
        .nav-item.active { color: var(--primary); transform: translateY(-3px); transition: 0.2s; }
        .vault-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px; }
        .v-item { background: white; padding: 18px 10px; border-radius: 20px; border: 1px solid #f1f5f9; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.02); transition: 0.2s; cursor: pointer; }
        
        #assetOverlay { position:fixed; bottom:-100%; left:0; width:100%; height:90%; background:white; border-radius:30px 30px 0 0; z-index:3500; transition:0.4s ease; padding:25px; box-sizing:border-box; overflow-y:auto; }
        #assetOverlay.active { bottom:0; }
    </style>
</head>
<body>
    <div class="overlay" id="overlay" onclick="closeAll()"></div>

    <div id="assetOverlay">
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2 style="margin:0;">Digital Assets</h2>
            <button onclick="closeAll()" style="background:#f1f5f9; border:none; border-radius:50%; width:35px; height:35px; font-weight:bold;">✕</button>
        </div>
        <div class="card" style="background:var(--primary); color:white; margin-top:20px;">
            <small style="opacity:0.7">ESTIMATED BALANCE</small>
            <h2 id="assetBTC" style="margin:5px 0;">0.000000 BTC</h2>
        </div>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-top:20px;">
             ${['Wallets', 'Portfolio', 'Swap', 'Send', 'Ledger', 'Market', 'Security', 'NFTs'].map(f => `<div class="v-item" onclick="playSfx(5)"><b>${f}</b></div>`).join('')}
        </div>
    </div>

    <div class="side-drawer" id="drawer">
        <div style="margin-bottom:30px;">
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:50px; border-radius:50%; border:2px solid var(--accent);">
            <div style="margin-top:10px; font-weight:bold;">Manager Admin</div>
        </div>
        <a href="#" class="drawer-item" onclick="playSfx(1)">👤 Profile</a>
        <a href="#" class="drawer-item" onclick="playSfx(2)">⚙️ Settings</a>
        <a href="#" class="drawer-item" onclick="playSfx(3)">🛡️ Security</a>
    </div>

    <div class="topbar">
        <div style="display:flex; align-items:center; gap:12px;">
            <span onclick="toggleMenu()" style="font-size:24px; cursor:pointer;">☰</span>
            <div id="adminToggle" onclick="toggleAdminMode()" style="cursor:pointer; display:flex; align-items:center; gap:8px;">
                <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; height:35px; border-radius:50%; border:2px solid var(--accent);">
                <span style="font-weight:800; font-size:14px;">Pay <span style="color:var(--accent)">Elite</span></span>
            </div>
        </div>
        <div class="pulse-indicator"><div class="pulse-dot"></div><span id="latencyText">PULSE: 0ms</span></div>
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <div class="mode-badge" id="modeLabel">CLIENT</div>
            <div style="font-size:12px; opacity:0.8; font-weight:bold;">TOTAL VOLUME</div>
            <h1 id="totalRev" style="margin:8px 0; font-size:36px;">KES 0</h1>
        </div>
        <div class="card" id="adminControl" style="display:none; border: 2px solid var(--accent);">
            <input type="password" id="adminPin" placeholder="Manager Secure PIN">
            <input type="number" id="pPhone" placeholder="Recipient (254...)">
            <input type="number" id="pAmount" placeholder="Amount (KES)">
            <button onclick="runPush()" class="btn-exec">AUTHORIZE STK PUSH</button>
        </div>
        <div class="card" id="activityFeed">Syncing...</div>
    </div>

    <div id="tab-vault" class="tab-content">
        <div class="vault-grid">
            <div class="v-item" onclick="playSfx(4)">📊 Dashboard</div>
            <div class="v-item" onclick="openAssetHub()">💎 Assets</div>
            <div class="v-item" onclick="playSfx(6)">📁 Documents</div>
            <div class="v-item" onclick="playSfx(7)">🔑 Backups</div>
        </div>
    </div>

    <div id="tab-security" class="tab-content">
        <div class="card">
            <h3 style="margin-top:0">🛡️ Audio Core Diagnostics</h3>
            <p style="font-size:11px; color:#64748b; margin-bottom:20px;">System requires one click to unlock Audio Core.</p>
            <div id="fxGrid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                </div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item" onclick="switchTab('vault', this)">💼<br>Vault</div>
        <div class="nav-item" onclick="switchTab('security', this)">🛡️<br>Secure</div>
    </nav>

    <script>
        let isAdmin = false;
        
        // AUDIO ENGINE CORE
        const playSfx = (idx, btnEl = null) => {
            if(btnEl) {
                btnEl.classList.add('playing');
                setTimeout(() => btnEl.classList.remove('playing'), 500);
            }
            const audio = new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + idx + ".mp3");
            audio.play().catch(e => console.log("Audio Core restricted. Click anywhere to activate."));
        };

        // Initialize FX Grid
        const grid = document.getElementById('fxGrid');
        for(let i=1; i<=15; i++) {
            const btn = document.createElement('button');
            btn.className = 'fx-btn';
            btn.innerHTML = 'ENGINE FX ' + i;
            btn.onclick = () => playSfx(i, btn);
            grid.appendChild(btn);
        }

        function openAssetHub() { playSfx(5); document.getElementById('assetOverlay').classList.add('active'); document.getElementById('overlay').style.display = 'block'; }
        function closeAll() { document.getElementById('assetOverlay').classList.remove('active'); document.getElementById('drawer').classList.remove('open'); document.getElementById('overlay').style.display = 'none'; }
        function toggleMenu() { playSfx(1); document.getElementById('drawer').classList.toggle('open'); document.getElementById('overlay').style.display = 'block'; }
        
        function toggleAdminMode() {
            isAdmin = !isAdmin;
            playSfx(isAdmin ? 8 : 9);
            document.getElementById('adminControl').style.display = isAdmin ? 'block' : 'none';
            document.getElementById('modeLabel').innerText = isAdmin ? 'ADMIN' : 'CLIENT';
        }

        function switchTab(id, el) {
            playSfx(2);
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
        }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('latencyText').innerText = 'PULSE: ' + data.latency + 'ms';
                document.getElementById('activityFeed').innerHTML = data.transactions.map(t => \`
                    <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9;">
                        <span>\${t.phone}</span><span style="color:var(--accent)">\${t.amount}</span>
                    </div>\`).join('') || 'No Activity';
            } catch(e) {}
        }
        setInterval(update, 3000); update();

        async function runPush() {
            playSfx(10);
            const pin = document.getElementById('adminPin').value;
            const phone = document.getElementById('pPhone').value;
            const amount = document.getElementById('pAmount').value;
            await fetch('/admin/push', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({pin, phone, amount}) });
            update();
        }
    </script>
</body>
</html>
    `);
});
app.listen(process.env.PORT || 3000);
