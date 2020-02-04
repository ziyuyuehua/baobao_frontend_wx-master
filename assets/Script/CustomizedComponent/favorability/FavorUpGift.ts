import {JsonMgr} from "../../global/manager/JsonManager";
import {FavorType} from "./FavorHelp";
import {ResMgr} from "../../global/manager/ResManager";
import FavorabilityGiftItem from "./FavorabilityGiftItem";


const {ccclass, property} = cc._decorator;

@ccclass
export default class FavorUpGift extends cc.Component {
    @property([cc.Node])
    TypeNodes: Array<cc.Node> = [];

    @property(cc.Node)
    TypeItemNode: cc.Node = null;

    @property(cc.Sprite)
    addArrIcon: cc.Sprite = null

    @property(cc.Label)
    addArrLab: cc.Label = null

    @property(cc.Label)
    allAddArrLab: cc.Label = null

    @property(cc.Prefab)
    ItemPrefab: cc.Prefab = null;

    updateView(staffid: number, favorId: number) {
        let favorJson: IFavorJson = JsonMgr.getFavorJson(staffid, favorId);
        this.TypeNodes.forEach((value) => {
            value.active = false;
        })

        if (!favorJson) {
            return;
        }

        switch (favorJson.type) {
            case FavorType.ItemGift:
                this.TypeNodes[0].active = true;
                let dataStr: string[] = favorJson.para.split(";");
                this.TypeItemNode.removeAllChildren();
                dataStr.forEach((value, index) => {
                    let node = cc.instantiate(this.ItemPrefab);
                    let favorGiftItem: FavorabilityGiftItem = node.getComponent(FavorabilityGiftItem);
                    let itemstr: string[] = value.split(",");
                    favorGiftItem.updateItem(Number(itemstr[0]), Number(itemstr[1]));
                    favorGiftItem.setItemNumState(true);
                    this.TypeItemNode.addChild(node);
                })
                break;
            case FavorType.StaffAction:
            case FavorType.UnlockChangeBatch:
            case FavorType.UnlockSpecialFriend:
                this.TypeNodes[0].active = true;
                this.TypeItemNode.removeAllChildren();
                let acNode = cc.instantiate(this.ItemPrefab);
                let acFavorGiftItem: FavorabilityGiftItem = acNode.getComponent(FavorabilityGiftItem);
                let itemId1 = Number(favorJson.para);
                if (favorJson.type == FavorType.UnlockSpecialFriend) {
                    itemId1 = 510003;
                }
                acFavorGiftItem.updateActionItem(itemId1)
                acFavorGiftItem.setItemNumState(false);
                this.TypeItemNode.addChild(acNode);
                break;
            case FavorType.StaffAttNum:
            case FavorType.StaffAttBai:
                this.TypeNodes[1].active = true;
                let itemstr: string[] = favorJson.para.split(",");
                let itemId: number = Number(itemstr[0])
                let attJson: IAttributeJson = JsonMgr.getAttributeJson(itemId);
                ResMgr.getAttributeIcon(this.addArrIcon, attJson.attributeIcon);
                if (favorJson.type == FavorType.StaffAttNum) {
                    this.addArrLab.string = "+" + itemstr[1];
                } else {
                    this.addArrLab.string = "+" + itemstr[1] + "%";
                }
                break;
            case FavorType.StaffAllBai:
            case FavorType.StaffAllNum:
                this.TypeNodes[2].active = true;
                if (favorJson.type == FavorType.StaffAllNum) {
                    this.allAddArrLab.string = "+" + favorJson.para;
                } else {
                    this.allAddArrLab.string = "+" + favorJson.para + "%";
                }
                break;
            case FavorType.UnlockTheLines:
                this.TypeNodes[0].active = true;
                this.TypeItemNode.removeAllChildren();
                let node1 = cc.instantiate(this.ItemPrefab);
                let favorGiftItem1: FavorabilityGiftItem = node1.getComponent(FavorabilityGiftItem);
                favorGiftItem1.updateLinesItem(favorJson.para);
                this.TypeItemNode.addChild(node1);
                break;
        }
        //增加一个特殊奖励
        let constjson = JsonMgr.getConstVal("favorUnlockReward");
        let rewards = constjson.split(";");
        for (let index = 0; index < rewards.length; index++) {
            if (Number(rewards[index].split(":")[0]) == favorJson.type) {
                let acNode = cc.instantiate(this.ItemPrefab);
                let acFavorGiftItem: FavorabilityGiftItem = acNode.getComponent(FavorabilityGiftItem);
                let itemstr = rewards[index].split(":")[1];
                let itemId = itemstr.split(",")[0];
                let itemNum = itemstr.split(",")[1];
                acFavorGiftItem.updateItem(itemId, itemNum);
                acFavorGiftItem.setItemNumState(true);
                this.TypeItemNode.addChild(acNode);
            }
        }
    }
}
