import { useLocation, useNavigate } from 'react-router-dom'
import './Report.css'

export default function Report() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const report = state?.report
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (!report) { navigate('/chat'); return null }

  const urgencyConfig = {
    HOME_CARE: { color: '#10b981', label: '🏠 Manage at Home', bg: 'rgba(16,185,129,0.1)' },
    SEE_DOCTOR_THIS_WEEK: { color: '#eab308', label: '📅 See Doctor This Week', bg: 'rgba(234,179,8,0.1)' },
    SEE_DOCTOR_TODAY: { color: '#f97316', label: '🏥 See Doctor Today', bg: 'rgba(249,115,22,0.1)' },
    GO_TO_EMERGENCY: { color: '#ef4444', label: '🚨 Go to Emergency', bg: 'rgba(239,68,68,0.1)' },
  }

  const handlePrint = () => window.print()

  return (
    <div className="report-bg">
      <div className="report-container">
        {/* Header */}
        <div className="report-header">
          <div>
            <div style={{ fontSize: 32, marginBottom: 4 }}>⚕️</div>
            <h1>MedTriage<span>AI</span></h1>
            <p>Official Triage Report</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Report Date</div>
            <div style={{ fontWeight: 700 }}>{report.date}</div>
          </div>
        </div>

        {/* Patient Info */}
        {user && (
          <div className="report-section">
            <div className="section-title">👤 Patient Information</div>
            <div className="info-grid">
              <div className="info-item"><span>Name</span><strong>{user.name}</strong></div>
              <div className="info-item"><span>Age</span><strong>{user.age}</strong></div>
              <div className="info-item"><span>Gender</span><strong>{user.gender}</strong></div>
              <div className="info-item"><span>Conditions</span><strong>{user.conditions || 'None listed'}</strong></div>
            </div>
          </div>
        )}

        {/* Triage Report */}
        {report.type === 'triage' && report.data && (
          <>
            <div className="report-section">
              <div className="section-title">🩺 Symptom Reported</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>{report.symptom}</p>
            </div>

            <div className="report-section">
              <div className="section-title">⚡ Urgency Assessment</div>
              {(() => {
                const cfg = urgencyConfig[report.data.urgency] || urgencyConfig.HOME_CARE
                return (
                  <div style={{ background: cfg.bg, border: `2px solid ${cfg.color}`, borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color, marginBottom: 8 }}>{cfg.label}</div>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: 0 }}>{report.data.summary}</p>
                  </div>
                )
              })()}
            </div>

            {report.data.reasoning && (
              <div className="report-section">
                <div className="section-title">🧠 Clinical Reasoning</div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.7 }}>{report.data.reasoning}</p>
              </div>
            )}

            {report.data.watchFor && (
              <div className="report-section">
                <div className="section-title">⚠️ Warning Signs to Watch For</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {report.data.watchFor.split(',').map((w, i) => (
                    <span key={i} style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 20,
                      padding: '6px 14px',
                      fontSize: 13,
                      color: '#fca5a5'
                    }}>{w.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {report.data.action && (
              <div className="report-section">
                <div className="section-title">✅ Recommended Action</div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.7 }}>{report.data.action}</p>
              </div>
            )}
          </>
        )}

        {/* Medication Report */}
        {report.type === 'med' && report.data && (
          <>
            <div className="report-section">
              <div className="section-title">💊 Medications Checked</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(report.meds || []).map((m, i) => (
                  <span key={i} style={{
                    background: 'rgba(168,85,247,0.15)',
                    border: '1px solid rgba(168,85,247,0.3)',
                    borderRadius: 20,
                    padding: '6px 14px',
                    fontSize: 13,
                    color: '#d8b4fe'
                  }}>{m}</span>
                ))}
              </div>
            </div>
            {report.data.findings && (
              <div className="report-section">
                <div className="section-title">🔍 Findings</div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.7 }}>{report.data.findings}</p>
              </div>
            )}
          </>
        )}

        {/* Disclaimer */}
        <div className="report-disclaimer">
          ⚕️ This report is generated by an AI triage assistant and is NOT a medical diagnosis. Always consult a qualified doctor before making any health decisions. For emergencies, call 108 immediately.
        </div>

        {/* Buttons */}
        <div className="report-actions no-print">
          <button className="back-btn" onClick={() => navigate('/chat')}>← Back to Chat</button>
          <button className="print-btn" onClick={handlePrint}>🖨️ Print Report</button>
        </div>
      </div>
    </div>
  )
}