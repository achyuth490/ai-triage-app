const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['https://ai-triage-app.vercel.app', 'http://localhost:5173']
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

const DRUG_INTERACTIONS = [
  { drugs: ['aspirin', 'warfarin'], severity: 'SEVERE', risk: 'HIGH bleeding risk — these two together can cause dangerous internal bleeding' },
  { drugs: ['aspirin', 'clopidogrel'], severity: 'SEVERE', risk: 'Double blood thinning — very high bleeding risk' },
  { drugs: ['metformin', 'alcohol'], severity: 'SEVERE', risk: 'Can cause lactic acidosis — a dangerous condition' },
  { drugs: ['warfarin', 'ibuprofen'], severity: 'SEVERE', risk: 'Ibuprofen increases warfarin effect — serious bleeding risk' },
  { drugs: ['warfarin', 'paracetamol'], severity: 'MODERATE', risk: 'High doses of paracetamol increase warfarin effect' },
  { drugs: ['aspirin', 'ibuprofen'], severity: 'MODERATE', risk: 'Both are NSAIDs — increases stomach ulcer and bleeding risk' },
  { drugs: ['metformin', 'ibuprofen'], severity: 'MODERATE', risk: 'Ibuprofen can reduce kidney function and affect metformin levels' },
  { drugs: ['atenolol', 'amlodipine'], severity: 'MILD', risk: 'Both lower blood pressure — monitor for dizziness' },
  { drugs: ['pantoprazole', 'clopidogrel'], severity: 'MODERATE', risk: 'Pantoprazole may reduce effectiveness of clopidogrel' },
  { drugs: ['atorvastatin', 'amlodipine'], severity: 'MILD', risk: 'Amlodipine can slightly increase atorvastatin levels' },
  { drugs: ['methotrexate', 'aspirin'], severity: 'SEVERE', risk: 'Aspirin can increase methotrexate toxicity — very dangerous' },
  { drugs: ['methotrexate', 'ibuprofen'], severity: 'SEVERE', risk: 'NSAIDs increase methotrexate toxicity — can be life threatening' },
  { drugs: ['paracetamol', 'dolo'], severity: 'SEVERE', risk: 'Paracetamol and Dolo 650 are the same drug — overdose risk' },
  { drugs: ['aspirin', 'naproxen'], severity: 'MODERATE', risk: 'Two NSAIDs together — increased stomach bleeding risk' },
  { drugs: ['ciprofloxacin', 'antacid'], severity: 'MODERATE', risk: 'Antacids reduce ciprofloxacin absorption' },
  { drugs: ['warfarin', 'omeprazole'], severity: 'MODERATE', risk: 'Omeprazole can increase warfarin levels' },
  { drugs: ['amlodipine', 'simvastatin'], severity: 'MODERATE', risk: 'Amlodipine increases simvastatin levels — risk of muscle damage' },
]

const DUPLICATIONS = [
  { drugs: ['paracetamol', 'dolo'], message: 'Paracetamol and Dolo 650 contain the same ingredient' },
  { drugs: ['paracetamol', 'crocin'], message: 'Crocin and Paracetamol are the same drug' },
  { drugs: ['ibuprofen', 'brufen'], message: 'Brufen is just Ibuprofen — same drug' },
  { drugs: ['aspirin', 'disprin'], message: 'Disprin contains Aspirin — same drug' },
]

function checkMedications(medList) {
  const normalized = medList.map(m => m.toLowerCase().trim())
  const found = []
  const dups = []
  DRUG_INTERACTIONS.forEach(interaction => {
    const match = interaction.drugs.every(drug => normalized.some(med => med.includes(drug)))
    if (match) found.push(interaction)
  })
  DUPLICATIONS.forEach(dup => {
    const match = dup.drugs.every(drug => normalized.some(med => med.includes(drug)))
    if (match) dups.push(dup)
  })
  return { interactions: found, duplications: dups }
}

app.get('/', (req, res) => {
  res.json({ message: '✅ Backend is running!' })
})

app.post('/api/medications', (req, res) => {
  const { medications } = req.body
  if (!medications || !Array.isArray(medications)) {
    return res.status(400).json({ error: 'Please provide medications list' })
  }
  const result = checkMedications(medications)
  res.json(result)
})

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body

    const systemPrompt = `You are MedTriage AI, a compassionate and clinically rigorous health triage assistant for patients in India.

## YOUR BEHAVIOR

### SYMPTOM TRIAGE
When a user describes symptoms, conduct a structured intake by asking ONE focused question at a time. Gather these in order:
1. Age and gender (if not already known)
2. Exact duration — when did it start?
3. Severity — rate 1-10 or describe functional impact
4. Associated symptoms — fever, nausea, dizziness, shortness of breath?
5. Any known medical conditions or current medications?
6. What makes it better or worse?

After gathering enough context (4-6 exchanges), give a TRIAGE ASSESSMENT in this EXACT format:

---TRIAGE_START---
URGENCY: [HOME_CARE or SEE_DOCTOR_THIS_WEEK or SEE_DOCTOR_TODAY or GO_TO_EMERGENCY]
SUMMARY: [2-3 sentences in plain English about what this might suggest]
WATCH_FOR: [comma separated list of warning signs]
ACTION: [exactly what the patient should do right now]
REASONING: [brief clinical reasoning in plain English]
---TRIAGE_END---

### MEDICATION SAFETY
When user lists medications, analyze for interactions and give report in this EXACT format:

---MED_START---
OVERALL: [SAFE or REVIEW_RECOMMENDED or URGENT_REVIEW]
FINDINGS: [plain English summary of what you found]
ADVICE: [what the patient should do]
---MED_END---

### URGENCY CALIBRATION RULES
- Chest pain + age 50+ + exertion = GO_TO_EMERGENCY
- Chest pain + young + anxious + no other symptoms = SEE_DOCTOR_TODAY
- Fever 3+ days + child = SEE_DOCTOR_TODAY
- Fever + stiff neck + rash = GO_TO_EMERGENCY
- Sudden worst headache of life = GO_TO_EMERGENCY
- Mild cold + no red flags = HOME_CARE
- Mild fever 1 day + adult + no red flags = HOME_CARE

### TONE RULES
- Always warm, calm, never alarmist
- Simple English only
- Always end with: This is a triage aid, not a diagnosis. Consult a qualified doctor.
- For emergencies mention: Call 108 immediately

${userContext ? `PATIENT CONTEXT: ${userContext}` : ''}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    })

    const data = await response.json()
    if (data.error) return res.status(400).json({ error: data.error.message })
    res.json({ reply: data.choices[0].message.content })

  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`)
})