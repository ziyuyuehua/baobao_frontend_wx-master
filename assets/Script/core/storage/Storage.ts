/**
 * @Author whg
 * @Date 2019/9/23
 * @Desc
 */

const {ccclass, property} = cc._decorator;

@ccclass
export class Storage {

    static setItem<T>(key: string, value: T){
        cc.sys.localStorage.setItem(key, value);
    }

    static getItem<T>(key: string): T{
        return cc.sys.localStorage.getItem(key);
    }

    static removeItem(key: string){
        cc.sys.localStorage.removeItem(key);
    }

    static size(){
        return cc.sys.localStorage.length;
    }

    static clear(){
        cc.sys.localStorage.clear();
    }

}

