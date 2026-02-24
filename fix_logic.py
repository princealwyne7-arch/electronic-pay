import re
with open('server.js', 'r') as f:
    content = f.read()

master_script = """
function up() {
    fetch('/status').then(r => r.json()).then(d => {
        // Update Home
        document.getElementById('tot').innerText = d.todayTotal;
        const list = document.getElementById('history-list');
        if(list) list.innerHTML = d.history.map(t => '<div class="history-item"><b>'+t.phone+'</b><br>'+t.status+'<hr></div>').join('') || 'No activity';
        
        // Update Wallet & Stats
        if(document.getElementById('walletBal')) document.getElementById('walletBal').innerText = 'KES ' + d.todayTotal.toLocaleString();
        const goal = parseFloat(localStorage.getItem('myGoal')) || 10000;
        const pct = Math.min((d.todayTotal / goal) * 100, 100);
        if(document.getElementById('goalBar')) {
            document.getElementById('goalBar').style.width = pct + '%';
            document.getElementById('goalPercent').innerText = Math.round(pct) + '%';
        }
    });
}
setInterval(up, 3000);
up();

function showPage(id, el) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    el.classList.add("active");
    window.scrollTo(0,0);
}
"""

# This forcefully inserts the script before the closing body tag
if '</body>' in content:
    new_content = re.sub(r'<script>.*?</script></body>', '<script>' + master_script + '</script></body>', content, flags=re.DOTALL)
    if new_content == content: # If sub failed, just append
        new_content = content.replace('</body>', '<script>' + master_script + '</script></body>')
    with open('server.js', 'w') as f:
        f.write(new_content)
