import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {TourBusView} from "../tourBus/TourBusView";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {IRespData, IUserTourBusDetail} from "../../types/Response";
import {DataMgr} from "../../Model/DataManager";
import {TourBusData} from "../../Model/TourBusData";
import {Bus} from "./MapItem/car/Bus";
import {CompositeDisposable} from "../../Utils/event-kit";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import {UIUtil} from "../../Utils/UIUtil";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";
import {ActionMgr} from "../common/Action";
import {FutureState} from "../MapShow/CacheMapDataManager";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

const FIRST_START_POS: cc.Vec2 = cc.v2(1070, -180); //首次开启巴士站台时，巴士的位置
const START_POS: cc.Vec2 = cc.v2(1660, 83);

const STATION_POS: Array<cc.Vec2> = [
    cc.v2(245, -660),
    cc.v2(580, -420),
];

@ccclass
export class MapTourBus extends cc.Component {

    @property(cc.Node)
    private busLayer: cc.Node = null;

    @property(cc.Node)
    private stationBtn: cc.Node = null;
    @property(cc.Node)
    private scaleNode: cc.Node = null;

    @property(cc.Prefab)
    private busPrefab: cc.Prefab = null;

    @property(cc.Node)
    private openBusNode: cc.Node = null;
    @property(cc.Sprite)
    private stationImg: cc.Sprite = null;
    @property(sp.Skeleton)
    private stationSpine: sp.Skeleton = null;

    private dispose: CompositeDisposable = new CompositeDisposable();
    private busMap: Map<number, Bus> = new Map<number, Bus>();
    private isMove: boolean = false;

    onLoad() {
        UIMgr.setBusStation(this.node);
        // cc.log("MapTourBus onLoad");
        this.dispose.add(ClientEvents.TOUR_NEW_BUS.on(this.refreshBus));
        this.dispose.add(ClientEvents.TOUR_REMOVE_OLD_BUS.on(this.removeOldBus));

        this.dispose.add(ClientEvents.GO_FRIEND_HOME.on(this.refreshStation)); //GO_FRIEND_HOME是进入装修模式

        this.dispose.add(ClientEvents.EVENT_FUNCTION_OPEN.on(this.refreshStation));
        this.dispose.add(ClientEvents.TOUR_OPEN_BUS.on(this.playOpenBus));

        this.dispose.add(ClientEvents.MAP_INIT_FINISHED.on(this.refreshStationAndBus));
        this.dispose.add(ClientEvents.GAME_SHOW.on(this.refreshAllBus));

        this.stationBtn.is3DNode = true;
        ButtonMgr.addClick(this.stationBtn, this.openTourBusView, this.touchMove, this.scaleUp, this.scaleBack);
        ButtonMgr.addClick(this.openBusNode, this.openTourBusView);

        this.refreshStationAndBus();
    }

    scaleUp = () => {
        if (MapMgr.getMapState() !== FutureState.NORMAL) {
            return
        }
        this.scaleNode.runAction(cc.scaleTo(.1, .9));
    };

    scaleBack = () => {
        this.scaleNode.runAction(cc.scaleTo(.1, .8));
    };

    private removeOldBus = () => {
        let firstWaitingBus: IUserTourBusDetail = DataMgr.tourBusData.getFirstWaitingBus();
        if (firstWaitingBus) {
            this.reception(firstWaitingBus, true);
        }
    };

    touchMove = (event: cc.Event.EventTouch) => {
        this.isMove = UIMgr.moveOverried(event);
    };

    private refreshAllBus = () => {
        this.refreshBus(true, false);
    };

    private refreshBus = (isFriend: boolean = false, isTimeOut: boolean = false, isFirst: boolean = false) => {
        let tourBusData: TourBusData = DataMgr.tourBusData;
        if (isFriend) { //去好友家或者重新切换回游戏，得清除重新生成
            this.busMap.forEach((bus: Bus) => {
                bus.node.destroy();
            });
            this.busMap.clear();
            this.busLayer.removeAllChildren();
        }
        if (!tourBusData.isBusOpen()) {
            return;
        }

        let waitingBuses: IUserTourBusDetail[] = tourBusData.getWaitingBuses()
            .filter(this.newBus)
            .sort(TourBusData.ascParkingTime);

        let begin: number = this.busMap.size;
        for (let waitingBus of waitingBuses) {
            this.addMapBus(waitingBus, begin++, isTimeOut, isFirst);
        }
    };

    //未存在busMap里的新巴士
    private newBus = (busDetail: IUserTourBusDetail) => !this.busMap.has(busDetail.station);

    private addMapBus = (busDetail: IUserTourBusDetail, index: number,
                         isTimeOut: boolean = false, isFirst: boolean = false) => {
        let bus: Bus = this.busMap.get(busDetail.station);
        if (bus) {
            return;
        }

        bus = cc.instantiate(this.busPrefab).getComponent(Bus);
        this.addBus(busDetail.station, bus);

        bus.node.setPosition(isTimeOut ? START_POS : STATION_POS[index]);
        bus.init(this, busDetail.travellerNum, isFirst);

        if (isTimeOut) { //如果是倒计时到了才播放车进站的动画
            setTimeout(() => {
                let run = cc.callFunc(() => {
                    bus.run();
                });
                let move = cc.moveTo(isFirst ? 5 : 3, STATION_POS[index]);
                let stop = cc.callFunc(() => {
                    bus.stop();
                });
                bus.node.runAction(cc.sequence(run, move, stop));
            }, index == 0 ? 300 : (index * 1000));
        }
    };

    receptionOrOpenView = () => {
        let firstWaitingBus: IUserTourBusDetail = DataMgr.tourBusData.getFirstWaitingBus();
        if (firstWaitingBus) {
            this.reception(firstWaitingBus);
        } else {
            this.openTourBusView();
        }
    };

    /**
     * 招待等待大巴的旅客
     * @param {IUserTourBusDetail} waitingBus 等待大巴对象
     * @param {boolean} isRemove 是否是被顶走移除大巴，只有积累2辆大巴，第3辆来的时候才会顶掉移走
     */
    private reception = (waitingBus: IUserTourBusDetail, isRemove: boolean = false) => {
        let station = waitingBus.station;
        let bus: Bus = this.busMap.get(station);
        if (!bus) {
            cc.log("not found station=" + station + " bus");
            return;
        }

        if (!DataMgr.tourBusData.checkIsOpen()) {
            return;
        }

        if (isRemove) {
            bus.setRemove();
            bus.runAwayAni(station, this.busMap, this.busLayer);
        } else {
            DataMgr.tourBusData.reception(waitingBus, () => {
                bus.runAwayAni(station, this.busMap, this.busLayer);
            });
        }
    };

    private openTourBusView = () => {
        if (!this.isMove) {
            if (!MapMgr.checkBusCanDown()) {
                return;
            }
            if (!DataMgr.tourBusData.checkIsOpen() || DataMgr.isInFriendHome()) {
                this.scaleBack();
                return;
            }
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2038");
            if (DataMgr.tourBusData.isBusOpen()) {
                HttpInst.postData(NetConfig.TOUR_GET_HISTORIES, [DataMgr.getMarketId()],
                    (response: IRespData) => {
                        this.showTourBusView();
                    });
            } else {
                this.showTourBusView();
            }
        }
        this.isMove = false;
        this.scaleBack();
    };

    private playOpenBus = () => {
        this.stationSpine.setCompleteListener(this.refreshStation);
        this.playStationSpine("animation", false, () => {
            UIUtil.hideNode(this.openBusNode);
            UIUtil.hide(this.stationImg);
            UIUtil.show(this.stationSpine);

            this.refreshBus(true, true, true);
        });
    };

    private showTourBusView = () => {
        UIMgr.showView(TourBusView.url);
    };

    private refreshStationAndBus = () => {
        let mapIsLoaded = MapMgr.getIsLoaded();
        if (!mapIsLoaded) {
            return;
        }
        cc.warn(">>> refreshStationAndBus");
        this.refreshStation();
        this.refreshAllBus();
    };

    private refreshStation = () => {
        let isBusOpen = DataMgr.tourBusData.isBusOpen();
        let lvCanOpenBus = JsonMgr.isFunctionOpen(FunctionName.tourbus);
        let mapIsNormal = MapMgr.mapIsNormal();
        let showOpenBus = !DataMgr.isInFriendHome() && !isBusOpen && lvCanOpenBus;
        UIUtil.visibleNode(this.openBusNode, showOpenBus && mapIsNormal);
        this.openBusNode.stopAllActions();
        if (showOpenBus) {
            UIUtil.show(this.stationImg);
            if (mapIsNormal) {
                this.openBusNode.setPosition(-35, 130);
                this.openBusNode.runAction(ActionMgr.upAndDown());
            }
        } else {
            UIUtil.visible(this.stationImg, !isBusOpen);
            UIUtil.visible(this.stationSpine, isBusOpen);
            if (isBusOpen) {
                this.stationSpine.setCompleteListener(null);
                this.playStationSpine("animation2", !DataMgr.isLowPhone());
            }
        }
    };

    private playStationSpine(name: string, loop: boolean, cb?: Function) {
        UIUtil.asyncPlaySpine(this.stationSpine, "platform/spine/map/busStation/bus_open", name, loop, cb);
    }

    //添加已经开进来的巴士
    private addBus(station: number, bus: Bus) {
        this.busLayer.addChild(bus.node);
        this.busMap.set(station, bus);
    }

    protected onDestroy(): void {
        this.openBusNode.stopAllActions();
        this.dispose.dispose();
    }

}
