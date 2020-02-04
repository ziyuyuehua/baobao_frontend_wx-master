import {CompositeDisposable} from "../../../Utils/event-kit";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {TimeUtil} from "../../../Utils/TimeUtil";
import {ResManager} from "../../../global/manager/ResManager";
import {IFriendFoster} from "../../../types/Response";
import {Staff} from "../../../Model/StaffData";

const {ccclass, property} = cc._decorator;

@ccclass
export class friendsStaffRole extends cc.Component {

    private url: string = "";
    private spine: sp.Skeleton = null;

    @property(cc.Label)
    private countdownLabel: cc.Label = null;

    @property(cc.Label)
    private fosterEnd: cc.Label = null;

    @property(cc.Label)
    private friendName: cc.Label = null;

    private ble: boolean = false;
    private index: number = 0;
    private dispose = new CompositeDisposable();
    private friendsStaff: IFriendFoster = null;
    private time: number = 0;

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_FOCUS_SLIDE.on(this.panduan));
    }

    start() {
        this.schedule(this.refreshTime, 1);
    }

    refreshTime = () => {
        if (this.time > 0) {
            this.time = this.friendsStaff.fosterRemain -= 1000;
            this.fosterEnd.node.active = false;
            this.countdownLabel.node.active = true;
            this.countdownLabel.string = TimeUtil.getTimeHouseStr(this.time);
        } else {
            this.fosterEnd.node.active = true;
            this.countdownLabel.node.active = false;
        }
    }

    panduan = (ble: boolean) => {
        this.ble = !ble;
    }

    initItem = (data: IFriendFoster, index: number) => {
        this.friendsStaff = data;
        this.time = data.fosterRemain;
        this.countdownLabel.string = TimeUtil.getTimeHouseStr(this.time);
        this.friendName.string = data.friendName.length > 6 ? data.friendName.substring(0, 6) + "..." : data.friendName;
        this.url = this.getStaffSpineUrl(data.artResId);
        cc.loader.loadRes(this.url, sp.SkeletonData, this.onProcess, this.onComplete);
    }

    getStaffSpineUrl(artResId: number, isLow: boolean = false) {
        const modName: string = Staff.getStaffModName(artResId);
        return ResManager.STAFF_SPINE + Staff.getSpineDir(isLow) + modName + "/" + modName;
    }

    onProcess = (completeCount, totalCount, item) => {

    };

    onComplete = (err, res) => {
        if (err) {
            cc.error(err);
            return;
        }
        if(!this.node){
            return;
        }
        this.spine = this.node.getChildByName("spine").getComponent('sp.Skeleton');
        this.spine.skeletonData = res;
        this.spine.setAnimation(0, "zhanli", true);
        this.spine.setSkin("weixiao");
    };

    onDestroy() {
        this.dispose.dispose();
    }

}
