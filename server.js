const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 
const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

// Central Status Engine - This talks to all features
app.get('/api/status', (req, res) => {
    const successful = transactions.filter(t => t.status.includes('Successful'));
    const total = successful.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ 
        transactions, 
        todayTotal: total,
        aiScore: 845,
        netWorth: 1240500 + total,
        revenue: (total * 0.85).toFixed(0)
    });
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay | Ultra Elite</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root { --cobalt: #0047AB; --emerald: #28a745; --slate: #1e293b; --danger: #ef4444; --glass: rgba(255,255,255,0.95); }
        body { font-family: 'Inter', sans-serif; background: #f4f7fe; margin: 0; color: var(--slate); overflow-x: hidden; padding-bottom: 90px; }
        
        /* Top Navigation Bar */
        .top-bar { position: fixed; top: 0; width: 100%; height: 65px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; box-sizing: border-box; z-index: 2000; box-shadow: 0 2px 15px rgba(0,0,0,0.05); }
        .nav-icons-left { display: flex; align-items: center; gap: 15px; }
        .icon-btn { font-size: 20px; cursor: pointer; color: var(--slate); position: relative; }
        .notify-badge { position: absolute; top: -5px; right: -5px; background: var(--danger); color: white; font-size: 9px; padding: 2px 5px; border-radius: 10px; border: 2px solid white; }
        
        /* Sidebar Navigation */
        .sidebar { position: fixed; left: -280px; top: 0; width: 280px; height: 100%; background: white; z-index: 3000; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 10px 0 40px rgba(0,0,0,0.1); padding: 25px; box-sizing: border-box; }
        .sidebar.active { left: 0; }
        .sidebar-item { padding: 15px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px; font-weight: 600; font-size: 14px; cursor: pointer; color: var(--slate); }
        .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 2500; display: none; backdrop-filter: blur(4px); }
        .overlay.active { display: block; }

        /* Hub Content Shields */
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: slideUp 0.4s ease; }
        .active-tab { display: block; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* Smart UI Components */
        .hub-card { background: white; border-radius: 24px; padding: 20px; box-shadow: 0 8px 30px rgba(0,0,0,0.04); margin-bottom: 15px; border: 1px solid rgba(0,0,0,0.02); }
        .balance-card { background: linear-gradient(135deg, var(--cobalt), #002f75); color: white; padding: 25px; border-radius: 25px; position: relative; overflow: hidden; }
        .ai-badge { background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 10px; font-size: 10px; font-weight: 800; letter-spacing: 1px; }
        
        input { width: 100%; padding: 16px; margin: 10px 0; border: 1.5px solid #eee; border-radius: 15px; font-size: 15px; box-sizing: border-box; outline: none; transition: 0.3s; }
        input:focus { border-color: var(--cobalt); box-shadow: 0 0 10px rgba(0,71,171,0.1); }
        .btn-exec { width: 100%; padding: 18px; background: var(--emerald); color: white; border: none; border-radius: 15px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(40,167,69,0.2); }

        /* Bottom Tab Navigation */
        .bottom-nav { position: fixed; bottom: 15px; left: 50%; transform: translateX(-50%); width: 92%; max-width: 450px; background: var(--glass); backdrop-filter: blur(20px); height: 75px; border-radius: 30px; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 15px 40px rgba(0,0,0,0.12); z-index: 2000; border: 1px solid rgba(255,255,255,0.5); }
        .nav-item { text-align: center; color: #94a3b8; cursor: pointer; transition: 0.3s; flex: 1; }
        .nav-item.active { color: var(--cobalt); transform: translateY(-8px); }
        .nav-item.active .nav-dot { width: 5px; height: 5px; background: var(--cobalt); border-radius: 50%; margin: 4px auto 0; }
        
        /* Micro Features */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .tool-btn { background: #f8fafc; padding: 15px; border-radius: 18px; text-align: center; font-size: 11px; font-weight: 700; border: 1px solid #f1f5f9; }
    </style>
</head>
<body>

    <div class="top-bar">
        <div class="nav-icons-left">
            <div class="icon-btn" onclick="toggleMenu(true)">☰</div>
            <div class="icon-btn" onclick="showSearch()">🔍</div>
            <div class="icon-btn" onclick="showNotify()">🔔<span class="notify-badge">3</span></div>
        </div>
        <div style="font-weight: 800; letter-spacing: -1px; font-size: 18px;">ELITE <span style="color:var(--emerald)">PAY</span></div>
        <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; height:35px; border-radius:50%; border:2px solid var(--emerald);">
    </div>

    <div id="sidebar" class="sidebar">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <span style="font-weight:800; font-size:20px;">Menu</span>
            <div onclick="toggleMenu(false)" style="font-size:24px;">✕</div>
        </div>
        <div class="sidebar-item">👤 Profile</div>
        <div class="sidebar-item">⚙️ Account Settings</div>
        <div class="sidebar-item">✅ KYC Verification</div>
        <div class="sidebar-item">🛡️ Privacy & Data</div>
        <div class="sidebar-item">💬 Help & Support</div>
        <div class="sidebar-item" style="color:var(--danger); margin-top:50px;">🚪 Logout</div>
        <div style="font-size:10px; color:#ccc; margin-top:20px; text-align:center;">App Version 4.0.2-Elite</div>
    </div>
    <div id="overlay" class="overlay" onclick="toggleMenu(false)"></div>

    <div id="tab-dashboard" class="tab-content active-tab">
        <div class="balance-card">
            <div style="display:flex; justify-content:space-between; align-items:start;">
                <div>
                    <div style="font-size:12px; opacity:0.8; font-weight:600;">Net Worth Overview</div>
                    <div id="netWorth" style="font-size:32px; font-weight:800; margin:5px 0;">KES 1,240,500</div>
                </div>
                <div class="ai-badge">AI SCORE: 845</div>
            </div>
            <div style="margin-top:15px; font-size:11px; display:flex; gap:15px;">
                <span>📈 30D Forecast: <b style="color:#4ade80;">+12.5%</b></span>
                <span>🛡️ Risk: <b style="color:#4ade80;">LOW</b></span>
            </div>
        </div>

        <div class="grid-2" style="margin-top:15px;">
            <div class="hub-card" style="margin-bottom:0; padding:15px;">
                <div style="font-size:10px; color:#64748b; font-weight:800;">DAILY REVENUE</div>
                <div id="revTotal" style="font-size:18px; font-weight:800; color:var(--emerald);">KES 0</div>
            </div>
            <div class="hub-card" style="margin-bottom:0; padding:15px;">
                <div style="font-size:10px; color:#64748b; font-weight:800;">FX RATE (USD)</div>
                <div style="font-size:18px; font-weight:800; color:var(--cobalt);">129.45</div>
            </div>
        </div>

        <div class="hub-card" style="margin-top:15px;">
            <h4 style="margin:0 0 15px 0;">Smart Command Center</h4>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Secure Terminal PIN" required>
                <input type="number" name="phone" placeholder="Mobile Number (254...)" required>
                <input type="number" name="amount" placeholder="Injection Amount" required>
                <button type="submit" class="btn-exec">EXECUTE INSTANT TRANSFER</button>
            </form>
        </div>
    </div>

    <div id="tab-payments" class="tab-content">
        <div class="hub-card">
            <h3>Payments & Global Transfers</h3>
            <div class="grid-2">
                <div class="tool-btn">🌍 SWIFT/IBAN</div>
                <div class="tool-btn">📱 M-PESA</div>
                <div class="tool-btn">🛡️ Escrow Mode</div>
                <div class="tool-btn">🕵️ Stealth Pay</div>
            </div>
            <hr style="opacity:0.05; margin:20px 0;">
            <div id="tx-history" style="font-size:12px;">
                <p style="color:#94a3b8; text-align:center;">Synchronizing encrypted ledger...</p>
            </div>
        </div>
    </div>

    <div id="tab-security" class="tab-content">
        <div class="hub-card" style="border-left: 5px solid var(--danger);">
            <h3 style="color:var(--danger); margin-top:0;">Advanced Protection</h3>
            <div style="display:flex; justify-content:space-between; margin:15px 0; font-size:13px;">
                <span>Invisible Background Shield</span>
                <span style="color:var(--emerald); font-weight:800;">ACTIVE</span>
            </div>
            <button onclick="panic()" style="width:100%; padding:20px; background:var(--danger); color:white; border:none; border-radius:15px; font-weight:900;">ACTIVATE PANIC LOCKDOWN</button>
        </div>
        <div class="grid-2">
            <div class="tool-btn">🔑 2FA Manager</div>
            <div class="tool-btn">💳 Freeze Card</div>
            <div class="tool-btn">🛰️ Geo-Fencing</div>
            <div class="tool-btn">🌑 Dark Web Scan</div>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="tab('dashboard', this)">
            <div style="font-size:22px;">🏛️</div><div style="font-size:9px; font-weight:800;">DASH</div><div class="nav-dot"></div>
        </div>
        <div class="nav-item" onclick="tab('payments', this)">
            <div style="font-size:22px;">💸</div><div style="font-size:9px; font-weight:800;">PAY</div><div class="nav-dot"></div>
        </div>
        <div class="nav-item" onclick="tab('security', this)">
            <div style="font-size:22px;">🛡️</div><div style="font-size:9px; font-weight:800;">SECURE</div><div class="nav-dot"></div>
        </div>
        <div class="nav-item" onclick="tab('dashboard', this)"> <div style="font-size:22px;">💎</div><div style="font-size:9px; font-weight:800;">VAULT</div><div class="nav-dot"></div>
        </div>
    </nav>

    <audio id="successSound" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>

    <script>
        function toggleMenu(open) {
            document.getElementById('sidebar').classList.toggle('active', open);
            document.getElementById('overlay').classList.toggle('active', open);
        }
        
        function tab(id, el) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
            window.scrollTo(0,0);
        }

        function panic() {
            if(confirm("ALERT: Lockdown System and Notify Authorities?")) {
                document.body.style.filter = "grayscale(100%) blur(5px)";
                alert("SYSTEM SECURED. ALL OUTBOUND TRANSFERS REJECTED.");
            }
        }

        async function refreshBrain() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('netWorth').innerText = 'KES ' + data.netWorth.toLocaleString();
                document.getElementById('revTotal').innerText = 'KES ' + data.todayTotal.toLocaleString();
                
                const list = document.getElementById('tx-history');
                if(data.transactions.length > 0) {
                    list.innerHTML = data.transactions.map(t => \`
                        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f9fafb;">
                            <span><b>\${t.phone}</b><br><small style="color:#94a3b8">\${t.time}</small></span>
                            <span style="text-align:right;"><b style="color:var(--emerald)">KES \${t.amount}</b><br><small>\${t.status}</small></span>
                        </div>
                    \`).join('');
                }
            } catch(e) {}
        }

        setInterval(refreshBrain, 5000);
        refreshBrain();
    </script>
</body>
</html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Forbidden: Invalid Security Authorization");
    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, {
            headers: { 'X-API-Key': process.env.PAYNECTA_KEY, 'Content-Type': 'application/json' }
        });
        const trackingId = response.data.merchant_request_id || Date.now();
        transactions.unshift({ id: trackingId, phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/callback', (req, res) => {
    const bodyText = JSON.stringify(req.body);
    let tx = transactions.find(t => bodyText.includes(String(t.phone)));
    if (tx) { tx.status = "Successful ✅"; }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
