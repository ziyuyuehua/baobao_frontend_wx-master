/**
 * @Author whg
 * @Date 2019/2/26
 * @Desc
 */

import {Consume, DataMgr} from "./DataManager";
import {Staff} from "./StaffData";
import {ClientEvents} from "../global/manager/ClientEventCenter";
import {RedConst} from "../global/const/RedConst";
import {
    FriendFairConfig, FunctionName, GoldFairConfig, GoldFairCostConfig,
    JsonMgr
} from "../global/manager/JsonManager";
import {IDiamondRecruit, IFriendRecruit, IRecruit, ITelnetMarket} from "../types/Response";
import {ItemIdConst} from "../global/const/ItemIdConst";
import {CommonUtil, Reward} from "../Utils/CommonUtil";
import {ShelvesType} from "./market/ShelvesDataModle";

export class RecruitData {

    private diamondRecruit: DiamondRecruit = null;
    private recruit: Recruit = null;
    private friendRecruit: FriendRecruit = null;

    fill(talentMarket: ITelnetMarket) {
        this.updateDiamondRecruit(talentMarket.diamondRecruit);
        this.updateRecruit(talentMarket.recruit);
        ClientEvents.UPDATE_MAINUI_RED_GONG.emit({ FeaturesId: RedConst.RECRUITRED, status: this.hasRedPoint() });
    }
    updateFriendRecruit(diamondRecruit: IFriendRecruit){
        this.friendRecruit = new FriendRecruit(diamondRecruit);
    }
    updateDiamondRecruit(diamondRecruit: IDiamondRecruit){
        this.diamondRecruit = new DiamondRecruit(diamondRecruit);
    }

    updateRecruit(recruit: IRecruit) {
        this.recruit = new Recruit(recruit);
        //CommonUtil.copy(this.recruits[recruit.index], recruit);
    }

    getRecruit(): Recruit {
        return this.recruit;
    }
    getFriendRecruit(): FriendRecruit {
        return this.friendRecruit;
    }

    getDiamondRecruitResults(): Array<RecruitResult> {
        return this.diamondRecruit.recruitResults;
    }

    hasDiamondFreeCount(): boolean {
        return this.diamondRecruit.freeCount > 0;
    }

    getDiamondFreeCount() {
        return this.diamondRecruit.freeCount;
    }

    hasRedPoint(): boolean {
        return this.hasDiamondFreeCount() || this.hasDiamondItem() || this.recruit.hasRedPoint();
    }

    private hasDiamondItem(): boolean {
        return DataMgr.hasItem(ItemIdConst.STAFF_PAPER_ONE)
            || DataMgr.hasItem(ItemIdConst.STAFF_PAPER_FIVE);
    }

}

export class DiamondRecruit {

    freeCount: number = 0;
    recruitResults: Array<RecruitResult> = null;

    constructor(recruit: IDiamondRecruit){
        this.freeCount = recruit.freeCount;
        this.recruitResults = recruit.recruitResults.map((result: RecruitResult) => new RecruitResult(result));
    }
}

export class Recruit {

    remainTime: number;
    count: number;
    freeCount: number;
    freeIndex: number;
    recruitStaffs: Array<RecruitResult>;
    totalRecruitCnt:number;

    constructor(recruit: IRecruit) {
        // 浅拷贝满足不了需求了，需要自己写代码做深拷贝
        // CommonUtil.copy(this, recruit);

        this.remainTime = recruit.remainTime;
        this.count = recruit.count;
        this.freeCount = recruit.freeCount;
        this.freeIndex = recruit.freeIndex;
        this.totalRecruitCnt = recruit.totalRecruitCnt;

        this.recruitStaffs = new Array<RecruitResult>(recruit.recruitResults.length);
        recruit.recruitResults.forEach((result: RecruitResult, index) => {
            this.recruitStaffs[index] = new RecruitResult(result);
        })
    }
    getRecruitGold(star: number): number {
        let config: GoldFairCostConfig = JsonMgr.getGoldFairCostConfig(this.getConfigCount());
        if (star > 5) {
            return config.uniqueStarCost;
        } else if (star == 5) {
            return config.fiveStarCost;
        } else if (star == 4) {
            return config.fourStarCost;
        } else {
            return config.threeStarCost;
        }
    }
    getConfigCount(): number {
        return Math.max(1, this.count);
    }

    getNextConfigCount(): number {
        return Math.max(1, this.count+1);
    }

    updateRemainTime(millis: number) {
        this.remainTime = millis;
    }

    hasRedPoint(): boolean {
        return JsonMgr.isFunctionOpen(FunctionName.goldDraw)
            && (this.hasFreeStaff() || (this.hasGoldFreeCount() && !this.hasRemainTime()));
    }

    hasGoldFreeCount(): boolean {
        return this.freeCount > 0;
    }

    hasFreeStaff() {
        return this.hasRemainTime() && this.freeIndex >= 0 && this.freeIndex < this.recruitStaffs.length;
    }

    hasRemainTime(): boolean {
        return this.remainTime > 0;
    }
    isHaveItem():boolean{//是否还有球
        let bo:boolean = false;
        for (let i = 0; i < this.recruitStaffs.length; i++) {
            let data: RecruitResult = this.recruitStaffs[i];
            if(data.itemXmlId != -1){
                bo = true;
            }
        }
        return bo;
    }

}
export class FriendRecruit {

    freeIndex: number = -1;
    recruitStaffs: Array<FriendRecruitResult>;

    constructor(recruit: IFriendRecruit) {
        // 浅拷贝满足不了需求了，需要自己写代码做深拷贝
        // CommonUtil.copy(this, recruit);
        this.freeIndex = -1;

        this.recruitStaffs = new Array<FriendRecruitResult>(recruit.friendRecruits.length);
        recruit.friendRecruits.forEach((result: FriendRecruitResult, index) => {
            this.recruitStaffs[index] = new FriendRecruitResult(result);
        })
    }
    getRecruitGold(star: number,index:number): string {
        let config: GoldFairCostConfig = JsonMgr.getGoldFairCostConfig(this.getConfigCount(index));
        let getFriendFairCostConfig:FriendFairConfig = JsonMgr.getFriendFairCostConfig(config.talentDensity);
        return getFriendFairCostConfig.cost;
    }
    getConfigCount(index): number {
        return Math.max(1, this.recruitStaffs[index].recruitCount);
    }

    getNextConfigCount(index): number {
        return Math.max(1, this.recruitStaffs[index].recruitCount+1);
    }

    hasRedPoint(): boolean {
        return JsonMgr.isFunctionOpen(FunctionName.goldDraw)
            && (this.hasFreeStaff());
    }
    hasFreeStaff() {
        return   this.freeIndex >= 0 && this.freeIndex < this.recruitStaffs.length;
    }
    isHaveItem():boolean{//是否还有球
        let bo:boolean = false;
        for (let i = 0; i < this.recruitStaffs.length; i++) {
            let data: FriendRecruitResult = this.recruitStaffs[i];
            if(data.itemXmlId != -1){
                bo = true;
            }
        }
        return bo;
    }

}
export class FriendRecruitResult {
    staff: Staff = null;
    itemXmlId: number = -1;
    endTime:number = 0;
    recruitCount:number = 0;
    recruitResult:any = {};
    decoShopJson: IDecoShopJson = null;
    num:number = 1;
    constructor(result: FriendRecruitResult){
        this.num = result.recruitResult.num;
        this.itemXmlId = result.recruitResult.itemXmlId;
        this.endTime = result.endTime;
        this.recruitCount = result.recruitCount;
        if(result.recruitResult.staff){
            this.staff = new Staff(result.recruitResult.staff);
        }else{
            this.decoShopJson = JsonMgr.getDecoShopJson(this.itemXmlId);
        }
    }
    isStaff(){
        return this.staff != null;
    }
    getName():string{
        return this.staff ? this.staff.getName() : this.decoShopJson.name;
    }
    getProbability():string{
        let str:string = "未知";
        let showWords: string[] = ["未知"];
        if(this.staff){
            const config: GoldFairConfig = JsonMgr.getGoldFairConfigByStar(this.staff.star);
            showWords = config ? config.showWord.split(",") : ["未知"];
            str = showWords[0];
        }else{
            let decoShopJson: IDecoShopJson = JsonMgr.getDecoShopJson(this.itemXmlId);
            const config: GoldFairConfig = JsonMgr.getGoldFairConfigByStar(decoShopJson.color);
            showWords = config ? config.showWord.split(",") : ["未知"];
        }
        str = showWords[0];
        return str;
    }
    getStar(): number { //星级:员工是star货架是color
        return this.staff ? this.staff.star : this.decoShopJson.color;
    }
    getGoldFailRewards():Array<Reward>{
        let arr:Array<Reward> = [];
        if(this.staff){
            arr = this.staff.getGoldFailRewards();
        }else{
            let decoShopJson: IDecoShopJson = JsonMgr.getDecoShopJson(this.itemXmlId);
            let rewardsArr = decoShopJson.goldFail.split(";");
            for(let i = 0;i<rewardsArr.length;i++){
                let rewArr = rewardsArr[i].split(",");
                let reward:Reward = new Reward(parseInt(rewArr[0]),parseInt(rewArr[1]));
                arr.push(reward)
            }
        }
        return arr;
    }
    isUnique(){ //是否6星unique
        if(this.staff){
            return this.staff.isUnique();
        }else{
            return this.decoShopJson.color > 5;
        }
    }
    isNew(){ //是否是新得到的，金币招募可直接使用，因为金币每次值招募一个；但是钻石招募多个还需要多一次判断
        if(this.staff){
            return this.staff.isUnique() ? !DataMgr.staffData.hasStaffByResId(this.staff.artResId) : false;
        }else{
            return !DataMgr.iMarket.checkHasCaseById(this.itemXmlId);
        }
    }
    getResId(){ //资源显示id
        return this.staff ? this.staff.artResId : this.itemXmlId;
    }
}

export class RecruitResult {

    staff: Staff = null;

    itemXmlId: number;
    decoShopJson: IDecoShopJson = null;

    num: number = 1;
    new: boolean = false;
    repeated: boolean = false;
    goldRecruitIndex: number = -1;

    constructor(result: RecruitResult){
        this.itemXmlId = result.itemXmlId;
        if(result.staff){
            this.staff = new Staff(result.staff);
        }else{
            this.decoShopJson = JsonMgr.getDecoShopJson(this.itemXmlId);
        }

        this.num = result.num;
        this.new = result.new;
        this.goldRecruitIndex = result.goldRecruitIndex;
    }

    isFloor(){
        return !this.isStaff() && this.decoShopJson.mainType == ShelvesType.FloorShelve;
    }
    isStaff(){
        return this.staff != null;
    }
    getName():string{
        return this.staff ? this.staff.getName() : this.decoShopJson.name;
    }
    getProbability():string{
        let config: GoldFairConfig = JsonMgr.getGoldFairConfigByStar(this.getStar());
        let showWords: string[] = config ? config.showWord.split(",") : ["未知"];
        return showWords[0];
    }
    isStar(star: number){
        return this.getStar() == star;
    }
    getStar(): number { //星级:员工是star货架是color
        return this.staff ? this.staff.star : this.decoShopJson.color;
    }
    getGoldRepeatRewards(){
        return this.staff ? this.staff.getGoldRepeatRewards() : CommonUtil.toRewards(this.decoShopJson.goldRepeat);
    }
    getGoldFailRewards(): Array<Reward>{
        return this.staff ? this.staff.getGoldFailRewards() : CommonUtil.toRewards(this.decoShopJson.goldFail);
    }
    getDiamRepeatRewards(): Array<Reward>{
        return this.staff ? this.staff.getDiamRepeatRewards() : CommonUtil.toRewards(this.decoShopJson.diamRepeat);
    }
    getLeaveRewards(): Array<Reward>{
        return this.staff ? this.staff.getLeaveRewards() : CommonUtil.toRewards(this.decoShopJson.recoveryPrice);
    }
    isUnique(){ //是否6星unique
        if(this.staff){
            return this.staff.isUnique();
        }else{
            return this.decoShopJson.color > 5 && this.new/* && JsonMgr.isUniqueCase(this.itemXmlId)*/;
            // return !DataMgr.iMarket.checkHasCaseById(this.itemXmlId);
        }
    }
    isRepeated(){
        if(this.staff){
            return this.staff.isUnique() ? DataMgr.staffData.hasStaffByResId(this.staff.artResId) : false;
        }else{
            return this.repeated;
        }
    }
    getResId(){ //资源显示id
        return this.staff ? this.staff.artResId : this.itemXmlId;
    }
}
