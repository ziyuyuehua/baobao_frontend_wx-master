/**
 * @author Lizhen
 * @date 2019/9/26
 * @Description:
 */
import {UIMgr} from "../../../../../../global/manager/UIManager";
import {GameComponent} from "../../../../../../core/component/GameComponent";
import {GoldFairCostConfig} from "../../../../../../global/manager/JsonManager";
import {FriendRecruit, FriendRecruitResult} from "../../../../../../Model/RecruitData";
import {ClientEvents} from "../../../../../../global/manager/ClientEventCenter";
import {DataMgr} from "../../../../../../Model/DataManager";
import {CommonUtil} from "../../../../../../Utils/CommonUtil";
import {Ball} from "../Ball";
import {UIUtil} from "../../../../../../Utils/UIUtil";
import {ResManager} from "../../../../../../global/manager/ResManager";
import {HttpInst} from "../../../../../../core/http/HttpClient";
import {NetConfig} from "../../../../../../global/const/NetConfig";
import {Staff} from "../../../../../../Model/StaffData";
import {FriendRecruitSurePanel} from "./FriendRecruitSurePanel";
import {FriendRecruitAni} from "./FriendRecruitAni";

const millis2Day = 24 * 60 * 60 * 1000;
const millis2Hour = 60 * 60 * 1000;
const millis2Minute = 60 * 1000;
const millis2Second = 1000;
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {ItemIdConst} from "../../../../../../global/const/ItemIdConst";

@ccclass()
export class FriendGoldRectuitPanel extends GameComponent {
    static url: string = "Prefab/recruit/friend/FriendGoldRectuitPanel";
    @property(cc.Label)
    goldLabel: cc.Label = null;
    @property(cc.Label)
    popularityLabel: cc.Label = null;
    @property(cc.Node)
    ballsNode: cc.Node = null;
    @property(cc.Node)
    costBg: cc.Node = null;
    @property(cc.Node)
    dibanNode: cc.Node = null;

    @property(cc.Node)
    skipBtn: cc.Node = null;

    @property(cc.Node)
    tuoyuan1: cc.Node = null;
    @property(cc.Node)
    tuoyuan2: cc.Node = null;
    @property(cc.Node)
    tuoyuan3: cc.Node = null;
    @property(cc.Node)
    tuoyuan4: cc.Node = null;
    @property(cc.Node)
    tuoyuan5: cc.Node = null;
    @property(cc.Node)
    tuoyuan6: cc.Node = null;
    @property(cc.Prefab)
    private RecruitAni: cc.Prefab = null;
    @property(sp.Skeleton)
    recruit_daletou: sp.Skeleton = null;


    private hole: cc.Node = null;
    private config: GoldFairCostConfig = null;
    private goldRectuiData: FriendRecruit = null;
    private isSuc: boolean = false;//这次是否招募成功
    private ballHole: number = 0;//这次球要进的球洞
    private camera: cc.Node = null;
    private hasStaff: boolean = false;//是否重复（已经有该unique员工或者货架）
    private isNew: boolean = false;

    private hasBall = false;

    private ballPosition: Array<any> = [cc.v2(-237, 50), cc.v2(-116, 50), cc.v2(4, 50), cc.v2(125, 50), cc.v2(245, 50)];

    getBaseUrl() {
        return FriendGoldRectuitPanel.url;
    }


    load() {
        // this.node["data"] = false;
        this.initNode();
        this.initPhysic();
        this.initData();
        this.initView();
        this.initBalls();
        this.initListener();
        this.refreshItemNum();
        this.refreshUI();
        this.addEvent(ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.on(this.refreshItemNum));
        this.addEvent(ClientEvents.EVENT_REFRESH_GOLD.on(this.refreshUI));
        cc.director.getScene().getChildByName('Canvas').getChildByName("Main Camera").active = false;
    }

    refreshUI = (isFirst: boolean = false) => {
        //取得数据
        const userData = DataMgr.userData;
        UIUtil.setLabel(this.goldLabel, CommonUtil.numChange(userData.gold)); //金币
    };

    unload() {
        cc.director.getPhysicsManager().enabled = false;
        this.unscheduleAllCallbacks();
    }

    refreshItemNum = () => {
        let friendshipNum = DataMgr.getItemNum(ItemIdConst.FRIEND_POINT);
        UIUtil.setLabel(this.popularityLabel, friendshipNum);
    };

    initUserData() {
        const userData = DataMgr.userData;
        UIUtil.setLabel(this.goldLabel, CommonUtil.numChange(userData.gold)); //金币
        let wareCount = DataMgr.warehouseData.getItemDataVo(100601);
        this.popularityLabel.string = (wareCount ? wareCount.num : 0) + "";
    }

    initNode() {
        this.hole = this.dibanNode.getChildByName("tuan");
        this.camera = this.node.getChildByName("Camera");
    }

    initPhysic() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().gravity = cc.v2(0, -1280);
        cc.director.getCollisionManager().enabled = true;
    }

    onEnable() {
        let frame = cc.winSize;
        this.node.getChildByName("bg").height = frame.height * 2;
        this.dibanNode.setPosition(this.dibanNode.x, -frame.height * 1.5);
        this.ballsNode.height = 240 + frame.height;
    }

    initListener() {
        this.addEvent(ClientEvents.GOLD_RECRUIT.on(() => {
            cc.director.getPhysicsManager().enabled = true;
            this.node["data"] = false;
            this.skipBtn.active = false;
            this.initData();
            this.initView();
            this.initBalls();
            this.camera.setPosition(this.camera.x, this.camera.y + cc.winSize.height);
            this.showRecruitAniPre(this.zhaomuBallData, this.isSuc);

            this.zhaomuBallData = null;
        }));
    }

    skipAnimation() {
        ClientEvents.GOLD_RECRUIT.emit();
    }

    private initData() {
        this.goldRectuiData = DataMgr.getFriendRecruit();
        this.initUserData();
    }

    setCdTime() {
        let Time: number = DataMgr.getServerTime();
        for (let i = 0; i < this.goldRectuiData.recruitStaffs.length; i++) {
            let data: FriendRecruitResult = this.goldRectuiData.recruitStaffs[i];
            if (data.endTime <= Time) {
                this.costBg.getChildByName("cost" + (i + 1)).getChildByName("num").getComponent(cc.Label).string = "已过期";
            } else {
                this.costBg.getChildByName("cost" + (i + 1)).getChildByName("num").getComponent(cc.Label).string = this.getLongOrderTimeStr((data.endTime - (Time)));
            }
        }
    }

    refuseCd() {
        this.schedule(() => {
            this.setCdTime();
        }, 1);
    }

    getLongOrderTimeStr(millis: number): string {//长途订单特殊时间显示
        let hour = Math.floor(millis / millis2Hour);
        let remainder = millis % millis2Hour;
        let minute = Math.floor(remainder / millis2Minute);
        remainder = remainder % millis2Minute;
        let second = Math.floor(remainder / millis2Second);
        return this.longOrderPadding(hour) + ":" + this.longOrderPadding(minute) + ":" + this.longOrderPadding(second);
    }

    longOrderPadding(num: number) {
        let numStr = num + "";
        return numStr.length < 2 ? "0" + numStr : numStr;
    }

    private initView() {
        this.setCdTime();
        this.refuseCd();
    }

    public initBalls() {
        this.hasBall = false;
        if (this.node["data"]) {
            for (let i = 0; i < this.goldRectuiData.recruitStaffs.length; i++) {
                let node: cc.Node = this.ballsNode.getChildByName("ball" + (i + 1));
                node.setPosition(this.ballPosition[i]);
                let rigidBody: cc.RigidBody = node.getComponent(cc.RigidBody);
                rigidBody.awake = false;
                let ballComponent: Ball = node.getComponent("Ball");
                ballComponent.init();
                let data: FriendRecruitResult = this.goldRectuiData.recruitStaffs[i];
                if (data.itemXmlId != -1) {
                    node.active = true;
                    this.hasBall = true;
                    this.setBallSkin(node, data);
                    this.recruit_daletou.animation = "animation";
                    this.ballDownAni(node, (i + 1) * 0.2, () => {
                        UIUtil.dynamicLoadRecruitRes(ResManager.GOLD_RECRUIT_SPINE + "recruit_daletouguang" + (data.getStar() - 2), (spineData: sp.SkeletonData) => {
                            let spine: sp.Skeleton = node.getChildByName("spine").getComponent(sp.Skeleton);
                            spine.skeletonData = spineData;
                            spine.setAnimation(0, "animation", false);
                        });
                        this.initBallCost(i + 1, true);
                    });
                } else {
                    node.active = false;
                }
            }
        } else {
            for (let i = 0; i < this.goldRectuiData.recruitStaffs.length; i++) {
                let node: cc.Node = this.ballsNode.getChildByName("ball" + (i + 1));
                node.setPosition(this.ballPosition[i]);
                let data: FriendRecruitResult = this.goldRectuiData.recruitStaffs[i];
                if (data.itemXmlId != -1) {
                    node.active = true;
                    this.hasBall = true;
                    this.setBallSkin(node, data);
                    node.setPosition(node.x, node.y - 122);
                    this.initBallCost(i + 1, true);
                } else {
                    node.stopAllActions();
                    node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 0);
                    node.active = false;
                }
            }
        }
    }

    initBallCost(id: number, show: boolean) {//初始化每个球的话费
        this.costBg.getChildByName("cost" + id).active = show;
    }

    ballDownAni(ball: cc.Node, delayTime: number, cb?: Function) {
        let move = cc.moveBy(0.2, cc.v2(0, -122));
        move.easing(cc.easeBackOut());
        ball.runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(() => {
            cb && cb();
        }), move));
    }

    setBallSkin(node: cc.Node, data: FriendRecruitResult) {
        let skin: string = this.getItemSkin(data);
        UIUtil.asyncSetImage(node.getComponent(cc.Sprite), ResManager.GOLD_RECTUI + skin);
    }

    getItemSkin(data: FriendRecruitResult): string {
        let skin: string = "";
        if (data.staff) {
            skin = "ball" + (data.getStar());
        } else {
            skin = "house" + (data.getStar());
        }
        return skin;
    }

    private zhaomuBallData: FriendRecruitResult = null;
    private createTime: number = 0;

    ballStart(event, data) {
        this.zhaomuBallData = null;
        let index = data - 1;
        UIUtil.dynamicLoadPrefab(FriendRecruitSurePanel.url, (prefabNode: cc.Node) => {
            prefabNode.parent = this.node;
            // let component: FriendRecruitSurePanel = prefabNode.getComponent(FriendRecruitSurePanel);
            let component: FriendRecruitSurePanel = UIUtil.getComponent(prefabNode, FriendRecruitSurePanel);
            component.initPanel(this.goldRectuiData.recruitStaffs[index], index, () => {
                HttpInst.postData(NetConfig.recruitStaff,
                    [DataMgr.friendData.id, index], (response) => {
                        if(!this.goldRectuiData || !this.goldRectuiData.recruitStaffs
                            || index >= this.goldRectuiData.recruitStaffs.length){
                            return;
                        }

                        const result: FriendRecruitResult = this.goldRectuiData.recruitStaffs[index];
                        const recruitSuccess: boolean = response.success;
                        if (result.isStaff()) {
                            this.hasStaff = result.staff.isUnique()
                                ? DataMgr.staffData.hasStaffByResId(result.staff.artResId)
                                : false;
                        } else {
                            if (recruitSuccess) {
                                this.hasStaff = response.result.repeated;
                                this.isNew = response.result.new;
                            }
                        }
                        const recruitStaff: Staff = response.recruitStaff;
                        if (recruitSuccess) {
                            if (recruitStaff) {
                                DataMgr.updateOneStaff(recruitStaff);
                                result.staff.staffId = recruitStaff.staffId;
                            }
                        }

                        DataMgr.updateFriendRecruit(response);
                        this.zhaomuBallData = this.goldRectuiData.recruitStaffs[index];
                        this.createTime = response.createTime;

                        this.isSuc = recruitSuccess;
                        this.scheduleOnce(() => {
                            this.initBallCost(data, false);
                            this.initHole(this.goldRectuiData.recruitStaffs[index].getStar());
                            let node: cc.Node = this.ballsNode.getChildByName("ball" + data);
                            let rigidBody: cc.RigidBody = node.getComponent(cc.RigidBody);
                            rigidBody.awake = true;
                            node.getComponent("Ball").initPath(this.ballHole - 1);
                            let frame = cc.winSize;
                            if (data == 1 || data == 5) {
                                let move = cc.moveTo(1.5, cc.v2(0, -frame.height));
                                this.camera.runAction(cc.sequence(cc.delayTime(0.4), move, cc.callFunc(() => {
                                    this.skipBtn.active = true;
                                })));
                            } else if (data == 3) {
                                let move = cc.moveTo(1.2, cc.v2(0, -frame.height));
                                this.camera.runAction(cc.sequence(cc.delayTime(0), move, cc.callFunc(() => {
                                    this.skipBtn.active = true;
                                })));
                            } else {
                                let move = cc.moveTo(1.2, cc.v2(0, -frame.height));
                                this.camera.runAction(cc.sequence(cc.delayTime(0.4), move, cc.callFunc(() => {
                                    this.skipBtn.active = true;
                                })));
                            }
                        }, 0.1);
                        if (DataMgr.isInFriendHome()) {
                            ClientEvents.HANDLE_FRIENDS_HOME.emit(0);
                        }
                    });
            });
        });
    }

    initHole(color: number) {//初始化球洞分布 闸口关闭数量 蓝色：0 紫色：2 橙色：2 彩色：5"tuoyuan3"
        let arrSuc = [];
        let arrFail = [];
        this.tuoyuan1.getChildByName("no").active = false;
        this.tuoyuan2.getChildByName("no").active = false;
        this.tuoyuan3.getChildByName("no").active = false;
        this.tuoyuan4.getChildByName("no").active = false;
        this.tuoyuan5.getChildByName("no").active = false;
        this.tuoyuan6.getChildByName("no").active = false;
        this.tuoyuan1.getChildByName("pass").active = false;
        this.tuoyuan2.getChildByName("pass").active = false;
        this.tuoyuan3.getChildByName("pass").active = false;
        this.tuoyuan4.getChildByName("pass").active = false;
        this.tuoyuan5.getChildByName("pass").active = false;
        this.tuoyuan6.getChildByName("pass").active = false;
        switch (color) {
            case 3:
                this.tuoyuan1.getChildByName("pass").active = true;
                this.tuoyuan2.getChildByName("pass").active = true;
                this.tuoyuan3.getChildByName("pass").active = true;
                this.tuoyuan4.getChildByName("pass").active = true;
                this.tuoyuan5.getChildByName("pass").active = true;
                this.tuoyuan6.getChildByName("pass").active = true;
                arrSuc = [1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6];
                break;
            case 4:
                this.tuoyuan1.getChildByName("no").active = true;
                this.tuoyuan2.getChildByName("no").active = true;
                this.tuoyuan5.getChildByName("no").active = true;
                this.tuoyuan6.getChildByName("no").active = true;
                this.tuoyuan3.getChildByName("pass").active = true;
                this.tuoyuan4.getChildByName("pass").active = true;
                arrSuc = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
                arrFail = [1, 2, 2, 2, 2, 2, 5, 5, 5, 5, 5, 6];
                break;
            case 5:
                this.tuoyuan1.getChildByName("no").active = true;
                this.tuoyuan3.getChildByName("no").active = true;
                this.tuoyuan4.getChildByName("no").active = true;
                this.tuoyuan6.getChildByName("no").active = true;
                this.tuoyuan2.getChildByName("pass").active = true;
                this.tuoyuan5.getChildByName("pass").active = true;
                arrSuc = [2, 2, 2, 2, 2, 5, 5, 5, 5, 5];
                arrFail = [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 6];
                break;
            case 6:
                if (Math.random() * 1 > 0.5) {
                    this.tuoyuan2.getChildByName("pass").active = true;
                    this.tuoyuan1.getChildByName("no").active = true;
                    this.tuoyuan3.getChildByName("no").active = true;
                    this.tuoyuan4.getChildByName("no").active = true;
                    this.tuoyuan5.getChildByName("no").active = true;
                    this.tuoyuan6.getChildByName("no").active = true;
                    arrSuc = [2, 2, 2, 2, 2];
                    arrFail = [1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6];
                } else {
                    this.tuoyuan5.getChildByName("pass").active = true;
                    this.tuoyuan1.getChildByName("no").active = true;
                    this.tuoyuan3.getChildByName("no").active = true;
                    this.tuoyuan4.getChildByName("no").active = true;
                    this.tuoyuan2.getChildByName("no").active = true;
                    this.tuoyuan6.getChildByName("no").active = true;
                    arrSuc = [5, 5, 5, 5, 5];
                    arrFail = [1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 6];
                }
                break;
        }
        if (this.isSuc) {
            this.ballHole = arrSuc[Math.floor(Math.random() * arrSuc.length)];
        } else {
            this.ballHole = arrFail[Math.floor(Math.random() * arrFail.length)];
        }
    }

    closeHandler() {
        if (this.zhaomuBallData) return;
        this.closeOnly();
        cc.director.getScene().getChildByName('Canvas').getChildByName("Main Camera").active = true;
        if (!this.hasBall) {
            DataMgr.friendData.hasRecruitBubble = false;
            ClientEvents.FRIENT_RECRUIT_REMOVE_BUBBLE.emit();
        }
    }

    showRecruitAniPre(data: FriendRecruitResult, isSuc: boolean) {
        UIMgr.showView(FriendRecruitAni.url, cc.director.getScene(), this.createTime, (node) => {
            let component: FriendRecruitAni = node.getComponent(node.name);
            if (this.hasBall) {
                component.initData(data, isSuc, this.hasStaff, this.isNew);
            } else {
                component.initData(data, isSuc, this.hasStaff, this.isNew, () => {
                    this.closeHandler();
                    UIMgr.showTipText("摇奖机已空，欢迎下次再来");
                });
            }
        });
    }

    onGoldExchange() {
        ClientEvents.EVENT_POPUP_GOLD_EXCHANGE.emit();
    }
}
