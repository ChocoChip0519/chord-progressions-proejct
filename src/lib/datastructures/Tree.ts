export interface TreeNode<T> {
  id: string
  data: T
  children: TreeNode<T>[]
  parentId: string | null
}

export class Tree<T> {
  private nodes = new Map<string, TreeNode<T>>()
  private rootIds: string[] = []

  addRoot(id: string, data: T): TreeNode<T> {
    const node: TreeNode<T> = { id, data, children: [], parentId: null }
    this.nodes.set(id, node)
    this.rootIds.push(id)
    return node
  }

  addChild(parentId: string, id: string, data: T): TreeNode<T> | null {
    const parent = this.nodes.get(parentId)
    if (!parent) return null
    const node: TreeNode<T> = { id, data, children: [], parentId }
    this.nodes.set(id, node)
    parent.children.push(node)
    return node
  }

  remove(id: string): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    // recursively remove children
    for (const child of [...node.children]) {
      this.remove(child.id)
    }
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId)
      if (parent) {
        parent.children = parent.children.filter(c => c.id !== id)
      }
    } else {
      this.rootIds = this.rootIds.filter(r => r !== id)
    }
    this.nodes.delete(id)
    return true
  }

  find(id: string): TreeNode<T> | null {
    return this.nodes.get(id) ?? null
  }

  roots(): TreeNode<T>[] {
    return this.rootIds.map(id => this.nodes.get(id)!).filter(Boolean)
  }

  allNodes(): TreeNode<T>[] {
    return [...this.nodes.values()]
  }

  rename(id: string, data: T): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    node.data = data
    return true
  }

  move(id: string, newParentId: string | null): boolean {
    const node = this.nodes.get(id)
    if (!node) return false
    // detach from old parent
    if (node.parentId) {
      const old = this.nodes.get(node.parentId)
      if (old) old.children = old.children.filter(c => c.id !== id)
    } else {
      this.rootIds = this.rootIds.filter(r => r !== id)
    }
    // attach to new parent
    node.parentId = newParentId
    if (newParentId) {
      const newParent = this.nodes.get(newParentId)
      if (!newParent) return false
      newParent.children.push(node)
    } else {
      this.rootIds.push(id)
    }
    return true
  }
}
