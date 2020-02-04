/**
 * @author Lizhen
 * @date 2019/9/27
 * @Description:
 */
import {GameComponent} from "../../../../../../core/component/GameComponent";
import {StaffRole} from "../../../../list/StaffRole";
import {ItemPrefab} from "../../../../list/ItemPrefab";
import {FriendRecruitResult} from "../../../../../../Model/RecruitData";
import {ClientEvents} from "../../../../../../global/manager/ClientEventCenter";
import {UIUtil} from "../../../../../../Utils/UIUtil";
import {Direction, Role} from "../../../../../map/Role";
import {JsonMgr} from "../../../../../../global/manager/JsonManager";
import {ResManager, ResMgr} from "../../../../../../global/manager/ResManager";
import {Reward} from "../../../../../../Utils/CommonUtil";
import {DataMgr} from "../../../../../../Model/DataManager";
import {UIMgr} from "../../../../../../global/manager/UIManager";
import {FriendMessage} from "./FriendMessage";
import {Staff} from "../../../../../../Model/StaffData";
import CommonSimItem, {SetBoxType} from "../../../../../common/CommonSimItem";

const {ccclass, property} = cc._decorator;

@ccclass
export class FriendRecruitAni extends GameComponent {
    static url: string = "Prefab/recruit/friend/FriendRecruitAni";
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

    @property(cc.Sprite)
    private newIcon: cc.Sprite = null;
    @property(cc.Animation)
    newAnima: cc.Animation = null;

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

    private result: FriendRecruitResult = null;
    private isSuc: boolean = false;
    private callback: () => void;
    private hasStaff: boolean = false;
    private isNew: boolean = false;

    getBaseUrl() {
        return FriendRecruitAni.url;
    }
    load() {
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(false);
    }
    public initData(data: FriendRecruitResult, isSuc: boolean, hasStaff: boolean = false,isNew: boolean = false,callback?: () => void) {
        this.result = data;
        this.isSuc = isSuc;
        this.callback = callback;
        this.hasStaff = hasStaff;
        this.isNew = isNew;
        this.initView();
    }

    initView() {
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(true);

        this.initIconBg();
        this.initStarIcons(this.result);
        this.initDismissRewards(this.isSuc);

        UIUtil.hide(this.newIcon);
        UIUtil.hide(this.newAnima);
        UIUtil.hide(this.goodbyeIcon);
        if(this.result.num == 1){
            this.nameLabel.string = this.result.getName();
        }else{
            this.nameLabel.string = this.result.getName()+"*"+this.result.num;
        }

        if (this.isSuc) {
            this.stageSpineNode.getComponent(sp.Skeleton).animation = "animation";
            UIUtil.hideNode(this.dismissNode);
            this.qunZhong1.active = true;
            this.logoFail.active = false;
            this.logoSuc.active = true;
            if (this.result.isStaff()) {
                if(this.result.isNew()){
                    let moveTo = cc.moveBy(0.5, cc.v2(0, -810));
                    this.huojiaNode.active = false;
                    UIUtil.show(this.staffRole);
                    this.staffRole.init(this.result.staff, Direction.LEFT, false, Role.CASHIER_ACTIONS, Role.HAPPY_SKINS);
                    this.staffRole.node.runAction(cc.sequence(moveTo.easing(cc.easeSineIn()), cc.callFunc(() => {
                        this.initSureBtn();
                        this.initShuxing();
                    })));
                }else{
                    let moveTo = cc.moveBy(0.5, cc.v2(0, -810));
                    this.huojiaNode.active = false;
                    UIUtil.show(this.staffRole);
                    this.staffRole.init(this.result.staff, Direction.LEFT, false, Role.CASHIER_ACTIONS, Role.HAPPY_SKINS);
                    this.staffRole.node.runAction(cc.sequence(moveTo.easing(cc.easeSineIn()), cc.callFunc(() => {
                        this.initSureBtn();
                        this.initShuxing();
                        UIUtil.showNode(this.dismissNode);
                    })));
                }
            } else {
                if(this.isNew){
                    let moveTo1 = cc.moveBy(0.5, cc.v2(0, -850));
                    UIUtil.hide(this.staffRole);
                    this.huojiaNode.active = true;
                    let decoShopJson: IDecoShopJson = JsonMgr.getDecoShopJson(this.result.itemXmlId);
                    ResManager.getShelvesItemIcon(this.huojiaNode.getComponent(cc.Sprite), decoShopJson.icon, decoShopJson.mainType);
                    this.huojiaNode.scale = 1.5;
                    this.huojiaNode.runAction(cc.sequence(moveTo1.easing(cc.easeSineIn()), cc.callFunc(() => {
                        this.initSureBtn();
                        this.initShuxing();
                    })));
                }else{
                    let moveTo1 = cc.moveBy(0.5, cc.v2(0, -850));
                    UIUtil.hide(this.staffRole);
                    this.huojiaNode.active = true;
                    let decoShopJson: IDecoShopJson = JsonMgr.getDecoShopJson(this.result.itemXmlId);
                    ResManager.getShelvesItemIcon(this.huojiaNode.getComponent(cc.Sprite), decoShopJson.icon, decoShopJson.mainType);
                    this.huojiaNode.scale = 1.5;
                    this.huojiaNode.runAction(cc.sequence(moveTo1.easing(cc.easeSineIn()), cc.callFunc(() => {
                        this.initSureBtn();
                        this.initShuxing();
                        if(this.hasStaff){
                            UIUtil.showNode(this.dismissNode);
                        }
                    })));
                }
            }
            // UIUtil.hideNode(this.dismissNode);
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
        if(!this.result) return;
        ResMgr.setRecruitResultImg(this.staffNode.getChildByName("stageIcon").getComponent(cc.Sprite),
            "recruit_big_" + this.result.getStar());
    }

    initSureBtn() {
        let faceTo = cc.fadeIn(1);
        this.sureBtn.runAction(faceTo);
    }

    initShuxing() {
        let showNew = this.result.isStaff() ? this.result.isUnique() : this.isNew;
        UIUtil.visible(this.newIcon, showNew);
        UIUtil.visible(this.newAnima, showNew);
        if(showNew){
            this.newAnima.play(this.newAnima.getClips()[0].name);
        }else{
            this.newAnima.stop();
        }

        let faceTo = cc.fadeIn(1);
        this.shuxingNode.runAction(faceTo.clone());
        if(this.hasStaff){
            UIUtil.showNode(this.dismissNode);
            UIUtil.hide(this.newIcon);
            UIUtil.show(this.goodbyeIcon);
        }
    }

    private initStarIcons(staff: FriendRecruitResult) {
        if(!staff) return;
        Staff.initStarIcon(staff.getStar(), this.starIcons);
    }

    private initDismissRewards(recruitSuccess: boolean) {
        if(!this.result) return;
        this.dismissNode.getChildByName("failBg").active = !recruitSuccess;
        let rewards: Array<Reward> = [];
        if (this.result.staff) {
            rewards = recruitSuccess
                ? (this.hasStaff ? this.result.staff.getGoldRepeatRewards() : this.result.staff.getLeaveRewards())
                : this.result.getGoldFailRewards();
        } else {
            rewards = this.result.getGoldFailRewards();
        }
        let scaleNum: number = 1;
        if (!recruitSuccess) {
            scaleNum = 1.4;
            this.dismissRewards.width = rewards.length * 105;
        }else{
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

    private hasStaffByResId() {
        return DataMgr.hasStaffByResId(this.result.staff.artResId);
    }

    onDeleteSelect = (toggle: cc.Toggle) => {
        if (!this.result || this.result.getStar() >= 5) {
            return;
        }
        const isCheck: boolean = toggle.isChecked;
        if (isCheck) {
            UIUtil.showNode(this.dismissNode);
        } else {
            UIUtil.hideNode(this.dismissNode);
        }
    };

    passAni() {
        this.unscheduleAllCallbacks();
        this.initView();
    }

    closeViewHandler() {
        UIMgr.showView(FriendMessage.url,cc.director.getScene(),this.node["data"],(node)=>{
            let component:FriendMessage = node.getComponent(node.name);
            component.init(this.isSuc, this.cleanAll);
        });
    }

    private cleanAll = () => {
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(false);
        this.dismissRewards.removeAllChildren(true);
        this.callback && this.callback();
        this.closeOnly();
    }

}
