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
  const [viewer, setViewer] = useState<{ title: string; html?: string; css?: string; js?: string } | null>(null)
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
    // FileList：目录选择得到的文件集合
    const files = e.target.files
    // 若没有选择文件则直接返回
    if (!files || files.length === 0) return
    // 构建名称到 File 的映射（统一小写）
    const map = new Map<string, File>()
    for (const f of Array.from(files)) {
      map.set(f.name.toLowerCase(), f)
    }

    // 获取目标文件：配置、HTML、CSS（CSS 可选）
    const config = map.get('app.config.json')
    const html = map.get('index.html')
    const css = map.get('index.css')
    const js = map.get('index.js')

    // 缺少必需文件时直接返回，保护主流程
    if (!config || !html) return

    // 解析配置 JSON（允许可选 entry 字段）
    const cfg = JSON.parse(await config.text()) as AppMeta & { entry?: string }
    // 读取 HTML 文本
    const htmlText = await html.text()
    // 若存在 CSS 文件则读取文本，否则保持 undefined
    const cssText = css ? await css.text() : undefined
    const jsText = js ? await js.text() : undefined

    // 将新应用追加到列表，保存元信息与 HTML/CSS 内容
    setUserApps((prev) => [...prev, { meta: cfg, html: htmlText, css: cssText, js: jsText }])
    // 清空 input 的值，确保下次选择相同目录也能触发 onChange
    e.target.value = ''
  }

  // openApp：打开子应用（弹窗展示）
  // 若该应用来源于“添加应用”，则从 userApps 中取到对应 HTML/CSS；否则仅展示标题
  const openApp = (meta: AppMeta): void => {
    console.log('meta: ', meta);
    const loaded = userApps.find((u) => u.meta.id === meta.id)
    if (loaded) {
      setViewer({ title: loaded.meta.name, html: loaded.html, css: loaded.css, js: loaded.js })
    } else {
      setViewer({ title: meta.name })
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
        html={viewer?.html}
        css={viewer?.css}
        js={viewer?.js}
        onClose={() => setViewer(null)}
      />
    </div>
  )
}
