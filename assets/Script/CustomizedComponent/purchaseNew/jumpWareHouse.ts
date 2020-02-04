// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";
import {DataMgr} from "../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class jumpWareHouse extends GameComponent {
    static url: string = "purchase/jumpWarehouse";

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.Node)
    private jumpBtn: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    start() {
        ButtonMgr.addClick(this.closeBtn, this.closeHandler);
        ButtonMgr.addClick(this.jumpBtn, this.jumpHandler);
    }

    onEnable(): void {
        this.onShowPlay(2, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false ,topUiType.ordinary);
    }

    getBaseUrl(): string {
        return jumpWareHouse.url;
    }

    closeHandler = () => {
        this.closeOnly();
    }

    jumpHandler = () => {
        UIMgr.closeSomeView([jumpWareHouse.url]);
    }

    // update (dt) {}
}
