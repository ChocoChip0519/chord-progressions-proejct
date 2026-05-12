import { create } from 'zustand';
import { Tree, type TreeNode } from '@/lib/datastructures/Tree';
import {
  fetchCards,
  upsertCard,
  deleteCard,
  reorderCards,
  type CardRow,
} from '@/lib/supabase/cardsApi';
import {
  fetchFolders,
  createFolder,
  deleteFolder,
  renameFolder,
  addCardToFolder,
  removeCardFromFolder,
  type FolderRow,
} from '@/lib/supabase/foldersApi';

export interface FolderData {
  name: string;
}

function buildTree(folders: FolderRow[]): Tree<FolderData> {
  const tree = new Tree<FolderData>();
  folders.forEach((f) => {
    const node: TreeNode<FolderData> = {
      id: f.id,
      data: { name: f.name },
      children: [],
      parentId: null,
    };
    tree.insert(node, null);
  });
  return tree;
}

interface CardStore {
  cards: CardRow[];
  folders: FolderRow[];
  folderTree: Tree<FolderData>;
  cardFolderMap: Record<string, string[]>;
  activeFolder: string | null;
  sortMode: 'title' | 'date';
  treeVersion: number;
  userId: string;

  loadAll: () => Promise<void>;
  addCard: (card: Partial<CardRow>) => Promise<CardRow>;
  updateCard: (id: string, patch: Partial<CardRow>) => Promise<void>;
  removeCard: (id: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<void>;
  addFolder: (name: string) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  moveCardToFolder: (cardId: string, folderId: string) => Promise<void>;
  removeCardFromFolder: (cardId: string, folderId: string) => Promise<void>;
  setActiveFolder: (id: string | null) => void;
  setSortMode: (mode: 'title' | 'date') => void;
  getVisibleCards: () => CardRow[];
}

function getUserId(): string {
  const key = 'chord_user_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export const useCardStore = create<CardStore>((set, get) => ({
  cards: [],
  folders: [],
  folderTree: new Tree<FolderData>(),
  cardFolderMap: {},
  activeFolder: null,
  sortMode: 'date',
  treeVersion: 0,
  userId: getUserId(),

  loadAll: async () => {
    const { userId } = get();
    const [cards, folders] = await Promise.all([fetchCards(userId), fetchFolders(userId)]);
    const tree = buildTree(folders);
    set({ cards, folders, folderTree: tree, treeVersion: get().treeVersion + 1 });
  },

  addCard: async (card) => {
    const { userId, cards } = get();
    const newCard = await upsertCard({
      ...card,
      user_id: userId,
      sort_order: cards.length,
    });
    set({ cards: [...cards, newCard] });
    return newCard;
  },

  updateCard: async (id, patch) => {
    const { cards } = get();
    await upsertCard({ id, ...patch });
    set({ cards: cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  },

  removeCard: async (id) => {
    await deleteCard(id);
    set({ cards: get().cards.filter((c) => c.id !== id) });
  },

  reorder: async (orderedIds) => {
    await reorderCards(orderedIds);
    const cardMap = new Map(get().cards.map((c) => [c.id, c]));
    const reordered = orderedIds
      .map((id, i) => {
        const c = cardMap.get(id);
        return c ? { ...c, sort_order: i } : null;
      })
      .filter(Boolean) as CardRow[];
    set({ cards: reordered });
  },

  addFolder: async (name) => {
    const { userId, folders, folderTree, treeVersion } = get();
    const folder = await createFolder(name, userId);
    const node: TreeNode<FolderData> = {
      id: folder.id,
      data: { name: folder.name },
      children: [],
      parentId: null,
    };
    folderTree.insert(node, null);
    set({ folders: [...folders, folder], treeVersion: treeVersion + 1 });
  },

  removeFolder: async (id) => {
    const { folders, folderTree, treeVersion } = get();
    await deleteFolder(id);
    folderTree.remove(id);
    set({ folders: folders.filter((f) => f.id !== id), treeVersion: treeVersion + 1 });
  },

  renameFolder: async (id, name) => {
    const { folders, folderTree, treeVersion } = get();
    await renameFolder(id, name);
    const node = folderTree.findById(id);
    if (node) node.data.name = name;
    set({ folders: folders.map((f) => (f.id === id ? { ...f, name } : f)), treeVersion: treeVersion + 1 });
  },

  moveCardToFolder: async (cardId, folderId) => {
    const { cardFolderMap } = get();
    await addCardToFolder(cardId, folderId);
    const prev = cardFolderMap[cardId] ?? [];
    if (!prev.includes(folderId)) {
      set({ cardFolderMap: { ...cardFolderMap, [cardId]: [...prev, folderId] } });
    }
  },

  removeCardFromFolder: async (cardId, folderId) => {
    const { cardFolderMap } = get();
    await removeCardFromFolder(cardId, folderId);
    const prev = cardFolderMap[cardId] ?? [];
    set({ cardFolderMap: { ...cardFolderMap, [cardId]: prev.filter((f) => f !== folderId) } });
  },

  setActiveFolder: (id) => set({ activeFolder: id }),
  setSortMode: (mode) => set({ sortMode: mode }),

  getVisibleCards: () => {
    const { cards, activeFolder, cardFolderMap, sortMode } = get();
    let visible = activeFolder === null
      ? cards
      : cards.filter((c) => (cardFolderMap[c.id] ?? []).includes(activeFolder));

    if (sortMode === 'title') {
      visible = [...visible].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      visible = [...visible].sort((a, b) => a.sort_order - b.sort_order);
    }
    return visible;
  },
}));
