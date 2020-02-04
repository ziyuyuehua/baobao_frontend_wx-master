import {Role, RoleType, State} from "../Role";
import {CommonUtil} from "../../../Utils/CommonUtil";
import {RoleCase, RoleCaseHelper} from "./CaseHelper";
import {MapPeople} from "../MapPeople";
import {ACTOR_LINES_TYPE, ActorLinesHelper} from "./ActorLinesHelper";

/**
 * @Author whg
 * @Date 2019/4/13
 * @Desc 售货员
 * 随机在店内随机走动（xingzou），发现周围有顾客，
 * 就跑（paodong）过去尝试与顾客交互、推销货物，推销成功顾客就会进入购买流程，不断重复
 * 暂时先不考虑和顾客的交互
 */

const {ccclass, property} = cc._decorator;

const DEBUG: boolean = false;

@ccclass
export class Saleman extends Role {

    static PREFIX: string = "saleman";

    @property(cc.Sprite)
    private bubbleBack: cc.Sprite = null;

    @property(cc.Sprite)
    private talkingBubble: cc.Sprite = null; //推销谈话气泡

    private bindingRoleCase: RoleCase = null; //是否已有绑定货架

    private standBindingRoleCaseTime: number = 0; //等待超过8-10秒后，寻找另一个无售货员站着的货架等待

    private talkingSuccess: boolean = false;

    private talkOverFunc: () => void;

    getRoleType(): RoleType {
        return RoleType.SALEMAN;
    }

    getPrefix(): string {
        return Saleman.PREFIX;
    }

    protected doOnComplete() {
        this.bubbleBack.node.active = false;
        this.changeState(State.IDLE);
    }

    protected doReset() {
        if (this.bindingRoleCase) {
            this.bindingRoleCase.bindingSaleman = null;
        }
        this.bindingRoleCase = null;
        this.unscheduleAllCallbacks();
    }

    updatePos(dt) {
        if (!this.spine) {
            return;
        }
        this.stateTime += dt;
        switch (this.state) {
            case State.IDLE:
                this.sale(dt);
                break;
            case State.WALK:
            case State.RUN:
                this.move(dt);
                break;
        }
    }

    private playTalkingAnimation() {
        this.spine.setAnimation(0, Role.ACTIONS[State.CASH], true);
    }

    private stopTalkingAnimation() {
        this.spine.setAnimation(0, Role.ACTIONS[State.IDLE], true);
    }

    startTalking(success: boolean, talkOver: () => void) {
        this.talkingSuccess = success;
        this.talkOverFunc = talkOver;
        this.setEnableTouch(false);
        this.playTalkingAnimation();
        this.scheduleOnce(this.talkingBubbleDisappear, 3);
    }

    private talkingBubbleDisappear = () => {
        this.stopTalkingAnimation();
        if (this.talkingSuccess) {
            this.smile();
        } else {
            this.sad();
        }
        this.setEnableTouch(true);
        if (this.talkOverFunc) this.talkOverFunc();
    };

    private nextRandomPos(curMapPos: cc.Vec2): cc.Vec2 {
        let pos = MapPeople.randomInMarketPos(curMapPos); //商店内随机一个坐标
        return cc.v2(pos.x, pos.y);
    }

    private setBindingRoleCase(unbindingRoleCase: RoleCase) {
        if (this.bindingRoleCase) this.bindingRoleCase.bindingSaleman = null;
        this.bindingRoleCase = unbindingRoleCase;
        this.bindingRoleCase.bindingSaleman = this;

        let curPos = this.curMapPos();
        let salemanPos = this.bindingRoleCase.bindingSalemanPos;
        if (curPos.x != salemanPos.x || curPos.y != salemanPos.y) {
            let state = CommonUtil.randomByPercent(50) ? State.RUN : State.WALK;
            this.changeState(state, salemanPos, State.IDLE, null);
        }

        this.standBindingRoleCaseTime = 0;
        if (DEBUG) {
            this.timeout = CommonUtil.getRangeCloseNum(2, 3);
        } else {
            this.timeout = CommonUtil.getRangeCloseNum(8, 10);
        }
    }

    private sale(dt) {
        this.moving = false;
        if (!this.bindingRoleCase) {
            let unbindingRoleCase = RoleCaseHelper.getUnbindingSalemanRoleCase();
            if (unbindingRoleCase) {
                this.setBindingRoleCase(unbindingRoleCase);
                return;
            }
        } else {
            if (this.in(State.IDLE)) { //已在货架旁站立
                this.turn(this.bindingRoleCase.bindingSalemanDirection);
            }

            // 如有咨询的顾客取消下面记时走动
            if (this.bindingRoleCase.bindingCustomer) {
                return;
            }

            // 等待超过8-10秒后，寻找另一个无售货员站着的货架等待
            this.standBindingRoleCaseTime += dt;
            if (this.standBindingRoleCaseTime >= this.timeout) {
                this.standBindingRoleCaseTime = 0;
                let unbindingRoleCase = RoleCaseHelper.getUnbindingSalemanRoleCase();
                if (unbindingRoleCase) {
                    this.setBindingRoleCase(unbindingRoleCase);
                }
            }
            return;
        }

        if (this.timeout < 0) {
            this.timeout = CommonUtil.randomByPercent(70) ? 0 : CommonUtil.getRangeCloseNum(0, 3);
        }

        if (this.stateTime < this.timeout) {
            return;
        }

        this.timeout = 3;

        let shopPos: cc.Vec2 = this.nextRandomPos(this.curMapPos());
        this.changeState(State.WALK, shopPos, State.IDLE);
    }

    setEnableTouch(enable: boolean) {
        super.setEnableTouch(enable);
        if (this.bindingRoleCase && this.bindingRoleCase.bindingCustomer) {
            this.bindingRoleCase.bindingCustomer.setEnableTouch(enable);
        }
    }
}
