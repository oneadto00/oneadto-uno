import * as THREE from 'three';

export interface LabSceneController {
  focusMonitor: () => void;
  unfocusMonitor: () => void;
  toggleLamp: () => boolean;
  isFocused: () => boolean;
  dispose: () => void;
}

export interface LabSceneOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
  osOverlay: HTMLElement;
  onFocusChange?: (focused: boolean) => void;
  onLampChange?: (on: boolean) => void;
  onHoverTarget?: (target: 'monitor' | 'lamp' | null) => void;
}

const SCREEN_W = 2.3;
const SCREEN_H = 1.29375; // 16:9，精确匹配 #lab-os 960×540
const SCREEN_POS = new THREE.Vector3(0, 1.38, -0.44);
const OS_BASE_W = 960;
const OS_BASE_H = 540;

/** 生成工业金属洞洞板墙面纹理（区别于纯黑墙+海报） */
function createPegboardTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#15181e';
  ctx.fillRect(0, 0, 512, 512);

  // 细微金属磨砂条纹
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  for (let y = 0; y < 512; y += 4) {
    ctx.fillRect(0, y, 512, 1);
  }

  // 规则洞洞板孔阵
  const step = 32;
  for (let y = 16; y < 512; y += step) {
    for (let x = 16; x < 512; x += step) {
      ctx.fillStyle = '#07090d';
      ctx.beginPath();
      ctx.arc(x, y, 4.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y + 0.8, 4.3, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }
  }

  // 面板分块接缝
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, 509, 509);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2.2);
  return tex;
}

/** 生成工程暗绿标尺切割垫纹理 */
function createCuttingMatTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 384;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#182b24';
  ctx.fillRect(0, 0, 512, 384);

  // 细网格线
  ctx.strokeStyle = 'rgba(218, 255, 120, 0.14)';
  ctx.lineWidth = 1;
  for (let x = 24; x <= 488; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 24);
    ctx.lineTo(x, 360);
    ctx.stroke();
  }
  for (let y = 24; y <= 360; y += 24) {
    ctx.beginPath();
    ctx.moveTo(24, y);
    ctx.lineTo(488, y);
    ctx.stroke();
  }

  // 外围主标尺框与对角基准线
  ctx.strokeStyle = 'rgba(218, 255, 120, 0.36)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, 464, 336);
  ctx.beginPath();
  ctx.moveTo(24, 360);
  ctx.lineTo(184, 200);
  ctx.stroke();

  ctx.fillStyle = 'rgba(218, 255, 120, 0.52)';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('ONEADTO // WORKBENCH MAT 01', 36, 48);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 生成 80s 复古灰白 + 酒红点缀机械键盘纹理 */
function createRetroKeyboardTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 180;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#1d1c1a';
  ctx.fillRect(0, 0, 512, 180);

  const rows = 5;
  const pad = 10;
  const rowH = (180 - pad * 2) / rows;

  for (let r = 0; r < rows; r++) {
    const cols = r === 4 ? 8 : 14;
    let x = pad;
    const avail = 512 - pad * 2;
    for (let col = 0; col < cols; col++) {
      let w = avail / cols - 4;
      if (r === 4 && col === 3) w = avail * 0.34;
      else if (r === 4) w = (avail * 0.66) / (cols - 1) - 4;

      const y = pad + r * rowH + 2;
      const h = rowH - 5;

      const isEsc = r === 0 && col === 0;
      const isEnter = r === 2 && col === cols - 1;
      const isMod = col === 0 || col === cols - 1 || r === 4;

      ctx.fillStyle = isEsc
        ? '#b82931'
        : isEnter
          ? '#d6a41b'
          : isMod
            ? '#8c887d'
            : '#dfd9cc';
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.fillRect(x + 2, y + 2, w - 4, 3);
      x += w + 4;
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 生成洞洞板右侧深绿 PCB 电路板挂饰纹理 */
function createPcbBoardTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 240;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#0e291e';
  ctx.fillRect(0, 0, 320, 240);
  ctx.strokeStyle = '#d4a63a';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, 304, 224);

  // 模拟铜走线
  ctx.strokeStyle = 'rgba(212, 166, 58, 0.55)';
  ctx.lineWidth = 2;
  const paths = [
    [
      [28, 44],
      [96, 44],
      [124, 72],
      [212, 72],
    ],
    [
      [28, 84],
      [74, 84],
      [104, 114],
      [268, 114],
    ],
    [
      [44, 178],
      [126, 178],
      [158, 146],
      [278, 146],
    ],
    [
      [60, 206],
      [194, 206],
      [226, 174],
      [284, 174],
    ],
  ];
  paths.forEach((pts) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    pts.forEach(([x, y]) => {
      ctx.fillStyle = '#e8c568';
      ctx.beginPath();
      ctx.arc(x, y, 4.2, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  // 中央主控芯片
  ctx.fillStyle = '#15181b';
  ctx.fillRect(126, 86, 68, 68);
  ctx.strokeStyle = '#9ca3af';
  ctx.strokeRect(126, 86, 68, 68);
  ctx.fillStyle = '#daff78';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('ONE-01', 136, 124);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 生成洞洞板左侧新 Logo 复古金属铭牌纹理 */
function createBrandPlaqueTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 170;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#171819';
  ctx.fillRect(0, 0, 320, 170);
  ctx.strokeStyle = 'rgba(236, 233, 225, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 300, 150);

  // 绘制全新复古极简 Logo（CRT O 框 + 1 信号柱 + 红指示点）
  ctx.strokeStyle = '#ece9e1';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(32, 48, 76, 52, 12);
  ctx.stroke();

  ctx.fillStyle = '#ece9e1';
  ctx.fillRect(66, 60, 8, 28);
  ctx.fillStyle = '#ff4d3d';
  ctx.beginPath();
  ctx.arc(91, 64, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fcf8ef';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText('Oneadto', 124, 84);

  ctx.fillStyle = 'rgba(236, 233, 225, 0.56)';
  ctx.font = '14px monospace';
  ctx.fillText('WORKBENCH // LAB', 126, 114);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 生成右侧迷你桌面示波器屏幕纹理 */
function createMiniScopeTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 160;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#07140d';
  ctx.fillRect(0, 0, 256, 160);

  ctx.strokeStyle = 'rgba(74, 222, 128, 0.16)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 256; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 160);
    ctx.stroke();
  }
  for (let y = 0; y <= 160; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = 0; x <= 256; x += 3) {
    const y = 80 + Math.sin(x * 0.065) * 42 * Math.cos(x * 0.015);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** 生成顶部宽幅灯管柔和辉光 Sprite 纹理 */
function createWideLightGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 64, 6, 128, 64, 124);
  g.addColorStop(0, 'rgba(255, 239, 206, 0.78)');
  g.addColorStop(0.4, 'rgba(255, 220, 168, 0.25)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createMonitorBackplateTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 288;
  const ctx = c.getContext('2d')!;
  const bg = ctx.createRadialGradient(256, 144, 18, 256, 144, 270);
  bg.addColorStop(0, '#1d4ed8');
  bg.addColorStop(0.45, '#0f2557');
  bg.addColorStop(1, '#070c18');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 288);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function mountLabDeskScene(opts: LabSceneOptions): LabSceneController {
  const { canvas, container, osOverlay, onFocusChange, onLampChange, onHoverTarget } = opts;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#07090d');
  scene.fog = new THREE.FogExp2('#07090d', 0.075);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const camera = new THREE.PerspectiveCamera(42, 16 / 9, 0.1, 40);

  const disposableGeos: THREE.BufferGeometry[] = [];
  const disposableMats: THREE.Material[] = [];
  const disposableTexs: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposableGeos.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    disposableMats.push(m);
    return m;
  };
  const trackTex = <T extends THREE.Texture>(t: T): T => {
    disposableTexs.push(t);
    return t;
  };

  // =========================================================
  // 1. 屏幕正上方宽幅屏幕挂灯照明系统（均匀照亮左、中、右三区）
  // =========================================================
  const hemiLight = new THREE.HemisphereLight('#64748b', '#171412', 0.45);
  scene.add(hemiLight);

  // 屏幕冷蓝微光
  const screenSpillLight = new THREE.PointLight('#4c8dff', 1.85, 4.6, 1.55);
  screenSpillLight.position.set(0, 1.32, 0.32);
  scene.add(screenSpillLight);

  // 顶部挂灯三路协同暖光（正中向下 + 向左宽幅覆盖 + 向右宽幅覆盖）
  const lampCenterLight = new THREE.SpotLight('#fff0d4', 9.5, 7.5, Math.PI * 0.46, 0.68, 1.35);
  lampCenterLight.position.set(0, 2.18, -0.1);
  lampCenterLight.target.position.set(0, 0.05, 0.2);
  lampCenterLight.castShadow = true;
  lampCenterLight.shadow.mapSize.set(512, 512);
  lampCenterLight.shadow.bias = -0.002;
  scene.add(lampCenterLight);
  scene.add(lampCenterLight.target);

  const lampLeftWingLight = new THREE.PointLight('#ffe2b4', 3.6, 5.4, 1.45);
  lampLeftWingLight.position.set(-1.72, 1.72, 0.28);
  scene.add(lampLeftWingLight);

  const lampRightWingLight = new THREE.PointLight('#ffe2b4', 3.6, 5.4, 1.45);
  lampRightWingLight.position.set(1.72, 1.72, 0.28);
  scene.add(lampRightWingLight);

  // =========================================================
  // 2. 工业暗灰金属洞洞板墙面 + 钢架工程工作台 + 增高架
  // =========================================================
  const pegTex = trackTex(createPegboardTexture());
  const pegWallMat = trackMat(
    new THREE.MeshStandardMaterial({ map: pegTex, roughness: 0.72, metalness: 0.32 })
  );
  const pegWall = new THREE.Mesh(trackGeo(new THREE.PlaneGeometry(14, 7.5)), pegWallMat);
  pegWall.position.set(0, 2.2, -1.32);
  pegWall.receiveShadow = true;
  scene.add(pegWall);

  // 磨砂暗岩灰工程台面 + 哑光拉丝铝前包边
  const slateDeskMat = trackMat(
    new THREE.MeshStandardMaterial({ color: '#24272d', roughness: 0.64, metalness: 0.22 })
  );
  const deskTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.5, 0.14, 2.45)), slateDeskMat);
  deskTop.position.set(0, 0, -0.12);
  deskTop.receiveShadow = true;
  scene.add(deskTop);

  const brushedAluMat = trackMat(
    new THREE.MeshStandardMaterial({ color: '#707782', roughness: 0.34, metalness: 0.78 })
  );
  const deskTrimFront = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(6.52, 0.04, 0.03)), brushedAluMat);
  deskTrimFront.position.set(0, 0.045, 1.11);
  scene.add(deskTrimFront);

  // 重型钢架桌腿（左右工业方管框架）
  const steelMat = trackMat(
    new THREE.MeshStandardMaterial({ color: '#13161b', roughness: 0.45, metalness: 0.75 })
  );
  [-2.85, 2.85].forEach((lx) => {
    const leg = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.12, 2.2, 2.0)), steelMat);
    leg.position.set(lx, -1.16, -0.15);
    scene.add(leg);
  });

  // 中央低矮浅橡木/钢架显示器增高台（托起显示器，下方留出收纳缝隙）
  const riserWoodMat = trackMat(
    new THREE.MeshStandardMaterial({ color: '#6b5642', roughness: 0.56, metalness: 0.08 })
  );
  const riserTop = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.55, 0.055, 0.78)), riserWoodMat);
  riserTop.position.set(0, 0.22, -0.52);
  riserTop.castShadow = true;
  riserTop.receiveShadow = true;
  scene.add(riserTop);

  [-1.15, 1.15].forEach((rx) => {
    const rLeg = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.06, 0.15, 0.7)), steelMat);
    rLeg.position.set(rx, 0.14, -0.52);
    scene.add(rLeg);
  });

  // =========================================================
  // 3. 3D 显示器 + 顶置可点击屏幕挂灯（置于屏幕正上方）
  // =========================================================
  const monitorGroup = new THREE.Group();
  scene.add(monitorGroup);

  const bezelMat = trackMat(
    new THREE.MeshStandardMaterial({ color: '#1b1e24', roughness: 0.42, metalness: 0.52 })
  );
  const monitorBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(SCREEN_W + 0.12, SCREEN_H + 0.14, 0.11)),
    bezelMat
  );
  monitorBody.position.set(SCREEN_POS.x, SCREEN_POS.y, SCREEN_POS.z - 0.06);
  monitorBody.castShadow = true;
  monitorBody.userData.interactive = 'monitor';
  monitorGroup.add(monitorBody);

  // 复古显示器下沿窄金属饰条 + 红绿双色微型电源点
  const chinStrip = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(SCREEN_W + 0.1, 0.025, 0.02)), brushedAluMat);
  chinStrip.position.set(0, SCREEN_POS.y - SCREEN_H / 2 - 0.045, SCREEN_POS.z);
  monitorGroup.add(chinStrip);

  const hoverOutlineMat = trackMat(
    new THREE.MeshBasicMaterial({ color: '#daff78', transparent: true, opacity: 0 })
  );
  const hoverFrame = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(SCREEN_W + 0.17, SCREEN_H + 0.19, 0.04)),
    hoverOutlineMat
  );
  hoverFrame.position.set(SCREEN_POS.x, SCREEN_POS.y, SCREEN_POS.z - 0.09);
  monitorGroup.add(hoverFrame);

  const screenTex = trackTex(createMonitorBackplateTexture());
  const screenMesh = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(SCREEN_W, SCREEN_H)),
    trackMat(new THREE.MeshBasicMaterial({ map: screenTex }))
  );
  screenMesh.position.copy(SCREEN_POS);
  screenMesh.userData.interactive = 'monitor';
  monitorGroup.add(screenMesh);

  // 显示器金属支柱落于增高台上
  const standNeck = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.16, 0.62, 0.07)), steelMat);
  standNeck.position.set(0, 0.54, -0.58);
  monitorGroup.add(standNeck);
  const standFoot = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.68, 0.03, 0.42)), steelMat);
  standFoot.position.set(0, 0.26, -0.54);
  monitorGroup.add(standFoot);

  // 顶置宽幅屏幕挂灯（置于屏幕正上方，横跨左右）
  const lampGroup = new THREE.Group();
  const lampHousingMat = trackMat(
    new THREE.MeshStandardMaterial({ color: '#14171c', roughness: 0.36, metalness: 0.68 })
  );
  const brassMat = trackMat(
    new THREE.MeshStandardMaterial({ color: '#c89e4b', roughness: 0.32, metalness: 0.82 })
  );

  // 双侧灯夹支臂
  [-0.52, 0.52].forEach((cx) => {
    const clamp = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.08, 0.14, 0.18)), lampHousingMat);
    clamp.position.set(cx, 2.09, -0.44);
    lampGroup.add(clamp);
    const arm = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.05, 0.05, 0.3)), lampHousingMat);
    arm.position.set(cx, 2.17, -0.32);
    lampGroup.add(arm);
  });

  // 宽幅圆筒主灯管（比屏幕更宽，照亮左右两侧工作区）
  const lampTube = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.052, 0.052, 2.62, 20)),
    lampHousingMat
  );
  lampTube.rotation.z = Math.PI / 2;
  lampTube.position.set(0, 2.19, -0.18);
  lampGroup.add(lampTube);

  // 左右香槟金灯管端盖
  [-1.33, 1.33].forEach((ex) => {
    const cap = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 20)), brassMat);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(ex, 2.19, -0.18);
    lampGroup.add(cap);
  });

  // 底部暖白发光灯条
  const lampDiffuserMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: '#fff9eb',
      emissive: new THREE.Color('#ffe5b4'),
      emissiveIntensity: 2.2,
      roughness: 0.2,
    })
  );
  const lampDiffuser = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(2.5, 0.025, 0.065)), lampDiffuserMat);
  lampDiffuser.position.set(0, 2.14, -0.18);
  lampGroup.add(lampDiffuser);

  // 宽幅柔和光晕 Sprite
  const wideGlowTex = trackTex(createWideLightGlowTexture());
  const lampGlowSprite = new THREE.Sprite(
    trackMat(
      new THREE.SpriteMaterial({
        map: wideGlowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.85,
      })
    )
  );
  lampGlowSprite.position.set(0, 2.08, -0.15);
  lampGlowSprite.scale.set(4.1, 1.05, 1);
  lampGroup.add(lampGlowSprite);

  // 屏幕挂灯透明大点击区
  const lampHitbox = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(2.85, 0.34, 0.55)),
    trackMat(new THREE.MeshBasicMaterial({ visible: false }))
  );
  lampHitbox.position.set(0, 2.16, -0.24);
  lampHitbox.userData.interactive = 'lamp';
  lampGroup.add(lampHitbox);
  scene.add(lampGroup);

  // =========================================================
  // 4. 左侧工作区（工程切割垫 + 迷你红白机微缩彩蛋 + 黄卡 + 咖啡杯）
  // =========================================================
  const cuttingMatTex = trackTex(createCuttingMatTexture());
  const cuttingMat = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.75, 0.012, 1.25)),
    trackMat(new THREE.MeshStandardMaterial({ map: cuttingMatTex, roughness: 0.82 }))
  );
  cuttingMat.position.set(-1.98, 0.076, 0.18);
  cuttingMat.receiveShadow = true;
  scene.add(cuttingMat);

  // 迷你红白机微缩实体（联动首页彩蛋）
  const miniFc = new THREE.Group();
  const fcCreamMat = trackMat(new THREE.MeshStandardMaterial({ color: '#dfd6c3', roughness: 0.45 }));
  const fcRedMat = trackMat(new THREE.MeshStandardMaterial({ color: '#841b23', roughness: 0.42 }));
  const cartYellowMat = trackMat(new THREE.MeshStandardMaterial({ color: '#e3b324', roughness: 0.38 }));

  const fcBody = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.68, 0.14, 0.48)), fcCreamMat);
  fcBody.position.y = 0.07;
  fcBody.castShadow = true;
  miniFc.add(fcBody);

  const fcFront = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.68, 0.08, 0.18)), fcRedMat);
  fcFront.position.set(0, 0.09, 0.15);
  miniFc.add(fcFront);

  const fcInsertedCart = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 0.18, 0.055)), cartYellowMat);
  fcInsertedCart.position.set(0, 0.19, -0.04);
  fcInsertedCart.castShadow = true;
  miniFc.add(fcInsertedCart);

  miniFc.position.set(-1.85, 0.082, -0.02);
  miniFc.rotation.y = 0.24;
  scene.add(miniFc);

  // 旁边随意叠放两张迷你黄卡
  [
    { x: -1.48, y: 0.105, z: 0.48, ry: -0.32 },
    { x: -1.52, y: 0.155, z: 0.44, ry: 0.14 },
  ].forEach((c) => {
    const miniCart = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.32, 0.045, 0.22)), cartYellowMat);
    miniCart.position.set(c.x, c.y, c.z);
    miniCart.rotation.y = c.ry;
    miniCart.castShadow = true;
    scene.add(miniCart);
  });

  // 哑黑陶瓷咖啡杯
  const mug = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.115, 0.105, 0.22, 20)),
    trackMat(new THREE.MeshStandardMaterial({ color: '#17191e', roughness: 0.48, metalness: 0.15 }))
  );
  mug.position.set(-2.52, 0.19, 0.45);
  mug.castShadow = true;
  scene.add(mug);

  // =========================================================
  // 5. 中央复古灰白机械键盘 + 无线鼠标
  // =========================================================
  const kbTex = trackTex(createRetroKeyboardTexture());
  const kbCaseMat = trackMat(new THREE.MeshStandardMaterial({ color: '#aba496', roughness: 0.5 }));
  const kbTopMat = trackMat(new THREE.MeshStandardMaterial({ map: kbTex, roughness: 0.48 }));
  const keyboard = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(1.18, 0.06, 0.42)), [
    kbCaseMat,
    kbCaseMat,
    kbTopMat,
    kbCaseMat,
    kbCaseMat,
    kbCaseMat,
  ]);
  keyboard.position.set(-0.08, 0.105, 0.42);
  keyboard.rotation.x = 0.08;
  keyboard.castShadow = true;
  scene.add(keyboard);

  const mouseMat = trackMat(new THREE.MeshStandardMaterial({ color: '#2b303a', roughness: 0.35, metalness: 0.2 }));
  const mouse = new THREE.Mesh(trackGeo(new THREE.SphereGeometry(0.105, 20, 14)), mouseMat);
  mouse.scale.set(0.84, 0.42, 1.3);
  mouse.position.set(0.84, 0.105, 0.44);
  mouse.castShadow = true;
  scene.add(mouse);

  // =========================================================
  // 6. 右侧工作区（迷你台式示波器盒 + 旋钮宏键盘 + 笔记本）
  // =========================================================
  const scopeBox = new THREE.Group();
  const scopeCaseMat = trackMat(
    new THREE.MeshStandardMaterial({ color: '#303640', roughness: 0.48, metalness: 0.42 })
  );
  const scopeChassis = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.88, 0.46, 0.58)), scopeCaseMat);
  scopeChassis.position.y = 0.23;
  scopeChassis.castShadow = true;
  scopeChassis.receiveShadow = true;
  scopeBox.add(scopeChassis);

  const miniScopeTex = trackTex(createMiniScopeTexture());
  const miniScopeScreen = new THREE.Mesh(
    trackGeo(new THREE.PlaneGeometry(0.46, 0.29)),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: miniScopeTex,
        emissiveMap: miniScopeTex,
        emissive: new THREE.Color('#4ade80'),
        emissiveIntensity: 0.72,
      })
    )
  );
  miniScopeScreen.position.set(-0.14, 0.24, 0.294);
  scopeBox.add(miniScopeScreen);

  // 示波器右侧三个金属旋钮
  [0.34, 0.23, 0.12].forEach((ky) => {
    const knob = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.036, 0.04, 0.04, 16)), brassMat);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(0.25, ky, 0.305);
    scopeBox.add(knob);
  });
  scopeBox.position.set(1.98, 0.07, -0.06);
  scopeBox.rotation.y = -0.26;
  scene.add(scopeBox);

  // 右前金属旋钮控制器（Macro Pad）
  const macroPad = new THREE.Group();
  const padBase = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.44, 0.07, 0.36)), steelMat);
  padBase.position.y = 0.035;
  padBase.castShadow = true;
  macroPad.add(padBase);

  const bigKnob = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.072, 0.078, 0.065, 22)), brassMat);
  bigKnob.position.set(-0.08, 0.09, -0.02);
  macroPad.add(bigKnob);

  [
    [0.11, -0.07, '#daff78'],
    [0.11, 0.07, '#22d3ee'],
    [-0.08, 0.1, '#ff4d3d'],
  ].forEach(([kx, kz, col]) => {
    const key = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.085, 0.035, 0.085)),
      trackMat(
        new THREE.MeshStandardMaterial({
          color: col as string,
          emissive: new THREE.Color(col as string),
          emissiveIntensity: 0.28,
          roughness: 0.4,
        })
      )
    );
    key.position.set(kx as number, 0.08, kz as number);
    macroPad.add(key);
  });
  macroPad.position.set(1.66, 0.07, 0.56);
  macroPad.rotation.y = -0.18;
  scene.add(macroPad);

  // 右侧叠放工程笔记本 + 金属笔
  const notebookMat = trackMat(new THREE.MeshStandardMaterial({ color: '#1b2029', roughness: 0.78 }));
  const nb1 = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.58, 0.045, 0.74)), notebookMat);
  nb1.position.set(2.44, 0.095, 0.48);
  nb1.rotation.y = 0.08;
  nb1.castShadow = true;
  scene.add(nb1);

  const pen = new THREE.Mesh(trackGeo(new THREE.CylinderGeometry(0.012, 0.012, 0.46, 10)), brassMat);
  pen.rotation.z = Math.PI / 2;
  pen.rotation.y = 0.52;
  pen.position.set(2.42, 0.132, 0.48);
  scene.add(pen);

  // =========================================================
  // 7. 洞洞板左右挂件（左：新 Logo 铭牌 + 悬挂黄卡；右：PCB 电路板）
  // =========================================================
  // 左洞洞板：全新复古 Logo 铭牌
  const plaqueTex = trackTex(createBrandPlaqueTexture());
  const plaque = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.16, 0.62, 0.04)),
    trackMat(new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.52, metalness: 0.25 }))
  );
  plaque.position.set(-2.12, 2.04, -1.27);
  scene.add(plaque);

  // 左洞洞板：两张悬挂展示黄卡
  [-2.38, -1.86].forEach((cx) => {
    const hungCart = new THREE.Mesh(trackGeo(new THREE.BoxGeometry(0.4, 0.28, 0.045)), cartYellowMat);
    hungCart.position.set(cx, 1.35, -1.26);
    scene.add(hungCart);
  });

  // 右洞洞板：深绿 PCB 电路板挂饰
  const pcbTex = trackTex(createPcbBoardTexture());
  const pcbBoard = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.12, 0.84, 0.035)),
    trackMat(
      new THREE.MeshStandardMaterial({
        map: pcbTex,
        emissiveMap: pcbTex,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.14,
        roughness: 0.45,
        metalness: 0.35,
      })
    )
  );
  pcbBoard.position.set(2.12, 1.88, -1.27);
  scene.add(pcbBoard);

  // =========================================================
  // 8. 暗室极轻空气微尘粒子
  // =========================================================
  const dustCount = 110;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 6.8;
    dustPos[i * 3 + 1] = 0.2 + Math.random() * 3.0;
    dustPos[i * 3 + 2] = -1.1 + Math.random() * 3.1;
  }
  const dustGeo = trackGeo(new THREE.BufferGeometry());
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = trackMat(
    new THREE.PointsMaterial({
      color: '#fde6c4',
      size: 0.024,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
    })
  );
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  scene.add(dustPoints);

  // =========================================================
  // 9. 相机运镜、射线互动与 3D → CSS 屏幕矩阵投影
  // =========================================================
  let focused = false;
  let lampOn = true;
  let pointerX = 0;
  let pointerY = 0;
  let curCamPos = new THREE.Vector3(0, 1.62, 4.4);
  let curLookAt = new THREE.Vector3(0, 1.12, -0.2);
  let hoveredTarget: 'monitor' | 'lamp' | null = null;
  let rafId = 0;
  const clockStart = performance.now();

  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const interactables: THREE.Object3D[] = [screenMesh, monitorBody, lampHitbox];

  const cornerTL = new THREE.Vector3(
    SCREEN_POS.x - SCREEN_W / 2,
    SCREEN_POS.y + SCREEN_H / 2,
    SCREEN_POS.z
  );
  const cornerBR = new THREE.Vector3(
    SCREEN_POS.x + SCREEN_W / 2,
    SCREEN_POS.y - SCREEN_H / 2,
    SCREEN_POS.z
  );
  const projTL = new THREE.Vector3();
  const projBR = new THREE.Vector3();

  let viewW = 1;
  let viewH = 1;

  const resize = () => {
    const rect = container.getBoundingClientRect();
    viewW = Math.max(1, rect.width);
    viewH = Math.max(1, rect.height);
    camera.aspect = viewW / viewH;
    camera.updateProjectionMatrix();
    renderer.setSize(viewW, viewH, false);
  };
  resize();

  const getDesiredCamera = () => {
    const aspect = viewW / viewH;
    const vFovRad = THREE.MathUtils.degToRad(camera.fov);
    const halfTanV = Math.tan(vFovRad / 2);
    const isPortraitMobile = aspect < 0.9;

    if (focused) {
      const wRatio = isPortraitMobile ? 0.96 : 0.88;
      const distH = SCREEN_H / 0.84 / (2 * halfTanV);
      const distW = SCREEN_W / wRatio / (2 * halfTanV * aspect);
      const focusDist = Math.max(distH, distW);
      const px = isPortraitMobile ? 0 : pointerX * 0.03;
      const py = isPortraitMobile ? 0 : pointerY * 0.02;
      return {
        pos: new THREE.Vector3(
          SCREEN_POS.x + px,
          SCREEN_POS.y - py,
          SCREEN_POS.z + focusDist
        ),
        look: new THREE.Vector3(SCREEN_POS.x, SCREEN_POS.y, SCREEN_POS.z),
      };
    }

    const baseZ = aspect < 1.32 ? 4.35 / Math.max(0.5, aspect / 1.32) : 4.35;
    return {
      pos: new THREE.Vector3(pointerX * 0.36, 1.56 - pointerY * 0.16, baseZ),
      look: new THREE.Vector3(pointerX * 0.08, 1.12 - pointerY * 0.04, -0.25),
    };
  };

  const initCam = getDesiredCamera();
  curCamPos.copy(initCam.pos);
  curLookAt.copy(initCam.look);

  const projectOsOverlay = () => {
    projTL.copy(cornerTL).project(camera);
    projBR.copy(cornerBR).project(camera);

    const x1 = (projTL.x * 0.5 + 0.5) * viewW;
    const y1 = (-projTL.y * 0.5 + 0.5) * viewH;
    const x2 = (projBR.x * 0.5 + 0.5) * viewW;
    const y2 = (-projBR.y * 0.5 + 0.5) * viewH;

    const cx = (x1 + x2) * 0.5;
    const cy = (y1 + y2) * 0.5;
    const pw = Math.max(10, Math.abs(x2 - x1));
    const ph = Math.max(10, Math.abs(y2 - y1));

    const sx = pw / OS_BASE_W;
    const sy = ph / OS_BASE_H;
    osOverlay.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) translate(-50%, -50%) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
  };

  const setFocused = (next: boolean) => {
    if (focused === next) return;
    focused = next;
    if (focused) {
      hoveredTarget = null;
      canvas.style.cursor = 'default';
      onHoverTarget?.(null);
    }
    osOverlay.classList.toggle('is-live', focused);
    onFocusChange?.(focused);
  };

  const toggleLamp = () => {
    lampOn = !lampOn;
    lampCenterLight.intensity = lampOn ? 9.5 : 0;
    lampLeftWingLight.intensity = lampOn ? 3.6 : 0;
    lampRightWingLight.intensity = lampOn ? 3.6 : 0;
    lampDiffuserMat.emissiveIntensity = lampOn ? 2.2 : 0.05;
    lampGlowSprite.visible = lampOn;
    onLampChange?.(lampOn);
    return lampOn;
  };

  const updateRayHover = (clientX: number, clientY: number) => {
    if (focused) {
      if (hoveredTarget !== null) {
        hoveredTarget = null;
        canvas.style.cursor = 'default';
        onHoverTarget?.(null);
      }
      return;
    }
    const rect = canvas.getBoundingClientRect();
    pointerNdc.x = ((clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1;
    pointerNdc.y = -((clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1;

    raycaster.setFromCamera(pointerNdc, camera);
    const hits = raycaster.intersectObjects(interactables, false);
    const hitKind = (hits[0]?.object.userData.interactive as 'monitor' | 'lamp' | undefined) ?? null;

    if (hitKind !== hoveredTarget) {
      hoveredTarget = hitKind;
      canvas.style.cursor = hitKind ? 'pointer' : 'default';
      onHoverTarget?.(hitKind);
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    pointerX = ((e.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
    pointerY = ((e.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
    updateRayHover(e.clientX, e.clientY);
  };

  const onCanvasClick = (e: MouseEvent) => {
    if (focused) {
      setFocused(false);
      return;
    }
    updateRayHover(e.clientX, e.clientY);
    if (hoveredTarget === 'monitor') {
      setFocused(true);
    } else if (hoveredTarget === 'lamp') {
      toggleLamp();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (document.body.dataset.gameFullscreen === '1') return;
    if (e.key === 'Escape' && focused) {
      setFocused(false);
    }
  };

  container.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('click', onCanvasClick);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('keydown', onKeyDown);

  const animate = (now: number) => {
    if (document.body.dataset.gameFullscreen === '1') {
      rafId = window.requestAnimationFrame(animate);
      return;
    }
    const t = (now - clockStart) * 0.001;
    const desired = getDesiredCamera();
    const lerpSpeed = focused ? 0.085 : 0.07;

    curCamPos.lerp(desired.pos, lerpSpeed);
    curLookAt.lerp(desired.look, lerpSpeed);
    camera.position.copy(curCamPos);
    camera.lookAt(curLookAt);
    camera.updateMatrixWorld();

    const targetOutline = !focused && hoveredTarget === 'monitor' ? 0.55 : 0;
    hoverOutlineMat.opacity += (targetOutline - hoverOutlineMat.opacity) * 0.14;

    const posAttr = dustGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < dustCount; i++) {
      let y = posAttr.getY(i) + 0.0011;
      if (y > 3.2) y = 0.2;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;

    screenSpillLight.intensity = 1.8 + Math.sin(t * 2.1) * 0.12;

    renderer.render(scene, camera);
    projectOsOverlay();

    rafId = window.requestAnimationFrame(animate);
  };
  rafId = window.requestAnimationFrame(animate);

  return {
    focusMonitor: () => setFocused(true),
    unfocusMonitor: () => setFocused(false),
    toggleLamp,
    isFocused: () => focused,
    dispose: () => {
      window.cancelAnimationFrame(rafId);
      container.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('click', onCanvasClick);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      disposableGeos.forEach((g) => g.dispose());
      disposableMats.forEach((m) => m.dispose());
      disposableTexs.forEach((t) => t.dispose());
      renderer.dispose();
    },
  };
}
