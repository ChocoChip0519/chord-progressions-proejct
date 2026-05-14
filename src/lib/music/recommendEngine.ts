import { Graph } from '../datastructures/Graph'
import { Queue } from '../datastructures/Queue'
import { degreeToChord, degreeVariants, type Genre, type Mode } from './degreeConverter'
import { parseChord } from './chordParser'
import chordEdgesRaw from '../../data/chordEdges.json'
import chordPatternsRaw from '../../data/chordPatterns.json'

// ── Types ─────────────────────────────────────────────
export interface RecommendCandidate {
  degree: string
  score: number
  variants: string[]        // e.g. ['Am', 'Am7', 'Am9']
  mainChord: string         // variants[0]
  notes: number[]           // MIDI notes for mainChord
}

interface EdgeEntry { from: string; to: string; weight: number }
interface PatternEntry { id: string; genre: string; degrees: string[]; length: number; weight: number }

// ── Build genre graphs once at module load ─────────────
const genreGraphs: Record<string, Graph> = {}

function ensureGraph(genre: string) {
  if (genreGraphs[genre]) return
  const g = new Graph()
  const edges = (chordEdgesRaw as Record<string, EdgeEntry[]>)[genre] ?? []
  edges.forEach(e => g.addEdge(e.from, e.to, e.weight))
  genreGraphs[genre] = g
}

// ── Recommend engine ───────────────────────────────────
export function getRecommendations(
  degreeHistory: string[],
  genre: Genre,
  mode: Mode,
  tonicMidi: number,
): Queue<RecommendCandidate> {
  ensureGraph(genre)
  const graph = genreGraphs[genre]
  const patterns = (chordPatternsRaw as PatternEntry[]).filter(p => p.genre === genre)
  const scoreMap: Record<string, number> = {}

  // ① Graph transition score (weight × 2)
  const last = degreeHistory.at(-1)
  if (last) {
    for (const edge of graph.getTopNeighbors(last, 12)) {
      scoreMap[edge.to] = (scoreMap[edge.to] ?? 0) + edge.weight * 2
    }
  }

  // ② Pattern matching score
  for (const pat of patterns) {
    const prog = pat.degrees
    const len = degreeHistory.length
    for (let start = 0; start <= prog.length - 1; start++) {
      const windowSize = Math.min(len, prog.length - start)
      if (windowSize === 0) continue
      const histSlice = degreeHistory.slice(-windowSize)
      const progSlice = prog.slice(start, start + windowSize)
      if (histSlice.every((d, i) => d === progSlice[i])) {
        const nextIdx = start + windowSize
        if (nextIdx < prog.length) {
          scoreMap[prog[nextIdx]] = (scoreMap[prog[nextIdx]] ?? 0) + pat.weight
        }
      }
    }
  }

  // When no history yet, seed with genre defaults
  if (degreeHistory.length === 0) {
    const defaults = mode === 'major'
      ? ['I', 'IV', 'V', 'vi']
      : ['i', 'VI', 'VII', 'III']
    defaults.forEach((d, idx) => {
      scoreMap[d] = (scoreMap[d] ?? 0) + (100 - idx * 15)
    })
  }

  const sorted = Object.entries(scoreMap)
    .map(([degree, score]) => ({ degree, score: Math.round(score) }))
    .sort((a, b) => b.score - a.score)

  const queue = new Queue<RecommendCandidate>()
  for (const { degree, score } of sorted) {
    const variants = degreeVariants(degree, tonicMidi, mode)
    const mainChord = variants[0] ?? degreeToChord(degree, tonicMidi, mode) ?? degree
    const parsed = parseChord(mainChord)
    queue.enqueue({
      degree,
      score,
      variants,
      mainChord,
      notes: parsed?.notes ?? [],
    })
  }
  return queue
}
