/**
 *@Athuor ljx
 *@Date 15:50
 */
import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {BigMData, IBigMapData} from "./BigMapData";
import {DataMgr} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {UIMgr} from "../../global/manager/UIManager";
import MissionBg from "./MissionBg";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {IRespData} from "../../types/Response";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import {CacheMap, FutureState} from "../MapShow/CacheMapDataManager";
import MapLoading from "../MapShow/MapInit/MapLoading";
import {ChestRes} from "../ExpandFrame/ChestResManager";
import {ExpUtil} from "../MapShow/Utils/ExpandUtil";
import RecoveryMoneyAni from "../MapShow/FutureItem/RecoveryMoneyAni";
import {TextTipConst} from "../../global/const/TextTipConst";
import IncidentView from "../incident/IncidentView";
import {UIUtil} from "../../Utils/UIUtil";
import {ArrowType} from "../common/Arrow";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import SpecialGetReward from "../common/SpecialGetReward";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {topUiType} from "../MainUiTopCmpt";

const {ccclass, property} = cc._decorator;

export enum MarketState {
    NORMAL = "normal",
    CAN_OPEN = "canOpen",
    LOCKED = "locked"
}

enum NameColor {
    r = 129,
    g = 77,
    a = 52
}

@ccclass

export default class BigMap extends GameComponent {

    static url = "BigMap/bigMapNode";

    static BubbleKindCount = 3;

    @property(cc.Node)
    private aniNode: cc.Node = null;
    @property(cc.Node)
    private close: cc.Node = null;
    @property(cc.Node)
    private marketArr: cc.Node[] = [];
    @property(cc.Node)
    private thingBubble: cc.Node[] = [];
    @property(cc.Node)
    private moneyBubble: cc.Node[] = [];
    @property(cc.Label)
    private dangerCount: cc.Label[] = [];
    @property(cc.Node)
    private busArr: cc.Node[] = [];
    @property(cc.Label)
    private busCount: cc.Label[] = [];
    @property(cc.Label)
    private bubbleCountArr: cc.Label[] = [];
    @property(cc.SpriteFrame)
    private canOpen: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private locked: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private normalState: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private chosenState: cc.SpriteFrame = null;
    @property(cc.Label)
    private descLabel: cc.Label[] = [];
    @property(cc.Node)
    private dangerNode: cc.Node[] = [];

    private chooseType: number = 0;
    private chooseMarket: number = 0;

    private stateArr: MarketState[] = [MarketState.NORMAL, MarketState.NORMAL, MarketState.NORMAL];

    start() {
        this._init();
        this._bindEvent();
        this._addListener();
        this.initGuide();
    }

    initGuide() {
        let result = DataMgr.getGuideCompleteTimeById(ArrowType.BigMapArrow);
        if (!result) {
            setTimeout(() => {
                GuideMgr.showSoftGuide(this.marketArr[1], ARROW_DIRECTION.BOTTOM, "查看\n开店条件", null, false, 0, false, this.marketClickEvent);
            }, 100);
        }
    }

    protected onEnable(): void {
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.diamond_mg);
    }

    private _init() {
        let bigMapData = BigMData.getMarketDataArr();
        this.checkMarketState(bigMapData.length);
        bigMapData.forEach((value, key) => {
            this.initMarket(key, value);
        });
        this.initNowMarket();
    }

    private checkMarketState(len: number) {
        if (len === 3) {
            return;
        }
        if (len === 1) {
            this.stateArr[2] = MarketState.LOCKED;
            this.initLocked(2);
        }
        this.checkCanOpen(len);
    }

    checkCanOpen(index: number) {
        let nowLevel = DataMgr.iMarket.getExFrequency() + (DataMgr.iMarket.getMarketId() - 1) * 22;
        let needLevel = JsonMgr.getBranchStore(index + 1).level;
        let node = this.marketArr[index];
        let sprite = node.getComponent(cc.Sprite);
        if (nowLevel >= needLevel) {
            this.stateArr[index] = MarketState.CAN_OPEN;
            this.descLabel[index].node.active = false;
            sprite.spriteFrame = this.canOpen;
        } else {
            this.initLocked(index);
        }
    }

    getUnLockLevel(index: number) {
        return JsonMgr.getBranchStore(index).level;
    }

    initMarket(index: number, data: IBigMapData) {
        this.descLabel[index].string = data.name;
        let busCountLabel = this.busCount[index];
        let busCount = data.busNum;
        busCountLabel.string = busCount.toString();
        busCountLabel.node.active = busCount > 0;
        let busNode = this.busArr[index];
        busNode.active = busCount > 0;
        this.initBubble(index, data);
    }

    initBubble(index: number, data: IBigMapData) {
        let incidentArr = data.incidentNum;
        let dangerArr = data.crisisNum;
        let profits = data.hasProfitBubble;
        let moneyBubble = this.moneyBubble[index];
        moneyBubble.active = profits;
        let thingBubble = this.thingBubble[index];
        thingBubble.active = !!incidentArr;
        let thingLabel = this.bubbleCountArr[index];
        thingLabel.string = incidentArr.toString();
        let dangerLabel = this.dangerCount[index];
        dangerLabel.string = dangerArr.toString();
        let dangerBubble = this.dangerNode[index];
        dangerBubble.active = !!dangerArr;
    }

    initLocked(index: number) {
        this.stateArr[index] = MarketState.LOCKED;
        let btn = this.marketArr[index].getComponent(cc.Sprite);
        btn.spriteFrame = this.locked;
        let label = this.descLabel[index];
        label.string = "店铺总等级" + this.getUnLockLevel(index + 1) + "级解锁";
        label.node.color = cc.Color.WHITE;
    }

    private _addListener() {
        this.addEvent(ClientEvents.REFRESH_BIG_MAP_THING_DANGER.on(this.refreshIncident));
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.close, () => {
            this.closeView();
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
        });
        this._busArrBindEvent();
        this._marketArrBindEvent();
        this._thingBubbleEvent();
        this._dangerBubbleEvent();
        this._moneyBubbleEvent();
    }

    private _busArrBindEvent() {
        this.busArr.forEach((value) => {
            ButtonMgr.addClick(value, this.clickBus)
        });
    }

    private _marketArrBindEvent() {
        this.marketArr.forEach((value) => {
            ButtonMgr.addClick(value, this.marketClickEvent);
        });
    }

    private _thingBubbleEvent() {
        this.thingBubble.forEach((value) => {
            ButtonMgr.addClick(value, this.getAllThings);
        });
    }

    private _dangerBubbleEvent() {
        this.dangerNode.forEach((value) => {
            ButtonMgr.addClick(value, this.getAllDanger);
        });
    }

    private _moneyBubbleEvent() {
        this.moneyBubble.forEach((value) => {
            ButtonMgr.addClick(value, this.getAllMoney);
        })
    }

    clickBus = (event: cc.Event.EventTouch) => {
        let target = event.getCurrentTarget();
        let index = target.getSiblingIndex();
        DataMgr.tourBusData.receptionFirstWaitingBus(index + 1, (response: IRespData) => {
            if(response && response.receptionNum && response.receptionIgnoreNum){
                DotInst.clientSendDot(COUNTERTYPE.otherMarket, "12008", (response.receptionNum - response.receptionIgnoreNum).toString());
            }
            this.refreshBusCount(index);
        });
    };

    getAllMoney = (event: cc.Event.EventTouch) => {
        let target = event.getCurrentTarget();
        let index = target.getSiblingIndex();
        HttpInst.postData(NetConfig.GET_MARKET_ALL_MONEY, [(index + 1)], (res: IRespData) => {
            let reward = res.profits;
            let money = reward[0].num;
            let exp = reward[1].num;
            DotInst.clientSendDot(COUNTERTYPE.otherMarket, "12007", money.toString());
            UIUtil.dynamicLoadPrefab(RecoveryMoneyAni.url, (node: cc.Node) => {
                DataMgr.fillProfits(res, SpecialGetReward.url, "SpecialGetReward");
                setTimeout(() => {
                    target.addChild(node);
                    node.parent = target.parent;
                    let worldPos = target.convertToWorldSpaceAR(cc.v2(0, 0));
                    node.setPosition(target.parent.convertToNodeSpaceAR(worldPos));
                    target.active = false;
                    node.getComponent(RecoveryMoneyAni).init("3", 1);
                    if (index + 1 === DataMgr.getMarketId()) {
                        CacheMap.getAllCaseMoney();
                    }
                }, 100);
            });
        });
    };

    marketClickEvent = (event: cc.Event.EventTouch) => {
        let target = event.getCurrentTarget();
        let zOrder = this.getMarketId(target);
        let result = this.stateArr[zOrder];
        switch (result) {
            case MarketState.NORMAL:
                if (target.getComponent(cc.Sprite).spriteFrame === this.chosenState) {
                    return;
                }
                DotInst.clientSendDot(COUNTERTYPE.otherMarket, "12002", (zOrder + 1).toString());
                this.openMarket(zOrder);
                break;
            case MarketState.CAN_OPEN:
                this.openMissionView(zOrder + 1);
                break;
            default:
                break;
        }
    };

    openMarket(index: number) {
        let marketId = index + 1;
        let nowMarket = DataMgr.iMarket.getMarketId();
        HttpInst.postData(NetConfig.CHANGE_MARKET, [marketId], () => {
            UIMgr.showView(MapLoading.url, null, null, (node: cc.Node) => {
                ClientEvents.MAP_CLEAR_PEOPLE.emit();
                node.getComponent(MapLoading).init(() => {
                    this.closeOnly();
                    UIMgr.resetViewToMiddle();
                    ExpUtil.refreshData();
                    DotInst.clientSendDot(COUNTERTYPE.otherMarket, "12003", marketId.toString());
                    ClientEvents.LOAD_NEW_MARKET.emit(nowMarket);
                    MapMgr.setMapState(FutureState.NORMAL);
                    ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
                    ClientEvents.UP_EXPANSION_LV.emit();//刷新店铺等级
                });
            }, false, 1001);
        });
    }

    refreshBusCount = (index: number) => {
        if(!this.busCount) return;
        let label = this.busCount[index];
        let count = parseInt(label.string);
        if (count - 1 === 0) {
            label.node.active = false;
            this.busArr[index].active = false;
        }
        label.string = (count - 1).toString();
    };

    getMarketId(target: cc.Node) {
        return target.getSiblingIndex();
    }

    getAllThings = (event: cc.Event.EventTouch) => {
        this.openView(event, 2);
    };

    getAllDanger = (event: cc.Event.EventTouch) => {
        this.openView(event, 1)
    };

    openView(event: cc.Event.EventTouch, type: number) {
        let target = event.getCurrentTarget();
        let marketId = this.getMarketId(target) + 1;
        HttpInst.postData(NetConfig.GET_MARKET_THING_DANGER, [marketId, type], (res: IRespData) => {
            this.chooseType = type;
            this.chooseMarket = marketId;
            this.openThingDangerView(res, marketId);
        })
    }

    openThingDangerView(res: IRespData, marketId: number) {
        let incident = res.incident;
        DotInst.clientSendDot(COUNTERTYPE.otherMarket, "12009", incident.id.toString());
        BigMData.setCacheIncident(incident, marketId);
        if (incident.state == 4) { //  完成、过期
            UIMgr.showTipText(TextTipConst.INCIDENT_COMPLETE);
            DataMgr.incidentData.clearExpire();
            return;
        }
        if (incident.state == 3) {
            let conf = JsonMgr.getIncidentById(incident.xmlId);
            if (conf && conf.getType() == 1) {
                if (DataMgr.isInSelfHome()) {//在自己家
                    UIMgr.showTipText(TextTipConst.INCIDENT_OVERSELFHOMEWARNING);
                } else {//在他人家
                    UIMgr.showTipText(TextTipConst.INCIDENT_OVERFRIENDHOMEWARNING);
                }
                DataMgr.incidentData.clearExpire();
                return;
            }
            UIMgr.showTipText(TextTipConst.INCIDENT_FINISH);
            DataMgr.incidentData.clearExpire();
            return;
        }
        let model = DataMgr.incidentData.updateIncident(incident);
        let detail = {
            incident: model,
            helps: res.helps
        };
        DataMgr.incidentData.setIsOtherMarket(true);
        UIMgr.showView(IncidentView.url, null, detail, null, true);
    }

    openMissionView(marketId: number) {
        UIMgr.showView(MissionBg.url, null, null, (node: cc.Node) => {
            if (node) {
                let script: MissionBg = node.getComponent(MissionBg);
                script.init(marketId);
            }
        });
    }

    refreshIncident = () => {
        switch (this.chooseType) {
            case 1:
                this.refreshLabel(this.dangerCount[this.chooseMarket - 1]);
                break;
            case 2:
                this.refreshLabel(this.bubbleCountArr[this.chooseMarket - 1]);
                break;
            default:
                break;
        }
        this.chooseType = 0;
        this.chooseMarket = 0;
    };

    refreshLabel(label: cc.Label) {
        let count = parseInt(label.string);
        count--;
        if (!count) {
            label.node.parent.active = false;
        }
        label.string = count.toString();
    }

    initNowMarket() {
        let nowMarket = DataMgr.iMarket.getMarketId();
        let market = this.marketArr[nowMarket - 1];
        let btn = market.getComponent(cc.Sprite);
        btn.spriteFrame = this.chosenState;
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    protected getBaseUrl(): string {
        return BigMap.url;
    }

}
