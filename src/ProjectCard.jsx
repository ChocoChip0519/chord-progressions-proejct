import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

const CHORD_DATA_GENRES_COLORS = {
  pop: '#6c63ff',
  jazz: '#e07b39',
  rock: '#d63031',
  blues: '#2980b9',
};

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return '방금 전';
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  return new Date(ts).toLocaleDateString('ko-KR');
}

function chordPreviewLines(progression) {
  if (!progression.length) return '코드 없음';
  return progression.map(c => c.name).join('  →  ');
}

function FolderPickerModal({ project, folders, onMove, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="folder-picker-backdrop" onMouseDown={onClose} onClick={e => e.stopPropagation()}>
      <div className="folder-picker-panel" onMouseDown={e => e.stopPropagation()}>
        <div className="folder-picker-title">폴더로 이동</div>
        <button
          className={`folder-picker-option${!project.folderId ? ' active' : ''}`}
          onClick={() => { onMove(project.id, null); onClose(); }}
        >
          <span className="folder-picker-dot" style={{ background: '#A89F95' }} />
          <span style={{ flex: 1 }}>폴더 없음</span>
          {!project.folderId && <span className="folder-picker-check">✓</span>}
        </button>
        {folders.length > 0 && <div className="folder-picker-divider" />}
        {folders.map(f => (
          <button
            key={f.id}
            className={`folder-picker-option${project.folderId === f.id ? ' active' : ''}`}
            onClick={() => { onMove(project.id, f.id); onClose(); }}
          >
            <span className="folder-picker-dot" style={{ background: f.color || '#A89F95' }} />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
            {project.folderId === f.id && <span className="folder-picker-check">✓</span>}
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}

function ProjectCard({ project, folders, isListView, animDelay = 0, onOpen, onDelete, onRename, onMove }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [showMove, setShowMove] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.select();
  }, [editing]);

  const commitRename = () => {
    const name = editName.trim() || '제목 없음';
    onRename(project.id, name);
    setEditing(false);
  };

  const startEditing = () => { setEditing(true); setEditName(project.name); };

  const folder = folders.find(f => f.id === project.folderId);
  const genre = project.session?.genre;
  const accentColor = genre ? (CHORD_DATA_GENRES_COLORS[genre] || '#A89F95') : '#A89F95';
  const folderColor = folder?.color || accentColor;
  const chordLine = chordPreviewLines(project.progression);

  return (
    <div
      className="proj-card"
      style={{ animationDelay: `${animDelay}s` }}
      onClick={() => { if (!editing) onOpen(project.id); }}
    >
      <div className="proj-card-color-bar" style={{ background: folderColor }} />

      {!isListView && (
        <div className="proj-card-preview">
          <div className="proj-card-preview-chords">
            {project.progression.slice(0, 12).map((c, i) => (
              <span key={i}>
                {c.name}
                {i < project.progression.length - 1 && i < 11
                  ? <span className="proj-card-arrow">→</span>
                  : ''}
              </span>
            ))}
            {project.progression.length === 0 && (
              <span style={{ opacity: 0.4 }}>코드 없음</span>
            )}
          </div>
          <div className="proj-card-preview-fade" />
        </div>
      )}

      <div className="proj-card-footer">
        <div className="proj-card-name" onDoubleClick={e => { e.stopPropagation(); startEditing(); }}>
          {editing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') { setEditing(false); setEditName(project.name); }
                e.stopPropagation();
              }}
              onClick={e => e.stopPropagation()}
            />
          ) : project.name}
        </div>

        {isListView && (
          <div className="proj-card-chords">{chordLine}</div>
        )}

        <div className="proj-card-footer-meta">
          {folder
            ? <span className="proj-card-folder-tag">
                <span className="proj-card-folder-dot" style={{ background: folder.color || '#A89F95' }} />
                {folder.name}
              </span>
            : <span />
          }
          <span>{relativeTime(project.updatedAt)}</span>
        </div>
      </div>

      <div className="proj-card-actions" onClick={e => e.stopPropagation()}>
        <button
          className="proj-card-action-btn"
          title="폴더 이동"
          onClick={() => setShowMove(true)}
        >📁</button>
        <button
          className="proj-card-action-btn danger"
          title="삭제"
          onClick={() => {
            if (window.confirm(`"${project.name}"을 삭제하시겠습니까?`)) onDelete(project.id);
          }}
        >🗑</button>
      </div>

      {showMove && (
        <FolderPickerModal
          project={project}
          folders={folders}
          onMove={onMove}
          onClose={() => setShowMove(false)}
        />
      )}
    </div>
  );
}

export default ProjectCard;
