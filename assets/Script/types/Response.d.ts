/**
 * @author: Lizhen
 * @date:
 * @description: 接口返回数据申明类型
 */
import {JobType, Staff} from "../Model/StaffData";
import {FriendRecruitResult, RecruitResult} from "../Model/RecruitData";

declare interface IResponse {
    data: IRespData | string; //后端报错时类型为string
    do: string;
    mod: string;
    status: number;
    t: number;
    ts: string;
}

declare interface IServer {
    clientVersion: string;
    name: string;
    outJsonUrl: string;
    serverUrl: string;
    trackGameId: string;
    ver: string;
    showLog: boolean;
}

declare interface IRespData {
    server: IServer;

    extraExp?: number
    wechatPayEnv: number;
    isLowPhone?: boolean;
    endTime?: number;
    friendRecruit?: any;
    friend?: boolean;
    decoProfit?: number;
    hasRecruitCount?: number;
    activityGoal?: IActivityGoal;
    integralNumber?: number;
    friendBusiness: number;
    activityBannerIds?: number[];
    activities?: IActivitiesInfo[];
    businessOneHour?: number;
    dailyCheckin?: IDailyCheckIn;
    fosterList?: IFosterItem[];
    newUser?: boolean;
    guideCount?: number;
    isCompleteFoster?: boolean;
    assist?: IAssist;
    mailBox?: IMailBox;
    extraExp?: number;
    recruit?: RecruitResult;
    /*砸金蛋*/
    isVip?: boolean;
    vipCount?: number;
    exchangeCount?: number;  //已兑换次数
    maxSale?: number         //历史最高营业额
    multy?: number;//兑换暴击倍数
    orderManager: IFreeOrderList;
    advInfo: IADInfo[];
    levelUpStaffs?: number[];
    incidents?: IIncidents;
    assistance?: IAssist;
    updateIncidents?: IIncidents;

    userTourBuses?: IUserTourBus;
    userTourBus?: IUserTourBusDetail;
    userTourHistories?: IReceptionHistory[];

    friendTourBuses?: IUserTourBus;
    receptionNum?: number;
    receptionIgnoreNum?: number;
    shelves: IShelves[];
    market?: IMarket;
    friendMarket?: IMarket;

    pushFlags?: boolean[];
    redDots?: number[];

    stockInfo?: IStockInfo;
    activity?: IActivityItem;//实际应该是IActivity

    settings?: IAudioSetting;

    user?: IUser;
    friendInfo?: IUser;

    warehouse?: IWareHouse;

    staffPool?: IStaffPool;
    staffCapacity?: number;

    staffList?: Staff[];
    staff?: Staff;
    oldStaff?: Staff;

    postsList?: IPosts[];
    posts?: IPosts;
    helps?: any[];
    incident?: IIncident;

    talentMarket?: ITelnetMarket;
    missionInfo?: IMissionInfo;
    goal?: IGoal;
    leftTime?: number,

    popUp?: boolean;
    notices?: any;

    reward?: ICommonRewardInfo[];
    receiveStaffs?: any;
    repeatStaffIds?: any;
    replenishPoll?: any;

    //首次登录会有下面的字段
    newUser?: boolean;
    hlToken?: string;
    outJson?: string;

    //后端出现异常会有下面的字段
    //errorCode?: number;
    //errorMsg?: string;

    //后端停服会有下面的字段
    title?: string;
    content?: string;

    longOrder?: ILongOrder
    entrance?: IEntranceInfo;
    profits?: IFosterReward[];

    assistanceRewards?: number[];
    tips?: string[];
    softLedMap?: any;
    buffIds?: number[];
    assistanceItems: IActivityItemInfo[];
    SellGoodsGoal: IGoal;
    bubbleCnt: number;
    inspireInfo?: IInspireInfo;
    authorize: boolean;
    advertId: number;
    advertSumCount?: number;
    setFutureSuc?: boolean;
}

declare interface IInspireInfo {
    inspireNum: number;
    recoveryTime: number;
}

declare interface ITelnetMarket {
    diamondRecruit: IDiamondRecruit;
    recruit: IRecruit;
}

declare interface IDiamondRecruit {
    freeCount: number;
    recruitResults: RecruitResult[];

    lastRefreshTime: number;
    totalCount: number;
    unRecruitUniqueCnt: number;
}

declare interface IRecruit {
    count: number;
    freeCount: number;
    freeIndex: number;
    recruitResults: RecruitResult[];
    remainTime: number;
    totalRecruitCnt: number;
}

declare interface IFriendRecruit {
    friendRecruits: FriendRecruitResult[];
}

declare interface IMarket {
    endExtendTime?: number           //店铺扩建cd
    id: number;                     //店铺id
    exFrequency: number;            //扩建次数
    floors: any;                    //地板数据
    left: number;
    right: number;
    userId: number;
    popularity: number;             //人气值
    wallPaper: number;              //墙纸
    wallDeco: IShelves[];            //墙上装饰
    shelves: IShelves[];            //货架和家具
    signboardLevel: number;          //招牌等级
    exRewards: number;
    name: string;
    todayRename: boolean;
    decoGoldProfit: number;         //装饰产出金币
}

declare export interface IShelves {
    x: number;
    y: number;
    xmlId: number;
    id: number;
    reversal: boolean;              //是否翻转
    startTime?: string;             //摆放的起始时间戳
    goldIncome?: number;            //累计待领取售货金币
    sumExp?: number;
}

declare export interface IFloors {
    value: number;
    key: number
}

declare export interface IPopularityArr {
    sheleveDecoJson: IDecoShopJson;
    sheleveNum: number
}

declare interface IUser {
    id: number;
    name: string;
    openid: string;
    incrHowLv: number;
    exchangeGoldCnt: number;
    level: number;
    newComerStep: number;
    selectGuide: number;

    createTime: number;//1565145513597
    cumulateLoginDay: number;//1
    diamond: number;//0
    exp: number;//0
    gold: number;//0
    positionId: number;
    sex: number;     //0未知，1男，2女
    // id: 1000003
    // incrHowLv: 0
    lastActualDay: number;//18115
    lastLoginDay: number;//18115
    // level: 1
    nickName: string;//"lizhen001"
    // openid: "lizhen001"
    readPromoteTime: number;
    // userProperty: IUserProperty;

    staffId: number;//宝宝选择
    signature: string;//个性签名

    ownFriendFrames: number[];//好友框
    friendFrame: number;//当前使用好友框
    avatar: string;//头像
    pendant: string;//头像框
    friendFocus?: boolean;//是否关注他
    renameEndTime: number;//改名结束时间
    positionId?: number;//段位id
}

declare interface IUserProperty {
    diamond: number;
    exp: number;
    gold: number;

    head: string; //头像

    level: number;
    moegoCoin: number;
    headFrame: number[];
    nowHeadFrame: number;
    shopName: string;
    shopWelcome: string;
    reNameFirst: boolean;
    reNameTime: number;

    pendant: string //头像边框
}

declare interface IFriendsInfo {
    focus: IFriendsItem[];
    focusSize: number;
    hasNewFans: boolean
}

declare interface IFriendsItem {
    // focusHasNewFans: string;
    // garbage: boolean;
    fans: boolean;
    focus: boolean;
    // head: string;
    id: number;
    level: number;
    mutualFocus: boolean;
    nickName: string;
    positionId: number;
    // openid: string;
    // shopName: string;
    //头像
    head: string;
    //头像边框
    pendant?: string;
    // homeStatus: number
    marketStatus: IMarketStatus[];
    recruit: boolean;
    friendFrame: number;//好友框
    allPopularity: number;//人气值
}

declare interface IMarketStatus {
    marketId: number;
    name: string;
    status: number;
}


declare interface IMailBox {
    mailBox: MailBoxItemVo[],
}

declare interface IMailBoxItem {
    //附件
    annex: string;//"-2,100;-3,50"
    //是否有附件
    haveAnnex: boolean;//true
    //是否阅读
    read: false;//false
    //接受时间
    receiveTime: number; //1550237169
    //正文
    text: string; //"欢迎来到秋叶原小店！这里将带你进入到一个全新的经营世界！"
    //主题
    theme: string; //"欢迎来到秋叶原小店！"
    //剩余时间
    timeRemaining: number; // 633523
    //邮件的唯一ID
    createTime: number; // 633523
}

declare interface IMissionInfo {
    dailyMissions: IMissionItem[],
    mainMissions: IMissionItem[],
    positionMissions: IMissionItem[];
    storeMissions: IMissionItem[],
    communityMissions: IMissionItem[]
}

declare interface IDailyMission {
    dailyMissionList: IMissionItem[],
}

declare interface IMissionItem {
    completed: boolean,//是否完成
    current: number,// 当前任务进度
    // new: boolean,
    receivedAward: boolean,//是否领奖
    // target: number,
    xmlId: number
}

declare interface ISellInfo {
    SellGoodsGoal: IGoal;
}

declare interface IGoal {
    completeCnt: number//完成次数,
    currGold: number,//当前进度
    goal: number,//目标
    hasDrawCnt: number,//已领取次数
    historyGoals: number[],//以可领取目标
    // leftTime?: number,//预计时间
    sceneLevel: number//扩建总等级
}

declare interface IAddComInfo {
    add_gold_num: string;
    add_stock_num: string;
    stock_numbers: string;
}

declare interface IDailyCheckIn {
    alreadyCheckin: number[],
    isCheckinToday: boolean
}

declare interface IFosterItem {
    artResId: number,
    canGainExp: number,
    fosterStarTime: number,
    friendId: number,
    friendName: string,
    head: string,
    pendant: string,
    staffId: number,
}


declare interface IStockInfo {
    companyId: number,
    count: number,
    count: number,
    leftSeconds: number,
    leftSellGold: number,
    roleId: number,
    draw: boolean
}


declare interface IWareHouse {
    itemWh: IItemWh,
    userId: number
    furnitures: any[];
}

declare interface IStaffPool {
    capacity: number,
    extendCount: number,
    unlockDismiss: boolean, //是否开启解雇员工
    postsList: IPosts[],
    staffs: Staff[]
}

declare interface IPosts {
    id: number,
    positions: IPost[],
}

declare interface IPost {
    positionId: JobType;
    sumScore: number;
    staffIds: number[];
    newLockFlag: boolean;
}

declare interface IAdvantage {
    type: number;
    unlock: boolean;
}

declare interface IItemWh {
    items: IItem[]
}

declare interface IItem {
    id: number,
    num: number,
    stacking: number,
    type: string
}

declare interface IGoodsItem {
    id: number
    num: number,
}

declare interface ILongOrder {
    orderList: ILongOrderInfo[],
}

declare interface ILongOrderInfo {
    endCd: number,//订单cd时间 state=1
    orderBoxs: ILongOrderBox[],//填充订单 state=0
    consume: ILongOrderBox,
    rewardList: ILongOrderReward[],//领取订单 state=2
    play: boolean,//是否播放特效
    rare: boolean,//是否是稀有
    level: number,//解锁登记 state = -1
    destination: string,
    expire: boolean,
    state: number,
    unlockPlay: boolean,
}

declare interface ILongOrderBox {
    goodsNumber: number,
    goodsId: number,
    state: number,

    xmlId: number,
    number: number,
}

declare interface ILongOrderReward {
    num: number,
    xmlId: number
}

//--------------------------------------------危机相关---start

declare interface IIncidents {
    list: IIncident[]
}

declare interface IIncident {
    id: number; //后端唯一id
    xmlId: number; //配置表id
    leftTime?: number; //剩余毫秒
    process?: number; //处理进度
    helpMax?: boolean; //好友是否可以帮助满
    helpProcess?: number;
    state?: number; //状态：1-新的；2-进行中；3-完成
    helped?: boolean;
    showId?: number;//描述
    coordId?: number;//
    rewardList?: ICommonRewardInfo[];//礼物
    expireTime?: number;
}

declare interface IIncidentDetail {
    incident: IIncident,
    helps: IUserBaseItem[]
}

declare interface IIncidents {
    list: IIncident[]; //危机事件列表
    //todayFinish: number; //今天已解除的危机数目
}


//--------------------------------------------危机相关---end

declare interface IAssist {
    incident: IIncident,
    members: IUserBaseItem[],
    info: AssistanceInfoVO
}

declare interface IAssistInfo {
    assistanceCount: number,
    recoveryTime: number,
    rank: number,
    totalMember: number,
}

declare interface IAssistRankInfo {
    list: IAssistRankItem[],
    rewardRank: number
}

declare interface IAssistRankItem {
    member: IUserBaseItem,
    focus: boolean,
    rank: number,
    degree: number,
    rewardId: number
}

declare interface IUserBaseItem {
    userId: number,
    openid: string,
    nickName: string,
    avatar: string,
    level: number
}

declare interface IActivitiesInfo {
    leftTime: number,
    state: number,
    xmlId: number,
}

declare interface IEntranceInfo {
    activities: IActivitiesInfo[],
    maxAssistanceNum: boolean,
    incident: IIncident,
    members: IUserBaseItem[],
    info: AssistanceInfoVO,
    totalMember?: number
}

declare interface AssistanceInfoVO {
    assistanceCount: number,
    recoveryTime: number,
    rank: number,
    totoalMember: number
}

//--------------------------------------------巴士相关---start

declare interface IUserTourBus {
    busOpen: boolean;
    buses: IUserTourBusDetail[]; //最多2个巴士
    market: number; //超市分店索引——1，2
    nextTravelingTime: number; //下次出现时间
    receptions: IReception[];
}

declare interface IUserTourBusDetail {
    parkingTime: number; //停留时间
    station: number; //停留站台位置——101，102；201；202
    status: number; //状态——0未接待1接待过
    travellerNum: number; //旅客数目
}

declare interface IReceptionHistory {
    receptionUserId: number; //帮助接待的userId
    receptionUserNickname: string; //帮助接待的用户名称
    receptionTravellerNum: number; //帮助接待的总数目
    lossTravellerNum: number; //拐走的数目
    receptionTime: number; //帮助的时间
}

declare interface IReception {
    endTime: number; //接待游客结束时间
    travellerNum: number; //接待游客数目
}

//--------------------------------------------巴士相关---end

//--------------------------------------------进货相关---start

declare interface IPurchase {
    replenishs: ReplenishsInfo;
}

declare interface ReplenishsInfo {
    boxList: IBoxList[];
    goods: IGoods[];
}

declare interface IBoxList {
    hasitem: boolean;
    index: number;
}

declare interface IGoods {
    typeId: number;
    unlock: boolean;
}

//--------------------------------------------进货相关---end

//--------------------------------------------订单---start

declare interface IOrderInfo {
    orderManager: IFreeOrderList;
}

declare interface IFreeOrderList {
    disTime: number;
    orders: number[];
    refreshTime: number;
    dailyNumber: number;
    completeNumber: number;
    new: boolean;
}

declare interface IOrderGoodsInfos {
    goodsId: number;
    number: number;
}

declare interface IActivityStoreInfo {
    endTime: number;
    activityStore: IActivityInfo[];
    assistanceItems: IActivityItemInfo[];
}

declare interface IActivityInfo {
    id: number;
    residualNum: number;
}

declare interface IActivityItemInfo {
    number: number;
    xmlId: number;
}

declare interface IShopItemInfo {
    activityId: number;
    id: number;
    itemId: string;
    limit: number;
    price: string;
    rewardId: number;
    sort: number;
}

declare interface IActivityGoal {
    activityId: number;
    alreadyRecieveds: Array<number>;
    templateId: number
}

declare interface IShopBuyInfo {
    buyInfo: IShopDataInfo[];
}

declare interface IShopDataInfo {
    number: number;
    todayNumber: number;
    xmlId: number;
}

declare interface IActivity {

}

declare interface IActivityItem {
    activityId: number,
    state: number
    xmlId: number
}

//--------------------------------------------订单---end


declare interface ICommonRewardInfo {
    num: number;
    xmlId: number;
}

//cangku
declare interface IWareHouseInfo {
    id: number;
    leftTime: number;
    num: number;
}

declare interface IGoodsVoInfo {
    goodsVO: IWareHouseInfo[];
}

declare interface IStaffAttColor {
    staffNum: number;
    color: any;
}

declare interface IStaffExp {
    lv: number;
    afterChangedExp: any;
    lvUpExp: any;
    progress: number;
    isup: boolean;
}

declare interface ISettingInfo {
    fansCount: number;
    marketSetInfos: IMarketSetInfo[];
    ownFriendFrames: IOwnFrameInfo[];
    friendFrame: number;
    vip: boolean;
    vips: IVipDataInfo[];
}

declare interface IOwnFrameInfo {
    id: number;
    redDot: boolean;
}

declare interface IMarketSetInfo {
    marketLevel: number;
    marketName: string;
    popularity: number;
    profitOneHour: number;
}

declare interface IAudioSetting {
    music: boolean;
    sound: boolean;
    lowPhone: boolean;
}

declare interface ISearchFanInfo {
    queryFriend: IFanInfo[];
}

declare interface IFansInfo {
    fans: IFanInfo[];
    fansSize: number;
}

declare interface IFanInfo {
    fans: boolean;
    focus: boolean;
    head: string;
    homeStatus: number;
    id: number;
    level: number;
    mutualFocus: boolean;
    nickName: string;
    pendant: string;
    recruit: boolean;
    positionId: boolean;
}

declare interface IFosterList {
    fosterList: IFosterInfo[];
}

declare interface IFosterInfo {
    artResId: number;
    fosterRemain: number;
    friendId: number;
    friendName: string;
    head: string;
    pendant: string;
    popularity: number;
    recieved: boolean;
    staffId: number;
}


declare interface IRechargeInfo {
    rechargeGift: IRechargeGiftInfo
}

declare interface IRechargeGiftInfo {
    hasDrawGifts: number[];
    totalRechargeNum: number;
}

declare interface IShowActivityInfo {
    activities: IActivitesItem[];
    charges: IChargeItem[];
}

declare interface IActivitesItem {
    new: boolean,
    templateId: number
}

declare interface IChargeItem {
    first: boolean,
    id: number
}

declare interface IFriendsFosterInfo {
    beFosterList: Array<IFriendFoster>;
    beFosterSize: number;
}

declare interface IFriendFoster {
    artResId: number;
    fosterRemain: number;
    friendId: number;
    friendName: string;
    popularity: number;
    recieved: boolean;
    staffId: number;
}

declare interface IShowStaffRates {
    five: Array<number>;
    four: Array<number>;
    furnitureList: Array<IStaffRate>;
    staffRateList: Array<IStaffRate>;
    three: Array<number>;
    unique: Array<number>;
    uniqueUpStaffs: uniqueUpStaffs;
    upLeftCnt: number;
    golds: Array<number>;
}

declare interface uniqueUpStaffs {
    staffs: Array<IStaffRate>;
    sumRate: number;
}

declare interface IStaffRate {
    chance: number;
    id: number;
    stockUp: boolean;
}

declare interface IStarLength {
    uniqueStarStaff: number;
    uniqueStarFurniture: number;
    fiveStarStaff: number;
    fiveStarFurniture: number;
    fourStarStaff: number;
    fourStarFurniture: number;
    threeStarStaff: number;
    threeStarFurniture: number;
}

declare interface IStarAllRate {
    uniqueStarStaffAllRate: number;
    uniqueStarFurnitureAllRate: number;
    fiveStarStaffAllRate: number;
    fiveStarFurnitureAllRate: number;
    fourStarStaffAllRate: number;
    fourStarFurnitureAllRate: number;
    threeStarStaffAllRate: number;
    threeStarFurnitureAllRate: number;
}

declare interface IFosterRewardInfo {
    canRewards: Array<IFosterReward>;
}

declare interface IFosterReward {
    num: number;
    playType: number;
    xmlId: number;
}

//充值相关
declare interface IRechargeActivityInfo {
    rechargeActivities: IRechargeActivitiesInfo[],
    charges: IChargeInfo[],
    vips: IVipDataInfo[],
    advInfo: IAdvDataInfo[],
    timeEnd: number
}

declare interface IAdvDataInfo {
    number: number;
    xmlId: number;
}

declare interface IRechargeActivitiesInfo {
    buyCntList?: IActivityBuyInter[],
    new?: boolean,
    templateId?: number,
    rechargeGift?: IActivityGiftInter
}

declare interface IActivityBuyInter {
    giftXmlId: number,
    buyNum: number
}

declare interface IActivityGiftInter {
    totalRechargeNum: number,   //充值数量
    hasDrawGifts: number[]      //已经领取的礼包ID集合
}

declare interface IChargeInfo {
    first: boolean,
    id: number
}

declare interface IVipDataInfo {
    dailyReward: boolean;
    dailyRewardTime: number;
    expireData: number;
    expireStr: string;
    fistReward: boolean;
    userId: number;
    vip: boolean;
    type: number;
}

declare interface IClientActivityInfo {
    type: number,
    new?: boolean,
    buyCntList?: IActivityBuyInter[],
    rechargeGift?: IActivityGiftInter,
    templateId?: number,
    first?: boolean,
    id?: number,
    sort?: number,
    isbuyed?: boolean,
    number?: number
}

declare interface IIncident {
    readonly expireTime: number
    readonly helpMax: boolean
    readonly helpProcess: number;
    readonly helped: boolean;
    readonly id: number
    readonly process: number
    readonly rewardList: any[];
    readonly showId: number;
    readonly state: number;
    readonly xmlId: number;
}

declare interface IFosterFriend {
    focus: IFocusInfo[];
    focusSize: number;
}

declare interface IFocusInfo {
    allPopularity: number;
    fans: boolean;
    focus: boolean
    friendFrame: number;
    head: string;
    history: number;
    id: number;
    level: number;
    mutualFocus: boolean;
    nickName: string;
    pendant: string;
    recruit: boolean;
    positionId: number;
}

declare interface IPromoteInfo {
    endTime: number;
    expire: boolean;
    promoteMods: IPromoteModsInfo[];
    startTime: number;
}

declare interface IPromoteModsInfo {
    pModeId: number;
    promoteId: number;
}

declare interface IFindCurrentProInfo {
    futurePromotes: IPromoteInfo[],
    promote: IPromoteInfo
}

declare interface ISellTaskInfo {
    datas: ISellCompany[];
}

declare interface ISellCompanyInfo {
    gain_num: number;
    icon_url: string;
    people_id: number;
    people_name: string;
    recommend: boolean;
    stock_num: number;
}

declare interface IStaffGiftInfo {
    endTime: number;
    hasReward: boolean;
    id: number;
    start: string;
    road: number;
}

declare interface IADInfo {
    number: number;
    xmlId: number;
}