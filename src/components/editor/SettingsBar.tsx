import { useEditorStore } from '@/store/useEditorStore';

const GENRES = ['pop', 'r&b', 'ballad', 'rock'];

export function SettingsBar() {
  const { genre, bpm, mode, setGenre, setBpm } = useEditorStore();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            style={{
              padding: '4px 14px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: genre === g ? 700 : 400,
              background: genre === g ? '#1a1a2e' : '#eee',
              color: genre === g ? '#fff' : '#333',
              transition: 'all 0.15s',
            }}
          >
            {g.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, color: '#666' }}>BPM</span>
        <input
          type="number"
          min={40}
          max={300}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          style={{
            width: 64,
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid #ccc',
            fontSize: 14,
            textAlign: 'center',
          }}
        />
      </div>

      <div
        style={{
          padding: '4px 12px',
          borderRadius: 20,
          background: mode === 'minor' ? '#2d1b4e' : '#1a4e2d',
          color: '#fff',
          fontSize: 12,
        }}
      >
        {mode === 'minor' ? '단조 (Minor)' : '장조 (Major)'}
      </div>
    </div>
  );
}
