const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ============================
   CORE SYSTEM LOGIC
============================ */
let transactions = [];
let notifications = [];

const getKenyaTime = () => 
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    if (data.includes('"success"') || data.includes('"completed"') || data.includes('"0"')) return 'Successful ✅';
    if (data.includes('cancel') || data.includes('1032')) return 'Cancelled ❌';
    if (data.includes('timeout') || data.includes('1037')) return 'Timeout ⏳';
    if (data.includes('wrong') || data.includes('pin') || data.includes('2001')) return 'Wrong PIN 🔑';
    if (data.includes('insufficient') || data.includes('1')) return 'Low Balance 💸';
    return 'Processing 🔄';
};

/* ============================
   API LAYER
============================ */

app.get('/api/status', (req, res) => {
    const todayTotal = transactions
        .filter(t => t.status.includes('Successful'))
        .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ 
        transactions, 
        todayTotal, 
        notifications: notifications.slice(0, 5),
        aiScore: 820 
    });
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    
    // Extracted Security Credential from 1st Command
    if (password !== "5566") return res.status(403).send("Unauthorized: Invalid Manager PIN");

    try {
        const response = await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE,
            mobile_number: phone,
            amount: amount,
            email: "princealwyne7@gmail.com",
            callback_url: "https://electronic-pay.onrender.com/callback"
        }, {
            headers: { 
                'X-API-Key': process.env.PAYNECTA_KEY, 
                'Content-Type': 'application/json' 
            }
        });

        const trackingId = response.data.merchant_request_id || response.data.request_id || Date.now();
        
        transactions.unshift({ 
            id: trackingId, 
            phone, 
            amount, 
            status: 'Processing... 🔄', 
            time: getKenyaTime() 
        });

        notifications.unshift({ msg: "STK Sent to " + phone, time: getKenyaTime() });
        if (transactions.length > 20) transactions.pop();
        
        res.redirect('/');
    } catch (err) { 
        res.status(500).send("Gateway Error: " + err.message); 
    }
});

app.post('/callback', (req, res) => {
    const bodyText = JSON.stringify(req.body);
    let tx = transactions.find(t => bodyText.includes(String(t.id)) || bodyText.includes(String(t.phone)));
    if (tx) { 
        tx.status = translateStatus(req.body); 
        notifications.unshift({ msg: "TX Update: " + tx.status, time: getKenyaTime() });
    }
    res.sendStatus(200);
});

/* ============================
   ELITE UI ENGINE
============================ */
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay Elite</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f4f6f9; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #333; padding-bottom: 80px; }
        
        /* Top Navigation */
        .topbar { position:fixed; top:0; width:100%; height:60px; background: var(--primary); color:white; display:flex; align-items:center; justify-content:space-between; padding:0 15px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.1); }
        .logo-area { display:flex; align-items:center; gap:10px; }
        .p-img { width:35px; height:35px; border-radius:50%; border:2px solid var(--accent); }
        
        /* Sidebar */
        .sidebar { position:fixed; left:-280px; top:0; width:280px; height:100%; background:white; z-index:2000; transition:0.3s; box-shadow:5px 0 15px rgba(0,0,0,0.1); padding:20px; box-sizing:border-box; }
        .sidebar.active { left:0; }
        .menu-item { padding:15px; border-bottom:1px solid #eee; font-weight:bold; cursor:pointer; display:flex; align-items:center; gap:10px; }
        
        /* Dashboard Cards */
        .main-container { padding: 75px 15px 20px 15px; }
        .card { background:white; border-radius:20px; padding:20px; box-shadow:0 4px 15px rgba(0,0,0,0.05); margin-bottom:15px; }
        .balance-box { background: linear-gradient(135deg, #0f172a, #1e293b); color:white; }
        
        /* Form Styling */
        input { width:100%; padding:14px; margin:8px 0; border:1px solid #ddd; border-radius:12px; box-sizing:border-box; font-size:16px; }
        .btn-exec { width:100%; padding:16px; background: var(--accent); color:white; border:none; border-radius:12px; font-weight:bold; font-size:16px; cursor:pointer; }
        
        /* History Rows */
        .tx-row { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f9f9f9; font-size:13px; }
        
        /* Bottom Navbar */
        .navbar { position:fixed; bottom:0; width:100%; height:70px; background:white; display:flex; justify-content:space-around; align-items:center; box-shadow:0 -2px 15px rgba(0,0,0,0.1); z-index:1000; }
        .nav-link { text-align:center; font-size:10px; font-weight:bold; color:#64748b; cursor:pointer; }
    </style>
</head>
<body>

    <div class="topbar">
        <div class="logo-area">
            <span onclick="toggleMenu(true)" style="font-size:24px;">☰</span>
            <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" class="p-img">
        </div>
        <div style="font-weight:bold; font-size:14px;">Electronic Pay</div>
        <div style="display:flex; gap:15px; font-size:18px;">
            <span>🔍</span>
            <span style="position:relative;">🔔<small id="notif-count" style="position:absolute; top:-5px; right:-5px; background:red; font-size:8px; padding:2px 4px; border-radius:50%; display:none;">0</small></span>
        </div>
    </div>

    <div id="sidebar" class="sidebar">
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3>Menu</h3>
            <span onclick="toggleMenu(false)" style="font-size:24px;">✕</span>
        </div>
        <div class="menu-item">👤 Profile Settings</div>
        <div class="menu-item">✅ KYC Verification</div>
        <div class="menu-item">⚙️ Global Settings</div>
        <div class="menu-item">💬 Help Center</div>
        <div class="menu-item" style="color:red; margin-top:40px;">🚪 Logout</div>
    </div>

    <div class="main-container">
        <div class="card balance-box">
            <div style="font-size:12px; opacity:0.8;">Total Daily Revenue</div>
            <h1 id="totalRev" style="margin:5px 0;">KES 0</h1>
            <div style="font-size:11px;">AI Health Score: <span id="aiScore">820</span></div>
        </div>

        <div class="card">
            <h3 style="margin-top:0;">Smart Command</h3>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Manager PIN" required>
                <input type="number" name="phone" placeholder="Recipient Phone (254...)" required>
                <input type="number" name="amount" placeholder="Amount (KES)" required>
                <button type="submit" class="btn-exec">SEND STK PUSH</button>
            </form>
        </div>

        <div class="card">
            <h3 style="margin-top:0; font-size:16px;">Live Activity Feed</h3>
            <div id="activityFeed">Loading live data...</div>
        </div>
    </div>

    <div class="navbar">
        <div class="nav-link" onclick="alert('Dashboard')">🏠<br>Dash</div>
        <div class="nav-link" onclick="alert('Vault')">💼<br>Vault</div>
        <div class="nav-link" onclick="alert('Insights')">📊<br>Insights</div>
        <div class="nav-link" onclick="alert('Security')">🔐<br>Security</div>
    </div>

    <script>
        function toggleMenu(show) {
            document.getElementById('sidebar').classList.toggle('active', show);
        }

        async function syncSystem() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('aiScore').innerText = data.aiScore;
                
                const feed = document.getElementById('activityFeed');
                if (data.transactions.length === 0) {
                    feed.innerHTML = '<p style="color:#999; text-align:center;">No recent transactions</p>';
                } else {
                    feed.innerHTML = data.transactions.map(t => \`
                        <div class="tx-row">
                            <div>
                                <b>\${t.phone}</b><br>
                                <small style="color:#999">\${t.time}</small>
                            </div>
                            <div style="text-align:right;">
                                <b style="color:var(--accent)">KES \${t.amount}</b><br>
                                <small style="font-weight:bold; color:\${t.status.includes('Successful') ? 'green' : 'orange'}">\${t.status}</small>
                            </div>
                        </div>
                    \`).join('');
                }
                
                if(data.notifications.length > 0) {
                    const n = document.getElementById('notif-count');
                    n.style.display = 'block';
                    n.innerText = data.notifications.length;
                }

            } catch(e) { console.log("Sync Error"); }
        }

        setInterval(syncSystem, 3000);
        syncSystem();
    </script>
</body>
</html>
    `);
});

app.listen(process.env.PORT || 3000);
