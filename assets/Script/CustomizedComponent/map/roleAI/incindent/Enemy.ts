import { Role, RoleType } from "../../Role";
import { UIUtil } from "../../../../Utils/UIUtil";
import { ButtonMgr } from "../../../common/ButtonClick";
import IncidentView from "../../../incident/IncidentView";
import { UIMgr } from "../../../../global/manager/UIManager";
import { DataMgr } from "../../../../Model/DataManager";
import { NetConfig } from "../../../../global/const/NetConfig";
import { HttpInst } from "../../../../core/http/HttpClient";
import { JsonMgr } from "../../../../global/manager/JsonManager";
import { TextTipConst } from "../../../../global/const/TextTipConst";
import { ResManager } from "../../../../global/manager/ResManager";
import { MapIncident } from "../../MapItem/incident/MapIncident";
import { IncidentType } from "../../../../Model/incident/IncidentModel";
import { ClientEvents } from "../../../../global/manager/ClientEventCenter";
import { ARROW_DIRECTION, GuideMgr } from "../../../common/SoftGuide";
import { JumpConst } from "../../../../global/const/JumpConst";
import { DotInst, COUNTERTYPE } from "../../../common/dotClient";
import { ArrowTextConst } from "../../../../global/const/ArrowTextConst";
import { GuideIdType, judgeSoftGuideStart } from "../../../../global/const/GuideConst";

/**
 * @Author whg
 * @Date 2019/8/9
 * @Desc
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class Enemy extends Role {

    static PREFIX: string = "enemy";

    @property(cc.Sprite)
    private typeOne: cc.Sprite = null;
    @property(cc.Sprite)
    private typeTwo: cc.Sprite = null;

    @property(MapIncident)
    private mapIncident: MapIncident = null;

    private xmlId: number;
    private type: number;
    private action: string = null;

    private iconUrl: string = null;

    private softGuide: cc.Node = null;

    doOnLoad() {
        // cc.log("Enemy doOnLoad");
        ButtonMgr.addClick(this.typeTwo.node, this.onClick);
        ButtonMgr.addClick(this.typeOne.node, this.onClick);

        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick);
        //TODO 为什么下面addClick绑上后的点击区域不对？
        // ButtonMgr.addClick(this.node, this.onClick);

        this.dispose.add(ClientEvents.INCIDENT_GUIDE.on(this.showGuide));
        this.dispose.add(ClientEvents.HIDE_JUMP_ARROW.on(() => {
            if (this.softGuide) {
                this.softGuide.active = false;
            }
        }));
        // setTimeout(() => {
        //     ClientEvents.INCIDENT_GUIDE.emit(this.staffId);
        // }, 5000);
    }

    private showGuide = (staffId: number, jumpId: JumpConst) => {
        if (staffId != this.staffId) {
            // cc.log(staffId, "!=", this.staffId);
            return;
        }
        if (this.softGuide) {
            this.softGuide.active = false;
            this.softGuide.destroy();
            this.softGuide = null;
        }
        switch (jumpId) {
            case JumpConst.TASKMAPEVENT:
                let funcGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunEvent, 1);
                if (funcGuide && DataMgr.getGuideCompleteTimeById(funcGuide.id) <= 0) {
                    HttpInst.postData(NetConfig.SOFT_LED_INFO, [funcGuide.id], (response) => {
                        DotInst.clientSendDot(COUNTERTYPE.softGuide, "19023");
                    });
                } else {
                    let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.event, 2);
                    if (curSoftGuide && judgeSoftGuideStart(curSoftGuide)) {
                        DotInst.clientSendDot(COUNTERTYPE.softGuide, "19015");
                    }
                }

                GuideMgr.showSoftGuide(this.typeTwo.node, ARROW_DIRECTION.BOTTOM, "去处理\n事件吧", (node: cc.Node) => {
                    ClientEvents.HIDE_MAIN_SOFT_GUIDE.emit();
                    this.softGuide = node;
                    this.softGuide.active = true;
                }, false, 0, false, this.onClick);
                break;
            case JumpConst.TASKMAPINCITENT:
                let funcGuide1 = JsonMgr.getSoftGuideJsoById(GuideIdType.FunCrisis, 1);
                if (funcGuide1 && DataMgr.getGuideCompleteTimeById(funcGuide1.id) <= 0) {
                    HttpInst.postData(NetConfig.SOFT_LED_INFO, [funcGuide1.id], (response) => {
                        DotInst.clientSendDot(COUNTERTYPE.softGuide, "19057");
                    });
                }
                GuideMgr.showSoftGuide(this.typeOne.node, ARROW_DIRECTION.BOTTOM, "去处理\n危机吧", (node: cc.Node) => {
                    ClientEvents.HIDE_MAIN_SOFT_GUIDE.emit();
                    this.softGuide = node;
                    this.softGuide.active = true;
                }, false, 0, false, this.onClick);
                break;
        }
    };

    onClick = (e) => {
        // cc.log("Enemy onClick", this.node.getContentSize());
        if (!this.isMove) {
            cc.log(this.staffId, this.xmlId, "open incident view");
            ClientEvents.HIDE_JUMP_ARROW.emit();
            ClientEvents.HIDE_MAINUI_ARR.emit();
            this.openIncident();
        }
        this.isMove = false;
    };

    private openIncident() {
        // HttpInst.postData(NetConfig.INCIDENT_DETAIL, [1000001, 407], (res: any) => {
        HttpInst.postData(NetConfig.INCIDENT_DETAIL, [DataMgr.getCurUserId(), this.staffId], (res: any) => {
            if (res.state == 4) { //  完成、过期
                UIMgr.showTipText(TextTipConst.INCIDENT_COMPLETE);
                DataMgr.incidentData.clearExpire();
                return;
            }

            if (res.state == 3) {
                let conf = JsonMgr.getIncidentById(this.xmlId);
                if (conf && conf.getType() == 1) {
                    if (DataMgr.isInSelfHome()) {//在自己家
                        UIMgr.showTipText(TextTipConst.INCIDENT_OVERSELFHOMEWARNING);
                    } else {//在他人家
                        UIMgr.showTipText(TextTipConst.INCIDENT_OVERFRIENDHOMEWARNING);
                    }
                    DataMgr.incidentData.clearExpire();
                    return;
                }
                UIMgr.showTipText(TextTipConst.INCIDENT_FINISH);
                DataMgr.incidentData.clearExpire();
                return;
            }

            let model = DataMgr.incidentData.updateIncident(res.incident);
            if (model.getIsEvent()) {
                DotInst.clientSendDot(COUNTERTYPE.mainPage, "2032", model.getId() + "")
            } else if (model.getIsIncident()) {
                DotInst.clientSendDot(COUNTERTYPE.mainPage, "2033", model.getId() + "")
            }
            let detail = { incident: model, helps: DataMgr.isInFriendHome() ? res.helpStaffIds : res.helps };
            UIMgr.showView(IncidentView.url, null, detail, null, true);

        });
    }

    fillData(xmlId: number, type: number, action: string, face: number, iconUrl: string) {
        this.fillType(type);
        this.xmlId = xmlId;
        this.action = action;
        this.face = face;
        this.iconUrl = iconUrl;
        if (this.artResId < 0) {
            this.doOnComplete();
            this.show();
        }
    }

    private fillType(type: number) {
        this.type = type;
        UIUtil.hide(this.typeOne);
        UIUtil.hide(this.typeTwo);
        if (type == IncidentType.incident) {
            UIUtil.show(this.typeOne);
        } else if (type == IncidentType.event) {
            UIUtil.show(this.typeTwo);
        }
    }

    showPosition() {
        return true;
    }

    getRoleType(): RoleType {
        return RoleType.ENEMY;
    }

    getPrefix(): string {
        return Enemy.PREFIX;
    }

    doOnComplete() {
        // cc.log("Enemy doOnComplete");
        // if(this.spine){
        //     cc.log("ButtonMgr.addClick", this.spine.node);
        //     ButtonMgr.addClick(this.spine.node, this.onClick);
        // }

        UIUtil.hide(this.spine);
        UIUtil.hide(this.mapIncident);
        if (this.artResId > 0) {
            this.showSpine();
        } else if (this.iconUrl) {
            UIUtil.show(this.mapIncident);
            this.mapIncident.initImage(ResManager.INCIDENT_BACKGROUND + this.iconUrl, false, "platform/animation/mapEvent");
        }
    }

    private showSpine() {
        UIUtil.show(this.spine);
        this.changeFace(this.face, false);
        this.spine.setAnimation(0, this.action, true);
    }

    doReset() {
        //TODO 清除ButtonMgr.addClick的监听
        this.softGuide && this.softGuide.destroy();
        DataMgr.setClickTaskJumpMap(0);
    }

}
