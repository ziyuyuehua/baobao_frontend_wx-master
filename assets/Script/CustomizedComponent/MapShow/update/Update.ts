import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {HttpInst} from "../../../core/http/HttpClient";
import {GameComponent} from "../../../core/component/GameComponent";
import {CacheCaseData, CacheMap, SendData} from "../CacheMapDataManager";
import {UIMgr} from "../../../global/manager/UIManager";
import FutureDetail from "../../DetailTip/FutureDetail";
import {NetConfig} from "../../../global/const/NetConfig";
import {FutureFather} from "../FutureItem/FutureFather";
import {ExpUtil} from "../Utils/ExpandUtil";
import {DataMgr} from "../../../Model/DataManager";
import {ButtonMgr} from "../../common/ButtonClick";
import {ShelvesType} from "../../../Model/market/ShelvesDataModle";
import {DotInst, COUNTERTYPE} from "../../common/dotClient";
import {CommonUtil} from "../../../Utils/CommonUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Update extends GameComponent {
    static url = 'mainUI/updateBg';

    getBaseUrl() {
        return Update.url;
    }

    @property(cc.Node)
    private fatherNode: cc.Node = null;
    @property(cc.Node)
    private look: cc.Node = null;
    @property(cc.Node)
    private move: cc.Node = null;
    @property(cc.Node)
    private back: cc.Node = null;
    @property(cc.Label)
    private futureName: cc.Label = null;

    private isDoAction = false;
    private xmlData: IDecoShopJson = null;
    private itemData: CacheCaseData = null;
    private choosedFuture: cc.Node = null;

    start() {
        this.bindEvent();
    }

    bindEvent = () => {
        ButtonMgr.addClick(this.node, this.setAction);
        ButtonMgr.addClick(this.look, this.lookItemMsg);
        ButtonMgr.addClick(this.move, this.moveItem);
        ButtonMgr.addClick(this.back, this.backItem);
    };

    lookItemMsg = () => {
        UIMgr.showView(FutureDetail.url, null, null, (futureDetail: cc.Node) => {
            futureDetail.getComponent(FutureDetail).init(this.xmlData);
        }, false, 1002);
        this.setAction();
    };

    moveItem = () => {
        if (DataMgr.getFutureMoveOpen()) {
            CacheMap.changeToSpecialMove();
            let script: FutureFather = this.getScript();
            script.upToChangePosition();
            this.setAction(false);
        }
    };

    getScript(): FutureFather {
        switch (this.xmlData.mainType) {
            case ShelvesType.FeaturesShelve:
            case ShelvesType.GroundShelve:
                return this.choosedFuture.getComponent("Shelves");
            case ShelvesType.WallShelve:
                return this.choosedFuture.getComponent("WallDeco");
        }
    }

    backItem = () => {
        if (DataMgr.getFutureMoveOpen()) {
            CacheMap.initLimitGridData();
            let data = this.getData();
            let sendData: SendData[] = [{
                oldKey: data.id,
                isReversal: data.reversal,
                newKey: 0,
                xmlId: this.xmlData.id,
                oldReversal: data.reversal
            }];
            let errorCb = () => {
                CacheMap.addTruePopularity(this.xmlData.Popularity);
                if (this.xmlData.mainType === ShelvesType.FeaturesShelve) {
                    CacheMap.addUseGrid(this.xmlData, false);
                } else {
                    CacheMap.valueWithPercentCheck();
                }
            };
            CacheMap.addTruePopularity(-this.xmlData.Popularity);
            if (this.xmlData.mainType === ShelvesType.FeaturesShelve) {
                CacheMap.addUseGrid(this.xmlData, true);
            } else {
                CacheMap.valueWithPercentCheck();
            }
            HttpInst.postData(NetConfig.PUSH_MAPMSG, [sendData, [], ExpUtil.getWallXmlId(), 0, CacheMap.getNowPopularity()], () => {
                DotInst.clientSendDot(COUNTERTYPE.mainPage, "2012", this.xmlData.id + "", CommonUtil.keyToPos(sendData[0].oldKey) + "");
                ClientEvents.MAP_CLEAR_PEOPLE.emit();
                ClientEvents.MAP_INIT_FINISHED.emit(true);
                let script: FutureFather = this.getScript();
                script.removeFromCloseGrid();
                this.choosedFuture = null;
                this.setAction(true);
                script.setCachePos();
                script.collapsItem();
                CacheMap.upDateMapItemAllData();
                CacheMap.clearChangeData();
            }, errorCb, errorCb);
        }
    };

    getData() {
        switch (this.xmlData.mainType) {
            case ShelvesType.GroundShelve:
            case ShelvesType.FeaturesShelve:
                return this.itemData.CaseData;
            case ShelvesType.WallShelve:
                return this.itemData.WallData;
        }
    }

    setData = (itemData: CacheCaseData) => {
        this.node.active = true;
        this.xmlData = itemData.xmlData;
        this.itemData = itemData;
        this.choosedFuture = itemData.Node;
        this.futureName.string = this.xmlData.name;
        this.showAnimation();
        this.initBtnState();
    };

    showAnimation = () => {
        if (!this.isDoAction) {
            this.isDoAction = true;
            ClientEvents.EVENT_HIDE_MENUS.emit();
            let size = cc.view.getVisibleSize();
            this.fatherNode.runAction(cc.sequence(cc.spawn(
                cc.moveTo(0.2, cc.v2(this.fatherNode.x, -size.height / 2 + this.fatherNode.height / 2)),
                cc.fadeIn(0.2)),
                cc.callFunc(() => {
                    this.isDoAction = false;
                })));
        }

    };

    setAction = (isShowMenu: boolean = true) => {
        if (!this.isDoAction) {
            this.isDoAction = true;
            let size = cc.view.getVisibleSize();
            isShowMenu && ClientEvents.EVENT_SHOW_MENUS.emit();
            this.fatherNode.runAction(cc.sequence(cc.spawn(cc.moveTo(0.2, cc.v2(this.fatherNode.x, -size.height / 2 - this.fatherNode.height / 2)),
                cc.fadeOut(0.2)),
                cc.callFunc(() => {
                    this.isDoAction = false;
                    this.node.active = false;
                })));

        }
    };

    initBtnState() {
        this.move.getComponent(cc.Button).interactable = DataMgr.getFutureMoveOpen();
        this.back.getComponent(cc.Button).interactable = DataMgr.getFutureMoveOpen();
    }
}
