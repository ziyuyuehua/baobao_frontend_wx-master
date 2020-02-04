import {CommonUtil} from "../CommonUtil";
import {JsonMgr} from "../../global/manager/JsonManager";
import {UIMgr} from "../../global/manager/UIManager";
import {ResMgr} from "../../global/manager/ResManager";
import {DataMgr} from "../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ErrorTips extends cc.Component {

    @property(cc.Label)
    private descriptionLabel: cc.Label = null;
    @property(cc.Node)
    private description: cc.Node = null;
    @property(cc.Node)
    private item: cc.Node = null;
    @property(cc.Label)
    private itemName: cc.Label = null;
    @property(cc.Sprite)
    private itemIcon: cc.Sprite = null;
    @property(cc.Label)
    private itemNum: cc.Label = null;

    private tipIndex: number = 1;

    // onLoad () {}

    start() {
    }

    setLabel = (description: string, index?: number) => {
        this.tipIndex = index;
        this.description.active = true;
        this.item.active = false;
        this.descriptionLabel.string = description;
        let frame: cc.Size = cc.winSize;
        this.node.position = cc.v2(frame.width / 2, frame.height / 2 - 100);
        this.node.opacity = 0;
        this.node.stopAllActions();
        let aciton = cc.sequence(cc.spawn(cc.moveBy(0.4, cc.v2(0, 105)), cc.fadeTo(0.4, 255)), cc.callFunc(() => {
            this.node.stopAllActions();
            this.scheduleOnce(() => {
                let action1 = cc.sequence(cc.spawn(cc.moveBy(0.3, cc.v2(0, 100)), cc.fadeTo(0.3, 0)), cc.callFunc(() => {
                    this.node.removeFromParent();
                    this.node.active = false;
                    DataMgr.setTipIndex(this.tipIndex);
                }));
                this.node.runAction(action1);
            }, 0.5);
        }));
        this.node.runAction(aciton);
    };

    setItem = (arr: string[], index?: number) => {
        // cc.log("arr[0]" + arr[0]);
        this.tipIndex = index;
        this.node.active = true;
        this.description.active = false;
        this.item.active = true;
        let itemID = Number(arr[0]);
        let itemNum = Number(arr[1]);
        if (itemID >= 1001 && itemID <= 1138 && itemNum < 0) {
            itemID = 510003;  //好友框
        }
        if (itemNum >= 0) {
            let json = JsonMgr.getInformationAndItem(itemID);
            if (json) {
                this.itemName.string = "获得" + json.name;
                ResMgr.imgTypeJudgment(this.itemIcon, itemID);
                this.itemIcon.node.active = true;
                this.itemNum.node.active = true;
                this.itemNum.string = "X" + CommonUtil.numChange(itemNum);
            } else {
                this.itemName.string = "未找到名称:" + itemID;
                this.itemIcon.node.active = false;
                this.itemNum.node.active = false;
            }
        } else {
            if (itemID >= 510001 && itemID <= 510005) {   //好友框  动作
                let itemJson = JsonMgr.getItemMod(itemID);
                if (itemJson) {
                    this.itemName.string = "获得" + itemJson.name;
                    ResMgr.getItemIconSF(this.itemIcon, itemJson.icon);
                } else {
                    this.itemName.string = "未找到名称:" + itemID;
                    this.itemIcon.node.active = false;
                }
            } else {
                let dialogJson = JsonMgr.getDialogueJson(itemID);  //台词
                if (dialogJson) {
                    this.itemName.string = "获得" + dialogJson.info;
                    ResMgr.getLineIcon(this.itemIcon, dialogJson.icon);
                } else {
                    this.itemName.string = "未找到名称:" + itemID;
                    this.itemIcon.node.active = false;
                }
            }
            this.itemNum.node.active = false;
        }
        this.itemIcon.node.scale = 0.5;
        this.setActionForNode(this.node);
    };

    onEnable() {
        DataMgr.moveCentre = true;
    }

    setActionForNode = (node: cc.Node) => {
        let frame: cc.Size = cc.winSize;
        node.position = cc.v2(frame.width / 2, frame.height / 2 - 100);
        node.opacity = 0;
        node.stopAllActions();
        let aciton = cc.sequence(cc.spawn(cc.moveBy(0.4, cc.v2(0, 105)).easing(cc.easeCubicActionOut()), cc.fadeTo(0.4, 255)), cc.callFunc(() => {
            node.stopAllActions();
            this.unscheduleAllCallbacks();
            //if (DataMgr.getTipsNum() > 1 && this.tipIndex != DataMgr.getTipsNum()) {
            this.scheduleOnce(() => {
                let action3 = cc.sequence(cc.spawn(cc.moveBy(0.3, cc.v2(0, 80)), cc.fadeTo(0.3, 0)), cc.callFunc(() => {
                    UIMgr.tipsPool.put(this.node);
                }));
                node.runAction(action3);
                DataMgr.setTipIndex(this.tipIndex);
                cc.log("tipIndex----" + this.tipIndex);
            }, 0.5);

        }));
        node.runAction(aciton);
        // node.runAction(cc.sequence(cc.spawn(cc.moveBy(0.8, cc.v2(0, 150)), cc.fadeTo(0.8, 180)), cc.callFunc(() => {
        //     UIMgr.tipsPool.put(this.node);
        // }
        // )
        // )
        // );
    };

    onDisable(): void {
        DataMgr.moveCentre = false;
        // cc.log("givenMove:    " + DataMgr.givenMove);
        // if (DataMgr.givenMove) {
        //     UIMgr.closeBackMapCenter();
        //     DataMgr.givenMove = false;
        // }
    }
}
