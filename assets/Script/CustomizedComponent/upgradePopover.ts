import { GameComponent } from "../core/component/GameComponent";
import { ClientEvents } from "../global/manager/ClientEventCenter";
import { GameManager } from "../global/manager/GameManager";
import { JsonMgr } from "../global/manager/JsonManager";
import { ResMgr } from "../global/manager/ResManager";
import { DataMgr } from "../Model/DataManager";
import { CommonUtil } from "../Utils/CommonUtil";
import { ButtonMgr } from "./common/ButtonClick";
import { CacheMap } from "./MapShow/CacheMapDataManager";
import { ActionMgr } from "./common/Action";


const { ccclass, property } = cc._decorator;

@ccclass
export default class UpgradePopover extends GameComponent {
    static url = "mainUI/upgradePopover";

    getBaseUrl() {
        return UpgradePopover.url;
    }

    @property(cc.Animation)
    private animation: cc.Animation = null;
    @property(sp.Skeleton)
    private skeleton: sp.Skeleton = null;
    @property(cc.Label)
    private levelAlterLabel: cc.Label = null;
    @property(cc.Label)
    private levelAlterLabel1: cc.Label = null;
    @property(cc.Label)
    private getLabel: cc.Label = null;

    @property(cc.Label)
    private rewardLabel: cc.Label = null;
    @property(cc.Label)
    private rewardLabel1: cc.Label = null;
    @property(cc.Node)
    private expandedArea: cc.Node = null;
    @property(cc.Sprite)
    private rewardSprite: cc.Sprite = null;
    @property(cc.Sprite)
    private rewardBg: cc.Sprite = null;
    @property(cc.Label)
    private Label: Array<cc.Label> = [];
    @property(cc.Sprite)
    private rewardSprite1: cc.Sprite = null;
    @property(cc.Sprite)
    private rewardBg1: cc.Sprite = null;
    @property(cc.Label)
    private getLabel1: cc.Label = null;
    @property(cc.Node)
    private put: cc.Node = null;

    @property(cc.Node)
    private unLockNode: cc.Node = null;

    @property([cc.Sprite])
    private unlockIconGroup: cc.Sprite[] = [];

    @property(cc.Label)
    private expandedLab: cc.Label = null;//店铺可扩建等级
    @property(cc.Label)
    private putNum: cc.Label = null;//货架摆放数量

    private Map: Map<string, number>;
    reward: string;

    private funcJson: IFunctionOpenJson[] = [];

    onLoad() {
        DataMgr.userData.incrHowLv = 0;
        GameManager.WxServices.submitUserInfo();
        let node: cc.Node = this.node.parent;
        this.animation.on("stop", () => {
            node.on(cc.Node.EventType.TOUCH_END, this.shutUpgradeBtn, this);
        });
        this.skeleton.setCompleteListener(() => {
            this.skeleton.setAnimation(0, "animation2", true);
        });
        for (let index = 0; index < this.unlockIconGroup.length; index++) {
            ButtonMgr.addClick(this.unlockIconGroup[index].node, this.jumpHandler)
        }
    }

    jumpHandler = (btn) => {
        this.closeOnly();
        let nIndx = Number(btn.target.name);
        let jumpId = this.funcJson[nIndx].jump;
        ClientEvents.EVENT_OPEN_UI.emit(jumpId);
    }

    start() {
        this.animation.play();
    }

    loadData = (level: number, incrHowLv: number) => {
        this.Map = new Map<string, number>();
        ClientEvents.UDPATE_MAIN_ARRAW_STATE.emit();
        //等级变化
        let lv = level - incrHowLv;
        let lv1 = level;
        this.levelAlterLabel.string = "" + (lv);
        this.levelAlterLabel1.string = "" + (lv1);

        //用于5级前不显示空货架气泡

        //可扩建区域是否增加
        this.expandedArea.active = false;
        this.put.active = false;

        let json1 = JsonMgr.getSceneItem(lv1);
        if (json1) {
            let string: string = "可摆放货架";
            let string1: string = "可升级店铺";
            if (json1.shopID == 2) {
                string = "二店可摆放货架";
                string1 = "二店可升级";
            }
            if (json1.shopID == 3) {
                string = "三店可摆放货架";
                string1 = "三店可升级";
            }
            this.putNum.string = string;
            this.expandedLab.string = string1;

            let json = JsonMgr.getSceneData(json1.id + 1);
            if (!json) return;
            if (json1.shopID == json.shopID) {
                this.put.active = true;
                this.Label[3].string = json.putShelves + "";
                this.Label[2].string = json1.putShelves + "";
                this.expandedArea.active = true;
                this.Label[1].string = json.expandFrequency + "";
                this.Label[0].string = json1.expandFrequency + "";
            }
        }

        //解锁功能是否显示
        this.unLockNode.active = false;
        this.funcJson = JsonMgr.getFunctionOpenByLv(lv1);
        for (let index = 0; index < this.unlockIconGroup.length; index++) {
            this.unlockIconGroup[index].node.active = false;
            if (this.funcJson[index]) {
                this.unLockNode.active = true;
                this.unlockIconGroup[index].node.active = true;
                this.unlockIconGroup[index].node.name = index + "";
                ResMgr.setAccessPathIcon(this.unlockIconGroup[index], this.funcJson[index].icon);
                if (!DataMgr.getCanShowRedPoint() && this.funcJson[index].functionPicType) {
                    let aniNode = this.unlockIconGroup[index].node.getChildByName("click");
                    let aniNode1 = this.unlockIconGroup[index].node.getChildByName("hand");
                    if (aniNode && aniNode1) {
                        aniNode.active = true;
                        aniNode1.active = true;
                        ActionMgr.fingerLight(aniNode1, aniNode);
                    } else {
                        cc.log("找不到动画节点")
                    }
                }
            }
        }

        for (let i = lv; i < lv1; i++) {
            let data = JsonMgr.getLevel((i), "reward");
            if (!data) {
                this.rewardBg.node.parent.parent.active = false;
                return;
            }
            let id = data.split(",");
            if (!this.Map.has(id[0])) {
                this.Map.set(id[0], parseInt(id[1]));
            } else {
                this.Map.set(id[0], this.Map.get(id[0]) + parseInt(id[1]));
            }
        }
        let num = 0;
        this.Map.forEach((v: number, k: string) => {
            let itemdata = JsonMgr.getInformationAndItem(parseInt(k));
            if (num > 0) {
                //奖励图标
                ResMgr.imgTypeJudgment(this.rewardSprite1, parseInt(k));
                //奖励数量
                this.getLabel1.string = "" + CommonUtil.numChange(v, 1);
                this.rewardLabel1.string = itemdata.name;
                ResMgr.getItemBox(this.rewardBg1, "k" + itemdata.color);
                this.rewardBg1.node.parent.active = true;
                return;
            }
            //奖励图标
            ResMgr.imgTypeJudgment(this.rewardSprite, parseInt(k));
            this.rewardLabel.string = itemdata.name;
            ResMgr.getItemBox(this.rewardBg, "k" + itemdata.color);
            //奖励数量
            this.getLabel.string = "" + CommonUtil.numChange(v, 1);
            num = num + 1;
        }, this);
    };

    shutUpgradeBtn() {
        // this.Map.forEach((v: number, k: string) => {
        //     if (this.reward) {
        //         this.reward = this.reward + ";" + k + "," + v;
        //     } else {
        //         this.reward = k + "," + v;
        //     }
        // });
        // UIMgr.showTipText("", this.reward);
        // this.node.parent.destroy();
        this.closeOnly();
        ClientEvents.UPDATE_MAINUI_RED.emit(DataMgr.getRedData());
    }

}
