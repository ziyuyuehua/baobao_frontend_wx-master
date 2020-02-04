// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

export enum RedConst {
    SETTING = 100,              //设置红点
    ANNOUNCENENTRED = 101,      //公告红点
    SINGINTRED = 102,           //签到红点
    MAILRED = 103,              //邮件红点
    RECRUITRED = 104,           //招募红点
    FOSTERRED = 106,            //寄养红点
    ORDERRED = 107,             //订单红点
    // PROCOTIONRED = 108,         //促销红点
    // PROCOTIONACTIVATION = 109,  //促销激活状态
    EXPANDREDPOINT = 110,       //扩建红点
    // QUEUEFREERED = 111,         //队列免费红点soft
    // NEWOPENPOST = 113,          //解锁新岗位
    // MEMBERSRED = 114,           //会员红点
    ASSIST_DETAIL = 116,        //社区协助
    //
    LONGORDER_COMMIT = 117,     //长途货运可提交
    LONGORDER_RECIVE = 118,    //长途货运可领取
    ACTIVITY_GOAL = 120,        //积分达标
    LONG_ORDER_HAS = 121,
    LONG_ORDER_CAR_NEW,
    ACTIVITY_SHOP = 123,       //活动商店
    VIP = 126,
    RECHARGE_PACKAGE = 127,    //充值
    //前端自己进行判断的红点
    STAFFRED = 1001,    //员工界面红点

}

//主界面红点
export const RedConstArr = [
    RedConst.ANNOUNCENENTRED,
    RedConst.SINGINTRED,
    RedConst.MAILRED,
    RedConst.RECRUITRED,
    RedConst.FOSTERRED,
    RedConst.ORDERRED,
    // RedConst.PROCOTIONRED,
    // RedConst.PROCOTIONACTIVATION,
    RedConst.EXPANDREDPOINT,
    // RedConst.QUEUEFREERED,
    // RedConst.NEWOPENPOST,
    // RedConst.MEMBERSRED
];

//下拉功能红点
export const SwitchRedConstArr = [
    // RedConst.ANNOUNCENENTRED,
    RedConst.SINGINTRED,
    RedConst.MAILRED,
    RedConst.FOSTERRED
];