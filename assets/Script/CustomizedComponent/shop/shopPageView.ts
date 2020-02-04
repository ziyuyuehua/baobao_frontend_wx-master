// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import ShopItem from "./ShopItem";
import {JsonMgr} from "../../global/manager/JsonManager";
import ShopJiaItem from "./ShopJiaItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class shopPageView extends cc.Component {

    @property(cc.Layout)
    itemLayout: cc.Layout = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    updateItem(itemData: Array<IShopJson>, choseType: number, res) {
        this.itemLayout.node.removeAllChildren();
        for (let index = 0; index < itemData.length; index++) {
            let pageData: Array<IShopJson> = [];
            let maxNum: number = index * 3 + 3;
            if (maxNum > itemData.length) {
                maxNum = itemData.length;
            }
            for (let nid = index * 3; nid < maxNum; nid++) {
                pageData.push(itemData[nid]);
            }
            let node = cc.instantiate(this.itemPrefab);
            let shoppreItem: ShopJiaItem = node.getComponent(ShopJiaItem);
            shoppreItem.updateItem(pageData, choseType, res);
            this.itemLayout.node.addChild(node);
        }


    }

    // update (dt) {}
}
