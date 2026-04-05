import { useState, useEffect } from 'react'

/**
 * Reveals text word-by-word on mount or when `text` changes.
 * Used to make progressively-received AI output feel alive without fake delays.
 *
 * @param {string} text       - The full string to reveal.
 * @param {object} options
 * @param {number} wordsPerTick - Words revealed per interval tick. Default 2.
 * @param {number} tickMs       - Milliseconds between ticks. Default 28.
 */
export function useTypewriter(text, { wordsPerTick = 2, tickMs = 28 } = {}) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    if (!text) {
      setDisplayed('')
      return
    }

    // Reset and start fresh whenever the source text changes
    setDisplayed('')
    const words = text.split(' ')
    let cursor = 0

    const id = setInterval(() => {
      cursor = Math.min(cursor + wordsPerTick, words.length)
      setDisplayed(words.slice(0, cursor).join(' '))
      if (cursor >= words.length) clearInterval(id)
    }, tickMs)

    return () => clearInterval(id)
  }, [text, wordsPerTick, tickMs])

  return displayed
}
