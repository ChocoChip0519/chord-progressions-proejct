export interface TreeNode<T> {
  id: string;
  data: T;
  children: TreeNode<T>[];
  parentId: string | null;
}

export class Tree<T> {
  root: TreeNode<T> | null = null;
  private nodeMap: Map<string, TreeNode<T>> = new Map();

  insert(node: TreeNode<T>, parentId: string | null = null): void {
    this.nodeMap.set(node.id, node);

    if (parentId === null) {
      if (!this.root) {
        this.root = node;
      } else {
        this.root.children.push(node);
      }
      return;
    }

    const parent = this.nodeMap.get(parentId);
    if (parent) {
      node.parentId = parentId;
      parent.children.push(node);
    }
  }

  remove(nodeId: string): void {
    const node = this.nodeMap.get(nodeId);
    if (!node) return;

    if (node.parentId) {
      const parent = this.nodeMap.get(node.parentId);
      if (parent) {
        parent.children = parent.children.filter((c) => c.id !== nodeId);
      }
    } else if (this.root?.id === nodeId) {
      this.root = null;
    }

    this.nodeMap.delete(nodeId);
  }

  findById(nodeId: string): TreeNode<T> | null {
    return this.nodeMap.get(nodeId) ?? null;
  }

  toFlat(): TreeNode<T>[] {
    return Array.from(this.nodeMap.values());
  }

  get size(): number {
    return this.nodeMap.size;
  }
}
