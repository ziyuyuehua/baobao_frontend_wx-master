/**
 *@Athuor ljx
 *@Date 16:12
 */
import {IFosterReward, IRespData, IShelves} from "../../../types/Response";
import {MapMgr} from "../MapInit/MapManager";
import {CacheMap, FutureState} from "../CacheMapDataManager";
import {ButtonMgr} from "../../common/ButtonClick";
import {UIMgr} from "../../../global/manager/UIManager";
import {HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import Shelves from "./Shelves";
import {UIUtil} from "../../../Utils/UIUtil";
import RecoveryMoneyAni from "./RecoveryMoneyAni";
import {DataMgr} from "../../../Model/DataManager";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";
import {ShelvesType} from "../../../Model/market/ShelvesDataModle";
import {CommonUtil} from "../../../Utils/CommonUtil";

const {ccclass, property} = cc._decorator;

export enum MoneyState {
    NONE = 0,
    NORMAL = 100,
    MANY = 700
}

@ccclass

export default class ShelvesBubble extends cc.Component {
    @property(cc.Node)
    private goldBubble: cc.Node = null;
    @property(cc.Sprite)
    private goldIcon: cc.Sprite = null;
    @property(cc.SpriteFrame)
    private lessBubble: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private normalBubble: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private manyBubble: cc.SpriteFrame = null;

    private goldBubbleState: boolean = false;

    private isMove = false;
    private xmlData: IDecoShopJson;
    private goldIconState: string;

    protected start() {
        this._bindEvent();
    }

    init = (shelfData: IShelves, xmlData: IDecoShopJson, scale: number) => {
        this.xmlData = xmlData;
        this.initGoldBubble(shelfData);
        this.setGoldScale(scale);
    };

    initXmlData(xmlData: IDecoShopJson) {
        this.xmlData = xmlData;
    }

    initGoldBubble(shelfData: IShelves) {
        let moneyValue: number = 0;
        if(!DataMgr.checkInPowerGuide()) {
            if(this.checkIsCheckOut()) {
                moneyValue = DataMgr.iMarket.getDecoGoldProfit();
                this.goldBubbleState = moneyValue > 0;
            } else {
                moneyValue = shelfData.goldIncome;
                this.goldBubbleState = moneyValue > 0;
            }
        }
        let marketState = MapMgr.getMapState();
        if (marketState == FutureState.NORMAL) {
            this.goldBubble.active = this.goldBubbleState;
            if (this.goldBubbleState) {
                this.upDownAni();
                this.setMoneyIcon(moneyValue);
            }
        } else {
            this.goldBubble.active = false;
        }
    }

    checkIsCheckOut() {
        return this.xmlData.mainType === ShelvesType.CheckoutShelve && this.getScript().getShelfId() === CommonUtil.posToKey(cc.v2(21, 23));
    }

    setMoneyIcon(moneyIncome: number) {
        if (moneyIncome <= MoneyState.NORMAL && moneyIncome > MoneyState.NONE) {
            this.goldIconState = "";
            this.goldIcon.spriteFrame = this.lessBubble;
        } else if (moneyIncome > MoneyState.NORMAL && moneyIncome < MoneyState.MANY) {
            this.goldIconState = "2";
            this.goldIcon.spriteFrame = this.normalBubble;
        } else if (moneyIncome >= MoneyState.MANY) {
            this.goldIconState = "3";
            this.goldIcon.spriteFrame = this.manyBubble;
        }
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.goldBubble, this.collectMoney, this.clickIsMove);
    }

    getScript() {
        return this.node.getComponent(Shelves);
    }

    collectMoney = () => {
        if (!this.isMove) {
            let isCheckOut = this.checkIsCheckOut();
            let script = this.node.getComponent(Shelves);
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2009", script.getShelfId().toString(), script.getNowShowPos().toString());
            HttpInst.postData(NetConfig.CASHIERGET, [isCheckOut ? -1 : script.getShelfId()], (res: IRespData) => {
                cc.loader.loadRes("Prefab/" + RecoveryMoneyAni.url, cc.Prefab,(error: Error, node: cc.Prefab) => {
                    if(error) {
                        cc.log(error);
                        return;
                    }
                    let finalChar = "";
                    if(isCheckOut) {
                        let gold = res.decoProfit;
                        finalChar = "-2," + gold.toString();
                        let MoneyNode = MapMgr.getMoneyAniNode(node);
                        this.collectHideMoneyBubble(MoneyNode, this.node.scaleX);
                    } else {
                        CacheMap.collectKindCaseMoney(this.xmlData.subType, node);
                        let profits = res.profits;
                        let iFosterExp = this.getProfileFile(profits, -1);
                        finalChar = this.concatChar(finalChar, iFosterExp ? "-1," + (iFosterExp.num + res.extraExp) : "");
                        let iFosterMoney = this.getProfileFile(profits, -2);
                        finalChar = this.concatChar(finalChar, iFosterMoney ? "-2," + iFosterMoney.num : "");
                        finalChar = this.getProfileAll(profits, finalChar);
                    }
                    UIMgr.showTipText("获得", finalChar);
                });
            });
        }
        this.isMove = false;
    };

    getProfileAll(data: IFosterReward[], finalChar: string) {
        for (let i of data) {
            if (i.xmlId !== -1 && i.xmlId !== -2) {
                finalChar = this.concatChar(finalChar, i.xmlId + "," + i.num);
            }
        }
        return finalChar;
    }

    concatChar(char: string, add: string) {
        if (char !== "") {
            char += ";" + add;
            return char;
        } else {
            return add;
        }
    }

    getProfileFile(data: IFosterReward[], id: number) {
        for (let i of data) {
            if (i.xmlId === id) {
                return i;
            }
        }
        return null;
    }

    clickIsMove = (event: cc.Event.EventTouch) => {
        this.isMove = UIMgr.moveOverried(event);
    };

    collectHideMoneyBubble(node: cc.Node, scale: number) {
        if (this.goldBubble.active) {
            this.node.addChild(node);
            node.getComponent(RecoveryMoneyAni).init(this.goldIconState, scale);
            this.goldBubble.runAction(cc.callFunc(() => {
                this.moneyBubbleHide();
            }));
        }

    }

    moneyBubbleHide() {
        this.goldBubble.stopAllActions();
        this.goldBubbleState = false;
        this.initGoldBubblePos();
        this.goldBubble.active = this.goldBubbleState;
    }

    initGoldBubblePos() {
        this.goldBubble.y = 156;
    }

    saleGoodsShowBubble(scale: number, goldIncome: number) {
        if (this.goldBubbleState && this.goldBubble.active) {
            return;
        }
        this.goldBubbleState = true;
        if (MapMgr.getMapState() == FutureState.NORMAL && this.goldBubbleState) {
            this.goldBubble.active = this.goldBubbleState;
        }
        if (this.goldBubble.active) {
            this.upDownAni();
            this.setMoneyIcon(goldIncome);
        }
        this.setGoldScale(scale);
    }

    setGoldScale(scale: number) {
        this.goldBubble.scaleX = scale > 0 ? .75 : -.75
    }

    restBubble() {
        this.goldBubble.stopAllActions();
        this.initGoldBubblePos();
        this.goldBubbleState = false;
        this.goldBubble.active = false;
    }

    upDownAni() {
        let action = cc.repeatForever(cc.sequence(cc.moveBy(0.6, 0, 15).easing(cc.easeQuinticActionOut()),
            cc.moveBy(0.6, 0, -15).easing(cc.easeQuinticActionIn())));
        this.goldBubble.runAction(action);
    }

    decorateHideBubble() {
        this.goldBubble.active = false;
    }

    leaveDecorateShowBubble() {
        this.goldBubble.active = this.goldBubbleState;
    }
}