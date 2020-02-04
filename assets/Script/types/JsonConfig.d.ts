/**
 * @author: Lizhen
 * @date:
 * @description: json 配置文件申明类型
 */
declare interface ITipsCode {
    readonly code: number;
    readonly message: string;
}

interface IJson {
    readonly id: number;
}

declare interface IGoodsJson extends IJson {
    saleUnit: string;
    readonly capacity: number;
    readonly price: number[];
    readonly color: number;
    readonly costTime: number;
    readonly description: string;
    readonly disSales: string
    readonly getGoodsIcon: string;
    readonly getNum: number;
    readonly groupIcon: string; // 需要解析，分解字符串，使用","拆分
    readonly icon: string; //同上
    readonly isInShop: number;
    readonly isSold: number;
    readonly maxNum: number;
    readonly name: string;
    readonly normalExp: number[];
    readonly normalPrice: number[];
    readonly orderExp: number[];
    readonly orderPrice: number[];
    readonly tips: number;
    readonly typeId: number;
    readonly value: number;
    readonly unLock: string;
}

declare interface IGoodsTypeJson extends IJson {
    readonly capacity: number;
    readonly goodsTypeName: string;
    readonly icon: string;
    readonly shelfType: string;
    readonly tipsCon: string;
    readonly tipsTitle: string;
}

declare interface IObtainShowTypeJson extends IJson {
    readonly id: number;
    readonly interface: string;
    readonly showtype: string;
}

declare interface IWxGoldExchange extends IJson {
    readonly changeType: number;
    readonly consumeDia: number;
    readonly profitMultiple: number;
}

declare interface IActivityStore extends IJson {
    readonly activityId: number;
    readonly itemId: string;
    readonly limit: number;
    readonly price: string;
    readonly rewardId: number;
    readonly sort: number;
    readonly color: number;
}


declare interface IPositionJson extends IJson {
    readonly id: number;
    readonly name: string;
    readonly rank: number;
    readonly level: number;
    readonly positionIconBig: string;
    readonly positionBg: string;
    readonly positionIcon: string;
    readonly positionName: string;
    readonly positionTitle: string;
    readonly iconType: number;
    readonly positionSpine: string;
    readonly drop: string;
    readonly mainTaskIds: string;
    readonly nextId: number;
    readonly sort: number;
}

declare interface IPromotionCondition extends IJson {
    readonly id: number;
    readonly MainTaskId: string;
}

declare interface IItemJson extends IJson {
    readonly canBuy: number;
    readonly color: number;
    readonly bagType: number;
    readonly consumption: string; //字符串切割
    readonly description: string;
    readonly disAttrIcon: string;        //显示属性icon
    readonly disAttrNum: string;
    readonly icon: string;
    readonly id: number;
    readonly isCanUse: number;
    readonly isShowBag: number;
    readonly name: string;
    readonly source: number;
    readonly stacking: number;
    readonly type: number;
    readonly value: number;
    readonly unlockLevel: number;
    readonly uniqueValue: string;
    readonly star: number;
    readonly shopId: number;
}

declare interface IItemModJson extends IJson {
    readonly name: string;
    readonly type: number;
    readonly color: number;
    readonly icon: string;
    readonly description: string;
    readonly source: string;
    readonly value: string;
}

declare interface IFunctionOpen extends IJson {
    readonly name: string;
    readonly openType: number;
    readonly value: number;
    readonly icon: string;
    readonly jump: number;
}

declare interface IDecoShopJson extends IJson {
    readonly name: string;
    readonly goldProduction: number;
    readonly mainType: number;           //主类型
    readonly level: number;
    readonly subType: number;            //子类型
    readonly icon: string;
    readonly color: number;
    readonly recommendedCoordinate: string;
    readonly pattern: string;            //家具模型
    readonly saleSpeed: number;          //销售速度
    readonly Popularity: number;         //人气值
    readonly stacking: number;           //堆叠上限
    readonly influence: number;          //影响面数
    readonly acreage: number[];          //面积
    readonly rotate: number;             //是否可旋转
    readonly description: string;        //家具描述
    readonly nextLevelId: number;        //升级后货架
    readonly levelUpTime: string;        //升级时间
    readonly levelUpCost: string;        //升级消耗
    readonly canBuy: number;             //是否可购买
    readonly consumption: string;        //购买消耗
    readonly recoveryPrice: string;      //出售价格
    readonly getWay: string;             //获取途径
    readonly disAttrIcon: string;        //显示属性icon
    readonly disAttrNum: number;         //显示属性数值
    readonly unlockLevel: number;        //解锁等级
    readonly maxBuy: string;             //限购
    readonly SortPriority: number;       //排序
    readonly star: number;         //星级
    readonly warehouseSort: number;
    readonly goldFail: string;     //金币招募失败获得奖励
    readonly goldRepeat: string;   //金币招募成功重复获得奖励
    readonly diamRepeat: string;   //钻石招募成功重复获得奖励
    readonly resolveReward: string;
    readonly isUnique: number;
}

declare interface IRewardShowType extends IJson {
    readonly interfaceName: string;
    readonly type: number;
}

declare interface IDecoShopEffect extends IJson {
    decoDecs: string;
    decoId: number
    effectType: number;
    functionType: number;
    staffId: number;
    value: number;
    valueType: number;
}

//商品表合并
declare interface IShopJson extends IJson {
    readonly id: number;
    readonly commodityId: number;
    readonly name: string;
    readonly commodityType: number; //商品类型
    readonly price: string;
    readonly maxBuy: number;        //限购数量
    readonly unclockLevel: number;  //解锁等级
    readonly SortPriority: number;  //排序优先级
    readonly dailyOff: string;      //每日折扣
}

declare interface ISceneJson extends IJson {
    readonly expandUrl: string;
    expandConsume: string;
    maxPopularity: number
    choiceTypeA: string;
    choiceTypeB: string;
    choiceA: string;
    choiceB: string;
    extendReward: string;
    expandFrequency: number;
    expandLevel: number;
    goldLv: number;
    id: number;
    orderNum: number;
    orderSellGoodsRate: string;
    orderTime: string;
    passer: string;
    positionLimit: string;
    putShelves: number;
    needPopularity: number;
    shopID: number;
    waitTime: number;
}

declare interface IMBGoldExchange extends IJson {
    demand: number;
    proportion: number;
}

declare interface IPopularityJson extends IJson {
    readonly shop: number;              //店铺
    readonly popularityLevel: number;    //广告牌等级
    readonly maxPopularity: number;       //人气值上限
    readonly popularityIcon: string;       //icon
    readonly levelUpCost: string;         //升级消耗
    readonly playerLevel: number;         //店长等级
}

declare interface IShelveLevelJson extends IJson {
    readonly shop: number;              //店铺
    readonly needPopularity: number;     //对应人气值
    readonly add: numbe;                 //加成比例
    readonly shopIcon: string;                 //加成比例
}

declare interface IIncidentJson extends IJson {
    readonly degree: number;
    readonly degreeFormula: string;
    readonly description: number[];
    readonly duration: number;
    readonly fatigueTime: number;
    readonly helpFormula: string;
    readonly helpRewards: string;
    readonly degreeFormula: string;
    readonly levelRange: number[];
    readonly maxHelpDegree: number;
    readonly rewards: string;
    readonly assistanceRewardId: number;
    readonly assistanceRankReward: number;
    readonly specialAdd: string;
    readonly staffAttrs: string;
    readonly staffLevel: number;
    readonly staffMaxNum: number;
    readonly type: number;
    readonly weight: number;

}


declare interface IIncidentShowJson extends IJson {
    readonly mapPos: string;
    readonly staffMod: number;
    readonly staffName: string;
    readonly staffTalk: string;
    readonly action: number;
    readonly face: number;
    readonly background: string;
    readonly targetPic: string;
    readonly aniType: number;
    readonly eventModelId: string;
}

declare interface IFavorLevelJson extends IJson {
    readonly quality: number;
    readonly level: number;
    readonly cost: number;
    readonly icon: string;
    readonly iconLevel?: string;
}

declare interface IinviteJson extends IJson {
    readonly id: number;
    readonly wechatInvite: number;
    readonly inviteReward: string;
}

declare interface IFavorJson extends IJson {
    readonly staffId: number;
    readonly favorLevelId: number;
    readonly type: number;
    readonly para: string;
}

declare interface IBeginChosenJson extends IJson {
    readonly id: number;
    readonly staffId: number;
    readonly SortName: string;
    readonly Sort: string;
    readonly Name: string;
    readonly DropId: string;
    readonly Post: string;
    readonly Desc: string;
    readonly Background: string;
}

declare interface IAttributeJson extends IJson {
    readonly attributeName: string;
    readonly attributeIcon: string;
}


declare interface IInformationJson extends IJson {
    readonly name: string;
    readonly icon: string;
    readonly type: number;
    readonly color: number;
    readonly sourceId: string;
    readonly source: string;
    readonly effect: string;
    readonly description: string;
}


declare interface IVipJson extends IJson {
    readonly id: number;
    readonly name: string;
    readonly activityId: number;
    readonly option: string;
    readonly vipType: number;
    readonly preVip: number;
    readonly duration: number;
    readonly price: number;
    readonly urlBig: string;
    readonly urlSmall: string;
    readonly firstPrice: number;
    readonly firstReward: string;
    readonly dailyReward: string;
    readonly buffId: number[];
}

declare interface IBuffJson extends IJson {
    readonly id: number;
    readonly name: string;
    readonly type: number;
    readonly param: number;
    readonly buffIcon: string;
    readonly description: string;
}


declare interface IItemTypeJson extends IJson {
    readonly name: string;
}

declare interface ISkillBonusJson extends IJson {
    readonly wellLevel: number;
    readonly needStaff: number;
    readonly speedAdd: number;
}

declare interface ISpecialJson extends IJson {
    readonly bbId: number;
    readonly isInitSpecial: number;
    readonly specialAdd: string;
    readonly specialId: number;
    readonly specialName: string;
}

declare interface IMainTask {
    readonly id: number;
    readonly jumpPage: number;
    readonly lastId: number
    readonly nextId: number
    readonly reward: string;
    readonly targetItem: any;
    readonly targetNum: number;
    readonly targetType: number;
    readonly taskDescribe: string;
    readonly taskName: string;
    readonly taskSort: number;
    readonly taskType: string;
    readonly unclockLevel: number;
}

declare interface IPositionTask {
    readonly id: number;
    readonly taskType: string;
    readonly taskDescribe: string;
    readonly unclockLevel: number;
    readonly taskSort: number;
    readonly targetType: number;
    readonly targetNum: number;
    readonly targetItem: number;
    readonly jumpPage: number;
}

declare interface IBannerJson extends IJson {
    readonly bannerName: string;
    readonly bannerUrl: string;
    readonly ifPermanent: number;
    readonly beginTime: string;
    readonly destory: string;
    readonly endTime: string;
    readonly fast: string;
    readonly jump: number;
    readonly show: number;
    readonly ifFrontendControl: number;
    readonly platform: number;
    readonly activityId: number;
}

declare interface IBranchStore extends IJson {
    readonly cost: string;
    readonly id: number;
    readonly level: number;
    readonly taskIds: number[];
    readonly story: string;
    readonly background: string;
    readonly shopMap: string;
    readonly itemCost: string;
}

declare interface IStoreTask extends IJson {
    readonly id: number;
    readonly jumpPage: number;
    readonly targetItem: string;
    readonly targetNum: number;
    readonly targetType: number;
    readonly taskDescribe: string;
    readonly taskName: string
    readonly taskType: string;
}

declare interface IGiftPackageJson extends IJson {
    readonly giftPackageName: string;
    readonly activityId: number;
    readonly giftPackageType: number;
    readonly costType: number;
    readonly blackboard: string;
    readonly param: number;
    readonly showParam: string;
    readonly giftContent: string;
    readonly maxGet: number;
    readonly jumpPage?: number;
}

declare interface IActivityJson extends IJson {
    readonly name: string;
    readonly type: number;
    readonly level: number;
    readonly OpenTimes: number;
    readonly openType: number;
    readonly param: string;
    readonly closeType: number;
    readonly closeParam: number;
    readonly jumpPage: number;
    readonly duration: number;
    readonly mailId: number;
    readonly ifNew: number;
    readonly url?: string;
    readonly giftUrlSmall?: string;
    readonly giftUrlBig?: string;
    readonly sort: number;
    readonly mainButton?: string
    readonly shopItem: string;
    readonly pointUrl: string;
    readonly noticeId: number;
}

declare interface IChargeJson extends IJson {
    readonly cost: number;
    readonly desc: number;
    readonly firstreward: string;
    readonly name: string;
    readonly reward: string;
    readonly pic: string;
}

declare interface IExRechargeJson extends IJson {
    readonly name: string;
    readonly jumpPage: number;
}

declare interface ICustomerNumJson extends IJson {
    readonly sellingShelfMax: number
    readonly customerNum: number
    readonly lowCustomerNum: number
    readonly shoppingCustomerRate: number
}

declare interface IRoleAction extends IJson {
    readonly action: stirng;
}

declare interface IRoleFaceJson extends IJson {
    readonly face: string
    readonly weight: number
    readonly downRadio: number
    readonly upRadio: number
    readonly unchangRadio: number
    readonly solicitTimes: number
    readonly dialogueExpression: string
}

declare interface IDialogueJson extends IJson {
    readonly dialogue: string;
    readonly icon: string;
    readonly info: string;
    readonly staffModId: number;
    readonly type: number
}

declare interface IFoster extends IJson {
    readonly dropId: number;
    readonly itemId: number[];
}

declare interface IDropJson extends IJson {
    readonly dorpId: number;
    readonly index: number;
    readonly dropType: number;
    readonly itemId: number;
    readonly radio: number;
    readonly weight: number;
    readonly expression: number;
    readonly description: string;
    readonly luckDrop: number;
}

declare interface IAssistanceJson extends IJson {
    readonly activityId: number;
    readonly incidentId: number;
    readonly rewardIconUrl: string;
    readonly title: string;
    readonly url: string;
    readonly word: string;
    readonly sceneUrl: string;
    readonly shopBg: string;
    readonly solveBg: string;
    readonly type: number;
}


declare interface IAssistanceRewardJson extends IJson {
    readonly rewardId: number;
    readonly rewardType: number;
    readonly range: number[];
    readonly reward: string;
    readonly activityId: number;
}

declare interface IArea extends IJson {
    readonly exFrequency: number;
    readonly id: number;
    readonly x: number;
    readonly y: number;
}


declare interface IGoldMoonShop extends IJson {
    readonly name: string;
    readonly itemType: number;
    readonly itemId: number;
    readonly ifBuyMany: number;
    readonly price: number;
}

declare interface IWarehouseExp extends IJson {
    readonly times: number;
    readonly capacity: number;
    readonly nextCapacity: number;
    readonly consume: string;
}


declare interface IBase extends IJson {
    readonly propId: number;
    readonly reGet: number;
}

declare interface IAssistanceUpJson extends IJson {
    readonly activityId: number;
    readonly staffId: number;
    readonly addPercent: number;
}

declare interface IDecoEffectJson extends IJson {
    readonly decoId: number;
    readonly staffId: number;
    readonly functionType: number;
    readonly effectType: number;
    readonly valueType: number;
    readonly value: number;
    readonly decoDecs: string;
}

declare interface IAdvertisementJson extends IJson {
    readonly id: number;
    readonly vipcount: number;
    readonly reward2: string;
    readonly reward1: number;
    readonly rewardType: number;
    readonly count: number;
    readonly name: string;
    readonly url: string;
    readonly advType: number;
    readonly openPosition: number;
}

declare interface IShareJson extends IJson {
    readonly type: number;
    readonly pictrue: string;
    readonly title: string;
    readonly word: string;
}

declare interface IOptionalTutorials extends IJson {
    checkType: number;
    id: number
    name: string;
    value?: string;
}

declare interface SellLimitData extends IJson {
    readonly sceneLevel: number;
    readonly stage: number;
    readonly ruleShow: number;
}

declare interface IFunctionOpenJson extends IJson {
    readonly name: string;
    readonly description: string;
    readonly openType: number;
    readonly value: number;
    readonly icon?: string;
    readonly jump?: number;
    readonly functionPicType?: string;
    readonly isShow?: number;
    readonly isJump: number;
}

declare interface INewOrderJson extends IJson {
    readonly item: string;
    readonly cost: string;
}

declare interface IStaffGiftJson extends IJson {
    readonly ADTime: number;
    readonly expandLevel: number;
    readonly id: number;
    readonly post: number;
    readonly shareTime: number;
    readonly speedUp: number;
    readonly staffId: number;
    readonly staffLevel: number;
    readonly staffName: string;
    readonly time: number;
}

declare interface IInspireInfoJson extends IJson {
    readonly inspireType: number;
    readonly inspireInfo: string
}

declare interface ISoftGuideJson extends IJson {
    readonly description: string;
    readonly groupId: number;
    readonly childId: number;
    readonly NoviceType: number;
    readonly optionId: number;
    readonly triggerCondition: string;
    readonly endCondition: string;
    readonly displayType: number;
    readonly displayText: string;
    readonly priority: number;
}

declare interface IOptionalTutorialsTextJson extends IJson {
    readonly type: number;
    readonly text: string;
    readonly face: number;
    readonly direction: number;
}