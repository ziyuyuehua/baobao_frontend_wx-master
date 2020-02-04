import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {CacheCaseData, CacheMap, FutureState, SendData} from "../CacheMapDataManager";
import {GameComponent} from "../../../core/component/GameComponent";
import {MapMgr} from "../MapInit/MapManager";
import {ButtonMgr} from "../../common/ButtonClick";
import {ShelvesType} from "../../../Model/market/ShelvesDataModle";
import Arrow from "../../common/Arrow";
import {DataMgr} from "../../../Model/DataManager";
import {ARROW_DIRECTION, GuideMgr} from "../../common/SoftGuide";
import {MiniData, MiniGuideState} from "../../NewMiniWarehouse/MiniWarehouseData";
import {HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import {UIMgr} from "../../../global/manager/UIManager";
import {MapResMgr} from "../MapResManager";
import {ExpUtil} from "../Utils/ExpandUtil";
import {IShelves} from "../../../types/Response";

const {ccclass, property} = cc._decorator;

enum State {
    FUTURE = "Shelves",
    WALL = "WallDeco",
    FLOOR = "Floors",
}

@ccclass
export default class ChooseItemDo extends GameComponent {
    static url = 'Prefab/mainUiPrefab/caseChooseBg';

    getBaseUrl() {
        return ChooseItemDo.url;
    }

    @property(cc.Node)
    private bottom: cc.Node = null;
    @property(cc.Node)
    private sureNode: cc.Node = null;
    @property(cc.Node)
    private cancel: cc.Node = null;
    @property(cc.Node)
    private rotate: cc.Node = null;
    @property(cc.Node)
    private collap: cc.Node = null;
    @property(cc.Node)
    private strogeAll: cc.Node = null;
    @property(cc.Node)
    private onset: cc.Node = null;
    @property(cc.Label)
    private caseName: cc.Label = null;
    @property(cc.Node)
    private seeFutureDetail: cc.Node = null;

    private isChoosed = false;
    private offset = 40;
    private state = "";
    private iconLen = 0;
    private itemState: FutureState = 0;
    private script = null;

    private isDoAction = false;
    private arrowNode: cc.Node = null;

    private xmlData: IDecoShopJson = null;
    private canState: boolean = false;
    private isAdd: boolean = false;

    onLoad() {
        this._bindEvent();
        this._addEventListener();
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.sureNode, this.down);
        ButtonMgr.addClick(this.cancel, this.remove);
        ButtonMgr.addClick(this.rotate, this.rote);
        ButtonMgr.addClick(this.collap, this.collaps);
        ButtonMgr.addClick(this.strogeAll, this.strogeAlls);
        ButtonMgr.addClick(this.onset, this.oneset);
        ButtonMgr.addClick(this.seeFutureDetail, this.seeFutureDetailMsg);
    }

    seeFutureDetailMsg = () => {
        UIMgr.openDetailViewAboutFuture(this.xmlData);
    };

    _addEventListener() {
        this.addEvent(ClientEvents.EVENT_GRAY_BTN.on(this.grayItem));
        this.addEvent(ClientEvents.HIDE_CHOOSE_ITEM.on(this.hideChooseItem));
    }

    init = (itemType: string, script: any, xmlData: IDecoShopJson, cb?: Function, isAdd?: boolean) => {
        this.sureNode.zIndex = 999;
        this.isAdd = isAdd;
        this.xmlData = xmlData;
        this.script = script;
        this.state = itemType;
        this.itemState = MapMgr.getMapState();
        if (this.itemState === FutureState.GROUND || this.itemState === FutureState.DECORATE) {
            ClientEvents.HIDE_WAREHOUSE.emit(true);
        }
        switch (itemType) {
            case State.FUTURE:
                this.iconLen = 5;
                this.setPosition(this.sureNode, 1);
                this.setPosition(this.cancel, 2);
                this.setPosition(this.rotate, 3);
                this.setPosition(this.collap, 4);
                this.setPosition(this.seeFutureDetail, 5);
                this.notGroundMode();
                break;
            case State.WALL:
                this.iconLen = 4;
                this.setPosition(this.sureNode, 1);
                this.setPosition(this.cancel, 2);
                this.setPosition(this.collap, 3);
                this.setPosition(this.seeFutureDetail, 4);
                this.rotate.active = false;
                this.notGroundMode();
                break;
            case State.FLOOR:
                this.iconLen = 5;
                this.setPosition(this.sureNode, 1);
                this.setPosition(this.cancel, 2);
                this.setPosition(this.collap, 3);
                this.setPosition(this.onset, 4);
                this.setPosition(this.strogeAll, 5);
                this.rotate.active = false;
                this.seeFutureDetail.active = false;
                break;
        }
        this.setAnimation();
        this.caseName.string = xmlData.name;
        cb && cb();
        this.initGuide();
    };

    notGroundMode() {
        this.onset.active = false;
        this.strogeAll.active = false;
    }

    wallPaperPreview() {
        this.collap.active = false;
        this.rotate.active = false;
        this.notGroundMode();
    }

    setPosition = (node: cc.Node, num: number, yOffset = 0) => {
        node.getComponent(cc.Button).interactable = true;
        let Mid = Math.ceil(this.iconLen / 2);
        if (this.iconLen % 2 === 0) {
            if (num > Mid) {
                node.position = cc.v2((Mid - num + 1) * (this.offset + node.width) - this.offset / 2 - node.width / 2, yOffset);
            } else {
                node.position = cc.v2((Mid - num) * (this.offset + node.width) + node.width / 2 + this.offset / 2, yOffset);
            }
        } else {
            if (num === Mid) {
                node.position = cc.v2(0, 0);
            } else if (num > Mid) {
                node.position = cc.v2(this.offset * (Mid - num) + node.width * (Mid - num), yOffset);
            } else {
                node.position = cc.v2(this.offset * (Mid - num) + node.width * (Mid - num), yOffset);
            }
        }
        node.active = true;
    };

    setAnimation = () => {
        if (this.isChoosed) {
            return;
        }
        if (!this.isDoAction) {
            this.node.active = true;
            this.bottom.active = true;
            this.isDoAction = true;
            this.bottom.runAction(cc.sequence(cc.spawn(cc.moveBy(0.2, 0, 270), cc.fadeIn(0.2)), cc.callFunc(() => {
                this.isDoAction = false;
                this.isChoosed = true;
            })));
        }
    };

    hideAnimation = () => {
        if (!this.node.active) {
            return;
        }
        this.chooseItemHide();
        ClientEvents.HIDE_WAREHOUSE.emit(false);
    };

    hideChooseItem = () => {
        this.chooseItemHide();
    };

    chooseItemHide = () => {
        if (!this.isDoAction) {
            this.isDoAction = true;
            this.bottom.runAction(cc.sequence(cc.spawn(cc.moveBy(0.2, 0, -270), cc.fadeOut(0.2)), cc.callFunc(() => {
                this.isDoAction = false;
                this.isChoosed = false;
                this.bottom.active = false;
                this.node.active = false;
            })));
        }
    };

    down = () => {
        if (this.arrowNode) {
            this.clearArrowNode();
            let state = this.checkState();
            if (MiniData.getIsJump() && state === MiniData.getGuideState()) {
                if (!DataMgr.checkBackShowGuide()) {
                    MiniData.setSaveHasShow(true);
                    ClientEvents.SHOW_SAVE_GUIDE.emit();
                } else {
                    MiniData.setSaveHasShow(true);
                }
            }
        }
        ClientEvents.REFRESH_MINIWAREHOUSE.emit();
        this.putDownItem();
    };

    putDownItem = () => {
        let check = false;
        if (this.state === State.FLOOR) {
            !CacheMap.getDecorateState() && this.chooseItemHide();
            check = this.script.changeGround(false);
        } else {
            if (this.sureNode.getComponent(cc.Button).interactable) {
                if (this.itemState === FutureState.SPECIAL_MOVE) {
                    let cb = () => {
                        this.script.putDown();
                    };
                    let data = this.getItemData();
                    let sendData: SendData[] = [{
                        oldKey: data.id,
                        isReversal: this.script.getDirection(),
                        newKey: this.script.getNowShowPos(),
                        xmlId: this.xmlData.id,
                        oldReversal: data.reversal,
                    }];
                    this.specialSave(sendData, cb);
                } else {
                    check = this.script.putDown();
                }
            } else {
                check = true;
            }
        }
        if (!check && this.itemState !== FutureState.SPECIAL_MOVE) {
            this.hideAnimation();
        }
    };

    remove = () => {
        if (this.itemState === FutureState.SPECIAL_MOVE) {
            this.script.removeItem();
            this.chooseItemHide();
            CacheMap.leaveDecorate();
            ClientEvents.EVENT_SHOW_MENUS.emit();
            ClientEvents.MAP_INIT_FINISHED.emit(true);
        } else {
            this.script.removeItem();
            this.hideAnimation();
        }
        this.clearArrowNode();
    };

    collaps = () => {
        if (this.itemState === FutureState.SPECIAL_MOVE) {
            let data = this.script.getItemMapData();
            let sendData: SendData[] = [{
                oldKey: data.id,
                isReversal: data.reversal,
                newKey: 0,
                xmlId: this.xmlData.id,
                oldReversal: data.reversal
            }];
            let cb = () => {
                this.script.collapsItem();
            };
            this.specialSave(sendData, cb);
        } else {
            this.script.collapsItem();
            this.hideAnimation();
        }
        this.clearArrowNode();
    };

    getItemData(): IShelves {
        let itemData = this.script.getItemMapData();
        return this.xmlData.mainType === ShelvesType.WallShelve ? itemData.WallData : itemData.CaseData;
    }

    specialSave(sendData: SendData[], cb: Function) {
        HttpInst.postData(NetConfig.PUSH_MAPMSG, [sendData, [], ExpUtil.getWallXmlId(), 0, CacheMap.getNowPopularity()], () => {
            cb && cb();
            CacheMap.upDateMapItemAllData();
            CacheMap.clearChangeData();
            CacheMap.leaveDecorate();
            DataMgr.iMarket.checkIsLimitWithCase();
            MapResMgr.checkAssetsUse();
            this.chooseItemHide();
            ClientEvents.EVENT_SHOW_MENUS.emit();
            ClientEvents.MAP_INIT_FINISHED.emit(true);
        });
    }

    rote = () => {
        this.script.rotateItem();
    };

    strogeAlls = () => {
        this.script.storgeAll();
        this.hideAnimation();
    };

    oneset = () => {
        let check: boolean;
        check = this.script.canChangeAllFloor();
        if (!check) {
            this.hideAnimation();
        }
    };

    grayItem = (name: string, state: boolean) => {
        let btn: cc.Button;
        switch (name) {
            case "sure":
                btn = this.sureNode.getComponent(cc.Button);
                break;
            case "collpa":
                btn = this.collap.getComponent(cc.Button);
                break;
            case "strogetAll":
                btn = this.strogeAll.getComponent(cc.Button);
                break;
        }
        this.canState = state;
        btn.interactable = state;
        if (this.arrowNode) {
            this.arrowNode.active = this.canState;
            this.arrowNode.getComponent(Arrow).runAction(false);
        }
    };

    checkState() {
        switch (this.xmlData.mainType) {
            case ShelvesType.FeaturesShelve:
                return MiniGuideState.CASE;
            case ShelvesType.WallShelve:
            case ShelvesType.GroundShelve:
                return MiniGuideState.DECORATE;
        }
    }

    initGuide() {
        if (!DataMgr.getCanShowRedPoint() && MiniData.getIsJump()) {
            if (this.isAdd) {
                switch (this.xmlData.mainType) {
                    case ShelvesType.FeaturesShelve:
                        this.initCaseGuide("点击\n完成摆放");
                        break;
                    case ShelvesType.WallShelve:
                    case ShelvesType.GroundShelve:
                        this.initCaseGuide("摆放\n新装饰");
                        break;
                    default:
                        this.clearArrowNode();
                }
            } else {
                this.clearArrowNode();
            }
        }
    }

    clearArrowNode() {
        if (this.arrowNode) {
            this.arrowNode.destroy();
            this.arrowNode = null;
        }
    }

    initCaseGuide(desc: string) {
        if (!DataMgr.getCanShowRedPoint()) {
            GuideMgr.showSoftGuide(this.sureNode, ARROW_DIRECTION.RIGHT, desc, (node: cc.Node) => {
                this.arrowNode = node;
                this.arrowNode.active = this.canState;
            }, false, 0, false, this.down);
        }
    }

}

