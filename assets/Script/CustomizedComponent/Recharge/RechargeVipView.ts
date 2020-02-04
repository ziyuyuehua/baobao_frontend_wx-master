import {itemType, JsonMgr} from "../../global/manager/JsonManager";
import RechargePrefabLab from "./RechargePrefabLab";
import {DataMgr} from "../../Model/DataManager";
import AcitveGiftItem from "../active/ActiveGiftItem";
import {CommonUtil, Reward} from "../../Utils/CommonUtil";
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {SetBoxType} from "../common/CommonSimItem";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../Utils/event-kit";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RechargeVipView extends cc.Component {


    @property(cc.Layout)
    giftLayout: cc.Layout = null;

    @property(cc.Prefab)
    giftPrefab: cc.Prefab = null;

    @property(cc.Node)
    private giftPanel: cc.Node = null;

    @property(cc.Node)
    private giftLay: cc.Node = null;

    @property(cc.Prefab)
    private prefabLab: cc.Prefab = null;

    @property(cc.Label)
    private prefabName: cc.Label = null;

    @property(cc.Node)
    private itemLayout: cc.Node = null;

    @property(cc.Node)
    private prefabLayout: cc.Node = null;
    @property(cc.Node)
    private prefabNode: cc.Node = null;

    @property(cc.Label)
    private vipTimeLab: cc.Label = null;

    @property(cc.Label)
    private giftNameLab: cc.Label = null;

    @property(cc.Node)
    private vipBg: cc.Node = null;

    @property(cc.Label)
    private giftNameLab2: cc.Label = null;

    @property(cc.Node)
    private jiaoNode: cc.Node = null;

    @property(cc.Node)
    private sanjiaoNode: cc.Node = null;


    private itemNodeArr: cc.Node[] = [];
    protected dispose: CompositeDisposable = new CompositeDisposable();

    start() {
    }

    onLoad() {
        this.dispose.add(ClientEvents.SHOW_RECHARGE_GIFT_VIEW.on(this.showGiftPanel));
    }

    showGiftPanel = () => {
        if (this.giftPanel) {
            this.giftPanel.active = false;
        }
    }

    updateView(vipId: number) {
        // cc.log("vipId:" + vipId);
        let vipData: IVipJson = JsonMgr.getVipJson(vipId);
        // cc.log("vipData__________:{}", vipData);
        this.itemNodeArr = [];
        this.prefabLayout.removeAllChildren();
        this.prefabName.string = vipData.name + "特权";
        let index = 0;
        if (vipId > 1) {
            index = vipId - 2;
        }
        let vipInfo = DataMgr.rechargeModel.getVipInfo()[index];
        // cc.log("vipInfo", vipInfo);
        this.vipTimeLab.node.active = vipInfo.expireData > 0;
        if (this.vipTimeLab.node.active) {
            this.vipTimeLab.string = "到期时间：" + vipInfo.expireStr;
        }
        if (this.prefabLayout.children.length == 0) {
            for (let index = 0; index < vipData.buffId.length; index++) {
                let buffDate = JsonMgr.getBuffJson(vipData.buffId[index]);
                if (buffDate.type !== 0) continue;
                // cc.log("buffId:", buffDate);
                let node = this.itemNodeArr[index];
                if (!node) {
                    node = cc.instantiate(this.prefabLab);
                    this.itemNodeArr.push(node);
                    this.prefabLayout.addChild(node);
                }
                let rechargeItem: RechargePrefabLab = node.getComponent(RechargePrefabLab);
                rechargeItem.updateItem(buffDate);
            }
            if (vipData.buffId.length < 3) {
                this.vipBg.position = cc.v2(-121, -50);
            }
        }

        this.giftNameLab.string = vipInfo.type == 1 && !vipInfo.fistReward ? "首次奖励" : "每日奖励";
        this.giftLayout.node.removeAllChildren();
        let dailyReward = !vipInfo.fistReward && vipInfo.type == 1 ? vipData.firstReward : vipData.dailyReward;
        let rewards: Reward[] = CommonUtil.toRewards(dailyReward);
        for (let index = 0; index < rewards.length; index++) {
            let node = cc.instantiate(this.giftPrefab);
            let simItem: AcitveGiftItem = node.getComponent(AcitveGiftItem);
            this.giftLayout.node.addChild(node);
            // cc.log("rewards", rewards[index]);
            let type: SetBoxType = SetBoxType.Item;
            if (rewards[index].xmlId >= 1000 && rewards[index].xmlId < 9999) {
                type = SetBoxType.Staff;
            }
            simItem.bagShow(rewards, rewards[index].xmlId, rewards[index].number, type);
            let BagId = rewards[index].xmlId;
            let itemJson: IItemJson = JsonMgr.getInformationAndItem(BagId);
            // cc.log("itemJson", itemJson);
            node.on(cc.Node.EventType.TOUCH_START, () => {
                this.giftPanel.active = false;
                if (itemJson && itemJson.type == itemType.ZhiOpenGift) {
                    this.giftNameLab2.string = itemJson.name;
                    let giftArr = itemJson.uniqueValue.split(";");
                    this.giftLay.removeAllChildren();
                    for (let i = 0; i < giftArr.length; i++) {
                        let giftStr = giftArr[i].split(",");
                        let item = cc.instantiate(this.giftPrefab);
                        let giftitem: AcitveGiftItem = item.getComponent(AcitveGiftItem);
                        this.giftLay.addChild(item);
                        giftitem.numShow(Number(giftStr[0]), Number(giftStr[1]))
                    }
                    this.giftPanel.active = !this.giftPanel.active;
                    if (giftArr.length < 5) {
                        let x = 50;
                        if (giftArr.length == 4) {
                            this.giftLay.setPosition(12, -60);
                        } else if (giftArr.length == 2) {
                            this.giftLay.setPosition(85, -60);
                        } else {
                            this.giftLay.setPosition(x * (4 - giftArr.length), -60);
                        }
                        this.giftPanel.setPosition(node.position.x - this.giftPanel.width / 2.5, -this.giftPanel.height / 1.7);
                        this.giftPanel.setContentSize(cc.size(320, 150));
                        // this.giftNameLab.node.setPosition(0, 50);
                        this.jiaoNode.setPosition(0, this.giftPanel.height / 3.6);
                        this.sanjiaoNode.setPosition(0, -this.giftPanel.height / 1.8);
                    } else {
                        this.giftPanel.setPosition(node.position.x - this.giftPanel.width / 2.5, -this.giftPanel.height / 1.7);
                        this.giftPanel.setContentSize(cc.size(320, 230));
                        // this.giftNameLab.node.setPosition(0, 87);
                        this.giftLay.setPosition(12, -21);
                        this.jiaoNode.setPosition(0, this.giftPanel.height / 3.6);
                        this.sanjiaoNode.setPosition(0, -this.giftPanel.height / 1.8);
                    }
                } else {
                    UIMgr.addDetailedEvent(node, rewards[index].xmlId);
                }
            })
        }
    }

    // }
}
