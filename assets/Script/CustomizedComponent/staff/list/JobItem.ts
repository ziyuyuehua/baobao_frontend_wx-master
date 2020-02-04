import {JobType, Staff} from "../../../Model/StaffData";
import {UIUtil} from "../../../Utils/UIUtil";
import {DataMgr} from "../../../Model/DataManager";
import {StaffRole} from "./StaffRole";
import {Direction, Role} from "../../map/Role";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {StringUtil} from "../../../Utils/StringUtil";
import {TextTipConst} from "../../../global/const/TextTipConst";

const { ccclass, property } = cc._decorator;

@ccclass
export class JobItem extends cc.Component {

    @property(StaffRole)
    private staffRole: StaffRole = null;

    @property(cc.Sprite)
    private stageIcon: cc.Sprite = null;

    @property(cc.Sprite)
    private idleIcon: cc.Sprite = null;

    @property(cc.Node)
    private lockNode: cc.Node = null;

    @property(cc.Animation)
    protected smokeAnim: cc.Animation = null;

    private staffId: number = -1;
    private jobType: JobType = -1;
    private index: number = -1;
    private isNew: boolean = false;

    onLoad(){
        this.smokeAnim.on("stop", () => {
            UIUtil.hide(this.smokeAnim);
        });
    }

    initItem(staffId: number, jobType: JobType, index: number, isNew: boolean) {
        this.staffId = staffId;
        this.jobType = jobType;
        this.index = index;
        this.isNew = isNew;

        this.hideAll();
        this.checkShow();
    }

    private hideAll(){
        UIUtil.hide(this.staffRole);
        UIUtil.hide(this.idleIcon);
        UIUtil.hideNode(this.lockNode);
    }

    private checkShow(){
        if (this.staffId < 0) {
            this.showLock();
        } else if (this.staffId == 0) {
            this.showIdle();
        } else {
            let staff: Staff = DataMgr.getStaff(this.staffId);
            if (staff) {
                if(this.isNew){
                    this.playUpWork();
                    this.scheduleOnce(() => {
                        this.showStaff(staff);
                    }, 0.1);
                }else{
                    this.showStaff(staff);
                }
            }
        }
    }

    private showLock(){
        let jobLimitLv = JsonMgr.getJobLimitLv(this.jobType, this.index+1, DataMgr.getMarketId());
        let diffLv = jobLimitLv - DataMgr.iMarket.getExFrequency();
        //cc.log(" ==> ", this.jobType, this.index, jobLimitLv);
        UIUtil.setLabel(this.lockNode.getChildByName("lockLab").getComponent(cc.Label),
            StringUtil.format(JsonMgr.getTips(TextTipConst.JOB_LIMIT_LV), diffLv));
        UIUtil.showNode(this.lockNode);
    }

    private showIdle(){
        UIUtil.show(this.idleIcon);
    }

    private showStaff(staff: Staff){
        this.staffRole.init(staff, Direction.LEFT,
            false, Role.IDEL_ACTION, Role.SMILE_SKIN);
        this.staffRole.show();
    }

    hasStaff(): boolean {
        return this.staffId > 0;
    }

    playUpWork(){
        UIUtil.show(this.smokeAnim);
        this.smokeAnim.play(this.smokeAnim.getClips()[0].name);
    }

}
