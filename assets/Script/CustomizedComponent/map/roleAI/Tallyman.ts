import {Direction, Role, RoleType, State} from "../Role";
import {CommonUtil} from "../../../Utils/CommonUtil";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {RoleCaseHelper} from "./CaseHelper";
import {ACTOR_LINES_TYPE, ActorLinesHelper} from "./ActorLinesHelper";
import {getFaceEnumByName} from "./CustomerHelper";
import {DataMgr} from "../../../Model/DataManager";

/**
 * @Author whg
 * @Date 2019/4/3
 * @Desc 理货员
 * 随机在店内走动（xingzou），发现店内货物不足（或者补货间隔时间到了），
 * 就跑出去仓库抬货物，然后再进入到店内某个缺货的货架旁边放下货物，不断重复
 * 暂时先不考虑和顾客的交互
 */

const {ccclass, property} = cc._decorator;

const SLEEPY_TIMEOUT: number = 20; //当理货员等待时长超过20秒时，理货员脑袋上会播放等待中，无聊打瞌睡的气泡

@ccclass
export class Tallyman extends Role {

    static PREFIX: string = "tallyman";

    @property(cc.Sprite)
    private sleepyIcon: cc.Sprite = null;

    @property(cc.Sprite)
    private bubbleBack: cc.Sprite = null;

    @property(cc.Sprite)
    private talkingBubble: cc.Sprite = null;

    private sleepyTime: number = 0;

    private sleepyCount: number = 0; //打哈欠次数，以此来寻找聊天对象

    private foundTalkingTallyman: Tallyman = null; //被找到的聊天对象

    private isInTalking: boolean = false;

    private isInSleepy: boolean = false;

    protected doOnComplete() {
        this.bubbleBack.node.active = false;
        this.sleepyIcon.node.active = false;
        this.resetSleepyTime();
        this.changeState(State.IDLE);
    }

    protected doOnLoad() {
        // if (this.talkingBubble.node) {
        //     let target = this.talkingBubble.node;
        //     this.talkingBubble.node = new Proxy(target, {
        //         get(target, key) {
        //             return target[key];
        //         },
        //
        //         set(target, key, value) {
        //             if (key == 'active') {
        //                 console.log("set active", value);
        //             }
        //             return Reflect.set(target, key, value);
        //         }
        //     });
        // }
    }

    getRoleType(): RoleType {
        return RoleType.TALLYMAN;
    }

    getPrefix(): string {
        return Tallyman.PREFIX;
    }

    updatePos(dt) {
        if (!this.spine) {
            return;
        }

        this.stateTime += dt;

        switch (this.state) {
            case State.IDLE:
                this.doIdle(dt);
                break;
            case State.WALK:
            case State.RUN:
            case State.TALLY1:
                this.move(dt);
                break;
        }
    }

    private resetSleepyTime() {
        this.sleepyTime = CommonUtil.getRangeCloseNum(17, Math.floor(SLEEPY_TIMEOUT * 0.95));
    }

    protected doReset() {
        this.resetSleepyTime();
        this.unscheduleAllCallbacks();
        this.foundTalkingTallyman = null;
        this.sleepyCount = 0;
        this.isInTalking = false;
        this.state = State.IDLE;
        this.isInSleepy = false;
    }

    getSleepyCount(): number {
        return this.sleepyCount;
    }

    isStartTalking(): boolean {
        return !!this.foundTalkingTallyman || this.isInTalking;
    }

    private playSleepyActorLines() {
        if (ActorLinesHelper.checkOccur(ACTOR_LINES_TYPE.TALLYMAN_SLEEPY, this)) {
            this.isInSleepy = true;
            this.sleepyCount++;
            this.sad();
            this.showActorLines(ACTOR_LINES_TYPE.TALLYMAN_SLEEPY, () => {
                this.isInSleepy = false;
            });
        }
    }

    private randomTalkingFace(): IRoleFaceJson {
        let faceArray = JsonMgr.getJsonArr<IRoleFaceJson>("roleFace");
        let weights = [];
        for (let face of faceArray) {
            weights.push(face.weight);
        }
        let index = CommonUtil.getWeightRandom(weights);
        return faceArray[index];
    }

    private changeTalkingFace(curFaceData: IRoleFaceJson): IRoleFaceJson {
        let weights = [curFaceData.downRadio, curFaceData.unchangRadio, curFaceData.upRadio];
        let index = CommonUtil.getWeightRandom(weights);

        if (index == 1) {
            return curFaceData;
        }

        let faceArray = JsonMgr.getJsonArr<IRoleFaceJson>("roleFace");

        if (index == 0) {
            faceArray.sort((a: IRoleFaceJson, b: IRoleFaceJson) => {
                if (a.id > b.id) return 1;
                return -1;
            });
            for (let face of faceArray) {
                if (face.id > curFaceData.id) {
                    return face;
                }
            }
            return faceArray[0];
        }

        if (index == 2) {
            faceArray.sort((a: IRoleFaceJson, b: IRoleFaceJson) => {
                if (a.id < b.id) return 1;
                return -1;
            });
            for (let face of faceArray) {
                if (face.id < curFaceData.id) {
                    return face;
                }
            }
            return faceArray[faceArray.length - 1];
        }
    }

    private setTalkingFace(faceData: IRoleFaceJson) {
        this.changeFace(getFaceEnumByName(faceData.dialogueExpression));
        this.setEnableTouch(false);
    }

    private talkingOver() {
        this.setEnableTouch(true);
        this.isInTalking = false;
        this.sleepyCount = 0;
        this.resetSleepyTime();
        this.sendGoods();
    }

    private sendGoods() {
        this.state = State.TALLY2;
        this.scheduleOnce(() => {
            let data = RoleCaseHelper.getUnbindingCustomerRoleCase();
            if (!data) data = RoleCaseHelper.getRandomRoleCase();
            if(!data || !data.bindingCustomerPos){
                console.error("Not Found data.bindingCustomerPos");
                return;
            }
            this.changeState(State.TALLY1, data.bindingCustomerPos, DataMgr.isLowPhone() ? undefined : State.TALLY2, () => {
                this.turn(data.bindingCustomerDirection);
                if (DataMgr.isLowPhone()) {
                    this.changeState(State.RUN, this.nextRandomPos(this.curMapPos()), State.IDLE);
                } else {
                    this.spine.setAnimation(0, Role.ACTIONS[State.TALLY2], false);
                    this.spine.setCompleteListener(() => {
                        this.spine.setCompleteListener(null);
                        this.changeState(State.RUN, this.nextRandomPos(this.curMapPos()), State.IDLE);
                    });
                }
            })
        }, CommonUtil.getRangeCloseNum(1, 3));
    }

    private startTalking() {
        if (ActorLinesHelper.checkOccur(ACTOR_LINES_TYPE.TALLYMAN_ASK_OTHER, this) && ActorLinesHelper.checkOccur(ACTOR_LINES_TYPE.TALLYMAN_ANSWER, this.foundTalkingTallyman)) {
            let talkingFace = this.randomTalkingFace();
            this.changeFace(getFaceEnumByName(talkingFace.face));
            this.setEnableTouch(false);
            this.foundTalkingTallyman.setEnableTouch(false);
            this.showActorLines(ACTOR_LINES_TYPE.TALLYMAN_ASK_OTHER, () => {
                this.foundTalkingTallyman.setTalkingFace(talkingFace);
                this.foundTalkingTallyman.showActorLines(ACTOR_LINES_TYPE.TALLYMAN_ANSWER, () => {
                    this.talkingOver();
                    this.foundTalkingTallyman.talkingOver();
                    this.foundTalkingTallyman = null;
                });
            });
        }
    }

    private doIdle(dt: number) {
        if (this.isInSleepy) {
            return;
        }

        if (this.isInTalking) {
            return;
        }

        if (this.foundTalkingTallyman) {
            let pos = this.foundTalkingTallyman.curMapPos().clone();
            if (this.foundTalkingTallyman.direction == Direction.LEFT) {
                pos.y++
            } else {
                pos.y--;
            }

            let arrivedFunc = () => {
                this.turn(this.foundTalkingTallyman.direction == Direction.LEFT ? Direction.RIGHT : Direction.LEFT);
                this.isInTalking = true;
                this.startTalking();
            };

            let curPos = this.curMapPos();
            if (curPos.x == pos.x && curPos.y == pos.y) {
                arrivedFunc();
            } else {
                this.changeState(State.WALK, pos, State.IDLE, arrivedFunc);
            }

            return;
        }

        if (this.sleepyCount > 0) {
            //无聊状态中
            let foundTallyman = this.mapPeople.getTalkingTallyman(this);
            if (foundTallyman) {
                foundTallyman.isInTalking = true;
                this.foundTalkingTallyman = foundTallyman;
                return;
            }
        }

        if (this.sleepyCount >= 1 && !this.isStartTalking()) {
            this.sleepyCount = 0;
            this.sendGoods();
            return;
        }

        this.sleepyTime += dt;
        if (this.sleepyTime >= SLEEPY_TIMEOUT ) {
            this.resetSleepyTime();
            this.playSleepyActorLines();
            this.stateTime = 0;
            return;
        }

        if (this.timeout < 0) {
            this.timeout = CommonUtil.getRangeCloseNum(5, 10);
            return;
        }

        if (this.stateTime > this.timeout) {
            this.stateTime = 0;
            this.timeout = CommonUtil.getRangeCloseNum(5, 10);

            let pos = this.nextRandomPos(this.curMapPos());
            this.changeState(State.WALK, pos, State.IDLE);
        }
    }

    private nextRandomPos(curMapPos: cc.Vec2): cc.Vec2 {
        return this.mapInfo.tallymanRandomPos(curMapPos);
    }
}
