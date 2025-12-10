## 目标
- 将 `src/renderer/src/components/SubAppModal.tsx` 中的 `fetchEntry` 与 `run` 方法抽取至 `src/renderer/src/utils/subapp.ts`
- 保持现有行为：按 `entry` 读取并解析 HTML/CSS/JS，注入 Shadow DOM，执行脚本（通过 sandbox）

## 拆分设计
- 新增 `utils/subapp.ts`：
  - `fetchEntryResources(opts)`：入参 `{ entry?, html?, css?, js? }`，返回 `{ htmlText, cssText, jsText }`
  - `renderSubApp(host, opts, res)`：在 `host.attachShadow` 上注入样式与内容，并使用现有 `runInSandbox` 执行脚本
- 更新 `SubAppModal.tsx`：
  - 在 `useEffect` 中调用 `fetchEntryResources` 与 `renderSubApp`
  - 移除组件内的 `fetchEntry` 与 `run` 定义

## 兼容与依赖
- 继续使用 `window.api.readText/join`
- 复用 `utils/sandbox/runInSandbox`
- 不改动 props 与其他页面逻辑

## 验证
- 类型检查与 Lint
- 手动验证上传与目录应用的打开渲染与脚本执行