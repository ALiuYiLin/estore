## 目标
- 将 `src/renderer/src/components/SubAppModal.tsx` 中的“加载子应用 HTML/CSS/JS，并放入 Shadow DOM，执行 JS”的逻辑拆分：
  - Hook：`src/renderer/src/hooks/use-subapp/index.ts`
  - Sandbox：`src/renderer/src/utils/sandbox/index.ts`
- `SubAppModal` 仅保留 UI 与宿主元素引用，调用 Hook 完成加载与执行。

## 文件结构与职责
- hooks/use-subapp/index.ts
  - 接口：`useSubApp({ visible, entry, html, css, js, host })`
  - 行为：
    1. 若传入 `entry`，通过 `window.api.readText/join` 读取 `index.html`，解析 `<link rel="stylesheet">` 与 `<script>`（含外链与内联），收集 CSS/JS 文本并移除原标签，仅保留主体 DOM
    2. 注入 Shadow DOM：先 `<style>` 再内容容器
    3. 调用 `runInSandbox(wrapper, code)` 执行脚本
    4. 支持纯内存模式（`html/css/js` 由上传提供）
- utils/sandbox/index.ts
  - 接口：`runInSandbox(wrapper: HTMLElement, code?: string)`
  - 行为：以受控 `documentProxy/windowProxy` 执行脚本，仅作用于 `wrapper` 容器，暴露 `console` 与定时器，移除对主文档的影响
- components/SubAppModal.tsx
  - 引入 `useSubApp`，将宿主 `ref.current` 作为 `host` 传入
  - 移除内联 `useEffect` 与本地 sandbox 代码

## 类型与兼容
- 复用现有 `Props`（`visible/title/entry/html/css/js/onClose`）
- 如有需要，新增共享类型 `LoadedApp/ViewerState`（已存在则复用）
- 保持现有 preload API 使用（`window.api.readText/join/exists`）与 CSP 设置不变

## 验证
- 类型检查与 ESLint
- 交互验证：
  - 上传的应用（内存 `html/css/js`）可打开
  - 目录下应用（基于 `apps/<id>/<entry>`）可打开并正确加载外链资源

## 变更范围
- 创建 `hooks/use-subapp/index.ts` 与 `utils/sandbox/index.ts`
- 重构 `SubAppModal.tsx` 引用 Hook
- 不改动其他页面逻辑