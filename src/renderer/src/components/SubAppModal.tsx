import { useRef } from 'react'
import { useSubApp } from '../hooks/use-subapp'

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
  useSubApp({ visible, entry, html, css, js, host: hostRef.current })

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
