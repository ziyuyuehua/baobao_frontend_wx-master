/*
 * @Author: tyq
 * @Date: 2019-01-09
 * @Desc:
 */


import {Emitter} from "../../Utils/event-kit";
import {State} from "../../CustomizedComponent/map/Role";
import {Pos} from "../../CustomizedComponent/map/MapInfo";
import {HashSet} from "../../Utils/dataStructures/HashSet";
import {TimeOutType} from "../../CustomizedComponent/staff/recruit/LeftTime";
import {JumpConst} from "../const/JumpConst";
import {IncidentModel} from "../../Model/incident/IncidentModel";
import {IBubbleInfo} from "../const/RedBubbleConst";
import {IPhoneState} from "../../Model/DataManager";
import {IOrderInfo} from "../../types/Response";

export namespace ClientEvents {
    export let emitter = new Emitter();
    //任务红点community
    export let EVENT_TASK_RED_DOT = emitter.createEvent<(msg: boolean) => void>();
    export let EVENT_COMMUNITY_RED = emitter.createEvent<(msg: boolean) => void>();
    export let SHOW_MOVIE_BUBBLE = emitter.createEvent<() => void>();

    export let STOP_SERVER_STATE = emitter.createEvent<(msg: string) => void>();
    //切换主UI
    export let EVENT_SWITCH_MAIN_UI = emitter.createEvent<(ble: boolean, type?: number) => void>();
    export let EVENT_REFUSE_STAFFGIFT = emitter.createEvent<() => void>();
    //刷新邮件列表
    export let EVENT_REFRESH_MAIL_LIST = emitter.createEvent<() => void>();
    //好友小红点
    export let EVENT_FRIENDS_RED_DOT = emitter.createEvent<() => void>();
    //好友搜索失败
    export let EVENT_SEARCH_FAILURE = emitter.createEvent<() => void>();
    //关注页面与搜索页面滑动视图相互影响
    export let EVENT_FOCUS_SLIDE = emitter.createEvent<(ble: boolean) => void>();
    //切换好友列表状态switch
    export let SWITCH_FRIENDS_STATE = emitter.createEvent<(ble: boolean) => void>();
    //切换好友列表状态switch
    export let SWITCH_FRIENDS_ITEM = emitter.createEvent<() => void>();
    //好友关注内容
    export let EVENT_FOCUS = emitter.createEvent<() => void>();
    //查看好友家具
    export let EVENT_SEE_FURNITURE = emitter.createEvent<(msg: any) => void>();
    //点击家具
    export let EVENT_ON_FURNITURE = emitter.createEvent<(msg: any) => void>();
    //加载推荐
    export let EVENT_LOAD_RECOMENDED = emitter.createEvent<() => void>();
    //取消关注
    export let EVENT_CANCEL_FOCUS = emitter.createEvent<(msg: any, cb: Function) => void>();
    //确定寄养
    export let EVENT_FOSTER_CARE_OK = emitter.createEvent<() => void>();
    //取消寄养弹窗
    export let EVENT_CANCEL_FOSTER_CARE = emitter.createEvent<() => void>();
    //获得员工经验
    export let EVENT_GAIN_STAFF_EXP = emitter.createEvent<(msg: any) => void>();
    //刷新员工列表
    export let EVENT_REFRESH_FOSTER_CARE_LIST = emitter.createEvent<() => void>();
    //add搜出的好友
    export let EVENT_ADD_FRIEND = emitter.createEvent<() => void>();
    //刷行关注列表
    export let REFRESH_FOCUS_LIST = emitter.createEvent<() => void>();
    //签到连续奖励状态
    export let SIGNIN_CONTINUOUS = emitter.createEvent<(idx: number, rew: string) => void>();
    //领取任务奖励
    export let EVENT_TASK_GRT_PRIZE = emitter.createEvent<(msg: any) => void>();
    //刷新任务列表
    export let EVENT_TASK_REFRESH_LIST = emitter.createEvent<(mag: any) => void>();
    //关闭右侧菜单
    export let EVENT_SHUT_DOWN_RIGHT_MENU = emitter.createEvent<(ble: boolean) => void>();
    //任务页签红点
    export let EVENT_TASK_TAB_RED_DOT = emitter.createEvent<(str: string, ble: boolean) => void>();
    //弹出金币兑换
    export let EVENT_POPUP_GOLD_EXCHANGE = emitter.createEvent<() => void>();
    //弹出钻石兑换
    export let EVENT_POPUP_DIAMOND_EXCHANGE = emitter.createEvent<(idx?:number) => void>();
    export let CLOSE_SHOP_DETAIL = emitter.createEvent<() => void>();

    export let CLOSE_TASK_VIEW = emitter.createEvent<() => void>();

    export let CLOSE_WELFARE_VIEW = emitter.createEvent<() => void>();
    //功能解锁
    export let EVENT_FUNCTION_OPEN = emitter.createEvent<() => void>();
    //刷新每小时收益
    export let EVENT_REFRESH_EARNINGS = emitter.createEvent<(msg: number) => void>();
    //设置Mui_TOP层级
    export let EVENT_SWITCH_MUI_ZINDEX = emitter.createEvent<(msg: boolean) => void>();
    //打开mainuitopMAsk
    export let SHOW_TOP_MASK = emitter.createEvent<(ble: boolean) => void>();

    //打开充值界面
    export let SHOW_DIAMOND_EXCHANGE_VIEW = emitter.createEvent<() => void>();

    //关闭员工和更多弹板mask
    export let HIDE_STAFF_MASK = emitter.createEvent<() => void>();
    //切换到好友家
    export let EVENT_HIDE_UI = emitter.createEvent<(msg: boolean) => void>();
    //装修时MuiTOp状态
    export let SWITCH_DECORATE = emitter.createEvent<(msg: boolean) => void>();
    //返回自己家
    export let GO_HOME = emitter.createEvent<(ble: boolean) => void>();
    //刷新界面数据的消息
    export let EVENT_REFRESH_GOLD = emitter.createEvent<() => void>();
    //刷新主页面主线任务内容
    export let EVENT_REFRESH_MAIN_UI_TASK = emitter.createEvent<() => void>();
    //升级动画开关
    export let LV_UP_ANIM = emitter.createEvent<(ble: boolean) => void>();
    //店铺扩建等级更新upExpansionLv
    export let UP_EXPANSION_LV = emitter.createEvent<() => void>();
    //岗位空闲红点
    export let STAFF_JOBS_RED = emitter.createEvent<(ble: boolean[]) => void>();
    //好友家操作刷新
    export let OPERATE_FRIENDs_HOME = emitter.createEvent<() => void>();
    export let ADD_ITEM_TO_MAP = emitter.createEvent<(xmlData: IDecoShopJson, type: string) => void>();
    export let BACK_TO_MINI_WARE = emitter.createEvent<(xmlData: IDecoShopJson, count: number) => void>();
    export let HANDLE_FRIENDS_HOME = emitter.createEvent<(idx: number) => void>();//处理好友家园事件
    export let HANDLE_SINGLE_FRIENDS = emitter.createEvent<(idx: number) => void>();//更新单个好友Item
    export let UP_GOLD_EXCHANGE = emitter.createEvent<() => void>();//后端报错更新金币兑换
    export let UP_INCENTIVE_NUM = emitter.createEvent<() => void>();//UP激励次数
    export let UP_POWER_GUIDE = emitter.createEvent<(idx: number) => void>();//新手

    /**
     *
     * 商城部分的消息
     */
    export let EVENT_CLOSE_DETAIL_TIPS = emitter.createEvent<() => void>();
    export let EVENT_OPEN_STAFF = emitter.createEvent<(msg: string) => void>();

    /**
     * 货物
     */
    export let EVENT_OPEN_GOODS = emitter.createEvent<(msg: number) => void>();  //打开货物界面
    export let SHOW_STAFF_DETAIL = emitter.createEvent<(id: number) => void>();  //上阵界面显示详情
    export let UPDATE_ACCELERATE_TIME = emitter.createEvent<() => void>(); //更新加速界面的时间

    /**
     * 公告
     */
    export let OPEN_ACTIVATEIN_INFO_VIEW = emitter.createEvent<(id: number, ble?: boolean) => void>();  //打开货物界面
    export let CLOSE_ANNOUNEC_VIEW = emitter.createEvent<() => void>();

    /**
     * 最终版本的scrollview接收的消息
     */
    export let EVENT_SCROLLVIEW_LOADITEM = emitter.createEvent<(showPrefab: cc.Prefab, count: number, target: string) => void>();
    export let EVENT_REFRESH_FINALLY_SCROLLVIEW = emitter.createEvent<(showPrefab: cc.Prefab, count: number, target: string) => void>();
    //触发scrollview垂直跳到index处
    export let EVENT_SCROLLVIEW_SCROLL_TO_INDEX = emitter.createEvent<(index: number) => void>();

    /**
     * 进货的消息
     */
    export let EVENT_REFRESH_GOODSITEM = emitter.createEvent<(index: number, item: cc.Node) => void>();

    export let STAFF_EXCHANGE_SELECTED = emitter.createEvent<(index: number, hasStaff: boolean) => void>();
    export let STAFF_EXCHANGE_UNSELECTED = emitter.createEvent<(index: number) => void>();

    export let STAFF_ITEM_DISMISS_SELECTED = emitter.createEvent<(selected: boolean, index: number) => void>();
    export let STAFF_ITEM_NORMAL_SELECTED = emitter.createEvent<(index: number, isSelf: boolean) => void>();
    export let STAFF_ITEM_NORMAL_UNSELECTED = emitter.createEvent<(index: number) => void>();
    //StaffItem点击后判断是否触发上下岗
    export let STAFF_ITEM_JOB_SELECTED = emitter.createEvent<(staffId: number) => void>();

    export let STAFF_JOB_ITEM_SELECT = emitter.createEvent<(staffId: number) => void>();
    export let STAFF_JOB_WORK_ONE_KEY = emitter.createEvent<(isAll: boolean, advantages: Array<number>) => void>();
    export let ADD_SOFT = emitter.createEvent<() => void>();
    export let CLEAN_SOFT = emitter.createEvent<() => void>();
    export let STAFF_SORT_CONFIRM = emitter.createEvent<() => void>();

    export let STAFF_SORT_AGAIN = emitter.createEvent<() => void>();

    export let CLEAN_SOFT_LEAD = emitter.createEvent<() => void>();
    export let UPDATE_POP = emitter.createEvent<() => void>();

    export let STAFF_DISMISS_CONFIRM = emitter.createEvent<() => void>();
    export let STAFF_SHOW_DETAIL = emitter.createEvent<(staffId: number) => void>();

    export let STAFF_FOSTER_CARE = emitter.createEvent<() => void>();

    //岗位软引导——指向员工
    export let POSTS_GUIDE_STAFF = emitter.createEvent<(staffIndex: number) => void>();
    //岗位软引导——返回店铺
    export let POSTS_GUIDE_BACK = emitter.createEvent<() => void>();

    //员工池容量更新
    export let STAFF_UPDATE_CAPACITY = emitter.createEvent<() => void>();
    //员工更新（例如经验增加、等级增加、属性变化）事件，传递HashSet的staffIds是因为未来可能有多个员工同时更新
    export let STAFF_UPDATE_STAFF = emitter.createEvent<(staffIds: HashSet<number>) => void>();
    //兑换员工更新已拥有状态
    export let RECRUIT_UPDATE_EXCHANGE_STAFF = emitter.createEvent<(staffIndex: number) => void>();
    //剩余时间到期触发事件
    export let LEFT_TIME_OUT = emitter.createEvent<(timeOutType: TimeOutType) => void>();

    //背包更新事件
    export let WAREHOUSE_UPDATE_WAREHOUSE = emitter.createEvent<() => void>();

    export let MOVE_CLOSE_BTN = emitter.createEvent<() => void>();
    export let UPDATE_TASK_BTN = emitter.createEvent<() => void>();
    export let SHOW_SOFT_GUIDE = emitter.createEvent<(data: ISoftGuideJson) => void>();
    export let HIDE_MAIN_SOFT_GUIDE = emitter.createEvent<() => void>();

    export let UPDATE_SURE_BTN = emitter.createEvent<() => void>();
    export let CHOOSE_THIS_AWARD = emitter.createEvent<() => void>();

    //钻石招募刷新招募面板的用券招募数字
    export let RECRUIT_REFRESH_TYPE_LABELS = emitter.createEvent<(recruited: boolean) => void>();
    //金币招募
    export let GOLD_RECRUIT = emitter.createEvent<() => void>();

    export let MAP_CUSTOMER_GO_CASH = emitter.createEvent<() => void>();

    export let MAP_CUSTOMER_ENTER_MARKET = emitter.createEvent<() => void>();
    export let MAP_CUSTOMER_EXIT_MARKET = emitter.createEvent<() => void>();

    //地图人物上岗——冒烟动画
    export let MAP_ROLE_UP_WORK = emitter.createEvent<(staffIds: number[]) => void>();
    //地图人物升级——等级上升动画
    export let MAP_ROLE_LV_UP = emitter.createEvent<(staffIds: number[]) => void>();

    export let MAP_ROLE_CHANGE_STATE = emitter.createEvent<(staffId: number, state: State, mapPos: Pos, arrivedState: State) => void>();
    //地图内的数据（包括装饰物等）初始化完毕后，可以初始化地图A星行走范围和员工初始位置
    export let MAP_INIT_FINISHED = emitter.createEvent<(isInit: boolean) => void>();
    //顾客前往maoPos地图坐标购买面向direction作出购买动作购买东西
    // export let MAP_CUSTOMER_BUY_GOODS = emitter.createEvent<(mapPos: Pos, direction: Direction, cashPos: Pos, cashDirection: Direction) => void>("MAP_CUSTOMER_BUY_GOODS");

    //清除地图人物
    export let MAP_CLEAR_PEOPLE = emitter.createEvent<() => void>();
    //刷新重新生成地图人物
    export let MAP_REFRESH_PEOPLE = emitter.createEvent<() => void>();
    //地图人物加速
    export let MAP_PEOPLE_SPEED = emitter.createEvent<(rate: number) => void>();
    export let MAP_PEOPLE_SPEED_SHOW = emitter.createEvent<() => void>();
    export let MAP_PEOPLE_SPEED_HIDE = emitter.createEvent<() => void>();

    //地图保存
    export let SAVE_MAP = emitter.createEvent<(cb: Function, isNormal: boolean, errCb?: Function, timeOutCb?: Function) => void>();
    export let EXPAND_REFRESH = emitter.createEvent<() => void>();
    /**
     * 装潢模式
     */
    export let EVENT_FLOORMODE = emitter.createEvent<() => void>();
    export let EVENT_LEAVE_FLOORMODE = emitter.createEvent<() => void>();

    export let EVENT_HIDE_MAIN_UI_TOP = emitter.createEvent<(ble: boolean) => void>();
    export let EVENT_HIDE_FRIEND_UI_TOP = emitter.createEvent<(ble: boolean) => void>();
    export let EVENT_SHOW_MAIN_UI_TOP_SHADOW = emitter.createEvent<(ble: boolean) => void>();
    export let EVENT_HIDE_UI_TOP = emitter.createEvent<(ble: boolean) => void>();
    //请求跳转打开UI事件
    export let EVENT_OPEN_UI = emitter.createEvent<(uiName: JumpConst, msg?: any, isLock?: boolean) => void>();
    /**
     * 订单
     */

    export let EVENT_REFRESH_ORDERDETAIL = emitter.createEvent<(msg) => void>();

    export let OPEN_EXPAND_MARKET = emitter.createEvent<(isOpen: boolean) => void>();


    //红点
    export let UPDATE_MAINUI_RED = emitter.createEvent<(msg: number[]) => void>();
    export let UPDATE_COMMUNITY_PRO = emitter.createEvent<() => void>();  //更新协助进度条
    export let HIDE_MAINUI_ARR = emitter.createEvent<(state?: boolean) => void>();
    export let HIDE_MAINUI_RED = emitter.createEvent<() => void>();

    export let UPDATE_MAINUI_RED_GONG = emitter.createEvent<(msg: any) => void>();
    export let UPDATE_MAINUI_STAFF_RED = emitter.createEvent<() => void>();

    // export let OPEN_SETTING_VIEW = emitter.createEvent<(openType) => void>();

    /**
     * 镜头矫正
     */
    export let EVENT_RESET_VIEW = emitter.createEvent<(position: cc.Vec2, cb?: Function, duraction?: number) => void>();

    /**
     * 迷你仓库红点
     */
    export let REFRESH_MINIWAREHOUSE = emitter.createEvent<() => void>();
    /**
     * 隐藏跟显示的特效
     */
    export let EVENT_HIDE_TASKNODE = emitter.createEvent<() => void>();
    export let EVENT_SHOW_TASKNODE = emitter.createEvent<() => void>();
    export let EVENT_SHOW_MENUS = emitter.createEvent<() => void>();
    export let EVENT_HIDE_MENUS = emitter.createEvent<() => void>();
    export let EVENT_GRAY_BTN = emitter.createEvent<(name: string, state: boolean) => void>();

    //加载item的选项
    export let EVENT_SHOW_CHOOSEITEMDO = emitter.createEvent<(itemType: string, script: any, itemState: number, xmlData: IDecoShopJson, grayCb: Function, isAdd?: boolean) => void>();

    /**
     * 轮询刷新
     */

        //修改地图状态
    export let UDPATE_MAIN_ARRAW_STATE = emitter.createEvent<() => void>();

    export let HIDE_TIP_REND = emitter.createEvent<() => void>();
    export let EVENT_CLEAR_TOUCHES = emitter.createEvent<() => void>();
    export let LOAD_BIG_HOUSE = emitter.createEvent<() => void>();

    //新进货
    export let EVENT_GOODS_CLOSE_DRAG = emitter.createEvent<() => void>();
    export let EVEMT_GOODS_QUEUE = emitter.createEvent<() => void>();  //更新进货计划界面的进货队列
    export let EVENT_UPDATE_MAIN_NUM = emitter.createEvent<(msg) => void>();  //刷新主界面可收获多少
    export let EVENT_SEND_GOODS = emitter.createEvent<() => void>();  //刷新主界面
    export let EVENT_GOODS_DETAIL_UPDATE = emitter.createEvent<(msg) => void>();  //货物详情界面刷新
    export let EVENT_SET_GOODS_ZINDX = emitter.createEvent<(msg) => void>();  //设置层级

    export let EVENT_GOODS_CHOSE_ANIMAT = emitter.createEvent<() => void>();  //主界面动画
    export let EVENT_GOODS_CHOSE_ITEM_ANIMAT = emitter.createEvent<() => void>();  //主界面item动画
    export let EVENT_CHOSE_GOODS_NO_MOVE = emitter.createEvent<() => void>();  //选择货物界面不移动
    export let EVENT_UPDATE_WAITGOODS = emitter.createEvent<() => void>();  //刷新进货收缩状态
    export let EVENT_GOODS_TIME_SECOND = emitter.createEvent<() => void>();  //更新进货时间
    export let REFRESH_GOODSGUIDE_COMPLETE = emitter.createEvent<() => void>();

    export let EVENT_REFUSE_ORDER_PANEL = emitter.createEvent<(carIndex: number) => void>();
    export let EVENT_LONG_ORDER_SHAKE_CAR = emitter.createEvent<(carIndex: number) => void>();

    export let CHOSE_BAOBAO = emitter.createEvent<(data: IBeginChosenJson) => void>();

    export let EVENT_REFRESH_STOCK = emitter.createEvent<(isRefresh: boolean) => void>();   //刷新库存显示
    export let EVENT_REFRESH_ONEKEY = emitter.createEvent<() => void>();   //刷新一键领取按钮状态
    export let EVENT_ONEKEY_ANIMATION = emitter.createEvent<(msg) => void>();//一键领取动画
    export let EVENT_GOODS_SPEED = emitter.createEvent<(msg) => void>();//打开货物加速气泡
    export let EVENT_GOODS_CLOSE_SPEED = emitter.createEvent<() => void>();//关闭加速气泡
    export let EVENT_GOODS_RANDOM = emitter.createEvent<(num: number, isShow: boolean) => void>();//随机播放动画
    export let EVENT_GOODS_SPEEDITEM = emitter.createEvent<(msg) => void>();//刷新item
    export let EVENT_GOODS_ITEMSCALE = emitter.createEvent<() => void>();//刷新进货item
    export let EVENT_GOODS_EXPANSION = emitter.createEvent<(isShow?: boolean) => void>();//扩充队列刷新
    export let EVENT_GOODS_ANINODE = emitter.createEvent<() => void>();//动画node
    export let EVENT_GOODS_GUIDE = emitter.createEvent<(isShow?: boolean) => void>();//进货软引
    export let EVENT_ADDQUEUE_GUIDE = emitter.createEvent<() => void>();//进货扩充队列软引
    export let EVENT_DESTORY_GUIDE = emitter.createEvent<() => void>();//销毁进货队列
    export let EVENT_GOODS_ARROW = emitter.createEvent<() => void>();
    export let EVENT_POWER_ARROW = emitter.createEvent<() => void>();
    export let EVENT_HIDE_POWER_ARROW = emitter.createEvent<() => void>();
    export let EVENT_FOUR_GUIDE = emitter.createEvent<() => void>();
    export let EVENT_HIDE_FOUR_GUIDE = emitter.createEvent<() => void>();
    export let REFRESH_GUIDE_CLOSE = emitter.createEvent<() => void>();

    //危机相关
    export let INCIDENT_GUIDE = emitter.createEvent<(staffId: number, jumpId: number) => void>();   //危机小人引导箭头
    export let INCIDENT_ADD = emitter.createEvent<(incident: IncidentModel) => void>();   //新增危机
    export let INCIDENT_DELETE = emitter.createEvent<(ids: number[]) => void>();   //删除危机

    export let INCIDENT_ASSISTRECOVERYYIME = emitter.createEvent<() => void>();   //协助恢复

    export let INCIDENT_HELPCALLBACK = emitter.createEvent<() => void>(); //好友求助返回
    export let INCIDENT_CLEANFATIGUECALLBACK = emitter.createEvent<() => void>();//清理疲劳
    export let PLAY_INCIDENT_UP_STAFF = emitter.createEvent<() => void>();    //播放员工up
    export let CRISIS_ANI_END_UPDATE = emitter.createEvent<() => void>();      //危机动画播放完之后

    export let INCIDENT_REFRESHVIEW = emitter.createEvent<(type: number) => void>();


    export let INCIDENT_ASSISTRECOVERYYIMEHANDLE = emitter.createEvent<() => void>();   //协助恢复

    //export let INCIDENT_FRIENDHOMEHELP = emitter.createEvent<() => void>("INCIDENT_FRIENDHOMEHELP");   //协助恢复

    export let TOUR_OPEN_BUS = emitter.createEvent<() => void>();   //确定开启巴士功能
    export let TOUR_NEW_BUS = emitter.createEvent<(isFriend: boolean, isTimeout: boolean) => void>();   //倒计时到期有新巴士过来
    export let TOUR_REMOVE_OLD_BUS = emitter.createEvent<() => void>();   //倒计时到期有新巴士过来，移除顶掉之前旧的大巴
    export let TOUR_ADD_BUS_CUSTOMER = emitter.createEvent<(customerNum: number) => void>(); //接待巴士后下来游客顾客

    //好感
    export let UPDATE_FAVOR_VIEW = emitter.createEvent<() => void>();  //刷新好感度界面
    export let PLAY_FAVORABLITY_ANi = emitter.createEvent<(response, id?: number) => void>();  //播放好感度动画
    export let FAVOR_ARROW = emitter.createEvent<(isGuide: boolean) => void>();  //好感软引

    //退货
    export let GOODS_RETURN = emitter.createEvent<(index: number) => void>();//退货界面显示
    export let GOOS_REFRESHNUM = emitter.createEvent<() => void>();//退货后货物数量显示
    //扩容
    export let GOODS_REFRESHWAREHOUSE = emitter.createEvent<() => void>();//扩容后重新读取容量
    export let GOODS_REDPOINT = emitter.createEvent<(isEnough: boolean) => void>();//扩容红点
    export let GOODS_REFRESHBUTTON = emitter.createEvent<() => void>()//扩容按钮
    //背包
    export let CHOSE_FILITER_VIEW = emitter.createEvent<(itemType) => void>();    //关闭筛选
    export let UPDATE_ITEM_HOUSE = emitter.createEvent<() => void>();    //关闭筛选

    export let UPDATE_STAFF_ATT = emitter.createEvent<(msg) => void>();    //刷新员工属性
    export let UPDATE_STAFF_EXP = emitter.createEvent<(msg) => void>();    //刷新员工经验
    export let RESET_STAFF_EXP = emitter.createEvent<() => void>();     //重置员工进度条
    export let UPDATE_STAFF = emitter.createEvent<(msg) => void>();    //刷新员工经验
    export let ClOSE_STAFF_LEVEL_VIEW = emitter.createEvent<() => void>();  //关闭员工升级界面

    //寄养
    export let REFRESH_FOSTERCARE = emitter.createEvent<() => void>();//刷新寄养列表
    export let UPDATE_SHOP_VIEW = emitter.createEvent<() => void>();    //刷新商店
    export let CLOSE_REWARD = emitter.createEvent<() => void>();    //刷新商店
    export let REFRESH_FOSTERLIST = emitter.createEvent<() => void>();//动画刷新寄养列表
    export let SHOW_BACK_SOFT = emitter.createEvent<() => void>();    //显示返回软引
    export let GUIDE_CLICK = emitter.createEvent<() => void>();
    export let HIDE_FAVOR_STAR = emitter.createEvent<() => void>();    //显示返回软引
    export let REFRESH_FOSTER_SCROLL = emitter.createEvent<() => void>();

    export let UPDATE_STAFF_ITEM = emitter.createEvent<() => void>();    //刷新item

    export let REFRESH_INVITE_VIEW = emitter.createEvent<(msg: any) => void>();    //刷新item

    //刷新banner播放状态
    export let UPDATE_BANNER_PLAY = emitter.createEvent<() => void>();

    export let SHOW_BACK_STAFF_SOFT = emitter.createEvent<() => void>();    //显示返回软引
    export let REFRESH_FOSTER_TIME = emitter.createEvent<() => void>();//刷新寄养时间
    export let REFRESH_SELECT = emitter.createEvent<(id: number) => void>();//刷新选中
    export let SELECT_CLICK = emitter.createEvent<(id: number, isDefault: boolean) => void>();//选中item
    export let UPDATE_STAFFLIST = emitter.createEvent<() => void>();//刷新员工列表
    export let FOSTER_ARROW = emitter.createEvent<(isGuide: boolean) => void>();//寄养软引

    export let SHOW_NEW_MARKET = emitter.createEvent<() => void>();//加载新地图完成
    export let LOAD_NEW_MARKET = emitter.createEvent<(marketId: number) => void>();//加载新地图

    export let UPDATE_RECHARGE_VIEW = emitter.createEvent<() => void>();    //刷新充值界面
    export let UPDATE_STAFF_VIEW = emitter.createEvent<() => void>();    //刷新员工界面
    export let UPDATE_RECHARGE_CHARGE = emitter.createEvent<(charge) => void>();    //刷新充值界面
    export let UPDATE_RECHARGE_ITEM = emitter.createEvent<() => void>();              //更新充值item
    export let SCROLL_TO_CHARGE = emitter.createEvent<() => void>();            //滑动到充值位置
    export let SCROLL_TO_CHARGE_VIP = emitter.createEvent<(VipId: number) => void>();            //滑动到指定Vip位置
    export let UPDATE_CHARGE_HEIGHT = emitter.createEvent<(height: number) => void>();    //更新充值档位的位置
    export let UPDATE_ADD_RECHARGE_ITEM = emitter.createEvent<() => void>();      //更新累充界面
    export let RESET_RECHARGE_ITEM_POS = emitter.createEvent<(msg) => void>();      //更新累充界面
    export let OPEN_WX_PAY = emitter.createEvent<() => void>();      //打开微信支付
    export let CLOSE_ADD_UP_VIEW = emitter.createEvent<() => void>();    //关闭充值界面
    export let UPDATE_UPTOP = emitter.createEvent<(index: number, height: number) => void>();
    export let UPDATE_RECHARGE_ITEM_VIEW = emitter.createEvent<(index: number) => void>();          //更新充值Item
    export let SHOW_RECHARGE_GIFT_VIEW = emitter.createEvent<() => void>();          //更新充值Item

    export let COMMUNITY_ACTIVE_SHOP = emitter.createEvent<() => void>();//刷新社区红点
    export let COMMUNITY_RANK_TIPS = emitter.createEvent<(index: number) => void>();//刷新社区排行tips
    //活动商店
    export let ACTIVESHOP_SHOPRESIDUAL = emitter.createEvent<() => void>();//刷新兑换次数
    export let ACTIVESHOP_REFRESHNUM = emitter.createEvent<(exCount: number) => void>();
    //积分达标
    export let REFRESH_INTEGRAL = emitter.createEvent<() => void>();//刷新积分界面

    export let REFRESH_COUNT_AND_VALUE = emitter.createEvent<() => void>();//刷新装修界面数值

    //店铺对决
    export let REFUSE_SHOP_CHOICE = emitter.createEvent<() => void>();//刷新店铺选择
    export let START_FIGHT = emitter.createEvent<() => void>();//刷新店铺选择
    export let CLOSE_FIGHT = emitter.createEvent<() => void>();//刷新店铺选择

    export let RESET_LIMIT_WARN = emitter.createEvent<() => void>();//重置拥挤状态限制图标
    export let HIDE_CHOOSE_ITEM = emitter.createEvent<() => void>();


    export let UPDATE_COMMUNITY_STATE = emitter.createEvent<() => void>();
    export let GOON_PLAY_ANIMATION = emitter.createEvent<() => void>();    //好感度继续播放动画

    //好友框
    export let REFRESH_SELECTED = emitter.createEvent<(id: number) => void>();//刷新选中状态
    export let FRAME_CLICK = emitter.createEvent<(id: number) => void>();

    export let RECHARGE_ITEN_MOVE = emitter.createEvent<(chageheight) => void>();    //充值item移动
    export let RECHARGE_MAIN_CONTENT_HEI = emitter.createEvent<() => void>();

    export let REFRESH_BIG_MAP_MISSION = emitter.createEvent<() => void>();

    export let PLAY_EXPAND_ANI = emitter.createEvent<(cb: Function) => void>(); //播放扩建动画

    export let LEVEL_UP_SHOW_BIG_MAP = emitter.createEvent<() => void>(); //打开大地图

    export let REFRESH_EXPAND_RED = emitter.createEvent<(result: boolean) => void>();
    export let REFRESH_DECORATE_RED = emitter.createEvent<(result: boolean) => void>();
    // export let NEW_NODE_HIDE_SHOW = emitter.createEvent<(active: boolean) => void>("NEW_NODE_HIDE_SHOW"); //showNew
    export let REFRESH_NEWSTATE = emitter.createEvent<() => void>();
    export let REFERSH_MINIWAREHOUSE_NEW = emitter.createEvent<() => void>();
    export let GO_FRIEND_HOME = emitter.createEvent<() => void>();
    export let BACK_HOME = emitter.createEvent<() => void>();
    export let SHOW_ORDER_BUBBLE = emitter.createEvent<(result: boolean) => void>();
    export let SHOW_SAVE_GUIDE = emitter.createEvent<() => void>();
    export let HIDE_SAVE_GUIDE = emitter.createEvent<() => void>();
    export let LONG_ORDER_CAR_GO = emitter.createEvent<(count: number) => void>();
    /**
     * 0为可领取
     * 1为可上货
     * 目前暂定为可领取显示优先级高于可上货
     */
    export let LONG_ORDER_BUBBLE = emitter.createEvent<(type: number, result: boolean) => void>();
    export let SHOW_LONG_ORDER_CAR = emitter.createEvent<() => void>();

    export let FRIENT_RECRUIT_REMOVE_BUBBLE = emitter.createEvent<() => void>();

    export let ACTIVE_BANNER = emitter.createEvent<() => void>();
    export let STOP_ACTIVITE_BANNER = emitter.createEvent<() => void>();

    //售卖目标
    export let SELLTASK_UNSELECTED = emitter.createEvent<(index: number) => void>();//未选中
    export let SELLTASK_SELECTED = emitter.createEvent<(index: number) => void>();//选中
    export let SELLTASK_COMPANYID = emitter.createEvent<() => void>();
    export let SELLTASK_REFRESHITEM = emitter.createEvent<() => void>();
    export let SELLTASK_REFRESHDATA = emitter.createEvent<() => void>();
    export let SELLTASK_REFRESHBANNER = emitter.createEvent<() => void>();

    export let SHOW_JUMP_ARROW = emitter.createEvent<(jumpId: JumpConst) => void>();
    export let HIDE_JUMP_ARROW = emitter.createEvent<() => void>();
    export let REFRESH_BIG_MAP_THING_DANGER = emitter.createEvent<() => void>();
    export let INIT_NEW_MAP = emitter.createEvent<() => void>();
    export let EDIT_MARKET_NAME = emitter.createEvent<() => void>();

    export let ADD_MAIN_UI_TOP = emitter.createEvent<() => void>();
    export let ADD_ACTIVE_MAIN = emitter.createEvent<() => void>();

    export let REFRESH_MAINUI_REDBUBBLE = emitter.createEvent<(msg: IBubbleInfo) => void>();
    export let CLOSE_INCIDNT_ANI = emitter.createEvent<() => void>();
    export let HIDE_MAINUI_REDBUBBLE = emitter.createEvent<() => void>();
    export let CLOSE_ADVAN_ITEM = emitter.createEvent<() => void>();
    export let EXPAND_WALL_PAPER = emitter.createEvent<() => void>();
    export let FOCUS_SAVE = emitter.createEvent<() => void>();
    export let REFRESH_POWER_GUIDE = emitter.createEvent<() => void>();
    export let CHANGE_PHONE_STATE = emitter.createEvent<(state: IPhoneState) => void>();
    export let TIP_CLOSE_SHOW_GUIDE = emitter.createEvent<() => void>();

    //后台切回
    export let SHOW_PLANE = emitter.createEvent<() => void>();
    export let CHANGE_ARR_BY_STATE = emitter.createEvent<(state: boolean) => void>();

    //昵称刷新
    export let REFRESH_NAME = emitter.createEvent<() => void>();
    //打开员工升级界面
    export let OPEN_STAFF_LEVEL = emitter.createEvent<() => void>();
    //打开好感度界面
    export let OPEN_FAVOR_DETAIL = emitter.createEvent<() => void>();

    export let SEND_MOUTH_PAY = emitter.createEvent<() => void>();
    export let SEND_JI_PAY = emitter.createEvent<() => void>();

    export let ORDER_CAR_RUN = emitter.createEvent<() => void>();
    export let UPDATE_ORDER_STATUS = emitter.createEvent<() => void>();
    export let REFRESH_NEWDAY_ORDER = emitter.createEvent<() => void>();
    export let OPEN_ORDER_STATUS = emitter.createEvent<(isLock: boolean) => void>();
    export let REFRESH_ORDER_BUBBLE = emitter.createEvent<(isCan: boolean) => void>();

    export let CLOSE_EXPAND_INTERVAL = emitter.createEvent<() => void>();


    export let GAME_SHOW = emitter.createEvent<() => void>();
    //扩建送礼
    export let STAFF_GIFF_UPDATE = emitter.createEvent<() => void>();
    export let HIDE_WAREHOUSE = emitter.createEvent<(isHIde: boolean) => void>();
    export let EXPAND_ENDING_TIME = emitter.createEvent<() => void>();
    export let DIALO_END_SEND = emitter.createEvent<() => void>();
    export let CLOSE_SHOP_GUIDE = emitter.createEvent<() => void>();
    export let CHANGE_SEE_TO_SHARE = emitter.createEvent<() => void>();
    export let SHOW_INCENTIVE_GUIDE = emitter.createEvent<() => void>();
    export let INSERT_FUTURE_TO_MAP = emitter.createEvent<(move: boolean) => void>();
    export let BUY_FUTURE_INSERT_FUTURE = emitter.createEvent<(isOpen: boolean, jumpId: number, isBuyFuture?: boolean, loadFuture?: Function) => void>();
    export let SET_SPECIAL_ID = emitter.createEvent<(id: number) => void>();
    export let ADD_STAFF_TO_MAP = emitter.createEvent<(staffIds: number[]) => void>();
}
