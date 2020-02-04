import {UIUtil} from "../../../Utils/UIUtil";
import {JobAdvChange} from "./JobAdvChange";
import {GameComponent} from "../../../core/component/GameComponent";
import {StaffAdvantage} from "../../../Model/StaffData";

const {ccclass, property} = cc._decorator;

@ccclass
export class JobUpView extends GameComponent {

    static url = "staff/list/JobUpView";

    @property(cc.Label)
    private numLab: cc.Label = null;

    @property(cc.Prefab)
    private jobAdvChangePre: cc.Prefab = null;

    @property(cc.Node)
    private advAddList: cc.Node = null;

    initView (saleAdd: number, advIncrMap: Map<StaffAdvantage, number>) {
        let isAdd: boolean = saleAdd > 0;
        UIUtil.visibleNode(this.numLab.node.parent, isAdd);
        if(isAdd){
            UIUtil.setLabel(this.numLab, Math.round(saleAdd));
        }

        this.advAddList.removeAllChildren();
        advIncrMap.forEach((value: number, staffAdv: StaffAdvantage) => {
            let jobAdvChanger: JobAdvChange = cc.instantiate(this.jobAdvChangePre).getComponent(JobAdvChange);
            jobAdvChanger.initView(staffAdv, Math.round(value * 100));
            jobAdvChanger.node.y = -50;
            this.advAddList.addChild(jobAdvChanger.node);
        });
    }

    getBaseUrl(): string{
        return JobUpView.url;
    }

}
