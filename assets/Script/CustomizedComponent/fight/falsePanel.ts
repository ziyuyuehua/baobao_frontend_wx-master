import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JumpConst} from "../../global/const/JumpConst";
import {ShopBattleTeamConfig} from "../../global/manager/JsonManager";
import {FightData} from "../../Model/FightData";
import {AudioMgr} from "../../global/manager/AudioManager";
import {ResMgr} from "../../global/manager/ResManager";
import {MapResMgr} from "../MapShow/MapResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";

@ccclass()
export class falsePanel extends cc.Component {
    @property(cc.Node)
    title: cc.Node = null;
    @property(cc.Node)
    smallTitle: cc.Node = null;

    @property(sp.Skeleton)
    sySke: sp.Skeleton = null;
    @property(sp.Skeleton)
    lhSke: sp.Skeleton = null;
    @property(sp.Skeleton)
    lkSke: sp.Skeleton = null;
    @property(sp.Skeleton)
    shSke: sp.Skeleton = null;

    @property(cc.Node)
    resultBg: cc.Node = null;

    private fightBattleTeamConfig: ShopBattleTeamConfig;//对决总数据
    private fightData: FightData = null;

    private winNum: number = 0;//我赢的次数
    private falseNum: number = 0;//我输的次数
    private goHomeState: boolean = false;

    onLoad() {
        AudioMgr.playEffect("Audio/fight/fight_lost");
        this.initTitle();
    }

    public initData(teamData: ShopBattleTeamConfig, fightData: FightData) {
        this.fightBattleTeamConfig = teamData;
        this.fightData = fightData;
    }

    private initTitle() {
        let move = cc.moveTo(0.5, cc.v2(0, 400));
        move.easing(cc.easeBackOut());
        this.title.runAction(cc.sequence(move, cc.callFunc(() => {
            this.playMovie();
        })));

        let scale1 = cc.scaleTo(0.5, 1.2);
        let scale2 = cc.scaleTo(0.5, 1);
        this.smallTitle.runAction(cc.repeatForever(cc.sequence(scale1, scale2)));
    }

    playMovie() {//播放动画
        let faceIn = cc.fadeIn(0.2);
        this.resultBg.getChildByName("titleLabel").runAction(faceIn);
        this.scheduleOnce(() => {
            this.sySke.animation = "shouyinyuan";
            this.sySke.setCompleteListener(() => {
            });
            this.sySke.node.getChildByName("syLabelL").getComponent(cc.Label).string = this.fightData.postionResults[0].totalScore.toString();
            this.sySke.node.getChildByName("syLabelR").getComponent(cc.Label).string = this.fightBattleTeamConfig.score1.toString();
            let faceIn = cc.fadeIn(0.2);
            this.sySke.node.getChildByName("syLabelR").runAction(cc.sequence(cc.delayTime(0.1), faceIn, cc.callFunc(() => {
                for (let i = 0; i < Math.abs(this.fightData.postionResults[0].step); i++) {
                    if (this.fightData.postionResults[0].step > 0) {
                        this.createMz("winZ", cc.v2(-200 - i * 20, 0), this.sySke.node);
                    } else {
                        this.createMz("winZ", cc.v2(220 + i * 20, 0), this.sySke.node);
                    }
                }
                ;
                if (this.fightData.postionResults[0].step > 0) {
                    this.winNum += this.fightData.postionResults[0].step;
                } else {
                    this.falseNum += this.fightData.postionResults[0].step;
                }
            })));
            this.sySke.node.getChildByName("syLabelL").runAction(cc.sequence(cc.delayTime(0.1), faceIn.clone()));
        }, 0.1);
        this.scheduleOnce(() => {
            this.lhSke.animation = "guanliyuan";
            this.lhSke.setCompleteListener(() => {
            });
            this.lhSke.node.getChildByName("syLabelL").getComponent(cc.Label).string = this.fightData.postionResults[3].totalScore.toString();
            this.lhSke.node.getChildByName("syLabelR").getComponent(cc.Label).string = this.fightBattleTeamConfig.score4.toString();
            let faceIn = cc.fadeIn(0.2);
            this.lhSke.node.getChildByName("syLabelR").runAction(cc.sequence(cc.delayTime(0.1), faceIn, cc.callFunc(() => {
                for (let i = 0; i < Math.abs(this.fightData.postionResults[3].step); i++) {
                    if (this.fightData.postionResults[3].step > 0) {
                        this.createMz("winZ", cc.v2(-200 - i * 20, 0), this.lhSke.node);
                    } else {
                        this.createMz("winZ", cc.v2(220 + i * 20, 0), this.lhSke.node);
                    }
                }
                ;
                if (this.fightData.postionResults[3].step > 0) {
                    this.winNum += this.fightData.postionResults[3].step;
                } else {
                    this.falseNum += this.fightData.postionResults[3].step;
                }
                for (let i = 0; i < this.winNum; i++) {
                    this.createMz("falseZ", cc.v2(-100 - i * 20, 0), this.resultBg.getChildByName("heji"));
                }
                ;
                for (let i = 0; i < Math.abs(this.falseNum); i++) {
                    this.createMz("winZ", cc.v2(100 + i * 20, 0), this.resultBg.getChildByName("heji"));
                }
                ;
            })));
            this.lhSke.node.getChildByName("syLabelL").runAction(cc.sequence(cc.delayTime(0.1), faceIn.clone()));
        }, 0.4);
        this.scheduleOnce(() => {
            this.lkSke.animation = "lanhuoyuan";
            this.lkSke.setCompleteListener(() => {
            });
            this.lkSke.node.getChildByName("syLabelL").getComponent(cc.Label).string = this.fightData.postionResults[2].totalScore.toString();
            this.lkSke.node.getChildByName("syLabelR").getComponent(cc.Label).string = this.fightBattleTeamConfig.score3.toString();
            let faceIn = cc.fadeIn(0.2);
            this.lkSke.node.getChildByName("syLabelR").runAction(cc.sequence(cc.delayTime(0.1), faceIn, cc.callFunc(() => {
                for (let i = 0; i < Math.abs(this.fightData.postionResults[2].step); i++) {
                    if (this.fightData.postionResults[2].step > 0) {
                        this.createMz("winZ", cc.v2(-200 - i * 20, 0), this.lkSke.node);
                    } else {
                        this.createMz("winZ", cc.v2(220 + i * 20, 0), this.lkSke.node);
                    }
                }
                ;
                if (this.fightData.postionResults[2].step > 0) {
                    this.winNum += this.fightData.postionResults[2].step;
                } else {
                    this.falseNum += this.fightData.postionResults[2].step;
                }
            })));
            this.lkSke.node.getChildByName("syLabelL").runAction(cc.sequence(cc.delayTime(0.1), faceIn.clone()));
        }, 0.3);
        this.scheduleOnce(() => {
            this.shSke.animation = "shouhuoyuan";
            this.shSke.setCompleteListener(() => {
                let faceIn = cc.fadeIn(0.2);
                this.resultBg.getChildByName("heji").runAction(cc.sequence(faceIn, cc.callFunc(() => {
                    this.resultBg.getChildByName("falseSpi").getComponent(sp.Skeleton).animation = "shibai";
                })));
            });
            this.shSke.node.getChildByName("syLabelL").getComponent(cc.Label).string = this.fightData.postionResults[1].totalScore.toString();
            this.shSke.node.getChildByName("syLabelR").getComponent(cc.Label).string = this.fightBattleTeamConfig.score2.toString();
            let faceIn = cc.fadeIn(0.2);
            this.shSke.node.getChildByName("syLabelR").runAction(cc.sequence(cc.delayTime(0.1), faceIn, cc.callFunc(() => {
                for (let i = 0; i < Math.abs(this.fightData.postionResults[1].step); i++) {
                    if (this.fightData.postionResults[1].step > 0) {
                        this.createMz("winZ", cc.v2(-200 - i * 20, 0), this.shSke.node);
                    } else {
                        this.createMz("winZ", cc.v2(220 + i * 20, 0), this.shSke.node);
                    }
                };
                if (this.fightData.postionResults[1].step > 0) {
                    this.winNum += this.fightData.postionResults[1].step;
                } else {
                    this.falseNum += this.fightData.postionResults[1].step;
                }
            })));
            this.shSke.node.getChildByName("syLabelL").runAction(cc.sequence(cc.delayTime(0.1), faceIn.clone()));
        }, 0.2);
    }

    BackMainSceneToRECRUITVIEW() {
        if(!this.goHomeState) {
            this.goHomeState = true;
            HttpInst.postData(NetConfig.GET_HOME_INFO, [], () => {
                cc.director.preloadScene("mainScene", (completedCount: number, totalCount: number, item: any) => {
                    let pro = completedCount / totalCount;
                }, (error: Error) => {
                    if (error) {
                        cc.log(error);
                        return;
                    }
                    UIMgr.showLoading();
                    MapResMgr.loadMapBg(null, () => {
                        UIMgr.hideLoading();
                        cc.director.loadScene("mainScene", () => {
                            ClientEvents.EVENT_OPEN_UI.emit(JumpConst.RECRUITVIEW);
                        });
                    });
                })
            });
        }
    }

    BackMainSceneToSTAFFPOSTVIEW() {
        if(!this.goHomeState) {
            this.goHomeState = true;
            HttpInst.postData(NetConfig.GET_HOME_INFO, [], () => {
                cc.director.preloadScene("mainScene", (completedCount: number, totalCount: number, item: any) => {
                    let pro = completedCount / totalCount;
                }, (error: Error) => {
                    if (error) {
                        cc.log(error);
                        return;
                    }

                    UIMgr.showLoading();
                    MapResMgr.loadMapBg(null,() => {
                        UIMgr.hideLoading();
                        cc.director.loadScene("mainScene", () => {
                            ClientEvents.EVENT_OPEN_UI.emit(JumpConst.STAFFPOSTVIEW);
                        });
                    });
                })
            });
        }
    }

    BackMainSceneToSTAFFVIEWW() {
        if(!this.goHomeState) {
            this.goHomeState = true;
            HttpInst.postData(NetConfig.GET_HOME_INFO, [], () => {
                cc.director.preloadScene("mainScene", (completedCount: number, totalCount: number, item: any) => {
                    let pro = completedCount / totalCount;
                }, (error: Error) => {
                    if (error) {
                        cc.log(error);
                        return;
                    }
                    UIMgr.showLoading();
                    MapResMgr.loadMapBg(null, () => {
                        UIMgr.hideLoading();
                        cc.director.loadScene("mainScene", () => {
                            ClientEvents.EVENT_OPEN_UI.emit(JumpConst.STAFFVIEW);
                        });
                    });
                });
            });
        }
    }

    BackMainScene() {
        if(!this.goHomeState) {
            this.goHomeState = true;
            HttpInst.postData(NetConfig.GET_HOME_INFO, [], () => {
                cc.director.preloadScene("mainScene", (completedCount: number, totalCount: number, item: any) => {
                    let pro = completedCount / totalCount;
                }, (error: Error) => {
                    if (error) {
                        cc.log(error);
                        return;
                    }
                    UIMgr.showLoading();
                    MapResMgr.loadMapBg(null, () => {
                        UIMgr.hideLoading();
                        ClientEvents.CLOSE_FIGHT.emit();
                        cc.director.loadScene("mainScene", () => {
                        });
                    });
                })
            });
        }
    }

    createMz(skin: string, pos: any, parent: cc.Node) {//创建猫爪 skin皮肤 pos坐标
        let node: cc.Node = new cc.Node();
        node.addComponent(cc.Sprite);
        ResMgr.setFightImage(node.getComponent(cc.Sprite), skin);
        node.parent = parent;
        node.setPosition(pos);
    }
}
