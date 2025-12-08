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

export function runInSandbox(wrapper: HTMLElement, code?: string): void {
  if (!code) return
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
    const fn = new Function('window', 'document', code)
    fn.call(windowProxy, windowProxy, documentProxy)
  } catch (err) {
    const note = document.createElement('div')
    note.textContent = '脚本未执行（可能受 CSP 限制或脚本错误）'
    note.setAttribute('style', 'padding:12px;color:#e67e22;')
    wrapper.appendChild(note)
    console.error(err)
  }
}

