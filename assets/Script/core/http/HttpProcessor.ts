import CommonInsufficient, {InsufficientType} from "../../CustomizedComponent/common/CommonInsufficient";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import {IRespData, IResponse} from "../../types/Response";
import {TimeUtil} from "../../Utils/TimeUtil";
import {ServerStatus} from "./HttpClient";
import {ServerConst} from "../../global/const/ServerConst";

/**
 * @Author whg
 * @Date 2019/7/21
 * @Desc Http请求回调底层预处理类
 */

export class HttpResponse {
    readonly isReady: boolean;
    readonly result: any = null;

    constructor(isReady: boolean, result: any) {
        this.isReady = isReady;
        this.result = result;
    }
}

export class HttpProcessor {

    static getResponse(xhr: XMLHttpRequest) {
        if (xhr.readyState === 4) {
            if (xhr.status >= 200 && xhr.status < 300) {
                return new HttpResponse(true, JSON.parse(xhr.responseText));
            } else {
                cc.warn("error xhr status:" + xhr.status);
                return new HttpResponse(true, null);
            }
        }
        return null;
    }

    static processResponse(param: any, response: IResponse, callback: Function = null, needPre: boolean = true, errorCb: Function = null) {
        if (response.status == ServerStatus.SUCCESS) {
            ServerConst.SHOW_LOG && console.log("server response:", response);
            if(response.t){
                DataMgr.setServerTime(response.t);
                cc.log("服务器返回时间：", TimeUtil.format(response.t));
            }
            this.success(param, response, callback, needPre);
        } else if (response.status == ServerStatus.STOP_SERVER) {
            this.stopServer(response);
        } else {
            this.error(response, errorCb);
        }
    }

    private static success(param: any, response: IResponse, callback: Function = null, needPre: boolean = true) {
        let responseData: IRespData = <IRespData>response.data;
        if (DataMgr.getPlayAnimation()) {
            UIMgr.showReward(param, responseData, responseData.user ? [responseData.user.level, responseData.user.incrHowLv] : null);
        }
        if (needPre) {
            DataMgr.refreshData(responseData);
        }

        if (responseData.buffIds) {
            DataMgr.setBuffData(responseData.buffIds);
        }

        if (responseData.bubbleCnt) {
            DataMgr.setBubbleCnt(responseData.bubbleCnt);
        }

        if (responseData.activities) {
            DataMgr.setMainActivities(responseData.activities);
            ClientEvents.UPDATE_COMMUNITY_STATE.emit();
        }

        if (responseData.assistanceRewards != null) {
            DataMgr.assistanceRewards = responseData.assistanceRewards;
            if (DataMgr.isFinishedLoad()) {
                UIMgr.showPopupDialog(DataMgr.assistanceRewards);
            }
        }

        if (responseData.tips && responseData.tips.length > 0) {
            UIMgr.showTipText(null, null, responseData.tips);
        }

        if (responseData.SellGoodsGoal) {
            ClientEvents.SELLTASK_REFRESHBANNER.emit();
        }

        callback && callback(responseData);
    }

    private static error(response: IResponse, errorCb: Function = null) {
        errorCb && errorCb();
        if (response.status === 108) {
            // UIUtil.showGoRechargeTip("gold");
            //萌币不足，弹获取途径
            //UIMgr.loadaccessPathList(-2);
            UIMgr.showView(CommonInsufficient.url, cc.director.getScene(), InsufficientType.Gold);
            return;
        }
        if (response.status === 114) {
            //友情点不足，弹获取途径
            UIMgr.showTipText("友情点不足");
            UIMgr.loadaccessPathList(100601);
            return;
        }
        if (response.status === ServerStatus.JUMPCHARGEWX) {
            //掉起微信支付
            ClientEvents.OPEN_WX_PAY.emit();
            return;
        }
        if (response.status === ServerStatus.WXPAYFAIL) {
            UIMgr.showTipText("支付失败");
            return;
        }
        if (response.status === 1100) {
            ClientEvents.UP_GOLD_EXCHANGE.emit();
        }
        if (response.status === ServerStatus.RESETLOGIN) {
            //重新登录

            return;
        }
        // if (response.errorCode === 4000) {
        //     ClientEvents.MAGNIFY_CHANGE_NAME.emit(response.errorMsg);
        //     return;;
        // }
        ClientEvents.EVENT_SEARCH_FAILURE.emit();
        UIMgr.showTipText(<string>response.data);
        cc.error("server error:", response);

        // //单个邮件领取失败
        // ClientEvents.EVENT_MAILBOX_RECEIVE_FAIL.emit(response);
        // //签到领取失败
        // ClientEvents.EVENT_SIGNIN_FAILED.emit(response);
        //搜索好友失败
        // //设置失败
        // ClientEvents.EVENT_CHANGE_FAILURE.emit(response.errorMsg);
    }

    private static stopServer(response: IResponse) {
        DataMgr.stopPolling();
        if (cc.director.getScene().name != "load") {
            cc.director.loadScene("load");
        } else {
            ClientEvents.STOP_SERVER_STATE.emit(<string>response.data);
        }
    }

}
