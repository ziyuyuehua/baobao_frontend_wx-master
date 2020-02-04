import {UIUtil} from "../../../Utils/UIUtil";
import {ResMgr} from "../../../global/manager/ResManager";
import {UIMgr} from "../../../global/manager/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class ItemPrefab extends cc.Component {

    @property(cc.Node)
    itemImageNode: cc.Node = null;

    @property(cc.Label)
    itemNameLabel: cc.Label = null;

    @property(cc.Label)
    itemNumLabel: cc.Label = null;

    itemid: number = 0;

    getItemId() {
        return this.itemid;
    }

    init(item, num: number, vis: boolean = true) {

        this.itemid = item.id;
        ResMgr.getItemBox(this.itemImageNode.getChildByName("bg").getComponent(cc.Sprite), "k" + item.color, 1.0);
        UIUtil.setLabel(this.itemNameLabel, item.name);
        this.updateNum(num);
        ResMgr.imgTypeJudgment(this.itemImageNode.getChildByName("itemIcon").getComponent(cc.Sprite), item.id);
        this.itemNameLabel.node.active = vis;

        // this.itemNumLabel.node.active = vis;
    }


    activeTip() {
        UIMgr.addDetailedEvent(this.node, this.getItemId());
    }


    updateNum(num: number) {
        UIUtil.setLabel(this.itemNumLabel, num);
    }

}
