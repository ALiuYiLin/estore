import type { AppMeta } from '../types/app'

export const APPS: AppMeta[] = [
  {
    id: 'markdown-notes',
    name: 'Markdown Notes',
    version: '1.2.0',
    description: '轻量级笔记与文档编辑器，支持本地同步与标签管理。',
    author: 'Acme Co.',
    tags: ['productivity', 'notes'],
    icon: 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22><rect width=%2248%22 height=%2248%22 rx=%228%22 fill=%22%233178c6%22/><text x=%2212%22 y=%2232%22 font-size=%2222%22 fill=%22%23fff%22>M</text></svg>'
  },
  {
    id: 'image-toolbox',
    name: 'Image Toolbox',
    version: '0.9.3',
    description: '常用图片工具合集：压缩、裁剪、格式转换。',
    author: 'Pixel Labs',
    tags: ['image', 'tools'],
    icon: 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22><rect width=%2248%22 height=%2248%22 rx=%228%22 fill=%22%23e67e22%22/><circle cx=%2224%22 cy=%2224%22 r=%2212%22 fill=%22%23fff%22/></svg>'
  },
  {
    id: 'dev-helper',
    name: 'Dev Helper',
    version: '2.0.1',
    description: '开发辅助工具：JSON 查看、URL 编码、正则测试。',
    author: 'Tooling Inc.',
    tags: ['developer', 'utility'],
    icon: 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22><rect width=%2248%22 height=%2248%22 rx=%228%22 fill=%22%232ecc71%22/><path d=%22M12 28 L24 12 L36 28 Z%22 fill=%22%23fff%22/></svg>'
  },
  {
    id: 'music-player',
    name: 'Music Player',
    version: '0.5.0',
    description: '本地音乐播放器，支持歌单与快捷键。',
    author: 'Sonic Team',
    tags: ['music', 'player'],
    icon: 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22><rect width=%2248%22 height=%2248%22 rx=%228%22 fill=%22%239b59b6%22/><circle cx=%2218%22 cy=%2224%22 r=%226%22 fill=%22%23fff%22/><rect x=%2224%22 y=%2214%22 width=%228%22 height=%2216%22 fill=%22%23fff%22/></svg>'
  }
]
