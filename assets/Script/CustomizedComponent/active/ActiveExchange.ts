import { GameComponent } from "../../core/component/GameComponent";
import { ButtonMgr } from "../common/ButtonClick";
import CommonSimItem from "../common/CommonSimItem";
import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { UIMgr } from "../../global/manager/UIManager";
import { DataMgr } from "../../Model/DataManager";
import { DotInst, COUNTERTYPE } from "../common/dotClient";
import ExchangeItem from "./ExchangeItem";
import { JsonMgr } from "../../global/manager/JsonManager";
import { UIUtil } from "../../Utils/UIUtil";
import { IActivityStoreInfo } from "../../types/Response";

const { ccclass, property } = cc._decorator;

@ccclass
export default class activeExchange extends GameComponent {
    static url: string = "active/activeExchange"
    @property([cc.Label])
    private labArr: cc.Label[] = [];

    @property(cc.Node)
    private add: cc.Node = null;

    @property(cc.Node)
    private dele: cc.Node = null;

    @property(cc.Prefab)
    private iconPre: cc.Prefab = null;

    @property(cc.Node)
    private iconLay: cc.Node = null;

    @property(cc.Prefab)
    private propPre: cc.Prefab = null;

    @property(cc.Node)
    private propLay: cc.Node = null;

    @property(cc.Slider)
    private slideNum: cc.Slider = null;

    @property(cc.ProgressBar)
    private progressBar: cc.ProgressBar = null;

    @property(cc.Node)
    private backBut: cc.Node = null;

    @property(cc.Node)
    private exchangeBut: cc.Node = null;

    private exCount: number = 0;
    private maxCount: number = 0;
    private ownPorp = null;
    private xmlid = null;
    private activeid = null;
    private Times: number = 0;
    private CountArr = [];
    private exchangeData: IActivityStore = null;

    getBaseUrl() {
        return activeExchange.url;
    }

    onLoad() {
        ButtonMgr.addClick(this.add, () => {
            this.changeCount("1")
        })
        ButtonMgr.addClick(this.dele, () => {
            this.changeCount("2")
        })
        this.slideNum.node.on("slide", this.calExp)
    }

    start() {
        ButtonMgr.addClick(this.backBut, this.closeOnly)
        ButtonMgr.addClick(this.exchangeBut, this.exchange)
        this.xmlid = this.node['data'].XmlId;
        this.activeid = this.node['data'].ActiveId;
        this.updateShopItem();
    }

    calExp = (expSlider) => {
        this.exCount = Math.round(this.maxCount * expSlider.progress)
        this.slideShow();
    }

    updateShopItem = () => {
        this.exchangeData = DataMgr.activeShopData.getActivityMess(this.activeid);
        //兑换目标
        let ItemArr = this.exchangeData.itemId.split(",")
        this.iconLay.removeAllChildren();
        let item = cc.instantiate(this.iconPre)
        let iconItem: CommonSimItem = item.getComponent(CommonSimItem);
        this.iconLay.addChild(item);
        let itemBoxType = DataMgr.activeShopData.getItemBoxType(Number(ItemArr[0]));
        iconItem.updateItem(Number(ItemArr[0]), Number(ItemArr[1]), itemBoxType)
        UIMgr.addDetailedEvent(item, Number(ItemArr[0]));
        let itemJson: IItemJson = JsonMgr.getInformationAndItem(Number(ItemArr[0]));
        this.labArr[0].string = itemJson.name + ""

        //所需道具
        let IconArr = this.exchangeData.price.split(";");
        this.propLay.removeAllChildren();
        for (let i = 0; i < IconArr.length; i++) {
            let propitem = cc.instantiate(this.propPre)
            let iconItem: ExchangeItem = propitem.getComponent(ExchangeItem)
            this.propLay.addChild(propitem)
            let iconStr = IconArr[i].split(",")
            let itemId = Number(iconStr[0])
            this.ownPorp = DataMgr.activeShopData.getItemsNum(itemId)
            iconItem.updateShop(Number(iconStr[0]), Number(iconStr[1]));
            this.Times = Math.floor(this.ownPorp / Number(iconStr[1]));
            this.CountArr.push(this.Times);
        }
        this.CountArr.sort((A, B) => {
            return A - B;
        })
        this.maxCount = this.CountArr[0];
        let ShopNum = DataMgr.activeShopData.getresidualNum(this.activeid);
        if (ShopNum != -1 && this.maxCount >= ShopNum) {
            this.maxCount = ShopNum;
        }
        this.slideShow();
    }

    changeCount = (state: string) => {
        let Num: string = state
        switch (Num) {
            case "1": {
                if (this.exCount >= 0 && this.exCount < this.maxCount) {
                    this.exCount++
                }
                break;
            }
            case "2": {
                if (this.exCount > 0 && this.exCount <= this.maxCount) {
                    this.exCount--
                }
                break;
            }
        }
        this.slideShow();
    }

    slideShow = () => {
        if (this.maxCount <= 0) {
            this.progressBar.progress = 0
            this.slideNum.progress = 0
        } else {
            this.progressBar.progress = this.exCount / this.maxCount
            this.slideNum.progress = this.exCount / this.maxCount
        }
        ClientEvents.ACTIVESHOP_REFRESHNUM.emit(this.exCount);
        this.labArr[1].string = this.exCount + "";
        this.labArr[2].string = "/" + this.maxCount;
        if (this.maxCount == 0) {
            UIMgr.closeView(activeExchange.url);
        }
    }

    exchange = () => {
        if (DataMgr.activityModel.getIsLast()) {
            DotInst.clientSendDot(COUNTERTYPE.communityActive, "3509", this.xmlid);
        } else {
            DotInst.clientSendDot(COUNTERTYPE.communityActive, "3519", this.xmlid);
        }
        if (this.exCount == 0) {
            UIMgr.showTipText("兑换数量不能为0");
        } else {
            HttpInst.postData(NetConfig.ACTIVE_SHOPEXCHANGE, [this.xmlid, this.activeid, this.exCount], (Response: any) => {
                this.maxCount -= this.exCount;
                this.exCount = 0;
                this.slideShow();
                ClientEvents.ACTIVESHOP_SHOPRESIDUAL.emit();
            })
        }
    }
}
