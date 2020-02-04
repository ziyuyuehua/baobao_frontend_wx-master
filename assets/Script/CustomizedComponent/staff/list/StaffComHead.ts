import { blackColor } from "../../../global/const/StringConst";
import { ClientEvents } from "../../../global/manager/ClientEventCenter";
import { DataMgr } from "../../../Model/DataManager";
import { Staff } from "../../../Model/StaffData";
import { IStaffAttColor, IStaffExp } from "../../../types/Response";
import { CompositeDisposable } from "../../../Utils/event-kit";
import { UIUtil } from "../../../Utils/UIUtil";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class StaffComHead extends cc.Component {
    static url: string = "staff/list/staffComHead";

    @property([cc.Sprite])
    starIcons: Array<cc.Sprite> = [];   //星星

    @property(cc.Label)
    intelligenceLabel: cc.Label = null;

    @property(cc.Label)
    powerLabel: cc.Label = null;

    @property(cc.Label)
    glamourLabel: cc.Label = null;

    @property(cc.Label)
    patienceLabel: cc.Label = null;

    @property(cc.Label)
    expLabel: cc.Label = null;

    @property(cc.ProgressBar)
    expProgressBar: cc.ProgressBar = null;

    @property(cc.ProgressBar)
    addExpProgressBar: cc.ProgressBar = null;

    @property(cc.Label)
    lvLabel: cc.Label = null;

    @property(cc.Sprite)
    headIcon: cc.Sprite = null;

    @property(cc.Sprite)
    headQuIcon: cc.Sprite = null;

    @property headIconType = 1;

    @property(cc.Sprite)
    jobNameIcon: cc.Sprite = null;

    private dispose = new CompositeDisposable();

    start() {
        let staff: Staff = DataMgr.getChooseStaff();
        this.addExpProgressBar.progress = 0;
        this.updataStaff(staff);
        this.dispose.add(ClientEvents.UPDATE_STAFF_ATT.on((arr: IStaffAttColor[]) => {
            this.updataStaffArr(arr);
        }));
        this.dispose.add(ClientEvents.UPDATE_STAFF_EXP.on((exp: IStaffExp) => {
            this.lvLabel.string = exp.lv + "";
            this.expLabel.string = exp.afterChangedExp + "/" + exp.lvUpExp;
            this.addExpProgressBar.progress = exp.progress;
            UIUtil.setOpacity(this.expProgressBar.barSprite, exp.isup ? 0 : 255);
        }));
        this.dispose.add(ClientEvents.UPDATE_STAFF.on(this.updataStaff));
        this.dispose.add(ClientEvents.RESET_STAFF_EXP.on(() => {
            this.addExpProgressBar.progress = 0;
            this.expProgressBar.barSprite.node.opacity = 255;
            this.resetAttColor();
        }));

        DataMgr.staffData.staffLvPos = this.headQuIcon.node.position;
    }

    updataStaff = (staff: Staff) => {
        this.initStarIcons(staff);
        this.initStaffAtt(staff);
        this.initStaffLv(staff);
        this.initStaffOther(staff);
    };

    initStarIcons(staff: Staff) {
        Staff.initStarIcon(staff.star, this.starIcons);
    }

    initStaffAtt(staff: Staff) {
        this.intelligenceLabel.string = staff.getIntelligence() + "";
        this.powerLabel.string = staff.getPower() + "";
        this.patienceLabel.string = staff.getPatience() + "";
        this.glamourLabel.string = staff.getGlamour() + "";
    }

    updataStaffArr(arr: IStaffAttColor[]) {
        UIUtil.setLabel(this.intelligenceLabel, arr[0].staffNum, arr[0].color);
        UIUtil.setLabel(this.powerLabel, arr[1].staffNum, arr[1].color);
        
        UIUtil.setLabel(this.patienceLabel, arr[2].staffNum, arr[2].color);
        UIUtil.setLabel(this.glamourLabel, arr[3].staffNum, arr[3].color);
    }

    resetAttColor() {
        this.intelligenceLabel.node.color = blackColor;
        this.powerLabel.node.color = blackColor;
        this.patienceLabel.node.color = blackColor;
        this.glamourLabel.node.color = blackColor;
    }

    initStaffLv(staff: Staff) {
        this.expLabel.string = staff.getExpLabelStr();
        if (this.headIconType == 1) {
            this.lvLabel.string = staff.level + "";
        } else {
            this.lvLabel.string = staff.level + "";
        }
        this.expProgressBar.progress = staff.getExpProgress();
    }

    initStaffOther(staff: Staff) {
        UIUtil.asyncSetImage(this.jobNameIcon, staff.getSuggestJobImageUrl());
        if (this.headIconType == 1) {
            UIUtil.asyncSetImage(this.headQuIcon, staff.getStarBorderUrl(), false);
        } else {
            UIUtil.asyncSetImage(this.headQuIcon, staff.getStarBorderNoUrl(), false);
        }
        UIUtil.asyncSetImage(this.headIcon, staff.getAvatarUrl());
    }

    onDestroy() {
        this.dispose.dispose();
    }

    // update (dt) {}
}
