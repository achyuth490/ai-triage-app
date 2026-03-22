import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const found = users.find(u => u.email === email && u.password === password)

    if (!found) {
      setError('Invalid email or password!')
      return
    }

    localStorage.setItem('user', JSON.stringify(found))
    window.location.href = '/dashboard'
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">⚕️</div>
        <h1 className="auth-title">MedTriage <span>AI</span></h1>
        <p className="auth-subtitle">Sign in to your account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-btn">Sign In →</button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}