import {ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import List from "../../Utils/GridScrollUtil/List";
import {ButtonMgr} from "../common/ButtonClick";
import PopularityItem from "./PopularityItem";
import {TextTipConst} from "../../global/const/TextTipConst";
import {GameComponent} from "../../core/component/GameComponent";
import {IMarketModel} from "../../Model/market/MarketDataMoudle";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopularityView extends GameComponent {
    static url: string = "popularity/PopularityView";

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.Node)
    private tipBtn: cc.Node = null;

    @property(cc.Sprite)
    private popularityIcon: cc.Sprite = null;

    @property(cc.Label)
    private lvLabel: cc.Label = null;

    @property(cc.Label)
    private saleSpeedAdd: cc.Label = null;

    @property(List)
    private scrollNode: List = null;


    getBaseUrl() {
        return PopularityView.url;
    }

    start() {
        ButtonMgr.addClick(this.closeBtn, () => {
            DotInst.clientSendDot(COUNTERTYPE.popular, "1503");
            this.closeView()
        });
        ButtonMgr.addClick(this.tipBtn, this.showTipHandler);
        this.initView();

    }


    onEnable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
        DataMgr.increaseTopUiNum();
    }

    onDisable(): void {
        DataMgr.decrTopUiNum();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, -2);
    }

    initView() {
        let markMoudle: IMarketModel = DataMgr.iMarket;

        let popularityJso: IShelveLevelJson = markMoudle.getShelveLvJson();
        ResMgr.getPopularityIcon(this.popularityIcon, popularityJso.shopIcon);
        this.saleSpeedAdd.string = "+" + markMoudle.getPopularityAdd() + "%";

        this.scrollNode.numItems = markMoudle.getPopularityArr().length;

    }

    onListVRender(item: cc.Node, idx: number) {
        let popularityItem: PopularityItem = item.getComponent(PopularityItem);
        popularityItem.reuse(idx);
    }

    showTipHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.popular, "1501");
        UIMgr.showTextTip(TextTipConst.PopularityTip)
    }


    // update (dt) {}
}
