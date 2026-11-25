const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'
const MAX_TEXT_LENGTH = 2400

/**
 * Vercel serverless proxy for ElevenLabs TTS.
 * Keeping the API key here prevents it from ever reaching the browser bundle.
 */
export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-elevenlabs-key')

  if (request.method === 'OPTIONS') return response.status(204).end()
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const headerKey = typeof request.headers['x-elevenlabs-key'] === 'string' ? request.headers['x-elevenlabs-key'].trim() : ''
  const apiKey = headerKey || process.env.ELEVENLABS_API_KEY
  if (!apiKey) return response.status(503).json({ error: 'Voice service is not configured. Add ELEVENLABS_API_KEY to your environment.' })

  const body = typeof request.body === 'string' ? safeJson(request.body) : request.body
  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, MAX_TEXT_LENGTH) : ''
  if (!text) return response.status(400).json({ error: 'Text is required' })

  const lang = body?.language || 'en'
  const requestedVoice = typeof body?.voiceId === 'string' && /^[a-zA-Z0-9]{10,40}$/.test(body.voiceId) ? body.voiceId : null
  const voiceId = requestedVoice || (lang === 'hi'
    ? (process.env.ELEVENLABS_HINDI_VOICE_ID || process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID)
    : (process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID))
  const stability = typeof body?.stability === 'number' ? Math.min(1, Math.max(0, body.stability)) : 0.5

  try {
    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost: 0.75,
            style: 0.15,
            use_speaker_boost: true,
          },
        }),
      },
    )

    if (!elevenResponse.ok) {
      return response.status(elevenResponse.status).json({
        error: 'Voice generation failed',
        detail: elevenResponse.status === 401 ? 'Invalid API key' : elevenResponse.status === 429 ? 'Rate limited — try again shortly' : 'Service error',
      })
    }

    const audio = Buffer.from(await elevenResponse.arrayBuffer())
    response.setHeader('Content-Type', 'audio/mpeg')
    response.setHeader('Cache-Control', 'private, no-store')
    response.setHeader('X-Voice-Id', voiceId)
    return response.status(200).send(audio)
  } catch {
    return response.status(502).json({ error: 'Voice service is unavailable' })
  }
}

function safeJson(value) {
  try { return JSON.parse(value) } catch { return null }
}
