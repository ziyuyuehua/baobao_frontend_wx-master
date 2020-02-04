// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ResMgr} from "../../global/manager/ResManager";
import {IVipDataInfo} from "../../types/Response";
import Button = cc.Button;
import {ButtonMgr} from "../common/ButtonClick";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {UIMgr} from "../../global/manager/UIManager";
import RechargeMain from "../Recharge/RechargeMain";
import Setting from "./setting";

const {ccclass, property} = cc._decorator;

@ccclass
export default class vipItem extends cc.Component {

    @property(cc.Sprite)
    private vipIcon: cc.Sprite = null;
    private vipJumpId: number = 0;

    start() {
        ButtonMgr.addClick(this.node, this.clickHandler);
    }

    setVipItem(data: IVipDataInfo) {
        this.vipJumpId = data.type;
        ResMgr.setVipIcon(this.vipIcon, "vip" + data.type);
    }

    clickHandler = () => {
        UIMgr.closeView(Setting.url);
        // UIMgr.showView(RechargeMain.url, null, this.vipJumpId);
        ClientEvents.EVENT_POPUP_DIAMOND_EXCHANGE.emit(this.vipJumpId);
        //ClientEvents.SCROLL_TO_CHARGE_VIP.emit(this.vipJumpId);
    }
}
