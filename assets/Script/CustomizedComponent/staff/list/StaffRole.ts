import { Staff } from "../../../Model/StaffData";
import { CommonUtil } from "../../../Utils/CommonUtil";
import { COUNTERTYPE, DotInst } from "../../common/dotClient";
import { Direction, Face, Role, State } from "../../map/Role";
import { DataMgr } from "../../../Model/DataManager";
import AnimationCacheMode = sp.Skeleton.AnimationCacheMode;

const { ccclass, property } = cc._decorator;

@ccclass
export class StaffRole extends cc.Component {

    @property(cc.Animation)
    upAni: cc.Animation = null;

    @property(cc.Node)
    aniNode: cc.Node = null;

    private url: string = "";
    private urlPng: string;

    private state: number = 0;
    private actions: Array<string> = null;
    private skins: Array<string> = null;

    private face: number = 0;

    private spine: sp.Skeleton = null;

    private initDirection: Direction = Direction.LEFT;
    private direction: Direction = Direction.LEFT;


    @property(cc.Node)
    private faceNode: cc.Node = null;


    private staff: Staff = null;

    private loop: boolean = true;
    private reset: boolean = false;  //播放完一次是否重置到待机状态
    private aniNum: number = 1;
    private maxAniNum: number = 2;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.changeAction);
        // this.skinBtn.node.on(cc.Node.EventType.TOUCH_END, this.changeSkin);
        this.faceNode.on(cc.Node.EventType.TOUCH_END, this.changeSkin);
        // this.skinBtn.schedule(() => {
        //     let seq = cc.sequence(cc.scaleTo(0.5, 1.3, 1.3), cc.scaleTo(0.5, 1, 1));
        //     seq.repeat(2);
        //     this.skinBtn.node.runAction(seq);
        // }, 5);
    }

    setAnimLoop(loop: boolean = true) {
        this.loop = loop;
    }

    protected onEnable(): void {
        if (this.spine) {
            this.changeSkin();
        }
    }

    setStaff(staff: Staff) {
        this.staff = staff;
    }

    init(staff: Staff, direction: Direction = Direction.LEFT, showMood: boolean = false,
        actions: Array<string> = null, skins: Array<string> = null, state: State = null, face: Face = null, loop: boolean = true, isReset: boolean = false) {
        this.loop = loop;
        this.reset = isReset;
        this.staff = staff;
        this.initSpine(staff.getSpineUrl(), direction, -1,
            actions == null ? staff.getJobActions() : actions, skins, state, face);
    }

    updateUpState(staff: Staff) {
        if (staff.judgeIsUpStaff() != null) {
            if (this.aniNode) {
                this.aniNode.active = true;
                this.upAni.play();
            }
        } else {
            if (this.aniNode) {
                this.aniNode.active = false;
            }
        }
    }

    initSpine(spineUrl: string, direction: Direction = Direction.LEFT, mood: number = -1,
        actions: Array<string> = null, skins: Array<string> = null, state: State = null, face: Face = null) {
        this.initDirection = direction;

        let isLow = DataMgr.isLowPhone();
        this.actions = actions == null
            ? (isLow ? Role.LOW_STAFF_ACTIONS : Role.STAFF_ACTIONS)
            : (isLow ? Role.LOW_STAFF_ACTIONS : actions);
        this.skins = skins == null
            ? (isLow ? Role.SMILE_SKIN : Role.SKINS)
            : (isLow ? Role.SMILE_SKIN : skins);

        // UIUtil.setLabel(this.moodNumLabel, mood);
        // const showMood: boolean = mood >= 0;
        // this.moodNumLabel.node.active = showMood;
        // this.skinBtn.node.active = showMood;

        if (this.spine) {
            this.spine.node.active = false;
            //cc.log(staff.staffId, "hide spine");
        }

        this.state = state || CommonUtil.getRandomNum(this.actions.length);
        this.face = face || CommonUtil.getRandomNum(this.skins.length);

        this.url = spineUrl;
        this.urlPng = spineUrl.substring(spineUrl.lastIndexOf("/") + 1);
        cc.loader.loadRes(this.url, sp.SkeletonData, this.onComplete);
    }

    onComplete = (err: Error, res: sp.SkeletonData) => {
        if (err) {
            cc.error(err);
            return;
        }

        //cc.log(this.urlPng, " - ", res.name);
        if (this.urlPng != res.name) { //修复人物spine动画加载过慢导致人物错位
            return;
        }
        if (!this.node) {
            return;
        }

        this.spine = this.node.getChildByName("spine").getComponent('sp.Skeleton');
        this.spine.setAnimationCacheMode(DataMgr.isLowPhone()
            ? AnimationCacheMode.SHARED_CACHE
            : AnimationCacheMode.PRIVATE_CACHE);
        this.spine.skeletonData = res;

        this.spine.setAnimation(0, this.actions[this.state], this.loop);
        this.spine.setSkin(this.skins[this.face]);
        this.spine.setCompleteListener(() => {
            this.aniNum++;
            if (this.aniNum > this.maxAniNum) {
                if (this.reset) {
                    this.aniNum = 1;
                    this.spine.setAnimation(0, "zhanli", true);
                }
            }
        });

        this.spine.node.active = true;

        this.turn(this.initDirection);
    };

    setState(state: State, loop: boolean = true) {
        if (this.spine == null) {
            // console.log("spine is null.");
            return;
        }
        this.spine.setAnimation(0, this.actions[state], loop);
    }

    changeAction = () => {
        if(!this.spine) return;
        DotInst.clientSendDot(COUNTERTYPE.staff, "6007");
        this.state++;
        if (this.state >= this.actions.length) {
            this.state = 0;
        }
        this.spine.setAnimation(0, this.actions[this.state], this.loop);
    };

    changeSkin = () => {
        if(!this.spine) return;
        this.face++;
        if (this.face >= this.skins.length) {
            this.face = 0;
        }
        this.spine.setSkin(this.skins[this.face]);
        //this.spine.setSlotsToSetupPose();
    };

    changeDesignation(action) {
        if (this.spine) {
            this.spine.setSkin(action);
        }
    }

    changeDesignAction(action) {
        if (this.spine) {
            this.spine.setAnimation(0, action, this.loop);
        }
    }

    turnRight() {
        this.turn(Direction.RIGHT);
    }

    turnLeft() {
        this.turn(Direction.LEFT);
    }

    turn(direction: Direction) {
        if (this.direction != direction) {
            this.spine.node.scaleX = -this.spine.node.scaleX;
            this.direction = direction;
        }
    }

    hide() {
        if (this.node.active) {
            this.node.active = false;
        }
    }

    show() {
        if (!this.node.active) {
            this.node.active = true;
        }
    }

    getStaff() {
        return this.staff;
    }

}
