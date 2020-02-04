// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {IMarketSetInfo} from "../../types/Response";
import {DataMgr} from "../../Model/DataManager";
import GridScroll from "../../Utils/ScrollGrid/GridScroll";
import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";

const {ccclass, property} = cc._decorator;

@ccclass
export default class branchDetail extends GameComponent {
    static url: string = "setting/other/branchDetail";

    @property(cc.ScrollView)
    private branchScroll: cc.ScrollView = null;

    @property(cc.Prefab)
    private branchItem: cc.Prefab = null;

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;
    private branchView = null;

    protected getBaseUrl(): string {
        return branchDetail.url;
    }

    onEnable(): void {
        this.onShowPlay(2, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
        DataMgr.increaseTopUiNum();
    }

    onDisable(): void {
        DataMgr.decrTopUiNum();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    start() {
        this.initScroll();
        ButtonMgr.addClick(this.closeBtn, this.closeView);
    }

    initScroll() {
        let data: IMarketSetInfo[] = DataMgr.settingData.getMarketInfo();
        let colnum: number = data.length;
        if (!this.branchView) {
            this.branchView = this.branchScroll.getComponent(GridScroll);
            this.branchView.initNodePool(this.branchItem, 1, colnum);
            this.branchView.initGridScroll(data.length);
        } else {
            this.branchView.refresh(data.length);
        }
    }

    closeView = () => {
        UIMgr.closeView(branchDetail.url);
    }


    // update (dt) {}
}
