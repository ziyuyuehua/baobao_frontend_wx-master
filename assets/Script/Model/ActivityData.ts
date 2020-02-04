/**
 * User: cJian
 * Date: 2019/8/15 4:48 PM
 * Note: ...
 */
import {IActivity, IActivityItem} from "../types/Response";
import {AssistState} from "../global/const/IncidentConst";

export class ActivityData {
    private assistAct:IActivityItem = null ;
    fill(activity:IActivity) {

    }
    initAssistAct(assist:IActivityItem) {
        this.assistAct = assist ;
    }
    getAssistAct() {
        return this.assistAct ;
    }
    getAssistIsOpen() {
        if(this.assistAct == null) {
            cc.log('没有数据，未开启');
            return false ;
        }
        if(this.assistAct.state == AssistState.nascent || this.assistAct.state == AssistState.create) {
            return false ;
        }
        return true;
    }
}
