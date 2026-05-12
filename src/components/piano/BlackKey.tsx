interface BlackKeyProps {
  midi: number;
  keyLabel: string;
  leftOffset: number;
  isPressed: boolean;
  isRecommended: boolean;
  onPress: (midi: number) => void;
  onRelease: (midi: number) => void;
}

export function BlackKey({ midi, keyLabel, leftOffset, isPressed, isRecommended, onPress, onRelease }: BlackKeyProps) {
  const bg = isPressed
    ? '#4a9eff'
    : isRecommended
    ? '#1a6abf'
    : '#222';

  return (
    <div
      onMouseDown={(e) => { e.stopPropagation(); onPress(midi); }}
      onMouseUp={(e) => { e.stopPropagation(); onRelease(midi); }}
      onMouseLeave={() => onRelease(midi)}
      style={{
        position: 'absolute',
        left: leftOffset * 48 - 16,
        top: 0,
        width: 32,
        height: 100,
        background: bg,
        borderRadius: '0 0 4px 4px',
        cursor: 'pointer',
        zIndex: 2,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 6,
        fontSize: 10,
        color: isPressed || isRecommended ? '#fff' : '#aaa',
        userSelect: 'none',
        transition: 'background 0.08s',
      }}
    >
      {keyLabel}
    </div>
  );
}
