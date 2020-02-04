/**
*@Athuor ljx
*@Date 16:40
*/
import {GameComponent} from "../../core/component/GameComponent";
import {DataMgr} from "../../Model/DataManager";
import {ButtonMgr} from "../common/ButtonClick";
import {ResManager, ResMgr} from "../../global/manager/ResManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import SpecialDesc from "./SpecialDesc";
import {CommonUtil} from "../../Utils/CommonUtil";
import {IMarketModel} from "../../Model/market/MarketDataMoudle";

const {ccclass, property} = cc._decorator;

@ccclass

export default class FutureDetail extends GameComponent {

    static url = 'mainUI/futureDetail';

    @property(cc.Node)
    private specialTittle: cc.Node = null;
    @property(cc.Node)
    private tips: cc.Node = null;
    @property(cc.Node)
    private normalTittle: cc.Node = null;
    @property(cc.Label)
    private futureNameLabel: cc.Label = null;
    @property(cc.Node)
    private back: cc.Node = null;
    @property(cc.Sprite)
    private icon: cc.Sprite = null;
    @property(cc.Sprite)
    private itemBg: cc.Sprite = null;
    @property(cc.Prefab)
    private specialLabel: cc.Prefab = null;
    @property(cc.Label)
    private futureDesc: cc.Label = null;
    @property(cc.Label)
    private popularityLabel: cc.Label = null;
    @property(cc.Label)
    private saleValue: cc.Label = null;

    private xmlData: IDecoShopJson = null;
    private specialXmlData: IDecoEffectJson = null;

    protected start(): void {
        ButtonMgr.addClick(this.back, this.closeView);
    }

    init(xmlData: IDecoShopJson) {
        this.xmlData = xmlData;
        this.futureNameLabel.string = this.xmlData.name;
        this.futureDesc.string = this.xmlData.description;
        this.popularityLabel.string = this.xmlData.Popularity.toString();
        ResManager.getShelvesItemIcon(this.icon, this.xmlData.icon, this.xmlData.mainType);
        ResMgr.getItemBox(this.itemBg, "c" + this.xmlData.color, 1);
        this.specialXmlData = JsonMgr.getDecoEffect(this.xmlData.id);
        this.initSaleValue();
        if(this.specialXmlData) {
            this.tips.height = 561;
            this.specialInit();
        }
    }

    specialInit() {
        this.specialTittle.active = true;
        this.normalTittle.active = false;
        let descArr = this.specialXmlData.decoDecs.split(";");
        let len = descArr.length;
        descArr.forEach((value, key) => {
            let node = cc.instantiate(this.specialLabel);
            this.tips.addChild(node);
            node.getComponent(SpecialDesc).init(value, len, key, cc.v2(10, -395), [cc.v2(10, -369), cc.v2(10, -418)]);
        });
    }

    initSaleValue() {
        let value = IMarketModel.getSaleValue(this.xmlData);
        this.saleValue.string = value.toString() + "/分钟";
    }

    protected getBaseUrl(): string {
        return FutureDetail.url;
    }
}
