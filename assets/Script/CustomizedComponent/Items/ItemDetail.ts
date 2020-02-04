import {IItem} from "../../types/Response";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {ButtonMgr} from "../../CustomizedComponent/common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {GameComponent} from "../../core/component/GameComponent";
import {JumpConst} from "../../global/const/JumpConst";
import {BagUseType} from "../../Model/WarehouseData";
import ItemHouse from "./ItemHouse";
import {DataMgr} from "../../Model/DataManager";
import value = cc.js.value;
import treasureChest from "../treasureChest/treasureChest";
import playerRank from "../rank/playerRank";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import selfChooseTreasure from "../treasureChest/selfChooseTreasure";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class ItemDetail extends GameComponent {
    static url: string = "warehouse/items/ItemDetail";

    @property(cc.Label)
    itemName: cc.Label = null;

    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;

    @property(cc.Label)
    itemDesc: cc.Label = null;

    @property(cc.Label)
    itemNum: cc.Label = null;

    @property(cc.Node)
    useBtn: cc.Node = null;

    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Node)
    closeBtn1: cc.Node = null;

    @property(cc.Node)
    aniNode: cc.Node = null;

    @property(cc.Sprite)
    itemQuIcon: cc.Sprite = null;

    @property(cc.Node)
    private progressView: cc.Node = null;

    @property(cc.Node)
    private openBoxBtn: cc.Node = null;

    @property(cc.Slider)
    itemSlider: cc.Slider = null;

    @property(cc.ProgressBar)
    itemProgressBar: cc.ProgressBar = null;

    @property(cc.Button)
    decrBtn: cc.Button = null;

    @property(cc.Button)
    incrBtn: cc.Button = null;

    private itemData: IItem = null;
    private useType: number = 0;
    private remberCloseBtnx: number = 0;
    private curNum: number = 1;
    private allNum: number = 0;

    getBaseUrl() {
        return ItemDetail.url;
    }

    start() {
        this.remberCloseBtnx = this.closeBtn1.x;
        ButtonMgr.addClick(this.useBtn, this.useHandler);
        ButtonMgr.addClick(this.closeBtn, this.closeOnly);
        ButtonMgr.addClick(this.closeBtn1, this.closeOnly);
        ButtonMgr.addClick(this.openBoxBtn, this.openBoxHandler);
        this.itemData = this.node["data"];
        this.updateView();
        this.updateSlideView();
    }

    onLoad() {
        this.itemSlider.progress = 0;
        this.itemSlider.node.on("slide", this.calExp);
        this.decrBtn.node.on(cc.Node.EventType.TOUCH_END, this.decrExp);
        this.incrBtn.node.on(cc.Node.EventType.TOUCH_END, this.incrExp);
    }

    calExp = (percent) => {
        this.itemProgressBar.progress = percent.progress;
        this.curNum = Math.floor(this.allNum * percent.progress);
        this.updateSlideView();
    };

    decrExp = () => {
        if (this.curNum <= 0) return;
        this.curNum--;
        this.updateSlideView();
    };

    incrExp = () => {
        if (this.curNum >= this.allNum) return;
        this.curNum++;
        this.updateSlideView();
    };

    updateSlideView() {
        this.progressView.getChildByName("numLab").getComponent(cc.Label).string = this.curNum + "/" + this.allNum;
        this.itemProgressBar.progress = this.curNum / this.allNum;
        this.itemSlider.progress = this.curNum / this.allNum;
        this.incrBtn.node.active = !(this.curNum == this.allNum);
        this.decrBtn.node.active = !(this.curNum == 0);
    }

    onEnable() {
        this.onShowPlay(2, this.aniNode);
    }

    updateView() {
        this.itemNum.string = this.itemData.num + "";
        this.allNum = this.itemData.num;
        let itemJson: IItemJson = JsonMgr.getItem(this.itemData.id);
        this.itemName.string = itemJson.name + "";
        this.itemDesc.string = itemJson.description;
        this.useType = itemJson.isCanUse;
        ResMgr.getItemBox(this.itemQuIcon, "k" + itemJson.color);
        if (itemJson.type == 13) {
            ResMgr.getTreasureIcon(this.itemIcon, itemJson.icon, 0.8);
        } else {
            ResMgr.imgTypeJudgment(this.itemIcon, this.itemData.id);
            if (itemJson.type == 5) {
                this.itemIcon.node.setScale(0.9);
            }
        }
        this.useBtn.active = itemJson.isCanUse != 0;
        if (itemJson.isCanUse == 0) {
            this.closeBtn1.x = 0;
        } else {
            this.closeBtn1.x = this.remberCloseBtnx;
        }
        if (itemJson.type == 13 && this.allNum == 1) {
            this.openBoxBtn.active = true;
            this.useBtn.active = false;
        }
    }

    useHandler = () => {
        let itemJson = JsonMgr.getItem(this.itemData.id);
        if (this.useType == BagUseType.OpenGift) {
            if (JsonMgr.getItem(this.itemData.id).type == 13) {
                if (this.allNum > 1) {
                    this.progressView.active = true;
                    this.itemDesc.node.active = false;
                }
                this.openBoxBtn.active = true;
                this.useBtn.active = false;
            }  else if (itemJson.type == 15) {   //自选宝箱
                DataMgr.setSelMaxNum(Number(itemJson.value));   //自选宝箱最大选择数量
                this.closeOnly();
                UIMgr.showView(selfChooseTreasure.url, null, this.itemData.id);
            }else {
                HttpInst.postData(NetConfig.HOUSE_USE_ITEM, [this.itemData.id, 1], (Response) => {
                    ClientEvents.UPDATE_ITEM_HOUSE.emit();
                    DotInst.clientSendDot(COUNTERTYPE.bag, "10403", this.itemData.id + ""); //使用道具打点
                    this.closeOnly();
                });
            }
        } else {
            UIMgr.closeView(ItemHouse.url);
            UIMgr.closeView(ItemDetail.url);
            ClientEvents.EVENT_OPEN_UI.emit(this.useType);
        }
    };

    openBoxHandler = () => {
        HttpInst.postData(NetConfig.OPEN_BOX, [this.itemData.id, this.curNum], (Response) => {
            ClientEvents.UPDATE_ITEM_HOUSE.emit();
            this.closeOnly();
            UIMgr.showView(treasureChest.url, null, {boxId: this.itemData.id, awards: Response.treasureBoxRewards});
            DataMgr.setOpenBoxNum(this.curNum);
            DataMgr.setNowBoxIndex(1);
            DataMgr.setOpenBoxAward(Response.treasureBoxRewards);
        });
    }
    // update (dt) {}
}
