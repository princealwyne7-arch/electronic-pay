const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 
const getKenyaTime = () => new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });

// BRAIN: TRANSLATION & SOUND ENGINE
const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    if (data.includes("success") || data.includes('"0"')) return { status: "Successful ✅", sound: "https://nfc-pro.com/sounds/coins.mp3" };
    if (data.includes("cancel") || data.includes("1032")) return { status: "Cancelled ❌", sound: "https://nfc-pro.com/sounds/alert.mp3" };
    if (data.includes("insufficient")) return { status: "Low Balance 💸", sound: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_0624ed05f2.mp3" };
    return { status: "Processing... 🔄", sound: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" };
};

app.get('/api/status', (req, res) => {
    const successful = transactions.filter(t => t.status.includes('Successful'));
    const todayTotal = successful.reduce((sum, t) => sum + parseInt(t.amount || 0), 0);
    // AI HEALTH SCORE LOGIC (0-1000)
    const healthScore = Math.min(1000, 400 + (successful.length * 15) + (todayTotal / 500));
    res.json({ transactions, todayTotal, healthScore });
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        :root { --cobalt: #0047AB; --emerald: #28a745; --slate: #0f172a; --glass: rgba(255,255,255,0.95); }
        body { font-family: -apple-system, system-ui, sans-serif; background: #f8fafc; margin: 0; color: #1e293b; padding-bottom: 100px; }
        .top-nav { position: fixed; top: 0; width: 100%; height: 65px; background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-sizing: border-box; z-index: 2000; box-shadow: 0 2px 15px rgba(0,0,0,0.04); }
        .tab-content { display: none; padding: 85px 15px 20px 15px; }
        .active-tab { display: block; animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .bank-card { background: linear-gradient(135deg, var(--cobalt), #002d6b); color: white; padding: 25px; border-radius: 24px; box-shadow: 0 12px 30px rgba(0,71,171,0.2); margin-bottom: 20px; }
        .feature-card { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); margin-bottom: 15px; }
        .bottom-nav { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 92%; max-width: 450px; background: var(--glass); backdrop-filter: blur(20px); height: 75px; border-radius: 28px; display: flex; justify-content: space-around; align-items: center; box-shadow: 0 15px 35px rgba(0,0,0,0.12); z-index: 2000; border: 1px solid rgba(255,255,255,0.4); }
        .nav-item { text-align: center; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; cursor: pointer; transition: 0.2s; }
        .nav-item.active { color: var(--cobalt); transform: translateY(-3px); }
        .btn-send { width: 100%; padding: 18px; background: var(--emerald); color: white; border: none; border-radius: 14px; font-weight: bold; font-size: 16px; box-shadow: 0 8px 20px rgba(40,167,69,0.2); }
        input { width: 100%; padding: 15px; margin: 10px 0; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 16px; box-sizing: border-box; }
    </style>
</head>
<body>
    <div class="top-nav">
        <div style="font-size:22px;">☰</div>
        <div style="font-weight:900; letter-spacing:-1px; font-size:18px;">ELECTRONIC <span style="color:var(--emerald)">PAY</span></div>
        <div style="width:35px; height:35px; background:#ddd; border-radius:50%; overflow:hidden;"><img src="https://i.ibb.co/TB5mfxRf/Screenshot-20260122-141635-Tik-Tok.png" style="width:100%;"></div>
    </div>

    <div id="tab-vault" class="tab-content active-tab">
        <div class="bank-card">
            <div style="display:flex; justify-content:space-between; font-size:11px; opacity:0.8;"><span>SMART BALANCE</span> <span id="health-badge" style="background:rgba(255,255,255,0.2); padding:2px 8px; border-radius:10px;">AI Score: --</span></div>
            <div id="total-val" style="font-size:32px; font-weight:800; margin:10px 0;">KES 0.00</div>
            <div style="font-size:11px; color:#4ade80;">Forecast: +KES 12,400 (7 Days)</div>
        </div>
        <div class="feature-card">
            <h3 style="margin-top:0; font-size:15px;">Secure Transfer Center</h3>
            <form action="/push" method="POST">
                <input type="password" name="password" placeholder="Merchant PIN" required>
                <input type="number" name="phone" placeholder="Recipient Phone (254...)" required>
                <input type="number" name="amount" placeholder="Amount (KES)" required>
                <button type="submit" class="btn-send">EXECUTE TRANSACTION</button>
            </form>
        </div>
    </div>

    <div id="tab-insights" class="tab-content">
        <div class="feature-card">
            <h3>AI Spending Analysis</h3>
            <div id="history-list">Analyzing data...</div>
        </div>
    </div>

    <div id="tab-security" class="tab-content">
        <div class="feature-card">
            <h3>Protection Center</h3>
            <div style="display:flex; justify-content:space-between; margin-bottom:15px;"><span>Stealth Mode</span> <input type="checkbox" style="width:auto;"></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:15px;"><span>Panic Lockdown</span> <button style="background:#ef4444; color:white; border:none; border-radius:5px; padding:5px 10px;">ARM</button></div>
            <hr>
            <label style="font-size:11px;">SUCCESS SOUND ENGINE</label>
            <select id="snd_select" onchange="previewSnd()">
                <option value="https://nfc-pro.com/sounds/coins.mp3">1. Royal Gold</option>
                <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">2. Digital Chime</option>
                <option value="https://nfc-pro.com/sounds/success.mp3">3. Modern Beep</option>
            </select>
        </div>
    </div>

    <nav class="bottom-nav">
        <div class="nav-item active" onclick="tab('vault', this)"><div>🏛️</div>VAULT</div>
        <div class="nav-item" onclick="tab('insights', this)"><div>📈</div>INSIGHTS</div>
        <div class="nav-item" onclick="tab('security', this)"><div>🛡️</div>SECURE</div>
    </nav>

    <audio id="player" src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto"></audio>

    <script>
        function tab(id, el) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab'));
            document.getElementById('tab-' + id).classList.add('active-tab');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            el.classList.add('active');
        }
        function previewSnd() {
            const p = document.getElementById('player');
            p.src = document.getElementById('snd_select').value;
            p.play();
        }
        async function sync() {
            try {
                const res = await fetch('/api/status');
                const data = await res.json();
                document.getElementById('total-val').innerText = 'KES ' + data.todayTotal.toLocaleString();
                document.getElementById('health-badge').innerText = 'AI Score: ' + Math.floor(data.healthScore);
                document.getElementById('history-list').innerHTML = data.transactions.map(t => \`
                    <div style="border-bottom:1px solid #f1f5f9; padding:12px 0;">
                        <span style="font-weight:700;">\${t.phone}</span>
                        <span style="float:right; color:var(--emerald); font-weight:800;">KES \${t.amount}</span><br>
                        <small style="color:#64748b;">\${t.time} • \${t.status}</small>
                    </div>\`).join('') || 'No Live Activity';
            } catch(e) {}
        }
        setInterval(sync, 4000); sync();
    </script>
</body>
</html>
    `);
});

app.post('/push', async (req, res) => {
    const { phone, amount, password } = req.body;
    if (password !== "5566") return res.send("Unauthorized");
    try {
        await axios.post('https://paynecta.co.ke/api/v1/payment/initialize', {
            code: process.env.PAYMENT_CODE, mobile_number: phone, amount: amount,
            email: "princealwyne7@gmail.com", callback_url: "https://electronic-pay.onrender.com/callback"
        }, { headers: { 'X-API-Key': process.env.PAYNECTA_KEY } });
        transactions.unshift({ id: Date.now(), phone, amount, status: 'Processing... 🔄', time: getKenyaTime() });
        res.redirect('/');
    } catch (err) { res.redirect('/'); }
});

app.post('/callback', (req, res) => {
    const txInfo = translateStatus(req.body);
    let tx = transactions.find(t => JSON.stringify(req.body).includes(String(t.phone)));
    if (tx) { tx.status = txInfo.status; }
    res.sendStatus(200);
});

app.listen(process.env.PORT || 3000);
