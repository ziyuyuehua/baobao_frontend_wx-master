import { StaffAttr, Staff } from "../../Model/StaffData";
import { JsonMgr } from "../../global/manager/JsonManager";
import { ResMgr } from "../../global/manager/ResManager";

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
export default class AttributeItem extends cc.Component {

    @property(cc.Sprite)
    attributeIcon: cc.Sprite = null;

    @property(cc.Label)
    attributeNmae: cc.Label = null;

    @property(cc.Label)
    attributeBarLab: cc.Label = null;


    start() {

    }

    loadView(staff: Staff, attributeTem, attrIndex: number) {
        //name
        this.attributeNmae.string = attributeTem.attributeName;
        //icon
        ResMgr.getAttributeIcon(this.attributeIcon, attributeTem.attributeIcon);
        //value
        let curValue = staff.attrValues()[attrIndex];
        let growth = staff.attrGrowth()[attrIndex];
        let MaxLvArr: string[] = JsonMgr.getConstVal("staffLevelLimit").split(",");
        let level = 0;
        switch (staff.star) {
            case 3:
                level = Number(MaxLvArr[0]);
                break;
            case 4:
                level = Number(MaxLvArr[1]);
                break;
            case 5:
            case 6:
                level = Number(MaxLvArr[2]);
                break;

        }
        this.attributeBarLab.string = curValue + ""

    }

    // update (dt) {}
}
