export class Queue<T> {
  private items: T[] = []
  private head = 0

  enqueue(item: T): void {
    this.items.push(item)
  }

  dequeue(): T | null {
    if (this.head >= this.items.length) return null
    const item = this.items[this.head]
    this.head++
    // compact when wasted space is large
    if (this.head > 50 && this.head > this.items.length / 2) {
      this.items = this.items.slice(this.head)
      this.head = 0
    }
    return item
  }

  peek(): T | null {
    return this.items[this.head] ?? null
  }

  peekAt(index: number): T | null {
    return this.items[this.head + index] ?? null
  }

  get size(): number {
    return this.items.length - this.head
  }

  isEmpty(): boolean {
    return this.size === 0
  }

  toArray(): T[] {
    return this.items.slice(this.head)
  }

  clear(): void {
    this.items = []
    this.head = 0
  }

  /** Circular navigation: advance cursor by 1, wrapping around */
  rotate(): T | null {
    if (this.size === 0) return null
    const item = this.dequeue()!
    this.enqueue(item)
    return this.peek()
  }

  rotateBack(): T | null {
    if (this.size === 0) return null
    const arr = this.toArray()
    const last = arr.pop()!
    this.clear()
    this.enqueue(last)
    arr.forEach(i => this.enqueue(i))
    return this.peek()
  }
}
