import { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

const GENRES = ['pop', 'r&b', 'ballad', 'rock'];

interface TitleGenreStepProps {
  onComplete: () => void;
}

export function TitleGenreStep({ onComplete }: TitleGenreStepProps) {
  const { setTitle, setGenre, genre } = useEditorStore();
  const [localTitle, setLocalTitle] = useState('');
  const [localGenre, setLocalGenre] = useState(genre);

  function handleComplete() {
    setTitle(localTitle);
    setGenre(localGenre);
    onComplete();
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 40,
          width: 400,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22 }}>새 코드 진행</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, color: '#555' }}>제목 (선택)</label>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleComplete()}
            autoFocus
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: 15,
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, color: '#555' }}>장르</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setLocalGenre(g)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: localGenre === g ? 700 : 400,
                  background: localGenre === g ? '#1a1a2e' : '#f0f0f0',
                  color: localGenre === g ? '#fff' : '#333',
                  transition: 'all 0.15s',
                }}
              >
                {g.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleComplete}
          style={{
            padding: '12px',
            borderRadius: 10,
            border: 'none',
            background: '#1a1a2e',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
