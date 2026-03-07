const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let transactions = []; 
let serverLogs = [];

const getKenyaTime = () => {
    return new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' });
};

// POWERFUL STATUS TRANSLATOR
const translateStatus = (rawBody) => {
    const data = JSON.stringify(rawBody).toLowerCase();
    if (data.includes('success') || data.includes('approved')) return 'Successful ✅';
    if (data.includes('insufficient') || data.includes('balance')) return 'Low Balance 💸';
    if (data.includes('wrong pin') || data.includes('2001')) return 'Wrong PIN 🔑';
    if (data.includes('cancel') || data.includes('abandoned')) return 'Cancelled ❌';
    return 'Failed/Other ❌';
};

app.get('/api/status', (req, res) => {
    const todayTotal = transactions
        .filter(t => t.status.includes('Successful'))
        .reduce((sum, t) => sum + parseInt(t.amount), 0);
    res.json({ transactions, todayTotal, serverLogs });
});

// NEW: MANUAL SYNC ROUTE
app.get('/api/verify/:ref', async (req, res) => {
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${req.params.ref}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });
        const tx = transactions.find(t => t.id === req.params.ref);
        if (tx) tx.status = translateStatus(response.data);
        res.json({ status: tx ? tx.status : "Not Found" });
    } catch (e) { res.status(500).send(e.message); }
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: sans-serif; background: #0d1117; color: #c9d1d9; display: flex; flex-direction: column; align-items: center; padding: 15px; }
                .card { background: #161b22; border: 1px solid #30363d; padding: 25px; border-radius: 15px; width: 100%; max-width: 400px; text-align: center; }
                .btn { width: 100%; padding: 14px; border-radius: 6px; font-weight: bold; cursor: pointer; border: none; margin-top: 10px; }
                .sync-btn { background: #f0883e; color: white; padding: 4px 8px; font-size: 10px; border-radius: 4px; margin-top: 5px; }
                .tx-item { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #21262d; width: 100%; max-width: 400px; box-sizing: border-box; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>PAY COMMAND</h2>
                <div id="total" style="font-size:24px; color:#f0883e; margin-bottom:15px;">KES 0</div>
                <form method="POST">
                    <input type="password" name="password" placeholder="PIN" style="width:100%; padding:10px; margin:5px 0;">
                    <input type="number" name="phone" placeholder="2547..." style="width:100%; padding:10px; margin:5px 0;">
                    <input type="number" name="amount" placeholder="Amount" style="width:100%; padding:10px; margin:5px 0;">
                    <button type="submit" formaction="/push" class="btn" style="background:#238636; color:white;">PAYNECTA</button>
                    <button type="submit" formaction="/paystack-push" class="btn" style="background:#1f6feb; color:white;">PAYSTACK</button>
                </form>
            </div>
            <div id="list" style="width:100%; max-width:400px; margin-top:20px;"></div>
            <script>
                async function syncTx(ref) {
                    const res = await fetch('/api/verify/' + ref);
                    const data = await res.json();
                    refresh();
                }
                async function refresh() {
                    const res = await fetch('/api/status');
                    const data = await res.json();
                    document.getElementById('total').innerText = 'KES ' + data.todayTotal;
                    let h = '';
                    data.transactions.forEach(t => {
                        const isProcessing = t.status.includes('Processing');
                        h += '<div class="tx-item"><div>'+t.phone+'<br><small>'+t.provider+'</small></div><div style="text-align:right;">KES '+t.amount+'<br><span>'+t.status+'</span>'+(isProcessing ? '<br><button class="sync-btn" onclick="syncTx(\\''+t.id+'\\')">REFRESH</button>' : '')+'</div></div>';
                    });
                    document.getElementById('list').innerHTML = h;
                }
                setInterval(refresh, 3000);
            </script>
        </body>
        </html>
    `);
});

app.post('/callback', (req, res) => {
    serverLogs.unshift({ time: getKenyaTime(), msg: "WEBHOOK HIT" });
    const ref = req.body.data?.reference || req.body.merchant_request_id;
    const tx = transactions.find(t => String(t.id) === String(ref));
    if (tx) tx.status = translateStatus(req.body);
    res.sendStatus(200);
});

// (Keep existing /push and /paystack-push routes here)
app.listen(process.env.PORT || 3000);
