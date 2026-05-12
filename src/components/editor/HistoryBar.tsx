import type { ChordEntry } from '@/store/useEditorStore';

interface HistoryBarProps {
  history: ChordEntry[];
}

export function HistoryBar({ history }: HistoryBarProps) {
  if (history.length === 0) {
    return (
      <div style={{ color: '#888', fontSize: 14, padding: '12px 0' }}>
        건반을 눌러 코드를 입력하고 Enter로 확정하세요
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '12px 0' }}>
      {history.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              background: '#1a1a2e',
              color: '#fff',
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            {entry.chord}
          </div>
          {i < history.length - 1 && (
            <span style={{ color: '#888', fontSize: 18 }}>→</span>
          )}
        </div>
      ))}
    </div>
  );
}
