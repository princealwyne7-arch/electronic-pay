const express = require("express");
const app = express();
require("dotenv").config();

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Elite Global Bank - AI Command Center V5</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --bg-main:#020617; --bg-sidebar:#010409; --bg-panel:rgba(15,23,42,0.98);
  --neon-blue:#00d2ff; --neon-green:#39ff14; --neon-red:#ff3131; --neon-gold:#ffcc00;
  --glass-border:1px solid rgba(0,210,255,0.2); --sidebar-width:260px; --right-panel-width:300px; --header-h:70px;
}
*{box-sizing:border-box;outline:none;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--neon-blue);border-radius:10px;}
body,html{margin:0;padding:0;width:100vw;height:100vh;background:var(--bg-main);color:#f8fafc;font-family:'Inter',sans-serif;overflow:hidden;}
.app-shell{display:grid;grid-template-columns:var(--sidebar-width) 1fr var(--right-panel-width);grid-template-rows:var(--header-h) 1fr 35px;height:100vh;width:100vw;}
header{grid-column:1/4;background:#000;border-bottom:var(--glass-border);display:flex;justify-content:space-between;align-items:center;padding:0 25px;z-index:1000;}
.header-brand{display:flex;align-items:center;gap:15px;}
.logo-box{width:40px;height:40px;border:1px solid var(--neon-blue);display:flex;align-items:center;justify-content:center;transform:rotate(45deg);}
.logo-box i{transform:rotate(-45deg);font-family:'Orbitron';font-size:20px;color:var(--neon-blue);}
.header-center{font-family:'Roboto Mono';font-size:16px;color:var(--neon-gold);letter-spacing:1px;}
.admin-profile{display:flex;align-items:center;gap:10px;font-size:12px;}
.avatar{width:35px;height:35px;border-radius:50%;border:2px solid var(--neon-green);background:url('https://i.ibb.co/9G6vH4P/user-prof.jpg') center/cover;}
.sidebar{grid-row:2;background:var(--bg-sidebar);border-right:var(--glass-border);padding:20px 0;display:flex;flex-direction:column;overflow-y:auto;z-index:500;}
.menu-label{padding:0 20px;font-size:10px;color:#475569;letter-spacing:2px;margin-bottom:15px;text-transform:uppercase;}
.nav-link{padding:14px 25px;display:flex;align-items:center;gap:12px;color:#94a3b8;font-size:13px;cursor:pointer;transition:0.3s;border-left:3px solid transparent;}
.nav-link:hover{background:rgba(0,210,255,0.05);color:var(--neon-blue);}
.nav-active{background:rgba(0,210,255,0.1);color:var(--neon-blue);border-left:3px solid var(--neon-blue);font-weight:600;}
.health-module{margin-top:auto;padding:20px;border-top:1px solid rgba(255,255,255,0.05);}
.stat-row{display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px;}
.progress-bg{width:100%;height:4px;background:#1e293b;border-radius:2px;margin-bottom:15px;}
.progress-fill{height:100%;border-radius:2px;transition:1s;}
.workspace{grid-row:2;background:radial-gradient(circle at top right,#0a192f 0%,#020617 100%);padding:25px;overflow-y:scroll;display:flex;flex-direction:column;gap:30px;}
.conn-bar{display:flex;gap:20px;font-size:11px;color:#64748b;padding:12px 20px;background:rgba(0,0,0,0.3);border-radius:6px;border:var(--glass-border);}
.conn-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:5px;}
.grid-meters{display:grid;grid-template-columns:repeat(5,1fr);gap:20px;}
.meter-card{background:var(--bg-panel);border:var(--glass-border);padding:20px;border-radius:8px;text-align:center;position:relative;}
.meter-label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;}
.meter-value{font-family:'Orbitron';font-size:24px;color:var(--neon-blue);margin-top:10px;}
.vault-core{background:linear-gradient(135deg,#0f172a 0%,#020617 100%);border:1px solid rgba(0,210,255,0.4);border-radius:12px;padding:40px;text-align:center;position:relative;}
.vault-total{font-family:'Orbitron';font-size:48px;margin:20px 0;text-shadow:0 0 20px rgba(0,210,255,0.4);}
.vault-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-top:30px;}
.v-box{padding:15px;background:rgba(0,0,0,0.4);border-radius:8px;border:1px solid rgba(255,255,255,0.05);}
.section-header{font-family:'Orbitron';font-size:14px;color:var(--neon-blue);margin-bottom:20px;display:flex;align-items:center;gap:10px;}
.data-wrap{background:var(--bg-panel);border:var(--glass-border);border-radius:8px;overflow:hidden;}
.sys-table{width:100%;border-collapse:collapse;font-size:13px;}
.sys-table th{background:rgba(0,0,0,0.4);text-align:left;padding:15px;color:#64748b;font-weight:500;}
.sys-table td{padding:15px;border-bottom:1px solid rgba(255,255,255,0.03);}
.status-pill{padding:4px 10px;border-radius:4px;font-size:10px;font-weight:bold;}
.ai-neural-card{background:rgba(0,210,255,0.02);border:1px solid var(--neon-blue);border-radius:12px;display:grid;grid-template-columns:200px 1fr;padding:30px;gap:30px;position:relative;}
.ai-visual{width:150px;height:150px;background:url('https://i.ibb.co/Xz90Cyz/ai-bot.png') center/cover;filter:drop-shadow(0 0 15px var(--neon-blue));animation:pulse 4s infinite ease-in-out;}
@keyframes pulse{0%,100%{opacity:0.8;transform:scale(1);}50%{opacity:1;transform:scale(1.05);}}
.ai-logic-stream{display:flex;flex-direction:column;gap:12px;}
.logic-item{padding:12px;background:rgba(0,0,0,0.4);border-radius:6px;border-left:3px solid var(--neon-blue);font-size:12px;}
.security-side{grid-row:2;background:rgba(1,4,9,0.8);border-left:var(--glass-border);padding:25px 20px;overflow-y:auto;display:flex;flex-direction:column;gap:30px;z-index:500;}
.alert-card{background:rgba(255,49,49,0.05);border:1px solid var(--neon-red);padding:15px;border-radius:8px;margin-bottom:15px;position:relative;}
.map-frame{height:200px;width:100%;border-radius:8px;border:var(--glass-border);background:#000 url('https://i.ibb.co/F4pYhX7/map.png') center/cover;position:relative;}
.map-blip{position:absolute;width:6px;height:6px;background:var(--neon-green);border-radius:50%;box-shadow:0 0 10px var(--neon-green);animation:blip 2s infinite;}
#banking-overlay{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(1,4,9,0.98);z-index:10000;backdrop-filter:blur(20px);align-items:center;justify-content:center;}
.engine-modal{width:850px;max-height:85vh;background:var(--bg-panel);border:1px solid var(--neon-blue);border-radius:12px;display:flex;flex-direction:column;box-shadow:0 0 50px rgba(0,210,255,0.2);}
.modal-header{padding:25px 35px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;}
.modal-body{flex:1;overflow-y:auto;padding:20px 35px;}
.bank-feature-row{display:grid;grid-template-columns:200px 1fr 140px;align-items:center;padding:22px;border-bottom:1px solid rgba(255,255,255,0.05);gap:20px;}
.bank-feature-row:hover{background:rgba(0,210,255,0.02);}
footer{grid-column:1/4;background:#000;border-top:var(--glass-border);display:flex;justify-content:center;align-items:center;font-size:11px;color:#475569;}
.btn-core{padding:10px 20px;background:transparent;border:1px solid var(--neon-blue);color:white;font-family:'Orbitron';font-size:10px;cursor:pointer;transition:0.3s;}
.btn-core:hover{background:var(--neon-blue);color:black;}
.btn-danger{border-color:var(--neon-red);color:var(--neon-red);}
</style>
</head>
<body>
<div class="app-shell">
<header>
<div class="header-brand">
<div class="logo-box"><i>EG</i></div>
<div style="font-family:'Orbitron'; line-height:1.2;">
<div style="font-size:16px; color:var(--neon-blue);">Elite Global Bank</div>
<div style="font-size:10px; color:#64748b;">AI COMMAND CENTER V5 PRO</div>
</div>
</div>
<div class="header-center" id="main-timer">INITIALIZING SYSTEM...</div>
<div class="admin-profile">
<div style="text-align:right">
<div style="font-weight:bold">Admin: Manager</div>
<div style="font-size:10px; color:var(--neon-green)">● SYSTEM ONLINE</div>
</div>
<div class="avatar"></div>
</div>
</header>

<aside class="sidebar">
<div class="menu-label">Main Navigation</div>
<div class="nav-link nav-active" onclick="play(1)">Dashboard</div>
<div class="nav-link" onclick="play(2)">Clients</div>
<div class="nav-link" onclick="play(3)">Accounts</div>
<div class="nav-link" onclick="play(4)">Transfers</div>
<div class="nav-link" onclick="play(5)">Vaults</div>
<div class="nav-link" onclick="play(6)">Digital Assets</div>
<div class="nav-link" onclick="play(7)">Transactions</div>
<div class="nav-link" onclick="play(8)">AI Center</div>
<div class="nav-link" onclick="play(9)">Security</div>
<div class="nav-link" onclick="play(10)">Reports</div>
<div class="nav-link" onclick="play(11)">World Map</div>
<div class="nav-link" onclick="play(12)">Automation</div>
<div class="nav-link" onclick="play(13)">Settings</div>
<div class="nav-link" onclick="play(14)">System Health</div>
<div class="health-module">
<div class="menu-label">System Health</div>
<div class="stat-row"><span>CPU Usage</span><span>43%</span></div>
<div class="progress-bg"><div class="progress-fill" style="width:43%; background:var(--neon-green)"></div></div>
<div class="stat-row"><span>Memory Load</span><span>62%</span></div>
<div class="progress-bg"><div class="progress-fill" style="width:62%; background:var(--neon-gold)"></div></div>
</div>
</aside>

<main class="workspace">
<div class="conn-bar">
<span><span class="conn-dot" style="background:var(--neon-green)"></span>System Engine</span>
<span><span class="conn-dot" style="background:var(--neon-green)"></span>Security Engine</span>
<span><span class="conn-dot" style="background:var(--neon-blue)"></span>AI Engine</span>
<span><span class="conn-dot" style="background:var(--neon-gold)"></span>DB Connection</span>
<span style="color:var(--neon-green); margin-left:auto">● LIVE DATA STREAM ACTIVE</span>
</div>

<div class="grid-meters">
<div class="meter-card"><div class="meter-label">Users Online</div><div class="meter-value" id="user-sync">1,284</div></div>
<div class="meter-card"><div class="meter-label">Transactions/sec</div><div class="meter-value" id="tps-sync">38</div></div>
<div class="meter-card"><div class="meter-label">Active Transfers</div><div class="meter-value" id="transfer-sync">142</div></div>
<div class="meter-card" style="border-color:var(--neon-red)"><div class="meter-label" style="color:var(--neon-red)">Fraud Alerts</div><div class="meter-value" style="color:var(--neon-red)" id="fraud-sync">3</div></div>
<div class="meter-card" style="border-color:var(--neon-gold)"><div class="meter-label" style="color:var(--neon-gold)">Security Alerts</div><div class="meter-value" style="color:var(--neon-gold)" id="sec-sync">5</div></div>
</div>

<div class="vault-core">
<div style="font-size:12px; color:#94a3b8; letter-spacing:2px;">TOTAL BANK MONEY</div>
<div class="vault-total" id="total-money">KES 2,438,920,440</div>
<div class="vault-grid">
<div class="v-box"><div style="color:var(--neon-green); font-size:16px;" id="avail-money">1.90B</div><small>Available</small></div>
<div class="v-box"><div style="color:var(--neon-gold); font-size:16px;" id="res-money">200M</div><small>Reserved</small></div>
<div class="v-box"><div style="color:var(--neon-red); font-size:16px;" id="frozen-money">80M</div><small>Frozen</small></div>
<div class="v-box"><div style="color:var(--neon-blue); font-size:16px;" id="moving-money">258.9M</div><small>Moving</small></div>
</div>
</div>

<div class="section-group">
<div class="section-header">LIVE TRANSACTION STREAM</div>
<div class="data-wrap">
<table class="sys-table">
<thead><tr><th>Time</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
<tbody id="tx-stream">
<tr><td>14:35</td><td>Alex T</td><td>Deposit</td><td>KES 20,000</td><td><span class="status-pill" style="background:rgba(57,255,20,0.1); color:var(--neon-green)">SUCCESS</span></td></tr>
<tr><td>14:34</td><td>Susan M</td><td>Transfer</td><td>KES 8,300</td><td><span class="status-pill" style="background:rgba(57,255,20,0.1); color:var(--neon-green)">SUCCESS</span></td></tr>
</tbody>
</table>
</div>
</div>

<div class="section-group">
<div class="section-header">AI DECISION PANEL</div>
<div class="ai-neural-card">
<div class="ai-visual"></div>
<div>
<div class="ai-logic-stream">
<div class="logic-item" style="border-color:var(--neon-red)">Fraud risk rising in <b style="color:var(--neon-red)">mobile transfers</b>.</div>
<div class="logic-item" style="border-color:var(--neon-gold)">Server load at 65%. Dynamic resource allocation suggested.</div>
</div>
<div style="display:flex; gap:15px; margin-top:25px;">
<button class="btn-core" style="background:var(--neon-green); color:black; border:none; padding:12px 25px; border-radius:6px;" onclick="aiSuggest()">AI Suggestion</button>

<button class="btn-core" style="background:var(--neon-gold); color:black; border:none; padding:12px 25px; border-radius:6px;" onclick="applyFix()">Apply Fix</button>

<button class="btn-core" style="background:var(--neon-blue); color:black; border:none; padding:12px 25px; border-radius:6px;" onclick="analyzeSystem()">Analyze</button>

<button class="btn-core" style="background:var(--neon-red); color:white; border:none; padding:12px 25px; border-radius:6px;" onclick="ignoreAlert()">Ignore</button>

</div>
</div>
</div>
</div>

<div class="section-group">
<div class="section-header">SYSTEM LOGS & UPDATE AREA</div>
<div class="data-wrap">
<table class="sys-table">
<thead><tr><th>Time</th><th>Event</th><th>Status</th></tr></thead>
<tbody id="system-logs">
<tr><td>14:30</td><td>Security Engine Scan</td><td><span class="status-pill" style="background:rgba(57,255,20,0.1); color:var(--neon-green)">ACTIVE</span></td></tr>
<tr><td>14:28</td><td>AI Resource Optimization</td><td><span class="status-pill" style="background:rgba(0,255,255,0.1); color:var(--neon-blue)">RUNNING</span></td></tr>
</tbody>
</table>
</div>
</div>

<div style="margin-top:40px; text-align:center; font-size:20px; letter-spacing:4px; color:var(--neon-green); animation:pulseText 3s infinite;">
ELITE GLOBAL BANK — ENCRYPTED • AI POWERED • MILITARY GRADE SECURITY
</div>

</div>

<script>

function updateConnectionBar(){
document.getElementById("live-users").innerText = Math.floor(Math.random()*5000);
document.getElementById("tx-sec").innerText = (Math.random()*120).toFixed(2);
document.getElementById("active-transfer").innerText = Math.floor(Math.random()*200);
document.getElementById("fraud-alert").innerText = Math.floor(Math.random()*5);
document.getElementById("security-alert").innerText = Math.floor(Math.random()*3);
}

function aiSuggest(){
alert("AI Suggestion: Activate enhanced fraud monitoring and auto-scale server cluster.");
addLog("AI Suggestion Triggered","INFO");
}

function applyFix(){
alert("AI Fix Applied: Resource allocation optimized.");
addLog("AI Applied Fix","SUCCESS");
}

function analyzeSystem(){
alert("AI Deep Analysis Running...");
addLog("AI Analysis Initiated","RUNNING");
}

function ignoreAlert(){
alert("Alert Ignored by Admin.");
addLog("Alert Ignored","WARNING");
}

function addLog(event,status){
let table=document.getElementById("system-logs");
let row=table.insertRow(0);
let time=new Date().toLocaleTimeString();
row.insertCell(0).innerText=time;
row.insertCell(1).innerText=event;
row.insertCell(2).innerHTML='<span class="status-pill">'+status+'</span>';
}

function updateTime(){
document.getElementById("live-clock").innerText=new Date().toLocaleString();
}

setInterval(updateConnectionBar,3000);
setInterval(updateTime,1000);

</script>

</body>
</html>
`);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
console.log("Elite Global Bank System Running on Port " + PORT);
});
