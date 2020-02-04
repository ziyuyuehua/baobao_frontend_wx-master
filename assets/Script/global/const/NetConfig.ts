/*
 * @Author: tyq
 * @Date: 2019-01-07
 * @Desc: 网络配置
 */

let user: string = "userService";
let market: string = "marketService";
let exchange: string = "exchangeService";
let exchangeGold = "exchangeGoldService";
let mission = "missionService";
let dailyCheckin = "dailyCheckinService";

let vip = "vipService";
let warehouse = "warehouseService";
let mail = "mailBoxService";
let incident = "incidentService";
let friend = "friendsService";
let staff = "staffService";
let post = "postService";

let poll = "pollingService";
let invite = "inviteService";
let friendRecruit = "friendRecruitService";
let order = "orderService";
let longOrder = "longOrderService";
let replenish = "replenishService";
let assistance = "assistanceService";

let tour = "tourService";
let setting = "userSettingService";
let activity = "activityService";
let pay = "payService";
let wechat = "wechatService";
let wechatVip = "wechatVipService";
let ad = "advertService";
let newGuide = "newGuideService";
let inspire = "inspireService";
let staffGift = "staffGiftService";
let grading = "gradingService";

export namespace NetConfig {

    export let GET_SERVER_INFO: [string, string] = [user, "getServerInfo"];
    export let GET_OUT_JSON: [string, string] = [user, "readOutJson"];
    export let GET_USER_INFO: [string, string] = [user, "getUserInfo"];
    export let GET_HOME_INFO: [string, string] = [user, "returnHome"];
    export let TEST_TOKEN: [string, string] = [user, "testToken"];
    export let CHANG_NOTICE_STATUS: [string, string] = [user, "changeNoticePopup"];
    export let NOTICE_LIST: [string, string] = [user, "readNotice"];


    export let PUSH_MAPMSG: [string, string] = [market, "marketDecorate"];
    export let OPEN_BIG_MAP: [string, string] = [market, "showMarketList"];

    //激励
    export let INSPIRE_INIF: [string, string] = [inspire, "inspireInfo"];
    export let INSPIRE: [string, string] = [inspire, "inspire"];
    export let INSPIRE_PURCHASE: [string, string] = [inspire, "purchase"];


    //获取微信版金币兑换界面信息
    export let GET_EXCHANGE_GOLD: [string, string] = [exchange, "getExchangeInfo"];
    //获取萌股版金币兑换界面信息
    export let SHOW_EXCHANGE_GOLD: [string, string] = [exchangeGold, "showExchangeInfo"];
    //微信版金币兑换
    export let EXCHANGE_GOLD_WX: [string, string] = [exchange, "currencyExchange"];
    //萌股版金币兑换
    export let EXCHANGE_GOLD_MG: [string, string] = [exchangeGold, "exchangeGold"];
    //砖石兑换
    export let EXCHANGE_DIAMOND: [string, string] = [user, "exchangeDiamond"];
    //推送开关
    export let SWITCH_PUSG: [string, string] = [user, "switchPush"];
    //修改店铺名
    export let CHANGE_SHOP_NAME: [string, string] = [user, "updateShopName"];
    //改签名
    export let CHANGE_SHOP_WELCOME: [string, string] = [user, "updateShopWelcome"];
    //改头像框
    export let CHANGE_PICTURE_FRAME: [string, string] = [user, "updateHeadFrame"];
    //用户反馈
    export let INSERT_FEEDBACK: [string, string] = [user, "insertFeedback"];
    //领取每日任务宝箱
    export let RECEIVE_DAILY_AWARD: [string, string] = [mission, "receiveDailyAward"];

    export let UPGOODS_TOCASE: [string, string] = [warehouse, "upperShelf"];
    //会员第一次奖励
    export let RECEIVE_FIST: [string, string] = [vip, "receiveFist"];
    //会员每日奖励
    export let RECEIVE_DAILY: [string, string] = [vip, "receiveDaily"];
    //获取会员信息
    export let SHOW_VIP: [string, string] = [vip, "showVip"];

    export let GET_MARKET_ALL_MONEY: [string, string] = [market, "collectMarket"];
    export let CHANGE_MARKET: [string, string] = [market, "enterMarket"];
    export let GET_MARKET_THING_DANGER: [string, string] = [incident, "getIncident4Map"];

    //打开邮件箱
    export let OPEN_MAIL_BOX: [string, string] = [mail, "getMailInfo"];
    //查看邮件
    export let SEE_MAIL: [string, string] = [mail, "seeMail"];
    //删除邮件
    export let DELETE_MAIL: [string, string] = [mail, "deleteMail"];
    //领取邮件
    export let RECEIVE_ANNEX: [string, string] = [mail, "receiveAnnex"];
    //一键领取
    export let RECEIVE_ONE_KEY: [string, string] = [mail, "receiveOneKey"];
    //领取任务奖励
    export let RECEIVE_AWARD: [string, string] = [mission, "receiveAward"];
    //签到
    export let SIGN_IN: [string, string] = [dailyCheckin, "checkin"];

    //获取签到
    export let GET_CHECKIN_INFO: [string, string] = [dailyCheckin, "getCheckinInfo"];

    //打开连续宝箱
    export let SIGN_IN_ACCUMULAT_AWARD: [string, string] = [dailyCheckin, "accumulatAward"];
    //寄养
    export let FOSTER_STAFF: [string, string] = [friend, "fosterStaff"];
    export let FOSTER_CANCEL_REWARD: [string, string] = [friend, "seeFosterReward"];
    export let FOSTER_FRIEND: [string, string] = [friend, "findFosterFriends"];
    //获取自己寄养出去的员工
    export let GET_FOSTER_INFO: [string, string] = [friend, "getFosterInfo"];
    //获取被寄养在自己家的员工
    export let GET_BE_FOSTER_INFO: [string, string] = [friend, "getBeFosterInfo"];
    //取消寄养，领取奖励
    export let CANCEL_FOSTER: [string, string] = [friend, "cancelFoster"];
    //推荐好友
    export let RECOMMEND_FRIEND: [string, string] = [friend, "recommendFriend"];
    //获取关注分页
    export let FOCUS_PAGING: [string, string] = [friend, "getFriendsInfo"];
    //搜索已有好友
    export let QUERY_FOCUS_FRIEND: [string, string] = [friend, "queryFocusFriend"];
    //获取粉丝分页
    export let FANS_PAGING: [string, string] = [friend, "getAllFansInfo"];
    //关注某人
    export let GUANZHU: [string, string] = [friend, "focusFriend"];
    export let ADDFRIEND: [string, string] = [friend, "toBeFriends"];
    //取消关注
    export let QUXIAOGUANZHU: [string, string] = [friend, "cancelFocus"];
    //查询好用户
    export let CHAXUNYONGHU: [string, string] = [friend, "queryPlayer"];
    //访问好友家园
    export let VISIT_FRIEND: [string, string] = [user, "visitFriend"];
    //单次软性提示
    export let SOFT_LED_INFO: [string, string] = [user, "incrSoftLedCount"];

    export let POLLING: [string, string] = [poll, "polling"];

    export let REDPOLLING: [string, string] = [poll, "redDot"];

    export let CASHIERGET: [string, string] = [market, "collectIncome"];

    //卖家具
    export let SALE_FUTURE: [string, string] = [warehouse, "itemDestroy"];

    //购买家具等商品
    export let buyCommodity: [string, string] = [warehouse, "shopping"];

    /**
     微信好友邀请活动
     **/
    //获取好友邀请活动数据
    export let GET_INVITE_INFO: [string, string] = [invite, "getInviteRewards"];
    //领取奖励
    export let GET_INVITE_AWARD: [string, string] = [invite, "receiveAward"];
    export let INVITED_FRIEND: [string, string] = [invite, "invited"]; //邀请好友

    export let getFriendRecruitInfo: [string, string] = [friendRecruit, "getFriendRecruitInfo"];
    export let recruitStaff: [string, string] = [friendRecruit, "recruitStaff"];
    export let sendMessage: [string, string] = [friendRecruit, "sendMessage"];
    export let getRecruitInfo: [string, string] = [staff, "getRecruitInfo"];
    export let openRecruit: [string, string] = [staff, "openRecruit"];
    export let recruit: [string, string] = [staff, "recruit"];
    export let diamondRecruit: [string, string] = [staff, "diamondRecruit"];
    export let chooseStaff: [string, string] = [staff, "chooseStaff"];
    export let showStaffRates: [string, string] = [staff, "showStaffRates"];
    export let mustGetRecruit: [string, string] = [staff, "diamondMustRecruit"];

    export let extendCapacity: [string, string] = [staff, "extendCapacity"];
    export let dismissStaff: [string, string] = [staff, "dismissStaff"];
    export let giftGive: [string, string] = [staff, "staffFeed"];
    export let trainStaff: [string, string] = [staff, "trainStaff"];
    export let lvUp: [string, string] = [staff, "lvUp"];

    /* 岗位相关 */
    export let work: [string, string] = [post, "work"];
    export let downWork: [string, string] = [post, "downWork"];
    export let workOneKey: [string, string] = [post, "workOneKey"];
    export let seeNewPos: [string, string] = [post, "seeNewPos"];

    export let exchangeUseGoldMoon: [string, string] = [staff, "exchangeUseGoldMoon"];

    //购买货物
    export let buyGoods: [string, string] = [warehouse, "purchase"];

    /**
     * map
     */
    export let CHANGEALLFLOOR: [string, string] = [market, "floorChangeOneKey"];
    export let EXPAND: [string, string] = [market, "startExArea"];  //扩建
    export let END_EXPAND: [string, string] = [market, "endExArea"];
    export let RESET_EXPAND_TIME: [string, string] = [market, "resetExtendTime"];
    export let UP_MARK_SIGNBOARD: [string, string] = [market, "upgradeSignboard"];

    /**
     * 订单
     */
    export let SUBMIT_ORDER: [string, string] = [order, "completeOrder"];
    export let DELETE_ORDER: [string, string] = [order, "deleteOrder"];
    export let GET_ORDER: [string, string] = [order, "getOrderInfo"];

    /**
     * 促销
     */
    export let PROMOTION: [string, string] = [user, "findCurrentPromote"];

    /**
     * 进货
     */
    export let GET_ADD_REPELENISH: [string, string] = [replenish, "addReplenish"];
    export let GET_ALL_REPLENISH_ITEMS: [string, string] = [replenish, "getAllReplenishItems"];
    export let TAKE_GOODS_FROM_REPLENISH: [string, string] = [replenish, "takeGoodsFromReplenish"];
    export let GET_RECENT_FEATS: [string, string] = [replenish, "getRecentFeats"]; //最近进货
    export let SPEED_REPLENISH: [string, string] = [replenish, "speedReplenish"];
    export let REFRESH_COMPANY: [string, string] = [replenish, "refreshCompanyTags"];
    export let EXPAND_REPLENISH: [string, string] = [replenish, "expandReplenish"];
    export let GOODS_DISPLAYSTOCK: [string, string] = [replenish, "setDisplayStock"];//进货库存状态

    /**
     * 家具升级
     */
    export let CASE_LEVELUP: [string, string] = [market, "shelfUpLv"];
    export let SPEEND_DUILIE_DIA: [string, string] = [market, "addSpeedByDiamond"];
    export let SPEEND_DUILIE_ITEM: [string, string] = [market, "addSpeedByItem"];

    export let PREVIEW_BUY: [string, string] = [market, "buyAndDecorate"];
    export let SALEVALUEDETAIL: [string, string] = [market, "saleValueDetail"];

    //股票分红
    export let SHOW_STOCK_DETAIL: [string, string] = [poll, "showStockDetail"];
    export let DRAW_STOCK: [string, string] = [poll, "drawStock"];

    export let ONE_SET: [string, string] = [warehouse, "exchangeOneKey"];


    //显示店铺信息
    export let SHOW_BATTLE_INFO: [string, string] = [market, "showMarketBattleInfo"];
    export let MARKET_BATTLE: [string, string] = [market, "marketBattle"];

    //长途订单
    export let LONG_ORDER_INFO: [string, string] = [longOrder, "getLongOrderInfo"]; // 订单基础信息
    export let LONG_ORDER_COMMIT: [string, string] = [longOrder, "commitGoods"]; //提交货物
    export let LONG_ORDER_RECEIVE: [string, string] = [longOrder, "recieveReward"]; //领取订单奖励
    export let LONG_ORDER_ADDSPEED: [string, string] = [longOrder, "addSpeed"]; //加速订单
    export let LONG_ORDER_REFUSEORDER: [string, string] = [longOrder, "refreshOrder"]; //刷新订单

    //获取股票数量信息
    export let GET_STOCK_NUM: [string, string] = [poll, "getStockNumber"];

    //危机、事件
    export let INCIDENT_DETAIL: [string, string] = [incident, "incidentDetail"];
    export let INCIDENT_SOLVE: [string, string] = [incident, "solveIncident"];
    export let INCIDENT_QUICK_SOLVE: [string, string] = [incident, "quickSolve"];
    export let INCIDENT_SEEK_HELP: [string, string] = [incident, "seekHelp"];
    export let INCIDENT_HELP: [string, string] = [incident, "help"];
    export let INCIDENT_CLEANFATIGUE: [string, string] = [staff, "clearFatigued"];

    //自选宝箱
    export let OPEN_CANCHOOSE_BOX: [string, string] = [warehouse, "useOptionalTreasureBox"];

    //看广告奖励次数
    export let ADVER_AWARD_COUNTS: [string, string] = [ad, "advertInfo"];

    //协助
    export let ASSIST_DETAIL: [string, string] = [assistance, "assistanceDetail"];
    export let ASSIST_ASSISTANCEINFO: [string, string] = [assistance, "assistanceInfo"];

    export let ASSIST_HANDLE: [string, string] = [assistance, "assistance"];
    export let ASSIST_QUICKRECOVER: [string, string] = [assistance, "quickRecovery"];
    export let ASSIST_MEMBER: [string, string] = [assistance, "viewMembers"];
    export let ASSIST_RANK: [string, string] = [assistance, "viewRank"];
    export let ASSIST_ENTRANCE: [string, string] = [assistance, "entrance"];
    export let ASSIST_REWARD: [string, string] = [assistance, "receiveReward"];

    /**
     超级店长
     **/
    //晋升
    export let UPGRADE_POSITION: [string, string] = [grading, "upgrade"];
    //获取任务进度
    export let GET_POSITION_INFO: [string, string] = [grading, "getGrading"];

    //旅游巴士
    export let TOUR_OPEN_FUNCTION: [string, string] = [tour, "setBusOpen"]; //确认开启巴士功能
    export let TOUR_RECEPTION: [string, string] = [tour, "reception"]; //接待游客(int station)
    export let TOUR_VISITOR_RECEPTION: [string, string] = [tour, "visitorReception"]; //帮助好友接待游客(long visitorId, int station)
    export let TOUR_GET_HISTORIES: [string, string] = [tour, "getHistories"]; //好友帮助历史(int market)
    export let TOUR_GET_BUSES: [string, string] = [tour, "getTourBuses"]; //刷新巴士游客()

    //好感度
    export let ADD_FAVOR_EXP: [string, string] = [staff, "addFavorExp"];
    export let BREAKTHROUGH: [string, string] = [staff, "breakthrough"];

    export let HOUSE_USE_ITEM: [string, string] = [warehouse, "useItem"];
    export let OPEN_BOX: [string, string] = [warehouse, "useTreasureBox"];

    //设置
    export let SET_INFO: [string, string] = [setting, "getSettingsInfo"];   //个人信息
    export let FEEDBACK_SERVICE: [string, string] = [setting, "feedback"];  //反馈
    export let CHANGE_SIGNATURE: [string, string] = [setting, "updateSignature"];//修改签名
    export let CDK_SERVICE: [string, string] = [user, "useCDkey"];//cdk
    export let SET_SETTING: [string, string] = [setting, "setSettings"];//音效/性能设置
    export let FANS_INFO: [string, string] = [friend, "getFansInfo"];//粉丝一览
    export let SEARCH_FAN: [string, string] = [friend, "queryFansFriend"];//粉丝搜索
    export let UPDATE_FRIEND_FRAME: [string, string] = [setting, "updateFriendFrame"];//更换好友框
    export let FRAME_REDPOINT: [string, string] = [setting, "seeFriendFrames"];//好友框红点
    export let REVISE_NAME: [string, string] = [wechat, "rename"];//改名
    //宝宝特质
    export let SPECIAL_INFO: [string, string] = [staff, "changeSpecial"];//粉丝搜索

    export let OPEN_BRANCH_MARKET: [string, string] = [market, "openNewMarket"]; //开分店的接口

    //社区活动商店
    export let AREADY_BUY_GOODS: [string, string] = [warehouse, "getShopInfo"];  //已经购买的商品信息
    export let ACTIVE_SHOP: [string, string] = [activity, "getActivityStore"];  //显示商店物品
    export let ACTIVE_SHOPEXCHANGE: [string, string] = [activity, "activityStorePurchase"];  //兑换物品
    export let DRAW_RECHARGE_ACTIVITY: [string, string] = [activity, "drawRechargeActivity"];
    //积分达标
    export let GET_GOAL_INFO: [string, string] = [activity, "getActivityGoalInfo"];  //获取活动目标信息
    export let REC_GOAL_REW: [string, string] = [activity, "recievedGoalReward"];  //领取奖励，，参数表示配置表ID

    export let SHOW_ACIVITE_INFO: [string, string] = [activity, "showActivityInfo"];   //展示活动界面
    export let OPEN_ACTIVITY_INFO: [string, string] = [activity, "openActivityInfo"];  //打开活动详情
    export let BUY_DIAMOND_DGUFT: [string, string] = [activity, "buyGift"];    //购买晶石礼包
    export let ACTIVE_SHOW_RECHARGE: [string, string] = [activity, "showRechargeActivity"];   //充值面板
    export let ACTIVE_DRAW_RECHARGE: [string, string] = [activity, "drawRechargeActivity"];   //领奖

    export let RECHARGE: [string, string] = [pay, "recharge"];    //充值
    export let BUYGUFT: [string, string] = [pay, "buyGift"];    //购买礼包
    export let BUYVIP: [string, string] = [pay, "buyVip"];    //开通Vip

    export let BUBBLE_COLLECT: [string, string] = [market, "bubbleCollect"];//场景人物头顶气泡
    export let GET_CHEST: [string, string] = [market, "pickExRewards"];

    export let OPEN_MARKE_FOR_NEW: [string, string] = [market, "openDecoBag"];
    export let EDIT_MARKET_NAME: [string, string] = [market, "editMarketName"]; //修改店铺名

    //微信登陆接口
    export let WX_GETUSER: [string, string] = [wechat, "bindUserInfo"]; //绑定用户
    export let CHOSE_STAFF: [string, string] = [wechat, "chooseStaff"]; //选择宝宝
    export let VIP_DRAW: [string, string] = [wechatVip, "draw"];    //领取Vip奖励


    export let SEE_ADVERT: [string, string] = [ad, "seeAdvert"]; //领取
    export let ADVER_INFO: [string, string] = [ad, "advertInfo"]; //获取广告活动

    export let POWER_GUIDE: [string, string] = [newGuide, "newGuide"]; //新手强制引导


    //扩建送礼物
    export let GET_STAFF_GIFT_INFO: [string, string] = [staffGift, "getStaffGiftInfo"]; //获取当前礼物信息
    export let START_FOR_RECEIVE: [string, string] = [staffGift, "startForReceive"]; //开始收获
    export let AXXELERATE: [string, string] = [staffGift, "accelerate"]; //加速
    export let STAFF_GIFT_RECEIVE: [string, string] = [staffGift, "receive"]; //收获
}
