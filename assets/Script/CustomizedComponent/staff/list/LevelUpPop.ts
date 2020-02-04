import {GameComponent} from "../../../core/component/GameComponent";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {ResManager} from "../../../global/manager/ResManager";
import {Staff} from "../../../Model/StaffData";
import {UIUtil} from "../../../Utils/UIUtil";
import {ButtonMgr} from "../../common/ButtonClick";
import {lvUpSucc} from "./LevelPanel";
import {JsonMgr, StaffModConfig} from "../../../global/manager/JsonManager";
import {DataMgr} from "../../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class LevelUpPop extends GameComponent {

    static url: string = "staff/list/lvUpPopup"

    @property(cc.Node)
    closeIcon: cc.Node = null;

    @property(cc.Label)
    oldLv: cc.Label = null;
    @property(cc.Label)
    newLv: cc.Label = null;

    @property(cc.Label)
    oldIntel: cc.Label = null;
    @property(cc.Label)
    newIntel: cc.Label = null;

    @property(cc.Label)
    oldPower: cc.Label = null;
    @property(cc.Label)
    newPower: cc.Label = null;

    @property(cc.Label)
    oldPatience: cc.Label = null;
    @property(cc.Label)
    newPatience: cc.Label = null;

    @property(cc.Label)
    oldGlamour: cc.Label = null;
    @property(cc.Label)
    newGlamour: cc.Label = null;

    private isMaxLv: boolean = false;

    @property(sp.Skeleton)
    staffSkelet: sp.Skeleton = null;

    @property(sp.Skeleton)
    staffSkelet2: sp.Skeleton = null;

    @property([cc.Node])
    lvAttNodeArr: cc.Node[] = [];

    @property(cc.Sprite)
    staffHead: cc.Sprite = null;

    private otherAniIndex: number = 0;

    getBaseUrl() {
        return LevelUpPop.url
    }

    onLoad() {
        ButtonMgr.addClick(this.closeIcon, () => {
            this.closeOnly();
            if (this.isMaxLv) {
                ClientEvents.ClOSE_STAFF_LEVEL_VIEW.emit();
            } else {
                if (DataMgr.getUserLv() < Number(JsonMgr.getConstVal("goHomeGuideArrow"))) {
                    ClientEvents.SHOW_BACK_STAFF_SOFT.emit();
                }
            }
        });

        this.staffSkelet.setCompleteListener(() => {
            this.staffSkelet.setAnimation(0, "animation2", true);
            this.setOtherScale();
        })
    }

    updateView(oldStaff: Staff, newStaff: Staff) {
        UIUtil.setLabel(this.oldLv, oldStaff.level);
        UIUtil.setLabel(this.newLv, newStaff.level);

        UIUtil.setLabel(this.oldIntel, oldStaff.getIntelligence());
        UIUtil.setLabel(this.newIntel, newStaff.getIntelligence());

        UIUtil.setLabel(this.oldPower, oldStaff.getPower());
        UIUtil.setLabel(this.newPower, newStaff.getPower());

        UIUtil.setLabel(this.oldPatience, oldStaff.getPatience());
        UIUtil.setLabel(this.newPatience, newStaff.getPatience());

        UIUtil.setLabel(this.oldGlamour, oldStaff.getGlamour());
        UIUtil.setLabel(this.newGlamour, newStaff.getGlamour());

        let staffModel: StaffModConfig = newStaff.getStaffMode();
        let staffName = staffModel.name;
        if (staffModel.isSpecial == 1) {
            staffName += "_special"
        }

        UIUtil.asyncSetImage(this.staffHead, ResManager.STAFF_AVATAR + staffName, false);

        this.node.active = true;

        this.isMaxLv = newStaff.isMaxLevel();
    }

    start() {
        this.staffHead.node.scale = 0;
        this.staffHead.node.opacity = 0;
        for (let nid = 0; nid < this.lvAttNodeArr.length; nid++) {
            let node = this.lvAttNodeArr[nid];
            node.opacity = 0;
        }
        let staffVo: lvUpSucc = this.node['data'];

        this.updateView(staffVo.staff, staffVo.newStaff);
        cc.loader.loadRes(ResManager.STAFF_LV2, sp.SkeletonData, () => {
        }, this.setLeftPawSpine2);
        cc.loader.loadRes(ResManager.STAFF_LV, sp.SkeletonData, () => {
        }, this.setLeftPawSpine);
    }

    setLeftPawSpine = (err: Error, res: sp.SkeletonData) => {
        if(err){
            cc.error(err);
            return;
        }
        if(!this.staffSkelet) return;
        this.staffSkelet.skeletonData = res;
        this.staffSkelet.setAnimation(0, "animation", false);
        let Action = cc.sequence(cc.spawn(cc.fadeTo(0.2, 255), cc.scaleTo(0.2, 1.8)), cc.callFunc(() => {

        }));
        this.staffHead.node.runAction(Action);
    }
    setLeftPawSpine2 = (err: Error, res: sp.SkeletonData) => {
        if(err){
            cc.error(err);
            return;
        }
        if(!this.staffSkelet2) return;
        this.staffSkelet2.skeletonData = res;
        this.staffSkelet2.setAnimation(1, "animation", false);
        this.staffSkelet2.setCompleteListener(() => {
            this.staffSkelet2.setAnimation(1, "animation2", true);
        });
    }

    setOtherScale() {
        let animationNode = this.lvAttNodeArr[this.otherAniIndex];
        if (!animationNode) {
            this.otherAniIndex = 0;
            return;
        }
        let action1 = cc.sequence(cc.fadeTo(0.1, 255), cc.callFunc(() => {
            this.otherAniIndex++
            this.setOtherScale();
        }));
        animationNode.runAction(action1);

    }

}
