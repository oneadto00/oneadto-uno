# Oneadto

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)
[![Astro](https://img.shields.io/badge/Astro-5-ff5d01?logo=astro&logoColor=white)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**Oneadto** 个人主页与工程作品集（`oneadto.uno`），基于 **Astro 5 + TypeScript + Tailwind CSS v4** 构建为纯静态站点。

整站以复古显像管（CRT）硬件桌面为主视觉，融合可拖放卡带主机、工程作品详情页、终端解码关于页与 Three.js 3D 互动工作台，同时适配桌面键鼠与移动触屏浏览器。

---

## 页面与功能概览

| 路由 | 页面内容 |
| :--- | :--- |
| `/` | **卡带主机桌面**：包含红白主机与五张可自由拖放的立体黄卡（`01 OrbitSpace`、`02 Anvil`、`03 Dropdrop`、`04 LAB`、`05 About`），支持磁吸插槽启动动画与双击快启。 |
| `/projects` & `/projects/[slug]` | **工程作品目录与详情页**：展示 [OrbitSpace](https://github.com/oneadto00/OrbitSpace)、[Anvil](https://github.com/oneadto00/Anvil)、[Dropdrop](https://github.com/oneadto00/Dropdrop) 三个自研项目，内嵌轻量原生交互演示、滚动进度刻度尺、核心设计说明与仓库链接。 |
| `/profile` | **终端关于页**：以个人标识为中心的多层漂浮终端星云布局，支持字符乱码解码交互、视差动效与移动端等比适配。 |
| `/lab` | **3D 暗室工作台与互动电脑**：按需加载 Three.js 场景（含可开关屏幕挂灯与工作台建模），点击显示器可聚焦至 3D 投影 `Oneadto OS` 桌面，内置 `GAME.EXE`（16-bit 像素 Roguelike 小游戏《红号大冒险》）、`GitHub`、`Mail`（读取公开联系配置）与 `NOTE.TXT`。 |

### 工程特性
- **路由级按需加载**：首页、作品页与关于页不加载 Three.js，3D 场景仅在 `/lab` 载入；内置小游戏通过动态 `import()` 按需分包，全屏运行时暂停后台 WebGL 渲染。
- **纯 Web Audio 合成音效**：全站共享单一 `AudioContext` 合成 8-bit 交互与游戏音效，无需下载外部音频文件，支持全局持久化开关及移动端音频解锁。
- **纯静态输出**：无后端与数据库依赖，构建后即可部署至任意静态托管平台。

---

## 目录结构

```text
.
├── public/
│   └── favicon.svg                  # 站点几何徽标
├── src/
│   ├── components/
│   │   ├── ConsoleDeskHome.astro    # 首页红白主机与可拖放黄卡桌面
│   │   ├── ProgressRuler.astro      # 项目详情页滚动进度刻度尺
│   │   └── ProjectDemo.astro        # 作品页原生轻量交互演示
│   ├── data/
│   │   ├── profile.ts               # 品牌标识、个人简介与公开联系方式
│   │   └── projects.ts              # 作品列表、设计要点与仓库链接
│   ├── layouts/
│   │   └── CrtLayout.astro          # 全局 CRT 边框、导航栏、View Transitions 与音效控制
│   ├── lib/
│   │   ├── labDeskScene.ts          # /lab 页面 Three.js 3D 工作台与 3D-DOM 投影逻辑
│   │   ├── sound.ts                 # 全站共享 Web Audio 8-bit 合成器
│   │   └── survivor/
│   │       ├── redAdventure.ts      # 《红号大冒险》游戏循环、双端操控与全屏状态管理
│   │       ├── sprites.ts           # 16-bit 像素精灵离屏图集生成
│   │       └── sfx.ts               # 游戏专用合成音效
│   ├── pages/
│   │   ├── index.astro              # 首页
│   │   ├── lab.astro                # 3D 工作台与 Oneadto OS 桌面
│   │   ├── profile.astro            # 关于页
│   │   └── projects/
│   │       ├── index.astro          # 作品目录页
│   │       └── [slug].astro         # 作品详情页（静态生成）
│   └── styles/
│       └── global.css               # 全局 CRT 视觉与主题样式
├── astro.config.mjs                 # Astro 5 与 Tailwind CSS v4 配置
├── tsconfig.json                    # TypeScript 严格模式与 @/* 路径别名
├── package.json
├── LICENSE
└── README.md
```

---

## 本地开发与部署

### 环境要求
- Node.js `>= 20`（推荐 LTS）
- npm `>= 10`

### 常用命令

```bash
# 安装依赖
npm install

# 启动本地开发服务（监听 0.0.0.0:4321，支持同局域网设备调试）
npm run dev

# 执行 Astro 与 TypeScript 类型检查
npm run check

# 构建纯静态产物至 dist/
npm run build

# 本地预览构建产物
npm run preview
```

### 站点自定义与部署
- 站点域名在 [astro.config.mjs](./astro.config.mjs) 中配置；个人标识、联系信息与作品数据分别维护在 [src/data/profile.ts](./src/data/profile.ts) 与 [src/data/projects.ts](./src/data/projects.ts)。
- 执行 `npm run build` 会在 `dist/` 生成纯静态文件，可直接部署至 Vercel、Cloudflare Pages、Netlify、GitHub Pages 或任意静态文件服务器。

---

## 开源许可

本项目采用 **Apache License 2.0** 开源，详见 [LICENSE](./LICENSE)。
