export class ChordGraph {
  constructor() { this.adj = new Map(); }

  loadFromData(data) {
    this.adj.clear();
    for (const from in data) {
      const m = new Map();
      for (const to in data[from]) m.set(to, data[from][to]);
      this.adj.set(from, m);
    }
  }

  addEdge(from, to, w) {
    if (!this.adj.has(from)) this.adj.set(from, new Map());
    this.adj.get(from).set(to, w);
  }

  getRecommendations(from, diatonic, topN = 4, genre = null) {
    const m = this.adj.get(from);
    if (!m) return [];
    let arr = [...m.entries()].map(([r, w]) => ({ romanNumeral: r, weight: w }));
    if (diatonic && diatonic.length) {
      const allowed = new Set(diatonic);
      const JAZZ_EXTRAS = new Set(["bII7", "VI7", "II7"]);
      arr = arr.filter(x =>
        allowed.has(x.romanNumeral) ||
        (genre === "rock" && x.romanNumeral === "bVII") ||
        (genre === "jazz" && JAZZ_EXTRAS.has(x.romanNumeral))
      );
    }
    arr.sort((a, b) => b.weight - a.weight);
    return arr.slice(0, topN);
  }

  randomWalk(start, steps, diatonic, genre = null) {
    const out = [start];
    let cur = start;
    for (let i = 0; i < steps; i++) {
      const recs = this.getRecommendations(cur, diatonic, 8, genre);
      if (!recs.length) break;
      const total = recs.reduce((s, r) => s + r.weight, 0);
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
