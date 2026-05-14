import { useState } from 'react'
import { useCardStore } from '../../store/useCardStore'

export default function FolderTabBar() {
  const { folders, activeFolderId, setActiveFolder, addFolder, renameFolder, deleteFolder } = useCardStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const startEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const commitEdit = () => {
    if (editingId && editName.trim()) {
      renameFolder(editingId, editName.trim())
    }
    setEditingId(null)
  }

  const handleAdd = () => {
    const id = addFolder('새 폴더')
    startEdit(id, '새 폴더')
    setActiveFolder(id)
  }

  return (
    <div className="folder-tabbar">
      {/* Built-in "all" tab */}
      <button
        className={`folder-tab${activeFolderId === 'all' ? ' folder-tab--active' : ''}`}
        onClick={() => setActiveFolder('all')}
      >
        작업 list
      </button>

      {folders.map(f => (
        <div key={f.id} className={`folder-tab-wrap${activeFolderId === f.id ? ' folder-tab-wrap--active' : ''}`}>
          {editingId === f.id ? (
            <input
              className="folder-tab-input"
              value={editName}
              autoFocus
              onChange={e => setEditName(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={e => {
                if (e.key === 'Enter') commitEdit()
                if (e.key === 'Escape') setEditingId(null)
              }}
            />
          ) : (
            <button
              className={`folder-tab${activeFolderId === f.id ? ' folder-tab--active' : ''}`}
              onClick={() => setActiveFolder(f.id)}
              onDoubleClick={() => startEdit(f.id, f.name)}
            >
              {f.name}
            </button>
          )}
          {activeFolderId === f.id && (
            <button
              className="folder-tab__delete"
              title="폴더 삭제"
              onClick={() => deleteFolder(f.id)}
            >×</button>
          )}
        </div>
      ))}

      <button className="folder-tab folder-tab--add" onClick={handleAdd}>+</button>
    </div>
  )
}
