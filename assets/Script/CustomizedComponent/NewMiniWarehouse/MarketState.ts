/**
*@Athuor ljx
*@Date 22:27
*/
import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {CacheMap} from "../MapShow/CacheMapDataManager";

const {ccclass, property} = cc._decorator;

@ccclass

export default class MarketState extends GameComponent {

    @property(cc.Node)
    private aniNode: cc.Node = null;
    @property(cc.Node)
    private iKnow: cc.Node = null;

    static rgba = [
        {
            r: 231,
            g: 104,
            b: 71
        },
        {
            r: 99,
            g: 141,
            b: 75
        }
    ];

    static url = "miniWarehouse/marketState";

    load(): void {
        this._bindEvent();
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.iKnow, this.closeOnly);
    }

    protected onEnable(): void {
        this.onShowPlay(2, this.aniNode);
    }

    protected getBaseUrl(): string {
        return MarketState.url;
    }

}