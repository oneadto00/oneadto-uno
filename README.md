# Oneadto

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![Astro](https://img.shields.io/badge/Astro-5-ff5d01?logo=astro&logoColor=white)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Oneadto** 个人主页与工程作品集（`oneadto.uno`），基于 **Astro 5 + TypeScript + Tailwind CSS v4** 纯静态构建。

整站以**复古显像管（CRT）硬件桌面**为视觉框架，结合无商标红白主机、可拖放立体黄色游戏卡带、极客命令行解码星云与可互动 3D 暗室工作台，在保持轻量首屏加载的同时提供多维交互体验，并完整适配桌面键鼠与移动触屏浏览器。

---

## 核心页面与交互设计

### 1. 复古卡带主机桌面 (`/`)
- **无商标红白主机与三层插槽遮挡**：采用纯 CSS 立体分层（机身上壳 `z-10` → 插入态卡带 `z-16` → 酒红前面板 `z-26`）还原卡带物理插入卡槽的遮挡质感。
- **五张可自由拖放立体黄卡**：包含 `01 OrbitSpace`、`02 Anvil`、`03 Dropdrop`、`04 LAB`、`05 About` 五张独立厚边卡带，支持桌面任意摆放、拖动速度倾斜、卡槽宽容磁吸对齐、插入启动读条动画以及**桌面双击 / 手机双击快启**。
- **持久化硬件状态栏**：顶部集成复古极简 CRT 徽标与中文导航，底部提供实时状态提示、一键复制邮箱及全站统一的 `音效 [开/关]` 开关，跨页切换通过 Astro View Transitions 保持无缝过渡。

### 2. 工程作品目录与详情页 (`/projects` & `/projects/[slug]`)
- 收录三个自研工程项目：
  - **[OrbitSpace](https://github.com/oneadto00/OrbitSpace)**：团队代码进度与文档协同平台（Java 21 / Spring Boot / React / Yjs / Redis / MinIO）
  - **[Anvil](https://github.com/oneadto00/Anvil)**：Rust 本地开发环境编排器（Rust / Tokio / Ratatui / Bollard / AES-256-GCM）
  - **[Dropdrop](https://github.com/oneadto00/Dropdrop)**：局域网安全文件中转工具（Node.js / Fastify / Vue 3 / SQLite WAL / Playwright）
- 每个项目详情页均内嵌**零外部依赖的原生交互演示切片**（`ProjectDemo.astro`）、滚动阅读进度刻度尺（`ProgressRuler.astro`）、关键设计拆解及开源协议与仓库直链。

### 3. 命令行关于页 (`/profile`)
- 以 `Oneadto` 与 `Github.com/oneadto00` 为中心锚点，外围环绕三层倾斜漂浮元素：
  - 最大字号：本站实现技术（`ASTRO 5`、`TYPESCRIPT`、`TAILWIND V4`、`NATIVE SVG`）
  - 中等字号：四个可点击直达的项目与 LAB 入口
  - 漂浮终端字符流：12 条高亮命令行技术栈字符串，支持周期性乱码解码、悬停/触控触发故障解码音效与视差漂浮
- 桌面端与移动端共用同一套星云布局，并按手机窄屏进行等比缩放与坐标映射。

### 4. 3D 工作台与互动电脑 (`/lab`)
- **原创工业风 3D 建模（Three.js 按需加载）**：暗板岩工作台、金属洞洞板墙面、带新 Logo 的复古铭牌、悬挂黄卡、铜箔 PCB 电路板、左侧绿刻度切割垫与迷你红白机、右侧绿色正弦波迷你示波器与旋钮宏键盘。
- **顶置屏幕挂灯**：位于显示器正上方，由主聚光灯与左右双侧暖光协同照亮工作台三区，点击灯管本体或 `顶灯 [开/关]` 按钮可实时切换开关。
- **3D 投影 `Oneadto OS` 交互桌面**：点击显示器镜头平滑拉近，实时将真实 HTML 桌面（`960×540`）通过矩阵投影贴合至 3D 屏幕边框，内置四个桌面程序：
  - **`GAME.EXE`（《红号大冒险》）**：点击 `启动` 后经读条动画过渡至自适应全屏并锁定页面滚动。
  - **`GitHub`**：快捷跳转 [github.com/oneadto00](https://github.com/oneadto00)。
  - **`Mail`**：内置快捷发信窗口，预填 `oneadto@foxmail.com`，支持一键唤起邮件客户端或复制邮箱地址。
  - **`NOTE.TXT`**：工作台与交互说明。

### 5. 内置 16-bit 像素Roguelike小游戏：《红号大冒险》
- **纯前端无后端街机循环**：离屏 Canvas 烘焙 16-bit 像素精灵图集（1px 暗色轮廓描边、双帧行走动画、左右翻转、受击闪白帧与无缝石砖地牢地砖），刷新或死亡即重开，无账号与服务端存储依赖。
- **三属性 + 六武器 + 三超武进化**：
  - **基础属性**：生命（上限/回复/自愈）、力量（全武器伤害/击退）、速度（移速/冷却缩减/磁吸范围）
  - **自动攻击武器**：红号飞刃、护身星环、脉冲力场、天罚雷落、回旋重斧、追踪灵火
  - **超武进化**：`红号飞刃 Lv.5 + 速度 Lv.2 → 千刃风暴`、`护身星环 Lv.5 + 力量 Lv.2 → 猩红日冕`、`脉冲力场 Lv.5 + 生命 Lv.2 → 噬魂血域`
  - **波次与战场道具**：多波次怪物潮、精英「猩红督军」、终焉 Boss「深渊红王」，以及可击破像素补给箱（回血烤肉、全图经验磁铁、超载清屏脉冲）。
- **双端操控适配**：
  - 电脑端同时支持 `WASD`、`↑↓←→`、鼠标拖拽虚拟摇杆，以及数字键 `1 / 2 / 3` 快速选卡、`ESC` 暂停、`R` 重开。
  - 移动端自动切换 1:1 竖屏/横屏无拉伸像素视口、底部大号触控虚拟摇杆（兼全屏任意处单指拖动）与横排点选升级卡片。

---

## 性能与工程策略

- **路由级依赖隔离**：主站（`/`、`/projects`、`/profile`）零重型 3D 或前端框架运行时，交互脚本均控制在 `1~4 kB` gzip 级别；Three.js 仅在访问 `/lab` 时加载。
- **游戏引擎动态分包**：《红号大冒险》通过动态 `import()` 拆分为独立 chunk（约 `19 kB` gzip），仅在用户点击 `启动` 后按需载入；进入全屏游戏时自动暂停后台 3D WebGL 渲染，释放全部显卡算力。
- **统一 Web Audio 合成器**：全站零外部音频文件下载，通过单一共享 `AudioContext` 合成 8-bit 交互与游戏音效，并处理了 iOS Safari / Android Chrome 首次触控静音 Buffer 唤醒与 `audioSession` 策略。

---

## 目录结构

```text
.
├── public/
│   └── favicon.svg                  # 复古极简 CRT 几何徽标
├── src/
│   ├── components/
│   │   ├── ConsoleDeskHome.astro    # 首页红白主机与五张可拖拽黄卡交互桌面
│   │   ├── ProgressRuler.astro      # 项目详情页右侧阅读刻度尺
│   │   └── ProjectDemo.astro        # 三个工程项目的原生轻量交互演示
│   ├── data/
│   │   ├── profile.ts               # 品牌标识与基础公开信息
│   │   └── projects.ts              # 作品列表、技术要点与仓库地址数据
│   ├── layouts/
│   │   └── CrtLayout.astro          # 全局 CRT 显像管边框、导航栏与持久化音效控制器
│   ├── lib/
│   │   ├── labDeskScene.ts          # LAB 页 Three.js 原创 3D 工作台、顶灯与 3D-DOM 投影引擎
│   │   ├── sound.ts                 # 全站共享 Web Audio 8-bit 合成器与移动端音频解锁
│   │   └── survivor/
│   │       ├── redAdventure.ts      # 《红号大冒险》核心模拟循环、全屏锁定、虚拟摇杆与 UI
│   │       ├── sprites.ts           # 16-bit 像素精灵矩阵与离屏图集烘焙器
│   │       └── sfx.ts               # 游戏专用 8-bit 战斗/宝石/升级/Boss 合成音效
│   ├── pages/
│   │   ├── index.astro              # 首页（卡带主机桌面）
│   │   ├── lab.astro                # LAB 3D 暗室工作台与 Oneadto OS 桌面
│   │   ├── profile.astro            # 关于页（命令行解码星云）
│   │   └── projects/
│   │       ├── index.astro          # 工程作品目录页
│   │       └── [slug].astro         # 项目详情静态生成页
│   └── styles/
│       └── global.css               # CRT 扫描线、玻璃反光、滚束与复古链接样式
├── astro.config.mjs                 # Astro 5 + Tailwind CSS v4 (Vite) 配置
├── tsconfig.json                    # TypeScript 严格模式与路径别名配置
├── package.json
├── LICENSE                          # Apache License 2.0 协议全文
└── README.md
```

---

## 本地开发与部署

### 环境要求
- Node.js `>= 18.17`（推荐 `20+`）
- npm `>= 9`

### 常用命令

```bash
# 安装依赖
npm install

# 启动本地开发服务（监听 0.0.0.0:4321，支持本机与同局域网手机调试）
npm run dev

# 执行 Astro 与 TypeScript 类型检查
npm run check

# 构建纯静态产物至 dist/ 目录
npm run build

# 本地预览构建产物
npm run preview
```

### 静态部署
运行 `npm run build` 会在 `dist/` 目录生成纯静态站点文件，可直接部署至 Vercel、Cloudflare Pages、Netlify、GitHub Pages 或任意 Nginx 静态托管环境，无需服务端运行环境。

---

## 开源协议

本项目采用 **[Apache License 2.0](./LICENSE)** 开源协议授权。详情请参阅仓库根目录的 [LICENSE](./LICENSE) 文件。
