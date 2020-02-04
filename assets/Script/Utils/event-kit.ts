/*
用法1:
import { Emitter, CompositeDisposable } from "event-kit";

class Somthing {
    disposables = new CompositeDisposable();

    constructor(user: User) {
        this.disposables.add(user.onDidChangeName(()=>{}));
        this.disposables.add(user.onDidChangePhone(()=>{}));
    }

    destroy() {
        this.disposables.dispose();
    }
}

class User {
    emitter = new Emitter();
    private name: string;
    private phone: string;

    onDidChangeName(callback: (name: string) => void) {
        return this.emitter.on("did-change-name", callback);
    }

    onDidChangePhone(callback: (phone: string) => void) {
        return this.emitter.on("did-change-phone", callback);
    }

    setName(name: string) {
        if (name != this.name) {
            this.name = name;
            this.emitter.emit("did-change-name", name);
        }
    }

    setPhone(phone: string) {
        if (phone != this.phone) {
            this.phone = phone;
            this.emitter.emit("did-change-phone", phone);
        }
    }
}
*/
/*
用法2:
class User {
    private name: string;
    private emitter = new Emitter();
    onNameChangeEvent = this.emitter.createEvent<(name: string) => void>("did-change-name");

    setName(name: string) {
        if (name != this.name) {
            this.onNameChangeEvent.emit(this.name);
        }
    }
}

class Something {
    disposables = new CompositeDisposable();
    constructor(user: User) {
        this.disposables.add(user.onNameChangeEvent.on(() => {}));
    }
    destroy() {
        this.disposables.dispose();
    }
}
*/

export class Disposable {
    private _disposed = false;
    private _disposalAction: () => void;

    constructor(disposalAction: () => void) {
        this._disposalAction = disposalAction;
    }

    get disposed() {
        return this._disposed;
    }

    dispose() {
        if (!this.disposed) {
            this._disposed = true;
            if (this._disposalAction) {
                this._disposalAction();
                this._disposalAction = null;
            }
        }
    }
}

export class CompositeDisposable {
    private _disposed = false;
    private _disposables: Set<Disposable> = new Set();

    constructor(...disposables: Disposable[]) {
        for (let disposable of disposables) {
            this.add(disposable);
        }
    }

    add(disposable: Disposable) {
        if (!this._disposed) {
            if (disposable) {
                this._disposables.add(disposable);
            }
        }
    }

    remove(disposable: Disposable) {
        if (!this._disposed) {
            this._disposables.delete(disposable);
        }
    }

    clear() {
        if (!this._disposed) {
            this._disposables.clear();
        }
    }

    dispose() {
        if (!this._disposed) {
            this._disposed = true;
            this._disposables.forEach((disposable) => {
                disposable.dispose();
            });
            this._disposables = null;
        }
    }
}

export class Event<T extends (...args: any[]) => void> {
    private emitter: Emitter;
    private name: string | symbol;

    constructor(emitter: Emitter, name: string | symbol) {
        this.emitter = emitter;
        this.name = name;
    }

    getName() {
        return this.name;
    }

    toString() {
        return `[Event ${this.name.toString()}]`;
    }

    on(handler: T, unshift: boolean = false) {
        return this.emitter.on(this.name, handler, unshift);
    }

    once(handler: T, unshift: boolean = false) {
        this.emitter.once(this.name, handler, unshift);
    }

    readonly emit = ((...argsparam: any[]) => {
        argsparam.unshift(this.name);
        this.emitter.emit.apply(this.emitter, argsparam);
    }) as T;
}

export class Emitter {
    private _disposed = false;
    private _handlersByEventName: Map<string | symbol, Array<(...args: any[]) => void>> = new Map();

    get disposed() {
        return this._disposed;
    }

    clear() {
        this._handlersByEventName.clear();
    }

    dispose() {
        this._handlersByEventName = null;
        this._disposed = true;
    }

    createEvent<T extends (...args: any[]) => void>(eventName?: string | symbol) {
        if (!eventName) {
            return new Event<T>(this, Symbol("Event"));
        }
        return new Event<T>(this, eventName);
    }

    on(eventName: string | symbol, handler: (...args) => void, unshift: boolean = false) {
        if (this._disposed) {
            throw new Error("Emitter has been diposed");
        }

        let currentHandler = this._handlersByEventName.get(eventName);
        if (currentHandler) {
            if (unshift) {
                currentHandler.unshift(handler);
            } else {
                currentHandler.push(handler);
            }
        } else {
            this._handlersByEventName.set(eventName, [handler]);
        }
        return new Disposable(this.off.bind(this, eventName, handler));
    }

    once(eventName: string | symbol, handler: (...args) => void, unshift: boolean = false) {
        let wrapped = (...args) => {
            disposable.dispose();
            handler(...args);
        };
        let disposable = this.on(eventName, wrapped, unshift);
    }

    private off = (eventName: string | symbol, handlerToRemove) => {
        if (this._disposed) return;
        let oldHandlers = this._handlersByEventName.get(eventName);
        if (oldHandlers) {
            let newHandlers = [];
            for (let handler of oldHandlers) {
                if (handler != handlerToRemove) {
                    newHandlers.push(handler);
                }
            }
            if (newHandlers.length) {
                this._handlersByEventName.set(eventName, newHandlers);
            } else {
                this._handlersByEventName.delete(eventName);
            }
        }
    };

    emit(eventName: string | symbol, ...args) {
        let handlers = this._handlersByEventName.get(eventName);
        if (handlers) {
            for (let handler of handlers) {
                try {
                    handler(...args);
                } catch (e) {
                    cc.error(e);
                }
            }
        }
    }

    getEventNames() {
        let ret: string[] = [];
        for (let k of this._handlersByEventName.keys()) {
            if (typeof (k) === 'string') {
                ret.push(k);
            }
        }
        return ret;
    }

    getEventSymbols() {
        let ret: symbol[] = [];
        for (let k of this._handlersByEventName.keys()) {
            if (typeof (k) === 'symbol') {
                ret.push(k);
            }
        }
        return ret;
    }

    listenerCountForEventName(eventName: string | symbol) {
        let handlers = this._handlersByEventName.get(eventName);
        return handlers ? handlers.length : 0;
    }

    getTotalListenerCount() {
        let result = 0;
        for (let eventName of this._handlersByEventName.keys()) {
            result += this._handlersByEventName.get(eventName).length;
        }
        return result;
    }
}
