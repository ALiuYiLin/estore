import { useEffect, useRef } from 'react'

// 组件入参：
// visible：是否显示弹窗
// title：弹窗标题（展示子应用名称）
// html：子应用的 HTML 文本（通常来源于其 index.html）
// css：子应用的 CSS 文本（通常来源于其 index.css）
// onClose：关闭弹窗的回调
interface Props {
  visible: boolean
  title: string
  html?: string
  css?: string
  js?: string
  onClose: () => void
}

export default function SubAppModal({ visible, title, html, css, js, onClose }: Props): React.JSX.Element | null {
  // hostRef：用于挂载 Shadow DOM 的宿主元素引用
  const hostRef = useRef<HTMLDivElement | null>(null)
  // shadowRef：保存已创建的 ShadowRoot 引用，避免重复创建
  const shadowRef = useRef<ShadowRoot | null>(null)
  // 注入子应用核心逻辑：当弹窗可见时，将子应用的 HTML/CSS 注入到 Shadow DOM
  useEffect(() => {
    // 如果不可见，直接跳过
    if (!visible) return
    // 必须确保宿主元素已渲染
    if (!hostRef.current) return
    shadowRef.current = hostRef.current.attachShadow({ mode: 'open' })

    // 取得 ShadowRoot 引用
    const root = shadowRef.current!

    // 清空上一次注入的所有节点，保证干净环境
    while (root.firstChild) root.removeChild(root.firstChild)

    // 先注入样式，确保内容渲染时已有样式生效
    if (css) {
      const styleEl = document.createElement('style')
      styleEl.textContent = css
      root.appendChild(styleEl)
    }

    // 创建一个包裹元素，用于承载解析后的子应用内容
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-subapp', 'true')
    if (html) {
      try {
        // 使用 DOMParser 解析完整 HTML 文本，避免直接插入顶层标签
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        // 仅取 <body> 的内部内容，规避 <!doctype>/<html>/<head> 带来的兼容性问题
        const bodyHTML = doc?.body?.innerHTML ?? html
        // 将解析后的内容写入包裹元素
        wrapper.innerHTML = bodyHTML
      } catch {
        // 解析失败则直接插入原始文本
        wrapper.innerHTML = html
      }
    } else {
      // 没有可显示内容时的占位提示
      wrapper.innerHTML = '<div style="padding:12px;color:#a3a3a3;">暂无可显示的内容</div>'
    }
    // 最后将内容包裹元素挂载到 ShadowRoot
    root.appendChild(wrapper)

    if (js) {
      try {
        const localDocument = {
          getElementById: (id: string) => wrapper.querySelector(`#${id}`),
          querySelector: (sel: string) => wrapper.querySelector(sel),
          querySelectorAll: (sel: string) => wrapper.querySelectorAll(sel)
        } as Document
        const fn = new Function('document', 'window', js)
        fn(localDocument, window)
      } catch (err) {
        const note = document.createElement('div')
        note.textContent = '子应用脚本未执行（可能受 CSP 限制或脚本错误）'
        note.setAttribute('style', 'padding:12px;color:#e67e22;')
        wrapper.appendChild(note)
        console.error(err)
      }
    }
  }, [visible, html, css, js])

  // 组件卸载时清理 ShadowRoot 引用，避免持有过期引用
  useEffect(() => {
    return () => {
      shadowRef.current = null
      hostRef.current = null
    }
  }, [])

  // 当不可见时不渲染任何内容
  if (!visible) return null
  // 弹窗结构：
  // - modal-overlay：遮罩层，点击遮罩关闭弹窗
  // - modal：实际弹窗容器，阻止事件冒泡以避免点击内部也触发关闭
  // - modal-header：标题与关闭按钮
  // - modal-body：内容区域，subapp-host 是 Shadow DOM 的宿主，子应用将注入到其 shadowRoot
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
