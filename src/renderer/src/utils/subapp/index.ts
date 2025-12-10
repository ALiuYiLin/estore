import { runInSandbox } from '../sandbox'

export type EntryResult = { htmlText: string; cssText: string; jsText: string }
export type EntryOpts = { entry?: string; html?: string; css?: string; js?: string }

export async function fetchEntryResources(opts: EntryOpts): Promise<EntryResult> {
  const { entry, html, css, js } = opts
  const api = (
    window as unknown as {
      api?: {
        readText: (p: string) => Promise<string>
        join: (...parts: string[]) => Promise<string>
      }
    }
  ).api
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
  const links = Array.from(
    tmpDoc.querySelectorAll('link[rel="stylesheet"][href]')
  ) as HTMLLinkElement[]
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
  return {
    htmlText: tmpDoc.body.innerHTML,
    cssText: cssTexts.join('\n'),
    jsText: jsTexts.join('\n;')
  }
}

export function renderSubApp(host: HTMLElement, opts: EntryOpts, res: EntryResult): void {
  const root = host.attachShadow({ mode: 'open' })
  while (root.firstChild) root.removeChild(root.firstChild)
  const cssText = res.cssText || opts.css || ''
  if (cssText) {
    const styleEl = document.createElement('style')
    styleEl.textContent = cssText
    root.appendChild(styleEl)
  }
  const wrapper = document.createElement('div')
  wrapper.setAttribute('data-subapp', 'true')
  const finalHTML = opts.entry ? res.htmlText : opts.html || ''
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
  const code = opts.entry ? res.jsText : opts.js
  runInSandbox(wrapper, code)
}
