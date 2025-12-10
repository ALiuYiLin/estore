## 目标

* 将 `AppStore.tsx#L61-92` 中的 HTML/CSS/JS 文件选择与拼合逻辑封装到 `utils/files` 下的工具函数

* 页面只负责调用工具并读取文本，保持原有行为

## 工具函数

* 文件：`src/renderer/src/utils/files/loaders.ts`

* 函数：

  * `loadHtmlFile(byName, byRel, manifest)` → 选择 HTML 文件（`entry`/`html`/回退 `index.html`）

  * `loadCssFiles(byName, byRel, manifest)` → 选择并返回 CSS 文件数组（支持数组与单值，回退 `index.css`）

  * `loadJsFiles(byName, byRel, manifest)` → 选择并返回 JS 文件数组（支持数组与单值，回退 `index.js`）

* 依赖：使用已封装的 `resolveFile(byName, byRel, p)`

## 页面改动

* 在 `src/renderer/src/pages/AppStore.tsx` 引入并替换原文件匹配代码：

  * `const htmlFile = loadHtmlFile(...)` 并读取文本

  * `const cssFiles = loadCssFiles(...)` 并合并文本

  * `const jsFiles = loadJsFiles(...)` 并合并文本

## 验证

* 类型检查与 Lint

* 手动验证：manifest 使用相对路径与文件名两种情况；CSS/JS 数组与单值均可解析

## 范围

* 新增 `utils/files/loaders.ts`

* 更新 `AppStore.tsx` 调用工具函数

