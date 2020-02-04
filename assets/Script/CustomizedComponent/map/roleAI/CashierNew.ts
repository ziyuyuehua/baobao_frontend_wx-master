import {Role, RoleType, State} from "../Role";
import {CommonUtil} from "../../../Utils/CommonUtil";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {ACTOR_LINES_TYPE} from "./ActorLinesHelper";
import {DataMgr} from "../../../Model/DataManager";
import {UIMgr} from "../../../global/manager/UIManager";
import {UIUtil} from "../../../Utils/UIUtil";

/**
 * @Author whg
 * @Date 2019/6/15
 * @Desc 收银员
 */

const {ccclass, property} = cc._decorator;

const CASH_CD_TIME = 5; //每当有顾客进门时，所有收银员会鞠躬，内置5秒冷却，冷却时间内进入店铺的顾客不会触发欢迎动作

@ccclass
export class CashierNew extends Role {

    static PREFIX: string = "cashier";

    private isInCashCdTime: boolean = false;

    onLoad() {
        super.onLoad();
        this.dispose.add(ClientEvents.MAP_CUSTOMER_GO_CASH.on(this.doCash));
        // this.smokeAnim.on("stop", () => {
        //     this.nameLabel.node.parent.active = true;
        //     this.spine.node.active = true;
        //     this.smokeAnim.node.active = false;
        //
        //     this.showActorLines(ACTOR_LINES_TYPE.POWER_GUIDE_CASHIER_UP_WORK);
        //     this.scheduleOnce(() => {
        //         ClientEvents.REFRESH_POWER_GUIDE.emit();
        //         UIMgr.hideMask();
        //     }, 1);
        // });
    }

    protected doOnComplete() {
        this.changeState(State.IDLE);
        // if (DataMgr.getGuideCount() == 1) {
        //     this.playUpWork();
        // }
    }

    getRoleType(): RoleType {
        return RoleType.CASHIER;
    }

    getPrefix(): string {
        return CashierNew.PREFIX;
    }

    updatePos(dt) {
        if (!this.spine) {
            return;
        }
        this.stateTime += dt;
        //cc.log(this.staff.staffId, "stateTime", this.stateTime);

        switch (this.state) {
            case State.IDLE:
                this.stateTime = 0;
                break;
            case State.CASH:
                this.cash();
                break;
        }
    }

    doCash = () => {
        if (this.isInCashCdTime) return;
        this.isInCashCdTime = true;

        // if (DataMgr.getGuideCount() == 3) {
        //     this.showActorLines(ACTOR_LINES_TYPE.POWER_GUIDE_CASHIER_SAY_THANKS);
        // }

        this.doChangeState(State.CASH);
        if (CommonUtil.randomBoolean()) {
            this.smile();
        } else {
            this.happy();
        }

        this.scheduleOnce(() => {
            this.isInCashCdTime = false;
        }, CASH_CD_TIME);
    };

    cash() {
        this.timeout = 1.5;
        if (this.stateTime < this.timeout) {
            return;
        }
        this.doChangeState(State.IDLE);
    }

    protected doReset() {
        this.unscheduleAllCallbacks();
        this.isInCashCdTime = false;
    }
}
