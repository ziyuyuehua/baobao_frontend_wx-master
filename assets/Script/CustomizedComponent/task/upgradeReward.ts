import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {ResMgr} from "../../global/manager/ResManager";
import {DataMgr} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {UIUtil} from "../../Utils/UIUtil";
import {UIMgr} from "../../global/manager/UIManager";
import {GuideIdType, judgeSoftGuideStart} from "../../global/const/GuideConst";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import PowerGuide from "../PowerGuide/PowerGuide";
import Task from "./task";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass
export default class upgradeReward extends GameComponent {
    static url: string = "task/upgradeReward";
    @property(sp.Skeleton)
    topAniNode: sp.Skeleton = null;
    @property(cc.Sprite)
    positionIcon: cc.Sprite = null;
    @property(cc.Node)
    badgeStar1: cc.Node = null;        //徽章星1
    @property(cc.Node)
    badgeStar2: cc.Node = null;        //徽章星2
    @property(cc.Node)
    lineNode: cc.Node = null;
    @property(cc.Node)
    lineWords: cc.Node = null;
    @property(cc.Node)
    rewardNode: cc.Node = null;
    @property(cc.Node)
    sureBtn: cc.Node = null;
    @property(cc.Node)
    openBtnNode: cc.Node = null;
    @property(cc.Node)
    star: cc.Node = null;   //星级
    @property(cc.Node)
    cai: cc.Node = null;    //彩
    @property(cc.Node)
    hui: cc.Node = null;    //灰
    @property(cc.Node)
    bigStar: cc.Node = null;  //大猩猩
    @property(cc.Sprite)
    roleIcon: cc.Sprite = null;    //职位人物大图
    @property
    text: string = 'hello';
    private CloseIsJump: number = 0;
    curRank: number = 0;
    curLevel: number = 0;

    onEnable() {
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(false);
    }

    start() {
        let starArr: cc.Node[] = [];
        let openList = this.node["data"].openArr;
        let positionId: number = DataMgr.userData.getPositionId();
        let positionJson: IPositionJson = JsonMgr.getPositionJson(positionId);
        this.curRank = positionJson.rank;
        this.curLevel = positionJson.level;
        let allLevelInRank: number = JsonMgr.getPositionJsonByRank(positionJson.rank).length;
        UIUtil.asyncPlaySpine(this.topAniNode, "platform/spine/position/" + positionJson.positionSpine + "/" + positionJson.positionSpine,
            "animation", false);
        this.topAniNode.setCompleteListener(() => {
            this.topAniNode.setAnimation(0, "animation2", true);
        });
        this.scheduleOnce(() => {
            ResMgr.setPositionIcon(this.positionIcon, positionJson.positionIcon);       //职位图标
            this.badgeStar1.active = this.curRank < 5;
            this.badgeStar2.active = this.curRank >= 5;
            for (let i = 2; i <= 10; i++) {
                this.badgeStar1.getChildByName("star" + i).active = false;
                this.badgeStar2.getChildByName("star" + i).active = false;
            }
            for (let i = 2; i <= this.curLevel; i++) {
                if (this.curRank < 5) {
                    this.badgeStar1.getChildByName("star" + i).active = true;
                } else {
                    this.badgeStar2.getChildByName("star" + i).active = true;
                }
            }
            this.star.removeAllChildren();
            this.star.active = true;
            for (let i = 1; i <= allLevelInRank; i++) {
                if (i <= positionJson.level - 1) {
                    let node = cc.instantiate(this.cai);
                    this.star.addChild(node);
                    starArr.push(node);
                } else {
                    let node = cc.instantiate(this.hui);
                    this.star.addChild(node);
                    starArr.push(node);
                }
            }
            let roleAni = cc.sequence(cc.fadeTo(0.2, 255), cc.callFunc(() => {
                this.roleIcon.node.opacity = 255;
                let bigStarAni = cc.sequence(cc.spawn(cc.scaleTo(0.3, 1), cc.fadeTo(0.5, 0), cc.moveTo(0.3, starArr[positionJson.level - 1].x - 10, 340)),
                    cc.callFunc(() => {
                        this.bigStar.active = false;
                        this.star.removeAllChildren();
                        this.star.active = true;
                        starArr = [];
                        for (let i = 1; i <= allLevelInRank; i++) {
                            if (i <= positionJson.level) {
                                let node = cc.instantiate(this.cai);
                                this.star.addChild(node);
                                starArr.push(node);
                            } else {
                                let node = cc.instantiate(this.hui);
                                this.star.addChild(node);
                                starArr.push(node);
                            }
                        }
                        let starAni = cc.sequence(cc.scaleTo(0.2, 1.2), cc.scaleTo(0.2, 1), cc.callFunc(() => {
                            //解锁功能动画
                            if (openList.length > 0) {
                                let action = cc.sequence(cc.fadeTo(0.3, 255), cc.callFunc(() => {
                                    this.lineNode.opacity = 255;
                                    let action1 = cc.sequence(cc.fadeTo(0.2, 255), cc.callFunc(() => {
                                        this.lineWords.opacity = 255;
                                        this.initFunctionOpen(openList);
                                    }));
                                    this.lineWords.runAction(action1);
                                }));
                                this.lineNode.runAction(action);
                            } else {
                                this.sureBtn.y = -300;
                                let action = cc.sequence(cc.spawn(cc.fadeTo(0.15, 255), cc.scaleTo(0.15, 1.1)), cc.scaleTo(0.15, 1), cc.callFunc(() => {
                                    this.sureBtn.opacity = 255;
                                    this.sureBtn.setScale(1);
                                    this.showGuide();
                                }));
                                this.sureBtn.runAction(action);
                            }
                        }));
                        starArr[positionJson.level - 1].runAction(starAni);
                    }));
                this.bigStar.opacity = 255;
                this.bigStar.runAction(bigStarAni);
            }));
            let roleIconArr = positionJson.positionIconBig.split(";");
            let roleImg: string = DataMgr.userData.getSex() == 1 ? roleIconArr[0].split(",")[1] : roleIconArr[1].split(",")[1];
            ResMgr.setPositionIcon(this.roleIcon, roleImg);
            this.roleIcon.node.runAction(roleAni);
        }, 0.8);

        ButtonMgr.addClick(this.sureBtn, this.onSureBrn);
    }

    onSureBrn = () => {
        if (this.node["data"].rewardStaff && this.node["data"].rewardStaff.length > 0) {
            UIMgr.loadCommonGiftView([], this.node["data"].rewardStaff, "missionService.receiveAward");
        }
        if (this.CloseIsJump > 0) {
            ClientEvents.CLOSE_TASK_VIEW.emit();
            ClientEvents.EVENT_OPEN_UI.emit(this.CloseIsJump, null, true);
        }
        this.closeOnly();
    };

    initFunctionOpen(openList: IFunctionOpenJson[]) {
        cc.log(JSON.stringify(openList));
        this.rewardNode.removeAllChildren();
        let len = openList.length;
        if (openList[0].isJump == 1) {
            this.CloseIsJump = openList[0].jump;
        }
        for (let i = 0; i < len; i++) {
            let node = cc.instantiate(this.openBtnNode);
            node.setScale(0);
            ResMgr.setAccessPathIcon(node.getChildByName("icon").getComponent(cc.Sprite), openList[i].icon);
            ButtonMgr.addClick(node, () => {
                this.closeOnly();
                ClientEvents.CLOSE_TASK_VIEW.emit();
                ClientEvents.EVENT_OPEN_UI.emit(openList[i].jump, null, true);
            });
            let action = cc.sequence(cc.scaleTo(0.2, 1), cc.callFunc(() => {
                node.setScale(1);
            }));
            node.runAction(action);
            this.rewardNode.addChild(node);
        }
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            let action = cc.sequence(cc.spawn(cc.fadeTo(0.15, 255), cc.scaleTo(0.15, 1.1)), cc.scaleTo(0.15, 1), cc.callFunc(() => {
                this.sureBtn.opacity = 255;
                this.sureBtn.setScale(1);
                this.showGuide();
            }));
            this.sureBtn.runAction(action);

        }, len * 0.1);
    }

    showGuide() {
        if (DataMgr.checkInPowerGuide()) {
            // this.node.group = "guideLayer";
            UIMgr.showView(PowerGuide.url, null, null, (node: cc.Node) => {
                node.getComponent(PowerGuide).setNodeToPowerGuide(this.sureBtn, () => {
                    DotInst.clientSendDot(COUNTERTYPE.powerGuide, "209");
                    // this.node.group = "default";
                    this.closeOnly();
                    UIMgr.closeView(Task.url, true, true);
                    ClientEvents.UP_POWER_GUIDE.emit(17);
                }, 16, false, false);
            }, null, 10000);
            return;
        }
        let curSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.position, 3);
        if (curSoftGuide && judgeSoftGuideStart(curSoftGuide)) {
            GuideMgr.showSoftGuide(this.sureBtn, ARROW_DIRECTION.TOP, curSoftGuide.displayText, (node: cc.Node) => {
            }, false, 0, false, () => {
                this.closeOnly();
            });
        }
    }

    protected getBaseUrl(): string {
        return upgradeReward.url;
    }

    onDisable() {
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(true);
    }

}
