import {defaultToString} from './DataUtil';
import {LinkedList} from './LinkedList';
import {ValuePair} from './models/value-pair';

export class HashMap<K, V> {

    protected map: { [key: number]: LinkedList<ValuePair<K, V>> };

    constructor(protected toStrFn: (key: K) => string = defaultToString) {
        this.map = {};
    }

    private loseloseHashCode(key: K): number {
        if (typeof key === 'number') {
            return key;
        }
        const tableKey = this.toStrFn(key);
        let hash = 0;
        for (let i = 0; i < tableKey.length; i++) {
            hash += tableKey.charCodeAt(i);
        }
        return hash % 37;
    }

    hashCode(key: K): number {
        // return 1; // test LinkedList
        return this.loseloseHashCode(key);
    }

    set(key: K, value: V): V | null {
        const position = this.hashCode(key);
        if (this.map[position] == null) {
            this.map[position] = new LinkedList<ValuePair<K, V>>();
            this.map[position].push(new ValuePair(key, value));
            return null;
        } else {
            const linkedList: LinkedList<ValuePair<K, V>> = this.map[position];
            let current = linkedList.getHead();
            while (current != null) {
                if (this.keyEquals(current.element.key, key)) {
                    let old = current.element.value;
                    current.element.value = value; // replace
                    return old;
                }
                current = current.next;
            }
            linkedList.push(new ValuePair(key, value)); // add
            return null;
        }
    }

    has(key: K): boolean {
        return this.get(key) != undefined;
    }

    get(key: K): V | null {
        const position = this.hashCode(key);
        const linkedList = this.map[position];
        if (linkedList != null && !linkedList.isEmpty()) {
            let current = linkedList.getHead();
            while (current != null) {
                if (this.keyEquals(current.element.key, key)) {
                    return current.element.value;
                }
                current = current.next;
            }
        }
        return null;
    }

    delete(key: K): boolean {
        const position = this.hashCode(key);
        const linkedList = this.map[position];
        if (linkedList != null && !linkedList.isEmpty()) {
            let current = linkedList.getHead();
            while (current != null) {
                if (this.keyEquals(current.element.key, key)) {
                    linkedList.remove(current.element);
                    if (linkedList.isEmpty()) {
                        delete this.map[position];
                    }
                    return true;
                }
                current = current.next;
            }
        }
        return false;
    }

    private keyEquals(elementKey, key): boolean {
        if (elementKey === key) {
            return true;
        }
        if (key.equals) {
            return elementKey.equals(key);
        }
        return false;
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    size(): number {
        let count = 0;
        Object.keys(this.map).forEach((value, index, array) => {
            let linkedList = this.map[value];
            count += linkedList.size();
        });
        //Object.values(this.map).forEach(linkedList => count += linkedList.size());
        return count;
    }

    clear() {
        this.map = {};
    }

    entries(): Array<ValuePair<K, V>>{
        let entries: Array<ValuePair<K, V>> = new Array<ValuePair<K, V>>();
        Object.keys(this.map).forEach((key, index, array) => {
            let linkedList: LinkedList<ValuePair<K, V>> = this.map[key];
            linkedList.toArray().forEach(value => {
                entries.push(value);
            });
        });
        return entries;
    }

    keys(): Array<K>{
        let keys: Array<K> = new Array<K>();
        Object.keys(this.map).forEach((key, index, array) => {
            let linkedList: LinkedList<ValuePair<K, V>> = this.map[key];
            linkedList.toArray().forEach(value => {
                keys.push(value.key);
            });
        });
        return keys;
    }

    values(): Array<V>{
        let values: Array<V> = new Array<V>();
        Object.keys(this.map).forEach((key, index, array) => {
            let linkedList: LinkedList<ValuePair<K, V>> = this.map[key];
            linkedList.toArray().forEach(value => {
                values.push(value.value);
            });
        });
        return values;
    }

    toString() {
        if (this.isEmpty()) {
            return '';
        }
        const keys = Object.keys(this.map);
        let objString = `{${keys[0]} => ${this.map[keys[0]].toString()}}`;
        for (let i = 1; i < keys.length; i++) {
            objString = `${objString},{${keys[i]} => ${this.map[keys[i]].toString()}}`;
        }
        return objString;
    }

    //注释掉了，还是不要开放给外部改变比较好
    // getMap() {
    //     return this.map;
    // }
}
