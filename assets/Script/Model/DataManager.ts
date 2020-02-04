import {HttpInst} from "../core/http/HttpClient";
import {ArrowType} from "../CustomizedComponent/common/Arrow";
import {GuideDataManager} from "../CustomizedComponent/common/GuideDataManager";
import AllPolling from "../CustomizedComponent/saleGoods/SalePolling";
import {JumpConst} from "../global/const/JumpConst";
import {RedConst} from "../global/const/RedConst";
import {ServerConst} from "../global/const/ServerConst";
import {SpeedId} from "../global/const/StringConst";
import {ClientEvents} from "../global/manager/ClientEventCenter";
import {Base, FunctionName, JsonMgr} from "../global/manager/JsonManager";
import {UIMgr} from "../global/manager/UIManager";
import {
    IActivitiesInfo,
    IActivityItemInfo,
    IActivityStoreInfo,
    IADInfo,
    ICommonRewardInfo,
    IFriendsInfo,
    IGoal,
    IInspireInfo,
    IRechargeGiftInfo,
    IRespData, IShopBuyInfo, IShopDataInfo,
    IShowStaffRates,
    IStarAllRate,
    IStarLength
} from "../types/Response";
import {CommonUtil} from "../Utils/CommonUtil";
import {StringUtil} from "../Utils/StringUtil";
import {TimeUtil} from "../Utils/TimeUtil";
import {UIUtil} from "../Utils/UIUtil";
import ActivityModel from "./activity/ActivityModel";
import {ActivityData} from "./ActivityData";
import {BuffData} from "./BuffData";
import {ExchangeData} from "./ExchangeData";
import {FightData} from "./FightData";
import {FightViewData} from "./FightViewData";
import {Focus, FosterCareData, QueryFriend, Recommended} from "./FriendsData";
import {IncidentData} from "./IncidentData";
import JsonData from "./JsonDatas";
import {LongOrderInfoData} from "./LongOrderInfoData";
import {MailboxData} from "./MailboxData";
import {IMarketModel} from "./market/MarketDataMoudle";
import RechargeModel from "./recharge/RechargeModel";
import {FriendRecruit, Recruit, RecruitData} from "./RecruitData";
import {SellTaskData} from "./SellTaskData";
import {SettingData} from "./SettingData";
import {SignInData} from "./SignInData";
import {Staff, StaffData} from "./StaffData";
import {TaskData} from "./taskData";
import {TourBusData} from "./TourBusData";
import {FriendUserData, UserData} from "./UserData";
import {WarehouseData} from "./WarehouseData";
import announceData from "../CustomizedComponent/announcement/announcementData";
import {GameManager} from "../global/manager/GameManager";
import {ActiveShopData} from "./ActiveShopData";
import OrderData from "./OrderData";
import {StaffGiftData} from "./StaffGiftData";
import {GuideType, judgeSoftGuideStart} from "../global/const/GuideConst";

export enum SHARE_TYPE {
    recruit = 1,    //召唤
    rank = 2,    //排行榜
    event = 3,    //事件
    wxFriends = 4, //微信好友
    invitation = 13, //邀请
    wxExpand = 14 //扩建分享
}

export enum GET_ANI_TYPE {
    SHOW_ANI_AND_TIPS = 0,
    SHOW_TIPS_ONLY = 1
}

export enum GIFT_TYPE {
    lITTLE_STAR = 1,
    MORE_STAR = 2,
    LOT_STAR = 3,
}

export enum COM_GIFT_TYPE { //通用奖励面板恭喜获得类型 1->恭喜获得 2->危机 3->事件 4->帮助成功
    normal = 1,
    crisis = 2,
    event = 3,
    help = 4,
    order = 5
}

export enum IPhoneState {
    LOW,
    HIGH
}

export class DataManager {
    get advertSumCount(): number {
        return this._advertSumCount;
    }

    set advertSumCount(value: number) {
        this._advertSumCount = value;
    }

    get isNeedAuthorize(): boolean {
        return this._isNeedAuthorize;
    }

    set isNeedAuthorize(value: boolean) {
        this._isNeedAuthorize = value;
    }

    get launchOption(): LaunchOption {
        return this._launchOption;
    }

    set launchOption(value: LaunchOption) {
        this._launchOption = value;
    }

    static version: string = "v0.63.9";

    static statisticsInfo: Object = {
        service: "testService"
    };

    static serverInfo: any = {};

    static instance: DataManager = new DataManager();

    private static finishedInit: boolean = false;  //是否完成url参数初始化

    private finishedLoad: boolean = false;   //是否完成游戏加载
    private finishedLoadOpen: JumpConst = null; //加载完成后打开界面

    pushFlags: Array<boolean> = [];

    private guideData: GuideDataManager = null;

    userData: UserData = new UserData();
    friendData: FriendUserData = null;

    fightData: FightData = null;
    fightViewData: FightViewData = null;

    staffGift: StaffGiftData = null;

    longOrderInfoData: LongOrderInfoData = null;//长途订单

    settingData: SettingData = new SettingData();
    iMarket: IMarketModel = new IMarketModel();
    activityModel: ActivityModel = new ActivityModel();
    rechargeModel: RechargeModel = new RechargeModel();

    warehouseData: WarehouseData = new WarehouseData();
    mailboxData: MailboxData = new MailboxData();
    signInData: SignInData = new SignInData();

    incidentData: IncidentData = new IncidentData();
    activityData: ActivityData = new ActivityData();
    tourBusData: TourBusData = new TourBusData();

    recruitData: RecruitData = null;
    staffData: StaffData = new StaffData();
    friendStaffData: StaffData = null;

    selltaskData: SellTaskData = new SellTaskData();

    activeShopData: ActiveShopData = new ActiveShopData();

    exchangeData: ExchangeData = null;

    redData: number[] = [];
    inviteRedBel: boolean = false;

    announcementData: announceData = new announceData();
    orderData: OrderData = new OrderData();
    focusData: Focus = null;
    // friendsData: Focus = null;
    // hasNewFans: boolean = false;

    allPolling = new AllPolling();

    queryFriend: QueryFriend = null;
    recommended: Recommended = null;
    fosterCare: FosterCareData = new FosterCareData();
    taskData: TaskData = new TaskData();

    private showRedLevel: number = 0;

    private inFriendHome: boolean = false; //是否在好友家
    private marketId: number = 1; //当前所在店铺id，默认是第1个店铺
    private friendMarketId: number = 1; //好友家的marketId

    jsonDatas: JsonData = new JsonData();
    baseSpeed: number = 0;

    stockRewards: any[] = [];
    stockDetails: any[] = [];

    tipsNum: number = 1;
    tipIndex: number = 1;
    assistanceRewards: number[] = null;

    private popUp: boolean = null;
    private notices = null;
    businessOneHour: number = 0;

    private serverTime: number = 0;
    private serverTimeInterval;

    communityItemIndex: number = 0;
    private choseOpenGoodsType: number = -1;    //-1--> 进货  -2--> 任务 订单 >10-->货架换货  10< >0-->空货架
    private openStaffView: number = 0;   //打开stafflist的位置 0->员工 1->岗位

    seePeople: boolean = true;

    speciality: boolean = false;
    mainTopUiType: number = -1;
    hideMainTopUi: boolean = true;
    UiTop: boolean = false;
    topUiNum: number = 0;
    friendshipUiTop = false;
    needOpenAnnounce: boolean = false; //主UI判断是否需要打开公告
    newUser: boolean = false;    //是否是新用户

    saveUrlData = new Set<string>(); //加载远程url图片集合，需要及时清理
    givenMove = false;
    moveCentre = false;
    isIncentive = false; // 是否激励中
    incentiveNum = 0; //当前激励次数

    private bannerArr: number[] = [];   //活动banner数组

    private branchNumber: number = 1;    //分店数量

    private isPlayAnimation: boolean = true;    //是否播放恭喜获得

    private getAniType: number = 0;     //0->播放获得   1->跳过获得，直接播放tips

    private responseData = null;            //恭喜获得所用response

    private totalRechargeNum: IRechargeGiftInfo = null;      //累计领取

    private MainActivities: IActivitiesInfo[] = [];

    private ClickMainTaskId: number = 0;
    private ClickTaskJumpId: number = 0;

    private giftType: GIFT_TYPE = GIFT_TYPE.lITTLE_STAR;

    private buffData: BuffData = new BuffData();

    private result: boolean = false;

    private commGiftType: number = COM_GIFT_TYPE.normal;

    private sellData: IGoal = null;
    private activeData: Map<number, IActivityItemInfo> = new Map();
    private guideRed: boolean = false;

    private remeberHeard: string = "";
    private remeberMouth: number = 0;    //心跳月
    private remeberData: number = 0;     //心跳日
    private openBoxNum: number = 0;
    private nowBoxIndex: number = 0;
    private nowBoxAward = [];
    private guideCount: number = -1;

    private showStaffRates: IShowStaffRates = null;     //招聘概率
    private starLength: IStarLength = null;
    private starRate: IStarAllRate = null;

    private bubbleCnt: number;

    private _launchOption: LaunchOption = null;//微信启动数据 可以拿到分享数据
    private _isNeedAuthorize: boolean = true;//false需要授权 true不需要

    private isPowerGuide: boolean = false;
    private phoneState: IPhoneState = IPhoneState.HIGH;
    private cancelLowCount: number = 0;

    private staffMustBaseData: Base[] = [];
    private furnitureMustBaseData: Base[] = [];
    private buyInfo: IShopDataInfo[] = null;
    private shopItemDataMap: Map<number, any> = new Map<number, any>();

    private selIdxArr = [];
    private selMaxNum: number = 0;
    private _advertSumCount: number = 0;//广告总次数
    private adInfo: IADInfo[] = [];
    private isJudgeSoft: boolean = true;

    inspireInfo: IInspireInfo = {
        inspireNum: 0,
        recoveryTime: 0,
    };

    private constructor() {

    }

    isCanWatchAdvert(): boolean {//是否能看广告
        return this.advertSumCount < 10;//写死的10
    }

    getAdInfoById(id: number) {
        for (let i of this.adInfo) {
            if (i.xmlId === id) {
                return i;
            }
        }
        return null;
    }

    setAdInfoById(id: number, num: number) {
        for (let i of this.adInfo) {
            if (i.xmlId === id) {
                i.number = num;
            }
        }
    }

    setIncentiveTime = () => {
        this.inspireInfo.recoveryTime -= 1000;
    };

    setIncentive = (response: IRespData) => {
        if (!response.inspireInfo) return;
        this.inspireInfo = response.inspireInfo;
        ClientEvents.UP_INCENTIVE_NUM.emit();
    };

    nullSelIdxArr() {
        this.selIdxArr = [];
    }

    setSelIdxArr(idx: number) {
        for (let i in this.selIdxArr) {
            if (this.selIdxArr[i] == idx) {
                this.selIdxArr.splice(Number(i), 1);
                return;
            }
        }
        this.selIdxArr.push(idx);
    }

    getSelIdxArr() {
        return this.selIdxArr;
    }

    setSelMaxNum(num) {
        this.selMaxNum = num;
    }

    getSelMaxNum() {
        return this.selMaxNum;
    }

    nullshopItemDataMap() {
        this.shopItemDataMap.clear();
    }

    setshopItemDataMap(id: number, data: any) {
        this.shopItemDataMap.set(id, data);
    }

    getshopItemDataMap(id: number) {
        return this.shopItemDataMap.get(id);
    }

    getFurnitureMustBaseData(): Base[] {
        return this.furnitureMustBaseData;
    }

    setFurnitureMustBaseData(furnitureBase) {
        this.furnitureMustBaseData = furnitureBase;
    }

    getStaffMustBaseData(): Base[] {
        return this.staffMustBaseData;
    }

    setStaffMustBaseDate(staffBase) {
        this.staffMustBaseData = staffBase;
    }

    initPhoneState(isLow: boolean) {
        this.changePhoneState(isLow ? IPhoneState.LOW : IPhoneState.HIGH);
    }

    /** 是否低清，在好友家也算低清模式 */
    isLowPhone() {
        return this.phoneState == IPhoneState.LOW || this.inFriendHome;
    }

    getPhoneState(): IPhoneState {
        return this.phoneState;
    }

    //互换高清低清模式
    switchPhoneState(): IPhoneState {
        let isLow: boolean = this.isLowPhone();
        let state = isLow ? IPhoneState.HIGH : IPhoneState.LOW;
        this.changePhoneState(state);
        return state;
    }

    private changePhoneState(state: IPhoneState) {
        this.phoneState = state;
    }

    incrCancelLowCount() {
        this.cancelLowCount++;
    }

    getCancelLowCount() {
        return this.cancelLowCount;
    }

    changeIsPowerGuide() {
        this.isPowerGuide = !this.isPowerGuide;
    }

    getIsPowerGuide() {
        return this.isPowerGuide;
    }

    getStarRate(): IStarAllRate {
        return this.starRate;
    }

    setStarRate(newStarRate: IStarAllRate) {
        this.starRate = newStarRate;
    }


    getStarLength(): IStarLength {
        return this.starLength;
    }

    setStarLength(newStarLength: IStarLength) {
        this.starLength = newStarLength;
    }

    getShowStaffRates(): IShowStaffRates {
        return this.showStaffRates;
    }

    setShowStaffRates(newShowStaffRates: IShowStaffRates) {
        this.showStaffRates = newShowStaffRates;
    }

    increaseTopUiNum() {
        this.topUiNum = this.topUiNum + 1;
    }

    decrTopUiNum() {
        this.topUiNum = this.topUiNum - 1;
        if (this.topUiNum < 0) {
            this.topUiNum = 0;
        }
    }

    getTopUiNum() {
        return this.topUiNum;
    }

    setMainTopUiType(num: number) {
        this.mainTopUiType = num;
    }

    getMainTopUitype(): number {
        return this.mainTopUiType;
    }


    setHideMainTopUi(isHide: boolean) {
        this.hideMainTopUi = isHide;
    }

    getHideMainTopUi(): boolean {
        return this.hideMainTopUi;
    }

    setOpenBoxNum(num: number) {
        this.openBoxNum = num;
    }

    getOpenBoxNum() {
        return this.openBoxNum;
    }

    setNowBoxIndex(index: number) {
        this.nowBoxIndex = index;
    }

    getNowBoxIndex() {
        return this.nowBoxIndex;
    }

    setOpenBoxAward(awardArrs) {
        let arr = [];
        let idArr = [];
        let dropArr = [];
        this.nowBoxAward = [];
        for (let awardArr of awardArrs) {
            for (let item of awardArr) {
                let itemdata: ICommonRewardInfo = {
                    num: item.num,
                    xmlId: item.xmlId
                };
                arr.push(itemdata);
                if (idArr.indexOf(itemdata.xmlId) < 0) {
                    idArr.push(itemdata.xmlId);
                }
            }
        }
        for (let id of idArr) {
            let itemdata: ICommonRewardInfo = {
                num: 0,
                xmlId: id
            };
            for (let item of arr) {
                if (id == item.xmlId) {
                    itemdata.num++;
                }
            }
            dropArr.push(itemdata);
        }
        for (let item of dropArr) {
            let type = JsonMgr.getDecoShopJson(item.xmlId).mainType;
            let num = type == 4 ? item.num * 30 : item.num;    //地板一次掉30
            let itemdata: ICommonRewardInfo = {
                num: num,
                xmlId: item.xmlId
            };
            this.nowBoxAward.push(itemdata);
        }
    }

    getOpenBoxAward() {
        return this.nowBoxAward;
    }

    setGuideRedShow(ble: boolean) {
        this.guideRed = ble;
    };

    getetGuideRedShow() {
        return this.guideRed;
    };

    //设置心跳时间
    setRememberHeard() {
        let t = new Date();
        this.remeberMouth = t.getMonth();
        this.remeberData = t.getDate();
        let hour = t.getHours() < 10 ? "0" + t.getHours() : t.getHours();
        let minutes = t.getMinutes() < 10 ? "0" + t.getMinutes() : t.getMinutes();
        let seconds = t.getSeconds() < 10 ? "0" + t.getSeconds() : t.getSeconds();
        this.remeberHeard = hour + ":" + minutes + ":" + seconds;
    }

    getRememberHeard() {
        let t = new Date();
        let mouth = t.getMonth();
        let data = t.getDate();
        if (mouth != this.remeberMouth || data != this.remeberData) {
            this.setRememberHeard();
        }
        return this.remeberHeard;
    }

    setCommGiftType(Type: COM_GIFT_TYPE) {
        this.commGiftType = Type;
    }

    getCommGiftType() {
        return this.commGiftType;
    }

    setGiftType(id: number) {
        cc.log("使用的道具id======" + id);
        switch (id) {
            case 100901:
            case 100902:
                this.giftType = GIFT_TYPE.lITTLE_STAR;
                break;
            case 100903:
            case 100904:
                this.giftType = GIFT_TYPE.MORE_STAR;
                break;
            case 100905:
                this.giftType = GIFT_TYPE.LOT_STAR;
                break;
        }
    }

    setBuffData(ids: number[]) {
        this.buffData.setBuffIds(ids);
    }

    getBuffData() {
        return this.buffData;
    }

    setBubbleCnt(cnt: number) {
        this.bubbleCnt = cnt;
    }

    getBubbleCnt() {
        return this.bubbleCnt;
    }

    getGiftType() {
        cc.log("礼物类型+++++" + this.giftType);
        return this.giftType;
    }

    setClickMainTask(clickId: number) {
        this.ClickMainTaskId = clickId;
    }

    getClickMainTask() {
        return this.ClickMainTaskId
    }

    setClickTaskJumpMap(clickId: number) {
        this.ClickTaskJumpId = clickId;
    }

    getClickTaskJumpMap() {
        return this.ClickTaskJumpId
    }

    setMainActivities(activitys: IActivitiesInfo[]) {
        this.MainActivities = activitys;
    }

    getMainActivities(): IActivitiesInfo[] {
        return this.MainActivities;
    }

    setTotalRechargeNum(totalRecharge: IRechargeGiftInfo) {
        this.totalRechargeNum = totalRecharge
    }

    getTotalRechargeNum() {
        return this.totalRechargeNum
    }


    setGetAniType(type: GET_ANI_TYPE) {
        this.getAniType = type;
    }

    getGetAniType() {
        return this.getAniType;
    }

    setTipsNum(num: number) {
        this.tipsNum = num;
    }

    getTipsNum() {
        return this.tipsNum;
    }

    setTipIndex(num: number) {
        this.tipIndex = num;
    }

    getTipIndex() {
        return this.tipIndex;
    }

    setResponseData(response) {
        this.responseData = response;
    }

    getResponseData() {
        return this.responseData;
    }

    setPlayAnimation(isPlay: boolean) {
        this.isPlayAnimation = isPlay;
    }

    getPlayAnimation() {
        let result = this.isPlayAnimation;
        if (!DataMgr.isIncentive) {
            this.isPlayAnimation = true;
        }
        return result;
    }

    setBranchNumber(branch: number) {
        this.branchNumber = branch;
    }

    getBranchNumber() {
        return this.branchNumber
    }

    setBannerData(dataArr: number[]) {
        let type = 2;
        if (GameManager.isIos()) {
            type = 1;
        }
        this.bannerArr = JsonMgr.getPermanentBanner(type);
        let timeBanner = JsonMgr.getTimeBanner(type);
        for (let index = 0; index < timeBanner.length; index++) {
            let bannerId: number = timeBanner[index];
            let bannerJson: IBannerJson = JsonMgr.getBannerDataVO(bannerId);
            if (bannerJson.show == 2 && TimeUtil.judgeIsTime(bannerJson.beginTime, bannerJson.endTime)) {
                this.bannerArr.push(timeBanner[index]);
            }
        }
        for (let nid = 0; nid < dataArr.length; nid++) {
            let bannerJson: IBannerJson = JsonMgr.getBannerDataVO(dataArr[nid]);
            if (bannerJson.platform == type || bannerJson.platform == 3) {
                this.bannerArr.push(dataArr[nid]);
            }
        }
    }

    getBannerData() {
        return this.bannerArr;
    }

    addUrlData(url) {
        if (this.saveUrlData.size > 40) {
            UIUtil.deleteLoadUrlImg(this.getUrlDataArr());
            this.clearUrlData();
            return;
        }
        this.saveUrlData.add(url)
    }

    getUrlDataArr() {
        return Array.from(this.saveUrlData.values());
    }

    clearUrlData() {
        this.saveUrlData.clear();
    }

    static initStaticData(cb: Function) {
        if (DataManager.finishedInit) {
            console.log("initStaticData already finished!");
            return;
        }

        //const url = window.location.href;
        //console.log(StringUtil.getUrlParam("test"));

        let token: string = StringUtil.getUrlParam("access_token");
        if (token) {
            ServerConst.access_token = token; //web端
        }
        if (typeof accessToken == "string") {
            console.log("inject native accessToken=" + accessToken);
            ServerConst.access_token = accessToken;
        } else {
            console.log("no accessToken");
        }

        const openid: string = StringUtil.getUrlParam("openid");
        if (openid) {
            ServerConst.openid = openid;
        }
        if (typeof moegoCode == "string") {
            console.log("inject native moegoCode=" + moegoCode);
            ServerConst.openid = moegoCode;
        } else {
            console.log("no moegoCode");
        }

        if (typeof statisticsInfo == "object") {
            console.log("inject native statisticsInfo=", statisticsInfo);
            DataManager.statisticsInfo = statisticsInfo;
        } else {
            console.log("no statisticsInfo");
        }

        const serverInfo = (<any>window).serverInfo;
        if (serverInfo) {
            console.log("inject web serverInfo=", serverInfo);
            DataManager.serverInfo = serverInfo;
        } else {
            console.log("no web serverInfo");
        }

        const serverVer: string = StringUtil.getUrlParam("serverVer");
        if (serverVer) {
            ServerConst.SERVER_VER = serverVer;
        }

        if (DataManager.serverInfo.serverUrl && DataManager.serverInfo.serverUrl != '_serverUrl') {
            ServerConst.SERVER_URL = DataManager.serverInfo.serverUrl;
        }
        if (DataManager.serverInfo.trackon) {
            ServerConst.trackon = DataManager.serverInfo.trackon == "true";
        }
        if (DataManager.serverInfo.gameid) {
            ServerConst.gameid = DataManager.serverInfo.gameid;
        }

        console.log(cc.sys.os, "serverInfo>>>:", DataManager.serverInfo, ">>>access_token:", ServerConst.access_token, DataManager.statisticsInfo);

        cb && cb();
        DataManager.finishedInit = true;
    }

    isFinishedLoad(): boolean {
        return this.finishedLoad;
    }

    setFinishedLoad() {
        // cc.log(123)''
        this.finishedLoad = true;
        if (this.finishedLoadOpen) {
            ClientEvents.EVENT_OPEN_UI.emit(this.finishedLoadOpen);
            this.finishedLoadOpen = null;
        }
    }

    setFinishedLoadOpen(openUI: JumpConst) {
        this.finishedLoadOpen = openUI;
    }

    getFinishedLoadOpen(): JumpConst {
        return this.finishedLoadOpen;
    }

    getCurrencyNum(id: number): number {
        return this.userData.getCurrencyNum(id);
    }

    //强制引导数据块
    fillGuideCount(response: IRespData) {
        if (response.guideCount > -1 && response.guideCount < 5) {
            this.guideCount = response.guideCount;
            cc.warn(">>> guideCount", this.guideCount);
        } else if (response.guideCount) {
            this.guideCount = -1;
        }
    }

    //是否是硬性引导第一步
    isFirstPowerGuide() {
        return this.guideCount == 0;
    }

    checkInPowerGuide() {
        return this.guideCount > -1 && this.guideCount < 5;
    }

    getGuideCount() {
        return this.guideCount;
    }

    completeGuide() {
        this.guideCount = -1;
    }

    /** 处理后端getUserInfo返回的信息进行登陆 */
    login(response: IRespData) {
        // JsonMgr.loadJsonNow(response);
        this.refreshData(response);
        this.initServerData(response);
    }

    //底层的预处理——刷新数据，某些接口的特殊字段可在回调函数callback中处理
    refreshData(response: IRespData) {
        this.fillMarketData(response); //必须放在最前面第1位，里面有处理是否在好友家
        this.fillAdInfo(response);
        this.fillShelves(response);
        this.fillBusinessOneHour(response);
        this.fillGuideCount(response);
        this.fillUserData(response);
        this.fillWarehouseData(response);

        this.fillSettingData(response);
        this.fillMailboxData(response);
        this.fillSignInData(response);

        this.fillStaffData(response);
        this.fillRecruitData(response);
        this.fillFriendRecruitData(response);

        this.updateStaffList(response);
        //this.updateStaff(response);

        this.updatePostsList(response);
        this.updatePosts(response);

        this.fillIncident(response);
        this.updateIncident(response);
        this.fillActivity(response);

        this.fillTourBusData(response);

        this.fillLongOrderData(response);

        this.fillFosterCareData(response);
        this.fillTaskData(response);

        this.fillBannerData(response);
        this.fillBranchNumber(response);
        this.pullGuideData(response);
        this.fillSellTask(response);
        this.fillActivityData(response);

        this.fillStaffGiftData(response);
        this.upFocusSize(response);
        this.setIncentive(response);
        this.updateOrderStatus(response);
        this.updateAdvertSumCount(response);
    }

    fillAdInfo(response: IRespData) {
        if (response.advInfo) {
            this.adInfo = response.advInfo;
        }
    }

    updateOrderStatus(response: IRespData) {
        if (response.orderManager) {
            this.orderData.setOrderList(response.orderManager);
        }
    }

    updateAdvertSumCount(response: IRespData) {
        if (response.advertSumCount) {
            this._advertSumCount = response.advertSumCount;
            if (this._advertSumCount >= 10) {
                ClientEvents.CHANGE_SEE_TO_SHARE.emit();
            }
        }
    }

    fillActivityData(response: IRespData) {
        if (response.assistanceItems) {
            this.activeData.clear();
            response.assistanceItems.forEach((activityItemInfo: IActivityItemInfo) => {
                this.activeData.set(activityItemInfo.xmlId, activityItemInfo);
            });
        }
    }

    getAssistanceItems = (itemId: number): number => {
        let itemData = JsonMgr.getInformationAndItem(itemId);
        if (itemData && itemData.type == 22) {
            return this.getActivityItemNum(itemId);
        }
        return null;
    };

    getActivityItemNum(itemId: number) {
        let activityItemInfo: IActivityItemInfo = this.activeData.get(itemId);
        return activityItemInfo ? activityItemInfo.number : 0;
    }

    fillSellTask(res: IRespData) {
        if (res.SellGoodsGoal) {
            this.sellData = res.SellGoodsGoal;
        }
    }

    GetSellReward = (): boolean => {
        return this.selltaskData.isEnought();
    };

    getSellData = () => {
        return this.sellData;
    };

    fillShelves(res: IRespData) {
        if (res.shelves) {
            this.iMarket.refreshShelves(res.shelves);
        }
    }

    pullGuideData(response: IRespData) {
        if (!this.guideData) {
            this.guideData = new GuideDataManager();
        }
        if (response.softLedMap) {
            this.guideData.pullData(response);
        }
    }

    getGuideCompleteTimeById(id: ArrowType) {
        return this.guideData.getCompleteTimeById(id);
    }

    checkGuideHasCompleteById(id: ArrowType) {
        return this.guideData.checkHasCompleteById(id);
    }

    fillBranchNumber(response) {
        if (response.marketNum) {
            this.setBranchNumber(response.marketNum)
        }
    }

    fillProfits(response: IRespData, url: string, scriptName: string) {
        if (response.profits) {
            let profits = response.profits;
            let isLoad = false;
            for (let i = 0; i < profits.length; i++) {
                let data = profits[i];
                if (data.xmlId !== -1 && data.xmlId !== -2) {
                    isLoad = true;
                    break;
                }
            }
            if (isLoad) {
                UIMgr.showView(url, null, null, (node: cc.Node) => {
                    // node.getComponent(scriptName).init(profits);
                    UIUtil.getComponentByName(node, scriptName).init(profits);
                }, false, 1002);
            }
        }
    }

    fillBannerData(response: IRespData) {
        if (response.activityBannerIds) {
            this.setBannerData(response.activityBannerIds);
        }
    }

    private fillUserData(response: IRespData) {
        if (response.user) {
            this.userData.fill(response.user);
            ClientEvents.EVENT_REFRESH_GOLD.emit();
        }
        if (response.friendInfo) {
            if (!this.friendData) {
                this.friendData = new FriendUserData();
            }
            this.friendData.fill(response.friendInfo);
            this.friendData.hasRecruitBubble = !!((<any>response).hasRecruitBubble);
        }

        if (response.hasOwnProperty("isLowPhone")) {
            this.phoneState = response.isLowPhone ? IPhoneState.LOW : IPhoneState.HIGH;
            // this.phoneState = IPhoneState.LOW;
        }
    }

    private fillWarehouseData(response: IRespData) {
        if (response.warehouse) {
            this.warehouseData.initWarseHouse(response.warehouse);
            //TODO 抛出仓库数据改变事件，如果有UI需要刷新的话
        }
    }

    private fillMailboxData(response: IRespData) {
        if (response.mailBox) {
            this.mailboxData.setMailbox(response.mailBox);
            //TODO 抛出邮箱数据改变事件，如果有UI需要刷新的话
        }
    }

    private initServerData(response: IRespData) {
        ServerConst.openid = response.user.openid;
        this.jsonDatas.initData();
        this.newUser = response.newUser;
        this.popUp = response.popUp;
        this.needOpenAnnounce = response.popUp;
        this.notices = response.notices;

        this.baseSpeed = JsonMgr.getOneKind("const")[SpeedId.index].value;

        if (response.redDots) {
            this.setRedData(response.redDots);
            //TODO 这里为什么不抛出红点事件？难道不是统一有变化就抛出红点事件吗？
        }
        this.pushFlags = response.pushFlags;
        this.recordAuth(response);
        this.showRedLevel = JsonMgr.getConstVal("guideArrow");
        this.exchangeData = new ExchangeData(); //依赖out.json的数据，所以放在后面
    };

    initExchangeData() {
        this.exchangeData = new ExchangeData();
    }

    orderRedResult() {
        let result = true;
        if (this.redData.indexOf(RedConst.ORDERRED) === -1) {
            result = false;
        }
        return result
    }

    orderRedCheck() {
        ClientEvents.SHOW_ORDER_BUBBLE.emit(this.orderRedResult());
    }

    getCanShowRedPoint() {
        return this.userData.level >= this.showRedLevel;
    }

    //手动发动轮训
    setSallPoll() {
        this.allPolling.saleGoods();
    }

    starPolling(gameShow: boolean = false) {
        if (gameShow) {
            console.warn("game show call polling!");
            this.allPolling.saleGoods(); //切后台回来则手动调用1次轮询
        }
        this.allPolling.initInterval();
    }

    stopPolling() {
        this.allPolling.stopInterva();
    }

    setRedData(redData: number[]) {
        this.redData = redData;
    }

    setInviteRed(ble: boolean) {
        this.inviteRedBel = ble;
    }

    getInviteRed(): boolean {
        return this.inviteRedBel;
    }

    getRedData(): number[] {
        return this.redData;
    }

    fillStaffGiftData = (response: any) => {//送宝宝
        if (!this.staffGift) {
            this.staffGift = new StaffGiftData();
        }
        if (response.staffGiftsVO) {
            this.staffGift.fill(response.staffGiftsVO);
            ClientEvents.STAFF_GIFF_UPDATE.emit();
        }
    };

    fillFightData = (response: any) => {//填充战斗数据
        if (!this.fightData) {
            this.fightData = new FightData();
        }
        if (response.battleResult) {
            this.fightData.fill(response.battleResult);
        }
    };

    fillSettingData(response: IRespData) {//填充设置数据
        if (!this.settingData) {
            this.settingData = new SettingData();
        }
        if (response.settings) {
            this.settingData.fill(response.settings);
        }
    }

    fillFightViewData(response: any) {//填充战斗视图数据
        if (!this.fightViewData) {
            this.fightViewData = new FightViewData();
        }
        if (response) {
            this.fightViewData.fill(response);
        }
    };

    private fillLongOrderData(response: IRespData) {//填充长途订单数据
        if (response.longOrder) {
            if (!this.longOrderInfoData) {
                this.longOrderInfoData = new LongOrderInfoData();
            }
            this.longOrderInfoData.init(response.longOrder);
        }
    };

    //自己家marketId
    getMarketId(): number {
        return this.marketId;
    }

    //当前marketId，在好友家时是好友家marketId
    getCurMarketId(): number {
        return this.inFriendHome ? this.friendMarketId : this.marketId;
    }

    isInFriendHome() {
        return this.inFriendHome;
    }

    backHome() {
        this.inFriendHome = false;
    }

    private fillIncident(response: IRespData) {
        if (response.incidents) {
            this.incidentData.fill(response.incidents);
        }
    };

    private fillActivity(response: IRespData) {
        if (response.activity) {
            // this.activityData.fill(response.activity);
            this.activityData.initAssistAct(response.activity);
        }
    }

    fillActivityModel(response: IRespData) {
        if (response.entrance) {
            this.activityModel.fulldata(response.entrance);
        }
    }


    private updateIncident(response: IRespData) {
        if (response.updateIncidents) {
            this.incidentData.updateIncidents(response.updateIncidents);
        }
    };

    private fillTourBusData(respose: IRespData) {
        if (respose.userTourBuses) {
            this.tourBusData.fill(respose.userTourBuses);
        } else if (respose.friendTourBuses) {
            this.tourBusData.fill(respose.friendTourBuses, true);
        }

        if (respose.userTourBus) { //更新单个bus
            this.tourBusData.updateTourBus(respose.userTourBus);
        }

        if (respose.userTourHistories) {
            this.tourBusData.fillHistories(respose.userTourHistories);
        }
    }

    private fillRecruitData(response: IRespData) {
        if (response.talentMarket) {
            if (!this.recruitData) {
                this.recruitData = new RecruitData();
            }
            this.recruitData.fill(response.talentMarket);
        }
    }

    private fillFriendRecruitData(response: IRespData) {
        if (response.friendRecruit) {
            if (!this.recruitData) {
                this.recruitData = new RecruitData();
            }
            this.recruitData.updateFriendRecruit(response.friendRecruit);
        }
    }

    updateFriendRecruit(response: any) {
        if (response.friendRecruit) {
            this.recruitData.updateFriendRecruit(response.friendRecruit);
        }
    }

    updateRecruit(response: any) {
        if (response.recruit) {
            this.recruitData.updateRecruit(response.recruit);
        }
    }

    private fillStaffData(response: IRespData) {
        if (response.staffPool) {
            if (this.inFriendHome) {
                if (!this.friendStaffData) {
                    this.friendStaffData = new StaffData();
                }
                this.friendStaffData.fill(response.staffPool);
            } else {
                this.staffData.fill(response.staffPool);
            }
        }
    };


    private updateStaffList(response: IRespData) {
        if (!this.inFriendHome && response.staffList) {
            this.updateStaffs(response.staffList);
        }
    }

    private updateStaffs(staffs: Array<Staff>) {
        // let changed: boolean = false;
        staffs.forEach((staff: Staff) => {
            this.updateOneStaff(staff);
            // if (!changed) {
            //     changed = true;
            // }
        });
        // if (changed) {
        //cc.log("after updateStaffs", this.staffData.getSize());

        //更新员工数据后，在员工一览暂时不需要排序了，牌打乱玩家的选择
        //this.staffData.sort();
        // }
    }

    //返回的是更新后的Staff
    updateStaff(response: IRespData): Staff {
        if (!response.staff) {
            return;
        }
        let newStaff: Staff = this.updateOneStaff(response.staff);
        if (response.oldStaff) {
            this.updateOneStaff(response.oldStaff);
        }
        return newStaff;
    }

    getSelfMarketId() {
        return this.marketId;
    }

    updateOneStaff(staff: Staff): Staff {
        return this.staffData.update(staff);
    }

    removeStaff(staffId: number) {
        this.staffData.removeStaff(staffId);
    }

    //不能放在预处理，因为要提示扩充前的员工数目和扩充后的员工数目对比
    updateStaffCapacity(response: IRespData) {
        if (!response.staffCapacity) {
            return;
        }
        this.staffData.updateCapacity(response.staffCapacity);
        ClientEvents.STAFF_UPDATE_CAPACITY.emit();
    }

    updatePostsList(response: IRespData) {
        if (response.postsList) {
            this.staffData.updatePostsList(response.postsList);
        }
    }

    updatePosts(response: IRespData) {
        if (response.posts) {
            this.staffData.updatePosts(response.posts);
        }
    }

    private fillSignInData(response: IRespData) {
        if (response.dailyCheckin) {
            this.signInData.setSignIn(response.dailyCheckin);
        }
    };

    private fillFosterCareData(response: IRespData) {
        if (response.fosterList) {
            this.fosterCare.setFosterCare(response.fosterList);
        }
    }

    private fillTaskData(response: IRespData) {
        if (response.missionInfo) {
            this.taskData.setTaskData(response.missionInfo);
            cc.log("刷新任务进度");
        }
    }

    private fillMarketData(response: IRespData) {
        if (response.market) {
            // ClientEvents.MAP_CLEAR_PEOPLE.emit();
            if (this.inFriendHome || this.marketId != response.market.id) {
                this.clearSelfData(); //从好友家切换回家或者切换店铺
            }
            this.inFriendHome = false;
            this.marketId = response.market.id;
            this.iMarket.pullData(response.market);
        }
        if (response.friendMarket) {
            // ClientEvents.MAP_CLEAR_PEOPLE.emit();
            this.clearSelfData();
            this.inFriendHome = true;
            this.friendMarketId = response.friendMarket.id;
            this.iMarket.pullData(response.friendMarket);
        }
    }

    private upFocusSize = (response) => {
        if (response.focusSize) {
            if (this.focusData) {
                this.focusData.setNewFocusSize(response.focusSize);
            }
        }
    };

    //去好友家的话，有些自己的数据需要清除
    private clearSelfData() {
        this.tourBusData.clear();
    }

    private fillBusinessOneHour(response: IRespData) {
        if (response.businessOneHour >= 0) {
            if (!this.inFriendHome) {
                ClientEvents.EVENT_REFRESH_EARNINGS.emit(response.businessOneHour);
                this.businessOneHour = response.businessOneHour;
            }
        }
    }

    // loadHasNewFans = (response: any) => {
    //     this.hasNewFans = response.hasNewFans;
    //     ClientEvents.EVENT_FRIENDS_RED_DOT.emit();
    // };

    loadRecommended = (response: any) => {
        if (!this.recommended) {
            this.recommended = new Recommended();
        }
        this.recommended.setRecommended(response.recommendFriend);
    };

    loadFocusData = (response: IFriendsInfo) => {
        if (!this.focusData) {
            this.focusData = new Focus();
        }
        // if (response.queryFriend) {
        //     this.focusData.setFocus(response.queryFriend);
        //     this.focusData.setFocusSize(response.queryFriend, false)
        // } else {
        if (response) {
            this.focusData.setFocus(response.focus);
            this.focusData.setFocusSize(response.focusSize, true);
        }

        // }
        // ClientEvents.EVENT_FOCUS.emit();
    };

    // loadFrindsData = (response: IFriendsInfo) => {
    //     if (!this.friendsData) {
    //         this.friendsData = new Focus();
    //     }
    //     if (response) {
    //         this.friendsData.setFocus(response.focus);
    //         this.friendsData.setFocusSize(response.focusSize, true);
    //     }
    //
    //     // ClientEvents.EVENT_FOCUS.emit();
    // };

    setQueryFriend = (response: any) => {
        if (!this.queryFriend) {
            this.queryFriend = new QueryFriend();
        }
        this.queryFriend.setQueryFriend(response.queryFriend);
    };

    setPushFlags = (id: number) => {
        let ble: boolean = !this.pushFlags[id];
        cc.log(id, "+", ble, "+");
        this.pushFlags.splice(id, 1, ble);
        cc.log(this.pushFlags);
    };

    recordAuth = (response: IRespData) => {
        HttpInst.setAuthorization(response.hlToken);

        // test token post
        // HttpInst.postData(NetConfig.TEST_TOKEN,
        //     [], this.testToken);
        // HttpInst.postData(NetConfig.TEST_TOKEN,
        //     [], this.testToken);
    };

    testToken = (response: IRespData) => {
        console.log(response.user);
    };

    getOpenId(): string {
        return this.userData.openid;
    }

    getUserLv(): number {
        return this.userData.level;
    }

    isInSelfHome() {
        let curUserId = this.getCurUserId();
        let selfId = this.getUserId();
        return curUserId == selfId;
    }

    getCurUserId() {
        return this.inFriendHome ? this.friendData.id : this.getUserId();
    }

    hasUser() {
        return this.getUserId() > 0;
    }

    getUserId(): number {
        return this.userData.id;
    }

    getDiamond(): number {
        return this.userData.diamond;
    }

    getGold(): number {
        return this.userData.gold;
    }

    getExp(): number {
        return this.userData.exp;
    }

    hasItem(itemId: number): boolean {
        return this.getItemNum(itemId) > 0;
    }

    getItemNum(itemId: number): number {
        return this.warehouseData.getItemNum(itemId);
    }

    getItemType(itemId: number): boolean {
        let itemType = JsonMgr.getOneKind("item")[itemId].type;
        let isEnough: boolean = false;
        if (itemType == 11) {
            isEnough = true;
        }
        return isEnough;
    }

    getShopItemType(itemId: number): number {
        let itemType = JsonMgr.getOneKind("item")[itemId].type;
        if (itemType) {
            return itemType;
        } else {
            return null;
        }

    }

    getRecruit(): Recruit {
        return this.recruitData.getRecruit();
    }

    getFriendRecruit(): FriendRecruit {
        return this.recruitData.getFriendRecruit();
    }

    getCurStaffData() {
        return this.inFriendHome ? this.friendStaffData : this.staffData;
    }

    //是否可以解雇删除员工
    canDismissStaff(): boolean {
        let canDismiss: boolean = this.staffData.canDismiss();
        if (!canDismiss) {
            let dismissUserLevel = Number(JsonMgr.getConstVal("dismissUserLevel"));
            let dismissStaffNum = Number(JsonMgr.getConstVal("dismissStaffNum"));
            if (this.getUserLv() >= dismissUserLevel || this.getStaffSize() >= dismissStaffNum) {
                this.staffData.setCanDismiss();
                canDismiss = true;
            }
        }
        return canDismiss;
    }

    //员工的数目
    getStaffSize() {
        return this.staffData.getSize();
    }

    getStaff(staffId: number): Staff {
        return this.staffData.getStaff(staffId);
    }

    getChooseStaff() {
        return this.staffData.getChooseStaff();
    }

    setChooseStaffIndex(idx: number) {
        this.staffData.setCurStaff(idx);
    }

    hasStaffByResId(resId: number): boolean {
        return this.staffData.hasStaffByResId(resId);
    }

    //是否有分店
    hasSubMarket(): boolean {
        return this.staffData.hasSubMarket();
    }

    //超市店铺数目
    getMarketNum(): number {
        return this.staffData.getMarketNum();
    }

    getFosterCare() {
        return this.fosterCare;
    }

    // getHasNewFans() {
    //     return this.hasNewFans;
    // }

    getFocusData() {
        return this.focusData;
    }

    // getFriendsData() {
    //     return this.friendsData;
    // }

    getQueryFriend() {
        return this.queryFriend;
    }

    getRecommended() {
        return this.recommended;
    }

    setPopUp(pop: boolean) {
        this.popUp = pop;
    }

    getPopUp() {
        return this.popUp;
    }

    getNoticeListr() {
        return this.notices;
    }

    getPushFlags() {
        return this.pushFlags;
    }

    setServerTime(serverTime: number) {
        this.serverTime = serverTime;
        if (this.serverTimeInterval) {
            return;
        }
        this.serverTimeInterval = setInterval(() => {
            this.serverTime += 1000;
            this.serverTimeProcess(1000);
        }, 1000);
    }

    private serverTimeProcess = (decr: number) => {
        this.tourBusData.refreshTime(decr);
    };

    getLeftTime(endTime: number): number {
        return endTime - this.serverTime;
    }

    getServerTime() {
        return this.serverTime;
    }

    get StockRewards() {
        return this.stockRewards
    }

    set StockRewards(rewards) {
        this.stockRewards = rewards
    }

    setOpenStaffView(viewNum: number) {
        this.openStaffView = viewNum
    }

    getOpenStaffView() {
        return this.openStaffView;
    }

    setstockDetails(stockDetail) {
        this.stockDetails = stockDetail
    }

    getstockDetails() {
        return this.stockDetails
    }

    setChoseOpenGoodsType(Type) {
        this.choseOpenGoodsType = Type;
    }

    getChoseOpenGoodsType() {
        return this.choseOpenGoodsType
    }

    checkMapCanExpand() {
        let result = true;
        let expandTime = this.iMarket.getExFrequency();
        if (expandTime === 21) {
            ClientEvents.REFRESH_EXPAND_RED.emit(false);
            return false;
        }
        let popularity = this.iMarket.getPopularity();
        let expandData = JsonMgr.getSceneData((this.marketId - 1) * 22 + expandTime);
        let needLevel = expandData.expandLevel;
        if (!expandData.expandConsume) {
            this.result = false;
        } else {
            let consume = expandData.expandConsume.split(";");
            let money = consume[0].split(",")[1];
            consume.splice(0, 1);
            if (this.userData.level < needLevel) {
                result = false;
                ClientEvents.REFRESH_EXPAND_RED.emit(false);
                return;
            }
            if (popularity < expandData.needPopularity) {
                result = false;
                ClientEvents.REFRESH_EXPAND_RED.emit(false);
                return;
            }
            if (this.userData.gold < parseInt(money)) {
                result = false;
                ClientEvents.REFRESH_EXPAND_RED.emit(false);
                return;
            }
            for (let i = 0; i < consume.length; i++) {
                let needData = consume[i].split(",");
                let item = this.warehouseData.getItemDataVo(parseInt(needData[0]));
                if (!item) {
                    result = false;
                    ClientEvents.REFRESH_EXPAND_RED.emit(false);
                    return;
                } else if (item.num < parseInt(needData[1])) {
                    result = false;
                    ClientEvents.REFRESH_EXPAND_RED.emit(false);
                    return;
                }
            }
        }
        ClientEvents.REFRESH_EXPAND_RED.emit(result);
        return result;
    }

    checkBackShowGuide() {
        let level = JsonMgr.getBackShowLevel();
        return this.userData.level >= level;
    }

    getPopularityResult() {
        return this.result;
    }

    checkHasLongOrderCar = () => {
        let result = this.redData.indexOf(RedConst.LONG_ORDER_HAS);
        return result !== -1;
    };

    //玩家有可突破好感度的员工
    hasCanBreakStaff(): boolean {
        for (let staff of DataMgr.getCurStaffData().getSorted()) {
            if (staff.level >= Number(JsonMgr.getConstVal("favorOpenLv")) && staff.isUnique()) {   //员工有好感度且以开放功能
                let favorJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(staff.favorStage, staff.favorLevel);
                if (favorJson.quality < 3) {    //还能够突破
                    let AllJson = JsonMgr.getFavorLevelAllJson();
                    let fastBreakNum: number = favorJson.cost - staff.favorExp;
                    for (let nid in AllJson) {
                        if (AllJson[nid].quality == favorJson.quality && AllJson[nid].level > favorJson.level && AllJson[nid].cost) {
                            fastBreakNum += AllJson[nid].cost;
                        }
                    }
                    if (DataMgr.warehouseData.getAllCanAddFavor() >= fastBreakNum) {    //背包道具最多能加的好感度 >= 最快突破需要的好感度
                        let staffstr: string = staff.getBreakThroughItemId(staff.favorStage + 1);
                        if (!staffstr) return false;
                        let staffItemStr: string[] = staffstr.split(",");
                        let BreakItemId: number = Number(staffItemStr[0]);
                        let itemNum: number = Number(staffItemStr[1]);
                        let wareNum: number = DataMgr.warehouseData.getItemNum(BreakItemId);
                        if (wareNum >= itemNum)     //event道具是否足够
                            return true;
                    }
                }
            } else {
                return false;
            }
        }

    }

    getCommitResult() {
        return this.redData.indexOf(RedConst.LONGORDER_COMMIT) >= 0;
    }

    //显示长途货运红点
    ShowCommitRed() {
        ClientEvents.LONG_ORDER_BUBBLE.emit(1, this.getCommitResult());
    }

    getReceiveResult() {
        return this.redData.indexOf(RedConst.LONGORDER_RECIVE) >= 0;
    }

    //显示长途货运红点
    ShowreceiveRed() {
        ClientEvents.LONG_ORDER_BUBBLE.emit(0, this.getReceiveResult());
    }

    getNewCarRedResult() {
        return this.redData.indexOf(RedConst.LONG_ORDER_CAR_NEW) >= 0;
    }

    ShowNewCarRed() {
        ClientEvents.LONG_ORDER_BUBBLE.emit(2, this.getNewCarRedResult());
    }

    isLock(item: IShopJson) {
        return item.unclockLevel > DataMgr.iMarket.getTrueExpandTime();//DataMgr.getUserLv();
    }

    shopCanBuy(id: number): boolean {
        let shopJson: IShopJson = JsonMgr.getOneShopJson(id);
        if (shopJson.price) {
            let costStr = shopJson.price.split(",");
            let buyId: number = Number(costStr[0]);
            let buyNum: number = Number(costStr[1]);
            return DataMgr.getItemNum(buyId) >= buyNum;
        }
    }

    checkShowDecorateRed() {
        let redShowLevel = JsonMgr.getConstVal("furnitureGuide");
        return this.userData.level >= redShowLevel;
    }

    canExchange(shopdata: IActivityStoreInfo) {
        let itemArr = [];
        for (let nid = 0; nid < shopdata.activityStore.length; nid++) {
            let shopId = shopdata.activityStore[nid].id;
            let shopNum = shopdata.activityStore[nid].residualNum;
            let isEnough: boolean = true;
            let shopMsg = JsonMgr.getOneKind("activityStore");
            let itemData = shopMsg[shopId];
            if (shopNum == 0) {
                isEnough = false;
            }
            let iconArr = itemData.price.split(";");
            for (let i = 0; i < iconArr.length; i++) {
                let iconStr = iconArr[i].split(",");
                for (let i = 0; i < shopdata.assistanceItems.length; i++) {
                    let itemArr = shopdata.assistanceItems[i].xmlId;
                    if (itemArr == Number(iconStr[0])) {
                        let ownPorp = shopdata.assistanceItems[i].number;
                        let needPorp = Number(iconStr[1]);
                        if (ownPorp < needPorp) {
                            isEnough = false;
                        }
                    }
                }
            }
            if (isEnough == false) {
                itemData.sort = nid;
            } else if (isEnough == true) {
                itemData.sort = -1;
            }
            itemArr.sort((A, B) => {
                return A.sort - B.sort;
            });
            let shopArr = [itemData];
            for (let nid in shopArr) {
                itemArr.push(shopArr[nid]);
            }
        }
        return itemArr;
    }


    canBreak(staff) {
        if (!staff) return;
        if (staff.level >= Number(JsonMgr.getConstVal("favorOpenLv")) && staff.isUnique()) {   //员工有好感度且以开放功能
            let favorJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(staff.favorStage, staff.favorLevel);
            if (favorJson.quality < 3) {    //还能够突破
                let AllJson = JsonMgr.getFavorLevelAllJson();
                let fastBreakNum: number = favorJson.cost - staff.favorExp;
                for (let nid in AllJson) {
                    if (AllJson[nid].quality == favorJson.quality && AllJson[nid].level > favorJson.level && AllJson[nid].cost) {
                        fastBreakNum += AllJson[nid].cost;
                    }
                }
                if (DataMgr.warehouseData.getAllCanAddFavor() >= fastBreakNum) {    //背包道具最多能加的好感度 >= 最快突破需要的好感度
                    let staffstr: string = staff.getBreakThroughItemId(staff.favorStage + 1);
                    if (!staffstr) return false;
                    let staffItemStr: string[] = staffstr.split(",");
                    let BreakItemId: number = Number(staffItemStr[0]);
                    let itemNum: number = Number(staffItemStr[1]);
                    let wareNum: number = DataMgr.warehouseData.getItemNum(BreakItemId);
                    if (wareNum >= itemNum) {
                        //event道具是否足够
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    getTaskType(id: number): string {
        if (id >= 510001 && id < 519999) {
            return "daily";
        } else if (id >= 5501001 && id < 5509999) {
            return "community";
        } else {
            return "target";
        }
    }

    setBuyInfo(data) {
        this.buyInfo = data;
    }

    getBuyInfo() {
        return this.buyInfo;
    }

    isSaleNull(id: number) {
        let num: number = JsonMgr.getOneShopJson(id).maxBuy;
        for (let item of this.buyInfo) {
            if (num > 0 && item.xmlId == id && item.number >= num) {
                return true;
            }
        }
        return false;
    }

    judgeStartSoftGuideJson() {
        //重置跳转ID
        DataMgr.setClickMainTask(0);
        if (!DataMgr.getIsJudgeSoft()) {
            return
        }
        let softGuideJson: ISoftGuideJson[] = JsonMgr.getSoftGuideJson(GuideType.lvGuide);
        for (let index = 0; index < softGuideJson.length; index++) {
            let guideJson: ISoftGuideJson = softGuideJson[index];
            let isStart = judgeSoftGuideStart(guideJson);
            if (isStart) {
                ClientEvents.SHOW_SOFT_GUIDE.emit(guideJson);
                return;
            }
        }
    }

    getFutureMoveOpen() {
        let posId = DataMgr.userData.positionId;
        let value = JsonMgr.getFunctionOpenByName(FunctionName.decorate).value;
        return posId >= value;
    }

    setIsJudgeSoft(isJudge) {
        this.isJudgeSoft = isJudge;
    }

    getIsJudgeSoft() {
        return this.isJudgeSoft;
    }

}

export const DataMgr: DataManager = DataManager.instance;

export class Consume {
    xmlId: number;
    number: number;

    constructor(consume: Consume) {
        CommonUtil.copy(this, consume);
    }
}

