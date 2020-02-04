import {HttpInst} from "../../core/http/HttpClient";
import {JumpConst} from "../../global/const/JumpConst";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {ConfigMgr} from "../../global/manager/ConfigResManager";
import {GameManager} from "../../global/manager/GameManager";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";
import {ResManager} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr, IPhoneState} from "../../Model/DataManager";
import {CompositeDisposable} from "../../Utils/event-kit";
import {ButtonMgr} from "../common/ButtonClick";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {LongOrder} from "../longOrder/LongOrder";
import {FriendGoldRectuitPanel} from "../staff/recruitNew/recruitAni/gold/friendRecrtui/FriendGoldRectuitPanel";
import {TypePanel} from "../staff/recruitNew/TypePanel";
import {FutureState} from "./CacheMapDataManager";
import {CarMgr, CarName} from "./CarMoveManager";
import {MapMgr} from "./MapInit/MapManager";
import {IFreeOrderList, IOrderInfo} from "../../types/Response";
import randomOrder from "../randomOrder/randomOrder";
import {TimeUtil} from "../../Utils/TimeUtil";
import {UIUtil} from "../../Utils/UIUtil";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import {GuideIdType} from "../../global/const/GuideConst";


/**
 *@Athuor ljx
 *@Date 21:32
 */


/*
* 这个脚本里的所有物体的点击事件
* 都要做MapMgr.mapIsNormal()的检测！！在
* 装修模式下是不准许点击改脚本里的所有物体的！！
* */

const {ccclass, property} = cc._decorator;

enum FatherNodeZIndex {
    houseNode = 5000,
    cars = 4999
}

@ccclass

export default class MapAniManager extends cc.Component {

    @property(cc.Node)
    private houseNode: cc.Node = null;
    @property(cc.Node)
    private cars: cc.Node = null;
    @property(cc.Node)
    private orderNode2: cc.Node = null;
    @property(cc.Node)
    private orderScaleNode: cc.Node = null;
    @property(cc.Node)
    private recruit: cc.Node = null;
    @property(cc.Node)
    private recruitClick: cc.Node = null;
    @property(cc.Node)
    private longOrderCar: cc.Node = null;

    @property(cc.Node)
    private hole: cc.Node = null;
    @property(cc.Node)
    private rightDownHouse: cc.Node = null;
    @property(cc.Node)
    private recurit: cc.Node = null;
    @property(cc.Node)
    private station: cc.Node = null;
    @property(cc.Node)
    private orderNodes: cc.Node[] = [];
    @property(cc.Node)
    private arrowOfOrder: cc.Node = null;
    @property(cc.Node)
    private recruitArrow: cc.Node = null;
    @property(cc.Node)
    private trainNode: cc.Node = null;
    @property(cc.Node)
    private movieNode: cc.Node = null;
    @property(cc.Node)
    private movieClickArea: cc.Node = null;

    @property(cc.Node)
    private deng: cc.Node = null;
    @property(cc.Node)
    private longOrderHouse: cc.Node = null;
    @property(cc.Node)
    private longOrderClickArea: cc.Node = null;

    @property(cc.Node)
    private orderCar: cc.Node = null;
    @property(cc.Node)
    private orderHum: cc.Node = null;
    @property(cc.Node)
    private orderCarNode: cc.Node = null;
    @property(cc.Node)
    private orderTime: cc.Node = null;
    @property(cc.Label)
    private timeLabel: cc.Label = null;
    @property(cc.Animation)
    private smokeAni: cc.Animation = null;
    @property(cc.Node)
    private noOrderNode: cc.Node = null;
    @property(cc.Node)
    private haveOrderNode: cc.Node = null;
    @property(cc.Node)
    private orderBlock: cc.Node = null;
    @property(cc.Node)
    private orderAllNode: cc.Node = null;

    @property(cc.Sprite)
    private middleUpHouse: cc.Sprite = null;
    @property(cc.Sprite)
    private rightUpHouse: cc.Sprite = null;
    @property(cc.Sprite)
    private otherHouse: cc.Sprite = null;
    @property(cc.Sprite)
    private lowDownHouse: cc.Sprite = null;
    @property(cc.Sprite)
    private leftDownHouse: cc.Sprite = null;

    private time: number = 0;
    private isClick: boolean = false;

    private isMove: boolean = false;
    private spineUrl: string[] = [
        "longOrderHouseSpine",
        "xiaojiuwoSpine",
    ];

    private spriteUrl: string[] = [
        "longOrderHouseSprite",
        "xiaojiuwoSprite",
    ];

    private bigHouse: string[] = [
        "middleUp",
        "rightUpHouse",
        "rightDownHouse1",
        "lowDown",
        "leftDownHouse",
    ];

    private nodeMap: Map<string, cc.Node> = new Map<string, cc.Node>();

    private dispose: CompositeDisposable = new CompositeDisposable();

    private softGuide: cc.Node = null;

    protected start(): void {
        this.houseNode.zIndex = FatherNodeZIndex.houseNode;
        this.cars.zIndex = FatherNodeZIndex.cars;
        this.orderScaleNode.zIndex = 42;
        this.orderCar.zIndex = 50;
        this.orderHum.zIndex = 60;
        this.orderNodes[1].zIndex = 49;
        this.smokeAni.node.zIndex = 70;
        this._bindEvent();
        UIMgr.setRecruitNode(this.recurit);
        UIMgr.setStationNode(this.station);
        ClientEvents.FRIENT_RECRUIT_REMOVE_BUBBLE.on(() => {
            this.recruit.children[0].active = false;
        });
        UIMgr.setLongOrderHouseNode(this.longOrderHouse);
        this._addListener();
        this.hideCar();
        this.initBubble();
        UIMgr.setOrderNode(this.orderScaleNode);
        UIMgr.setARROrdeNode(this.arrowOfOrder);
        this.initMovieBubble();
        UIMgr.setMovieNode(this.movieNode);
    }

    hideCar = () => {
        if (DataMgr.checkHasLongOrderCar()) {
            this.longOrderCar.opacity = 255;
        } else {
            this.longOrderCar.opacity = 0;
        }
    };

    private _addListener() {
        this.dispose.add(ClientEvents.CHANGE_SEE_TO_SHARE.on(this.changeLabel));
        this.dispose.add(ClientEvents.GO_FRIEND_HOME.on(this.hideAllBubble));
        this.dispose.add(ClientEvents.BACK_HOME.on(this.showAllBubble));
        this.dispose.add(ClientEvents.LONG_ORDER_CAR_GO.on(this.longOrderCarMove));
        this.dispose.add(ClientEvents.SHOW_LONG_ORDER_CAR.on(this.showLongOrderCar));
        this.dispose.add(ClientEvents.SHOW_JUMP_ARROW.on(this.showJumpArrow));
        this.dispose.add(ClientEvents.HIDE_JUMP_ARROW.on(this.hideArrowOrder));
        this.dispose.add(ClientEvents.ORDER_CAR_RUN.on(this.loadOrderAway));
        //this.dispose.add(ClientEvents.UPDATE_ORDER_STATUS.on(this.showOrderAwayMove));
        this.dispose.add(ClientEvents.OPEN_ORDER_STATUS.on(this.setOpenOrder));
        this.dispose.add(ClientEvents.REFRESH_NEWDAY_ORDER.on(this.setNewDayOrder));
        this.dispose.add(ClientEvents.SHOW_PLANE.on(this.refreshTime));
        this.dispose.add(ClientEvents.REFRESH_ORDER_BUBBLE.on(this.showNewOrderBubble));
        this.dispose.add(ClientEvents.SHOW_ORDER_BUBBLE.on(this.refreshNewOrderBubble));
        this.dispose.add(ClientEvents.HIDE_JUMP_ARROW.on(() => {
            if (this.softGuide) {
                this.softGuide.active = false;
                this.softGuide.destroy();
                this.softGuide = null;
            }
        }));
        this.dispose.add(ClientEvents.SHOW_MOVIE_BUBBLE.on(this.initMovieBubble));
        this.dispose.add(ClientEvents.LOAD_BIG_HOUSE.on(this.loadOutside));
    }

    private loadOutside = () => {
        this.initByPhone();
        this.loadBigHouse();
    };

    private loadBigHouse = () => {
        UIUtil.asyncSetImage(this.middleUpHouse, ResManager.WX_HOUSE_DIR + this.bigHouse[0], false);
        UIUtil.asyncSetImage(this.rightUpHouse, ResManager.WX_HOUSE_DIR + this.bigHouse[1], false);
        UIUtil.asyncSetImage(this.otherHouse, ResManager.WX_HOUSE_DIR + this.bigHouse[2], false);
        UIUtil.asyncSetImage(this.lowDownHouse, ResManager.WX_HOUSE_DIR + this.bigHouse[3], false);
        UIUtil.asyncSetImage(this.leftDownHouse, ResManager.WX_HOUSE_DIR + this.bigHouse[4], false);
    };

    changeLabel = () => {
        this.movieNode.getChildByName("movieDesc").getComponent(cc.Label).string = "分享领奖";
    };

    releaseByPhone = () => {
        if (DataMgr.getPhoneState() === IPhoneState.HIGH) {
            ConfigMgr.releaseSprite(ResManager.HOLE_SPRITE, this.hole, true);
            ConfigMgr.releaseSprite(ResManager.RIGHT_DOWN_HOUSE_SPRITE, this.rightDownHouse, true);
        } else {
            ConfigMgr.releaseSpine(ResManager.HOLE, this.hole, true);
            ConfigMgr.releaseSpine(ResManager.RIGHT_DOWN_HOUSE, this.rightDownHouse, true);
            ConfigMgr.releaseSpine(ResManager.TRAIN, this.trainNode, true);
        }
    };

    initByPhone = () => {
        if (DataMgr.getPhoneState() === IPhoneState.HIGH) {
            this.initHoleSpine();
        } else {
            this.initHoleSprite();
        }
    };

    initHoleSpine() {
        let spine = this.hole.addComponent(sp.Skeleton);
        ConfigMgr.loadSpineRes(ResManager.HOLE, (skeletonData: sp.SkeletonData) => {
            MapAniManager._initSpine(cc.v2(-932, 375), this.hole, spine, skeletonData, "donghua");
            this.initTrain();
        });
    }

    initTrain() {
        let spine = this.trainNode.addComponent(sp.Skeleton);
        ConfigMgr.loadSpineRes(ResManager.TRAIN, (skeletonData: sp.SkeletonData) => {
            MapAniManager._initSpine(cc.v2(432, 1381), this.trainNode, spine, skeletonData, "run");
            this.initRightDownHouse();
        });
    }

    initRightDownHouse() {
        let downHouse = this.rightDownHouse.addComponent(sp.Skeleton);
        ConfigMgr.loadSpineRes(ResManager.RIGHT_DOWN_HOUSE, (skeletonData: sp.SkeletonData) => {
            this.recurit.setPosition(-144, 180);
            this.recruitArrow.setPosition(-144, 199);
            this.recruit.children[0].setPosition(-184, 216);
            MapAniManager._initSpine(cc.v2(714, -640), this.rightDownHouse, downHouse, skeletonData, "donghua");
            this.trainRun();
        });
    }

    private static _initSpine(pos: cc.Vec2, node: cc.Node, spine: sp.Skeleton, skeletonData: sp.SkeletonData, aniName: string) {
        spine.skeletonData = skeletonData;
        node && node.setPosition(pos);
        spine.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
        spine.setAnimation(0, aniName, true);
    }

    initHoleSprite() {
        this.unschedule(this.runSchedule);
        let sprite = this.hole.addComponent(cc.Sprite);
        ConfigMgr.loadSpriteFrameRes(ResManager.HOLE_SPRITE, (spriteFrame: cc.SpriteFrame) => {
            MapAniManager._initSprite(cc.v2(-812, 848), new cc.Size(992, 1065), this.hole, sprite, spriteFrame);
            this.initRightDownHouseSprite();
        });
    }

    initRightDownHouseSprite() {
        let sprite = this.rightDownHouse.addComponent(cc.Sprite);
        ConfigMgr.loadSpriteFrameRes(ResManager.RIGHT_DOWN_HOUSE_SPRITE, (spriteFrame: cc.SpriteFrame) => {
            this.recurit.setPosition(-144, 180);
            this.recruitArrow.setPosition(-144, 199);
            this.recruit.children[0].setPosition(-184, 216);
            MapAniManager._initSprite(cc.v2(714, -621), new cc.Size(896, 762), this.rightDownHouse, sprite, spriteFrame);
        });
    }

    private static _initSprite(pos: cc.Vec2, size: cc.Size, node: cc.Node, sprite: cc.Sprite, spriteFrame: cc.SpriteFrame) {
        sprite.spriteFrame = spriteFrame;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        node.setPosition(pos);
        node.setContentSize(size);
    }

    showJumpArrow = (jumpId: JumpConst) => {
        switch (jumpId) {
            case JumpConst.GOLD_RECRUIT:
            case JumpConst.DIAMOND_RECRUIT:
                this.showRecruitArrow();
                break;
            default:
                break;
        }
    };

    showOrderArrow = () => {
        this.orderNodes.forEach((value) => {
            value.active = false;
        });
        this.arrowOfOrder.active = true;
        this.moveBubble(this.arrowOfOrder, cc.v2(-37, 110));
    };

    showRecruitArrow = () => {
        this.recurit.active = false;
        this.recruitArrow.active = true;
        this.moveBubble(this.recruitArrow, cc.v2(-144, 199));
    };

    hideArrowOrder = () => {
        if (this.arrowOfOrder && this.arrowOfOrder.active) {
            this.arrowOfOrder.active = false;
            DataMgr.orderRedCheck();
        }
        if (this.recruitArrow && this.recruitArrow.active) {
            this.recurit.active = true;
            this.recruitArrow.active = false;
        }
    };

    private _bindEvent() {
        ButtonMgr.addClick(this.recruitClick, this.goRecruit, this.touchMoveEvent);
        ButtonMgr.addClick(this.longOrderClickArea, this.longOrderTouchEnd, this.touchMoveEvent);
        ButtonMgr.addClick(this.movieNode, this.movieBubbleClick, this.touchMoveEvent);
        ButtonMgr.addClick(this.movieClickArea, this.movieBubbleClick, this.touchMoveEvent);
        ButtonMgr.addClick(this.orderNode2, this.openOrderView, this.touchMoveEvent);
        ButtonMgr.addClick(this.orderHum, this.openOrderView, this.touchMoveEvent);
        ButtonMgr.addClick(this.orderNodes[1], this.openOrderView, this.touchMoveEvent);
    }

    openOrderView = () => {
        if (!this.isClick) return;
        if (!this.isMove) {
            if (MapMgr.mapIsNormal()) {
                this.hideArrowOrder();
                this.scaleAni(this.orderScaleNode);
                HttpInst.postData(NetConfig.GET_ORDER, [], (res: IOrderInfo) => {
                    if (this.softGuide) {
                        this.softGuide.active = false;
                        this.softGuide.destroy();
                        this.softGuide = null;
                    }
                    if (res.orderManager.orders.length > 0 && !this.orderTime.active) {
                        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2040", (this.orderNodes[1].active ? 1 : 0) + "");
                        DataMgr.orderData.setOrderList(res.orderManager);
                        UIMgr.hideMap();
                        UIMgr.showView(randomOrder.url);
                    } else {
                        let maxOrderNum: number = JsonMgr.getConstVal("everydayOrderNum");
                        if (res.orderManager.dailyNumber >= maxOrderNum) {
                            UIMgr.showTipText("今日订单次数已经用完啦!");
                        } else {
                            UIMgr.showTipText("当前暂无订单");
                        }
                    }
                });
            }
        }
        this.isMove = false;
    };

    refreshTime = () => {
        if (this.orderTime.active) {
            HttpInst.postData(NetConfig.GET_ORDER, [], (res: IOrderInfo) => {
                DataMgr.orderData.setOrderList(res.orderManager);
                this.setOrderStatus();
            });
        }
    };

    setOpenOrder = (isLock: boolean = false) => {
        HttpInst.postData(NetConfig.GET_ORDER, [], (res: IOrderInfo) => {
            DataMgr.orderData.setOrderList(res.orderManager);
            let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunOrder, 1);
            if (curSoftGuide && DataMgr.getGuideCompleteTimeById(curSoftGuide.id) <= 0 && isLock) {
                UIMgr.restOrderView(() => {
                });
                this.setNeworderAni();
            } else {
                let data: IFreeOrderList = DataMgr.orderData.getOrderList();
                if (data.orders.length > 0) {
                    UIMgr.restOrderView(() => {
                        if (!this.softGuide) {
                            let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunOrder, 1);
                            this.showOrderHumGuide(curSoftGuide);
                        }
                    });
                } else {
                    UIMgr.showTipText("暂时没有补给订单，请稍等片刻~");
                }
            }
        });
    };

    setNeworderAni() {
        let action = cc.sequence(cc.fadeOut(1), cc.callFunc(() => {
            this.haveOrderNode.active = true;
            this.noOrderNode.active = false;
        }));
        this.orderBlock.runAction(action);
        this.loadOrderDelivery();
    }

    setNewDayOrder = () => {
        let isLevel: boolean = JsonMgr.isFunctionOpen(FunctionName.order);
        if (isLevel && this.noOrderNode.active) {
            this.setNeworderAni();
        }
    };

    setOrderStatus = () => {
        this.isClick = true;
        DataMgr.orderData.setOrderClick(this.isClick);
        let data: IFreeOrderList = DataMgr.orderData.getOrderList();
        let maxOrderNum: number = JsonMgr.getConstVal("everydayOrderNum");
        let isLevel: boolean = JsonMgr.isFunctionOpen(FunctionName.order);
        this.haveOrderNode.active = isLevel;
        this.noOrderNode.active = !isLevel;
        if (!data) return;
        let serTime: number = DataMgr.getServerTime();
        this.time = data.refreshTime - serTime;
        let isShow: boolean = data.orders.length == 0 && data.dailyNumber < maxOrderNum && this.time > 0;
        this.orderTime.active = isShow;
        this.orderCarNode.active = data.orders.length > 0;
        this.haveOrderNode.active = data.completeNumber < maxOrderNum;
        this.noOrderNode.active = data.completeNumber >= maxOrderNum;
        if (isShow) {
            this.showOrderTime();
        } else if (data.orders.length > 0) {
            this.orderHumAction(false);
        }
    };

    private orderHumAction(showSmoke: boolean) {
        if (showSmoke) {
            this.smokeAni.node.active = true;
            this.smokeAni.on("stop", this.showOrderHum);
            UIUtil.asyncPlayAnim(this.smokeAni, "platform/animation/smoke");
        } else {
            this.showOrderHum();
        }
    }

    private showOrderHum = () => {
        this.smokeAni.node.active = false;
        this.orderHum.active = true;
        let spine = this.orderHum.getChildByName("orderHum").getComponent(sp.Skeleton);
        UIUtil.asyncPlaySpine(spine, ResManager.RANDOM_ORDER + "order_waimaiyuan/order_waimaiyuan", "zhanli", true, this.setHumBubble);
    };

    setHumBubble = () => {
        let curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.FunOrder, 1);
        if (curSoftGuide && DataMgr.getGuideCompleteTimeById(curSoftGuide.id) <= 0) {
            HttpInst.postData(NetConfig.SOFT_LED_INFO, [curSoftGuide.id], () => {
                UIMgr.restOrderView(() => {
                    if (!this.softGuide) {
                        DotInst.clientSendDot(COUNTERTYPE.softGuide, "19062");
                        this.showOrderHumGuide(curSoftGuide);
                    }
                })
            });
        } else {
            DataMgr.orderData.isCanCompleted();
        }
    };

    // showOrderAwayMove = () => {
    //     let data: IFreeOrderList = DataMgr.orderData.getOrderList();
    //     let maxOrderNum: number = JsonMgr.getConstVal("everydayOrderNum");
    //     if (!this.orderTime.active && data.dailyNumber < maxOrderNum && this.isClick) {
    //         this.loadOrderAway();
    //     }
    // };

    private loadOrderAway = () => {
        this.isClick = false;
        DataMgr.orderData.setOrderClick(this.isClick);
        this.orderNodes[1].active = false;
        this.haveOrderNode.active = true;
        this.noOrderNode.active = false;
        this.orderCar.active = true;
        let data: IFreeOrderList = DataMgr.orderData.getOrderList();
        let spine = this.orderCar.getComponent(sp.Skeleton);
        UIUtil.asyncPlaySpine(spine, ResManager.RANDOM_ORDER + "map_waimaiche/map_waimaiche",
            "animation", true, () => {
                let run = cc.callFunc(() => {
                    this.orderCar.setPosition(cc.v2(-45, -63));
                    this.orderHum.active = false;
                    this.orderCarNode.active = false;
                    this.orderTime.active = false;
                });
                let endAni = cc.moveTo(3, cc.v2(-1247, 561));
                let back = cc.callFunc(() => {
                    if (data.orders.length === 0) {
                        let maxOrderNum: number = JsonMgr.getConstVal("everydayOrderNum");
                        this.isClick = true;
                        DataMgr.orderData.setOrderClick(this.isClick);
                        if (data.dailyNumber >= maxOrderNum) {
                            this.noOrderNode.active = true;
                            this.haveOrderNode.active = false;
                        } else {
                            let serTime: number = DataMgr.getServerTime();
                            this.time = data.refreshTime - serTime;
                            this.showOrderTime();
                            this.orderTime.active = true;
                            this.orderNodes.forEach((value) => {
                                value.active = false;
                            });
                        }
                    } else {
                        this.loadOrderDelivery();
                    }
                });
                this.orderCar.runAction(cc.sequence(run, endAni, back));
            });
    };

    private loadOrderDelivery() {
        HttpInst.postData(NetConfig.GET_ORDER, [], (res: IOrderInfo) => {
            DataMgr.orderData.setOrderList(res.orderManager);
            let orderAni = (cb: Function) => {
                this.isClick = false;
                DataMgr.orderData.setOrderClick(this.isClick);
                if (!this.orderCar) return;
                this.orderCar.active = true;
                this.orderCar.setPosition(cc.v2(1294, -721));
                let spine = this.orderCar.getComponent(sp.Skeleton);
                this.orderCar.runAction(cc.sequence(cc.callFunc(() => {
                    UIUtil.asyncPlaySpine(spine, ResManager.RANDOM_ORDER + "map_waimaiche/map_waimaiche",
                        "animation", true);
                }), cc.moveTo(3, cc.v2(-45, -63)).easing(cc.easeCubicActionOut()), cc.callFunc(() => {
                    this.isClick = true;
                    DataMgr.orderData.setOrderClick(this.isClick);
                    this.orderCarNode.active = true;
                    this.orderCar.active = false;
                    this.orderHumAction(true);
                    cb();
                })));
            };
            CarMgr.addCarToQue({carName: CarName.OrderCar, cb: orderAni});
        });
    }

    private showOrderHumGuide(curSoftGuide) {
        this.orderNodes[1].active = false;
        GuideMgr.showSoftGuide(this.orderHum, ARROW_DIRECTION.BOTTOM, curSoftGuide.displayText, (node: cc.Node) => {
            node.scale = 0.72;
            this.softGuide = node;
        }, false, -20, false, () => {
            this.openOrderView();
        });
    }

    private showOrderTime() {
        this.timeLabel.string = "新订单倒计时\n" + TimeUtil.getTimeHouseStr(this.time);
        this.schedule(this.timeCallBack, 1);
    }

    private timeCallBack = () => {
        this.time -= 1000;
        if (this.time > 0) {
            this.timeLabel.string = "新订单倒计时\n" + TimeUtil.getTimeHouseStr(this.time);
        } else {
            this.orderTime.active = false;
            this.loadOrderDelivery();
            this.unschedule(this.timeCallBack);
        }
    };

    initSpine = (index: number, cb: Function) => {
        if (index < this.spineUrl.length) {
            this.loadLongOrderRes(index, this.spineUrl[index], this.initSpine, cb);
        } else {
            cb && cb();
        }
    };

    initSprite(index: number, cb: Function) {
        if (index < this.spriteUrl.length) {
            this.loadLongOrderRes(index, this.spriteUrl[index], this.initSprite, cb);
        } else {
            cb && cb();
        }
    }

    loadLongOrderRes(index: number, url, afterDo: Function, cb?: Function) {
        cc.loader.loadRes(ResManager.LONG_ORDER_HOUSE[0] + url, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
            if (error) {
                cc.log(error);
            } else {
                index++;
                let node = cc.instantiate(prefab);
                this.nodeMap.set(url, node);
                UIMgr.getHouseNode().addChild(node);
                afterDo && afterDo(index, cb);
            }
        });
    }

    touchMoveEvent = (event: cc.Event.EventTouch) => {
        this.isMove = UIMgr.moveOverried(event);
    };

    longOrderTouchEnd = () => {
        if (MapMgr.mapIsNormal()) {
            if (!this.isMove) {
                ClientEvents.HIDE_JUMP_ARROW.emit();
                this.scaleAni(this.longOrderHouse, true);
            }
            this.isMove = false;
        }
    };

    showLongCar() {
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2041", (MapMgr.longOrderBubbleState ? 1 : 0) + "");
        HttpInst.postData(NetConfig.LONG_ORDER_INFO,
            [], () => {
                UIMgr.showView(LongOrder.url, null, null, null, true);
            });
    }

    scaleAni = (node: cc.Node, isLongOrder = false) => {
        let scaleAni = cc.scaleTo(0.1, 1.05);
        let scaleBackAni = cc.scaleTo(0.1, 1);
        node.runAction(cc.sequence(scaleAni, scaleBackAni, cc.callFunc(() => {
            isLongOrder && this.showLongCar();
        })));
    };

    goRecruit = () => {
        if (!this.isMove) {
            let state = MapMgr.getMapState();
            if (state == FutureState.ACCESS && !JsonMgr.isFunctionOpen(FunctionName.goldDraw)) {
                return;
            }
            if (state !== FutureState.DECORATE) {
                this.hideArrowOrder();
                this.scaleAni(this.recruit, false);
            }
            switch (state) {
                case FutureState.NORMAL:
                    DotInst.clientSendDot(COUNTERTYPE.mainPage, "2042");
                    this.openRecruit();
                    break;
                case FutureState.ACCESS:
                    if (!DataMgr.friendData.hasRecruitBubble) {
                        UIMgr.showTipText("当前没有可招募的员工");
                        break;
                    }
                    HttpInst.postData(NetConfig.getFriendRecruitInfo,
                        [DataMgr.friendData.id], () => {
                            console.log("好友招募数据  ", DataMgr.getFriendRecruit());
                            UIMgr.showView(FriendGoldRectuitPanel.url, cc.director.getScene(), true, null, false);
                        });
                    break;
            }
        }
        this.isMove = false;
    };

    openRecruit() {
        HttpInst.postData(NetConfig.getRecruitInfo,
            [], (resp) => {
                UIMgr.showView(TypePanel.url, null, resp, () => {
                    DataMgr.setClickTaskJumpMap(0);
                }, true);
            });
    }

    longOrderCarMove = (count: number) => {
        for (let i = 0; i < count; i++) {
            let moveAni = (cb: Function) => {
                if (!this.longOrderCar) return;
                let spine = this.longOrderCar.getComponent(sp.Skeleton);
                UIUtil.asyncSetSpine(spine, "platform/spine/longOrderCar/map_huoche", () => {
                    this.longOrderCar.runAction(cc.sequence(cc.spawn(cc.moveTo(5, cc.v2(859, -1414)), cc.callFunc(() => {
                        spine.setAnimation(0, "run", true);
                    })), cc.callFunc(() => {
                        this.longOrderCar.setPosition(cc.v2(-1069, -478));
                        if (i === count - 1) {
                            this.hideCar();
                        }
                    }), cc.moveTo(1, cc.v2(-719, -639)).easing(cc.easeCubicActionOut()), cc.callFunc(() => {
                        spine.setAnimation(0, "stop", true);
                        cb();
                    })));
                });
            };
            CarMgr.addCarToQue({carName: CarName.LongOrderCar, cb: moveAni});
        }
    };

    showLongOrderCar = () => {
        let spine = this.longOrderCar.getComponent(sp.Skeleton);
        if (!spine.skeletonData) {
            UIUtil.asyncSetSpine(spine, "platform/spine/longOrderCar/map_huoche", () => {
                this.doShowLongOrderCar(spine);
            });
        } else {
            this.doShowLongOrderCar(spine);
        }
    };

    private doShowLongOrderCar(spine: sp.Skeleton) {
        if (this.longOrderCar.opacity === 0) {
            this.longOrderCar.runAction(cc.sequence(cc.callFunc(() => {
                this.longOrderCar.setPosition(cc.v2(-1069, -478));
                this.hideCar();
            }), cc.moveTo(1, cc.v2(-719, -639)).easing(cc.easeCubicActionOut()), cc.callFunc(() => {
                spine.setAnimation(0, "stop", true);
            })));
        }
    }

    refreshNewOrderBubble = (isShow: boolean) => {
        if (this.softGuide) {
            this.softGuide.active = false;
            this.softGuide.destroy();
            this.softGuide = null;
        }
        if (this.orderHum.active && !this.orderNodes[1].active && this.isClick) {
            this.showNewOrderBubble(isShow);
        }
    };

    showNewOrderBubble = (isCan: boolean) => {
        let newOrder = this.orderNodes[1];
        let mapState = MapMgr.getMapState();
        if (mapState === FutureState.NORMAL) {
            newOrder.active = isCan;
            if (newOrder.active) {
                this.moveBubble(newOrder, cc.v2(-131, 162));
            }
        }
    };

    checkShowState(node: boolean) {
        return !node;
    }

    hideAllBubble = () => {
        this.orderNodes.forEach((value) => {
            value.active = false;
        });
        this.orderAllNode.active = false;
        this.recurit.active = false;
        this.arrowOfOrder.active = false;
        this.recruitArrow.active = false;
        this.checkRecruitBubble();
        this.movieNode.active = false;
    };

    checkRecruitBubble() {
        this.recruit.children[0].active = MapMgr.getMapState() == FutureState.ACCESS && DataMgr.friendData.hasRecruitBubble && JsonMgr.isFunctionOpen(FunctionName.goldDraw);
    }

    showAllBubble = () => {
        this.initBubble();
        this.initMovieBubble();
    };

    initBubble() {
        this.checkRecruitBubble();
        DataMgr.orderRedCheck();
        this.recurit.active = true;
        this.orderAllNode.active = true;
        DataMgr.orderData.isCanCompleted();
    }

    moveBubble(node: cc.Node, pos: cc.Vec2) {
        this.clearBubbleAni(node);
        node.opacity = 0;
        node.setPosition(pos);
        node.runAction(cc.sequence(cc.fadeIn(.2), cc.callFunc(() => {
            node.runAction(cc.repeatForever(cc.sequence(cc.moveBy(.7, 0, 15), cc.moveBy(.7, 0, -15))));
        })));
    }

    clearBubbleAni(node: cc.Node) {
        node.stopAllActions();
    }

    clearAction(spine: sp.Skeleton) {
        spine.animation = null;
    }

    bearRunAction(node: cc.Node, delaytime: number, cb?: Function) {
        node.runAction(cc.sequence(cc.delayTime(delaytime), cc.moveTo(7, cc.v2(-757, 1088)), cc.callFunc(() => {
            node.setPosition(-221, 1384);
            this.clearAction(node.getComponent(sp.Skeleton));
            cb && cb();
        })));
    }

    bearWalkAction(node: cc.Node, delaytime: number, pos: cc.Vec2, cb?: Function) {
        node.runAction(cc.sequence(cc.delayTime(delaytime), cc.moveTo(14, pos), cc.callFunc(() => {
            this.clearAction(node.getComponent(sp.Skeleton));
            cb && cb();
        })));
    }

    trainRun = () => {
        this.schedule(this.runSchedule, 10);
    };

    runSchedule = () => {
        this.trainNode.setPosition(432, 1381);
        this.trainNode.runAction(cc.moveTo(3, cc.v2(-1082, 602)));
    };

    private initMovieBubble = () => {
        let adInfo = DataMgr.getAdInfoById(1);
        if (!adInfo) return;
        let count = adInfo.number > 0 ? adInfo.number : 0;
        let json = JsonMgr.getAdvertisements(1);
        let positionId = DataMgr.userData.positionId;
        let needId = JsonMgr.getFunctionOpenByName(FunctionName.movie).value;
        let show = needId <= positionId && GameManager.isHaveAdUnitId() && json.count > count;
        this.movieNode.active = show;
        show && this.moveBubble(this.movieNode, cc.v2(172, -60));
        if (!DataMgr.isCanWatchAdvert()) {
            this.changeLabel();
        }
    };

    private movieBubbleClick = () => {
        if (!GameManager.isHaveAdUnitId()) {
            UIMgr.showTipText("电影院功能暂未开启");
        } else {
            if (this.movieNode.active) {
                DotInst.clientSendDot(COUNTERTYPE.seeMovie, "13001");
                UIMgr.showMoviePanel(1);
            }
        }
    };

    protected onDestroy(): void {
        this.dispose.dispose();
    }
}
