import treasureCardItem from "./treasureCardItem";

const {ccclass, property} = cc._decorator;
@ccclass
export default class treasureCardJiaItem extends cc.Component {
    @property(cc.Layout)
    itemLayout: cc.Layout = null;
    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;
    private endPosY: number = 0;

    updateItem(itemData, idx, type) {
        this.endPosY = this.node.y;
        this.node.opacity = 0;
        this.node.setScale(0, 0);
        this.node.y = -900;
        let action = cc.sequence(cc.spawn(cc.scaleTo(1, 1), cc.fadeTo(1, 255), cc.moveTo(1, this.node.x, this.endPosY)), cc.callFunc(() => {
            this.node.opacity = 255;
            this.node.setScale(1, 1);
        }));
        this.scheduleOnce(() => {
            this.node.runAction(action);
        });
        this.itemLayout.node.removeAllChildren();
        for (let index = 0; index < itemData.length; index++) {
            let node = cc.instantiate(this.itemPrefab);
            let cardItem: treasureCardItem = node.getComponent(treasureCardItem);
            let itemID: number = Number(itemData[index].split(",")[0]);
            let selIndex = idx * type + index;
            cardItem.updateItem(itemID, selIndex);
            this.itemLayout.node.addChild(node);
        }
    }

}