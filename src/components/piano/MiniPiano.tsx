import { WHITE_MIDI, BLACK_DEFS } from '@/lib/music/chordParser';

interface MiniPianoProps {
  highlightMidi: Set<number>;
  pressedMidi?: Set<number>;
  onPress?: (midi: number) => void;
  onRelease?: (midi: number) => void;
}

export function MiniPiano({ highlightMidi, pressedMidi = new Set(), onPress, onRelease }: MiniPianoProps) {
  const scale = 0.55;
  const ww = 48 * scale;
  const wh = 160 * scale;
  const bw = 32 * scale;
  const bh = 100 * scale;

  return (
    <div style={{ position: 'relative', display: 'flex', height: wh, userSelect: 'none' }}>
      {WHITE_MIDI.map((midi) => {
        const isHighlight = highlightMidi.has(midi);
        const isPressed = pressedMidi.has(midi);
        const bg = isPressed ? '#a8d8ff' : isHighlight ? '#cce8ff' : '#fff';
        return (
          <div
            key={midi}
            onMouseDown={() => onPress?.(midi)}
            onMouseUp={() => onRelease?.(midi)}
            onMouseLeave={() => onRelease?.(midi)}
            style={{
              width: ww,
              height: wh,
              background: bg,
              border: '1px solid #aaa',
              borderRadius: `0 0 ${4 * scale}px ${4 * scale}px`,
              cursor: onPress ? 'pointer' : 'default',
              boxSizing: 'border-box',
              flexShrink: 0,
              transition: 'background 0.08s',
            }}
          />
        );
      })}
      {BLACK_DEFS.map(({ midi, leftOffset }) => {
        const isHighlight = highlightMidi.has(midi);
        const isPressed = pressedMidi.has(midi);
        const bg = isPressed ? '#4a9eff' : isHighlight ? '#1a6abf' : '#222';
        return (
          <div
            key={midi}
            onMouseDown={(e) => { e.stopPropagation(); onPress?.(midi); }}
            onMouseUp={(e) => { e.stopPropagation(); onRelease?.(midi); }}
            onMouseLeave={() => onRelease?.(midi)}
            style={{
              position: 'absolute',
              left: leftOffset * ww - bw / 2,
              top: 0,
              width: bw,
              height: bh,
              background: bg,
              borderRadius: `0 0 ${3 * scale}px ${3 * scale}px`,
              cursor: onPress ? 'pointer' : 'default',
              zIndex: 2,
              transition: 'background 0.08s',
            }}
          />
        );
      })}
    </div>
  );
}
