import {IReceptionHistory} from "../../types/Response";
import {UIUtil} from "../../Utils/UIUtil";
import {StringUtil} from "../../Utils/StringUtil";
import {TimeUtil} from "../../Utils/TimeUtil";
import {DataMgr} from "../../Model/DataManager";
import {TextTipConst} from "../../global/const/TextTipConst";
import {JsonMgr} from "../../global/manager/JsonManager";

const {ccclass, property} = cc._decorator;

@ccclass
export class TourBusItem extends cc.Component {

    @property(cc.Label)
    timeLab: cc.Label = null;

    @property(cc.Label)
    contentLab: cc.Label = null;

    initItem(history: IReceptionHistory){
        UIUtil.setLabel(this.timeLab, TimeUtil.getBeforeTimeStr(DataMgr.getServerTime()-history.receptionTime));
        UIUtil.setLabel(this.contentLab, this.content(history));
    }

    private content(history: IReceptionHistory): string{
        return StringUtil.format(JsonMgr.getTips(TextTipConst.BUS_HELP_HISTORY), history.receptionUserNickname,
            history.receptionTravellerNum, history.lossTravellerNum)
    }

}
