export class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | null {
    return this.items.length > 0 ? this.items.pop()! : null;
  }

  peek(): T | null {
    return this.items.length > 0 ? this.items[this.items.length - 1] : null;
  }

  toArray(): T[] {
    return [...this.items];
  }

  get size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
