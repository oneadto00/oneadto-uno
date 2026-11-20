import { getSpriteAtlas, type AnimatedSprite, type SpriteAtlas } from './sprites';
import {
  sfxBossAlert,
  sfxEvolve,
  sfxGameOver,
  sfxGem,
  sfxHit,
  sfxHurt,
  sfxLevelUp,
  sfxPowerup,
  sfxShoot,
  sfxThunder,
} from './sfx';

export interface RedAdventureOptions {
  onExit?: () => void;
}

type EnemyKind = 'bat' | 'slime' | 'skeleton' | 'wisp' | 'golem' | 'specter' | 'elite' | 'boss';
type WeaponId = 'blade' | 'orbit' | 'aura' | 'thunder' | 'axe' | 'fireball';
type AttrId = 'hp' | 'atk' | 'spd';

interface Enemy {
  id: number;
  kind: EnemyKind;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  speed: number;
  radius: number;
  damage: number;
  xp: number;
  scale: number;
  flashTimer: number;
  animOffset: number;
  isElite?: boolean;
  isBoss?: boolean;
  chargeTimer?: number;
  chargeDirX?: number;
  chargeDirY?: number;
}

interface Projectile {
  kind: 'blade' | 'axe' | 'fireball' | 'bossOrb';
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  pierce: number;
  life: number;
  maxLife: number;
  angle: number;
  evolved?: boolean;
  hitIds: Set<number>;
  returnToPlayer?: boolean;
}

interface Pickup {
  kind: 'gemBlue' | 'gemGreen' | 'gemGold' | 'meat' | 'magnet' | 'bomb' | 'chest';
  x: number;
  y: number;
  xp: number;
  magnetized: boolean;
  speed: number;
}

interface Crate {
  x: number;
  y: number;
  hp: number;
  flashTimer: number;
}

interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  big?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

interface LightningBolt {
  x: number;
  y: number;
  points: Array<{ x: number; y: number }>;
  life: number;
  maxLife: number;
}

interface UpgradeChoice {
  key: string;
  category: 'attr' | 'weapon' | 'evo';
  title: string;
  badge: string;
  desc: string;
  icon: string;
  accent: string;
  apply: () => void;
}

const WEAPON_META: Record<
  WeaponId,
  {
    name: string;
    evoName: string;
    evoReqAttr: AttrId;
    evoReqAttrName: string;
    icon: string;
    evoIcon: string;
    accent: string;
    descriptions: string[];
    evoDesc: string;
  }
> = {
  blade: {
    name: '红号飞刃',
    evoName: '千刃风暴',
    evoReqAttr: 'spd',
    evoReqAttrName: '速度 Lv.2',
    icon: 'blade',
    evoIcon: 'blade_evo',
    accent: '#fb7185',
    descriptions: [
      '自动向最近敌人发射穿透猩红飞刃',
      '飞刃数量 +1，基础伤害提升 25%',
      '穿透目标 +1，飞行速度与射速提升',
      '飞刃数量 +1，伤害再度提升 30%',
      '飞刃数量达 4 枚，穿透 +2（满级可配合【速度】进化超武）',
    ],
    evoDesc: '★ 超武进化：高频连射八方猩红飞刃，无限穿透并撕裂整条弹道！',
  },
  orbit: {
    name: '护身星环',
    evoName: '猩红日冕',
    evoReqAttr: 'atk',
    evoReqAttrName: '力量 Lv.2',
    icon: 'orbit',
    evoIcon: 'orbit_evo',
    accent: '#facc15',
    descriptions: [
      '生成 2 枚环绕周身旋转的像素星轮，切割并击退贴脸敌人',
      '星轮数量增至 3 枚，旋转速度提升 20%',
      '星轮伤害提升 35%，环绕半径扩大',
      '星轮数量增至 4 枚，击退力度大幅增强',
      '5 枚星轮高速护体（满级可配合【力量】进化超武）',
    ],
    evoDesc: '★ 超武进化：6 枚巨型烈焰日冕永动环绕，高额切割伤害粉碎一切近身怪潮！',
  },
  aura: {
    name: '脉冲力场',
    evoName: '噬魂血域',
    evoReqAttr: 'hp',
    evoReqAttrName: '生命 Lv.2',
    icon: 'aura',
    evoIcon: 'aura_evo',
    accent: '#22d3ee',
    descriptions: [
      '在脚下展开脉冲结界，周期灼烧范围内所有敌人并减速',
      '力场范围扩大 22%，脉冲伤害提升 30%',
      '脉冲触发间隔缩短 20%，附带击退微震',
      '力场范围再度扩大 22%，伤害提升 35%',
      '高频广域脉冲力场（满级可配合【生命】进化超武）',
    ],
    evoDesc: '★ 超武进化：化为大范围噬魂血域，每次脉冲击中敌人都为红号恢复生命！',
  },
  thunder: {
    name: '天罚雷落',
    evoName: '天罚雷落',
    evoReqAttr: 'atk',
    evoReqAttrName: '',
    icon: 'thunder',
    evoIcon: 'thunder',
    accent: '#daff78',
    descriptions: [
      '周期性锁定视野内敌人劈落像素雷霆，造成范围爆炸伤害',
      '每次雷落劈击 2 处目标，雷暴半径扩大',
      '雷击伤害提升 40%，冷却时间缩短',
      '每次雷落劈击 3 处目标，附带强力震退',
      '4 道天罚雷暴齐落，毁灭视野内高威胁敌群',
    ],
    evoDesc: '',
  },
  axe: {
    name: '回旋重斧',
    evoName: '回旋重斧',
    evoReqAttr: 'atk',
    evoReqAttrName: '',
    icon: 'axe',
    evoIcon: 'axe',
    accent: '#cbd5e1',
    descriptions: [
      '向怪群抛射重型穿透战斧，飞出后折返再次切割路径敌人',
      '同时投掷 2 把回旋重斧，伤害提升 25%',
      '战斧体积与飞行距离扩大，折返速度提升',
      '同时投掷 3 把回旋重斧，伤害提升 35%',
      '4 把巨型重斧交叉回旋，清扫整排尸潮',
    ],
    evoDesc: '',
  },
  fireball: {
    name: '追踪灵火',
    evoName: '追踪灵火',
    evoReqAttr: 'spd',
    evoReqAttrName: '',
    icon: 'fireball',
    evoIcon: 'fireball',
    accent: '#f97316',
    descriptions: [
      '发射自动拐弯追踪敌人的炽焰灵火，命中引发像素火球爆炸',
      '灵火齐射数量 +1，爆炸范围扩大',
      '灵火伤害提升 35%，发射冷却缩短',
      '灵火齐射数量增至 3 枚，爆炸伤害提升',
      '4 枚高爆追踪灵火连发，轰炸密集怪群',
    ],
    evoDesc: '',
  },
};

export function launchRedAdventure(options: RedAdventureOptions = {}) {
  // 若已存在旧实例则先清理
  document.getElementById('red-adventure-overlay')?.remove();

  const atlas: SpriteAtlas = getSpriteAtlas();

  // 锁定全屏与页面滚动
  const prevHtmlOverflow = document.documentElement.style.overflow;
  const prevBodyOverflow = document.body.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.dataset.gameFullscreen = '1';

  // 创建全屏自适应覆盖层
  const overlay = document.createElement('div');
  overlay.id = 'red-adventure-overlay';
  overlay.innerHTML = `
    <style>
      #red-adventure-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: #07090e;
        color: #fcf8ef;
        font-family: var(--font-mono, monospace);
        user-select: none;
        -webkit-user-select: none;
        touch-action: none;
        overflow: hidden;
        animation: ra-crt-expand 0.36s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes ra-crt-expand {
        0% {
          opacity: 0;
          transform: scale(0.92);
          filter: brightness(2.2);
        }
        100% {
          opacity: 1;
          transform: scale(1);
          filter: brightness(1);
        }
      }
      #ra-canvas {
        display: block;
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        cursor: crosshair;
      }
      /* 顶部像素 HUD */
      .ra-hud-top {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10;
        padding: calc(10px + env(safe-area-inset-top, 0px)) 16px 0;
        pointer-events: none;
      }
      .ra-xp-track {
        position: relative;
        width: 100%;
        height: 18px;
        background: rgba(9, 13, 22, 0.92);
        border: 2px solid #334155;
        border-radius: 3px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.65);
      }
      .ra-xp-fill {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #0ea5e9 0%, #22d3ee 55%, #daff78 100%);
        transition: width 0.12s ease-out;
      }
      .ra-xp-label {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        color: #ffffff;
        text-shadow: 1px 1px 0 #000, -1px -1px 0 #000;
      }
      .ra-bar-row {
        margin-top: 10px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .ra-left-panel {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .ra-stats-row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
      }
      .ra-stat-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 9px;
        background: rgba(11, 15, 25, 0.88);
        border: 1.5px solid rgba(148, 163, 184, 0.35);
        border-radius: 4px;
        font-size: 11.5px;
        color: #f8fafc;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      }
      .ra-stat-pill img {
        width: 15px;
        height: 15px;
        image-rendering: pixelated;
      }
      .ra-weapons-row {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .ra-wpn-slot {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 7px;
        background: rgba(13, 18, 30, 0.9);
        border: 1.5px solid rgba(226, 232, 240, 0.25);
        border-radius: 4px;
        font-size: 11px;
      }
      .ra-wpn-slot.is-evo {
        border-color: #facc15;
        background: rgba(120, 53, 15, 0.45);
        color: #fef08a;
      }
      .ra-wpn-slot img {
        width: 16px;
        height: 16px;
        image-rendering: pixelated;
      }
      .ra-center-clock {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px 16px;
        background: rgba(10, 14, 24, 0.88);
        border: 1.5px solid rgba(225, 29, 72, 0.45);
        border-radius: 4px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.65);
      }
      .ra-time-big {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: 0.1em;
        color: #fcf8ef;
        line-height: 1.1;
      }
      .ra-wave-tag {
        font-size: 10.5px;
        color: #fb7185;
        letter-spacing: 0.06em;
      }
      .ra-right-btns {
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: auto;
      }
      .ra-hud-btn {
        padding: 6px 11px;
        border-radius: 4px;
        background: rgba(15, 23, 42, 0.9);
        border: 1.5px solid rgba(148, 163, 184, 0.38);
        color: #e2e8f0;
        font-family: inherit;
        font-size: 11.5px;
        cursor: pointer;
        transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
      }
      .ra-hud-btn:hover {
        border-color: #daff78;
        color: #daff78;
      }
      .ra-hud-btn.is-danger:hover {
        border-color: #fb7185;
        background: rgba(225, 29, 72, 0.25);
        color: #fecdd3;
      }

      /* Boss 顶部血条 */
      .ra-boss-bar-wrap {
        margin: 8px auto 0;
        max-width: 520px;
        background: rgba(15, 10, 18, 0.92);
        border: 2px solid #e11d48;
        border-radius: 4px;
        padding: 4px 8px;
        display: none;
        flex-direction: column;
        gap: 3px;
        box-shadow: 0 0 24px rgba(225, 29, 72, 0.45);
      }
      .ra-boss-bar-wrap.is-visible {
        display: flex;
      }
      .ra-boss-title {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        font-weight: 700;
        color: #fda4af;
      }
      .ra-boss-track {
        height: 8px;
        background: #1f121b;
        border-radius: 2px;
        overflow: hidden;
      }
      .ra-boss-fill {
        height: 100%;
        width: 100%;
        background: linear-gradient(90deg, #be123c, #fb7185);
      }

      /* 左下角常驻虚拟摇杆底座 + 操作提示 */
      .ra-bottom-hud {
        position: absolute;
        left: 20px;
        bottom: calc(18px + env(safe-area-inset-bottom, 0px));
        right: 20px;
        z-index: 9;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        pointer-events: none;
      }
      .ra-joy-dock {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .ra-joy-base {
        position: relative;
        width: 96px;
        height: 96px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(225, 29, 72, 0.14) 0%, rgba(15, 23, 42, 0.65) 75%);
        border: 2px dashed rgba(251, 113, 133, 0.48);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        touch-action: none;
      }
      .ra-joy-cross-h,
      .ra-joy-cross-v {
        position: absolute;
        background: rgba(251, 113, 133, 0.2);
      }
      .ra-joy-cross-h {
        width: 70%;
        height: 1px;
      }
      .ra-joy-cross-v {
        height: 70%;
        width: 1px;
      }
      .ra-joy-knob {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: radial-gradient(circle at 32% 32%, #fb7185, #e11d48 70%, #881337 100%);
        border: 2px solid #ffe4e6;
        box-shadow: 0 0 14px rgba(225, 29, 72, 0.7);
        transform: translate3d(0px, 0px, 0);
        transition: transform 0.04s linear;
      }
      .ra-controls-tip {
        padding: 6px 11px;
        border-radius: 4px;
        background: rgba(10, 14, 24, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.24);
        font-size: 11px;
        color: #94a3b8;
        line-height: 1.5;
      }

      /* 升级三选一 / 暂停 / 结算弹窗 */
      .ra-modal-backdrop {
        position: absolute;
        inset: 0;
        z-index: 30;
        background: rgba(5, 8, 15, 0.82);
        backdrop-filter: blur(3px);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      .ra-modal-backdrop.is-open {
        display: flex;
      }
      .ra-modal-box {
        width: 100%;
        max-width: 780px;
        background: #0d121f;
        border: 2px solid #e11d48;
        border-radius: 8px;
        padding: 22px 24px;
        box-shadow: 0 28px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(225, 29, 72, 0.22);
        text-align: center;
      }
      .ra-cards-grid {
        margin-top: 18px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }
      .ra-card {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 16px 14px;
        border-radius: 6px;
        background: #131b2e;
        border: 2px solid rgba(148, 163, 184, 0.32);
        color: #f8fafc;
        cursor: pointer;
        touch-action: manipulation;
        transition: transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
      }
      .ra-card:hover,
      .ra-card:active {
        transform: translateY(-2px);
        border-color: var(--card-accent, #daff78);
        background: #18233c;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.65), 0 0 18px color-mix(in srgb, var(--card-accent, #daff78) 30%, transparent);
      }
      .ra-card.is-evo {
        border-color: #facc15;
        background: linear-gradient(180deg, rgba(120, 53, 15, 0.45) 0%, #131b2e 100%);
      }
      .ra-card-key {
        position: absolute;
        top: 8px;
        left: 9px;
        padding: 1px 6px;
        border-radius: 3px;
        background: rgba(15, 23, 42, 0.9);
        border: 1px solid rgba(148, 163, 184, 0.35);
        font-size: 10px;
        color: #94a3b8;
      }
      .ra-card-badge {
        font-size: 10.5px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        margin-bottom: 10px;
        background: rgba(15, 23, 42, 0.85);
        color: var(--card-accent, #daff78);
        border: 1px solid color-mix(in srgb, var(--card-accent, #daff78) 55%, transparent);
      }
      .ra-card-icon {
        width: 44px;
        height: 44px;
        image-rendering: pixelated;
        margin-bottom: 10px;
        flex-shrink: 0;
      }
      .ra-card-body {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .ra-card-title {
        font-size: 16px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 6px;
      }
      .ra-card-desc {
        font-size: 12px;
        line-height: 1.55;
        color: #cbd5e1;
      }

      /* 移动端 (< 720px) 专项适配：紧凑顶栏、居中大号虚拟摇杆、横排点选升级卡片 */
      @media (max-width: 720px) {
        .ra-hud-top {
          padding: calc(8px + env(safe-area-inset-top, 0px)) 10px 0;
        }
        .ra-bar-row {
          margin-top: 7px;
          gap: 6px;
          flex-wrap: wrap;
        }
        .ra-left-panel {
          order: 2;
          width: 100%;
          gap: 5px;
        }
        .ra-center-clock {
          order: 1;
          padding: 3px 10px;
        }
        .ra-time-big {
          font-size: 16px;
        }
        .ra-wave-tag {
          font-size: 9.5px;
        }
        .ra-right-btns {
          order: 1;
          gap: 6px;
        }
        .ra-hud-btn {
          padding: 5px 9px;
          font-size: 11px;
        }
        .ra-stat-pill {
          padding: 3px 6px;
          font-size: 10.5px;
        }
        .ra-wpn-slot {
          padding: 2px 6px;
          font-size: 10px;
        }
        .ra-bottom-hud {
          left: 14px;
          right: 14px;
          bottom: calc(16px + env(safe-area-inset-bottom, 0px));
          justify-content: center;
        }
        .ra-joy-dock {
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .ra-joy-base {
          width: 104px;
          height: 104px;
        }
        .ra-controls-tip {
          font-size: 10px;
          padding: 4px 9px;
          text-align: center;
        }
        .ra-tip-desktop {
          display: none;
        }
        .ra-modal-box {
          padding: 16px 14px;
          max-height: 90dvh;
          overflow-y: auto;
        }
        .ra-cards-grid {
          grid-template-columns: 1fr;
          gap: 10px;
          margin-top: 12px;
        }
        .ra-card {
          flex-direction: row;
          text-align: left;
          padding: 11px 12px;
          gap: 12px;
        }
        .ra-card:active {
          transform: scale(0.98);
        }
        .ra-card-key {
          display: none;
        }
        .ra-card-icon {
          width: 40px;
          height: 40px;
          margin-bottom: 0;
        }
        .ra-card-body {
          align-items: flex-start;
        }
        .ra-card-badge {
          margin-bottom: 4px;
          font-size: 10px;
        }
        .ra-card-title {
          font-size: 15px;
          margin-bottom: 2px;
        }
        .ra-card-desc {
          font-size: 11.5px;
          line-height: 1.45;
        }
      }
      .ra-action-btn {
        padding: 9px 22px;
        border-radius: 5px;
        border: 1.5px solid #daff78;
        background: #daff78;
        color: #090d16;
        font-family: inherit;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.14s ease, filter 0.14s ease;
      }
      .ra-action-btn:hover {
        transform: translateY(-1px);
        filter: brightness(1.08);
      }
      .ra-ghost-btn {
        padding: 9px 18px;
        border-radius: 5px;
        border: 1.5px solid rgba(148, 163, 184, 0.4);
        background: rgba(15, 23, 42, 0.85);
        color: #e2e8f0;
        font-family: inherit;
        font-size: 13px;
        cursor: pointer;
      }
      .ra-ghost-btn:hover {
        border-color: #fcf8ef;
        color: #ffffff;
      }
    </style>

    <canvas id="ra-canvas"></canvas>

    <!-- 顶部像素状态栏 -->
    <div class="ra-hud-top">
      <div class="ra-xp-track">
        <div id="ra-xp-fill" class="ra-xp-fill"></div>
        <div class="ra-xp-label">
          <span id="ra-lv-text">LV.1 · 红号</span>
          <span id="ra-xp-text">EXP 0 / 25</span>
          <span id="ra-kill-text">击杀 0</span>
        </div>
      </div>

      <div class="ra-bar-row">
        <div class="ra-left-panel">
          <div class="ra-stats-row">
            <div class="ra-stat-pill">
              <img src="${atlas.icons.hp}" alt="" />
              <span id="ra-stat-hp">生命 120/120 (Lv.1)</span>
            </div>
            <div class="ra-stat-pill">
              <img src="${atlas.icons.atk}" alt="" />
              <span id="ra-stat-atk">力量 100% (Lv.1)</span>
            </div>
            <div class="ra-stat-pill">
              <img src="${atlas.icons.spd}" alt="" />
              <span id="ra-stat-spd">速度 100% (Lv.1)</span>
            </div>
          </div>
          <div id="ra-weapons-bar" class="ra-weapons-row"></div>
        </div>

        <div class="ra-center-clock">
          <div id="ra-clock" class="ra-time-big">00:00</div>
          <div id="ra-wave-name" class="ra-wave-tag">第一波 · 暗影来袭</div>
        </div>

        <div class="ra-right-btns">
          <button type="button" id="ra-btn-fullscreen" class="ra-hud-btn">全屏</button>
          <button type="button" id="ra-btn-pause" class="ra-hud-btn">暂停 [ESC]</button>
          <button type="button" id="ra-btn-exit" class="ra-hud-btn is-danger">退出 ×</button>
        </div>
      </div>

      <div id="ra-boss-bar" class="ra-boss-bar-wrap">
        <div class="ra-boss-title">
          <span id="ra-boss-name">★ 深渊红王 · 终焉</span>
          <span id="ra-boss-hp">2500 / 2500</span>
        </div>
        <div class="ra-boss-track">
          <div id="ra-boss-fill" class="ra-boss-fill"></div>
        </div>
      </div>
    </div>

    <!-- 底部虚拟摇杆与控制提示 -->
    <div class="ra-bottom-hud">
      <div class="ra-joy-dock">
        <div id="ra-joy-base" class="ra-joy-base">
          <div class="ra-joy-cross-h"></div>
          <div class="ra-joy-cross-v"></div>
          <div id="ra-joy-knob" class="ra-joy-knob"></div>
        </div>
        <div class="ra-controls-tip">
          <div><strong style="color:#fcf8ef;">红号大冒险</strong> · 拖动虚拟摇杆移动 · 自动攻击</div>
          <div class="ra-tip-desktop">键盘：WASD / ↑↓←→ 移动 · 数字键 1/2/3 选卡</div>
        </div>
      </div>
    </div>

    <!-- 升级三选一弹窗 -->
    <div id="ra-upgrade-modal" class="ra-modal-backdrop" role="dialog" aria-label="升级三选一">
      <div class="ra-modal-box">
        <div style="font-size:11px;letter-spacing:0.2em;color:#daff78;">LEVEL UP // 潜能觉醒</div>
        <div style="font-size:24px;font-weight:700;margin-top:4px;color:#fcf8ef;">选择一项能力强化</div>
        <div style="font-size:12px;color:#94a3b8;margin-top:2px;">点击卡片或按数字键 [1] [2] [3] 选择（武器满级 + 对应属性可进化超武）</div>
        <div id="ra-cards-container" class="ra-cards-grid"></div>
      </div>
    </div>

    <!-- 暂停 / 阵亡 / 胜利结算弹窗 -->
    <div id="ra-state-modal" class="ra-modal-backdrop" role="dialog" aria-label="游戏状态">
      <div class="ra-modal-box" style="max-width:460px;">
        <div id="ra-state-sub" style="font-size:11px;letter-spacing:0.2em;color:#fb7185;">SYSTEM PAUSED</div>
        <div id="ra-state-title" style="font-size:28px;font-weight:700;margin-top:6px;color:#fcf8ef;">游戏已暂停</div>
        <p id="ra-state-desc" style="font-size:13px;color:#cbd5e1;line-height:1.65;margin:10px 0 18px;">
          当前为纯前端无存档模式，退出或重新开始将从 Lv.1 重新开局。
        </p>
        <div style="display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;">
          <button type="button" id="ra-state-resume" class="ra-action-btn">继续游戏 [ESC]</button>
          <button type="button" id="ra-state-restart" class="ra-ghost-btn">重新开始 [R]</button>
          <button type="button" id="ra-state-quit" class="ra-ghost-btn" style="border-color:rgba(251,113,133,0.45);color:#fecdd3;">退出回到电脑</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const canvas = document.getElementById('ra-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;
  const xpFillEl = document.getElementById('ra-xp-fill') as HTMLElement;
  const lvTextEl = document.getElementById('ra-lv-text') as HTMLElement;
  const xpTextEl = document.getElementById('ra-xp-text') as HTMLElement;
  const killTextEl = document.getElementById('ra-kill-text') as HTMLElement;
  const statHpEl = document.getElementById('ra-stat-hp') as HTMLElement;
  const statAtkEl = document.getElementById('ra-stat-atk') as HTMLElement;
  const statSpdEl = document.getElementById('ra-stat-spd') as HTMLElement;
  const weaponsBarEl = document.getElementById('ra-weapons-bar') as HTMLElement;
  const clockEl = document.getElementById('ra-clock') as HTMLElement;
  const waveNameEl = document.getElementById('ra-wave-name') as HTMLElement;
  const bossBarEl = document.getElementById('ra-boss-bar') as HTMLElement;
  const bossNameEl = document.getElementById('ra-boss-name') as HTMLElement;
  const bossHpEl = document.getElementById('ra-boss-hp') as HTMLElement;
  const bossFillEl = document.getElementById('ra-boss-fill') as HTMLElement;
  const joyBaseEl = document.getElementById('ra-joy-base') as HTMLElement;
  const joyKnobEl = document.getElementById('ra-joy-knob') as HTMLElement;

  const upgradeModalEl = document.getElementById('ra-upgrade-modal') as HTMLElement;
  const cardsContainerEl = document.getElementById('ra-cards-container') as HTMLElement;
  const stateModalEl = document.getElementById('ra-state-modal') as HTMLElement;
  const stateSubEl = document.getElementById('ra-state-sub') as HTMLElement;
  const stateTitleEl = document.getElementById('ra-state-title') as HTMLElement;
  const stateDescEl = document.getElementById('ra-state-desc') as HTMLElement;
  const stateResumeBtn = document.getElementById('ra-state-resume') as HTMLButtonElement;

  // 逻辑像素分辨率（保持复古 16-bit 清晰 1:1 正方形像素，自动适配横屏电脑与竖屏手机）
  let viewW = 640;
  let viewH = 360;
  const floorPattern = ctx.createPattern(atlas.floorTile, 'repeat');

  const resizeCanvas = () => {
    const sw = Math.max(1, window.innerWidth);
    const sh = Math.max(1, window.innerHeight);
    if (sw >= sh) {
      const aspect = Math.min(2.6, sw / sh);
      viewH = 360;
      viewW = Math.round(viewH * aspect);
    } else {
      const aspect = Math.min(2.5, sh / sw);
      viewW = 264;
      viewH = Math.round(viewW * aspect);
    }
    canvas.width = viewW;
    canvas.height = viewH;
    ctx.imageSmoothingEnabled = false;
  };
  resizeCanvas();

  // ======================== 游戏核心状态 ========================
  let rafId = 0;
  let disposed = false;
  let mode: 'playing' | 'upgrade' | 'paused' | 'gameover' | 'victory' = 'playing';
  let currentChoices: UpgradeChoice[] = [];

  // 玩家状态
  const player = {
    x: 0,
    y: 0,
    facing: 1 as 1 | -1,
    moving: false,
    hp: 120,
    maxHp: 120,
    hpRegen: 0.4,
    level: 1,
    xp: 0,
    nextXp: 22,
    kills: 0,
    invulnTimer: 0,
    flashTimer: 0,
    // 三大属性等级
    attrLevels: {
      hp: 1,
      atk: 1,
      spd: 1,
    } as Record<AttrId, number>,
    // 武器等级 (0 = 未解锁, 1~5 = 常规等级, 6 = 超武进化)
    weapons: {
      blade: 1,
      orbit: 0,
      aura: 0,
      thunder: 0,
      axe: 0,
      fireball: 0,
    } as Record<WeaponId, number>,
  };

  let elapsedSec = 0;
  let spawnAcc = 0;
  let crateAcc = 0;
  let nextEnemyId = 1;
  let elite1Spawned = false;
  let elite2Spawned = false;
  let bossSpawned = false;
  let endlessUnlocked = false;
  let screenShake = 0;
  let screenFlash = 0;
  let gemCombo = 0;
  let gemComboTimer = 0;

  // 武器独立冷却计时
  const cooldowns: Record<WeaponId, number> = {
    blade: 0,
    orbit: 0,
    aura: 0,
    thunder: 0.8,
    axe: 0.6,
    fireball: 0.5,
  };
  let orbitAngle = 0;
  let auraPulseVisual = 0;
  const orbitHitCooldown = new Map<number, number>();

  const enemies: Enemy[] = [];
  const projectiles: Projectile[] = [];
  const pickups: Pickup[] = [];
  const crates: Crate[] = [];
  const texts: FloatingText[] = [];
  const particles: Particle[] = [];
  const bolts: LightningBolt[] = [];

  // 属性计算辅助
  const getDamageMult = () => 1 + (player.attrLevels.atk - 1) * 0.2;
  const getKnockbackMult = () => 1 + (player.attrLevels.atk - 1) * 0.15;
  const getMoveSpeed = () => 96 * (1 + (player.attrLevels.spd - 1) * 0.14);
  const getCooldownMult = () => Math.max(0.48, Math.pow(0.92, player.attrLevels.spd - 1));
  const getMagnetRadius = () => 56 * (1 + (player.attrLevels.spd - 1) * 0.18);

  const addFloatingText = (x: number, y: number, text: string, color: string, big = false) => {
    if (texts.length > 75) texts.shift();
    texts.push({
      x: x + (Math.random() - 0.5) * 8,
      y,
      vy: big ? -28 : -22,
      text,
      color,
      life: big ? 0.85 : 0.55,
      maxLife: big ? 0.85 : 0.55,
      big,
    });
  };

  const spawnBurst = (x: number, y: number, color: string, count = 6, speed = 55) => {
    for (let i = 0; i < count; i++) {
      if (particles.length > 180) particles.shift();
      const ang = Math.random() * Math.PI * 2;
      const spd = (0.35 + Math.random() * 0.65) * speed;
      particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color,
        size: Math.random() > 0.45 ? 2 : 1,
        life: 0.25 + Math.random() * 0.22,
        maxLife: 0.45,
      });
    }
  };

  // 更新顶部属性与武器栏 DOM
  const syncHudDom = () => {
    const xpPct = Math.min(100, Math.round((player.xp / Math.max(1, player.nextXp)) * 100));
    xpFillEl.style.width = `${xpPct}%`;
    lvTextEl.textContent = `LV.${player.level} · 红号`;
    xpTextEl.textContent = `EXP ${Math.floor(player.xp)} / ${player.nextXp}`;
    killTextEl.textContent = `击杀 ${player.kills}`;

    statHpEl.textContent = `生命 ${Math.ceil(player.hp)}/${player.maxHp} (Lv.${player.attrLevels.hp})`;
    statAtkEl.textContent = `力量 ${Math.round(getDamageMult() * 100)}% (Lv.${player.attrLevels.atk})`;
    statSpdEl.textContent = `速度 ${Math.round((1 + (player.attrLevels.spd - 1) * 0.14) * 100)}% (Lv.${player.attrLevels.spd})`;

    const wpnHtml: string[] = [];
    (Object.keys(player.weapons) as WeaponId[]).forEach((id) => {
      const lv = player.weapons[id];
      if (lv <= 0) return;
      const meta = WEAPON_META[id];
      const isEvo = lv >= 6;
      const iconUrl = atlas.icons[isEvo ? meta.evoIcon : meta.icon];
      const title = isEvo ? `★ ${meta.evoName}` : `${meta.name} Lv.${lv}`;
      wpnHtml.push(`
        <div class="ra-wpn-slot ${isEvo ? 'is-evo' : ''}">
          <img src="${iconUrl}" alt="" />
          <span>${title}</span>
        </div>
      `);
    });
    weaponsBarEl.innerHTML = wpnHtml.join('');
  };

  // ======================== 输入控制：WASD + 方向键 + 虚拟摇杆 ========================
  const pressedKeys = new Set<string>();
  const joystick = {
    active: false,
    pointerId: -1,
    originX: 0,
    originY: 0,
    curX: 0,
    curY: 0,
    dx: 0,
    dy: 0,
    maxRadius: 42,
  };

  const updateJoystickKnob = () => {
    const kx = Math.round(joystick.dx * 26);
    const ky = Math.round(joystick.dy * 26);
    joyKnobEl.style.transform = `translate3d(${kx}px, ${ky}px, 0)`;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const code = e.code;
    // 彻底锁死方向键、空格、WASD 与翻页键对页面的滚动
    if (
      code === 'ArrowUp' ||
      code === 'ArrowDown' ||
      code === 'ArrowLeft' ||
      code === 'ArrowRight' ||
      code === 'Space' ||
      code === 'PageUp' ||
      code === 'PageDown' ||
      code === 'KeyW' ||
      code === 'KeyA' ||
      code === 'KeyS' ||
      code === 'KeyD'
    ) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (mode === 'upgrade') {
      if (code === 'Digit1' || code === 'Numpad1') {
        e.preventDefault();
        chooseUpgrade(0);
        return;
      }
      if (code === 'Digit2' || code === 'Numpad2') {
        e.preventDefault();
        chooseUpgrade(1);
        return;
      }
      if (code === 'Digit3' || code === 'Numpad3') {
        e.preventDefault();
        chooseUpgrade(2);
        return;
      }
      return;
    }

    if (code === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (mode === 'playing') openPauseModal();
      else if (mode === 'paused') resumeGame();
      return;
    }

    if (code === 'KeyR' && (mode === 'paused' || mode === 'gameover' || mode === 'victory')) {
      e.preventDefault();
      resetRun();
      return;
    }

    pressedKeys.add(code);
  };

  const onKeyUp = (e: KeyboardEvent) => {
    pressedKeys.delete(e.code);
  };

  const onPointerDown = (e: PointerEvent, fixedCenter?: { x: number; y: number }) => {
    if (mode !== 'playing') return;
    if (e.button !== undefined && e.button !== 0) return;
    joystick.active = true;
    joystick.pointerId = e.pointerId;
    joystick.originX = fixedCenter ? fixedCenter.x : e.clientX;
    joystick.originY = fixedCenter ? fixedCenter.y : e.clientY;
    joystick.curX = e.clientX;
    joystick.curY = e.clientY;
    const vx = joystick.curX - joystick.originX;
    const vy = joystick.curY - joystick.originY;
    const dist = Math.hypot(vx, vy);
    if (dist < 4) {
      joystick.dx = 0;
      joystick.dy = 0;
    } else {
      const clamped = Math.min(joystick.maxRadius, dist) / joystick.maxRadius;
      joystick.dx = (vx / dist) * clamped;
      joystick.dy = (vy / dist) * clamped;
    }
    try {
      (e.currentTarget as HTMLElement | null)?.setPointerCapture?.(e.pointerId);
    } catch {}
    updateJoystickKnob();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!joystick.active || e.pointerId !== joystick.pointerId) return;
    joystick.curX = e.clientX;
    joystick.curY = e.clientY;
    const vx = joystick.curX - joystick.originX;
    const vy = joystick.curY - joystick.originY;
    const dist = Math.hypot(vx, vy);
    if (dist < 4) {
      joystick.dx = 0;
      joystick.dy = 0;
    } else {
      const clamped = Math.min(joystick.maxRadius, dist) / joystick.maxRadius;
      joystick.dx = (vx / dist) * clamped;
      joystick.dy = (vy / dist) * clamped;
    }
    updateJoystickKnob();
  };

  const endJoystick = (e: PointerEvent) => {
    if (!joystick.active || e.pointerId !== joystick.pointerId) return;
    joystick.active = false;
    joystick.pointerId = -1;
    joystick.dx = 0;
    joystick.dy = 0;
    updateJoystickKnob();
  };

  // ======================== 升级三选一构建器 ========================
  const buildUpgradePool = (): UpgradeChoice[] => {
    const pool: UpgradeChoice[] = [];

    // 1. 检查是否满足超武进化（优先级最高）
    (Object.keys(player.weapons) as WeaponId[]).forEach((id) => {
      const lv = player.weapons[id];
      const meta = WEAPON_META[id];
      if (lv === 5 && meta.evoDesc && player.attrLevels[meta.evoReqAttr] >= 2) {
        pool.push({
          key: `evo_${id}`,
          category: 'evo',
          title: meta.evoName,
          badge: '★ 超武进化',
          desc: meta.evoDesc,
          icon: atlas.icons[meta.evoIcon],
          accent: '#facc15',
          apply: () => {
            player.weapons[id] = 6;
            sfxEvolve();
            screenFlash = 0.35;
            addFloatingText(player.x, player.y - 16, `★ ${meta.evoName} 觉醒!`, '#facc15', true);
          },
        });
      }
    });

    // 2. 武器解锁与升级 (Lv.1 ~ Lv.5)
    (Object.keys(player.weapons) as WeaponId[]).forEach((id) => {
      const lv = player.weapons[id];
      if (lv >= 5) return;
      const meta = WEAPON_META[id];
      const nextLv = lv + 1;
      const badge =
        lv === 0
          ? '新武器解锁'
          : nextLv === 5 && meta.evoReqAttrName
            ? `Lv.4 → Lv.5 (满级可配${meta.evoReqAttrName}进化)`
            : `Lv.${lv} → Lv.${nextLv}`;
      pool.push({
        key: `wpn_${id}`,
        category: 'weapon',
        title: meta.name,
        badge,
        desc: meta.descriptions[lv] || meta.descriptions[meta.descriptions.length - 1],
        icon: atlas.icons[meta.icon],
        accent: meta.accent,
        apply: () => {
          player.weapons[id] = nextLv;
          addFloatingText(player.x, player.y - 14, `${meta.name} Lv.${nextLv}`, meta.accent);
        },
      });
    });

    // 3. 三大核心属性加点（生命、力量、速度）
    const hpLv = player.attrLevels.hp;
    pool.push({
      key: 'attr_hp',
      category: 'attr',
      title: '生命强化',
      badge: `属性 · Lv.${hpLv} → Lv.${hpLv + 1}`,
      desc: '最大生命 +30，立即恢复 35 点生命，生命自愈 +0.5/秒（Lv.2 可解锁脉冲力场超武）',
      icon: atlas.icons.hp,
      accent: '#fb7185',
      apply: () => {
        player.attrLevels.hp += 1;
        player.maxHp += 30;
        player.hp = Math.min(player.maxHp, player.hp + 35);
        player.hpRegen += 0.5;
        addFloatingText(player.x, player.y - 14, '生命上限 +30', '#4ade80');
      },
    });

    const atkLv = player.attrLevels.atk;
    pool.push({
      key: 'attr_atk',
      category: 'attr',
      title: '力量强化',
      badge: `属性 · Lv.${atkLv} → Lv.${atkLv + 1}`,
      desc: '所有武器伤害 +20%，击退力度 +15%（Lv.2 可解锁护身星环超武）',
      icon: atlas.icons.atk,
      accent: '#f97316',
      apply: () => {
        player.attrLevels.atk += 1;
        addFloatingText(player.x, player.y - 14, '全局伤害 +20%', '#f97316');
      },
    });

    const spdLv = player.attrLevels.spd;
    pool.push({
      key: 'attr_spd',
      category: 'attr',
      title: '速度强化',
      badge: `属性 · Lv.${spdLv} → Lv.${spdLv + 1}`,
      desc: '移动速度 +14%，武器冷却缩减 +8%，经验拾取范围 +18%（Lv.2 可解锁红号飞刃超武）',
      icon: atlas.icons.spd,
      accent: '#22d3ee',
      apply: () => {
        player.attrLevels.spd += 1;
        addFloatingText(player.x, player.y - 14, '移速与攻速提升', '#22d3ee');
      },
    });

    return pool;
  };

  const triggerLevelUp = () => {
    mode = 'upgrade';
    pressedKeys.clear();
    joystick.active = false;
    joystick.dx = 0;
    joystick.dy = 0;
    updateJoystickKnob();
    sfxLevelUp();

    const pool = buildUpgradePool();
    const evos = pool.filter((c) => c.category === 'evo');
    const attrs = pool.filter((c) => c.category === 'attr');
    const wpns = pool.filter((c) => c.category === 'weapon');

    // 洗牌辅助
    const shuffle = <T,>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const picked: UpgradeChoice[] = [];
    // 若有可进化的超武，优先放入第一张卡片
    if (evos.length > 0) {
      picked.push(evos[0]);
    }
    // 保证每轮既有武器也有属性可选
    const shuffledWpns = shuffle(wpns);
    const shuffledAttrs = shuffle(attrs);
    if (shuffledWpns.length > 0 && picked.length < 3) {
      picked.push(shuffledWpns.shift()!);
    }
    if (shuffledAttrs.length > 0 && picked.length < 3) {
      picked.push(shuffledAttrs.shift()!);
    }
    const rest = shuffle([...shuffledWpns, ...shuffledAttrs]);
    while (picked.length < 3 && rest.length > 0) {
      picked.push(rest.shift()!);
    }

    currentChoices = picked;
    cardsContainerEl.innerHTML = currentChoices
      .map(
        (c, idx) => `
        <button
          type="button"
          class="ra-card ${c.category === 'evo' ? 'is-evo' : ''}"
          data-choice-idx="${idx}"
          style="--card-accent: ${c.accent};"
        >
          <span class="ra-card-key">[${idx + 1}]</span>
          <img class="ra-card-icon" src="${c.icon}" alt="" />
          <div class="ra-card-body">
            <span class="ra-card-badge">${c.badge}</span>
            <div class="ra-card-title">${c.title}</div>
            <div class="ra-card-desc">${c.desc}</div>
          </div>
        </button>
      `
      )
      .join('');

    cardsContainerEl.querySelectorAll<HTMLButtonElement>('[data-choice-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.choiceIdx || 0);
        chooseUpgrade(idx);
      });
    });

    upgradeModalEl.classList.add('is-open');
    syncHudDom();
  };

  const chooseUpgrade = (idx: number) => {
    if (mode !== 'upgrade') return;
    const choice = currentChoices[idx];
    if (!choice) return;
    choice.apply();
    upgradeModalEl.classList.remove('is-open');
    mode = 'playing';

    // 如果经验溢出仍够连升下一级，继续弹出
    if (player.xp >= player.nextXp) {
      player.xp -= player.nextXp;
      player.level += 1;
      player.nextXp = Math.round(player.nextXp * 1.24 + 10);
      triggerLevelUp();
      return;
    }
    syncHudDom();
  };

  // ======================== 怪物生成与波次导演 ========================
  const spawnEnemy = (kind: EnemyKind, angleOverride?: number, distOverride?: number) => {
    const ang = angleOverride ?? Math.random() * Math.PI * 2;
    const dist = distOverride ?? Math.hypot(viewW * 0.55, viewH * 0.55) + 28;
    const x = player.x + Math.cos(ang) * dist;
    const y = player.y + Math.sin(ang) * dist;
    const timeMult = 1 + elapsedSec * 0.011;

    const specs: Record<
      EnemyKind,
      {
        name: string;
        hp: number;
        speed: number;
        radius: number;
        damage: number;
        xp: number;
        scale: number;
        isElite?: boolean;
        isBoss?: boolean;
      }
    > = {
      bat: { name: '暗影蝠', hp: 16, speed: 58, radius: 7, damage: 7, xp: 6, scale: 1 },
      slime: { name: '绿晶史莱姆', hp: 28, speed: 41, radius: 8, damage: 9, xp: 8, scale: 1 },
      skeleton: { name: '白骨剑士', hp: 46, speed: 47, radius: 8, damage: 12, xp: 12, scale: 1 },
      wisp: { name: '炽焰鬼火', hp: 36, speed: 66, radius: 7, damage: 13, xp: 14, scale: 1 },
      golem: { name: '重甲铁卫', hp: 95, speed: 34, radius: 10, damage: 18, xp: 24, scale: 1.1 },
      specter: { name: '虚空幽魂', hp: 62, speed: 55, radius: 8, damage: 15, xp: 18, scale: 1 },
      elite: {
        name: '★ 猩红督军 · 精英',
        hp: 460,
        speed: 50,
        radius: 14,
        damage: 22,
        xp: 90,
        scale: 1.25,
        isElite: true,
      },
      boss: {
        name: '★ 深渊红王 · 终焉',
        hp: 2600,
        speed: 48,
        radius: 18,
        damage: 28,
        xp: 350,
        scale: 1.5,
        isBoss: true,
      },
    };

    const s = specs[kind];
    const maxHp = Math.round(s.hp * (s.isBoss ? 1 : timeMult));
    enemies.push({
      id: nextEnemyId++,
      kind,
      name: s.name,
      x,
      y,
      vx: 0,
      vy: 0,
      hp: maxHp,
      maxHp,
      speed: s.speed,
      radius: s.radius,
      damage: s.damage,
      xp: s.xp,
      scale: s.scale,
      flashTimer: 0,
      animOffset: Math.random() * 10,
      isElite: s.isElite,
      isBoss: s.isBoss,
      chargeTimer: s.isBoss ? 3.5 : undefined,
    });
  };

  const spawnCrate = () => {
    if (crates.length >= 5) return;
    const ang = Math.random() * Math.PI * 2;
    const dist = 160 + Math.random() * 140;
    crates.push({
      x: player.x + Math.cos(ang) * dist,
      y: player.y + Math.sin(ang) * dist,
      hp: 20,
      flashTimer: 0,
    });
  };

  // ======================== 伤害结算与怪物击杀 ========================
  const damageEnemy = (enemy: Enemy, rawDamage: number, knockback = 18, leech = false) => {
    const dmg = Math.max(1, Math.round(rawDamage * getDamageMult()));
    enemy.hp -= dmg;
    enemy.flashTimer = 0.08;
    sfxHit();

    // 击退向量
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.hypot(dx, dy) || 1;
    const kbResist = enemy.isBoss ? 0.12 : enemy.isElite ? 0.35 : enemy.kind === 'golem' ? 0.45 : 1;
    const push = knockback * getKnockbackMult() * kbResist;
    enemy.vx += (dx / dist) * push * 4.5;
    enemy.vy += (dy / dist) * push * 4.5;

    if (leech && player.hp < player.maxHp && Math.random() < 0.32) {
      player.hp = Math.min(player.maxHp, player.hp + 1.2);
    }

    addFloatingText(
      enemy.x,
      enemy.y - enemy.radius,
      `${dmg}`,
      enemy.isBoss || enemy.isElite ? '#facc15' : '#fcf8ef'
    );

    if (enemy.hp <= 0) {
      killEnemy(enemy);
    }
  };

  const killEnemy = (enemy: Enemy) => {
    player.kills += 1;
    spawnBurst(
      enemy.x,
      enemy.y,
      enemy.isBoss ? '#facc15' : enemy.isElite ? '#fb7185' : '#e11d48',
      enemy.isBoss ? 26 : enemy.isElite ? 14 : 6,
      enemy.isBoss ? 110 : 65
    );

    if (enemy.isBoss) {
      bossBarEl.classList.remove('is-visible');
      pickups.push({
        kind: 'chest',
        x: enemy.x,
        y: enemy.y,
        xp: enemy.xp,
        magnetized: true,
        speed: 140,
      });
      if (!endlessUnlocked) {
        endlessUnlocked = true;
        openVictoryModal();
      }
      return;
    }

    if (enemy.isElite) {
      pickups.push({
        kind: 'chest',
        x: enemy.x,
        y: enemy.y,
        xp: enemy.xp,
        magnetized: false,
        speed: 0,
      });
      addFloatingText(enemy.x, enemy.y - 12, '★ 掉落黄金宝箱!', '#facc15', true);
      return;
    }

    const gemKind = enemy.xp >= 18 ? 'gemGold' : enemy.xp >= 10 ? 'gemGreen' : 'gemBlue';
    pickups.push({
      kind: gemKind,
      x: enemy.x,
      y: enemy.y,
      xp: enemy.xp,
      magnetized: false,
      speed: 0,
    });
  };

  // ======================== 6 种自动攻击武器触发 ========================
  const findNearestEnemies = (count: number, maxRange = 320): Enemy[] => {
    const scored: Array<{ e: Enemy; d2: number }> = [];
    const r2 = maxRange * maxRange;
    for (const e of enemies) {
      const d2 = (e.x - player.x) ** 2 + (e.y - player.y) ** 2;
      if (d2 <= r2) scored.push({ e, d2 });
    }
    scored.sort((a, b) => a.d2 - b.d2);
    return scored.slice(0, count).map((item) => item.e);
  };

  const updateWeapons = (dt: number) => {
    const cdMult = getCooldownMult();

    // 1. 红号飞刃 / 千刃风暴
    if (player.weapons.blade > 0) {
      cooldowns.blade -= dt;
      if (cooldowns.blade <= 0) {
        const lv = player.weapons.blade;
        const isEvo = lv >= 6;
        cooldowns.blade = (isEvo ? 0.24 : Math.max(0.38, 0.72 - lv * 0.06)) * cdMult;

        const count = isEvo ? 6 : Math.min(4, 1 + Math.floor(lv / 2) + (lv === 5 ? 1 : 0));
        const targets = findNearestEnemies(count, 320);

        if (targets.length > 0 || isEvo) {
          sfxShoot();
          for (let i = 0; i < count; i++) {
            const target = targets[i % Math.max(1, targets.length)];
            const baseAng = target
              ? Math.atan2(target.y - player.y, target.x - player.x)
              : orbitAngle + (i * Math.PI * 2) / count;
            const spread = isEvo ? (i - (count - 1) / 2) * 0.16 : (i - (count - 1) / 2) * 0.11;
            const ang = baseAng + spread;
            const spd = isEvo ? 290 : 230 + lv * 12;
            projectiles.push({
              kind: 'blade',
              x: player.x,
              y: player.y,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              damage: isEvo ? 30 : 14 + lv * 5,
              radius: isEvo ? 7 : 5,
              pierce: isEvo ? 99 : 1 + Math.floor(lv / 2),
              life: 1.25,
              maxLife: 1.25,
              angle: ang,
              evolved: isEvo,
              hitIds: new Set(),
            });
          }
        }
      }
    }

    // 2. 护身星环 / 猩红日冕
    if (player.weapons.orbit > 0) {
      const lv = player.weapons.orbit;
      const isEvo = lv >= 6;
      const orbCount = isEvo ? 6 : Math.min(5, 1 + lv);
      const radius = isEvo ? 58 : 42 + lv * 3;
      const rotSpeed = isEvo ? 4.4 : 2.5 + lv * 0.32;
      const dmg = isEvo ? 26 : 11 + lv * 4;
      orbitAngle += rotSpeed * dt;

      // 衰减单怪受击冷却
      for (const [eid, timer] of orbitHitCooldown.entries()) {
        if (timer - dt <= 0) orbitHitCooldown.delete(eid);
        else orbitHitCooldown.set(eid, timer - dt);
      }

      for (let i = 0; i < orbCount; i++) {
        const ang = orbitAngle + (i * Math.PI * 2) / orbCount;
        const ox = player.x + Math.cos(ang) * radius;
        const oy = player.y + Math.sin(ang) * radius;
        const hitR = isEvo ? 11 : 8;

        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (!e || orbitHitCooldown.has(e.id)) continue;
          const dist = Math.hypot(e.x - ox, e.y - oy);
          if (dist <= e.radius + hitR) {
            orbitHitCooldown.set(e.id, isEvo ? 0.18 : 0.28);
            damageEnemy(e, dmg, isEvo ? 26 : 18);
          }
        }
      }
    }

    // 3. 脉冲力场 / 噬魂血域
    if (player.weapons.aura > 0) {
      const lv = player.weapons.aura;
      const isEvo = lv >= 6;
      const auraR = isEvo ? 78 : 44 + lv * 6;
      cooldowns.aura -= dt;
      auraPulseVisual = Math.max(0, auraPulseVisual - dt * 2.2);

      if (cooldowns.aura <= 0) {
        cooldowns.aura = (isEvo ? 0.38 : Math.max(0.45, 0.78 - lv * 0.06)) * cdMult;
        auraPulseVisual = 1;
        const dmg = isEvo ? 20 : 8 + lv * 3.5;

        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (!e) continue;
          const dist = Math.hypot(e.x - player.x, e.y - player.y);
          if (dist <= auraR + e.radius) {
            damageEnemy(e, dmg, isEvo ? 14 : 9, isEvo);
          }
        }
      }
    }

    // 4. 天罚雷落
    if (player.weapons.thunder > 0) {
      const lv = player.weapons.thunder;
      cooldowns.thunder -= dt;
      if (cooldowns.thunder <= 0) {
        cooldowns.thunder = Math.max(0.95, 1.9 - lv * 0.16) * cdMult;
        const count = Math.min(4, 1 + Math.floor(lv * 0.75));
        const targets = findNearestEnemies(count + 3, 280);
        if (targets.length > 0) {
          sfxThunder();
          screenShake = Math.max(screenShake, 2.5);
          for (let i = 0; i < Math.min(count, targets.length); i++) {
            const t = targets[i];
            const tx = t.x;
            const ty = t.y;
            const splashR = 32 + lv * 4;
            const dmg = 26 + lv * 11;

            // 生成锯齿闪电轨迹
            const pts: Array<{ x: number; y: number }> = [];
            const startY = ty - 150;
            for (let s = 0; s <= 6; s++) {
              const frac = s / 6;
              pts.push({
                x: tx + (s === 0 || s === 6 ? 0 : (Math.random() - 0.5) * 20),
                y: startY + (ty - startY) * frac,
              });
            }
            bolts.push({ x: tx, y: ty, points: pts, life: 0.24, maxLife: 0.24 });
            spawnBurst(tx, ty, '#daff78', 10, 80);

            for (let j = enemies.length - 1; j >= 0; j--) {
              const e = enemies[j];
              if (!e) continue;
              if (Math.hypot(e.x - tx, e.y - ty) <= splashR + e.radius) {
                damageEnemy(e, dmg, 22);
              }
            }
          }
        }
      }
    }

    // 5. 回旋重斧
    if (player.weapons.axe > 0) {
      const lv = player.weapons.axe;
      cooldowns.axe -= dt;
      if (cooldowns.axe <= 0) {
        cooldowns.axe = Math.max(0.9, 1.55 - lv * 0.11) * cdMult;
        const count = Math.min(4, 1 + Math.floor(lv * 0.75));
        const nearest = findNearestEnemies(1, 280)[0];
        const baseAng = nearest
          ? Math.atan2(nearest.y - player.y, nearest.x - player.x)
          : player.facing === 1
            ? -0.35
            : Math.PI + 0.35;

        sfxShoot();
        for (let i = 0; i < count; i++) {
          const ang = baseAng + (i - (count - 1) / 2) * 0.38;
          const spd = 195 + lv * 10;
          projectiles.push({
            kind: 'axe',
            x: player.x,
            y: player.y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            damage: 22 + lv * 8,
            radius: 9,
            pierce: 99,
            life: 1.55,
            maxLife: 1.55,
            angle: 0,
            hitIds: new Set(),
            returnToPlayer: true,
          });
        }
      }
    }

    // 6. 追踪灵火
    if (player.weapons.fireball > 0) {
      const lv = player.weapons.fireball;
      cooldowns.fireball -= dt;
      if (cooldowns.fireball <= 0) {
        cooldowns.fireball = Math.max(0.75, 1.4 - lv * 0.11) * cdMult;
        const count = Math.min(4, 1 + Math.floor(lv * 0.75));
        const targets = findNearestEnemies(count, 320);
        if (targets.length > 0) {
          sfxShoot();
          for (let i = 0; i < count; i++) {
            const t = targets[i % targets.length];
            const ang = Math.atan2(t.y - player.y, t.x - player.x) + (i - (count - 1) / 2) * 0.25;
            const spd = 165 + lv * 10;
            projectiles.push({
              kind: 'fireball',
              x: player.x,
              y: player.y,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              damage: 20 + lv * 7,
              radius: 6,
              pierce: 1,
              life: 1.8,
              maxLife: 1.8,
              angle: ang,
              hitIds: new Set(),
            });
          }
        }
      }
    }
  };

  // ======================== 弹窗状态切换 ========================
  const openPauseModal = () => {
    mode = 'paused';
    stateSubEl.textContent = 'SYSTEM PAUSED // 暂停';
    stateSubEl.style.color = '#38bdf8';
    stateTitleEl.textContent = '红号大冒险 · 暂停中';
    stateDescEl.textContent = `当前存活 ${clockEl.textContent} · 击杀 ${player.kills} · 等级 LV.${player.level}`;
    stateResumeBtn.style.display = 'inline-block';
    stateResumeBtn.textContent = '继续游戏 [ESC]';
    stateModalEl.classList.add('is-open');
  };

  const openGameOverModal = () => {
    mode = 'gameover';
    sfxGameOver();
    stateSubEl.textContent = 'SIGNAL LOST // 挑战失败';
    stateSubEl.style.color = '#fb7185';
    stateTitleEl.textContent = '红号力竭倒下';
    stateDescEl.textContent = `本局存活 ${clockEl.textContent} · 共击杀 ${player.kills} 只怪物 · 达到 LV.${player.level}。无存档机制，点击重新开始立即开启新局。`;
    stateResumeBtn.style.display = 'none';
    stateModalEl.classList.add('is-open');
  };

  const openVictoryModal = () => {
    mode = 'victory';
    sfxEvolve();
    stateSubEl.textContent = 'BOSS DEFEATED // 讨伐成功';
    stateSubEl.style.color = '#facc15';
    stateTitleEl.textContent = '★ 成功击败深渊红王！';
    stateDescEl.textContent = `耗时 ${clockEl.textContent} · 击杀 ${player.kills} · 等级 LV.${player.level}。你可以继续留在战场挑战无尽怪潮，或重新开始新局。`;
    stateResumeBtn.style.display = 'inline-block';
    stateResumeBtn.textContent = '继续无尽模式';
    stateModalEl.classList.add('is-open');
  };

  const resumeGame = () => {
    stateModalEl.classList.remove('is-open');
    mode = 'playing';
  };

  const resetRun = () => {
    stateModalEl.classList.remove('is-open');
    upgradeModalEl.classList.remove('is-open');
    bossBarEl.classList.remove('is-visible');

    player.x = 0;
    player.y = 0;
    player.facing = 1;
    player.hp = 120;
    player.maxHp = 120;
    player.hpRegen = 0.4;
    player.level = 1;
    player.xp = 0;
    player.nextXp = 22;
    player.kills = 0;
    player.invulnTimer = 0;
    player.flashTimer = 0;
    player.attrLevels = { hp: 1, atk: 1, spd: 1 };
    player.weapons = { blade: 1, orbit: 0, aura: 0, thunder: 0, axe: 0, fireball: 0 };

    elapsedSec = 0;
    spawnAcc = 0;
    crateAcc = 0;
    elite1Spawned = false;
    elite2Spawned = false;
    bossSpawned = false;
    endlessUnlocked = false;
    screenShake = 0;
    screenFlash = 0;

    enemies.length = 0;
    projectiles.length = 0;
    pickups.length = 0;
    crates.length = 0;
    texts.length = 0;
    particles.length = 0;
    bolts.length = 0;
    orbitHitCooldown.clear();

    // 初始生成 3 个补给箱和第一批小怪
    for (let i = 0; i < 3; i++) spawnCrate();
    for (let i = 0; i < 6; i++) spawnEnemy('bat');

    mode = 'playing';
    syncHudDom();
  };

  // ======================== 主循环：物理更新 ========================
  let lastTime = performance.now();

  const updateSimulation = (dt: number) => {
    elapsedSec += dt;
    if (gemComboTimer > 0) {
      gemComboTimer -= dt;
      if (gemComboTimer <= 0) gemCombo = 0;
    }
    if (screenShake > 0) screenShake = Math.max(0, screenShake - dt * 12);
    if (screenFlash > 0) screenFlash = Math.max(0, screenFlash - dt * 1.4);

    // 生命自愈
    if (player.hp < player.maxHp) {
      player.hp = Math.min(player.maxHp, player.hp + player.hpRegen * dt);
    }
    if (player.invulnTimer > 0) player.invulnTimer -= dt;
    if (player.flashTimer > 0) player.flashTimer -= dt;

    // 1. 合成输入移动向量 (WASD + 方向键 + 虚拟摇杆)
    let kx = 0;
    let ky = 0;
    if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft')) kx -= 1;
    if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight')) kx += 1;
    if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')) ky -= 1;
    if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown')) ky += 1;
    if (kx !== 0 && ky !== 0) {
      const inv = 1 / Math.SQRT2;
      kx *= inv;
      ky *= inv;
    }

    let moveX = kx + joystick.dx;
    let moveY = ky + joystick.dy;
    const moveMag = Math.hypot(moveX, moveY);
    if (moveMag > 1) {
      moveX /= moveMag;
      moveY /= moveMag;
    }

    // 若仅用键盘移动，同步让左下角虚拟摇杆微动以提供视觉反馈
    if (!joystick.active) {
      joyKnobEl.style.transform = `translate3d(${Math.round(moveX * 22)}px, ${Math.round(moveY * 22)}px, 0)`;
    }

    const spd = getMoveSpeed();
    player.x += moveX * spd * dt;
    player.y += moveY * spd * dt;
    player.moving = moveMag > 0.05;
    if (moveX < -0.08) player.facing = -1;
    else if (moveX > 0.08) player.facing = 1;

    // 2. 更新时钟与波次导演
    const mins = Math.floor(elapsedSec / 60);
    const secs = Math.floor(elapsedSec % 60);
    clockEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    let waveTitle = '第一波 · 暗影来袭';
    let spawnInterval = 0.65;
    let pool: EnemyKind[] = ['bat', 'slime'];

    if (elapsedSec >= 35 && elapsedSec < 75) {
      waveTitle = '第二波 · 白骨列阵';
      spawnInterval = 0.52;
      pool = ['bat', 'slime', 'skeleton'];
    } else if (elapsedSec >= 75 && elapsedSec < 120) {
      waveTitle = '第三波 · 鬼火奇袭';
      spawnInterval = 0.44;
      pool = ['slime', 'skeleton', 'wisp'];
    } else if (elapsedSec >= 120 && elapsedSec < 175) {
      waveTitle = '第四波 · 铁卫与幽魂';
      spawnInterval = 0.36;
      pool = ['skeleton', 'wisp', 'golem', 'specter'];
    } else if (elapsedSec >= 175) {
      waveTitle = endlessUnlocked ? '★ 无尽深渊 · 狂潮' : '★ 终焉时刻 · 红王降临';
      spawnInterval = 0.28;
      pool = ['wisp', 'golem', 'specter', 'skeleton'];
    }
    waveNameEl.textContent = waveTitle;

    // 精英与终焉 Boss 定时登场
    if (!elite1Spawned && elapsedSec >= 60) {
      elite1Spawned = true;
      sfxBossAlert();
      spawnEnemy('elite');
      addFloatingText(player.x, player.y - 24, '⚠ 精英降临：猩红督军!', '#fb7185', true);
    }
    if (!elite2Spawned && elapsedSec >= 130) {
      elite2Spawned = true;
      sfxBossAlert();
      spawnEnemy('elite');
      addFloatingText(player.x, player.y - 24, '⚠ 双精英围攻!', '#fb7185', true);
      spawnEnemy('elite');
    }
    if (!bossSpawned && elapsedSec >= 180) {
      bossSpawned = true;
      sfxBossAlert();
      screenShake = 5;
      spawnEnemy('boss');
      addFloatingText(player.x, player.y - 28, '★ 终焉 BOSS：深渊红王降临!', '#facc15', true);
    }

    spawnAcc += dt;
    if (spawnAcc >= spawnInterval && enemies.length < 185) {
      spawnAcc = 0;
      const batch = elapsedSec > 110 ? 3 : elapsedSec > 45 ? 2 : 1;
      for (let i = 0; i < batch; i++) {
        const kind = pool[Math.floor(Math.random() * pool.length)];
        spawnEnemy(kind);
      }
    }

    crateAcc += dt;
    if (crateAcc >= 11) {
      crateAcc = 0;
      spawnCrate();
    }

    // 3. 自动攻击武器更新
    updateWeapons(dt);

    // 4. 更新飞弹与回旋斧
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.life -= dt;
      if (p.life <= 0) {
        projectiles.splice(i, 1);
        continue;
      }

      if (p.kind === 'axe') {
        p.angle += 11 * dt;
        // 后半程朝主角回旋折返
        if (p.life < p.maxLife * 0.58 && p.returnToPlayer) {
          const dx = player.x - p.x;
          const dy = player.y - p.y;
          const d = Math.hypot(dx, dy) || 1;
          p.vx += (dx / d) * 420 * dt;
          p.vy += (dy / d) * 420 * dt;
        }
      } else if (p.kind === 'fireball') {
        // 轻微自动转向最近敌人
        const target = findNearestEnemies(1, 200)[0];
        if (target) {
          const desired = Math.atan2(target.y - p.y, target.x - p.x);
          const cur = Math.atan2(p.vy, p.vx);
          let diff = desired - cur;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const nextAng = cur + Math.max(-4.5 * dt, Math.min(4.5 * dt, diff));
          const spdNow = Math.hypot(p.vx, p.vy);
          p.vx = Math.cos(nextAng) * spdNow;
          p.vy = Math.sin(nextAng) * spdNow;
          p.angle = nextAng;
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // 敌方 Boss 弹幕伤害主角
      if (p.kind === 'bossOrb') {
        if (Math.hypot(p.x - player.x, p.y - player.y) <= p.radius + 7) {
          if (player.invulnTimer <= 0) {
            player.hp -= p.damage;
            player.invulnTimer = 0.45;
            player.flashTimer = 0.16;
            sfxHurt();
            screenShake = 3.5;
            addFloatingText(player.x, player.y - 12, `-${p.damage}`, '#fb7185', true);
            if (player.hp <= 0) {
              player.hp = 0;
              syncHudDom();
              openGameOverModal();
              return;
            }
          }
          projectiles.splice(i, 1);
        }
        continue;
      }

      // 命中补给箱
      for (let cIdx = crates.length - 1; cIdx >= 0; cIdx--) {
        const c = crates[cIdx];
        if (Math.hypot(p.x - c.x, p.y - c.y) <= p.radius + 9) {
          c.hp -= p.damage;
          c.flashTimer = 0.08;
          if (c.hp <= 0) {
            crates.splice(cIdx, 1);
            spawnBurst(c.x, c.y, '#facc15', 8, 60);
            const roll = Math.random();
            const dropKind = roll < 0.48 ? 'meat' : roll < 0.8 ? 'magnet' : 'bomb';
            pickups.push({
              kind: dropKind,
              x: c.x,
              y: c.y,
              xp: 0,
              magnetized: false,
              speed: 0,
            });
          }
        }
      }

      // 命中敌人
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (!e || p.hitIds.has(e.id)) continue;
        if (Math.hypot(p.x - e.x, p.y - e.y) <= p.radius + e.radius) {
          p.hitIds.add(e.id);
          if (p.kind === 'fireball') {
            // 灵火范围爆炸
            spawnBurst(p.x, p.y, '#f97316', 10, 75);
            for (let k = enemies.length - 1; k >= 0; k--) {
              const ek = enemies[k];
              if (ek && Math.hypot(ek.x - p.x, ek.y - p.y) <= 28 + ek.radius) {
                damageEnemy(ek, p.damage, 16);
              }
            }
          } else {
            damageEnemy(e, p.damage, p.kind === 'axe' ? 22 : 14);
          }

          p.pierce -= 1;
          if (p.pierce <= 0) {
            projectiles.splice(i, 1);
            break;
          }
        }
      }
    }

    // 5. 更新怪物 AI 与碰撞
    let activeBoss: Enemy | null = null;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (!e) continue;
      if (e.flashTimer > 0) e.flashTimer -= dt;

      // 若普通小怪离主角太远则传送回视野边缘
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;
      const maxWrapDist = Math.max(viewW, viewH) * 0.95;
      if (!e.isBoss && !e.isElite && dist > maxWrapDist) {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.hypot(viewW * 0.55, viewH * 0.55);
        e.x = player.x + Math.cos(ang) * r;
        e.y = player.y + Math.sin(ang) * r;
        continue;
      }

      if (e.isBoss) {
        activeBoss = e;
        e.chargeTimer = (e.chargeTimer ?? 3.5) - dt;
        if (e.chargeTimer <= 0) {
          e.chargeTimer = 4.2;
          // Boss 释放 8 向猩红弹幕 + 加速冲锋
          e.vx = (dx / dist) * 145;
          e.vy = (dy / dist) * 145;
          for (let b = 0; b < 8; b++) {
            const bang = (b * Math.PI * 2) / 8;
            projectiles.push({
              kind: 'bossOrb',
              x: e.x,
              y: e.y,
              vx: Math.cos(bang) * 115,
              vy: Math.sin(bang) * 115,
              damage: 16,
              radius: 5,
              pierce: 1,
              life: 3.2,
              maxLife: 3.2,
              angle: bang,
              hitIds: new Set(),
            });
          }
        }
      }

      // 脉冲力场内轻微减速
      const inAura =
        player.weapons.aura > 0 &&
        dist <= (player.weapons.aura >= 6 ? 78 : 44 + player.weapons.aura * 6);
      const spdFactor = inAura ? 0.72 : 1;

      e.x += ((dx / dist) * e.speed * spdFactor + e.vx) * dt;
      e.y += ((dy / dist) * e.speed * spdFactor + e.vy) * dt;
      e.vx *= Math.pow(0.04, dt);
      e.vy *= Math.pow(0.04, dt);

      // 怪与怪之间轻推防完全重叠
      for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
        const other = enemies[j];
        if (!other) continue;
        const ox = e.x - other.x;
        const oy = e.y - other.y;
        const minD = (e.radius + other.radius) * 0.78;
        const d2 = ox * ox + oy * oy;
        if (d2 > 0.01 && d2 < minD * minD) {
          const d = Math.sqrt(d2);
          const push = ((minD - d) / minD) * 24 * dt;
          e.x += (ox / d) * push;
          e.y += (oy / d) * push;
          other.x -= (ox / d) * push;
          other.y -= (oy / d) * push;
        }
      }

      // 接触主角扣血
      if (dist <= e.radius + 7 && player.invulnTimer <= 0) {
        player.hp -= e.damage;
        player.invulnTimer = 0.45;
        player.flashTimer = 0.18;
        sfxHurt();
        screenShake = 3.2;
        addFloatingText(player.x, player.y - 12, `-${e.damage}`, '#fb7185', true);
        if (player.hp <= 0) {
          player.hp = 0;
          syncHudDom();
          openGameOverModal();
          return;
        }
      }
    }

    if (activeBoss) {
      bossBarEl.classList.add('is-visible');
      bossNameEl.textContent = activeBoss.name;
      bossHpEl.textContent = `${Math.max(0, Math.ceil(activeBoss.hp))} / ${activeBoss.maxHp}`;
      bossFillEl.style.width = `${Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100)}%`;
    } else {
      bossBarEl.classList.remove('is-visible');
    }

    // 6. 更新拾取物与经验磁吸
    const magR = getMagnetRadius();
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      const dx = player.x - p.x;
      const dy = player.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (dist <= magR) {
        p.magnetized = true;
      }
      if (p.magnetized) {
        p.speed = Math.min(360, (p.speed || 130) + 420 * dt);
        p.x += (dx / dist) * p.speed * dt;
        p.y += (dy / dist) * p.speed * dt;
      }

      if (dist <= 12) {
        pickups.splice(i, 1);
        if (p.kind === 'meat') {
          sfxPowerup();
          const heal = Math.round(player.maxHp * 0.35);
          player.hp = Math.min(player.maxHp, player.hp + heal);
          addFloatingText(player.x, player.y - 14, `+${heal} HP`, '#4ade80', true);
        } else if (p.kind === 'magnet') {
          sfxPowerup();
          for (const item of pickups) {
            item.magnetized = true;
          }
          addFloatingText(player.x, player.y - 16, '★ 全图经验磁吸!', '#38bdf8', true);
        } else if (p.kind === 'bomb') {
          sfxThunder();
          screenFlash = 0.4;
          screenShake = 5;
          addFloatingText(player.x, player.y - 16, '★ 超载清屏脉冲!', '#facc15', true);
          for (let k = enemies.length - 1; k >= 0; k--) {
            const ek = enemies[k];
            if (ek) damageEnemy(ek, ek.isBoss ? 180 : 999, 40);
          }
        } else if (p.kind === 'chest') {
          sfxEvolve();
          player.xp += p.xp;
          for (const item of pickups) item.magnetized = true;
          triggerLevelUp();
          return;
        } else {
          gemCombo += 1;
          gemComboTimer = 0.65;
          sfxGem(gemCombo);
          player.xp += p.xp;
          if (player.xp >= player.nextXp) {
            player.xp -= player.nextXp;
            player.level += 1;
            player.nextXp = Math.round(player.nextXp * 1.24 + 10);
            triggerLevelUp();
            return;
          }
        }
      }
    }

    // 7. 粒子、闪电与跳字衰减
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
    }

    for (let i = bolts.length - 1; i >= 0; i--) {
      bolts[i].life -= dt;
      if (bolts[i].life <= 0) bolts.splice(i, 1);
    }

    for (let i = texts.length - 1; i >= 0; i--) {
      const t = texts[i];
      t.life -= dt;
      if (t.life <= 0) {
        texts.splice(i, 1);
        continue;
      }
      t.y += t.vy * dt;
    }

    syncHudDom();
  };

  // ======================== 渲染管线 ========================
  const drawAnimatedSprite = (
    sprite: AnimatedSprite,
    worldX: number,
    worldY: number,
    facingRight: boolean,
    frameIdx: 0 | 1,
    flash: boolean,
    scale = 1
  ) => {
    const img = flash
      ? facingRight
        ? sprite.flashRight
        : sprite.flashLeft
      : facingRight
        ? sprite.right[frameIdx]
        : sprite.left[frameIdx];

    const dw = Math.round(sprite.w * scale);
    const dh = Math.round(sprite.h * scale);
    const dx = Math.round(worldX - dw / 2);
    const dy = Math.round(worldY - dh / 2);

    // 脚下像素椭圆阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fillRect(dx + 3, dy + dh - 3, Math.max(4, dw - 6), 3);

    ctx.drawImage(img, dx, dy, dw, dh);
  };

  const renderScene = () => {
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    const shakeX = screenShake > 0 ? Math.round((Math.random() - 0.5) * screenShake * 2) : 0;
    const shakeY = screenShake > 0 ? Math.round((Math.random() - 0.5) * screenShake * 2) : 0;
    const camX = Math.round(player.x - viewW / 2) + shakeX;
    const camY = Math.round(player.y - viewH / 2) + shakeY;

    // 1. 绘制无限滚动像素地牢地砖
    if (floorPattern) {
      ctx.save();
      ctx.translate(-camX, -camY);
      ctx.fillStyle = floorPattern;
      ctx.fillRect(camX, camY, viewW, viewH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#0d1017';
      ctx.fillRect(0, 0, viewW, viewH);
    }

    ctx.translate(-camX, -camY);

    // 2. 绘制脉冲力场 / 噬魂血域
    if (player.weapons.aura > 0) {
      const lv = player.weapons.aura;
      const isEvo = lv >= 6;
      const auraR = isEvo ? 78 : 44 + lv * 6;
      ctx.save();
      ctx.beginPath();
      ctx.arc(Math.round(player.x), Math.round(player.y), auraR, 0, Math.PI * 2);
      ctx.fillStyle = isEvo
        ? `rgba(225, 29, 72, ${0.11 + auraPulseVisual * 0.14})`
        : `rgba(34, 211, 238, ${0.08 + auraPulseVisual * 0.12})`;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isEvo
        ? `rgba(251, 113, 133, ${0.42 + auraPulseVisual * 0.45})`
        : `rgba(34, 211, 238, ${0.34 + auraPulseVisual * 0.4})`;
      ctx.stroke();
      ctx.restore();
    }

    // 3. 绘制补给箱
    for (const c of crates) {
      const img = atlas.props.crate;
      ctx.drawImage(img, Math.round(c.x - img.width / 2), Math.round(c.y - img.height / 2));
    }

    // 4. 绘制掉落宝石与道具
    const bob = Math.sin(elapsedSec * 6) * 1.5;
    for (const p of pickups) {
      const img = atlas.props[p.kind];
      ctx.drawImage(
        img,
        Math.round(p.x - img.width / 2),
        Math.round(p.y - img.height / 2 + (p.magnetized ? 0 : bob))
      );
    }

    // 5. 绘制所有怪物
    for (const e of enemies) {
      if (
        e.x < camX - 40 ||
        e.x > camX + viewW + 40 ||
        e.y < camY - 40 ||
        e.y > camY + viewH + 40
      ) {
        continue;
      }
      const spr = atlas.enemies[e.kind];
      const frame: 0 | 1 = Math.floor((elapsedSec + e.animOffset) * 6) % 2 === 0 ? 0 : 1;
      const facingRight = player.x >= e.x;
      drawAnimatedSprite(spr, e.x, e.y, facingRight, frame, e.flashTimer > 0, e.scale);

      // 精英怪小血条
      if (e.isElite && e.hp < e.maxHp) {
        const bw = 22;
        const bx = Math.round(e.x - bw / 2);
        const by = Math.round(e.y - 16);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(bx - 1, by - 1, bw + 2, 4);
        ctx.fillStyle = '#fb7185';
        ctx.fillRect(bx, by, Math.max(1, Math.round((e.hp / e.maxHp) * bw)), 2);
      }
    }

    // 6. 绘制主角「红号」與脚下血条
    const heroFrame: 0 | 1 = player.moving && Math.floor(elapsedSec * 9) % 2 === 1 ? 1 : 0;
    drawAnimatedSprite(
      atlas.hero,
      player.x,
      player.y,
      player.facing === 1,
      heroFrame,
      player.flashTimer > 0,
      1.05
    );

    // 主角头顶/脚下微型血条
    const hbw = 20;
    const hbx = Math.round(player.x - hbw / 2);
    const hby = Math.round(player.y + 12);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(hbx - 1, hby - 1, hbw + 2, 4);
    ctx.fillStyle = player.hp / player.maxHp > 0.35 ? '#4ade80' : '#fb7185';
    ctx.fillRect(hbx, hby, Math.max(1, Math.round((player.hp / player.maxHp) * hbw)), 2);

    // 7. 绘制护身星环 / 猩红日冕
    if (player.weapons.orbit > 0) {
      const lv = player.weapons.orbit;
      const isEvo = lv >= 6;
      const orbCount = isEvo ? 6 : Math.min(5, 1 + lv);
      const radius = isEvo ? 58 : 42 + lv * 3;
      for (let i = 0; i < orbCount; i++) {
        const ang = orbitAngle + (i * Math.PI * 2) / orbCount;
        const ox = Math.round(player.x + Math.cos(ang) * radius);
        const oy = Math.round(player.y + Math.sin(ang) * radius);
        ctx.fillStyle = isEvo ? '#fb7185' : '#facc15';
        ctx.fillRect(ox - 4, oy - 4, 8, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ox - 2, oy - 2, 4, 4);
      }
    }

    // 8. 绘制飞刃、战斧、灵火与 Boss 弹幕
    for (const p of projectiles) {
      ctx.save();
      ctx.translate(Math.round(p.x), Math.round(p.y));
      ctx.rotate(p.angle);
      if (p.kind === 'blade') {
        ctx.fillStyle = p.evolved ? '#facc15' : '#e11d48';
        ctx.fillRect(-6, -2, 12, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, -1, 6, 2);
      } else if (p.kind === 'axe') {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-6, -6, 12, 4);
        ctx.fillRect(-6, 2, 12, 4);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(-2, -5, 4, 10);
      } else if (p.kind === 'fireball') {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-5, -4, 10, 8);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-2, -2, 5, 4);
      } else if (p.kind === 'bossOrb') {
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(-4, -4, 8, 8);
        ctx.fillStyle = '#fecdd3';
        ctx.fillRect(-2, -2, 4, 4);
      }
      ctx.restore();
    }

    // 9. 绘制天罚闪电链
    for (const b of bolts) {
      ctx.save();
      ctx.strokeStyle = '#daff78';
      ctx.lineWidth = 2;
      ctx.beginPath();
      b.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.restore();
    }

    // 10. 绘制像素粒子
    for (const pt of particles) {
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
    }

    // 11. 绘制像素伤害跳字
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    for (const t of texts) {
      ctx.font = t.big ? 'bold 12px monospace' : 'bold 9px monospace';
      ctx.fillStyle = '#000000';
      ctx.fillText(t.text, Math.round(t.x + 1), Math.round(t.y + 1));
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, Math.round(t.x), Math.round(t.y));
    }

    ctx.restore();

    // 12. 若正在用鼠标/触屏在画布任意位置拖拽浮动虚拟摇杆，在按压处绘制跟随指示环
    if (joystick.active) {
      const scaleX = viewW / Math.max(1, window.innerWidth);
      const scaleY = viewH / Math.max(1, window.innerHeight);
      const ox = joystick.originX * scaleX;
      const oy = joystick.originY * scaleY;
      const cx = ox + joystick.dx * 22;
      const cy = oy + joystick.dy * 22;

      ctx.save();
      ctx.strokeStyle = 'rgba(251, 113, 133, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ox, oy, 24, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(225, 29, 72, 0.85)';
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 13. 边缘暗角与闪屏特效
    if (screenFlash > 0) {
      ctx.fillStyle = `rgba(250, 204, 21, ${Math.min(0.4, screenFlash)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }
  };

  const loop = (now: number) => {
    if (disposed) return;
    const rawDt = (now - lastTime) * 0.001;
    lastTime = now;
    const dt = Math.min(0.05, Math.max(0.001, rawDt));

    if (mode === 'playing') {
      updateSimulation(dt);
    }
    renderScene();
    rafId = window.requestAnimationFrame(loop);
  };

  // ======================== 销毁并退回 3D 电脑桌面 ========================
  const destroyAndExit = () => {
    if (disposed) return;
    disposed = true;
    window.cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('keydown', onKeyDown, true);
    window.removeEventListener('keyup', onKeyUp, true);

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    document.documentElement.style.overflow = prevHtmlOverflow;
    document.body.style.overflow = prevBodyOverflow;
    delete document.body.dataset.gameFullscreen;

    overlay.remove();
    options.onExit?.();
  };

  // 绑定顶栏与弹窗按钮
  document.getElementById('ra-btn-pause')?.addEventListener('click', () => {
    if (mode === 'playing') openPauseModal();
    else if (mode === 'paused') resumeGame();
  });
  document.getElementById('ra-btn-exit')?.addEventListener('click', destroyAndExit);
  document.getElementById('ra-btn-fullscreen')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      overlay.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  });

  stateResumeBtn.addEventListener('click', resumeGame);
  document.getElementById('ra-state-restart')?.addEventListener('click', resetRun);
  document.getElementById('ra-state-quit')?.addEventListener('click', destroyAndExit);

  // 绑定键盘与虚拟摇杆
  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('keyup', onKeyUp, true);
  canvas.addEventListener('pointerdown', (e) => onPointerDown(e));
  joyBaseEl?.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const rect = joyBaseEl.getBoundingClientRect();
    onPointerDown(e, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  });
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', endJoystick);
  window.addEventListener('pointercancel', endJoystick);

  // 启动首局
  resetRun();
  rafId = window.requestAnimationFrame(loop);

  return {
    destroy: destroyAndExit,
  };
}
