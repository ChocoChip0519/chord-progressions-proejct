export class CircularQueue<T> {
  private items: T[] = [];
  private _currentIndex = 0;

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | null {
    if (this.items.length === 0) return null;
    const item = this.items.shift()!;
    if (this._currentIndex > 0) this._currentIndex--;
    return item;
  }

  peek(): T | null {
    return this.items.length > 0 ? this.items[0] : null;
  }

  current(): T | null {
    if (this.items.length === 0) return null;
    return this.items[this._currentIndex] ?? null;
  }

  advance(): void {
    if (this.items.length === 0) return;
    this._currentIndex = (this._currentIndex + 1) % this.items.length;
  }

  retreat(): void {
    if (this.items.length === 0) return;
    this._currentIndex =
      (this._currentIndex - 1 + this.items.length) % this.items.length;
  }

  get currentIndex(): number {
    return this._currentIndex;
  }

  toArray(): T[] {
    return [...this.items];
  }

  get size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
    this._currentIndex = 0;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
