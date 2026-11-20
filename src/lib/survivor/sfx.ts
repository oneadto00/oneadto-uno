import { getSharedAudioContext, isSoundAllowed } from '@/lib/sound';

const throttleMap: Record<string, number> = {};

function getCtx(): AudioContext | null {
  if (!isSoundAllowed()) return null;
  return getSharedAudioContext();
}

function canPlay(key: string, gapMs: number): boolean {
  if (!isSoundAllowed()) return false;
  const now = performance.now();
  if (now - (throttleMap[key] || 0) < gapMs) return false;
  throttleMap[key] = now;
  return true;
}

/** 拾取经验宝石：随连续拾取递增音阶 */
export function sfxGem(comboStep: number) {
  if (!canPlay('gem', 36)) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const step = Math.min(16, comboStep);
    const baseFreq = 540 * Math.pow(1.045, step);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.24, now + 0.048);
    gain.gain.setValueAtTime(0.032, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.055);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.058);
  } catch {}
}

/** 飞刃/灵火发射轻音 */
export function sfxShoot() {
  if (!canPlay('shoot', 95)) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.035);
    gain.gain.setValueAtTime(0.018, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.038);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  } catch {}
}

/** 命中怪物短促像素打击音 */
export function sfxHit() {
  if (!canPlay('hit', 52)) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(210 + Math.random() * 50, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.032);
    gain.gain.setValueAtTime(0.022, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.036);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.038);
  } catch {}
}

/** 天罚雷落音效 */
export function sfxThunder() {
  if (!canPlay('thunder', 180)) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [320, 180, 110].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.032;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(58, t + 0.09);
      gain.gain.setValueAtTime(0.034, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.095);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  } catch {}
}

/** 主角受击音效 */
export function sfxHurt() {
  if (!canPlay('hurt', 160)) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.linearRampToValueAtTime(75, now + 0.11);
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.125);
  } catch {}
}

/** 升级三选一弹出和弦 */
export function sfxLevelUp() {
  if (!isSoundAllowed()) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.055;
      osc.type = i === 3 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.042, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.16);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.17);
    });
  } catch {}
}

/** 超武进化华丽音效 */
export function sfxEvolve() {
  if (!isSoundAllowed()) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.052;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.045, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.21);
    });
  } catch {}
}

/** 拾取回血/磁铁道具 */
export function sfxPowerup() {
  if (!canPlay('powerup', 120)) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [587.33, 880, 1174.66].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.045;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.13);
    });
  } catch {}
}

/** Boss 登场警报 */
export function sfxBossAlert() {
  if (!isSoundAllowed()) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [220, 196, 220, 146.83].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.12;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.048, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.115);
    });
  } catch {}
}

/** 阵亡音效 */
export function sfxGameOver() {
  if (!isSoundAllowed()) return;
  const ctx = getCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [392, 349.23, 329.63, 261.63].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.11;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.045, t);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.22);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.23);
    });
  } catch {}
}
