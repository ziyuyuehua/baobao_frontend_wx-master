import {GameComponent} from "../../core/component/GameComponent";
import List from "../../Utils/GridScrollUtil/List";
import {JsonMgr} from "../../global/manager/JsonManager";
import WelfareItem from "./WelfareItem";
import {ButtonMgr} from "../common/ButtonClick";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";
import {UIMgr} from "../../global/manager/UIManager";
import {TextTipConst} from "../../global/const/TextTipConst";

const {ccclass, property} = cc._decorator;

@ccclass
export default class WelfareView extends GameComponent {

    static url: string = "Welfare/WelfareView";

    @property(cc.ScrollView)
    scrollNode: cc.ScrollView = null;

    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Node)
    roleBtn: cc.Node = null;

    @property(cc.Node)
    aniNode: cc.Node = null;

    @property(cc.Node)
    moveSpr: cc.Node = null;

    adverData = [];

    start() {
        this.onShowPlay(2, this.aniNode);
        let active = cc.repeatForever(cc.sequence(cc.moveTo(0.5, this.moveSpr.x, this.moveSpr.y + 5),
            cc.moveTo(0.5, this.moveSpr.x, this.moveSpr.y - 5)));
        this.moveSpr.stopAllActions();
        this.moveSpr.runAction(active);
        this.dispose.add(ClientEvents.CLOSE_WELFARE_VIEW.on(() => {
            this.closeOnly();
        }))
        ButtonMgr.addClick(this.closeBtn, () => {
            this.closeOnly();
        });
        ButtonMgr.addClick(this.roleBtn, () => {
            UIMgr.showTextTip(TextTipConst.FULI);
        });
        let allMovie = JsonMgr.getAllAdvertisements();
        for (let nid in allMovie) {
            this.adverData.push(allMovie[nid]);
        }
        this.scrollNode.getComponent(List).numItems = this.adverData.length;

    }

    onListVRender(item: cc.Node, idx: number) {
        let awardItem: WelfareItem = item.getComponent(WelfareItem);
        awardItem.updateItem(this.adverData[idx]);
    }

    protected onEnable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    protected onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    protected getBaseUrl(): string {
        return WelfareView.url;
    }

}
