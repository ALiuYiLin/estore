## 目标
- 将 `onAddApp`（添加应用逻辑）拆分到 `src/renderer/src/utils/apps.ts`
- 将 `openApp`（打开应用逻辑）拆分到 `src/renderer/src/hooks/use-app-open/index.ts`
- 新增共享类型定义，避免页面内联类型耦合

## 变更点
- 新增 `src/renderer/src/types/subapp.ts`：导出 `LoadedApp`、`ViewerState` 类型
- 新增 `src/renderer/src/utils/apps.ts`：
  - `buildLoadedAppFromFiles(files: FileList): Promise<LoadedApp | null>`
  - 供页面在 `onChange` 时调用，并负责重置 input 值（返回布尔或由页面处理）
- 新增 `src/renderer/src/hooks/use-app-open/index.ts`：
  - `useAppOpen(userApps, setViewer)` 返回 `(meta: AppMeta) => void`
  - 统一处理上传应用与基于 `apps/<id>/<entry>` 的打开逻辑
- 更新 `src/renderer/src/pages/AppStore.tsx`：
  - 使用 `buildLoadedAppFromFiles` 处理添加
  - 使用 `useAppOpen` 获取 `openApp`

## 保留与兼容
- 保留现有 `entry` 路径解析与 `viewer` 扩展字段
- 不改变 `SubAppModal` 与 `use-subapp` 逻辑

## 验证
- 运行类型检查与 lint
- 手动验证上传与目录应用的打开流程