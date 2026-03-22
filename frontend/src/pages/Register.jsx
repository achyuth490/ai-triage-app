import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    age: '', gender: '', conditions: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = (e) => {
    e.preventDefault()
    setError('')

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.find(u => u.email === form.email)) {
      setError('Email already registered!')
      return
    }

    const newUser = { ...form, triageHistory: [] }
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    localStorage.setItem('user', JSON.stringify(newUser))
    window.location.href = '/dashboard'
  }

  return (
    <div className="auth-bg">
      <div className="auth-card wide">
        <div className="auth-logo">⚕️</div>
        <h1 className="auth-title">MedTriage <span>AI</span></h1>
        <p className="auth-subtitle">Create your account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" placeholder="Your name" value={form.name} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input name="age" type="number" placeholder="25" value={form.age} onChange={handle} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handle} required />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handle} required>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
          </div>
          <div className="form-group">
            <label>Known Medical Conditions <span style={{opacity:0.5}}>(optional)</span></label>
            <input name="conditions" placeholder="e.g. Diabetes, Hypertension" value={form.conditions} onChange={handle} />
          </div>
          <button type="submit" className="auth-btn">Create Account →</button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}