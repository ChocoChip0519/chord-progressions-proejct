export interface GraphEdge {
  to: string;
  weight: number;
}

export class WeightedDirectedGraph {
  private adjacency: Map<string, GraphEdge[]> = new Map();

  addEdge(from: string, to: string, weight: number): void {
    if (!this.adjacency.has(from)) this.adjacency.set(from, []);
    this.adjacency.get(from)!.push({ to, weight });
  }

  getNeighbors(node: string): GraphEdge[] {
    return this.adjacency.get(node) ?? [];
  }

  getTopNeighbors(node: string, n = 8): GraphEdge[] {
    return this.getNeighbors(node)
      .slice()
      .sort((a, b) => b.weight - a.weight)
      .slice(0, n);
  }

  getAllNodes(): string[] {
    return Array.from(this.adjacency.keys());
  }

  hasNode(node: string): boolean {
    return this.adjacency.has(node);
  }

  static fromTransitions(
    table: Record<string, Record<string, number>>
  ): WeightedDirectedGraph {
    const graph = new WeightedDirectedGraph();
    for (const [from, targets] of Object.entries(table)) {
      for (const [to, weight] of Object.entries(targets)) {
        graph.addEdge(from, to, weight);
      }
    }
    return graph;
  }
}
