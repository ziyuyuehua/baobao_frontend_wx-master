import { DataMgr } from "../Model/DataManager";

/*
 * @Author: tyq 
 * @Date: 2019-01-06 
 * @Desc: time工具类
 */

export class TimeUtil {

    static DAY = 24 * 60 * 60 * 1000;
    static HOUR = 60 * 60 * 1000;
    static MINUTE = 60 * 1000;
    static SECOND = 1000;

    // 对Date的扩展，将 Date 转化为指定格式的String
    // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
    // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
    // 例子：
    // (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
    // (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
    static format(dateOrTime: Date | number, fmt: string = "yyyy-MM-dd hh:mm:ss") { //author: meizz
        let date: Date = null;
        if (dateOrTime instanceof Date) {
            date = dateOrTime;
        } else if (typeof dateOrTime === "number") {
            date = new Date(dateOrTime);
        }

        let o = {
            "M+": date.getMonth() + 1,                 //月份
            "d+": date.getDate(),                    //日
            "h+": date.getHours(),                   //小时
            "m+": date.getMinutes(),                 //分
            "s+": date.getSeconds(),                 //秒
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度
            "S": date.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (let k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    /**
     * @param {number} leftMillis 剩余毫秒
     * @returns {string} 返回剩余时间【时:分:秒】
     */
    static getLeftTimeStr(leftMillis: number): string {
        let hour = leftMillis / TimeUtil.HOUR;
        let remainder = leftMillis % TimeUtil.HOUR;
        let minute = remainder / TimeUtil.MINUTE;
        remainder = remainder % TimeUtil.MINUTE;
        let second = remainder / TimeUtil.SECOND;
        return this.padding(Math.floor(hour)) + ":" + this.padding(Math.floor(minute)) + ":" + this.padding(Math.floor(second));
    }

    static getBeforeTimeStr(beforeMills: number) {
        let day = beforeMills / TimeUtil.DAY;
        if (day >= 1) {
            return Math.floor(day) + "天前";
        }
        let remainder = beforeMills % TimeUtil.DAY;
        let hour = remainder / TimeUtil.HOUR;
        if (hour >= 1) {
            return Math.floor(hour) + "小时前";
        }
        remainder = remainder % TimeUtil.HOUR;
        let minute = remainder / TimeUtil.MINUTE;
        if (minute >= 1) {
            return Math.floor(minute) + "分钟前";
        }
        remainder = remainder % TimeUtil.MINUTE;
        let second = remainder / TimeUtil.SECOND;
        if (second >= 1) {
            return Math.floor(second) + "秒前";
        }
        return "刚刚";
    }

    static getLongOrderTimeStr(millis: number): string {//长途订单特殊时间显示
        let hour = millis / TimeUtil.HOUR;
        let remainder = millis % TimeUtil.HOUR;
        let minute = remainder / TimeUtil.MINUTE;
        remainder = remainder % TimeUtil.MINUTE;
        let second = remainder / TimeUtil.SECOND;
        return this.padding(Math.floor(hour)) + ";" + this.padding(Math.floor(minute)) + ";" + this.padding(Math.floor(second));
    }

    static getTimeByMillisecond(time: number) {
        let h = Math.floor(time / 3600000);
        let hMoudle = (time % 3600000);
        let m = Math.floor(hMoudle / 60000);
        let s = Math.floor((hMoudle % 60000) / 1000);
        return { h: h, m: m, s: s };
    }

    static getTimeBySecond(time: number) {
        let h = Math.floor(time / 3600);
        let hMoudle = (time % 3600);
        let m = Math.floor(hMoudle / 60);
        let s = hMoudle % 60;
        return { h: h, m: m, s: s };
    }

    static getMoudleBySecond(time: number) {
        let m = Math.floor(time / 60);
        let s = time % 60;
        return { m: m, s: s };
    }

    static getTimeSecondStr(time: number) {
        let timeLab = this.getTimeBySecond(time);
        let minutes = this.padding(timeLab.m);
        let second = this.padding(timeLab.s);
        return minutes + ":" + second;
    }

    static getTimeHouseStr(time: number) {
        let timeLab = this.getTimeByMillisecond(time);
        let hour = this.padding(timeLab.h);
        let minutes = this.padding(timeLab.m);
        let second = this.padding(timeLab.s);
        if (timeLab.h == 0) {
            return minutes + ":" + second;
        } else {
            return hour + ":" + minutes + ":" + second;
        }
    }

    static getTimeHouseStrBySecond(time: number) {
        let timeLab = this.getTimeBySecond(time);
        let hour = this.padding(timeLab.h);
        let minutes = this.padding(timeLab.m);
        let second = this.padding(timeLab.s);
        if (timeLab.h == 0) {
            return minutes + ":" + second;
        } else {
            return hour + ":" + minutes + ":" + second;
        }
    }



    static getWareTime(time: number): string {
        let hour = time / TimeUtil.HOUR;
        let remainder = time % TimeUtil.HOUR;
        let minute = remainder / TimeUtil.MINUTE;
        return this.padding(Math.floor(hour)) + ":" + this.padding(Math.floor(minute));
    }

    static getDataYear(time) {
        let date = new Date(time);
        return date.getFullYear();
    }

    static getDataMonth(time) {
        let date = new Date(time);
        return date.getMonth() + 1;
    }

    static getDataDate(time) {
        let date = new Date(time);
        return date.getDate();
    }

    static getDataHour(time) {
        let t = new Date(time);
        return t.getHours();
    }

    static getDataYearStr(time) {
        let date = new Date(time);
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        let d = date.getDate();
        return cc.js.formatStr("%s/%s/%s", y, m, d);
    }

    static getDateHour(time) {
        let date = new Date(time);
        let hours = this.padding(date.getHours());
        let minutes = this.padding(date.getMinutes());
        return hours + ":" + minutes;
    }

    /**
     * 取时间小时和分
     */
    static getHourAndMinites() {
        let t = new Date();
        let hours = this.padding(t.getHours());
        let minutes = this.padding(t.getMinutes());
        //var seconds = this.padding(t.getMilliseconds());
        return "" + hours + ":" + minutes;
    }


    static secondMillisecond(second: number) {
        return second * 1000;
    }

    static getDataTime(time) {
        let date = new Date(time);
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        let d = date.getDate();
        let h = date.getHours();
        let mm = this.padding(date.getMinutes());
        return cc.js.formatStr("%s/%s/%s <br/>%s:%s", y, m, d, h, mm);
    }

    static judgeIsTime(beginTime: string, EndTime: string) {
        let timeStr = beginTime.split("-");
        let BeginYear = Number(timeStr[0].split("/")[0]);
        let BeginMouth = Number(timeStr[0].split("/")[1]);
        let BeginDate = Number(timeStr[0].split("/")[2]);
        let BeginHour = Number(timeStr[1].split(":")[0]);

        let timeStr1 = beginTime.split("-");
        let EndYear = Number(timeStr1[0].split("/")[0]);
        let EndMouth = Number(timeStr1[0].split("/")[1]);
        let EndDate = Number(timeStr1[0].split("/")[2]);
        let EndHour = Number(timeStr1[1].split(":")[0]);

        let serverTime = DataMgr.getServerTime();
        let curYear = this.getDataYear(serverTime);
        if (curYear >= BeginYear && curYear <= EndYear) {
            return true
        }
        let curMouth = this.getDataMonth(serverTime);
        if (curMouth >= BeginMouth && curMouth <= EndMouth) {
            return true
        }
        let curDate = this.getDataDate(serverTime);
        if (curDate >= BeginDate && curDate <= EndDate) {
            return true
        }
        let curHour = this.getDataHour(serverTime);
        if (curHour >= BeginHour && curHour <= EndHour) {
            return true
        }

        return false
    }

    static getCounterDate(t: Date){
        let cMouth = t.getMonth() + 1;
        let mouth = this.padding(cMouth);
        let date = this.padding(t.getDate());
        return t.getFullYear() + "-" + mouth + "-" + date;
    }

    static getCounterTime(t: Date){
        let hour = this.padding(t.getHours());
        let minutes = this.padding(t.getMinutes());
        let seconds = this.padding(t.getSeconds());
        return hour + ":" + minutes + ":" + seconds;
    }

    //补齐，例如3则左边补上0显示成03
    static padding(num: number): string {
        return (num < 10 ? "0" : "") + num;
    }

}
