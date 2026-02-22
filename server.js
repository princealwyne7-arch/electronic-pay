const express = require('express');
const app = express();
app.use(express.json());
let history = [];

app.get('/', (req, res) => {
    res.send("""
    <html>
    <head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
            body { font-family: sans-serif; background: #f4f7f6; margin: 0; padding: 20px; padding-bottom: 80px; }
            .page { display: none; }
            .page.active { display: block; }
            .container, .feature-card { background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; }
            .nav-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: white; display: flex; justify-content: space-around; padding: 10px 0; border-top: 1px solid #eee; z-index: 1000; }
            .nav-item { font-size: 10px; color: #64748b; border: none; background: none; text-align: center; flex: 1; }
            .nav-item.active { color: #28a745; font-weight: bold; }
            input, button { width: 100%; padding: 12px; margin: 8px 0; border-radius: 10px; border: 1px solid #ddd; box-sizing: border-box; }
            button { background: #28a745; color: white; border: none; font-weight: bold; }
        </style>
    </head>
    <body>
        <div id='p1' class='page active'>
            <div class='container'>
                <h2 style='text-align:center;'>Electronic Pay</h2>
                <div id='tot' style='background:#28a745; color:white; padding:10px; border-radius:10px; text-align:center; font-weight:bold; margin-bottom:15px;'>Today: KES 0</div>
                <input id='phone' placeholder='2547...'>
                <input id='amount' placeholder='Amount'>
                <button onclick='alert("STK Sent")'>SEND STK PUSH</button>
            </div>
            <div class='feature-card'>
                <h3>Live Activity</h3>
                <div id='history-list'>Waiting for data...</div>
            </div>
        </div>

        <div id='p2' class='page'>
            <div class='feature-card'>
                <h3>🎯 Daily Sales Goal</h3>
                <div style='background:#eee; height:10px; border-radius:5px;'><div id='goalBar' style='background:#28a745; height:100%; width:0%; transition: 0.5s;'></div></div>
                <p id='goalPercent' style='text-align:right;'>0%</p>
            </div>
            <div class='feature-card'><h3>💳 Merchant Wallet</h3><h1 id='walletBal'>KES 0</h1></div>
        </div>

        <div id='p3' class='page'>
            <div class='feature-card'><h3>🧮 Business Calc</h3><button>Open Calculator</button></div>
            <div class='feature-card'><h3>👥 Directory</h3><button>View Customers</button></div>
        </div>

        <div class='nav-bar'>
            <button class='nav-item active' onclick='showPage("p1", this)'>🏠<br>Home</button>
            <button class='nav-item' onclick='showPage("p2", this)'>📈<br>Stats</button>
            <button class='nav-item' onclick='showPage("p3", this)'>🛠️<br>Tools</button>
        </div>

        <script>
            function showPage(id, el) {
                document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
                document.getElementById(id).classList.add('active');
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                el.classList.add('active');
            }
            function up() {
                fetch('/status').then(r => r.json()).then(d => {
                    document.getElementById('tot').innerText = 'Today: KES ' + d.todayTotal;
                    document.getElementById('walletBal').innerText = 'KES ' + d.todayTotal;
                    const list = document.getElementById('history-list');
                    list.innerHTML = d.history.length > 0 ? d.history.map(t => '<div>'+t.phone+' - '+t.status+'</div>').join('') : 'No activity';
                });
            }
            setInterval(up, 3000);
            up();
        </script>
    </body>
    </html>
    ".replace('"""', ''))
});

app.get('/status', (req, res) => res.json({ todayTotal: 0, history: [] }));
app.listen(process.env.PORT || 3000, () => console.log('Server Live'));