export default function TriageCard({ result }) {
  const config = {
    HOME_CARE: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: '🏠', label: 'Manage at Home' },
    SEE_DOCTOR_THIS_WEEK: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', icon: '📅', label: 'See Doctor This Week' },
    SEE_DOCTOR_TODAY: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', icon: '🏥', label: 'See Doctor Today' },
    GO_TO_EMERGENCY: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: '🚨', label: 'Go to Emergency NOW' },
  }

  const cfg = config[result.urgency] || config.HOME_CARE

  return (
    <div style={{
      margin: '12px 0 12px 44px',
      background: cfg.bg,
      border: `2px solid ${cfg.border}`,
      borderRadius: 16,
      padding: '20px 24px',
      animation: 'fadeIn 0.4s ease'
    }}>
      {/* Urgency Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 32 }}>{cfg.icon}</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: cfg.color, textTransform: 'uppercase' }}>Triage Assessment</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{cfg.label}</div>
        </div>
      </div>

      {/* Summary */}
      {result.summary && (
        <p style={{ color: '#fff', fontSize: 14, lineHeight: 1.7, marginBottom: 14, opacity: 0.9 }}>
          {result.summary}
        </p>
      )}

      {/* Reasoning */}
      {result.reasoning && (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, marginBottom: 4, letterSpacing: 1 }}>CLINICAL REASONING</div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{result.reasoning}</p>
        </div>
      )}

      {/* Watch For */}
      {result.watchFor && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color, marginBottom: 8 }}>⚠️ Watch for these warning signs:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {result.watchFor.split(',').map((w, i) => (
              <span key={i} style={{
                background: 'rgba(255,255,255,0.07)',
                border: `1px solid ${cfg.border}`,
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 12,
                color: '#fff'
              }}>{w.trim()}</span>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      {result.action && (
        <div style={{
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 14
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color, marginBottom: 4 }}>✅ What to do now:</div>
          <p style={{ color: '#fff', fontSize: 13, margin: 0 }}>{result.action}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
        fontStyle: 'italic',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: 10,
        marginTop: 4
      }}>
        ⚕️ This is a triage aid, not a diagnosis. Always consult a qualified doctor.
      </div>
    </div>
  )
}