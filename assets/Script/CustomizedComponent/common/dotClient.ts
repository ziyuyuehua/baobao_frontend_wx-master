import { DataManager, DataMgr } from "../../Model/DataManager";
import { ServerConst } from "../../global/const/ServerConst";
import { GameManager } from "../../global/manager/GameManager";
import {TimeUtil} from "../../Utils/TimeUtil";

const { ccclass, property } = cc._decorator;

export enum COUNTERTYPE {
    heartBeat = "heartBeat",                //心跳
    announce = "annouce",                   //公告
    loading = "loading",                    //加载
    popular = "popular",                    //人气值
    mainPage = "mainPage",                  //首页
    signboard = "signboard",                //招牌
    setting = "setting",                    //设置
    communityActive = "communityActive",    //社区活动
    exchangeGold = "exchangeGold",          //兑换金币
    recharge = "recharge",                  //采购中心
    incidentCrisis = "incidentCrisis",      //事件危机
    task = "task",                          //任务
    fight = "fight",                        //店铺对决
    staff = "staff",                        //员工
    assistant = "assistant",                //获取途径
    post = "post",                          //岗位
    decoration = "decoration",              //装修
    goodsHouse = "goodsHouse",              //货物仓库
    recruit = "recruit",                    //招募
    longOrder = "longOrder",                //长途货运
    sellTask = "sellTask",                  //售卖目标
    order = "order",                        //订单
    pruchase = "pruchase",                  //进货
    quotes = "quotes",                      //行情
    sign = "sign",                          //签到
    email = "email",                        //邮箱
    friend = "friend",                      //好友
    fostercase = "fostercare",              //派遣
    bag = "bag",                            //背包
    shop = "shop",                          //商店
    other = "other",                        //其他
    otherMarket = "otherMarket",
    share = "share",                        //分享
    seeMovie = "seeMovie",                  //看电影
    powerGuide = "powerGuide",              //强制引导
    adtracking = "adtracking",                //看广告
    expandMarket = "expandMarket",          //扩建
    incentive = "incentive",                //促销
    softGuide = "softGuide",                //软引


    ACTIVITY = "activity",              //活动打点
    ANNOUNCE = "announce",              //公告打点
    HOME = "home",                      //首页打点
    SETTING = "setting",                //设置打点
    REDEMTPTION = "redemption",         //兑换金币打点
    EXCHANGESPAR = "exchangespar",      //兑换钻石打点
    BUYVIP = "buyvip",                  //购买vip打点
    UPLVQUEUE = "uplvqueue",            //升级队列
    STOCKDIVIDEND = "stockdividend",    //股票分红
    SHELFEXCHANGE = "shelfexchange",    //货架换货
    SHELFUPGRADE = "shelfupgrade",      //货架升级
    TASK = "task",                      //任务
    STAFF = "staff",                    //员工
    POST = "post",                      //岗位
    DECORATION = "decoration",          //装修
    RECRUIT = "recruit",                //招募
    ORDER = "order",                    //订单
    PRUCHASE = "pruchase",              //进货
    MAIL = "mail",                      //邮箱
    FRIEND = "friend",                  //好友
    FOSTERCARE = "fostercare",          //寄养
    WAREHOUSE = "warehouse",            //仓库
    SHOP = "shop",                      //商店
    OTHER = "other",                    //其他
    EXCEPTION = "exception",            //异常错误
    LOADING = "loading",                //loading
    FIGHT = "fight",                    //fight
    position = "position",              //升职之路
    staffGift = "staffGift",              //赠送宝宝
}

/**
 * counter client {
  "userId": "userid_0",  		--->萌股id
  "clientId": "1",				--->服务器id
  "userLevel": null,			--->玩家等级
  "counter": "activity",		--->activity
  "value":"",					--->数量 产出和消耗的数量
  "kingdom": "",				--->活动名称 例'签到'
  "phylum": "",					--->打点步骤ID
  "classfield": "",				--->道具ID 多个","分割
  "family": "",					--->参数1 
  "genus": "",					--->参数2
  "counterDate": "2019-06-26",	--->日期
  "counterTime": "05:08:01",	--->时间
  "extra": "",					--->其他参数    {json}
 }
 */

export interface DotVo {
    COUNTER: string,
    VALUE?: string,
    KINGDOM?: string,       //活动名称
    PHYLUM: string,         //打点步骤
    CLASSFIELD?: string,    //参数1
    FAMILY?: string,        //参数2
    GENUS?: string,         //参数3
    EXTRA?: Object,         //json对象，发送的时候转化成json字符串
}

export class dotClient {
    /**
     *
     * @param counter 报送的counter-> 对应COUNTERTYPE
     * @param phylum  打点步骤->文档里面的ID
     * @param classfield 参数1
     * @param family    参数2
     * @param genus     参数3
     * @param kingdom
     * @param value
     * @param extra
     */
    clientSendDot(counter: string, phylum?: string, classfield?: string, family?: string,
        genus?: string, kingdom?: string, value?: string, extra?: Object) {
        let sendVo: DotVo = {
            COUNTER: counter,
            VALUE: value,
            KINGDOM: kingdom,
            PHYLUM: phylum,
            CLASSFIELD: classfield,
            FAMILY: family,
            GENUS: genus,
            EXTRA: extra
        };
        // cc.error("SendDot", sendVo.COUNTER, sendVo.PHYLUM, sendVo.CLASSFIELD);
        this.sendDot(sendVo);
    }

    sendCreateDot(state: number) {  //1->开始游戏 2->成功 3->失败
        if (GameManager.isDebug) {
            return
        }
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.open("POST", "https://g.nuojuekeji.com/collect_metrics_server_web/collectMetric/", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

        setTimeout(() => {
            let mengId = DataMgr.getOpenId();
            let roleid = DataMgr.getUserId();

            let t = new Date();
            let CounterDate = TimeUtil.getCounterDate(t);
            let CounterTime = TimeUtil.getCounterTime(t);

            let sendParam = {
                "userId": mengId,
                "clientId": "1",
                "milestone": "client_create",
                "value": state + "",
                "counterDate": CounterDate,
                "counterTime": CounterTime,
                "udid": DataManager.statisticsInfo["udid"] ? DataManager.statisticsInfo["udid"] : mengId,
                "roleid": roleid + ""
            };

            let send = {
                "retry": 0,
                "ds": CounterDate,
                "metric": "milestone",
                "gameId": ServerConst.gameid,
                "jsonData": JSON.stringify(sendParam)
            };

            xhr.send("datas=" + JSON.stringify(send));
        }, 100)

    }

    sendAdvanDot(biaoshi: string, acti: string = "movie") {
        if (GameManager.isDebug) {
            return
        }
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.open("POST", "https://g.nuojuekeji.com/collect_metrics_server_web/collectMetric/", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        setTimeout(() => {
            let mengId = DataMgr.getOpenId();
            let roleid = DataMgr.getUserId();
            let userLV = DataMgr.getUserLv();

            let t = new Date();
            let CounterDate = TimeUtil.getCounterDate(t);
            let CounterTime = TimeUtil.getCounterTime(t);

            let lvJson = {
                "userLevel": userLV,
            };

            let sendParam = {
                "userId": mengId,
                "clientId": "1",
                "actType": 0,
                "appkey": "baobao",
                "pf": "wechat_reward",
                "uuid": acti,
                "ifa": biaoshi,
                "trackingDs": CounterDate,
                "actTime": CounterTime,
                "extra": JSON.stringify(lvJson),
                "udid": DataManager.statisticsInfo["udid"] ? DataManager.statisticsInfo["udid"] : mengId,
                "roleid": roleid + ""
            };

            let send = {
                "retry": 0,
                "ds": CounterDate,
                "metric": "adtracking",
                "gameId": ServerConst.gameid,
                "jsonData": JSON.stringify(sendParam)
            };
            xhr.send("datas=" + JSON.stringify(send));

        }, 100)
    }

    sendDot(param: DotVo) {
        if (GameManager.isDebug) {
            return
        }

        setTimeout(() => {
            let xhr = cc.loader.getXMLHttpRequest();
            xhr.open("POST", "https://g.nuojuekeji.com/collect_metrics_server_web/collectMetric/", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");

            let mengId = DataMgr.getOpenId();
            let userLV = DataMgr.getUserLv();
            let roleid = DataMgr.getUserId();
            let Kingdom = param.KINGDOM ? param.KINGDOM : "";
            let ClassField = param.CLASSFIELD ? param.CLASSFIELD : "";
            let Family = param.FAMILY ? param.FAMILY : "";
            let Genus = param.GENUS ? param.GENUS : "";

            let t = new Date();
            let CounterDate = TimeUtil.getCounterDate(t);
            let CounterTime = TimeUtil.getCounterTime(t);

            let Extra = param.EXTRA ? JSON.stringify(param.EXTRA) : "";
            let sendParam = {
                "userId": mengId,
                "clientId": "1",
                "userLevel": userLV,
                "counter": param.COUNTER,
                "value": param.VALUE,
                "kingdom": Kingdom,
                "phylum": param.PHYLUM,
                "classfield": ClassField,
                "family": Family,
                "genus": Genus,
                "counterDate": CounterDate,
                "counterTime": CounterTime,
                "extra": Extra,
                "udid": DataManager.statisticsInfo["udid"] ? DataManager.statisticsInfo["udid"] : mengId,
                "roleid": roleid + ""
            };

            let send = {
                "retry": 0,
                "ds": CounterDate,
                "metric": "counter",
                "gameId": ServerConst.gameid,
                "jsonData": JSON.stringify(sendParam)
            };

            xhr.send("datas=" + JSON.stringify(send));

        }, 100);
    }

    static instance: dotClient = new dotClient();

}

export const DotInst: dotClient = dotClient.instance;
