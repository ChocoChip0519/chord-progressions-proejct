import { useDroppable } from '@dnd-kit/core';
import { useState } from 'react';
import { useCardStore } from '@/store/useCardStore';
import type { FolderRow } from '@/lib/supabase/foldersApi';

interface FolderTabProps {
  id: string | null;
  label: string;
  isActive: boolean;
  onClick: () => void;
  onRename?: (name: string) => void;
  onDelete?: () => void;
}

function FolderTab({ id, label, isActive, onClick, onRename, onDelete }: FolderTabProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(label);

  const droppableId = id ?? '__all__';
  const { isOver, setNodeRef } = useDroppable({ id: droppableId, data: { type: 'folder', folderId: id } });

  const style: React.CSSProperties = {
    padding: '8px 18px',
    borderRadius: '10px 10px 0 0',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: isActive ? 700 : 400,
    background: isActive ? '#fff' : isOver ? '#e8eaff' : '#ececf0',
    color: isActive ? '#1a1a2e' : '#666',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    outline: isOver ? '2px solid #5a5adf' : 'none',
    position: 'relative',
  };

  if (editing && onRename) {
    return (
      <div ref={setNodeRef} style={{ ...style, padding: '4px 8px' }}>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => { onRename(name); setEditing(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { onRename(name); setEditing(false); } }}
          style={{ width: 80, fontSize: 13, border: '1px solid #ccc', borderRadius: 4, padding: '2px 6px' }}
        />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} onClick={onClick}>
      <span onDoubleClick={() => onRename && setEditing(true)}>{label}</span>
      {onDelete && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#aaa', padding: 0, lineHeight: 1 }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export function FolderTabBar() {
  const { folders, activeFolder, setActiveFolder, addFolder, removeFolder, renameFolder } = useCardStore();

  async function handleAddFolder() {
    const name = prompt('폴더 이름을 입력하세요');
    if (name?.trim()) await addFolder(name.trim());
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, borderBottom: '2px solid #e0e0e8', paddingLeft: 4 }}>
      <FolderTab
        id={null}
        label="작업 list"
        isActive={activeFolder === null}
        onClick={() => setActiveFolder(null)}
      />
      {(folders as FolderRow[]).map((f) => (
        <FolderTab
          key={f.id}
          id={f.id}
          label={f.name}
          isActive={activeFolder === f.id}
          onClick={() => setActiveFolder(f.id)}
          onRename={(name) => renameFolder(f.id, name)}
          onDelete={() => {
            if (confirm(`"${f.name}" 폴더를 삭제할까요? 카드는 유지됩니다.`)) removeFolder(f.id);
          }}
        />
      ))}
      <button
        onClick={handleAddFolder}
        style={{
          padding: '8px 14px',
          borderRadius: '10px 10px 0 0',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 18,
          color: '#999',
          lineHeight: 1,
        }}
        title="새 폴더"
      >
        +
      </button>
    </div>
  );
}
