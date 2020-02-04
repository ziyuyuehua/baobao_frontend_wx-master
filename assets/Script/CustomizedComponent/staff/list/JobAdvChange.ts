import {UIUtil} from "../../../Utils/UIUtil";
import {ResManager, ResMgr} from "../../../global/manager/ResManager";
import {StaffAdvantage} from "../../../Model/StaffData";

const {ccclass, property} = cc._decorator;

@ccclass
export class JobAdvChange extends cc.Component {

    @property(cc.Sprite)
    private advImg: cc.Sprite = null;

    @property(cc.Sprite)
    private changeImg: cc.Sprite = null;

    @property(cc.Label)
    private changeLab: cc.Label = null;

    initView(staffAdv: StaffAdvantage, changeVal: number){
        let isAdd: boolean = changeVal > 0;
        UIUtil.asyncSetImage(this.advImg, ResManager.STAFF_UI+"adv_max"+staffAdv);
        UIUtil.asyncSetImage(this.changeImg, ResManager.STAFF_UI+(isAdd ? "job_up_up" : "job_up_down"));
        UIUtil.setLabel(this.changeLab, changeVal+"%", null, isAdd);
    }

}
