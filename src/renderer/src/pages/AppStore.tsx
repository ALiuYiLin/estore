import { useEffect, useMemo, useRef, useState } from 'react'
import { APPS } from '../data/apps'
import AppItem from '../components/AppItem'
import SubAppModal from '../components/SubAppModal'
import type { AppMeta } from '../types/app'

// LoadedApp：表示已添加到主应用中的子应用数据
// - meta：来自 app.config.json 的应用元信息
// - html：子应用的 HTML 文本（通常是 index.html 的内容）
// - css：子应用的 CSS 文本（通常是 index.css 的内容）
type LoadedApp = {
  meta: AppMeta
  html?: string
  css?: string
  js?: string
}

export default function AppStore(): React.JSX.Element {
  // userApps：用户通过“添加应用”导入的子应用列表
  const [userApps, setUserApps] = useState<LoadedApp[]>([])
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
  const allApps = useMemo<AppMeta[]>(() => {
    return [...APPS, ...userApps.map((u) => u.meta)]
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
    const byName = new Map<string, File>()
    const byRel = new Map<string, File>()
    for (const f of Array.from(files)) {
      byName.set(f.name.toLowerCase(), f)
      const rel = (
        f as unknown as { webkitRelativePath?: string }
      ).webkitRelativePath?.toLowerCase()
      if (rel) byRel.set(rel, f)
    }

    const config = byName.get('app.config.json') || byRel.get('app.config.json')
    if (!config) return
    const manifest = JSON.parse(await config.text()) as Partial<AppMeta> & {
      entry?: string
      html?: string
      css?: string | string[]
      js?: string | string[]
    }

    const resolveFile = (p?: string): File | undefined => {
      if (!p) return undefined
      const norm = p.toLowerCase()
      const base = norm.split(/[/\\]/).pop() || norm
      return byRel.get(norm) || byName.get(base)
    }

    const htmlFile =
      resolveFile(manifest.entry) || resolveFile(manifest.html) || byName.get('index.html')
    if (!htmlFile) return
    const htmlText = await htmlFile.text()

    const cssFiles: File[] = []
    if (Array.isArray(manifest.css)) {
      for (const p of manifest.css) {
        const f = resolveFile(p)
        if (f) cssFiles.push(f)
      }
    } else {
      const f = resolveFile(manifest.css) || byName.get('index.css')
      if (f) cssFiles.push(f)
    }
    const cssText = cssFiles.length
      ? (await Promise.all(cssFiles.map((f) => f.text()))).join('\n')
      : undefined

    const jsFiles: File[] = []
    if (Array.isArray(manifest.js)) {
      for (const p of manifest.js) {
        const f = resolveFile(p)
        if (f) jsFiles.push(f)
      }
    } else {
      const f = resolveFile(manifest.js) || byName.get('index.js')
      if (f) jsFiles.push(f)
    }
    const jsText = jsFiles.length
      ? (await Promise.all(jsFiles.map((f) => f.text()))).join('\n;')
      : undefined

    const meta: AppMeta = {
      id: manifest.id as string,
      name: (manifest.name as string) || 'App',
      version: (manifest.version as string) || '0.0.0',
      description: (manifest.description as string) || '',
      author: manifest.author,
      tags: manifest.tags,
      icon: manifest.icon
    }
    setUserApps((prev) => [...prev, { meta, html: htmlText, css: cssText, js: jsText }])
    e.target.value = ''
  }

  // openApp：打开子应用（弹窗展示）
  // 若该应用来源于“添加应用”，则从 userApps 中取到对应 HTML/CSS/JS
  // 否则按 apps 目录下的 entry 路径由 SubAppModal 动态解析
  const openApp = (meta: AppMeta): void => {
    const loaded = userApps.find((u) => u.meta.id === meta.id)
    if (loaded) {
      setViewer({ title: loaded.meta.name, html: loaded.html, css: loaded.css, js: loaded.js })
    } else {
      const entry = (meta as unknown as { entry?: string }).entry || 'index.html'
      setViewer({ title: meta.name, entry: `apps/${meta.id}/${entry}` })
    }
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
        {allApps.map((app) => (
          <AppItem key={app.id} app={app} onOpen={() => openApp(app)} />
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
