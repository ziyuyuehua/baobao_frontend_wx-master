import ShopItem from "./ShopItem";
import {JsonMgr} from "../../global/manager/JsonManager";
const {ccclass, property} = cc._decorator;

@ccclass
export default class ShopJiaItem extends cc.Component {

    @property(cc.Layout)
    itemLayout: cc.Layout = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;


    start() {

    }

    updateItem(itemData: Array<IShopJson>, choseType: number, res) {
        this.itemLayout.node.removeAllChildren();
        for (let index = 0; index < itemData.length; index++) {
            let node = cc.instantiate(this.itemPrefab);
            let shoppreItem: ShopItem = node.getComponent(ShopItem);
            //let itemVo = JsonMgr.getInformationAndItem(itemData[index].id);
            shoppreItem.updateItem(itemData[index], choseType, res);
            this.itemLayout.node.addChild(node);
        }
    }

    updateDecItem(dropIdArr: number[]) {       //宝箱掉落家具
        this.itemLayout.node.removeAllChildren();
        for (let index = 0; index < dropIdArr.length; index++) {
            let node = cc.instantiate(this.itemPrefab);
            let shopItem: ShopItem = node.getComponent(ShopItem);
            let decoVo: IDecoShopJson = null;
            decoVo = JsonMgr.getDecoShopJson(dropIdArr[index]);
            shopItem.updateDropItem(decoVo);
            this.itemLayout.node.addChild(node);
        }
    }

}
