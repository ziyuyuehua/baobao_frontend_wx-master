// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {FavorType} from "./FavorHelp";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FavorAttrAddItem extends cc.Component {

    @property(cc.Sprite)
    attrIcon: cc.Sprite = null;

    @property(cc.Label)
    addNum: cc.Label = null;

    updateItem(addData) {
        if (addData.favorType == FavorType.StaffAttNum) {
            let attJson: IAttributeJson = JsonMgr.getAttributeById(addData.data.split(",")[0]);
            ResMgr.getAttributeIcon(this.attrIcon, attJson.attributeIcon);
            this.addNum.string = "+" + addData.data.split(",")[1];

        } else if (addData.favorType == FavorType.StaffAttBai) {
            let attJson: IAttributeJson = JsonMgr.getAttributeById(addData.data.split(",")[0]);
            ResMgr.getAttributeIcon(this.attrIcon, attJson.attributeIcon);
            this.addNum.string = "+" + addData.data.split(",")[1] + "%";

        } else if (addData.favorType == FavorType.StaffAllNum) {
            this.addNum.string = "+" + addData.data;

        } else if (addData.favorType == FavorType.StaffAllBai) {
            this.addNum.string = "+" + addData.data + "%";
        }
    }
}
