import {UIUtil} from "../../../Utils/UIUtil";
import {GameComponent} from "../../../core/component/GameComponent";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {Base, JsonMgr} from "../../../global/manager/JsonManager";
import {DataMgr} from "../../../Model/DataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class MustRatePanel extends GameComponent {

    @property(cc.Node)
    private staffTagNode: cc.Node = null;
    @property(cc.Node)
    private furnitureTagNode: cc.Node = null;
    @property(cc.Button)
    private goldTagBtn: cc.Button = null;
    @property(cc.Button)
    private diamondTagBtn: cc.Button = null;

    @property(cc.Button)
    private backBtn: cc.Button = null;

    @property(cc.Prefab)
    private staffRateItem: cc.Prefab = null;
    @property(cc.Prefab)
    private furnitureRateItem: cc.Prefab = null;

    @property(cc.String)
    private staffTarget = "";
    @property(cc.String)
    private furnitureTarget = "";
    static url: string = "staff/recruit/mustRatePanel";

    @property([cc.Node])
    private staffTtag: Array<cc.Node> = [];

    @property([cc.Node])
    private furnituretag: Array<cc.Node> = [];
    @property(cc.Label)
    private addstaff: cc.Label = null;
    @property(cc.Label)
    private addfurniture: cc.Label = null;


    staffBase: Base[] = [];
    furnitureBase: Base[] = [];

    private showfurnitureBaseRateView: boolean = true;

    getBaseUrl() {
        return MustRatePanel.url;
    }

    onLoad() {
        this.getBase();
        this.goldTagBtn.node.on("click", this.onStaffTagBtnClick);
        this.diamondTagBtn.node.on("click", this.onFurnitureTagBtnClick);
        this.backBtn.node.on("click", this.closeView);
    }

    start() {
        this.showStaffTag();
        this.onStaffTagBtnClick();
    }

    getBase() {
        let mustRecruitBase: string = JsonMgr.getConstVal("mustRecruitBase");
        let mustbase = mustRecruitBase.split(",");
        let base = JsonMgr.getBase();
        let staffBaseId = Number(mustbase[0]);
        let furnitureBaseId = Number(mustbase[1]);
        for (let i in base) {
            switch (base[i].baseId) {
                case staffBaseId:
                    this.staffBase.push(base[i]);
                    break;
                case  furnitureBaseId:
                    this.furnitureBase.push(base[i]);
                    break;
            }
        }
        DataMgr.setStaffMustBaseDate(this.staffBase);
        DataMgr.setFurnitureMustBaseData(this.furnitureBase);
    }
    private onStaffTagBtnClick = () => {
        this.staffTtag.forEach((node) => {
            node.active = true;
        })
        this.furnituretag.forEach((node) => {
                node.active = false;
            }
        )
        UIUtil.showNode(this.staffTagNode);
        UIUtil.hideNode(this.furnitureTagNode);
    };

    private showStaffTag() {
        let AddStaff: string = JsonMgr.getConstVal("mustRecruitAddStaff");
        if (AddStaff == "null") {
            this.addstaff.node.active = false;
        } else {
            this.addstaff.string = "必得新增以下员工：" + AddStaff;
        }
        ClientEvents.EVENT_REFRESH_FINALLY_SCROLLVIEW.emit(this.staffRateItem, this.staffBase.length, this.staffTarget);
    }

    private showfurnitureTag() {
        this.staffTtag.forEach((node) => {
            node.active = false;
        })
        this.furnituretag.forEach((node) => {
                node.active = true;
            }
        )
        UIUtil.hideNode(this.staffTagNode);
        UIUtil.showNode(this.furnitureTagNode);
        if (this.showfurnitureBaseRateView) {
            let Addfurniture: string = JsonMgr.getConstVal("mustRecruitAddDeco");
            if (Addfurniture == "null") {
                this.addfurniture.node.active = false;
            } else {
                this.addfurniture.string = "必得新增以下家具：" + Addfurniture;
            }
            ClientEvents.EVENT_REFRESH_FINALLY_SCROLLVIEW.emit(this.furnitureRateItem, this.furnitureBase.length, this.furnitureTarget);
            this.showfurnitureBaseRateView = false;
        }
    }

    private onFurnitureTagBtnClick = () => {
        this.showfurnitureTag();
    };

}


export interface Chance {
    id: number;
    chance: number;
    stockUp: boolean;
}

