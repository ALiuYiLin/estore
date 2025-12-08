## 目标
- 在项目根目录下新增 `apps/hello-app/`，包含单页应用：`index.html`、`index.js`、`index.css`、`app.config.json`。
- 首版仅静态页面与脚本，无路由与构建集成；后续可接入 App Store 列表自动扫描。

## 目录与命名
- 新建目录：`apps/hello-app/`
- 文件：
  - `index.html`：页面入口，加载 `index.css` 与 `index.js`
  - `index.css`：简单样式
  - `index.js`：页面交互示例（如按钮点击）
  - `app.config.json`：应用元信息

## app.config.json 字段
- `id`: 应用唯一标识，如 `hello-app`
- `name`: 应用名称，如 `Hello App`
- `version`: 初始版本 `0.1.0`
- `description`: 简要描述
- `author`: 作者
- `tags`: 标签数组
- `icon`: 可选图标（相对路径或 `data:`）
- `entry`: 固定 `index.html`

## 页面内容
- `index.html`：标题、描述、一个交互按钮；引用 CSS 与 JS；遵循当前 `index.html` 的 CSP 限制，资源走相对路径或 `data:`。
- `index.css`：基本排版与按钮样式，适配深色背景。
- `index.js`：给按钮绑定点击事件，更新页面中的文本。

## 集成建议（可选，不在本次范围内）
- 后续在渲染端通过预加载桥接读取 `apps/*/app.config.json`，将其展示到 App Store 列表。

## 验证
- 创建文件后，手动打开 `apps/hello-app/index.html` 可预览静态页面。
- 运行 `pnpm typecheck` 与 `pnpm lint` 确认无影响。

## 变更范围
- 仅新增 `apps/hello-app` 目录及 4 个文件；不修改现有构建与页面。