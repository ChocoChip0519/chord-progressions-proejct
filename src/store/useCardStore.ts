import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Tree } from '../lib/datastructures/Tree'
import type { Genre, Mode } from '../lib/music/degreeConverter'

export interface CardData {
  id: string
  title: string
  chords: string[]
  genre: Genre
  mode: Mode
  key: string
  bpm: number
  createdAt: number
  updatedAt: number
  order: number
}

export interface FolderData {
  id: string
  name: string
  cardIds: string[]
}

interface CardStoreState {
  cards: CardData[]
  folders: FolderData[]
  folderTree: Tree<FolderData>
  activeFolderId: string   // 'all' = 작업 list

  // card actions
  addCard: (card: Omit<CardData, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => string
  updateCard: (id: string, updates: Partial<CardData>) => void
  deleteCard: (id: string) => void
  reorderCards: (folderId: string, orderedIds: string[]) => void

  // folder actions
  addFolder: (name: string) => string
  renameFolder: (id: string, name: string) => void
  deleteFolder: (id: string) => void
  setActiveFolder: (id: string) => void

  // card ↔ folder
  addCardToFolder: (cardId: string, folderId: string) => void
  removeCardFromFolder: (cardId: string, folderId: string) => void

  // derived
  getCardsForFolder: (folderId: string) => CardData[]
}

const ALL_FOLDER = 'all'

// Tree is not JSON-serializable so we keep it in memory and rebuild on hydrate
function rebuildTree(folders: FolderData[]): Tree<FolderData> {
  const t = new Tree<FolderData>()
  // root = virtual "all"
  const rootData: FolderData = { id: ALL_FOLDER, name: '작업 list', cardIds: [] }
  t.addRoot(ALL_FOLDER, rootData)
  folders.forEach(f => t.addChild(ALL_FOLDER, f.id, f))
  return t
}

let _tree = rebuildTree([])

export const useCardStore = create<CardStoreState>()(
  persist(
    (set, get) => ({
      cards: [],
      folders: [],
      folderTree: _tree,
      activeFolderId: ALL_FOLDER,

      addCard: (card) => {
        const id = crypto.randomUUID()
        const now = Date.now()
        const newCard: CardData = {
          ...card,
          id,
          createdAt: now,
          updatedAt: now,
          order: get().cards.length,
        }
        set(s => ({ cards: [...s.cards, newCard] }))
        return id
      },

      updateCard: (id, updates) => {
        set(s => ({
          cards: s.cards.map(c =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        }))
      },

      deleteCard: (id) => {
        set(s => ({
          cards: s.cards.filter(c => c.id !== id),
          folders: s.folders.map(f => ({
            ...f,
            cardIds: f.cardIds.filter(cid => cid !== id),
          })),
        }))
      },

      reorderCards: (_folderId, orderedIds) => {
        set(s => ({
          cards: s.cards.map(c => {
            const idx = orderedIds.indexOf(c.id)
            return idx >= 0 ? { ...c, order: idx } : c
          }),
        }))
      },

      addFolder: (name) => {
        const id = crypto.randomUUID()
        const folder: FolderData = { id, name, cardIds: [] }
        set(s => {
          const folders = [...s.folders, folder]
          _tree = rebuildTree(folders)
          return { folders, folderTree: _tree }
        })
        return id
      },

      renameFolder: (id, name) => {
        set(s => {
          const folders = s.folders.map(f => f.id === id ? { ...f, name } : f)
          _tree = rebuildTree(folders)
          _tree.rename(id, folders.find(f => f.id === id)!)
          return { folders, folderTree: _tree }
        })
      },

      deleteFolder: (id) => {
        set(s => {
          const folders = s.folders.filter(f => f.id !== id)
          _tree = rebuildTree(folders)
          return {
            folders,
            folderTree: _tree,
            activeFolderId: s.activeFolderId === id ? ALL_FOLDER : s.activeFolderId,
          }
        })
      },

      setActiveFolder: (id) => set({ activeFolderId: id }),

      addCardToFolder: (cardId, folderId) => {
        set(s => ({
          folders: s.folders.map(f =>
            f.id === folderId && !f.cardIds.includes(cardId)
              ? { ...f, cardIds: [...f.cardIds, cardId] }
              : f
          ),
        }))
      },

      removeCardFromFolder: (cardId, folderId) => {
        set(s => ({
          folders: s.folders.map(f =>
            f.id === folderId
              ? { ...f, cardIds: f.cardIds.filter(id => id !== cardId) }
              : f
          ),
        }))
      },

      getCardsForFolder: (folderId) => {
        const { cards, folders } = get()
        if (folderId === ALL_FOLDER) {
          return [...cards].sort((a, b) => a.order - b.order)
        }
        const folder = folders.find(f => f.id === folderId)
        if (!folder) return []
        return folder.cardIds
          .map(id => cards.find(c => c.id === id))
          .filter((c): c is CardData => !!c)
      },
    }),
    {
      name: 'chord-cards',
      partialize: (s) => ({ cards: s.cards, folders: s.folders, activeFolderId: s.activeFolderId }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          _tree = rebuildTree(state.folders)
          state.folderTree = _tree
        }
      },
    }
  )
)
