import React, { useState, useRef, useEffect } from 'react';
import ProjectCard from './ProjectCard.jsx';

const FOLDER_COLORS = ['#E8825A','#5B8FD4','#6DC08A','#C57BD6','#E8C45A','#5BB8C4','#D47C5B'];

function FolderBlock({
  folder, items, isListView,
  editingFolder, folderInputRef, folderEditName,
  setFolderEditName, commitFolderRename, setEditingFolder,
  onDeleteFolder, onOpenProject, onDeleteProject, onRenameProject, onMoveProject, folders,
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <section className={`dash-folder-block${items.length > 0 && !collapsed ? ' has-items' : ''}`}>
      <div className="dash-folder-header" onClick={() => setCollapsed(v => !v)}>
        <span className="dash-folder-chevron" data-open={!collapsed}>›</span>
        <span className="dash-folder-dot-badge" style={{ background: folder.color || '#A89F95' }} />
        {editingFolder === folder.id ? (
          <input
            ref={folderInputRef}
            className="dash-folder-input"
            value={folderEditName}
            onChange={e => setFolderEditName(e.target.value)}
            onBlur={() => commitFolderRename(folder.id)}
            onKeyDown={e => {
              if (e.key === 'Enter') commitFolderRename(folder.id);
              if (e.key === 'Escape') setEditingFolder(null);
              e.stopPropagation();
            }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="dash-folder-name">{folder.name}</span>
        )}
        <span className="dash-folder-count">{items.length}</span>
        <div className="dash-folder-actions" onClick={e => e.stopPropagation()}>
          <button className="dash-section-btn" onClick={() => { setEditingFolder(folder.id); setFolderEditName(folder.name); }}>이름 변경</button>
          <button className="dash-section-btn danger" onClick={() => {
            if (window.confirm(`"${folder.name}" 폴더를 삭제할까요?\n폴더 안의 작업은 삭제되지 않습니다.`))
              onDeleteFolder(folder.id);
          }}>삭제</button>
        </div>
      </div>
      {!collapsed && (
        items.length === 0 ? (
          <div className="dash-folder-empty">이 폴더에 작업이 없습니다.</div>
        ) : (
          <div className={`dash-grid${isListView ? ' list-view' : ''}`}>
            {items.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                folders={folders}
                isListView={isListView}
                animDelay={i * 0.04}
                onOpen={onOpenProject}
                onDelete={onDeleteProject}
                onRename={onRenameProject}
                onMove={onMoveProject}
              />
            ))}
          </div>
        )
      )}
    </section>
  );
}

function ProjectDashboard({
  projects, folders,
  onOpenProject, onNewProject,
  onDeleteProject, onRenameProject, onMoveProject,
  onCreateFolder, onDeleteFolder, onRenameFolder,
}) {
  const [sortOrder, setSortOrder] = useState('newest');
  const [isListView, setIsListView] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderEditName, setFolderEditName] = useState('');
  const [topbarTitle, setTopbarTitle] = useState('모두');
  const folderInputRef = useRef(null);

  useEffect(() => {
    if (editingFolder && folderInputRef.current) folderInputRef.current.select();
  }, [editingFolder]);

  const handleAddFolder = () => {
    const colorIdx = folders.length % FOLDER_COLORS.length;
    const folder = onCreateFolder('새 폴더', FOLDER_COLORS[colorIdx]);
    setEditingFolder(folder.id);
    setFolderEditName('새 폴더');
  };

  const commitFolderRename = (id) => {
    const name = folderEditName.trim() || '새 폴더';
    onRenameFolder(id, name);
    setEditingFolder(null);
  };

  const sortFn = (a, b) =>
    sortOrder === 'newest' ? b.updatedAt - a.updatedAt : a.updatedAt - b.updatedAt;

  const getFilteredProjects = () => {
    if (activeFilter === 'all') return projects;
    if (activeFilter === 'recent') return projects.filter(p => Date.now() - p.updatedAt < 86400000 * 7);
    if (activeFilter === 'unfiled') return projects.filter(p => !p.folderId);
    return projects.filter(p => p.folderId === activeFilter);
  };

  const filteredProjects = getFilteredProjects();
  const unfiled = filteredProjects.filter(p => !p.folderId).sort(sortFn);

  const byFolder = (activeFilter === 'all')
    ? folders.map(f => ({ folder: f, items: projects.filter(p => p.folderId === f.id).sort(sortFn) }))
    : (activeFilter === 'unfiled' || activeFilter === 'recent')
      ? []
      : folders
          .filter(f => f.id === activeFilter)
          .map(f => ({ folder: f, items: projects.filter(p => p.folderId === f.id).sort(sortFn) }));

  const selectFilter = (filter, title) => {
    setActiveFilter(filter);
    setTopbarTitle(title);
  };

  const hasAny = projects.length > 0 || folders.length > 0;
  const recentCount = projects.filter(p => Date.now() - p.updatedAt < 86400000 * 7).length;

  return (
    <div className="dash">
      {/* ── 사이드바 ── */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo">
          <div className="dash-logo-icon">♩</div>
          <span className="dash-logo">ChordFlow</span>
        </div>

        <div className="dash-sidebar-label">라이브러리</div>

        <div
          className={`dash-sidebar-item${activeFilter === 'all' ? ' active' : ''}`}
          onClick={() => selectFilter('all', '모두')}
        >
          <span style={{ fontSize: 14 }}>⊞</span>
          모두
          <span className="dash-sidebar-count">{projects.length}</span>
        </div>
        <div
          className={`dash-sidebar-item${activeFilter === 'recent' ? ' active' : ''}`}
          onClick={() => selectFilter('recent', '최근 작업')}
        >
          <span style={{ fontSize: 14 }}>◷</span>
          최근 작업
          <span className="dash-sidebar-count">{recentCount}</span>
        </div>

        {folders.length > 0 && (
          <>
            <div className="dash-sidebar-divider" />
            <div className="dash-sidebar-label">폴더</div>
            {folders.map(f => {
              const cnt = projects.filter(p => p.folderId === f.id).length;
              return (
                <div
                  key={f.id}
                  className={`dash-sidebar-item${activeFilter === f.id ? ' active' : ''}`}
                  onClick={() => selectFilter(f.id, f.name)}
                >
                  <span className="dash-sidebar-dot" style={{ background: f.color || '#A89F95' }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </span>
                  <span className="dash-sidebar-count">{cnt}</span>
                </div>
              );
            })}
          </>
        )}

        {unfiled.length > 0 && (
          <>
            <div className="dash-sidebar-divider" />
            <div
              className={`dash-sidebar-item${activeFilter === 'unfiled' ? ' active' : ''}`}
              onClick={() => selectFilter('unfiled', '폴더 없는 작업')}
            >
              <span style={{ fontSize: 14 }}>○</span>
              미분류
              <span className="dash-sidebar-count">{projects.filter(p => !p.folderId).length}</span>
            </div>
          </>
        )}

        <div className="dash-sidebar-footer">
          <button className="dash-sidebar-new-btn" onClick={onNewProject}>
            + 새 프로젝트
          </button>
        </div>
      </aside>

      {/* ── 메인 영역 ── */}
      <div className="dash-main">
        <div className="dash-topbar">
          <span className="dash-topbar-title">{topbarTitle}</span>
          <div className="dash-topbar-right">
            <div className="dash-sort-group">
              <button
                className={`dash-sort-option${sortOrder === 'newest' ? ' active' : ''}`}
                onClick={() => setSortOrder('newest')}
              >최신순</button>
              <button
                className={`dash-sort-option${sortOrder === 'oldest' ? ' active' : ''}`}
                onClick={() => setSortOrder('oldest')}
              >오래된 순</button>
            </div>
            <div className="dash-view-toggle">
              <button
                className={`dash-view-btn${!isListView ? ' active' : ''}`}
                onClick={() => setIsListView(false)}
                title="그리드 보기"
              >⊞</button>
              <button
                className={`dash-view-btn${isListView ? ' active' : ''}`}
                onClick={() => setIsListView(true)}
                title="목록 보기"
              >≡</button>
            </div>
            <button className="dash-folder-add-btn" onClick={handleAddFolder}>
              + 폴더
            </button>
            <button className="dash-new-btn" onClick={onNewProject}>
              + 새 프로젝트
            </button>
          </div>
        </div>

        <div className="dash-scroll">
          <div className="dash-content">
            {!hasAny ? (
              <div className="dash-empty">
                <div className="dash-empty-icon">♩</div>
                <div className="dash-empty-title">아직 저장된 작업이 없어요</div>
                <div className="dash-empty-sub">새 프로젝트를 만들어 코드 진행을 시작해보세요.</div>
                <button className="dash-new-btn" onClick={onNewProject} style={{ marginTop: 24 }}>
                  + 새 프로젝트
                </button>
              </div>
            ) : (
              <>
                {/* recent / unfiled — 폴더 구분 없이 플랫 뷰 */}
                {(activeFilter === 'recent' || activeFilter === 'unfiled') && (
                  filteredProjects.length === 0 ? (
                    <div className="dash-empty">
                      <div className="dash-empty-icon" style={{ fontSize: 36 }}>○</div>
                      <div className="dash-empty-title">
                        {activeFilter === 'recent' ? '최근 7일간 작업한 프로젝트가 없어요' : '미분류 작업이 없어요'}
                      </div>
                    </div>
                  ) : (
                    <div className={`dash-grid${isListView ? ' list-view' : ''}`}>
                      {filteredProjects.sort(sortFn).map((p, i) => (
                        <ProjectCard
                          key={p.id}
                          project={p}
                          folders={folders}
                          isListView={isListView}
                          animDelay={i * 0.04}
                          onOpen={onOpenProject}
                          onDelete={onDeleteProject}
                          onRename={onRenameProject}
                          onMove={onMoveProject}
                        />
                      ))}
                    </div>
                  )
                )}

                {/* all / 폴더 필터 */}
                {activeFilter !== 'recent' && activeFilter !== 'unfiled' && (
                  <>
                    {byFolder.map(({ folder, items }) => (
                      <FolderBlock
                        key={folder.id}
                        folder={folder}
                        items={items}
                        isListView={isListView}
                        editingFolder={editingFolder}
                        folderInputRef={folderInputRef}
                        folderEditName={folderEditName}
                        setFolderEditName={setFolderEditName}
                        commitFolderRename={commitFolderRename}
                        setEditingFolder={setEditingFolder}
                        onDeleteFolder={onDeleteFolder}
                        onOpenProject={onOpenProject}
                        onDeleteProject={onDeleteProject}
                        onRenameProject={onRenameProject}
                        onMoveProject={onMoveProject}
                        folders={folders}
                      />
                    ))}

                    {unfiled.length > 0 && (
                      <section className="dash-section">
                        <div className="dash-section-header">
                          <span className="dash-section-title">폴더 없는 작업</span>
                          <span className="dash-section-count">{unfiled.length}</span>
                        </div>
                        <div className={`dash-grid${isListView ? ' list-view' : ''}`}>
                          {unfiled.map((p, i) => (
                            <ProjectCard
                              key={p.id}
                              project={p}
                              folders={folders}
                              isListView={isListView}
                              animDelay={i * 0.04}
                              onOpen={onOpenProject}
                              onDelete={onDeleteProject}
                              onRename={onRenameProject}
                              onMove={onMoveProject}
                            />
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDashboard;
