import {Direction, Role, RoleType, State} from "../Role";
import {CommonUtil} from "../../../Utils/CommonUtil";
import {Customer, EXPRESSION} from "./Customer";
import {ROAD_CORNER} from "../../../global/const/StringConst";
import {Pos} from "../MapInfo";
import {CustomerHelper} from "./CustomerHelper";
import {DataMgr} from "../../../Model/DataManager";

/**
 * @Author whg
 * @Date 2019/4/2
 * @Desc 揽客员
 * 随机在店门口范围内抬着牌跑动（lanke1），到达地点后摇牌揽客(lanke2)随机N秒，不断重复
 * 暂时先不考虑和路人的交互
 */

const {ccclass, property} = cc._decorator;

const DEBUG: boolean = false;

@ccclass
export class Touter extends Role {

    static PREFIX: string = "touter";

    @property(cc.Sprite)
    private bubbleBack: cc.Sprite = null;

    @property(cc.Sprite)
    private bubble: cc.Sprite = null; //招揽气泡

    private toutingCustomer: Customer = null;

    private debugColor: cc.Color = null;

    getRoleType(): RoleType {
        return RoleType.TOUTER;
    }

    getPrefix(): string {
        return Touter.PREFIX;
    }

    protected doOnComplete() {
        this.bubbleBack.node.active = false;
        this.changeState(State.IDLE);
    }

    updatePos(dt) {
        if (!this.spine) {
            return;
        }
        this.stateTime += dt;

        switch (this.state) {
            case State.IDLE:
                this.doIdleAndCash();
                break;
            case State.TOUT2:
                this.happy();
                this.tout();
                break;
            case State.WALK:
            case State.RUN:
            case State.TOUT1:
                this.smile();
                this.move(dt);
                break;
        }
    }

    private doIdleAndCash() {
        //被揽客员锁定后禁止移动，禁止状态改变
        if (!this.isInToutingFunc()) {
            this.smile();
            this.tout();
        } else {
            if (this.enableToutFunc) {
                this.enableToutFunc();
                this.enableToutFunc = null;
            }
        }
    }

    private nextRandomPos(curMapPos: cc.Vec2): cc.Vec2 {
        return this.mapInfo.touterRandomPos(curMapPos);
    }

    private runToutAnimation(completeFunc: () => void) {
        let maxCount = CommonUtil.getRangeCloseNum(3, 4);
        this.spine.setAnimation(0, Role.ACTIONS[State.TOUT2], true);
        let loopCount = 0;
        this.spine.setCompleteListener(() => {
            loopCount++;
            if (loopCount >= maxCount) {
                this.spine.setCompleteListener(null);
                this.spine.setAnimation(0, Role.ACTIONS[State.IDLE], true);
                completeFunc();
            }
        });
    }

    private isRoadCorner(pos: Pos): boolean {
        return pos.x == ROAD_CORNER.X && pos.y == ROAD_CORNER.Y;
    }

    tout() {
        this.moving = false;
        if (this.timeout < 0) {
            this.timeout = CommonUtil.randomByPercent(70) ? 0 : CommonUtil.getRangeCloseNum(0, 3);
        }

        //在CASH状态下就不要招揽了，即模拟每次只能招揽一个顾客
        if ((this.in(State.IDLE) || this.in(State.TOUT2)) && !this.isInToutingFunc() && !this.toutingCustomer) {
            let customer = this.mapPeople.getAroundCustomer();
            if (customer) {
                this.toutingCustomer = customer;
                if (DEBUG) {
                    let r = CommonUtil.getRangeCloseNum(1, 255);
                    let g = CommonUtil.getRangeCloseNum(1, 255);
                    let b = CommonUtil.getRangeCloseNum(1, 255);
                    this.debugColor = cc.color(r, g, b);
                    this.toutingCustomer.spine.node.color = this.debugColor;
                }
                customer.requestIntoTouting(() => {
                    let touterMapPos = customer.curMapPos().clone();
                    if (this.isRoadCorner(touterMapPos)) {
                        if (customer.direction == Direction.LEFT) {
                            touterMapPos.x--;
                        } else {
                            touterMapPos.y--;
                        }
                    } else if (touterMapPos.x >= 24 && touterMapPos.y <= 25) {
                        if (customer.direction == Direction.LEFT) {
                            touterMapPos.y++;
                        } else {
                            touterMapPos.y--;
                        }
                    } else {
                        if (customer.direction == Direction.LEFT) {
                            touterMapPos.x--;
                        } else {
                            touterMapPos.x++;
                        }
                    }
                    if (DEBUG) this.spine.node.color = this.debugColor;
                    if (this.curMapPos().equals(touterMapPos)) {
                        this.state = State.IDLE;
                    } else {
                        this.changeState(State.RUN, touterMapPos, State.IDLE);
                    }
                    this.requestIntoTouting(() => {
                        this.turn(customer.direction == Direction.LEFT ? Direction.RIGHT : Direction.LEFT);
                        this.startTouting(); //开始和顾客交涉
                    });
                });
            }
        }

        if (this.isInToutingFunc()) {
            return;
        }

        if (this.stateTime < this.timeout) {
            return;
        }
        this.timeout = CommonUtil.getRangeCloseNum(2, 3);

        let toutPos: cc.Vec2 = this.nextRandomPos(this.curMapPos());
        let rate: number = CommonUtil.getRandomNum(10);
        if (rate < 3) {
            this.changeState(State.WALK, toutPos, State.IDLE);
        } else if (rate >= 3 && rate <= 5) {
            this.changeState(State.WALK, toutPos, State.TOUT2);
        } else {
            this.changeState(DataMgr.isLowPhone() ? State.WALK : State.TOUT1, toutPos, State.TOUT2);
        }
    }

    protected doReset() {
        this.unscheduleAllCallbacks();
        this.toutingCustomer = null;
    }

    private startTouting() {
        this.setEnableTouch(false);
        this.runToutAnimation(this.persuade);
    }

    private toutResultSucceed() {
        const customer = <Customer>this.toutingCustomer;
        customer.requestExitTouting();
        customer.setInMarket(true);
        customer.showExpressionBubble(EXPRESSION.XiYue);
        if (DEBUG) this.toutingCustomer.spine.node.color = cc.Color.WHITE;
        this.toutingCustomer = null;
        this.requestExitTouting();
        if (DEBUG) this.spine.node.color = cc.Color.WHITE;
    }

    private toutResultFailed() {
        this.toutingCustomer.requestExitTouting();
        this.toutingCustomer.showExpressionBubble(EXPRESSION.ShengQi);
        this.toutingCustomer.goHome();
        if (DEBUG) this.toutingCustomer.spine.node.color = cc.Color.WHITE;
        this.toutingCustomer = null;
        this.requestExitTouting();
        if (DEBUG) this.spine.node.color = cc.Color.WHITE;
    }

    private persuade = () => {
        this.setEnableTouch(true);
        let role = this.toutingCustomer;
        if (role.isRoleType(RoleType.CUSTOMER)) {
            const customer = <Customer>role;
            customer.incrInteractive();

            //若店内已达到当前最大顾客人数，则揽客100%失败，若店内判断需要转化闲逛顾客，则揽客100%成功
            let success = this.mapPeople.inMarketCustomerSize() < CustomerHelper.getInsideMaxNum();
            if (success) {
                this.happy();
                this.toutResultSucceed();
            } else {
                this.sad();
                this.toutResultFailed();
            }
        } else if (role.isRoleType(RoleType.TESTROLE)) {
            // (<TestRole>role).sayHi();
            this.toutResultFailed();
        } else {
            this.toutResultFailed();
        }
    };

    setEnableTouch(enable: boolean) {
        super.setEnableTouch(enable);
        if (this.toutingCustomer) {
            this.toutingCustomer.setEnableTouch(enable);
        }
    }
}
