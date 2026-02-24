const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SYSTEM DATA ENGINES
let transactions = [];
const soundLibrary = Array.from({ length: 15 }, (_, i) => `sys_fx_${i + 1}.mp3`);

const getKenyaTime = () => 
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

// API: AI HEALTH & SYSTEM STATUS
app.get('/api/status', (req, res) => {
    const successfulTxs = transactions.filter(t => t.status.includes('Successful'));
    const todayTotal = successfulTxs.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    
    // Dynamic AI Health Logic
    const baseScore = 800;
    const aiScore = Math.min(999, baseScore + (successfulTxs.length * 12));
    
    res.json({ transactions, todayTotal, aiScore, soundCount: soundLibrary.length });
});

// ADMIN ENGINE: AUTHORIZE STK PUSH
app.post('/admin/push', async (req, res) => {
    const { phone, amount, pin } = req.body;
    // Bank-grade authorization check
    if (pin !== "5566") return res.status(403).json({ error: "Access Denied" });

    const trackingId = `BNK-${Date.now()}`;
    transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });

    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, {
            headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' }
        });
        res.json({ success: true, trackingId });
    } catch (err) { 
        if(transactions[0]) transactions[0].status = "Failed ❌";
        res.status(500).json({ success: false });
    }
});

// CALLBACK ENGINE
app.post('/callback', (req, res) => {
    const { merchant_request_id, state, status } = req.body;
    let tx = transactions.find(t => String(t.id).includes(merchant_request_id));
    if (tx) {
        tx.status = (state === 'completed' || status === 'success') ? "Successful ✅" : "Cancelled ⚠️";
    }
    res.sendStatus(200);
});

// UNIFIED UI ENGINE (Client + Admin Sides)
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay Banking</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; --card: #ffffff; --red: #ef4444; }
        body { margin:0; font-family: -apple-system, system-ui, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; overflow-x: hidden; }
        
        /* TOPBAR & MENU */
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .side-drawer { position:fixed; left:-280px; top:0; width:280px; height:100%; background:var(--primary); z-index:2000; transition:0.3s cubic-bezier(0.4, 0, 0.2, 1); padding:20px; box-sizing:border-box; color:white; }
        .side-drawer.open { left:0; }
        .overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:none; z-index:1999; }
        .drawer-item { padding:15px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; gap:12px; color:white; text-decoration:none; font-size:14px; }

        /* TABS & LAYOUT */
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.3s ease; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; } }
        
        .card { background: var(--card); border-radius: 24px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; position: relative; overflow: hidden; }
        
        /* ADMIN/CLIENT TOGGLE */
        .mode-badge { position: absolute; top: 15px; right: 15px; font-size: 10px; background: var(--accent); padding: 4px 8px; border-radius: 10px; font-weight: bold; }
        
        input { width:100%; padding:16px; margin:8px 0; border:1px solid #e2e8f0; border-radius:14px; box-sizing:border-box; font-size:16px; outline:none; transition: 0.2s; }
        input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(40,167,69,0.1); }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:800; font-size:16px; cursor:pointer; box-shadow: 0 4px 12px rgba(40,167,69,0.2); }

        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; cursor:pointer; flex:1; transition: 0.2s; }
        .nav-item.active { color: var(--primary); transform: translateY(-3px); }
    </style>
</head>
<body>
    <div class="overlay" id="overlay" onclick="toggleMenu()"></div>
    
    <div class="side-drawer" id="drawer">
        <div style="margin-bottom:30px;">
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:50px; border-radius:50%; border:2px solid var(--accent);">
            <div style="margin-top:10px; font-weight:bold;">Manager Admin</div>
            <div style="font-size:11px; color:var(--accent);">Global Banking Status ●</div>
        </div>
        <a href="#" class="drawer-item" onclick="toggleMenu()">👤 User Profile & Badge</a>
        <a href="#" class="drawer-item" onclick="toggleMenu()">⚙️ Account Settings</a>
        <a href="#" class="drawer-item" onclick="toggleMenu()">🛡️ Security & Notifications</a>
        <a href="#" class="drawer-item" onclick="toggleMenu()">🆔 KYC Verification</a>
        <a href="#" class="drawer-item" onclick="toggleMenu()">🎧 Help & Support</a>
        <a href="#" class="drawer-item" onclick="toggleMenu()">⚖️ Legal & Privacy</a>
        <div style="position:absolute; bottom:20px; width:80%; font-size:10px; opacity:0.4;">Banking Logic v2.1 | Encrypted</div>
    </div>

    <div class="topbar">
        <div style="display:flex; align-items:center; gap:15px;">
            <span id="menuBtn" style="font-size:24px; cursor:pointer;" onclick="toggleMenu()">☰</span>
            <span style="font-weight:800; font-size:18px;">Electronic <span style="color:var(--accent)">Pay</span></span>
        </div>
        <div id="adminToggle" onclick="toggleAdminMode()" style="cursor:pointer;">
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; height:35px; border-radius:50%; border:2px solid var(--accent);">
        </div>
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <div class="mode-badge" id="modeLabel">CLIENT MODE</div>
            <div style="font-size:12px; opacity:0.8;">TOTAL BANK VOLUME</div>
            <h1 id="totalRev" style="margin:8px 0; font-size:36px;">KES 0</h1>
            <div id="aiHealth" style="font-size:11px; background:rgba(255,255,255,0.1); display:inline-block; padding:5px 12px; border-radius:10px; font-weight:bold;">AI Health: --</div>
        </div>

        <div class="card" id="adminControl" style="display:none;">
            <h3 style="margin-top:0;">Admin Command Center</h3>
            <input type="password" id="adminPin" placeholder="Manager Secure PIN">
            <input type="number" id="pushPhone" placeholder="Recipient (254...)">
            <input type="number" id="pushAmount" placeholder="Amount (KES)">
            <button onclick="executePush()" class="btn-exec">INITIALIZE SECURE PUSH</button>
        </div>

        <div class="card">
            <h4 style="margin:0 0 15px 0; display:flex; justify-content:space-between;">
                <span>Live Activity</span>
                <span style="font-size:10px; color:var(--accent);">REAL-TIME</span>
            </h4>
            <div id="activityFeed" style="font-size:13px;">Linking to Bank Nodes...</div>
        </div>
    </div>

    <div id="tab-vault" class="tab-content"><div class="card"><h3>🏛️ Global Vault</h3><p>Locked assets for production.</p></div></div>
    <div id="tab-insights" class="tab-content"><div class="card"><h3>📊 Intel Engine</h3><p>Market AI analysis.</p></div></div>
    <div id="tab-security" class="tab-content"><div class="card"><h3>🛡️ Security Core</h3><button class="btn-exec" style="background:var(--red);" onclick="alert('System Lockdown Active')">EMERGENCY SHUTDOWN</button></div></div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item" onclick="switchTab('vault', this)">💼<br>Vault</div>
        <div class="nav-item" onclick="switchTab('insights', this)">📊<br>Intel</div>
        <div class="nav-item" onclick="switchTab('security', this)">🛡️<br>Secure</div>
    </nav>

    <script>
        let isAdmin = false;

        function toggleMenu() {
            document.getElementById('drawer').classList.toggle('open');
            document.getElementById('overlay').style.display = document.getElementById('drawer').classList.contains('open') ? 'block' : 'none';
        }

        function toggleAdminMode() {
            isAdmin = !isAdmin;
            document.getElementById('adminControl').style.display = isAdmin ? 'block' : 'none';
            document.getElementById('modeLabel').innerText = isAdmin ? 'ADMIN MODE' : 'CLIENT MODE';
            document.getElementById('modeLabel').style.background = isAdmin ? 'var(--red)' : 'var(--accent)';
        }

        function switchTab(id, el) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
        }

        async function executePush() {
            const data = {
                pin: document.getElementById('adminPin').value,
                phone: document.getElementById('pushPhone').value,
                amount: document.getElementById('pushAmount').value
            };
            try {
                const res = await fetch('/admin/push', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if(result.success) {
                    alert('STK Push Initialized Successfully');
                    update();
                } else {
                    alert('Authorization Error');
                }
            } catch(e) { alert('Connection Error'); }
        }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('aiHealth').innerText = 'AI Health: ' + data.aiScore;
                
                const feed = document.getElementById('activityFeed');
                feed.innerHTML = data.transactions.length ? data.transactions.map(t => \`
                    <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9;">
                        <span><b>\${t.phone}</b><br><small style="color:#94a3b8">\${t.time}</small></span>
                        <span style="text-align:right;"><b style="color:var(--accent)">KES \${t.amount}</b><br>
                        <small style="font-weight:bold; color:\${t.status.includes('Successful') ? 'var(--accent)' : t.status.includes('Cancelled') ? 'var(--red)' : '#f59e0b'}">\${t.status}</small></span>
                    </div>
                \`).join('') : 'No Recent Activity';
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
