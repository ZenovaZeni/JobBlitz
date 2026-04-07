import { useState, useRef, useEffect, useCallback } from 'react'

const SR = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition || null)
  : null

/**
 * Lightweight Web Speech API hook.
 *
 * Usage:
 *   const { isListening, isSupported, start, stop } = useVoiceInput({
 *     onTranscript: (text) => setValue(v => v ? v + ' ' + text : text),
 *   })
 *
 * Browser support: Chrome (desktop + Android), Safari 14.1+, Edge.
 * Not supported: Firefox. Returns isSupported = false gracefully.
 */
export function useVoiceInput({ onTranscript }) {
  const [isListening, setIsListening] = useState(false)
  const recRef  = useRef(null)
  const cbRef   = useRef(onTranscript)
  // Keep callback ref current so callers can pass inline arrow fns
  useEffect(() => { cbRef.current = onTranscript }, [onTranscript])

  const start = useCallback(() => {
    if (!SR || isListening) return
    const rec = new SR()
    rec.continuous      = true
    rec.interimResults  = false
    rec.lang            = 'en-US'

    rec.onstart  = () => setIsListening(true)
    rec.onend    = () => setIsListening(false)
    rec.onerror  = (e) => {
      // 'no-speech' just means silence — not a real error, don't reset
      if (e.error !== 'no-speech') setIsListening(false)
    }
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ')
        .trim()
      if (text) cbRef.current(text)
    }

    recRef.current = rec
    try { rec.start() } catch { setIsListening(false) }
  }, [isListening])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setIsListening(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => () => { recRef.current?.stop() }, [])

  return { isListening, isSupported: !!SR, start, stop }
}
