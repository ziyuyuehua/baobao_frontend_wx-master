import {ICommonRewardInfo} from "../../types/Response";
import {JsonMgr} from "../../global/manager/JsonManager";
import {GameComponent} from "../../core/component/GameComponent";
import {DataMgr} from "../../Model/DataManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";

const {ccclass, property} = cc._decorator;

@ccclass
export default class IncentiveTips extends GameComponent {
    static url = "incentiveCountdown/incentiveTips";

    getBaseUrl() {
        return IncentiveTips.url;
    }


    @property([cc.Label])
    private iconLab: cc.Label[] = [];
    @property(cc.Label)
    private descLab: cc.Label = null;
    @property(cc.Node)
    private animNode: cc.Node = null;

    onLoad() {
        let data: ICommonRewardInfo[] = this.node["data"];
        let type = 1;
        for (let i = 0; i < data.length; i++) {
            let idx = 0;
            if (data[i].xmlId !== -1) {
                switch (data[i].xmlId) {
                    case  -3:
                        idx = 0;
                        type = 2;
                        break;
                    case  -2:
                        idx = 1;
                        break;
                    case  100101:
                        idx = 2;
                        break;
                    default:
                        cc.log("面板中不存在此id位置" + data[i].xmlId);
                }
                this.iconLab[idx].string = data[i].num + "";
                this.iconLab[idx].node.parent.active = true;
            }
        }
        this.descLab.string =  JsonMgr.getInspireInfo(type).replace("\\n","\n");
        let anim = cc.sequence(cc.scaleTo(.2, 1.3).easing(cc.easeBackOut()), cc.scaleTo(1, 1.3), cc.scaleTo(.1, 1), cc.callFunc(() => {
            if (DataMgr.checkInPowerGuide()) {
                ClientEvents.UP_POWER_GUIDE.emit(8);
            }
            this.closeOnly();
        }));
        this.animNode.runAction(anim);
    }
}
