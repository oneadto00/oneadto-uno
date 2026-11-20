/**
 * 《红号大冒险》16-bit 像素精灵图集与地砖烘焙器
 * 纯客户端离屏 Canvas 预渲染，带 1px 暗色轮廓描边、双帧动画、左右镜像与受击闪白帧
 */

export interface AnimatedSprite {
  w: number;
  h: number;
  right: [HTMLCanvasElement, HTMLCanvasElement];
  left: [HTMLCanvasElement, HTMLCanvasElement];
  flashRight: HTMLCanvasElement;
  flashLeft: HTMLCanvasElement;
}

export interface SpriteAtlas {
  hero: AnimatedSprite;
  enemies: {
    bat: AnimatedSprite;
    slime: AnimatedSprite;
    skeleton: AnimatedSprite;
    wisp: AnimatedSprite;
    golem: AnimatedSprite;
    specter: AnimatedSprite;
    elite: AnimatedSprite;
    boss: AnimatedSprite;
  };
  props: {
    gemBlue: HTMLCanvasElement;
    gemGreen: HTMLCanvasElement;
    gemGold: HTMLCanvasElement;
    crate: HTMLCanvasElement;
    meat: HTMLCanvasElement;
    magnet: HTMLCanvasElement;
    bomb: HTMLCanvasElement;
    chest: HTMLCanvasElement;
  };
  icons: Record<string, string>;
  floorTile: HTMLCanvasElement;
}

const PALETTE: Record<string, string> = {
  // 主角「红号」猩红斗篷与荧光目镜
  R: '#e11d48', // 鲜猩红
  r: '#9f1239', // 暗酒红阴影
  P: '#fb7185', // 绯红高光
  Y: '#daff78', // 荧光黄绿目镜/核心
  G: '#4ade80', // 翠绿
  g: '#15803d', // 深森绿
  C: '#22d3ee', // 青色脉冲
  c: '#0e7490', // 深青
  B: '#38bdf8', // 天蓝
  b: '#1d4ed8', // 皇家蓝
  W: '#f8fafc', // 骨白/高光
  w: '#cbd5e1', // 银灰
  S: '#64748b', // 铁灰
  s: '#334155', // 暗钢灰
  D: '#1e293b', // 深甲黑蓝
  d: '#0f172a', // 极夜深蓝
  O: '#f97316', // 炽橙
  A: '#facc15', // 黄金
  a: '#b45309', // 暗金/古铜
  V: '#c084fc', // 虚空亮紫
  v: '#6b21a8', // 深暗紫
  M: '#f43f5e', // 玫瑰红
};

/**
 * 将字符点阵渲染为带 1px 深色像素描边的离屏 Canvas
 */
function bakeMatrix(
  rows: string[],
  options: { flipX?: boolean; flashWhite?: boolean; outlineColor?: string } = {}
): HTMLCanvasElement {
  const h = rows.length;
  const w = rows[0]?.length || 16;
  const pad = 2; // 留出 1px 描边安全边距
  const canvas = document.createElement('canvas');
  canvas.width = w + pad * 2;
  canvas.height = h + pad * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  const filled = (x: number, y: number): string | null => {
    if (y < 0 || y >= h || x < 0 || x >= w) return null;
    const colIdx = options.flipX ? w - 1 - x : x;
    const ch = rows[y][colIdx];
    if (!ch || ch === '.' || ch === ' ') return null;
    return PALETTE[ch] || null;
  };

  // 第一遍：自动生成 1px 像素外轮廓
  ctx.fillStyle = options.flashWhite ? '#ffffff' : options.outlineColor || '#07090e';
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (filled(x, y)) continue;
      if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) {
        ctx.fillRect(x + pad, y + pad, 1, 1);
      }
    }
  }

  // 第二遍：填充像素本体
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const color = filled(x, y);
      if (!color) continue;
      ctx.fillStyle = options.flashWhite ? '#ffffff' : color;
      ctx.fillRect(x + pad, y + pad, 1, 1);
    }
  }

  return canvas;
}

function buildAnimated(frame0: string[], frame1: string[]): AnimatedSprite {
  const r0 = bakeMatrix(frame0);
  const r1 = bakeMatrix(frame1);
  const l0 = bakeMatrix(frame0, { flipX: true });
  const l1 = bakeMatrix(frame1, { flipX: true });
  const flashRight = bakeMatrix(frame0, { flashWhite: true });
  const flashLeft = bakeMatrix(frame0, { flipX: true, flashWhite: true });
  return {
    w: r0.width,
    h: r0.height,
    right: [r0, r1],
    left: [l0, l1],
    flashRight,
    flashLeft,
  };
}

/** 烘焙 64x64 暗黑石砖地牢无缝像素地砖 */
function createFloorTile(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;

  // 深色地基
  ctx.fillStyle = '#0d1017';
  ctx.fillRect(0, 0, 64, 64);

  // 石砖块 (32x16 交错排布)
  const bricks = [
    { x: 1, y: 1, w: 30, h: 14, tone: '#131822' },
    { x: 33, y: 1, w: 30, h: 14, tone: '#111620' },
    { x: 17, y: 17, w: 30, h: 14, tone: '#141924' },
    { x: 49, y: 17, w: 14, h: 14, tone: '#121722' },
    { x: 1, y: 17, w: 14, h: 14, tone: '#121722' },
    { x: 1, y: 33, w: 30, h: 14, tone: '#121721' },
    { x: 33, y: 33, w: 30, h: 14, tone: '#151a26' },
    { x: 17, y: 49, w: 30, h: 14, tone: '#111620' },
    { x: 49, y: 49, w: 14, h: 14, tone: '#131823' },
    { x: 1, y: 49, w: 14, h: 14, tone: '#131823' },
  ];

  for (const b of bricks) {
    ctx.fillStyle = b.tone;
    ctx.fillRect(b.x, b.y, b.w, b.h);
    // 像素砖块上沿微亮边与下沿暗边
    ctx.fillStyle = '#1b2230';
    ctx.fillRect(b.x, b.y, b.w, 1);
    ctx.fillStyle = '#090c11';
    ctx.fillRect(b.x, b.y + b.h - 1, b.w, 1);
  }

  // 像素青苔与微暗裂纹点缀
  const mossDots = [
    [6, 4], [7, 4], [6, 5],
    [38, 36], [39, 36], [40, 37],
    [22, 20], [23, 21],
    [54, 52], [55, 52],
  ];
  ctx.fillStyle = '#132a23';
  for (const [mx, my] of mossDots) {
    ctx.fillRect(mx, my, 1, 1);
  }

  // 极淡猩红微晶颗粒
  ctx.fillStyle = '#291521';
  ctx.fillRect(14, 10, 1, 1);
  ctx.fillRect(45, 25, 1, 1);
  ctx.fillRect(28, 56, 1, 1);

  return c;
}

/** 烘焙升级卡片与 HUD 用的高对比 24x24 像素图标 DataURL */
function bakeIconDataUrl(rows: string[]): string {
  const base = bakeMatrix(rows);
  const out = document.createElement('canvas');
  out.width = 48;
  out.height = 48;
  const ctx = out.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(base, 0, 0, out.width, out.height);
  return out.toDataURL();
}

let cachedAtlas: SpriteAtlas | null = null;

export function getSpriteAtlas(): SpriteAtlas {
  if (cachedAtlas) return cachedAtlas;

  // 1. 主角「红号」(16x16 猩红披风游侠 + 荧光目镜)
  const heroF0 = [
    '.....PPPPPP.....',
    '....PRRRRRRP....',
    '...PRRRRRRRRP...',
    '...PRRDDDDDRP...',
    '...PRDDYYYDDP...',
    '...PRDDDDDDDP...',
    '....PRRRRRRP....',
    '...rRRRRRRRRr...',
    '..rrRRRRRRRRWC..',
    '..rrRDDDDDDRr...',
    '..r.DDDDDDDD....',
    '....DDssssDD....',
    '....DD....DD....',
    '...sS......Ss...',
    '...RR......RR...',
    '................',
  ];
  const heroF1 = [
    '.....PPPPPP.....',
    '....PRRRRRRP....',
    '...PRRRRRRRRP...',
    '...PRRDDDDDRP...',
    '...PRDDYYYDDP...',
    '...PRDDDDDDDP...',
    '....PRRRRRRP....',
    '..rrRRRRRRRRr...',
    '.rrrRRRRRRRRWC..',
    '.rr.RDDDDDDRr...',
    '....DDDDDDDD....',
    '.....DDssDD.....',
    '....sS....Ss....',
    '....RR....RR....',
    '................',
    '................',
  ];

  // 2. 暗影蝠 (14x12)
  const batF0 = [
    'v............v',
    'Vv..........vV',
    'VVv...dd...vVV',
    'VVVv.dRRd.vVVV',
    '.VVVdddddVVV..',
    '..vVddMMddVv..',
    '....dddddd....',
    '.....v..v.....',
  ];
  const batF1 = [
    '..............',
    '..............',
    '....v.dd.v....',
    '..vVvdRRdvVv..',
    '.VVVdddddVVV..',
    'VVv.ddMMdd.vVV',
    'Vv...dddd...vV',
    'v....v..v....v',
  ];

  // 3. 绿晶史莱姆 (14x12)
  const slimeF0 = [
    '....GGGGGG....',
    '..GGGGGGGGGG..',
    '.GGWWGGGGGGGG.',
    '.GWGGGGGGGGGG.',
    'GGGGDDGGGGDDGG',
    'GGGGDDGGGGDDGG',
    'GGGGGGGGGGGGGG',
    'gggggggggggggg',
    '.gggggggggggg.',
  ];
  const slimeF1 = [
    '..............',
    '...GGGGGGGG...',
    '.GGWWGGGGGGGG.',
    'GGWGGGGGGGGGGG',
    'GGGGDDGGGGDDGG',
    'GGGGGGGGGGGGGG',
    'gggggggggggggg',
    'gggggggggggggg',
    '.gggggggggggg.',
  ];

  // 4. 白骨剑士 (14x15)
  const skelF0 = [
    '....WWWWWW....',
    '...WWWWWWWW...',
    '...WWDDWWDD...',
    '...WWWWWWWW...',
    '....wWWWWw....',
    '.....wwww.....',
    '..SSWWWWWWSS.W',
    '..s..WWWW..s.W',
    '.....wWWw...SW',
    '....WWWWWW..s.',
    '....WW..WW....',
    '...ww....ww...',
    '...W......W...',
  ];
  const skelF1 = [
    '....WWWWWW....',
    '...WWWWWWWW...',
    '...WWDDWWDD...',
    '...WWWWWWWW...',
    '....wWWWWw....',
    '.....wwww....W',
    '..SSWWWWWWSS.W',
    '..s..WWWW..sSW',
    '.....wWWw...s.',
    '....WWWWWW....',
    '.....WW.WW....',
    '....ww...ww...',
    '....W.....W...',
  ];

  // 5. 炽焰鬼火 (12x14)
  const wispF0 = [
    '.....AA.....',
    '....AOOA....',
    '...AOOROA...',
    '..AOORROOA..',
    '.AOYYOOYYOA.',
    '.AOOOOOOOOA.',
    '.ROOOOOOOOR.',
    '..RRRRRRRR..',
    '...rR..Rr...',
    '....r..r....',
  ];
  const wispF1 = [
    '....AA......',
    '...AOOA.....',
    '..AOOROA....',
    '.AOORROOA...',
    '.AOYYOOYYOA.',
    '.AOOOOOOOOA.',
    '..ROOOOOOR..',
    '..RRRRRRRR..',
    '...r.rr.r...',
    '.....r......',
  ];

  // 6. 重甲铁卫 (16x16)
  const golemF0 = [
    '..A..........A..',
    '..AA..SSSS..AA..',
    '...AASSSSSSAA...',
    '....SSDDDDSS....',
    '....SDDRRDDS....',
    '...SSDDDDDDSS...',
    '..SSSSWWWWSSSS..',
    '.SSSSSWWWWSSSSS.',
    '.SSs.SSSSSS.sSS.',
    '.ss..SSSSSS..ss.',
    '.....SSssSS.....',
    '....SSS..SSS....',
    '....ss....ss....',
  ];
  const golemF1 = [
    '..A..........A..',
    '..AA..SSSS..AA..',
    '...AASSSSSSAA...',
    '....SSDDDDSS....',
    '....SDDRRDDS....',
    '...SSDDDDDDSS...',
    '..SSSSWWWWSSSS..',
    '.SSSSSWWWWSSSSS.',
    '.SSs.SSSSSS.sSS.',
    '..ss.SSSSSS.ss..',
    '.....SSssSS.....',
    '.....SS..SS.....',
    '....ss....ss....',
  ];

  // 7. 虚空幽魂 (14x15)
  const specterF0 = [
    '....vvvvvv....',
    '..vvVVVVVVvv..',
    '.vVVVVVVVVVVv.',
    '.vVVDDDDDDVVv.',
    '.vVDDCCDDCCDv.',
    '.vVVDDDDDDVVv.',
    '..vVVVVVVVVv..',
    '..vvVVVVVVvv..',
    '...vvVVVVvv...',
    '....vvVVvv....',
    '....v.vv.v....',
    '......v.......',
  ];
  const specterF1 = [
    '....vvvvvv....',
    '..vvVVVVVVvv..',
    '.vVVVVVVVVVVv.',
    '.vVVDDDDDDVVv.',
    '.vVDDCCDDCCDv.',
    '.vVVDDDDDDVVv.',
    '..vVVVVVVVVv..',
    '...vvVVVVvv...',
    '..vvVVVVVVvv..',
    '...v.vVVv.v...',
    '.....v..v.....',
    '..............',
  ];

  // 8. 精英：猩红督军 (20x20)
  const eliteF0 = [
    '..A..............A..',
    '..AA...AAAAAA...AA..',
    '...AA.AARRRRAA.AA...',
    '....AAARRRRRRAAA....',
    '.....RRRRRRRRRR.....',
    '....RRDDDDDDDDRR....',
    '....RDDYYDDYYDDR....',
    '....RRDDDDDDDDRR....',
    '..AAARRRRRRRRRRAAA..',
    '.AARRRRRRRRRRRRRRAA.',
    '.ARRDDDDAAAADDDDRRA.',
    '.rRRDDDDAAAADDDDRRr.',
    '..r.DDDDDDDDDDDD.r..',
    '....DDDDssssDDDD....',
    '....DDD......DDD....',
    '...AAA........AAA...',
  ];
  const eliteF1 = [
    '..A..............A..',
    '..AA...AAAAAA...AA..',
    '...AA.AARRRRAA.AA...',
    '....AAARRRRRRAAA....',
    '.....RRRRRRRRRR.....',
    '....RRDDDDDDDDRR....',
    '....RDDYYDDYYDDR....',
    '....RRDDDDDDDDRR....',
    '.AAARRRRRRRRRRRRAAA.',
    '.AARRRRRRRRRRRRRRAA.',
    '..RRDDDDAAAADDDDRR..',
    '..rRDDDDAAAADDDDRr..',
    '....DDDDDDDDDDDD....',
    '.....DDDssssDDD.....',
    '....AAA......AAA....',
    '....................',
  ];

  // 9. 终焉 Boss：深渊红王 (24x24)
  const bossF0 = [
    'A......................A',
    'AA....A..........A....AA',
    '.AA...AA..AAAA..AA...AA.',
    '..AA..AAAAAAAAAAAA..AA..',
    '...AAAARRRRRRRRRRAAAA...',
    '....RRRRRRRRRRRRRRRR....',
    '...RRRDDDDDDDDDDDDRRR...',
    '...RRDDYYYYDDYYYYDDRR...',
    '...RRRDDDDDDDDDDDDRRR...',
    '..AARRRRRRRRRRRRRRRRRAA.',
    '.AAAARRRRRRRRRRRRRRRAAAA',
    'AAARRRRDDDDAAADDDRRRRAAA',
    'A.rRRRRDDDAAAAADDRRRRr.A',
    '..rrRRRDDDAAAAADDRRRrr..',
    '..rrrDDDDDDDDDDDDDDrrr..',
    '...rrDDDDDssssDDDDDrr...',
    '.....DDDD......DDDD.....',
    '....AAAA........AAAA....',
  ];
  const bossF1 = [
    'A......................A',
    'AA....A..........A....AA',
    '.AA...AA..AAAA..AA...AA.',
    '..AA..AAAAAAAAAAAA..AA..',
    '...AAAARRRRRRRRRRAAAA...',
    '....RRRRRRRRRRRRRRRR....',
    '...RRRDDDDDDDDDDDDRRR...',
    '...RRDDYYYYDDYYYYDDRR...',
    '...RRRDDDDDDDDDDDDRRR...',
    '.AAARRRRRRRRRRRRRRRRAAA.',
    'AAAAARRRRRRRRRRRRRRRAAAA',
    '.AARRRRDDDDAAADDDRRRRAA.',
    '..rrRRRDDDAAAAADDRRRrr..',
    '..rrrRRDDDAAAAADDRRrrr..',
    '...rrDDDDDDDDDDDDDDrr...',
    '.....DDDDssssssDDDD.....',
    '.....AAAA......AAAA.....',
    '........................',
  ];

  // 掉落物与场景道具
  const gemBlue = bakeMatrix([
    '..CC..',
    '.CWCC.',
    'CWCCCC',
    'CCCCCC',
    '.cccc.',
    '..cc..',
  ]);
  const gemGreen = bakeMatrix([
    '..GG..',
    '.GWGG.',
    'GWGGGG',
    'GGGGGG',
    '.gggg.',
    '..gg..',
  ]);
  const gemGold = bakeMatrix([
    '..AA..',
    '.AWAA.',
    'AWAAAA',
    'AAAAAA',
    '.aaaa.',
    '..aa..',
  ]);
  const crate = bakeMatrix([
    '.aaaaaaaaaa.',
    'aAAAAAAAAAAa',
    'aAssssssssAa',
    'aAsAAYYAAsAa',
    'aAsAYOOYAsAa',
    'aAsAAYYAAsAa',
    'aAssssssssAa',
    'aAAAAAAAAAAa',
    '.aaaaaaaaaa.',
  ]);
  const meat = bakeMatrix([
    '..RRRR..',
    '.RPPPPR.',
    'RPRRRRRR',
    'RRRRRRRR',
    '.rrrrrr.',
    '..WWWW..',
  ]);
  const magnet = bakeMatrix([
    'RR....BB',
    'RR....BB',
    'RR....BB',
    'WW....WW',
    '.RRRRBB.',
    '..RRRR..',
  ]);
  const bomb = bakeMatrix([
    '....AA..',
    '...s....',
    '.DDDDDD.',
    'DDRYYRDD',
    'DDYYYYDD',
    'DDRYYRDD',
    '.DDDDDD.',
  ]);
  const chest = bakeMatrix([
    '.AAAAAAAAAA.',
    'AaaaaaaaaaaA',
    'AAAAAAAAAAAA',
    'ssssAAAAssss',
    'sddddAAdddds',
    'sdddddddddds',
    'AAAAAAAAAAAA',
  ]);

  // 升级卡片与顶栏像素图标
  const icons: Record<string, string> = {
    hp: bakeIconDataUrl([
      '..RRR..RRR..',
      '.RRRRRRRRRR.',
      'RRPPRRRRRRRR',
      'RRPRRRRRRRRR',
      'RRRRRRRRRRRR',
      '.RRRRRRRRRR.',
      '..RRRRRRRR..',
      '...RRRRRR...',
      '....RRRR....',
      '.....RR.....',
    ]),
    atk: bakeIconDataUrl([
      '.........AA.',
      '........AOAA',
      '.......AOOA.',
      '......AOOA..',
      '.....AOOA...',
      '..A.AOOA....',
      '...AAOA.....',
      '..RAAA......',
      '.RR..A......',
      'RR..........',
    ]),
    spd: bakeIconDataUrl([
      '....CCCCCC..',
      '...CCCCCCCC.',
      '..CCWWCCCCCC',
      '.....CCCC...',
      '...CCCCCC...',
      '.CCCCCCCCC..',
      'CCCC...CCCC.',
      'CC.......CC.',
    ]),
    blade: bakeIconDataUrl([
      '.........PP.',
      '........PRRP',
      '.......PRRR.',
      '......PRRR..',
      '.....PRRR...',
      '..Y.PRRR....',
      '...YRRR.....',
      '..sYY.......',
      '.ss.Y.......',
      's...........',
    ]),
    blade_evo: bakeIconDataUrl([
      '.Y.......PP.',
      '..Y.....PRRP',
      '...Y...PRYYR',
      '....Y.PRYYR.',
      '.....YYYYR..',
      '....PRYYRY..',
      '...PRYYR..Y.',
      '..PRRR.....Y',
      '.PPR........',
    ]),
    orbit: bakeIconDataUrl([
      '....AAAA....',
      '..AA....AA..',
      '.A...YY...A.',
      '.A..YYYY..A.',
      'A...YYYY...A',
      '.A...YY...A.',
      '..AA....AA..',
      '....AAAA....',
    ]),
    orbit_evo: bakeIconDataUrl([
      '....RRRR....',
      '..RROOOORR..',
      '.ROOYYYYOOR.',
      'ROYWWWWWWYOR',
      'ROYWWWWWWYOR',
      '.ROOYYYYOOR.',
      '..RROOOORR..',
      '....RRRR....',
    ]),
    aura: bakeIconDataUrl([
      '...CCCCCC...',
      '.CC......CC.',
      'C...GGGG...C',
      'C..G....G..C',
      'C..G.YY.G..C',
      'C..G....G..C',
      'C...GGGG...C',
      '.CC......CC.',
      '...CCCCCC...',
    ]),
    aura_evo: bakeIconDataUrl([
      '...RRRRRR...',
      '.RR.PPPP.RR.',
      'R.PP....PP.R',
      'R.P..YY..P.R',
      'R.P.YYYY.P.R',
      'R.P..YY..P.R',
      'R.PP....PP.R',
      '.RR.PPPP.RR.',
      '...RRRRRR...',
    ]),
    thunder: bakeIconDataUrl([
      '.....YYYYY..',
      '....YYYY....',
      '...YYYY.....',
      '..YYYYYYYY..',
      '.....YYYY...',
      '....YYYY....',
      '...CCC......',
      '..CC........',
    ]),
    axe: bakeIconDataUrl([
      '..WWWW......',
      '.WWSSWW.....',
      'WWSSSSWW....',
      'WSSaaSSW....',
      '..W..aa.....',
      '......aa....',
      '.......aa...',
      '........aa..',
    ]),
    fireball: bakeIconDataUrl([
      '....OOOO....',
      '..OOAAAAOO..',
      '.OAAYYYYAAO.',
      '.OAYWWWWYAO.',
      '..OAYYYYAO..',
      '...OORROO...',
      '....RRRR....',
    ]),
  };

  cachedAtlas = {
    hero: buildAnimated(heroF0, heroF1),
    enemies: {
      bat: buildAnimated(batF0, batF1),
      slime: buildAnimated(slimeF0, slimeF1),
      skeleton: buildAnimated(skelF0, skelF1),
      wisp: buildAnimated(wispF0, wispF1),
      golem: buildAnimated(golemF0, golemF1),
      specter: buildAnimated(specterF0, specterF1),
      elite: buildAnimated(eliteF0, eliteF1),
      boss: buildAnimated(bossF0, bossF1),
    },
    props: {
      gemBlue,
      gemGreen,
      gemGold,
      crate,
      meat,
      magnet,
      bomb,
      chest,
    },
    icons,
    floorTile: createFloorTile(),
  };

  return cachedAtlas;
}
