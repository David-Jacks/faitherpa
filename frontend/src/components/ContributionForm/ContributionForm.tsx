import React, { useState } from 'react'
import './ContributionForm.css'
import { createContribution, notifyFormspree } from '../../../frontend_apis'

type Props = {
  onClose: () => void
}

const ContributionForm: React.FC<Props> = ({ onClose }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isRepayable, setIsRepayable] = useState(false)
  const [amount, setAmount] = useState('')
  const [visibility, setVisibility] = useState<'open' | 'secret'>('open')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const validateEmail = (v: string) => /\S+@\S+\.\S+/.test(v)
  const validatePhone = (v: string) => /^\+?\d{7,15}$/.test(v)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    const amt = parseFloat(amount as any)
    const errors: Record<string, string> = {}
    if (isNaN(amt) || amt <= 0) errors.amount = 'Enter a valid amount greater than 0'
    if (visibility === 'open' && !name) errors.name = 'Name is required when contribution is open'
    if (email && !validateEmail(email)) errors.email = 'Enter a valid email address'
    if (phoneNumber && !validatePhone(phoneNumber)) errors.phoneNumber = 'Enter a valid phone (digits, optional leading +)'
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      setError(Object.values(errors)[0])
      return
    }
    setLoading(true)
    try {
      const payload = {
        name: name || null,
        email: email || null,
        phoneNumber: phoneNumber || null,
        password: password || null,
        amount: amt,
        isAnonymous: visibility === 'secret',
        isRepayable: isRepayable,
        note: note || null,
      }

      await createContribution(payload as any)

      // Send a copy of the submission to Formspree so you receive an email notification.
      // This is non-blocking: any Formspree failure should not prevent the normal flow.
      notifyFormspree({
        name: payload.name,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        amount: payload.amount,
        isRepayable: payload.isRepayable,
        isAnonymous: payload.isAnonymous,
        note: payload.note,
        _replyto: payload.email || undefined,
        _subject: 'New contribution received'
      }).catch(err => {
        // Do not block main flow if Formspree fails; log to console for debugging
        // eslint-disable-next-line no-console
        console.warn('Formspree notify failed', err)
      })

      setSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Submission error')
      setLoading(false)
    }
  }

  return (
    <form className="rp-contrib-form" onSubmit={submit}>
      <fieldset className="rp-fieldset">
        <legend>Contributor details</legend>
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" />
          {fieldErrors.name && <small className="rp-field-error">{fieldErrors.name}</small>}
        </label>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
          {fieldErrors.email && <small className="rp-field-error">{fieldErrors.email}</small>}
        </label>
        <label>
          Phone
          <input
            value={phoneNumber}
            onChange={e => {
              // allow digits and leading + only
              const v = e.target.value
              const cleaned = v.replace(/[^+\d]/g, '')
              setPhoneNumber(cleaned)
            }}
            placeholder="Optional (e.g. +1234567890)"
            inputMode="tel"
            type="tel"
          />
          {fieldErrors.phoneNumber && <small className="rp-field-error">{fieldErrors.phoneNumber}</small>}
        </label>
        <label>
          Password
          <div className="rp-password-row">
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Optional"
              type={showPassword ? 'text' : 'password'}
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
        </label>
      </fieldset>

      <fieldset className="rp-fieldset">
        <legend>Contribution</legend>
        <label>
          Amount (GBP)
          <input
            value={amount}
            onChange={e => {
              // allow digits and decimal point, prevent multiple dots
              let v = e.target.value.replace(/[^\d.]/g, '')
              const parts = v.split('.')
              if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('')
              setAmount(v)
            }}
            placeholder="50"
            inputMode="decimal"
            type="number"
            step="0.01"
            min="0.01"
          />
          {fieldErrors.amount && <small className="rp-field-error">{fieldErrors.amount}</small>}
        </label>
        <label>
          Allow contribution visibility
          <select value={visibility} onChange={e => setVisibility(e.target.value as 'open' | 'secret')}>
            <option value="open">Allow contribution to be open (show my name)</option>
            <option value="secret">Allow contribution to be secret (keep me anonymous)</option>
          </select>
        </label>
        <label>
          Contribution type
          <select value={isRepayable ? 'repay' : 'gift'} onChange={e => setIsRepayable(e.target.value === 'repay')}>
            <option value="gift">Gift (no repayment expected)</option>
            <option value="repay">Repayable (should be paid back)</option>
          </select>
        </label>
        <label>
          Note (optional - not more that 20 words)
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} />
        </label>
      </fieldset>

      {error && <div className="rp-form-error">{error}</div>}
      {success && (
        <div className="rp-form-success" role="status">
          <p>Thank you — your contribution was received.</p>
          <p><strong>David Jackson will contact you to process payment and confirm the contribution.</strong></p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button type="button" className="btn btn--primary" onClick={onClose}>Done</button>
          </div>
        </div>
      )}

      <div className="rp-form-actions">
        <button type="button" className="btn btn--outline" onClick={onClose} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn--primary btn--large" disabled={loading}>
          {loading ? 'Sending…' : 'Submit Contribution'}
        </button>
      </div>
    </form>
  )
}

export default ContributionForm
