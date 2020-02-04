import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import {IGoodsItem, IItem} from "../../types/Response";
import {CommonUtil} from "../../Utils/CommonUtil";
import {Type} from "./CommonBtn";
import StaffTips from "./staffTips";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {UIUtil} from "../../Utils/UIUtil";
import {Staff} from "../../Model/StaffData";
import {Attrib_I} from "../staff/list/StaffSpecial";
import {GameComponent} from "../../core/component/GameComponent";

const {ccclass, property} = cc._decorator;

enum TipsInitPos {
    OTHERX = 110,
    OTHERJIAOX = -110,
    OTHERJIAOY = 135,
    X = 110,
    Y = -135,
    JIAOX = -110,
    JIAOY = 135,
    MAXOFFSETX = 100,
    MAXOFFSETY = 115.4
}

export interface CommonTipInter {
    state: Type;
    data: any;
    worldPos: cc.Vec2;
}

@ccclass
export default class CommoTips extends GameComponent {
    static url: string = "common/tips";

    @property(cc.Node)
    private staffAttributeNode: cc.Node = null;

    @property(cc.Node)
    private otherNode: cc.Node = null;
    @property(cc.Node)
    private staffSpecialNode: cc.Node = null;

    @property(cc.Node)
    private staffTipNode: cc.Node = null;

    @property(cc.Label)
    private staffsName: cc.Label = null;

    @property(cc.Label)
    private staffsDesc: cc.Label = null;

    @property(cc.Node)
    private yingyeNode: cc.Node = null;

    @property(cc.Node)
    private shop1: cc.Node = null;

    @property(cc.Node)
    private shop2: cc.Node = null;

    @property(cc.Node)
    private shop3: cc.Node = null;

    @property(cc.Node)
    private featureNode: cc.Node = null;

    @property(cc.Label)
    private featureTip: cc.Label = null;

    private otherTyps = "";

    private data = null;

    private dataState = null;

    getBaseUrl() {
        return CommoTips.url;
    }

    load() {
        this.node.zIndex = 9999;
        let datavo: CommonTipInter = this.node['data'];
        this.init(datavo.state, datavo.data, datavo.worldPos);
    }

    init = (state: any, data: any, worldPos: cc.Vec2) => {
        this.data = data;
        this.dataState = state;
        switch (state) {
            case Type.GOODS:
                this.showOtherTips(worldPos);
                this.setGoodsData();
                break;
            case Type.DECORATE:
                this.showOtherTips(worldPos);
                this.setOtherTips();
                break;
            case Type.STAFF:
                this.showStaffTips(worldPos);
                this.setStaffData();
                break;
            case Type.YINGYE:
                this.showYingyeTips(worldPos);
                this.setYingyeData();
                break;
            case Type.STAFFATTRIBUTE:
                this.showStaffAttributeTips(worldPos);
                this.setStaffAttributeData();
                break;
            case Type.LINE:
                this.showFeatureTips(worldPos);
                this.setFeatureData();
                break;
            case Type.ACTION:
                this.showFeatureTips(worldPos);
                this.setActionData();
                break;
            case Type.STAFFSPECIAL:
                this.showSpecialTips(worldPos);
                this.setSpecialData();
                break;
        }
    };

    setBtnStatus = () => {
        this.otherNode.active = (this.dataState === Type.DECORATE || this.dataState === Type.GOODS);
        this.staffTipNode.active = (this.dataState === Type.STAFF);
        this.staffSpecialNode.active = (this.dataState == Type.STAFFSPECIAL);
        this.yingyeNode.active = (this.dataState === Type.YINGYE);
        this.staffAttributeNode.active = (this.dataState === Type.STAFFATTRIBUTE);
        this.featureNode.active = (this.dataState == Type.LINE || this.dataState === Type.ACTION);
    };

    setGoodsData = () => {

        let goodsXml: IGoodsJson = DataMgr.jsonDatas.goodsJsonData[this.data.id];
        this.otherNode.getChildByName("description").getComponent(cc.Label).string = goodsXml.description + "";
        this.otherNode.getChildByName("caseName").getComponent(cc.Label).string = goodsXml.name;
        // let goodsXml: IGoodsJson = DataMgr.jsonDatas.goodsJsonData[goodsData.id];
        // let firstName = "萌股的";
        // if (this.data.goodsData) {
        //     firstName = this.data.goodsData.iconName + "的"
        // }
        // this.goodsName.string = firstName + goodsXml.name;
        // let num = goodsData ? goodsData.num : 0;
        // this.wareCount.string = num + "";

        // this.time.string = goodsXml.costTime + "";
        // this.saleTime.string = goodsXml.disSales;
        // this.inconCount.string = goodsXml.getNum + "";
        // this.lirun.string = goodsXml.normalPrice[1] + "";
    };

    showOtherTips = (position: cc.Vec2) => {
        this.setBtnStatus();
        this.setTipsPosition(this.otherNode, position, true);
    };

    setOtherTips = () => {
        cc.log("this.data[][][]" + this.data.id);
        if (JsonMgr.isStaffRandom(this.data.id)) {
            this.otherNode.getChildByName("description").getComponent(cc.Label).string = "获得一名随机员工。";
            this.otherNode.getChildByName("caseName").getComponent(cc.Label).string = "随机员工";
            this.otherNode.getChildByName("count").getComponent(cc.Label).node.active = false;
            this.otherNode.getChildByName("wareCount").getComponent(cc.Label).node.active = false;
            return;
        }
        if (this.data.id < 0) {
            let json = JsonMgr.getInformationAndItem(this.data.id);
            this.otherNode.getChildByName("description").getComponent(cc.Label).string = json.description + "";
            this.otherNode.getChildByName("caseName").getComponent(cc.Label).string = json.name;
            if (this.data.id === -2) {
                let num = DataMgr.getGold();
                let wareCount = CommonUtil.numChange(num);
                this.otherNode.getChildByName("count").getComponent(cc.Label).string = (wareCount ? wareCount : 0) + "";

            } else if (this.data.id == -3) {
                let num = DataMgr.getDiamond();
                let wareCount = CommonUtil.numChange(num);
                cc.log("num ===" + num);
                cc.log("wareCount" + wareCount);
                this.otherNode.getChildByName("count").getComponent(cc.Label).string = (wareCount ? wareCount : 0) + "";

            } else if (this.data.id === -1) {
                this.otherNode.getChildByName("count").active = false;
                this.otherNode.getChildByName("wareCount").active = false;
                // let num = DataMgr.getExp();
                // let wareCount = CommonUtil.calculate(num);
                // this.otherNode.getChildByName("count").getComponent(cc.Label).string = (wareCount ? wareCount : 0) + "";
            }
            return;
        }
        let itemsData = DataMgr.getAssistanceItems(this.data.id);
        if (itemsData) {
            let data = DataMgr.jsonDatas.itemJsonData[this.data.id];
            this.otherTyps = data ? "assistanceItems" : "item";
            let xmlData = data ? data : DataMgr.jsonDatas.itemJsonData[this.data.id];
            let itemsCount = this.otherTyps === "assistanceItems" ? DataMgr.getAssistanceItems(xmlData.id) : DataMgr.getAssistanceItems(this.data.id);
            this.otherNode.getChildByName("description").getComponent(cc.Label).string = xmlData.description + "";
            this.otherNode.getChildByName("caseName").getComponent(cc.Label).string = xmlData.name;
            this.otherNode.getChildByName("count").getComponent(cc.Label).string = (itemsCount ? itemsCount : 0) + "";
            return;
        }

        if (this.data.id >= 1000 && this.data.id < 9999) {
            this.node.active = false;
            return;
        }

        let data = DataMgr.jsonDatas.decoShopJsonData[this.data.id];
        this.otherTyps = data ? "decorate" : "item";
        let xmlData = data ? data : DataMgr.jsonDatas.itemJsonData[this.data.id];
        let wareCount = this.otherTyps === "decorate" ? DataMgr.warehouseData.getDecaroDataVo(xmlData.id) :
            DataMgr.warehouseData.getItemDataVo(this.data.id == 270001 ? 100601 : xmlData.id);
        this.otherNode.getChildByName("description").getComponent(cc.Label).string = xmlData.description + "";
        this.otherNode.getChildByName("caseName").getComponent(cc.Label).string = xmlData.name;
        this.otherNode.getChildByName("count").getComponent(cc.Label).string = (wareCount ? wareCount.num : 0) + "";
    };

    setTipsPosition = (node: cc.Node, position: cc.Vec2, isOther: boolean = false) => {
        let frameSize = cc.view.getFrameSize();
        let jiaonode = node.getChildByName("jiao");
        if (position.x + TipsInitPos.MAXOFFSETX > frameSize.width) {
            let x = isOther ? -TipsInitPos.OTHERJIAOX : -TipsInitPos.JIAOX;
            if (jiaonode) {
                jiaonode.x = x;
            }
            node.x = isOther ? -TipsInitPos.OTHERX : -TipsInitPos.X;
            this.node.x = position.x;
        } else {
            let x = isOther ? TipsInitPos.OTHERJIAOX : TipsInitPos.JIAOX;
            if (jiaonode) {
                jiaonode.x = x;
            }
            node.x = isOther ? TipsInitPos.OTHERX : TipsInitPos.X;
            this.node.x = position.x;
        }
        // if (position.y - TipsInitPos.MAXOFFSETY < -frameSize.height) {
        let y = isOther ? -TipsInitPos.OTHERJIAOY : -TipsInitPos.JIAOY;
        if (jiaonode) {
            jiaonode.y = y;
            jiaonode.scaleY = -1;
        }
        node.y = -TipsInitPos.Y;
        this.node.y = position.y;
        // } else {
        //     let y = isOther ? -TipsInitPos.OTHERJIAOY : -TipsInitPos.JIAOY;
        //     if (jiaonode) {
        //         jiaonode.y = y;
        //         jiaonode.scaleY = -1;
        //     }
        //     node.y = -TipsInitPos.Y;
        //     this.node.y = position.y;
        // }
    };

    showStaffTips = (position: cc.Vec2) => {
        this.setBtnStatus();
        // this.setTipsPosition(this.staffTipNode, position);
        // this.staffTipNode.active = true;
        this.node.x = position.x;
        this.node.y = position.y;
    };

    setStaffData() {
        let advantageId = this.data.advantageId;
        let goodsData: IGoodsTypeJson = JsonMgr.getGoodsType(advantageId);
        this.staffsDesc.string = goodsData.tipsCon;
        this.staffsName.string = goodsData.tipsTitle;
    }

    showSpecialTips = (position: cc.Vec2) => {
        this.setBtnStatus();
        // this.setTipsPosition(this.staffTipNode, position);
        // this.staffTipNode.active = true;
        this.node.x = position.x;
        this.node.y = position.y;
    };

    showYingyeTips = (position: cc.Vec2) => {
        this.setBtnStatus();
        // this.setTipsPosition(this.staffTipNode, position);
        // this.staffTipNode.active = true;
        this.node.x = position.x;
        this.node.y = position.y;
    };

    setYingyeData() {
        HttpInst.postData(NetConfig.SALEVALUEDETAIL,
            [], (response) => {
                if (!this.yingyeNode) {
                    return;
                }
                cc.log(JSON.stringify(response.saleValueDetail));
                let dataVo = response.saleValueDetail;
                dataVo.sort((a, b) => {
                    return a.shopId - b.shopId;
                });
                this.yingyeNode.height = dataVo.length == 1 ? 146 : (dataVo.length == 2 ? 263 : 380);
                this.shop2.active = dataVo.length >= 2;
                this.shop3.active = dataVo.length >= 3;
                let shopArr = [this.shop1, this.shop2, this.shop3];
                for (let i in dataVo) {
                    shopArr[i].getChildByName("shopName").getComponent(cc.Label).string = dataVo[i].name;
                    shopArr[i].getChildByName("New Layout").getChildByName("renqiAdd").getComponent(cc.Label).string = (dataVo[i].addPercents[1] * 100).toFixed(1) + "%";
                    shopArr[i].getChildByName("New Layout").getChildByName("staffAdd").getComponent(cc.Label).string = (dataVo[i].addPercents[0] * 100).toFixed(1) + "%";
                    shopArr[i].getChildByName("New Layout").getChildByName("decAdd").active = dataVo[i].addPercents[2] > 0;
                    shopArr[i].getChildByName("New Layout").getChildByName("decAdd").getComponent(cc.Label).string = (dataVo[i].addPercents[2] * 100).toFixed(1) + "%";
                }
            });
    }

    showStaffAttributeTips = (position: cc.Vec2) => {
        this.setBtnStatus();
        this.setTipsPosition(this.staffAttributeNode, position);
    };

    setStaffAttributeData = () => {
        this.staffAttributeNode.getComponent(StaffTips).load(this.data.id);
    };

    showFeatureTips = (position: cc.Vec2) => {
        this.setBtnStatus();
        this.node.x = position.x;
        this.node.y = position.y;
    };

    setFeatureData() {
        let itemJson: IDialogueJson = JsonMgr.getDialogueJson(this.data.id);
        this.featureTip.string = itemJson.info;
    }

    setActionData() {
        //let itemJson: IItemJson = JsonMgr.getItem(this.data.id);
        let itemJson: IItemModJson = JsonMgr.getItemMod(this.data.id);
        this.featureTip.string = itemJson.description;
    }

    setSpecialData() {
        let attribArray: Array<Attrib_I> = [];

        let attribStrArray = this.data.split(";");   //"2，50","6，20"
        for (let attribStr of attribStrArray) {
            let attrib: Attrib_I = {};
            let temp = attribStr.split(",");
            attrib.id = Number(temp[0]);
            attrib.value = Number(temp[1]);
            attribArray.push(attrib);        //[{2,50},{6,20}]
        }

        attribArray.sort((a: Attrib_I, b: Attrib_I) => {
            if (a.id > b.id) return 1;
            return -1;
        });

        for (let i = 0; i < attribArray.length; i++) {
            let attrib = attribArray[i];
            let Icon = this.staffSpecialNode.getChildByName("icon" + (i + 1)).getComponent(cc.Sprite);
            let value = this.staffSpecialNode.getChildByName("num" + (i + 1)).getComponent(cc.Label);
            let icon = Staff.getStaffAttrIconByXmlId(attrib.id);
            UIUtil.asyncSetImage(Icon, icon);
            value.string = "+" + attrib.value;
        }
    }

}
