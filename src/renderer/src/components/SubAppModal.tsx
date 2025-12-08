import { useEffect, useRef } from 'react'

interface Props {
  visible: boolean
  title: string
  html?: string
  css?: string
  onClose: () => void
}

export default function SubAppModal({ visible, title, html, css, onClose }: Props): React.JSX.Element | null {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const shadowRef = useRef<ShadowRoot | null>(null)

  useEffect(() => {
    if (!visible) return
    if (!hostRef.current) return
    if (!shadowRef.current) {
      shadowRef.current = hostRef.current.attachShadow({ mode: 'open' })
    }

    const root = shadowRef.current!

    while (root.firstChild) root.removeChild(root.firstChild)

    if (css) {
      const styleEl = document.createElement('style')
      styleEl.textContent = css
      root.appendChild(styleEl)
    }

    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-subapp', 'true')
    if (html) {
      try {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const bodyHTML = doc?.body?.innerHTML ?? html
        wrapper.innerHTML = bodyHTML
      } catch {
        wrapper.innerHTML = html
      }
    } else {
      wrapper.innerHTML = '<div style="padding:12px;color:#a3a3a3;">暂无可显示的内容</div>'
    }
    root.appendChild(wrapper)
  }, [visible, html, css])

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
