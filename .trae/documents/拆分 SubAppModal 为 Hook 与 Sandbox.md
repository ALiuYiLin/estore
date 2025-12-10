## 目标

* 将子应用的加载与注入逻辑从 `SubAppModal` 拆分为 Hook `hooks/use-subapp/index.ts`

* 将 JS 代理执行逻辑拆分到 `utils/sandbox/index.ts`

* `SubAppModal` 仅负责 UI 与引用宿主元素，并调用 Hook

## 变更点

* 新增 `src/renderer/src/hooks/use-subapp/index.ts`：

  * 负责读取 Entry（通过 `window.api`），解析 HTML/CSS/JS

  * 注入到 Shadow DOM（在 `hostRef.current` 上）

  * 调用 `runInSandbox` 执行 JS

* 新增 `src/renderer/src/utils/sandbox/index.ts`：

  * `runInSandbox(wrapper, code)` 在受控代理环境执行脚本

* 更新 `src/renderer/src/components/SubAppModal.tsx`：

  * 引入 `useSubApp`，传入 `visible/entry/html/css/js/hostRef`

## 保留与兼容

* 继续支持上传应用的内存 `html/css/js` 与按 `entry` 动态加载两条路径

* 保持之前的 CSP 设置与 preload API 使用

## 验证

* `pnpm typecheck` 与 `pnpm lint`

* 添加应用并打开、从 apps 目录打开两种方式验证渲染与脚本隔离

