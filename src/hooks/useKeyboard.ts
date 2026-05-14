import { useEffect, useRef } from 'react'

// C4~B5 (2 octaves): white keys A-K (14 keys), black keys W E T Y U / I O P
export const WHITE_MIDI = [60,62,64,65,67,69,71, 72,74,76,77,79,81,83]
export const WHITE_KEYS = ['a','s','d','f','g','h','j','k','l',';',"'",'z','x','c']

export const BLACK_MIDI = [61,63, 66,68,70, 73,75, 78,80,82]
export const BLACK_KEYS = ['w','e', 't','y','u', 'i','o', 'p','[',']']

const KB_WHITE_MAP: Record<string, number> = {}
WHITE_KEYS.forEach((k, i) => { if (k) KB_WHITE_MAP[k] = WHITE_MIDI[i] })

const KB_BLACK_MAP: Record<string, number> = {}
BLACK_KEYS.forEach((k, i) => { if (k) KB_BLACK_MAP[k] = BLACK_MIDI[i] })

export const KB_MIDI_MAP: Record<string, number> = { ...KB_WHITE_MAP, ...KB_BLACK_MAP }

interface Handlers {
  onPressNote: (midi: number) => void
  onReleaseNote: (midi: number) => void
  onEnter: () => void
  onBackspace: () => void
  onArrowRight: () => void
  onEscape: () => void
}

export function useKeyboard(handlers: Handlers, enabled = true) {
  const pressed = useRef<Set<string>>(new Set())
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (e: KeyboardEvent) => {
      // ignore when typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.repeat) return

      const key = e.key.toLowerCase()
      const h = handlersRef.current

      if (KB_MIDI_MAP[key] !== undefined && !pressed.current.has(key)) {
        pressed.current.add(key)
        h.onPressNote(KB_MIDI_MAP[key])
        return
      }

      if (e.key === 'Enter')      { e.preventDefault(); h.onEnter() }
      if (e.key === 'Backspace')  { e.preventDefault(); h.onBackspace() }
      if (e.key === 'ArrowRight') { e.preventDefault(); h.onArrowRight() }
      if (e.key === 'Escape')     h.onEscape()
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (KB_MIDI_MAP[key] !== undefined) {
        pressed.current.delete(key)
        handlersRef.current.onReleaseNote(KB_MIDI_MAP[key])
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [enabled])
}
