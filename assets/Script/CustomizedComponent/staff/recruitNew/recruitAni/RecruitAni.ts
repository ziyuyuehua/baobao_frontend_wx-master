import { StaffRole } from "../../list/StaffRole";
import { Direction, Role } from "../../../map/Role";
import { Reward } from "../../../../Utils/CommonUtil";
import { ItemPrefab } from "../../list/ItemPrefab";
import { ClientEvents } from "../../../../global/manager/ClientEventCenter";
import { UIUtil } from "../../../../Utils/UIUtil";
import { HttpInst } from "../../../../core/http/HttpClient";
import { NetConfig } from "../../../../global/const/NetConfig";
import { ResManager, ResMgr } from "../../../../global/manager/ResManager";
import { DataMgr } from "../../../../Model/DataManager";
import { JsonMgr } from "../../../../global/manager/JsonManager";
import { RecruitResult } from "../../../../Model/RecruitData";
import { RecruitResultItem } from "./gold/RecruitResultItem";
import { ARROW_DIRECTION, GuideMgr } from "../../../common/SoftGuide";
import { ButtonMgr } from "../../../common/ButtonClick";
import { ActionMgr } from "../../../common/Action";
import { Staff } from "../../../../Model/StaffData";
import CommonSimItem, { SetBoxType } from "../../../common/CommonSimItem";
import { GuideIdType } from "../../../../global/const/GuideConst";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RecruitAni extends cc.Component {

    @property(StaffRole)
    staffRole: StaffRole = null;
    @property(cc.Node)
    staffNode: cc.Node = null;
    @property(cc.Node)
    dismissNode: cc.Node = null;
    @property(cc.Node)
    dismissRewards: cc.Node = null;
    @property(cc.Prefab)
    itemPrefab: ItemPrefab = null;

    @property(cc.Node)
    huojiaNode: cc.Node = null;


    @property(cc.Node)
    private logoFail: cc.Node = null;
    @property(cc.Node)
    private logoSuc: cc.Node = null;

    @property([cc.Sprite])
    starIcons: Array<cc.Sprite> = [];

    @property(cc.Toggle)
    private deleteToggle: cc.Toggle = null;

    @property(cc.Sprite)
    private goodbyeIcon: cc.Sprite = null;
    @property(cc.Label)
    private nameLabel: cc.Label = null;

    @property(cc.Node)
    sureBtn: cc.Node = null;
    @property(cc.Node)
    shuxingNode: cc.Node = null;

    @property(cc.Node)
    stageSpineNode: cc.Node = null;

    @property(cc.Node)
    qunZhong1: cc.Node = null;

    @property(cc.Node)
    qunZhong2: cc.Node = null;

    @property(cc.Sprite)
    newIcon: cc.Sprite = null;
    @property(cc.Animation)
    newAnima: cc.Animation = null;
    @property(cc.Node)
    newNode: cc.Node = null;


    private result: RecruitResult = null;
    private isSuc: boolean = false;
    private hasStaff: boolean = false;
    private isNew: boolean = false;
    private callback: () => void;

    onLoad() {
        ButtonMgr.addToggle(this.deleteToggle, this.onDeleteSelect);
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(false);
    }

    public initData(data: RecruitResult, isSuc: boolean, hasGuide: boolean = false,
        hasStaff: boolean = false, isNew: boolean = false, cb: () => void = undefined) {
        this.result = data;
        this.isSuc = isSuc;
        this.hasStaff = hasStaff;
        this.isNew = isNew;
        this.callback = cb;
        this.initView();
        if (hasGuide) {
            let endSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunGold, 7);
            if (endSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                HttpInst.postData(NetConfig.SOFT_LED_INFO, [endSoftGuide.id], (response) => {
                    GuideMgr.showSoftGuide(this.sureBtn, ARROW_DIRECTION.BOTTOM, endSoftGuide.displayText, null, false, 0, false, () => {
                        this.closeView && this.closeView();
                    });
                });
            }
        }
    }

    initView() {
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(true);
        this.hideNew();
        this.initIconBg();
        this.initStarIcons(this.result);
        this.initDismissRewards(this.isSuc);
        if (this.result.num == 1) {
            this.nameLabel.string = this.result.getName();
        } else {
            this.nameLabel.string = this.result.getName() + "*" + this.result.num;
        }
        UIUtil.hide(this.goodbyeIcon);

        if (this.isSuc) {
            this.stageSpineNode.getComponent(sp.Skeleton).animation = "animation";
            this.qunZhong1.active = true;
            this.logoFail.active = false;
            this.logoSuc.active = true;
            if (this.result.staff) {
                let moveTo = cc.moveBy(0.5, cc.v2(0, -810));
                this.huojiaNode.active = false;
                UIUtil.show(this.staffRole);
                this.staffRole.init(this.result.staff, Direction.LEFT, false, Role.CASHIER_ACTIONS, Role.HAPPY_SKINS);
                this.staffRole.node.runAction(cc.sequence(moveTo.easing(cc.easeSineIn()), cc.callFunc(() => {
                    this.initSureBtn();
                    this.initShuxing();
                })));
            } else {
                let moveTo1 = cc.moveBy(0.5, cc.v2(0, -850));
                UIUtil.hide(this.staffRole);
                this.huojiaNode.active = true;
                let decoShopJson: IDecoShopJson = JsonMgr.getDecoShopJson(this.result.itemXmlId);
                // ResManager.LoadFuture(this.huojiaNode.getComponent(cc.Sprite),decoShopJson.icon,decoShopJson.mainType);
                ResManager.getShelvesItemIcon(this.huojiaNode.getComponent(cc.Sprite), decoShopJson.icon, decoShopJson.mainType);
                this.huojiaNode.scale = 1.5;
                this.huojiaNode.runAction(cc.sequence(moveTo1.easing(cc.easeSineIn()), cc.callFunc(() => {
                    this.initSureBtn();
                    this.initShuxing();
                })));
            }
            UIUtil.hideNode(this.dismissNode);
        } else {
            this.logoFail.active = true;
            this.logoSuc.active = false;
            this.qunZhong2.active = true;
            this.stageSpineNode.getComponent(sp.Skeleton).animation = "animation2";
            UIUtil.showNode(this.dismissNode);
            this.staffNode.active = false;
            setTimeout(this.initSureBtn.bind(this), 500);
        }
    }

    initIconBg() {
        ResMgr.setRecruitResultImg(this.staffNode.getChildByName("stageIcon").getComponent(cc.Sprite),
            "recruit_big_" + this.result.getStar());
    }

    showNew() {
        if (this.result.decoShopJson) {
            this.newNode.setPosition(0, 95);
        }
        UIUtil.show(this.newIcon);
        UIUtil.show(this.newAnima);
        this.newAnima.play(this.newAnima.getClips()[0].name);
        this.newIcon.node.parent.runAction(ActionMgr.upAndDown());
    }

    hideNew() {
        UIUtil.hide(this.newIcon);
        UIUtil.hide(this.newAnima);
        this.newAnima.stop();
        this.newIcon.node.parent.stopAllActions();
    }

    initSureBtn() {
        let isShowNew = this.result.isStaff() ? this.result.isUnique() : this.isNew;
        if (isShowNew) this.showNew();
        this.deleteToggle.node.active = false;
        let faceTo = cc.fadeIn(1);
        this.sureBtn.runAction(faceTo);
    }

    initShuxing() {
        let isShowNew = this.result.isStaff() ? this.result.isUnique() : this.isNew;
        if (isShowNew) this.showNew();
        if (this.result.staff) {
            let canDismissStaff = DataMgr.canDismissStaff();
            UIUtil.visible(this.deleteToggle, canDismissStaff && this.result.getStar() < 5);
        }
        let faceTo = cc.fadeIn(1);
        this.shuxingNode.runAction(faceTo.clone());

        if (this.hasStaff) {
            UIUtil.showNode(this.dismissNode);
            this.hideNew();
            UIUtil.show(this.goodbyeIcon);
        }
    }

    private initStarIcons(staff: RecruitResult) {
        Staff.initStarIcon(staff.getStar(), this.starIcons);
    }

    private initDismissRewards(recruitSuccess: boolean) {
        if(!this.result) return;
        this.dismissNode.getChildByName("failBg").active = !recruitSuccess;
        let rewards: Array<Reward> = [];
        if (this.result.staff) {
            rewards = recruitSuccess
                ? (this.hasStaff ? this.result.getGoldRepeatRewards() : this.result.getLeaveRewards())
                : this.result.getGoldFailRewards();
        } else {
            rewards = this.result.getGoldFailRewards();
        }
        let scaleNum: number = 1;
        if (!recruitSuccess) {
            scaleNum = 1.4;
            this.dismissRewards.width = rewards.length * 105;
        } else {
            this.dismissRewards.width = rewards.length * 96;
        }
        rewards.forEach((reward: Reward, index, array) => {
            UIUtil.dynamicLoadPrefab(CommonSimItem.url, (rewardItem) => {
                rewardItem.parent = this.dismissRewards;
                let component: CommonSimItem = rewardItem.getComponent("CommonSimItem");
                component.updateItem(reward.xmlId, reward.number, SetBoxType.Item, scaleNum);
            });
        });
    }

    onDeleteSelect = (toggle: cc.Toggle) => {
        if (this.result.getStar() >= 5) {
            return;
        }
        const isCheck: boolean = toggle.isChecked;
        UIUtil.visibleNode(this.dismissNode, isCheck);
        UIUtil.visible(this.goodbyeIcon, isCheck);
    };

    passAni() {
        this.unscheduleAllCallbacks();
        this.initView();
    }

    closeView() {
        if (this.deleteToggle.isChecked) {
            if (this.result.isStaff()){
                HttpInst.postData(NetConfig.dismissStaff,
                    [[this.result.staff.staffId]], (response: any) => {
                        DataMgr.removeStaff(this.result.staff.staffId);
                    });
            }
        }
        this.cleanAll();
    }

    private cleanAll() {
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(true);
        this.dismissRewards.removeAllChildren(true);
        this.node.removeFromParent(true);
        this.callback && this.callback();
    }

}
