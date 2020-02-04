import {UIUtil} from "../../../Utils/UIUtil";
import {NetConfig} from "../../../global/const/NetConfig";
import {HttpInst} from "../../../core/http/HttpClient";
import {Base, JsonMgr, StaffConfig} from "../../../global/manager/JsonManager";
import {COUNTERTYPE, DotInst, DotVo} from "../../common/dotClient";
import {GameComponent} from "../../../core/component/GameComponent";
import {UIMgr} from "../../../global/manager/UIManager";
import {StaffRateItem} from "./StaffRateItem";
import {FurnitureRateItem} from "./FurnitureRateItem";
import {GoldStaffRateItem} from "./GoldStaffRateItem";
import {GoldFurnitureRateItem} from "./GoldFurnitureRateItem";
import {RateActivityItem} from "./RateActivityItem";
import seeFurniture from "../../friends/seeFurniture";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {IPosts, IShowStaffRates, IStarAllRate, IStarLength} from "../../../types/Response";
import {DataMgr} from "../../../Model/DataManager";
import array = cc.js.array;

const {ccclass, property} = cc._decorator;

@ccclass
export class StaffRatePanel extends GameComponent {
    @property(cc.String)
    private staffTarget = "";
    @property(cc.String)
    private furnitureTarget = "";
    @property(cc.String)
    private goldStaffTarget = "";
    @property(cc.String)
    private goldFurnitureTarget = "";


    @property(cc.Prefab)
    private staffRateItem: cc.Prefab = null;
    @property(cc.Prefab)
    private furnitureRateItem: cc.Prefab = null;
    @property(cc.Prefab)
    private rateActivityItem: cc.Prefab = null;
    @property(cc.Prefab)
    private goldStaffRateItem: cc.Prefab = null;
    @property(cc.Prefab)
    private goldFurnitureRateItem: cc.Prefab = null;
    //---------------------------------------

    @property(cc.Node)
    private goldTagNode: cc.Node = null;
    @property(cc.Node)
    private diamondTagNode: cc.Node = null;
    @property(cc.Button)
    private goldTagBtn: cc.Button = null;
    @property(cc.Button)
    private diamondTagBtn: cc.Button = null;

    @property(cc.Label)
    private upLeftCntLabel: cc.Label = null;
    @property([cc.Label])
    private goldRateLabels: Array<cc.Label> = [];

    @property([cc.Label])
    private diamondRateLabels: Array<cc.Label> = [];


    @property(cc.Button)
    private staffDropDownBtn: cc.Button = null;
    @property(cc.Button)
    private furnitureDropDownBtn: cc.Button = null;
    @property(cc.Button)
    private goldStaffDropDownBtn: cc.Button = null;
    @property(cc.Button)
    private goldFurnitureDropDownBtn: cc.Button = null;


    @property(cc.Node)
    private rateActivityLayout: cc.Node = null;

    @property(cc.Node)
    private staffLayout: cc.Node = null;

    @property(cc.Node)
    private furnitureLayout: cc.Node = null;

    @property(cc.Node)
    private goldStaffLayout: cc.Node = null;

    @property(cc.Node)
    private goldFurnitureLayout: cc.Node = null;

    @property(cc.Button)
    private backBtn: cc.Button = null;

    @property(cc.Sprite)
    private upImg: cc.Sprite = null;

    static url: string = "staff/recruit/StaffRatePanel";


    @property([cc.Node])
    private diamondatag: Array<cc.Node> = [];

    @property([cc.Node])
    private goldtag: Array<cc.Node> = [];


    appearChances: string = null;
    uniqueStar: Array<number> = [];
    static uniqueStarStaff: Array<number> = [];
    static uniqueStarFurniture: Array<number> = [];

    static staffLength: Base[] = [];
    static FurnitureLength: Base[] = [];


    fiveStar: Array<number> = [];
    static fiveStarStaff: Array<number> = [];
    static fiveStarFurniture: Array<number> = [];

    fourStar: Array<number> = [];
    static fourStarStaff: Array<number> = [];
    static fourStarFurniture: Array<number> = [];

    threeStar: Array<number> = [];
    static threeStarStaff: Array<number> = [];
    static threeStarFurniture: Array<number> = [];

    private uniqueStarAllWeight: number = 0;
    private uniqueStarStaffAllWeight: number = 0;
    private uniqueStarFurnitureAllWeight: number = 0;


    private fiveStarAllWeight: number = 0;
    private fiveStarStaffAllWeight: number = 0;
    private fiveStarFurnitureAllWeight: number = 0;

    private fourStarAllWeight: number = 0;
    private fourStarStaffAllWeight: number = 0;
    private fourStarFurnitureAllWeight: number = 0;

    private threeStarAllWeight: number = 0;
    private threeStarStaffAllWeight: number = 0;
    private threeStarFurnitureAllWeight: number = 0;

    private showGoldRateView: boolean = true;
    static rateData: IShowStaffRates = null;
    static golds: Array<number> = [];

    getBaseUrl() {
        return StaffRatePanel.url;
    }

    onLoad() {
        this.goldTagBtn.node.on("click", this.onGoldTagBtnClick);
        this.diamondTagBtn.node.on("click", this.onDiamondTagBtnClick);
        this.staffDropDownBtn.node.on("click", this.onStaffDropDown);
        this.goldStaffDropDownBtn.node.on("click", this.onGoldStaffDropDown);
        this.furnitureDropDownBtn.node.on("click", this.onfurnitureDropDown);
        this.goldFurnitureDropDownBtn.node.on("click", this.onGoldFurnitureDropDown);
        this.backBtn.node.on("click", this.onBackBtnClick);
        this.upRateData();
    }

    start() {
        this.appearChances = JsonMgr.getGoldFairCostConfig(1).appearChances;
        this.onDiamondTagBtnClick();
    }

    onEnable() {
        this.showGoldRateView = true;
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(false);
    }

    upRateData() {
        HttpInst.postData(NetConfig.showStaffRates,
            [], (response: IShowStaffRates) => {
                StaffRatePanel.rateData = response;
                StaffRatePanel.golds = response.golds;
                this.showDiamondRate();
                this.initRateActivityItem(StaffRatePanel.rateData);
                this.showStockUpImg(StaffRatePanel.rateData);
            }
        );
    }

    showDiamondRate() {
        if (!StaffRatePanel.rateData) return;
        UIUtil.setLabel(this.upLeftCntLabel, (5 - StaffRatePanel.rateData.upLeftCnt % 5));
        UIUtil.setLabel(this.diamondRateLabels[0], this.showRate(StaffRatePanel.rateData.unique[0]));
        UIUtil.setLabel(this.diamondRateLabels[1], this.showRate(StaffRatePanel.rateData.unique[1]));
        UIUtil.setLabel(this.diamondRateLabels[2], this.showRate(StaffRatePanel.rateData.five[0]));
        UIUtil.setLabel(this.diamondRateLabels[3], this.showRate(StaffRatePanel.rateData.five[1]));
        UIUtil.setLabel(this.diamondRateLabels[4], this.showRate(StaffRatePanel.rateData.four[0]));
        UIUtil.setLabel(this.diamondRateLabels[5], this.showRate(StaffRatePanel.rateData.four[1]));
        UIUtil.setLabel(this.diamondRateLabels[6], this.showRate(StaffRatePanel.rateData.uniqueUpStaffs.sumRate + StaffRatePanel.rateData.unique[0] + StaffRatePanel.rateData.unique[1]));
        UIUtil.setLabel(this.diamondRateLabels[7], this.showRate(StaffRatePanel.rateData.uniqueUpStaffs.sumRate));
        ClientEvents.EVENT_REFRESH_FINALLY_SCROLLVIEW.emit(this.staffRateItem, StaffRatePanel.rateData.staffRateList.length, this.staffTarget);
        ClientEvents.EVENT_REFRESH_FINALLY_SCROLLVIEW.emit(this.furnitureRateItem, StaffRatePanel.rateData.furnitureList.length, this.furnitureTarget);
    }

    initRateActivityItem(rateData) {
        rateData.uniqueUpStaffs.staffs.forEach((value) => {
            let node = cc.instantiate(this.rateActivityItem);
            let staffRateItem: RateActivityItem = node.getComponent(RateActivityItem);
            staffRateItem.doRefreshItem(value);
            this.rateActivityLayout.addChild(node);
        })
    }

    private goldRate() {
        let starRate: IStarAllRate = {
            uniqueStarStaffAllRate: 0,
            uniqueStarFurnitureAllRate: 0,
            fiveStarStaffAllRate: 0,
            fiveStarFurnitureAllRate: 0,
            fourStarStaffAllRate: 0,
            fourStarFurnitureAllRate: 0,
            threeStarStaffAllRate: 0,
            threeStarFurnitureAllRate: 0,
        };
        // let existStarRate = DataMgr.getStarRate();
        // if (!existStarRate) {
        let uniqueStarChances = this.appearChances[0];
        let fiveStarChances = this.appearChances[1];
        let fourStarChances = this.appearChances[2];
        let threeStarChances = this.appearChances[3];
        let base = JsonMgr.getBase();
        let starLength: IStarLength = {
            uniqueStarStaff: 0,
            uniqueStarFurniture: 0,
            fiveStarStaff: 0,
            fiveStarFurniture: 0,
            fourStarStaff: 0,
            fourStarFurniture: 0,
            threeStarStaff: 0,
            threeStarFurniture: 0
        }
        this.getStarWeight(base);
        this.getStarStaffAndFurniture(this.uniqueStar, StaffRatePanel.uniqueStarStaff, StaffRatePanel.uniqueStarFurniture);
        this.getStarStaffAndFurniture(this.fiveStar, StaffRatePanel.fiveStarStaff, StaffRatePanel.fiveStarFurniture);
        this.getStarStaffAndFurniture(this.fourStar, StaffRatePanel.fourStarStaff, StaffRatePanel.fourStarFurniture);
        this.getStarStaffAndFurniture(this.threeStar, StaffRatePanel.threeStarStaff, StaffRatePanel.threeStarFurniture);
        starLength.uniqueStarStaff = StaffRatePanel.uniqueStarStaff.length;
        starLength.uniqueStarFurniture = StaffRatePanel.uniqueStarFurniture.length;
        starLength.fiveStarStaff = StaffRatePanel.fiveStarStaff.length;
        starLength.fiveStarFurniture = StaffRatePanel.fiveStarFurniture.length;
        starLength.fourStarStaff = StaffRatePanel.fourStarStaff.length;
        starLength.fourStarFurniture = StaffRatePanel.fourStarFurniture.length;
        starLength.threeStarStaff = StaffRatePanel.threeStarStaff.length;
        starLength.threeStarFurniture = StaffRatePanel.threeStarFurniture.length;
        DataMgr.setStarLength(starLength);
        starRate.uniqueStarStaffAllRate = this.getStaffStarRale(uniqueStarChances, this.uniqueStarAllWeight, this.uniqueStarStaffAllWeight);
        starRate.uniqueStarFurnitureAllRate = this.getFurnitureStarRale(uniqueStarChances, this.uniqueStarAllWeight, this.uniqueStarFurnitureAllWeight);
        starRate.fiveStarStaffAllRate = this.getStaffStarRale(fiveStarChances, this.fiveStarAllWeight, this.fiveStarStaffAllWeight);
        starRate.fiveStarFurnitureAllRate = this.getFurnitureStarRale(fiveStarChances, this.fiveStarAllWeight, this.fiveStarFurnitureAllWeight);
        starRate.fourStarStaffAllRate = this.getStaffStarRale(fourStarChances, this.fourStarAllWeight, this.fourStarStaffAllWeight);
        starRate.fourStarFurnitureAllRate = this.getFurnitureStarRale(fourStarChances, this.fourStarAllWeight, this.fourStarFurnitureAllWeight);
        starRate.threeStarStaffAllRate = this.getStaffStarRale(threeStarChances, this.threeStarAllWeight, this.threeStarStaffAllWeight);
        starRate.threeStarFurnitureAllRate = this.getFurnitureStarRale(threeStarChances, this.threeStarAllWeight, this.threeStarFurnitureAllWeight);
        DataMgr.setStarRate(starRate);
        // } else {
        //     starRate = existStarRate;
        // }
        UIUtil.setLabel(this.goldRateLabels[0], this.showGoldRate(starRate.uniqueStarStaffAllRate));
        UIUtil.setLabel(this.goldRateLabels[1], this.showGoldRate(starRate.uniqueStarFurnitureAllRate));
        UIUtil.setLabel(this.goldRateLabels[2], this.showGoldRate(starRate.fiveStarStaffAllRate));
        UIUtil.setLabel(this.goldRateLabels[3], this.showGoldRate(starRate.fiveStarFurnitureAllRate));
        UIUtil.setLabel(this.goldRateLabels[4], this.showGoldRate(starRate.fourStarStaffAllRate));
        UIUtil.setLabel(this.goldRateLabels[5], this.showGoldRate(starRate.fourStarFurnitureAllRate));
        UIUtil.setLabel(this.goldRateLabels[6], this.showGoldRate(starRate.threeStarStaffAllRate));
        UIUtil.setLabel(this.goldRateLabels[7], this.showGoldRate(starRate.threeStarFurnitureAllRate));
        UIUtil.setLabel(this.goldRateLabels[8], this.showGoldRate(starRate.uniqueStarStaffAllRate + starRate.uniqueStarFurnitureAllRate));
    }

    getStarWeight(base) {
        let weights_0 = 0;
        let staffWeights_0 = 0;
        let furnitureWeights_0 = 0;
        let weights_1 = 0;
        let staffWeights_1 = 0;
        let furnitureWeights_1 = 0;
        let weights_2 = 0;
        let staffWeights_2 = 0;
        let furnitureWeights_2 = 0;
        let weights_3 = 0;
        let staffWeights_3 = 0;
        let furnitureWeights_3 = 0;
        let staffLength: Base[] = [];
        let FurnitureLength: Base[] = [];
        for (let i in base) {
            switch (base[i].baseId) {
                case StaffRatePanel.golds[0]:
                    weights_0 = weights_0 + base[i].weight;
                    this.uniqueStar.push(base[i].propId);
                    if (base[i].propId < 2000000) {
                        staffWeights_0 = staffWeights_0 + base[i].weight;
                        staffLength.push(base[i]);
                    } else {
                        furnitureWeights_0 = furnitureWeights_0 + base[i].weight;
                        FurnitureLength.push(base[i]);
                    }
                    break;
                case StaffRatePanel.golds[1]:
                    weights_1 = weights_1 + base[i].weight;
                    this.fiveStar.push(base[i].propId);
                    if (base[i].propId < 2000000) {
                        staffWeights_1 = staffWeights_1 + base[i].weight;
                    } else {
                        furnitureWeights_1 = furnitureWeights_1 + base[i].weight;
                        FurnitureLength.push(base[i]);
                    }
                    break;
                case StaffRatePanel.golds[2]:
                    weights_2 = weights_2 + base[i].weight;
                    this.fourStar.push(base[i].propId);
                    if (base[i].propId < 2000000) {
                        staffWeights_2 = staffWeights_2 + base[i].weight;
                    } else {
                        furnitureWeights_2 = furnitureWeights_2 + base[i].weight;
                        FurnitureLength.push(base[i]);
                    }
                    break;
                case StaffRatePanel.golds[3]:
                    weights_3 = weights_3 + base[i].weight;
                    this.threeStar.push(base[i].propId);
                    if (base[i].propId < 2000000) {
                        staffWeights_3 = staffWeights_3 + base[i].weight;
                    } else {
                        furnitureWeights_3 = furnitureWeights_3 + base[i].weight;
                        FurnitureLength.push(base[i]);
                    }
                    break;
            }
        }
        StaffRatePanel.staffLength = staffLength;
        StaffRatePanel.FurnitureLength = FurnitureLength;
        this.uniqueStarAllWeight = weights_0;
        this.uniqueStarStaffAllWeight = staffWeights_0;
        this.uniqueStarFurnitureAllWeight = furnitureWeights_0;
        this.fiveStarAllWeight = weights_1;
        this.fiveStarStaffAllWeight = staffWeights_1;
        this.fiveStarFurnitureAllWeight = furnitureWeights_1;
        this.fourStarAllWeight = weights_2;
        this.fourStarStaffAllWeight = staffWeights_2;
        this.fourStarFurnitureAllWeight = furnitureWeights_2;
        this.threeStarAllWeight = weights_3;
        this.threeStarStaffAllWeight = staffWeights_3;
        this.threeStarFurnitureAllWeight = furnitureWeights_3;
    }


    private getStaffStarRale(StarChances, weights, staffWeights): number {
        return Number(StarChances) * (staffWeights / weights);
    }

    private getFurnitureStarRale(StarChances, weights, furnitureWeights): number {
        return Number(StarChances) * (furnitureWeights / weights);
    }

    private getStarStaffAndFurniture(Star: Array<number>, Staffs: Array<number>, Furniture: Array<number>) {
        for (let i of Star) {
            if (i >= 1000 && i < 20000) {
                Staffs.push(i);
            }
            if (i >= 2000000 && i <= 3000000) {
                Furniture.push(i);
            }
        }
    }

    showStockUpImg(rateData) {
        for (let i of rateData.uniqueUpStaffs.staffs) {
            if (i.stockUp) {
                this.upImg.node.active = true;
            }
        }
    }

    private showGoldRate(rate) {
        return parseFloat(rate).toFixed(2) + "%";
    }

    private showRate(rate) {
        return parseFloat(rate).toFixed(2) + "%";
    }

    private onGoldTagBtnClick = () => {
        DotInst.clientSendDot(COUNTERTYPE.recruit, "8003");
        this.diamondatag.forEach((node) => {
            node.active = false;
        })
        this.goldtag.forEach((node) => {
                node.active = true;
            }
        )
        this.showGoldTag();
    };
    private onStaffDropDown = () => {
        if (this.staffDropDownBtn.node.angle == 0) {
            this.staffDropDownBtn.node.angle = -90;
            UIUtil.showNode(this.staffLayout);
        } else {
            DotInst.clientSendDot(COUNTERTYPE.recruit, "8014")
            this.staffDropDownBtn.node.angle = 0;
            UIUtil.hideNode(this.staffLayout);
        }
    }
    private onfurnitureDropDown = () => {
        if (this.furnitureDropDownBtn.node.angle == 0) {
            this.furnitureDropDownBtn.node.angle = -90;
            UIUtil.showNode(this.furnitureLayout);
        } else {
            DotInst.clientSendDot(COUNTERTYPE.recruit, "8015")
            this.furnitureDropDownBtn.node.angle = 0;
            UIUtil.hideNode(this.furnitureLayout);
        }
    }
    private onGoldStaffDropDown = () => {
        if (this.goldStaffDropDownBtn.node.angle == 0) {
            this.goldStaffDropDownBtn.node.angle = -90;
            UIUtil.showNode(this.goldStaffLayout);
        } else {
            DotInst.clientSendDot(COUNTERTYPE.recruit, "8016")
            this.goldStaffDropDownBtn.node.angle = 0
            UIUtil.hideNode(this.goldStaffLayout);
        }
    }
    private onGoldFurnitureDropDown = () => {
        if (this.goldFurnitureDropDownBtn.node.angle == 0) {
            this.goldFurnitureDropDownBtn.node.angle = -90;
            UIUtil.showNode(this.goldFurnitureLayout);
        } else {
            DotInst.clientSendDot(COUNTERTYPE.recruit, "8017")
            this.goldFurnitureDropDownBtn.node.angle = 0;
            UIUtil.hideNode(this.goldFurnitureLayout);
        }
    }


    private showGoldTag() {
        UIUtil.showNode(this.goldTagNode);
        UIUtil.hideNode(this.diamondTagNode);
        if (this.showGoldRateView && StaffRatePanel.rateData) {
            this.goldRate();
            ClientEvents.EVENT_REFRESH_FINALLY_SCROLLVIEW.emit(this.goldStaffRateItem, StaffRatePanel.staffLength.length + 2, this.goldStaffTarget);
            ClientEvents.EVENT_REFRESH_FINALLY_SCROLLVIEW.emit(this.goldFurnitureRateItem, StaffRatePanel.FurnitureLength.length + 2, this.goldFurnitureTarget);
            this.showGoldRateView = false;
        }
    }


    private onDiamondTagBtnClick = () => {
        DotInst.clientSendDot(COUNTERTYPE.recruit, "8004");
        this.diamondatag.forEach((node) => {
            node.active = true;
        })
        this.goldtag.forEach((node) => {
                node.active = false;
            }
        )
        UIUtil.hideNode(this.goldTagNode);
        UIUtil.showNode(this.diamondTagNode);
    };
    private onBackBtnClick = () => {
        StaffRatePanel.uniqueStarStaff = [];
        StaffRatePanel.uniqueStarFurniture = [];
        StaffRatePanel.fiveStarStaff = [];
        StaffRatePanel.fiveStarFurniture = [];
        StaffRatePanel.fourStarStaff = [];
        StaffRatePanel.fourStarFurniture = [];
        StaffRatePanel.threeStarStaff = [];
        StaffRatePanel.threeStarFurniture = [];
        this.onDestroy();
        UIMgr.closeView(StaffRatePanel.url, true);
    };

    onDestroy() {
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(true);
        this.showGoldRateView = true;
        super.onDestroy();
    }
}


export interface Chance {
    id: number;
    chance: number;
    stockUp: boolean;
}

