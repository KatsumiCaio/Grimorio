/**
 * Lightweight procedural sound synthesis for dice rolls using Web Audio API.
 * No external audio files needed; completely offline-safe and iframe-safe.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export function playDiceRollSound(isMuted: boolean = false) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const clicks = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < clicks; i++) {
      const delay = i * 0.045 + Math.random() * 0.02;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Sharp wooden/acrylic dice click frequency
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 380, now + delay);
      osc.frequency.exponentialRampToValueAtTime(120, now + delay + 0.03);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800 + Math.random() * 400, now + delay);
      filter.Q.setValueAtTime(3, now + delay);

      gain.gain.setValueAtTime(0.001, now + delay);
      gain.gain.linearRampToValueAtTime(0.07, now + delay + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.04);
    }
  } catch {
    // Ignore audio playback constraints if audio is disabled by browser policies
  }
}
