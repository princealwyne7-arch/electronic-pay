const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Inject Enhanced Sidebar Styles
const sidebarStyles = `
                .sidebar-header { background: linear-gradient(135deg, #28a745, #1e7e34); padding: 30px 20px; color: white; margin: -30px -20px 20px -20px; border-radius: 0 0 20px 0; }
                .sidebar-section { margin-bottom: 25px; }
                .sidebar-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; display: block; font-weight: 700; }
                .sidebar-item { display: flex; align-items: center; padding: 12px 0; color: #334155; text-decoration: none; font-size: 14px; border-bottom: 1px solid #f8fafc; cursor: pointer; }
                .sidebar-item span { margin-right: 15px; font-size: 18px; width: 25px; text-align: center; }
                .sidebar-item:active { background: #f1f5f9; }
`;
content = content.replace('.sidebar {', sidebarStyles + '\n                .sidebar {');

// 2. Inject Comprehensive Banking HTML
const bankingSidebarHTML = `
            <div class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <p style="margin:0; opacity:0.8; font-size:12px;">Good Day,</p>
                    <b style="font-size:18px;">Manager Account</b>
                    <div style="font-size:10px; margin-top:5px; background:rgba(255,255,255,0.2); display:inline-block; padding:2px 8px; border-radius:10px;">Premium Member</div>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-label">My Bank</span>
                    <a class="sidebar-item"><span>👤</span> Personal Profile</a>
                    <a class="sidebar-item"><span>📄</span> E-Statements</a>
                    <a class="sidebar-item"><span>💳</span> Card Management</a>
                    <a class="sidebar-item"><span>🏦</span> Linked Accounts</a>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-label">Security</span>
                    <a class="sidebar-item"><span>🔐</span> Security PIN</a>
                    <a class="sidebar-item"><span>🤳</span> Biometric Login</a>
                    <a class="sidebar-item"><span>📱</span> Trusted Devices</a>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-label">Preferences</span>
                    <a class="sidebar-item"><span>🌍</span> Language & Region</a>
                    <a class="sidebar-item"><span>🌓</span> Dark Mode (Auto)</a>
                    <a class="sidebar-item"><span>💰</span> Default Currency</a>
                </div>

                <div class="sidebar-section">
                    <span class="sidebar-label">Support</span>
                    <a class="sidebar-item"><span>💬</span> Live Support</a>
                    <a class="sidebar-item"><span>📍</span> Branch Locator</a>
                    <a class="sidebar-item"><span>ℹ️</span> About Electronic Pay</a>
                </div>

                <div style="margin-top: 40px;">
                    <a class="sidebar-item" style="color: #ef4444; border:none;"><span>🚪</span> Sign Out</a>
                </div>
            </div>
`;

// Replace old sidebar with new version
content = content.replace(/<div class="sidebar" id="sidebar">.*?<\/div>/s, bankingSidebarHTML);

fs.writeFileSync('server.js', content);
console.log('✅ Sidebar Upgraded: Standard Bank Features Active!');
