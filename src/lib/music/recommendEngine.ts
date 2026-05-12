import { WeightedDirectedGraph } from '@/lib/datastructures/Graph';
import { patterns, genreWeights, transitions } from './chordData';
import type { Mode } from './degreeConverter';

export interface Candidate {
  degree: string;
  score: number;
}

let _majorGraph: WeightedDirectedGraph | null = null;
let _minorGraph: WeightedDirectedGraph | null = null;

export function getMajorGraph(): WeightedDirectedGraph {
  if (!_majorGraph) _majorGraph = WeightedDirectedGraph.fromTransitions(transitions.major);
  return _majorGraph;
}

export function getMinorGraph(): WeightedDirectedGraph {
  if (!_minorGraph) _minorGraph = WeightedDirectedGraph.fromTransitions(transitions.minor);
  return _minorGraph;
}

function nextDegreeFromPattern(history: string[], patternRelative: string[]): string | null {
  const prog = patternRelative;
  const len = history.length;

  for (let start = 0; start <= prog.length - 1; start++) {
    const windowSize = Math.min(len, prog.length - start);
    const histSlice = history.slice(-windowSize);
    const progSlice = prog.slice(start, start + windowSize);

    if (histSlice.every((d, i) => d === progSlice[i])) {
      const nextIdx = start + windowSize;
      return nextIdx < prog.length ? prog[nextIdx] : prog[0];
    }
  }
  return null;
}

export function recommend(
  historyDegrees: string[],
  mode: Mode,
  genre = 'pop',
  maxResults = 8
): Candidate[] {
  const scoreMap: Record<string, number> = {};

  const graph = mode === 'major' ? getMajorGraph() : getMinorGraph();
  const lastDegree = historyDegrees[historyDegrees.length - 1];

  if (lastDegree) {
    const neighbors = graph.getNeighbors(lastDegree);
    for (const edge of neighbors) {
      scoreMap[edge.to] = (scoreMap[edge.to] ?? 0) + edge.weight * 2;
    }
  }

  const modePatterns = patterns.filter((p) => p.type === mode);
  const weights = genreWeights[genre]?.patternBonus ?? {};

  for (const pat of modePatterns) {
    const nextDeg = nextDegreeFromPattern(historyDegrees, pat.relative);
    if (!nextDeg) continue;
    const baseScore = pat.weight;
    const genreBonus = weights[pat.id] ?? 1.0;
    scoreMap[nextDeg] = (scoreMap[nextDeg] ?? 0) + baseScore * genreBonus;
  }

  return Object.entries(scoreMap)
    .map(([degree, score]) => ({ degree, score: Math.round(score) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
