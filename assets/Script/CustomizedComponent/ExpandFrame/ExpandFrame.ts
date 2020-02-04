/**
 *@Athuor ljx
 *@Date 17:21
 */
import {GameComponent} from "../../core/component/GameComponent";
import {HttpInst} from "../../core/http/HttpClient";
import {JumpConst} from "../../global/const/JumpConst";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr, SHARE_TYPE} from "../../Model/DataManager";
import {IRespData} from "../../types/Response";
import {CommonUtil} from "../../Utils/CommonUtil";
import {ButtonMgr} from "../common/ButtonClick";
import CommonInsufficient2 from "../common/CommonInsufficient2";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import GoldExchange_wx from "../exchange/goldExchange_wx";
import {topUiType} from "../MainUiTopCmpt";
import {ExpUtil} from "../MapShow/Utils/ExpandUtil";
import ChangeMarketName from "./ChangeMarketName";
import {ChestRes} from "./ChestResManager";
import ExpandInterServal from "./ExpandInterServal";
import {TimeUtil} from "../../Utils/TimeUtil";
import {WxVideoAd} from "../login/WxVideoAd";
import {GameManager} from "../../global/manager/GameManager";
import {GuideIdType, judgeSoftGuideStart} from "../../global/const/GuideConst";
import PowerGuide from "../PowerGuide/PowerGuide";
import CommonInsufficient from "../common/CommonInsufficient";
import {UIUtil} from "../../Utils/UIUtil";

enum ExpandState {
    MATERIAL_NOT,
    POPULARITY_NOT,
    MONEY_NOT,
    LEVEL_NOT,
    CAN_EXPAND,
    MAX
}

const {ccclass, property} = cc._decorator;

@ccclass

export default class ExpandFrame extends GameComponent {

    static url = "expandFrame/expandFrame";

    @property(cc.Node)
    private aniNode: cc.Node = null;
    @property(cc.Label)
    private marketNameEdit: cc.Label = null;
    @property(cc.Label)
    private beforeCountLabel: cc.Label = null;
    @property(cc.Label)
    private afterCountLabel: cc.Label = null;
    @property(cc.Label)
    private usePopularityLabel: cc.Label = null;
    @property(cc.Label)
    private needMoneyLabel: cc.Label = null;
    @property(cc.Label)
    private needLevelLabel: cc.Label = null;
    @property(cc.Node)
    private materialsNode: cc.Node[] = [];
    @property(cc.Sprite)
    private icon: cc.Sprite[] = [];
    @property(cc.Label)
    private count: cc.Label[] = [];
    @property(cc.Sprite)
    private sureLabel: cc.Sprite = null;
    @property(cc.Sprite)
    private popularityEnough: cc.Sprite = null;
    @property(cc.Sprite)
    private needLevelEnough: cc.Sprite = null;
    @property(cc.Node)
    private sureNode: cc.Node = null;
    @property(cc.Node)
    private cancelNode: cc.Node = null;
    @property(cc.Node)
    private houseNode: cc.Node = null;
    @property(cc.Node)
    private maxShowNode: cc.Node = null;
    @property(cc.Node)
    private normalShowNode: cc.Node = null;
    @property(cc.SpriteFrame)
    private graySprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private normalSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private goExpand: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private goCharge: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private goDecorate: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private goOrder: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private getMaterial: cc.SpriteFrame = null;
    @property(cc.Node)
    private popularityDesc: cc.Node = null;
    @property(cc.Node)
    private needLevelDesc: cc.Node = null;
    @property(cc.Node)
    private expandingNode: cc.Node = null;
    @property(cc.Sprite)
    private shareNode: cc.Sprite = null;
    @property(cc.Label)
    private timeLabel: cc.Label[] = [];
    @property(cc.SpriteFrame)
    private seeMovieSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private shareGameSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private expandingSpriteFrame: cc.SpriteFrame = null;
    @property(cc.Node)
    private maxGridNode: cc.Node = null;
    @property(cc.Node)
    private normalGridNode: cc.Node = null;
    @property(cc.Label)
    private marketGetDesc: cc.Label = null;
    @property(cc.Node)
    private marketLayout: cc.Node = null;
    @property(cc.Node)
    private noUse: cc.Node = null;
    @property(cc.Node)
    private redPoint: cc.Node = null;
    @property(cc.Sprite)
    private banner: cc.Sprite = null;

    private sceneData: ISceneJson = null;
    private expandState: ExpandState = 3;
    private useMaterial: string[] = [];
    private notEnoughMaterialId: number = 0;
    private guideNode: cc.Node = null;
    private inOpen: boolean = false;
    private expandingTime: number = 0;
    private seeMovieState: boolean = false;
    private curSoftGuide: ISoftGuideJson = null;

    static ColorRGB: RGBA[] = [
        {
            r: 231,
            g: 15,
            b: 15
        },
        {
            r: 39,
            g: 210,
            b: 43
        }
    ];

    protected onEnable(): void {
        this.onShowPlay(1, this.aniNode,()=>{
            if (DataMgr.checkInPowerGuide()) {
                // this.node.group = "guideLayer";
                UIMgr.showView(PowerGuide.url, null, null, (node: cc.Node) => {
                    node.getComponent(PowerGuide).setNodeToPowerGuide(this.sureNode, () => {
                        // this.node.group = "default";
                        DotInst.clientSendDot(COUNTERTYPE.powerGuide, "205");
                        ChestRes.expandWithoutAni();
                        this.closeOnly();
                    }, 10,false,false);
                }, null, 10000);
            }
        });
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    protected onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    onLoad() {
        this.dispose.add(ClientEvents.TIP_CLOSE_SHOW_GUIDE.on(() => {
            if (this.guideNode) {
                this.guideNode.active = true;
            }
        }))
    }

    protected start(): void {
        this.initExpandFrame();
        this._addListener();
        this._bindEvent();

    }

    private _addListener = () => {
        this.addEvent(ClientEvents.EDIT_MARKET_NAME.on(this.initMarketName));
        this.addEvent(ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.on(this.refreshBySource));
        this.addEvent(ClientEvents.GAME_SHOW.on(this.gameShowResetInterval));
    };

    gameShowResetInterval = () => {
        if(!DataMgr.checkInPowerGuide()) {
            this.unscheduleAllCallbacks();
            this.expandingInit();
        }
    };

    refreshBySource = () => {
        this.initExpandFrame();
    };

    private _bindEvent() {
        ButtonMgr.addClick(this.sureNode, this.sureClickEvent);
        ButtonMgr.addClick(this.cancelNode, this.closeHandle);
        this.materialsNode.forEach((value) => {
            ButtonMgr.addClick(value, this.openSource);
        });
        ButtonMgr.addClick(this.houseNode, this.openEditView);
        ButtonMgr.addClick(this.shareNode.node, this.accExpand);
    }

    openSource = (event: cc.Event.EventTouch) => {
        let index = event.getCurrentTarget().getSiblingIndex();
        let xmlId = parseInt(this.useMaterial[index].split(",")[0]);
        DotInst.clientSendDot(COUNTERTYPE.decoration, "7013", xmlId.toString());
        UIMgr.loadaccessPathList(xmlId);
    };

    closeHandle = () => {
        if (!this.inOpen) {
            UIUtil.deleteLoadUrlImg([this.sceneData.expandUrl]);
            this.closeOnly();
            ClientEvents.UPDATE_MAINUI_RED.emit(DataMgr.getRedData());
            DataMgr.judgeStartSoftGuideJson();
        }
    };

    initExpandFrame() {
        this.notEnoughMaterialId = 0;
        this.expandState = ExpandState.CAN_EXPAND;
        let marketId = DataMgr.iMarket.getMarketId();
        let expTime = DataMgr.iMarket.getExFrequency();
        let btn = this.sureNode.getComponent(cc.Button);
        let sceneId = (marketId - 1) * 22 + expTime;
        this.sceneData = JsonMgr.getSceneData(sceneId);
        if (DataMgr.iMarket.getExpandTime() !== 0) {
            this.expandingNode.active = true;
            this.maxShowNode.active = false;
            this.normalShowNode.active = false;
            this.sureLabel.spriteFrame = this.expandingSpriteFrame;
            this.sureNode.getComponent(cc.Button).interactable = false;
            this.expandingInit();
        } else {
            if (expTime >= 21) {
                this.expandingNode.active = false;
                this.normalShowNode.active = false;
                this.maxShowNode.active = true;
                this.sureNode.active = false;
                this.cancelNode.setPosition(0, this.cancelNode.y);
                this.maxExpandInit();
            } else {
                this.expandingNode.active = false;
                btn.interactable = true;
                this.normalShowNode.active = true;
                this.maxShowNode.active = false;
                this.initCountLabel();
                this.initUseMaterial();
                this.initMaterial();
                this.initUsePopularity();
                this.initUseMoney();
                this.initNeedLevel();
                this.initSureDesc();
                this.initGuide();
                let sprite = this.sureNode.getComponent(cc.Sprite);
                if (this.expandState === ExpandState.CAN_EXPAND) {
                    sprite.spriteFrame = this.normalSprite;
                } else {
                    if(this.expandState === ExpandState.MONEY_NOT) {

                    }
                    sprite.spriteFrame = this.graySprite;
                }
                this.checkMoneyShow();
                this.redPoint.active = this.checkCanExpand();
            }
        }
        this.initBanner(this.sceneData.expandUrl);
        this.initMarketName();
    }

    initBanner(url: string) {
        UIUtil.loadUrlImage(url, (spriteFrame: cc.SpriteFrame) => {
            if(!this.banner || !this.banner.isValid || !spriteFrame) return;
            this.banner.spriteFrame = spriteFrame;
        });
    }

    checkMoneyShow() {
        let result = this.expandState === ExpandState.MONEY_NOT;
        this.needMoneyLabel.node.active = (result || this.checkCanExpand());
        this.sureLabel.node.y = (result || this.checkCanExpand()) ? 18 : 6;
    }

    checkCanExpand() {
        return this.expandState === ExpandState.CAN_EXPAND;
    }

    initMarketName = () => {
        this.marketNameEdit.string = DataMgr.iMarket.getName();
    };

    checkEnough(has: number, need: number, sprite?: cc.Sprite, node?: cc.Node, outLine?: cc.LabelOutline) {
        let result = has >= need;
        sprite && (sprite.node.active = result);
        let color = outLine ? (result ? {r: 63, g: 142, b: 86} : {r: 179, g: 67, b: 67}) : (result ? ExpandFrame.ColorRGB[1] : ExpandFrame.ColorRGB[0]);
        this.initColor(color, outLine ? outLine : node);
        return  result;
    }

    initColor(color: {r, g, b}, node: cc.LabelOutline | cc.Node) {
        node.color = new cc.Color(color.r, color.g, color.b);
    }

    openEditView = () => {
        UIMgr.showView(ChangeMarketName.url);
    };

    initCountLabel() {
        let nowCount = ExpUtil.getNorGridCount();
        this.beforeCountLabel.string = nowCount.toString();
        this.afterCountLabel.string = (nowCount + 16).toString();
    }

    initNeedLevel() {
        let has = DataMgr.userData.level;
        let need = this.sceneData.expandLevel;
        this.needLevelLabel.string = "LV" + need.toString();
        if (!this.checkEnough(has, need, this.needLevelEnough, this.needLevelLabel.node)) {
            if (this.expandState > ExpandState.LEVEL_NOT) {
                this.expandState = ExpandState.LEVEL_NOT;
            }
        }
    }

    initUseMaterial() {
        this.useMaterial.splice(0, this.useMaterial.length);
        this.sceneData.expandConsume.split(";").forEach((value, key) => {
            if (key > 0) {
                this.useMaterial.push(value);
            }
        });
    }

    initUsePopularity() {
        let need = this.sceneData.needPopularity;
        if (need !== 0) {
            let has = DataMgr.iMarket.getPopularity();
            this.usePopularityLabel.string = has + "/" + need;
            if (!this.checkEnough(has, need, this.popularityEnough, this.usePopularityLabel.node)) {
                if (this.expandState > ExpandState.POPULARITY_NOT) {
                    this.expandState = ExpandState.POPULARITY_NOT;
                }
            }
        } else {
            this.popularityDesc.active = this.usePopularityLabel.node.active = false;
            this.needLevelLabel.node.y = 80;
            this.needLevelEnough.node.y = this.needLevelDesc.y = this.needLevelLabel.node.y = this.usePopularityLabel.node.y;
        }
    }

    initUseMoney() {
        let has = DataMgr.userData.gold;
        let need = this.sceneData.expandConsume.split(";")[0].split(",")[1];
        this.needMoneyLabel.string = CommonUtil.numChange(parseInt(need));
        let result = this.checkEnough(has, parseInt(need), null, this.needMoneyLabel.node, this.needMoneyLabel.node.getComponent(cc.LabelOutline));
        if (!result) {
            if (this.expandState > ExpandState.MONEY_NOT) {
                this.expandState = ExpandState.MONEY_NOT;
                this.needMoneyLabel.node.active = true;
            }
        }
    }

    initMaterial() {
        if (this.useMaterial.length > 0) {
            this.materialsNode.forEach((value, key) => {
                if (key >= this.useMaterial.length) {
                    value.active = false;
                } else {
                    let data = this.useMaterial[key].split(",");
                    let xmlId = parseInt(data[0]);
                    let count = parseInt(data[1]);
                    let itemXmlData = JsonMgr.getItem(xmlId);
                    let countLabel = this.count[key];
                    let has = DataMgr.warehouseData.getItemNum(xmlId);
                    countLabel.string = has + "/" + count;
                    let icon = this.icon[key];
                    ResMgr.getItemIcons(icon, itemXmlData.icon);
                    ResMgr.getItemBox2(value.getComponent(cc.Sprite), "k" + itemXmlData.color);
                    if (!this.checkMaterialEnough(has, count, countLabel.node, xmlId)) {
                        if (this.expandState > ExpandState.MATERIAL_NOT) {
                            this.expandState = ExpandState.MATERIAL_NOT;
                        }
                    }
                }
            });
        } else {
            this.marketLayout.active = false;
            this.noUse.active = true;
        }
    }

    checkMaterialEnough(has: number, need: number, labelNode: cc.Node, id: number) {
        if (has >= need) {
            labelNode.getComponent(cc.LabelOutline).color = new cc.Color(75, 115, 69);
            return true;
        } else {
            labelNode.getComponent(cc.LabelOutline).color = new cc.Color(154, 42, 34);
            if (!this.notEnoughMaterialId) {
                this.notEnoughMaterialId = id;
            }
            return false;
        }
    }

    initSureDesc() {
        let desc: cc.SpriteFrame;
        switch (this.expandState) {
            case ExpandState.MONEY_NOT:
                desc = this.goCharge;
                break;
            case ExpandState.POPULARITY_NOT:
                desc = this.goDecorate;
                break;
            case ExpandState.MATERIAL_NOT:
                desc = this.getMaterial;
                break;
            case ExpandState.LEVEL_NOT:
                desc = this.goOrder;
                break;
            case ExpandState.CAN_EXPAND:
                desc = this.goExpand;
                break
        }
        this.sureLabel.spriteFrame = desc;
    }

    sureClickEvent = () => {
        let cb: Function;
        let desc: string;
        switch (this.expandState) {
            case ExpandState.CAN_EXPAND:
                if (!this.inOpen) {
                    this.inOpen = true;
                    DotInst.clientSendDot(COUNTERTYPE.decoration, "7008", DataMgr.getMarketId().toString());
                    this.expandMarket();
                }
                return;
            case ExpandState.MONEY_NOT:
                UIMgr.showView(CommonInsufficient.url, null, 1);
                return;
            case ExpandState.MATERIAL_NOT:
                UIMgr.loadaccessPathList(this.notEnoughMaterialId);
                return;
            case ExpandState.POPULARITY_NOT:
                desc = "人气值不足，是否前往装修？";
                cb = () => {
                    ClientEvents.EVENT_OPEN_UI.emit(JumpConst.DECORATIONVIEW);
                };
                break;
            case ExpandState.LEVEL_NOT:
                desc = "店长等级不足，去促销升级吧？";
                cb = () => {
                    ClientEvents.SHOW_INCENTIVE_GUIDE.emit();
                };
                break;
        }
        UIMgr.showView(CommonInsufficient2.url, null, null, (node: cc.Node) => {
            node.getComponent(CommonInsufficient2).initView(desc, cb);
        }, false, 10002);
    };

    expandMarket = () => {
        this.dispose.dispose();
        let errorCb = () => {
            this.inOpen = false;
        };
        HttpInst.postData(NetConfig.EXPAND, [], () => {
            this.closeOnly();
            if(this.sceneData.waitTime === 0) {
                ChestRes.httpExpand(0, null, null);
            } else {
                UIMgr.showView(ExpandInterServal.url, UIMgr.getMapNode(), null, (node: cc.Node) => {
                    UIMgr.resetViewForExpandNode(null);
                    ChestRes.setNode(node);
                    let script = node.getComponent(ExpandInterServal);
                    script.initPos();
                    script.initInterval();
                    script.showAction();
                });
            }
        }, errorCb, errorCb);
    };

    initGuide() {
        this.curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.expand, 2);
        if (this.curSoftGuide) {
            if (this.curSoftGuide && judgeSoftGuideStart(this.curSoftGuide)) {
                DotInst.clientSendDot(COUNTERTYPE.softGuide, "19008");
                GuideMgr.showSoftGuide(this.sureNode, ARROW_DIRECTION.TOP, this.curSoftGuide.displayText, (node: cc.Node) => {
                    this.guideNode = node;
                }, false, 0, false, this.sureClickEvent);
            }
            return;
        }
        if (this.guideNode) {
            this.guideNode.destroy();
            this.guideNode = null;
        }
    }

    goldExchangeBtn = () => {
        if (!JsonMgr.isFunctionOpen(FunctionName.GoldExchange)) {
            let openJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(FunctionName.GoldExchange);
            if (openJson.openType == 1) {
                UIMgr.showTipText("金币兑换将于店长等级" + openJson.value + "级后开启");
                return;
            } else if (openJson.openType == 2) {
                let positionJson: IPositionJson = JsonMgr.getPositionJson(openJson.value);
                UIMgr.showTipText("金币兑换将于职位达到【" + positionJson.name + positionJson.level + "阶】后开启");
                return;
            }
        }
        HttpInst.postData(NetConfig.GET_EXCHANGE_GOLD, [], (response: IRespData) => {
            UIMgr.showView(GoldExchange_wx.url, null, response);
        });
    };

    expandingInit() {
        this.initShareNode();
        let time = DataMgr.iMarket.getExpandTime();
        let serverTime = DataMgr.getServerTime();
        let result = (time <= serverTime) || (time === -1);
        if (!result) {
            let hasTimeHM = Math.ceil((time - serverTime) / 1000);
            this.expandingTime = hasTimeHM;
            let hasTime = TimeUtil.getTimeBySecond(hasTimeHM);
            let timeArr = this.initArr(hasTime);
            this.timeLabel.forEach((value, key) => {
                value.string = timeArr[key].toString();
            });
            this.shareNode.node.active = !result;
            this.expandingTime > 0 && this.startSchedule();
        } else {
            this.closeReset();
        }
    }

    initArr(time: { h: number, m: number, s: number }) {
        let arr: number[] = [];
        Object.keys(time).map((v) => {
            let num = time[v];
            if (num >= 10) {
                arr.push(Math.floor(num / 10), num % 10);
            } else {
                arr.push(0, num);
            }
        });
        return arr;
    }

    startSchedule() {
        this.schedule(() => {
            this.expandingTime--;
            let i = this.timeLabel.length - 1;
            let isBigLow: boolean = false;
            if (this.expandingTime) {
                while (i >= 0) {
                    let label = this.timeLabel[i];
                    let nowNum = parseInt(label.string);
                    if (i === 5) {
                        label.string = !nowNum ? "9" : (nowNum - 1).toString();
                        isBigLow = !nowNum;
                    } else if (i % 2 !== 0 && i !== 0) {
                        if (isBigLow) {
                            label.string = (nowNum > 0) ? (nowNum - 1).toString() : "9";
                            isBigLow = !(nowNum > 0);
                        }
                    } else {
                        if (isBigLow) {
                            label.string = (nowNum > 0) ? (nowNum - 1).toString() : "5";
                            isBigLow = !(nowNum > 0);
                        }
                    }
                    i--;
                }
            } else {
                this.timeLabel[5].string = "0";
                this.shareNode.node.active = false;
                this.unscheduleAllCallbacks();
                this.closeReset();
            }
        }, 1);
    }

    timeEnd = () => {
        this.unscheduleAllCallbacks();
        this.timeLabel.forEach((value) => {
            value.string = "0";
        });
        this.shareNode.node.active = false;
    };

    accExpand = () => {
        if (this.seeMovieState) {
            this.seeMovie()
        } else {
            this.shareGameTouch();
        }
    };

    seeMovie = () => {
        WxVideoAd.showVideo(() => {
            DotInst.clientSendDot(COUNTERTYPE.expandMarket, "18001", DataMgr.iMarket.getExFrequency().toString());
            HttpInst.postData(NetConfig.RESET_EXPAND_TIME, [], () => {
                DataMgr.iMarket.resetExpandTime();
                this.timeEnd && this.timeEnd();
                ClientEvents.EXPAND_ENDING_TIME.emit();
                ChestRes.addTime();
                DataMgr.setAdInfoById(7, ChestRes.getExpandSeeMovieTime());
                this.closeReset && this.closeReset();
            });
        }, () => {
            UIMgr.showTipText("请观看完整广告！");
        });
    };

    closeReset() {
        UIMgr.resetViewForExpandNode(null);
        UIMgr.closeView(ExpandFrame.url);
    }

    shareGameTouch = () => {
        let shareJs: IShareJson = JsonMgr.getShareJsonByType(SHARE_TYPE.wxExpand);
        GameManager.WxServices.shareGame(shareJs.word, shareJs.pictrue, "", () => {
            DotInst.clientSendDot(COUNTERTYPE.expandMarket, "18002", DataMgr.iMarket.getExFrequency().toString());
            HttpInst.postData(NetConfig.RESET_EXPAND_TIME, [], () => {
                DataMgr.iMarket.resetExpandTime();
                this.timeEnd && this.timeEnd();
                ClientEvents.EXPAND_ENDING_TIME.emit();
                this.closeReset && this.closeReset()
            });
        });
    };

    initShareNode() {
        let movieJson = JsonMgr.getMovieInfo(7);
        let seeResult = (ChestRes.getExpandSeeMovieTime() < movieJson.count) && DataMgr.isCanWatchAdvert();
        this.shareNode.spriteFrame = seeResult ? this.seeMovieSprite : this.shareGameSprite;
        this.seeMovieState = seeResult;
    }

    maxExpandInit() {
        this.beforeCountLabel.node.x = 5;
        this.beforeCountLabel.string = "400";
        this.afterCountLabel.node.active = false;
        this.maxGridNode.active = true;
        this.normalGridNode.active = false;
        this.marketGetDesc.string = "已扩建到最大面积";
    }

    protected getBaseUrl(): string {
        return ExpandFrame.url;
    }
}

export interface RGBA {
    r: number;
    g: number,
    b: number;
    a?: number;
}
