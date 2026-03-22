import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
export default function Dashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!user) { navigate('/login'); return null }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const history = user.triageHistory || []

  const urgencyConfig = {
    HOME_CARE: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: '🏠', label: 'Manage at Home' },
    SEE_DOCTOR_THIS_WEEK: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', icon: '📅', label: 'See Doctor This Week' },
    SEE_DOCTOR_TODAY: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', icon: '🏥', label: 'See Doctor Today' },
    GO_TO_EMERGENCY: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: '🚨', label: 'Go to Emergency' },
  }

  const [selectedReport, setSelectedReport] = useState(null)

  return (
    <div className="dash-bg">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">⚕️ MedTriage<span>AI</span></div>
        <nav>
          <div className="nav-item active">🏠 Dashboard</div>
          <div className="nav-item" onClick={() => navigate('/chat')}>💬 New Triage</div>
        </nav>
        <div className="sidebar-bottom">
          <div className="nav-item logout" onClick={handleLogout}>🚪 Logout</div>
        </div>
      </div>

      {/* Main */}
      <div className="dash-main">

        {/* Header */}
        <div className="dash-header">
          <div>
            <h1>Welcome back, {user.name}! 👋</h1>
            <p>Here's your health overview</p>
          </div>
          <button className="new-triage-btn" onClick={() => navigate('/chat')}>
            + New Triage
          </button>
        </div>

        {/* Profile + Stats */}
        <div className="dash-grid">
          <div className="card profile-card">
            <div className="card-title">👤 Your Profile</div>
            <div className="profile-info">
              <div className="profile-avatar">{user.name[0].toUpperCase()}</div>
              <div>
                <div className="profile-name">{user.name}</div>
                <div className="profile-email">{user.email}</div>
              </div>
            </div>
            <div className="profile-details">
              <div className="detail-item">
                <span className="detail-label">Age</span>
                <span className="detail-value">{user.age} years</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{user.gender}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Conditions</span>
                <span className="detail-value">{user.conditions || 'None listed'}</span>
              </div>
            </div>
          </div>

          <div className="card stats-card">
            <div className="card-title">📊 Triage Summary</div>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-number">{history.length}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
              <div className="stat-box green">
                <div className="stat-number">{history.filter(h => h.urgency === 'HOME_CARE').length}</div>
                <div className="stat-label">Home Care</div>
              </div>
              <div className="stat-box yellow">
                <div className="stat-number">{history.filter(h => h.urgency === 'SEE_DOCTOR_THIS_WEEK' || h.urgency === 'SEE_DOCTOR_TODAY').length}</div>
                <div className="stat-label">Doctor Visits</div>
              </div>
              <div className="stat-box red">
                <div className="stat-number">{history.filter(h => h.urgency === 'GO_TO_EMERGENCY').length}</div>
                <div className="stat-label">Emergencies</div>
              </div>
            </div>
          </div>
        </div>

        {/* Triage History */}
        <div className="card history-card">
          <div className="card-title">🕐 Recent Triage History <span style={{fontSize:11, opacity:0.5, fontWeight:400}}>(click any to see full report)</span></div>
          {history.length === 0 ? (
            <div className="empty-history">
              <div style={{fontSize: 40, marginBottom: 12}}>🩺</div>
              <p>No triage sessions yet</p>
              <button className="new-triage-btn" onClick={() => navigate('/chat')}>Start Your First Triage</button>
            </div>
          ) : (
            <div className="history-list">
              {history.slice().reverse().map((h, i) => {
                const cfg = urgencyConfig[h.urgency] || urgencyConfig.HOME_CARE
                return (
                  <div key={i} className="history-item" onClick={() => setSelectedReport(selectedReport === i ? null : i)}
                    style={{ cursor: 'pointer' }}>
                    <div className="history-dot" style={{background: cfg.color}}></div>
                    <div className="history-content">
                      <div className="history-symptom">{h.symptom}</div>
                      <div className="history-date">{h.date}</div>
                    </div>
                    <div className="history-badge" style={{background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`}}>
                      {cfg.icon} {cfg.label}
                    </div>
                    <div style={{color: 'rgba(255,255,255,0.3)', fontSize: 12}}>
                      {selectedReport === i ? '▲' : '▼'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Expanded Report */}
        {selectedReport !== null && history.slice().reverse()[selectedReport] && (() => {
          const h = history.slice().reverse()[selectedReport]
          const cfg = urgencyConfig[h.urgency] || urgencyConfig.HOME_CARE
          const td = h.triageData
          return (
            <div className="card report-expanded" style={{border: `2px solid ${cfg.border}`, background: cfg.bg}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                <div className="card-title" style={{color: cfg.color, margin:0}}>📋 Full Triage Report</div>
                <div style={{display:'flex', gap:8}}>
                  <button onClick={() => window.print()} style={{
                    background: cfg.bg, border: `1px solid ${cfg.border}`,
                    borderRadius:8, padding:'6px 14px', color: cfg.color,
                    cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit'
                  }}>🖨️ Print</button>
                  <button onClick={() => setSelectedReport(null)} style={{
                    background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)',
                    borderRadius:8, padding:'6px 14px', color:'#fff',
                    cursor:'pointer', fontSize:13, fontFamily:'inherit'
                  }}>✕ Close</button>
                </div>
              </div>

              {/* Patient Info */}
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:10, marginBottom:16}}>
                {[
                  {label:'Patient', value: user.name},
                  {label:'Age', value: user.age + ' years'},
                  {label:'Gender', value: user.gender},
                  {label:'Date', value: h.date},
                ].map((item, i) => (
                  <div key={i} style={{background:'rgba(0,0,0,0.15)', borderRadius:10, padding:'10px 14px'}}>
                    <div style={{fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:3}}>{item.label}</div>
                    <div style={{fontSize:13, fontWeight:700, color:'#fff'}}>{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Urgency */}
              <div style={{background:'rgba(0,0,0,0.15)', borderRadius:12, padding:'14px 18px', marginBottom:14}}>
                <div style={{fontSize:11, color: cfg.color, fontWeight:700, letterSpacing:1, marginBottom:6}}>URGENCY LEVEL</div>
                <div style={{fontSize:20, fontWeight:800, color: cfg.color}}>{cfg.icon} {cfg.label}</div>
              </div>

              {td && (
                <>
                  {td.summary && (
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:700, marginBottom:6}}>SUMMARY</div>
                      <p style={{color:'rgba(255,255,255,0.85)', fontSize:14, lineHeight:1.7, margin:0}}>{td.summary}</p>
                    </div>
                  )}
                  {td.reasoning && (
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:700, marginBottom:6}}>CLINICAL REASONING</div>
                      <p style={{color:'rgba(255,255,255,0.75)', fontSize:13, lineHeight:1.6, margin:0}}>{td.reasoning}</p>
                    </div>
                  )}
                  {td.watchFor && (
                    <div style={{marginBottom:14}}>
                      <div style={{fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:700, marginBottom:8}}>⚠️ WATCH FOR</div>
                      <div style={{display:'flex', flexWrap:'wrap', gap:6}}>
                        {td.watchFor.split(',').map((w, i) => (
                          <span key={i} style={{
                            background:'rgba(0,0,0,0.2)', border:`1px solid ${cfg.border}`,
                            borderRadius:20, padding:'4px 12px', fontSize:12, color:'#fff'
                          }}>{w.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {td.action && (
                    <div style={{background:'rgba(0,0,0,0.15)', borderRadius:10, padding:'12px 16px'}}>
                      <div style={{fontSize:11, color: cfg.color, fontWeight:700, marginBottom:6}}>✅ RECOMMENDED ACTION</div>
                      <p style={{color:'#fff', fontSize:13, margin:0, lineHeight:1.6}}>{td.action}</p>
                    </div>
                  )}
                </>
              )}

              <div style={{marginTop:16, fontSize:11, color:'rgba(255,255,255,0.3)', fontStyle:'italic'}}>
                ⚕️ This is a triage aid, not a diagnosis. Always consult a qualified doctor.
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}