import re
with open('server.js', 'r') as f:
    content = f.read()

# This script handles the tab switching and the data updates
master_script = """
function showPage(id, el) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
    });
    // Show selected page
    const target = document.getElementById(id);
    if(target) {
        target.style.display = 'block';
        target.classList.add('active');
    }
    // Update Nav Bar UI
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    window.scrollTo(0,0);
}

function up() {
    fetch('/status').then(r => r.json()).then(d => {
        document.getElementById('tot').innerText = d.todayTotal;
        const list = document.getElementById('history-list');
        if(list) list.innerHTML = d.history.map(t => '<div class="history-item"><b>'+t.phone+'</b><br>'+t.status+'<hr></div>').join('') || 'No activity';
        
        // Update Stats & Wallet
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
"""

# Replace any existing broken script tag with this working one
if '</body>' in content:
    content = re.sub(r'<script>.*?</script></body>', '<script>' + master_script + '</script></body>', content, flags=re.DOTALL)
    with open('server.js', 'w') as f:
        f.write(content)
