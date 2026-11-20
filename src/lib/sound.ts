export type SoundKind =
  | 'hover'
  | 'click'
  | 'confirm'
  | 'action'
  | 'alert'
  | 'glitch'
  | 'pickup'
  | 'snap'
  | 'insert'
  | 'switch'
  | 'zoomIn'
  | 'zoomOut';

let sharedCtx: AudioContext | null = null;
let iosUnlocked = false;
let listenersBound = false;
const lastPlayedAt: Partial<Record<SoundKind, number>> = {};

function configureIosAudioSession() {
  try {
    const nav = navigator as unknown as { audioSession?: { type: string } };
    if (nav.audioSession && nav.audioSession.type !== 'playback') {
      nav.audioSession.type = 'playback';
    }
  } catch (_) {}
}

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    configureIosAudioSession();
    if (!sharedCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      sharedCtx = new AudioCtx();
    }
    if ((sharedCtx.state as string) !== 'running') {
      sharedCtx.resume().catch(() => {});
    }
    return sharedCtx;
  } catch (_) {
    return null;
  }
}

/** 移动端 iOS Safari / Android Chrome 首次触摸手势解锁硬件音频通道 */
export function unlockAudioContext() {
  const ctx = getSharedAudioContext();
  if (!ctx) return;
  try {
    if ((ctx.state as string) !== 'running') {
      ctx.resume().catch(() => {});
    }
    if (!iosUnlocked) {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      if ((ctx.state as string) === 'running') {
        iosUnlocked = true;
      }
    }
  } catch (_) {}
}

function bindGlobalAudioUnlock() {
  if (listenersBound || typeof window === 'undefined') return;
  listenersBound = true;
  const events = ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'click'];
  const onGesture = () => {
    unlockAudioContext();
  };
  events.forEach((evt) => {
    window.addEventListener(evt, onGesture, { capture: true, passive: true });
  });
}

bindGlobalAudioUnlock();

export function isSoundAllowed(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.sound !== '0';
}

function synthesizeSound(ctx: AudioContext, kind: SoundKind) {
  try {
    const now = ctx.currentTime;

    if (kind === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(760, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.022);
      gain.gain.setValueAtTime(0.016, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.026);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.028);
    } else if (kind === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.036);
      gain.gain.setValueAtTime(0.036, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.042);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } else if (kind === 'switch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(980, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.028);
      gain.gain.setValueAtTime(0.038, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.032);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } else if (kind === 'zoomIn') {
      const notes = [293.66, 440, 587.33];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.055;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.036, t);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.14);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
      });
    } else if (kind === 'zoomOut') {
      const notes = [440, 293.66];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.055;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.032, t);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.12);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.13);
      });
    } else if (kind === 'confirm') {
      [523.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.055;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.036, t);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.095);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
      });
    } else if (kind === 'action') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.045);
      gain.gain.setValueAtTime(0.026, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.055);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else if (kind === 'alert') {
      [250, 185].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.065;
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.03, t);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.06);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.065);
      });
    } else if (kind === 'glitch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      const base = 920 + Math.random() * 340;
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.setValueAtTime(base * 1.28, now + 0.012);
      gain.gain.setValueAtTime(0.018, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.028);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (kind === 'pickup') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.045);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.055);
    } else if (kind === 'snap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.setValueAtTime(680, now + 0.03);
      gain.gain.setValueAtTime(0.038, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (kind === 'insert') {
      const notes = [330, 440, 659.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === 0 ? 'triangle' : 'square';
        const t = now + i * 0.075;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.17);
      });
    }
  } catch (_) {}
}

export function playSound(kind: SoundKind) {
  if (!isSoundAllowed()) return;

  const nowMs = performance.now();
  const minGap = kind === 'hover' || kind === 'glitch' ? 65 : 25;
  if (nowMs - (lastPlayedAt[kind] || 0) < minGap) return;
  lastPlayedAt[kind] = nowMs;

  const ctx = getSharedAudioContext();
  if (!ctx) return;

  if ((ctx.state as string) !== 'running') {
    ctx
      .resume()
      .then(() => {
        synthesizeSound(ctx, kind);
      })
      .catch(() => {});
    return;
  }

  synthesizeSound(ctx, kind);
}
