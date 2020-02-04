import { Staff } from "../../../Model/StaffData";
import {UIUtil} from "../../../Utils/UIUtil";
import {DataMgr} from "../../../Model/DataManager";

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
export default class PeopleGoodAtItem extends cc.Component {

    @property(cc.Sprite)
    bg: cc.Sprite = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    start() {

    }

    loadItem(staffId:number){
        let staff: Staff = DataMgr.getStaff(staffId);
        // this.bg.spriteFrame = staff.getStarBorderImage();
        UIUtil.asyncSetImage(this.bg, staff.getStarBorderNoUrl(), false);
        //this.icon.spriteFrame = staff.getIconImage();
        UIUtil.asyncSetImage(this.icon, staff.getAvatarUrl(), false);
    }

    // update (dt) {}
}
