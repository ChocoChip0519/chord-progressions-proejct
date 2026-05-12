import { useEffect } from 'react';
import { KEY_TO_MIDI } from '@/lib/music/chordParser';

interface UseKeyboardOptions {
  onConfirm: () => void;
  onUndo: () => void;
  onOpenPopup: () => void;
  onClosePopup: () => void;
  pressKey: (midi: number) => void;
  releaseKey: (midi: number) => void;
  isPopupOpen: boolean;
  disabled?: boolean;
}

export function useKeyboard({
  onConfirm,
  onUndo,
  onOpenPopup,
  onClosePopup,
  pressKey,
  releaseKey,
  isPopupOpen,
  disabled = false,
}: UseKeyboardOptions): void {
  useEffect(() => {
    if (disabled) return;

    function isInputFocused(): boolean {
      const el = document.activeElement;
      return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
    }

    function handleKeyDown(e: KeyboardEvent): void {
      if (isInputFocused()) return;

      if (e.key === 'Escape') {
        if (isPopupOpen) onClosePopup();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (!isPopupOpen) onConfirm();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (!isPopupOpen) onUndo();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!isPopupOpen) onOpenPopup();
        return;
      }

      const midi = KEY_TO_MIDI[e.key.toLowerCase()];
      if (midi !== undefined && !e.repeat) {
        pressKey(midi);
      }
    }

    function handleKeyUp(e: KeyboardEvent): void {
      if (isInputFocused()) return;
      const midi = KEY_TO_MIDI[e.key.toLowerCase()];
      if (midi !== undefined) releaseKey(midi);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled, isPopupOpen, onConfirm, onUndo, onOpenPopup, onClosePopup, pressKey, releaseKey]);
}
