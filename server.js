const express = require('express');
const app = express();
app.use(express.json());

const UI = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: sans-serif; background: #f4f7f6; margin: 0; padding: 20px; padding-bottom: 80px; }
        .page { display: none; }
        .page.active { display: block; }
        .container, .feature-card { background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .nav-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: white; display: flex; justify-content: space-around; padding: 10px 0; border-top: 1px solid #eee; z-index: 1000; }
        .nav-item { font-size: 10px; color: #64748b; border: none; background: none; text-align: center; flex: 1; cursor: pointer; }
        .nav-item.active { color: #28a745; font-weight: bold; }
        input, button { width: 100%; padding: 12px; margin: 8px 0; border-radius: 10px; border: 1px solid #ddd; box-sizing: border-box; }
        button { background: #28a745; color: white; border: none; font-weight: bold; }
    </style>
</head>
<body>
    <div id="p1" class="page active">
        <div class="container">
            <h2 style="text-align:center;">Electronic Pay</h2>
            <div id="tot" style="background:#28a745; color:white; padding:10px; border-radius:10px; text-align:center; font-weight:bold; margin-bottom:15px;">Today: KES 0</div>
            <input placeholder="2547...">
            <input placeholder="Amount">
            <button onclick="alert('Transaction Dashboard Active')">SEND STK PUSH</button>
        </div>
        <div class="feature-card">
            <h3>Live Activity</h3>
            <div id="history-list">No activity found</div>
        </div>
    </div>

    <div id="p2" class="page">
        <div class="feature-card">
            <h3>🎯 Daily Sales Goal</h3>
            <div style="background:#eee; height:10px; border-radius:5px;"><div id="goalBar" style="background:#28a745; height:100%; width:0%; border-radius:5px;"></div></div>
            <p id="goalPercent" style="text-align:right;">0%</p>
        </div>
        <div class="feature-card"><h3>💳 Wallet Summary</h3><h1 id="walletBal">KES 0</h1></div>
    </div>

    <div id="p3" class="page">
        <div class="feature-card"><h3>🧮 Business Tools</h3><button>Open Calculator</button></div>
    </div>

    <div class="nav-bar">
        <div class="nav-item active" onclick="showPage('p1', this)">🏠<br>Home</div>
        <div class="nav-item" onclick="showPage('p2', this)">📈<br>Stats</div>
        <div class="nav-item" onclick="showPage('p3', this)">🛠️<br>Tools</div>
    </div>

    <script>
        function showPage(id, el) {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
            window.scrollTo(0,0);
        }
        function up() {
            fetch('/status').then(r => r.json()).then(d => {
                document.getElementById('tot').innerText = 'Today: KES ' + d.todayTotal;
                if(document.getElementById('walletBal')) document.getElementById('walletBal').innerText = 'KES ' + d.todayTotal;
            });
        }
        setInterval(up, 3000);
    </script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(UI));
app.get('/status', (req, res) => res.json({ todayTotal: 0, history: [] }));
app.listen(process.env.PORT || 3000);