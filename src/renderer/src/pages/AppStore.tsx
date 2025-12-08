import { useEffect, useMemo, useRef, useState } from 'react'
import { APPS } from '../data/apps'
import AppItem from '../components/AppItem'
import SubAppModal from '../components/SubAppModal'
import type { AppMeta } from '../types/app'

type LoadedApp = {
  meta: AppMeta
  html?: string
  css?: string
}

export default function AppStore(): React.JSX.Element {
  const [userApps, setUserApps] = useState<LoadedApp[]>([])
  const [viewer, setViewer] = useState<{ title: string; html?: string; css?: string } | null>(null)
  const dirInputRef = useRef<HTMLInputElement | null>(null)

  const allApps = useMemo<AppMeta[]>(() => {
    return [...APPS, ...userApps.map((u) => u.meta)]
  }, [userApps])

  const onAddApp = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const map = new Map<string, File>()
    for (const f of Array.from(files)) {
      map.set(f.name.toLowerCase(), f)
    }

    const config = map.get('app.config.json')
    const html = map.get('index.html')
    const css = map.get('index.css')

    if (!config || !html) return

    const cfg = JSON.parse(await config.text()) as AppMeta & { entry?: string }
    const htmlText = await html.text()
    const cssText = css ? await css.text() : undefined

    setUserApps((prev) => [...prev, { meta: cfg, html: htmlText, css: cssText }])
    e.target.value = ''
  }

  const openApp = (meta: AppMeta): void => {
    const loaded = userApps.find((u) => u.meta.id === meta.id)
    if (loaded) {
      setViewer({ title: loaded.meta.name, html: loaded.html, css: loaded.css })
    } else {
      setViewer({ title: meta.name })
    }
  }

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
          <input ref={dirInputRef} type="file" multiple onChange={onAddApp} style={{ display: 'none' }} />
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
        onClose={() => setViewer(null)}
      />
    </div>
  )
}
