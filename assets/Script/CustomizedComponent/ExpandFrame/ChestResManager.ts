/**
 *@Athuor ljx
 *@Date 19:56
 */
import {UIMgr} from "../../global/manager/UIManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import ExpandInterServal from "./ExpandInterServal";
import {CacheMap, FutureState} from "../MapShow/CacheMapDataManager";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import {ExpUtil} from "../MapShow/Utils/ExpandUtil";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {DataMgr} from "../../Model/DataManager";
import ExpandSuccess from "./ExpandSuccess";

export default class ChestResManager {

    private expandSeeMovieTime: number = 0;
    private intervalNode: cc.Node = null;

    setExpandSeeTime(time: number) {
        this.expandSeeMovieTime = time;
    }

    addTime() {
        this.expandSeeMovieTime++;
    }

    getExpandSeeMovieTime() {
        return this.expandSeeMovieTime;
    }

    backTimeInit = () => {
        if (!this.intervalNode) {
            let adInfo = DataMgr.getAdInfoById(7);
            this.expandSeeMovieTime = adInfo ? adInfo.number : 0;
            UIMgr.showView(ExpandInterServal.url, UIMgr.getMapNode(), null, (node: cc.Node) => {
                this.intervalNode = node;
                let script = node.getComponent(ExpandInterServal);
                script.initPos();
                script.initInterval();
                script.showAction(true);
            });
        }
    };

    setNode(node: cc.Node) {
        this.intervalNode = node;
    }

    destroyNode() {
        if (this.intervalNode) {
            UIMgr.closeView(ExpandInterServal.url);
            this.intervalNode = null;
        }
    }

    httpExpand(choice: number, closeCb?: Function, errCb?: Function) {
        HttpInst.postData(NetConfig.END_EXPAND, [choice], () => {
            closeCb && closeCb();
            ChestRes.destroyNode();
            let moveCb = () => {
                UIMgr.showMask();
                this.expandAniBefore();
                let cb = () => {
                    DotInst.clientSendDot(COUNTERTYPE.decoration, "7009", DataMgr.iMarket.getExFrequency().toString(), DataMgr.getMarketId().toString());
                    this.expandAniAfter();
                };
                ClientEvents.PLAY_EXPAND_ANI.emit(cb);
            };
            ClientEvents.SWITCH_DECORATE.emit(false);
            UIMgr.resetViewForExpandNode(moveCb);
        }, errCb, errCb);
    }

    expandAniBefore() {
        CacheMap.clearWallNode();
        CacheMap.clearWallCloseGrid();
        MapMgr.backWallNode();
        MapMgr.backOutWallToNodePool();
        ExpUtil.refreshData();
        ExpUtil.initExpandData();
        CacheMap.upDateMapItemAllData();
        ExpUtil.expandSetFloor();
        ClientEvents.EXPAND_WALL_PAPER.emit();
        ClientEvents.MAP_CLEAR_PEOPLE.emit();
        if (!DataMgr.checkInPowerGuide()) {
            ClientEvents.EVENT_HIDE_MENUS.emit();
        }
    }

    expandAniAfter(isWithoutAni: boolean = false) {
        ClientEvents.EXPAND_REFRESH.emit();
        ClientEvents.UP_EXPANSION_LV.emit();
        ClientEvents.MAP_INIT_FINISHED.emit(true);
        ClientEvents.EVENT_SHOW_MENUS.emit();
        ClientEvents.UPDATE_MAINUI_RED.emit(DataMgr.getRedData());
        !isWithoutAni && ClientEvents.SWITCH_DECORATE.emit(true);
        ClientEvents.LEVEL_UP_SHOW_BIG_MAP.emit();
        // UIMgr.showView(ExpandSuccess.url, null, null, (node: cc.Node) => {
        //     let script = node.getComponent(ExpandSuccess);
        //     let time = DataMgr.iMarket.getExFrequency() + (DataMgr.iMarket.getMarketId() - 1) * 22;
        //     script.init(time);
        // }, false, 1002);
    }

    expandWithoutAni = () => {
        HttpInst.postData(NetConfig.EXPAND, [], () => {
            HttpInst.postData(NetConfig.END_EXPAND, [0], () => {
                HttpInst.postData(NetConfig.POWER_GUIDE, [], () => {
                    let cb = () => {
                        DotInst.clientSendDot(COUNTERTYPE.decoration, "7009", DataMgr.iMarket.getExFrequency().toString(), DataMgr.getMarketId().toString());
                        this.expandAniAfter(true);
                        ClientEvents.UP_POWER_GUIDE.emit(13);
                    };
                    UIMgr.resetViewForExpandNode(() => {
                        this.expandAniBefore();
                        ClientEvents.PLAY_EXPAND_ANI.emit(cb);
                    });
                });
            });
        });
    };

    private static _instance: ChestResManager = null;

    static instance() {
        if (!ChestResManager._instance) {
            ChestResManager._instance = new ChestResManager();
        }
        return ChestResManager._instance;
    }

}

export const ChestRes = ChestResManager.instance();