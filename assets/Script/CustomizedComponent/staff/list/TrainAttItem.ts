import { ResMgr } from "../../../global/manager/ResManager";
import { JsonMgr } from "../../../global/manager/JsonManager";
import { DataMgr } from "../../../Model/DataManager";
import { greenColor, redColor } from "../../../global/const/StringConst";
import { ButtonMgr } from "../../common/ButtonClick";
import { UIMgr } from "../../../global/manager/UIManager";

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
export default class trainAttItem extends cc.Component {

    @property(cc.RichText)
    label: cc.RichText = null;

    @property(cc.Sprite)
    trainIcon: cc.Sprite = null;

    @property(cc.Sprite)
    itemQu: cc.Sprite = null;

    private itemId: number = 0;
    onLoad() {
        ButtonMgr.addClick(this.trainIcon.node, this.openSource)
    }

    openSource = (btn) => {
        UIMgr.loadaccessPathList(this.itemId);
    }

    updateItem(costIdNumArr: string[]) {
        this.itemId = Number(costIdNumArr[0]);
        let costNum: number = Number(costIdNumArr[1]);
        let itemTem = JsonMgr.getItem(this.itemId);
        ResMgr.getItemBox(this.itemQu, "k" + itemTem.color, 0.4);
        ResMgr.getItemIcon(this.trainIcon, itemTem.icon);


        let bagNum: number = DataMgr.getItemNum(this.itemId);
        let color: string = "";
        if (bagNum >= costNum) {
            color = "#0cba24"
        } else {
            color = "#F63434"
        }

        this.label.string = "<color=" + color + ">" + bagNum + "<color=#814d34>/" + costNum + "</color>"
    }

    onDestroy() {
        this.node.destroy();
    }

    // update (dt) {}
}
