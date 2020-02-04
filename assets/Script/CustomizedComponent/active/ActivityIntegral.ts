import List from "../../Utils/GridScrollUtil/List";
import {ButtonMgr} from "../common/ButtonClick";
import {IActivityGoal, IGoal, IRespData} from "../../types/Response";
import {GameComponent} from "../../core/component/GameComponent";
import {JsonMgr} from "../../global/manager/JsonManager";
import IntegralItem from "./IntegralItem";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {UIUtil} from "../../Utils/UIUtil";
import {ResMgr} from "../../global/manager/ResManager";
import {TimeUtil} from "../../Utils/TimeUtil";
import {DataMgr} from "../../Model/DataManager";
import {topUiType} from "../MainUiTopCmpt";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ActivityIntegral extends GameComponent {
    static url: string = "active/activityIntegral";
    private integralNumber: number = -1;

    getBaseUrl() {
        return ActivityIntegral.url;
    }

    @property(cc.Label)
    private existingLab: cc.Label = null;
    @property(cc.Node)
    private aniNode: cc.Node = null;
    @property(cc.RichText)
    private timeLab: cc.RichText = null;
    @property(cc.Sprite)
    private bgIcon: cc.Sprite = null;
    @property(cc.Sprite)
    private rewardIcon: cc.Sprite = null;
    @property(cc.Node)
    private backBut: cc.Node = null;

    @property(cc.Node)
    private shopView: cc.Node = null;

    private data: IActivityGoal = null;
    private JsonSort: IActivityStore[] = [];

    start() {
        this.addEvent(ClientEvents.REFRESH_INTEGRAL.on(this.integralScroll));
        ButtonMgr.addClick(this.backBut, this.closeOnly);
        this.integralScroll();
    }

    onEnable() {
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onDisable() {
        ClientEvents.COMMUNITY_ACTIVE_SHOP.emit();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    integralScroll = () => {
        HttpInst.postData(NetConfig.GET_GOAL_INFO, [], (response: IRespData) => {
            this.timeLab.string = TimeUtil.getDataTime(response.endTime);
            this.data = response.activityGoal;
            DataMgr.activeShopData.setIntegralData(this.data);
            this.integralNumber = response.integralNumber;
            let xmlId = response.activityGoal.templateId;
            let shopData: IActivityJson = JsonMgr.getActivityJson(xmlId);
            UIUtil.loadUrlImg(shopData.url, this.bgIcon);
            let rewardSp1 = shopData.pointUrl;
            if (rewardSp1) {
                UIUtil.loadUrlImg(rewardSp1, this.rewardIcon);
            }
            let rewardSp2 = shopData.shopItem;
            if (rewardSp2) {
                ResMgr.imgTypeJudgment(this.rewardIcon, Number(rewardSp2));
            }
            this.JsonSort = DataMgr.activeShopData.sortIntegral();
            this.shopView.getComponent(List).numItems = this.JsonSort.length;
            this.existingLab.string = response.integralNumber + "";
        });
    };

    refreshItem(item: cc.Node, index: number) {
        let shopItem: IntegralItem = item.getComponent(IntegralItem);
        shopItem.loadItem(this.JsonSort, this.data, index, this.integralNumber);
    }
}
