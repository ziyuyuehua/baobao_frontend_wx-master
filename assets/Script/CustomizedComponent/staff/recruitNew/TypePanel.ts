import { GameComponent } from "../../../core/component/GameComponent";
import { HttpInst } from "../../../core/http/HttpClient";
import { ItemIdConst } from "../../../global/const/ItemIdConst";
import { JumpConst } from "../../../global/const/JumpConst";
import { NetConfig } from "../../../global/const/NetConfig";
import { TextTipConst } from "../../../global/const/TextTipConst";
import { AudioMgr } from "../../../global/manager/AudioManager";
import { ClientEvents } from "../../../global/manager/ClientEventCenter";
import { GameManager } from "../../../global/manager/GameManager";
import { FunctionName, GoldFairCostConfig, JsonMgr } from "../../../global/manager/JsonManager";
import { ResManager } from "../../../global/manager/ResManager";
import { UIMgr } from "../../../global/manager/UIManager";
import { DataMgr } from "../../../Model/DataManager";
import { ShowType } from "../../../Model/ExchangeData";
import { Recruit, RecruitData, RecruitResult } from "../../../Model/RecruitData";
import { IRespData } from "../../../types/Response";
import { CommonUtil } from "../../../Utils/CommonUtil";
import { UIUtil } from "../../../Utils/UIUtil";
import { ButtonMgr } from "../../common/ButtonClick";
import CommonInsufficient, { InsufficientType } from "../../common/CommonInsufficient";
import { COUNTERTYPE, DotInst } from "../../common/dotClient";
import { ARROW_DIRECTION, GuideMgr } from "../../common/SoftGuide";
import GoldExchange_wx from "../../exchange/goldExchange_wx";
import { topUiType } from "../../MainUiTopCmpt";
import { CacheMap } from "../../MapShow/CacheMapDataManager";
import { MiniData } from "../../NewMiniWarehouse/MiniWarehouseData";
import RechargeMain from "../../Recharge/RechargeMain";
import { LeftTime, TimeOutType } from "../recruit/LeftTime";
import { DiamondPanel } from "./DiamondPanel";
import { DiamondRecruitAni } from "./DiamondRecruitAni";
import { ExchangePanel } from "./ExchangePanel";
import { MustRatePanel } from "./MustRatePanel";
import { GoldRectuitPanel } from "./recruitAni/gold/GoldRectuitPanel";
import { StaffRatePanel } from "./StaffRatePanel";
import { WxVideoAd } from "../../login/WxVideoAd";
import { GuideIdType } from "../../../global/const/GuideConst";
import dialogueView from "../../common/dialogueView";

const { ccclass, property } = cc._decorator;

@ccclass
export class TypePanel extends GameComponent {
    static url: string = "Prefab/staff/recruit/recruit";

    @property(cc.Button)
    rateBtn: cc.Button = null;
    @property(cc.Button)
    exchangeBtn: cc.Button = null;

    @property(cc.Button)
    backBtn: cc.Button = null;
    @property((cc.Button))
    mustGetBackBtn: cc.Button = null;

    @property(LeftTime)
    leftTime: LeftTime = null;

    @property(cc.Label)
    densityLabel: cc.Label = null;

    @property(cc.Sprite)
    goldTextImage: cc.Sprite = null;
    @property(cc.Sprite)
    goldFreeImage: cc.Sprite = null;
    @property(cc.Label)
    goldLabel: cc.Label = null;
    @property(cc.Sprite)
    diamondFreeImage: cc.Sprite = null;
    @property(cc.Label)
    diamondOneLabel: cc.Label = null;
    @property(cc.Label)
    diamondOneItemLabel: cc.Label = null;

    @property(cc.Label)
    diamondFiveLabel: cc.Label = null;
    @property(cc.Label)
    diamondFiveItemLabel: cc.Label = null;

    @property(cc.Prefab)
    showStaffResumePrefab: cc.Prefab = null;

    @property(cc.Sprite)
    oneBtnRed: cc.Sprite = null;
    @property(cc.Sprite)
    fiveBtnRed: cc.Sprite = null;
    @property(cc.Sprite)
    goldBtnRed: cc.Sprite = null;

    @property(cc.Sprite)
    goldLockBg: cc.Sprite = null;
    @property(cc.Label)
    resetLabel: cc.Label = null;

    @property(cc.Node)
    normalRecruit: cc.Node = null;
    @property(cc.Node)
    mustGetRecruit: cc.Node = null;

    @property(cc.Button)
    mustGetStaffBtn: cc.Button = null;
    @property(cc.Button)
    mustGetCaseBtn: cc.Button = null;

    @property((cc.Button))
    mustGetBtn: cc.Button = null;
    @property((cc.Button))
    recruitBtn: cc.Button = null;

    @property(cc.Label)
    mustGetStaffLabel: cc.Label = null;
    @property(cc.Label)
    mustGetCaseLabel: cc.Label = null;

    @property((cc.Node))
    watchBtn: cc.Node = null;

    private diamondSoftGuide: cc.Node = null;
    private goldSoftGuide: cc.Node = null;
    private backSoftGuide: cc.Node = null;
    private guideBack = false;
    private mayGuideBack = false;
    private mainClickTask = 0;

    private rateViewType = 0;
    private goldSoftGuideId: number = 0;

    @property(cc.Node)
    private arrow: Array<cc.Node> = [];

    getBaseUrl() {
        return TypePanel.url;
    }

    load() {
        AudioMgr.playMusic("Audio/hyl", true);
        ButtonMgr.addClick(this.rateBtn.node, this.onRateBtnClick);
        ButtonMgr.addClick(this.exchangeBtn.node, this.onExchangeBtnClick);

        ButtonMgr.addClick(this.backBtn.node, this.onBackBtnClick);
        ButtonMgr.addClick(this.mustGetBackBtn.node, this.onBackBtnClick);

        ButtonMgr.addClick(this.mustGetBtn.node, this.moveMustGetRecruit);
        ButtonMgr.addClick(this.recruitBtn.node, this.moveNormalRecruit);

        this.addEvent(ClientEvents.LEFT_TIME_OUT.on(this.hideResumePanel));
        this.addEvent(ClientEvents.RECRUIT_REFRESH_TYPE_LABELS.on(this.refresh));
        this.addEvent(ClientEvents.DIALO_END_SEND.on(() => {
            this.updateDialogGuide();
        }))
        this.initWatchView();
    }

    private moveMustGetRecruit = () => {
        this.rateViewType = 1;
        this.normalRecruit.runAction(cc.moveBy(0.5, -cc.winSize.width, 0).easing(cc.easeSineOut()));
        this.mustGetRecruit.runAction(cc.moveBy(0.5, -cc.winSize.width, 0).easing(cc.easeSineOut()));
    };

    private moveNormalRecruit = () => {
        this.rateViewType = 0;
        this.normalRecruit.runAction(cc.moveBy(0.5, cc.winSize.width, 0).easing(cc.easeSineOut()));
        this.mustGetRecruit.runAction(cc.moveBy(0.5, cc.winSize.width, 0).easing(cc.easeSineOut()));
    };

    private mustGet(event, index) {
        HttpInst.postData(NetConfig.mustGetRecruit, [index], (response: IRespData) => {
            if (!response.recruit || !this.showStaffResumePrefab) {
                return;
            }
            let recruitResult = new RecruitResult(response.recruit);
            let cb = () => {
                if (recruitResult.isStaff() && recruitResult.staff.staffId > 0) {
                    DataMgr.staffData.update(recruitResult.staff);
                }
            };
            let recruitResults = [recruitResult];
            const showStaffResume = cc.instantiate(this.showStaffResumePrefab).getComponent(DiamondRecruitAni);
            showStaffResume.initAndPlay(recruitResults, () => {
                this.refreshMustGet();
                UIMgr.showView(DiamondPanel.url, null, null, (node: cc.Node) => {
                    node.getComponent(DiamondPanel).showRecruitResultList(recruitResults, ShowType.MustGetStaff, false, cb);
                });
            });
        });
    };

    private refreshMustGet() {
        let mustGetStaffNum: number = DataMgr.getItemNum(ItemIdConst.MUST_GET_STAFF);
        UIUtil.setLabel(this.mustGetStaffLabel, mustGetStaffNum + "/1");
        let mustGetCaseNum: number = DataMgr.getItemNum(ItemIdConst.MUST_GET_CASE);
        UIUtil.setLabel(this.mustGetCaseLabel, mustGetCaseNum + "/1");

        let hasMustGetStaff: boolean = mustGetStaffNum > 0;
        let hasMustGetCase: boolean = mustGetCaseNum > 0;
        let hasMustGetItem: boolean = hasMustGetStaff || hasMustGetCase;
        UIUtil.visible(this.mustGetBtn, hasMustGetItem);
        UIUtil.visible(this.mustGetStaffBtn, hasMustGetStaff);
        UIUtil.visible(this.mustGetCaseBtn, hasMustGetCase);
    }

    unload() {
    }

    start() {
        UIUtil.setLabel(this.diamondOneLabel, JsonMgr.getConstVal("diamondSingleCost"));
        UIUtil.setLabel(this.diamondFiveLabel, JsonMgr.getConstVal("diamondFiveCost"));

        this.mustGetRecruit.x = cc.winSize.width;
        this.refresh(false);
        this.refreshLeftTime();
    }

    onEnable() {
        // cc.game.setFrameRate(UIMgr.NORMAL_FRAME);
        // GameManager.WxServices.setPreferredFramesPerSecond(UIMgr.NORMAL_FRAME);

        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
        this.mainClickTask = DataMgr.getClickMainTask();

        this.onShowPlay(1, this.normalRecruit);
        // this.refresh(false);
        this.refreshLeftTime();
        this.updateDialogGuide();
    }


    updateDialogGuide() {
        if (this.mainClickTask) {
            if (this.mainClickTask == JumpConst.GOLD_RECRUIT) {
                this.showGoldTalk();
            }
            if (this.mainClickTask == JumpConst.DIAMOND_RECRUIT) {
                this.showDiamTalk();
            }
        } else {
            let isShowGuide = this.showDiamTalk();
            if (isShowGuide) {
                this.showGoldTalk();
            }
        }
    }

    showDiamTalk() {
        let softGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunDiam, 2);
        if (softGuide && DataMgr.getGuideCompleteTimeById(softGuide.id) <= 0) {
            HttpInst.postData(NetConfig.SOFT_LED_INFO, [softGuide.id], (response) => {
                UIMgr.showView(dialogueView.url, null, softGuide.optionId);
            });
            return false;
        } else {
            let staftSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunDiam, 3);
            let endSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunDiam, 4);
            if (staftSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                this.showDiamondGuide(staftSoftGuide);
                return false;
            }
            return true;
        }
    }

    showDiamondGuide(staftSoftGuide: ISoftGuideJson) {
        if (!JsonMgr.isFunctionOpen(FunctionName.diamDraw)) {
            return;
        }
        if (this.diamondSoftGuide) {
            this.diamondSoftGuide.active = true;
        } else {
            this.diamondSoftGuide = new cc.Node;
            let node = this.diamondFreeImage.node.parent;
            this.diamondSoftGuide.parent = node;
            this.diamondSoftGuide.setContentSize(node.getContentSize());
            GuideMgr.showSoftGuide(this.diamondSoftGuide, ARROW_DIRECTION.BOTTOM, staftSoftGuide.displayText, (node: cc.Node) => {
                // this.diamondSoftGuide = node;
            }, false, 0, false, () => {
                // this.onDiamondBtnClick(null, 1);
            });
        }
    }

    showGoldTalk() {
        if (!JsonMgr.isFunctionOpen(FunctionName.goldDraw)) {
            return;
        }
        let softGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunGold, 2);
        if (softGuide && DataMgr.getGuideCompleteTimeById(softGuide.id) <= 0) {
            HttpInst.postData(NetConfig.SOFT_LED_INFO, [softGuide.id], (response) => {
                UIMgr.showView(dialogueView.url, null, softGuide.optionId);
            });
        } else {
            let staftSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunGold, 3);
            if (staftSoftGuide && DataMgr.getGuideCompleteTimeById(staftSoftGuide.id) <= 0) {
                this.goldSoftGuideId = staftSoftGuide.id;
                this.showGoldGuide(staftSoftGuide);
                return false;
            }
        }
    }

    showGoldGuide(softGuide: ISoftGuideJson) {
        if (this.goldSoftGuide) {
            this.goldSoftGuide.active = true;
        } else {
            this.goldSoftGuide = new cc.Node;
            let node = this.goldFreeImage.node.parent.parent;
            this.goldSoftGuide.parent = node;
            this.goldSoftGuide.setContentSize(node.getContentSize());
            GuideMgr.showSoftGuide(this.goldSoftGuide, ARROW_DIRECTION.BOTTOM, softGuide.displayText, (node: cc.Node) => {
                // this.goldSoftGuide = node;
            }, false, 0, false, () => {
                // this.onGoldBtnClick();
            });
        }
    }

    goldExchangeBtn = () => {
        if (!JsonMgr.isFunctionOpen(FunctionName.GoldExchange)) {
            let openJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(FunctionName.GoldExchange);
            if (openJson.openType == 1) {
                UIMgr.showTipText("金币兑换将于等级" + openJson.value + "级后开启");
                return;
            } else if (openJson.openType == 2) {
                let positionJson: IPositionJson = JsonMgr.getPositionJson(openJson.value);
                UIMgr.showTipText("金币兑换将于职位达到【" + positionJson.name + positionJson.level + "阶】后开启");
                return;
            }
        }
        HttpInst.postData(NetConfig.GET_EXCHANGE_GOLD, [], (response: IRespData) => {
            UIMgr.showView(GoldExchange_wx.url, cc.director.getScene(), response);
        });
    };

    //钻石充值
    diamondExchangeBtn = () => {
        // UIMgr.showView(RechargeMain.url, null, null, null, true);
        ClientEvents.EVENT_POPUP_DIAMOND_EXCHANGE.emit();
    };


    refresh = (recruited: boolean) => {
        if (recruited && this.mayGuideBack) this.guideBack = true;
        const recruitData: RecruitData = DataMgr.recruitData;
        this.refreshLabels(recruitData);
        this.refreshOpenGoldRecruit();
        this.refreshMustGet();
    };

    refreshAllLabels = () => {
        const recruitData: RecruitData = DataMgr.recruitData;
        this.refreshLabels(recruitData);
    };

    private refreshLeftTime() {
        const recruitData: RecruitData = DataMgr.recruitData;
        this.doRefreshLeftTime(recruitData.getRecruit());
    }

    private doRefreshLeftTime(recruit: Recruit) {
        this.leftTime.init(recruit.remainTime, TimeOutType.GoldRecruit);
        if (this.leftTime.hasTime()) {
            this.leftTime.show();
            UIUtil.asyncSetImage(this.goldTextImage, ResManager.platformPath("images/staff/recruit/recruit/recruit_enter"));
        } else {
            this.leftTime.hide();
            UIUtil.asyncSetImage(this.goldTextImage, ResManager.platformPath("images/staff/recruit/recruit/recruit_kaiqizhaopin"));
        }
    }

    private refreshLabels(recruitData: RecruitData) {
        const recruit: Recruit = recruitData.getRecruit();

        const config: GoldFairCostConfig = JsonMgr.getGoldFairCostConfig(recruit.getConfigCount());
        const nextConfig: GoldFairCostConfig = JsonMgr.getGoldFairCostConfig(recruit.getNextConfigCount());
        UIUtil.setLabel(this.densityLabel, config.talentDensity);
        UIUtil.setLabel(this.goldLabel, CommonUtil.numChange(nextConfig.goldCost));

        const canShowRed: boolean = GuideMgr.canShowRed();
        const hasGoldFreeCount: boolean = recruit.hasGoldFreeCount();
        UIUtil.visible(this.goldFreeImage, hasGoldFreeCount);
        const hasLeftTime: boolean = this.leftTime.hasTime();
        this.goldLabel.node.parent.active = !hasGoldFreeCount && !hasLeftTime;
        this.goldBtnRed.node.active = canShowRed && recruit.hasRedPoint();

        const hasDiamondFreeCount: boolean = recruitData.hasDiamondFreeCount();
        UIUtil.visible(this.diamondFreeImage, hasDiamondFreeCount);
        const diamondOneItemNum: number = DataMgr.getItemNum(ItemIdConst.STAFF_PAPER_ONE);
        UIUtil.setLabel(this.diamondOneItemLabel, diamondOneItemNum + "/1");
        const hasDiamondOneItem: boolean = diamondOneItemNum > 0;

        this.diamondOneItemLabel.node.parent.active = !hasDiamondFreeCount && hasDiamondOneItem;
        this.diamondOneLabel.node.parent.active = !hasDiamondFreeCount && !hasDiamondOneItem;
        this.oneBtnRed.node.active = canShowRed && (hasDiamondFreeCount || hasDiamondOneItem); //招募券道具不显示红点了

        const diamondFiveItemNum: number = DataMgr.getItemNum(ItemIdConst.STAFF_PAPER_FIVE);
        UIUtil.setLabel(this.diamondFiveItemLabel, diamondFiveItemNum + "/1");
        const hasDiamondFiveItem: boolean = diamondFiveItemNum > 0;
        this.diamondFiveItemLabel.node.parent.active = hasDiamondFiveItem;
        this.diamondFiveLabel.node.parent.active = !hasDiamondFiveItem;
        this.fiveBtnRed.node.active = canShowRed && hasDiamondFiveItem; //招募券道具不显示红点了
    }

    private refreshOpenGoldRecruit() {
        const isLockOpen: boolean = JsonMgr.isFunctionOpen(FunctionName.goldDraw);
        UIUtil.visible(this.resetLabel, isLockOpen);
        UIUtil.visible(this.goldLockBg, !isLockOpen);
        if (this.goldLockBg.node.active) {
            const node: cc.Node = this.goldLockBg.node.getChildByName("lockLvLabel");
            if (node) {
                let openJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(FunctionName.goldDraw)
                if (openJson.openType == 1) {
                    UIUtil.setLabel(node.getComponent(cc.Label), "lv." + openJson.value);
                } else if (openJson.openType == 2) {
                    let positionName: string = JsonMgr.getPositionJson(openJson.value).name;
                    UIUtil.setLabel(node.getComponent(cc.Label), positionName);
                }

            }
        }
    }

    private onRateBtnClick = () => {
        DotInst.clientSendDot(COUNTERTYPE.recruit, "8002");
        UIMgr.showView(this.rateViewType == 1 ? MustRatePanel.url : StaffRatePanel.url);
    };

    onExchangeBtnClick = () => {
        DotInst.clientSendDot(COUNTERTYPE.recruit, "8005");
        UIMgr.showView(ExchangePanel.url);
    };

    private onGoldBtnClick = () => {
        let hasGuide = false;
        if (this.goldSoftGuide) {
            hasGuide = true;
            this.goldSoftGuide.active = false;
            if (this.mainClickTask == JumpConst.GOLD_RECRUIT) {
                this.mayGuideBack = true;
            }
        }
        if (this.goldSoftGuideId > 0) {
            HttpInst.postData(NetConfig.SOFT_LED_INFO, [this.goldSoftGuideId], (response) => {
            });
        }
        if (this.leftTime.hasTime()) {
            HttpInst.postData(NetConfig.getRecruitInfo,
                [], (response) => {
                    if (!this.leftTime) return;
                    // UIMgr.closeView(TypePanel.url, true, false);
                    UIUtil.hide(this);

                    let recruit: Recruit = DataMgr.getRecruit();
                    recruit.updateRemainTime(this.leftTime.getMillis());
                    UIMgr.showView(GoldRectuitPanel.url, cc.director.getScene(), {
                        hasGuide,
                        openRecruit: false,
                        clickTask: this.mainClickTask
                    }, null, false);
                });
        } else {
            const nextConfig: GoldFairCostConfig = JsonMgr.getGoldFairCostConfig(DataMgr.recruitData.getRecruit().getNextConfigCount());
            const hasGoldFreeCount: boolean = DataMgr.recruitData.getRecruit().hasGoldFreeCount();
            if (DataMgr.userData.gold >= nextConfig.goldCost || hasGoldFreeCount) {
                HttpInst.postData(NetConfig.openRecruit,
                    [], (response) => {
                        // this.onBackBtnClick();
                        UIUtil.hide(this);
                        UIMgr.showView(GoldRectuitPanel.url, cc.director.getScene(), {
                            hasGuide,
                            openRecruit: true,
                            clickTask: this.mainClickTask
                        }, null, false);
                    });
            } else {
                UIMgr.showView(CommonInsufficient.url, cc.director.getScene(), InsufficientType.Gold);
            }
        }
    };

    private hideResumePanel = () => {
        this.leftTime.reset();
        const recruit: Recruit = DataMgr.getRecruit();
        recruit.updateRemainTime(this.leftTime.getMillis());
        // this.show();
        // this.refresh();
    };

    private onDiamondBtnClick(event, count) {
        let hasGuide: boolean = this.diamondSoftGuide && this.diamondSoftGuide.active;
        if (this.diamondSoftGuide && this.diamondSoftGuide.active) {
            this.diamondSoftGuide.active = false;
            if (this.mainClickTask == JumpConst.DIAMOND_RECRUIT) {
                this.guideBack = true;
            }
        }
        if (count == 1) {
            const hasDiamondFreeCount: boolean = DataMgr.recruitData.hasDiamondFreeCount();
            const diamondOneItemNum: number = DataMgr.getItemNum(ItemIdConst.STAFF_PAPER_ONE);
            const hasDiamondOneItem: boolean = diamondOneItemNum > 0;
            if (hasDiamondFreeCount || hasDiamondOneItem) {
                this.diamondRecruitHandler(count, hasGuide);
            } else {
                if (DataMgr.userData.diamond >= JsonMgr.getConstVal("diamondSingleCost")) {
                    this.diamondRecruitHandler(count, hasGuide);
                } else {
                    UIMgr.showView(CommonInsufficient.url, cc.director.getScene(), InsufficientType.Diamond);
                }
            }
        } else if (count == 5) {
            const diamondFiveItemNum: number = DataMgr.getItemNum(ItemIdConst.STAFF_PAPER_FIVE);
            const hasDiamondFiveItem: boolean = diamondFiveItemNum > 0;
            if (hasDiamondFiveItem) {
                this.diamondRecruitHandler(count, hasGuide);
            } else {
                if (DataMgr.userData.diamond >= JsonMgr.getConstVal("diamondFiveCost")) {
                    this.diamondRecruitHandler(count, hasGuide);
                } else {
                    UIMgr.showView(CommonInsufficient.url, cc.director.getScene(), InsufficientType.Diamond);
                }
            }
        }
    };

    diamondRecruitHandler(count, hasGuide) {
        HttpInst.postData(NetConfig.diamondRecruit,
            [count, false, false, false], (response) => {
                if (response.talentMarket && this.showStaffResumePrefab) {
                    const recruitResults = DataMgr.recruitData.getDiamondRecruitResults();
                    const showStaffResume = cc.instantiate(this.showStaffResumePrefab).getComponent(DiamondRecruitAni);
                    showStaffResume.initAndPlay(recruitResults, () => {
                        this.refreshAllLabels();
                        UIMgr.showView(DiamondPanel.url, null, null, (node: cc.Node) => {
                            node.getComponent(DiamondPanel).showRecruitResultList(recruitResults, ShowType.RecruitStaff, hasGuide);
                        });
                    });
                }
            });
    }

    private onBackBtnClick = () => {
        AudioMgr.playMusic("Audio/ydgqq", true);
        DotInst.clientSendDot(COUNTERTYPE.recruit, "8012");
        DataMgr.setClickMainTask(0);
        UIMgr.closeBackMapCenter();
        if (CacheMap.getDecorateState()) {
            MiniData.refreshData();
            UIMgr.closeView(TypePanel.url, true, false);
        } else {
            UIMgr.closeView(TypePanel.url, true, true);
        }
    };


    onDisable(): void {
        if (DataMgr.UiTop) {
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
        } else {
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
        }
    }

    tipHandler() {
        DotInst.clientSendDot(COUNTERTYPE.recruit, "8001");
        UIMgr.showTextTip(TextTipConst.RecruitmentTip);
    }

    tipHandler1() {
        UIMgr.showTextTip(TextTipConst.TalentDensityRule);
    }

    private movieCount: number = 0;

    initWatchView() {
        if (GameManager.isHaveAdUnitId()) {
            HttpInst.postData(NetConfig.ADVER_INFO,
                [2], (response: any) => {
                    this.movieCount = response.adCount;
                    this.refuseWatchView(response.adCount);
                });
        } else {
            this.watchBtn.active = false;
        }
    }

    watchMovieHandler() {
        let movieJson: IAdvertisementJson = JsonMgr.getMovieInfo(2);
        if ((movieJson.count - this.movieCount) > 0) {
            if (DataMgr.isCanWatchAdvert()) {
                WxVideoAd.showVideo(() => {
                    HttpInst.postData(NetConfig.SEE_ADVERT,
                        [2, 0], (response: any) => {
                            this.movieCount = response.adCount;
                            this.refuseWatchView(response.adCount);
                            this.refreshAllLabels();
                        });
                }, () => {
                    UIMgr.showTipText("请观看完整广告！");
                })
            } else {
                GameManager.WxServices.shareGame("来和我一起成为店长拥有自己的小店吧~", `https://cdn.nuojuekeji.com/uploadImages/share/xuanchuan2.png`, "", () => {
                    HttpInst.postData(NetConfig.SEE_ADVERT,
                        [2, 1], (response: any) => {
                            this.movieCount = response.adCount;
                            this.refuseWatchView(response.adCount);
                            this.refreshAllLabels();
                        });
                });
            }
        } else {
            UIMgr.showTipText("今日领取次数到达上限！");
        }
    }

    refuseWatchView(adCount: number) {
        if (!this.watchBtn) return;
        let movieJson: IAdvertisementJson = JsonMgr.getMovieInfo(2);
        if (DataMgr.isCanWatchAdvert()) {
            this.watchBtn.getChildByName("numLabel").getComponent(cc.Label).string = "剩余观看次数:" + (movieJson.count - adCount) + "/2";
        } else {
            this.watchBtn.getChildByName("numLabel").getComponent(cc.Label).string = "剩余分享次数:" + (movieJson.count - adCount) + "/2";
        }
        this.watchBtn.getChildByName("videoBtn").active = DataMgr.isCanWatchAdvert();
        this.watchBtn.getChildByName("shareBtn").active = !DataMgr.isCanWatchAdvert();
    }

}
