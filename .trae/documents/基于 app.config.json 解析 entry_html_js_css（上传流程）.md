## 目标
- 在上传添加应用时，不再硬编码 `index.html/index.css/index.js`；改为读取 `app.config.json` 中的 `entry/html/js/css` 配置以加载资源。

## 设计与类型
- 新增类型 `AppManifest`（仅在工具函数内部使用）：在 `app.config.json` 中允许字段：
  - `entry`: string（HTML入口路径，相对应用根目录）
  - `html`: string（如不使用 entry，可指定 HTML 文件）
  - `css`: string | string[]（多个样式文件）
  - `js`: string | string[]（多个脚本文件）
  - 其余元信息字段与现有 `AppMeta` 对齐

## 工具函数改造（utils/apps.ts）
- mapFiles(files): 扩展为映射 `file.name.toLowerCase()` 与 `file.webkitRelativePath.toLowerCase()` → File
- 解析 manifest：从 `app.config.json` 中读取 `entry/html/css/js`，统一转为相对路径数组
- 读取资源：
  - HTML：优先 `entry`，否则 `html`，再否则 `index.html`
  - CSS：优先 `css`（支持数组），否则 `index.css`（若存在）
  - JS：优先 `js`（支持数组），否则 `index.js`（若存在）
- 结果：返回 `LoadedApp`（沿用现有结构：`meta + html/css/js` 文本），不改变 `AppStore` 对外使用习惯

## 页面调用（AppStore.tsx）
- 保持 `onAddApp` 使用 `buildLoadedAppFromFiles(files)`；无需改页面逻辑
- `openApp` 无需改动：上传应用仍走内存文本；目录应用走 `entry` 路径

## 兼容与回退
- 若 manifest 某项缺失则按原来默认文件名回退
- 若指定文件在 FileList 中不存在，则忽略该项并继续其它项；最终至少需 HTML 才能有效

## 验证
- 类型检查与 Lint
- 手动添加：
  - 仅 `entry` 的应用
  - 指定多 CSS/JS 的应用
  - 不含配置字段时回退索引文件

## 变更范围
- 更新 `src/renderer/src/utils/apps.ts`（解析与读取）
- 无需改动 `AppStore.tsx` 或 Hook/Sandbox