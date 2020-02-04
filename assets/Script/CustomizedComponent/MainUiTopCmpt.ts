import {GameComponent} from "../core/component/GameComponent";
import {HttpInst} from "../core/http/HttpClient";
import {NetConfig} from "../global/const/NetConfig";
import {ClientEvents} from "../global/manager/ClientEventCenter";
import {FunctionName, JsonMgr} from "../global/manager/JsonManager";
import {UIMgr} from "../global/manager/UIManager";
import {DataMgr} from "../Model/DataManager";
import {IRechargeActivityInfo, IRespData, ISettingInfo} from "../types/Response";
import {CommonUtil} from "../Utils/CommonUtil";
import {UIUtil} from "../Utils/UIUtil";
import {ButtonMgr} from "./common/ButtonClick";
import {Type} from "./common/CommonBtn";
import CommoTips, {CommonTipInter} from "./common/CommonTips";
import {COUNTERTYPE, DotInst, DotVo} from "./common/dotClient";
import GoldExchange_wx from "./exchange/goldExchange_wx";
import PopularityView from "./popularity/PopularityView";
import Setting from "./setting/setting";
import UpgradePopover from "./upgradePopover";
import ExpandFrame from "./ExpandFrame/ExpandFrame";
import {RedConst} from "../global/const/RedConst";
import {ItemIdConst} from "../global/const/ItemIdConst";
import {GoldRectuitPanel} from "./staff/recruitNew/recruitAni/gold/GoldRectuitPanel";
import RechargeMain from "./Recharge/RechargeMain";
import ActiveMain from "./active/ActiveMain";
import {GameManager} from "../global/manager/GameManager";

const {ccclass, property} = cc._decorator;
//主UI上部分逻辑脚本

const DEFAULT_TIME_OUT: number = 3000;
const DEFAULT_ZINDEX: number = 0;
const SETTING: string = "setting";

@ccclass
export class MainUiTopCmpt extends GameComponent {
    static url = 'mainUI/MainUiTop';
    private LvUp: boolean = true;

    setLvUp = (ble: boolean) => {
        this.LvUp = ble;
    };

    getLvUp = () => {
        return this.LvUp;
    };

    getBaseUrl() {
        return MainUiTopCmpt.url;
    }

    @property(cc.Node)
    private maskNode: cc.Node = null;
    @property(cc.Node)
    private bar: cc.Node = null;
    @property(cc.Label)
    private levelLabel: cc.Label = null;
    //头像框
    // @property(cc.Sprite)
    // private pictureframe: cc.Sprite = null;
    //头像
    @property(cc.Sprite)
    private headportrait: cc.Sprite = null;
    @property(cc.Label)
    private storeNameLabel: cc.Label = null;
    @property(cc.Label)
    private diamondLabel: cc.Label = null;
    @property(cc.Label)
    private diamondLabel1: cc.Label = null;
    @property(cc.Node)
    private playerInformation: cc.Node = null;
    @property(cc.Node)
    private progressBar: cc.Node = null;
    @property(cc.Label)
    private earningsChangeLabel: cc.Label = null;
    @property(cc.Label)
    private earningsChangeLabel2: cc.Label = null;
    @property(cc.Label)
    private goldLabel: cc.Label = null;
    @property(cc.Label)
    private goldLabel1: cc.Label = null;
    @property(cc.Node)
    private currency: cc.Node = null;

    @property(cc.Node)
    private progressBg: cc.Node = null;

    @property(cc.Sprite)
    private LevelBg: cc.Sprite = null;

    @property(cc.Label)
    private popularityLab: cc.Label = null;
    @property(cc.ProgressBar)
    private popularityPrBar: cc.ProgressBar = null;
    @property(cc.Label)
    private popularityLab1: cc.Label = null;

    @property(cc.Label)
    private popularityReduce: cc.Label = null;

    @property([cc.Node])
    private Btn: cc.Node[] = [];//金币，钻石，人气，营业，设置
    @property(cc.Node)
    private shadow: cc.Node = null;
    @property(cc.Node)
    private bgNode: cc.Node = null;
    @property(cc.Node)
    private swichNode: cc.Node = null;
    @property([cc.Node])
    private zxxq: cc.Node[] = [];

    @property(cc.Node)
    private settingRed: cc.Node = null;

    @property(cc.Node)
    private rechargeRed: cc.Node = null;
    @property(cc.Label)
    private dpLV: cc.Label = null;
    @property(cc.Label)
    private fdLV: cc.Label = null;
    @property(cc.Node)
    private dpBtn: cc.Node = null;
    @property(cc.Node)
    private dpImg: cc.Node = null;

    @property(cc.Label)
    private levelLabel2: cc.Label = null;
    @property([cc.Node])
    private bg: cc.Node[] = [];

    @property(cc.Label)
    private goldMoonLab: cc.Label = null;

    @property(cc.Label)
    private friendshipLab: cc.Label = null;

    @property(cc.Label)
    private diamond_mg: cc.Label = null;

    @property(cc.Node)
    private LvLoadNode: cc.Node = null;
    @property(cc.Node)
    private LvLoadNode1: cc.Node = null;
    @property(cc.Label)
    private expLab: cc.Label = null;
    @property(cc.Node)
    private goldAdd: cc.Node = null;
    @property(cc.Node)
    private diamondAdd: cc.Node = null;
    @property(cc.Node)
    private activeNode: cc.Node = null;


    //当前等级升级所需要经验
    private upexp: number = null;

    load() {
        this.onAddEvent();
        this.showGodeArrBtn();
        this.addActiveMain();
    }

    onEnable() {
        this.refreshUI(true);
        this.onBtn();
        this.loadEarningsChange(DataMgr.businessOneHour);
        this.upExpansionLv();
        this.Btn[0].getComponent(cc.Widget).updateAlignment();
        this.iconWorldPointAR(this.Btn[0]);
        this.iconWorldPointAR(this.Btn[1], -3);
    }


    onBtn = () => {
        // ButtonMgr.addClick(this.storeNameLabel.node.parent, this.openSetting);
        ButtonMgr.addClick(this.Btn[0], this.goldExchangeBtn);
        ButtonMgr.addClick(this.Btn[1], this.diamondExchangeBtn);
        ButtonMgr.addClick(this.Btn[2], this.TouchEnd, null, this.TouchStart, this.TouchCancle);
        ButtonMgr.addClick(this.Btn[14], this.TouchEnd, null, this.TouchStart, this.TouchCancle);
        ButtonMgr.addClick(this.Btn[3], this.openPopularityView);
        ButtonMgr.addClick(this.Btn[4], this.openSetting);
        ButtonMgr.addClick(this.Btn[5], this.goldExchangeBtn);
        ButtonMgr.addClick(this.Btn[6], this.diamondExchangeBtn);
        ButtonMgr.addClick(this.Btn[7], this.openPopularityView);
        ButtonMgr.addClick(this.Btn[9], this.ShowTip);
        ButtonMgr.addClick(this.maskNode, () => {
            this.maskNode.active = false;
            ClientEvents.HIDE_STAFF_MASK.emit();
        });
    };

    ShowTip = () => {
        let xmlData: IItemJson = DataMgr.jsonDatas.itemJsonData[100401];
        let node: cc.Node = this.Btn[9].getChildByName("otherMsgTips");
        node.active = !node.active;
        node.getChildByName("description").getComponent(cc.Label).string = xmlData.description + "";
        node.getChildByName("caseName").getComponent(cc.Label).string = xmlData.name;
        node.getChildByName("count").getComponent(cc.Label).string = DataMgr.getItemNum(ItemIdConst.JIN_YUE) + "";
    };

    openExpand() {
        UIMgr.showView(ExpandFrame.url);
        ClientEvents.UPDATE_MAINUI_RED.emit(DataMgr.redData);
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2005");
    }

    onAddEvent = () => {
        this.addEvent(ClientEvents.EVENT_FUNCTION_OPEN.on(this.showGodeArrBtn));
        this.addEvent(ClientEvents.ADD_ACTIVE_MAIN.on(this.addActiveMain));
        this.addEvent(ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.on(this.refreshItemNum));
        this.addEvent(ClientEvents.UP_EXPANSION_LV.on(this.upExpansionLv));
        this.addEvent(ClientEvents.UPDATE_MAINUI_RED.on(this.updateRedStatus));
        this.addEvent(ClientEvents.LV_UP_ANIM.on(this.setLvUp));
        this.addEvent(ClientEvents.EVENT_REFRESH_EARNINGS.on(this.loadEarningsChange));
        this.addEvent(ClientEvents.EVENT_REFRESH_GOLD.on(this.refreshUI));
        this.addEvent(ClientEvents.EVENT_SWITCH_MUI_ZINDEX.on(this.switchMuiTopZIndex));
        this.addEvent(ClientEvents.EVENT_SWITCH_MAIN_UI.on(this.switchMainUITop));
        this.addEvent(ClientEvents.EVENT_HIDE_MAIN_UI_TOP.on(this.hideMainUITop));
        this.addEvent(ClientEvents.EVENT_POPUP_GOLD_EXCHANGE.on(this.goldExchangeBtn));
        this.addEvent(ClientEvents.EVENT_POPUP_DIAMOND_EXCHANGE.on(this.diamondExchangeBtn));
        // this.addEvent(ClientEvents.OPEN_SETTING_VIEW.on(this.openSetting));
        this.addEvent((ClientEvents.SHOW_TOP_MASK.on((ble: boolean) => {
            this.maskNode.active = ble;
        })));
        this.addEvent(ClientEvents.SWITCH_DECORATE.on(this.switchDecorate));
        this.switchMuiTopZIndex(true);
        this.loadPopularityLab();
    };

    upExpansionLv = () => {
        this.dpLV.string = "LV." + DataMgr.iMarket.getExFrequency();
        this.fdLV.node.active = DataMgr.hasSubMarket();
        this.fdLV.string = DataMgr.getMarketId().toString();
    };
    updateRedStatus = (redDatas: number[]) => {
        if (!DataMgr.getCanShowRedPoint()) return;
        this.settingRed.active = redDatas.indexOf(RedConst.SETTING) !== -1;
        this.rechargeRed.active = redDatas.indexOf(RedConst.VIP) !== -1 || redDatas.indexOf(RedConst.RECHARGE_PACKAGE) !== -1;
    };

    switchDecorate = (ble: boolean) => {
        this.zxxq.forEach((node: cc.Node) => {
            node.active = ble;
        });
    };

    loadPopularityLab = () => {
        this.popularityLab.string = DataMgr.iMarket.getPopularity() + "/" + DataMgr.iMarket.getMaxPopularity();
        this.popularityLab1.string = DataMgr.iMarket.getPopularity() + "/" + DataMgr.iMarket.getMaxPopularity();
    };

    openPopularityView = () => {
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2006");
        UIMgr.showView(PopularityView.url, null, null, null, true);
    };

    TouchStart = (btn: cc.Event.EventTouch) => {
        btn.stopPropagation();
        let canvas = UIMgr.getCanvas();
        let pos = canvas.convertToNodeSpaceAR(btn.getStartLocation());
        let posNew: cc.Vec2 = cc.v2(pos.x, pos.y - 30);
        let parentNode = this.bgNode.active ? this.Btn[2] : this.Btn[14];

        let worldPos = this.bgNode.active ? parentNode.position : posNew;
        let tipData: CommonTipInter = {
            state: Type.YINGYE,
            data: null,
            worldPos: worldPos
        };
        let parent = this.bgNode.active ? this.Btn[2] : null;
        UIMgr.showView(CommoTips.url, parent, tipData, null, false);
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2004");
    };

    TouchCancle = (event) => {
        if (event.currentTouch) {
            UIMgr.closeView(CommoTips.url)
        }
    };

    TouchEnd = (btn: cc.Event.EventTouch) => {
        btn.stopPropagation();
        UIMgr.closeView(CommoTips.url);
    };

    switchMainUITop = (ble: boolean, type?: number) => {
        if (ble) {
            ClientEvents.UPDATE_MAINUI_STAFF_RED.emit();
        }
        let topUINum = DataMgr.getTopUiNum();
        if (type == -2 && topUINum == 0) {
            type = DataMgr.getMainTopUitype();
            ble = DataMgr.getHideMainTopUi();
        }
        this.setUiType(type);
        if (type !== topUiType.friendship && type !== topUiType.diamond_mg && type !== topUiType.gold && topUINum == 0) {
            DataMgr.setMainTopUiType(type);
            DataMgr.setHideMainTopUi(ble);
        }
        if (topUINum == 0) {
            this.bgNode.active = ble;
            this.swichNode.active = !ble;
            if (!DataMgr.checkInPowerGuide()) {
                this.hideActiveMain(ble);
            }
        }
        if (this.bgNode.active) {
            this.iconWorldPointAR(this.Btn[0]);
            this.iconWorldPointAR(this.Btn[1], -3);
        }
    };

    private addActiveMain = () => {
        if (DataMgr.checkInPowerGuide()) return;
        setTimeout(() => {
            UIMgr.showView(ActiveMain.url, this.activeNode);
        }, 300);
    };

    private hideActiveMain = (ble: boolean) => {
        let node: cc.Node = UIMgr.getView(ActiveMain.url);
        if (node) {
            node.active = ble;
        }
    };

    setUiType(type: number) {
        let node: cc.Node = this.Btn[9].getChildByName("otherMsgTips");
        node.active = false;
        if (type == -1) return;
        this.refreshItemNum();
        this.hideTopView();
        switch (type) {
            case topUiType.ordinary:
                this.bg[0].active = true;
                this.bg[1].active = false;
                break;
            case topUiType.shop_furniture:
                this.bg[0].active = false;
                this.bg[1].active = true;
                this.Btn[7].active = true;
                break;
            case topUiType.experience:
                this.bg[0].active = false;
                this.bg[1].active = true;
                this.Btn[8].active = true;
                break;
            case topUiType.goldMoonShop:
                this.bg[0].active = false;
                this.bg[1].active = true;
                this.Btn[9].active = true;
                break;
            case topUiType.friendship:
                this.bg[0].active = false;
                this.bg[1].active = true;
                this.Btn[10].active = true;
                break;
            case topUiType.diamond_mg:
                this.bg[0].active = true;
                this.bg[1].active = false;
                this.Btn[11].active = false;
                break;
            case topUiType.gold:
                this.bg[0].active = true;
                this.bg[1].active = false;
                break;
            case topUiType.Active:
                this.bg[0].active = false;
                this.bg[1].active = true;
                this.Btn[12].active = false;
                this.Btn[13].active = false;
                break;
            case topUiType.earningsChange:
                this.bg[0].active = false;
                this.bg[1].active = true;
                this.Btn[14].active = true;
                break;
        }
        this.iconWorldPointAR(this.Btn[5]);
        this.iconWorldPointAR(this.Btn[6], -3);
    }

    iconWorldPointAR(node, type = -2) {
        let goldIcon = node.getChildByName("New Sprite");
        if (goldIcon) {
            let iconPoint = goldIcon.convertToWorldSpaceAR(cc.v2(0, 0));
            cc.log("iconPoint:" + iconPoint);
            if (type === -3) {
                UIMgr.setDaimconWorldPoint(iconPoint);
            } else {
                UIMgr.setGoldIconWorldPoint(iconPoint);
            }
        }
        return null;
    }


    hideTopView() {
        for (let i = 7; i < this.Btn.length; i++) {
            this.Btn[i].active = false;
        }
    }

    switchMuiTopZIndex = (ble: boolean) => {
        if (ble) {
            this.node.zIndex = 1;
        } else {
            this.node.zIndex = 0;
        }
    };

    hideMainUITop = (ble: boolean) => {
        this.node.active = ble;
    };

    //刷新经验等级进度条
    onExpProgressBar = (level: number, exp: number, incrHowLv: number) => {
        const userData = DataMgr.userData;
        userData.level = level;
        userData.exp = exp;
        userData.incrHowLv = incrHowLv;

        if (!this.progressBg.active) {
            this.levelLabel.string = level + "";
            let upexp = JsonMgr.getLevel(level, "exp");
            let san: number = exp / this.upexp;
            this.expLab.string = exp + "/" + upexp;
            this.bar.setPosition((san * this.progressBar.width), 0);
            return;
        }

        //进度条动画
        if (incrHowLv === 0) {
            //等级
            this.levelLabel.string = level + "";
            this.levelLabel2.string = level + "";
            if (level === 230) {
                let actionMax = cc.place(this.progressBar.width, 0);
                this.bar.runAction(actionMax);
                return;
            }
            this.upexp = JsonMgr.getLevel(level, "exp");
            let san: number = exp / this.upexp;
            this.expLab.string = exp + "/" + this.upexp;
            if (san >= 1) {
                UIMgr.showTipText("EXP:" + exp + "..UPEXP：" + this.upexp + "..Lv:" + level);
                san = 1;
            }
            let cv = cc.v2((san * this.progressBar.width), 1);
            let action = cc.moveTo(0.5, cv);
            this.bar.runAction(action);
            return;
        }
        if (incrHowLv > 0) {
            let time = 1 / (incrHowLv + 1);
            let actionMax = cc.moveTo(time, cc.v2(this.progressBar.width, 1));
            if (level === 230) {
                this.bar.runAction(actionMax);
                return;
            }
            this.upexp = JsonMgr.getLevel(level, "exp");
            let resetAction = cc.place(0, 0);
            let san1: number = exp / this.upexp;
            if (san1 >= 1) {
                UIMgr.showTipText("EXP:" + exp + "..UPEXP：" + this.upexp + "..Lv:" + level);
                san1 = 1;
            }
            let action = cc.moveTo(time, cc.v2((san1 * this.progressBar.width), 1));
            let incrHowLv1 = incrHowLv;
            let cF = cc.callFunc(() => {
                if (incrHowLv1 - 1 > 0) {
                    incrHowLv1--;
                    let seq = cc.sequence(actionMax, resetAction, cF);
                    this.bar.runAction(seq);
                    this.levelLabel.string = level - incrHowLv1 + "";
                    this.levelLabel2.string = level - incrHowLv1 + "";
                    return;
                }
                this.levelLabel.string = level - incrHowLv1 + 1 + "";
                this.expLab.string = exp + "/" + this.upexp;
                this.levelLabel2.string = level - incrHowLv1 + 1 + "";
                // if (this.LvUp) {
                // this.upgradePopover(level, incrHowLv);
                ClientEvents.EVENT_FUNCTION_OPEN.emit();
                // }
                // this.showGodeArrBtn();
                this.bar.runAction(action);
            });
            let seq = cc.sequence(actionMax, resetAction, cF);
            this.bar.runAction(seq);
        }
    };

    showGodeArrBtn = () => {
        this.goldAdd.active = JsonMgr.isFunctionOpen(FunctionName.GoldExchange);
        this.diamondAdd.active = !GameManager.isIos() && JsonMgr.isFunctionOpen(FunctionName.charge);
    };

    refreshItemNum = () => {
        let goldMoonNum = DataMgr.getItemNum(ItemIdConst.JIN_YUE);
        let friendshipNum = DataMgr.getItemNum(ItemIdConst.FRIEND_POINT);
        UIUtil.setLabel(this.goldMoonLab, goldMoonNum);
        UIUtil.setLabel(this.friendshipLab, friendshipNum);
    };

    setUiStatus(status: boolean) {
        this.levelLabel.node.active = status;
        this.LevelBg.node.active = status;
        this.earningsChangeLabel.node.parent.active = status;
    }

    loadEarningsChange = (num: number) => {
        this.earningsChangeLabel.string = CommonUtil.numChange(num, 1) + "/分钟";
        this.earningsChangeLabel2.string = CommonUtil.numChange(num, 1) + "/分钟";
    };

    refreshUI = (isFirst: boolean = false) => {
        //取得数据
        const userData = DataMgr.userData;
        cc.log("用户数据", DataMgr.userData);
        this.setUiStatus(true);
        this.onExpProgressBar(userData.level, userData.exp, userData.incrHowLv);
        UIUtil.setLabel(this.storeNameLabel, userData.nickName); //店名
        if (isFirst) { //头像和头像框仅仅登录的时候设置就可以了，即更新头像之后必须重新登录才生效
            let url: string = userData.head;
            UIUtil.loadUrlImg(url, this.headportrait); //头像
        }
        UIUtil.setLabel(this.goldLabel, CommonUtil.numChange(userData.gold)); //金币
        UIUtil.setLabel(this.diamondLabel, CommonUtil.numChange(userData.diamond)); //钻石
        UIUtil.setLabel(this.goldLabel1, CommonUtil.numChange(userData.gold)); //金币
        UIUtil.setLabel(this.diamondLabel1, CommonUtil.numChange(userData.diamond)); //钻石
        CommonUtil.showRedDot();
        DataMgr.checkMapCanExpand();
    };

    //升级弹窗
    // upgradePopover = (lv: number, incrHowLv: number) => {
    //     UIMgr.showView(UpgradePopover.url, cc.director.getScene(), null, (node: cc.Node) => {
    //         ClientEvents.EVENT_FUNCTION_OPEN.emit();
    //         node.zIndex = 1002;
    //         let upgradePopoverNode: cc.Node = node.getChildByName("upgradePopover1");
    //         upgradePopoverNode.getComponent(UpgradePopover).loadData(lv, incrHowLv);
    //     });
    // };

    //金币充值
    goldExchangeBtn = () => {
        if (DataMgr.checkInPowerGuide()) return;
        if (!JsonMgr.isFunctionOpen(FunctionName.GoldExchange)) {
            let openJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(FunctionName.GoldExchange);
            if (openJson.openType == 1) {
                UIMgr.showTipText("金币兑换将于店等级" + openJson.value + "级后开启");
                return;
            } else if (openJson.openType == 2) {
                let positionJson: IPositionJson = JsonMgr.getPositionJson(openJson.value);
                UIMgr.showTipText("金币兑换将于职位达到【" + positionJson.name + positionJson.level + "阶】后开启");
                return;
            }
        }
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2002");
        HttpInst.postData(NetConfig.GET_EXCHANGE_GOLD, [], (response: IRespData) => {
            UIMgr.showView(GoldExchange_wx.url, DataMgr.isInFriendHome() || UIMgr.getView(GoldRectuitPanel.url) ? cc.director.getScene() : null, response);
        });
    };

    //钻石充值
    diamondExchangeBtn = (idx?: number) => {
        if (DataMgr.checkInPowerGuide()) return;
        if (GameManager.isIos()) return;
        if (!JsonMgr.isFunctionOpen(FunctionName.charge)) {
            let openJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(FunctionName.charge);
            let positionJson: IPositionJson = JsonMgr.getPositionJson(openJson.value);
            UIMgr.showTipText("采购中心将于职位达到【" + positionJson.name + positionJson.level + "阶】后开启");
            return;
        }
        HttpInst.postData(NetConfig.SHOW_ACIVITE_INFO, [], (response: IRechargeActivityInfo) => {
            DataMgr.rechargeModel.fullData(response);
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2003");
            UIMgr.showView(RechargeMain.url, UIMgr.getView(GoldRectuitPanel.url) ? cc.director.getScene() : null, idx, null, true);
        })
    };

    //游戏设置
    openSetting = () => {
        HttpInst.postData(NetConfig.SET_INFO, [], (response: ISettingInfo) => {
            DataMgr.settingData.setSettingInfo(response);
            DataMgr.settingData.setFriendFrame(response.friendFrame);
            DotInst.clientSendDot(COUNTERTYPE.mainPage, "2001");
            UIMgr.showView(Setting.url, null, null, null, true);
        });
    };

    onDestroy() {
        this.dispose.dispose();
    }
}

export enum topUiType {
    ordinary = 0,//默认
    experience = 1,//加经验条
    shop_ordinary = 2,//加兑换道具
    shop_furniture = 3,//加人气值
    goldMoonShop = 4,//加金月
    friendship = 5,//加友情点
    diamond_mg = 6,//萌股钻石
    Active = 7,//活动
    earningsChange = 8,//营业额
    gold = 9,
}
