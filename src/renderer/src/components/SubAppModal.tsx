import { useEffect, useRef } from 'react'
import { fetchEntryResources, renderSubApp } from '../utils/subapp'

interface Props {
  visible: boolean
  title: string
  entry?: string
  html?: string
  css?: string
  js?: string
  onClose: () => void
}

export default function SubAppModal({
  visible,
  title,
  entry,
  html,
  css,
  js,
  onClose
}: Props): React.JSX.Element | null {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const shadowRef = useRef<ShadowRoot | null>(null)

  useEffect(() => {
    if (!visible) return
    const host = hostRef.current
    if (!host) return

    const fetchEntry = async (): Promise<{ htmlText: string; cssText: string; jsText: string }> => {
      return fetchEntryResources({ entry, html, css, js })
    }

    const run = async (): Promise<void> => {
      const res = await fetchEntry()
      renderSubApp(host, { entry, html, css, js }, res)
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
