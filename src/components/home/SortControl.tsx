import { useCardStore } from '@/store/useCardStore';

export function SortControl() {
  const { sortMode, setSortMode } = useCardStore();

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#888' }}>정렬:</span>
      {(['date', 'title'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setSortMode(mode)}
          style={{
            padding: '4px 12px',
            borderRadius: 16,
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            background: sortMode === mode ? '#1a1a2e' : '#eee',
            color: sortMode === mode ? '#fff' : '#555',
            transition: 'all 0.15s',
          }}
        >
          {mode === 'date' ? '최신순' : '이름순'}
        </button>
      ))}
    </div>
  );
}
