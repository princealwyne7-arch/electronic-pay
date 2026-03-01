const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();
app.use(express.json());
app.use(express.static('public'));

// Database Connection
mongoose.connect(process.env.MONGO_URI).then(() => console.log("Vault Connected ✅"));

const Transaction = mongoose.model("Transaction", new mongoose.Schema({
    id: String, phone: String, amount: Number, status: String, time: String, createdAt: { type: Date, default: Date.now }
}));

app.get('/api/status', async (req, res) => {
    const txs = await Transaction.find().sort({ createdAt: -1 }).limit(10);
    res.json({ txs, cpu: 43, mem: 62, ping: 120, total: "2,438,920,440" });
});

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>AI COMMAND CENTER V4</title>
    <style>
        :root { --neon-blue: #00d2ff; --neon-green: #39ff14; --dark-bg: #050a14; --panel-bg: rgba(10, 20, 40, 0.8); }
        body { margin: 0; background: var(--dark-bg); color: white; font-family: 'Segoe UI', sans-serif; display: flex; height: 100vh; overflow: hidden; }
        
        /* Sidebar Navigation */
        .sidebar { width: 240px; background: rgba(0,0,0,0.5); border-right: 1px solid #1e3a8a; padding: 20px; display: flex; flex-direction: column; }
        .nav-item { padding: 12px; font-size: 13px; color: #94a3b8; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .nav-item:hover { color: var(--neon-blue); background: rgba(0, 210, 255, 0.1); }
        
        /* Main Dashboard Area */
        .main-content { flex: 1; display: grid; grid-template-columns: 1fr 300px; grid-template-rows: auto auto 1fr auto; gap: 10px; padding: 15px; overflow-y: auto; }
        .header-bar { grid-column: span 2; display: flex; justify-content: space-between; align-items: center; background: var(--panel-bg); padding: 10px 20px; border: 1px solid #1e40af; }
        
        /* Center Panels */
        .center-stack { display: flex; flex-direction: column; gap: 10px; }
        .live-meters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .meter-card { background: rgba(15, 23, 42, 0.9); padding: 15px; border-radius: 4px; border-left: 3px solid var(--neon-blue); text-align: center; }
        
        .bank-vault { background: radial-gradient(circle at center, #1e293b, #0f172a); padding: 30px; border-radius: 8px; text-align: center; border: 1px solid #334155; }
        .vault-value { font-size: 32px; color: white; font-weight: bold; margin: 10px 0; }
        
        /* Tables */
        .data-table { width: 100%; border-collapse: collapse; background: var(--panel-bg); font-size: 12px; }
        .data-table th { background: rgba(255,255,255,0.05); padding: 10px; text-align: left; color: #60a5fa; }
        .data-table td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }

        /* Security Sidebar (Right) */
        .security-sidebar { display: flex; flex-direction: column; gap: 10px; }
        .sec-card { background: rgba(20, 30, 60, 0.8); padding: 15px; border-radius: 5px; border: 1px solid #ef4444; }
        .map-box { height: 200px; background: url('https://i.ibb.co/F4pYhX7/map.png') center/cover; border: 1px solid #1e40af; }
        
        /* AI Decision Panel */
        .ai-panel { background: rgba(10, 25, 50, 0.9); padding: 15px; display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--neon-blue); }
        .ai-btn { padding: 8px 15px; border: 1px solid var(--neon-blue); background: transparent; color: white; cursor: pointer; }
        .btn-apply { background: #166534; }

        /* Footer */
        .footer { grid-column: span 2; background: #020617; padding: 10px; text-align: center; font-size: 11px; border-top: 1px solid #1e3a8a; }
        
        /* Gauges */
        .health-gauge { width: 60px; height: 60px; border-radius: 50%; border: 4px solid #1e40af; border-top-color: var(--neon-green); margin: 0 auto; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h3 style="color: var(--neon-blue)">MAIN MENU</h3>
        <div class="nav-item">Dashboard</div>
        <div class="nav-item">Clients</div>
        <div class="nav-item">Accounts</div>
        <div class="nav-item">Transfers</div>
        <div class="nav-item">Vault</div>
        <div class="nav-item">AI Center</div>
        <div class="nav-item">Security</div>
        <div class="nav-item">Settings</div>
        
        <div style="margin-top:auto; padding: 10px; background: rgba(0,0,0,0.3)">
            <div style="font-size:12px">System Health</div>
            <div class="health-gauge"></div>
            <center><small>CPU 43%</small></center>
        </div>
    </div>

    <div class="main-content">
        <div class="header-bar">
            <div>AI COMMAND CENTER <small>V4</small></div>
            <div>25 Feb 2026 | 14:32:18</div>
            <div style="color:var(--neon-green)">● System: ACTIVE</div>
        </div>

        <div class="center-stack">
            <div class="live-meters">
                <div class="meter-card"><small>Users Online</small><div style="font-size:20px">1,284</div></div>
                <div class="meter-card"><small>Transactions/Sec</small><div style="font-size:20px">38 TPS</div></div>
                <div class="meter-card"><small>Active Transfers</small><div style="font-size:20px">142</div></div>
                <div class="meter-card" style="border-color:#ef4444"><small>Fraud Alerts</small><div style="font-size:20px">3</div></div>
            </div>

            <div class="bank-vault">
                <small>TOTAL BANK MONEY (Main Center)</small>
                <div class="vault-value">KES 2,438,920,440</div>
                <div style="display:flex; justify-content:space-around; font-size:12px">
                    <span style="color:var(--neon-green)">Avail: 1.90B</span>
                    <span style="color:#fbbf24)">Res: 200M</span>
                    <span style="color:#ef4444">Frozen: 80M</span>
                </div>
            </div>

            <div class="ai-panel">
                <div>
                    <strong>AI Suggestions</strong><br>
                    <small>● Server load at 65% | Transaction volume +20%</small>
                </div>
                <div>
                    <button class="ai-btn btn-apply" onclick="playSfx(1)">Apply Fix</button>
                    <button class="ai-btn" onclick="playSfx(2)">Ignore</button>
                    <button class="ai-btn" onclick="playSfx(3)">Analyze</button>
                </div>
            </div>

            <div style="background:var(--panel-bg); padding:10px;">
                <strong>SYSTEM LOGS & UPDATES</strong>
                <table class="data-table" id="logTable">
                    <tr><th>Time</th><th>Event</th><th>Status</th></tr>
                    <tr><td>14:32</td><td>New Client Registered</td><td>SUCCESS</td></tr>
                    <tr><td>14:31</td><td>KES 50,000 Transfer</td><td>SUCCESS</td></tr>
                </table>
            </div>
        </div>

        <div class="security-sidebar">
            <div class="sec-card">
                <strong>SECURITY ALERTS</strong>
                <div style="font-size:11px; margin-top:10px; color:#f87171">
                    ⚠️ Suspicious Login: Nairobi<br>
                    ⚠️ Multiple PIN Attempts
                </div>
                <div style="margin-top:10px; display:flex; gap:5px">
                    <button style="background:#854d0e; color:white; border:none; font-size:10px">Investigate</button>
                    <button style="background:#991b1b; color:white; border:none; font-size:10px">Block</button>
                </div>
            </div>
            
            <div class="map-box"></div>
            
            <div class="sec-card" style="border-color: #1e40af">
                <strong>QUICK ACTIONS</strong>
                <div class="nav-item" onclick="playSfx(12)">+ New Client</div>
                <div class="nav-item" onclick="playSfx(13)">+ New Transfer</div>
                <div class="nav-item" onclick="playSfx(14)">Vault Control</div>
                <div class="nav-item" onclick="playSfx(15)">Admin Settings</div>
            </div>
        </div>

        <div class="footer">
            © 2026 Global Digital Bank | Secure | Encrypted | AI Powered | All Rights Reserved
        </div>
    </div>

    <script>
        const playSfx = (i) => {
            const a = new Audio("https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_" + i + ".mp3");
            a.play().catch(()=>{});
        };
        // Auto-refresh logic here
    </script>
</body>
</html>
`);
});

app.listen(3000, () => console.log("System V4 Live on Port 3000"));
