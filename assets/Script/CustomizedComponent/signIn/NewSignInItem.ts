import {DataMgr} from "../../Model/DataManager";
import {TimeUtil} from "../../Utils/TimeUtil";
import {JsonMgr} from "../../global/manager/JsonManager";
import {CommonUtil} from "../../Utils/CommonUtil";
import {UIMgr} from "../../global/manager/UIManager";
import {ResMgr} from "../../global/manager/ResManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import CommoTips from "../common/CommonTips";


const {ccclass, property} = cc._decorator;

@ccclass
export default class SignInItem extends cc.Component {

    @property(cc.Node)
    private calendar: cc.Node = null;//选钟当天签到
    @property(cc.Node)
    private calendar1: cc.Node = null;//选钟当天签到
    @property([cc.Label])
    private Label: Array<cc.Label> = [];//月日，奖励数量
    @property(cc.Sprite)
    private rewardBox: cc.Sprite = null;
    @property(cc.Sprite)
    private rewardIcon: cc.Sprite = null;
    @property(cc.Node)
    private rewardMask: cc.Node = null;
    @property(cc.Sprite)
    private signInState: cc.Sprite = null;
    @property(cc.SpriteFrame)
    private signInStateImg: cc.SpriteFrame = null;
    @property(cc.Node)
    private signInRew: cc.Node = null;

    // setCalendar = {
    //     year: 2019,
    //     month: 9,
    //     day: 1,
    //     // countDay: 0,//当月总天数
    //     week: 0,//值为0-6，代表星期1-7
    // };
    private dayNum: number;

    start() {
        this.load();
    }

    load = () => {

        let time = new Date(DataMgr.getServerTime());
        let year = time.getFullYear();//TimeUtil.getDataYear(time);
        let month = time.getMonth();//TimeUtil.getDataMonth(time) - 1;
        let day = time.getDate();//TimeUtil.getDataDate(time);
        if (time.getHours() < 5) {
            if (day === 1) {
                day = new Date(year, month, 0).getDate();
                let month1 = month - 1;
                month1 < 0 && year--;
                month = month1 < 0 ? 11 : month1;
            } else {
                day--;
            }
        }
        let nowdate = new Date(year, month, day);
        let week1 = nowdate.getDay();
        let week = week1 == 0 ? 7 : week1;
        let beforeDate = SignInItem.addDay(-week + 1, nowdate);

        let weekNode = parseInt(this.node.name);

        let newDate = SignInItem.addDay(weekNode - 1, beforeDate);
        this.Label[0].string = newDate.getMonth() + 1 + "月" + newDate.getDate() + "日";

        let string = year + TimeUtil.padding(month + 1) + TimeUtil.padding(newDate.getDate());
        let d = parseInt(string);
        let d1 = nowdate.getDay() == 0 ? 7 : nowdate.getDay();
        this.attachmentInit(JsonMgr.getSingOn(d));
        this.dayNum = newDate.getDate();
        let signInData = DataMgr.signInData;


        if (newDate.getTime() < nowdate.getTime()) {
            this.rewardMask.active = true;
            if (signInData.alreadyCheckin.indexOf(this.dayNum) == -1) {
                this.signInState.spriteFrame = this.signInStateImg;
            }
        }
        // if (newDate.getMonth() + 1 < month) {
        //     this.rewardMask.active = true;
        //     if (signInData.alreadyCheckin.indexOf(this.dayNum) == -1) {
        //         this.signInState.spriteFrame = this.signInStateImg;
        //     }
        // } else if (newDate.getMonth() + 1 == month) {
        //     if (this.dayNum < day) {
        //         this.rewardMask.active = true;
        //         if (signInData.alreadyCheckin.indexOf(this.dayNum) == -1) {
        //             this.signInState.spriteFrame = this.signInStateImg;
        //         }
        //     }
        // }
        if (this.dayNum === day) {
            if (signInData.isCheckinToday) {
                this.signInRew.active = false;
                this.rewardMask.active = true;
                //今天签到后，明日签到可额外 领取以下奖励哦~
                let d2 = d1 === 7 ? 1 : d1 + 1;
                ClientEvents.SIGNIN_CONTINUOUS.emit(1, JsonMgr.getSignOnBox(d2));
            } else {
                this.signInRew.active = true;
                this.calendar.active = true;
                // this.calendar1.active = true;
                this.Label[0].node.color = new cc.Color(229, 111, 15);
                let now = SignInItem.addDay(-1, newDate);
                if (signInData.alreadyCheckin.indexOf(now.getDate()) > -1) {
                    //昨天签今天没签，今日签到可额外 领取以下奖励哦~
                    ClientEvents.SIGNIN_CONTINUOUS.emit(2, JsonMgr.getSignOnBox(d1));
                } else {
                    //昨天今天都没签，今日签到后 明日再次签到可额外 领取以下奖励哦~
                    let d2 = d1 === 7 ? 1 : d1 + 1;
                    ClientEvents.SIGNIN_CONTINUOUS.emit(3, JsonMgr.getSignOnBox(d2));
                }
            }
        }
    };

    //附件初始化
    attachmentInit = (reward: number[]) => {
        let t = JsonMgr.getInformationAndItem(reward[0]);
        if (!t) {
            return;
        }
        ResMgr.getItemBox(this.rewardBox, "k" + t.color, 0.7);
        ResMgr.imgTypeJudgment(this.rewardIcon, reward[0]);
        this.Label[1].string = CommonUtil.numChange(reward[1], 1) + "";
        UIMgr.addDetailedEvent(this.rewardBox.node, reward[0], null, 10002);
    };


    static addDay(dayNumber, date) {
        date = date ? date : new Date();
        let ms = dayNumber * (1000 * 60 * 60 * 24);
        return new Date(date.getTime() + ms);
    }

    // update (dt) {}
}
