const fs = require('fs');
let content = fs.readFileSync('server.js', 'utf8');

// 1. Remove any stray sound HTML from other sections if they exist
content = content.replace(/<div class="card">.*?🔊 Audio Notifications.*?<\/div>/s, '');

// 2. Inject the refined Sound Notification Bar into the "More" Tab
const soundControls = `
                <div class="card" style="margin-top: 15px; border: 1px solid #e2e8f0;">
                    <p style="color: var(--primary); font-weight: bold; margin-bottom: 12px; display: flex; align-items: center;">
                        <span style="margin-right: 8px;">🔔</span> Sound Notifications
                    </p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: #f1f5f9; padding: 10px; border-radius: 10px;">
                        <span style="font-size: 14px;">Master Sound Switch</span>
                        <input type="checkbox" id="soundToggle" checked style="width: auto; margin: 0; transform: scale(1.2);">
                    </div>
                    
                    <div style="text-align: left;">
                        <label style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Success Tone (Paid)</label>
                        <select id="successSelect" style="margin-bottom: 15px; background: #fff;">
                            <option value="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3">Classic Chime ✅</option>
                            <option value="https://cdn.pixabay.com/audio/2022/03/10/audio_c352c858c2.mp3">Digital Payment 📱</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3">Cash Register 💰</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3">Coins Drop 🪙</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2633/2633-preview.mp3">Success Bell 🔔</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3">Win Tone 🏆</option>
                        </select>

                        <label style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Alert Tone (Titititi/Fail)</label>
                        <select id="errorSelect" style="background: #fff;">
                            <option value="https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3">Titititi Alert ⚠️</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3">System Error ❌</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3">Short Beep 📟</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3">Triple Alert 🚨</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/1003/1003-preview.mp3">Buzz Fail 👎</option>
                            <option value="https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3">Urgent Ping 📍</option>
                        </select>
                    </div>
                </div>
`;

// Insert precisely inside the "More" page div
content = content.replace('<div id="more" class="page">', '<div id="more" class="page">\n                ' + soundControls);

fs.writeFileSync('server.js', content);
console.log('✅ Surgical Relocation: Sound Bar moved to More Tab!');
