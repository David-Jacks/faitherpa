import React, { useState } from 'react'
import Modal from '../Modal/Modal'
import './AuthModal.css'
import { useNavigate } from 'react-router-dom'

type Props = {
  isOpen: boolean
  onClose: () => void
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [authResult, setAuthResult] = useState<{ token: string; hasConfirmed: boolean } | null>(null)
  const navigate = useNavigate()

  const phoneRegex = /^\+?\d{7,15}$/

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setPhoneError(null)
    setPasswordError(null)

    // normalize phone: allow leading + and digits only
    const cleanedPhone = phone.replace(/[^+\d]/g, '')
    if (!cleanedPhone) {
      setPhoneError('Phone is required')
      return
    }
    if (!phoneRegex.test(cleanedPhone)) {
      setPhoneError('Enter a valid phone (digits, optional leading +)')
      return
    }
    if (!password) {
      setPasswordError('Password is required')
      return
    }

    setLoading(true)
    try {
      const body: any = { password }
      body.phoneNumber = cleanedPhone

      // use axios helper
      const { token, hasConfirmed } = await (await import('../../../frontend_apis')).authenticate(body)
      setAuthResult({ token, hasConfirmed: !!hasConfirmed })
    } catch (err: any) {
      setError(err?.message || 'login_error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Contributor Login" className="rp-modal--form">
      <form className="auth-form" onSubmit={submit}>
        <div className="auth-field">
          <label htmlFor="auth-phone">Phone</label>
          <input
            id="auth-phone"
            name="phoneNumber"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => {
              const v = e.target.value
              // allow digits and leading + only in input
              const cleaned = v.replace(/[^+\d]/g, '')
              setPhone(cleaned)
              if (phoneError) setPhoneError(null)
            }}
            placeholder="+1234567890"
            autoFocus
          />
          {phoneError && <div className="auth-field-error">{phoneError}</div>}
        </div>
        <div className="auth-field">
          <label htmlFor="auth-password">Password</label>
          <div className="rp-password-row">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordError) setPasswordError(null)
              }}
              placeholder="Your password"
            />
            <button
              type="button"
              className="rp-password-toggle"
              onClick={() => setShowPassword(s => !s)}
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {passwordError && <div className="auth-field-error">{passwordError}</div>}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-actions">
          <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          <button type="button" className="btn btn--outline" onClick={onClose}>Cancel</button>
        </div>
      </form>

      {authResult && (
        <div className="rp-form-success" role="status">
          {authResult.hasConfirmed ? (
            <p>Your contribution has been confirmed. You may proceed to view details.</p>
          ) : (
            <p>Your contribution is not yet confirmed. Please wait for confirmation before proceeding.</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button
              type="button"
              className={authResult.hasConfirmed ? 'btn btn--primary' : 'btn btn--outline'}
              onClick={() => {
                if (authResult.hasConfirmed) {
                  try { localStorage.setItem('auth_token', authResult.token) } catch {}
                  onClose()
                  navigate('/contributors')
                } else {
                  setAuthResult(null)
                }
              }}
            >
              {authResult.hasConfirmed ? 'Proceed' : "Don't"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default AuthModal
