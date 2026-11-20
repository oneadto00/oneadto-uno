export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectHighlight {
  code: string;
  title: string;
  summary: string;
}

export interface ProjectItem {
  slug: 'orbitspace' | 'anvil' | 'dropdrop';
  index: string;
  categoryLabel: string;
  commitHash: string;
  name: string;
  subtitle: string;
  accent: string;
  role: string;
  formFactor: string;
  license: string;
  repoDisplay: string;
  repoUrl: string;
  stack: string[];
  shortTags: string[];
  homePitch: string;
  overview: string;
  metrics: ProjectMetric[];
  highlights: ProjectHighlight[];
  boundaries: string[];
}

export const PROJECTS: ProjectItem[] = [
  {
    slug: 'orbitspace',
    index: '01',
    categoryLabel: '协同空间',
    commitHash: 'a4f9c21',
    name: 'OrbitSpace',
    subtitle: '团队代码进度与文档协同平台',
    accent: '#daff78',
    role: '后端核心 · 前端画布 · CLI',
    formFactor: '模块化单体 + 网页工作台 + CLI',
    license: 'Apache-2.0',
    repoDisplay: 'github.com/oneadto00/OrbitSpace',
    repoUrl: 'https://github.com/oneadto00/OrbitSpace',
    stack: ['Java 21', 'Spring Boot', 'React', 'TypeScript', 'Yjs', 'MySQL', 'Redis', 'MinIO', 'Python'],
    shortTags: ['即时撤权', 'SVG 轨道', '双序号群聊', '多人文档'],
    homePitch:
      '小团队聊未提交的代码改动，平时总靠截图发群里，过两天就找不着上下文。OrbitSpace 把本地快照、行级批注、群聊和协作文档收进同一个空间。',
    overview:
      '给使用 Git 的小研发团队用的协同工具。核心用 Java 21 模块化单体承接空间权限、群聊和快照，文档协同和耗时解析按需挂接独立服务。',
    metrics: [
      { label: '后端架构', value: 'Java 21 模块化单体 + Outbox / Redis Streams' },
      { label: '权限回收', value: '按成员授权周期撤权，接口、群聊与 CLI 同步失效' },
      { label: '轨道渲染', value: 'Web Worker 算布局 + SVG 视口虚拟化' },
      { label: '文档协同', value: 'TipTap + Yjs 增量落盘，支持无损恢复' },
    ],
    highlights: [
      {
        code: '01 · 移出即失效',
        title: '成员撤权走全路径校验',
        summary:
          '每个成员绑定一个授权周期号（membership_epoch）。移出空间时递增周期并通过 Outbox 与 Redis 广播，正在连着的 WebSocket、还没过期的 CLI 凭证和快照读取都会立刻失效，重新加回来也不会复活旧凭证。',
      },
      {
        code: '02 · 主动共享 WIP',
        title: '先扫敏感内容、确认后再上传',
        summary:
          'CLI 用 RFC 8628 设备流登录，不会在后台偷偷传代码。每次上报前先按 .orbitignore 和密钥规则扫一遍，锁定本次内容让本人确认后再发；前端画布会把「未共享」和「实际删除」标清楚，不混为一谈。',
      },
      {
        code: '03 · 群聊与异步任务',
        title: '断线不丢消息，迟到任务不盖旧账',
        summary:
          '发消息时在同一个数据库事务里加锁分双序号、写消息和 Outbox，提交后才回 ACK，断网回来靠双游标把缺口补齐；Python 解析任务在沙箱里走代理防 SSRF，结果写回前做四重校验，防止已取消的任务反过来覆盖新状态。',
      },
    ],
    boundaries: [
      '只按实际上传的级别（仅元信息 / 仅补丁 / 完整代码树）开放对应查看能力，不会凭空还原没传上来的文件。',
      '原始 Git 提交号和脱敏后的快照号分开存放，群聊卡片永远指向当时那一份不可变快照。',
    ],
  },
  {
    slug: 'anvil',
    index: '02',
    categoryLabel: '环境编排',
    commitHash: '7e2b80d',
    name: 'Anvil',
    subtitle: 'Rust 本地开发环境编排器',
    accent: '#22d3ee',
    role: '全量设计实现（CLI + TUI）',
    formFactor: '单二进制工具 + 60 帧终端工作台',
    license: 'Apache-2.0',
    repoDisplay: 'github.com/oneadto00/Anvil',
    repoUrl: 'https://github.com/oneadto00/Anvil',
    stack: ['Rust', 'Tokio', 'Ratatui', 'Bollard', 'Serde YAML', 'Argon2id', 'AES-256-GCM'],
    shortTags: ['6 层 Crate', 'Actor 调度', '60 帧终端', '零孤儿进程'],
    homePitch:
      '本地开发常要同时开数据库容器和好几个前后端进程，窗口切来切去，退出还常留孤儿进程。Anvil 用一份 YAML 统一管进程和 Docker，端口冲突可以直接在终端里反查强杀并重试。',
    overview:
      '一个 Rust 写的单二进制本地开发编排工具。把宿主机原生进程和 Docker 容器放进同一张依赖图里按波次拉起，告别手写 sleep 等数据库。',
    metrics: [
      { label: '代码结构', value: '6 个 Crate 分层拆开核心、系统调用、密钥和界面' },
      { label: '状态与渲染', value: '单写者 Actor + watch 无锁快照 + 16ms 日志合批' },
      { label: '进程清理', value: 'Unix 进程组 + Windows 作业对象，不留孤儿进程' },
      { label: '敏感配置', value: '系统钥匙串 / AES-256-GCM 加密库 + 内存自动清零' },
    ],
    highlights: [
      {
        code: '01 · 不卡终端',
        title: '调度和界面完全解耦',
        summary:
          '状态只由一个 Orchestrator Actor 改写，Ratatui 界面每帧读一份无锁快照；服务吐出来的日志每 16 毫秒合批送进 5,000 行环形缓冲，哪怕某个服务突然疯狂刷屏，终端翻页和搜索依然不卡顿。',
      },
      {
        code: '02 · 退得干净',
        title: '整棵进程树清理与防误杀',
        summary:
          'macOS/Linux 用独立进程组先发 SIGTERM 再兜底 SIGKILL，Windows 挂进 Job Object 随关闭自动清场；运行锁里记了进程启动时间戳，重启自检先核对指纹再回收，防止系统复用 PID 误杀别的程序。',
      },
      {
        code: '03 · 探针与密钥',
        title: '四类就绪检测与一键端口救援',
        summary:
          '下游服务自动等上游过 TCP、HTTP、日志正则或容器健康检查再起；端口被占时自动查出占用进程和命令，弹窗按 k 直接清掉并重试；配置里只写密钥占位符，注入内存后全程脱敏，日志和崩溃文件里只出现 [REDACTED]。',
      },
    ],
    boundaries: [
      '除了默认交互终端，也带前台纯日志（--no-tui）和后台分离（--detach）两种跑法。',
      '挂了 Panic 终端恢复钩子，程序就算意外崩了也会把终端还原正常，并顺手把崩溃现场存盘。',
    ],
  },
  {
    slug: 'dropdrop',
    index: '03',
    categoryLabel: '局域网快传',
    commitHash: 'c91d04f',
    name: 'Dropdrop',
    subtitle: '局域网安全文件中转工具',
    accent: '#ff4d3d',
    role: 'CLI · 服务端 · 网页端',
    formFactor: '命令行服务 + 浏览器六位码收发',
    license: 'Apache-2.0',
    repoDisplay: 'github.com/oneadto00/Dropdrop',
    repoUrl: 'https://github.com/oneadto00/Dropdrop',
    stack: ['Node.js', 'TypeScript', 'Fastify', 'Vue 3', 'SQLite WAL', 'Playwright'],
    shortTags: ['自动挑网卡', '原子配额', '断点续传', '防写满磁盘'],
    homePitch:
      '同局域网跨设备传文件，不想装 App 也不想绕网盘。主机起一条命令就自动挑好物理网卡出二维码，手机电脑扫码输六位取件码直接收发，用完或过期自动清掉。',
    overview:
      '定位很单一的局域网临时文件中转工具。发送端传完可以关网页，接收端靠六位取件码按次数下载；重点聚焦于并发扣减、断点续传、磁盘余量和自动清理。',
    metrics: [
      { label: '文件传输', value: '流式读写落盘 + SHA-256 校验 + HTTP Range 续传' },
      { label: '次数控制', value: 'SQLite WAL 短事务原子占额，防并发超卖' },
      { label: '访问防护', value: 'HttpOnly Cookie + CSRF + HMAC 摘要 + Nonce 锁' },
      { label: '磁盘保护', value: '强制预留 1 GiB 空间防写满，过期或耗尽自动删' },
    ],
    highlights: [
      {
        code: '01 · 次数算得准',
        title: '同一会话续传不重复扣次数',
        summary:
          '光看文件列表不扣名额，同一浏览器在第一次真正拉文件时通过 SQLite WAL 短事务扣掉一个名额；后面下载同批次别的附件或断网续传都复用这次授权，多人同时点下载也不会超发。',
      },
      {
        code: '02 · 少踩局域网坑',
        title: '自动跳过虚拟网卡，补齐安全细节',
        summary:
          '启动时自动避开链路本地和代理虚拟网段，直接打出局域网可连的地址和二维码；服务端做好 Cookie、CSRF、取件码摘要和控制通道验签，避免局域网里被顺手乱扫。',
      },
      {
        code: '03 · 清理可控',
        title: '预留磁盘空间与可预演清理',
        summary:
          '支持单文件、单批次和总容量上限，并硬性预留 1 GiB 防止把主机磁盘撑爆；次数用光或到期自动清场，也提供 cleanup --dry-run 先预览再删，整套流程跑过 Playwright E2E 验证。',
      },
    ],
    boundaries: [
      '重启服务会让旧批次和会话直接失效，目前不做跨进程重启续传，也不自动帮多文件打 ZIP 包。',
      '删除只针对实例自己的暂存目录和数据库记录，无法抹除接收设备已经保存下来的副本。',
    ],
  },
];

export function getNextProject(slug: string): ProjectItem {
  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  return PROJECTS[(idx + 1) % PROJECTS.length];
}
