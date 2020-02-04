import {CarMoveManager, CarName, ICarMove} from "../../CustomizedComponent/MapShow/CarMoveManager";

/**
 * User: songwang
 * Date: 2019-12-05 17:04
 * Note: ...
 */

export class tipsRunManager {

    private tipsQue: Array<ITipsData> = new Array<ITipsData>();
    private tipsState: boolean = false;
    private static _instance: tipsRunManager = null;

    static instance() {
        if (!tipsRunManager._instance) {
            tipsRunManager._instance = new tipsRunManager();
        }
        return tipsRunManager._instance;
    }

    addTipsArrToQue(tipsData: ITipsData) {
        this.tipsQue.push(tipsData);
        if (!this.tipsState) {
            this.tipsState = true;
            this.tipsQue[0].cb(this.nextFunc);
        }
    }

    nextFunc = () => {
        this.tipsQue.splice(0, 1);
        let nowTips = this.tipsQue[0];
        if (nowTips) {
            this.tipsState = true;
            nowTips.cb(this.nextFunc);
        } else {
            this.tipsState = false;
        }
    }
}

interface ITipsData {
    tipsArr: string[];
    cb: Function;
}

export const tipsMgr = tipsRunManager.instance();