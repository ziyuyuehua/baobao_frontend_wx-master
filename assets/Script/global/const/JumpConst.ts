// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

export interface OpenShopItem {
    type: number,
    itemId: number
}

export enum JumpConst {

    MAIN = 0,                    //主界面
    MENGYUANEXCHANGE = 4,        //金币兑换
    SPAREXCHANGE = 5,            //钻石兑换
    SHOWINCENTIVEGUIDe = 7,      //显示促销引导

    DECORATIONVIEW = 10,         //装修界面
    DECORATIONFLOOR = 11,        //装修-地板/墙纸状态
    EXPANSIONVIEW = 12,          //扩建界面
    BILLBOARDVIEW = 13,          //广告牌界面
    DECORATE_DECORATE = 14,
    DECORATE_DISMANTLING = 15,   //拆解家具
    POPULARITY_UP = 16,          //升级广告牌界面
    EXPANDFRAMEANI = 17,         //功能解锁下的演绎跳转

    STAFFVIEW = 20,              //员工界面
    STAFFBIDVIEW = 21,           //员工告别界面
    STAFFLEVELVIEW = 22,         //员工升级界面(阵上等级最小的)
    STAFFLEVELVIEWNEAR = 23,     //员工升级界面(等级最接近的)

    STAFFPOSTVIEW = 30,          //员工岗位界面

    PURCHASEVIEW = 40,           //进货界面
    PURCHASEDUISTOCKVIEW = 42,   //进货界面(需要有软引导)
    ADDGOODSDUILIE = 44,         //增加进货队列

    RECRUITVIEW = 50,            //招募界面
    GOLDMONTHSHOP = 51,          //金月商店

    GOLD_RECRUIT = 52,           //金币招募
    DIAMOND_RECRUIT = 53,        //钻石招募

    DAILTASKVIEW = 61,           //日常任务界面
    TARGETTASKVIEW = 62,         //目标任务界面

    ANNOUNCEVIEW = 70,           //公告界面
    ANNOUNCEVIEWCUXIAO = 71,     //公告概率up界面

    SINGNVIEW = 80,              //签到界面

    EMAILVIEW = 90,              //邮箱

    FRIENDVIEW = 100,            //好友
    ADDFRIENDVIEW = 101,         //添加关注

    FOSTERVIEW = 110,            //寄养
    FRIEDNFOSTERVIEW = 111,      //好友寄养

    BAG = 121,                   //背包

    ITEMSHOPVIEW = 131,          //道具商店
    DECORATIONSHOPVIEW = 132,    //装饰商店
    JUMPSHOPITEM = 133,          //道具商店直接打开某个道具
    SHOPBOXVIEW = 134,           //宝箱商店

    LOGNGORDERVIEW = 141,        //长途货运
    TEST_ORDER_JUMP = 142,       //测试中的订单跳转
    LONG_ORDER_JUMP = 143,       //真长途订单跳转

    CRISISVIEW = 150,            //危机跳转（若场景上没有危机则提示暂时无危机可以处理）
    TASKCRISISVIEW = 151,        //任务危机跳转（若场景上没有危机则点击跳转之后需要根据玩家等级刷出一个危机）
    EVENTVIEW = 152,             //事件跳转（若场景上没有事件则提示暂时无事件可以处理）
    TASKEVENTVIEW = 153,         //任务事件跳转（若场景上没有事件则点击跳转之后需要根据玩家等级刷出一个事件）
    TASKMAPEVENT = 154,          //任务 场景事件 跳转（若场景上没有事件则点击跳转之后需要根据玩家等级刷出一个事件）
    TASKMAPINCITENT = 155,       //任务 场景事件 跳转（若场景上没有危机则点击跳转之后需要根据玩家等级刷出一个危机）
    ORDERGUIDE = 156,            //订单引导

    SETTINGVIEW = 160,           //设置界面
    FRIENDKUANSET = 161,         //好友框设置
    FANSEE = 162,                //粉丝一览
    HELP = 163,                  //帮助
    FEEDBACK = 164,              //反馈
    MUSICFANSEE = 165,           //声音设置
    CUSTOMERSERVICE = 166,       //客服
    EXCHANGE = 167,              //兑换

    ShopMatchup = 171,           //店铺对决

    BUSJUMP = 181,               //巴士

    CommunityActivity = 190,     //社区活动界面
    AssistHandler = 191,         //社区协助界面

    InviteActivity = 210,        //邀请好友活动
    POSITION_RODE = 230,         //升职之路

    VIPVIEW = 1001,              //会员界面
    FirstCharge = 1002,          //首充界面
    AddUpCharge = 1003,          //累计充值
    DirectGift = 1004,           //直购礼包

    RechargeMain = 2001,         //采购中心


}

//Map上功能跳转
export const MapJumpArr = [
    JumpConst.GOLD_RECRUIT,
    JumpConst.TEST_ORDER_JUMP,
    JumpConst.LONG_ORDER_JUMP,
    JumpConst.POPULARITY_UP,
    JumpConst.DIAMOND_RECRUIT,
    JumpConst.TASKMAPINCITENT,
    JumpConst.TASKMAPINCITENT,
    JumpConst.TASKMAPEVENT
];
