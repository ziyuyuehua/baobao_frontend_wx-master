import {JsonMgr} from "../manager/JsonManager";

export class TextIncidentConst {
    static getGenderTex(gender: number) {
        return gender == 0 ? "女" : "男";
    }

    static getGenderTaTxt(gender: number) {
        return gender == 0 ? "她" : "他";
    }

    //智力，体力，亲和，灵敏->口才
    static getAttributeTxt(type: number) {
        let attribute = JsonMgr.getAttributeById(type);
        return attribute.attributeName;
    }
}

export enum TextTipConst {
    //进货
    goodsTip = 0,
    //货架上货
    goodsUpTip = 1,
    //货架升级
    goodsUpLvTip = 2,
    //召唤乐园
    RecruitmentTip = 3,
    //寄养规则
    FosterCareTip = 4,
    //培训规则
    TrainingTip = 5,
    //岗位规则
    PostTip = 6,
    //岗位加成规则
    PostADDTip = 7,
    //员工一览
    StaffTip = 8,
    //员工升级
    StaffUpTip = 9,
    //签到规则
    SignInTip = 10,
    //周边外送规则
    Ordertip = 11,
    //升级队列规则
    UpLevelQueTip = 12,
    //奖池库存规则
    TalentDensityRule = 13,
    //好感度规则
    PopularityTip = 14,
    //邀请规则
    InviteTip = 15,

    BusTip = 16,

    IncidentTip = 17,
    IncidentEventTip = 18,
    IncidentAssistTip = 19,
    IncidentHelpTip = 20,
    //长途货运规则
    LongOrderDesTip = 21,
    //任务规则
    TaskTip = 22,
    //金币兑换
    GoldExchange = 23,

    //疲劳
    STAFFFATIGUETXT = 24,
    //属性不足
    //等级不足
    STAFFLEVELINSUFFICIENT = 25,
    //其他属性不足
    STAFFATTRIBUTEINSUFFICIENT = 26,
    //不需要在多的员工
    STAFFENOUGH = 27,
    //已经帮助过别人了
    STAFFHELPED = 28,
    INCIDENT_INCIDENTOVER = 29,
    INCIDENT_ASSISTOVER = 30,
    //设置规则
    SettingRuleTip = 31,

    //协助次数最高了
    ASSISTMAXWARNING = 32,
    ASSIST_SOLVE_TXT = 33,

    //社区活动提示
    communityTip = 34,

    //社区排行提示
    communityRankTip = 35,


    //全球活动提示
    allPointTip = 36,


    //Help
    INCIDENT_FIREND_HELPED = 37,

    //危机最多能上多少人
    INCIDENT_MAX_STAFF = 38,
    //危机被处理完毕
    INCIDENT_OVERSELFHOMEWARNING = 39,
    INCIDENT_OVERFRIENDHOMEWARNING = 40,
    TEXT_MAXUSEITEMNUM = 41,
    INCIDENT_CRISISINSUFFICIENTWARNING = 42,
    INCIDENT_WORLDRANKTXT = 43,
    INCIDENT_LOCALRANKTXT = 44,
    INCIDENT_FOLLOWTXT = 45,
    INCIDENTFATIQUEREFRESH = 46,
    INCIDENTLEVELNOTTXT = 47,
    INCIDENTUPGRADELEVELATTRIBUTETXT = 48,
    INCIDENTUPGRADENOLEVELATTRIBUTETXT = 49,

    SELLTASK = 50,

    CHANGE_PHONE_STATE = 51,

    FUWUQIERR = 52,//= "服务器错误！！！",
    FUWUQITIMETIP = 53,//= "服务器超时错误！！！",

    //员工岗位解锁提示
    STAFFJOBTIP = 54,//= "店铺等级达到{0}级解锁该岗位",

    //上岗反馈
    JOBWORKTIP = 55,//= "宝宝正在忙碌中~不可替换",
    JOB_IS_FULL = 56,//= "岗位已满，请先让宝宝下来哦",
    JOB_IS_LOCK = 57,//= "岗位已满，升级店铺来解锁新岗位吧",
    JOB_LIMIT_LV = 58,//= "店铺等级达到{0}级",
    JOB_STAFF_IS_EMPTY = 59,//= "没有宝宝不能上岗啦",

    //加速提示
    SPEEDTIP = 60,//= "时空跳跃成功",
    NOSOURCE = 61,//= "这个物品没有来源",
    TIAOZHENG = 62,//= "请调整您想兑换的数量！",
    NOMENGBI = 63,//= "您的金币不足！！！",
    GUANGZHUSUC = 64,//= "关注成功",
    GONGNENGWEI = 65,//= "功能维护中。。。",
    NOFRIDEN = 66,//= "您还没有好友哦",
    NOQUERYFRIDEN = 67,//= "没有搜索到符合条件的店长",
    SOUSUONEIRONG = 68,//= "请输入搜索内容",
    CACLEGUANSUC = 69,//= "取消关注",
    GOODSHAVEMAN = 70,//= "进货队列满啦",
    WEIDADAOJIESUO = 71,//= "未达到解锁条件",
    GOODSCHUDONG = 72,//= "计划确认，进货队列出动！",
    ONLEYGETFAIL = 73,//= "一键领取失败，请先清理仓库哦！",
    ONELEYGETSUC = 74,//= "一键领取成功，赶快去仓库康康吧！",
    NOGET = 75,//= "一键删除成功！",
    NEXTGUOJIANLV = 76,//= "下次升级需要店铺等级达到{0}级",
    QUESHAODIBAN = 77,//= "还缺{0}块地板才能铺满整个店铺哦",
    XIUGAISUC = 78,//= "修改成功！！",
    SHURUZIFU = 79,//= "请输入2到6个字符！！",
    XIUGAINOKUN = 80,//= "修改不能为空！！",
    NOBAOXIANG = 81,//= "您有宝箱没有领取哦",
    THISMEIUMG = 82,//= "这个没用{0}",
    LASTNOXIAGUANG = 83,//= "最后一名收银员宝宝不可以下岗哦",
    YUANGOGNNOTIHUAN = 84,//= "宝宝正在忙，不能替换呢",
    MENGBI = 85,//= "萌币: {0}",
    MENGZUAN = 86,//= "萌钻: {0}",
    EXP = 87,//= "经验: {0}",
    HUODE = 88,//= "获得{0}",
    EXPENG = 89,//= "EXP+{0}",
    YUANGONGCHI = 90,//= "宝宝池大小：{0} -> {1}",
    INCIDENT_FINISH= 91,//= "已经完成了",
    INCIDENT_COMPLETE = 92,//= '已经过期了',
    INCIDENT_MAX_SELECT = 93,//= '最多可以选择三名宝宝',
    INCIDENT_SELECT_TIPS = 94,//= '请选择解决宝宝',
    IncidentHelpTip2 = 95,//= '当前危机剩余  {0}%',
    IncidentRecoveryTip = 96,//= '协助需要<color=#27d22b>{0}</c>秒回复,是否花费钻石加速？',
    IncidentRecoveryTipRecovery = 97,//= '协助需要<color=#27d22b>{0}</c>秒回复,是否花费钻石加速并协助？',
    MAX_ROLEMODEL = 98,//= "模型数量已达到最高",
    QUICK_SELECTION = 99,//= "暂无符合条件的宝宝",

    BUS_USER_LV_LIMIT = 100 ,//= "职位达到{0}可开启旅游巴士站功能",
    BUS_FRIEND_LV_LIMIT = 101,//= "好友还未开启旅游巴士站~",
    BUS_RECEPTION = 102,//= "店铺已接待了{0}位游客，店铺收益增加啦",
    BUS_HELP_RECEPTION = 103,//= "接待成功，拐走了{0}位游客来到您的店铺",
    BUS_HELP_HISTORY = 104,//= "{0}帮您接待了{1}位游客，拐走{2}位",
    BUS_RECEPTION_IGNORE = 105,//= "游客已达上限",
    ShopFight_Explain = 106,
    FULI = 107, //福利
    POSITION_RODE = 108, //升职之路
}
