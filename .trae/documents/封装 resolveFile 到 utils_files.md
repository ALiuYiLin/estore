## 目标
- 将 `src/renderer/src/pages/AppStore.tsx#L58-64` 的 `resolveFile` 封装为可复用工具：`src/renderer/src/utils/files/resolveFile.ts`
- 页面改为使用该工具函数，保持现有行为不变

## 设计
- 工具函数签名：
  - `resolveFile(byName: Map<string, File>, byRel: Map<string, File>, p?: string): File | undefined`
- 逻辑：
  - 输入路径 `p` 为空返回 `undefined`
  - 统一小写，优先 `byRel.get(norm)`，回退 `byName.get(base)`（`base` 为文件名）

## 修改点
- 新增：`src/renderer/src/utils/files/resolveFile.ts`
- 更新：`src/renderer/src/pages/AppStore.tsx` 引入并替换本地函数；将所有调用改为 `resolveFile(byName, byRel, ...)`

## 验证
- 类型检查与 Lint 通过
- 手动验证上传应用：
  - 指定相对路径与仅文件名两种 manifest 情况
  - CSS/JS 数组与单值都能解析