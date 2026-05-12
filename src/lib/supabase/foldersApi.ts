import { supabase } from './client';

export interface FolderRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  sort_order: number;
}

const FOLDERS_KEY = 'chord_folders';
const CARD_FOLDERS_KEY = 'chord_card_folders';

function loadLocalFolders(): FolderRow[] {
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    return raw ? (JSON.parse(raw) as FolderRow[]) : [];
  } catch {
    return [];
  }
}

function saveLocalFolders(folders: FolderRow[]): void {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

function loadLocalCardFolders(): Array<{ card_id: string; folder_id: string }> {
  try {
    const raw = localStorage.getItem(CARD_FOLDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCardFolders(pairs: Array<{ card_id: string; folder_id: string }>): void {
  localStorage.setItem(CARD_FOLDERS_KEY, JSON.stringify(pairs));
}

export async function fetchFolders(_userId: string): Promise<FolderRow[]> {
  if (!supabase) return loadLocalFolders();
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as FolderRow[]) ?? [];
}

export async function createFolder(name: string, userId: string): Promise<FolderRow> {
  if (!supabase) {
    const folders = loadLocalFolders();
    const folder: FolderRow = {
      id: crypto.randomUUID(),
      user_id: userId,
      name,
      created_at: new Date().toISOString(),
      sort_order: folders.length,
    };
    folders.push(folder);
    saveLocalFolders(folders);
    return folder;
  }
  const { data, error } = await supabase
    .from('folders')
    .insert({ name, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as FolderRow;
}

export async function deleteFolder(id: string): Promise<void> {
  if (!supabase) {
    const folders = loadLocalFolders().filter((f) => f.id !== id);
    saveLocalFolders(folders);
    const pairs = loadLocalCardFolders().filter((p) => p.folder_id !== id);
    saveLocalCardFolders(pairs);
    return;
  }
  const { error } = await supabase.from('folders').delete().eq('id', id);
  if (error) throw error;
}

export async function renameFolder(id: string, name: string): Promise<void> {
  if (!supabase) {
    const folders = loadLocalFolders().map((f) => (f.id === id ? { ...f, name } : f));
    saveLocalFolders(folders);
    return;
  }
  const { error } = await supabase.from('folders').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function addCardToFolder(cardId: string, folderId: string): Promise<void> {
  if (!supabase) {
    const pairs = loadLocalCardFolders();
    if (!pairs.some((p) => p.card_id === cardId && p.folder_id === folderId)) {
      pairs.push({ card_id: cardId, folder_id: folderId });
      saveLocalCardFolders(pairs);
    }
    return;
  }
  const { error } = await supabase
    .from('card_folders')
    .upsert({ card_id: cardId, folder_id: folderId });
  if (error) throw error;
}

export async function removeCardFromFolder(cardId: string, folderId: string): Promise<void> {
  if (!supabase) {
    const pairs = loadLocalCardFolders().filter(
      (p) => !(p.card_id === cardId && p.folder_id === folderId)
    );
    saveLocalCardFolders(pairs);
    return;
  }
  const { error } = await supabase
    .from('card_folders')
    .delete()
    .eq('card_id', cardId)
    .eq('folder_id', folderId);
  if (error) throw error;
}

export async function fetchCardIdsInFolder(folderId: string): Promise<string[]> {
  if (!supabase) {
    return loadLocalCardFolders()
      .filter((p) => p.folder_id === folderId)
      .map((p) => p.card_id);
  }
  const { data, error } = await supabase
    .from('card_folders')
    .select('card_id')
    .eq('folder_id', folderId);
  if (error) throw error;
  return (data as Array<{ card_id: string }>).map((r) => r.card_id);
}
