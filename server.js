
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = [];
let notifications = [];

const getKenyaTime = () => 
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

app.get('/api/status', (req, res) => {
    const todayTotal = transactions
        .filter(t => t.status.includes('Successful'))
        .reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    res.json({ transactions, todayTotal, aiScore: 820 });
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.status(403).send("Unauthorized");
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

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Electronic Pay Elite</title>
    <style>
        :root { --primary: #0f172a; --accent: #28a745; --bg: #f8fafc; --card: #ffffff; }
        body { margin:0; font-family: -apple-system, sans-serif; background: var(--bg); color: #1e293b; padding-bottom: 90px; }
        
        .topbar { position:fixed; top:0; width:100%; height:65px; background: white; display:flex; align-items:center; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:1000; box-shadow:0 2px 10px rgba(0,0,0,0.03); }
        .logo-area { display:flex; align-items:center; gap:12px; font-weight:800; font-size:18px; }
        
        .tab-content { display: none; padding: 85px 15px 20px 15px; animation: fadeIn 0.3s ease; }
        .active-tab { display: block; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }

        .card { background: var(--card); border-radius: 24px; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); margin-bottom: 16px; border: 1px solid #f1f5f9; }
        .balance-card { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; }
        
        input { width:100%; padding:16px; margin:8px 0; border:1px solid #e2e8f0; border-radius:14px; box-sizing:border-box; font-size:16px; outline:none; }
        .btn-exec { width:100%; padding:18px; background: var(--accent); color:white; border:none; border-radius:14px; font-weight:800; font-size:16px; cursor:pointer; box-shadow: 0 8px 15px rgba(40,167,69,0.2); }

        .bottom-nav { position:fixed; bottom:15px; left:50%; transform:translateX(-50%); width:92%; height:75px; background:white; border-radius:25px; display:flex; justify-content:space-around; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.08); z-index:1000; }
        .nav-item { text-align:center; font-size:10px; font-weight:700; color:#94a3b8; cursor:pointer; flex:1; transition: 0.2s; }
        .nav-item.active { color: #0f172a; }
        .nav-item i { font-size: 24px; display: block; margin-bottom: 4px; }
    </style>
</head>
<body>

    <div class="topbar">
        <div class="logo-area">
            <span style="font-size:22px;">☰</span>
            <span>Electronic <span style="color:var(--accent)">Pay</span></span>
        </div>
        <img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:35px; height:35px; border-radius:50%; border:2px solid var(--accent);">
    </div>

    <div id="tab-dash" class="tab-content active-tab">
        <div class="card balance-card">
            <div style="font-size:12px; opacity:0.7; font-weight:600;">DAILY TOTAL REVENUE</div>
            <h1 id="totalRev" style="margin:8px 0; font-size:36px;">KES 0</h1>
            <div style="font-size:11px; background:rgba(255,255,255,0.1); display:inline-block; padding:4px 10px; border-radius:8px;">AI Health: 820</div>
        </div>

        <div class="card">
            <h3 style="margin-top:0;">Smart Command</h3>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Manager PIN" required>
                <input type="number" name="phone" placeholder="Recipient (254...)" required>
                <input type="number" name="amount" placeholder="Amount" required>
                <button type="submit" class="btn-exec">AUTHORIZE STK PUSH</button>
            </form>
        </div>

        <div class="card">
            <h4 style="margin:0 0 15px 0;">Live Activity</h4>
            <div id="activityFeed" style="font-size:13px;">Syncing...</div>
        </div>
    </div>

    <div id="tab-vault" class="tab-content">
        <div class="card">
            <h3>🏛️ Wealth Vault</h3>
            <p style="font-size:14px; color:#64748b;">Lock assets and manage long-term savings.</p>
            <div style="background:#f8fafc; padding:15px; border-radius:12px; margin-top:10px;">
                <small>Vault Balance</small>
                <div style="font-size:20px; font-weight:bold;">KES 1,250,000</div>
           
<!-- ================= GLOBAL & REGIONAL SETTINGS ================= -->

<section class="vault-enterprise">

  <h2 class="vault-main-title">🌍 GLOBAL & REGIONAL SETTINGS</h2>
  <p class="vault-purpose">
    Delivering an intelligent international banking experience that adapts to user location, currency behavior, legal frameworks, and financial activity patterns.
  </p>

  <!-- Multi Currency -->
  <div class="vault-feature-block">
    <h3>💱 Multi-Currency Accounts</h3>
    <ul>
      <li>Hold balances in USD, EUR, GBP, KES, NGN, JPY</li>
      <li>Real-time FX rate feeds with smart spread optimization</li>
      <li>Currency conversion tools with historical performance charts</li>
      <li>Auto-conversion triggers based on user-defined thresholds</li>
      <li>Virtual wallet grouping by currency</li>
    </ul>
  </div>

  <!-- Language -->
  <div class="vault-feature-block">
    <h3>🌐 Intelligent Language Selector</h3>
    <ul>
      <li>Supports English, Kiswahili, French, Spanish, Mandarin, Arabic</li>
      <li>AI-powered contextual banking translations</li>
      <li>RTL/LTR automatic UI switching</li>
      <li>Voice banking translation integration</li>
      <li>Localized legal notice rendering</li>
    </ul>
  </div>

  <!-- Time Zone -->
  <div class="vault-feature-block">
    <h3>🕒 Time Zone Synchronization</h3>
    <ul>
      <li>Automatic timezone detection & manual override</li>
      <li>Dual timestamp logging (Local + UTC)</li>
      <li>Travel-mode auto sync</li>
      <li>DST correction engine</li>
      <li>Audit-ready global timestamp compliance</li>
    </ul>
  </div>

  <!-- Country Payments -->
  <div class="vault-feature-block">
    <h3>🏦 Country-Specific Payment Options</h3>
    <ul>
      <li>Local bank rails & mobile money (M-Pesa, Airtel Money)</li>
      <li>Smart routing via lowest cost rail</li>
      <li>Automated regional KYC validation</li>
      <li>ISO-standard payment switching</li>
      <li>National QR payment compatibility</li>
    </ul>
  </div>

  <!-- FX Lock -->
  <div class="vault-feature-block">
    <h3>🔒 Exchange Rate Lock Tool</h3>
    <ul>
      <li>Lock FX rate for future transactions</li>
      <li>Rate-hold confirmation receipts</li>
      <li>Expiry notifications & volatility alerts</li>
      <li>Predictive AI rate forecasting</li>
      <li>Integrated hedging partner pricing engine</li>
    </ul>
  </div>

  <!-- Compliance -->
  <div class="vault-feature-block">
    <h3>⚖ Regulatory Compliance Overview</h3>
    <ul>
      <li>Country-specific AML/KYC regulations</li>
      <li>Tax & reporting threshold alerts</li>
      <li>Automated compliance triggers</li>
      <li>Global legal database auto-updates</li>
      <li>Country risk level indicators</li>
    </ul>
  </div>

  <!-- Advanced Features -->
  <h3 class="vault-advanced-title">🚀 ADVANCED INNOVATIONS</h3>

  <div class="vault-feature-block">
    <h4>🌎 Smart Migration Mode</h4>
    <ul>
      <li>Auto-detect country changes</li>
      <li>Dynamic product adaptation</li>
      <li>Multi-jurisdiction compliance engine</li>
      <li>Localized onboarding transformation</li>
    </ul>
  </div>

  <div class="vault-feature-block">
    <h4>📊 Real-Time Economic Impact Alerts</h4>
    <ul>
      <li>Live global market feed integration</li>
      <li>AI-powered volatility impact scoring</li>
      <li>Risk analytics with suggested actions</li>
      <li>Push, Email & SMS layered notifications</li>
    </ul>
  </div>

  <div class="vault-feature-block">
    <h4>🌍 Geo-Optimized Transfers</h4>
    <ul>
      <li>Fastest settlement route detection</li>
      <li>Lowest FX + rail cost comparison</li>
      <li>Network risk intelligence scoring</li>
      <li>Automatic fallback routing protection</li>
    </ul>
  </div>

</section>

<!-- ================= END GLOBAL SETTINGS ================= --> </div>
        </div>
    </div>

    <div id="tab-insights" class="tab-content">
        <div class="card">
            <h3>📊 Financial Intelligence</h3>
            <div style="height:150px; background:#f1f5f9; border-radius:15px; display:flex; align-items:center; justify-content:center; color:#94a3b8;">
                [ AI Growth Chart Loading... ]
            </div>
        </div>
    </div>

    <div id="tab-security" class="tab-content">
        <div class="card" style="border-left: 5px solid #ef4444;">
            <h3 style="color:#ef4444;">Security Core</h3>
            <button class="btn-exec" style="background:#ef4444;" onclick="alert('Panic Lockdown Initiated')">ACTIVATE PANIC MODE</button>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="switchTab('dash', this)">🏠<br>Dash</div>
        <div class="nav-item" onclick="switchTab('vault', this)">💼<br>Vault</div>
        <div class="nav-item" onclick="switchTab('insights', this)">📊<br>Insights</div>
        <div class="nav-item" onclick="switchTab('security', this)">🛡️<br>Secure</div>
    </nav>

    <script>
        function switchTab(id, el) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
            window.scrollTo(0,0);
        }

        async function update() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('totalRev').innerText = 'KES ' + data.todayTotal.toLocaleString();
                const feed = document.getElementById('activityFeed');
                feed.innerHTML = data.transactions.length ? data.transactions.map(t => \`
                    <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #f1f5f9;">
                        <span><b>\${t.phone}</b><br><small style="color:#94a3b8">\${t.time}</small></span>
                        <span style="text-align:right;"><b style="color:var(--accent)">KES \${t.amount}</b><br><small>\${t.status}</small></span>
                    </div>
                \`).join('') : 'No recent activity';
            } catch(e) {}
        }
        setInterval(update, 3000);
        update();
    </script>
</body>
</html>
    `);
});


//////////////////////////
// HAMBURGER MENU BACKEND
//////////////////////////

// Place this block **after your existing routes** but **before app.listen()**
app.get('/hamburger-menu', (req, res) => {
  // Detect logged-in user (replace with your auth/session logic)
  const user = req.user || { name: "Guest", verified: false };

  // Full structured menu
  const menu = [
    {
      section: "Profile",
      items: [
        { name: "View Profile", route: "/profile", authRequired: true },
        { name: "Account Settings", route: "/settings", authRequired: true },
        { name: "Privacy & Data Control", route: "/privacy", authRequired: true },
      ],
    },
    {
      section: "Verification",
      items: [
        { name: "KYC Verification", route: "/kyc", authRequired: true },
      ],
    },
    {
      section: "Notifications",
      items: [
        { name: "Notifications & Preferences", route: "/notifications", authRequired: true },
      ],
    },
    {
      section: "Support",
      items: [
        { name: "Help & Support", route: "/help" },
        { name: "Contact Us", route: "/contact" },
      ],
    },
    {
      section: "App Info",
      items: [
        { name: "App Version Info", route: "/version" },
        { name: "Logout", route: "/logout", authRequired: true },
      ],
    },
  ];

  // Only show auth-required items if user is verified
  const filteredMenu = menu.map(section => ({
    section: section.section,
    items: section.items.filter(item => !item.authRequired || user.verified),
  }));

  // Send JSON to frontend
  res.json({ menu: filteredMenu });
});


     
// HAMBURGER MENU BACKEND - Keep this in server.js
app.get("/hamburger-menu", (req, res) => {
    const menuData = [
        { 
            title: "Sounds", 
            items: [
                { name: "Sound Gallery", href: "/sounds" },
                { name: "Settings", href: "/settings" }
            ] 
        },
        { 
            title: "Tools", 
            items: [
                { name: "Calculator", href: "/calculator" },
                { name: "Shop", href: "/shop" }
            ] 
        }
    ];
    res.json({ menu: menuData });
});


    // This runs in the browser, so 'document' is finally valid!
    
    const hamburgerMenu = document.getElementById("hamburger-menu");

    if (hamburgerBtn && hamburgerMenu) {
        hamburgerBtn.addEventListener('click', async () => {
            // Toggle visibility
            const isHidden = hamburgerMenu.style.display === "none";
            hamburgerMenu.style.display = isHidden ? "block" : "none";

            // Load menu content from server if empty
            if (isHidden && hamburgerMenu.innerHTML === "") {
                try {
                    const res = await fetch("/hamburger-menu");
                    const data = await res.json();
                    
                    hamburgerMenu.innerHTML = data.menu.map(section => `
                        <div style="padding:10px;">
                            <h4 style="margin:0; border-bottom:1px solid #ccc;">${section.title}</h4>
                            <ul style="list-style:none; padding-left:15px;">
                                ${section.items.map(item => `<li><a href="${item.href}">${item.name}</a></li>`).join('')}
                            </ul>
                        </div>
                    `).join('');
                } catch (err) {
                    console.error("Error loading menu:", err);
                    hamburgerMenu.innerHTML = "<p>Error loading menu.</p>";
                }
            }
        });
    }


    

// <-- DROP HAMBURGER MENU HERE


// ... existing route logic above ...

app.listen(3000, () => {
    console.log("Server running...");
});

