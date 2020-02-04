import {HashMap} from "./HashMap";

const PRESENT: Object = {};

export class HashSet<T> {

    protected map: HashMap<T, Object>;

    constructor(array: Array<T> = null) {
        this.map = new HashMap<T, Object>();
        if(array){
            this.addArray(array);
        }
    }

    static oneSet<T>(t: T): HashSet<T>{
        const oneSet: HashSet<T> = new HashSet<T>();
        oneSet.add(t);
        return oneSet;
    }

    addArray(array: Array<T>): boolean {
        let result: boolean = false;
        array.forEach((value) => {
            result = this.add(value) || result;
        });
        return result;
    }

    addAll(set: HashSet<T>): boolean {
        return this.addArray(set.values());
    }

    add(value: T): boolean {
        return this.map.set(value, PRESENT) == null;
    }

    has(value: T): boolean {
        return this.map.has(value);
    }

    deleteArray(array: Array<T>): boolean {
        let result: boolean = false;
        array.forEach((value) => {
            result = this.delete(value) || result;
        });
        return result;
    }

    delete(value: T): boolean {
        return this.map.delete(value) == PRESENT;
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    size(): number {
        return this.map.size();
    }

    clear() {
        this.map = new HashMap<T, Object>();
    }

    //交集（set1和set2共有的相交的）
    interse(that: HashSet<T>): HashSet<T> {
        const intersectionSet = new HashSet<T>();

        let biggerSet: HashSet<T> = this;
        let smallerSet: HashSet<T> = that;

        if (that.size() > this.size()) {
            biggerSet = that;
            smallerSet = this;
        }

        smallerSet.values().forEach(value => {
            if (biggerSet.has(value)) {
                intersectionSet.add(value);
            }
        });

        return intersectionSet;
    }

    //并集（set1和set2全部的合并的）
    union(otherSet: HashSet<T>): HashSet<T> {
        const unionSet = new HashSet<T>();

        unionSet.addAll(this);
        unionSet.addAll(otherSet);
        //this.values().forEach(value => unionSet.add(value));
        //otherSet.values().forEach(value => unionSet.add(value));

        return unionSet;
    }

    diffArray(array: Array<T>): HashSet<T>{
       return this.diff(new HashSet(array));
    }

    //差集（set1删掉减去set2的）
    diff(otherSet: HashSet<T>): HashSet<T> {
        const differenceSet = new HashSet<T>();

        this.values().forEach(value => {
            if (!otherSet.has(value)) {
                differenceSet.add(value);
            }
        });

        return differenceSet;
    }

    values(): Array<T>{
        return this.map.keys();
    }

    toString() {
        if (this.isEmpty()) {
            return '';
        }
        return Object.keys(this.map);
    }

}
