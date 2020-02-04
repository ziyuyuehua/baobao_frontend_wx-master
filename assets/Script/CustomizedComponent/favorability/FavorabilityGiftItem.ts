import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {ButtonMgr} from "../common/ButtonClick";
import {Type} from "../common/CommonBtn";
import CommoTips, {CommonTipInter} from "../common/CommonTips";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {CommonUtil} from "../../Utils/CommonUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FavorabilityGiftItem extends cc.Component {

    @property(cc.Sprite)
    private itemQuicon: cc.Sprite = null;

    @property(cc.Sprite)
    private itemIcon: cc.Sprite = null;

    @property(cc.Sprite)
    private specialIcon: cc.Sprite = null;

    @property(cc.Label)
    private itemNum: cc.Label = null;

    @property(cc.Animation)
    private specialAni: cc.Animation = null;

    itemId: number = 0;
    private tipType: Type;

    onLoad() {
        ButtonMgr.addClick(this.node, this.closeTip, this.MovecloseTip, this.StartCloick, this.cancleTip);
    }

    updateIconState(state) {
        this.specialIcon.node.active = !state;
        this.itemQuicon.node.active = state;
        this.itemIcon.node.active = state;
        this.itemNum.node.active = state;
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
        let node = event.target;
        let worldPos = node.convertToWorldSpaceAR(cc.v2(0, node.height / 2));
        let canvas = UIMgr.getCanvas();
        let pos = canvas.convertToNodeSpaceAR(worldPos);
        let tipData: CommonTipInter = {
            state: this.tipType,
            data: {id: this.itemId},
            worldPos: pos
        }
        DotInst.clientSendDot(COUNTERTYPE.staff, "6027", this.itemId.toString());
        UIMgr.showView(CommoTips.url, null, tipData, null, false);
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


    updateItem(itemId: number, itemNum: number) {
        this.tipType = Type.DECORATE;
        this.itemId = itemId;
        ResMgr.imgTypeJudgment(this.itemIcon, this.itemId);
        if (this.itemId == -3) {
            this.itemIcon.node.setScale(1, 0.8);
        }
        this.itemNum.string = itemNum < 10000 ? (itemNum + "") : CommonUtil.numChange(itemNum);
        let t = JsonMgr.getInformationAndItem(itemId);
        ResMgr.getItemBox(this.itemQuicon, "k" + t.color, 0.4);
    }

    updateActionItem(itemId) {
        this.tipType = Type.ACTION;
        this.itemId = itemId;
        //let itemjson = JsonMgr.getItemById(this.itemId);
        let itemjson = JsonMgr.getItemMod(this.itemId);
        this.updateSpecialIcon(itemjson.icon);
    }

    updateIcon(icon: string) {
        ResMgr.getItemIconSF(this.itemIcon, icon, false);
        ResMgr.getItemBox(this.itemQuicon, "k5", 0.4);
    }

    setItemNumState(state) {
        this.itemNum.node.active = state;
    }

    updateLinesItem(itemId) {
        this.tipType = Type.LINE;
        this.itemId = itemId;
        let dialogJson = JsonMgr.getDialogueJson(itemId);
        this.updateIconState(false);
        ResMgr.getLineIcon(this.specialIcon, dialogJson.icon, () => {

        });
    }

    updateSpecialIcon(icon) {
        this.updateIconState(false);
        ResMgr.getItemIconSF(this.specialIcon, icon, false);
    }


    runSpecialAni() {
        this.specialAni.play();
    }

    smallIcon() {
        this.itemIcon.node.setScale(0.7);
    }

    setFontSize(size: number) {
        this.itemNum.fontSize = size;
    }

}
