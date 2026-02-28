const sounds = [
  "alert_high.mp3", "chime_low.mp3", "ping_active.mp3", "warning_red.mp3",
  "ai_voice_on.mp3", "threat_lock.mp3", "secure_vault.mp3", "data_stream.mp3",
  "radar_pulse.mp3", "engine_start.mp3", "encryption_key.mp3", "system_exit.mp3",
  "success_tone.mp3", "uplink_stable.mp3"
];

export const playAlert = (index) => {
  try {
    const audio = new Audio(`/assets/sounds/${sounds[index]}`);
    audio.play();
  } catch (e) {
    console.warn("Audio feedback unavailable.");
  }
};

export default sounds;
