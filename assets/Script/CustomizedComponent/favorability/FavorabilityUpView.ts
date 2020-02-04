import {GameComponent} from "../../core/component/GameComponent";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {itemType, JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr, GIFT_TYPE, IPhoneState} from "../../Model/DataManager";
import {Staff} from "../../Model/StaffData";
import {HttpInst} from "../../core/http/HttpClient";
import {ButtonMgr} from "../common/ButtonClick";
import {StaffRole} from "../staff/list/StaffRole";
import FavorabilityDetail from "./FavorabilityDetail";
import FavorabilityUpScItem from "./FavorabilityUpScItem";
import FavorUpGift from "./FavorUpGift";
import {FavorAniType, FavorType} from "./FavorHelp";
import FavorAniItem from "./FavorAniItem";
import {Direction, Role} from "../map/Role";
import {ArrowType} from "../common/Arrow";
import {sleep} from "../staff/recruitNew/DiamondRecruitAni";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import favorLvUpAward from "./favorLvUpAward";
import breakAniView from "./breakAniView";
import {UIUtil} from "../../Utils/UIUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FavorabilityUpView extends GameComponent {
    static url: string = "favorability/FavorabilityUpView";

    @property(cc.Layout)
    favorabilityLayout: cc.Layout = null;

    @property(cc.Prefab)
    favorabilityprefab: cc.Prefab = null;

    @property(StaffRole)
    staffRole: StaffRole = null;

    @property(cc.Node)
    closeBtn: cc.Node = null;

    @property(cc.Label)
    labelTip: cc.Label = null;

    @property(cc.Node)
    giftShow: cc.Node = null;

    @property(cc.Node)
    giftRespone: cc.Node = null;

    @property(cc.ProgressBar)
    favorProgress: cc.ProgressBar = null;

    @property(cc.Label)
    favorProgressLab: cc.Label = null;

    @property(cc.Node)
    breakThrough: cc.Node = null;

    @property(cc.Sprite)
    breakItemQuIcon: cc.Sprite = null;

    @property(cc.Sprite)
    breakItemIcon: cc.Sprite = null;

    @property(cc.Label)
    breakItemNumber: cc.Label = null;

    @property(cc.Button)
    breakButton: cc.Button = null;

    @property(cc.Node)
    favorUpGiftNode: cc.Node = null;

    @property(cc.Node)
    favorBreakLastNode: cc.Node = null;

    @property(cc.Node)
    BreakTipNode: cc.Node = null;

    @property(cc.Prefab)
    favorUpPrefab: cc.Prefab = null;

    @property(cc.Node)
    favorDetail: cc.Node = null;

    @property(cc.Sprite)
    favorCurSpri: cc.Sprite = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.Label)
    favorIconLv: cc.Label = null;

    @property(cc.Animation)
    bomEffect: cc.Animation = null;

    @property(cc.Animation)
    heartEffect: cc.Animation = null;

    @property(cc.Animation)
    lightRotate: cc.Animation = null;

    @property(cc.Node)
    progressBar: cc.Node = null;

    @property(cc.Sprite)
    AnimationSpr: cc.Sprite = null;

    @property(cc.Animation)
    favorLvUpStar: cc.Animation = null;

    @property(cc.Node)
    getGiftNode: cc.Node = null;

    @property(cc.Node)
    getItemNode: cc.Node = null;

    @property(cc.Prefab)
    getItemPre: cc.Prefab = null;

    @property(cc.Prefab)
    addAttrPre: cc.Prefab = null;

    @property(cc.Node)
    aniBlockNode: cc.Node = null;

    @property(sp.Skeleton)
    favorXinSkelet: sp.Skeleton = null;

    @property(sp.Skeleton)
    attUpSkelet: sp.Skeleton = null;

    @property(cc.Node)
    private handNode: cc.Node = null;

    @property(cc.Animation)
    private lightAni: cc.Animation = null;

    @property(cc.Animation)
    private progressAni: cc.Animation = null;

    @property(cc.Animation)
    private breakProgressAni: cc.Animation = null;

    @property(cc.Animation)
    private breakStaffAni: cc.Animation = null;

    @property(cc.Animation)
    private progressAddAni: cc.Animation = null;

    @property(cc.Node)
    private favorArrow: cc.Node = null;

    @property(sp.Skeleton)
    private xinxinAni: sp.Skeleton = null;

    @property(cc.Node)
    private guideNode: cc.Node = null;

    @property(cc.Label)
    private breakAttrName: cc.Label = null;

    @property(cc.Sprite)
    private breakAttrIcon: cc.Sprite = null;

    @property(cc.Label)
    private breakAttrNum: cc.Label = null;

    private index: number = 0;
    curStaff: Staff = null;
    favorItemArr: FavorabilityUpScItem[] = [];
    BreakItemId: number = 0;
    private FavorUpGiftView: FavorUpGift = null;
    private remeberX: number = 0;
    private AniSequenceMap: Map<number, any> = new Map<number, any>();
    private aniPlayArr: cc.Node[] = [];
    private curFavorStage: number = 0;
    private curFavorLevel: number = 0;
    private curFavorJson: IFavorLevelJson = null;

    private favorUpStaff: Staff = null;

    private startPosX: number = 0;
    private startPosY: number = 0;

    private rolePosX: number = 0;
    private rolePosY: number = 0;
    private starIndex: number = 0;

    getBaseUrl() {
        return FavorabilityUpView.url;
    }

    onLoad() {
        //this.bomEffect.on(cc.Animation.EventType.STOP, this.animationEndHandler);
        this.heartEffect.on(cc.Animation.EventType.FINISHED, this.animationEndHandler);
        this.favorLvUpStar.on(cc.Animation.EventType.FINISHED, () => {
            this.favorLvUpStar.node.active = false;
        })
        this.progressAddAni.on(cc.Animation.EventType.FINISHED, () => {
            this.progressAddAni.node.active = false;
        })
        this.progressAni.on("stop", () => {
            this.progressAddAni.node.active = true;
            this.progressAddAni.node.x = this.progressBar.width;
            this.progressAddAni.play();
        })
        this.lightRotate.on(cc.Animation.EventType.FINISHED, () => {
            this.lightRotate.node.active = false;
        })
        ButtonMgr.addClick(this.closeBtn, () => {
            DataMgr.setPlayAnimation(true);
            DotInst.clientSendDot(COUNTERTYPE.staff, "6022");
            this.closeOnly();
            ClientEvents.UPDATE_POP.emit();
            ClientEvents.UPDATE_STAFF_VIEW.emit();
            ClientEvents.UPDATE_STAFF_ITEM.emit();
        });
        this.dispose.add(ClientEvents.GOON_PLAY_ANIMATION.on(() => {
            if (this.favorUpStaff.favorLevel > 0) {
                UIMgr.showView(favorLvUpAward.url, null, {
                    staffId: this.curStaff.xmlId,
                    favorStage: this.curStaff.favorStage,
                    startLv: 1,
                    endLv: this.favorUpStaff.favorLevel,
                })
            }
        }))
        this.attUpSkelet.setCompleteListener(() => {
            this.attUpSkelet.node.active = false;
        });
        ButtonMgr.addClick(this.breakButton.node, this.breakHandler);
        ButtonMgr.addClick(this.breakItemQuIcon.node, this.openSourceHandler);
        ButtonMgr.addClick(this.favorDetail, this.openFactorDetailHandler);
        this.dispose.add(ClientEvents.PLAY_FAVORABLITY_ANi.on(this.playStaffAni));
        this.dispose.add(ClientEvents.FAVOR_ARROW.on(this.refreshFavorArrow));
        this.dispose.add(ClientEvents.UPDATE_FAVOR_VIEW.on(this.setStaff));
        this.dispose.add(ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.on(this.setStaff));
    }

    onEnable() {
        this.onShowPlay(2, this.aniNode);
    }

    setGuidePos() {
        this.startPosX = 108 * this.index + 59;
        this.startPosY = this.handNode.y;
        this.refreshFavorArrow(true);
    }

    start() {
        this.remeberX = this.closeBtn.x;
        DataMgr.setPlayAnimation(false);
        //开启碰撞
        let man = cc.director.getCollisionManager();
        man.enabled = true;
        this.addItem();
        this.curStaff = DataMgr.getChooseStaff();
        this.setStaff();
        this.rolePosX = this.staffRole.node.x;
        this.rolePosY = this.staffRole.node.y;

    }

    refreshFavorArrow = (isGuide: boolean) => {
        let level: number = DataMgr.userData.level;
        let guide: number = DataMgr.getGuideCompleteTimeById(ArrowType.FavorArrow);
        this.favorArrow.x = this.startPosX;
        if (isGuide && level < 7 && guide <= 0) {
            this.setFavorArrowAni();
            this.favorArrow.active = true;
        } else {
            this.favorArrow.active = false;
            this.lightAni.node.active = false;
            this.handNode.stopAllActions();
            this.handNode.active = false;
            this.unscheduleAllCallbacks();
        }
    }

    setFavorArrowAni = () => {
        this.lightAni.node.x = this.startPosX;
        let pos = this.staffRole.node.convertToWorldSpaceAR(cc.v2(0, 0));
        this.schedule(() => {
            this.lightAni.node.active = true;
            this.handNode.active = true;
            this.lightAni.play();
            this.handNode.setPosition(cc.v2(this.startPosX, this.startPosY));
            this.lightAni.on("stop", () => {
                this.lightAni.node.active = false;
                let action = cc.sequence(cc.moveTo(1, 277, 229), cc.callFunc(() => {
                    //this.unscheduleAllCallbacks();
                    this.scheduleOnce(() => {
                        this.handNode.active = false;
                    }, 0.5);
                }));
                this.handNode.stopAllActions();
                this.handNode.runAction(action);
            });
        }, 3);
    }

    setStaff() {
        this.curStaff = DataMgr.getChooseStaff();
        this.staffRole.init(this.curStaff, Direction.LEFT, false, Role.IDEL_ACTION, Role.SMILE_SKIN);
        this.curFavorStage = this.curStaff.favorStage;
        this.curFavorLevel = this.curStaff.favorLevel;
        let favorJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.curStaff.favorStage, this.curStaff.favorLevel);
        ResMgr.getFavorIcon(this.favorCurSpri, favorJson.icon);
        this.favorIconLv.node.active = false;
        if (favorJson.iconLevel) {
            this.favorIconLv.node.active = true;
            this.favorIconLv.string = favorJson.iconLevel + "";
        }
        if (!favorJson.cost) {
            this.favorProgress.progress = 1;
            this.favorProgressLab.string = "已满级";
            this.closeBtn.x = 0;
            this.breakThrough.active = false;
            this.favorabilityLayout.node.active = false;
            this.labelTip.string = "好感度已达满级";
            this.favorUpGiftNode.active = false;
            this.getGiftNode.opacity = 0;
            this.aniBlockNode.active = false;
            this.BreakTipNode.active = false;
            return;
        }
        this.favorUpGiftNode.active = true;
        this.getGiftNode.active = true;
        this.favorProgressLab.string = this.curStaff.favorExp + "/" + favorJson.cost;
        let pro = this.curStaff.favorExp / favorJson.cost;
        this.favorProgress.progress = pro > 1 ? 1 : pro;
        this.setBreakStatue(false);
        this.setFavorUpGift();
        if (pro >= 1) {
            let favorJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.curStaff.favorStage, this.curStaff.favorLevel + 1);
            if (!favorJson) {
                this.setBreakStatue(true);
                this.setBreakThrough();
                this.setBreakGift();  //突破增加属性奖励
            }
        }
    }

    setBreakGift() {
        let nextfavor: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.curStaff.favorStage + 1, 0);
        let favorId: number = nextfavor.id;
        let favorJson = JsonMgr.getFavorJson(this.curStaff.xmlId, favorId);
        switch (favorJson.type) {
            case FavorType.StaffAttNum:
            case FavorType.StaffAttBai:
                let itemstr: string[] = favorJson.para.split(",");
                let itemId: number = Number(itemstr[0])
                let attJson: IAttributeJson = JsonMgr.getAttributeJson(itemId);
                ResMgr.getAttributeIcon(this.breakAttrIcon, attJson.attributeIcon);
                this.breakAttrName.string = "员工属性";
                if (favorJson.type == FavorType.StaffAttNum) {
                    this.breakAttrNum.string = "+" + itemstr[1];
                } else {
                    this.breakAttrNum.string = "+" + itemstr[1] + "%";
                }
                break;
            case FavorType.StaffAllBai:
            case FavorType.StaffAllNum:
                ResMgr.getAttributeIcon(this.breakAttrIcon, "icon_daquanshuxing");
                this.breakAttrName.string = "全部属性";
                if (favorJson.type == FavorType.StaffAllNum) {
                    this.breakAttrNum.string = "+" + favorJson.para;
                } else {
                    this.breakAttrNum.string = "+" + favorJson.para + "%";
                }
                break;
        }
    }

    setFavorUpGift() {
        let favorJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.curStaff.favorStage, this.curStaff.favorLevel + 1);
        if (favorJson) {
            this.setNodeState(false);
            if (!this.FavorUpGiftView) {
                let node = cc.instantiate(this.favorUpPrefab);
                this.FavorUpGiftView = node.getComponent(FavorUpGift);
                this.favorUpGiftNode.addChild(node);
            }
            this.FavorUpGiftView.updateView(this.curStaff.xmlId, favorJson.id);
        } else {
            this.setNodeState(true);
        }
    }

    setNodeState(state) {
        this.favorBreakLastNode.active = state;
        this.favorUpGiftNode.active = !state;
    }

    setBreakThrough() {
        let staffstr: string = this.curStaff.getBreakThroughItemId(this.curStaff.favorStage + 1);
        if (!staffstr) {
            return;
        }
        let staffItemStr: string[] = staffstr.split(",");
        this.BreakItemId = Number(staffItemStr[0]);
        let itemNum: number = Number(staffItemStr[1]);
        let itemJson: IItemJson = JsonMgr.getItem(this.BreakItemId);
        ResMgr.getItemBox(this.breakItemQuIcon, "k" + itemJson.color);
        ResMgr.imgTypeJudgment(this.breakItemIcon, this.BreakItemId);
        let wareNum: number = DataMgr.warehouseData.getItemNum(this.BreakItemId);
        this.breakItemNumber.string = itemNum + "/" + wareNum
        this.breakButton.interactable = wareNum >= itemNum;
    }

    setBreakStatue(state) {
        if (state) {
            this.labelTip.string = "请使用Event道具突破好感上限";
        } else {
            this.labelTip.string = "拖动礼物至员工身上即可送礼";
        }
        this.breakThrough.active = state;
        this.favorUpGiftNode.active = !state;
        if (state) {
            this.closeBtn.x = this.remeberX;
        } else {
            this.closeBtn.x = 0;
        }
        this.BreakTipNode.active = state;
        this.favorBreakLastNode.active = !state;
        this.favorabilityLayout.node.active = !state;
    }

    addItem() {
        let itemJsons: IItemJson[] = JsonMgr.getItemsByType(itemType.FavorUpType);
        let itemNum: number = 0;
        this.index = -1;
        for (let nid = 0; nid < itemJsons.length; nid++) {
            let favorabilityItem: FavorabilityUpScItem = this.favorItemArr[nid];
            if (itemNum == 0) {
                itemNum = DataMgr.warehouseData.getItemNum(itemJsons[nid].id);
            }
            if (itemNum != 0 && this.index < 0) {
                this.index = nid;
            }
            if (!favorabilityItem) {
                let node = cc.instantiate(this.favorabilityprefab);
                favorabilityItem = node.getComponent(FavorabilityUpScItem);
                this.favorabilityLayout.node.addChild(node);
                this.favorItemArr.push(favorabilityItem);
            }
            favorabilityItem.updateItem(itemJsons[nid].id);
        }
        if (itemNum != 0) {
            this.setGuidePos();
        }
    }

    giftFlyAnimation = (itemId: number) => {
        let node: cc.Node = cc.instantiate(this.getItemPre);
        node.scale = 0.7;
        node.active = false;
        node.opacity = 255;
        node.x = (itemId - 100901) * 120 + 30;
        node.y = 0;
        this.getItemNode.addChild(node);
        let itemid = itemId;
        let itemNum = 1;
        let favorItem: FavorAniItem = node.getComponent(FavorAniItem);
        favorItem.updateItem(itemid, itemNum);
        let pos = node.position;
        let action = cc.sequence(cc.spawn(cc.rotateTo(0.3, 1080), cc.moveTo(0.3, 280, 280), cc.fadeTo(0.3, 255)), cc.callFunc(() => {
            node.active = false;
            node.opacity = 255;
            node.position = pos;
            this.bomEffect.node.active = true;
            this.bomEffect.play();
            this.bomEffect.on(cc.Animation.EventType.STOP, () => {
                this.bomEffect.node.active = false;
                this.playHeart();
            });
        }));
        node.active = true;
        node.runAction(action);
    }

    //碰撞事件
    onCollisionEnter = () => {
        DataMgr.staffData.FavorIsCollision = true;
    }

    breakHandler = () => {
        DataMgr.setPlayAnimation(false);
        HttpInst.postData(NetConfig.BREAKTHROUGH, [this.curStaff.staffId], (response) => {
            let node: cc.Node = cc.instantiate(this.getItemPre);
            node.scale = 0.7;
            node.active = false;
            node.opacity = 255;
            node.x = 260;
            node.y = this.breakAttrIcon.node.y;
            this.getItemNode.addChild(node);
            let itemid = this.BreakItemId;
            let itemNum = 1;
            let favorItem: FavorAniItem = node.getComponent(FavorAniItem);
            favorItem.updateItem(itemid, itemNum);
            let pos = node.position;
            let action = cc.sequence(cc.spawn(cc.rotateTo(0.3, 1080), cc.moveTo(0.3, 280, 280), cc.fadeTo(0.3, 255)), cc.callFunc(() => {
                node.active = false;
                node.opacity = 255;
                node.position = pos;
                let favorLVJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.curStaff.favorStage + 1, 0);
                this.AnimationSpr.node.active = true;
                this.AnimationSpr.node.scale = 7;
                this.AnimationSpr.node.opacity = 100;
                ResMgr.getFavorIcon(this.AnimationSpr, favorLVJson.icon);
                let action = cc.sequence(cc.spawn(cc.scaleTo(0.2, 1), cc.fadeTo(0.2, 0)), cc.callFunc(() => {
                    this.favorXinSkelet.node.active = false;
                    this.AnimationSpr.node.active = false;
                    this.AnimationSpr.node.opacity = 0;
                    ResMgr.getFavorIcon(this.favorCurSpri, favorLVJson.icon);
                    this.xinxinAni.setAnimation(1, "animation", false);
                    this.breakProgressAni.node.active = true;
                    this.breakProgressAni.play()
                    this.breakProgressAni.on(cc.Animation.EventType.FINISHED, () => {
                        this.breakProgressAni.node.active = false;
                        this.breakStaffAni.node.active = true;
                        this.breakStaffAni.play();
                        this.breakStaffAni.on(cc.Animation.EventType.FINISHED, () => {
                            this.breakStaffAni.node.active = false;
                            DataMgr.setPlayAnimation(true);
                            this.curStaff = DataMgr.updateStaff(response);
                            this.playStaffAni(response, null, true);
                            this.addItem();
                            UIMgr.showView(breakAniView.url, null, this.curStaff);
                            this.setStaff();
                        })
                    })
                }));
                this.AnimationSpr.node.runAction(action);
            }));
            node.active = true;
            node.runAction(action);
        });
    }

    openSourceHandler = () => {
        UIMgr.loadaccessPathList(this.BreakItemId);
    }

    openFactorDetailHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.staff, "6020");
        UIMgr.showView(FavorabilityDetail.url);
    }

    //======================================= 动画相关 start ===================================


    playStaffAni = (responses, id?: number, isBreak?: boolean) => {
        if (responses.staff) {
            this.favorUpStaff = responses.staff;
        }
        //计算当前升级成功有什么
        this.AniSequenceMap.clear();
        let startLv: number = isBreak ? 0 : this.curStaff.favorLevel;
        if (this.favorUpStaff.favorLevel > startLv || isBreak) {
            let constjson = JsonMgr.getConstVal("favorUnlockReward");   //额外奖励常量
            let rewards = constjson.split(";");
            let len = isBreak ? this.favorUpStaff.favorLevel + 1 : this.favorUpStaff.favorLevel;
            for (let index = startLv; index < len; index++) {
                let favorLVJson: IFavorLevelJson = null;
                if (isBreak)
                    favorLVJson = JsonMgr.getFavorLevelJson(this.curStaff.favorStage, index);
                else
                    favorLVJson = JsonMgr.getFavorLevelJson(this.curStaff.favorStage, index + 1);
                let favorJson: IFavorJson = JsonMgr.getFavorJson(this.curStaff.xmlId, favorLVJson.id);

                for (let index = 0; index < rewards.length; index++) {
                    let type = Number(rewards[index].split(":")[0]);
                    if (type == favorJson.type) {
                        this.sequenceMapAddItem(rewards[index].split(":")[1]);
                    }
                }
                switch (favorJson.type) {
                    case FavorType.StaffAttNum:
                        this.AniSequenceMap.set(FavorAniType.STAFFATT, {
                            favorType: FavorType.StaffAttNum,
                            data: favorJson.para
                        });
                        break;
                    case FavorType.StaffAttBai:
                        this.AniSequenceMap.set(FavorAniType.STAFFATT, {
                            favorType: FavorType.StaffAttBai,
                            data: favorJson.para
                        });
                        break;
                    case FavorType.StaffAllNum:
                        this.AniSequenceMap.set(FavorAniType.STAFFATT, {
                            favorType: FavorType.StaffAllNum,
                            data: favorJson.para
                        });
                        break;
                    case FavorType.StaffAllBai:
                        this.AniSequenceMap.set(FavorAniType.STAFFATT, {
                            favorType: FavorType.StaffAllBai,
                            data: favorJson.para
                        });
                        break;
                    case FavorType.ItemGift:
                        this.sequenceMapAddItem(favorJson.para);
                        break;
                }
            }
        }
        this.aniPlayArr = [];
        let itemarr = this.AniSequenceMap.get(FavorAniType.ITEM);
        this.aniBlockNode.active = true;
        if (id) {
            this.giftFlyAnimation(id);
        } else {
            if (itemarr) {
                DotInst.clientSendDot(COUNTERTYPE.staff, "6021", this.curStaff.staffId.toString(), itemarr.toString());
            }
            this.playHeart();
        }
        if (!isBreak) {
            this.staffAni();
        }
    }


    playHeart() {
        // console.log("人物光和爱心动画");
        let type: GIFT_TYPE = DataMgr.getGiftType();
        this.giftShow.active = false;
        this.giftRespone.active = true;
        this.heartEffect.node.active = true;
        this.lightRotate.node.active = true;
        this.lightRotate.play();
        this.heartEffect.play();
        switch (type) {
            case GIFT_TYPE.lITTLE_STAR:
                this.giftRespone.getChildByName("Lable").getComponent(cc.Label).string = "谢谢店长的礼物~";
                break;
            case GIFT_TYPE.MORE_STAR:
                this.giftRespone.getChildByName("Lable").getComponent(cc.Label).string = "阿里嘎多~，我会继续努力的";
                break;
            case GIFT_TYPE.LOT_STAR:
                this.giftRespone.getChildByName("Lable").getComponent(cc.Label).string = "赛高~，店长最棒了~";
                break;
        }
        let action = cc.sequence(cc.fadeTo(0.8, 255), cc.callFunc(() => {
            this.giftRespone.active = false;
            this.giftShow.active = true;
        }))
        this.node.runAction(action);
    }

    staffAni() {
        // console.log("人物动作动画");
        let type: GIFT_TYPE = DataMgr.getGiftType();
        if (DataMgr.getPhoneState() == IPhoneState.HIGH) {
            this.staffRole.changeDesignation(Role.HAPPY_SKINS[1]);
        }
        switch (type) {
            case GIFT_TYPE.MORE_STAR:
                this.staffRole.changeDesignAction(Role.CASH_ACTION);
                break;
            case GIFT_TYPE.LOT_STAR:
                let aniNode = this.staffRole.node;
                let pos = aniNode.position;
                aniNode.setPosition(cc.v2(this.rolePosX, this.rolePosY));
                let action = cc.sequence(cc.moveTo(0.2, this.rolePosX, this.rolePosY + 30), cc.callFunc(() => {
                    let action1 = cc.sequence(cc.moveTo(0.2, this.rolePosX, this.rolePosY), cc.callFunc(() => {
                        aniNode.setPosition(cc.v2(this.rolePosX, this.rolePosY));
                        let action2 = cc.sequence(cc.moveTo(0.2, this.rolePosX, this.rolePosY + 30), cc.callFunc(() => {
                            let action3 = cc.sequence(cc.moveTo(0.2, this.rolePosX, this.rolePosY), cc.callFunc(() => {
                                aniNode.setPosition(cc.v2(this.rolePosX, this.rolePosY));
                            }));
                            aniNode.runAction(action3);
                        }));
                        aniNode.runAction(action2);
                    }));
                    aniNode.runAction(action1);
                }));
                aniNode.runAction(action);
                break;
        }
    }

    //map增加道具
    sequenceMapAddItem(para) {
        let itemGifts: string[] = this.AniSequenceMap.get(FavorAniType.ITEM);
        if (itemGifts) {
            itemGifts.push(para);
        } else {
            itemGifts = [];
            itemGifts.push(para);
        }
        this.AniSequenceMap.set(FavorAniType.ITEM, itemGifts);
    }

    //进度条动画
    progressAnimation(pro: number, callBack?: Function, isReset: boolean = false) {
        // console.log("进度条动画");
        let relyWidth = this.favorProgress.node.width * pro;
        if (relyWidth == 0) {
            this.progressBar.width = 0;
            callBack && callBack();
            return;
        }
        let addWidht = relyWidth - this.progressBar.width;
        let ereyAddWid = addWidht / 5;
        this.unscheduleAllCallbacks();
        this.schedule(() => {
            let endWidth = this.progressBar.width + ereyAddWid;
            if (endWidth >= relyWidth) {
                this.unscheduleAllCallbacks();
                this.progressBar.width = relyWidth;
                if (isReset) {
                    this.progressBar.width = 0;
                }
                callBack && callBack();
                return;
            }
            this.progressBar.width = endWidth;
            this.progressAni.node.scaleX = this.progressBar.width / this.favorProgress.node.width;
            this.progressAni.node.active = true;
            this.progressAni.play();
        }, 0.1);
    }

    //光效播放完回调
    animationEndHandler = () => {
        this.heartEffect.node.active = false;
        let favorLVJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.curStaff.favorStage, this.curStaff.favorLevel);
        let chagePro = this.favorUpStaff.favorExp / favorLVJson.cost;
        let pro = chagePro > 1 ? 1 : chagePro;
        //好感度提升之后 favorLevel没变（等级没有发生变化）
        if (this.AniSequenceMap.size > 0) {
            //不管提升多少级 进度条增长一次到满 然后在到当前进度
            this.progressAnimation(1, () => {
                this.progressAnimation(pro, this.progressEndHandler);
            }, true);
        } else {
            this.progressAnimation(pro, () => {
                this.AniEndUpdateView();
                this.progressAni.node.active = false;
                //this.progressAddAni.node.active = false;
                this.AnimationSpr.node.active = false;
            });
        }
    }

    //进度条增加完回调(播放图标变小动画)
    progressEndHandler = () => {
        this.progressAni.node.active = false;
        //this.progressAddAni.node.active = false;
        let favorLVJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.favorUpStaff.favorStage, this.favorUpStaff.favorLevel);
        if (favorLVJson.level > 0 && favorLVJson.quality < 3) {
            this.starIndex = this.curStaff.favorLevel + 1;
            this.lvStarAni();
        } else {
            ResMgr.getFavorIcon(this.favorCurSpri, favorLVJson.icon);
            if (this.AniSequenceMap.get(FavorAniType.STAFFATT)) {
                this.attUpSkelet.node.active = true;
                this.attUpSkelet.setAnimation(1, "animation", false);
                this.attUpSkelet.setCompleteListener(() => {
                    this.AniEndUpdateView();
                })
            } else {
                this.AniEndUpdateView();
            }
        }
    }

    lvStarAni() {
        // console.log("等级心动画");
        this.schedule(() => {
            this.favorLvUpStar.node.x = (this.starIndex - 1) * 14;
            this.favorLvUpStar.node.active = true;
            this.favorLvUpStar.play();
            if (this.starIndex < this.favorUpStaff.favorLevel) {
                let favorLVJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.favorUpStaff.favorStage, this.starIndex);
                ResMgr.getFavorIcon(this.favorCurSpri, favorLVJson.icon);
                this.starIndex++;
            } else {
                let favorLVJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.favorUpStaff.favorStage, this.favorUpStaff.favorLevel);
                ResMgr.getFavorIcon(this.favorCurSpri, favorLVJson.icon);
                this.unscheduleAllCallbacks();
                if (this.AniSequenceMap.get(FavorAniType.STAFFATT)) {
                    this.attUpSkelet.node.active = true;
                    this.attUpSkelet.setAnimation(1, "animation", false);
                    this.attUpSkelet.setCompleteListener(() => {
                        this.AniEndUpdateView();
                    })
                } else {
                    this.AniEndUpdateView();
                }
            }
        }, 0.5);
    }


    //动画结束刷新界面
    AniEndUpdateView() {
        cc.log("所有动画播完");
        let action = cc.sequence(cc.scaleTo(0.5, 1), cc.callFunc(() => {
            this.showReward();
            let response = DataMgr.getResponseData();
            if (response) {
                DataMgr.updateStaff(response);
                if (!DataMgr.getPlayAnimation()) {
                    DataMgr.setPlayAnimation(true);
                }
                DataMgr.setPlayAnimation(true);
                DataMgr.setResponseData(null);
            }
            this.setStaff();
            this.aniBlockNode.active = false;
        }));
        this.node.runAction(action);
    }

    showReward() {
        if (this.curStaff.favorLevel != this.favorUpStaff.favorLevel) {     //好感度提升了，打开获得界面
            UIMgr.showView(favorLvUpAward.url, null, {
                staffId: this.curStaff.xmlId,
                favorStage: this.curStaff.favorStage,
                startLv: this.curStaff.favorLevel + 1,
                endLv: this.favorUpStaff.favorLevel,
            })
        }
    }
}
