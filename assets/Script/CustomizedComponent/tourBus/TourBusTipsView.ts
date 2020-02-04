import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {TourBusModel} from "../../Model/tourBus/TourBusModel";
import {UIUtil} from "../../Utils/UIUtil";
import {DataMgr} from "../../Model/DataManager";
import {TimeUtil} from "../../Utils/TimeUtil";
import {IncidentModel} from "../../Model/incident/IncidentModel";
import {TourBusView} from "./TourBusView";

const {ccclass, property} = cc._decorator;

@ccclass
export class TourBusTipsView extends GameComponent {

    static url = "tourBus/TourBusTipsView";

    @property(cc.Node)
    private block: cc.Node = null;
    @property(cc.Button)
    private backBtn: cc.Button = null;

    @property(cc.Label)
    private lastTimeLab: cc.Label = null;
    @property(cc.Label)
    private firstTimeLab: cc.Label = null;
    @property(cc.Label)
    private saleDownLab: cc.Label = null;

    @property(cc.Node)
    private notTourNode: cc.Node = null;
    @property(cc.Node)
    private hasTourNode: cc.Node = null;

    private interval = null;

    private tourBusView: TourBusView = null;

    getBaseUrl(){
        return TourBusTipsView.url;
    }

    onLoad(){
        ButtonMgr.addClick(this.block, this.closeHandler);
        ButtonMgr.addClick(this.backBtn.node, this.closeHandler);

        this.tourBusView = <TourBusView>this.node["data"];
    }

    private closeHandler = () => {
        this.closeOnly();
        this.tourBusView.refreshLabel();
    };

    onEnable(){
        this.onShowPlay(2, this.node.getChildByName("view"));
        this.refreshView();
    }

    onDisable(){
        this.checkClearInterval();
    }

    private refreshView = () => {
        const model: TourBusModel = this.getCurTourBusModel();
        this.refreshLabel(model);
        this.addInterval(model);
    };

    private getCurTourBusModel(): TourBusModel{
        return DataMgr.tourBusData.getCurTourBusModel();
    }

    private refreshLabel(model: TourBusModel){
        let receptionNum = model.getReceptionNum();
        let hasReception = receptionNum > 0;
        if(hasReception){
            UIUtil.setLabel(this.lastTimeLab, TimeUtil.getLeftTimeStr(model.getLastLeftTime()));

            let receptionNum = model.getReceptionNum();
            let moreReception: boolean = receptionNum > 1;
            if(moreReception){
                UIUtil.setLabel(this.firstTimeLab, TimeUtil.getLeftTimeStr(model.getFirstLeftTime()));
                UIUtil.setLabel(this.saleDownLab, model.getSaleDown());
            }
            UIUtil.visibleNode(this.firstTimeLab.node.parent, moreReception);
        }

        UIUtil.visibleNode(this.hasTourNode, hasReception);
        UIUtil.visibleNode(this.notTourNode, !hasReception);
    }

    private addInterval(model: TourBusModel){
        this.refreshLeftTime(model);
        if (model.hasLeftTime()) {
            this.checkClearInterval();
            this.interval = setInterval(this.refreshLeftTime, 500);
        }
    }

    private refreshLeftTime = (busModel: TourBusModel = null) => {
        let model = busModel ? busModel : this.getCurTourBusModel();

        let lastLeftTime = model.getLastLeftTime();
        if(lastLeftTime > 0){
            UIUtil.setLabel(this.lastTimeLab, TimeUtil.getLeftTimeStr(lastLeftTime));
        }else if(lastLeftTime != -1 && model.canRefreshLast){
            model.updateReceptionTime();
            model.canRefreshLast = false;

            this.refreshLabel(this.getCurTourBusModel());
        }

        let firstLeftTime = model.getFirstLeftTime();
        if(firstLeftTime > 0){
            UIUtil.setLabel(this.firstTimeLab, TimeUtil.getLeftTimeStr(firstLeftTime));
        }else if(firstLeftTime != -1 && model.canRefreshFirst){
            model.updateReceptionTime();
            model.canRefreshFirst = false;

            this.refreshLabel(this.getCurTourBusModel());
        }
    };

    private checkClearInterval() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

}
