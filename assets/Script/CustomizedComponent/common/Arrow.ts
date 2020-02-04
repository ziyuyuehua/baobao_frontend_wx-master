import { ARROW_DIRECTION } from "./SoftGuide";
import { CompositeDisposable } from "../../Utils/event-kit";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { ButtonMgr } from "./ButtonClick";
import {DataMgr} from "../../Model/DataManager";

const { ccclass, property } = cc._decorator;

export enum ArrowType {
    LongOrderArrow = 1,    //长途订单
    // StaffSpecialArrow = 2, //特质软引
    StaffLevelUp = 3,
    FosterCareArrow = 4,//寄养软引
    FavorArrow = 5,//好感度软引
    StaffTraining = 6,
    FriendsArrow = 7,//添加好友
    BigMapArrow = 8, //大地图软引导
    BigMapOpenArrow = 9,
    StaffPosts = 10,//员工岗位
    Order = 11, //订单
    ExpandFrame = 12,   //店铺信息
    PopularityUp = 13,  //招牌升级

    GoldRecruit = 50, // 钻石招募
    DiamondRecruit = 55, // 金币招募

    LongOrder = 60, // 长途货运
}

const SPACE: number = 10;

@ccclass
export default class Arrow extends cc.Component {

    @property(cc.Boolean)
    private vertical: boolean = false;

    @property(cc.Sprite)
    private back: cc.Sprite = null;

    @property(cc.Node)
    private horn: cc.Node = null;

    @property(cc.Sprite)
    private hornSprite: cc.Sprite = null;

    @property(cc.SpriteFrame)
    private hornDown: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private hornUp: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private hornLeft: cc.SpriteFrame = null;

    @property(cc.Label)
    private tipsLab: cc.Label = null;
    @property(cc.Node)
    private clickNode: cc.Node = null;
    private cb: Function = null;

    private offset: cc.Vec2 = cc.v2(0, 0);

    private initState: boolean = true;
    private hasDoAni: boolean = false;
    private dispose: CompositeDisposable = new CompositeDisposable();

    setDirection(direction: ARROW_DIRECTION, bindDispose: boolean = false, offsetX: number = 0) {
        bindDispose && this._addListener();
        switch (direction) {
            case ARROW_DIRECTION.BOTTOM: {
                this.node.scaleX = 1;
                this.hornSprite.spriteFrame = this.hornDown;
                this.tipsLab.node.scaleX = 1;
                this.horn.setPosition(cc.v2(offsetX, -71));
                this.offset = cc.v2(0, SPACE);
            }
                break;
            case ARROW_DIRECTION.TOP: {
                this.node.scaleX = 1;
                this.hornSprite.spriteFrame = this.hornUp;
                this.tipsLab.node.scaleX = 1;
                this.horn.setPosition(offsetX, 81);
                this.offset = cc.v2(0, -SPACE);
            }
                break;
            case ARROW_DIRECTION.RIGHT: {
                this.node.scaleX = -1;
                this.hornSprite.spriteFrame = this.hornLeft;
                this.horn.setPosition(cc.v2(-131, 0));
                this.tipsLab.node.scaleX = -1;
                this.offset = cc.v2(SPACE, 0);
            }
                break;
            case ARROW_DIRECTION.LEFT: {
                this.node.scaleX = 1;
                this.hornSprite.spriteFrame = this.hornLeft;
                this.horn.setPosition(cc.v2(-131, 0));
                this.tipsLab.node.scaleX = 1;
                this.offset = cc.v2(SPACE, 0);
            }
                break;
            default:
                break;
        }
    }

    protected start(): void {
        ButtonMgr.addClick(this.clickNode, this.bindCbEvent);
    }

    protected onEnable(): void {
        this.node.active = !DataMgr.checkInPowerGuide();
    }

    setTipsLab(text: string) {
        this.tipsLab.node.scaleX = this.node.scaleX;
        this.tipsLab.string = text.replace("\\n", "\n");;
    }

    fadeIn() {
        this.node.opacity = 0;
    }

    runAction(isBindDispose: boolean) {
        if (!this.hasDoAni) {
            let originPos = this.node.position.clone();
            let targetPos = cc.v2(originPos.x + this.offset.x, originPos.y + this.offset.y);
            if (this.node.active === false) {
                return;
            }
            this.hasDoAni = true;
            if (isBindDispose) {
                this.node.runAction(cc.repeatForever(cc.sequence(cc.fadeIn(.2), cc.moveTo(0.35, targetPos).easing(cc.easeSineIn()), cc.moveTo(0.35, originPos).easing(cc.easeSineOut()))));
            } else {
                this.node.runAction(cc.repeatForever(cc.sequence(cc.moveTo(0.35, targetPos).easing(cc.easeSineIn()), cc.moveTo(0.35, originPos).easing(cc.easeSineOut()))));
            }
        }

    }

    //
    // protected onEnable(): void {
    //     this.runAction();
    // }

    stopAction() {
        this.node.stopAllActions();
    }

    // onLoad() {
    //     this.node.setScale(this.node.scaleX * 0.8, this.node.scaleY * 0.8);
    //     this.getPosition = this.node.getPosition();
    //     this.arrow();
    // }

    // onEnable() {
    //     let lv = JsonMgr.getConstVal("guideArrow");
    //     if (!lv) {
    //         // lv = 4
    //         cc.log("软引导限制等级不纯在")
    //         return;
    //     }
    //     this.node.active = DataMgr.userData.level <= 10;
    //     // if (this.node.active) {
    //     //     this.node.setPosition(this.getPosition);
    //     //     this.arrow(this.vertical);
    //     // }
    // }

    // arrow() {
    //
    //     let x = 0;
    //     let y = 0;
    //     if (this.vertical) {
    //         x = 0;
    //         y = 10
    //     } else {
    //         x = 10;
    //         y = 0;
    //     }
    //     let width1 = this.node.getPosition().x - x;
    //     let width2 = this.node.getPosition().x;
    //     let width3 = this.node.getPosition().x + x;
    //
    //     let height1 = this.node.getPosition().y - y;
    //     let height2 = this.node.getPosition().y;
    //     let height3 = this.node.getPosition().y + y;
    //     // let active1 = cc.repeatForever(cc.sequence(cc.moveTo(0.35, width1, height1), cc.moveTo(0.7, width3, height3), cc.moveTo(0.35, width2, height2)));
    //     this.node.stopAllActions();
    //     this.node.runAction(cc.repeatForever(cc.sequence(cc.moveTo(0.35, width1, height1), cc.moveTo(0.7, width3, height3), cc.moveTo(0.35, width2, height2))));
    // }

    private _addListener() {
        this.dispose.add(ClientEvents.HIDE_JUMP_ARROW.on(this.close));
    }

    close = () => {
        ClientEvents.CHANGE_ARR_BY_STATE.emit(true);
        this.node.destroy();
    };

    initCb = (cb: Function) => {
        this.cb = cb;
    };

    bindCbEvent = () => {
        this.cb && this.cb();
    };

    protected onDestroy(): void {
        this.dispose.dispose();
    }
}
