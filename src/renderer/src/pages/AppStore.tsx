import { useEffect, useMemo, useRef, useState } from 'react'
import { APPS } from '../data/apps'
import AppItem from '../components/AppItem'
import SubAppModal from '../components/SubAppModal'
import type { AppMeta, AppWithContent } from '../types/app'
import { loadHtmlText, loadCssText, loadJsText } from '../utils/files/loaders'
import type { AppManifest } from '../types/app'
import { buildFileMaps } from '../utils/files/mapping'

// 使用统一数据结构 AppWithContent

export default function AppStore(): React.JSX.Element {
  // userApps：用户通过“添加应用”导入的子应用列表
  const [userApps, setUserApps] = useState<AppWithContent[]>([])
  // viewer：当前打开的子应用数据（用于弹窗展示）
  const [viewer, setViewer] = useState<{
    title: string
    entry?: string
    html?: string
    css?: string
    js?: string
  } | null>(null)
  // dirInputRef：文件选择 input 的引用，用于设置 webkitdirectory 以便选目录
  const dirInputRef = useRef<HTMLInputElement | null>(null)

  // allApps：合并静态内置应用与用户添加的应用（仅取 meta 用于列表渲染）
  const allApps = useMemo<AppWithContent[]>(() => {
    return [...APPS.map((a) => ({ meta: a })), ...userApps]
  }, [userApps])

  // onAddApp：处理“添加应用”的目录选择事件
  // 步骤：
  // 1. 读取用户选择的目录中的文件列表
  // 2. 将文件名（小写）映射到 File 以便快速查找目标文件
  // 3. 获取必需文件 app.config.json 与 index.html，CSS 可选
  // 4. 异步读取文本；解析 JSON 作为应用元信息；保留 HTML/CSS 文本
  // 5. 更新 userApps 状态，追加新应用
  // 6. 重置 input 的值，允许再次选择相同目录时触发 onChange
  const onAddApp = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files
    if (!files || files.length === 0) return
    // 1. 将文件名（小写）映射到 File 以便快速查找目标文件
    // 2. 将相对路径（包含文件名）映射到 File 以便按相对路径查找
    const { byName, byRel } = buildFileMaps(files)

    const config = byName.get('app.config.json') || byRel.get('app.config.json')
    if (!config) return
    const manifest = JSON.parse(await config.text()) as AppMeta & AppManifest
    // 解析 CSS/JS 路径时，优先按相对路径查找，再按文件名查找

    const meta: AppMeta = {
      id: manifest.id,
      name: manifest.name || 'App',
      version: manifest.version || '0.0.0',
      description: manifest.description || '',
      author: manifest.author,
      tags: manifest.tags,
      icon: manifest.icon,
      entry: manifest.entry
    }
    setUserApps((prev) => [
      ...prev,
      { meta, entry: manifest.entry, upload: { byName, byRel, manifest } }
    ])
    e.target.value = ''
  }

  // openApp：打开子应用（弹窗展示）
  // 若该应用来源于“添加应用”，则从 userApps 中取到对应 HTML/CSS/JS
  // 否则按 apps 目录下的 entry 路径由 SubAppModal 动态解析
  const openItem = async (item: AppWithContent): Promise<void> => {
    if (item.upload) {
      const { byName, byRel, manifest } = item.upload
      const htmlText = await loadHtmlText(byName, byRel, manifest)
      if (!htmlText) return
      const cssText = await loadCssText(byName, byRel, manifest)
      const jsText = await loadJsText(byName, byRel, manifest)
      setViewer({ title: item.meta.name, html: htmlText, css: cssText, js: jsText })
      return
    }

    const entry = (item.entry as string) || 'index.html'
    setViewer({ title: item.meta.name, entry: `apps/${item.meta.id}/${entry}` })
  }

  // 启用目录选择：通过设置非标准属性 webkitdirectory 允许 <input type="file"> 选择目录
  // 注意：TypeScript 无该属性类型声明，因此通过 setAttribute 设置，运行时浏览器会识别
  useEffect(() => {
    if (dirInputRef.current) {
      dirInputRef.current.setAttribute('webkitdirectory', '')
    }
  }, [])

  return (
    <div className="app-store">
      <div className="app-store-header">
        <h1 className="app-store-title">App Store</h1>
        <label className="app-action">
          添加应用
          <input
            ref={dirInputRef}
            type="file"
            multiple
            onChange={onAddApp}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      <div className="app-list">
        {allApps.map((item) => (
          <AppItem key={item.meta.id} app={item.meta} onOpen={() => openItem(item)} />
        ))}
      </div>
      <SubAppModal
        visible={!!viewer}
        title={viewer?.title || ''}
        entry={viewer?.entry}
        html={viewer?.html}
        css={viewer?.css}
        js={viewer?.js}
        onClose={() => setViewer(null)}
      />
    </div>
  )
}
