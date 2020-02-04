import AccessPathList from "../../CustomizedComponent/accessPath/accessPathList";
import {Type} from "../../CustomizedComponent/common/CommonBtn";
import CommonGiftView from "../../CustomizedComponent/common/CommonGiftView";
import CommoTips, {CommonTipInter} from "../../CustomizedComponent/common/CommonTips";
import TextTip from "../../CustomizedComponent/common/TextTip";
import {MapDrag} from "../../CustomizedComponent/MapShow/Utils/MapDrag";
import {JumpConst} from "../const/JumpConst";
import {PrefabPathConst} from "../const/StringConst";
import {TextTipConst} from "../const/TextTipConst";
import {Staff} from "../../Model/StaffData";
import {ICommonRewardInfo, IRespData} from "../../types/Response";
import ErrorTips from "../../Utils/ErrorTips/ErrorTips";
import {UIUtil} from "../../Utils/UIUtil";
import {ClientEvents} from "./ClientEventCenter";
import {FunctionName, JsonMgr} from "./JsonManager";
import {PopPanel} from "../../CustomizedComponent/common/PopPanel";
import {MapMgr} from "../../CustomizedComponent/MapShow/MapInit/MapManager";
import IncidentNoticeBroadcastView from "../../CustomizedComponent/incident/IncidentNoticeBroadcastView";

import {CommonUtil} from "../../Utils/CommonUtil";
import {COM_GIFT_TYPE, DataMgr} from "../../Model/DataManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../const/NetConfig";
import {ButtonMgr} from "../../CustomizedComponent/common/ButtonClick";
import {LoadingView} from "../../CustomizedComponent/common/LoadingView";
import {COUNTERTYPE, DotInst} from "../../CustomizedComponent/common/dotClient";
import {CacheMap} from "../../CustomizedComponent/MapShow/CacheMapDataManager";
import {MoviePlane} from "../../CustomizedComponent/movie/MoviePlane";
import PowerGuide from "../../CustomizedComponent/PowerGuide/PowerGuide";
import {CommonPopup} from "../../CustomizedComponent/common/CommonPopup";
import MoneyFly from "../../CustomizedComponent/MoneyFlyTest/MoneyFly";
import {tipsMgr} from "./tipsRunManager";
import IncentiveAnim from "../../CustomizedComponent/incentiveCountdown/incentiveAnim";
import RechargeMain from "../../CustomizedComponent/Recharge/RechargeMain";
import IncentiveTips from "../../CustomizedComponent/incentiveCountdown/incentiveTips";
import {ServerConst} from "../const/ServerConst";
import {MainUiTopCmpt} from "../../CustomizedComponent/MainUiTopCmpt";
import dialogueView from "../../CustomizedComponent/common/dialogueView";
import ActiveMain from "../../CustomizedComponent/active/ActiveMain";
import {GameManager} from "./GameManager";

const PLACE: cc.Node = new cc.Node(); //占位符常量

class DelayCommonGiftInfo {
    response: IRespData;
    LV?: number[];
    giftType: string;
}

class UIManager {

    static instance: UIManager = new UIManager();

    NORMAL_FRAME: number = 60;
    LOW_FRAME: number = 30;

    private ishideCommunity: boolean = false;
    private mapNode: cc.Node = null;
    private carNode: cc.Node = null;
    private houseNode: cc.Node = null;

    private canvas: cc.Node = null;

    private cacheCommonGiftInfo: DelayCommonGiftInfo = new DelayCommonGiftInfo;

    private viewMap: Map<string, cc.Node> = new Map();

    loadingPrefab: cc.Prefab = null;
    loadingNode: cc.Node = null;

    errorTips: cc.Node = null;

    tipsView: cc.Node = null;
    str: Type;
    tipsPool = new cc.NodePool("ErrorTips");

    specialBubbleNum: number = 6;
    specialBubblePool = new cc.NodePool();

    Loading: cc.Node = null;//加载中预制体
    accessPathList: cc.Node;
    commonGift: cc.Node;
    lastOpenUrl: string = "";

    private expandNode: cc.Node = null;
    private longOrder: cc.Node = null;
    private orderNode: cc.Node = null;
    private recruitNode: cc.Node = null;
    private stationNode: cc.Node = null;
    private arrowOfOrderNode: cc.Node = null;
    private busStation: cc.Node = null;
    private movieNode: cc.Node = null;
    private goldIconWorldPoint: cc.Vec2 = null;
    private futureAndPeople: cc.Node = null;
    private FloorNode: cc.Node = null;
    private outWallLayer: cc.Node = null;

    private mask: cc.Node = null;
    reward: string = "";
    private daimIconWorldPoint: cc.Vec2 = null;

    loadedBigHouse: boolean = false;

    private constructor() {

    }

    setFutureAndPeople(node: cc.Node) {
        this.futureAndPeople = node;
    }

    getFutureAndPeople() {
        return this.futureAndPeople;
    }

    setFloorNode(node: cc.Node) {
        this.FloorNode = node;
    }

    setOutWallLayer(node: cc.Node) {
        this.outWallLayer = node;
    }

    infoGroup(ble: boolean) {
        if (!this.futureAndPeople) return;
        let string: string = ble ? "guideLayer" : "default";
        this.futureAndPeople.group = string;
        this.FloorNode.group = string;
        this.outWallLayer.group = string;
    }

    setMask(mask: cc.Node) {
        this.mask = mask;
        if (this.mask) {
            this.mask.zIndex = 999;
        }
    }

    setGoldIconWorldPoint(nodePoint: cc.Vec2) {
        this.goldIconWorldPoint = nodePoint;
    }

    getGoldIconWorldPoint(): cc.Vec2 {
        return this.goldIconWorldPoint;
    }

    setDaimconWorldPoint(nodePoint: cc.Vec2) {
        this.daimIconWorldPoint = nodePoint;
    }

    getDaimIconWorldPoint(): cc.Vec2 {
        return this.daimIconWorldPoint;
    }

    showMask() {
        UIUtil.showNode(this.mask);
    }

    hideMask() {
        UIUtil.hideNode(this.mask);
    }

    setBusStation(node: cc.Node) {
        this.busStation = node;
    }

    resetViewToBusStation(cb?: Function) {
        this.resetView(this.busStation, cb);
    }

    resetViewToMovie(cb?: Function) {
        this.resetView(this.movieNode, cb);
    }

    setMovieNode(node: cc.Node) {
        this.movieNode = node;
    }

    setARROrdeNode(node: cc.Node) {
        this.arrowOfOrderNode = node;
    }

    getARROrdeNode() {
        return this.arrowOfOrderNode;
    }

    setExpandNode(node: cc.Node) {
        this.expandNode = node;
    }

    setRecruitNode(node: cc.Node) {
        this.recruitNode = node;
    }

    setStationNode(node: cc.Node) {
        this.stationNode = node;
    }

    setOrderNode(node: cc.Node) {
        this.orderNode = node;
    }

    getOrderNode() {
        return this.orderNode;
    }

    resetStationMiddle(cb: Function) {
        this.resetView(this.stationNode, cb);
    }

    resetToRecruitMiddle(cb: Function) {
        this.resetView(this.recruitNode, cb, -113, -170);
    }

    getExpandNode() {
        return this.expandNode;
    }

    setLongOrderHouseNode(node: cc.Node) {
        this.longOrder = node;
    }

    getLongOrderNode() {
        return this.longOrder;
    }

    setHideCommunity(hide: boolean) {
        this.ishideCommunity = hide;
    }

    getHideCommunity(): boolean {
        return this.ishideCommunity;
    }

    resetOrderMiddle(cb: Function) {
        this.resetView(this.orderNode, cb);
    }

    changeMarketClearNode() {
        this.expandNode = null;
        this.longOrder = null;
        this.orderNode = null;
        this.houseNode = null;
        this.carNode = null;
        this.busStation = null;
        this.movieNode = null;
        this.futureAndPeople = null;
    }

    hideMovieNode() {
        this.movieNode && (this.movieNode.active = false);
    }

    closeSceneClearNode() {
        this.canvas = null;
        this.mapNode = null;
    }

    clearExpandNode() {
        if (this.expandNode) {
            this.expandNode.destroy();
        }
        this.expandNode = null;
    }

    resetViewForExpandNode(cb: Function) {
        if (this.expandNode) {
            this.resetView(this.expandNode, cb, 0, this.expandNode.height / 2);
        }
    }

    resetLongOrderView(cb: Function) {
        this.resetView(this.longOrder, cb, 200, 0);
    }

    restOrderView(cb: Function) {
        this.resetView(this.orderNode, cb);
    }

    resetView(node: cc.Node, cb?: Function, offsetX: number = 0, offsetY: number = 0, duraciont?: number) {
        if (!node) {
            return;
        }
        ClientEvents.EVENT_RESET_VIEW.emit(node.convertToWorldSpaceAR(cc.v2(offsetX, offsetY)), cb, duraciont);
    }

    setCarNode(node: cc.Node) {
        this.carNode = node;
    }

    setHouseNode(node: cc.Node) {
        this.houseNode = node;
    }

    getCarNode() {
        return this.carNode;
    }

    getHouseNode() {
        return this.houseNode;
    }

    //缓存地图节点
    setMapNode(mapNode: cc.Node) {
        this.mapNode = mapNode;
    }

    getMapNode(): cc.Node {
        return this.mapNode;
    }

    addMapNodeToCanvas() {
        if (this.canvas && this.mapNode) {
            this.canvas.addChild(this.mapNode);
        }
    }

    //mapNode在GameLoad场景里面动态加载，canvas在主场景onLoad加载
    addMapToCanvas(canvas: cc.Node) {
        this.canvas = canvas; //缓存Canvas画布节点
        this.addMapNodeToCanvas();
    }

    getCanvas(): cc.Node {
        return this.canvas;
    }

    addLoading() {
        if (!this.loadingPrefab) {
            UIUtil.dynamicLoadPrefab(LoadingView.url, (pre: cc.Prefab) => {
                this.loadingPrefab = pre;
                this.doAddLoading();
            });
        } else {
            this.doAddLoading();
        }

    }

    private doAddLoading() {
        let scene: cc.Scene = this.getScene();
        let loadingNode = scene.getChildByName("loading");
        if (!loadingNode) {
            this.loadingNode = cc.instantiate(this.loadingPrefab);
            scene.addChild(this.loadingNode, 10000, "loading");
            UIUtil.hideNode(this.loadingNode);
        }
    }

    showLoading() {
        if (!this.loadingNode) return;
        UIUtil.showNode(this.loadingNode);
        this.loadingNode.getComponent(LoadingView).play();
    }

    hideLoading() {
        if (!this.loadingNode) return;
        this.loadingNode.getComponent(LoadingView).stop();
        UIUtil.hideNode(this.loadingNode);
    }

    //添加进Scene场景
    addSceneChild(node: cc.Node, zIndex?: number, name?: string) {
        let scene: cc.Scene = this.getScene();
        scene.addChild(node, zIndex, name);
    }

    //添加进Canvas画布
    addCanvasChild(node: cc.Node, zIndex?: number, name?: string) {
        this.canvas.addChild(node, zIndex, name);
    }

    resetViewToMiddle = (cb?: Function) => {
        let node = MapMgr.getFloorByPos(cc.v2(18, 19));
        ClientEvents.EVENT_RESET_VIEW.emit(CommonUtil.getRestView(node), cb);
    };

    getPowerGuideNode() {
        return this.getView(PowerGuide.url);
    }

    getView = (url: string, activityId: number = 0) => {
        url = this.prefabUrl(url, activityId);
        return this.viewMap.get(url);
    };

    deleteView = (url: string, activityId: number = 0) => {
        url = this.prefabUrl(url, activityId);
        return this.viewMap.delete(url);
    };

    showView(url: string, parent: cc.Node = null, data = null,
             callBack: (node: cc.Node) => void = null, hideMap: boolean = false,
             nodeZIndex: number = 998, activityId: number = 0, loading: boolean = true) {

        if (CommoTips.url == url || IncentiveAnim.url == url || MoneyFly.url == url || IncentiveTips.url == url ||
            PowerGuide.url == url || dialogueView.url == url || MainUiTopCmpt.url == url || ActiveMain.url == url) {
            loading = false;
        }

        url = this.prefabUrl(url, activityId);
        let oldNode: cc.Node = this.viewMap.get(url);
        if (oldNode) {
            oldNode.active = true;
            oldNode.zIndex = nodeZIndex;
            callBack && callBack(oldNode); //已经打开的界面需要做一些刷新
            return; //如果已经存在，代表正在打开，则直接返回，避免重复多次打开
        }

        //提前占位，避免在动态加载预设没完的时候，又再次打开
        this.viewMap.set(url, PLACE);
        loading = loading && !cc.loader.getRes(url);
        loading && this.showLoading();

        UIUtil.dynamicLoadPrefab(url, (newNode: cc.Node) => {
            this.viewMap.set(url, newNode);
            if (data) {
                newNode["data"] = data;
            }
            newNode.active = true;
            newNode.parent = parent ? parent : this.canvas;
            newNode.zIndex = nodeZIndex;
            callBack && callBack(newNode);

            loading && this.hideLoading();
        });

        ServerConst.SHOW_LOG && console.warn("showView", url, "hideMap =", hideMap);
        hideMap && UIMgr.hideMap();
    }

    closeView(url: string, clear: boolean = true, showMap: boolean = false, openUrl?: string, activityId: number = 0) {
        url = this.prefabUrl(url, activityId);
        let node = this.viewMap.get(url);
        if (!node) {
            return;
        }
        ServerConst.SHOW_LOG && console.warn("closeView", url, "showMap =", showMap);
        if (clear) {
            this.viewMap.delete(url);
            if (node["data"]) {
                node["data"] = null;
            }
            node.destroy(); //销毁这个node
        } else if (node.parent) {
            //隐藏而不销毁，看下是否有这样使用的地方，没有的话clear参数可以不要了
            node.active = false;
            // node.removeFromParent(true);
            // node['data'] = null;
        }
        showMap && UIMgr.showMap();
        openUrl && UIMgr.showView(openUrl);
    }

    private prefabUrl(url: string, activityId: number) {
        url = UIUtil.prefabUrl(url);
        url = url + (activityId != 0 ? activityId : "");
        return url;
    }

    closeSomeView(url: string[]) {
        for (let nid = 0; nid < url.length; nid++) {
            this.closeView(url[nid]);
        }
    }

    //说明面板
    showTextTip(textTip: TextTipConst, parent = null) {
        if (!DataMgr.checkInPowerGuide()) {
            UIMgr.showView(TextTip.url, parent, JsonMgr.getTips(textTip));
        }
    }

    //公用弹窗 title标题 des描述 num消耗品数量 type消耗类型 cb完成回调
    showPopPanel(title: string, des: string, num: number, iconType: number, cb: Function) {
        UIUtil.dynamicLoadPrefab(PopPanel.url, (pre) => {
            this.getScene().addChild(pre, 9999);
            let component: PopPanel = pre.getComponent(pre.name);
            component.initPanel(title, des, num, iconType, cb);
        });
    }

    //显示基本的弹窗
    showPopupDialog(responseData: number[]) {
        if (responseData != null) {
            this.showView(IncidentNoticeBroadcastView.url, null, responseData, null, true);
        }
    }

    //富文本文字描述的通用弹版
    showCommonPopup(content: string, cb: Function) {
        this.showView(CommonPopup.url, null, null, (node: cc.Node) => {
            node.getComponent(CommonPopup).initView(content, cb);
        })
    }

    showMoviePanel(type: number) {//type广告类型
        HttpInst.postData(NetConfig.ADVER_INFO,
            [type], (response: IRespData) => {
                // console.log("showMoviePanel", response);
                UIMgr.showView(MoviePlane.url, cc.director.getScene(), null, (preNode: cc.Node) => {
                    let movie: MoviePlane = preNode.getComponent(preNode.name);
                    movie && movie.initData(type, response);
                });
            });
    }

    //后端异常错误码浮窗
    loadErrorTips = (callBack?: Function) => {
        cc.loader.loadRes(PrefabPathConst.PREFAB_ERROR_TIPS, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
            if (error !== null) {
                cc.log(error);
                return;
            }
            this.errorTips = cc.instantiate(prefab);
            callBack && callBack();
        });
    };


    /**
     * @param {number|string} textId 描述文字或者tipsConst表id
     * @param data 奖励，其实也是string[], "id, num;id,num",应该不是数组
     * @param {string[]} tipsArr 后端发送的tips数组
     */
    showTipText(textId: number | string, data: any = null, tipsArr: string[] = null) {
        let text: string = CommonUtil.isString(textId) ? String(textId) : JsonMgr.getTips(Number(textId));
        if (!DataMgr.checkInPowerGuide() || DataMgr.getGuideCount() === 1) {
            if (this.errorTips) {
                this.showTips(text, data, tipsArr);
            } else {
                UIMgr.loadErrorTips(() => {
                    this.showTips(text, data, tipsArr);
                });
            }
        }
    }

    private showTips(text: string, data: any = null, tipsArr: string[] = null) {
        let tips = this.errorTips;
        if (!tips) {
            cc.log("UIMgr.errorTips not init!");
            return;
        }
        let scene: cc.Scene = this.getScene();
        if (tipsArr) {
            this.showManyTips(tipsArr, scene, false);
        } else if (data) {
            let arr = data.split(";");
            this.showManyTips(arr, scene);
        } else {
            if (tips.parent) {
                tips.removeFromParent();
            }
            scene.addChild(tips, 9999);
            tips.active = true;
            tips.getComponent(ErrorTips).setLabel(text);
        }
    }

    //顺序弹出多个tip
    private showManyTips(tipsArr: string[], scene: cc.Scene, isReward: boolean = true) {
        let action = (cb?: Function) => {
            if (tipsArr.length > 6) {
                tipsArr.splice(3, tipsArr.length - 6)
            }
            let size = tipsArr.length;
            let tips = this.errorTips;
            DataMgr.setTipsNum(size);
            for (let i = 0; i < size; i++) {
                setTimeout(() => {
                    let tipNode = this.tipsPool.get();
                    if (!tipNode) {
                        tipNode = cc.instantiate(tips);
                    }
                    scene.addChild(tipNode, 9999);
                    tipNode.active = true;
                    let errTips: ErrorTips = tipNode.getComponent(ErrorTips);
                    if (isReward) {
                        errTips.setItem(tipsArr[i].split(","), i + 1);
                    } else {
                        errTips.setLabel(tipsArr[i], i + 1);
                    }
                    if (i == size - 1) {
                        setTimeout(() => {
                            cb();
                        }, 1000);

                    }
                }, 1000 * i);
            }
        }
        tipsMgr.addTipsArrToQue({tipsArr: tipsArr, cb: action});
    }

    //给节点增加查看详细点击事件
    addDetailedEvent(node: cc.Node, id: number, count?: number, phylum?: number) {
        node.on(cc.Node.EventType.TOUCH_START, (event) => {
            if (phylum) {
                switch (phylum) {
                    case 7501:
                        DotInst.clientSendDot(COUNTERTYPE.goodsHouse, phylum + "", id + "");
                        break;
                    case 10002:
                        DotInst.clientSendDot(COUNTERTYPE.sign, phylum + "", id + "");
                        break;
                    default:
                        break;
                }
            }
            this.ShowExplainPanel(event, id, count);
        }, this);
        node.on(cc.Node.EventType.TOUCH_END, (event) => {
            this.canclepanel(event);
        }, this);
        node.on(cc.Node.EventType.TOUCH_CANCEL, () => {
            this.closePanel();
        }, this);
        // node.on(cc.Node.EventType.TOUCH_MOVE, () => { this.closePanel(); }, this);
    }


    //给每一个物品加一个button事件响应
    ShowExplainPanel(event, id, count: number = 0) {
        if (count >= 0) {
            let json: any = JsonMgr.getInformationAndItem(id);
            if (id > 200000 && id < 249999) {
                if (json.mainType === 1) {//家具
                    // this.str = ImageConst.FUTUREATLAS;
                    this.str = Type.CASE;//功能性家具
                } else {//装饰
                    this.str = Type.DECORATE;//道具，装饰，货币
                    // this.str = ImageConst.DECORATE;
                }
            } else {
                if (id >= 101 && id <= 105) {//货物
                    this.str = Type.GOODS;//货物
                    // this.str = ImageConst.GOODSICON;
                } else {
                    if (id < 0) {//货币
                        this.str = Type.DECORATE;//道具，装饰，货币
                        // this.str = ImageConst.CURRENCYICON;
                    } else {
                        if (id >= 1001 && id < 9999) {//员工
                            this.str = Type.STAFFATTRIBUTE;
                        } else {//道具
                            this.str = Type.DECORATE;//道具，装饰，货币
                        }
                    }
                }
            }
        } else {
            if (id >= 510001 && id <= 510008) {
                this.str = Type.ACTION;
            } else {
                this.str = Type.LINE;
            }
        }
        let node = event.target;
        let worldPos = node.convertToWorldSpaceAR(cc.v2(0, node.height / 2));
        let pos = cc.director.getScene().convertToNodeSpaceAR(worldPos);
        let tipData: CommonTipInter = {
            state: this.str,
            data: {id: parseInt(id)},
            worldPos: pos
        };
        this.showView(CommoTips.url, cc.director.getScene(), tipData);

        // if (!this.tipsView) {
        //     cc.loader.loadRes("Prefab/common/tips", (err, prefab) => {
        //         this.tipsView = cc.instantiate(prefab);
        //         this.canvas.addChild(this.tipsView);
        //         let pos = this.canvas.convertToNodeSpaceAR(event.getStartLocation());
        //         this.tipsView.getComponent(CommoTips).init({state: this.str}, {id: parseInt(id)}, pos);
        //         this.tipsView.active = true;
        //         this.tipsView.zIndex = 9999;
        //     });
        //     return;
        // }
        // this.tipsView.zIndex = 9999;
        // // let pos = this.canvas.convertToNodeSpaceAR(event.getStartLocation());
        // this.tipsView.getComponent(CommoTips).init({state: this.str}, {id: parseInt(id)}, pos);
        // this.tipsView.active = true;

    }

    addClickCommTip(tipNode: cc.Node, type, id) {
        ButtonMgr.addClick(tipNode,
            () => {
                UIMgr.closeView(CommoTips.url);
            },
            (event) => {
                let startPos = event.currentTouch._startPoint;
                let endPos = event.currentTouch._point;
                let xCha: number = Math.abs(endPos.x) - Math.abs(startPos.x);
                let yCha: number = Math.abs(endPos.y) - Math.abs(startPos.y);
                if (Math.abs(yCha) > 10 || Math.abs(xCha) > 10) {
                    UIMgr.closeView(CommoTips.url);
                }
            },
            (event) => {
                let canvas = cc.director.getScene();
                let pos = canvas.convertToNodeSpaceAR(event.getStartLocation());
                let tipData: CommonTipInter = {
                    state: type,
                    data: {id: id},
                    worldPos: pos
                };
                UIMgr.showView(CommoTips.url, canvas, tipData, null, false)
            },
            (event) => {
                if (event.currentTouch) {
                    UIMgr.closeView(CommoTips.url)
                }
            });
    }

    closePanel() {
        // btn.stopPropagation();
        this.closeView(CommoTips.url);
    }

    canclepanel(event) {
        if (event.currentTouch) {
            this.closeView(CommoTips.url);
        }
    }

    loadaccessPathList(xmlId: number, lastOpenUrl?: string, isItem: boolean = false) {
        if (lastOpenUrl) {
            this.lastOpenUrl = lastOpenUrl;
        }
        let data = {xmlId: xmlId, isItem: isItem};
        UIMgr.showView(AccessPathList.url, cc.director.getScene(), data, null, false);
    }

    showReward(param: any, response: IRespData, LV?: number[]) {
        let serviceMethod: string = param.mod + "." + param.do;
        // console.log("serviceMethod", serviceMethod);
        if (!response.reward && !response.receiveStaffs) {
            return;
        }
        let typeJson = JsonMgr.getFirstJson("rewardShowType", (t: IRewardShowType) => t.interfaceName === param.do);
        if (typeJson) {
            switch (typeJson.type) {
                case 1:
                    let reward = response.reward;
                    let hasGold = false;
                    for (let i of reward) {
                        if (i.xmlId === -2) {
                            hasGold = true;
                            UIMgr.showView(MoneyFly.url, null, null, (node: cc.Node) => {
                                UIUtil.getComponent(node, MoneyFly).initFly(reward);
                            }, false, 1003);
                            return;
                        }
                    }
                    UIMgr.showTipText("获得", CommonUtil.putRewardTogether(reward));
                    break;
                default:
                    break;
            }
        } else {
            if (LV != null && LV[1] > 0) {
                ClientEvents.LV_UP_ANIM.emit(false);
            }

            let staff: Staff[] = [];
            // let staffId: number[] = [];
            if (response.receiveStaffs) {
                staff = response.receiveStaffs;
                // staffId = response.repeatStaffIds;
            }

            if (response.incident != null || response.assistance != null) {
                UIMgr.delayCommonGiftView(response, LV, serviceMethod);
                //协助
                this.reward = null;
                for (let nid = 0; nid < response.reward.length; nid++) {
                    if (this.reward) {
                        this.reward = this.reward + ";" + response.reward[nid].xmlId + "," + response.reward[nid].num;
                    } else {
                        this.reward = response.reward[nid].xmlId + "," + response.reward[nid].num;
                    }
                }

            } else {//危机事件给的奖励
                UIMgr.loadCommonGiftView(response.reward, staff, serviceMethod, (LV != null && LV[1] > 0) ? LV : null);
            }
        }
    }

    delayCommonGiftView(response: IRespData, LV: number[], type: string) {
        this.cacheCommonGiftInfo.LV = LV;

        this.cacheCommonGiftInfo.response = response;

        this.cacheCommonGiftInfo.giftType = type;
    }


    showDelayCommonGiftView(type: COM_GIFT_TYPE = COM_GIFT_TYPE.normal) {
        if (this.cacheCommonGiftInfo.response != null) {
            let LV = this.cacheCommonGiftInfo.LV;

            let staff: Staff[] = [];
            if (this.cacheCommonGiftInfo.response.receiveStaffs) {
                staff = this.cacheCommonGiftInfo.response.receiveStaffs;
            }
            DataMgr.setCommGiftType(type);
            this.loadCommonGiftView(this.cacheCommonGiftInfo.response.reward, staff, this.cacheCommonGiftInfo.giftType, (LV != null && LV[1] > 0) ? LV : null);
            this.cacheCommonGiftInfo.response = null;
            this.cacheCommonGiftInfo.LV = null;
            this.cacheCommonGiftInfo.giftType = null;
        }
    }

    loadCommonGiftView(rewards: ICommonRewardInfo[], staff: Array<Staff> = [], type: string, LV?: number[]) {
        this.showView(CommonGiftView.url, this.getScene(), {rewards, staff, LV, type});
    }

    showCommTipText() {
        if (this.reward) {
            UIMgr.showTipText("领取", this.reward);
            this.reward = null;
        }
    }

    getScene() {
        return cc.director.getScene();
    }

    static emitOpenUI(openUI: JumpConst) {
        ClientEvents.EVENT_OPEN_UI.emit(openUI);
    }

    showMap() {
        // cc.game.setFrameRate(this.NORMAL_FRAME);
        // GameManager.WxServices.setPreferredFramesPerSecond(this.NORMAL_FRAME);

        !CacheMap.getDecorateState() && ClientEvents.MAP_INIT_FINISHED.emit(true);

        //刷新主界面红点
        HttpInst.postData(NetConfig.REDPOLLING, [], (response: IRespData) => {
            if (response.redDots) {
                DataMgr.setRedData(response.redDots);
                ClientEvents.UPDATE_MAINUI_RED.emit(response.redDots);
            } else {
                ClientEvents.HIDE_MAINUI_RED.emit();
            }
        });
        ClientEvents.UDPATE_MAIN_ARRAW_STATE.emit();
        ClientEvents.ACTIVE_BANNER.emit();
        DataMgr.judgeStartSoftGuideJson();
        DataMgr.setClickMainTask(0);
    }

    openDetailViewAboutFuture(xmlData: IDecoShopJson) {
        UIMgr.showView("mainUI/futureDetail", null, null, (futureDetail: cc.Node) => {
            futureDetail.getComponent("FutureDetail").init(xmlData);
        });
    }

    closeBackMapCenter() {
        let limit = JsonMgr.getConstVal("closeInterfaceMocesSence");
        if (DataMgr.userData.level < limit) {
            UIMgr.resetViewToMiddle();
        }
    }

    //隐藏地图
    hideMap() {
        if (!this.mapNode) return;

        // cc.game.setFrameRate(this.LOW_FRAME);
        // GameManager.WxServices.setPreferredFramesPerSecond(this.LOW_FRAME);

        // UIUtil.hideNode(this.mapNode);
        ClientEvents.MAP_CLEAR_PEOPLE.emit();
        ClientEvents.STOP_ACTIVITE_BANNER.emit();
        ClientEvents.HIDE_MAIN_SOFT_GUIDE.emit();
    }

    //将canvas的中点转化成传入节点的节点坐标系
    changeCanvasPosToNode(node: cc.Node): cc.Vec2 {
        return node.convertToNodeSpaceAR(this.canvas.convertToWorldSpaceAR(cc.v2(0, 0)));
    }

    moveOverried = (event: cc.Event.EventTouch) => {
        let startLocation = event.getStartLocation();
        let moveLocation = event.getLocation();
        let offset = Math.sqrt(50);
        if (Math.abs(startLocation.x - moveLocation.x) > offset || Math.abs(startLocation.y - moveLocation.y) > offset) {
            this.mapNode.getComponent(MapDrag).moveMap(event);
            return true;
        }
        return false;
    };

    /* ------------------ 地图块操作逻辑结束 ------------------ */

    hideAllPopularityBubble() {
        if (CacheMap.getPopularityBubbleState()) {
            CacheMap.setPopularityBubbleState(false);
            CacheMap.hideAllPopularityBubble();
        }
    }

}

export const UIMgr: UIManager = UIManager.instance;
