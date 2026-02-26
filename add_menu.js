const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Inject Menu CSS into the <style> section
const menuCSS = `
                /* Sidebar Drawer */
                .menu-btn { position: absolute; top: 25px; left: 20px; z-index: 1001; cursor: pointer; padding: 10px; }
                .menu-btn div { width: 25px; height: 3px; background: white; margin: 5px; transition: 0.3s; border-radius: 2px; }
                .sidebar { position: fixed; top: 0; left: -280px; width: 280px; height: 100%; background: white; z-index: 2000; transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 10px 0 30px rgba(0,0,0,0.1); padding: 30px 20px; box-sizing: border-box; text-align: left; }
                .sidebar.open { left: 0; }
                .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 1500; display: none; backdrop-filter: blur(3px); }
                .overlay.show { display: block; }
                
                /* Sidebar Content Styles */
                .user-info { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
                .user-info b { font-size: 18px; color: var(--primary); }
                .menu-link { display: flex; align-items: center; padding: 15px 0; color: #475569; text-decoration: none; font-weight: 500; border-bottom: 1px solid #f8fafc; }
                .menu-link span { margin-right: 15px; font-size: 20px; }
`;
content = content.replace('/* Lists */', menuCSS + '\n                /* Lists */');

// 2. Inject HTML (Button and Sidebar) after the <body> tag
const menuHTML = `
            <div class="menu-btn" onclick="toggleMenu()">
                <div></div><div></div><div></div>
            </div>
            <div class="overlay" id="overlay" onclick="toggleMenu()"></div>
            <div class="sidebar" id="sidebar">
                <div class="user-info">
                    <p style="margin:0; color:#94a3b8; font-size:12px;">Welcome,</p>
                    <b>Manager Account</b>
                </div>
                <a href="#" class="menu-link"><span>👤</span> My Profile</a>
                <a href="#" class="menu-link"><span>🔐</span> Security Settings</a>
                <a href="#" class="menu-link"><span>💳</span> Linked Cards</a>
                <a href="#" class="menu-link"><span>📞</span> Help & Support</a>
                <a href="/logout" class="menu-link" style="color:#dc3545; margin-top:40px;"><span>🚪</span> Logout</a>
            </div>
`;
content = content.replace('<body>', '<body>' + menuHTML);

// 3. Inject JavaScript Toggle function
const menuJS = `
                function toggleMenu() {
                    document.getElementById('sidebar').classList.toggle('open');
                    document.getElementById('overlay').classList.toggle('show');
                }
`;
content = content.replace('function showPage', menuJS + '\n                function showPage');

fs.writeFileSync('server.js', content);
console.log('✅ Menu Surgery Complete!');
