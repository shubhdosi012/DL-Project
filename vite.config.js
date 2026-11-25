import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'

function apiDevProxy() {
  return {
    name: 'bharatyatra-api-dev-proxy',
    configureServer(server) {
      const env = loadEnv('development', process.cwd(), '')

      server.middlewares.use('/api/voice', async (req, res, next) => {
        if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return }
        if (req.method !== 'POST') return next()

        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        let body = {}
        try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') } catch { body = {} }

        const headerKey = typeof req.headers['x-elevenlabs-key'] === 'string' ? req.headers['x-elevenlabs-key'].trim() : ''
        const apiKey = headerKey || env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY
        if (!apiKey) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ mode: 'demo', error: 'ElevenLabs API key is not configured' }))
          return
        }

        const text = typeof body.text === 'string' ? body.text.trim().slice(0, 2400) : ''
        if (!text) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Text is required' }))
          return
        }

        const voiceId = body.voiceId || env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID
        const stability = typeof body.stability === 'number' ? Math.min(1, Math.max(0, body.stability)) : 0.5

        try {
          const elevenRes = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
              body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: { stability, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true },
              }),
            },
          )
          if (!elevenRes.ok) {
            res.statusCode = elevenRes.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ mode: 'demo', error: 'Voice generation failed' }))
            return
          }
          const audio = Buffer.from(await elevenRes.arrayBuffer())
          res.statusCode = 200
          res.setHeader('Content-Type', 'audio/mpeg')
          res.setHeader('Cache-Control', 'private, no-store')
          res.end(audio)
        } catch {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ mode: 'demo', error: 'Voice service is unavailable' }))
        }
      })

      server.middlewares.use('/api/chat', async (req, res, next) => {
        if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return }
        if (req.method !== 'POST') return next()

        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        let body = {}
        try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') } catch { body = {} }

        const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY
        if (!apiKey) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ mode: 'demo', error: 'Gemini API key is not configured' }))
          return
        }

        const message = typeof body.message === 'string' ? body.message.trim().slice(0, 1600) : ''
        if (!message) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Message is required' }))
          return
        }

        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: 'You are BharatYatra AI, a helpful travel assistant. Keep answers warm, clear, and under 140 words.' }],
                },
                contents: [{ role: 'user', parts: [{ text: message }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 320 },
              }),
            },
          )
          if (!geminiRes.ok) {
            res.statusCode = geminiRes.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ mode: 'demo', error: 'Gemini request failed' }))
            return
          }
          const data = await geminiRes.json()
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
          if (!text) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ mode: 'demo', error: 'Empty response' }))
            return
          }
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ mode: 'gemini', text }))
        } catch {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ mode: 'demo', error: 'Gemini unavailable' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiDevProxy()],
})
