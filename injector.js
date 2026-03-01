(function() {
    console.log("Sound Feature Initializing...");
    
    // 1. Define 15+ Sound Samples
    const sounds = [
        { name: "Beep", url: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg" },
        { name: "Chime", url: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" },
        { name: "Click", url: "https://actions.google.com/sounds/v1/foley/button_click.ogg" },
        { name: "Notification", url: "https://actions.google.com/sounds/v1/alarms/alarm_clock_short.ogg" },
        { name: "Success", url: "https://actions.google.com/sounds/v1/actions/check_out.ogg" },
        { name: "Alert", url: "https://actions.google.com/sounds/v1/alarms/phone_ringing_loop.ogg" },
        { name: "Pop", url: "https://actions.google.com/sounds/v1/foley/pop_cork.ogg" },
        { name: "Water", url: "https://actions.google.com/sounds/v1/foley/water_drip.ogg" },
        { name: "Wood", url: "https://actions.google.com/sounds/v1/foley/wood_plank_foley.ogg" },
        { name: "Paper", url: "https://actions.google.com/sounds/v1/foley/paper_shuffle.ogg" },
        { name: "Keyboard", url: "https://actions.google.com/sounds/v1/foley/typewriter_single_key.ogg" },
        { name: "Wind", url: "https://actions.google.com/sounds/v1/weather/wind_howling.ogg" },
        { name: "Bird", url: "https://actions.google.com/sounds/v1/animals/bird_chirp_short.ogg" },
        { name: "Magic", url: "https://actions.google.com/sounds/v1/science_fiction/glitchy_energy_field.ogg" },
        { name: "Digital", url: "https://actions.google.com/sounds/v1/science_fiction/robot_arm_movement.ogg" }
    ];

    // 2. Create the UI Overlay
    const container = document.createElement('div');
    container.id = 'sound-panel';
    container.style = "position:fixed; bottom:20px; right:20px; background:#fff; border:2px solid #000; padding:15px; z-index:9999; display:grid; grid-template-columns: repeat(3, 1fr); gap:5px; border-radius:10px; box-shadow: 0px 4px 10px rgba(0,0,0,0.3);";
    
    sounds.forEach(s => {
        const btn = document.createElement('button');
        btn.innerText = s.name;
        btn.onclick = () => new Audio(s.url).play();
        btn.style = "cursor:pointer; padding:5px; font-size:12px;";
        container.appendChild(btn);
    });

    document.body.appendChild(container);
    console.log("15 Sounds Ready.");
})();
