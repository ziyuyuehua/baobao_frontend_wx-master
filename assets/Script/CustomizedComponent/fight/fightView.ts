import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {FightData} from "../../Model/FightData";
import {JsonMgr, ShopBattleConfig, ShopBattleTeamConfig} from "../../global/manager/JsonManager";
import {FightEntity} from "./FightEntity";
import {JobType, Staff, StaffData} from "../../Model/StaffData";
import {falsePanel} from "./falsePanel";
import {winPanel} from "./winPanel";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {DataMgr} from "../../Model/DataManager";
import {AudioMgr} from "../../global/manager/AudioManager";
import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";

@ccclass()
export class fightView extends GameComponent {
    static url: string = "Prefab/fight/fightView";
    @property(cc.Prefab)
    winPre: cc.Prefab = null;
    @property(cc.Prefab)
    falsePre: cc.Prefab = null;
    @property(cc.Prefab)//战斗单元
    fightEntityPre: cc.Prefab = null;

    @property(cc.Node)
    syNodeL: cc.Node = null;
    @property(cc.Node)
    syNodeR: cc.Node = null;
    @property(cc.Node)
    lhNodeL: cc.Node = null;
    @property(cc.Node)
    lhNodeR: cc.Node = null;
    @property(cc.Node)
    lkNodeL: cc.Node = null;
    @property(cc.Node)
    lkNodeR: cc.Node = null;
    @property(cc.Node)
    shNodeL: cc.Node = null;
    @property(cc.Node)
    shNodeR: cc.Node = null;

    @property(cc.Node)//收银员特殊标记
    syLight: cc.Node = null;
    @property(cc.Node)//收银员特殊标记
    lhLight: cc.Node = null;
    @property(cc.Node)//收银员特殊标记
    lkLight: cc.Node = null;
    @property(cc.Node)//收银员特殊标记
    shLight: cc.Node = null;


    @property(sp.Skeleton)
    myHouse: sp.Skeleton = null;
    @property(cc.Node)//我的房子名字
    myHouseName: cc.Node = null;
    @property(sp.Skeleton)
    otherHouse: sp.Skeleton = null;
    @property(cc.Node)//对方房子名字
    otherHouseName: cc.Node = null;


    @property(sp.Skeleton)
    sySke: sp.Skeleton = null;
    @property(cc.Node)
    syTitle: cc.Node = null;
    @property(sp.Skeleton)
    lhSke: sp.Skeleton = null;
    @property(cc.Node)
    lhTitle: cc.Node = null;
    @property(sp.Skeleton)
    lkSke: sp.Skeleton = null;
    @property(cc.Node)
    lkTitle: cc.Node = null;
    @property(sp.Skeleton)
    shSke: sp.Skeleton = null;
    @property(cc.Node)
    shTitle: cc.Node = null;

    @property(sp.Skeleton)
    startFightSke: sp.Skeleton = null;

    private isPass: boolean = false;
    private fightOrderNum: number = 0;//战斗回合数


    private fightData: FightData = null;
    private fightServerData: any = null;
    private fightConfig: ShopBattleConfig;//对决总数据
    private fightBattleTeamConfig: ShopBattleTeamConfig;//对决总数据
    private winNum: number = 0;//赢的猫爪数量3以上就算赢 暂时
    private myPos: any = [{x: -137, y: -73}, {x: -49, y: -93}, {x: 32, y: -73}, {x: 114, y: -93}];
    private otherPos: any = [{x: 137, y: -73}, {x: 49, y: -93}, {x: -32, y: -73}, {x: -114, y: -93}];

    private heroArr: Array<cc.Node> = [];//英雄队列
    private comArr: Array<cc.Node> = [];//电脑队列

    load() {
        this.initData();
        this.startFight();
        this.addEvent(ClientEvents.START_FIGHT.on(this.againFight.bind(this)));
        this.addEvent(ClientEvents.CLOSE_FIGHT.on(this.closeHandler.bind(this)));
    }

    getBaseUrl() {
        return fightView.url;
    }

    initData() {
        this.heroArr = [];
        this.comArr = [];
        this.fightData = DataMgr.fightData;
        this.fightServerData = DataMgr.fightViewData;
        this.fightConfig = JsonMgr.getShopBattleConfig(this.fightServerData.stage);
        this.fightBattleTeamConfig = JsonMgr.geShopBattleTeamConfig(this.fightConfig.staffTeamId);
    }

    startFight() {
        this.isPass = false;
        this.fightOrderNum = 0;
        this.initScore();
        this.myHouse.node.active = true;
        this.myHouse.animation = "animation4";
        this.otherHouse.node.active = true;
        this.otherHouse.animation = "animation2";
        this.otherHouse.setCompleteListener(() => {
            this.myHouseName.active = true;
            this.otherHouseName.active = true;
            this.myHouseName.getComponent(cc.Label).string = DataMgr.userData.nickName;
            this.otherHouseName.getComponent(cc.Label).string = this.fightBattleTeamConfig.name;
        });
        this.scheduleOnce(() => {
            this.startFightSke.node.active = true;
            this.startFightSke.animation = "animation3";
            this.startFightSke.setCompleteListener(() => {
                this.fightOne();
            })
        }, 0.05);
    }

    againFight() {//下一关回掉
        this.initView();
        this.startFight();
    }
    initView(){

    }

    fightOne() {
        if (this.isPass) return;
        this.fightOrderNum = 1;
        this.isMarketOpen(this.syNodeL, this.syNodeR, JobType.cashier, this.fightBattleTeamConfig.post1, this.syTitle);
        this.fightOrder(this.syNodeL, this.syNodeR, JobType.cashier, this.fightBattleTeamConfig.post1, this.sySke, this.syTitle, 0, this.fightTwo.bind(this));
    }

    fightTwo() {
        if (this.isPass) return;
        this.fightOrderNum = 2;
        this.isMarketOpen(this.shNodeL, this.shNodeR, JobType.saleman, this.fightBattleTeamConfig.post2, this.shTitle);
        this.fightOrder(this.shNodeL, this.shNodeR, JobType.saleman, this.fightBattleTeamConfig.post2, this.shSke, this.shTitle, 1, this.fightThree.bind(this));
    }

    fightThree() {
        if (this.isPass) return;
        this.fightOrderNum = 3;
        this.isMarketOpen(this.lkNodeL, this.lkNodeR, JobType.touter, this.fightBattleTeamConfig.post3, this.lkTitle);
        this.fightOrder(this.lkNodeL, this.lkNodeR, JobType.touter, this.fightBattleTeamConfig.post3, this.lkSke, this.lkTitle, 2, this.fightFour.bind(this));
    }

    fightFour() {
        if (this.isPass) return;
        this.fightOrderNum = 4;
        this.isMarketOpen(this.lhNodeL, this.lhNodeR, JobType.tallyman, this.fightBattleTeamConfig.post4, this.lhTitle);
        this.fightOrder(this.lhNodeL, this.lhNodeR, JobType.tallyman, this.fightBattleTeamConfig.post4, this.lhSke, this.lhTitle, 3, this.initResultView.bind(this));
    }

    passHandler() {
        if(this.isPass) return;
        this.isPass = true;
        if (this.fightOrderNum < 1) {
            this.isMarketOpen(this.syNodeL, this.syNodeR, JobType.cashier, this.fightBattleTeamConfig.post1, this.syTitle);
            this.fightOrder(this.syNodeL, this.syNodeR, JobType.cashier, this.fightBattleTeamConfig.post1, this.sySke, this.syTitle, 0, () => {
            });
        }
        if (this.fightOrderNum < 2) {
            this.isMarketOpen(this.shNodeL, this.shNodeR, JobType.saleman, this.fightBattleTeamConfig.post2, this.shTitle);
            this.fightOrder(this.shNodeL, this.shNodeR, JobType.saleman, this.fightBattleTeamConfig.post2, this.shSke, this.shTitle, 1, () => {
            });
        }
        if (this.fightOrderNum < 3) {
            this.isMarketOpen(this.lkNodeL, this.lkNodeR, JobType.touter, this.fightBattleTeamConfig.post3, this.lkTitle);
            this.fightOrder(this.lkNodeL, this.lkNodeR, JobType.touter, this.fightBattleTeamConfig.post3, this.lkSke, this.lkTitle, 2, () => {
            });
        }
        if (this.fightOrderNum < 4) {
            this.isMarketOpen(this.lhNodeL, this.lhNodeR, JobType.tallyman, this.fightBattleTeamConfig.post4, this.lhTitle);
            this.fightOrder(this.lhNodeL, this.lhNodeR, JobType.tallyman, this.fightBattleTeamConfig.post4, this.lhSke, this.lhTitle, 3, this.initResultView.bind(this));
        }
    }

    isMarketOpen(nodeL: cc.Node, nodeR: cc.Node, jobType: JobType, post: number, titleNode: cc.Node) {
        let type = DataMgr.staffData.getMarketType(jobType, DataMgr.fightViewData.shopSelect);
        switch (type) {
            case -1:
                nodeL.getChildByName("noBody").active = false;
                nodeL.getChildByName("block").active = true;
                titleNode.getChildByName("battle_power").active = false;
                break;
            case 0:
                nodeL.getChildByName("noBody").active = true;
                nodeL.getChildByName("block").active = false;
                break;
            case 1:
                nodeL.getChildByName("noBody").active = false;
                nodeL.getChildByName("block").active = false;
                break;
        }

        let teamArr: any = post.toString().split(",");
        if (this.checkJobIsBlock(teamArr)) {
            if (this.checkJobIsNoBoy(teamArr)) {
                nodeR.getChildByName("noBody").active = false;
                nodeR.getChildByName("block").active = false;
            } else {
                nodeR.getChildByName("noBody").active = false;
                nodeR.getChildByName("block").active = true;
                titleNode.getChildByName("battle_power1").active = false;
            }
        } else {
            nodeR.getChildByName("noBody").active = false;
            nodeR.getChildByName("block").active = true;
            titleNode.getChildByName("battle_power1").active = false;
        }
    }

    checkJobIsBlock(teamArr: any): boolean {
        let bool: boolean = false;
        for (let i = 0; i < teamArr.length; i++) {
            if (teamArr[i] != -1) {
                bool = true;
            }
        }
        return bool;
    }

    checkJobIsNoBoy(teamArr: any): boolean {
        let bool: boolean = false;
        for (let i = 0; i < teamArr.length; i++) {
            if (teamArr[i] > 0) {
                bool = true;
            }
        }
        return bool;
    }

    initResultView() {
        if (this.fightData.attackWin) {
            DotInst.clientSendDot(COUNTERTYPE.fight, "5502", this.fightServerData.stage + "", DataMgr.fightViewData.shopSelect + "");
            let delay = cc.delayTime(0.8);
            this.node.runAction(cc.sequence(delay, cc.callFunc(() => {
                let win = cc.instantiate(this.winPre);
                win.parent = this.node;
                let component: winPanel = win.getComponent("winPanel");
                component.initData(this.fightConfig);
            })));
        } else {
            DotInst.clientSendDot(COUNTERTYPE.fight, "5503", this.fightServerData.stage + "", DataMgr.fightViewData.shopSelect + "");
            let delay = cc.delayTime(0.8);
            this.node.runAction(cc.sequence(delay, cc.callFunc(() => {
                let falseView = cc.instantiate(this.falsePre);
                falseView.parent = this.node;
                let component: falsePanel = falseView.getComponent("falsePanel");
                component.initData(this.fightBattleTeamConfig, this.fightData);
            })));
        }
    }

    moveBgMovie(node: cc.Node, posX: number, cb?: Function) {//人物入场动画
        let move = cc.moveTo(0.3, cc.v2(posX, node.y));
        move.easing(cc.easeBackOut());
        let faceIn = cc.fadeIn(0.3);
        let call = cc.callFunc(() => {
            cb && cb();
        });
        node.runAction(cc.sequence(cc.delayTime(0.2), cc.spawn(faceIn, move), call));
    }

    update() {
    }

    showTitle(node: cc.Node, cb?: Function) {
        let faceIn = cc.fadeIn(0.1);
        let call = cc.callFunc(() => {
            cb && cb();
        });
        node.runAction(cc.sequence(faceIn, call));
    }

    createEntity(parent: cc.Node, obj: any, pos: any, isLight: boolean, scaleX: number, delayTime: number, arr: Array<cc.Node>, isEnemy: boolean) {
        let entity: cc.Node = cc.instantiate(this.fightEntityPre);
        entity.parent = parent;
        entity.scaleX = scaleX;
        entity.position = pos;
        entity.zIndex = 4 - delayTime;
        let component: FightEntity = entity.getComponent(entity.name);
        component.initData(obj, isLight, delayTime, isEnemy);
        arr.push(entity);
    }

    initScore() {
        this.syTitle.getChildByName("battle_power").getChildByName("myScore").getComponent(cc.Label).string = this.fightData.postionResults[0].totalScore.toString();
        this.syTitle.getChildByName("battle_power1").getChildByName("otherScore").getComponent(cc.Label).string = this.fightBattleTeamConfig.score1.toString();
        this.shTitle.getChildByName("battle_power").getChildByName("myScore").getComponent(cc.Label).string = this.fightData.postionResults[1].totalScore.toString();
        this.shTitle.getChildByName("battle_power1").getChildByName("otherScore").getComponent(cc.Label).string = this.fightBattleTeamConfig.score2.toString();
        this.lkTitle.getChildByName("battle_power").getChildByName("myScore").getComponent(cc.Label).string = this.fightData.postionResults[2].totalScore.toString();
        this.lkTitle.getChildByName("battle_power1").getChildByName("otherScore").getComponent(cc.Label).string = this.fightBattleTeamConfig.score3.toString();
        this.lhTitle.getChildByName("battle_power").getChildByName("myScore").getComponent(cc.Label).string = this.fightData.postionResults[3].totalScore.toString();
        this.lhTitle.getChildByName("battle_power1").getChildByName("otherScore").getComponent(cc.Label).string = this.fightBattleTeamConfig.score4.toString();
    }

    isHaveStaffAdd(staff: Staff, data: any): boolean {// 是否又员工加成
        if (staff.isHaveAdvantages(this.fightConfig.advantageId)) {
            return true;
        } else {
            let boo: boolean = false;
            for (let i = 0; i < data.staffIds.length; i++) {
                if (staff.staffId == data.staffIds[i]) {
                    return true;
                }
            }
            return boo;
        }
    }

    fightOrder(nodel: cc.Node, nodeR: cc.Node, jobType: JobType, post: number, ske: sp.Skeleton, title: cc.Node, postionResultNum: number, cb: Function) {
        nodel.active = true;
        nodeR.active = true;
        let staffData: StaffData = DataMgr.staffData;
        let teamArr1: Staff[] = staffData.getPostStaffsByMarketId(jobType, DataMgr.fightViewData.shopSelect);
        for (let i = 0; i < teamArr1.length; i++) {
            let staff: Staff = teamArr1[i];
            this.createEntity(nodel, staff.artResId, this.myPos[i],
                this.isHaveStaffAdd(staff, this.fightData.postionResults[postionResultNum]), -1, i, this.heroArr, false);
        }
        let teamArr: any = post.toString().split(",");
        for (let i = 0; i < teamArr.length; i++) {
            if (teamArr[i] != 0) {
                this.createEntity(nodeR, teamArr[i], this.otherPos[i], false, 1, i, this.comArr, true);
            }
        }
        this.moveBgMovie(nodel, -175, () => {
        });
        this.moveBgMovie(nodeR, 175, () => {
            let manhuaGuang: cc.Node = ske.node.getParent().getChildByName("manhuaguang");
            let manhuaSke: sp.Skeleton = manhuaGuang.getComponent(sp.Skeleton);
            manhuaGuang.active = true;
            manhuaSke.setAnimation(0, "animation", true);
            this.scheduleOnce(() => {
                ske.node.active = true;
                ske.animation = "animation" + (postionResultNum + 1);
                ske.setCompleteListener(() => {
                    this.initLight(postionResultNum);
                    manhuaSke.clearTracks();
                    manhuaSke.animation = "";
                    manhuaGuang.active = false;
                    this.showTitle(title, () => {
                        if (this.fightData.postionResults[postionResultNum].battleStatus == -1) {
                            nodel.getChildByName("mask").active = true;
                            nodeR.getChildByName("mask").active = true;
                            cb && cb();
                        } else {
                            let scale1 = cc.scaleTo(0.05, 1.02);
                            let scale2 = cc.scaleTo(0.1, 0.98);
                            let scale3 = cc.scaleTo(0.05, 1);
                            let animation: sp.Skeleton = null;
                            if (this.fightData.postionResults[postionResultNum].attackWin) {
                                animation = title.getChildByName("zhual").getComponent(sp.Skeleton);
                                nodel.runAction(cc.sequence(cc.delayTime(0.2), scale1, scale2, scale3));
                            } else {
                                animation = title.getChildByName("zhuar").getComponent(sp.Skeleton);
                                nodeR.runAction(cc.sequence(cc.delayTime(0.2), scale1, scale2, scale3));
                            }
                            if (this.fightConfig.postId == postionResultNum) {
                                AudioMgr.playEffect("Audio/fight/kaizhang2");
                                animation.animation = "maozhua3";
                            } else {
                                AudioMgr.playEffect("Audio/fight/kaizhang1");
                                animation.animation = "maozhua";
                            }
                            animation.timeScale = 0.5;
                            animation.node.zIndex = 999;
                            animation.setCompleteListener(() => {
                                if (!this.fightData.postionResults[postionResultNum].attackWin) {
                                    nodel.getChildByName("mask").active = true;
                                    nodel.getChildByName("mask").zIndex = 999;
                                } else {
                                    nodeR.getChildByName("mask").active = true;
                                    nodeR.getChildByName("mask").zIndex = 999;
                                }
                                cb && cb();
                            });
                        }
                    });
                });
            }, 0.2);
        });
    }

    initLight(postId: number) {//初始化特殊战场
        if (postId == this.fightConfig.postId) {
            switch (this.fightConfig.postId) {
                case 0:
                    this.syLight.active = true;
                    this.syLight.getComponent(sp.Skeleton).animation = "animation";
                    break;
                case 1:
                    this.shLight.active = true;
                    this.shLight.getComponent(sp.Skeleton).animation = "animation";
                    break;
                case 2:
                    this.lkLight.active = true;
                    this.lkLight.getComponent(sp.Skeleton).animation = "animation";
                    break;
                case 3:
                    this.lhLight.active = true;
                    this.lhLight.getComponent(sp.Skeleton).animation = "animation";
                    break;
            }
        }
    }
    closeHandler(){//关掉战斗 清楚资源
        // for(let i = 0;i<this.heroArr.length;i++){
        //     let fightNode:cc.Node = this.heroArr[i];
        //     let component:FightEntity = fightNode.getComponent(FightEntity);
        //     component.clearRes();
        // }
        for(let i = 0;i<this.comArr.length;i++){
            let fightNode:cc.Node = this.comArr[i];
            let component:FightEntity = fightNode.getComponent(FightEntity);
            component.clearRes();
        }
    }
}
