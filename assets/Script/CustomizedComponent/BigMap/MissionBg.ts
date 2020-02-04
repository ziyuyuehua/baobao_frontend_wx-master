/**
 *@Athuor ljx
 *@Date 17:15
 */
import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {DataMgr} from "../../Model/DataManager";
import {UIMgr} from "../../global/manager/UIManager";
import {ResMgr} from "../../global/manager/ResManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import MissionNode from "./MissionNode";
import ExpandFrame from "../ExpandFrame/ExpandFrame";
import {CommonUtil} from "../../Utils/CommonUtil";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import {FutureState} from "../MapShow/CacheMapDataManager";
import MapLoading from "../MapShow/MapInit/MapLoading";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {ChestRes} from "../ExpandFrame/ChestResManager";
import {ExpUtil} from "../MapShow/Utils/ExpandUtil";
import BigMap from "./BigMap";
import {ArrowType} from "../common/Arrow";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import {BigMData} from "./BigMapData";
import OpenNewMarketLoading from "../MapShow/OpenNewMarketLoading";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass

export default class MissionBg extends GameComponent {

    static url = "BigMap/MissionBg";

    @property(cc.Node)
    private back: cc.Node = null;
    @property(cc.Node)
    private openMarket: cc.Node = null;
    @property(cc.Sprite)
    private marketBanner: cc.Sprite = null;
    @property(cc.Label)
    private marketStory: cc.Label = null;
    @property(cc.Prefab)
    private missionPrefab: cc.Prefab = null;
    @property(cc.Node)
    private missionLayout: cc.Node = null;
    @property(cc.Node)
    private aniNode: cc.Node = null;
    @property(cc.Label)
    private moneyLabel: cc.Label = null;
    @property(cc.Sprite)
    private iconArr: cc.Sprite[] = [];
    @property(cc.Sprite)
    private bgArr: cc.Sprite[] = [];
    @property(cc.Label)
    private useCount: cc.Label[] = [];
    @property(cc.LabelOutline)
    private outLine: cc.LabelOutline[] = [];
    @property(cc.Sprite)
    private isEnough: cc.Sprite[] = [];

    private marketId: number = 0;
    private xmlData: IBranchStore = null;
    private canExpand: boolean = true;

    protected start() {
        this._bindEvent();
        this.addEvent(ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.on(this.sourceGetRefresh));
    }

    protected onEnable(): void {
        this.onShowPlay(1, this.aniNode);
    }

    sourceGetRefresh = () => {
        this.canExpand = true;
        this.initMaterial();
        this.initMoney();
        this.initGuide();
        this.openMarket.getComponent(cc.Button).interactable = (this.canExpand && BigMData.getIsAllMissionComplete());
    };

    init(marketId: number) {
        BigMData.initAllMissionComplete();
        this.marketId = marketId;
        this.xmlData = JsonMgr.getBranchStore(marketId);
        ResMgr.getBranchMarketBanner(this.marketBanner, this.xmlData.background, null);
        this.marketStory.string = this.xmlData.story;
        this.initMissionItem();
        this.initMaterial();
        this.initMoney();
        this.initGuide();
        this.openMarket.getComponent(cc.Button).interactable = (this.canExpand && BigMData.getIsAllMissionComplete());
    }

    initGuide() {
        if(!DataMgr.getGuideCompleteTimeById(ArrowType.BigMapArrow)) {
            if(this.canExpand && BigMData.getIsAllMissionComplete()) {
                this.showCompleteArrow();
            }
        }
    }

    openSource = () => {

    };

    showCompleteArrow() {
        GuideMgr.showSoftGuide(this.openMarket, ARROW_DIRECTION.TOP, "开启\n新店吧", null,false, 0, false, this.openMarketRequest);
    }

    initMoney() {
        let useGold = DataMgr.userData.gold;
        let need = this.xmlData.cost.split(",")[1];
        let color = this.getColor(parseInt(need), useGold);
        this.moneyLabel.node.color = new cc.Color(color.r, color.g, color.b);
        this.moneyLabel.string = CommonUtil.numChange(useGold) + "/" + CommonUtil.numChange(parseInt(need));
        if(parseInt(need) > useGold) {
            this.canExpand = false;
        }
    }

    initMaterial() {
        let itemCost = this.xmlData.itemCost.split(";");
        itemCost.forEach((value, key) => {
            let split = value.split(",");
            let xmlId = parseInt(split[0]);
            let xmlData = JsonMgr.getItem(xmlId);
            let count = parseInt(split[1]);
            let sprite = this.bgArr[key];
            ButtonMgr.addClick(sprite.node, () => {
                DotInst.clientSendDot(COUNTERTYPE.otherMarket, "12005", xmlData.id.toString());
                UIMgr.loadaccessPathList(xmlData.id);
            });
            ResMgr.getItemBox(sprite, "k" + xmlData.color);
            ResMgr.getItemIcon(this.iconArr[key],  xmlData.icon, .7);
            let hasCount = DataMgr.warehouseData.getItemNum(xmlId);
            let label = this.useCount[key];
            label.string = hasCount + "/" + count;
            let color = this.getColor(count, hasCount);
            this.outLine[key].color = new cc.Color(color.r, color.g, color.b);
            this.checkIsEnough(key, hasCount, count);
        });
    }

    getColor(needCount: number, hasCount: number) {
        let colorIndex: number = needCount <= hasCount ? 1 : 0;
        return ExpandFrame.ColorRGB[colorIndex];
    }

    checkIsEnough(index: number, hasCount: number, needCount: number) {
        if(hasCount >= needCount) {
            this.isEnough[index].node.active = true;
        } else {
            this.isEnough[index].node.active = false;
            this.canExpand = false;
        }
    }

    initMissionItem() {
        this.xmlData.taskIds.forEach((value, key) => {
            let node = cc.instantiate(this.missionPrefab);
            node.getComponent(MissionNode).init(key, value);
            this.missionLayout.addChild(node);
        });
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.back, this.closeOnly);
        ButtonMgr.addClick(this.openMarket, this.openMarketRequest);
    }

    private _addListener() {
        this.addEvent(ClientEvents.REFRESH_BIG_MAP_MISSION.on(this.refreshMissionNode));
    }

    openMarketRequest = () => {
        let nowMarketId = DataMgr.iMarket.getMarketId();
        if(this.canExpand && BigMData.getIsAllMissionComplete()) {
            HttpInst.postData(NetConfig.OPEN_BRANCH_MARKET, [], () => {
                DotInst.clientSendDot(COUNTERTYPE.otherMarket, "12006", (nowMarketId + 1).toString());
                if(DataMgr.getGuideCompleteTimeById(ArrowType.BigMapArrow)) {
                    this.goNextMarket(nowMarketId);
                } else {
                    HttpInst.postData(NetConfig.SOFT_LED_INFO, [ArrowType.BigMapArrow], () => {
                        this.goNextMarket(nowMarketId);
                    });
                }
            });
        }
    };

    goNextMarket(nowMarketId: number) {
        UIMgr.showView(OpenNewMarketLoading.url, null, null, (node: cc.Node) => {
            ClientEvents.MAP_CLEAR_PEOPLE.emit();
            node.getComponent(OpenNewMarketLoading).init(() => {
                ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true,-1);
                UIMgr.closeView(MissionBg.url, true, false);
                UIMgr.closeView(BigMap.url, true, false);
                UIMgr.resetViewToMiddle();
                ExpUtil.refreshData();
                ClientEvents.LOAD_NEW_MARKET.emit(nowMarketId);
                ClientEvents.UP_EXPANSION_LV.emit();//刷新店铺等级
                MapMgr.setMapState(FutureState.NORMAL);
            });
        });
    }

    refreshMissionNode = () => {
        this.missionLayout.children.forEach((value, key) => {
            let script = value.getComponent(MissionNode).init(key, this.xmlData.taskIds[key]);
        });
    };

    protected getBaseUrl(): string {
        return MissionBg.url;
    }
}