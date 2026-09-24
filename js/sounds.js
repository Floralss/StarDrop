// Synthesized SFX via Web Audio API (no external files)
const SFX = {
  ctx: null,
  enabled: true,

  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { this.enabled = false; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, dur, type, vol, slideTo) {
    if (!this.enabled) return;
    const ctx = this.ensure(); if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  },

  noise(dur, vol) {
    if (!this.enabled) return;
    const ctx = this.ensure(); if (!ctx) return;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.5);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = vol || 0.08;
    src.connect(g); g.connect(ctx.destination);
    src.start();
  },

  click() {
    this.tone(800, 0.04, 'square', 0.06);
    this.tone(1200, 0.03, 'sine', 0.04);
  },

  openCase() {
    // whoosh + click
    this.noise(0.25, 0.1);
    this.tone(180, 0.3, 'triangle', 0.1, 80);
    setTimeout(() => this.tone(400, 0.15, 'sine', 0.08, 600), 100);
  },

  spin() {
    // rising ticks
    let i = 0;
    const id = setInterval(() => {
      this.tone(200 + i * 40, 0.04, 'square', 0.04);
      i++;
      if (i > 12) clearInterval(id);
    }, 80);
  },

  winCommon() {
    this.tone(523, 0.12, 'sine', 0.1);
    setTimeout(() => this.tone(659, 0.12, 'sine', 0.1), 100);
  },

  winRare() {
    this.tone(523, 0.1, 'sine', 0.1);
    setTimeout(() => this.tone(659, 0.1, 'sine', 0.1), 90);
    setTimeout(() => this.tone(784, 0.15, 'sine', 0.12), 180);
    setTimeout(() => this.tone(1046, 0.25, 'sine', 0.1), 280);
  },

  winMythic() {
    // siren-ish + fanfare
    this.tone(440, 0.2, 'sawtooth', 0.08, 880);
    setTimeout(() => this.tone(880, 0.2, 'sawtooth', 0.08, 440), 200);
    setTimeout(() => this.tone(440, 0.2, 'sawtooth', 0.08, 880), 400);
    setTimeout(() => {
      this.tone(523, 0.15, 'sine', 0.12);
      this.tone(659, 0.15, 'sine', 0.1);
      this.tone(784, 0.3, 'sine', 0.12);
    }, 650);
    this.noise(0.4, 0.06);
  },

  lose() {
    this.tone(300, 0.2, 'triangle', 0.1, 120);
    this.noise(0.15, 0.05);
  },

  deposit() {
    this.tone(600, 0.1, 'sine', 0.08);
    setTimeout(() => this.tone(900, 0.15, 'sine', 0.1), 80);
  },

  coin() {
    this.tone(1200, 0.06, 'sine', 0.07);
    setTimeout(() => this.tone(1600, 0.08, 'sine', 0.06), 50);
  },

  hover() {
    this.tone(900, 0.02, 'sine', 0.02);
  }
};

window.SFX = SFX;
document.addEventListener('click', () => SFX.ensure(), { once: true });

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('sfx-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    SFX.enabled = !SFX.enabled;
    btn.textContent = SFX.enabled ? '🔊' : '🔇';
    btn.classList.toggle('muted', !SFX.enabled);
    if (SFX.enabled) SFX.click();
  });
});
