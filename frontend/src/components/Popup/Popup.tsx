import React from 'react'
import './Popup.css'

type Button = { label: string; onClick: () => void; variant?: 'primary' | 'secondary' }

type Props = {
  heading: string
  body: React.ReactNode
  buttons?: Button[]
}

const Popup: React.FC<Props> = ({ heading, body, buttons = [] }) => {
  return (
    <div className="rp-popup-overlay" role="dialog" aria-modal="true">
      <div className="rp-popup-card">
        <header className="rp-popup-header">
          <h3>{heading}</h3>
        </header>
        <div className="rp-popup-body">{body}</div>
        <div className="rp-popup-actions">
          {buttons.map((b, i) => (
            <button
              key={i}
              type="button"
              className={`btn ${b.variant === 'primary' ? 'btn--primary' : 'btn--outline'}`}
              onClick={b.onClick}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Popup
