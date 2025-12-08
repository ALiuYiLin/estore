## 目标

* 以 `app.config.json.entry` 指定的 HTML Entry（通常是 `index.html`）为唯一来源。

* 运行时请求 Entry 并解析出 HTML/CSS/JS；使用 Shadow DOM 注入页面并隔离样式。

* 使用 Proxy 沙箱执行 JS，隔离对主页面的访问与副作用。

## 数据流与接口

* 渲染端：`SubAppModal` 接收 `appId` 或 `entryPath`。

* 预加载桥接：提供只读文件接口（避免直接暴露 Node 能力到渲染端）。

  * `window.api.readText(path: string): Promise<string>` 读取文本文件

  * `window.api.join(...parts: string): string` 组合路径

  * `window.api.exists(path: string): Promise<boolean>` 可选，判断存在

* AppStore：打开时把 `{ id, name, entry }` 传入 `SubAppModal`。

## 解析与资源收集

* 解析 `index.html`：

  * 使用 `DOMParser` → `doc.body.innerHTML` 获取主体内容

  * 收集样式：

    * `<link rel="stylesheet" href>`：相对路径 → 基于 Entry 目录拼接绝对文件路径，通过 `readText` 读取

    * `<style>`：记录 `textContent`

  * 收集脚本：

    * `<script src>`：相对路径 → 拼接后 `readText`

    * `<script>`：记录 `textContent`

  * 移除原 `<link>` 与 `<script>` 节点，保留纯 DOM 内容

  * 处理资源相对路径（`img/src`, `a/href`, `link/href` 等）：

    * 统一改写为 `file://` 或通过应用内资源路由（如 `/apps/<id>/...`）以确保正确加载

## Shadow DOM 注入

* `host.attachShadow({ mode: 'open' })`

* 注入顺序：

  1. 合并所有 CSS → `<style>` 注入到 `shadowRoot`
  2. 注入解析后的主体 DOM（不包含脚本与外部样式）到 `shadowRoot` 包裹元素（如 `#subapp-root`）

* 保持每次打开重置：清空 `shadowRoot` 与内部状态；关闭时销毁引用

## JS Proxy 沙箱

* 设计目标：让子应用脚本仅能操作其 Shadow 容器，不影响主页面；限制可用全局对象。

* 代理对象：

  * `documentProxy`：

    * `querySelector/All`、`getElementById` 仅在 `#subapp-root` 作用域内查找

    * `createElement` 返回真实元素，但插入位置仅允许在子应用容器内

    * 禁止或封装 `document.head`、`document.body` 访问

  * `windowProxy`：

    * 暴露 `console`, `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`

    * 暴露 `fetch`（可选，需白名单域名或同源）

    * 不暴露 `eval`/`Function`/`open` 等危险接口

* 执行方式：

  * 将每个脚本串联为 IIFE：`(function(window, document){ /* js */ }).call(windowProxy, windowProxy, documentProxy)`

  * 首选 `new Function` 执行（简单直接）；

  * 若 CSP 不允许 `unsafe-eval`，提供回退：

    * 将脚本写入 Blob URL，使用 `<script src="blob:">` 注入到 Shadow 容器并配合 `windowProxy` 挂载（需要 `script-src blob:`）

    * 或降级到 sandboxed iframe（已实现）

## CSP 与安全策略

* 当前渲染页 CSP：`script-src 'self'`，会阻止 `new Function` 与内联脚本执行。

* 可选策略：a  CSP 放宽至 `script-src 'self' 'unsafe-eval'`

  1. 放宽至 `script-src 'self' 'unsafe-eval'`（允许 `new Function`），并保持 `style-src 'self' 'unsafe-inline'`；
  2. 或使用 `blob:` 加载脚本：`script-src 'self' blob:`；
  3. 若不调整 CSP，自动回退到 sandboxed iframe 执行路径（保留 Shadow 样式隔离替代为 iframe 内隔离）。

* 永远移除用户 HTML 中的 `<script>` 与 `<link rel="stylesheet">`，仅通过我们受控的加载器注入。

## 生命周期

* 打开：

  * 请求并解析 Entry → 收集 CSS/JS → 注入 Shadow → 执行 JS（沙箱）

* 关闭：

  * 清空 `shadowRoot`、撤销 Blob URL（若使用）、取消定时器与事件监听（脚本可通过 `windowProxy` 统一管理）

* 复开：

  * 重新拉取或复用缓存（可选），重新建立沙箱环境

## 实施步骤

1. 在 `preload` 增加只读 API：`readText`, `join`, `exists`（IPC 调用主进程读取文件）
2. 在 `AppStore` 打开时，传入 `{ id, name, entry }`
3. 重构 `SubAppModal`：

   * `useEffect`：按 Entry 拉取、解析、收集资源

   * `injectShadow(root, cssList, html)`：统一注入

   * `runSandbox(jsList, root)`：按 Proxy 沙箱执行脚本

   * 清理与错误处理：错误提示与降级策略
4. URL 处理：实现 `resolvePath(baseDir, rel)`，适配 Windows 路径与打包路径
5. 增加单元测试（解析器与代理行为的基本用例）
6. 类型检查与 ESLint 通过；验证在 dev 与打包模式下运行

## 交付

* `src/preload/index.ts`：新增 API 暴露

* `src/renderer/src/pages/AppStore.tsx`：传入 `entry`

* `src/renderer/src/components/SubAppModal.tsx`：完整重构

* 文档：在 `.trae/documents/` 增加安全与扩展说明（解析策略、沙箱行为、CSP 选项）

## 备注

* 若当前不计划修改 CSP，则默认启用 iframe 回退路径以保证 JS 可执行；当 CSP 放宽后自动切回 Proxy 沙箱执行。

