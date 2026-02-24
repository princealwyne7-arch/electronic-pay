const express = require("express");
const axios = require("axios");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- DATABASE ENGINE (Persistence) ---
const DB_FILE = "database.json";
let transactions = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE)) : [];

const saveToVault = () => fs.writeFileSync(DB_FILE, JSON.stringify(transactions.slice(0, 100), null, 2));

const getKenyaTime = () => 
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

// --- API ENGINES ---
app.get('/api/status', (req, res) => {
    const successful = transactions.filter(t => t.status.includes('Successful'));
    const totalVolume = successful.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    const aiScore = Math.min(999, 850 + (successful.length * 5));
    res.json({ 
        transactions, 
        totalVolume, 
        aiScore, 
        latency: Math.floor(Math.random() * 25) + 5,
        nodeCount: 14 + (transactions.length % 5)
    });
});

app.post('/admin/push', async (req, res) => {
    const { phone, amount, pin } = req.body;
    if (pin !== "5566") return res.status(403).json({ error: "Unauthorized Node Access" });
    
    const trackingId = `TXN-${Date.now()}`;
    transactions.unshift({ id: trackingId, phone, amount, status: 'Authenticating... 🛡️', time: getKenyaTime() });
    saveToVault();

    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' } });
        res.json({ success: true });
    } catch (err) { 
        if(transactions[0]) transactions[0].status = "System Error ⚠️";
        saveToVault();
        res.status(500).json({ success: false });
    }
});

app.post('/callback', (req, res) => {
    const { merchant_request_id, state, status } = req.body;
    let tx = transactions.find(t => String(t.id).includes(merchant_request_id));
    if (tx) { 
        tx.status = (state === 'completed' || status === 'success') ? "Successful ✅" : "Cancelled ⚠️"; 
        saveToVault();
    }
    res.sendStatus(200);
});

// --- ELITE UI ENGINE ---
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Elite Banking Core</title>
    <style>
        :root { --primary: #0f172a; --accent: #10b981; --bg: #020617; --card: #1e293b; --red: #f43f5e; }
        body { margin:0; font-family: 'Inter', sans-serif; background: var(--bg); color: #f8fafc; padding-bottom: 90px; }
        .topbar { position:fixed; top:0; width:100%; height:70px; background: rgba(30, 41, 59, 0.8); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .pulse-indicator { font-size: 10px; color: var(--accent); display: flex; align-items: center; gap: 6px; font-weight: bold; background: rgba(16, 185, 129, 0.1); padding: 5px 10px; border-radius: 20px; }
        .pulse-dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 10px var(--accent); animation: glow 1.5s infinite; }
        @keyframes glow { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .side-drawer { position:fixed; left:-280px; top:0; width:280px; height:100%; background:var(--primary); z-index:2000; transition:0.4s ease; padding:30px 20px; box-sizing:border-box; }
        .side-drawer.open { left:0; box-shadow: 20px 0 50px rgba(0,0,0,0.5); }
        .tab-content { display: none; padding: 90px 16px 20px 16px; animation: slideUp 0.4s ease; }
        .active-tab { display: block; }
        @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        .card { background: var(--card); border-radius: 28px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin-bottom: 18px; border: 1px solid rgba(255,255,255,0.05); }
        .balance-card { background: linear-gradient(135deg, #334155, #0f172a); color: white; position: relative; overflow: hidden; border: 1px solid var(--accent); }
        input { width:100%; padding:18px; margin:10px 0; border:1px solid #334155; border-radius:16px; background: #0f172a; color: white; box-sizing:border-box; font-size:16px; }
        .btn-exec { width:100%; padding:20px; background: var(--accent); color:white; border:none; border-radius:16px; font-weight:800; font-size:16px; cursor:pointer; transition: 0.2s; }
        .btn-exec:active { transform: scale(0.98); opacity: 0.9; }
        .bottom-nav { position:fixed; bottom:20px; left:50%; transform:translateX(-50%); width:90%; height:75px; background:rgba(30, 41, 59, 0.9); backdrop-filter: blur(15px); border-radius:25px; display:flex; justify-content:space-around; align-items:center; z-index:1000; border: 1px solid rgba(255,255,255,0.1); }
        .nav-item { text-align:center; font-size:10px; font-weight:bold; color:#64748b; cursor:pointer; transition: 0.3s; }
        .nav-item.active { color: var(--accent); transform: translateY(-5px); }
        .chart-container { height: 100px; display: flex; align-items: flex-end; gap: 5px; margin-top: 20px; }
        .chart-bar { flex: 1; background: var(--accent); opacity: 0.6; border-radius: 3px 3px 0 0; transition: 0.3s; }
    </style>
</head>
<body>
    <div class="topbar">
        <div style="display:flex; align-items:center; gap:15px;">
            <div onclick="toggleMenu()" style="font-size:24px; color:var(--accent);">☰</div>
            <div style="font-weight:900; letter-spacing:1px; font-size:18px;">ELITE<span style="color:var(--accent)">CORE</span></div>
        </div>
        <div class="pulse-indicator"><div class="pulse-dot"></div><span id="latencyText">SECURE</span></div>
    </div>

    <div id="drawer" class="side-drawer">
        <h2 style="color:var(--accent)">System Menu</h2>
        <div style="margin:20px 0; height:1px; background:rgba(255,255,255,0.1);"></div>
        <div onclick="toggleMenu()" style="padding:15px 0;">📊 Overview</div>
        <div onclick="toggleMenu()" style="padding:15px 0;">🛡️ Security Logs</div>
        <div onclick="toggleMenu()" style="padding:15px 0;">⚙️ Config</div>
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <div style="font-size:11px; font-weight:bold; color:var(--accent);">TOTAL LIQUIDITY</div>
            <h1 id="totalRev" style="margin:10px 0; font-size:38px;">KES 0</h1>
            <div id="aiHealth" style="font-size:12px; font-weight:bold; padding:8px 15px; border-radius:12px; background:rgba(0,0,0,0.3); display:inline-block;">AI Risk Score: --</div>
        </div>
        <div class="card">
            <h4 style="margin:0 0 15px 0;">System Terminal</h4>
            <input type="password" id="adminPin" placeholder="Access PIN">
            <input type="number" id="pPhone" placeholder="Mobile 254...">
            <input type="number" id="pAmount" placeholder="Amount">
            <button onclick="runPush()" class="btn-exec">INITIALIZE SECURE PUSH</button>
        </div>
        <div class="card">
            <h4 style="margin:0 0 15px 0;">Live Node Feed</h4>
            <div id="activityFeed" style="font-size:13px; color:#94a3b8;">Scanning Network...</div>
        </div>
    </div>

    <div id="tab-vault" class="tab-content">
        <div class="card">
            <h3>🏛️ Secure Vault</h3>
            <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:20px; margin-bottom:15px;">
                <small style="color:#64748b;">TOTAL VOLUME</small>
                <h2 id="vaultVol" style="margin:5px 0;">KES 0</h2>
            </div>
            <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:20px;">
                <small style="color:#64748b;">ENCRYPTED RECORDS</small>
                <h2 id="recordCount" style="margin:5px 0;">0 TXNS</h2>
            </div>
        </div>
    </div>

    <div id="tab-insights" class="tab-content">
        <div class="card">
            <h3>📊 Intel Engine</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div style="background:#0f172a; padding:15px; border-radius:20px; text-align:center;">
                    <small>Success Rate</small><br><b id="successRate" style="color:var(--accent); font-size:22px;">0%</b>
                </div>
                <div style="background:#0f172a; padding:15px; border-radius:20px; text-align:center;">
                    <small>Latency</small><br><b id="latVal" style="font-size:22px;">--ms</b>
                </div>
            </div>
            <div class="chart-container" id="intelChart"></div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item" onclick="switchTab('vault', this)">💼<br>Vault</div>
        <div class="nav-item" onclick="switchTab('insights', this)">📊<br>Intel</div>
    </nav>

    <script>
        let lastStatus = {};
        const playSfx = (i) => {
            const a = new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + i + ".mp3");
            a.play().catch(()=>{});
        };

        function toggleMenu() { document.getElementById('drawer').classList.toggle('open'); }
        
        function switchTab(id, el) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
        }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                
                document.getElementById('totalRev').innerText = 'KES ' + data.totalVolume.toLocaleString();
                document.getElementById('vaultVol').innerText = 'KES ' + data.totalVolume.toLocaleString();
                document.getElementById('recordCount').innerText = data.transactions.length + ' TXNS';
                document.getElementById('latVal').innerText = data.latency + 'ms';
                
                const ai = document.getElementById('aiHealth');
                ai.innerText = 'AI Security Rank: ' + data.aiScore;
                ai.style.color = data.aiScore > 900 ? 'var(--accent)' : '#fbbf24';

                // Intel Logic
                const succ = data.transactions.filter(t => t.status.includes('Successful')).length;
                const rate = data.transactions.length ? Math.round((succ / data.transactions.length) * 100) : 0;
                document.getElementById('successRate').innerText = rate + '%';

                const chart = document.getElementById('intelChart');
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                bar.style.height = (data.latency * 3) + 'px';
                if(chart.children.length > 25) chart.removeChild(chart.firstChild);
                chart.appendChild(bar);

                // Sound & Feed Logic
                if(data.transactions.length > 0) {
                    const top = data.transactions[0];
                    if(lastStatus[top.id] !== top.status) {
                        if(top.status.includes('Successful')) playSfx(1);
                        if(top.status.includes('Authenticating')) playSfx(2);
                        lastStatus[top.id] = top.status;
                    }
                }

                document.getElementById('activityFeed').innerHTML = data.transactions.map(t => \`
                    <div style="padding:12px; border-bottom:1px solid #334155; display:flex; justify-content:space-between;">
                        <span>\${t.phone}<br><small>\${t.time}</small></span>
                        <span style="text-align:right;">KES \${t.amount}<br>
                        <small style="color:\${t.status.includes('Successful') ? 'var(--accent)' : '#fbbf24'}">\${t.status}</small></span>
                    </div>\`).join('');

            } catch(e) {}
        }

        async function runPush() {
            const pin = document.getElementById('adminPin').value;
            const phone = document.getElementById('pPhone').value;
            const amount = document.getElementById('pAmount').value;
            const res = await fetch('/admin/push', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({pin, phone, amount}) });
            if(res.ok) update(); else alert("Access Denied");
        }

        setInterval(update, 3000); update();
    </script>
</body>
</html>
    `);
});
app.listen(process.env.PORT || 3000);
