import { create } from 'zustand'
import { Stack } from '../lib/datastructures/Stack'
import { Queue } from '../lib/datastructures/Queue'
import { detectMode, inferKey, chordToDegree, type Genre, type Mode } from '../lib/music/degreeConverter'
import { getRecommendations, type RecommendCandidate } from '../lib/music/recommendEngine'
import { parseChord } from '../lib/music/chordParser'

export interface HistoryEntry {
  name: string
  midi: number[]
}

interface EditorState {
  // session meta
  title: string
  genre: Genre
  rootNote: string        // 'C' ~ 'B'
  modeOverride: Mode | null  // null = auto-detect
  bpm: number

  // derived / internal
  currentMode: Mode
  currentTonicMidi: number
  modeLabel: string

  // history (Stack)
  historyStack: Stack<HistoryEntry>
  degreeStack: Stack<string>
  historyArr: HistoryEntry[]  // mirror for react reactivity

  // recommend (Queue)
  recommendQueue: Queue<RecommendCandidate>
  recommendPage: number        // 0-based page index (4 per page)
  showRecommend: boolean

  // actions
  setTitle: (t: string) => void
  setGenre: (g: Genre) => void
  setRootNote: (n: string) => void
  setModeOverride: (m: Mode | null) => void
  setBpm: (b: number) => void

  confirmChord: (chordName: string, midi: number[]) => void
  undoChord: () => void

  openRecommend: () => void
  closeRecommend: () => void
  recommendPagePrev: () => void
  recommendPageNext: () => void

  confirmFromRecommend: (candidate: RecommendCandidate, variantChord?: string) => void

  reset: () => void
}

const PAGE_SIZE = 4

function makeInitial() {
  return {
    title: '',
    genre: 'pop' as Genre,
    rootNote: '',
    modeOverride: null as Mode | null,
    bpm: 120,
    currentMode: 'minor' as Mode,
    currentTonicMidi: 69,
    modeLabel: '장/단조 자동감지',
    historyStack: new Stack<HistoryEntry>(),
    degreeStack: new Stack<string>(),
    historyArr: [] as HistoryEntry[],
    recommendQueue: new Queue<RecommendCandidate>(),
    recommendPage: 0,
    showRecommend: false,
  }
}

export const useEditorStore = create<EditorState>((set, get) => ({
  ...makeInitial(),

  setTitle: (t) => set({ title: t }),
  setGenre: (g) => set({ genre: g }),
  setRootNote: (n) => set({ rootNote: n }),
  setModeOverride: (m) => {
    if (m === null) {
      set({ modeOverride: null, modeLabel: '장/단조 자동감지' })
    } else {
      const { currentTonicMidi } = get()
      set({ modeOverride: m, currentMode: m, modeLabel: m === 'major' ? '장조 (Major)' : '단조 (Minor)', currentTonicMidi })
    }
  },
  setBpm: (b) => set({ bpm: Math.min(300, Math.max(40, b)) }),

  confirmChord: (chordName, midi) => {
    const { historyStack, degreeStack, modeOverride } = get()

    historyStack.push({ name: chordName, midi })

    const chordNames = historyStack.toArray().map(e => e.name)
    const isFirst = chordNames.length === 1

    let mode: Mode
    let tonic: number
    let label: string

    if (modeOverride) {
      mode = modeOverride
      tonic = get().currentTonicMidi
      label = mode === 'major' ? '장조 (Major)' : '단조 (Minor)'
    } else if (isFirst) {
      // 첫 코드: 그 코드 자체를 tonic으로 잡음
      // major 기반 장르는 첫 코드 quality 무관하게 major로 고정
      const detected = detectMode(chordName)
      const majorGenres: Genre[] = ['pop', 'ballad', 'rock']
      mode = majorGenres.includes(get().genre) ? 'major' : detected.mode
      tonic = detected.tonicMidi
      label = mode === 'major' ? '장조 (Major)' : '단조 (Minor)'
    } else if (chordNames.length === 4) {
      // 4개째: 쌓인 코드 전체로 key 재추정
      const inferred = inferKey(chordNames)
      mode = inferred.mode
      tonic = inferred.tonicMidi
      label = mode === 'major' ? '장조 (Major)' : '단조 (Minor)'
    } else {
      mode = get().currentMode
      tonic = get().currentTonicMidi
      label = get().modeLabel
    }

    // 첫 코드는 무조건 I/i도, 나머지는 계산
    let degree: string
    if (isFirst) {
      degree = mode === 'major' ? 'I' : 'i'
    } else {
      degree = chordToDegree(chordName, tonic, mode) ?? '?'
    }

    // key가 재추정됐으면 기존 도수들도 재계산
    if (chordNames.length === 4) {
      degreeStack.clear()
      for (const name of chordNames.slice(0, -1)) {
        degreeStack.push(chordToDegree(name, tonic, mode) ?? '?')
      }
    }

    degreeStack.push(degree)

    set({
      currentMode: mode,
      currentTonicMidi: tonic,
      modeLabel: label,
      historyArr: historyStack.toArray(),
      showRecommend: false,
    })
  },

  undoChord: () => {
    const { historyStack, degreeStack } = get()
    historyStack.pop()
    degreeStack.pop()
    const init = makeInitial()
    if (historyStack.isEmpty()) {
      set({
        historyArr: [],
        currentMode: init.currentMode,
        currentTonicMidi: init.currentTonicMidi,
        modeLabel: init.modeLabel,
        showRecommend: false,
      })
    } else {
      set({ historyArr: historyStack.toArray(), showRecommend: false })
    }
  },

  openRecommend: () => {
    const { degreeStack, genre, currentMode, currentTonicMidi } = get()
    const queue = getRecommendations(degreeStack.toArray(), genre, currentMode, currentTonicMidi)
    set({ recommendQueue: queue, recommendPage: 0, showRecommend: true })
  },

  closeRecommend: () => set({ showRecommend: false }),

  recommendPagePrev: () => {
    const { recommendPage } = get()
    if (recommendPage > 0) set({ recommendPage: recommendPage - 1 })
  },

  recommendPageNext: () => {
    const { recommendPage, recommendQueue } = get()
    if ((recommendPage + 1) * PAGE_SIZE < recommendQueue.size) {
      set({ recommendPage: recommendPage + 1 })
    }
  },

  confirmFromRecommend: (candidate, variantChord) => {
    const chordName = variantChord ?? candidate.mainChord
    const midi = variantChord
      ? (parseChord(variantChord)?.notes ?? candidate.notes)
      : candidate.notes
    get().confirmChord(chordName, midi)
  },

  reset: () => {
    const init = makeInitial()
    set(init)
  },
}))

export { PAGE_SIZE }
