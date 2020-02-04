import {ResMgr} from "../../global/manager/ResManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {FavorType} from "./FavorHelp";
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import CommoTips, {CommonTipInter} from "../common/CommonTips";
import {Type} from "../common/CommonBtn";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FavorabilityUpAddItem extends cc.Component {

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.Label)
    itemNum: cc.Label = null;

    @property(cc.Prefab)
    tip: cc.Prefab = null;
    favorJson: IFavorJson = null;
    itemId: number = 0;

    start() {
        ButtonMgr.addClick(this.itemIcon.node, this.endClick, null, this.StartClick);
    }

    StartClick = (event) => {
        if (this.itemId == 0) {
            return
        }
        let node = event.target;
        let worldPos = node.convertToWorldSpaceAR(cc.v2(0, node.height / 2));
        let canvas = UIMgr.getCanvas();
        let pos = canvas.convertToNodeSpaceAR(worldPos);
        let tipData: CommonTipInter = {
            state: Type.DECORATE,
            data: {id: this.itemId},
            worldPos: pos
        }

        UIMgr.showView(CommoTips.url, null, tipData, null, false)
    }

    endClick = () => {
        UIMgr.closeView(CommoTips.url);
    }


    updateItem(itemId: number, itemNum: number) {
        this.itemId = itemId;
        ResMgr.imgTypeJudgment(this.itemIcon, this.itemId);
        this.itemNum.string = itemNum + ""
    }

    updateAttItem(attId: number, attNum: number, type: number) {
        this.itemId = 0;
        let attJson: IAttributeJson = JsonMgr.getAttributeJson(attId);
        ResMgr.getAttributeIcon(this.itemIcon, attJson.attributeIcon);
        if (type == FavorType.StaffAttNum) {
            this.itemNum.string = "+" + attNum
        } else if (type == FavorType.StaffAttBai) {
            this.itemNum.string = "+" + attNum + "%"
        }
    }

    updateActionItem(acitonId: number, index) {
        this.itemId = 0;
        if (index == 0) {
            this.itemNum.string = "动作";
        } else {
            this.itemNum.string = "表情"
        }
    }

}
