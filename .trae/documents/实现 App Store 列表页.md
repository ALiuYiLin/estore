## 目标
- 在渲染端新增一个“App Store”页面，以列表形式展示应用的基本信息（图标、名称、版本、简介、作者、标签）。
- 首版仅完成静态展示与基本样式，不接入安装/下载流程。

## 技术方案
- 基于现有 React + TypeScript 渲染端实现，无需引入新依赖。
- 项目目前无路由（参见 src/renderer/src/App.tsx:8-31），直接在根组件加载 App Store 页面。
- 样式沿用现有 `src/renderer/src/assets/main.css`，新增少量类名满足列表排版。

## 文件改动
- 新增 `src/renderer/src/pages/AppStore.tsx`：页面容器，渲染应用列表与头部标题。
- 新增 `src/renderer/src/components/AppItem.tsx`：单条应用项组件（图标、名称、版本、简介、标签）。
- 新增 `src/renderer/src/types/app.ts`：定义 `AppMeta` 接口（`id`, `name`, `version`, `description`, `author`, `tags`, `icon`）。
- 新增 `src/renderer/src/data/apps.ts`：首版静态模拟数据（3-6 个示例条目，图标指向 `src/renderer/src/assets/app-icons/*` 或占位）。
- 更新 `src/renderer/src/assets/main.css`：补充 `.app-store`, `.app-list`, `.app-item`, `.app-meta`, `.app-tags` 等样式。
- 更新 `src/renderer/src/App.tsx`：将根渲染内容替换为 `<AppStore />`（保留或移除示例 `Versions` 组件视需求）。

## 数据模型
- `AppMeta` 字段：
  - `id: string`
  - `name: string`
  - `version: string`
  - `description: string`
  - `author?: string`
  - `tags?: string[]`
  - `icon?: string`（本地资源路径或 `data:` 占位）
- 首版数据来源：`src/renderer/src/data/apps.ts` 导出常量数组 `APPS: AppMeta[]`。

## 交互与状态
- 列表只读展示，项内提供“详情”按钮的占位（后续路由或弹窗）。
- “安装”按钮暂不实现（灰置或隐藏），后续通过 `preload`+IPC 触发主进程处理。

## 安全与资源
- 图标资源放在 `src/renderer/src/assets/app-icons/` 下，或使用占位 `data:`；当前 `index.html` 的 CSP 已允许 `img-src 'self' data:`。
- 不在渲染端直接访问 Node 能力；后续数据来源通过 `preload` 的白名单 API。

## 验证
- 运行 `pnpm dev`，主窗口加载后显示“App Store”标题与应用列表。
- `pnpm typecheck` 无类型错误；`pnpm lint` 通过。

## 后续扩展
- 数据来源切换为远端 JSON 或主进程读取本地仓库，预加载桥接。
- 搜索/过滤与标签分类；分页或虚拟列表。
- 详情页与路由（引入 `react-router` 或简易切页）。
- 安装流程：下载、校验、解压、注册入口；安装状态与进度条；失败重试。
- 国际化与主题样式、深色模式。