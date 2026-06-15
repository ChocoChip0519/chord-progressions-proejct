export class ChordGraph {
  constructor() { this.adj = {}; }

  loadFromData(data) {
    this.adj = {};
    for (const from in data) {
      this.adj[from] = {};
      for (const to in data[from]) {
        this.adj[from][to] = data[from][to];
      }
    }
  }

  addEdge(from, to, w) {
    if (!this.adj[from]) this.adj[from] = {};
    this.adj[from][to] = w;
  }

  // 그래프에서 from 노드의 이웃을 가중치 순으로 반환 (필터링 없음)
  getRecommendations(from, topN = 4) {
    const m = this.adj[from];
    if (!m) return [];

    // 인접 노드를 배열로 변환
    const arr = [];
    for (const r in m) {
      arr.push({ romanNumeral: r, weight: m[r] });
    }

    // 가중치 높은 순으로 정렬
    arr.sort((a, b) => b.weight - a.weight);

    // 상위 topN개만 반환
    const result = [];
    for (let i = 0; i < topN && i < arr.length; i++) {
      result.push(arr[i]);
    }
    return result;
  }

  randomWalk(start, steps, diatonic, genre = null) {
    const out = [start];
    let cur = start;
    for (let i = 0; i < steps; i++) {
      const recs = filterByDiatonic(this.getRecommendations(cur, 8), diatonic, genre);
      if (!recs.length) break;
      let total = 0;
      for (let j = 0; j < recs.length; j++) total += recs[j].weight;
      let pick = Math.random() * total;
      let chosen = recs[0].romanNumeral;
      for (const r of recs) {
        if (pick < r.weight) { chosen = r.romanNumeral; break; }
        pick -= r.weight;
      }
      out.push(chosen);
      cur = chosen;
    }
    return out;
  }
}

// 추천 결과에서 조성(diatonic)에 맞는 코드만 추리기
export function filterByDiatonic(recs, diatonic, genre = null) {
  if (!diatonic || !diatonic.length) return recs;

  const JAZZ_EXTRAS = ["bII7", "VI7", "II7"];
  const result = [];

  for (let i = 0; i < recs.length; i++) {
    const x = recs[i];

    let inDiatonic = false;
    for (let j = 0; j < diatonic.length; j++) {
      if (diatonic[j] === x.romanNumeral) { inDiatonic = true; break; }
    }

    let inJazzExtras = false;
    for (let j = 0; j < JAZZ_EXTRAS.length; j++) {
      if (JAZZ_EXTRAS[j] === x.romanNumeral) { inJazzExtras = true; break; }
    }

    if (inDiatonic || (genre === "rock" && x.romanNumeral === "bVII") || (genre === "jazz" && inJazzExtras)) {
      result.push(x);
    }
  }

  return result;
}

export class ProgressionStack {
  constructor() { this.current = []; this.past = []; this.future = []; }

  push(item) {
    this.past.push([...this.current]);
    this.current.push(item);
    this.future = [];
  }

  set(newArr) {
    this.past.push([...this.current]);
    this.current = [...newArr];
    this.future = [];
  }

  // undo 히스토리 없이 배열을 통째로 교체 (프로젝트 로드 시 사용)
  load(newArr) {
    this.past = [];
    this.current = [...newArr];
    this.future = [];
  }

  undo() {
    if (!this.past.length) return null;
    this.future.push([...this.current]);
    this.current = this.past.pop();
    return this.current;
  }

  redo() {
    if (!this.future.length) return null;
    this.past.push([...this.current]);
    this.current = this.future.pop();
    return this.current;
  }

  peek() { return this.current[this.current.length - 1] || null; }
  getAll() { return [...this.current]; }

  clear() {
    this.past.push([...this.current]);
    this.current = [];
    this.future = [];
  }

  canUndo() { return this.past.length > 0; }
  canRedo() { return this.future.length > 0; }
}

export class PlaybackQueue {
  constructor() { this.items = []; }

  enqueueAll(items) { this.items.push(...items); }
  dequeue() { return this.items.shift(); }
  isEmpty() { return this.items.length === 0; }
  peek() { return this.items[0] ?? null; }
  size() { return this.items.length; }
  clear() { this.items = []; }
}
