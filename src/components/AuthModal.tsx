import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

interface AuthModalProps {
  onClose: () => void
}

function AuthModal({ onClose }: AuthModalProps) {
  const { signUp, signIn } = useAuth()
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signUp')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = mode === 'signUp' ? await signUp(email, password, username) : await signIn(email, password)

    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (mode === 'signUp') {
      // If email confirmation is on, there's no session yet - let the person know to check their inbox.
      setConfirmationSent(true)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">
            {mode === 'signUp' ? 'Create account' : 'Sign in'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink/40 hover:text-ink"
          >
            ✕
          </button>
        </div>

        {confirmationSent ? (
          <div className="mt-4 text-sm text-ink/70">
            <p>Check your email to confirm your account, then sign in.</p>
            <button
              type="button"
              onClick={() => {
                setConfirmationSent(false)
                setMode('signIn')
              }}
              className="mt-4 w-full rounded-lg border border-accent bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
            {mode === 'signUp' && (
              <div>
                <label className="text-xs font-medium text-ink/60" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  minLength={3}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-grid/30 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                  placeholder="e.g. sudoku_master"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-ink/60" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-grid/30 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-ink/60" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-grid/30 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
                placeholder="At least 6 characters"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded-lg border border-accent bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting ? 'Please wait…' : mode === 'signUp' ? 'Create account' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signUp' ? 'signIn' : 'signUp')
                setError(null)
              }}
              className="text-center text-sm text-ink/60 underline underline-offset-4 hover:text-accent"
            >
              {mode === 'signUp' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default AuthModal