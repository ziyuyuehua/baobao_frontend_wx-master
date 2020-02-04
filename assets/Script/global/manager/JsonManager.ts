import {TabbarType} from "../../CustomizedComponent/shop/ShopMain";
import {DataMgr, SHARE_TYPE} from "../../Model/DataManager";
import {IncidentConf} from "../../Model/incident/jsonconfig/IncidentConf";
import {IncidentShowConf} from "../../Model/incident/jsonconfig/IncidentShowConf";
import {JobType, JobTypeStr} from "../../Model/StaffData";
import {IOwnFrameInfo, IRespData} from "../../types/Response";
import {CommonUtil, Reward} from "../../Utils/CommonUtil";
import {MathCalc} from "../../Utils/MathCalc";
import {ServerConst} from "../const/ServerConst";
import {UIMgr} from "./UIManager";

/*
 * @Author: whg
 * @Date: 2019-01-12
 * @Desc: Json配置表管理器
 *
 */

export enum itemType {
    StayType = 1,   //留空
    ExpansionType = 2,  //扩建
    ExpType = 3,    //经验
    TrainType = 4,   //培训
    TimeSpeedType = 7,  //时间加速
    GoodsExPandType = 8, //进货队列扩建
    FavorUpType = 9,    //好感度提升
    FavorBreakthrough = 10,  //好感度突破
    ZhiOpenGift = 14,  //直接打开的礼包
    SpecialAction = 20,     //特殊动作
    Other = 99, //其他
}

export class JsonManager {

    static instance: JsonManager = new JsonManager();

    private json: any = null;
    static getItem: any;

    private constructor() {

    }

    loadJsonNow(response: IRespData, cb: Function = null) {
        if (!response || !response.outJson) {
            cc.log("loadJsonNow:not found outJson!");
            return;
        }
        if (this.json) {
            cc.log("loadJsonNow:had loaded json data!");
            return;
        }
        this.json = JSON.parse(response.outJson);
        console.log("http get json data end!", this.json);

        cb && cb();
        // let scene = this.json["scene"];
        // cc.log(Object.keys(scene));
        // cc.log(CommonUtil.values(scene));
        // cc.log(CommonUtil.entries(scene));
        //
        // let obj: any = {foo:'bar', baz:43};
        // cc.log(Object.keys(obj));
        // cc.log(CommonUtil.values(obj));
        // cc.log(CommonUtil.entries(obj));
        //
        // cc.log(new Map(CommonUtil.entries(obj)));
        //
        // obj = 42;
        // cc.log(Object.keys(obj));
        // cc.log(CommonUtil.values(obj));
        // cc.log(CommonUtil.entries(obj));

        // cc.log(this.isUniqueCase(2004205));
    }

    loadJson(): Promise<void> {
        if (this.json) {
            cc.log("loadJson:had loaded json data!");
            return;
        }

        return new Promise((resolve) => {
            let remoteUrl = ServerConst.JSON_URL;//+"?v=" + Date.now();
            cc.loader.load(remoteUrl, (err, jsonAsset) => {
                if (err) {
                    cc.log(err);
                    return;
                }
                this.json = jsonAsset;
                if(ServerConst.SHOW_LOG){
                    console.log("http load json data end!", this.json);
                }
                return resolve();
            });
        })
    }

    uniqueCaseSet: Set<number> = null;

    //是否是unique家具
    isUniqueCase(xmlId: number): boolean {
        if (!this.uniqueCaseSet) {
            this.uniqueCaseSet = new Set();
            this.getJsonArr("base", (base: IBase) => JsonManager.isCase(base.propId) && base.reGet == 0)
                .forEach((base: IBase) => {
                    this.uniqueCaseSet.add(base.propId);
                });
        }
        return this.uniqueCaseSet.has(xmlId);
    }

    //是否是家具
    static isCase(xmlId: number) {
        return xmlId > 2000000 && xmlId < 3000000;
    }

    getBase(): Base[] {
        return this.json["base"];
    }

    getRoleAction(id: number): IRoleAction {
        return this.getJson("roleAction", id);
    }

    getRoleFace(id: number): IRoleFaceJson {
        return this.getJson("roleFace", id);
    }

    getItem(id: number): IItemJson {
        let itemJson = this.getJson("item", id);
        if (!itemJson) {
            cc.error("itemJson not found id=", id);
            return null;
        }
        return itemJson;
    }

    getItemMod(id: number): IItemModJson {
        return this.getJson("itemMod", id);
    }

    getItemsByType(Type: number): IItemJson[] {
        return this.getJsonArr("item", (value: IItemJson) => value.type == Type);
    }

    getActivityStore(activityId: number, rewardId: number): IActivityStore[] {
        return this.getJsonArr("activityStore", (value: IActivityStore) => value.activityId == activityId && value.rewardId == rewardId);
    }

    getLevel(id: number, name: string): any {
        return this.getJson("level", id)[name];
    }

    getCommodity(id: number): any {
        return this.getJson("commodity", id);
    }

    getScene() {
        return this.json["scene"];
    }

    getDrop() {
        return this.json["drop"];
    }

    getDropArrByItem(dropId: number) {
        let dropTemp = this.getDrop();
        let dropArr: any[] = [];
        for (let i in dropTemp) {
            let drop = dropTemp[i];
            if (parseInt(drop.dorpId) == dropId) {
                // cc.log(drop);
                dropArr.push({xmlId: drop.itemId, number: drop.expression});
            }
        }
        return dropArr;
    }

    getDropArrByDropId(dropId: number) {
        let dropTemp = this.getDrop();
        let dropArr: any[] = [];
        for (let i in dropTemp) {
            let drop = dropTemp[i];
            if (parseInt(drop.dorpId) == dropId) {
                dropArr.push({xmlId: drop.itemId, number: drop.expression});
            }
        }
        return dropArr;
    }

    //宝箱掉落
    getTreasureBoxDropArr(dropId: number) {
        let dropTemp = this.getDrop();
        let dropArr: number[] = [];
        for (let i in dropTemp) {
            let drop = dropTemp[i];
            if (parseInt(drop.dorpId) == dropId) {
                dropArr.push(drop.itemId);
            }
        }
        dropArr.sort((a, b) => {
            let decAStage: number = JsonMgr.getDecoShopJson(a).color;
            let decBStage: number = JsonMgr.getDecoShopJson(b).color;
            if (decAStage != decBStage) {
                return decBStage - decAStage;
            }
            return a - b;
        });
        return dropArr;
    }

    getFoster(id: number) {
        return this.getJson("foster", id);
    }

    getNewOrder(id: number) {
        return this.getJson("newOrder", id);
    }

    getJobLimitLv(jobType: JobType, index: number, marketId: number = 1) {
        let expandFrequency: number = 0;
        let sceneArr: ISceneJson[] = this.getJsonArr("scene",
            (scene: ISceneJson) => scene.shopID == marketId);
        for (let scene of sceneArr) {
            let positionLimitArr: string[] = scene.positionLimit.split(";");
            for (let positionLimitStr of positionLimitArr) {
                let positionLimit: string[] = positionLimitStr.split(",");
                if (Number(positionLimit[0]) == jobType && Number(positionLimit[1]) == index) {
                    expandFrequency = scene.expandFrequency;
                    break;
                }
            }
            if (expandFrequency != 0) {
                break;
            }
        }
        return expandFrequency;
    }

    getSceneData(xmlId: number): ISceneJson {
        return this.json["scene"][xmlId];
    }

    getNoviceText(id: number) {
        return this.json["optionalTutorialsText"][id]["text"];
    }

    getSceneDataByMarketId(nowExp: number, id: number): ISceneJson {
        return this.json["scene"][(id - 1) * 22 + nowExp];
    }

    getSceneItem(lv: number): ISceneJson {
        return this.getFirstJson("scene",
            (scene: ISceneJson) => scene.expandLevel == lv);
    }

    getScenePutShelves(level: number) {
        let scene = this.getSceneData(level);
        return scene.putShelves;
    }

    getSceneConfig(): SceneConfig {
        return this.getSceneById(DataMgr.iMarket.getExFrequency());
    }

    private sceneConfig: SceneConfig;

    private getSceneById(id: number): SceneConfig {
        const json = this.getScene()[id];
        if (!this.sceneConfig) {
            this.sceneConfig = new SceneConfig(json);
        } else {
            this.sceneConfig.fill(json);
        }
        return this.sceneConfig;
    }

    getSceneByGoodsQueue(goods: number) {
        let goodsQueue = this.getScene();
        for (let a in goodsQueue) {
            if (goodsQueue[a]["goodsQueue"] == goods) {
                return goodsQueue[a]["expandFrequency"];
            }
        }
    }

    getSceneByOrderNum(orderNum) {
        let goodsQueue = this.getScene();
        for (let a in goodsQueue) {
            if (goodsQueue[a]["orderNum"] == orderNum) {
                return goodsQueue[a]["expandFrequency"];
            }
        }
    }

    getSceneByWareHouseLv(LV: number) {
        let goodsQueue = this.getScene();
        for (let a in goodsQueue) {
            if (goodsQueue[a]["wareHouselevel"] == LV) {
                return goodsQueue[a]["expandFrequency"];
            }
        }
    }

    getSceneQueueByExpand(expandFrequency) {
        let goodsQueue = this.getScene();
        for (let a in goodsQueue) {
            if (goodsQueue[a]["expandFrequency"] == expandFrequency) {
                return goodsQueue[a]["goodsQueue"];
            }
        }

    }

    getMaxGoodsQueueCount() {
        let s = this.getScene();
        let exFrequency = DataMgr.iMarket.getExFrequency();
        let queue = 0;
        queue = this.getSceneQueueByExpand(exFrequency) + 1;
        if (queue >= 11) {
            queue = 11;
        }
        return queue;
    }

    getWarehouseExp(id: number): IWarehouseExp {
        let ExpData: any = this.json["warehouseExpansion"];
        return ExpData[id];
    }

    getAllWarehouseExp() {
        return this.json["warehouseExpansion"];
    }

    getDiamondExchange(id: number, key: string) {
        return this.getJson("diamondExchange", id)[key];
    }

    getWXGoldExchange(id: number, key: string) {
        return this.getJson("wxGoldExchange", id)[key];
    }

    getWXGoldExchangeNum(isVip: number): IWxGoldExchange[] {
        // let jsonObj = this.json["wxGoldExchange"];
        return this.getJsonArr("wxGoldExchange", (value: IWxGoldExchange) => value.changeType == isVip);
        // let jsonValues = CommonUtil.values(jsonObj);
        // return jsonValues.length;
    }

    getMBGoldExchange(id: number, key: string) {
        return this.getJson("mbGoldExchange", id)[key];
    }

    getMBGoldExchangeLv() {
        return this.getFirstJson("mbGoldExchange", (v: IMBGoldExchange) => !v.demand);
    };

    getSceneGoldLv = (goldLv: number) => {
        return this.getFirstJson("scene", (v: ISceneJson) => v.goldLv == goldLv);
    };

    getFurniture(id: number) {
        return this.getJson("decoShop", id);
    }

    getProperty(id: number) {
        return this.getJson("property", id);
    }

    //根据id查找json对象
    private getJson(tableName: string, id: number): any {
        return this.json[tableName][id];
    }

    //查找符合条件的json对象数组
    getJsonArr<T>(tableName: string, predicate: (e: T) => boolean = null): Array<T> {
        let jsonObj = this.json[tableName];
        if (!jsonObj) return [];
        let jsonValues: Array<T> = CommonUtil.values(jsonObj);
        if (!predicate) {
            return jsonValues;
        }
        return jsonValues.filter(predicate);
    }

    //查找第1个符合条件的json对象
    getFirstJson<T>(tableName: string, predicate: (e: T) => boolean = null): T {
        let jsonObj = this.json[tableName];
        let jsonValues: Array<T> = CommonUtil.values(jsonObj);
        if (!predicate) {
            return jsonValues.length > 0 ? jsonValues[0] : null;
        }
        return jsonValues.find(predicate);
    }

    getAllGoods(): any {
        return this.json["goods"];
    }

    getBeginChosenson(): any {
        return this.json["beginChosen"];
    }

    getOneKind(key: string): any {
        return this.json[key];
    }


    getGoods(id: number): IGoodsJson {
        return this.getJson("goods", id);
    }

    getMovieInfo(id: number) {
        return this.getJson("advertisement", id);
    }

    getGoodsQueue(id: number) {
        return this.getJson("goodsQueue", id);
    }

    getGoodsGet() {
        return this.json["goodsGet"];
    }

    getDress(id: number): XmlDress {
        let xmlDress = new XmlDress();
        xmlDress.setData(this.getJson("dress", id));
        return xmlDress;
    }

    getStaffLevelConfig(level: number): StaffLevelConfig {
        return this.getJson("staffLevel", level);
    }

    //到达level等级所需要的exp经验
    getStaffLevelExp(level: number) {
        let staffLevel = this.getStaffLevelConfig(level);
        if (!staffLevel || !staffLevel.exp) {
            return -1;
        }
        return staffLevel.exp;
    }

    getSingOn(id: number) {
        let signOn = this.getJson("signOn", id);
        if (!signOn) {
            cc.error("not found signOn id=", id);
            return [];
        }
        return signOn.signOnReward;
    }

    getSource(id: number) {
        return this.getJson("source", id);
    }

    getInformationAndItem(id: number): any {
        if (id < 0) {
            return this.getInforMationJson(id);
        }
        if (id >= 1000 && id < 9999) {
            return this.getStaff(id);
        }
        if(id >= 10000 && id < 100000){
            let staffRandomConfig = this.getStaffRandom(id);
            if(staffRandomConfig){
                let firstName = staffRandomConfig.firstNameId[0];
                let lastName = staffRandomConfig.lastNameId[0];
                return {
                    name: "["+JsonMgr.getStaffFirstName(firstName) + JsonMgr.getStaffLastName(lastName)+"]",
                    artResId: staffRandomConfig.artResId
                };
            }
            return {name: "[普通员工]", artResId: 10010}; //默认找不到的时候
        }
        if (id >= 100000 && id <= 199999) {
            return this.getItem(id);
        }
        if (id >= 2000000 && id <= 3000000) {
            return this.getDecoShopJson(id);
        }
        if (id >= 101 && id <= 105) {
            return this.getGoods(id);
        }
        if (id >= 510001 && id <= 510007) {
            return this.getItemMod(id);
        }
        return this.getItem(id);
    }

    isStaffRandom(id: number) {
        if (id >= 10001 && id <= 20000) {
            return true;
        }
        return false;
    }

    getHelp() {
        return this.json["help"];
    }

    gerSellLimit(sceneLv: number, stage: number) {
        let jsons = this.json["sellLimit"];
        for (let idx in jsons) {
            if (jsons[idx].sceneLevel === sceneLv && jsons[idx].stage === stage) {
                return jsons[idx].reward;
            }
        }
    }

    getArea(xmlId: number): IArea {
        return this.json["area"][xmlId];
    }

    getAllArea(): IArea[] {
        return this.getJsonArr("area");
    }

    getSignOnBox(id: number) {
        return this.getJson("signOnBox", id).ConsecutiveSignOnReward;
    }

    getAchieveTask(id: number) {
        return this.getJson("achieveTask", id);
    }

    getAttribute() {
        return this.json["attribute"];
    }

    getAttributeById(id: number) {
        if (id > 3) {
            cc.error('attribute id error ', id);
            id = 3;
        }
        let obj = this.getJson("attribute", id);
        return obj;
    }

    getTrainMultiple() {
        return this.json["train"][1]["multiple"];
    }

    getTranTem(attid, stage) {
        let jsons = this.json["train"];
        for (let nid in jsons) {
            if (jsons[nid].attribute == attid && jsons[nid].stage == stage) {
                return jsons[nid];
            }
        }
        return null;
    }

    private maxStaffLv = -1;

    getMaxStaffLevel() {
        if (this.maxStaffLv > 0) {
            return this.maxStaffLv;
        }
        this.maxStaffLv = 1;
        let staffValue: any[] = CommonUtil.values(this.json["staffLevel"]);
        staffValue.forEach((value) => {
            this.maxStaffLv++;
        })
        return this.maxStaffLv;
    }

    getMaxStaffLvByStar(star: number): number {
        const staffLvArray: string[] = this.getConstVal("staffLevelLimit").split(",");
        return parseInt(staffLvArray[Math.min(star - 3, 2)]);
    }

    getTotalStaffLvExpByStar(star: number): number {
        const maxLv: number = this.getMaxStaffLvByStar(star);
        const config: StaffLevelConfig = this.getStaffLevelConfig(maxLv - 1);
        return config.allExp;
    }

    getExpandRow(id: number): any {
        return this.getJson("scene", id);
    }

    getStaffGiftData(id: number): any {
        return this.json["staffGift"][id];
    }

    getStaffMod(id: number): StaffModConfig {
        return this.getJson("staffMod", id);
    }

    getStaff(id: number): StaffConfig {
        const json = this.getJson("staff", id);
        if (json) {
            return json;
        }
        return null;
    }

    getStaffFrame() {
        let json = this.json["staffMod"];
        let ownFrame: IOwnFrameInfo[] = [];
        for (let i in json) {
            let frameInfo: IOwnFrameInfo = {id: 0, redDot: false};
            if (Number(json[i].id) >= 1001 && Number(json[i].id) < 2001) {
                frameInfo.id = Number(json[i].id);
                frameInfo.redDot = false;
                ownFrame.push(frameInfo);
            }
        }
        return ownFrame;
    }

    getStaffFirstName(id: number) {
        const result = this.getNameConfig(id);
        if (result) {
            return result.firstName;
        }
        return "未找到" + id;
    }

    getStaffLastName(id: number) {
        const result = this.getNameConfig(id);
        if (result) {
            return result.lastName;
        }
        return "未找到" + id;
    }

    getNameConfig(id: number): NameConfig {
        return this.getJson("name", id);
    }

    getPromotionMod(id: number): XmlPromotionMod {
        return this.getJson("promotionMod", id);
    }

    getPromotion(id: number): XmlProMotion {
        return this.getJson("promotion", id);
    }

    getGoodsType(id): IGoodsTypeJson {
        return this.getJson("goodsType", id);
    }

    getDailyTask(id: number) {
        return this.getJson("dailyTask", id);
    }

    getMainTask(id: number): IMainTask {
        return this.getJson("mainTask", id);
    }

    getStoreTask(id: number): IStoreTask {
        return this.getJson("storeTask", id);
    }

    getActivityTask(id: number) {
        return this.getJson("activityTask", id);
    }

    getPositionTaskInfo(id: number) {
        return this.getJson("positionTask", id);
    }

    getSkillBonus(id: number): ISkillBonusJson {
        return this.getJson("skillbonus", id);
    }

    getSkillBonusByNum(staffNum: number): ISkillBonusJson {
        if (staffNum <= 0) {
            return null;
        }
        let skillBonus = this.json["skillbonus"];
        for (let nid in skillBonus) {
            let current = skillBonus[nid];
            let next = skillBonus[Number(nid) + 1];
            if (!next) {
                return current;
            }
            if (staffNum >= current.needStaff && staffNum < next.needStaff) {
                return current;
            }
        }
        return null;
    }

    getBackShowLevel() {
        return this.getConstVal("goHomeGuideArrow");
    }

    getGoodsGroup(id: number) {
        let result = new XmlGoodsGroup();
        result.setData(this.getJson("goodsGroup", id));
        return result;
    }

    //缓存const常量表map
    private constMap: Map<string, any> = null;

    getConstVal(constName: string): any {
        if (!this.json) {
            cc.error("not init json!!!");
            return null;
        }
        if (!this.constMap) {
            this.constMap = new Map<string, Object>();
            let constValue: any[] = CommonUtil.values(this.json["const"]);
            constValue.forEach((value) => {
                this.constMap.set(value["name"], value["value"]);
            })
        }
        return this.constMap.get(constName);
    }

    private busTourIds: Array<number> = null;
    private customerIds: Array<number> = null;

    getCustomerResIds(isTour: boolean): Array<number> {
        const customerIds: string = this.getConstVal(isTour ? "busTourIds" : "customerIds");
        if (isTour) {
            if (!this.busTourIds) {
                const customerIdArray: string[] = customerIds.split(",");
                this.busTourIds = new Array<number>(customerIdArray.length);
                customerIdArray.forEach((value, index) => {
                    this.busTourIds[index] = Number(value);
                });
            }
            return this.busTourIds;
        } else {
            if (!this.customerIds) {
                const customerIdArray: string[] = customerIds.split(",");
                this.customerIds = new Array<number>(customerIdArray.length);
                customerIdArray.forEach((value, index) => {
                    this.customerIds[index] = Number(value);
                });
            }
            return this.customerIds;
        }
    }

    getIncidentMapPosArr(mapId: number): Array<cc.Vec2> {
        let incidentMap: string = JsonMgr.getConstVal("incidentMap" + mapId);
        return CommonUtil.toMapPos(incidentMap);
    }

    getJobFormula(jobTypeSTr: JobTypeStr): string {
        return this.getConstVal(jobTypeSTr);
    }

    //传递属性参数顺序为：智体轻灵
    calculateJob(jobTypeStr: JobTypeStr, wi: number, ps: number, af: number, de: number): number {
        let formula: string = this.getJobFormula(jobTypeStr);
        if (!formula) return -1;
        //console.log(formula);
        let calc = new MathCalc();
        let expr = calc.parse(formula);
        expr.scope = {wi: wi, ps: ps, af: af, de: de};
        let r = expr.eval();
        //console.log("calculateJob =", r);
        return r;

        // formula = formula.replace("wi", wi + "")
        //     .replace("ps", ps + "")
        //     .replace("af", af + "")
        //     .replace("de", de + "");
        //
        // let f = new Function("return " + formula + ";");
        // //console.log(formula);
        // //console.log(f.toString());
        // let r = f();
        // //console.log(r);
        // return r;
    }


    //缓存动画配置常量表
    private aniConstMap: Map<string, any> = null;

    getAniConstVal(aniConstName: string) {
        if (!this.aniConstMap) {
            this.aniConstMap = new Map<string, Object>();
            let constValue: any[] = CommonUtil.values(this.json["animeConst"]);
            constValue.forEach((value) => {
                this.constMap.set(value["name"], value["value"]);
            })
        }
        return this.constMap.get(aniConstName);
    }

    //缓存功能解锁表map
    // private functionOpenMap: Map<FunctionName, number> = null;

    isFunctionOpen(functionName: FunctionName, inFriendHome: boolean = false, isShowTip: boolean = false) {
        let item: IFunctionOpen = this.getFirstJson("functionOpen", (value: IFunctionOpen) => value.name == functionName);
        if (item.openType == 1) {
            const lockLv: number = item.value;//JsonMgr.getFunctionOpen(functionName);
            const userLv: number = inFriendHome ? DataMgr.friendData.level : DataMgr.getUserLv();
            if (isShowTip && userLv < lockLv) {
                let funcJson: IFunctionOpenJson = this.getFunctionOpenByName(functionName);
                let str = funcJson.description + "将于店长等级" + funcJson.value + "后放哦";
                UIMgr.showTipText(str);
            }
            return userLv >= lockLv;
        } else {
            let userDan: number = DataMgr.userData.positionId;
            let value: number = item.value;
            if (!userDan || !value) return false;
            return userDan >= value;
        }
    }

    getGoldMoonShopConfig(id: number): GoldMoonShopConfig {
        return this.getJson("goldMoonShop", id);
    }


    getShopBattleConfig(id: number): ShopBattleConfig {
        return this.getJson("shopBattle", id);
    }

    geShopBattleTeamConfig(id: number): ShopBattleTeamConfig {
        return this.getJson("shopbattleTeam", id);
    }

    getShopBattleCustomerInforConfig(id: number): ShopBattleCustomerInforConfig[] {
        let array: ShopBattleCustomerInforConfig[] = [];
        let shopBattleCustomerInfor = this.json["shopBattleCustomerInfor"];
        for (let i in shopBattleCustomerInfor) {
            if (shopBattleCustomerInfor[i]["groupId"] == id) {
                array.push(shopBattleCustomerInfor[i]);
            }
        }

        return array;
    }

    private staffConfig: StaffConfig;

    getStaffConfig(id: number): StaffConfig {
        const json = this.getJson("staff", id);
        if (!this.staffConfig) {
            this.staffConfig = new StaffConfig(json);
        } else {
            this.staffConfig.fill(json);
        }
        return this.staffConfig;
    }

    getStaffConfigSize(): number {
        return Object.keys(this.json["staff"]).length;
    }

    private staffRandomConfig: StaffRandomConfig;

    getStaffRandom(id: number): StaffRandomConfig {
        const json = this.getJson("staffRandom", id);
        if (!this.staffRandomConfig) {
            this.staffRandomConfig = new StaffRandomConfig(json);
        } else {
            this.staffRandomConfig.fill(json);
        }
        return this.staffRandomConfig;
    }

    private maxGoldFairCostId: number = -1;

    getGoldFairCostConfig(id: number): GoldFairCostConfig {
        const config: GoldFairCostConfig = this.getJson("goldFairCost", id);
        if (!config) {
            if (this.maxGoldFairCostId < 0) {
                this.maxGoldFairCostId = Object.keys(this.json["goldFairCost"]).length;
            }
            return this.getJson("goldFairCost", this.maxGoldFairCostId);
        }
        return config;
    }

    getFriendFairCostConfig(id: number): FriendFairConfig {
        let friendFairConfig: FriendFairConfig = null;
        let configs: any[] = this.getJsonArr("friendFair");
        if (configs) {
            for (let i = 0; i < configs.length; i++) {
                let config: FriendFairConfig = configs[i];
                if (config.talentDensityMax >= id && config.talentDensityMin <= id) {
                    friendFairConfig = config;
                }
            }
        }
        return friendFairConfig;
    }

    getGoldFairConfigByStar(star: number): GoldFairConfig {
        const id: number = star - 2;
        return this.getJson("goldFair", id);
    }

    getIncidentById(id: number) {
        let incidentConf = new IncidentConf();
        let obj = <IIncidentJson>this.getJson("incident", id);
        incidentConf.init(obj);
        return incidentConf;
    }

    getIncidentShowById(id: number) {
        let showConf = new IncidentShowConf();
        let obj = <IIncidentShowJson>this.getJson("incidentShow", id);
        if (!obj) {
            cc.error("Can not find in table incidentShow: id = " + id);
            return null;
        }
        showConf.init(obj);
        return showConf;
    }

    //------------地图新加
    getDecoShopJson(id: number): IDecoShopJson {
        return this.getJson("decoShop", id);
    }

    getShopJson() {
        return this.json["decoShop"];
    }

    getShelveLvJson(popularityNum: number, shopLv: number): IShelveLevelJson {
        let shelveValue = CommonUtil.values(this.json["shelveLevel"]);
        let ShelveLevelJson: IShelveLevelJson = null;
        let lastNeedPopulaity: number = 0;
        let cacheLv = 1;
        for (let nid = 0; nid < shelveValue.length; nid++) {
            if (shelveValue[nid].shop == shopLv) {
                if (cacheLv < shopLv) {
                    lastNeedPopulaity = 0;
                }
                if (popularityNum >= lastNeedPopulaity && popularityNum <= shelveValue[nid].needPopularity) {
                    ShelveLevelJson = shelveValue[nid];
                    break;
                }
            }
            lastNeedPopulaity = shelveValue[nid].needPopularity;
        }
        return ShelveLevelJson;
    }

    getFavorLevelJson(quality, level): IFavorLevelJson {
        return this.getFirstJson("favorLevel", (value: IFavorLevelJson) =>
            value.quality == quality && value.level == level);
    }

    getFavorLevelJsonById(xmlId: number) {
        return this.getJson("favorLevel", xmlId);
    }

    getFavorLevelAllJson() {
        return this.json["favorLevel"];
    }

    getAllInviteJson() {
        return this.json["invite"];
    }

    getFavorJson(staffID: number, Favorid: number): IFavorJson {
        return this.getFirstJson("favor", (value: IFavorJson) =>
            value.staffId == staffID && value.favorLevelId == Favorid);
    }

    getFavorJsonByType(staffID: number, typeId: number): IFavorJson {
        return this.getFirstJson("favor", (value: IFavorJson) =>
            value.staffId == staffID && value.type == typeId);
    }

    getAttributeJson(attId: number): IAttributeJson {
        return this.getJson("attribute", attId);
    }

    getAllFavorLvJson(): IFavorLevelJson[] {
        let favorLvJsons: IFavorLevelJson[] = [];
        let favorLvValues: any[] = CommonUtil.values(this.json["favorLevel"]);
        for (let nid = 0; nid < favorLvValues.length; nid++) {
            let quality = favorLvValues[nid].quality;
            let level = favorLvValues[nid].level;
            if (level != 0 || quality != 0) {
                favorLvJsons.push(favorLvValues[nid]);
            }

        }
        return favorLvJsons;
    }

    getGoodsJson(id): IGoodsJson {
        let goodsJson: IGoodsJson = null;
        goodsJson = this.getJson("goods", id);
        return goodsJson;
    }

    //道具商店
    getShopItemJson(): IItemJson[] {
        let itemJsons: IItemJson[] = []
        let itemValues: any[] = CommonUtil.values(this.json["item"]);
        for (let nid = 0; nid < itemValues.length; nid++) {
            if (itemValues[nid].canBuy && itemValues[nid].canBuy == 1) {
                itemJsons.push(itemValues[nid]);
            }
        }
        itemJsons.sort((a: IItemJson, b: IItemJson) => {
            if (a.unlockLevel != b.unlockLevel) {
                return a.unlockLevel - b.unlockLevel;
            }
            if (a.id != b.id) {
                return a.id - b.id;
            }
            return 0;
        })
        return itemJsons;
    }

    getNewShopJson(Type: TabbarType): IShopJson[] {
        let itemJsons: IShopJson[] = [];
        let boxJsons: IShopJson[] = [];
        let decoJsons: IShopJson[] = [];
        let lastJson: IShopJson[] = [];
        let itemValues: any[] = CommonUtil.values(this.json["shop"]);
        for (let item of itemValues) {
            if (item.commodityType == 1) {          //家具item
                decoJsons.push(item);
            } else if (item.commodityType == 2) {   //道具item
                itemJsons.push(item);
            } else {                                //宝箱
                boxJsons.push(item);
            }
        }
        if (Type == TabbarType.DECOSHOP) {
            lastJson = decoJsons;
        } else if (Type == TabbarType.ITEM) {
            lastJson = itemJsons;
        } else {
            lastJson = boxJsons;
        }

        lastJson.sort((a: IShopJson, b: IShopJson) => {
            return a.unclockLevel - b.unclockLevel;
        });
        let firstUnlockLv: number = DataMgr.iMarket.getTrueExpandTime();
        for (let item of lastJson) {
            if (item.unclockLevel > DataMgr.iMarket.getTrueExpandTime()) {
                firstUnlockLv = item.unclockLevel;
                break;
            }
        }
        lastJson.sort((a: IShopJson, b: IShopJson) => {
            if ((DataMgr.isLock(a) && DataMgr.isLock(b)) || (!DataMgr.isLock(a) && !DataMgr.isLock(b))) {
                return a.SortPriority - b.SortPriority;
            }
            if (DataMgr.isLock(a) && !DataMgr.isLock(b)) {
                return 1;
            }
            if (!DataMgr.isLock(a) && DataMgr.isLock(b)) {
                return -1;
            }
        });
        if (Type == TabbarType.TREASUREBOX) {   //宝箱可购买排前面
            lastJson.sort((a: IShopJson, b: IShopJson) => {
                if ((DataMgr.shopCanBuy(a.id) && DataMgr.shopCanBuy(b.id)) || (!DataMgr.shopCanBuy(a.id) && !DataMgr.shopCanBuy(b.id))) {
                    return b.SortPriority - a.SortPriority;
                } else if (DataMgr.shopCanBuy(a.id) && !DataMgr.shopCanBuy(b.id)) {
                    return -1;
                } else if (!DataMgr.shopCanBuy(a.id) && DataMgr.shopCanBuy(b.id)) {
                    return 1;
                }
            });
        }

        let shopData = [];
        for (let item of lastJson) {
            if (!DataMgr.isSaleNull(item.id) && item.unclockLevel <= firstUnlockLv) {
                shopData.push(item);
            }
        }
        return shopData;
    }

    getOneShopJson(id: number): IShopJson {
        return this.json["shop"][id];
    }

    getShopJsonByComId(id: number): IShopJson {
        return this.getFirstJson("shop", (value: IShopJson) => value.commodityId == id);
    }

    getSpecialTemplate(bbId: number): Array<ISpecialJson> {
        let specials: Array<ISpecialJson> = [];
        let speicalValues: any[] = CommonUtil.values(this.json["special"]);
        for (let nid = 0; nid < speicalValues.length; nid++) {
            if ((<ISpecialJson>speicalValues[nid]).bbId == bbId) {
                specials.push(speicalValues[nid]);
            }
        }
        specials.sort((a: ISpecialJson, b: ISpecialJson) => {
            if (a.specialId > b.specialId) return 1;
            return -1;
        });
        return specials;
    }

    getSpecialJson(id: number) {
        return this.json["special"][id];
    }

    //装饰商店
    getShopDecoJson(): IDecoShopJson[] {
        let itemJsons: IDecoShopJson[] = []

        let decoValues: any[] = CommonUtil.values(this.json["decoShop"]);
        for (let nid = 0; nid < decoValues.length; nid++) {
            if (decoValues[nid].canBuy == 1) {
                itemJsons.push(decoValues[nid]);
            }
        }
        let curXmID: number = DataMgr.iMarket.getWallPaper();
        itemJsons.sort((a: IDecoShopJson, b: IDecoShopJson) => {
            if (a.unlockLevel != b.unlockLevel) {
                return a.unlockLevel - b.unlockLevel;
            }
            if (a.SortPriority != b.SortPriority) {
                return a.SortPriority - b.SortPriority;
            }
            let aId: number = curXmID == a.id ? 1 : 0;
            let bId: number = curXmID == b.id ? 1 : 0;
            if (aId != bId) {
                return aId - bId;
            }
            let ahave: number = DataMgr.warehouseData.judgeIsHaveWall(a.id);
            let bhave: number = DataMgr.warehouseData.judgeIsHaveWall(a.id);
            if (ahave != bhave) {
                return ahave - bhave;
            }
            if (a.id != b.id) {
                return a.id - b.id;
            }
            return 0;
        })
        return itemJsons;
    }

    getInforMationJson(id): IInformationJson {
        return this.getJson("information", id);
    }

    getAllVipJson(): IVipJson[] {
        return this.json["vip"];
    }

    getVipJson(id: number): IVipJson {
        return this.getJson("vip", id);
    }

    getBuffJson(id): IBuffJson {
        return this.getJson("buff", id);
    }

    getItemTypeJson(): IItemTypeJson[] {
        let itemTypeJson: IItemTypeJson[] = [];
        let itemTypeValues: IItemTypeJson[] = CommonUtil.values(this.json["itemType"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            itemTypeJson.push(itemTypeValues[nid]);
        }
        return itemTypeJson;
    }

    getShelfLevel(xmlId: number): IShelveLevelJson {
        return this.json["shelveLevel"][xmlId];
    }

    getShelfLevelByPop(popularity: number) {
        let get: boolean = false;
        let result = 0;
        let obj = this.json["shelveLevel"];
        let marketId = DataMgr.getMarketId();
        Object.keys(obj).map((v) => {
            if (!get) {
                let data: IShelveLevelJson = obj[v];
                if (marketId === data.shop && data.needPopularity >= popularity) {
                    get = true;
                    result = data.id;
                }
            }
        });
        return result;
    }

    getExpandArea() {
        let posArr: cc.Vec2[] = [];
        let data = this.json["area"];
        let nowExp = DataMgr.iMarket.getExFrequency();
        Object.keys(data).map((v) => {
            let xmlData: IArea = data[v];
            if (xmlData.exFrequency === nowExp) {
                posArr.push(cc.v2(xmlData.x, xmlData.y));
            }
        });
        return posArr;
    }

    getShopLevel() {
        return this.json["shelveLevel"];
    }

    getBranchStore(xmlId: number): IBranchStore {
        return this.json["branchStore"][xmlId];
    }

    getBannerDataVO(bannerId: number): IBannerJson {
        return this.json["banner"][bannerId];
    }

    getPermanentBanner(type: number = 2): number[] {
        return this.getJsonArr("banner",
            (value: IBannerJson) => value.ifPermanent == 1 && (value.platform == 3 || value.platform == type)).map((value: IBannerJson) => value.id);
    }

    getTimeBanner(type: number = 2): number[] {
        return this.getJsonArr("banner",
            (value: IBannerJson) => value.ifFrontendControl == 1 && (value.platform == 3 || value.platform == type)).map((value: IBannerJson) => value.id);
    }

    getRechargeJson(rechargeId: number[], hasDrawGifts: number[]): IGiftPackageJson[] {
        return this.getJsonArr("banner",
            (value: IGiftPackageJson) =>
                rechargeId.indexOf(value.activityId) != -1
                && hasDrawGifts.indexOf(value.id) == -1);
    }

    getRechargeJsonByAcId(activeId: number): IGiftPackageJson[] {
        let rechargeInfo: IGiftPackageJson[] = [];
        let itemTypeValues: IGiftPackageJson[] = CommonUtil.values(this.json["giftPackage"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].activityId == activeId) {
                rechargeInfo.push(itemTypeValues[nid]);
            }
        }
        return rechargeInfo
    }

    getActivityJson(id): IActivityJson {
        return this.json["activity"][id];
    }

    getChargeJson(id): IChargeJson {
        return this.json["charge"][id];
    }

    getExRecharges(): IExRechargeJson[] {
        let exJson: IExRechargeJson[] = [];
        let itemTypeValues: IExRechargeJson[] = CommonUtil.values(this.json["exRecharge"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            exJson.push(itemTypeValues[nid]);
        }
        return exJson;
    }

    getExRechargeJson(id): IExRechargeJson {
        return this.json["exRecharge"][id];
    }

    getDialogueJson(id): IDialogueJson {
        return this.json["dialogue"][id];
    }

    getAssistanceJson(activityId, incidentId): IAssistanceJson {
        let itemTypeValues: IAssistanceJson[] = CommonUtil.values(this.json["assistance"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].activityId == activityId &&
                itemTypeValues[nid].incidentId == incidentId)
                return itemTypeValues[nid];
        }
    }

    getAssistanceJsonbyId(id: number): IAssistanceJson {
        return this.json["assistance"][id];
    }

    getDropJson(id): IDropJson {
        let itemTypeValues: IDropJson[] = CommonUtil.values(this.json["drop"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].dorpId == id) {
                return itemTypeValues[nid];
            }
        }
    }

    getPositionJson(id): IPositionJson {
        return this.getJson("position", id);
    }

    getNextRankPositionFirstJson(rank: number): IPositionJson {
        let json = this.json["position"];
        let thisRankAllJson: IPositionJson[] = [];
        for (let i in json) {
            if (json[i].rank == rank) {
                thisRankAllJson.push(json[i]);
            }
        }
        return thisRankAllJson[0];
    }

    getPosAllJson(): IPositionJson[] {
        return this.json["position"];
    }

    getPositionJsonByRank(rank: number): IPositionJson[] {
        let allPosJson = this.getPosAllJson();
        let sameRankJson: IPositionJson[] = [];
        for (let i in allPosJson) {
            if (allPosJson[i].rank == rank) {
                sameRankJson.push(allPosJson[i]);
            }
        }
        return sameRankJson;
    }

    getPositionLevelJson(rank, level): IPositionJson {
        return this.getFirstJson("position", (value: IPositionJson) =>
            value.rank == rank && value.level == level);
    }

    //排行
    getIncidentRankRewardByType(rewardId, rewardType, rank): IAssistanceRewardJson {
        let itemTypeValues: IAssistanceRewardJson[] = CommonUtil.values(this.json["assistanceReward"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].rewardId == rewardId &&
                itemTypeValues[nid].rewardType == rewardType) {
                let rankNums = itemTypeValues[nid].range;
                if (rank >= Number(rankNums[0]) && rank <= Number(rankNums[1])) {
                    return itemTypeValues[nid];
                }
            }
        }
        return null;
    }

    getDefaultFloorXmlData() {
        let xmlId: number = this.getConstVal("default_floor");
        return this.getDecoShopJson(xmlId);
    }

    getDecoEffect(id: number): IDecoEffectJson {
        return this.getJson("decoEffect", id);
    }

    getIncidentRankRewardById(id): IAssistanceRewardJson {
        return this.getJson("assistanceReward", id);
    }

    getAssistanceUpStaffIds(activityId): IAssistanceUpJson[] {
        let reseut: IAssistanceUpJson[] = [];
        let itemTypeValues: IAssistanceUpJson[] = CommonUtil.values(this.json["assistanceUp"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].activityId == activityId) {
                reseut.push(itemTypeValues[nid]);
            }
        }
        return reseut;
    }

    getIncidentRewardListByType(rewardId, rewardType): IAssistanceRewardJson[] {
        let rewardObjs = [];

        let itemTypeValues: IAssistanceRewardJson[] = CommonUtil.values(this.json["assistanceReward"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].rewardId == rewardId &&
                itemTypeValues[nid].rewardType == rewardType) {
                rewardObjs.push(itemTypeValues[nid]);
            }
        }
        return rewardObjs;
    }

    getIncidentRewardByActivityID(activeId): IAssistanceRewardJson[] {
        let rewardObjs = [];

        let itemTypeValues: IAssistanceRewardJson[] = CommonUtil.values(this.json["assistanceReward"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].activityId == activeId) {
                rewardObjs.push(itemTypeValues[nid]);
            }
        }
        return rewardObjs;
    }

    getMagAssetsXmlData() {
        return this.json["wxMapItemAssets"];
    }

    getTrueSceneData() {
        let time = (DataMgr.getMarketId() - 1) * 22 + DataMgr.iMarket.getExFrequency();
        return this.getSceneData(time);
    }

    getDecoEffectJson(id: number): IDecoEffectJson {
        return this.getJson("decoEffect", id);
    }

    getShareJsonByType(type: SHARE_TYPE): IShareJson {
        let shareJsons: IShareJson[] = this.getJsonArr("share",
            (value: IShareJson) => value.type == type).map((value: IShareJson) => value);
        let nIndx: number = CommonUtil.getRandomNum(shareJsons.length);
        return shareJsons[nIndx];
    }

    getAdvertisements(id: number): IAdvertisementJson {
        return this.getJson("advertisement", id);
    }

    getAllAdvertisements() {
        let jsonArr: IAdvertisementJson[] = [];
        let allJson = this.json["advertisement"];
        let userPositionId: number = DataMgr.userData.positionId;
        for (let i in allJson) {
            if (allJson[i].openPosition && userPositionId >= allJson[i].openPosition) {
                jsonArr.push(allJson[i]);
            }
        }
        return jsonArr;
    }

    // getAdverIseMentsByType(Type: number): IAdvertisementJson[] {
    //     this.getJsonArr("advertisement",
    //         (value: IAdvertisementJson) => value.ad == type).map((value: IShareJson) => value);
    // }

    getOption(xmlId: number): IOptionalTutorials {
        let json = this.json["optionalTutorials"];
        return json[xmlId];
    }

    getPos() {
        let value = this.getOption(2).value;
        let arr = value.split(",");
        return cc.v2(parseInt(arr[0]), parseInt(arr[1]));
    }

    getFunctionOpenByLv(level: number, openType: number = 1): IFunctionOpenJson[] {
        let openJson: IFunctionOpenJson[] = [];
        let itemTypeValues: IFunctionOpenJson[] = CommonUtil.values(this.json["functionOpen"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].openType == openType &&
                itemTypeValues[nid].value == level &&
                itemTypeValues[nid].icon) {
                openJson.push(itemTypeValues[nid]);
            }
        }
        return openJson;
    }

    getFunctionOpenByPositionId(positionId: number, openType: number = 1): IFunctionOpenJson[] {
        let openJson: IFunctionOpenJson[] = [];
        let itemTypeValues: IFunctionOpenJson[] = CommonUtil.values(this.json["functionOpen"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].openType == openType && itemTypeValues[nid].value == positionId && itemTypeValues[nid].icon && itemTypeValues[nid].isShow == 1) {
                openJson.push(itemTypeValues[nid]);
            }
        }
        return openJson;
    }

    getFunctionOpenByName(name: FunctionName): IFunctionOpenJson {
        let itemTypeValues: IFunctionOpenJson[] = CommonUtil.values(this.json["functionOpen"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].name === name) {
                return itemTypeValues[nid];
            }
        }
        return null;
    }

    getTips(xmlId: number): string {
        let tipsJson = this.getJson("tipsConst", xmlId);
        return tipsJson ? tipsJson.tips : "未知Tips:" + xmlId;
    }

    getDecorateUnlockLevel() {
        return this.getConstVal("");
    }

    //根据引导类型获取到当前所有的引导
    getSoftGuideJson(noviceType: number): ISoftGuideJson[] {
        let guideJosn: ISoftGuideJson[] = this.getJsonArr("softGuide",
            (value: ISoftGuideJson) => value.NoviceType == noviceType && value.childId == 1).map((value: ISoftGuideJson) => value);
        guideJosn.sort((a, b) => {
            return b.priority - a.priority
        })
        return guideJosn;
    }

    //根据groupId childId引导
    getSoftGuideJsoById(groupId: number, childId: number): ISoftGuideJson {
        let itemTypeValues: ISoftGuideJson[] = CommonUtil.values(this.json["softGuide"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].childId == childId &&
                itemTypeValues[nid].groupId == groupId)
                return itemTypeValues[nid];
        }
        return null;
    }

    getOptionalTutorialsJson(talkId): IOptionalTutorialsTextJson {
        let itemTypeValues: IOptionalTutorialsTextJson[] = CommonUtil.values(this.json["optionalTutorialsText"]);
        for (let nid = 0; nid < itemTypeValues.length; nid++) {
            if (itemTypeValues[nid].id == talkId)
                return itemTypeValues[nid];
        }
        return null;
    }

    getInspireInfo(type) {
        let json: IInspireInfoJson[] = this.getJsonArr("inspireInfo",
            (value: IInspireInfoJson) => value.inspireType == type);

        let id = CommonUtil.getRandomNum(json.length);
        return json[id].inspireInfo;
    }
}

export const JsonMgr: JsonManager = JsonManager.instance;

export enum FunctionName {
    notice = "notice",
    signOn = "signOn",
    task = "task",
    order = "order",
    mailbox = "mailbox",
    friend = "friend",
    foster = "foster",
    shop = "shop",
    recruit = "recruit",
    Promotion = "Promotion",
    goldDraw = "goldDraw",
    diamDraw = "diamDraw",
    transport = "transport",
    tourbus = "tourbus",
    dailyTas = "dailyTas",
    shopBattle = "shopBattle",
    GoldExchange = "GoldExchange",
    SenceUp = "senceUp",
    BillboardUp = "billboardUp",
    decorate = "decorate",
    staff = "staff",
    staffInfo = "staffInfo",
    staffPosition = "staffPosition",
    charge = "charge",
    movie = "movie",
    assistance = "assistance",
    fuli = "fuli",
}

export class SceneConfig {
    id: number;
    expandFrequency: number;
    passer: string;

    constructor(other: SceneConfig) {
        this.fill(other);
    }

    fill(other: SceneConfig) {
        CommonUtil.copy(this, other);
    }
}

export interface NameConfig {
    firstName: string;
    lastName: string;
    description: string;
}

export interface StaffLevelConfig {
    id: number;
    level: number;
    exp: number;
    allExp: number;
    leave: string;
}

export interface GoldFairConfig {
    staffStar: number;
    appearChance: number;
    showWord: string;
}

export class StaffRandomConfig {
    id: number;
    artResId: number;
    star: number;
    goldFail: string;
    leave: string;
    leaveMax: string;
    sex: number;
    skillNum: number;
    skill: number[];
    advantageLimit: number[];

    firstNameId: number[];
    lastNameId: number[];

    constructor(other: StaffRandomConfig) {
        this.fill(other);
    }

    fill(other: StaffRandomConfig) {
        CommonUtil.copy(this, other);
    }

    getGoldFailRewards(): Array<Reward> {
        return CommonUtil.toRewards(this.goldFail);
    }

    getLeaveRewards(): Array<Reward> {
        return CommonUtil.toRewards(this.leave);
    }

    getLeaveMaxRewards(): Array<Reward> {
        return CommonUtil.toRewards(this.leaveMax);
    }

}

export interface Base {
    id: number;
    baseId: number;
    propId: number;
    weight: number;
}

export interface GoldFairCostConfig {
    id: number;
    talentDensity: number;
    talentDensityCost: number;
    goldCost: number;
    spStarCost: number;
    uniqueStarCost: number;
    fiveStarCost: number;
    fourStarCost: number;
    threeStarCost: number;
    appearChances: string;
}

export interface FriendFairConfig {
    id: number;
    talentDensityMax: number;
    talentDensityMin: number;
    cost: string;
}

export interface StaffFireConfig {
    star: number;
    returnType: number;
    dropId: Array<number>;
}

export interface ShopBattleConfig {
    id: number;
    staffTeamId: number;
    postId: number;
    advantageId: number;
    informationId: number;
    reward: string;
    name: string;
    headIcon: number;
}

export interface ShopBattleTeamConfig {
    id: number;
    post1: number;
    post2: number;
    post3: number;
    post4: number;
    score1: number;
    score2: number;
    score3: number;
    score4: number;
    score: number;
    name: string;
}

export interface ShopBattleCustomerInforConfig {
    id: number;
    groupId: number;
    stepId: number;
    expressionIcon: string;
    chatType: number;
    CopyWriting: string;
}

export interface GoldMoonShopConfig {
    id: number;
    name: string;
    itemType: number;
    itemId: number;
    ifBuyMany: number;
    price: number;
    itemNum: number;
}

export class StaffConfig {

    id: number;
    star: number;
    canRecruit: number;
    sex: number;

    name: string;
    property: number[];
    advantage: number[];
    advantageLimit: number[];
    fitJob: string;
    artResId: number;
    description: string;
    initPost: number;

    company: number;
    weight: number;

    goldFail: string;
    goldRepeat: string;
    diamRepeat: string;

    favorAdvancedItem: string;

    constructor(other: StaffConfig) {
        this.fill(other);
    }

    fill(other: StaffConfig) {
        CommonUtil.copy(this, other);
    }

    calcSuggestId() {
        const attributes: number[] = [this.cash(), this.tally(), this.sales(), this.soli()];
        let maxIndex: number = -1;
        let maxVal: number = 0;
        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i] > maxVal) {
                maxIndex = i;
                maxVal = attributes[i];
            }
        }
        return maxIndex;
    }

    tally() {
        // return this.getPower() + 0.5 * this.getPatience() + 0.2 * this.getGlamour() + 0.1 * this.getIntelligence();
        return this.calculateJob(JobTypeStr.tallyman);
    }

    sales() {
        // return this.getPatience() + 0.5 * this.getIntelligence() + 0.2 * this.getPower() + 0.1 * this.getGlamour();
        return this.calculateJob(JobTypeStr.saleman);
    }

    cash() {
        // return this.getIntelligence() + 0.5 * this.getGlamour() + 0.2 * this.getPatience() + 0.1 * this.getPower();
        return this.calculateJob(JobTypeStr.cashier);
    }

    soli() {
        // return this.getGlamour() + 0.5 * this.getPower() + 0.2 * this.getIntelligence() + 0.1 * this.getPatience();
        return this.calculateJob(JobTypeStr.touter);
    }

    private calculateJob(jobTypeStr: JobTypeStr) {
        return JsonMgr.calculateJob(jobTypeStr, this.getIntelligence(), this.getPower(),
            this.getGlamour(), this.getPatience());
    }

    getIntelligence(): number {
        return this.property[2];
    }

    getPower(): number {
        return this.property[0];
    }

    getPatience(): number {
        return this.property[1];
    }

    getGlamour(): number {
        return this.property[3];
    }

    getGoldFailRewards(): Array<Reward> {
        return CommonUtil.toRewards(this.goldFail);
    }

    getGoldRepeatRewards(): Array<Reward> {
        return CommonUtil.toRewards(this.goldRepeat);
    }

    getDiamRepeatRewards(): Array<Reward> {
        return CommonUtil.toRewards(this.diamRepeat);
    }
}

export interface StaffModConfig {
    id: number;
    name: string;
    friendIcon: string;
    isSpecial: number;
}

export class XmlDress {
    name: string;
    canBuy: number;
    type: number;
    description: string;
    unlockLevel: number;
    stacking: number;
    //花费材料
    consumption: string;

    setData = (data: any) => {
        this.name = data.name;
        this.canBuy = data.canBuy;
        this.type = data.type;
        this.description = data.description;
        this.unlockLevel = data.unlockLevel;
        this.stacking = data.stacking;
        this.consumption = data.consumption;
    };
}


export class XmlProMotion {
    //商品1
    goodstype1: number;
    //商品2
    goodstype2: number;

    setData = (data: any) => {
        this.goodstype1 = data.goodstype1;
        this.goodstype2 = data.goodstype2;
    };
}

export class XmlPromotionMod {
    //员工模型id
    staffid: number;
    //描述
    info: string;
    futureInfo: string;
    setData = (data: any) => {
        this.staffid = data.staffid;
        this.info = data.info;
        this.futureInfo = data.futureInfo;
    };
}

export class XmlGoodsGroup {
    id: number;
    goodsId: Array<number>;
    unlockType: number;
    unlock: Array<number>;


    setData = (data: any) => {
        this.id = data.id;
        this.goodsId = data.goodsId;
        this.unlockType = data.unlockType;
        this.unlock = data.unlock;
    };


    getUnlockVal(idx: number) {
        for (let index = 0; index < this.goodsId.length; index++) {
            if (this.goodsId[index] == idx) {
                return this.unlock[index] + "";
            }
        }

        return "";
    }

    getUnlockLv(goodsId: number) {
        let goodsGr: XmlGoodsGroup = JsonMgr.getGoodsGroup(0);
        for (let index = 0; index < goodsGr.goodsId.length; index++) {
            if (goodsGr.goodsId[index] == goodsId) {
                return goodsGr.unlock[index] + "";
            }
        }
    }
}
