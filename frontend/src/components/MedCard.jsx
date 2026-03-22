export default function MedCard({ result }) {
  const config = {
    SAFE: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: '✅', label: 'Medications appear Safe' },
    REVIEW_RECOMMENDED: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', icon: '⚠️', label: 'Review Recommended' },
    URGENT_REVIEW: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: '🚨', label: 'Urgent Review Needed' },
  }

  const severityColor = {
    SEVERE: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
    MODERATE: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
    MILD: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)' },
  }

  const cfg = config[result.overall] || config.SAFE

  return (
    <div style={{
      margin: '12px 0 12px 44px',
      background: cfg.bg,
      border: `2px solid ${cfg.border}`,
      borderRadius: 16,
      padding: '20px 24px',
      animation: 'fadeIn 0.4s ease'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 32 }}>{cfg.icon}</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: cfg.color, textTransform: 'uppercase' }}>Medication Safety Report</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color }}>{cfg.label}</div>
        </div>
      </div>

      {/* DB Interactions */}
      {result.dbInteractions && result.dbInteractions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color, marginBottom: 10 }}>🔍 Interactions Found in Database:</div>
          {result.dbInteractions.map((inter, i) => {
            const sc = severityColor[inter.severity] || severityColor.MILD
            return (
              <div key={i} style={{
                background: sc.bg,
                border: `1px solid ${sc.border}`,
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    background: sc.color,
                    color: '#fff',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: 10,
                    fontWeight: 700
                  }}>{inter.severity}</span>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>
                    {inter.drugs.join(' + ')}
                  </span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{inter.risk}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Duplications */}
      {result.dbDuplications && result.dbDuplications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f97316', marginBottom: 8 }}>⚠️ Duplicate Medications:</div>
          {result.dbDuplications.map((dup, i) => (
            <div key={i} style={{
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 6,
              fontSize: 13,
              color: 'rgba(255,255,255,0.8)'
            }}>⚠️ {dup.message}</div>
          ))}
        </div>
      )}

      {/* No interactions */}
      {result.dbInteractions && result.dbInteractions.length === 0 && result.dbDuplications && result.dbDuplications.length === 0 && (
        <div style={{ color: '#10b981', fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          ✅ No dangerous interactions found in our database for these medications.
        </div>
      )}

      {/* AI Findings */}
      {result.findings && (
        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: cfg.color, marginBottom: 4, letterSpacing: 1 }}>AI ANALYSIS</div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{result.findings}</p>
        </div>
      )}

      {/* Advice */}
      {result.advice && (
        <div style={{
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 14
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: cfg.color, marginBottom: 4 }}>💡 Recommendation:</div>
          <p style={{ color: '#fff', fontSize: 13, margin: 0 }}>{result.advice}</p>
        </div>
      )}

      <div style={{
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
        fontStyle: 'italic',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: 10
      }}>
        ⚕️ Always confirm with your doctor or pharmacist before changing medications.
      </div>
    </div>
  )
}