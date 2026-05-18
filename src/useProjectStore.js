import { useState, useEffect } from 'react';

const PROJECTS_KEY = 'chordflow_projects';
const FOLDERS_KEY = 'chordflow_folders';

function loadFromStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

export function useProjectStore() {
  const [projects, setProjects] = useState(() => loadFromStorage(PROJECTS_KEY));
  const [folders, setFolders] = useState(() => loadFromStorage(FOLDERS_KEY));

  useEffect(() => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  }, [folders]);

  function createProject(session) {
    const project = {
      id: crypto.randomUUID(),
      name: '제목 없음',
      folderId: null,
      session,
      progression: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProjects(prev => [project, ...prev]);
    return project;
  }

  function saveProject(id, { progression, session }) {
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, progression, session, updatedAt: Date.now() }
          : p
      )
    );
  }

  function deleteProject(id) {
    setProjects(prev => prev.filter(p => p.id !== id));
  }

  function renameProject(id, name) {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, name, updatedAt: Date.now() } : p))
    );
  }

  function moveProject(id, folderId) {
    setProjects(prev =>
      prev.map(p => (p.id === id ? { ...p, folderId, updatedAt: Date.now() } : p))
    );
  }

  function getProject(id) {
    return projects.find(p => p.id === id);
  }

  function createFolder(name, color = '#6c63ff') {
    const folder = { id: crypto.randomUUID(), name, color, createdAt: Date.now() };
    setFolders(prev => [...prev, folder]);
    return folder;
  }

  function deleteFolder(id) {
    setFolders(prev => prev.filter(f => f.id !== id));
    setProjects(prev =>
      prev.map(p => (p.folderId === id ? { ...p, folderId: null } : p))
    );
  }

  function renameFolder(id, name) {
    setFolders(prev => prev.map(f => (f.id === id ? { ...f, name } : f)));
  }

  return {
    projects,
    folders,
    createProject,
    saveProject,
    deleteProject,
    renameProject,
    moveProject,
    getProject,
    createFolder,
    deleteFolder,
    renameFolder,
  };
}
