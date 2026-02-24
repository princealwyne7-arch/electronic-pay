const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = [];
const soundLibrary = Array.from({ length: 15 }, (_, i) => `sys_fx_${i + 1}.mp3`);

const getKenyaTime = () => 
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const successfulTxs = transactions.filter(t => t.status.includes('Successful'));
    const todayTotal = successfulTxs.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    const aiScore = Math.min(999, 800 + (successfulTxs.length * 12));
    
    // Simulate System Pulse Latency (Mocking real engine check)
    const latency = Math.floor(Math.random() * 45) + 15; 
    
    res.json({ transactions, todayTotal, aiScore, latency, soundCount: soundLibrary.length });
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
        res.json({ success: true });
    } catch (err) { 
        if(transactions[0]) transactions[0].status = "Failed ❌";
        res.status(500).json({ success: false });
    }
});

app.post('/callback', (req, res) => {
    const { merchant_request_id, state, status } = req.body;
    let tx = transactions.find(t => String(t.id).includes(merchant_request_id));
    if (tx) tx.status = (state === 'completed' || status === 'success') ? "Successful ✅" : "Cancelled ⚠️";
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay | System Pulse</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; --card: #ffffff; --red: #ef4444; }
        body { margin:0; font-family: sans-serif; background: var(--bg); padding-bottom: 90px; }
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .pulse-indicator { font-size: 10px; color: var(--accent); display: flex; align-items: center; gap: 5px; font-weight: bold; }
        .pulse-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        
        .side-drawer { position:fixed; left:-280px; top:0; width:280px; height:100%; background:var(--primary); z-index:2000; transition:0.3s; padding:20px; box-sizing:border-box; color:white; }
        .side-drawer.open { left:0; }
        .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:none; z-index:1999; }
        .drawer-item { padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); color:white; text-decoration:none; display:block; font-size:14px; }

        .tab-content { display: none; padding: 85px 15px 20px 15px; }
        .active-tab { display: block; }
        .card { background: var(--card); border-radius: 24px; padding: 22px; margin-bottom: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:bold; cursor:pointer; }
        
        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; color:#94a3b8; cursor:pointer; flex:1; }
        .nav-item.active { color: var(--primary); font-weight: bold; }
    </style>
</head>
<body>
    <div class="overlay" id="overlay" onclick="toggleMenu()"></div>
    <div class="side-drawer" id="drawer">
        <h3 style="color:var(--accent)">Banking Menu</h3>
        <a href="#" class="drawer-item">👤 Profile</a>
        <a href="#" class="drawer-item">⚙️ Settings</a>
        <a href="#" class="drawer-item">🛡️ Security</a>
        <a href="#" class="drawer-item">🆔 KYC</a>
        <a href="#" class="drawer-item">🎧 Support</a>
        <a href="#" class="drawer-item">⚖️ Legal</a>
    </div>

    <div class="topbar">
        <div style="display:flex; align-items:center; gap:12px;">
            <span onclick="toggleMenu()" style="font-size:24px;">☰</span>
            <span style="font-weight:bold;">Electronic <span style="color:var(--accent)">Pay</span></span>
        </div>
        <div class="pulse-indicator">
            <div class="pulse-dot"></div>
            <span id="latencyText">PULSE: OK (18ms)</span>
        </div>
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <div style="font-size:12px; opacity:0.8;">DAILY TRANSACTION VOLUME</div>
            <h1 id="totalRev">KES 0</h1>
            <div id="aiHealth" style="font-size:11px; background:rgba(255,255,255,0.1); padding:5px 10px; border-radius:10px;">AI Health: --</div>
        </div>

        <div class="card">
            <h3 style="margin-top:0;">Admin Command</h3>
            <input type="password" id="adminPin" placeholder="Admin PIN">
            <input type="number" id="pPhone" placeholder="Recipient 254...">
            <input type="number" id="pAmount" placeholder="Amount">
            <button onclick="runPush()" class="btn-exec">SEND STK PUSH</button>
        </div>

        <div class="card">
            <h4 style="margin:0 0 10px 0;">Live Activity</h4>
            <div id="activityFeed" style="font-size:13px;">Scanning Bank Nodes...</div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item" onclick="switchTab('vault', this)">💼<br>Vault</div>
        <div class="nav-item" onclick="switchTab('insights', this)">📊<br>Intel</div>
        <div class="nav-item" onclick="switchTab('security', this)">🛡️<br>Secure</div>
    </nav>

    <script>
        function toggleMenu() {
            const d = document.getElementById('drawer');
            d.classList.toggle('open');
            document.getElementById('overlay').style.display = d.classList.contains('open') ? 'block' : 'none';
        }
        function switchTab(id, el) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
        }
        async function runPush() {
            const res = await fetch('/admin/push', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({pin: document.getElementById('adminPin').value, phone: document.getElementById('pPhone').value, amount: document.getElementById('pAmount').value})
            });
            if(res.ok) { alert('Push Sent'); update(); } else { alert('Failed'); }
        }
        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('aiHealth').innerText = 'AI Health: ' + data.aiScore;
                document.getElementById('latencyText').innerText = 'PULSE: OK (' + data.latency + 'ms)';
                const feed = document.getElementById('activityFeed');
                feed.innerHTML = data.transactions.length ? data.transactions.map(t => \`
                    <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee;">
                        <span><b>\${t.phone}</b><br><small>\${t.time}</small></span>
                        <span style="text-align:right;"><b>KES \${t.amount}</b><br><small style="color:\${t.status.includes('Successful') ? 'var(--accent)' : 'var(--red)'}">\${t.status}</small></span>
                    </div>
                \`).join('') : 'No Activity';
            } catch(e) {}
        }
        setInterval(update, 3000);
        update();
    </script>
</body>
</html>
    `);
});
app.listen(process.env.PORT || 3000);
