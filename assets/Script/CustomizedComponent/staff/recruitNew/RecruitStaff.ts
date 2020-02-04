import {StaffRole} from "../list/StaffRole";
import {Direction, Role} from "../../map/Role";
import {UIUtil} from "../../../Utils/UIUtil";
import {ShowType} from "../../../Model/ExchangeData";
import {Reward} from "../../../Utils/CommonUtil";
import {AnimaAction} from "../../../Utils/AnimaAction";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {RecruitResult} from "../../../Model/RecruitData";
import {ResManager, ResMgr} from "../../../global/manager/ResManager";
import CommonSimItem from "../../common/CommonSimItem";
import {ActionMgr} from "../../common/Action";
import {Staff} from "../../../Model/StaffData";

const {ccclass, property} = cc._decorator;

@ccclass
export class RecruitStaff extends cc.Component {

    @property([cc.Sprite])
    starIcons: Array<cc.Sprite> = [];

    @property(cc.Sprite)
    newIcon: cc.Sprite = null;
    @property(cc.Animation)
    newAnima: cc.Animation = null;
    @property(cc.Sprite)
    goodbyeIcon: cc.Sprite = null;

    @property(StaffRole)
    staffRole: StaffRole = null;
    @property(cc.Sprite)
    shelfIcon: cc.Sprite = null;
    @property(cc.Sprite)
    stageIcon: cc.Sprite = null;
    
    @property(cc.Node)
    dismissRewards: cc.Node = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    @property(AnimaAction)
    bg5Anima: AnimaAction = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;

    private isStaff: boolean = false;
    private fallDownCb: Function = null;

    initResult(result: RecruitResult, showType: ShowType){
        UIUtil.setLabel(this.nameLabel, result.getName()
            + (result.isFloor() ? " * "+JsonMgr.getConstVal("floorNum") : ""));
        this.initStarIcons(result);
        this.hideStarAndName();

        this.initShow(result);

        const isExchange: boolean = showType == ShowType.ExchangeStaff;
        this.visibleNew(isExchange, result);
        if(isExchange){
            UIUtil.hideNode(this.dismissRewards);
        }

        this.dismissRewards.removeAllChildren();
        const rewards: Array<Reward> = result.isUnique() ? result.getDiamRepeatRewards() : result.getLeaveRewards();
        rewards.forEach((reward: Reward) => {
            let item: CommonSimItem = cc.instantiate(this.itemPrefab).getComponent(CommonSimItem);
            item.updateItem(reward.xmlId, reward.number);
            this.dismissRewards.addChild(item.node);
        });

        this.showBgAnimal(result.getStar());
    }

    private visibleNew(isExchange: boolean, result: RecruitResult){
        UIUtil.hide(this.newIcon);
        const showNew: boolean = isExchange ? true : result.isUnique();
        if(showNew){
            this.fallDownCb = () => {
                this.showStarAndName();
                this.showNew();
            };
        }else{
            this.fallDownCb = this.showStarAndName;
            this.hideNew();
        }
    }

    private hideStarAndName(){
        UIUtil.hideNode(this.starIcons[0].node.parent);
        UIUtil.hide(this.nameLabel);
    }

    showStarAndName(){
        UIUtil.showNode(this.starIcons[0].node.parent);
        UIUtil.show(this.nameLabel);
    }

    private initStarIcons(staff: RecruitResult){
        let star: number = staff.getStar();
        ResMgr.setRecruitResultImg(this.stageIcon, "recruit_small_"+star);
        Staff.initStarIcon(star, this.starIcons);
    }

    private initShow(result: RecruitResult){
        let isStaff: boolean = result.isStaff();
        this.isStaff = isStaff;
        if(isStaff){
            this.staffRole.init(result.staff, Direction.LEFT, false, Role.CASHIER_ACTIONS, Role.HAPPY_SKINS);
        }else{
            let decoShopJson: IDecoShopJson = JsonMgr.getDecoShopJson(result.itemXmlId);
            ResManager.getShelvesItemIcon(this.shelfIcon, decoShopJson.icon, decoShopJson.mainType);
        }
        UIUtil.visible(this.staffRole, isStaff);
        UIUtil.visible(this.shelfIcon, !isStaff);
    }

    transparent(){
        //UIUtil.setOpacity(this.staffRole, 100);
    }

    nontransparent(){
        //UIUtil.setOpacity(this.staffRole, 255);
    }

    showNew(){
        UIUtil.show(this.newIcon);
        UIUtil.show(this.newAnima);
        this.newAnima.play(this.newAnima.getClips()[0].name);
        this.newIcon.node.parent.runAction(ActionMgr.upAndDown());
    }

    hideNew(){
        UIUtil.hide(this.newIcon);
        UIUtil.hide(this.newAnima);
        this.newAnima.stop();
        this.newIcon.node.parent.stopAllActions();
    }

    /**
     * @param {boolean} immed 即immediately是否立即显示new/goodbye，默认为false代表掉落完成后才显示
     */
    showGoodbye(immed: boolean = false){
        this.hideGoodbye();
        if(immed){
            this.doShowGoodbye();
        }else{
            this.fallDownCb = this.doShowGoodbye;
        }
    }

    private doShowGoodbye = () => {
        this.showStarAndName();
        UIUtil.show(this.goodbyeIcon);
        UIUtil.showNode(this.dismissRewards);
    };

    hideGoodbye(){
        UIUtil.hide(this.goodbyeIcon);
        UIUtil.hideNode(this.dismissRewards);
    }

    putTop(){
        let pos = cc.v2(0, 1000);
        this.staffRole.node.setPosition(pos);
        this.shelfIcon.node.setPosition(pos);
    }

    fallDown(){
        let move = cc.moveTo(0.5, cc.v2(0, 0)).easing(cc.easeSineIn());
        let action = cc.sequence(move, cc.callFunc(() => {
            this.fallDownCb && this.fallDownCb();
            this.fallDownCb = null;
        }));
        if(this.isStaff){
            this.staffRole.node.runAction(action);
        }else{
            this.shelfIcon.node.runAction(action);
        }
    }

    private showBgAnimal(star: number) {
        this.bg5Anima.stopAndHide();
        if(star <= 5){
            return;
        }
        this.bg5Anima.showPlayLoop();
    }

}
