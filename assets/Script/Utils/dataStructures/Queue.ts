/**
 * @Author whg
 * @Date 2019/7/26
 * @Desc
 */

export class Queue<T> {

    private readonly capacity: number;

    private items: any = {};
    private inIndex: number = 0;
    private outIndex: number = 0;

    constructor(capacity: number = 8) {
        this.capacity = capacity;
    }

    //入队列
    enqueue(element: T): boolean {
        if(this.isFull()){
            return false;
        }
        this.items[this.inIndex] = element;
        this.inIndex++;
        return true;
    }

    //出队列
    dequeue(): T {
        if (this.isEmpty()) {
            return undefined;
        }
        const result = this.items[this.outIndex];
        delete this.items[this.outIndex];
        this.outIndex++;
        return result;
    }

    //查看队列第1个数据
    peek(): T {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.items[this.outIndex];
    }

    isFull(): boolean {
        return this.size() >= this.capacity;
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    size(): number {
        return this.inIndex - this.outIndex;
    }

    clear() {
        this.items = {};
        this.inIndex = 0;
        this.outIndex = 0;
    }

    toString(): string {
        if (this.isEmpty()) {
            return '';
        }
        let objString = `${this.items[this.outIndex]}`;
        for (let i = this.outIndex + 1; i < this.inIndex; i++) {
            objString = `${objString},${this.items[i]}`;
        }
        return objString;
    }
}

