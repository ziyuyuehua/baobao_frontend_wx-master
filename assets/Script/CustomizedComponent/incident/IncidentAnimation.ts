import { GameComponent } from "../../core/component/GameComponent";
import { JsonMgr, StaffModConfig } from "../../global/manager/JsonManager";
import { IncidentModel } from "../../Model/incident/IncidentModel";
import { Staff } from "../../Model/StaffData";
import { IncidentAnimationInter, StaffItemInfo } from "./IncidentHelp";
import { StaffRole } from "../staff/list/StaffRole";
import { Direction, State, Role } from "../map/Role";
import { ActionMgr } from "../common/Action";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { MapIncident } from "../map/MapItem/incident/MapIncident";
import { ResManager } from "../../global/manager/ResManager";
import { UIUtil } from "../../Utils/UIUtil";
import { UIMgr } from "../../global/manager/UIManager";
import { DataMgr } from "../../Model/DataManager";

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

enum IncidentAniType {
    hearAni = 1,
    smokeAni = 2,
    twoPeople = 3,
}

enum DuiType {
    wenHao = 1,
    tanHao = 2,
    box = 3,
}

@ccclass
export default class IncidentAnimation extends GameComponent {
    static url: string = "incident/IncidentAnimation";

    @property(sp.Skeleton)
    staffSkelet: sp.Skeleton = null;

    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property(cc.Prefab)
    rolePrefab: cc.Prefab = null;

    @property(cc.Node)
    selectNode: cc.Node = null;

    @property(cc.Animation)
    crisisAnimation: cc.Animation = null;

    @property(cc.Animation)
    eventAnimation: cc.Animation = null;

    @property(cc.Animation)
    headAnimation: cc.Animation = null;

    @property(sp.Skeleton)
    atkSpine: sp.Skeleton = null;

    @property([sp.Skeleton])
    atkSpineS: sp.Skeleton[] = [];

    @property(MapIncident)
    eventRoleIcon: MapIncident = null;

    @property(cc.Node)
    incidentMoveNode: cc.Node = null;

    @property(cc.Sprite)
    roleIcon: cc.Sprite = null;

    @property(cc.Node)
    vsNode: cc.Node = null;

    @property(cc.Node)
    hearNode: cc.Node = null;

    @property(cc.Node)
    headNode: cc.Node = null;

    //动画2
    @property(cc.Node)
    aniTypeTwoNode: cc.Node = null;

    @property(cc.Sprite)
    midPic: cc.Sprite = null;

    @property(cc.Animation)
    smokeAnimation: cc.Animation = null;

    @property(cc.Node)
    giftHeziNode: cc.Node = null;

    //动画3
    @property(cc.Node)
    aniTypeThreeNode: cc.Node = null;

    @property(cc.Node)
    diuPeopleNode: cc.Node = null;

    @property(cc.Sprite)
    diuIcon: cc.Sprite = null;

    @property(cc.Node)
    diuIconNode: cc.Node = null;

    @property(cc.Node)
    diuQipao: cc.Node = null;

    @property(cc.Node)
    wenhaoNode: cc.Node = null;

    @property(cc.Node)
    tanhaoNode: cc.Node = null;

    @property(cc.Node)
    diuBoxNode: cc.Node = null;


    private _model: IncidentModel = null;
    private _staffMap: StaffItemInfo[] = [];
    private selectPoints: cc.Vec2[] = [cc.v2(-80, -80), cc.v2(0, -80), cc.v2(80, -80)];
    private effectPoints: cc.Vec2[] = [cc.v2(-50, -200), cc.v2(15, -200), cc.v2(50, -200)];
    private selectRoles: StaffRole[] = [null, null, null];

    private remeberRoleX: number = 0;    //记录位置
    private remeberStaffX: number = 0;   //角色位置
    private curEffectIndex: number = 1;  //当前播放动画
    private aniEndIndex: number = 0;     //动画结束
    private _finish: boolean = false;    //是否完成
    private scaleNode: cc.Node = null;    //D放大节点
    private aniType = IncidentAniType.hearAni;
    private diuStaff: StaffRole = null;  //丢失的人

    onLoad() {
        this.addEvent(ClientEvents.CLOSE_INCIDNT_ANI.on(() => {
            this.closeHandler();
        }))
        let dataVo: IncidentAnimationInter = this.node['data'];
        this.remeberRoleX = this.incidentMoveNode.x;
        this.incidentMoveNode.x = 600;
        this.remeberStaffX = this.selectNode.x;
        this.selectNode.x = -550;
        this._model = dataVo._model;
        if (this._model.getIsEvent() || this._model.getIsIncident()) {
            let showConf = JsonMgr.getIncidentShowById(this._model.getShowId());
            if (showConf) {
                this.aniType = showConf.getAniType();
            }
        }
        let assistanceJson: IAssistanceJson = JsonMgr.getAssistanceJsonbyId(this._model.getShowId());
        if (assistanceJson) {
            if (assistanceJson.type && assistanceJson.type == 2) {
                cc.loader.loadRes(ResManager.INCIDENT_ATK1, sp.SkeletonData, () => {
                }, (err: Error, res: sp.SkeletonData) => {
                    for (let index = 0; index < this.atkSpineS.length; index++) {
                        this.atkSpineS[index].skeletonData = res;
                    }
                });
            } else {
                this.loadAtkRes();
            }
        } else {
            this.loadAtkRes();
        }

        this._staffMap = dataVo.staffIds;
        this._finish = dataVo._finish;
        this.incidentMoveNode.active = this.aniType == IncidentAniType.hearAni;
        this.aniTypeTwoNode.active = this.aniType == IncidentAniType.smokeAni;
        this.aniTypeThreeNode.active = this.aniType == IncidentAniType.twoPeople;
        this.diuIconNode.active = this.aniType == IncidentAniType.twoPeople;

        //出厂动画播放完
        this.staffSkelet.setCompleteListener((lister) => {
            this.staffSkelet.setAnimation(0, "animation2", true);
            if (lister.animation.name == "animation") {
                switch (this.aniType) {
                    case IncidentAniType.hearAni:
                        this.staffMove();
                        break;
                    case IncidentAniType.smokeAni:
                        this.aniTypeTwoHandler();
                        break;
                    case IncidentAniType.twoPeople:
                        this.aniThreeHandler();
                        break;
                }
            }
        });
        this.crisisAnimation.on("stop", () => {
            this.scaleNode.active = false;
            this.crisisAnimation.node.active = false;
            this.playAtkEffect();
        });
        this.eventAnimation.on("stop", () => {
            this.scaleNode.active = false;
            this.eventAnimation.node.active = false;
            this.playAtkEffect();
        });
        this.headAnimation.on("stop", () => {
            this.scaleNode.active = false;
            this.headAnimation.node.active = false;
            this.playAtkEffect();
        });
        //烟完毕
        this.smokeAnimation.on("stop", () => {
            this.smokeAnimation.node.active = false;
            this.selectNode.active = true;
            this.giftHeziNode.active = true;
            this.peopleJump();
        });
        this.updateView();
    }


    /**
     * ---一个人蹦两下  角色走过去  动画类型3 -------------------------------- start
     */

    setDiuState(state: DuiType) {
        this.wenhaoNode.active = state == DuiType.wenHao;
        this.tanhaoNode.active = state == DuiType.tanHao;
        this.diuBoxNode.active = state == DuiType.box;
    }

    aniThreeHandler() {
        this.setDiuState(DuiType.wenHao);
        let action = cc.sequence(cc.fadeTo(0.1, 255), cc.callFunc(() => {
            let posY = this.diuPeopleNode.y;
            let posYAdd = posY + 20;
            let action = cc.sequence(cc.moveTo(0.1, this.diuPeopleNode.x, posYAdd), cc.moveTo(0.1, this.diuPeopleNode.x, posY),
                cc.moveTo(0.1, this.diuPeopleNode.x, posYAdd), cc.moveTo(0.1, this.diuPeopleNode.x, posY), cc.callFunc(() => {
                    this.choseRoleRun();
                }));
            this.diuPeopleNode.runAction(action);
        }));
        this.diuPeopleNode.runAction(action);

    }

    //角色走过来 两人碰面
    choseRoleRun() {
        let staff: StaffRole = this.selectRoles[0];
        if (staff) {
            staff.changeDesignAction("paodong");
        }
        ActionMgr.MoveAction(this.selectNode, () => {
            let staff: StaffRole = this.selectRoles[0];
            if (staff) {
                staff.changeDesignAction("zhanli");
            }
            this.peopleJumpHigh();
        }, -40, this.selectNode.y, true, 3);
        this.scheduleOnce(() => {
            this.diuPeopleNode.scaleX = 1;
            this.diuQipao.scaleX = -1;
            this.diuQipao.x = 50;
            this.setDiuState(DuiType.tanHao);

            if (this.diuStaff) {
                this.diuStaff.changeDesignAction("xingzou");
            }
            ActionMgr.MoveAction(this.diuPeopleNode, () => {
                if (this.diuStaff) {
                    this.diuStaff.changeDesignAction("zhanli");
                }
            }, 90, this.diuPeopleNode.y, true, 1);
        }, 0.5)
    }

    //气泡消失  人物蹦高
    peopleJumpHigh() {
        let action = cc.sequence(cc.fadeTo(0.1, 0), cc.callFunc(() => {
            let height = this.diuPeopleNode.y;
            let action1 = cc.sequence(cc.moveTo(0.1, this.diuPeopleNode.x, 0), cc.callFunc(() => {
                //气泡消失  人物高兴
                if (this.diuStaff) {
                    // this.diuStaff.changeDesignation("xiyue");
                }
                let action3 = cc.moveTo(0.1, this.diuPeopleNode.x, height);
                this.diuPeopleNode.runAction(action3);
                let action2 = cc.sequence(cc.fadeTo(0.1, 0), cc.callFunc(() => {
                    this.setDiuState(DuiType.box);
                    //人物蹦高 礼盒出现
                    let action4 = cc.moveTo(0.1, this.diuPeopleNode.x, 0);
                    this.diuPeopleNode.runAction(action4);
                    let action5 = cc.sequence(cc.fadeTo(0.1, 255), cc.callFunc(() => {
                        //人物下来
                        let action6 = cc.sequence(cc.moveTo(0.1, this.diuPeopleNode.x, height), cc.callFunc(() => {
                            //等待几秒 气泡渐隐消失
                            this.scheduleOnce(() => {
                                let action7 = cc.sequence(cc.fadeTo(0.1, 0), cc.callFunc(() => {
                                    //动画结束
                                    ClientEvents.CRISIS_ANI_END_UPDATE.emit();
                                    if (!this._finish) {
                                        this.closeHandler();
                                    }
                                }));
                                this.diuQipao.runAction(action7);
                            }, 0.5)
                        }));
                        this.diuPeopleNode.runAction(action6);
                    }));
                    this.diuQipao.runAction(action5);
                }));
                this.diuIconNode.runAction(action2);
            }));
            this.diuPeopleNode.runAction(action1);
        }));
        this.diuQipao.runAction(action);
    }

    /**
     * ---一个人蹦两下  角色走过去  动画类型3 -------------------------------- end
     */

    /**
     * ---人物走到中心  播放烟雾  动画类型2  -------------------------------- start
     */
    aniTypeTwoHandler() {
        let action = cc.fadeTo(0.1, 255);
        this.midPic.node.runAction(action);
        let staff: StaffRole = this.selectRoles[0];
        if (staff) {
            staff.changeDesignAction("paodong");
        }
        ActionMgr.MoveAction(this.selectNode, () => {
            this.selectNode.active = false;
            this.smokeAnimation.node.active = true;
            this.midPic.node.active = false;
            this.smokeAnimation.play();
        }, -75, this.selectNode.y, true, 3);
    }

    //人物蹦两下
    peopleJump() {
        let staff: StaffRole = this.selectRoles[0];
        if (staff) {
            // staff.changeDesignation("xiyue");
            staff.changeDesignAction("zhanli");
            let posY = this.selectNode.y;
            let posYAdd = posY + 20;
            let action = cc.sequence(cc.moveTo(0.1, this.selectNode.x, posYAdd), cc.moveTo(0.1, this.selectNode.x, posY),
                cc.moveTo(0.1, this.selectNode.x, posYAdd), cc.moveTo(0.1, this.selectNode.x, posY), cc.callFunc(() => {
                    this.scheduleOnce(() => {
                        ClientEvents.CRISIS_ANI_END_UPDATE.emit();
                        if (!this._finish) {
                            this.closeHandler();
                        }
                    }, 0.5)
                }));
            this.selectNode.runAction(action);
        } else {
            UIMgr.showTipText("找不到人");
        }
    }

    loadAtkRes() {
        cc.loader.loadRes(ResManager.INCIDENT_ATK, sp.SkeletonData, () => {
        }, (err: Error, res: sp.SkeletonData) => {
            for (let index = 0; index < this.atkSpineS.length; index++) {
                this.atkSpineS[index].skeletonData = res;
            }
        });
    }

    /**
     * ---人物走到中心  播放烟雾  动画类型2  -------------------------------- end
     */

    /**
     * ---心心播放动画 动画类型1
     */
    //播放攻击特效
    playAtkEffect() {
        if (this.curEffectIndex > this._staffMap.length) {
            this.unscheduleAllCallbacks();
            return;
        }
        let atkSpine: sp.Skeleton = this.atkSpineS[this.curEffectIndex - 1];
        if (atkSpine) {
            atkSpine.node.active = true;
            atkSpine.setAnimation(0, "animation", false);
            atkSpine.setCompleteListener(this.spineEndAni);
        }
        this.schedule(() => {
            this.curEffectIndex++;
            this.playAtkEffect();
        }, 0.5)
    }

    spineEndAni = () => {
        this.atkSpineS[this.aniEndIndex].node.active = false;
        this.aniEndIndex++;
        if (this.aniEndIndex == this._staffMap.length) {
            this.vsNode.active = this._model.getIsIncident();
            this.hearNode.active = this._model.getIsEvent();
            this.headNode.active = this._model.getIsAssist();
            ClientEvents.CRISIS_ANI_END_UPDATE.emit();
            if (!this._finish) {
                this.closeHandler();
            }
        }
    }


    //角色移动
    staffMove() {
        ActionMgr.MoveAction(this.incidentMoveNode, null, this.remeberRoleX, this.incidentMoveNode.y, true, 0.3);
        ActionMgr.MoveAction(this.selectNode, () => {
            let aniNode: cc.Animation = null;
            if (this._model.getIsIncident()) {
                this.scaleNode = this.vsNode;
                aniNode = this.crisisAnimation;
            } else if (this._model.getIsEvent()) {
                this.scaleNode = this.hearNode;
                aniNode = this.eventAnimation;
            } else if (this._model.getIsAssist()) {
                this.scaleNode = this.headNode;
                aniNode = this.headAnimation;
            }
            this.scaleNode.active = true;

            let action = cc.sequence(cc.spawn(cc.scaleTo(0.15, 1, 1), cc.fadeTo(0.15, 255)), cc.callFunc(() => {
                aniNode.node.active = true;
                aniNode.play();
            }))
            this.scaleNode.runAction(action);
        }, this.remeberStaffX, this.selectNode.y, true, 0.3);
    }

    getBaseUrl() {
        return IncidentAnimation.url;
    }

    start() {
        this.staffSkelet.setAnimation(0, "animation", false);
    }

    updateView() {
        switch (this.aniType) {
            case IncidentAniType.hearAni:
                this.addCrisisRole();
                break;
            case IncidentAniType.smokeAni:
                this.updateEventPic();
                break;
            case IncidentAniType.twoPeople:
                this.updateDiuPeople();
                break;
        }
        this.addStaff();
    }

    //更新丢失的人
    updateDiuPeople() {
        let showConf = JsonMgr.getIncidentShowById(this._model.getShowId());
        let artResId: number = showConf.getEventModelId();
        let node = cc.instantiate(this.rolePrefab);
        this.diuStaff = node.getComponent(StaffRole);
        node.parent = this.diuPeopleNode;
        let staffMod: StaffModConfig = JsonMgr.getStaffMod(artResId);
        const modName: string = staffMod.name;
        let isLow = DataMgr.isLowPhone() ? "low/" : "high/";
        let roleUrl = ResManager.STAFF_SPINE + isLow + modName + "/" + modName;
        this.diuStaff.initSpine(roleUrl, Direction.LEFT, null, Role.IDEL_ACTION, Role.SMILE_SKIN, State.IDLE);
        this.diuPeopleNode.opacity = 0;

        UIUtil.asyncSetImage(this.diuIcon, ResManager.INCIDENT_BACKGROUND + showConf.getTargetPic(), false);
        this.diuIcon.node.scale = 0.3
    }

    //更新pic
    updateEventPic() {
        let showConf = JsonMgr.getIncidentShowById(this._model.getShowId());
        UIUtil.asyncSetImage(this.midPic, ResManager.INCIDENT_BACKGROUND + showConf.getTargetPic(), true);
        this.midPic.node.opacity = 0;
    }

    //增加危机角色
    addCrisisRole() {
        if (this._model.getIsAssist()) {
            this.eventRoleIcon.node.active = false;
            this.spine.node.active = false;
            this.roleIcon.node.active = true;
            let assistanceJson: IAssistanceJson = JsonMgr.getAssistanceJsonbyId(this._model.getShowId());
            if (assistanceJson != null) {
                UIUtil.loadUrlImg(assistanceJson.url, this.roleIcon);
            }
        } else {
            this.roleIcon.node.active = false;
            let showConf = JsonMgr.getIncidentShowById(this._model.getShowId());
            let modId = showConf.getMod();
            if (modId > 0) {
                this.eventRoleIcon.node.active = false;
                this.spine.node.active = true;
                let resUrl = Staff.getLowStaffSpineUrl(modId);
                cc.loader.loadRes(resUrl, sp.SkeletonData, null, (err: Error, res: sp.SkeletonData) => {
                    if (err) {
                        cc.error(err);
                        return;
                    }
                    if(!this.spine){
                        return;
                    }
                    this.spine.skeletonData = res;

                    let showConf = JsonMgr.getIncidentShowById(this._model.getShowId());
                    let action: IRoleAction = JsonMgr.getRoleAction(showConf.getAction());
                    let face: IRoleFaceJson = JsonMgr.getRoleFace(showConf.getFace());
                    this.spine.setAnimation(0, action.action, true);
                    this.spine.setSkin(face.face);
                    this.spine.node.active = true;
                });
            } else {
                this.eventRoleIcon.node.active = true;
                this.spine.node.active = false;
                this.eventRoleIcon.initImage(ResManager.INCIDENT_BACKGROUND + showConf.getTargetPic(), true);
            }
        }
    }

    //增加员工
    addStaff() {
        for (let index = 0; index < this._staffMap.length; index++) {
            this.addStaffByStaffItem(this._staffMap[index]);
        }
    }

    //增加员工通过staffItem
    addStaffByStaffItem(staffVO: StaffItemInfo) {
        let staff: Staff = staffVO.staff;
        let pos = this.getEmptyIndex();
        let node = cc.instantiate(this.rolePrefab);
        let role: StaffRole = node.getComponent(StaffRole);
        role.setStaff(staff);
        this.selectRoles[pos] = role;
        node.parent = this.selectNode;
        role.init(staff, Direction.RIGHT, false, Role.IDEL_ACTION, Role.SMILE_SKIN, State.IDLE, null);
        this.updateRolePos();
    }

    //找空模型Index
    getEmptyIndex(): number {
        for (let index = 0; index < this.selectRoles.length; ++index) {
            if (this.selectRoles[index] == null) {
                return index;
            }
        }
        return -1;
    }

    //更新角色位置
    updateRolePos() {
        let count = 0;
        for (let i = 0; i < this.selectRoles.length; ++i) {
            if (this.selectRoles[i] != null) {
                ++count;
            }
        }

        if (count == 1) {
            for (let i = 0; i < this.selectRoles.length; ++i) {
                if (this.selectRoles[i] != null) {
                    this.selectRoles[i].node.position = this.selectPoints[1];
                    this.atkSpineS[i].node.position = this.effectPoints[1];
                    break;
                }
            }
        } else if (count == 2) {
            let ccTemp = 0;
            for (let i = 0; i < this.selectRoles.length; ++i) {
                if (this.selectRoles[i] != null) {
                    let pos = this.selectPoints[ccTemp == 0 ? 0 : 2];
                    this.selectRoles[i].node.position = new cc.Vec2(pos.x * 0.5, pos.y);
                    let pos1 = this.effectPoints[ccTemp == 0 ? 0 : 2];
                    this.atkSpineS[i].node.position = new cc.Vec2(pos1.x * 0.5, pos1.y);
                    ++ccTemp;
                }
            }
        } else if (count == 3) {
            for (let i = 0; i < this.selectRoles.length; ++i) {
                if (this.selectRoles[i] != null) {
                    this.selectRoles[i].node.position = this.selectPoints[i];
                    this.atkSpineS[i].node.position = this.effectPoints[i];
                }
            }
        }
    }

    closeHandler() {
        this.closeOnly();
    }

    // update (dt) {}
}
