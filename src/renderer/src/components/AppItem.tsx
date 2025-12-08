import type { AppMeta } from '../types/app'

interface Props {
  app: AppMeta
  onOpen?: () => void
}

export default function AppItem({ app, onOpen }: Props): React.JSX.Element {
  return (
    <div className="app-item">
      <div className="app-icon">
        {app.icon ? (
          <img src={app.icon} alt={app.name} />
        ) : (
          <div className="app-icon--placeholder" />
        )}
      </div>
      <div className="app-meta">
        <div className="app-title">
          <span className="app-name">{app.name}</span>
          <span className="app-version">{app.version}</span>
        </div>
        <div className="app-desc">{app.description}</div>
        {app.tags && app.tags.length > 0 && (
          <div className="app-tags">
            {app.tags.map((t) => (
              <span key={t} className="app-tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="app-actions">
        <button className="app-action" onClick={onOpen}>
          打开
        </button>
      </div>
    </div>
  )
}
