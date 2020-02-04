import {Direction, Role, RoleType, State} from "../Role";
import {CommonUtil} from "../../../Utils/CommonUtil";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {Cashier, CashierHelper, RoleCase, RoleCaseHelper} from "./CaseHelper";
import {Pos} from "../MapInfo";
import {
    addCurBubbleAwardCount,
    checkBubbleAwardOverMax,
    CustomerHelper, getBubbleAwardItemId, getFaceEnumByName,
    isThisMapPosInMarket
} from "./CustomerHelper";
import {ResMgr} from "../../../global/manager/ResManager";
import {ButtonMgr} from "../../common/ButtonClick";
import {HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import {MapPeople} from "../MapPeople";
import {ACTOR_LINES_TYPE, ActorLinesHelper} from "./ActorLinesHelper";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";
import {CacheMap} from "../../MapShow/CacheMapDataManager";
import {UIMgr} from "../../../global/manager/UIManager";
import {DataMgr} from "../../../Model/DataManager";

/**
 * @Author whg
 * @Date 2019/4/13
 * @Desc 顾客
 * 从起点走到终点然后消失（如有必要做淡出效果），之后需要加入转变为顾客的概率，以及其他一些有趣的行为
 */

const {ccclass, property} = cc._decorator;


export enum EXPRESSION {
    XiYue = "xiyue",
    ShengQi = "shengqi",
    WeiXiao = "weixiao",
    JuSang = "jusang",
    JingYa = "jingya",
}

const showName: boolean = false;

const MAX_EXPRESSION_BUBBLE_COUNT: number = 3; //场景内最多可积累3个表情气泡

@ccclass
export class Customer extends Role {

    static PREFIX: string = "customer";

    static curExpreesionBubbleCount: number = 0;

    @property(cc.Sprite)
    private bubbleBack: cc.Sprite = null;

    @property(cc.Sprite)
    private expressionBubble: cc.Sprite = null;

    private inMarket: boolean; //是否在超市内

    private bindingRoleCase: RoleCase = null; //是否已有绑定货架

    private isStayTheCase: boolean = false; //是否已停留在货架前挑选货物

    private buySuccess: boolean = false;

    private isCashing: boolean = false;

    private isGoingToCash: boolean = false;

    private isGoingHome: boolean = false;

    private cashier: Cashier = null;

    private cashierDirection: Direction;

    // private isPowerGuideObj: boolean = false;

    protected doReset() {
        if (this.bindingRoleCase) {
            this.bindingRoleCase.bindingCustomer = null;
        }
        this.bindingRoleCase = null;

        if (this.cashier) {
            this.cashier.cashCount--;
        }
        this.cashier = null;

        this.isStayTheCase = false;
        this.isCashing = false;
        this.isGoingToCash = false;
        this.isGoingHome = false;
        this.inMarket = false;
        this.buySuccess = false;
        // this.isPowerGuideObj = false;
        this.setBubbleBackActive(false);
        this.unscheduleAllCallbacks();
        this.resetInteractive();
    }

    // setInPowerGuideState() {
    //     // UIMgr.showMask();
    //     this.isPowerGuideObj = true;
    //     let unbindingRoleCase = RoleCaseHelper.getUnbindingCustomerRoleCase();
    //     unbindingRoleCase.bindingCustomer = this;
    //     this.bindingRoleCase = unbindingRoleCase;
    //     let customerPos = this.bindingRoleCase.bindingCustomerPos;
    //     this.setMapPos(customerPos.x, customerPos.y);
    //
    //     this.turn(this.bindingRoleCase.bindingCustomerDirection);
    //     this.isStayTheCase = true;
    //     this.buySuccess = true;
    //
    //     this.scheduleOnce(() => {
    //         this.playTakeGoodsAnimation(this.goCash);
    //     }, 1);
    // }

    getRoleType(): RoleType {
        return RoleType.CUSTOMER;
    }

    getPrefix(): string {
        return Customer.PREFIX;
    }

    setInMarket(inside: boolean) {
        if (this.inMarket == inside) return;
        this.inMarket = inside;
    }

    isInMarket(): boolean {
        return this.inMarket;
    }

    //具备了离开商店的条件所以就不统计进商店内人数
    enableLeaveMarket(): boolean {
        return this.isStayTheCase || this.isGoingToCash || this.isCashing;
    }

    isGoingHomeFunc(): boolean {
        return this.isGoingHome;
    }

    updatePos(dt) {
        if (!this.spine) {
            return;
        }

        this.stateTime += dt;

        switch (this.state) {
            case State.IDLE:
                this.doIdle();
                break;
            case State.WALK_CUSTOMER1:
            case State.WALK_CUSTOMER2:
            case State.WALK:
            case State.RUN:
                this.move(dt);
                break;
            case State.CASH:
                this.doCash();
                break;
        }
    }

    private doIdle() {
        if (this.inMarket) {
            this.aroundInsideMarket();
        } else {
            //被揽客员锁定后禁止移动，禁止状态改变
            if (!this.isInToutingFunc()) {
                this.aroundOutsideMarket();
            } else {
                if (this.enableToutFunc) {
                    this.enableToutFunc();
                    this.enableToutFunc = null;
                }
            }
        }
    }

    private setBubbleBackActive(active: boolean) {
        if (this.bubbleBack.node.active == active) {
            return;
        }
        this.bubbleBack.node.active = active;
        active ? Customer.curExpreesionBubbleCount++ : Customer.curExpreesionBubbleCount--;
    }

    showExpressionBubble(name: EXPRESSION) {
        if (!this.bubbleBack.node.active) {
            if (Customer.curExpreesionBubbleCount < MAX_EXPRESSION_BUBBLE_COUNT && !checkBubbleAwardOverMax()) {
                ResMgr.getBubbleImg(this.expressionBubble, name);
                this.setBubbleBackActive(true);
            }
        } else {
            ResMgr.getBubbleImg(this.expressionBubble, name);
        }
    }

    private goCash = () => {
        if (this.isGoingToCash) return;
        this.isGoingToCash = true;
        this.isStayTheCase = false;

        let hasSaleman = false;
        if (this.bindingRoleCase) {
            this.bindingRoleCase.bindingCustomer = null;
            hasSaleman = !!this.bindingRoleCase.bindingSaleman;
        }
        this.bindingRoleCase = null;

        let pos: Pos;
        if (this.buySuccess) {
            this.cashier = CashierHelper.getCashier();
            this.cashierDirection = this.cashier.direction;
            this.cashier.cashCount++;
            pos = this.cashier.pos;
            this.happy();

        } else {
            pos = CommonUtil.randomInDoor();
            this.anger();
        }
        if (hasSaleman) {
            this.showExpressionBubble(this.buySuccess ? EXPRESSION.XiYue : EXPRESSION.ShengQi);
        }
        this.showBuyActorLines(this.buySuccess);
        if (DataMgr.isLowPhone()) {
            this.changeState(State.WALK_CUSTOMER2, pos, undefined, () => {
                this.doCash();
            });
        } else {
            this.changeState(State.WALK_CUSTOMER2, pos, State.CASH);
        }
    };

    private showBuyActorLines(success: boolean) {
        let type = success ? ACTOR_LINES_TYPE.CUSTOMER_BUY_SUCCEED : ACTOR_LINES_TYPE.CUSTOMER_BUY_FAILED;
        if (ActorLinesHelper.checkOccur(type, this)) {
            this.showActorLines(type);
        }
    }

    private doCash() {
        if (!this.isCashing) {
            this.isCashing = true;
            this.isGoingToCash = false;

            let cashOver = () => {
                this.isCashing = false;
                if (this.cashier) {
                    this.cashier.cashCount--;
                }
                this.cashier = null;
                this.goHome();
                ClientEvents.MAP_CUSTOMER_EXIT_MARKET.emit();
                // if (this.isPowerGuideObj) {
                //     this.isPowerGuideObj = false;
                // }
            };

            if (this.buySuccess) {
                this.turn(this.cashierDirection);
                ClientEvents.MAP_CUSTOMER_GO_CASH.emit();
                if (DataMgr.isLowPhone()) {
                    cashOver();
                } else {
                    this.spine.setAnimation(0, Role.ACTIONS[State.CASH], false);
                    this.spine.setCompleteListener(() => {
                        this.spine.setCompleteListener(null);
                        cashOver();
                    });
                }
            } else {
                cashOver();
            }
        }
    }

    //播放站立伸手拿商品动画
    private playTakeGoodsAnimation(completeFunc: () => void) {
        if (DataMgr.isLowPhone()) {
            this.scheduleOnce(completeFunc, 1);
        } else {
            this.spine.setAnimation(0, Role.ACTIONS[State.BUY1], false);
            this.spine.setCompleteListener(() => {
                this.spine.setCompleteListener(null);
                completeFunc();
            });
        }
    }

    private aroundInsideMarket() {
        //1.先执行进入商店逻辑
        if (!isThisMapPosInMarket(this.curMapPos())) {
            let doorPos = CommonUtil.randomInDoor();
            this.changeState(State.WALK, doorPos, State.IDLE, () => {
                ClientEvents.MAP_CUSTOMER_ENTER_MARKET.emit();
            });
            return;
        }

        //2.寻找可以购买商品的货架（货架前没有顾客不需排队的货架）
        if (!this.bindingRoleCase) {
            if (this.mapPeople.inMarketCustomerSize() > CustomerHelper.getInsideMinNum() || this.isBusCustomer()) {
                if (DataMgr.getGuideCount() != 2) {
                    let unbindingRoleCase = RoleCaseHelper.getUnbindingCustomerRoleCase();
                    if (unbindingRoleCase) {
                        unbindingRoleCase.bindingCustomer = this;
                        this.bindingRoleCase = unbindingRoleCase;
                        let curPos = this.curMapPos();
                        let customerPos = this.bindingRoleCase.bindingCustomerPos;
                        if (curPos.x != customerPos.x || curPos.y != customerPos.y) {
                            this.changeState(State.WALK_CUSTOMER2, customerPos, State.IDLE);
                        }
                        return;
                    }
                }
            }
        } else {
            this.turn(this.bindingRoleCase.bindingCustomerDirection);
            if (!this.isStayTheCase) {
                this.isStayTheCase = true;
                this.buySuccess = CommonUtil.randomByPercent(80);
                let bindingSaleman = this.bindingRoleCase.bindingSaleman;
                if (bindingSaleman && bindingSaleman.in(State.IDLE)) { //触发谈话
                    bindingSaleman.startTalking(this.buySuccess, this.goCash);
                    this.checkCustomerAskSaleman();
                } else {
                    this.scheduleOnce(() => {
                        if (this.buySuccess) {
                            this.playTakeGoodsAnimation(this.goCash);
                        } else {
                            this.goCash();
                        }
                    }, CommonUtil.getRangeCloseNum(1, 3));
                }
            }
            return;
        }

        //3.货架间走动
        let roleCase = RoleCaseHelper.getCustomerRandomRoleCase(this.curMapPos());
        let pos;
        if (roleCase) {
            pos = cc.v2(roleCase.bindingCustomerPos.x, roleCase.bindingCustomerPos.y);
        } else {
            pos = MapPeople.randomInMarketPos(this.curMapPos()); //商店内随机一个坐标
        }
        this.changeState(State.WALK_CUSTOMER2, pos, State.IDLE, () => {
            if (roleCase && RoleCaseHelper.isEmpty(roleCase.id)) {
                if (ActorLinesHelper.checkOccur(ACTOR_LINES_TYPE.CUSTOMER_STAND_ON_EMPTY_CASE, this)) {
                    this.showActorLines(ACTOR_LINES_TYPE.CUSTOMER_STAND_ON_EMPTY_CASE);
                }
            }
        });
    }

    private checkCustomerAskSaleman() {
        if (ActorLinesHelper.checkOccur(ACTOR_LINES_TYPE.CUSTOMER_ASK_SALEMAN, this)) {
            this.showActorLines(ACTOR_LINES_TYPE.CUSTOMER_ASK_SALEMAN);
            this.scheduleOnce(() => {
                if (this.bindingRoleCase && this.bindingRoleCase.bindingSaleman) {
                    this.bindingRoleCase.bindingSaleman.showActorLines(ACTOR_LINES_TYPE.SALEMAN_ANSWER_CUSTOMER);
                }
            }, 2);
        }
    }

    private aroundOutsideMarket() {
        if (this.isGoingHome) {
            return;
        }
        if (this.timeout === 0) {
            this.timeout = CommonUtil.getRangeCloseNum(0, 3);
        }
        if (this.timeout < 0) {
            this.timeout = CommonUtil.randomByPercent(70) ? 0 : CommonUtil.getRangeCloseNum(0, 3);
        }
        if (this.stateTime < this.timeout) {
            return;
        }

        if (this.isBusCustomer()) {
            this.setInMarket(true);
            return;
        }

        if (this.mapPeople.getTouterSize() == 0) { //没有揽客员工时
            if (this.mapPeople.inMarketCustomerSize() < CustomerHelper.getInsideMaxNum()) {
                this.setInMarket(true);
                return;
            }
        }

        let passPos = this.mapInfo.outsideCustomerRandomPos(this.curMapPos());
        this.changeState(State.WALK, passPos, State.IDLE, () => {
            let wantHome = CommonUtil.randomByPercent(30);
            if (wantHome) {
                this.goHome();
            }
        });
    }

    protected doOnComplete() {
        this.randomFace();
        this.nameLabel.node.active = showName;
        ButtonMgr.addClick(this.bubbleBack.node, this.clickExpressionBubble);
        this.changeState(State.IDLE);
    }

    private clickExpressionBubble = () => {
        HttpInst.postData(NetConfig.BUBBLE_COLLECT, [true]);
        let count = addCurBubbleAwardCount();
        this.setBubbleBackActive(false);
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2035", count + "", getBubbleAwardItemId() + "");
    };

    private randomFace() {
        let faceArray = JsonMgr.getJsonArr<IRoleFaceJson>("roleFace");
        let weights = [];
        for (let face of faceArray) {
            weights.push(face.weight);
        }
        let index = CommonUtil.getWeightRandom(weights);
        let name = faceArray[index].face;
        this.changeFace(getFaceEnumByName(name));
    }

    //重生
    private rebirth() {
        this.reset();
        this.switchUrl();
        this.randomFace();
    }

    goHome() {
        if (this.isGoingHome) return;
        this.isGoingHome = true;
        this.inMarket = false;

        let getState = () => {
            if (DataMgr.isLowPhone()) {
                return State.WALK;
            }
            return this.buySuccess ? State.WALK_CUSTOMER1 : State.WALK;
        };

        let homePos: cc.Vec2 = this.mapInfo.homeRandomPos();
        this.changeState(getState(), homePos, State.IDLE, () => {
            if (this.isBusCustomer()) {
                this.mapPeople.deleteRole(this);
            } else {
                this.rebirth();
            }
        });
    }

    showPosition() {
        return false;
    }

    //测试顾客变换形象，模拟变成另一个顾客
    private switchUrl() {
        this.setUrl(this.getCustomerSpineUrl());
    }
}
