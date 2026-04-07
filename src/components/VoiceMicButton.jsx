import { useVoiceInput } from '../hooks/useVoiceInput'

/**
 * Small mic button for inline voice dictation.
 * Renders null on unsupported browsers — safe to drop anywhere.
 *
 * Props:
 *   onTranscript(text) — called with each final recognized phrase
 *   className          — classes for the button itself
 *   size               — 'sm' (default) | 'md'
 */
export default function VoiceMicButton({ onTranscript, className = '', size = 'sm' }) {
  const { isListening, isSupported, start, stop } = useVoiceInput({ onTranscript })

  if (!isSupported) return null

  const dim = size === 'md' ? 'w-10 h-10' : 'w-8 h-8'
  const iconSize = size === 'md' ? 'text-[18px]' : 'text-[15px]'

  return (
    <button
      type="button"
      onClick={isListening ? stop : start}
      title={isListening ? 'Tap to stop dictating' : 'Tap to dictate'}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      className={`relative flex items-center justify-center rounded-full transition-all select-none shrink-0 ${dim} ${
        isListening
          ? 'active:scale-90'
          : 'hover:bg-[#eceef0] active:scale-90'
      } ${className}`}
      style={{
        backgroundColor: isListening ? 'rgba(234,67,53,0.1)' : '#f2f4f6',
      }}
    >
      {/* Pulsing ring when listening */}
      {isListening && (
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ backgroundColor: 'rgba(234,67,53,0.2)' }}
        />
      )}
      <span
        className={`material-symbols-outlined ${iconSize} relative z-10 ${isListening ? 'icon-filled' : ''}`}
        style={{ color: isListening ? '#ea4335' : '#8293b4' }}
      >
        mic
      </span>
    </button>
  )
}
