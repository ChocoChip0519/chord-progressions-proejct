export interface Edge {
  to: string
  weight: number
}

export class Graph {
  private adjacency = new Map<string, Edge[]>()

  addEdge(from: string, to: string, weight: number): void {
    if (!this.adjacency.has(from)) this.adjacency.set(from, [])
    this.adjacency.get(from)!.push({ to, weight })
  }

  getNeighbors(node: string): Edge[] {
    return this.adjacency.get(node) ?? []
  }

  /** Returns edges sorted by weight descending */
  getTopNeighbors(node: string, limit = 8): Edge[] {
    return this.getNeighbors(node)
      .slice()
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit)
  }

  hasNode(node: string): boolean {
    return this.adjacency.has(node)
  }

  nodes(): string[] {
    return [...this.adjacency.keys()]
  }

  clear(): void {
    this.adjacency.clear()
  }
}
