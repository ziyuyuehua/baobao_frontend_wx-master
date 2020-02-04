/**
 * @author Lizhen
 * @date 2019/9/20
 * @Description:
 */
import { GameComponent } from "../../../../../core/component/GameComponent";
import { DataMgr } from "../../../../../Model/DataManager";
import { GoldFairCostConfig, JsonMgr } from "../../../../../global/manager/JsonManager";
import { Recruit, RecruitResult } from "../../../../../Model/RecruitData";
import { UIMgr } from "../../../../../global/manager/UIManager";
import { UIUtil } from "../../../../../Utils/UIUtil";
import { ResManager } from "../../../../../global/manager/ResManager";
import { HttpInst } from "../../../../../core/http/HttpClient";
import { NetConfig } from "../../../../../global/const/NetConfig";
import { Staff } from "../../../../../Model/StaffData";
import RecruitAni from "../RecruitAni";
import { ClientEvents } from "../../../../../global/manager/ClientEventCenter";
import { Ball } from "./Ball";
import { LeftTime, TimeOutType } from "../../../recruit/LeftTime";
import { CommonUtil } from "../../../../../Utils/CommonUtil";
import { ARROW_DIRECTION, GuideMgr } from "../../../../common/SoftGuide";
import CommonInsufficient, { InsufficientType } from "../../../../common/CommonInsufficient";
import { RecruitSureMgPanel } from "./mg/RecruitSureMgPanel";
import { JumpConst } from "../../../../../global/const/JumpConst";
import { TypePanel } from "../../TypePanel";
import { IRespData } from "../../../../../types/Response";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import { GuideIdType } from "../../../../../global/const/GuideConst";
import dialogueView from "../../../../common/dialogueView";

@ccclass()
export class GoldRectuitPanel extends GameComponent {
    static url: string = "Prefab/recruit/GoldRectuitPanel";
    @property(cc.Node)
    ballsNode: cc.Node = null;
    @property(cc.Node)
    costBg: cc.Node = null;
    @property(cc.Label)
    kucunLabel: cc.Label = null;
    @property(cc.Label)
    resetCostLabel: cc.Label = null;
    @property(LeftTime)
    remainTimeLabel: LeftTime = null;
    @property(cc.Node)
    dibanNode: cc.Node = null;
    @property(cc.Node)
    skipBtn: cc.Node = null;
    @property(cc.Node)
    againGuide: cc.Node = null;
    @property(cc.Node)
    againNode: cc.Node = null;


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

    @property(cc.Label)
    diamondLabel: cc.Label = null;
    @property(cc.Label)
    goldLabel: cc.Label = null;
    @property(cc.Label)
    popularityLabel: cc.Label = null;

    @property(sp.Skeleton)
    yaoganSp: sp.Skeleton = null;

    @property(cc.Node)
    eventBlocker: cc.Node = null;

    @property(cc.Node)
    guideNode: cc.Node = null;

    @property(cc.Node)
    backBtnNode: cc.Node = null;

    private hasGuide = false;

    private hole: cc.Node = null;
    private config: GoldFairCostConfig = null;
    private goldRectuiData: Recruit = null;
    private isSuc: boolean = false;//这次是否招募成功
    private hasStaff: boolean = false;//是否重复（已经有该unique员工或者货架）
    private isNew: boolean = false;
    private ballHole: number = 0;//这次球要进的球洞
    private camera: cc.Node = null;
    private recruited = false;
    private guideBack = false;

    private ballPosition: Array<any> = [cc.v2(-237, 50), cc.v2(-116, 50), cc.v2(4, 50), cc.v2(125, 50), cc.v2(245, 50)];

    private isCanAgain: boolean = true;
    private openFreeItem = true;
    private talkGuideState: boolean = false;
    private _guideIndex: number = 0;
    getBaseUrl() {
        return GoldRectuitPanel.url;
    }

    load() {
        this.hasGuide = this.node["data"]["hasGuide"];
        this.remainTimeLabel.reset();
        this.initNode();
        this.initPhysic();
        this.initData();
        this.initView();
        this.initBalls();
        this.initListener();
        this.addEvent(ClientEvents.EVENT_REFRESH_GOLD.on(this.initUserData));
        cc.director.getScene().getChildByName('Canvas').getChildByName("Main Camera").active = false;
        this.initTalkGuide();

    }

    initTalkGuide() {
        let softGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunGold, 4);
        if (softGuide && DataMgr.getGuideCompleteTimeById(softGuide.id) <= 0) {
            HttpInst.postData(NetConfig.SOFT_LED_INFO, [softGuide.id], (response) => {
                this.talkGuideState = true;
                UIMgr.showView(dialogueView.url, cc.director.getScene(), softGuide.optionId);
            });
        }
    }

    showGuide(guideIndex: number = -1) {
        if (this._guideIndex >= 0) {
            this._guideIndex = guideIndex;
        }
        if (!this.talkGuideState) {
            let startSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunGold, 5);
            let endSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunGold, 6);
            if (startSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                GuideMgr.showSoftGuide(this.guideNode, ARROW_DIRECTION.BOTTOM, startSoftGuide.displayText, null, false, 0, false, () => {
                    this.ballStart(null, this._guideIndex + 1);
                });
            }
        }
    }

    unload() {
        cc.director.getPhysicsManager().enabled = false;
    }

    initUserData = () => {
        const userData = DataMgr.userData;
        UIUtil.setLabel(this.goldLabel, CommonUtil.numChange(userData.gold)); //金币
        UIUtil.setLabel(this.diamondLabel, CommonUtil.numChange(userData.diamond)); //钻石
        this.popularityLabel.string = DataMgr.iMarket.getPopularity() + "";
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
            if (!this.zhaomuBallData) return;
            cc.director.getPhysicsManager().enabled = true;
            this.node["data"]["openRecruit"] = false;
            this.skipBtn.active = false;
            this.initData();
            this.showRecruitAniPre(this.zhaomuBallData, this.isSuc);
            this.initView();
            this.initBalls();
            this.camera.setPosition(this.camera.x, this.camera.y + cc.winSize.height);

            this.zhaomuBallData = null;
        }));
        this.addEvent(ClientEvents.DIALO_END_SEND.on(() => {
            this.talkGuideState = false;
            this.showGuide();
        }))
    }

    skipAnimation() {
        ClientEvents.GOLD_RECRUIT.emit();
    }

    private initData() {
        this.config = JsonMgr.getGoldFairCostConfig(DataMgr.recruitData.getRecruit().getConfigCount());
        this.goldRectuiData = DataMgr.getRecruit();
        this.initUserData();
    }

    private initView() {
        this.kucunLabel.string = this.config.talentDensity.toString();
        this.remainTimeLabel.init(DataMgr.recruitData.getRecruit().remainTime, TimeOutType.GoldRecruit, "后关闭");
        let nextConfig: GoldFairCostConfig = JsonMgr.getGoldFairCostConfig(DataMgr.recruitData.getRecruit().getNextConfigCount());
        this.resetCostLabel.string = CommonUtil.numChange(nextConfig.goldCost).toString();
        this.initAgainBtnHandler();
    }

    initAgainBtnHandler() {
        let json = JsonMgr.getJsonArr("initGoldFair");
        this.againNode.active = (this.goldRectuiData.totalRecruitCnt > json.length || DataMgr.userData.level >= JsonMgr.getConstVal("initGoldFairLevel"));
    }

    public initBalls() {
        if (this.node["data"]["openRecruit"]) {
            this.isCanAgain = false;
            for (let i = 0; i < this.goldRectuiData.recruitStaffs.length; i++) {
                let node: cc.Node = this.ballsNode.getChildByName("ball" + (i + 1));
                node.setPosition(this.ballPosition[i]);
                let rigidBody: cc.RigidBody = node.getComponent(cc.RigidBody);
                rigidBody.awake = false;
                let ballComponent: Ball = node.getComponent("Ball");
                ballComponent.init();
                let data: RecruitResult = this.goldRectuiData.recruitStaffs[i];
                if (data.itemXmlId != -1) {
                    node.active = true;
                    this.setBallSkin(node, data);
                    this.recruit_daletou.animation = "animation";
                    this.ballDownAni(node, (i + 1) * 0.2, () => {
                        if (i == this.goldRectuiData.recruitStaffs.length - 1) {
                            this.isCanAgain = true;
                        }
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
                let data: RecruitResult = this.goldRectuiData.recruitStaffs[i];
                if (data.itemXmlId != -1) {
                    node.active = true;
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
        this.refreshBallGuide();
    }

    initBallCost(id: number, show: boolean) {//初始化每个球的话费
        if (!show) {
            this.costBg.getChildByName("cost" + id).active = false;
            this.costBg.getChildByName("mianfei" + id).active = false;
            return;
        }
        if (this.goldRectuiData.freeIndex != (id - 1) || this.goldRectuiData.freeIndex == -1) {
            this.costBg.getChildByName("cost" + id).active = true;
            this.costBg.getChildByName("mianfei" + id).active = false;
            let data: RecruitResult = this.goldRectuiData.recruitStaffs[id - 1];
            let cost: number = this.goldRectuiData.getRecruitGold(data.getStar());
            this.costBg.getChildByName("cost" + id).getChildByName("num").getComponent(cc.Label).string = CommonUtil.numChange(cost);
        } else {
            this.costBg.getChildByName("mianfei" + id).active = true;
            this.costBg.getChildByName("cost" + id).active = false;
            if (this.openFreeItem) {
                this.openFreeItem = false;
                this.scheduleOnce(() => {
                    this.ballStart(null, id);
                }, 0.2);
            }
        }
    }

    refreshBallGuide() {
        if (this.hasGuide) {
            let guideIndex = -1;
            if (this.node["data"]["clickTask"] == JumpConst.GOLD_RECRUIT) { // 按优先级引导
                let priority = 999999999;
                for (let i = 0; i < this.goldRectuiData.recruitStaffs.length; i++) {
                    let data = this.goldRectuiData.recruitStaffs[i];
                    if (data.itemXmlId != -1) {
                        if (data.goldRecruitIndex >= 0) {
                            if (data.goldRecruitIndex < priority) {
                                priority = data.goldRecruitIndex;
                                guideIndex = i;
                            }
                        } else {
                            if (this.goldRectuiData.freeIndex != i) {
                                const cost = this.goldRectuiData.getRecruitGold(data.getStar());
                                if (cost < priority) {
                                    priority = cost;
                                    guideIndex = i;
                                }
                            } else {
                                guideIndex = i;
                                priority = 0;
                            }
                        }
                    }
                }
            } else { // 只引导免费球
                if (this.goldRectuiData.freeIndex >= 0 &&
                    this.goldRectuiData.recruitStaffs[this.goldRectuiData.freeIndex].itemXmlId >= 0) {
                    guideIndex = this.goldRectuiData.freeIndex;
                }
            }
            if (guideIndex < 0) {
                this.guideNode.active = false;
            } else {
                let ball = this.ballsNode.getChildByName("ball" + (guideIndex + 1));
                let ballPos = ball.position;
                let nodePos = this.ballsNode.position;
                this.guideNode.position = cc.v2(ballPos.x + nodePos.x, -80 + nodePos.y);
                this.guideNode.setAnchorPoint(ball.getAnchorPoint());
                this.guideNode.active = true;
                if (!this.guideNode.children.length) this.showGuide(guideIndex);
            }
        } else if (this.guideBack) {
            if (!this.backBtnNode["hasGuide"]) {
                this.backBtnNode["hasGuide"] = true;
                this.backBtnNode.zIndex = cc.macro.MAX_ZINDEX;
                // GuideMgr.showSoftGuide(this.backBtnNode, ARROW_DIRECTION.BOTTOM, "回去咯~", null, false, 0, false, () => {
                //     this.closeHandler();
                // });
            }
        }
    }

    ballDownAni(ball: cc.Node, delayTime: number, cb?: Function) {
        let move = cc.moveBy(0.2, cc.v2(0, -122));
        move.easing(cc.easeBackOut());
        ball.runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(() => {
            cb && cb();
        }), move));
    }

    setBallSkin(node: cc.Node, data: RecruitResult) {
        let skin: string = this.getItemSkin(data);
        UIUtil.asyncSetImage(node.getComponent(cc.Sprite), ResManager.GOLD_RECTUI + skin);
    }

    getItemSkin(data: RecruitResult): string {
        let skin: string = "";
        if (data.staff) {
            skin = "ball" + (data.getStar());
        } else {
            skin = "house" + (data.getStar());
        }
        return skin;
    }

    private zhaomuBallData: RecruitResult = null;

    ballStart(event, data) {
        let guide = this.guideNode.active;
        this.guideNode.active = false;
        if (this.zhaomuBallData) return;
        this.recruited = true;
        let index = data - 1;
        UIMgr.showView(RecruitSureMgPanel.url, this.node, null, (prefabNode: cc.Node) => {
            // let component: RecruitSureMgPanel = prefabNode.getComponent(RecruitSureMgPanel);
            let component: RecruitSureMgPanel = UIUtil.getComponent(prefabNode, RecruitSureMgPanel);
            component.initPanel(this.goldRectuiData.recruitStaffs[index], index, (sure) => {
                if (!sure) {
                    if (guide) this.guideNode.active = true;
                    return;
                }
                HttpInst.postData(NetConfig.recruit,
                    [index], (response) => {
                        if (!this.goldRectuiData || !this.goldRectuiData.recruitStaffs
                            || index >= this.goldRectuiData.recruitStaffs.length) {
                            return;
                        }
                        const result: RecruitResult = this.goldRectuiData.recruitStaffs[index];
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

                        DataMgr.updateRecruit(response);
                        this.eventBlocker.active = true;
                        this.zhaomuBallData = this.goldRectuiData.recruitStaffs[index];

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
                                    this.eventBlocker.active = false;
                                })));
                            } else if (data == 3) {
                                let move = cc.moveTo(1.2, cc.v2(0, -frame.height));
                                this.camera.runAction(cc.sequence(cc.delayTime(0), move, cc.callFunc(() => {
                                    this.skipBtn.active = true;
                                    this.eventBlocker.active = false;
                                })));
                            } else {
                                let move = cc.moveTo(1.2, cc.v2(0, -frame.height));
                                this.camera.runAction(cc.sequence(cc.delayTime(0.4), move, cc.callFunc(() => {
                                    this.skipBtn.active = true;
                                    this.eventBlocker.active = false;
                                })));
                            }
                        }, 0.1);
                    });
            }, this.hasGuide);
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
        cc.director.getScene().getChildByName('Canvas').getChildByName("Main Camera").active = true;
        //把在本目录消耗的时间同步更新，招募主界面时间就一致了
        let recruit: Recruit = DataMgr.getRecruit();
        recruit.updateRemainTime(this.remainTimeLabel.getMillis());

        ClientEvents.RECRUIT_REFRESH_TYPE_LABELS.emit(this.recruited); //刷新招募主界面
        UIMgr.showView(TypePanel.url);
        this.closeOnly();
    }

    againRecrtui() {
        if (!this.isCanAgain) return;
        this.openFreeItem = true;
        let nextConfig: GoldFairCostConfig = JsonMgr.getGoldFairCostConfig(DataMgr.recruitData.getRecruit().getNextConfigCount());
        if (DataMgr.userData.gold >= nextConfig.goldCost) {
            UIMgr.showPopPanel("提示", "是否重新招募？", nextConfig.goldCost, -2, () => {
                this.yaoganSp.animation = "animation";
                HttpInst.postData(NetConfig.openRecruit,
                    [], (response) => {
                        this.node["data"]["openRecruit"] = true;
                        this.initData();
                        this.initView();
                        this.initBalls();
                        this.hideAgainGuide();
                    });
            });
        } else {
            UIMgr.showView(CommonInsufficient.url, cc.director.getScene(), InsufficientType.Gold);
        }
    }

    showRecruitAniPre(data: RecruitResult, isSuc: boolean) {
        let recruitAni = cc.instantiate(this.RecruitAni);
        cc.director.getScene().addChild(recruitAni, 9999);
        let component: RecruitAni = recruitAni.getComponent(recruitAni.name);
        let hasBall = false;
        for (let i of this.goldRectuiData.recruitStaffs) {
            if (i.itemXmlId != -1) {
                hasBall = true;
                break;
            }
        }
        component.initData(data, isSuc, this.hasGuide, this.hasStaff, this.isNew, () => {
            if (!hasBall) {
                this.showAgainGuide();
            }
        });
        if (this.hasGuide) {
            this.hasGuide = false;
            if (DataMgr.getUserLv() < JsonMgr.getConstVal("goHomeGuideArrow"))
                this.guideBack = true;
        }
    }

    showAgainGuide() {
        let json = JsonMgr.getJsonArr("initGoldFair");
        if ((this.goldRectuiData.totalRecruitCnt > json.length || DataMgr.userData.level >= JsonMgr.getConstVal("initGoldFairLevel"))) {
            this.againNode.active = true;
            this.againGuide.active = true;
            let moveBy1 = cc.moveBy(0.5, 0, 10);
            let moveBy2 = cc.moveBy(0.5, 0, -10);
            this.againGuide.runAction(cc.repeatForever(cc.sequence(moveBy1, moveBy2)));
        } else {
            this.againNode.active = false;
        }
    }

    hideAgainGuide() {
        this.againGuide.stopAllActions();
        this.againGuide.active = false;
    }

    onGoldExchange() {
        ClientEvents.EVENT_POPUP_GOLD_EXCHANGE.emit();
    }
}
