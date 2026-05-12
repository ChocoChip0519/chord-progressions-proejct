interface WhiteKeyProps {
  midi: number;
  keyLabel: string;
  isPressed: boolean;
  isRecommended: boolean;
  onPress: (midi: number) => void;
  onRelease: (midi: number) => void;
}

export function WhiteKey({ midi, keyLabel, isPressed, isRecommended, onPress, onRelease }: WhiteKeyProps) {
  const bg = isPressed
    ? '#a8d8ff'
    : isRecommended
    ? '#cce8ff'
    : '#fff';

  return (
    <div
      onMouseDown={() => onPress(midi)}
      onMouseUp={() => onRelease(midi)}
      onMouseLeave={() => onRelease(midi)}
      style={{
        width: 48,
        height: 160,
        background: bg,
        border: '1px solid #aaa',
        borderRadius: '0 0 6px 6px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 8,
        fontSize: 12,
        color: '#555',
        userSelect: 'none',
        boxSizing: 'border-box',
        transition: 'background 0.08s',
        flexShrink: 0,
      }}
    >
      {keyLabel}
    </div>
  );
}
