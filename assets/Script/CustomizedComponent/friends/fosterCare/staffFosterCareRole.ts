import {Staff} from "../../../Model/StaffData";
import {FosterCareData} from "../../../Model/FriendsData";
import {DataMgr} from "../../../Model/DataManager";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import {TimeUtil} from "../../../Utils/TimeUtil";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {ButtonMgr} from "../../common/ButtonClick";
import {UIMgr} from "../../../global/manager/UIManager";
import fosterCancel from "./fosterCancel";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";
import {RedConst} from "../../../global/const/RedConst";

const {ccclass, property} = cc._decorator;

@ccclass
export class staffFosterCareRole extends cc.Component {

    private url: string = "";
    private actionName: string = "";
    private skinName: string = "";
    private spine: sp.Skeleton = null;

    @property(cc.Node)
    private spineNode: cc.Node = null;
    @property(cc.Node)
    private starsImg: cc.Node = null;
    @property([cc.Sprite])
    starIcons: Array<cc.Sprite> = [];
    @property(cc.Node)
    private treasureBoxNode: cc.Node = null;
    @property(cc.Label)
    private countdownLabel: cc.Label = null;
    @property(cc.SpriteFrame)
    private sf: cc.SpriteFrame = null;
    @property(cc.Node)
    private fosterEnd: cc.Node = null;
    @property(cc.Node)
    private fosterIng: cc.Node = null;
    @property(cc.Node)
    private shadowNode: cc.Node = null;


    private index: number = -1;
    private dispose: CompositeDisposable = new CompositeDisposable();
    private end: number = 0;
    private action = null;
    private time: number = 0;

    setItem = (index: number) => {
        this.index = index;
        let fosterCareData: FosterCareData = DataMgr.getFosterCare();
        if (fosterCareData.fosterCare[this.index]) {
            this.time = DataMgr.fosterCare.fosterCare[this.index].fosterRemain;
            if (this.time > 0) {
                this.fosterEnd.active = false;
                this.fosterIng.active = true;
                this.countdownLabel.string = TimeUtil.getTimeHouseStr(this.time);
            } else {
                this.fosterEnd.active = true;
                this.fosterIng.active = false;
            }
            this.schedule(this.fosterTime, 1);
            let id: number = fosterCareData.fosterCare[this.index].staffId;
            let staff: Staff = DataMgr.getStaff(id);
            this.shadowNode.active = false;
            this.init(staff);
        } else {
            this.fosterIng.active = false;
            this.shadowNode.active = true;
            //this.redPoint.active = DataMgr.getRedData().indexOf(RedConst.FOSTERRED) !== -1;
            this.countdownLabel.node.active = true;
            this.treasureBoxNode.active = false;
            this.countdownLabel.string = "选择员工派遣";
        }
    }

    start() {
        ButtonMgr.addClick(this.node, this.cancelFosterCare);
        ButtonMgr.addClick(this.treasureBoxNode, this.treasureBox);
    }

    fosterTime = () => {
        if (this.time > 0) {
            this.time = DataMgr.fosterCare.fosterCare[this.index].fosterRemain -= 1000;
            this.countdownLabel.string = TimeUtil.getTimeHouseStr(this.time);
            this.treasureBoxNode.active = false;
            this.fosterEnd.active = false;
            this.fosterIng.active = true;
        } else {
            this.treasureBoxNode.active = true;
            this.fosterEnd.active = true;
            this.fosterIng.active = false;
            this.countdownLabel.string = "选择员工派遣";
            this.setBoxAction();
            this.unschedule(this.fosterTime);
        }
    }

    //经验宝箱
    treasureBox = () => {
        this.unschedule(this._actionCallBack);
        this.treasureBoxNode.opacity = 255;
        this.treasureBoxNode.setPosition(cc.v2(-35, -60));
        let action1 = cc.moveTo(0.1, cc.v2(-35, -40));
        let action2 = cc.scaleTo(0.15, 2, 2);
        let action3 = cc.fadeOut(0.15);
        let action = cc.sequence(action1, action2, action3, cc.callFunc(() => {
            this.treasureBoxNode.opacity = 0;
            this.treasureBoxNode.active = false;
            let fosterCareData: FosterCareData = DataMgr.getFosterCare();
            let id: number = fosterCareData.fosterCare[this.index].friendId;
            HttpInst.postData(NetConfig.CANCEL_FOSTER, [id], (res: any) => {
                DataMgr.fosterCare.setFosterCare(res.fosterList);
                DataMgr.staffData.update(res.staff);
                ClientEvents.UPDATE_STAFFLIST.emit();
                ClientEvents.REFRESH_FOSTERCARE.emit();
            });
        }));
        this.treasureBoxNode.runAction(action);
    }

    //取消寄养
    cancelFosterCare = () => {
        if (this.treasureBoxNode.active) {
            this.treasureBox();
        } else {
            let fosterCare = DataMgr.fosterCare;
            if(!fosterCare || !fosterCare.fosterCare) return;
            let fosterLen = fosterCare.fosterCare.length;
            if(fosterLen <= 0 || this.index >= fosterLen) return;
            let fosterMgr = fosterCare.fosterCare[this.index];
            if (!fosterMgr) return;
            DotInst.clientSendDot(COUNTERTYPE.fostercase, "10303", fosterMgr.staffId + "", fosterMgr.fosterRemain + "");
            fosterCare.index = this.index;
            UIMgr.showView(fosterCancel.url, cc.director.getScene());
        }
    }

    init(staff: Staff, actionName: string = null, skinName: string = null) {
        this.initStarIcons(staff);
        this.url = staff.getSpineUrl();

        this.actionName = actionName || "zhanli";
        this.skinName = skinName || "weixiao";

        cc.loader.loadRes(this.url, sp.SkeletonData, this.onProcess, this.onComplete);
    }

    private initStarIcons(staff: Staff) {
        let starSize = Math.min(staff.star, this.starIcons.length);
        for (let i = 0; i < starSize; i++) {
            this.starIcons[i].node.active = true;
        }
    }

    onProcess = (completeCount, totalCount, item) => {

    };

    onComplete = (err, res) => {
        if (err) {
            cc.error(err);
            return;
        }
        if (!this.spineNode) {
            return;
        }

        this.spine = this.spineNode.getComponent('sp.Skeleton');
        this.spine.skeletonData = res;

        this.spine.setAnimation(0, this.actionName, true);
        this.spine.setSkin(this.skinName);
    };

    onDestroy() {
        this.node.destroy();
        this.dispose.dispose();
    }

    setBoxAction() {
        this.end = 0;
        let action1 = cc.moveTo(0.1, cc.v2(-35, -45));
        let action2 = cc.rotateTo(0.1, -30);
        let action3 = cc.moveTo(0.1, cc.v2(-35, -60));
        let action4 = cc.rotateTo(0.1, 0);
        this.action = cc.sequence(cc.spawn([action1, action2]), cc.callFunc(() => {
            this.treasureBoxNode.runAction(cc.sequence(action4, action3, cc.callFunc(() => {
                this.end++;
            })));
        }));
        this.playBoxAction();
    }

    playBoxAction() {
        this.schedule(this._actionCallBack, 0.5);
    }

    _actionCallBack = () => {
        if (this.end == 2) {
            this.treasureBoxNode.stopAllActions();
            this.scheduleOnce(() => {
                this.end = 1;
            }, 1);
        } else {
            this.treasureBoxNode.runAction(this.action);
        }
    }
}
