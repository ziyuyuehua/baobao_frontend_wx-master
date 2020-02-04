import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";
import {ResManager, ResMgr} from "../../global/manager/ResManager";
import {CommonUtil} from "../../Utils/CommonUtil";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {DataMgr, GET_ANI_TYPE} from "../../Model/DataManager";
import CommonInsufficient, {InsufficientType} from "../common/CommonInsufficient";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {CacheMap} from "../MapShow/CacheMapDataManager";
import {MiniData} from "../NewMiniWarehouse/MiniWarehouseData";
import {GameComponent} from "../../core/component/GameComponent";
import {IRespData, IShopDataInfo} from "../../types/Response";
import GoldExchange_wx from "../exchange/goldExchange_wx";
import RechargeMain from "../Recharge/RechargeMain";
import {UIUtil} from "../../Utils/UIUtil";
import getTreasure from "../treasureChest/getTreasure";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import BoxOpenDetail from "./BoxOpenDetail";
import FavorabilityUpView from "../favorability/FavorabilityUpView";
import {GuideIdType, judgeSoftGuideStart} from "../../global/const/GuideConst";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import ShopMain from "./ShopMain";
import {ShelvesType} from "../../Model/market/ShelvesDataModle";
import {IMarketModel} from "../../Model/market/MarketDataMoudle";
import shopZheItem from "./shopZheItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ShopDetail extends GameComponent {
    static url: string = "shop/ShopDetail";

    @property(cc.Node)
    previewNode: cc.Node = null;

    @property(cc.Node)
    addNumNode: cc.Node = null;

    @property(cc.Node)
    reduceNumNode: cc.Node = null;

    @property(cc.Node)
    closeNode: cc.Node = null;

    @property(cc.Node)
    buyNode: cc.Node = null;

    @property(cc.Sprite)
    private itemQuIcon: cc.Sprite = null;

    @property(cc.Sprite)
    private itemIcon: cc.Sprite = null;

    @property(cc.Label)
    itemName: cc.Label = null;

    @property(cc.EditBox)
    itemEditBox: cc.EditBox = null;

    @property(cc.Label)
    itemOnePic: cc.Label = null;

    @property(cc.Label)
    beforePic: cc.Label = null;

    @property(cc.Label)
    itemAllPic: cc.Label = null;

    @property(cc.Sprite)
    itemOneIcon: cc.Sprite = null;

    @property(cc.Sprite)
    beforeIcon: cc.Sprite = null;

    @property(cc.Sprite)
    itemAllIcon: cc.Sprite = null;

    @property(cc.Label)
    itemDesc: cc.Label = null;

    @property(cc.Label)
    maxBuyNum: cc.Label = null;

    @property(cc.Node)
    canExitArea: cc.Node = null;

    @property(cc.Node)
    justOne: cc.Node = null;

    @property(cc.Node)
    aniNode: cc.Node = null;

    @property(cc.Sprite)
    softGuide: cc.Sprite = null;

    @property(cc.Label)
    renqiLab: cc.Label = null;

    @property(cc.Button)
    openBoxDetail: cc.Button = null;

    @property(cc.Label)
    private diamondLabel: cc.Label = null;

    @property(cc.Label)
    private goldLabel: cc.Label = null;

    @property(cc.Node)
    private diamondBtn: cc.Node = null;

    @property(cc.Node)
    private goldBtn: cc.Node = null;

    @property(cc.Label)
    private itemLabel: cc.Label = null;

    @property(cc.Node)
    private itemBtn: cc.Node = null;

    @property(cc.Sprite)
    private itemSprite: cc.Sprite = null;

    @property([cc.Sprite])
    private bgSprite: cc.Sprite[] = [];

    @property(cc.Node)
    private saleValueNode: cc.Node = null;

    @property(cc.Label)
    private saleValueLab: cc.Label = null;

    @property({type: cc.Node, displayName: "优惠详情按钮"})
    private zheDetailNode: cc.Node = null;

    @property({type: cc.Node, displayName: "优惠layout"})
    private zheLayout: cc.Node = null;

    @property({type: cc.Prefab, displayName: "优惠Prefab"})
    private zhePrefab: cc.Prefab = null;

    @property({type: cc.Node, displayName: "优惠详情"})
    private zheNode: cc.Node = null;

    @property({type: cc.Node, displayName: "打折提示"})
    private dailyTipNode: cc.Node = null;

    @property({type: cc.Label, displayName: "打折力度"})
    private dailyTipLab: cc.Label = null;

    private itemJson = null;
    private shopJson: IShopJson = null;
    private type: number = 0;
    private overBuy: number = -1;   //剩余购买数量
    private isSoft: boolean = false;
    private buyNum: number = 0;
    private costItemId: number = 0;
    private softGuideId: number = 0;

    private lastTimes: number = 0;
    private costTimes: number = 0;
    private maxCostNum: number = 0;
    private itemPrice: IShopDataInfo[] = null;

    private allPic: number = 0;

    getBaseUrl() {
        return ShopDetail.url;
    }

    onLoad() {
        this.addEvent(ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.on(this.refreshItemNum));
        this.addEvent(ClientEvents.EVENT_REFRESH_GOLD.on(this.setTopUI));
        this.addEvent(ClientEvents.CLOSE_SHOP_DETAIL.on(this.closeOnly));
        this.setTopUI();
    }


    setTopUI = () => {
        const userData = DataMgr.userData;
        UIUtil.setLabel(this.goldLabel, CommonUtil.numChange(userData.gold)); //金币
        UIUtil.setLabel(this.diamondLabel, CommonUtil.numChange(userData.diamond)); //钻石
    }

    diamondExchangeBtn = () => {
        // UIMgr.showView(RechargeMain.url, null, null, null, true);
        ClientEvents.EVENT_POPUP_DIAMOND_EXCHANGE.emit();
    };

    itemSorceHandler = () => {
        if (this.node["data"].itemData.type == 13) {
            UIMgr.loadaccessPathList(this.costItemId, FavorabilityUpView.url);
        }
    }

    goldExchangeBtn = () => {
        if (!JsonMgr.isFunctionOpen(FunctionName.GoldExchange)) {
            let openJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(FunctionName.GoldExchange);
            if (openJson.openType == 1) {
                UIMgr.showTipText("金币兑换将于等级" + openJson.value + "级后开启");
                return;
            } else if (openJson.openType == 2) {
                let positionJson: IPositionJson = JsonMgr.getPositionJson(openJson.value);
                UIMgr.showTipText("金币兑换将于职位达到【" + positionJson.name + positionJson.level + "阶】后开启");
                return;
            }
        }
        HttpInst.postData(NetConfig.GET_EXCHANGE_GOLD, [], (response: IRespData) => {
            UIMgr.showView(GoldExchange_wx.url, null, response);
        });
    };

    refreshItemNum = () => {
        if (this.itemJson.type && (this.itemJson.type == 13 || this.itemJson.type == 10)) {
            this.bgSprite[0].node.active = false;
            this.bgSprite[1].node.active = true;
            let priceId: number = Number(this.shopJson.price.split(",")[0]);
            let goldMoonNum = DataMgr.getItemNum(priceId);
            this.itemLabel.string = goldMoonNum.toString();
            ResMgr.imgTypeJudgment(this.itemSprite, priceId);
        } else {
            this.bgSprite[1].node.active = false;
            this.itemBtn.active = false;
        }
    }

    start() {
        this.addClick();
        this.shopJson = this.node["data"].itemData;
        this.itemJson = JsonMgr.getInformationAndItem(this.shopJson.commodityId);
        this.type = this.node["data"].type;
        this.isSoft = this.node["data"].isSoft;
        this.costItemId = Number(this.node["data"].itemData.commodityId);
        this.itemPrice = DataMgr.getBuyInfo();
        for (let uid = 0; uid < this.itemPrice.length; uid++) {
            if (this.itemPrice[uid].xmlId == this.shopJson.id) {
                this.lastTimes = this.itemPrice[uid].number;
                this.costTimes = this.itemPrice[uid].todayNumber;
                break;
            }
        }
        for (let item of DataMgr.getBuyInfo()) {
            if (item.xmlId == this.shopJson.id) {
                //买过的数量>=限购数量
                this.buyNum = item.number;
            }
        }
        this.updateDetail();
        this.itemEditBox.inputMode = cc.EditBox.InputMode.NUMERIC;
        this.itemEditBox.maxLength = 3;
        ClientEvents.CLEAN_SOFT.emit();
        let type: number = this.shopJson.commodityType;
        if (type == 1) {
            this.initGuide();
        }
        this.refreshItemNum();
    }

    initGuide() {
        //货架
        let curSoftGuideShelf = JsonMgr.getSoftGuideJsoById(GuideIdType.shelf, 3);
        if (curSoftGuideShelf && judgeSoftGuideStart(curSoftGuideShelf)) {
            DotInst.clientSendDot(COUNTERTYPE.softGuide, "19013");
            this.showGuideHandler(curSoftGuideShelf);
            return;
        }
        //装饰
        let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.deco, 3);
        if (curSoftGuide && judgeSoftGuideStart(curSoftGuide)) {
            DotInst.clientSendDot(COUNTERTYPE.softGuide, "19006");
            this.showGuideHandler(curSoftGuide);
            return;
        }
    }

    showGuideHandler(curSoftGuideShelf) {
        GuideMgr.showSoftGuide(this.buyNode, ARROW_DIRECTION.TOP, curSoftGuideShelf.displayText, (node: cc.Node) => {

        }, false, 0, false, this.buyHandler);
    }

    onEnable() {
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(false);
        this.onShowPlay(2, this.aniNode);
        DataMgr.setGetAniType(GET_ANI_TYPE.SHOW_TIPS_ONLY);
    }

    onDisable() {
        if (DataMgr.isInFriendHome()) {
            ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(false);
        } else {
            ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(true);
        }
    }

    updateDetail() {
        this.zheDetailNode.active = false;
        //计算最多打折几次
        if (this.shopJson.dailyOff) {
            this.zheDetailNode.active = true;
            let costDataStr = this.shopJson.dailyOff.split(";");
            this.maxCostNum = Number(costDataStr[costDataStr.length - 1].split(",")[2]);
        }

        this.itemName.string = this.itemJson.name;
        this.itemDesc.string = this.itemJson.description;
        let conStr: string[] = this.shopJson.price.split(",");
        let costID: number = Number(conStr[0]);
        let maxBuy: number = this.shopJson.maxBuy;
        if (costID < 0) {
            let infoJson: IInformationJson = JsonMgr.getInforMationJson(costID);
            ResMgr.getCurrency(this.itemOneIcon, infoJson.icon);
            ResMgr.getCurrency(this.itemAllIcon, infoJson.icon);
            if (costID == -3) {
                this.itemOneIcon.node.setScale(0.9, 0.8);
                this.itemAllIcon.node.setScale(0.9, 0.8);
                this.beforeIcon.node.setScale(0.8, 0.5);
            }
        } else {
            let infoJson: IItemJson = JsonMgr.getItem(Number(conStr[0]));
            ResMgr.getItemIcon(this.itemOneIcon, infoJson.icon);
            ResMgr.getItemIcon(this.itemAllIcon, infoJson.icon);
        }
        this.itemOnePic.string = CommonUtil.numChange(Number(conStr[1]));
        this.itemAllPic.string = CommonUtil.numChange(Number(conStr[1]));
        if (DataMgr.warehouseData.getItemNum(Number(conStr[0])) < Number(conStr[1])) {
            this.itemOnePic.node.color = cc.color(255, 0, 0);
            this.itemAllPic.node.color = cc.color(255, 0, 0);
        }
        this.previewNode.active = false;
        if (this.type == 0) {
            let decoData = <IDecoShopJson>this.itemJson;
            if (decoData.mainType != 4) {
                this.canExitArea.active = false;
                this.justOne.active = true;
            }
            if (decoData.Popularity > 0) {
                this.renqiLab.string = "人气 " + decoData.Popularity.toString();
            } else {
                this.renqiLab.string = "装饰";
            }
            this.saleValueNode.active = true;
            this.saleValueLab.string = IMarketModel.getSaleValue(decoData).toString();
            ResMgr.getItemBox(this.itemQuIcon, "c" + decoData.color, 1);
            ResManager.getShelvesItemIcon(this.itemIcon, decoData.icon, decoData.mainType);
        } else {
            this.saleValueNode.active = false;
            let itemData = <IItemJson>this.itemJson;
            if (itemData.disAttrIcon) {
                this.renqiLab.string = itemData.disAttrIcon;   //策划将道具属性图标改成文字显示了
                this.openBoxDetail.node.active = false;
            }
            ResMgr.getItemBox(this.itemQuIcon, "c" + itemData.color, 1);
            if (itemData.type == 13) {
                ResMgr.getTreasureIcon(this.itemIcon, itemData.icon, 0.8);
                this.openBoxDetail.node.active = true;
            } else {
                ResMgr.getItemIcon(this.itemIcon, itemData.icon, 0.8);
                this.openBoxDetail.node.active = false;
            }
        }
        if (maxBuy != -1) {
            this.overBuy = maxBuy - this.buyNum;
            this.maxBuyNum.node.active = true;
            this.maxBuyNum.string = "(限购" + maxBuy + "件)";
        } else {
            this.maxBuyNum.node.active = false;
        }
        this.itemEditBox.string = "1";
        this.getTotalNum();
    }

    addClick() {
        ButtonMgr.addClick(this.previewNode, this.previewHandler);
        ButtonMgr.addClick(this.addNumNode, this.addNumHandler);
        ButtonMgr.addClick(this.reduceNumNode, this.reduceHandler);
        ButtonMgr.addClick(this.closeNode, this.closeHandler);
        ButtonMgr.addClick(this.buyNode, this.buyHandler);
        ButtonMgr.addClick(this.goldBtn, this.goldExchangeBtn);
        ButtonMgr.addClick(this.diamondBtn, this.diamondExchangeBtn);
        ButtonMgr.addClick(this.itemBtn, this.itemSorceHandler);
        ButtonMgr.addClick(this.openBoxDetail.node, this.detailBtnHandler);
        ButtonMgr.addClick(this.zheDetailNode, this.zheDetailHandler);
        ButtonMgr.addClick(this.zheNode, () => {
            this.zheNode.active = false;
        })
        this.itemEditBox.node.on("editing-did-ended", this.editBoxEndHandler);
        this.itemEditBox.node.on("text-changed", this.textChanged);
    }

    closeHandler = () => {
        this.closeOnly();
        ClientEvents.DIALO_END_SEND.emit();
        DataMgr.setGetAniType(GET_ANI_TYPE.SHOW_ANI_AND_TIPS);
    }

    detailBtnHandler = () => {
        UIMgr.showView(BoxOpenDetail.url, null, this.itemJson.id);
    }

    //预览
    previewHandler = () => {
    };

    //增加数量
    addNumHandler = () => {
        cc.log("this.overBuy" + this.overBuy);
        let curNum = Number(this.itemEditBox.string);
        if (this.overBuy != -1) {    //有上限
            if (curNum >= this.overBuy) {
                UIMgr.showTipText("最多可购买" + this.overBuy);
                return;
            }
        }
        if (curNum >= 999) {
            return;
        }
        curNum++;
        this.itemEditBox.string = curNum + "";
        let conStr: string[] = this.shopJson.price.split(",");
        this.itemAllPic.string = CommonUtil.numChange(Number(conStr[1]) * Number(this.itemEditBox.string));
        this.getTotalNum();
    }

    //减少数量
    reduceHandler = () => {
        let curNum = Number(this.itemEditBox.string);
        if (curNum <= 1) {
            return;
        }
        curNum--;
        this.itemEditBox.string = curNum + "";
        let conStr: string[] = this.shopJson.price.split(",");
        this.itemAllPic.string = CommonUtil.numChange(Number(conStr[1]) * Number(this.itemEditBox.string));
        this.getTotalNum();
    }

    //购买
    buyHandler = () => {
        let buyNum: number = Number(this.itemEditBox.string);
        let conStr: string[] = this.shopJson.price.split(",");
        let allPic = buyNum * Number(conStr[1]);
        if (Number(conStr[0]) == -2) {
            if (DataMgr.getGold() < this.allPic) {
                UIMgr.showView(CommonInsufficient.url, null, InsufficientType.Gold);
                return;
            }
        } else if (Number(conStr[0]) == -3) {
            if (DataMgr.getDiamond() < this.allPic) {
                UIMgr.showView(CommonInsufficient.url, null, InsufficientType.Diamond);
                return;
            }
        } else if (this.node["data"].itemData.type == 13) {
            let hasNum: number = DataMgr.warehouseData.getItemNum(this.costItemId);
            if (hasNum < this.allPic) {
                UIMgr.loadaccessPathList(this.costItemId, FavorabilityUpView.url);
                return;
            }
        }
        HttpInst.postData(NetConfig.buyCommodity, [this.shopJson.id, buyNum], (response: IRespData) => {
            if (this.softGuideId > 0 && DataMgr.getGuideCompleteTimeById(this.softGuideId) <= 0) {
                HttpInst.postData(NetConfig.SOFT_LED_INFO, [this.softGuideId], (response) => {
                });
            }
            if (response.reward) {
                if (this.shopJson && this.shopJson.commodityType == 3) {
                    UIMgr.showView(getTreasure.url, null, response.reward[0]);
                }
            }
            if (this.itemJson && this.itemJson.mainType && this.itemJson.mainType < ShelvesType.FloorShelve) {
                let setResult = response.setFutureSuc;
                if (setResult) {
                    CacheMap.upDateMapItemAllData();
                    UIMgr.closeView(ShopMain.url);
                    DataMgr.setGetAniType(GET_ANI_TYPE.SHOW_ANI_AND_TIPS);
                    DataMgr.judgeStartSoftGuideJson();
                    ClientEvents.INSERT_FUTURE_TO_MAP.emit(true);
                    UIMgr.showTipText("已经为您摆放到合适位置啦!");
                } else {
                    DotInst.clientSendDot(COUNTERTYPE.expandMarket, "18004", this.itemJson.id.toString());
                    if (JsonMgr.isFunctionOpen(FunctionName.decorate)) {
                        if (DataMgr.iMarket.checkCaseIsLimit()) {
                            UIMgr.showTipText("因到达货架摆放上限，已为您把家具放回背包啦!");
                        } else {
                            let id = this.itemJson.id;
                            UIMgr.closeView(ShopMain.url);
                            let xmlData = JsonMgr.getDecoShopJson(id);
                            DataMgr.warehouseData.updateShelfVo(xmlData.mainType, xmlData.id, -1);
                            ClientEvents.BUY_FUTURE_INSERT_FUTURE.emit(true, -1, true, () => {
                                ClientEvents.ADD_ITEM_TO_MAP.emit(xmlData, CommonUtil.getNodeType(xmlData.mainType));
                            });
                        }
                    }
                }
            }
            this.closeOnly();
            CacheMap.getDecorateState() && MiniData.refreshData();
            ClientEvents.UPDATE_SHOP_VIEW.emit();
            DotInst.clientSendDot(COUNTERTYPE.shop, "10503", this.itemJson.id + ""); //点击道具打点
        });
    };

    textChanged = () => {
        if (this.itemEditBox.string.charAt(0) == "0") {
            UIMgr.showTipText("购买数量不能为0");
            this.itemEditBox.string = "1";
            this.itemEditBox.blur();
        }
        if (this.itemEditBox.string.charAt(0) == "-") {
            UIMgr.showTipText("购买数量不能为负数");
            this.itemEditBox.string = "1";
            this.itemEditBox.blur();
        }
        if (this.overBuy != -1 && Number(this.itemEditBox.string) > this.overBuy) {
            this.itemEditBox.string = this.overBuy + "";
            UIMgr.showTipText("超出当前最大购买数量");
            this.itemEditBox.string = this.overBuy + "";
            this.itemEditBox.blur();
        }
        let conStr: string[] = this.shopJson.price.split(",");
        this.itemAllPic.string = CommonUtil.numChange(Number(conStr[1]) * Number(this.itemEditBox.string));
        this.getTotalNum();
    }

    //输入结束事件
    editBoxEndHandler = () => {
        if (this.itemEditBox.string == "") {
            this.itemEditBox.string = "1";
            this.itemEditBox.blur();
        } else {
            let curNum = Number(this.itemEditBox.string);
            this.itemEditBox.string = Math.floor(curNum) + "";
            if (this.overBuy != -1) {
                let curNum = Number(this.itemEditBox.string);
                if (curNum > this.overBuy) {
                    this.itemEditBox.string = this.overBuy + "";
                    UIMgr.showTipText("最多可购买" + this.overBuy);
                }
            }
        }
        let conStr: string[] = this.shopJson.price.split(",");
        this.itemAllPic.string = CommonUtil.numChange(Number(conStr[1]) * Number(this.itemEditBox.string));
        this.getTotalNum();
    }

    getTotalNum = () => {
        let wantNum = Number(this.itemEditBox.string);
        let totalNum = 0;
        let costData = this.shopJson.dailyOff;
        let conStr: string[] = this.shopJson.price.split(",");
        //更新折扣信息
        this.updateDailyData(this.itemJson.id, wantNum);

        if (costData && this.costTimes <= this.maxCostNum) {
            let haveDailyNum = Math.min(this.maxCostNum - this.costTimes, wantNum);

            let costArr = costData.split(";");
            for (let index = 0; index < haveDailyNum; index++) {
                let price = 0;
                for (let nIndx = 0; nIndx < costArr.length; nIndx++) {
                    let dailyStr: string[] = costArr[nIndx].split(",");
                    let dailyMaxNum: number = Number(dailyStr[2])
                    if (this.costTimes + index < dailyMaxNum) {
                        price = Number(dailyStr[1]);
                        break;
                    }
                }
                totalNum += price;
            }
            if (wantNum > haveDailyNum) {
                totalNum += (wantNum - haveDailyNum) * Number(conStr[1]);
            }
        } else {
            totalNum = wantNum * Number(conStr[1]);
        }
        this.allPic = totalNum;
        this.itemAllPic.string = CommonUtil.numChange(totalNum);
        if (DataMgr.warehouseData.getItemNum(Number(conStr[0])) < totalNum) {
            this.itemAllPic.node.color = cc.color(255, 0, 0);
        } else {
            this.itemAllPic.node.color = cc.color(99, 141, 25);
        }
    }

    updateDailyData(itemId, choseNum: number = 0) {
        let costData = this.shopJson.dailyOff;
        let conStr: string[] = this.shopJson.price.split(",");
        let infoJson: IInformationJson = JsonMgr.getInformationAndItem(Number(conStr[0]));
        if (costData && this.costTimes + choseNum <= this.maxCostNum) {
            //有折扣
            this.beforeIcon.node.active = true;
            this.dailyTipNode.active = true;
            //原价
            if (Number(conStr[0]) == -3) {
                this.beforeIcon.node.setScale(0.8, 0.5);
            }
            if (Number(conStr[0]) < 0) {
                ResMgr.getCurrency(this.beforeIcon, infoJson.icon, 0.7);
            } else {
                ResMgr.getItemIcon(this.beforeIcon, infoJson.icon, 0.7);
            }
            this.beforePic.string = CommonUtil.numChange(Number(conStr[1]));
            //现价
            let costArr = costData.split(";");
            let curPrice: number = 0;
            for (let index = 0; index < costArr.length; index++) {
                let dailyStr: string[] = costArr[index].split(",");
                let dailyMaxNum: number = Number(dailyStr[2])
                if (this.costTimes + choseNum <= dailyMaxNum) {
                    this.dailyTipLab.string = Number(dailyStr[0]) / 10 + ""
                    curPrice = Number(dailyStr[1]);
                    break;
                }
            }
            this.itemOnePic.string = CommonUtil.numChange(curPrice);
            if (DataMgr.warehouseData.getItemNum(Number(conStr[0])) < curPrice) {
                this.itemOnePic.node.color = cc.color(255, 0, 0);
            } else {
                this.itemOnePic.node.color = cc.color(99, 141, 25);
            }
        } else {
            //无折扣
            this.beforeIcon.node.active = false;
            this.dailyTipNode.active = false;
            this.itemOnePic.string = CommonUtil.numChange(Number(conStr[1]));
            if (DataMgr.warehouseData.getItemNum(Number(conStr[0])) < Number(conStr[1])) {
                this.itemOnePic.node.color = cc.color(255, 0, 0);
            } else {
                this.itemOnePic.node.color = cc.color(99, 141, 25);
            }
        }
    }

    zheDetailHandler = () => {
        this.zheNode.active = true;
        let dailys = this.shopJson.dailyOff.split(";");
        this.zheLayout.removeAllChildren();
        let curindex = dailys.length;
        for (let index = 0; index < dailys.length; index++) {
            let daily: string[] = dailys[index].split(",");
            if (this.costTimes < Number(daily[2])) {
                curindex = index;
                break;
            }
        }
        for (let index = 0; index < dailys.length + 1; index++) {
            let node = cc.instantiate(this.zhePrefab);
            let zheItem: shopZheItem = node.getComponent(shopZheItem);
            zheItem.updateItem(dailys[index], this.costTimes, this.shopJson.price, index == curindex);
            this.zheLayout.addChild(node);
        }
    }

    // update (dt) {}
}
