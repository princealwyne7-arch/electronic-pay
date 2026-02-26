const FeatureEngine = {
    sounds: {
        1: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_1.mp3', // Wallets
        2: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_2.mp3', // Portfolio
        3: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_3.mp3', // Buy/Sell
        4: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_4.mp3', // Swap
        5: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_5.mp3', // Send/Recv
        6: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_6.mp3', // Ledger
        7: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_7.mp3', // Market
        8: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_8.mp3', // Alerts/Admin On
        9: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_9.mp3', // Security/Admin Off
        10: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_10.mp3', // NFTs/Lockdown
        11: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_11.mp3', // Staking
        12: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_12.mp3', // Analytics
        13: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_13.mp3', // Compliance
        14: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_14.mp3', // Multi-Support
        15: 'https://raw.githubusercontent.com/princealwyne7-arch/assets/main/sys_fx_15.mp3'  // Export
    },
    getSound: (idx) => FeatureEngine.sounds[idx] || FeatureEngine.sounds[1]
};
module.exports = FeatureEngine;
