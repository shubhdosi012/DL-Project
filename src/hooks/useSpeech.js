import { useRef, useState } from 'react'

/**
 * Shared ElevenLabs TTS hook with browser SpeechSynthesis fallback.
 * Reads user's selected voice persona and optional session API key.
 */
export function useSpeech(language = 'en') {
  const [speakingId, setSpeakingId] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const audioRef = useRef(null)

  const stop = () => {
    audioRef.current?.pause()
    window.speechSynthesis?.cancel()
    setSpeakingId(null)
    setLoadingId(null)
  }

  const speak = async (id, rawText) => {
    if (speakingId === id) {
      stop()
      return
    }
    stop()
    setLoadingId(id)

    const cleanText = rawText
      .replace(/[*_`#]/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()

    try {
      const voiceId = localStorage.getItem('bharatyatra:voiceId') || 'JBFqnCBsd6RMkjVDRZzb'
      const sessionKey = sessionStorage.getItem('bharatyatra:elevenKey') || ''
      const headers = { 'Content-Type': 'application/json' }
      if (sessionKey) headers['x-elevenlabs-key'] = sessionKey

      const res = await fetch('/api/voice', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: cleanText, language, voiceId }),
      })
      if (!res.ok || !res.headers.get('content-type')?.includes('audio')) {
        throw new Error('Fallback to device voice')
      }
      const url = URL.createObjectURL(await res.blob())
      const audio = new Audio(url)
      audioRef.current = audio
      setLoadingId(null)
      setSpeakingId(id)
      audio.onended = () => { URL.revokeObjectURL(url); setSpeakingId(null) }
      audio.onerror = () => { setSpeakingId(null); setLoadingId(null) }
      await audio.play()
    } catch {
      setLoadingId(null)
      setSpeakingId(id)
      const utter = new SpeechSynthesisUtterance(cleanText)
      utter.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      utter.rate = 0.96
      utter.onend = () => setSpeakingId(null)
      utter.onerror = () => setSpeakingId(null)
      window.speechSynthesis?.speak(utter)
    }
  }

  return { speakingId, loadingId, speak, stop }
}
