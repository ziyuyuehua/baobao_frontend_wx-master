import { Staff } from "../../Model/StaffData";
import { UIUtil } from "../../Utils/UIUtil";
import { ButtonMgr } from "./ButtonClick";
import StaffComDetail from "./StaffComDetail";
import { CompositeDisposable } from "../../Utils/event-kit";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import {COUNTERTYPE, DotInst} from "./dotClient";

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

@ccclass
export default class staffComAdvItem extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.Sprite)
    lockBg: cc.Sprite = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Node)
    tip: cc.Node = null;

    delege: StaffComDetail = null;
    unlock: boolean = false;
    protected dispose: CompositeDisposable = new CompositeDisposable();
    private id: number = -1;
    onLoad() {
        ButtonMgr.addClick(this.node, this.showAdvDetail);
        this.dispose.add(ClientEvents.CLOSE_ADVAN_ITEM.on(() => {
            this.tip.active = false;
        }))
    }

    showAdvDetail = () => {
        if (!this.unlock) {
            DotInst.clientSendDot(COUNTERTYPE.staff, "6023", this.id.toString());
            this.tip.active = !this.tip.active;
            this.delege && this.delege.showAdvanBg();
        }
    }

    updateItem(advanid: number, advanLimit: number, unlock: boolean, delega: StaffComDetail) {
        this.label.node.active = !unlock;
        this.lockBg.node.active = !unlock;
        this.unlock = unlock;
        this.delege = delega;
        this.id = advanid;
        if (!unlock) {
            this.label.string = advanLimit + "";
        }
        UIUtil.asyncSetImage(this.icon, Staff.getStaffAdvantageMaxIconUrl(this.id));
    }

    onDestroy() {
        this.dispose.dispose();
    }

    // update (dt) {}
}
