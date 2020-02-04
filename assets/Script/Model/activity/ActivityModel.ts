import {JsonMgr} from "../../global/manager/JsonManager";
import {AssistanceInfoVO, IActivitiesInfo, IEntranceInfo, IIncident, IUserBaseItem} from "../../types/Response";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

export enum ActiVityType {
    RecruitUpAct = 1,   //抽卡概率up
    CommunityBig = 2,   //社区大活动
    CommunityShop = 3,  //社区商店
    CommunityTarget = 4, //社区目标
    CommUnityHelp = 5,  //社区协助
    TriggerGift = 6,    //触发式礼包
    BuyGift = 7,    //直够礼包
    DateGift = 8,   //周期刷新礼包
    firstCharge = 9,    //首冲活动
    AddCharge = 10,    //累计充值
    vip = 11,//会员
}

//社区活动状态
export enum ActiVityState {
    NASCENT = 1,    //未开启
    CREATE = 2,
    START = 4,      //开始
    OVER = 5        //结束
}

//社区宝箱状态
export enum IncitientBoxState {
    FRESH = 1,  //新产出的
    GOING = 2, //进行中的
    FINISHED = 3,    //完成的
    EXPIRE = 4, //过期的
    REWARD = 5,//可领取
    RECEIVED = 6,    //已经领取
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class ActivityModel {
    private MaxProNum: number = -1;

    private MainActivity: IActivitiesInfo = null;
    private WordActivity: IActivitiesInfo = null;
    private IncitentActivity: IActivitiesInfo = null;
    private LastTermActicity: IActivitiesInfo = null;
    private incitentInfo: IIncident = null;
    private memberInfo: IUserBaseItem[] = [];
    private maxAssistanceNum: boolean = null;
    private assistanceInfo: AssistanceInfoVO = null;
    private totalMember: number = 0;
    private isLast: boolean = false;

    fulldata(response: IEntranceInfo) {
        this.MainActivity = response.activities[0];
        this.WordActivity = response.activities[1];
        this.IncitentActivity = response.activities[2];
        this.LastTermActicity = response.activities[3];
        this.totalMember = response.totalMember;
        if (response.incident) {
            this.setIncident(response.incident);
        }
        if (response.members) {
            this.setMembers(response.members);
        }

        if (response.info) {
            this.setAssistInfo(response.info);
        }
        if (response.maxAssistanceNum) {
            this.maxAssistanceNum = response.maxAssistanceNum;
        }
    }

    setIsLast(last: boolean) {
        this.isLast = last;
    }

    getIsLast() {
        return this.isLast;
    }

    //获取本期活动商店id
    getNowShopInfo() {
        return this.WordActivity.xmlId;
    }

    //获取上期活动商店数据
    getLastTermActivity() {
        return this.LastTermActicity;
    }

    //获取上期活动商店id
    getLastShopInfo() {
        return this.LastTermActicity.xmlId;
    }

    getMaxAssistanceNum() {
        return this.maxAssistanceNum;
    }

    getIncident() {
        return this.incitentInfo;
    }

    getAssistInfo() {
        return this.assistanceInfo;
    }

    setIncident(incidentVo: IIncident) {
        this.incitentInfo = incidentVo;
    }

    setMembers(members: IUserBaseItem[]) {
        this.memberInfo = members;
    }

    setAssistInfo(info: AssistanceInfoVO) {
        this.assistanceInfo = info;
    }

    //获取头像数组
    getMemberInfo() {
        return this.memberInfo
    }

    //获取可领取奖励最大值
    getMaxIndicient() {
        return JsonMgr.getIncidentById(this.incitentInfo.xmlId).getDegree()
    }

    //获取当前值
    getCurIndicient() {
        return this.incitentInfo.process
    }

    //获取当前宝箱的状态
    getBoxState() {
        return this.incitentInfo.state
    }

    //获取当前协助活动的状态
    getIncitentActivityState() {
        return this.IncitentActivity.state;
    }

    //获取当前协助活动的xmlid
    getIncitentActicityXmlId() {
        return this.MainActivity.xmlId;
    }

    //获取当前协助活动的剩余时间
    getIncitentLeftTime() {
        return this.IncitentActivity.leftTime;
    }

    //主活动json
    getActivityJson(): IActivityJson {
        return JsonMgr.getActivityJson(this.MainActivity.xmlId);
    }

    //assistan表
    getAssistanveJson(): IAssistanceJson {
        if (this.IncitentActivity == null) {
            return null;
        }
        return JsonMgr.getAssistanceJson(this.IncitentActivity.xmlId, this.incitentInfo.xmlId);
    }

    //字活动跳转类型
    getZiJumpType() {
        return JsonMgr.getActivityJson(this.WordActivity.xmlId).type;
    }

    //协助ID
    getIncidentId(): number {
        return this.incitentInfo.xmlId;
    }

    //后端唯一ID
    getServerIncidentId(): number {
        return this.incitentInfo.id;
    }

    //设置协助数据
    setIncitentVo(response: IIncident) {
        this.incitentInfo = response
    }


    resetMaxProNum() {
        this.MaxProNum = -1;
    }

    //排行榜
    getRankPro(curNum) {
        if (this.MaxProNum <= 0) {
            this.MaxProNum = curNum;
        }
        if (this.MaxProNum == 0) {
            return 0;
        }
        return curNum / this.MaxProNum;
    }

    //最大数值
    getMaxProNum() {
        return this.MaxProNum;
    }

    //人数
    getTotalMember() {
        return this.totalMember;
    }

    // update (dt) {}
}
