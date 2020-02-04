import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../global/manager/JsonManager";
import {DataMgr} from "../../Model/DataManager";
import {UIUtil} from "../../Utils/UIUtil";
import {ButtonMgr} from "../common/ButtonClick";
import {GameComponent} from "../../core/component/GameComponent";
import {DotInst, COUNTERTYPE} from "../common/dotClient";
import {CommonUtil} from "../../Utils/CommonUtil";
import {RedConst} from "../../global/const/RedConst";
import {GuideMgr} from "../common/SoftGuide";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ActivaMainPage extends GameComponent {
    static url: string = "active/ActiveMainPage";
    @property(cc.Sprite)
    pageSprite: cc.Sprite = null;

    @property(cc.Label)
    sellLab: cc.Label = null;

    @property(cc.Label)
    titleLab: cc.Label = null;

    @property(cc.Node)
    redPoint: cc.Node = null;

    private jumpId: number;
    private bannerId: number = 0;
    private activeId: number = 0;
    private rechargeId: number = 0;

    onLoad() {
        this.addEvent(ClientEvents.SELLTASK_REFRESHBANNER.on(this.bannerChange));
        this.addEvent(ClientEvents.UPDATE_MAINUI_RED.on(this.upRed));
    }

    getBaseUrl() {
        return ActivaMainPage.url;
    }

    initView(nIndx: number) {
        this.bannerId = DataMgr.getBannerData()[nIndx];
        let bannerVo: IBannerJson = JsonMgr.getBannerDataVO(this.bannerId);
        this.jumpId = bannerVo.jump;
        this.rechargeId = bannerVo.activityId;
        let strUrl: string = bannerVo.bannerUrl;
        if (strUrl) {
            UIUtil.loadUrlImg(strUrl, this.pageSprite)
        }
        this.activeId = bannerVo.id;
        if (bannerVo.id == 600002) {
            this.bannerChange();
        } else {
            this.titleLab.node.active = false;
            this.sellLab.node.active = false;
        }
        this.upRed(DataMgr.redData);
    }

    upRed = (redDatas: number[]) => {
        this.redPoint.active = (GuideMgr.canShowRed() && this.bannerId == 600001
            && redDatas.indexOf(RedConst.ANNOUNCENENTRED) != -1) || (this.bannerId == 604001 && DataMgr.getInviteRed())
            || (GuideMgr.canShowRed() && this.bannerId == 600004
                && redDatas.indexOf(RedConst.VIP) != -1)
            || (GuideMgr.canShowRed() && this.bannerId == 601001
                && redDatas.indexOf(RedConst.RECHARGE_PACKAGE) != -1);
    };

    bannerChange = () => {
        let isEnough = false;
        if (this.activeId == 600002) {
            let text: string = null;
            let sellData = DataMgr.selltaskData.getSellData();
            let times = DataMgr.selltaskData.getSellTimes();
            if (sellData.hasDrawCnt >= times) {
                this.titleLab.node.active = false;
                text = "今日目标已全部完成"
            } else {
                if (sellData.hasDrawCnt < sellData.completeCnt) {
                    text = "目标完成，可领取";
                    this.titleLab.node.active = false;
                    let newLv = JsonMgr.getConstVal("guideArrow");
                    let userLv = DataMgr.getUserLv();
                    if (userLv >= newLv) {
                        isEnough = true;
                    }
                    this.redPoint.active = true;
                } else {
                    this.titleLab.node.active = true;

                    let currNum = CommonUtil.calculate(sellData.currGold);
                    let goalNum = CommonUtil.calculate(sellData.goal);
                    text = currNum + "/" + goalNum;
                }
            }
            this.sellLab.string = text;
            this.redPoint.active = isEnough;
        }
    };

    start() {
        ButtonMgr.addClick(this.node, this.openView, null, this.startHandler)
    }

    startHandler = () => {
        cc.log("--------page");
        ClientEvents.ACTIVE_BANNER.emit();
    };

    openView = () => {
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2007", this.bannerId + "");
        ClientEvents.EVENT_OPEN_UI.emit(this.jumpId, this.rechargeId);
    }

    // update (dt) {}
}
