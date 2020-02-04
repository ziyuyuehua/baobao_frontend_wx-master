/**
 * @author Lizhen
 * @date 2019/11/30
 * @Description:
 */
import {GameComponent} from "../../core/component/GameComponent";
import {StaffGiftData} from "../../Model/StaffGiftData";
import {DataMgr, GET_ANI_TYPE} from "../../Model/DataManager";
import {JsonMgr, StaffConfig, StaffRandomConfig} from "../../global/manager/JsonManager";
import {IStaffGiftInfo} from "../../types/Response";
import {Staff} from "../../Model/StaffData";
import {UIMgr} from "../../global/manager/UIManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {UIUtil} from "../../Utils/UIUtil";
import {WxVideoAd} from "../login/WxVideoAd";
import {GameManager} from "../../global/manager/GameManager";
import {GuideIdType} from "../../global/const/GuideConst";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import property = cc._decorator.property;
import ccclass = cc._decorator.ccclass;

const millis2Day = 24 * 60 * 60 * 1000;
const millis2Hour = 60 * 60 * 1000;
const millis2Minute = 60 * 1000;
const millis2Second = 1000;
@ccclass()
export class StaffGiftsPlane extends GameComponent {
    static url: string = "Prefab/StaffGifts/StaffGiftsPlane";
    @property([cc.Sprite])
    starIcons: Array<cc.Sprite> = [];
    @property(cc.Node)
    spineNode: cc.Node = null;
    @property(cc.Node)
    node1: cc.Node = null;
    @property(cc.Node)
    welcomeBtn: cc.Node = null;
    @property(cc.Node)
    receiveBtn: cc.Node = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;
    @property(cc.Label)
    gangweiLabel: cc.Label = null;
    @property(cc.Node)
    node2: cc.Node = null;

    @property(cc.Node)
    path0: cc.Node = null;
    @property(cc.Node)
    path1: cc.Node = null;
    @property(cc.Node)
    path2: cc.Node = null;
    @property(cc.Node)
    car: cc.Node = null;
    @property(cc.Node)
    carSpr: cc.Node = null;

    @property(cc.Label)
    timeLabel: cc.Label = null;

    private staffGiftData: StaffGiftData = null;
    private staffGiftPlaneData: IStaffGiftInfo = null;
    private staffGiftJsonInfo: IStaffGiftJson = null;

    private CurSoftGuide: cc.Node = null;
    private CurSoftGuideId: number = 0;
    getBaseUrl() {
        return StaffGiftsPlane.url;
    }
    load() {
        this.initData(this.node["data"]);
        this.initView();
    }
    onEnable() {
        this.onShowPlay(2, this.node.getChildByName("bg"));
    }
    initData(data: any) {
        this.staffGiftData = DataMgr.staffGift;
        this.staffGiftPlaneData = data;
        this.staffGiftJsonInfo = JsonMgr.getStaffGiftData(this.staffGiftPlaneData.id);
    }
    initView() {
        if (this.staffGiftPlaneData.hasReward) {
            this.initNode1View();
            this.setNodeActive(true);
            this.welcomeBtn.active = false;
            this.receiveBtn.active = true;
            if (this.receiveBtn.active) {
                let endSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunBaoBao, 2);
                if (endSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                    DotInst.clientSendDot(COUNTERTYPE.softGuide, "19068");
                    GuideMgr.showSoftGuide(this.receiveBtn, ARROW_DIRECTION.BOTTOM, endSoftGuide.displayText, (node: cc.Node) => {
                        this.CurSoftGuide = node;
                        this.CurSoftGuideId = endSoftGuide.id;
                    }, false, 0, false, () => {
                        this.receiveHandler();
                    });
                }
            }
        } else if (this.staffGiftPlaneData.endTime == 0) {
            this.initNode1View();
            this.setNodeActive(true);
            this.welcomeBtn.active = true;
            this.receiveBtn.active = false;
        } else if (!this.staffGiftPlaneData.hasReward && this.staffGiftPlaneData.endTime != 0) {
            this.initNode2View();
            this.setNodeActive(false);
        }
    }
    setNodeActive(boo: boolean) {
        this.node1.active = boo;
        this.node2.active = !boo;
        this.node.getChildByName("btn1").active = boo;
        this.node.getChildByName("btn2").active = !boo;
        this.node.getChildByName("back_btn").active = !boo;
    }
    initNode1View() {
        let json: IStaffGiftJson = this.staffGiftJsonInfo;
        if (json.staffId >= 10000) {
            let json1:StaffRandomConfig = JsonMgr.getStaffRandom(json.staffId);
            this.nameLabel.string = json.staffName.toString();
            this.initSpine(json.staffId);
            this.initStarIcons(json1.star);
        } else {
            let staff: StaffConfig = JsonMgr.getStaff(json.staffId);
            this.nameLabel.string = staff.name;
            console.log(staff);
            this.initSpine(staff.artResId);
            this.initStarIcons(staff.star);
        }
        this.levelLabel.string = json.staffLevel.toString();
        this.gangweiLabel.string = this.setGangwei(json.post);
    }
    setGangwei(type):string{
        let str:string = "";
        switch (type){
            case 0:
                str = "收银员";
                break;
            case 1:
                str = "售货员";
                break;
            case 2:
                str = "揽客员";
                break;
            case 3:
                str = "理货员";
                break;
        }
        return str;
    }
    private initStarIcons(star: number) {
        Staff.initStarIcon(star, this.starIcons);
    }
    initSpine(artResId: number) {
        let spineUrl = Staff.getStaffSpineUrl(artResId);
        cc.loader.loadRes(spineUrl, sp.SkeletonData, null, this.onComplete);
    }
    private spine: sp.Skeleton = null;
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
        this.spine.setAnimation(0, "zhanli", true);
        this.spine.setSkin("weixiao");
    };
    initNode2View() {
        let Time: number = DataMgr.getServerTime();
        if (this.staffGiftPlaneData.endTime <= Time) {
            this.timeLabel.string = "00:00:00";
        } else {
            this.timeLabel.string = this.getLongOrderTimeStr(this.staffGiftPlaneData.endTime - Time);
        }
        if (this.staffGiftJsonInfo.staffId >= 10000) {
            this.initCarSpr(Staff.getStaffAvataUrlByResId(this.staffGiftJsonInfo.staffId));
        } else {
            let staff: StaffConfig = JsonMgr.getStaff(this.staffGiftJsonInfo.staffId);
            this.initCarSpr(Staff.getStaffAvataUrlByResId(staff.artResId));
        }
        if (this.staffGiftJsonInfo.speedUp == 1) {
            if(DataMgr.isCanWatchAdvert()){
                this.node.getChildByName("btn2").getChildByName("videoBtn").active = true;
                this.node.getChildByName("btn2").getChildByName("shareBtn").active = false;
            }else{
                this.node.getChildByName("btn2").getChildByName("videoBtn").active = false;
                this.node.getChildByName("btn2").getChildByName("shareBtn").active = true;
            }
        } else if (this.staffGiftJsonInfo.speedUp == 2) {
            this.node.getChildByName("btn2").getChildByName("videoBtn").active = false;
            this.node.getChildByName("btn2").getChildByName("shareBtn").active = true;
        }
        this.getCarPath(this.staffGiftPlaneData.road);
        this.refuseCd();
    }
    initCarSpr(url: string) {
        UIUtil.dynamicLoadImage(url, (spriteFrame) => {
            if (this) {
                this.carSpr.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = spriteFrame;
                this.carSpr.getChildByName("icon").setScale(0.5);
            }
        })
    }
    closeHandler(receiveClick: boolean = false) {
        DotInst.clientSendDot(COUNTERTYPE.staffGift, "170004"); //升职打点
        this.spine = null;
        this.unscheduleAllCallbacks();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, 0);
        if(typeof (receiveClick) !== "boolean") {
            this.closeView();
        } else {
            this.closeOnly();
        }
    }
    welcomeHandler() {
        HttpInst.postData(NetConfig.START_FOR_RECEIVE, [], (res: any) => {
            this.initData(res.staffGiftInfo);
            this.initView();
        });
    }
    receiveHandler() {
        HttpInst.postData(NetConfig.STAFF_GIFT_RECEIVE, [], (res: any) => {
            if (this.CurSoftGuide) {
                this.CurSoftGuide.active = false;
            }
            HttpInst.postData(NetConfig.SOFT_LED_INFO, [this.CurSoftGuideId], (response) => {
            });
            ClientEvents.SET_SPECIAL_ID.emit(res.receiveStaffs[0].staffId);
            this.unscheduleAllCallbacks();
            this.closeHandler(true);
            ClientEvents.EVENT_REFUSE_STAFFGIFT.emit();
        });
    }
    getLongOrderTimeStr(millis: number): string {//长途订单特殊时间显示
        let hour = Math.floor(millis / millis2Hour);
        let remainder = millis % millis2Hour;
        let minute = Math.floor(remainder / millis2Minute);
        remainder = remainder % millis2Minute;
        let second = Math.floor(remainder / millis2Second);
        return this.longOrderPadding(hour) + ":" + this.longOrderPadding(minute) + ":" + this.longOrderPadding(second)
    }
    longOrderPadding(num: number) {
        let numStr = num + "";
        return numStr.length < 2 ? "0" + numStr : numStr;
    }
    refuseCd() {
        this.unscheduleAllCallbacks();
        this.schedule(() => {
            let Time: number = DataMgr.getServerTime();
            if (this.staffGiftPlaneData.endTime <= Time) {
                this.unscheduleAllCallbacks();
                this.closeHandler();
                HttpInst.postData(NetConfig.STAFF_GIFT_RECEIVE, [], (res: any) => {
                    ClientEvents.EVENT_REFUSE_STAFFGIFT.emit();
                    ClientEvents.SET_SPECIAL_ID.emit(res.receiveStaffs[0].staffId);
                });
            } else {
                this.getCarPos(this.staffGiftPlaneData.road);
                this.timeLabel.string = this.getLongOrderTimeStr(this.staffGiftPlaneData.endTime - Time);
            }
        }, 1);
    }
    addSpeedHandler() {
        if (this.staffGiftJsonInfo.speedUp == 1) {
            DotInst.clientSendDot(COUNTERTYPE.staffGift, "170002", this.staffGiftJsonInfo.staffId.toString()); //看广告
            if (DataMgr.isCanWatchAdvert()) {
                WxVideoAd.showVideo(() => {
                    HttpInst.postData(NetConfig.AXXELERATE,
                        [], (response: any) => {
                            this.initData(response.staffGiftInfo);
                            // this.initView();
                        });
                }, () => {
                    UIMgr.showTipText("请观看完整广告！");
                })
            } else {
                GameManager.WxServices.shareGame("来和我一起成为店长拥有自己的小店吧~", `https://cdn.nuojuekeji.com/uploadImages/share/xuanchuan2.png`, "", () => {
                    HttpInst.postData(NetConfig.AXXELERATE,
                        [], (response: any) => {
                            this.initData(response.staffGiftInfo);
                            // this.initView();
                        });
                });
            }
        } else {
            DotInst.clientSendDot(COUNTERTYPE.staffGift, "170003", this.staffGiftJsonInfo.staffId.toString()); //分享
            GameManager.WxServices.shareGame("来和我一起成为店长拥有自己的小店吧~", `https://cdn.nuojuekeji.com/uploadImages/share/xuanchuan2.png`, "", () => {
                HttpInst.postData(NetConfig.AXXELERATE,
                    [], (response: any) => {
                        this.initData(response.staffGiftInfo);
                        this.initView();
                    });
            });
        }
    }
    private pathArr = [
        { width: 50, rotation: -10, posX: 175, posY: 105, carR: -5, carPos: { x: 205, y: 100 }, finalPos: { x: 150, y: 100 } },
        { width: 290, rotation: 80, posX: 130, posY: -28, carR: 85, carPos: { x: 150, y: 100 }, finalPos: { x: 105, y: -165 } },
        { width: 200, rotation: -16, posX: 15, posY: -140, carR: -5, carPos: { x: 105, y: -165 }, finalPos: { x: -90, y: -110 } }];
    private pathArr1 = [
        { width: 150, rotation: -10, posX: 125, posY: 115, carR: -5, carPos: { x: 205, y: 100 }, finalPos: { x: 55, y: 125 } },
        { width: 280, rotation: 80, posX: 30, posY: -4, carR: 85, carPos: { x: 55, y: 125 }, finalPos: { x: 5, y: -140 } },
        { width: 100, rotation: -16, posX: -35, posY: -128, carR: -5, carPos: { x: 5, y: -140 }, finalPos: { x: -90, y: -110 } }];
    private pathArr2 = [
        { width: 250, rotation: -10, posX: 75, posY: 125, carR: -5, carPos: { x: 205, y: 100 }, finalPos: { x: -45, y: 145 } },
        { width: 140, rotation: 80, posX: -52, posY: 83, carR: 85, carPos: { x: -45, y: 145 }, finalPos: { x: -65, y: 10 } },
        { width: 140, rotation: 80, posX: -74, posY: -43, carR: 85, carPos: { x: -65, y: 10 }, finalPos: { x: -90, y: -110 } }];
    getCarPath(num: number) {
        switch (num) {
            case 1:
                for (let i = 0; i < 3; i++) {
                    this["path" + i].setPosition(this.pathArr[i].posX, this.pathArr[i].posY);
                    this["path" + i].width = this.pathArr[i].width;
                    this["path" + i].angle = this.pathArr[i].rotation;
                }
                break;
            case 2:
                for (let i = 0; i < 3; i++) {
                    this["path" + i].setPosition(this.pathArr1[i].posX, this.pathArr1[i].posY);
                    this["path" + i].width = this.pathArr1[i].width;
                    this["path" + i].angle = this.pathArr1[i].rotation;
                }
                break;
            case 3:
                for (let i = 0; i < 3; i++) {
                    this["path" + i].setPosition(this.pathArr2[i].posX, this.pathArr2[i].posY);
                    this["path" + i].width = this.pathArr2[i].width;
                    this["path" + i].angle = this.pathArr2[i].rotation;
                }
                break;
        }
        this.getCarPos(num);
    }
    private carSpeedX: number = 0;
    private carSpeedY: number = 0;
    getCarPos(num: number) {
        switch (num) {
            case 1:
                this.moveCar(this.pathArr);
                break;
            case 2:
                this.moveCar(this.pathArr1);
                break;
            case 3:
                this.moveCar(this.pathArr2);
                break;
        }
    }
    moveCar(array: any) {//必须三段
        let Time: number = DataMgr.getServerTime();
        let json: IStaffGiftJson = this.staffGiftJsonInfo;
        let time = (json.time - (this.staffGiftPlaneData.endTime - Time) / 1000);
        let one = array[0].width;
        let two = array[1].width;
        let three = array[2].width;
        let all = one + two + three;
        if (time / json.time <= (one / all)) {
            let time1: number = one / all * json.time;
            this.carSpeedX = (array[0].finalPos.x - array[0].carPos.x) / time1;
            this.carSpeedY = (array[0].finalPos.y - array[0].carPos.y) / time1;
            this.car.setPosition((array[0].carPos.x + this.carSpeedX * time), (array[0].carPos.y + this.carSpeedY * time));
            this.carSpr.setPosition((array[0].carPos.x + this.carSpeedX * time), (array[0].carPos.y + this.carSpeedY * time + 40));
            this.car.angle = array[0].carR;
        } else if (time / json.time <= ((one + two) / all) && time / json.time > (one / all)) {
            let time1: number = one / all * json.time;
            let time2: number = two / all * json.time;
            this.carSpeedX = (array[1].finalPos.x - array[1].carPos.x) / time2;
            this.carSpeedY = (array[1].finalPos.y - array[1].carPos.y) / time2;
            this.car.setPosition((array[1].carPos.x + this.carSpeedX * (time - time1)), (array[1].carPos.y + this.carSpeedY * (time - time1)));
            this.carSpr.setPosition((array[1].carPos.x + this.carSpeedX * (time - time1)), (array[1].carPos.y + this.carSpeedY * (time - time1) + 40));
            this.car.angle = array[1].carR;
        } else if (time / json.time > ((one + two) / all)) {
            let time3: number = (one + two) / all * json.time;
            this.carSpeedX = (array[2].finalPos.x - array[2].carPos.x) / (three / all * json.time);
            this.carSpeedY = (array[2].finalPos.y - array[2].carPos.y) / (three / all * json.time);
            this.car.setPosition((array[2].carPos.x + this.carSpeedX * (time - time3)), (array[2].carPos.y + this.carSpeedY * (time - time3)));
            this.carSpr.setPosition((array[2].carPos.x + this.carSpeedX * (time - time3)), (array[2].carPos.y + this.carSpeedY * (time - time3) + 40));
            this.car.angle = array[2].carR;
        }
    }

}