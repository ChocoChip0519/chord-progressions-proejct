import { WHITE_MIDI, BLACK_DEFS, KEY_TO_MIDI } from '@/lib/music/chordParser';
import { WhiteKey } from './WhiteKey';
import { BlackKey } from './BlackKey';

const MIDI_TO_KEY = Object.fromEntries(
  Object.entries(KEY_TO_MIDI).map(([k, v]) => [v, k.toUpperCase()])
);

interface PianoKeyboardProps {
  pressedMidi: Set<number>;
  recommendMidi: Set<number>;
  onPress: (midi: number) => void;
  onRelease: (midi: number) => void;
}

export function PianoKeyboard({ pressedMidi, recommendMidi, onPress, onRelease }: PianoKeyboardProps) {
  return (
    <div style={{ position: 'relative', display: 'flex', userSelect: 'none', height: 160 }}>
      {WHITE_MIDI.map((midi) => (
        <WhiteKey
          key={midi}
          midi={midi}
          keyLabel={MIDI_TO_KEY[midi] ?? ''}
          isPressed={pressedMidi.has(midi)}
          isRecommended={recommendMidi.has(midi)}
          onPress={onPress}
          onRelease={onRelease}
        />
      ))}
      {BLACK_DEFS.map(({ midi, leftOffset }) => (
        <BlackKey
          key={midi}
          midi={midi}
          keyLabel={MIDI_TO_KEY[midi] ?? ''}
          leftOffset={leftOffset}
          isPressed={pressedMidi.has(midi)}
          isRecommended={recommendMidi.has(midi)}
          onPress={onPress}
          onRelease={onRelease}
        />
      ))}
    </div>
  );
}
