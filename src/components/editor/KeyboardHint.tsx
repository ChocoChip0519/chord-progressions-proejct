interface HintItem {
  key: string;
  label: string;
}

const HINTS: HintItem[] = [
  { key: 'Enter', label: '코드 확정' },
  { key: '←', label: '마지막 코드 삭제' },
  { key: '→', label: '추천 받기' },
  { key: 'Esc', label: '팝업 닫기' },
];

export function KeyboardHint() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {HINTS.map(({ key, label }) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <kbd
            style={{
              padding: '2px 8px',
              background: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
            }}
          >
            {key}
          </kbd>
          <span style={{ fontSize: 12, color: '#666' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
