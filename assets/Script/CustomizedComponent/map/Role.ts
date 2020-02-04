import {MapInfo, Pos} from "./MapInfo";
import {GridNode} from "./Astar";
import {JobType, Staff} from "../../Model/StaffData";
import {UIUtil} from "../../Utils/UIUtil";
import {CompositeDisposable} from "../../Utils/event-kit";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {CommonUtil} from "../../Utils/CommonUtil";
import {MapPeople} from "./MapPeople";
import {DataMgr, IPhoneState} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ButtonMgr} from "../common/ButtonClick";
import {Cases} from "../MapShow/CacheMapDataManager";
import {ResManager} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {MapWAndH} from "../../Utils/CoordinateTranslate";
import {ACTOR_LINES_TYPE, ActorLinesHelper} from "./roleAI/ActorLinesHelper";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {ConfigMgr} from "../../global/manager/ConfigResManager";
import AnimationCacheMode = sp.Skeleton.AnimationCacheMode;

const {ccclass, property} = cc._decorator;

export enum Direction {
    LEFT,
    RIGHT,
}

export enum State {
    IDLE,
    WALK,
    RUN,
    CASH, //收银站立鞠躬动作
    TOUT1, //扛着牌子跑动
    TOUT2, //站立摇摆牌子
    TALLY1, //理货行走搬运箱子
    TALLY2, //理货站立放下箱子

    BUY1,   //站立伸手拿商品
    BUY2,   //站立伸手拿商品
    WALK_CUSTOMER1, //抱礼盒行走
    WALK_CUSTOMER2, //提篮子行走
    HOUYANG, //后仰动作
}

export enum Face {
    HAPPY, //三角眼
    SMILE,
    SAD,
    ANGER,
    AMAZE,
}

export enum RoleType {
    ALL = Math.pow(2, 0),

    CASHIER = Math.pow(2, 1),
    TALLYMAN = Math.pow(2, 2),
    SALEMAN = Math.pow(2, 3),
    TOUTER = Math.pow(2, 4),

    CUSTOMER = Math.pow(2, 5),

    TESTROLE = Math.pow(2, 6),  //测试用的路飞
    ENEMY = Math.pow(2, 7),     //危机事件的敌人
}

export class JobMapInfo {
    type: JobType;
    roleScript: string;
    mapRange: Array<cc.Vec2>;
    nodePool: cc.NodePool;
    prefab: cc.Prefab;

    constructor(type: JobType, roleScript: string, mapRange: Array<cc.Vec2>, nodePool: cc.NodePool, prefab: cc.Prefab) {
        this.type = type;
        this.roleScript = roleScript;
        this.mapRange = mapRange;
        this.nodePool = nodePool;
        this.prefab = prefab;
    }
}

@ccclass
export class Role extends cc.Component {

    static SPEED_RATE: number = 1;
    static UPDATE_PER_FRAME: number = 2; //每多少帧执行一次update
    static SPEEDY: number = 20 * Role.UPDATE_PER_FRAME * Role.SPEED_RATE;

    static SCALE: number = 0.45;//0.6;
    static SHOW_NAME_LABEL: boolean = false;
    static NAME_LABEL_X: number = 0;//5;
    static NAME_LABEL_Y: number = 60;//70//109;
    static NAME_LABEL_FONT_SIZE: number = 22;//30//40

    static SHOW_JOB_ICON: boolean = true;
    static JOB_ICON_SCALE: number = 1.2;
    static JOB_ICON_Y: number = 45;//70;

    static CUSTOMER_START_ID: number = -1;

    //危机产生敌人的起始id，配合后端给的危机id组成敌人的staffId
    static ENEMY_START_ID: number = -1000;
    static BUS_TOUR_START_ID: number = -2000;

    static SKINS: Array<string> = [
        "xiyue",    //喜悦
        "weixiao",  //微笑
        "jusang",   //沮丧
        "shengqi",  //生气
        "jingya",   //惊讶
    ];

    static SORRY_SKINS: Array<string> = [
        "jusang",   //沮丧
    ];

    static SMILE_SKIN: Array<string> = [
        "weixiao",  //微笑
    ];

    static HAPPY_SKINS: Array<string> = [
        "weixiao",  //微笑
        "xiyue",    //喜悦
    ];

    static STOCK_SKINS: Array<string> = [
        "weixiao",  //微笑
        "xiyue",    //喜悦
        "jingya",   //惊讶
    ];

    static IDEL_ACTION: Array<string> = [
        "zhanli",   //站立
    ];

    static CASH_ACTION: Array<string> = [
        "shouyin",  //收银
    ];

    static SEAL_ACTION: Array<string> = [
        "zhanli",  //售货员
    ];

    static TALL_ACTION: Array<string> = [
        "lihuo1",  //理货
    ];

    static TOUTER_ACTION: Array<string> = [
        "lanke2",  //揽客
    ];

    static STAFF_ACTIONS: Array<string> = [
        "zhanli",   //站立
        "xingzou",  //行走
        "paodong",  //跑动
        "shouyin",  //收银
        "lanke1",   //揽客1
        "lanke2",   //揽客2
        "lihuo1",   //理货1
        "lihuo2",   //理货2
    ];

    static LOW_STAFF_ACTIONS: Array<string> = [
        "zhanli",   //站立
        "xingzou",  //行走
        "paodong",  //跑动
        "shouyin",  //收银
    ];

    static ACTIONS: Array<string> = [
        "zhanli",   //站立
        "xingzou",  //行走
        "paodong",  //跑动
        "shouyin",  //收银
        "lanke1",   //揽客1
        "lanke2",   //揽客2
        "lihuo1",   //理货1
        "lihuo2",   //理货2

        "guke1",    //顾客1
        "guke2",    //顾客2
        "guke3",    //顾客3
        "guke4",    //顾客4
        "guke6",    //顾客6
    ];

    static CASHIER_ACTIONS: Array<string> = [
        "zhanli",   //站立
        "xingzou",  //行走
        "paodong",  //跑动
        "shouyin",  //收银
    ];
    static TALLYMAN_ACTIONS: Array<string> = [
        "zhanli",   //站立
        "xingzou",  //行走
        "paodong",  //跑动
        "lihuo1",   //理货1
        "lihuo2",   //理货2
    ];
    static SALEMAN_ACTIONS: Array<string> = [
        "zhanli",   //站立
        "xingzou",  //行走
        "paodong",  //跑动
    ];
    static TOUTER_ACTIONS: Array<string> = [
        "zhanli",   //站立
        "xingzou",  //行走
        "paodong",  //跑动
        "lanke1",   //揽客1
        "lanke2",   //揽客2
    ];

    static CUSTOMER_ACTIONS: Array<string> = [
        "zhanli",   //站立
        "xingzou",  //行走
        "paodong",  //跑动
        "shouyin",  //收银
        "guke1",    //顾客1
        "guke2",    //顾客2
    ];

    @property(cc.Label)
    protected chatLab: cc.Label = null;

    @property(cc.Sprite)
    protected chatBack: cc.Sprite = null;

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property(cc.Node)
    protected spineTouchNode: cc.Node = null;

    @property(cc.Animation)
    protected smokeAnim: cc.Animation = null;
    @property(sp.Skeleton)
    protected lvUpSpine: sp.Skeleton = null;

    isMove: boolean = false;

    private url: string = null;
    private phoneState: number = 1; //当前手机模式（高低清）

    peopleData: Cases = null;

    mapInfo: MapInfo = null;
    mapPeople: MapPeople = null;

    state: State = State.IDLE;
    arrivedState: State = -1;
    arrivedCb: Function = null;

    stateTime: number = 0;  //当前状态下的持续时间
    timeout: number = -1;   //当前状态下可持续时间上限

    speedY: number = 0;
    speedX: number = 0;

    moving: boolean = false;

    private isJumping: boolean = false;

    movePath: Array<cc.Vec2> = null;
    //当前移动的目标坐标
    curPath: cc.Vec2 = null;

    isMoveAround: boolean = false;
    lastMapPos: cc.Vec2 = null;

    xDone: boolean = false;
    yDone: boolean = false;
    direction: Direction = Direction.LEFT;

    protected face: Face = -1;

    running: boolean = false;

    spine: sp.Skeleton = null;

    staffId: number = -1;
    artResId: number = -1;
    name: string = "";

    doSomeThing = false;

    protected interactive: number = 0; //和周围角色的交互次数

    protected dispose: CompositeDisposable = new CompositeDisposable();

    private isInTouting: boolean = false; //是否在揽客行为中（针对于被揽顾客和揽客员）

    protected enableToutFunc: () => void = null; //被揽顾客或揽客员当可进行揽客行为时的回调

    private _isReset: boolean = true;

    private _isInHouyangAnimation: boolean = false;

    private spineTrackIndex: number;
    private spineName: string;
    private spineLoop: boolean;
    private setAnimationOriginFunc: (trackIndex: number, name: string, loop: boolean) => any = null;

    private spineListener: Function;
    private setCompleteListenerOriginFunc: (listener: Function) => void = null;

    occurDangerId: number = -1;
    occurEventId: number = -1;

    showSmoke: boolean = false;

    isInToutingFunc() {
        return this.isInTouting;
    }

    //enableToutCallback 当可以进行揽客交互时的回调
    requestIntoTouting(enableToutCallback: () => void) {
        if (this.isInTouting) return;

        this.isInTouting = true;
        this.enableToutFunc = enableToutCallback;

        if (this.state == State.IDLE && !this.isMoving()) {
            this.enableToutFunc();
            this.enableToutFunc = null;
        }
    }

    requestExitTouting() {
        this.isInTouting = false;
    }

    onLoad() {
        this.addSpineProxy();
        this.addSmokeAnimEvent();
        this.addLvUpEvent();

        this.setSpeed(Role.SPEEDY);
        this.dispose.add(ClientEvents.MAP_ROLE_CHANGE_STATE.on(this.changeStateCb));
        this.dispose.add(ClientEvents.MAP_PEOPLE_SPEED.on(this.changedSpeed));
        this.doOnLoad();
    }

    private addSpineProxy() {
        this.spine = this.node.getChildByName("spine").getComponent(sp.Skeleton);
        if (!this.setAnimationOriginFunc) {
            this.setAnimationOriginFunc = this.spine.setAnimation;
            this.spine.setAnimation = (trackIndex: number, name: string, loop: boolean) => {
                if (!this.spine.findAnimation(name)) {
                    cc.error("Can not find this animation: " + name + " at " + this.url);
                    return;
                }
                if (this.spineName == "guke6") {
                    this._isInHouyangAnimation = false;
                }
                this.spineTrackIndex = trackIndex;
                this.spineName = name;
                this.spineLoop = loop;
                return this.setAnimationOriginFunc.call(this.spine, trackIndex, name, loop);
            };
        }
        if (!this.setCompleteListenerOriginFunc) {
            this.setCompleteListenerOriginFunc = this.spine.setCompleteListener;
            this.spine.setCompleteListener = (listener: Function) => {
                this.spineListener = listener;
                return this.setCompleteListenerOriginFunc.call(this.spine, listener);
            };
        }
    }

    private addSmokeAnimEvent() {
        if (!this.isWorker()) return;
        this.smokeAnim.node.scale = 1.2;
        this.smokeAnim.on("finished", () => {
            this.showStaff();
            //TODO 如何重置回去第一张帧图片？
            UIUtil.hide(this.smokeAnim);

            // this.showActorLines(ACTOR_LINES_TYPE.POWER_GUIDE_CASHIER_UP_WORK);
            // this.scheduleOnce(() => {
            //     ClientEvents.REFRESH_POWER_GUIDE.emit();
            //     UIMgr.hideMask();
            // }, 1);
        });
    }

    private showStaff() {
        UIUtil.showNode(this.nameLabel.node.parent);
        UIUtil.show(this.spine);
    }

    private hideStaff() {
        UIUtil.hideNode(this.nameLabel.node.parent);
        UIUtil.hide(this.spine);
    }

    playUpWork() {
        this.show();
        this.hideStaff();
        UIUtil.show(this.smokeAnim);
        UIUtil.asyncPlayAnim(this.smokeAnim, "platform/animation/smoke")
    }

    private addLvUpEvent() {
        if (!this.isWorker()) return;
        this.lvUpSpine.setCompleteListener(() => {
            // this.lvUpSpine.setCompleteListener(null);
            UIUtil.hide(this.lvUpSpine);
        });
    }

    playLvUp() {
        UIUtil.show(this.lvUpSpine);
        UIUtil.asyncPlaySpine(this.lvUpSpine, "platform/spine/map/staffLvUp/map_dengjitisheng", "animation", false);
    }

    protected doOnLoad() {

    }

    start() {
        ButtonMgr.addClick(this.node, null, this.touchMove);
    }

    touchMove = (event: cc.Event.EventTouch) => {
        this.isMove = UIMgr.moveOverried(event);
    };

    getKey(): string {
        return Role.getRoleKey(this.getPrefix(), this.staffId);
    }

    static getRoleKey(prefix: string, id: number): string {
        return prefix + "_" + id;
    }

    protected getPrefix(): string {
        return "role";
    }

    private changeStateCb = (staffId: number, state: State, mapPos: Pos, arrivedState: State) => {
        if (this.staffId != staffId) {
            return;
        }
        if (state == arrivedState) {
            cc.log("一般不会传递两个相同的状态，state=" + state + ", arrivedState=" + arrivedState);
            return;
        }
        if (!this.spine) {
            return;
        }
        this.changeState(state, mapPos, arrivedState);
    };

    changeState(state: State, mapPos: Pos = null, arrivedState: State = -1, arrivedCb: Function = null) {
        this.doChangeState(state);
        this.arrivedCb = arrivedCb;
        this.arrivedState = arrivedState;
        if (mapPos) {
            if (!this.moveToMap(mapPos)) {
                let curPos = this.curMapPos();
                cc.warn("起始坐标(" + curPos.x + "," + curPos.y + ") 不可达 目的坐标(" + mapPos.x + "," + mapPos.y + ")");
                if (this.arrivedState >= 0) {
                    this.doChangeState(this.arrivedState);
                }
            }
        }
    }

    doChangeState(state: State) {
        this.stateTime = 0;
        this.state = state;

        let animName: string = Role.ACTIONS[state];
        if (!animName) {
            animName = Role.ACTIONS[State.IDLE];
            cc.log("Not Found State=" + state + " in url=" + this.url);
        }

        if (this.running && (state != State.RUN && state != State.TOUT1)) {
            this.running = false;
            this.setSpeed(Role.SPEEDY);
        }
        if (!this.running && (state == State.RUN || state == State.TOUT1)) {
            this.running = true;
            this.setSpeed(Role.SPEEDY * 2);
        }

        if (this.spine) {
            this.spine.setAnimation(0, animName, true);
        }
    }

    private changedSpeed = (rate: number) => {
        Role.SPEED_RATE = rate;
        Role.SPEEDY = 20 * Role.UPDATE_PER_FRAME * Role.SPEED_RATE;
        if (this.running) {
            this.setSpeed(Role.SPEEDY * 2);
        } else {
            this.setSpeed(Role.SPEEDY);
        }
        this.spine.timeScale = Role.SPEED_RATE;
    };

    private setSpeed(speedY: number) {
        this.speedY = speedY;
        this.speedX = 2 * speedY;
    }

    init(staffId: number, mapInfo: MapInfo, mapPeople: MapPeople,
         staffName: string = null, staffMod: number = null, showSmoke: boolean = false) {
        this.showSmoke = showSmoke;
        this.initStaff(staffId, staffName, staffMod);
        this.initMap(mapInfo, mapPeople);
    }

    private initStaff(staffId: number, staffName: string = null, staffMod: number = null) {
        this.staffId = staffId;

        if (staffName || staffMod) { //危机和事件
            this.name = staffName ? staffName : "";
            if (staffMod > 0) {
                this.setUrl(this.getIncidentSpineUrl(staffMod));
                this.artResId = staffMod;
            }
        } else {
            if (staffId == 0) {
                this.name = "测试" + Math.abs(staffId);
                this.setUrl(this.getTestSpineUrl());
            } else if (staffId < 0) {
                let isTour: boolean = this.isBusCustomer();
                this.name = (isTour ? "游客" : "顾客") + Math.abs(staffId);
                this.setUrl(this.getCustomerSpineUrl(isTour));
            } else {
                let staffData = DataMgr.getCurStaffData();
                const staff: Staff = staffData.getStaff(staffId);
                this.name = /*staff.staffId+""*/staff.getName();
                let url = staff.getSpineUrl();
                //cc.log("job staff", url);
                this.setUrl(url);
                this.artResId = staff.artResId;
            }
        }

        UIUtil.setLabel(this.nameLabel, this.name);
    }

    isBusCustomer(): boolean {
        return this.staffId < Role.BUS_TOUR_START_ID;
    }

    setUrl(url: string) {
        this.url = url;
        this.phoneState = DataMgr.getPhoneState();
        // cc.loader.loadRes(this.url, sp.SkeletonData, this.onProcess, this.onComplete);
        ConfigMgr.loadSpineRes(this.url, this.onComplete);
    }

    private getIncidentSpineUrl(staffMod: number) {
        return Staff.getLowStaffSpineUrl(staffMod);
    }

    private getTestSpineUrl() {
        return ResManager.platformPath("spine/role/low/DMHaiZeiLuFei/DMHaiZeiLuFei");
    }

    /**
     * 顾客是游客的话，则使用低清资源
     * @param isTour 是否是游客
     */
    protected getCustomerSpineUrl(isTour: boolean = false): string {
        const spineName: string = this.getRandomSpineName(isTour);
        return ResManager.STAFF_SPINE
            + (isTour ? "low/" : Staff.getSpineDir())
            + spineName + "/" + spineName;
    }

    private getRandomSpineName(isTour: boolean) {
        let customerResIds = JsonMgr.getCustomerResIds(isTour);
        let randomIndex = CommonUtil.getRandomNum(customerResIds.length);
        let randomResId = customerResIds[randomIndex];
        this.artResId = randomResId;
        return JsonMgr.getStaffMod(randomResId).name;
    }

    onProcess = () => {

    };

    onComplete = (/*err, */res: sp.SkeletonData) => {
        if (!res) {
            cc.warn("not found SkeletonData");
            return;
        }
        if (!this.node || !this.spine) {
            cc.warn("this node or this spine is null");
            return;
        }

        this.spine.setAnimationCacheMode(this.phoneState == IPhoneState.LOW
            ? AnimationCacheMode.SHARED_CACHE
            : AnimationCacheMode.PRIVATE_CACHE);

        this.spine.skeletonData = res;
        this.spine.paused = false;

        let scaleX: number = this.spine.node.scaleX > 0 ? Role.SCALE : -Role.SCALE;
        this.spine.node.setScale(scaleX, Role.SCALE);

        this.nameLabel.node.active = !this.isCustomer() /*&& !this.isEnemy()*/;
        let nameNode: cc.Node = this.node.getChildByName("nameNode");
        if (nameNode) {
            nameNode.active = Role.SHOW_JOB_ICON;
            let jobIconNode = nameNode.getChildByName("jobIcon");
            if (jobIconNode) {
                jobIconNode.scale = Role.JOB_ICON_SCALE;
            }
        }

        if (this.chatBack) this.chatBack.node.active = false;
        this.setEnableTouch(true);

        if (this.showSmoke) {
            this.hide();
            this.scheduleOnce(() => {
                setTimeout(() => {
                    UIMgr.showTipText("[" + DataMgr.staffData.getStaff(this.staffId).getName() + "]" + "已来到您的店里");
                }, 500);
                this.playUpWork()
            }, 0.3);
        } else {
            this.show();
        }

        this.doOnComplete();
        // cc.log("songhuixiang skins = " + JSON.stringify(this.spine.skeletonData.skeletonJson["skins"]));
        // cc.log("songhuixiang animations = " + JSON.stringify(this.spine.skeletonData.skeletonJson["animations"]));

        if (this.spineTouchNode) {
            ButtonMgr.addClick(this.spineTouchNode, this.touchEndCallback);
        }

        this._isReset = false;
    };

    protected doOnComplete() {

    }

    //角色任务点击事件，子类可覆盖实现
    onClick = (e) => {
        cc.log(this.staffId, "Role click");
    };

    smile() {
        this.changeFace(Face.SMILE);
    }

    happy() {
        this.changeFace(Face.HAPPY);
    }

    amaze() {
        this.changeFace(Face.AMAZE);
    }

    sad() {
        this.changeFace(Face.SAD);
    }

    anger() {
        this.changeFace(Face.ANGER);
    }

    protected changeFace(face: Face, check: boolean = true) {
        if (DataMgr.isLowPhone()) { //低清版只有微笑表情
            face = Face.SMILE;
        }
        if (!this.node || !this.node.active || !this.spine || !this.spine.skeletonData) {
            return;
        }
        if (check && this.face == face) {
            return;
        }
        if (!this.spine.skeletonData.skeletonJson["skins"][Role.SKINS[face]]) {
            return;
        }
        this.face = face;
        this.spine.setSkin(Role.SKINS[this.face]);
    }

    private initMap(mapInfo: MapInfo, mapPeople: MapPeople) {
        this.mapInfo = mapInfo;
        this.mapPeople = mapPeople;
    }

    setMapPos(x: number, y: number) {
        let glPos = this.mapInfo.toGLPos({x: x, y: y});
        this.node.setPosition(glPos);
    }

    private moveToMap(mapPos: Pos): boolean {
        let curPos: cc.Vec2 = this.curMapPos();
        let path: Array<GridNode> = this.mapInfo.search(curPos, mapPos);
        if (path.length > 0) {
            this.moving = true;
            this.movePath = new Array<cc.Vec2>(path.length);
            path.forEach((data, index) => {
                this.movePath[index] = this.mapInfo.toGLPos(data);
            });
            //console.log(this.movePath);
            this.curPath = this.movePath.shift();
            return true;
        }

        cc.log(this.getKey(), curPos, "can not arrive", mapPos);
        return false;
    }

    moveAround(mapPos: Pos) {
        this.moveToMap(mapPos);
        this.lastMapPos = this.curMapPos();
        this.isMoveAround = true;
    }

    curMapPos(): cc.Vec2 {
        return this.mapInfo.toMapPos(this.node.getPosition());
    }

    turnRight() {
        this.turn(Direction.RIGHT);
    }

    turnLeft() {
        this.turn(Direction.LEFT);
    }

    turn(direction: Direction) {
        if (this.direction != direction && this.spine) {
            this.spine.node.scaleX = -this.spine.node.scaleX;
            this.direction = direction;
        }
    }

    in(state: State) {
        return this.state == state;
    }

    updatePos(dt) {
        if (!this.isLoaded()) {
            return;
        }
        this.stateTime += dt;
        //cc.log(this.staff.staffId, "stateTime", this.stateTime);

        switch (this.state) {
            case State.WALK:
            case State.RUN:
            case State.TOUT1:
            case State.TALLY1:
                this.move(dt);
                break;
        }
    }

    isLoaded(): boolean {
        return this.spine != null;
    }

    lateUpdate() {
        if (!this.showPosition()) {
            return;
        }
        let curPos: cc.Vec2 = this.curMapPos();
        const curPosStr: string = this.name
            + (this.isRoleType(RoleType.TESTROLE) ? "(" + curPos.x + ", " + curPos.y + ")" : "");
        if (this.nameLabel.string != curPosStr) {
            UIUtil.setLabel(this.nameLabel, curPosStr);
        }
    }

    //是否显示地图坐标（x, y）
    showPosition() {
        return false;
    }

    move(dt) {
        if (!this.moving) {
            return;
        }

        if (this.isJumping) {
            return;
        }

        if (this.checkJump()) {
            this.jump();
            return;
        }

        this.doMove(dt);
    }

    private checkJump() {
        if (!this.curPath) return false;
        if (!this.movePath) return false;
        if (this.movePath.length == 0) return false;
        let mapPos = this.mapInfo.toMapPos(this.curPath);
        return this.mapInfo.isShelf(mapPos);
    }

    private doMove(dt) {
        if (!this.moving) {
            return;
        }

        this.xDone = false;
        this.yDone = false;

        if (this.node.x != this.curPath.x) {
            if (this.node.x > this.curPath.x) {
                this.turnLeft();
                this.node.x = Math.max(this.node.x - this.speedX * dt, this.curPath.x);
            } else {
                this.turnRight();
                this.node.x = Math.min(this.node.x + this.speedX * dt, this.curPath.x);
            }
        } else {
            this.xDone = true;
        }

        if (this.node.y != this.curPath.y) {
            if (this.node.y > this.curPath.y) {
                this.node.y = Math.max(this.node.y - this.speedY * dt, this.curPath.y);
            } else {
                this.node.y = Math.min(this.node.y + this.speedY * dt, this.curPath.y);
            }
        } else {
            this.yDone = true;
        }

        this.resetZIndex();

        if (this.isArrived()) {
            if (this.movePath.length > 0) {
                this.curPath = this.movePath.shift();
            } else {
                if (this.isInTouting) { //被揽顾客 或 揽客员
                    this.moveEnd();
                    this.changeState(State.IDLE);
                } else {
                    this.afterArrived();
                }
            }
            this.checkOccurDangerAndEvent();
        }
    }

    private checkOccurDangerAndEvent() {
        if (ActorLinesHelper.checkOccur(ACTOR_LINES_TYPE.DANGER, this)) {
            this.showActorLines(ACTOR_LINES_TYPE.DANGER);
            this.anger();
        } else if (ActorLinesHelper.checkOccur(ACTOR_LINES_TYPE.EVENT, this)) {
            this.showActorLines(ACTOR_LINES_TYPE.EVENT);
            this.anger();
        }
    }

    private jump() {
        this.isJumping = true;

        this.curPath = this.movePath.shift();

        let fromPos = this.node.position;
        let toPos = this.curPath;

        let roleScale: cc.Vec2 = cc.v2();
        this.node.getScale(roleScale);

        let scaleVal: number = 0.95;

        let startJump = cc.callFunc(() => {
            if (toPos.x > fromPos.x) {
                this.turnRight();
            } else {
                this.turnLeft();
            }
            this.node.zIndex = MapWAndH.WIDTH + MapWAndH.HEIGHT;
        });

        let flatten = cc.callFunc(() => {
            this.node.setScale(roleScale.x, roleScale.y * scaleVal);
            this.node.setPosition(this.node.position.x, this.node.position.y - 3);
        });

        let recover = cc.callFunc(() => {
            this.node.setScale(roleScale);
            this.node.setPosition(this.node.position.x, this.node.position.y + 3);
        });

        let jumpAction = cc.jumpTo(0.4, toPos, 35, 1);

        let endJump = cc.callFunc(() => {
            this.node.position = toPos;
            this.resetZIndex();
            if (this.movePath && this.movePath.length > 0) {
                this.curPath = this.movePath.shift();
            } else {
                this.afterArrived();
            }
            this.isJumping = false;
            this.checkOccurDangerAndEvent();
        });
        this.node.runAction(cc.sequence(startJump, flatten, cc.delayTime(0.1), recover,
            jumpAction, flatten, cc.delayTime(0.1), recover, endJump));
    }

    isMoving() {
        return this.moving;
    }

    // 重置zIndex改变遮挡层级
    protected resetZIndex() {
        let curMapPos: cc.Vec2 = this.curMapPos();
        let zIndex: number = curMapPos.x + curMapPos.y + 1; //加1令其始终遮挡后面的货架
        if (this.node.zIndex != zIndex) {
            this.node.zIndex = zIndex;
        }
    }

    private isArrived() {
        return this.xDone && this.yDone;
    }

    afterArrived() {
        this.moveEnd();
        this.doAfterArrived();
    }

    moveEnd() {
        this.moving = false;
        this.movePath = null;
        this.curPath = null;
    }

    doAfterArrived() {
        if (this.isMoveAround) {
            this.moveAround(this.lastMapPos);
        }
        if (this.arrivedState >= 0) {
            this.doChangeState(this.arrivedState);
            this.arrivedState = -1;
        }
        if (this.arrivedCb) {
            this.arrivedCb();
        }
    }

    isReset() {
        return this._isReset;
    }

    reset() {
        this._isReset = true;
        if (this.node) {
            this.node.stopAllActions();
        }
        if (this.spine && this.spine.isValid) {
            this.spine.setCompleteListener(null);
            this.spine.paused = true;
        }
        this.artResId = -1;
        this.state = State.IDLE;
        this.face = -1;
        this.timeout = -1;
        this.moving = false;
        this.movePath = null;
        this.curPath = null;
        this.isInTouting = false;
        this.enableToutFunc = null;
        this.arrivedCb = null;
        this.isJumping = false;
        this._isInHouyangAnimation = false;
        if (this.chatBack) {
            this.chatBack.node.stopAllActions();
            this.chatBack.node.active = false;
        }
        this.showSmoke = false;
        this.unscheduleAllCallbacks();
        this.hide();
        this.releaseSpine();
        this.doReset();
    }

    /** 只有切换高低清模式的时候才释放角色spine资源 */
    private releaseSpine() {
        if (this.phoneState == DataMgr.getPhoneState()
            || this.isEnemy() || this.isBusCustomer()) {
            return;
        }
        // cc.log("Role releaseSpine staffId="+this.staffId+", name="+this.name+", url="+this.url);
        ConfigMgr.releaseSpine(this.url, this.node.getChildByName("spine"), false, true);
    }

    protected doReset() {

    }

    setEnableTouch(enable: boolean) {
        if (!this.spineTouchNode) return;
        this.spineTouchNode.active = enable;
    }

    private touchEndCallback = () => {
        if (this.chatBack && !this.chatBack.node.active && !this.isInHouyangAnimation()) {
            this.playHouyangAnimation();
            this.showActorLines(ACTOR_LINES_TYPE.TOUCH);
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2034", this.artResId + "");
        }
    };

    isInHouyangAnimation(): boolean {
        return this._isInHouyangAnimation;
    }

    private playHouyangAnimation() {
        if (!this.spineLoop) {
            return;
        }
        if (this._isInHouyangAnimation) return;
        this._isInHouyangAnimation = true;

        let trackIndex = this.spineTrackIndex;
        let name = this.spineName;
        let loop = this.spineLoop;
        let listener = this.spineListener;

        this.spine.setAnimation(0, Role.ACTIONS[State.HOUYANG], false);
        this.spine.setCompleteListener(() => {
            this.spine.setAnimation(trackIndex, name, loop);
            this.spine.setCompleteListener(listener);
            this._isInHouyangAnimation = false;
        });
    }

    isShowedActorLindes(): boolean {
        if (!this.chatBack) return false;
        return this.chatBack.node.active;
    }

    showActorLines = (type: ACTOR_LINES_TYPE, callback?: () => void) => {
        if (!this.chatBack || this.chatBack.node.active) {
            return;
        }

        if (DataMgr.checkInPowerGuide() && type != ACTOR_LINES_TYPE.POWER_GUIDE_CASHIER_UP_WORK && type != ACTOR_LINES_TYPE.POWER_GUIDE_CASHIER_SAY_THANKS) {
            return;
        }

        this.chatLab.string = ActorLinesHelper.getString(type, this);
        this.chatBack.node.active = true;
        this.chatBack.node.opacity = 0;
        this.chatBack.node.runAction(cc.sequence(cc.fadeIn(0.2), cc.delayTime(2), cc.callFunc(
            () => {
                this.chatBack.node.active = false;
                callback && callback();
            }
        )));
    };

    getJobType(): JobType {
        switch (this.getRoleType()) {
            case RoleType.CASHIER:
                return JobType.cashier;
            case RoleType.TALLYMAN:
                return JobType.tallyman;
            case RoleType.SALEMAN:
                return JobType.saleman;
            case RoleType.TOUTER:
                return JobType.touter;
            default:
                return JobType.cashier;
        }
    }

    isWorker() {
        return this.isRoleType(RoleType.CASHIER | RoleType.TALLYMAN | RoleType.TOUTER | RoleType.SALEMAN);
    }

    isCashier() {
        return this.isRoleType(RoleType.CASHIER);
    }

    isSaleman() {
        return this.isRoleType(RoleType.SALEMAN);
    }

    isCustomer() {
        return this.isRoleType(RoleType.CUSTOMER);
    }

    isEnemy() {
        return this.isRoleType(RoleType.ENEMY);
    }

    isRoleType(roleType: RoleType): boolean {
        const curRoleType: RoleType = this.getRoleType();
        return (roleType & curRoleType) == curRoleType;
    }

    getRoleType(): RoleType {
        return RoleType.ALL;
    }

    incrInteractive() {
        this.interactive++;
    }

    hadInteractive() {
        return this.interactive > 0;
    }

    resetInteractive() {
        this.interactive = 0;
    }

    setTimeout(timeout: number) {
        this.timeout = timeout;
    }

    show() {
        if (!this.node.active) {
            this.node.active = true;
        }

        this.changeFace(Face.SMILE, false);
    }

    hide() {
        if (this.node.active) {
            this.node.active = false;
        }
    };

    onDestroy() {
        this.dispose.dispose();
    }

    // protected playScaleToFadeOutAction = (icon: cc.Sprite) => {
    //     icon.node.active = true;
    //     icon.node.runAction(cc.sequence(cc.scaleTo(0.5, 1, 1), cc.delayTime(2), cc.fadeOut(0.5), cc.callFunc(
    //         () => {
    //             icon.node.scale = 0;
    //             icon.node.active = false;
    //         }
    //     )))
    // };
}