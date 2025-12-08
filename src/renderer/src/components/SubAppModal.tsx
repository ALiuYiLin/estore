import { useEffect, useRef } from 'react'

interface Props {
  visible: boolean
  title: string
  entry?: string
  html?: string
  css?: string
  js?: string
  onClose: () => void
}

type DocLike = {
  getElementById: Document['getElementById']
  querySelector: Document['querySelector']
  querySelectorAll: Document['querySelectorAll']
  createElement: Document['createElement']
}
type WinLike = {
  console: Console
  setTimeout: Window['setTimeout']
  clearTimeout: Window['clearTimeout']
  setInterval: Window['setInterval']
  clearInterval: Window['clearInterval']
}

export default function SubAppModal({ visible, title, entry, html, css, js, onClose }: Props): React.JSX.Element | null {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const shadowRef = useRef<ShadowRoot | null>(null)

  useEffect(() => {
    if (!visible) return
    const host = hostRef.current
    if (!host) return

    interface AppAPI { readText: (p: string) => Promise<string>; join: (...parts: string[]) => Promise<string>; exists: (p: string) => Promise<boolean> }
    const api = (window as unknown as { api?: AppAPI }).api
    const readText = api?.readText
    const joinPath = api?.join

    const fetchEntry = async (): Promise<{ htmlText: string; cssText: string; jsText: string }> => {
      if (!entry || !readText || !joinPath) return { htmlText: html || '', cssText: css || '', jsText: js || '' }
      const htmlRaw = await readText(entry)
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlRaw, 'text/html')
      const bodyHTML = doc?.body?.innerHTML || ''

      const entryParts = entry.split(/\\|\//)
      entryParts.pop()
      const baseDir = await joinPath(...entryParts)

      const cssTexts: string[] = []
      const jsTexts: string[] = []

      const tmpDoc = parser.parseFromString(bodyHTML, 'text/html')
      const links = Array.from(tmpDoc.querySelectorAll('link[rel="stylesheet"][href]')) as HTMLLinkElement[]
      const styles = Array.from(tmpDoc.querySelectorAll('style')) as HTMLStyleElement[]
      const scripts = Array.from(tmpDoc.querySelectorAll('script')) as HTMLScriptElement[]

      for (const l of links) {
        const href = l.getAttribute('href') || ''
        const p = await joinPath(baseDir, href)
        try { cssTexts.push(await readText(p)) } catch { console.warn('read css failed', p) }
        l.remove()
      }
      for (const s of styles) { if (s.textContent) cssTexts.push(s.textContent); s.remove() }
      for (const s of scripts) {
        const src = s.getAttribute('src')
        if (src) {
          const p = await joinPath(baseDir, src)
          try { jsTexts.push(await readText(p)) } catch { console.warn('read js failed', p) }
        } else if (s.textContent) {
          jsTexts.push(s.textContent)
        }
        s.remove()
      }

      return { htmlText: tmpDoc.body.innerHTML, cssText: cssTexts.join('\n'), jsText: jsTexts.join('\n;') }
    }

    const run = async (): Promise<void> => {
      const { htmlText, cssText, jsText } = await fetchEntry()

      shadowRef.current = host.attachShadow({ mode: 'open' })
      const root = shadowRef.current!

      while (root.firstChild) root.removeChild(root.firstChild)

      if (cssText || css) {
        const styleEl = document.createElement('style')
        styleEl.textContent = cssText || css || ''
        root.appendChild(styleEl)
      }

      const wrapper = document.createElement('div')
      wrapper.setAttribute('data-subapp', 'true')

      const finalHTML = entry ? htmlText : (html || '')
      if (finalHTML) {
        try {
          const parser = new DOMParser()
          const doc = parser.parseFromString(finalHTML, 'text/html')
          const bodyHTML = doc?.body?.innerHTML ?? finalHTML
          wrapper.innerHTML = bodyHTML
        } catch {
          wrapper.innerHTML = finalHTML
        }
      } else {
        wrapper.innerHTML = '<div style="padding:12px;color:#a3a3a3;">暂无可显示的内容</div>'
      }

      root.appendChild(wrapper)

      const toRun = entry ? jsText : js
      if (toRun) {
        try {
          const documentProxy: DocLike = {
            getElementById: (id: string) => wrapper.querySelector(`#${id}`),
            querySelector: (sel: string) => wrapper.querySelector(sel),
            querySelectorAll: (sel: string) => wrapper.querySelectorAll(sel),
          createElement: document.createElement.bind(document)
          }
          const windowProxy: WinLike = {
            console,
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval
          }
          const fn = new Function('window', 'document', toRun as string)
          fn.call(windowProxy, windowProxy, documentProxy)
        } catch (err) {
          const note = document.createElement('div')
          note.textContent = '脚本未执行（可能受 CSP 限制或脚本错误）'
          note.setAttribute('style', 'padding:12px;color:#e67e22;')
          wrapper.appendChild(note)
          console.error(err)
        }
      }
    }

    run()
  }, [visible, html, css, js, entry])

  useEffect(() => {
    return () => {
      shadowRef.current = null
    }
  }, [])

  if (!visible) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="modal-body">
          <div className="subapp-host" ref={hostRef} />
        </div>
      </div>
    </div>
  )
}
