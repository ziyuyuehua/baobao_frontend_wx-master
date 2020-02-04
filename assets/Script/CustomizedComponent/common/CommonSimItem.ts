import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {ButtonMgr} from "./ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import CommoTips, {CommonTipInter} from "./CommonTips";
import {Type} from "./CommonBtn";
import {CommonUtil} from "../../Utils/CommonUtil";
import {GameComponent} from "../../core/component/GameComponent";
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

const {ccclass, property} = cc._decorator;


export enum SetBoxType {
    Item = 1,
    Goods = 2,
    Staff = 3,
    DecoShop = 4

}

@ccclass
export default class CommonSimItem extends GameComponent {
    static url: string = "Prefab/common/commSevenItem";

    @property(cc.Label)
    itemNum: cc.Label = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.Sprite)
    itemQuIcon: cc.Sprite = null;

    @property scaleNum: number = 1;

    private itemId: number = 0;

    //打点需要
    private dotId: number = 0;
    private taskId: number = 0;

    getBaseUrl() {
        return CommonSimItem.url;
    }

    onLoad() {
        ButtonMgr.addClick(this.node, this.closeTip, this.MovecloseTip, this.StartCloick, this.cancleTip);
    }

    StartCloick = (event) => {
        this.ShowTip(event);
    }

    MovecloseTip = (event) => {
        let startPos = event.currentTouch._startPoint;
        let endPos = event.currentTouch._point;
        let xCha: number = Math.abs(endPos.x) - Math.abs(startPos.x);
        let yCha: number = Math.abs(endPos.y) - Math.abs(startPos.y);
        if (Math.abs(yCha) > 10 || Math.abs(xCha) > 10) {
            UIMgr.closeView(CommoTips.url);
        }
    }

    ShowTip = (event) => {
        switch (this.dotId) {
            case 3510:
            case 3516:
            case 3520:
                DotInst.clientSendDot(COUNTERTYPE.communityActive, this.dotId + "", this.itemId + "")
                break;
            case 5006:
                DotInst.clientSendDot(COUNTERTYPE.task, this.dotId + "", this.taskId + "", this.itemId + "")
                break;
            case 9004:
                DotInst.clientSendDot(COUNTERTYPE.order, this.dotId + "", this.itemId + "")
                break;
        }
        let node = event.target;
        let worldPos = node.convertToWorldSpaceAR(cc.v2(0, node.height / 2));
        let canvas = cc.director.getScene();
        let pos = canvas.convertToNodeSpaceAR(worldPos);
        let tipData: CommonTipInter = {
            state: this.itemId >= 101 && this.itemId <= 105 ? Type.GOODS : ((this.itemId >= 1000 && this.itemId <= 9999) ? Type.STAFFATTRIBUTE : Type.DECORATE),
            data: {id: this.itemId},
            worldPos: pos
        }


        UIMgr.showView(CommoTips.url, canvas, tipData, null, false, 9999)
    }

    closeTip = (btn: cc.Event.EventTouch) => {
        btn.stopPropagation();
        UIMgr.closeView(CommoTips.url);
    }

    cancleTip = (event) => {
        if (event.currentTouch) {
            UIMgr.closeView(CommoTips.url)
        }
    }

    setDotId(id: number) {
        this.dotId = id;
    }

    setTaskId(id: number) {
        this.taskId = id;
    }

    updateItem(itemId: number, itemNum: number, itemBoxType: SetBoxType = SetBoxType.Item, scale?: number, cb?: Function) {
        if (scale) {
            this.node.scale = scale;
        }
        this.itemId = itemId;
        let itemJson = null;
        if (JsonMgr.isStaffRandom(itemId)) {
            itemJson = JsonMgr.getStaffRandom(itemId);
            ResMgr.getItemIcon(this.itemIcon, "icon_randomStaff", 1);
            this.itemNum.node.active = false;
        } else {
            itemJson = JsonMgr.getInformationAndItem(itemId);
            if (itemJson) {
                if (itemJson.type == 13) {
                    ResMgr.getTreasureIcon(this.itemIcon, JsonMgr.getItem(itemId).icon, 1);
                } else {
                    ResMgr.imgTypeJudgment(this.itemIcon, itemId);
                    if (itemJson.type == 5) {
                        this.itemIcon.node.setScale(1.2);
                    }
                }
            } else {
                ResMgr.imgTypeJudgment(this.itemIcon, itemId);
            }
            this.itemNum.string = CommonUtil.numChange(itemNum);
        }
        switch (itemBoxType) {
            case SetBoxType.Item:
                ResMgr.getItemBox(this.itemQuIcon, "k" + itemJson.color, this.scaleNum);
                break;
            case SetBoxType.Goods:
                ResMgr.getItemBox(this.itemQuIcon, "goods" + itemJson.color, this.scaleNum);
                break;
            case SetBoxType.Staff:
                ResMgr.getItemBox(this.itemQuIcon, "k" + itemJson.star, this.scaleNum);
                break;
        }


        cb && cb();
    }

    runAni(i) {
        this.node.setScale(0);
        this.node.opacity = 0;
        let action = cc.sequence(
            cc.fadeTo(0.3 * i, 0),
            cc.spawn(cc.scaleTo(0.2, 1.3), cc.fadeTo(0.2, 255)),
            cc.scaleTo(0.1, 1),
            cc.callFunc(() => {
                this.node.setScale(1);
                this.node.opacity = 255;
            }))
        this.node.runAction(action);
    }

    // update (dt) {}
}
