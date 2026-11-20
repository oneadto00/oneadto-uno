export const IDENTITY = {
  brand: 'Oneadto',
  titleRole: '全栈与开发工具',
  email: 'oneadto@foxmail.com',
  site: 'oneadto.uno',
  githubDisplay: 'Github.com/oneadto00',
  githubUrl: 'https://github.com/oneadto00',
};

export const MANUAL_TABS = [
  {
    id: 'build',
    index: '01',
    tab: '平时做什么',
    heading: '写后端、命令行工具，也做自己顺手的界面',
    paragraphs: [
      '手头三个项目正好是三个不同方向：OrbitSpace 给小团队处理未提交代码的讨论与文档协同，Anvil 用 Rust 管本地一堆进程和容器，Dropdrop 用来在局域网里省事传文件。',
      '做这些东西没太多宏大计划，大多是因为自己写代码或传文件时踩过坑，干脆自己动手做一个能长期用的版本。',
    ],
  },
  {
    id: 'site',
    index: '02',
    tab: '为什么是老主机',
    heading: '不想把个人页塞成一堆拖慢滚轮的特效',
    paragraphs: [
      '之前也试过放 3D 粒子和全屏 Shader，看两眼挺热闹，但页面沉、电脑风扇响，久了反而不想打开。',
      '换成老显像管和黄卡机之后，整站几乎都是纯矢量和极轻脚本。拖张卡带塞进卡槽再跳页，比直接点一行蓝字有意思一点，也没牺牲响应速度。',
    ],
  },
  {
    id: 'habits',
    index: '03',
    tab: '写代码的习惯',
    heading: '先想清楚会怎么坏，再写正常流程',
    paragraphs: [
      '进程异常退出会不会留孤儿、下载并发高了名额会不会超卖、成员移出后旧 token 还能不能连上 WebSocket——这些麻烦事提前想明白，后面改代码会轻松很多。',
      '做不到的地方也会直接写明边界，不藏在黑盒里碰运气。',
    ],
  },
];

export const SKILL_GROUPS = [
  {
    code: '01',
    category: '常用语言',
    items: ['Java 21', 'TypeScript', 'Rust', 'Python'],
  },
  {
    code: '02',
    category: '前端相关',
    items: ['Astro', 'React', 'Vue 3', 'Yjs / TipTap', 'SVG / Canvas'],
  },
  {
    code: '03',
    category: '后端与数据',
    items: ['Spring Boot', 'Fastify', 'MySQL', 'Redis', 'SQLite / MinIO'],
  },
  {
    code: '04',
    category: '协议与工程',
    items: ['WebSocket', 'OAuth 设备流', 'AES-GCM', 'Docker', 'Playwright'],
  },
];
