import { useEffect } from 'react'
import { runInSandbox } from '../../utils/sandbox'

type Options = {
  visible: boolean
  entry?: string
  html?: string
  css?: string
  js?: string
  host: HTMLElement | null
}

export function useSubApp({ visible, entry, html, css, js, host }: Options): void {
  useEffect(() => {
    if (!visible) return
    if (!host) return

    const api = (window as unknown as {
      api?: {
        readText: (p: string) => Promise<string>
        join: (...parts: string[]) => Promise<string>
      }
    }).api

    const fetchEntry = async (): Promise<{ htmlText: string; cssText: string; jsText: string }> => {
      if (!entry || !api) return { htmlText: html || '', cssText: css || '', jsText: js || '' }
      const htmlRaw = await api.readText(entry)
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlRaw, 'text/html')
      const bodyHTML = doc?.body?.innerHTML || ''

      const parts = entry.split(/\\|\//)
      parts.pop()
      const baseDir = await api.join(...parts)

      const cssTexts: string[] = []
      const jsTexts: string[] = []

      const tmpDoc = parser.parseFromString(bodyHTML, 'text/html')
      const links = Array.from(tmpDoc.querySelectorAll('link[rel="stylesheet"][href]')) as HTMLLinkElement[]
      const styles = Array.from(tmpDoc.querySelectorAll('style')) as HTMLStyleElement[]
      const scripts = Array.from(tmpDoc.querySelectorAll('script')) as HTMLScriptElement[]

      for (const l of links) {
        const href = l.getAttribute('href') || ''
        const p = await api.join(baseDir, href)
        try {
          cssTexts.push(await api.readText(p))
        } catch {
          /* noop */
        }
        l.remove()
      }

      for (const s of styles) {
        if (s.textContent) cssTexts.push(s.textContent)
        s.remove()
      }

      for (const s of scripts) {
        const src = s.getAttribute('src')
        if (src) {
          const p = await api.join(baseDir, src)
          try {
            jsTexts.push(await api.readText(p))
          } catch {
            /* noop */
          }
        } else if (s.textContent) {
          jsTexts.push(s.textContent)
        }
        s.remove()
      }

      return { htmlText: tmpDoc.body.innerHTML, cssText: cssTexts.join('\n'), jsText: jsTexts.join('\n;') }
    }

    const run = async (): Promise<void> => {
      const { htmlText, cssText, jsText } = await fetchEntry()

      const root = host.attachShadow({ mode: 'open' })
      while (root.firstChild) root.removeChild(root.firstChild)

      if (cssText || css) {
        const styleEl = document.createElement('style')
        styleEl.textContent = cssText || css || ''
        root.appendChild(styleEl)
      }

      const wrapper = document.createElement('div')
      wrapper.setAttribute('data-subapp', 'true')
      const finalHTML = entry ? htmlText : html || ''
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

      const code = entry ? jsText : js
      runInSandbox(wrapper, code)
    }

    run()
  }, [visible, entry, html, css, js, host])
}

