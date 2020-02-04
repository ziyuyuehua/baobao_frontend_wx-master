import {GameComponent} from "../../core/component/GameComponent";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {IRechargeActivityInfo} from "../../types/Response";
import {ButtonMgr} from "../common/ButtonClick";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {topUiType} from "../MainUiTopCmpt";
import RechargeItemwx, {ViewType} from "./RechargeItemwx";
import {DataMgr} from "../../Model/DataManager";

const {ccclass, property} = cc._decorator;

export enum ChargeType {
    ACTIVITY = 0,
    CHARGE = 1,
    EX = 2,
    VIP = 3,    //vip
    AD = 5,     //广告
    SHARE = 4.  //ios 分享
}

export interface UpdateItemInter {
    type: number,
    id: number
}


@ccclass
export default class RechargeMain extends GameComponent {
    static url: string = "recharge/RechargeMain"

    @property(cc.Node)
    closeNode: cc.Node = null;

    @property(cc.Node)
    scrollContent: cc.Node = null;

    @property(cc.Prefab)
    rechargePrefab: cc.Prefab = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;


    private itemNodeArr: cc.Node[] = [];
    private itemHeight: Map<number, number> = new Map<number, number>();

    getBaseUrl() {
        return RechargeMain.url;
    }


    onEnable(): void {
        this.init();
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.diamond_mg);
        DataMgr.increaseTopUiNum();
    }

    onDisable(): void {
        DataMgr.decrTopUiNum();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, DataMgr.friendshipUiTop ? topUiType.friendship : -2);
    }

    onLoad() {
        ButtonMgr.addClick(this.closeNode, () => {
            DotInst.clientSendDot(COUNTERTYPE.recharge, "4105");
            this.closeView();
        });
        this.dispose.add(ClientEvents.RECHARGE_MAIN_CONTENT_HEI.on(() => {
            this.scrollContent.height = DataMgr.rechargeModel.getRechargeMainHeight();
        }))
        this.dispose.add(ClientEvents.UPDATE_RECHARGE_VIEW.on(this.updateActivity));
        this.dispose.add(ClientEvents.SCROLL_TO_CHARGE.on(this.scaleToCharge));
        this.dispose.add(ClientEvents.UPDATE_UPTOP.on(this.scaleToTop));
        this.dispose.add(ClientEvents.SCROLL_TO_CHARGE_VIP.on(this.scaleVipToCharge));
        this.dispose.add(ClientEvents.UPDATE_RECHARGE_ITEM_VIEW.on(this.updateItemView));
        this.dispose.add(ClientEvents.GAME_SHOW.on(() => {
            this.updateItemView(-1, true);
        }));
    }

    scaleVipToCharge = (VipId: number) => {
        let nindx = 0;
        let acitvityData = DataMgr.rechargeModel.acitvityData();
        for (let index = 0; index < acitvityData.length; index++) {
            if (acitvityData[index].type == ChargeType.VIP && acitvityData[index].id == VipId) {
                // cc.log("acitvityData:", this.acitvityData[index]);
                nindx = index;
                break;
            }
        }
        this.scaleVipToTop(nindx);
    }

    scaleToCharge = () => {
        let nindx = 0;
        let acitvityData = DataMgr.rechargeModel.acitvityData();
        for (let index = 0; index < acitvityData.length; index++) {
            if (acitvityData[index].type == ChargeType.CHARGE) {
                nindx = index;
                break;
            }
        }
        this.scaleToTop(nindx);
    }

    scaleVipToTop = (changeIndex: number) => {
        if (changeIndex > this.itemNodeArr.length - 1) {
            cc.log("-------- 超标");
            return;
        }
        let moveHeight = 0;
        let acitvityData = DataMgr.rechargeModel.acitvityData();
        for (let index = 0; index < this.itemNodeArr.length; index++) {
            let rechargeItem: RechargeItemwx = this.itemNodeArr[index].getComponent(RechargeItemwx);
            if (index < changeIndex) {
                moveHeight += rechargeItem.getCurHegiht();
            }
            if (changeIndex == index) {
                if (rechargeItem.type === ViewType.CLOSE) {
                    rechargeItem.changeHeightHandler();
                } else {
                    rechargeItem.setOpenState();
                    rechargeItem.setVipView(acitvityData[index]);
                }
            }
        }
        this.scrollContent.y = moveHeight;
    }


    scaleToTop = (changeIndex: number) => {
        if (changeIndex > this.itemNodeArr.length - 1) {
            cc.log("-------- 超标");
            return;
        }
        let moveHeight = 0;
        for (let index = 0; index < this.itemNodeArr.length; index++) {
            let rechargeItem: RechargeItemwx = this.itemNodeArr[index].getComponent(RechargeItemwx);
            if (index < changeIndex) {
                moveHeight += rechargeItem.getCurHegiht();
            }
        }
        this.scrollContent.y = moveHeight;
    }

    updateActivity = () => {
        this.scrollContent.removeAllChildren();
        this.itemNodeArr = [];
        this.InitRechargeView();
    }

    updateItem = () => {
        HttpInst.postData(NetConfig.SHOW_ACIVITE_INFO, [], (response: IRechargeActivityInfo) => {
            DataMgr.rechargeModel.fullData(response);
            // DataMgr.rechargeModel.resetDataVo();
            this.updateScorllview();
        });
    }

    updateItemView = (index: number, game_show?: boolean) => {
        if (index && index !== -1 && !DataMgr.rechargeModel.judgeDeleteItem(DataMgr.rechargeModel.acitvityData()[index].templateId)) {
            let node = this.itemNodeArr[index];
            this.scrollContent.removeChild(node);
            this.itemNodeArr.splice(index, 1);
            this.itemHeight.delete(index);
            for (let i = index + 1; i < this.itemNodeArr.length; i++) {
                this.itemNodeArr[i].y = this.itemNodeArr[i].y + node.height;
            }
            ClientEvents.UPDATE_RECHARGE_ITEM.emit();
        } else if (index == -1 && game_show) {
            HttpInst.postData(NetConfig.SHOW_ACIVITE_INFO, [], (response: IRechargeActivityInfo) => {
                DataMgr.rechargeModel.fullData(response);
                let destroyItemIndex: number = null;
                let activityData = DataMgr.rechargeModel.acitvityData();
                for (let index in activityData) {
                    if (activityData[index].type == ChargeType.ACTIVITY) {
                        if (!DataMgr.rechargeModel.judgeDeleteItem(activityData[index].templateId)) {
                            destroyItemIndex = Number(index);
                        }
                    }
                }
                if (destroyItemIndex) {
                    let node = this.itemNodeArr[destroyItemIndex];
                    this.scrollContent.removeChild(node);
                    this.itemNodeArr.splice(destroyItemIndex, 1);
                    this.itemHeight.delete(destroyItemIndex);
                    for (let i = destroyItemIndex + 1; i < this.itemNodeArr.length; i++) {
                        this.itemNodeArr[i].y = this.itemNodeArr[i].y + node.height;
                    }
                    ClientEvents.UPDATE_RECHARGE_ITEM.emit();
                }
            });
            this.updateScorllview();
        } else {
            this.updateView();
        }
    }

    updateView = () => {
        HttpInst.postData(NetConfig.SHOW_ACIVITE_INFO, [], (response: IRechargeActivityInfo) => {
            DataMgr.rechargeModel.fullData(response);
            this.updateScorllview();
            ClientEvents.UPDATE_RECHARGE_ITEM.emit();
        })
    }

    InitRechargeView() {
        HttpInst.postData(NetConfig.SHOW_ACIVITE_INFO, [], (response: IRechargeActivityInfo) => {
            DataMgr.rechargeModel.fullData(response);
            this.addRechargeItem();
        })
    }

    init() {
        this.addRechargeItem();
    }

    //==================================== 滑动列表 ======== start
    updateScorllview() {
        if (!this.scrollContent) return;
        DataMgr.rechargeModel.resetDataVo();
        let height = 0;
        let acitvityData = DataMgr.rechargeModel.acitvityData();
        for (let index = 0; index < acitvityData.length; index++) {
            let node = this.itemNodeArr[index];
            if (!node) {
                node = cc.instantiate(this.rechargePrefab);
                this.itemNodeArr.push(node);
                node.y = -(index * (node.height));
                this.scrollContent.addChild(node);
            }
            let rechargeItem: RechargeItemwx = node.getComponent(RechargeItemwx);
            // cc.log("acitvityId:" + acitvityData[index].templateId);
            rechargeItem.updateItem(index, acitvityData[index]);
            this.itemHeight.set(index, 0);
            height += (node.height);
        }
        this.scrollContent.height = height;
        DataMgr.rechargeModel.setRechargeMainHeight(height);
    }


    addRechargeItem() {
        DataMgr.rechargeModel.resetDataVo();
        let acitvityData = DataMgr.rechargeModel.acitvityData();
        if(!acitvityData) return;
        let height = 0;
        // cc.log("acitvityData:", acitvityData);
        const list = [];
        for (let i = 0; i < acitvityData.length; ++i) {
            list.push(i);
        }

        function PromiseForEach(arr, cb) {
            let realResult = []
            let result = Promise.resolve()
            arr.forEach((a, index) => {
                result = result.then(() => {
                    return cb(a).then((res) => {
                        realResult.push(res)
                    })
                })
            })
            return result.then(() => {
                return realResult
            })
        }

        PromiseForEach(list, (number) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (!this.itemNodeArr) return;
                    let node = this.itemNodeArr[number];
                    if (!node) {
                        node = cc.instantiate(this.rechargePrefab);
                        this.itemNodeArr.push(node);
                        node.y = -(number * (node.height));
                        this.scrollContent.addChild(node);
                    }
                    let rechargeItem: RechargeItemwx = node.getComponent(RechargeItemwx);
                    rechargeItem.updateItem(number, acitvityData[number]);
                    this.itemHeight.set(number, 0);
                    height += (node.height);
                    return resolve(number);
                }, 50);
            })
        }).then((data) => {
            this.scrollContent.height = height;
            DataMgr.rechargeModel.setRechargeMainHeight(height);
            if (DataMgr.rechargeModel.getVipInfo().length > 0) {
                this.jumpVipItemView();
            }
        }).catch((err) => {
        });
    }

    jumpVipItemView() {
        if (this.node["data"]) {
            this.scaleVipToCharge(this.node["data"]);
        }
    }


    //==================================== 滑动列表 ======== end

}
