import {
  AudioLines,
  Bot,
  ChevronDown,
  Loader2,
  MapPinned,
  MessageCircle,
  Mic,
  MicOff,
  Send,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ELEVENLABS_VOICES } from '../data/themes'
import { getChatResponse, getWelcome } from '../utils/chatbot'

export function TravelChat() {
  const { language, isChatOpen, setIsChatOpen } = useApp()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(() => [{ id: 'welcome', role: 'bot', ...getWelcome(language) }])
  const [speaking, setSpeaking] = useState(null)
  const [loadingVoice, setLoadingVoice] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)

  // Mode awareness: Gemini live vs Demo Mode; ElevenLabs live vs Demo Voice
  const [aiMode, setAiMode] = useState('demo') // 'demo' | 'gemini'
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [voiceId, setVoiceId] = useState(() => localStorage.getItem('bharatyatra:voiceId') || ELEVENLABS_VOICES[0].id)
  const [autoSpeak, setAutoSpeak] = useState(() => localStorage.getItem('bharatyatra:autoSpeak') === 'true')
  const [stability, setStability] = useState(0.5)
  const [sessionApiKey, setSessionApiKey] = useState(() => sessionStorage.getItem('bharatyatra:elevenKey') || '')
  const [voiceEngine, setVoiceEngine] = useState('demo') // 'demo' | 'elevenlabs'
  const [voiceNotice, setVoiceNotice] = useState('')

  const endRef = useRef(null)
  const audioRef = useRef(null)
  const recognitionRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => setMessages([{ id: 'welcome', role: 'bot', ...getWelcome(language) }]), [language])
  useEffect(() => { if (isChatOpen) setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100) }, [messages, isChatOpen, isTyping])
  useEffect(() => { if (isChatOpen) inputRef.current?.focus() }, [isChatOpen])
  useEffect(() => localStorage.setItem('bharatyatra:voiceId', voiceId), [voiceId])
  useEffect(() => localStorage.setItem('bharatyatra:autoSpeak', String(autoSpeak)), [autoSpeak])

  const saveSessionKey = (val) => {
    setSessionApiKey(val)
    if (val.trim()) sessionStorage.setItem('bharatyatra:elevenKey', val.trim())
    else sessionStorage.removeItem('bharatyatra:elevenKey')
  }

  const cleanSpeechText = (raw) =>
    raw
      .replace(/[*_`#]/g, '')
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()

  /* ── ElevenLabs Voice Guide with clearly labelled Demo Browser TTS fallback ── */
  const speak = async (message) => {
    if (speaking === message.id) {
      audioRef.current?.pause()
      window.speechSynthesis?.cancel()
      setSpeaking(null)
      setLoadingVoice(null)
      return
    }
    audioRef.current?.pause()
    window.speechSynthesis?.cancel()
    setSpeaking(null)
    setLoadingVoice(message.id)

    const spokenText = cleanSpeechText(message.text)

    try {
      const headers = { 'Content-Type': 'application/json' }
      if (sessionApiKey.trim()) headers['x-elevenlabs-key'] = sessionApiKey.trim()

      const voiceResponse = await fetch('/api/voice', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: spokenText, language, voiceId, stability }),
      })
      if (!voiceResponse.ok || !voiceResponse.headers.get('content-type')?.includes('audio')) {
        throw new Error('ElevenLabs API key not configured')
      }
      const objectUrl = URL.createObjectURL(await voiceResponse.blob())
      const audio = new Audio(objectUrl)
      audioRef.current = audio
      setLoadingVoice(null)
      setSpeaking(message.id)
      setVoiceEngine('elevenlabs')
      setVoiceNotice('')
      audio.onended = () => { URL.revokeObjectURL(objectUrl); setSpeaking(null) }
      audio.onerror = () => { setSpeaking(null); setLoadingVoice(null) }
      await audio.play()
    } catch {
      setLoadingVoice(null)
      setSpeaking(message.id)
      setVoiceEngine('demo')
      setVoiceNotice('Demo Voice Mode: Add ELEVENLABS_API_KEY in .env or above for ElevenLabs HD Voice.')
      const utterance = new SpeechSynthesisUtterance(spokenText)
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
      utterance.rate = 0.96
      utterance.onend = () => setSpeaking(null)
      utterance.onerror = () => setSpeaking(null)
      window.speechSynthesis?.speak(utterance)
    }
  }

  /* ── Conversational AI: calls Gemini API if configured, else clearly labelled Demo Mode ── */
  const reply = async (question) => {
    const trimmed = question.trim()
    if (!trimmed) return
    setIsTyping(true)
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', text: trimmed }])
    setInput('')

    const localMatch = getChatResponse(trimmed, language)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.mode === 'gemini' && data?.text) {
          setAiMode('gemini')
          const botMsg = {
            id: crypto.randomUUID(),
            role: 'bot',
            text: data.text,
            places: localMatch.places || [],
            actions: localMatch.actions || [],
            source: 'Gemini AI',
          }
          setMessages((current) => [...current, botMsg])
          setIsTyping(false)
          if (autoSpeak) speak(botMsg)
          return
        }
      }
    } catch {
      // Fall through cleanly to Demo Mode
    }

    setAiMode('demo')
    setTimeout(() => {
      const botMsg = {
        id: crypto.randomUUID(),
        role: 'bot',
        ...localMatch,
        source: 'Demo Mode',
      }
      setMessages((current) => [...current, botMsg])
      setIsTyping(false)
      if (autoSpeak) speak(botMsg)
    }, 320)
  }

  const onSubmit = (event) => { event.preventDefault(); reply(input) }

  const handleAction = (action) => {
    const lower = action.toLowerCase()
    if (lower.includes('open planner') || lower === 'plan a trip') {
      setIsChatOpen(false)
      navigate('/planner')
      return
    }
    reply(action)
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.interimResults = true
    recognition.continuous = false
    recognitionRef.current = recognition
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join('')
      setInput(transcript)
      if (event.results[0]?.isFinal) {
        setIsListening(false)
        if (transcript.trim()) reply(transcript.trim())
      }
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)
    recognition.start()
    setIsListening(true)
  }

  const unreadCount = isChatOpen ? 0 : messages.filter((m) => m.role === 'bot').length - 1
  const selectedVoiceName = ELEVENLABS_VOICES.find((v) => v.id === voiceId)?.name || 'George'

  return (
    <div className="travel-chat print:hidden">
      {isChatOpen && (
        <section className="chat-panel" aria-label="BharatYatra AI travel assistant">
          <header className="chat-header">
            <div className="flex items-center gap-3">
              <span className="chat-avatar"><Bot size={19} /></span>
              <div>
                <h2>BharatYatra AI Assistant</h2>
                <p>
                  <span className="online-dot" />
                  {aiMode === 'gemini' ? 'Live Gemini AI' : 'Demo Mode (Configure GEMINI_API_KEY for live AI)'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className={`chat-header-button ${showVoiceSettings ? '!bg-white/25' : ''}`}
                onClick={() => setShowVoiceSettings((v) => !v)}
                title="ElevenLabs Voice Settings"
                aria-label="Voice settings"
              >
                <SlidersHorizontal size={16} />
              </button>
              <button
                className="chat-header-button"
                onClick={() => {
                  audioRef.current?.pause()
                  window.speechSynthesis?.cancel()
                  setSpeaking(null)
                  setMessages([{ id: 'welcome', role: 'bot', ...getWelcome(language) }])
                }}
                title="Clear chat"
                aria-label="Clear chat"
              >
                <Trash2 size={15} />
              </button>
              <button className="chat-header-button" onClick={() => setIsChatOpen(false)} aria-label="Close assistant">
                <ChevronDown size={20} />
              </button>
            </div>
          </header>

          {showVoiceSettings && (
            <div className="chat-voice-settings">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#173D32]">
                  <AudioLines size={14} className="text-[#D99B63]" /> ElevenLabs Voice Guide
                </div>
                <span className="rounded-full bg-[var(--bg-card-soft)] px-2 py-0.5 text-[10px] font-bold">
                  {voiceEngine === 'elevenlabs' ? 'ElevenLabs Active' : 'Demo Voice'}
                </span>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase opacity-70">Voice</label>
                  <select
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2 py-1.5 text-xs font-semibold"
                  >
                    {ELEVENLABS_VOICES.map((v) => (
                      <option key={v.id} value={v.id}>{v.name} — {v.desc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase opacity-70">Stability ({stability})</label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.1"
                    value={stability}
                    onChange={(e) => setStability(parseFloat(e.target.value))}
                    className="mt-2 w-full accent-[#173D32]"
                  />
                </div>
              </div>

              <label className="mt-2.5 flex cursor-pointer items-center justify-between text-xs font-semibold">
                <span>Auto-speak replies</span>
                <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} className="h-4 w-4 accent-[#173D32]" />
              </label>

              <div className="mt-2.5 flex items-end gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-bold uppercase opacity-70">
                    ElevenLabs API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={sessionApiKey}
                    onChange={(e) => saveSessionKey(e.target.value)}
                    placeholder="sk_... or set ELEVENLABS_API_KEY in .env"
                    className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => speak({
                    id: 'voice-preview',
                    text: `Hello! I am ${selectedVoiceName}, your BharatYatra AI voice guide.`,
                  })}
                  className="shrink-0 rounded-lg bg-[#173D32] px-2.5 py-1.5 text-xs font-bold text-white"
                >
                  {loadingVoice === 'voice-preview' ? 'Loading...' : speaking === 'voice-preview' ? 'Stop' : 'Test Voice'}
                </button>
              </div>
              {voiceNotice && <p className="mt-1.5 text-[10px] font-medium text-[var(--text-muted)]">{voiceNotice}</p>}
            </div>
          )}

          <div className="chat-messages">
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onAction={handleAction}
                close={() => setIsChatOpen(false)}
                onSpeak={speak}
                speaking={speaking === message.id}
                loading={loadingVoice === message.id}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="chat-quick-bar">
              <p className="chat-quick-label">Suggested Questions</p>
              <div className="chat-quick-chips">
                {['Beaches in Goa', 'Under ₹3,000/day', '3 day trip to Manali', 'Goa vs Udaipur'].map((q) => (
                  <button key={q} onClick={() => reply(q)} className="chat-quick-chip">{q}</button>
                ))}
              </div>
            </div>
          )}

          <form className="chat-input-wrap" onSubmit={onSubmit}>
            <button
              type="button"
              onClick={toggleListening}
              className={`chat-mic-btn ${isListening ? 'chat-mic-active' : ''}`}
              aria-label={isListening ? 'Stop listening' : 'Voice input'}
              title="Voice input"
            >
              {isListening ? <MicOff size={17} /> : <Mic size={17} />}
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about destinations, budgets, itineraries..."
              aria-label="Travel question"
            />
            <button type="submit" disabled={!input.trim()} aria-label="Send message" className={!input.trim() ? 'opacity-50' : ''}>
              <Send size={17} />
            </button>
          </form>

          <div className="chat-powered">
            <button type="button" onClick={() => setShowVoiceSettings((v) => !v)} className="hover:text-[#173D32]">
              Voice: {voiceEngine === 'elevenlabs' ? `ElevenLabs (${selectedVoiceName})` : 'Demo TTS'}
            </button>
            <span>•</span>
            <span>{aiMode === 'gemini' ? 'Gemini AI' : 'Demo Mode'}</span>
          </div>
        </section>
      )}

      <button className="chat-launcher" onClick={() => setIsChatOpen(!isChatOpen)} aria-label={isChatOpen ? 'Close AI Assistant' : 'Open AI Assistant'}>
        {isChatOpen ? <X size={22} /> : <>
          <MessageCircle size={21} />
          <span className="hidden sm:inline">AI Assistant</span>
          {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
        </>}
      </button>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="chat-message chat-message-bot">
      <span className="chat-message-icon"><Sparkles size={13} /></span>
      <div className="chat-bubble">
        <div className="chat-typing-dots"><span /><span /><span /></div>
      </div>
    </div>
  )
}

function Message({ message, onAction, close, onSpeak, speaking, loading }) {
  return (
    <div className={`chat-message ${message.role === 'user' ? 'chat-message-user' : 'chat-message-bot'}`}>
      {message.role === 'bot' && <span className="chat-message-icon"><Sparkles size={13} /></span>}
      <div className="chat-bubble">
        <div className="chat-text-row">
          <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
          {message.role === 'bot' && (
            <button
              className={`listen-button ${speaking ? 'listen-button-active' : ''}`}
              onClick={() => onSpeak(message)}
              title={speaking ? 'Stop audio' : 'Listen to response'}
              aria-label={speaking ? 'Stop audio' : 'Listen to response'}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          )}
        </div>
        {message.source && (
          <span className="mt-1.5 inline-block text-[10px] font-semibold text-[var(--text-muted)]">
            {message.source}
          </span>
        )}
        {speaking && (
          <div className="chat-audio-wave" aria-hidden="true">
            <span /><span /><span /><span /><span />
            <small>Playing audio...</small>
          </div>
        )}
        {message.places?.length > 0 && (
          <div className="chat-place-list">
            {message.places.map((place) => (
              <Link onClick={close} to={`/destination/${place.id}`} key={place.id} className="chat-place">
                <span><MapPinned size={14} /></span>
                <div>
                  <strong>{place.name}</strong>
                  <small>{place.state} · {place.idealDays}d · ~₹{place.dailyBudget}/day</small>
                </div>
              </Link>
            ))}
          </div>
        )}
        {message.actions?.length > 0 && (
          <div className="chat-actions">
            {message.actions.map((action) => <button onClick={() => onAction(action)} key={action}>{action}</button>)}
          </div>
        )}
      </div>
    </div>
  )
}
