import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TriageCard from '../components/TriageCard'
import MedCard from '../components/MedCard'
import './Chat.css'

const QUICK_STARTS = [
  { icon: '🤒', text: 'I have a fever since yesterday' },
  { icon: '💊', text: 'Check my medications: Aspirin, Warfarin, Pantoprazole' },
  { icon: '❤️', text: 'I have chest tightness when climbing stairs' },
  { icon: '🤕', text: 'Sudden severe headache, worst of my life' },
]

function parseTriageResult(text) {
  const match = text.match(/---TRIAGE_START---([\s\S]*?)---TRIAGE_END---/)
  if (!match) return null
  const block = match[1]
  const get = (key) => {
    const m = block.match(new RegExp(`${key}:\\s*(.+)`))
    return m ? m[1].trim() : ''
  }
  return {
    urgency: get('URGENCY'),
    summary: get('SUMMARY'),
    watchFor: get('WATCH_FOR'),
    action: get('ACTION'),
    reasoning: get('REASONING'),
  }
}

function parseMedResult(text) {
  const match = text.match(/---MED_START---([\s\S]*?)---MED_END---/)
  if (!match) return null
  const block = match[1]
  const get = (key) => {
    const m = block.match(new RegExp(`${key}:\\s*(.+)`))
    return m ? m[1].trim() : ''
  }
  return {
    overall: get('OVERALL'),
    findings: get('FINDINGS'),
    advice: get('ADVICE'),
  }
}

function cleanText(text) {
  return text
    .replace(/---TRIAGE_START---[\s\S]*?---TRIAGE_END---/, '')
    .replace(/---MED_START---[\s\S]*?---MED_END---/, '')
    .trim()
}

function getCleanMessages(msgs) {
  return msgs.map(m => ({
    role: m.role,
    content: m.content
  }))
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showMedPanel, setShowMedPanel] = useState(false)
  const [medInput, setMedInput] = useState('')
  const [report, setReport] = useState(null)
  const bottomRef = useRef(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const saveToHistory = (symptom, urgency, triageData) => {
    if (!user) return
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const updated = users.map(u => {
      if (u.email === user.email) {
        const history = u.triageHistory || []
        history.push({
          symptom,
          urgency,
          triageData,
          date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        })
        return { ...u, triageHistory: history }
      }
      return u
    })
    localStorage.setItem('users', JSON.stringify(updated))
    localStorage.setItem('user', JSON.stringify(updated.find(u => u.email === user.email)))
  }

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText || loading) return

    const userMsg = { role: 'user', content: userText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const cleanMessages = getCleanMessages(newMessages)
      const res = await fetch('https://ai-triage-app.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: cleanMessages,
          userContext: user ? `Patient: ${user.name}, Age: ${user.age}, Gender: ${user.gender}, Known conditions: ${user.conditions || 'none'}` : ''
        })
      })
      const data = await res.json()
      const reply = data.reply || data.error || 'No response'

      const triageResult = parseTriageResult(reply)
      const medResult = parseMedResult(reply)
      const displayText = cleanText(reply)

      if (triageResult) {
        saveToHistory(userText, triageResult.urgency, triageResult)
        setReport({ type: 'triage', data: triageResult, symptom: userText, date: new Date().toLocaleDateString('en-IN') })
      }
      if (medResult) {
        setReport({ type: 'med', data: medResult, date: new Date().toLocaleDateString('en-IN') })
      }

      setMessages([...newMessages, {
        role: 'assistant',
        content: reply,
        displayText,
        triageResult,
        medResult,
      }])
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Error: ' + err.message,
        displayText: 'Error: ' + err.message
      }])
    }

    setLoading(false)
  }

  const checkMedications = async () => {
    if (!medInput.trim()) return
    setShowMedPanel(false)
    const medList = medInput.split(',').map(m => m.trim()).filter(Boolean)

    const userText = `Check my medications: ${medList.join(', ')}`
    const userMsg = { role: 'user', content: userText }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setMedInput('')
    setLoading(true)

    try {
      const dbRes = await fetch('https://ai-triage-app.onrender.com/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications: medList })
      })
      const dbData = await dbRes.json()

      const cleanMessages = getCleanMessages(newMessages)
      const aiRes = await fetch('https://ai-triage-app.onrender.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: cleanMessages })
      })
      const aiData = await aiRes.json()
      const reply = aiData.reply || ''
      const medResult = parseMedResult(reply)
      const displayText = cleanText(reply)

      const combinedMedResult = {
        overall: dbData.interactions.some(i => i.severity === 'SEVERE') ? 'URGENT_REVIEW' :
                 dbData.interactions.length > 0 ? 'REVIEW_RECOMMENDED' : 'SAFE',
        findings: displayText,
        dbInteractions: dbData.interactions,
        dbDuplications: dbData.duplications,
        ...(medResult || {})
      }

      setReport({ type: 'med', data: combinedMedResult, meds: medList, date: new Date().toLocaleDateString('en-IN') })

      setMessages([...newMessages, {
        role: 'assistant',
        content: reply,
        displayText,
        medResult: combinedMedResult,
      }])
    } catch (err) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Error: ' + err.message,
        displayText: 'Error: ' + err.message
      }])
    }

    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-bg">
      <div className="chat-sidebar">
        <div className="sidebar-logo">⚕️ MedTriage<span>AI</span></div>
        <nav>
          <div className="nav-item" onClick={() => navigate('/dashboard')}>🏠 Dashboard</div>
          <div className="nav-item active">💬 New Triage</div>
          {report && (
            <div className="nav-item" onClick={() => navigate('/report', { state: { report } })}>📋 View Report</div>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="nav-item logout" onClick={() => { localStorage.removeItem('user'); navigate('/login') }}>🚪 Logout</div>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-topbar">
          <div>
            <h2>AI Symptom Triage</h2>
            <p>Powered by Llama 3.3 · Not a substitute for medical advice</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="med-check-btn" onClick={() => setShowMedPanel(true)}>💊 Check Meds</button>
            {user && <div className="user-chip">{user.name[0].toUpperCase()} {user.name}</div>}
          </div>
        </div>

        <div className="chat-area">
          {messages.length === 0 && (
            <div className="welcome">
              <div style={{ fontSize: 52, marginBottom: 12 }}>⚕️</div>
              <h2>Hello, {user?.name || 'there'}!</h2>
              <p>Describe your symptoms and I'll assess urgency — or check your medications for dangerous interactions.</p>
              <div className="quick-starts">
                {QUICK_STARTS.map((q, i) => (
                  <button key={i} className="quick-btn" onClick={() => sendMessage(q.text)}>
                    <span>{q.icon}</span><span>{q.text}</span>
                  </button>
                ))}
              </div>
              <div className="emergency-note">🔴 For emergencies call <strong>108</strong> immediately</div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              <div className={`message ${msg.role}`}>
                {msg.role === 'assistant' && <div className="avatar">⚕</div>}
                <div className="bubble">{msg.displayText || msg.content}</div>
              </div>
              {msg.triageResult && <TriageCard result={msg.triageResult} />}
              {msg.medResult && <MedCard result={msg.medResult} />}
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="avatar">⚕</div>
              <div className="bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {showMedPanel && (
          <div className="med-overlay" onClick={() => setShowMedPanel(false)}>
            <div className="med-panel" onClick={e => e.stopPropagation()}>
              <h3>💊 Medication Safety Check</h3>
              <p>Enter all your medications separated by commas</p>
              <textarea
                value={medInput}
                onChange={e => setMedInput(e.target.value)}
                placeholder="e.g. Aspirin, Warfarin, Pantoprazole, Metformin"
                rows={3}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button className="cancel-btn" onClick={() => setShowMedPanel(false)}>Cancel</button>
                <button className="check-btn" onClick={checkMedications}>Check Interactions →</button>
              </div>
            </div>
          </div>
        )}

        <div className="input-area">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe your symptoms in plain language..."
            rows={1}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="send-btn">➤</button>
        </div>
      </div>
    </div>
  )
}