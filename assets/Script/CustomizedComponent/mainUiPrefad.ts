import {GameComponent} from "../core/component/GameComponent";
import {HttpInst} from "../core/http/HttpClient";
import {GuideIdType} from "../global/const/GuideConst";
import {JumpConst, MapJumpArr} from "../global/const/JumpConst";
import {NetConfig} from "../global/const/NetConfig";
import {dircetionConst, IBubbleInfo, IDirection, redBubbleConst} from "../global/const/RedBubbleConst";
import {RedConst, RedConstArr, SwitchRedConstArr} from "../global/const/RedConst";
import {TextTipConst} from "../global/const/TextTipConst";
import {ClientEvents} from "../global/manager/ClientEventCenter";
import {FunctionName, JsonMgr} from "../global/manager/JsonManager";
import {ResManager, ResMgr} from "../global/manager/ResManager";
import {UIMgr} from "../global/manager/UIManager";
import {ActiVityType} from "../Model/activity/ActivityModel";
import {DataMgr} from "../Model/DataManager";
import {IncidentModel} from "../Model/incident/IncidentModel";
import {JobType} from "../Model/StaffData";
import {StaffGiftData} from "../Model/StaffGiftData";
import {TaskData} from "../Model/TaskData";
import {Native} from "../Native";
import {IActivitiesInfo, IFosterList, IOrderInfo, IRespData, IShopBuyInfo, IShopDataInfo} from "../types/Response";
import {CommonUtil} from "../Utils/CommonUtil";
import {TimeUtil} from "../Utils/TimeUtil";
import {UIUtil} from "../Utils/UIUtil";
import ActiveShop from "./active/ActiveShop";
import ActivityIntegral from "./active/ActivityIntegral";
import announcementActivate from "./announcement/announcementActivate";
import AnnouncementView from "./announcement/announcementView";
import BigMap from "./BigMap/BigMap";
import {BigMData} from "./BigMap/BigMapData";
import {ActionMgr} from "./common/Action";
import {ArrowType} from "./common/Arrow";
import {ButtonMgr} from "./common/ButtonClick";
import {COUNTERTYPE, DotInst} from "./common/dotClient";
import {ARROW_DIRECTION, GuideMgr} from "./common/SoftGuide";
import CommunityActive from "./communityActivity/CommunityActive";
import ExpandFrame from "./ExpandFrame/ExpandFrame";
import {FightPre} from "./fight/FightPre";
import FosterCare from "./friends/fosterCare/FosterCare";
import SearchNode from "./friends/searchNode";
import FriendsList from "./friendsList/friendsList";
import IncentiveAnim from "./incentiveCountdown/incentiveAnim";
import IncentiveCountdown from "./incentiveCountdown/IncentiveCountdown";
import IncidentCommunity from "./incident/IncidentCommunity";
import IncidentView from "./incident/IncidentView";
import InviteActivity, {AWARD_TYPE} from "./InviteActivity/InviteActivity";
import ItemHouse from "./Items/ItemHouse";
import {LongOrder} from "./longOrder/LongOrder";
import MailboxList from "./mailbox/mailboxList";
import MainUiArrow from "./mainUiArrow";
import {CacheMap} from "./MapShow/CacheMapDataManager";
import ChooseItemDo from "./MapShow/chooseItemDo/chooseItemDo";
import {MapMgr} from "./MapShow/MapInit/MapManager";
import Update from "./MapShow/update/Update";
import {ExpUtil} from "./MapShow/Utils/ExpandUtil";
import NewMiniWarehouse from "./NewMiniWarehouse/NewMiniWarehouse";
import PowerGuide from "./PowerGuide/PowerGuide";
import randomOrder from "./randomOrder/randomOrder";
import playerRank from "./rank/playerRank";
import RechargeMain from "./Recharge/RechargeMain";
import Setting from "./setting/setting";
import ShopDetail from "./shop/ShopDetail";
import ShopMain, {TabbarType} from "./shop/ShopMain";
import NewSignIn from "./signIn/NewSignIn";
import {PostsView} from "./staff/list/PostsView";
import {StaffList} from "./staff/list/StaffList";
import {TypePanel} from "./staff/recruitNew/TypePanel";
import {StaffGiftsPlane} from "./StaffGiftsPlane/StaffGiftsPlane";
import Task from "./task/task";
import WelfareView from "./Welfare/WelfareView";
import {MFData} from "./MoneyFlyTest/MoneyFlyData";
import MoneyFly from "./MoneyFlyTest/MoneyFly";
import IncentiveTips from "./incentiveCountdown/incentiveTips";
import ActiveMain from "./active/ActiveMain";


enum MenuState {
    HIDE,
    SHOW
}

const {ccclass, property} = cc._decorator;

//主UI中间部分逻辑脚本

@ccclass
export class MainUiPrefad extends GameComponent {

    static url = 'mainUI/mainui_view';

    getBaseUrl() {
        return MainUiPrefad.url;
    }

    @property(cc.Node)
    private friendBtn: cc.Node = null;
    @property(cc.Node)
    private rightMenuBtnArr: Array<cc.Node> = [];

    @property(cc.Node)
    private rightMenuMask: cc.Node = null;

    //红点
    @property(cc.Sprite)
    private switchPointRed: cc.Sprite = null;

    //商店
    @property(cc.Node)
    private announBtn: cc.Node = null;

    //背包
    @property(cc.Node)
    private BagBtn: cc.Node = null;

    @property(cc.Node)
    private taskRed: cc.Node = null;
    @property(cc.Sprite)
    private red101: cc.Sprite = null;

    @property(cc.Sprite)
    private red102: cc.Sprite = null;

    @property(cc.Sprite)
    private red103: cc.Sprite = null;

    @property(cc.Sprite)
    private red104: cc.Sprite = null;

    @property(cc.Sprite)
    private red106: cc.Sprite = null;

    @property(cc.Sprite)
    private red108: cc.Sprite = null;

    @property(cc.Sprite)
    private red109: cc.Sprite = null;

    @property(cc.Sprite)
    private decorateRed: cc.Sprite = null;

    @property(cc.Sprite)
    private red113: cc.Sprite = null;

    @property(cc.Sprite)
    private red1001: cc.Sprite = null;

    @property(cc.Node)
    private StaffRed: cc.Node = null;
    @property(cc.Node)
    private assistRed: cc.Node = null;
    @property(cc.Node)
    private activityGoalRed: cc.Node = null;
    @property(cc.Node)
    private activityShopRed: cc.Node = null;

    @property(cc.Node)
    private activeNode: cc.Node = null;

    @property(cc.Node)
    private CommunityActiveNode: cc.Node = null;

    @property(cc.Node)
    private CommunityActiveShop: cc.Node = null;

    @property(cc.Node)
    private CommunityTargeNode: cc.Node = null;

    @property(cc.Node)
    private downMenu: cc.Node = null;
    @property(cc.Node)
    private rightMenu: cc.Node = null;

    @property(cc.Node)
    private giftBtn: cc.Node = null;
    @property(cc.Node)
    private giftBtnRed: cc.Node = null;
    @property(cc.Node)
    private staffBtn: cc.Node = null;
    @property(cc.Node)
    private shopNewBtn: cc.Node = null;
    @property(cc.Node)
    private staffPopupBox: cc.Node = null;
    @property(cc.Node)
    private decorateNode: cc.Node = null;
    @property(cc.Node)
    private guideNode: cc.Node[] = [];
    @property(cc.Node)
    private moreNode: cc.Node = null;
    @property(cc.Node)
    private positionNode: cc.Node = null;

    @property(cc.Node)
    private rankViewBtn: cc.Node = null;
    @property(cc.Node)
    private newNode: cc.Node = null;

    @property(cc.Node)
    private redBubble: cc.Node = null;

    @property(cc.Sprite)
    private bubbleSprite: cc.Sprite = null;

    @property(cc.Node)
    private taskBtn: cc.Node = null;

    @property(cc.Node)
    private guideTaskBtn: cc.Node = null;

    @property(cc.Node)
    private MaintaskBtn: cc.Node = null;


    @property(cc.Node)
    private btnStar1: cc.Node = null;

    @property(cc.Node)
    private btnStar2: cc.Node = null;

    @property(cc.Node)
    private jobBtn: cc.Node = null;

    @property(cc.Node)
    private recruitBtn: cc.Node = null;

    @property(cc.Node)
    private employBtn: cc.Node = null;

    @property(cc.Node)
    private pruchaseGoods: cc.Node = null;
    @property(cc.Node)
    private openBigMap: cc.Node = null;
    @property(cc.Node)
    private bigMapRed: cc.Node = null;
    @property(cc.Layout)
    private menuLayout: cc.Layout = null;

    //激励按钮
    @property(cc.Node)
    private incentiveBtn: cc.Node = null;
    @property(cc.Label)
    private incentiveLab: cc.Label = null;
    @property(sp.Skeleton)
    private incentiveSp: sp.Skeleton = null;
    @property(cc.Node)
    private leftMenu: cc.Node = null;
    @property(cc.Node)
    private decorateMenu: cc.Node = null;
    @property(cc.Node)
    private storeBtn: cc.Node = null;
    @property(cc.Node)
    private expansionBtn: cc.Node = null;
    // @property(cc.Node)
    // private popularityBtn: cc.Node = null;
    @property(cc.Node)
    private moreAngle: cc.Node = null;
    @property([cc.SpriteFrame])
    private expansionSP: cc.SpriteFrame[] = [];
    @property(cc.Node)
    private expandRed: cc.Node = null;
    @property(cc.Node)
    private expand2Red: cc.Node = null;
    @property(cc.Animation)
    private taskBtnAni: cc.Animation = null;
    @property(cc.Node)
    private moreNewNode: cc.Node = null;
    @property(cc.Node)
    private moreDurNode: cc.Node = null;

    @property(cc.Node)
    private testBtnNode: cc.Node = null;
    @property(cc.Node)
    private seePeopleNode: cc.Node = null;

    private bigMapGuide: cc.Node = null;

    //收放菜单开关
    private miniWarehouse: cc.Node = null;
    private kuoOrSet = {kuo: false, set: false};

    private isDoAction = false;
    private hasOpenMiniWare: boolean = false;

    private postsGuide: cc.Node = null;

    private bubbleType: number = 0;
    private bubblePosX: number = 0;
    private bubblePosY: number = 0;
    private menuState: MenuState = MenuState.SHOW;

    private CurSoftGuide: cc.Node = null;
    private parentSoftGuide: cc.Node = null;
    private shopBtnNode: cc.Node = null;

    private isCanClick: boolean = true;

    private activeBle: boolean = false;
    private incidnetshopid: number = 0;
    private expansionParent: cc.Node = null;
    private expansionPosition: cc.Vec2 = cc.v2(0, 0);

    private speddIndex: number = 0;
    private speedRates: number[] = [1, 1.5, 2, 3, 5];

    onLoad() {
        cc.log("onLoad mainUiPrefab");
        this.addEventListener();
        this.bindEvent();
        this.addOnBtn();
    }

    start() {
        cc.log("start mainUiPrefab");
        this.expansionParent = this.expansionBtn.parent;
        this.expansionPosition = this.expansionBtn.getPosition();

        this.bubblePosX = this.redBubble.x;
        this.bubblePosY = this.redBubble.y;

        let data: TaskData = DataMgr.taskData;
        this.taskRed.active = data.ble;

        if (DataMgr.getCanShowRedPoint()) {
            DataMgr.checkMapCanExpand();
            DataMgr.iMarket.checkIsLimitWithCase();
            DataMgr.warehouseData.initSet();
        }

        if (!DataMgr.checkInPowerGuide()) {
            this.initBIgMap();
        }
        if (!DataMgr.isFirstPowerGuide()) {
            this.loadInspireSpine();
            this.initTaskBtn();
        }

        this.updateStaffRed();
        this.setComminityActiveState();
        this.checkShowPostsGuide();
        this.functionOpen();
        this.updateStaffGifts();
        this.visibleGuideNodes(false);
        this.infoNovice();
        DataMgr.judgeStartSoftGuideJson();

        this.updateByTime();
    }

    private testRoleSpeed = () => {
        this.speddIndex++;
        if (this.speddIndex >= this.speedRates.length) {
            this.speddIndex = 0;
        }
        let rate = this.speedRates[this.speddIndex];
        UIUtil.setLabel(this.testBtnNode.getChildByName("testChange").getComponent(cc.Label), rate + "倍");
        ClientEvents.MAP_PEOPLE_SPEED.emit(rate);
    };

    private testSeePeople = () => {
        let seePeople: boolean = !DataMgr.seePeople;
        DataMgr.seePeople = seePeople;
        let stateName = seePeople ? "显示" : "隐藏";
        UIUtil.setLabel(this.seePeopleNode.getChildByName("seePeople").getComponent(cc.Label), stateName);
        if (seePeople) {
            ClientEvents.MAP_REFRESH_PEOPLE.emit();
        } else {
            ClientEvents.MAP_CLEAR_PEOPLE.emit();
        }
    };

    updateByTime() {//定时刷新一些UI统一走这块 1秒一次
        this.schedule(() => {
            // cc.log("updateByTime..."+TimeUtil.format(DataMgr.getServerTime()));
            this.updateStaffGifts();
            this.initIncentive();
        }, 1);
    }

    infoNovice = () => {
        cc.log("infoNovice mainUiPrefab");
        if (DataMgr.checkInPowerGuide()) {
            let step = DataMgr.getGuideCount();
            if (step == 0) {
                this.novice(1);
            } else if (step == 1) {
                this.novice(8);
            } else if (step == 2) {
                this.novice(13);
            }
            if (step == 3) {
                this.novice(17);
            }
        } else {
            this.visibleGuideNodes(true);
        }
    };

    novice = (idx: number) => {
        cc.log(">>> novice", idx);
        switch (idx) {
            case 1:
                UIMgr.infoGroup(true);
                UIMgr.showView(PowerGuide.url, null, null, (node: cc.Node) => {
                    node.getComponent(PowerGuide).setNodeToPowerGuide(null, () => {
                        DotInst.clientSendDot(COUNTERTYPE.powerGuide, "201");
                        this.novice(6);
                        ClientEvents.MAP_INIT_FINISHED.emit(true)
                    }, 1);
                }, null, 10000);
                break;
            // case 2:
            //     node.getComponent(PowerGuide).setNodeToPowerGuide(null, () => {
            //         this.novice(6);
            //         ClientEvents.ADD_MAIN_UI_TOP.emit();
            //     }, 2);
            //     break;
            // case 3:
            //     node.getComponent(PowerGuide).setNodeToPowerGuide(null, () => {
            //         this.novice(6);
            //     }, 3);
            //     break;
            // case 4:
            //     node.getComponent(PowerGuide).setNodeToPowerGuide(null, () => {
            //         this.novice(5);
            //     }, 4);
            //     break;
            // case 5:
            //     node.getComponent(PowerGuide).setNodeToPowerGuide(null, () => {
            //         this.novice(6);
            //     }, 5);
            //     break;
            case 6:
                this.loadInspireSpine(() => {
                    ClientEvents.ADD_MAIN_UI_TOP.emit();
                    UIMgr.infoGroup(false);
                    this.guideNode[4].active = true;
                    UIMgr.showView(PowerGuide.url, null, null, (node: cc.Node) => {
                        node.getComponent(PowerGuide).setNodeToPowerGuide(this.incentiveBtn, () => {
                            this.onincentive();
                            DotInst.clientSendDot(COUNTERTYPE.powerGuide, "202");
                        }, 6, true);
                    }, null, 10000);
                });
                break;
            // case 7://1大步
            //     node.getComponent(PowerGuide).setNodeToPowerGuide(null, () => {
            //         this.novice(8);
            //     }, 7);
            //     break;
            case 8:
                this.guideNode[4].active = true;
                UIMgr.infoGroup(true);
                UIMgr.showView(PowerGuide.url, null, null, (node: cc.Node) => {
                    node.getComponent(PowerGuide).setNodeToPowerGuide(null, () => {
                        DotInst.clientSendDot(COUNTERTYPE.powerGuide, "203");
                        this.novice(9);
                    }, 8);
                }, null, 10000);
                break;
            case 9:
                UIMgr.infoGroup(false);
                this.guideNode[1].active = true;
                UIMgr.showView(PowerGuide.url, null, null, (node: cc.Node) => {
                    node.getComponent(PowerGuide).setNodeToPowerGuide(this.expansionBtn, () => {
                        DotInst.clientSendDot(COUNTERTYPE.powerGuide, "204");
                        this.marketBtnClick();
                    }, 9);
                }, null, 10000);
                break;
            /* case 12://2大步
                 UIMgr.infoGroup(true);
                 node.getComponent(PowerGuide).setNodeToPowerGuide(null, () => {
                     UIMgr.resetViewToMiddle(null);
                     this.novice(13);
                 }, 12);
                 break;*/
            case 13:
                UIMgr.resetViewToMiddle(null);
                this.guideNode[1].active = true;
                this.guideNode[4].active = true;
                UIMgr.infoGroup(true);
                UIMgr.showView(PowerGuide.url, null, null, (node: cc.Node) => {
                    node.getComponent(PowerGuide).setNodeToPowerGuide(null, () => {
                        DotInst.clientSendDot(COUNTERTYPE.powerGuide, "206");
                        this.novice(14);
                    }, 13);
                }, null, 10000);
                break;
            case 14:
                UIMgr.infoGroup(false);
                this.guideNode[0].active = true;
                UIMgr.showView(PowerGuide.url, null, null, (node: cc.Node) => {
                    node.getComponent(PowerGuide).setNodeToPowerGuide(this.guideNode[0], () => {
                        DotInst.clientSendDot(COUNTERTYPE.powerGuide, "207");
                        this.initTaskBtn();
                        this.onTaskBtn();
                    }, 14);
                }, null, 10000);
                break;
            case 17:
                this.guideNode[0].active = true;
                this.guideNode[1].active = true;
                this.guideNode[4].active = true;
                UIMgr.infoGroup(true);
                UIMgr.showView(PowerGuide.url, null, null, (node: cc.Node) => {
                    node.getComponent(PowerGuide).setNodeToPowerGuide(null, () => {
                        UIMgr.infoGroup(false);
                        this.visibleGuideNodes(true);

                        let staffId = DataMgr.staffData.getSortedStaff(0).staffId;
                        HttpInst.postData(NetConfig.work,
                            [DataMgr.getMarketId(), staffId, JobType.cashier], (resp: IRespData) => {
                                DataMgr.updateStaff(resp);
                                ClientEvents.ADD_STAFF_TO_MAP.emit([staffId]);
                            });
                    }, 17, true);
                }, null, 10000);
                break;
        }
    };

    private loadInspireSpine(cb?: Function) {
        UIUtil.asyncSetSpine(this.incentiveSp, ResManager.SPINE_DIR + "incentive/map_gu", () => {
            cb && cb();
        });
    }

    private visibleGuideNodes(show: boolean) {
        this.guideNode.forEach((value: cc.Node) => {
            value.active = show;
        });
    }

    initTaskBtn = () => {
        this.taskBtn.stopAllActions();
        let curPositionJson: IPositionJson = JsonMgr.getPositionJson(DataMgr.userData.getPositionId());
        ResMgr.setPositionIcon(this.taskBtn.getComponent(cc.Sprite), curPositionJson.positionIcon);
        let len = curPositionJson.level;
        let rank = curPositionJson.rank;
        this.btnStar1.active = rank < 5;
        this.btnStar2.active = rank >= 5;
        for (let i = 2; i <= 10; i++) {
            this.btnStar1.getChildByName("star" + i).active = false;
            this.btnStar2.getChildByName("star" + i).active = false;
        }
        for (let i = 2; i <= len; i++) {
            if (rank < 5) {
                this.btnStar1.getChildByName("star" + i).active = true;
            } else {
                this.btnStar2.getChildByName("star" + i).active = true;
            }
        }
        if (DataMgr.taskData.positionBle) {
            UIUtil.show(this.taskBtnAni);
            UIUtil.asyncPlayAnim(this.taskBtnAni, "platform/animation/taskBtn/taskBtnAni");
        } else {
            UIUtil.hide(this.taskBtnAni);
        }
    };

    initIncentive = () => {
        let inspireNum: number = DataMgr.inspireInfo.inspireNum;
        let recoveryTime: number = DataMgr.inspireInfo.recoveryTime;
        this.incentiveLab.node.active = inspireNum === 0;
        if (inspireNum === 0) {
            if (recoveryTime > 0) {
                DataMgr.setIncentiveTime();
                this.incentiveLab.string = TimeUtil.getLeftTimeStr(recoveryTime);
            } else {
                HttpInst.postData(NetConfig.INSPIRE_INIF, [], () => {
                });
            }
        }
    };

    onincentive = () => {
        if (DataMgr.inspireInfo.inspireNum === 0) {
            //恢复弹窗
            this.shutDownBtn();
            HttpInst.postData(NetConfig.INSPIRE_INIF, [], (resp: IRespData) => {
                UIMgr.showView(IncentiveCountdown.url, cc.director.getScene(), resp.inspireInfo.recoveryTime);
            });
        } else {
            // for (let i = 0; i < 10; i++) {
            //     HttpInst.postData(NetConfig.INSPIRE, [], (resp: IRespData) => {
            //     });
            //     }
            // return;
            //激励接口
            if (DataMgr.isIncentive) {
                // UIMgr.showTipText("正在激励员工中，等一下吧~");
                return;
            }
            this.shutDownBtn();
            DataMgr.isIncentive = true;
            let err = () => {
                DataMgr.isIncentive = false;
            };
            DataMgr.setPlayAnimation(false);
            HttpInst.postData(NetConfig.INSPIRE, [], (resp: IRespData) => {
                DataMgr.setPlayAnimation(true);
                DotInst.clientSendDot(COUNTERTYPE.incentive, "15001", CommonUtil.putRewardTogether(resp.reward));
                this.hideGuide();
                DataMgr.judgeStartSoftGuideJson();
                ClientEvents.MAP_ROLE_LV_UP.emit(resp.levelUpStaffs);
                MFData.setStartPos(this.incentiveBtn.convertToWorldSpaceAR(cc.v2(10, 10)));
                let ble = CommonUtil.putRewardTogether(resp.reward).indexOf("-3") !== -1;

                // UIMgr.showView(MoneyFly.url, null, null, (node: cc.Node) => {
                //     node.getComponent(MoneyFly).initFly(resp.reward,false,ble? -3 : -2);
                // }, false, 1003);

                UIUtil.dynamicLoadPrefab(MoneyFly.url, (newNode: cc.Node) => {
                    newNode.getComponent(MoneyFly).initFly(resp.reward, false, ble ? -3 : -2);
                    newNode.parent = this.node;
                    newNode.zIndex = 1003;
                });

                this.scheduleOnce(() => {
                    UIMgr.showView(IncentiveAnim.url, this.node, ble);
                }, .3);

                this.scheduleOnce(() => {
                    // UIUtil.dynamicLoadPrefab(IncentiveTips.url,(newNode:cc.Node)=>{
                    //     newNode["data"] = resp.reward;
                    //     newNode.parent = this.node;
                    //     newNode.zIndex = 998;
                    // });
                    UIMgr.showView(IncentiveTips.url, this.node, resp.reward);
                }, .6);

                this.incentiveSp.setAnimation(0, "animation", false);
            }, err, err);
        }
    };

    initBIgMap = () => {
        let needLevel = JsonMgr.getBranchStore(2).level;
        this.openBigMap.active = DataMgr.iMarket.getExFrequency() + (22 * (DataMgr.iMarket.getMarketId() - 1)) >= needLevel;

        // if (this.openBigMap.active && !DataMgr.checkGuideHasCompleteById(ArrowType.BigMapOpenArrow)) {
        //     if (!this.bigMapGuide) {
        //         GuideMgr.showSoftGuide(this.openBigMap, ARROW_DIRECTION.RIGHT, "有新店\n解锁了哦", (node: cc.Node) => {
        //             this.bigMapGuide = node;
        //         }, false, 0, false, this.showMarketList);
        //     }
        // } else {
        //     if (this.bigMapGuide) {
        //         this.bigMapGuide.destroy();
        //         this.bigMapGuide = null;
        //     }
        // }
    };

    private checkShowPostsGuide() {
        this.doCheckShowPostsGuide(this.staffBtn);
    }

    private doCheckShowPostsGuide(target: cc.Node) {
        this.destroyPostsGuide();
        if (!GuideMgr.needGuide() && GuideMgr.canUpWork()) {
            let count = DataMgr.getGuideCompleteTimeById(ArrowType.StaffPosts);
            if (count == 0) {
                GuideMgr.showSoftGuide(target, ARROW_DIRECTION.BOTTOM, "可以分配\n岗位咯", (node: cc.Node) => {
                    this.postsGuide = node;
                }, false, 0, false, target == this.jobBtn ? this.onClickJob : this.staffPopup);
            }
        }
    }

    private destroyPostsGuide() {
        this.postsGuide && this.postsGuide.destroy();
        this.postsGuide = null;
    }

    setComminityActiveState = () => {
        if (!JsonMgr.isFunctionOpen(FunctionName.assistance)) {
            return;
        }
        if (this.activeBle) return;
        let isShow = 0;
        let active: IActivitiesInfo[] = DataMgr.getMainActivities();
        for (let index = 0; index < active.length; index++) {
            let activityJson = JsonMgr.getActivityJson(active[index].xmlId);
            if (activityJson) {
                if (activityJson.type == ActiVityType.CommunityBig) {
                    let icon: cc.Sprite = this.CommunityActiveNode.getComponent(cc.Sprite);
                    if (icon && activityJson.mainButton) {
                        ResMgr.getCommunityIcon(icon, activityJson.mainButton, true, false);
                    }
                    isShow = 1;
                } else if (activityJson.type == ActiVityType.CommunityShop) {
                    this.incidnetshopid = active[index].xmlId;
                    isShow = 2;
                } else if (activityJson.type == ActiVityType.CommunityTarget) {
                    isShow = 3;
                }
            }
        }
        this.CommunityActiveNode.active = isShow == 1;
        this.CommunityActiveShop.active = isShow == 2;
        this.CommunityTargeNode.active = isShow == 3;
    };

    // setArrawStatue = () => {
    // };

    private updateStaffRed = () => {
        this.red1001.node.active = DataMgr.staffData.showNewStaffRed();
    };

    addEventListener = () => {
        this.addEvent(ClientEvents.UP_POWER_GUIDE.on(this.novice));
        this.addEvent(ClientEvents.REFRESH_EXPAND_RED.on(this.showExpandRed));
        this.addEvent(ClientEvents.UP_INCENTIVE_NUM.on(this.initIncentive));
        this.addEvent(ClientEvents.STAFF_JOBS_RED.on(this.upStaffJobsRed));
        this.addEvent(ClientEvents.EVENT_TASK_RED_DOT.on((ble: boolean) => {
            if (!DataMgr.getCanShowRedPoint()) return;
            this.taskRed.active = ble;
        }));
        this.addEvent(ClientEvents.HIDE_STAFF_MASK.on(this.hideMenuMask));
        this.addEvent(ClientEvents.EVENT_SHUT_DOWN_RIGHT_MENU.on(this.shutDownBtn));
        this.addEvent(ClientEvents.OPEN_EXPAND_MARKET.on(() => {
            let type = this.decorateRed.node.active ? 1 : 0;
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2018", type + "");
            this.openExpandMarketView();
        }));
        this.addEvent(ClientEvents.EVENT_FUNCTION_OPEN.on(this.functionOpen));
        this.addEvent(ClientEvents.UPDATE_MAINUI_RED.on(this.updateRedStatus));
        this.addEvent(ClientEvents.UPDATE_MAINUI_RED_GONG.on(this.updateGongRedStatus));
        this.addEvent(ClientEvents.EVENT_OPEN_UI.on(this.onOpenUI));
        this.addEvent(ClientEvents.UPDATE_MAINUI_STAFF_RED.on(this.updateStaffRed));
        this.addEvent(ClientEvents.REFRESH_DECORATE_RED.on(this.refreshDecorateRed));
        this.addEvent(ClientEvents.EVENT_SHOW_MENUS.on(this.showMenus));
        this.addEvent(ClientEvents.EVENT_HIDE_MENUS.on(this.hideMenus));
        this.addEvent(ClientEvents.EVENT_SHOW_CHOOSEITEMDO.on(this.showChooseItemDo));
        this.addEvent(ClientEvents.UDPATE_MAIN_ARRAW_STATE.on(() => {
            // this.setArrawStatue();
            this.checkShowPostsGuide();
        }));
        this.dispose.add(ClientEvents.EVENT_HIDE_UI.on((ble: boolean) => {
            this.node.active = ble;
            ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(ble);
        }));
        this.addEvent(ClientEvents.HIDE_TIP_REND.on(() => {
        }));
        this.addEvent(ClientEvents.LEVEL_UP_SHOW_BIG_MAP.on(this.initBIgMap));
        this.addEvent(ClientEvents.UPDATE_COMMUNITY_STATE.on(this.setComminityActiveState));
        this.addEvent(ClientEvents.REFRESH_MAINUI_REDBUBBLE.on(this.showRedBubble));
        this.addEvent(ClientEvents.HIDE_MAINUI_REDBUBBLE.on(this.hideRedBubble));
        this.addEvent(ClientEvents.STAFF_GIFF_UPDATE.on(this.updateStaffGifts));
        this.addEvent(ClientEvents.UPDATE_TASK_BTN.on(this.initTaskBtn));
        this.addEvent(ClientEvents.SHOW_SOFT_GUIDE.on(this.showGuide));
        this.addEvent(ClientEvents.HIDE_MAIN_SOFT_GUIDE.on(this.hideGuide));
        this.addEvent(ClientEvents.SHOW_INCENTIVE_GUIDE.on(this.showIncentiveGuide));
        this.addEvent(ClientEvents.BUY_FUTURE_INSERT_FUTURE.on(this.openExpandMarketView));

        this.addEvent(ClientEvents.EVENT_REFUSE_STAFFGIFT.on(this.receiveStaffHandler));

        this.addEvent(ClientEvents.MAP_PEOPLE_SPEED_SHOW.on(() => {
            UIUtil.showNode(this.testBtnNode);
            UIUtil.showNode(this.seePeopleNode);
        }));
        this.addEvent(ClientEvents.MAP_PEOPLE_SPEED_HIDE.on(() => {
            UIUtil.hideNode(this.testBtnNode);
            UIUtil.hideNode(this.seePeopleNode);
        }));
    };

    showIncentiveGuide = () => {
        let softGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.incentive, 1);
        this.showGuide(softGuide, false);
    };

    addOnBtn = () => {
        this.rightMenuMask.on(cc.Node.EventType.TOUCH_END, () => {
            //this.rightMenuMask.active = false;
            this.openMenuBtn();
        }, this);

        ButtonMgr.addClick(this.incentiveBtn, this.onincentive);
        ButtonMgr.addClick(this.openBigMap, this.showMarketList);
        ButtonMgr.addClick(this.staffBtn, this.staffPopup);
        ButtonMgr.addClick(this.rightMenuBtnArr[4], this.onfriendsBtn);
        ButtonMgr.addClick(this.shopNewBtn, () => {
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2028");
            this.openShop();
        });
        ButtonMgr.addClick(this.rankViewBtn, this.openRankView);
        ButtonMgr.addClick(this.staffPopupBox, this.staffPopup);
        ButtonMgr.addClick(this.moreNewNode, this.openMenuBtn);
        ButtonMgr.addClick(this.CommunityActiveNode, this.openInciActive);
        ButtonMgr.addClick(this.CommunityActiveShop, this.openIncidnetShop);
        ButtonMgr.addClick(this.CommunityTargeNode, this.openCommunityTarge);
        ButtonMgr.addClick(this.redBubble, this.redBubbleHandler);
        ButtonMgr.addClick(this.taskBtn, this.onTaskBtn);
        ButtonMgr.addClick(this.jobBtn, this.onClickJob);
        ButtonMgr.addClick(this.recruitBtn, this.onClickRecruit);
        ButtonMgr.addClick(this.employBtn, this.onClickStaff);
        // ButtonMgr.addClick(this.rightMenuBtnArr[0], this.announcementHnadler);
        ButtonMgr.addClick(this.rightMenuBtnArr[1], this.onsignInBtn);
        ButtonMgr.addClick(this.rightMenuBtnArr[3], this.onMailboxBtn);
        ButtonMgr.addClick(this.rightMenuBtnArr[5], this.fosterCareBtn);
        ButtonMgr.addClick(this.giftBtn, this.openAdGiftView);
        ButtonMgr.addClick(this.expansionBtn, this.marketBtnClick);
        // ButtonMgr.addClick(this.popularityBtn, this.openPopularityView);//人气
    };

    showExpandRed = (result: boolean) => {
        if (!DataMgr.getCanShowRedPoint()) return;
        this.expand2Red.active = result;
        if (result) {
            this.expandRed.active = result;
        } else {
            this.expandRed.active = this.decorateRed.node.active !== false;
        }
    };

    // openPopularityView = () => {
    //     this.openStore();
    //     DotInst.clientSendDot(COUNTERTYPE.mainPage, "2006");
    //     UIMgr.showView(PopularityView.url, null, null, null, true);
    // };


    openAdGiftView = () => {
        this.shutDownBtn();
        UIMgr.showView(WelfareView.url);
    };

    openIncidnetShop = () => {
        UIMgr.showView(ActiveShop.url, null, {XmlId: this.incidnetshopid});
    };

    openCommunityTarge = () => {
        UIMgr.showView(ActivityIntegral.url);
    };

    showMarketList = () => {
        this.shutDownBtn();
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2044");
        HttpInst.postData(NetConfig.OPEN_BIG_MAP, [], (res: any) => {
            DotInst.clientSendDot(COUNTERTYPE.otherMarket, "12001");
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, 0);
            let cb = () => {
                BigMData.initMarketData(res.markets);
                UIMgr.showView(BigMap.url);
            };
            if (DataMgr.checkGuideHasCompleteById(ArrowType.BigMapOpenArrow)) {
                cb && cb();
            } else {
                HttpInst.postData(NetConfig.SOFT_LED_INFO, [ArrowType.BigMapOpenArrow], () => {
                    cb && cb();
                    if (!this.bigMapGuide) return;
                    this.bigMapGuide.removeFromParent();
                    this.bigMapGuide.destroy();
                })
            }
        });
    };

    openRankView() {        //排行榜按钮
        UIMgr.showView(playerRank.url);
    }

    private upStaffJobsRed = (ble: boolean[]) => {
        if (!DataMgr.getCanShowRedPoint()) return;
        if (ble[0]) {
            if (ble[1] || ble[2] || ble[3] || ble[4]) {
                this.StaffRed.active = true;
                this.red113.node.active = true;
            } else {
                this.red113.node.active = false;
                this.StaffRed.active = DataMgr.redData.indexOf(RedConst.RECRUITRED) !== -1 || DataMgr.staffData.showNewStaffRed();
            }
        } else {
            this.red113.node.active = false;
            this.StaffRed.active = DataMgr.redData.indexOf(RedConst.RECRUITRED) !== -1 || DataMgr.staffData.showNewStaffRed();
        }
    };

    refreshDecorateRed = (result: boolean) => {
        if (!DataMgr.getCanShowRedPoint()) return;
        this.decorateRed.node.active = result;
        if (result) {
            this.expandRed.active = result;
        } else {
            this.expandRed.active = this.expand2Red.active !== false;
        }
    };

    openInciActive = () => {
        HttpInst.postData(NetConfig.ASSIST_ENTRANCE, [], (response) => {
            DataMgr.fillActivityModel(response);
            UIMgr.showView(CommunityActive.url, null, null, null, true);
        });
    };
    hideRedBubble = () => {
        this.redBubble.active = false;
    };

    showRedBubble = (data: IBubbleInfo) => {
        if (data.bubbleType == 0) {
            this.redBubble.active = false;
            return;
        }
        this.bubbleType = data.bubbleType;
        let str = "";
        this.setRedBubblePos(data.direction);
        switch (data.bubbleType) {
            case redBubbleConst.ORDER:
                str = "order" + data.direction.directionX;
                ResMgr.setMainUIIcon(this.bubbleSprite, str);
                break;
            case redBubbleConst.LONGORDER:
                str = "longOrder" + data.direction.directionX;
                ResMgr.setMainUIIcon(this.bubbleSprite, str);
                break;
        }
        this.redBubble.active = data.isShow;
    };

    setRedBubblePos(data: IDirection) {
        if (data.directionX == dircetionConst.LEFT) {
            this.redBubble.x = this.bubblePosX;
        } else if (data.directionX == dircetionConst.RIGHT) {
            this.redBubble.x = -this.bubblePosX;
        }
    }

    redBubbleHandler = () => {
        switch (this.bubbleType) {
            case redBubbleConst.ORDER:
                let isClick: boolean = DataMgr.orderData.checkOrderClick();
                if (isClick) {
                    UIMgr.restOrderView(() => {
                        HttpInst.postData(NetConfig.GET_ORDER, [], (res: IOrderInfo) => {
                            DataMgr.orderData.setOrderList(res.orderManager);
                            UIMgr.showView(randomOrder.url);
                        });
                    });
                }
                break;
            case redBubbleConst.LONGORDER:
                UIMgr.resetLongOrderView(() => {
                    HttpInst.postData(NetConfig.LONG_ORDER_INFO,
                        [], () => {
                            UIMgr.showView(LongOrder.url, null, null, null, true);
                        });
                });
                break;
        }
        this.redBubble.active = false;
    };

    hideMenuMask = () => {
        this.staffPopupBox.active = false;
        this.decorateMenu.active = false;
        if (this.moreDurNode.scaleX > 0) {
            this.openMenuBtn();
        }
    };

    staffPopup = () => {
        if (this.moreDurNode.scaleX > 0) {
            this.openMenuBtn();
        }
        let param = this.StaffRed.active ? 1 : 0;
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2016", param + "");
        ClientEvents.SHOW_TOP_MASK.emit(true);
        this.staffPopupBox.active = !this.staffPopupBox.active;
        if (this.staffPopupBox.active) {
            this.node.getComponent(MainUiArrow).hideRed();
            this.doCheckShowPostsGuide(this.jobBtn);
        } else {
            this.checkShowPostsGuide();
            ClientEvents.UPDATE_MAINUI_RED.emit(DataMgr.getRedData());
        }
    };

    updateGongRedStatus = (msgData: any) => {
        if (!DataMgr.getCanShowRedPoint()) return;
        let nIndx: number = msgData.FeaturesId;
        this["red" + nIndx].node.active = msgData.status;
    };

    updateRedStatus = (redDatas: number[]) => {
        cc.log("redDatas===" + redDatas);
        this.inviteRed();
        DataMgr.orderRedCheck();
        if (!DataMgr.getCanShowRedPoint()) return;

        for (let nid in RedConstArr) {
            let nIndx = RedConstArr[nid];
            if (this["red" + nIndx]) {
                this["red" + nIndx].node.active = redDatas.indexOf(nIndx) !== -1;
            }
        }
        this.upStaffJobsRed(DataMgr.staffData.getJobRed());
        this.bigMapRed.active = redDatas.indexOf(119) !== -1;
        this.giftBtnRed.active = redDatas.indexOf(125) >= 0;
        this.assistRed.active = redDatas.indexOf(RedConst.ASSIST_DETAIL) !== -1 || redDatas.indexOf(RedConst.ACTIVITY_GOAL) !== -1 || DataMgr.taskData.communityBle;
        this.activityGoalRed.active = redDatas.indexOf(RedConst.ACTIVITY_GOAL) !== -1;
        this.activityShopRed.active = redDatas.indexOf(RedConst.ACTIVITY_SHOP) !== -1;
        this.kuoOrSet.kuo = redDatas.indexOf(110) !== -1;
        if (this.kuoOrSet.set) {
            this["red" + 110].node.active = true;
        }
        if (DataMgr.checkHasLongOrderCar()) {
            ClientEvents.SHOW_LONG_ORDER_CAR.emit();
        }

        //更多红点
        this.updateMoreRed(redDatas);

        this.updateGoodsTipAni();
        //长途货运领取红点
        DataMgr.ShowNewCarRed();
        DataMgr.ShowreceiveRed();
        //长途货运上货红点
        DataMgr.ShowCommitRed();

    };

    inviteRed() {
        HttpInst.postData(NetConfig.GET_INVITE_INFO, [], (res) => {
            let awardsJson: IinviteJson[] = JsonMgr.getAllInviteJson();
            let awardsArr = [];
            for (let i in awardsJson) {
                awardsArr.push(awardsJson[i]);
            }
            let data = res.invite;
            for (let i in awardsArr) {
                if (data.receivedRewardIds && data.receivedRewardIds.indexOf(awardsArr[i].id) >= 0) {
                    DataMgr.setInviteRed(false);
                } else {
                    if (data.inviteNum >= awardsArr[i].wechatInvite) {
                        DataMgr.setInviteRed(true);
                        return;
                    } else {
                        DataMgr.setInviteRed(false);
                    }
                }
            }
        })
    }

    updateMoreRed(redDatas: number[]) {
        let redLv: number = JsonMgr.getConstVal("moreGuide");
        if (!redLv) {
            redLv = 15;
        }
        if (DataMgr.userData.level >= redLv) {
            let isShowRed: boolean = false;
            for (let nid in SwitchRedConstArr) {
                if (redDatas.indexOf(SwitchRedConstArr[nid]) != -1) {
                    isShowRed = true;
                    break;
                }
            }
            this.switchPointRed.node.active = isShowRed;
        }
    }

    updateGoodsTipAni() {
        if (!this.bigMapRed.active || this.bigMapRed.getNumberOfRunningActions() === 0) {
            ActionMgr.setRedAction(this.bigMapRed);
        }
    }

    //功能开放
    functionOpen = () => {
        // let num: number = 0;
        this.rightMenuBtnArr.forEach((item: cc.Node) => {
            if (item) {
                let name: string = item.name.replace("Btn", "");
                item.active = JsonMgr.isFunctionOpen(FunctionName[name]);
            }
        });
        // let nodeArr: cc.Node[] = this.menuLayout.node.children;
        // nodeArr.forEach((node: cc.Node) => {
        //     if (node.active) {
        //         num++;
        //     }
        // });
        //
        // let num1: number = 1;
        // nodeArr.forEach((node: cc.Node) => {
        //     if (node.active) {
        //         if (num <= 4) {
        //             node.y = 0;
        //         } else {
        //             node.y = num1 > 4 ? -67 : 67;
        //             num1++;
        //         }
        //     }
        // });
        // this.menuLayout.type = num <= 4 ? cc.Layout.Type.HORIZONTAL : cc.Layout.Type.GRID;
        // this.menuLayout.updateLayout();

        let ble = JsonMgr.isFunctionOpen(FunctionName.decorate);
        this.storeBtn.active = ble;
        this.expansionBtn.parent = !ble ? this.storeBtn.parent : this.expansionParent;
        this.expansionBtn.setSiblingIndex(0);
        this.expansionBtn.setPosition(!ble ? this.expansionBtn.getPosition() : this.expansionPosition);
        this.expansionBtn.getComponent(cc.Sprite).spriteFrame = this.expansionSP[ble ? 0 : 1];

        let ble1 = JsonMgr.isFunctionOpen(FunctionName.staff);
        this.staffBtn.active = ble1;
        let isOpen: boolean = JsonMgr.isFunctionOpen(FunctionName.shop);
        this.shopNewBtn.active = isOpen;
        this.shopNewBtn.parent.setPosition(ble1 ? cc.v2(-259, -9) : cc.v2(-103, -9));
        //let cv: cc.Vec2 = this.shopNewBtn.parent.convertToWorldSpaceAR(this.shopNewBtn.getPosition());
        //let cv1: cc.Vec2 = this.rightMenuBtnArr[1].parent.parent.convertToNodeSpaceAR(cv);
        //this.moreAngle.x = cv1.x;

        this.jobBtn.active = JsonMgr.isFunctionOpen(FunctionName.staffPosition);
        this.showGift();
    };

    showGift = () => {
        this.giftBtn.active = JsonMgr.isFunctionOpen(FunctionName.fuli);
    };

    leaveDecorateMode = () => {
        this.node.active = true;
        this.showMenus();
        ClientEvents.SWITCH_DECORATE.emit(true);
        if (this.miniWarehouse !== null) {
            ClientEvents.HIDE_WAREHOUSE.emit(true);
        }

        this.miniWarehouse = null;
    };

    bindEvent = () => {
        ButtonMgr.addClick(this.announBtn, () => {
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2028");
            this.openShop();
        });
        ButtonMgr.addClick(this.BagBtn, this.openBag);
        ButtonMgr.addClick(this.decorateNode, this.openExpandMarketView);
        ButtonMgr.addClick(this.decorateMenu, this.openStore);
        ButtonMgr.addClick(this.storeBtn, this.openStore);

        ButtonMgr.addClick(this.testBtnNode, this.testRoleSpeed);
        ButtonMgr.addClick(this.seePeopleNode, this.testSeePeople);
    };

    openStore = () => {
        if (!this.storeBtn.active) return;
        ClientEvents.SHOW_TOP_MASK.emit(true);
        this.decorateMenu.active = !this.decorateMenu.active;
        if (this.moreDurNode.scaleX > 0) {
            this.openMenuBtn();
        }
    };

    openShop = (type = TabbarType.DECOSHOP) => {
        if (this.shopBtnNode) {
            this.shopBtnNode.active = false;
            this.shopBtnNode.destroy();
            this.shopBtnNode = null;
        }
        this.shutDownBtn();
        HttpInst.postData(NetConfig.AREADY_BUY_GOODS, [], (res: IShopBuyInfo) => {
            DataMgr.setBuyInfo(res.buyInfo);
            UIMgr.showView(ShopMain.url, null, [type, res], null, true);
        });
    };

    openBag = () => {
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2027");
        this.shutDownBtn();
        UIMgr.showView(ItemHouse.url, null, null, null, true);
    };

    marketBtnClick = () => {//扩建
        this.hideGuide();
        this.openStore();
        this.shutDownBtn();
        let dataMgr = DataMgr;
        let nowTime = dataMgr.getServerTime();
        let endTime = dataMgr.iMarket.getExpandTime();
        if ((endTime && nowTime >= endTime) || endTime === -1) {
            UIMgr.showTipText("已经有扩建完成了，快去看看吧");
            UIMgr.resetViewForExpandNode(null);
        } else {
            UIMgr.showView(ExpandFrame.url);
            ClientEvents.UPDATE_MAINUI_RED.emit(DataMgr.redData);
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2005");
        }
    };

    openExpandMarketView = (isOpen: boolean = true, jumpId: number = -1, isBuyFuture?: boolean, loadFuture?: Function) => {//装修
        !isBuyFuture && this.openStore();
        let mapIsLoaded = MapMgr.getIsLoaded();
        if (mapIsLoaded) {
            let hasOpen = UIMgr.getView(NewMiniWarehouse.url);
            if (hasOpen) {
                isBuyFuture && loadFuture && loadFuture();
                hasOpen.getComponent(NewMiniWarehouse).hideWare(true);
                isBuyFuture && loadFuture && loadFuture();
            } else {
                if (!this.hasOpenMiniWare) {
                    let failCb = () => {
                        this.hasOpenMiniWare = false;
                    };
                    this.hideGuide();
                    this.hasOpenMiniWare = true;
                    HttpInst.postData(NetConfig.OPEN_MARKE_FOR_NEW, [], () => {
                        UIMgr.showView(NewMiniWarehouse.url, null, jumpId, (node: cc.Node) => {
                            let script = node.getComponent(NewMiniWarehouse);
                            script.init(jumpId, isOpen);
                            if (isOpen) {
                                this.hideMenus();
                                if (!isBuyFuture) {
                                    script.scrollAni(false, jumpId === JumpConst.DECORATE_DISMANTLING ?
                                        () => {
                                            this.hasOpenMiniWare = false;
                                            script.saleFutureModeInit();
                                        } : () => {
                                            this.hasOpenMiniWare = false;
                                        });
                                } else {
                                    loadFuture && loadFuture();
                                    this.hasOpenMiniWare = false;
                                }
                            }
                        });
                    }, failCb, failCb);
                }
            }
        }
    };

    shutDownBtn = () => {
        ClientEvents.SHOW_TOP_MASK.emit(false);
        this.hideMenuMask();
    };

    //打开菜单
    openMenuBtn = () => {
        if (this.isCanClick) {
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2030");
            this.isCanClick = false;
            this.moreNewNode.stopAllActions();
            let startMove = this.moreDurNode.scaleX > 0 ? -343 : 343;
            let changeMove = this.moreDurNode.scaleX > 0 ? 10 : -10;
            let action = cc.sequence(cc.moveBy(0.2, startMove, 0), cc.moveBy(0.1, changeMove, 0), cc.callFunc(() => {
                this.moreDurNode.scaleX = this.moreDurNode.scaleX > 0 ? -0.8 : 0.8;
                this.rightMenuMask.active = this.moreDurNode.scaleX > 0;
                this.isCanClick = true;
                ClientEvents.SHOW_TOP_MASK.emit(!(this.moreDurNode.scaleX < 0));
            }));
            this.moreNewNode.runAction(action);
        }
    };


    //公告按钮
    announcementHnadler = () => {
        let type = this.red101.node.active ? 1 : 0;
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "202", type + "");
        this.openAnnounceView(-1);
    };

    openAnnounceView(nIndx: number = -1) {
        this.shutDownBtn();
        HttpInst.postData(NetConfig.NOTICE_LIST, [], (response) => {
            DataMgr.announcementData.LastReadNoticeId = response.lastReadNoticeId;
            DataMgr.announcementData.NoticeData = response.notices;
            if (nIndx >= 0) {
                // announcementPrefab.getChildByName("announcement").active = false;
                // this.scheduleOnce(() => {
                // announcementPrefab.active = false;
                // ClientEvents.OPEN_ACTIVATEIN_INFO_VIEW.emit(ble, true);
                let send = {nIndx: nIndx};
                UIMgr.showView(announcementActivate.url, null, send);
            } else {
                UIMgr.showView(AnnouncementView.url, null, null, () => {
                }, true);
            }
        });
    }

    //好友邀请活动
    openInvite(bannerId: number) {
        HttpInst.postData(NetConfig.GET_INVITE_INFO, [], (res) => {
            cc.log(JSON.stringify(res));
            //ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.Active);
            UIMgr.showView(InviteActivity.url, null, {bannerId: bannerId, inviteData: res.invite});
        })

    }

    //签到按钮
    onsignInBtn = () => {
        HttpInst.postData(NetConfig.GET_CHECKIN_INFO, [], () => {
            let type = this.red102.node.active ? 1 : 0;
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "", type + "2023");
            this.openSignView();
        });
    };

    openSignView() {
        UIMgr.showView(NewSignIn.url, null, null, null, true);
        this.shutDownBtn();
    }

    //任务按钮
    onTaskBtn = () => {
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2015");
        this.openTaskView();
    };

    openTaskView(viewType?: number) {
        this.shutDownBtn();
        UIMgr.showView(Task.url, null, null, (taskPrefab: cc.Node) => {
            if (viewType) {
                let taskView = taskPrefab.getComponent(Task);
                if (viewType == JumpConst.DAILTASKVIEW) {
                    taskView.setSwitch(0);
                } else if (viewType == JumpConst.TARGETTASKVIEW) {
                    taskView.setSwitch(1);
                }
            }
        }, true);
    }

    //邮箱按钮
    onMailboxBtn = () => {
        let type = this.red103.node.active ? 1 : 0;
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2024", type + "");
        this.openMailView();
    };

    openMailView() {
        HttpInst.postData(NetConfig.OPEN_MAIL_BOX, [], () => {
            UIMgr.showView(MailboxList.url, null, null, null, true);
            this.shutDownBtn();
        });
    }

    //好友按钮
    onfriendsBtn = (isOpen: boolean = false) => {
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2025", "0");
        if (this.moreDurNode.scaleX > 0) {
            this.openMenuBtn();
        }
        let data = DataMgr.getFocusData();
        if (!data) {
            HttpInst.postData(NetConfig.FOCUS_PAGING, [1], (res) => {
                DataMgr.loadFocusData(res);
                this.openFriendView(isOpen);
            });
        } else {
            this.openFriendView(isOpen);
        }
    };

    openFriendView = (isOpen: boolean = false) => {
        UIMgr.showView(FriendsList.url);
        let node: cc.Node = UIMgr.getView(FriendsList.url);
        if (!node) return;
        node.active = true;
        if (typeof (isOpen) == "boolean" && isOpen == true) {
            setTimeout(() => {
                HttpInst.postData(NetConfig.RECOMMEND_FRIEND, [], (res: any) => {
                    UIMgr.showView(SearchNode.url, cc.director.getScene(), null, () => {
                        DataMgr.loadRecommended(res);
                    }, false, 1001);
                });
            }, 500);
        }
    };

    //员工寄养
    fosterCareBtn = () => {
        let type = this.red106.node.active ? 1 : 0;
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2026", type + "");
        this.openFosterCareView();
    };

    openFosterCareView(isOpen: boolean = false) {
        this.shutDownBtn();
        if (!JsonMgr.isFunctionOpen(FunctionName.foster)) {
            UIMgr.showTipText("寄养暂未开启");
            return;
        }
        HttpInst.postData(NetConfig.GET_FOSTER_INFO, [], (res: IFosterList) => {
            DataMgr.fosterCare.setFosterCare(res.fosterList);
            UIMgr.showView(FosterCare.url, cc.director.getScene(), null, (fosterCarePrefab: cc.Node) => {
                if (typeof (isOpen) == "boolean" && isOpen == true) {
                    let view: FosterCare = fosterCarePrefab.getComponent(FosterCare);
                    view.fosterCareFriendButton();
                }
            }, true);
        });
    }

    //打开战斗
    openFightView() {
        HttpInst.postData(NetConfig.SHOW_BATTLE_INFO,
            [], (response) => {
                this.shutDownBtn();
                UIUtil.dynamicLoadPrefab(FightPre.url, (pre: cc.Node) => {
                    DataMgr.fillFightViewData(response);
                    UIMgr.getCanvas().addChild(pre, 999);
                    let component: FightPre = pre.getComponent(pre.name);
                    component.initFightData(response)
                });
            });
    }


    //招募
    onClickRecruit = () => {
        let type = this.red104.node.active ? 1 : 0;
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2019", type + "");
        this.openRecruitView();
    };

    openRecruitView(viewType?: number) {
        HttpInst.postData(NetConfig.getRecruitInfo,
            [], (resp: IRespData) => {
                let node: cc.Node = null;
                this.shutDownBtn();
                UIMgr.showView(TypePanel.url, null, resp, (preNode: cc.Node) => {
                    node = preNode;
                    if (viewType && viewType == JumpConst.GOLDMONTHSHOP) {
                        let recruitView: TypePanel = node.getComponent(TypePanel);
                        recruitView.onExchangeBtnClick();
                    }
                }, true);
            });
    }

    //进货
    goGetGoods() {
        this.shutDownBtn();
    }


    //员工一览
    onClickStaff = (OpenView) => {
        let type = this.red1001.node.active ? 1 : 0;
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2020", type + "");
        this.shutDownBtn();
        this.openStaffView(OpenView)
    };

    openStaffView(OpenView, lv?: number) {
        UIMgr.showView(StaffList.url, null, null, (node) => {
            let staffList: StaffList = node.getComponent(StaffList);
            staffList.updateOpenView(OpenView, lv);
        }, true);
    }

    //上岗布阵
    onClickJob = () => {
        this.destroyPostsGuide();
        let type = this.red113.node.active ? 1 : 0;
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2017", type + "");

        this.openJobView();
    };

    openJobView() {
        UIMgr.showView(PostsView.url, null, null, () => {
            this.shutDownBtn();
        }, true);
    }

    onReturnMoegoApp() {
        Native.closeGame();
    }

    onOpenUI = (JumpId: JumpConst, Msg?: any, isLock?: boolean) => {
        this.node.getComponent(MainUiArrow).hideRed();
        DataMgr.setClickMainTask(JumpId);
        if (MapJumpArr.indexOf(JumpId) != -1) {
            DataMgr.setClickTaskJumpMap(JumpId);
        }
        switch (JumpId) {
            case JumpConst.POSITION_RODE:
                this.openTaskView();
                break;
            case JumpConst.MENGYUANEXCHANGE:   //金币兑换
                ClientEvents.EVENT_POPUP_GOLD_EXCHANGE.emit();
                break;
            case JumpConst.SPAREXCHANGE:   //钻石兑换
                ClientEvents.EVENT_POPUP_DIAMOND_EXCHANGE.emit();
                break;
            case JumpConst.DECORATIONVIEW:   //装修界面
                if (JsonMgr.isFunctionOpen(FunctionName.decorate)) {
                    ExpUtil.getMarketMiddle();
                    this.openExpandMarketView(true, JumpConst.DECORATIONVIEW);
                } else {
                    this.openShop();
                }
                break;
            case JumpConst.DECORATE_DISMANTLING:
                ExpUtil.getMarketMiddle();
                ClientEvents.CLOSE_SHOP_DETAIL.emit();
                this.openExpandMarketView(true, JumpConst.DECORATE_DISMANTLING);
                break;
            case JumpConst.DECORATE_DECORATE:
                ExpUtil.getMarketMiddle();
                this.openExpandMarketView(true, JumpConst.DECORATE_DECORATE);
                break;
            case JumpConst.DECORATIONFLOOR:   ////装修-地板/墙纸状态
                ExpUtil.getMarketMiddle();
                this.openExpandMarketView(true, JumpConst.DECORATIONFLOOR);
                break;
            case JumpConst.EXPANSIONVIEW:   //扩建界面
                UIMgr.showView(ExpandFrame.url);
                break;
            case JumpConst.STAFFVIEW:   //员工界面
                this.openStaffView(JumpConst.STAFFVIEW);
                break;
            case JumpConst.STAFFBIDVIEW:   //员工告别界面
                this.openStaffView(JumpConst.STAFFBIDVIEW);
                break;
            case JumpConst.STAFFLEVELVIEW:   //员工升级界面
                if (!JsonMgr.isFunctionOpen(FunctionName.staff)) {
                    UIMgr.showTipText("宝宝功能未开启!");
                    return;
                }
                this.openStaffView(JumpConst.STAFFLEVELVIEW);
                break;
            case JumpConst.STAFFLEVELVIEWNEAR:  //员工升级界面
                let TaskItem = JsonMgr.getMainTask(Msg.taskId);
                let lv = TaskItem.targetItem ? TaskItem.targetItem : 0;
                this.openStaffView(JumpConst.STAFFLEVELVIEWNEAR, lv);
                break;
            case JumpConst.STAFFPOSTVIEW:   //员工岗位界面
                this.openJobView();
                break;
            case JumpConst.PURCHASEVIEW:   //进货界面
                this.goGetGoods();
                break;
            case JumpConst.PURCHASEDUISTOCKVIEW:    //进货界面(需要有软引导)
                this.goGetGoods();  //软引导后面在做
                break;
            case JumpConst.ADDGOODSDUILIE:
                this.goGetGoods();
                break;
            case JumpConst.RECRUITVIEW:   //招募界面
                if (!JsonMgr.isFunctionOpen(FunctionName.recruit)) {
                    UIMgr.showTipText("招募功能未开启!");
                    return;
                }
                this.openRecruitView();
                break;
            case JumpConst.GOLDMONTHSHOP:   //金月商店
                this.openRecruitView(JumpConst.GOLDMONTHSHOP);
                break;
            case JumpConst.DAILTASKVIEW:   //日常任务界面
                let dailyTaskUnlockLevel = JsonMgr.getConstVal("dailyTaskUnlockLevel");
                if (!dailyTaskUnlockLevel) {
                    dailyTaskUnlockLevel = 400306;
                }
                if (DataMgr.userData.positionId < dailyTaskUnlockLevel) {
                    let positionJson: IPositionJson = JsonMgr.getPositionJson(dailyTaskUnlockLevel);
                    UIMgr.showTipText("日常任务尚未开启，请在职位达到【" + positionJson.name + positionJson.level + "阶】后再来看看吧~");
                    return;
                }
                this.openTaskView(JumpConst.DAILTASKVIEW);
                break;
            case JumpConst.TARGETTASKVIEW:   //目标任务界面
                this.openTaskView(JumpConst.TARGETTASKVIEW);
                break;
            case JumpConst.ANNOUNCEVIEW:   //公告界面
                this.openAnnounceView();
                break;
            case JumpConst.InviteActivity:   //好友邀请
                DotInst.clientSendDot(COUNTERTYPE.share, "14005");
                this.openInvite(Msg);
                break;
            case JumpConst.ANNOUNCEVIEWCUXIAO:  //公告概率up
                this.openAnnounceView(Msg);
                break;
            case JumpConst.SINGNVIEW:   //签到界面
                this.onsignInBtn();
                break;
            case JumpConst.EMAILVIEW:   //邮箱界面
                this.openMailView();
                break;
            case JumpConst.FRIENDVIEW:   //好友
                this.onfriendsBtn();
                break;
            case JumpConst.ADDFRIENDVIEW:   //添加关注
                this.onfriendsBtn(true);
                break;
            case JumpConst.FOSTERVIEW:   //寄养
                this.openFosterCareView();
                break;
            case JumpConst.FRIEDNFOSTERVIEW:   //好友寄养
                this.openFosterCareView(true);
                break;
            case JumpConst.BAG: //背包
                this.openBag();
                break;
            case JumpConst.ITEMSHOPVIEW:    //道具商店
                this.openShop(TabbarType.ITEM);
                break;
            case JumpConst.DECORATIONSHOPVIEW:    //装饰商店
                this.openShop(TabbarType.DECOSHOP);
                break;
            case JumpConst.JUMPSHOPITEM:    //商店购买
                HttpInst.postData(NetConfig.AREADY_BUY_GOODS, [], (res: IShopBuyInfo) => {
                    DataMgr.setBuyInfo(res.buyInfo);
                    let itemjson = JsonMgr.getItem(Msg);
                    let shopJson = JsonMgr.getOneShopJson(itemjson.shopId);
                    UIMgr.showView(ShopDetail.url, null, {itemData: shopJson, type: TabbarType.ITEM});
                });
                break;
            case JumpConst.SHOPBOXVIEW:
                this.openShop(TabbarType.TREASUREBOX);
                break;
            case JumpConst.LOGNGORDERVIEW:
                UIMgr.resetLongOrderView(() => {
                    HttpInst.postData(NetConfig.LONG_ORDER_INFO,
                        [], () => {
                            UIMgr.showView(LongOrder.url, null, null, null, true);
                        });
                });
                break;
            case JumpConst.CRISISVIEW:
                let crisIncidents: IncidentModel[] = DataMgr.incidentData.getMapIncidents();
                if (crisIncidents.length <= 0) {
                    UIMgr.showTipText("暂时无危机可以处理");
                    return;
                }
                this.showCrisisView(crisIncidents);
                break;
            case JumpConst.EVENTVIEW:
                let events: IncidentModel[] = DataMgr.incidentData.getMapEvents();
                if (events.length <= 0) {
                    UIMgr.showTipText("暂时无事件可以处理");
                    return;
                }
                this.showCrisisView(events);
                break;
            case JumpConst.TASKMAPEVENT:
                let mapEvents: IncidentModel[] = DataMgr.incidentData.getMapEvents();
                if (mapEvents.length <= 0) {
                    UIMgr.showTipText("暂时无事件可以处理");
                    return;
                }
                this.jumpMapIncident(mapEvents, JumpConst.TASKMAPEVENT);
                break;
            case JumpConst.TASKMAPINCITENT:
                let mapIncitents: IncidentModel[] = DataMgr.incidentData.getMapIncidents();
                if (mapIncitents.length <= 0) {
                    UIMgr.showTipText("暂时无危机可以处理");
                    return;
                }
                this.jumpMapIncident(mapIncitents, JumpConst.TASKMAPINCITENT);
                break;
            case JumpConst.SETTINGVIEW:   //设置界面
            case JumpConst.FRIENDKUANSET:
            case JumpConst.FANSEE:
            case JumpConst.HELP:
            case JumpConst.FEEDBACK:
            case JumpConst.MUSICFANSEE:
            case JumpConst.CUSTOMERSERVICE:
            case JumpConst.EXCHANGE:
                UIMgr.showView(Setting.url, null, JumpId, null, true);
                break;
            case JumpConst.ShopMatchup:     //店铺对决
                this.openFightView();
                break;
            case JumpConst.VIPVIEW: //vip

                break;
            case JumpConst.CommunityActivity:
                if (CacheMap.getDecorateState()) {
                    ClientEvents.FOCUS_SAVE.emit();
                }
                this.openInciActive();
                break;
            case JumpConst.AssistHandler:
                HttpInst.postData(NetConfig.ASSIST_DETAIL, [], (res: any) => {
                    if (!DataMgr.incidentData.hasIncident(res.assistance.incident)) {
                        DataMgr.incidentData.addIncident(res.assistance.incident);
                    } else {
                        DataMgr.incidentData.updateIncident(res.assistance.incident);
                    }
                    DataMgr.activityModel.setIncident(res.assistance.incident);
                    DataMgr.activityModel.setAssistInfo(res.assistance.info);
                    DataMgr.activityModel.setMembers(res.assistance.members);
                    UIMgr.showView(IncidentCommunity.url, null);
                });
                break;
            case JumpConst.TEST_ORDER_JUMP:
                UIMgr.restOrderView(() => {
                    ClientEvents.SHOW_JUMP_ARROW.emit(JumpConst.TEST_ORDER_JUMP);
                });
                break;
            case JumpConst.LONG_ORDER_JUMP:
                UIMgr.resetLongOrderView(() => {
                    ClientEvents.SHOW_JUMP_ARROW.emit(JumpConst.LONG_ORDER_JUMP);
                });
                break;
            case JumpConst.GOLD_RECRUIT:
            case JumpConst.DIAMOND_RECRUIT:
                UIMgr.resetToRecruitMiddle(() => {
                    ClientEvents.SHOW_JUMP_ARROW.emit(JumpId);
                });
                break;
            case JumpConst.BUSJUMP:       //巴士
                UIMgr.resetViewToBusStation();
                break;
            case JumpConst.RechargeMain:       //充值
                ClientEvents.EVENT_POPUP_DIAMOND_EXCHANGE.emit();
                break;
            case JumpConst.ORDERGUIDE:
                ClientEvents.OPEN_ORDER_STATUS.emit(isLock);
                break;
            case JumpConst.SHOWINCENTIVEGUIDe:
                let softGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.incentive, 1);
                this.showGuide(softGuide, false);
                break;
            default:
                break;
        }
    };

    jumpMapIncident(incidents: IncidentModel[], jumpId) {
        let nindx = CommonUtil.getRandomNum(incidents.length);
        let incidentData: IncidentModel = incidents[nindx];
        UIMgr.resetView(incidentData.getMapNode());
        ClientEvents.INCIDENT_GUIDE.emit(incidentData.getId(), jumpId);
    }

    showCrisisView(crisIncidents) {
        let nindx = CommonUtil.getRandomNum(crisIncidents.length);
        let incidentModel: IncidentModel = crisIncidents[nindx];
        HttpInst.postData(NetConfig.INCIDENT_DETAIL, [DataMgr.getCurUserId(), incidentModel.getId()], (res: any) => {
            if (res.state) { //  完成、过期
                UIMgr.showTipText(TextTipConst.INCIDENT_COMPLETE);
                DataMgr.incidentData.clearExpire();
                return;
            }
            if (DataMgr.isInFriendHome()) {
                let model = DataMgr.incidentData.updateIncident(res.incident);
                let detail = {
                    incident: model,
                    helps: res.helpStaffIds
                };
                UIMgr.showView(IncidentView.url, null, detail, null, true);
            } else {
                let model = DataMgr.incidentData.updateIncident(res.incident);
                let detail = {
                    incident: model,
                    helps: res.helps
                };
                UIMgr.showView(IncidentView.url, null, detail, null, true);
            }
        });
    }

    hideMenus = () => {
        if (this.menuState === MenuState.SHOW) {
            if (!this.isDoAction) {
                this.menuState = MenuState.HIDE;
                this.activeBle = true;
                this.moreNewNode.active = false;
                this.openBigMap.active = false;
                this.giftBtn.active = false;
                let frameSize = cc.view.getVisibleSize();
                this.isDoAction = true;
                ClientEvents.EVENT_HIDE_TASKNODE.emit();
                this.downMenu.runAction(cc.sequence(cc.spawn(cc.moveTo(.2, cc.v2(this.downMenu.x, -frameSize.height / 2 - this.downMenu.height / 2 - 27)), cc.fadeOut(.2)), cc.callFunc(() => {
                    this.isDoAction = false;
                    this.downMenu.active = false;
                    this.leftMenu.active = false;
                    this.activeNode.active = false;
                    this.rightMenuBtnArr[4].active = false;
                })));
            }
        }
    };

    showMenus = () => {
        if (this.menuState === MenuState.HIDE) {
            if (!this.isDoAction) {
                this.menuState = MenuState.SHOW;
                this.activeBle = false;
                this.moreNewNode.active = true;
                this.initBIgMap();
                this.showGift();
                this.downMenu.active = true;
                ClientEvents.EVENT_SHOW_TASKNODE.emit();
                let frameSize = cc.view.getVisibleSize();
                this.isDoAction = true;
                this.downMenu.runAction(cc.sequence(cc.spawn(cc.moveTo(.2, this.downMenu.x, -frameSize.height / 2 + this.downMenu.height / 2 + 27), cc.fadeIn(.2)), cc.callFunc(() => {
                    this.isDoAction = false;
                    this.leftMenu.active = true;
                    this.activeNode.active = true;
                    let name: string = this.rightMenuBtnArr[4].name.replace("Btn", "");
                    this.rightMenuBtnArr[4].active = JsonMgr.isFunctionOpen(FunctionName[name]);
                })));
            }
        }
    };

    showChooseItemDo = (itemType: string, script: any, itemState: number, xmlData: IDecoShopJson, grayCb: Function, isAdd?: boolean) => {
        let node: cc.Node = UIMgr.getView(ChooseItemDo.url);
        let cb = (chooseItemDoNode: cc.Node) => {
            chooseItemDoNode.getComponent(ChooseItemDo).init(itemType, script, xmlData, grayCb, !!isAdd);
        };
        if (node) {
            cb(node);
            return;
        }
        UIMgr.showView(ChooseItemDo.url, null, null, cb);
    };

    unload() {
        UIMgr.closeView(ChooseItemDo.url);
        UIMgr.closeView(Update.url);
        UIMgr.closeView(ActiveMain.url);
    }

    private staffGiftCanReceive: boolean = false;//是否可以领取送包包礼物
    updateStaffGifts = () => {
        let data: StaffGiftData = DataMgr.staffGift;
        let parentsNode = UIUtil.getChildNode(this.leftMenu, "staffGiftsVO");
        this.parentSoftGuide = parentsNode;
        if (data.staffGiftsSize == 0) {
            parentsNode.stopAllActions();
            parentsNode.angle = 0;
            parentsNode.active = false;
        } else {
            parentsNode.active = true;
            let numLab = UIUtil.getChildComponent(parentsNode, "num", cc.Label);
            if (data.staffGiftsSize == 1) {
                UIUtil.hide(numLab);
            } else {
                UIUtil.show(numLab);
                UIUtil.setLabel(numLab, data.staffGiftsSize);
            }
            let timeLabel = UIUtil.getChildComponent(parentsNode, "time", cc.Label);
            if (data.hasReward) {
                timeLabel.string = "";
                this.staffGiftsAni(parentsNode);
            } else {
                if (data.endTime == 0) {
                    timeLabel.string = "";
                    this.staffGiftsAni(parentsNode);
                } else {
                    let Time: number = DataMgr.getServerTime();
                    if (data.endTime <= Time) {
                        timeLabel.string = "";
                        this.staffGiftsAni(parentsNode);
                    } else {
                        timeLabel.string = TimeUtil.getLeftTimeStr(data.endTime - Time);
                        parentsNode.stopAllActions();
                        parentsNode.angle = 0;
                        this.staffGiftCanReceive = false;
                    }
                }
            }
        }
    };

    staffGiftsAni(parentsNode: cc.Node) {
        if (this.staffGiftCanReceive) return;
        this.staffGiftCanReceive = true;
        let rotation1 = cc.rotateTo(0.1, 10);
        let rotation2 = cc.rotateTo(0.1, 0);
        let delay = cc.delayTime(0.5)
        parentsNode.runAction(cc.repeatForever(cc.sequence(rotation1, rotation2, rotation1, rotation2, delay)));
    }

    receiveStaffGift() {
        // let data: StaffGiftData = DataMgr.staffGift;
        HttpInst.postData(NetConfig.GET_STAFF_GIFT_INFO, [], (res: any) => {
            if (this.CurSoftGuide) {
                this.CurSoftGuide.active = false;
                this.CurSoftGuide.destroy();
                this.CurSoftGuide = null;
            }
            if (!res || !res.staffGiftInfo) return;
            let staffGiftInfo: IStaffGiftJson = JsonMgr.getStaffGiftData(res.staffGiftInfo.id);
            DotInst.clientSendDot(COUNTERTYPE.staffGift, "170001", staffGiftInfo.staffId.toString()); //升职打点
            UIMgr.showView(StaffGiftsPlane.url, null, res.staffGiftInfo, () => {
                ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, 0);
            }, true);
        });
    }

    receiveStaffHandler = () => {
        this.staffGiftCanReceive = false;
    };


    hideGuide = () => {
        if (this.CurSoftGuide) {
            this.CurSoftGuide.active = false;
            this.CurSoftGuide.destroy();
            this.CurSoftGuide = null;
        }
    };

    showGuide = (softGuideJson: ISoftGuideJson, isSendDot: boolean = true) => {
        if (this.CurSoftGuide) {
            this.CurSoftGuide.active = false;
            this.CurSoftGuide.destroy();
            this.CurSoftGuide = null;
        }

        if (this.parentSoftGuide && this.parentSoftGuide.active) {
            let startSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunBaoBao, 1);
            if (startSoftGuide && DataMgr.getGuideCompleteTimeById(startSoftGuide.id) <= 0) {
                if (isSendDot) DotInst.clientSendDot(COUNTERTYPE.softGuide, "19068");
                HttpInst.postData(NetConfig.SOFT_LED_INFO, [startSoftGuide.id], (response) => {
                    GuideMgr.showSoftGuide(this.parentSoftGuide, ARROW_DIRECTION.LEFT, startSoftGuide.displayText, (node: cc.Node) => {
                        this.CurSoftGuide = node;
                    }, false, 0, false, () => {
                        this.receiveStaffGift();
                    });
                });
                return;
            }
        }

        switch (softGuideJson.groupId) {
            case GuideIdType.incentive:
                if (isSendDot) DotInst.clientSendDot(COUNTERTYPE.softGuide, "19001");
                GuideMgr.showSoftGuide(this.incentiveBtn, ARROW_DIRECTION.BOTTOM, softGuideJson.displayText, (node: cc.Node) => {
                    this.CurSoftGuide = node;
                }, false, 0, false, () => {
                    this.onincentive();
                });
                break;
            case GuideIdType.position:
                if (isSendDot) DotInst.clientSendDot(COUNTERTYPE.softGuide, "19002");
                GuideMgr.showSoftGuide(this.guideTaskBtn, ARROW_DIRECTION.BOTTOM, softGuideJson.displayText, (node: cc.Node) => {
                    this.CurSoftGuide = node;
                }, false, 0, false, () => {

                }, 60, -60);
                break;
            case GuideIdType.deco:
                if (isSendDot) DotInst.clientSendDot(COUNTERTYPE.softGuide, "19004");
            case GuideIdType.shelf:
                if (isSendDot) DotInst.clientSendDot(COUNTERTYPE.softGuide, "19011");
                GuideMgr.showSoftGuide(this.shopNewBtn, ARROW_DIRECTION.BOTTOM, softGuideJson.displayText, (node: cc.Node) => {
                    this.CurSoftGuide = node;
                }, false, 0, false, () => {
                    this.openShop();
                });
                break;
            case GuideIdType.event:
                if (isSendDot) DotInst.clientSendDot(COUNTERTYPE.softGuide, "19014");
            case GuideIdType.compleTask:
                if (isSendDot) DotInst.clientSendDot(COUNTERTYPE.softGuide, "19070");
                GuideMgr.showSoftGuide(this.MaintaskBtn, ARROW_DIRECTION.BOTTOM, softGuideJson.displayText, (node: cc.Node) => {
                    this.CurSoftGuide = node;
                }, false, 0, false);
                break;
            case GuideIdType.expand:
                if (isSendDot) DotInst.clientSendDot(COUNTERTYPE.softGuide, "19007");
                GuideMgr.showSoftGuide(this.expansionBtn, ARROW_DIRECTION.BOTTOM, softGuideJson.displayText, (node: cc.Node) => {
                    this.CurSoftGuide = node;
                }, false, 0, false);
                break;
        }
    }
}
