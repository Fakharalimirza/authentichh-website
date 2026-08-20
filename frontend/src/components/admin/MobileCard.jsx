import { createElement } from 'react';
import { ChevronRight } from 'lucide-react';
import RowActions from './RowActions';

const ICON_SIZE = 16;

export default function MobileCard({
  image,
  title,
  subtitle,
  meta = [],
  status,
  actions = [],
  actionsMenu,
  onClick,
  className = '',
}) {
  const renderIcon = (icon) => {
    if (icon == null) return null;
    if (typeof icon === 'function') return createElement(icon, { size: ICON_SIZE });
    if (typeof icon === 'object' && icon.$$typeof) return createElement(icon, { size: ICON_SIZE });
    return icon;
  };
  return (
    <div
      className={`mobile-card${className ? ' ' + className : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
    >
      {image && (
        <img
          src={image}
          alt=""
          className="mobile-card-image"
          loading="lazy"
        />
      )}
      <div className="mobile-card-body">
        <div className="mobile-card-title">{title}</div>
        {subtitle && <div className="mobile-card-subtitle">{subtitle}</div>}
        <div className="mobile-card-meta">
          {meta.map((m, i) => (
            <span key={i} className="mobile-card-meta-item">
              {m.label && <>{m.label}: </>}{m.value}
            </span>
          ))}
          {status && (
            <span className={`badge badge-${status.variant || 'default'}`}>
              {status.label}
            </span>
          )}
        </div>
      </div>
      {actionsMenu && actionsMenu.length > 0 && (
        <div className="mobile-card-actions" onClick={(e) => e.stopPropagation()}>
          <RowActions actions={actionsMenu} />
        </div>
      )}
      {!actionsMenu && actions.length > 0 && (
        <div className="mobile-card-actions" onClick={(e) => e.stopPropagation()}>
          {actions.map((action, i) => (
            <button
              key={i}
              type="button"
              className={`btn-icon-only${action.variant === 'danger' ? ' text-error' : ''}`}
              onClick={action.onClick}
              title={action.label}
              aria-label={action.label}
            >
              {renderIcon(action.icon)}
            </button>
          ))}
        </div>
      )}
      {onClick && (!actionsMenu || actionsMenu.length === 0) && actions.length === 0 && (
        <ChevronRight size={18} className="mobile-card-chevron" />
      )}
    </div>
  );
}
