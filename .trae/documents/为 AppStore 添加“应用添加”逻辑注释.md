## 目标
- 在 `src/renderer/src/pages/AppStore.tsx` 对“应用添加”相关逻辑添加详细逐行中文注释，聚焦：
  - 状态与引用：`userApps`、`viewer`、`dirInputRef`
  - 目录选择与读取：`onAddApp` 事件处理
  - 文件映射与读取：`Map`、`app.config.json`、`index.html`、`index.css`
  - 状态更新与输入重置：`setUserApps` 与 `e.target.value = ''`
  - 目录选择启用：`webkitdirectory` 设置

## 注释覆盖范围
1. 顶部类型与状态定义：解释 `LoadedApp`、各 `useState` 与 `useRef`
2. `onAddApp` 函数逐行注释：
   - 读取 `FileList`，空判断
   - 构建按文件名的小写映射，确保随意顺序都能取到目标文件
   - 获取目标文件：`app.config.json`、`index.html`、`index.css`
   - 缺失必需文件时直接返回（保护逻辑）
   - 异步读取文本并解析 JSON（记录：`entry` 可选）
   - 更新 `userApps` 状态，将新增应用并保留 HTML/CSS 文本
   - 清空 input 的值，确保下次选择同一目录也能触发 `onChange`
3. `useEffect` 设置 `webkitdirectory` 注释：解释为何通过 `setAttribute` 注入非标准属性以允许选择目录

## 风格与约束
- 仅添加注释，不改动任何运行逻辑与类型签名
- 注释语言为中文，简洁但逐行覆盖关键语句
- 保持现有代码格式与 ESLint/Prettier 约束一致

## 交付文件
- `src/renderer/src/pages/AppStore.tsx`（添加注释）

## 验证
- 运行 `pnpm typecheck` 与 `pnpm lint`，确保注释不影响构建与风格检查

## 备注
- 如需进一步为“打开子应用”与 Shadow DOM 注入流程补充注释，可在后续追加同等粒度注释到 `SubAppModal.tsx` 与 `openApp`。