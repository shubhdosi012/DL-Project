const MAX_PROMPT_LENGTH = 1600

/**
 * Vercel serverless proxy for Google Gemini AI Travel Assistant.
 * Returns HTTP 503 when GEMINI_API_KEY is not configured so the client
 * cleanly activates its clearly labelled Demo Mode.
 */
export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (request.method === 'OPTIONS') return response.status(204).end()
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return response.status(503).json({
      mode: 'demo',
      error: 'Gemini API key is not configured. Running in Demo Mode.',
    })
  }

  const body = typeof request.body === 'string' ? safeJson(request.body) : request.body
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, MAX_PROMPT_LENGTH) : ''
  if (!message) return response.status(400).json({ error: 'Message is required' })

  const systemInstruction =
    'You are BharatYatra AI, a warm, concise, practical travel assistant specializing in India and global travel planning. ' +
    'Help users with destination recommendations, budget estimates in INR, day-wise itineraries, attractions, and seasonal weather advice. Keep replies under 140 words.'

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: message }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 320 },
        }),
      },
    )

    if (!geminiRes.ok) {
      return response.status(geminiRes.status).json({ mode: 'demo', error: 'Gemini request failed' })
    }
    const data = await geminiRes.json()
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!replyText) return response.status(502).json({ mode: 'demo', error: 'Empty AI response' })

    return response.status(200).json({ mode: 'gemini', text: replyText })
  } catch {
    return response.status(502).json({ mode: 'demo', error: 'Gemini service unavailable' })
  }
}

function safeJson(value) {
  try { return JSON.parse(value) } catch { return null }
}
