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
    // Asset valuation logic: 1 EC = 150.50 KES
    const assetValue = (todayTotal / 150.50).toFixed(4);
    res.json({ transactions, todayTotal, aiScore, assetValue, latency: Math.floor(Math.random() * 35) + 10 });
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
    <title>Elite Digital Vault</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; --card: #ffffff; --red: #ef4444; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; overflow-x: hidden; }
        
        /* Breathing Engine */
        @keyframes breathing {
            0% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(40, 167, 69, 0)); }
            50% { transform: scale(1.03); filter: drop-shadow(0 0 8px rgba(40, 167, 69, 0.2)); }
            100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(40, 167, 69, 0)); }
        }
        .alive { animation: breathing 3s ease-in-out infinite; }

        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .pulse-indicator { font-size: 9px; color: #94a3b8; display: flex; align-items: center; gap: 4px; font-weight: 800; }
        .pulse-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.3s ease; }
        .active-tab { display: block; }
        
        .card { background: var(--card); border-radius: 24px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; position: relative; overflow: hidden; }

        /* Vault Grid Active Logic */
        .vault-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 15px; }
        .v-item { 
            background: white; padding: 25px 10px; border-radius: 24px; border: 1px solid #f1f5f9; 
            text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.03); 
            transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); 
            position: relative; overflow: hidden;
        }
        .v-item:active { transform: scale(0.92); background: #f1f5f9; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05); }
        
        .v-icon { font-size: 28px; margin-bottom: 8px; display: block; }
        .v-label { font-size: 12px; font-weight: 800; color: #1e293b; }
        .v-sub { font-size: 10px; color: #94a3b8; font-weight: 600; display: block; margin-top: 2px; }

        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; cursor:pointer; flex:1; }
        .nav-item.active { color: var(--primary); transform: translateY(-3px); }
    </style>
</head>
<body>
    <div class="topbar">
        <div style="display:flex; align-items:center; gap:12px;">
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; height:35px; border-radius:50%;">
            <span style="font-weight:800; font-size:14px;">Pay <span style="color:var(--accent)">Elite</span></span>
        </div>
        <div class="pulse-indicator"><div class="pulse-dot"></div><span id="latencyText">PULSE: 0ms</span></div>
    </div>

    <div id="tab-vault" class="tab-content active-tab">
        <div class="card balance-card alive" id="vaultHead">
            <small style="color:var(--accent); font-weight:800;">ACTIVE VAULT SESSION</small>
            <h1 id="vaultTotalDisplay" style="margin:8px 0; font-size:32px;">KES 0</h1>
            <div id="cryptoVal" style="font-size:11px; opacity:0.8; font-weight:bold;">EC ASSETS: 0.0000</div>
        </div>

        <div class="vault-grid">
            <div class="v-item" onclick="handleVaultClick(4, 'SYNCING DASHBOARD')">
                <span class="v-icon">📊</span><span class="v-label">Dashboard</span><span class="v-sub">Live Assets</span>
            </div>
            <div class="v-item" onclick="handleVaultClick(5, 'GENERATING CRYPTO KEYS')">
                <span class="v-icon">💎</span><span class="v-label">Assets</span><span id="assetSub" class="v-sub">0.0000 EC</span>
            </div>
            <div class="v-item" onclick="handleVaultClick(6, 'OPENING SECURE DOCUMENTS')">
                <span class="v-icon">📁</span><span class="v-label">Documents</span><span class="v-sub">IDs & Bank</span>
            </div>
            <div class="v-item" onclick="handleVaultClick(7, 'BACKUP RECOVERY INIT')">
                <span class="v-icon">🔑</span><span class="v-label">Backups</span><span class="v-sub">Recovery Keys</span>
            </div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item" onclick="location.href='/'">🏠<br>Dash</div>
        <div class="nav-item active">💼<br>Vault</div>
        <div class="nav-item">📊<br>Intel</div>
        <div class="nav-item">🛡️<br>Secure</div>
    </nav>

    <script>
        const playSfx = (idx) => {
            if(window.navigator.vibrate) window.navigator.vibrate(10);
            const audio = new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + idx + ".mp3");
            audio.play().catch(() => {});
        };

        function handleVaultClick(fx, msg) {
            playSfx(fx);
            console.log("ENGINE_LOG: " + msg);
        }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                
                document.getElementById('vaultTotalDisplay').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('cryptoVal').innerText = 'EC ASSETS: ' + data.assetValue;
                document.getElementById('assetSub').innerText = data.assetValue + ' EC';
                document.getElementById('latencyText').innerText = 'PULSE: ' + data.latency + 'ms';
                
                // Breathing frequency tied to latency
                const head = document.getElementById('vaultHead');
                head.style.animationDuration = (data.latency / 5) + 's';
                
            } catch(e) {}
        }
        setInterval(update, 3000); update();
    </script>
</body>
</html>
    `);
});
app.listen(process.env.PORT || 3000);
