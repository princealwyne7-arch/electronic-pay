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
<title>AI COMMAND CENTER V4 - FULL SYSTEM ENGINE</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
/* Keep all your existing CSS unchanged */
</style>
</head>
<body>
<div class="app-shell">
    <header> ... </header>
    <aside class="sidebar">
        <div class="menu-label">Main Navigation</div>
        <div class="nav-link nav-active" onclick="openDashboard()">Dashboard</div>
        <div class="nav-link" onclick="openClients()">Clients Management</div>
        <div class="nav-link" onclick="openBanking()" style="color:var(--neon-blue); font-weight:bold; border-left:3px solid var(--neon-blue);">Transfers & Wire</div>
        <div class="nav-link" onclick="openVault()">Vault Storage</div>
        <div class="nav-link" onclick="openDigitalAssets()">Digital Assets</div>
        <div class="nav-link" onclick="openTransactions()">Transaction History</div>
        <div class="nav-link" onclick="openAINeural()">AI Neural Center</div>
        <div class="nav-link" onclick="openSecurity()">Security Gateway</div>
        <div class="nav-link" onclick="openReports()">System Reports</div>
        <div class="nav-link" onclick="openWorldMap()">World Map Activity</div>
        <div class="nav-link" onclick="openAutomation()">Automation Tasks</div>
        <div class="nav-link" onclick="openMasterSettings()">Master Settings</div>
        <div class="health-module"> ... </div>
    </aside>

    <main class="workspace" id="workspace">
        <div class="conn-bar"> ... </div>
        <div class="grid-meters"> ... </div>
        <section class="vault-core"> ... </section>
        <div class="section-group"> ... AI PANEL ... </div>
        <div class="section-group"> ... LIVE TRANSACTION STREAM ... </div>
    </main>

    <aside class="security-side"> ... </aside>
    <footer> ... </footer>
</div>

<div id="banking-overlay"> ... </div>

<script>
const play = (id) => {
    const sfx = new Audio(\`https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_\${id}.mp3\`);
    sfx.volume = 0.4;
    sfx.play().catch(e => {});
};

// --- WORKSPACE PANEL FUNCTIONS ---
function openDashboard() {
    play(1);
    document.getElementById('workspace').innerHTML = \`<h2 style="color:var(--neon-blue)">Dashboard</h2>\`;
}

function openClients() {
    play(2);
    const workspace = document.getElementById('workspace');
    workspace.innerHTML = \`
        <h2 style="color:var(--neon-blue)">Clients Management</h2>
        <div id="clients-list">Loading clients...</div>
    \`;
    fetch("https://electronic-pay.onrender.com/api/clients")
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('clients-list');
            container.innerHTML = data.length === 0
                ? "<p>No clients found.</p>"
                : "<ul>" + data.map(c => \`<li>\${c.fullName} (\${c.accountNumber})</li>\`).join('') + "</ul>";
        })
        .catch(err => {
            document.getElementById('clients-list').innerHTML = "<p>Error loading clients.</p>";
            console.error(err);
        });
}

function openBanking() {
    play(4);
    document.getElementById('banking-overlay').style.display = 'flex';
}
function closeBanking() {
    play(10);
    document.getElementById('banking-overlay').style.display = 'none';
}

function openVault() {
    play(5);
    document.getElementById('workspace').innerHTML = "<h2 style='color:var(--neon-blue)'>Vault Storage</h2>";
}

function openDigitalAssets() {
    play(6);
    document.getElementById('workspace').innerHTML = "<h2 style='color:var(--neon-blue)'>Digital Assets</h2>";
}

function openTransactions() {
    play(7);
    document.getElementById('workspace').innerHTML = "<h2 style='color:var(--neon-blue)'>Transaction History</h2>";
}

function openAINeural() {
    play(8);
    document.getElementById('workspace').innerHTML = "<h2 style='color:var(--neon-blue)'>AI Neural Center</h2>";
}

function openSecurity() {
    play(10);
    document.getElementById('workspace').innerHTML = "<h2 style='color:var(--neon-blue)'>Security Gateway</h2>";
}

function openReports() {
    play(12);
    document.getElementById('workspace').innerHTML = "<h2 style='color:var(--neon-blue)'>System Reports</h2>";
}

function openWorldMap() {
    play(13);
    document.getElementById('workspace').innerHTML = "<h2 style='color:var(--neon-blue)'>World Map Activity</h2>";
}

function openAutomation() {
    play(14);
    document.getElementById('workspace').innerHTML = "<h2 style='color:var(--neon-blue)'>Automation Tasks</h2>";
}

function openMasterSettings() {
    play(15);
    document.getElementById('workspace').innerHTML = "<h2 style='color:var(--neon-blue)'>Master Settings</h2>";
}

// --- STK ENGINE ---
function stkEngine() { 
    play(11);
    const p = prompt("PHONE:"); const a = prompt("AMOUNT:");
    if(p && a) alert("PAYNECTA: Sending prompt to " + p);
}

// --- TIMERS ---
setInterval(() => {
    document.getElementById('main-timer').innerText = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Nairobi' }) + ' (EAT)';
}, 1000);

setInterval(() => {
    const el = document.getElementById('user-sync');
    let val = parseInt(el.innerText.replace(',',''));
    val += Math.floor(Math.random() * 3) - 1;
    el.innerText = val.toLocaleString();
}, 3000);
</script>
</body>
</html>
`);
});

app.listen(3000, () => console.log("System Engine V4 Pro Online"));
