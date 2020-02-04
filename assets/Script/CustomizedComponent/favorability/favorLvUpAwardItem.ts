import {ResMgr} from "../../global/manager/ResManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {FavorType} from "./FavorHelp";
import FavorabilityGiftItem from "./FavorabilityGiftItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class favlorLvUpItem extends cc.Component {

    @property(cc.Sprite)
    favorIcon: cc.Sprite = null;

    @property(cc.Prefab)
    ItemPrefab: cc.Prefab = null;

    @property([cc.Node])
    TypeNodes: Array<cc.Node> = [];

    @property(cc.Node)
    TypeItemNode: cc.Node = null;

    @property(cc.Label)
    AttAllLab: cc.Label = null;

    @property(cc.Sprite)
    addArrIcon: cc.Sprite = null;

    @property(cc.Label)
    lvLab: cc.Label = null;

    @property(cc.Label)
    addnameLab: cc.Label = null;

    @property(cc.Label)
    addArrLab: cc.Label = null;

    @property(cc.Label)
    allAddArrLab: cc.Label = null;

    @property(cc.Label)
    getTypeLab: cc.Label = null;


    start() {

    }

    updateItem(favorId, staffId) {
        this.node.opacity = 0;
        let action = cc.sequence(cc.fadeTo(0.5, 255), cc.callFunc(() => {
            this.node.opacity = 255;
        }))
        this.node.runAction(action);
        let favorLvJson: IFavorLevelJson = JsonMgr.getFavorLevelJsonById(favorId);
        this.lvLab.node.active = favorLvJson.quality == 3;
        if (favorLvJson.quality == 3 && favorLvJson.level > 0) {
            this.lvLab.string = favorLvJson.level + "";
        }
        ResMgr.getFavorIcon(this.favorIcon, favorLvJson.icon);
        let favorJson: IFavorJson = JsonMgr.getFavorJson(staffId, favorId);
        if (!favorJson) {
            return;
        }
        this.TypeNodes.forEach((value) => {
            value.active = false;
        })
        this.TypeItemNode.removeAllChildren();
        switch (favorJson.type) {
            case FavorType.ItemGift:
                this.TypeNodes[0].active = true;
                let dataStr: string[] = favorJson.para.split(";");
                this.TypeItemNode.removeAllChildren();
                dataStr.forEach((value, index) => {
                    let node = cc.instantiate(this.ItemPrefab);
                    node.setScale(1.4);
                    let favorGiftItem: FavorabilityGiftItem = node.getComponent(FavorabilityGiftItem);
                    let itemstr: string[] = value.split(",");
                    favorGiftItem.updateItem(Number(itemstr[0]), Number(itemstr[1]));
                    favorGiftItem.setItemNumState(true);
                    this.TypeItemNode.addChild(node);
                    this.getTypeLab.string = "获得道具";
                })
                break;
            case FavorType.StaffAction:
                this.TypeNodes[0].active = true;
                this.TypeItemNode.removeAllChildren();
                let acNode = cc.instantiate(this.ItemPrefab);
                acNode.setScale(1.4);
                let acFavorGiftItem: FavorabilityGiftItem = acNode.getComponent(FavorabilityGiftItem);
                let itemId1 = Number(favorJson.para);
                acFavorGiftItem.updateActionItem(itemId1);
                acFavorGiftItem.runSpecialAni();
                acFavorGiftItem.setItemNumState(false);
                this.TypeItemNode.addChild(acNode);
                this.getTypeLab.string = "解锁动作";
                break;
            case FavorType.UnlockChangeBatch:
                this.TypeNodes[0].active = true;
                this.TypeItemNode.removeAllChildren();
                let acNode1 = cc.instantiate(this.ItemPrefab);
                acNode1.setScale(1.4);
                let acFavorGiftItem1: FavorabilityGiftItem = acNode1.getComponent(FavorabilityGiftItem);
                let itemId3 = Number(favorJson.para);
                acFavorGiftItem1.updateActionItem(itemId3);
                acFavorGiftItem1.runSpecialAni();
                acFavorGiftItem1.setItemNumState(false);
                this.TypeItemNode.addChild(acNode1);
                this.getTypeLab.string = "解锁功能";
                break;
            case FavorType.UnlockSpecialFriend:
                this.TypeNodes[0].active = true;
                this.TypeItemNode.removeAllChildren();
                let acNode2 = cc.instantiate(this.ItemPrefab);
                acNode2.setScale(1.4);
                let acFavorGiftItem2: FavorabilityGiftItem = acNode2.getComponent(FavorabilityGiftItem);
                let itemId2 = Number(favorJson.para);
                if (favorJson.type == FavorType.UnlockSpecialFriend) {
                    itemId2 = 510003;
                }
                acFavorGiftItem2.updateActionItem(itemId2);
                acFavorGiftItem2.runSpecialAni();
                acFavorGiftItem2.setItemNumState(false);
                this.TypeItemNode.addChild(acNode2);
                this.getTypeLab.string = "解锁好友框";
                break;
            case FavorType.StaffAttNum:
            case FavorType.StaffAttBai:
                this.TypeNodes[1].active = true;
                let itemstr: string[] = favorJson.para.split(",");
                let itemId: number = Number(itemstr[0])
                let attJson: IAttributeJson = JsonMgr.getAttributeJson(itemId);
                ResMgr.getBigAttributeIcon(this.addArrIcon, attJson.attributeIcon);
                if (favorJson.type == FavorType.StaffAttNum) {
                    this.addArrLab.string = "+" + itemstr[1];
                } else {
                    this.addArrLab.string = "+" + itemstr[1] + "%";
                }
                this.getTypeLab.string = "员工属性";
                this.addnameLab.string = attJson.attributeName;
                break;
            case FavorType.StaffAllBai:
            case FavorType.StaffAllNum:
                this.TypeNodes[2].active = true;
                if (favorJson.type == FavorType.StaffAllNum) {
                    this.allAddArrLab.string = "+" + favorJson.para;
                } else {
                    this.allAddArrLab.string = "+" + favorJson.para + "%";
                }
                this.getTypeLab.string = "全属性";
                break;
            case FavorType.UnlockTheLines:
                this.TypeNodes[0].active = true;
                this.TypeItemNode.removeAllChildren();
                let node = cc.instantiate(this.ItemPrefab);
                node.setScale(1.4);
                let favorGiftItem: FavorabilityGiftItem = node.getComponent(FavorabilityGiftItem);
                favorGiftItem.updateLinesItem(favorJson.para);
                favorGiftItem.runSpecialAni();
                this.TypeItemNode.addChild(node);
                this.getTypeLab.string = "解锁台词";
                break;
        }

        //增加一个特殊奖励
        let constjson = JsonMgr.getConstVal("favorUnlockReward");
        let rewards = constjson.split(";");
        for (let index = 0; index < rewards.length; index++) {
            if (Number(rewards[index].split(":")[0]) == favorJson.type) {
                let acNode = cc.instantiate(this.ItemPrefab);
                acNode.setScale(1.4);
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


    // update (dt) {}
}
