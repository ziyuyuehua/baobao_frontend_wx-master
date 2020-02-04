/**
 * @author Lizhen
 * @date 2019/10/30
 * @Description:
 */
import {WxServices} from "../../CustomizedComponent/login/WxServices";
import {JsonMgr} from "./JsonManager";

class GameManagerClass {
    private constructor() {
    }

    private static _instance: GameManagerClass;

    public static get instance(): GameManagerClass {
        if (this._instance == null) {
            this._instance = new GameManagerClass();
        }
        return this._instance;
    }

    private _WxServices: WxServices = new WxServices();

    private _wxVersion: string = "";

    // private _system: string = "iOS";//机型
    private _system: string = "";//机型

    private _isDebug: boolean = false;//debug调试模式可以跳过微信登陆

    get WxServices(): WxServices {
        return this._WxServices;
    }

    get isDebug(): boolean {
        return this._isDebug;
    }

    get wxVersion(): string {
        return this._wxVersion;
    }

    set wxVersion(value: string) {
        this._wxVersion = value;
    }

    set system(value: string) {
        this._system = value;
    }

    public isIos(): boolean {//判断是否是ios系统
        return this._system == "iOS";
    }

    public isHaveAdUnitId(): boolean {//是否开启广告
        let cost = JsonMgr.getAniConstVal("adUnitId");
        return cost != "null";
    }
}

export const GameManager: GameManagerClass = GameManagerClass.instance;
