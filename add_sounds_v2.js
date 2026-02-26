const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Inject the Sound Library and Selectors into the "More" tab
const soundSettingsHTML = `
                <div class="card">
                    <p style="color: var(--primary); font-weight: bold; margin-bottom: 15px;">🔊 Audio Notifications</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <span>Enable Sounds</span>
                        <input type="checkbox" id="soundToggle" checked style="width: auto; margin: 0;">
                    </div>
                    
                    <label style="font-size: 12px; color: #64748b;">Success Sound:</label>
                    <select id="successSelect" style="margin-bottom: 15px;">
                        <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">Classic Chime</option>
                        <option value="https://cdn.pixabay.com/audio/2022/03/10/audio_c352c858c2.mp3">Digital Pay</option>
                        <option value="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3">Cash Register</option>
                        <option value="https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3">Coins Drop</option>
                        <option value="https://assets.mixkit.co/active_storage/sfx/2633/2633-preview.mp3">Success Bell</option>
                        <option value="https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3">Win Tone</option>
                    </select>

                    <label style="font-size: 12px; color: #64748b;">Alert/Error Sound (Titititi):</label>
                    <select id="errorSelect">
                        <option value="https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3">Titititi Alert</option>
                        <option value="https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3">System Error</option>
                        <option value="https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3">Short Beep</option>
                        <option value="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3">Triple Alert</option>
                        <option value="https://assets.mixkit.co/active_storage/sfx/1003/1003-preview.mp3">Buzz Fail</option>
                        <option value="https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3">Urgent Ping</option>
                    </select>
                </div>
`;
content = content.replace('<div class="card">', soundSettingsHTML + '\n                <div class="card">');

// 2. Inject Playback Function
const playJS = `
                let playedIds = new Set();
                function playSnd(type) {
                    if (!document.getElementById('soundToggle').checked) return;
                    let url = type === 'ok' ? document.getElementById('successSelect').value : document.getElementById('errorSelect').value;
                    new Audio(url).play().catch(() => {});
                }
`;
content = content.replace('function sP', playJS + '\n                function sP');

// 3. Inject Listener into updateStatus
const listenerJS = `
                        data.transactions.forEach(t => {
                            if (!playedIds.has(t.id)) {
                                if (t.status.includes('Successful')) { playSnd('ok'); playedIds.add(t.id); }
                                else if (t.status.includes('Cancelled') || t.status.includes('Failed')) { playSnd('err'); playedIds.add(t.id); }
                            }
                        });
`;
content = content.replace('document.getElementById(\'dailyTotal\').innerText', listenerJS + '\n                        document.getElementById(\'dailyTotal\').innerText');

fs.writeFileSync('server.js', content);
console.log('✅ Surgical Update: 12-Sound System Restored!');
