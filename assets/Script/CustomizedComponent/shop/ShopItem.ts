import {itemType, JsonMgr} from "../../global/manager/JsonManager";
import {ResManager, ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import {CommonUtil} from "../../Utils/CommonUtil";
import {ButtonMgr} from "../common/ButtonClick";
import ShopDetail from "./ShopDetail";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ShopItem extends cc.Component {

    @property(cc.Label)
    private itemName: cc.Label = null;

    @property(cc.Sprite)
    private itemQuIcon: cc.Sprite = null;

    @property(cc.Sprite)
    private itemIcon: cc.Sprite = null;

    @property(cc.Sprite)
    private sailIcon: cc.Sprite = null;

    @property(cc.Label)
    private sailLabel: cc.Label = null;

    @property(cc.Label)
    private iconAttLab: cc.Label = null;

    @property(cc.Node)
    private lockState: cc.Node = null;

    @property(cc.Label)
    private lockLabel: cc.Label = null;

    @property(cc.Node)
    private maxBuyNum: cc.Node = null;

    @property(cc.Node)
    private canBuyIcon: cc.Node = null;

    @property(cc.Node)
    private nullState: cc.Node = null;

    @property(cc.Node)
    private stars: cc.Node = null;

    @property({type: cc.Node, displayName: "折扣"})
    private costNode: cc.Node = null;

    @property({type: cc.Label, displayName: "折扣数量"})
    private costLab: cc.Label = null;

    itemVo = null;
    shopJson: IShopJson = null;
    type: number = 0;
    isLock: boolean = false;
    isSailNul: boolean = false;
    lockLv: number = 1;
    costRigth: number = 0;
    stageNum: number = null;
    costNum: number = 0;
    costTimes: number = null;

    onLoad() {
        ButtonMgr.addClick(this.node, this.openDetailHandler, null, () => {
            DotInst.clientSendDot(COUNTERTYPE.bag, "10502", this.itemVo.id + ""); //长按道具打点
        }, null, this);
    }

    updateItem(itemVO, type, res) {
        this.shopJson = itemVO;
        this.itemVo = JsonMgr.getInformationAndItem(this.shopJson.commodityId);
        this.type = type;
        this.itemName.string = itemVO.name;
        let conStr: string[] = this.shopJson.price.split(",");
        let costID: number = Number(conStr[0]);
        let infoJson = JsonMgr.getInformationAndItem(costID);
        if (costID < 0) {
            ResMgr.getCurrency(this.sailIcon, infoJson.icon);
            if (costID == -3) {
                this.sailIcon.node.setScale(1, 0.8);
            }
        } else {
            ResMgr.getItemIcon(this.sailIcon, infoJson.icon);
        }
        this.sailLabel.string = CommonUtil.numChange(Number(conStr[1]));
        if (!DataMgr.shopCanBuy(this.shopJson.id)) {
            this.sailLabel.node.color = cc.color(255, 0, 0);
            this.canBuyIcon.active = false;
        } else {
            if (type != 0) {
                if (this.itemVo.type == 13) {
                    this.canBuyIcon.active = true;
                }
            }
        }
        for (let uid = 0; uid < res.buyInfo.length; uid++) {
            if (res.buyInfo[uid].xmlId == itemVO.id) {
                this.costNum = res.buyInfo[uid].todayNumber + 1;
                this.costTimes = res.buyInfo[uid].todayNumber;
                break;
            }
        }
        if (!this.costNum) {
            this.costNum = 0;
        }
        if (!this.costTimes) {
            this.costTimes = 0;
        }
        let costData = this.shopJson.dailyOff;
        if (costData != null) {
            let costArr = costData.split(";");
            let costStr = costArr[costArr.length - 1].split(",");
            let maxCostNum = Number(costStr[2]);
            if (this.costNum <= maxCostNum) {
                this.costNode.active = true;
                for (let i = 0; i < costArr.length; i++) {
                    let costFirst = costArr[i].split(",");
                    let costRigth = Number(costFirst[2]);
                    if (this.costNum <= costRigth) {
                        this.stageNum = i;
                        break;
                    }
                }
                if (Number(costStr[0]) == -3) {
                    this.sailIcon.node.setScale(1, 0.8);
                }
                let infoJson = null;
                if (Number(conStr[0]) < 0) {
                    infoJson = JsonMgr.getInforMationJson(Number(conStr[0]));
                    ResMgr.getCurrency(this.sailIcon, infoJson.icon);
                } else {
                    infoJson = JsonMgr.getItem(Number(conStr[0]));
                    ResMgr.getItemIcon(this.sailIcon, infoJson.icon);
                }
                let costMess = costArr[this.stageNum].split(",");
                this.costLab.string = Number(costMess[0]) / 10 + "折";
                let curPrice = Number(costMess[1]);
                this.sailLabel.string = CommonUtil.numChange(curPrice);
                if (DataMgr.warehouseData.getItemNum(Number(conStr[0])) < curPrice) {
                    this.sailLabel.node.color = cc.color(255, 0, 0);
                } else {
                    this.sailLabel.node.color = cc.color(99, 141, 25);
                }
            } else {
                this.normalNum(itemVO);
                this.itemColor(itemVO);
            }
        } else {
            this.normalNum(itemVO);
            this.itemColor(itemVO);
        }
        //判断是否解锁
        this.lockLv = this.shopJson.unclockLevel;
        if (this.lockLv > DataMgr.iMarket.getTrueExpandTime()) {
            this.setLockState(true);
            this.lockLabel.string = "再扩建" + (this.lockLv - DataMgr.iMarket.getTrueExpandTime()) + "次解锁";
        } else {
            this.setLockState(false);
        }
        //判断是否售空
        if (this.shopJson.maxBuy && this.shopJson.maxBuy > 0) {  //有购买限制
            this.maxBuyNum.active = true;
            for (let item of res.buyInfo) {            //便利已购买的数据
                //有无当前商品
                if (item.xmlId == this.shopJson.id && item.number >= this.shopJson.maxBuy) {
                    //买过的数量>=限购数量
                    this.isSailNul = true;
                }
            }
        } else {
            this.maxBuyNum.active = false;
        }
        this.nullState.active = this.isSailNul;
        if (this.nullState.active) {
            this.maxBuyNum.active = false;
        }
        if (type == 0) {
            this.updateDecoData(this.itemVo);
        } else {
            this.updateItemData(this.itemVo);
        }
    }


    itemColor = (itemVo) => {
        let conStr: string[] = JsonMgr.getOneShopJson(itemVo.id).price.split(",");
        if (DataMgr.warehouseData.getItemNum(Number(conStr[0])) >= Number(conStr[1])) {
            this.sailLabel.node.color = cc.color(99, 141, 25);
            if (this.type != 0) {
                let json = JsonMgr.getItem(this.itemVo.id);
                if (json.type == 13) {
                    this.canBuyIcon.active = true;
                }
            }
        } else {
            this.sailLabel.node.color = cc.color(255, 0, 0);
            this.canBuyIcon.active = false;
        }
    }

    normalNum = (itemVO) => {
        let conStr: string[] = JsonMgr.getOneShopJson(itemVO.id).price.split(",");
        if (Number(conStr[0]) == -3) {
            this.sailIcon.node.setScale(1, 0.8);
        }
        let infoJson = null;
        if (Number(conStr[0]) < 0) {
            infoJson = JsonMgr.getInforMationJson(Number(conStr[0]));
            ResMgr.getCurrency(this.sailIcon, infoJson.icon);
        } else {
            infoJson = JsonMgr.getItem(Number(conStr[0]));
            ResMgr.getItemIcon(this.sailIcon, infoJson.icon);
        }
        this.sailLabel.string = CommonUtil.numChange(Number(conStr[1]));
    }

    updateDropItem(itemVO: IDecoShopJson) {   //宝箱掉落item格式
        ButtonMgr.removeClick(this.node, this);
        this.itemVo = itemVO;
        this.stars.active = true;
        this.sailIcon.node.active = false;
        this.sailLabel.node.active = false;
        this.itemName.string = itemVO.name;
        this.iconAttLab.string = "人气 " + itemVO.Popularity;
        ResManager.getShelvesItemIcon(this.itemIcon, itemVO.icon, itemVO.mainType);
        ResMgr.getItemBox(this.itemQuIcon, "b" + itemVO.color, 1);
        for (let i = 1; i <= itemVO.color; i++) {
            if (i > 5) return;
            this.stars.getChildByName("starIcon" + i).active = true;
        }
    }

    setLockState(state) {
        this.isLock = state;
        this.lockState.active = state;
        this.lockLabel.node.active = state;
    }

    openDetailHandler = () => {
        if (this.isLock) {
            UIMgr.showTipText("再扩建" + (this.lockLv - DataMgr.iMarket.getTrueExpandTime()) + "次解锁");
            return;
        }
        if (this.isSailNul) {
            UIMgr.showTipText("已售空");
            return;
        }
        ClientEvents.CLOSE_SHOP_GUIDE.emit();
        UIMgr.showView(ShopDetail.url, null, {itemData: this.shopJson, type: this.type});
        ClientEvents.CLEAN_SOFT.emit();
    }

    updateItemData(itemData) {
        ResMgr.getItemBox(this.itemQuIcon, "b" + itemData.color, 1);
        if (itemData.type == 13) {
            ResMgr.getTreasureIcon(this.itemIcon, itemData.icon, 0.8);
        } else {
            if (!this.itemVo) return;
            if (DataMgr.getshopItemDataMap(this.itemVo.id)) {
                this.itemIcon.spriteFrame = DataMgr.getshopItemDataMap(this.itemVo.id);
            } else {
                ResMgr.getItemIcon(this.itemIcon, itemData.icon, 0.8, (spriteFrame: cc.SpriteFrame) => {
                    DataMgr.setshopItemDataMap(this.itemVo.id, spriteFrame);
                });
            }
        }
        if (itemData.disAttrIcon) {
            this.iconAttLab.string = itemData.disAttrIcon;   //策划将道具属性图标改成文字显示了
        }
    }

    updateDecoData(decoData) {
        if (!this.itemVo) return;
        ResMgr.getItemBox(this.itemQuIcon, "b" + decoData.color, 1);
        if(!this.itemVo) return;
        if (DataMgr.getshopItemDataMap(this.itemVo.id)) {
            this.itemIcon.spriteFrame = DataMgr.getshopItemDataMap(this.itemVo.id);
        } else {
            ResManager.getShelvesItemIcon(this.itemIcon, decoData.icon, decoData.mainType, (spriteFrame: cc.SpriteFrame) => {
                DataMgr.setshopItemDataMap(this.itemVo.id, spriteFrame);
            });
        }
        if (decoData.Popularity > 0) {

            this.iconAttLab.string = "人气 " + decoData.Popularity.toString();
        } else {
            this.iconAttLab.string = "装饰";
        }

    }
}