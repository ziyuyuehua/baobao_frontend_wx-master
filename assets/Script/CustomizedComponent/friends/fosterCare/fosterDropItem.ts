// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {UIMgr} from "../../../global/manager/UIManager";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {ResMgr} from "../../../global/manager/ResManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class fosterDropItem extends cc.Component {
    @property(cc.Sprite)
    itemBgIcon: cc.Sprite = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    private itemId: number = 0;

    start() {
        UIMgr.addDetailedEvent(this.node, this.itemId);
    }

    loadItem(itemId: number) {
        this.itemId = itemId;
        let itemVo = JsonMgr.getInformationAndItem(itemId);
        ResMgr.imgTypeJudgment(this.itemIcon, itemId);
        ResMgr.getItemBox(this.itemBgIcon, "k" + itemVo.color, 1);
    }

    onDestroy() {
        this.node.destroy();
    }
}
