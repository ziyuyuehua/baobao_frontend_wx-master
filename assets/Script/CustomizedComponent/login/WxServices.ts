/**
 * @author Lizhen
 * @date 2019/10/30
 * @Description:
 */
import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import { JsonMgr } from "../../global/manager/JsonManager";
import { DataManager, DataMgr } from "../../Model/DataManager";
import { IRespData } from "../../types/Response";
import { GameManager } from "../../global/manager/GameManager";
import { ServerConst } from "../../global/const/ServerConst";
import { WxVideoAd } from "./WxVideoAd";
import { COUNTERTYPE, DotInst, DotVo } from "../common/dotClient";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { CacheMap } from "../MapShow/CacheMapDataManager";
import {UIMgr} from "../../global/manager/UIManager";

export enum WxMessage {
    ShowFriendList = 0,
    ShareToFriend = 100,
    FriendListNextPage = 101
}

export class WxServices {
    private _wxGetLaunchOptionsSync() {//获取第一次启动时的参数
        DataMgr.launchOption = wx.getLaunchOptionsSync();
    }

    public _wxLogin(cb: Function): void {//登陆接口 给后端传消息
        if (GameManager.isDebug) {
            let platformInfo = {
                openid: ServerConst.openid,
                access_token: ServerConst.access_token,
                staticInfo: DataManager.statisticsInfo,
            };
            HttpInst.postData(NetConfig.GET_USER_INFO,
                [JSON.stringify(platformInfo)], (response: IRespData) => {
                    cb && cb(response);
                }, null, null, false);
        } else {
            this._addWxError();
            this._wxGetLaunchOptionsSync();
            this.getStaticInfo();
            wx.login({
                success: (res: any) => {
                    let code: string = res.code;
                    let platformInfo = this._wxGetPlatformInfo(code);
                    HttpInst.postData(NetConfig.GET_USER_INFO,
                        [JSON.stringify(platformInfo)], (response: IRespData) => {
                            cb && cb(response);
                        }, null, null, false);
                }
            });
        }
    }

    private _addWxError() {
        if (wx.onError) {
            wx.onError((err) => {
                const dot: DotVo = {
                    COUNTER: COUNTERTYPE.EXCEPTION,
                    VALUE: err.stack,
                    KINGDOM: "client",
                    PHYLUM: ServerConst.SERVER_VER,
                    CLASSFIELD: err.message,
                    FAMILY: DataManager.version,
                };
                DotInst.sendDot(dot);
                // console.error(err);

                return false;
            });
        }
    }

    private _wxGetPlatformInfo(code: string) {
        let platformInfo = {};
        if (DataMgr.launchOption.query.openid != null) {
            platformInfo = {
                access_token: code,
                staticInfo: DataManager.statisticsInfo,
                inviter: DataMgr.launchOption.query.openid
            };
        } else {
            platformInfo = {
                access_token: code,
                staticInfo: DataManager.statisticsInfo,
            };
        }
        return platformInfo;
    }

    public bindUser(response: IRespData, cb: Function) {
        DataMgr.login(response);
        cb && cb();

        if (!GameManager.isDebug) {
            this._wxGetSetting(() => {
                this._wxGetUserInfo(() => {
                    this.submitUserInfo();
                });
            }, () => {
                this.submitUserInfo();
            });
        }
    }

    public loginFinish() {
        if (GameManager.isDebug) return;
        wx.showShareMenu({
            withShareTicket: true,
        });
        wx.onHide(() => {
            cc.game.pause();
            cc.log("游戏暂停");
        });
        wx.onShow((res: any) => {
            cc.game.resume();
            DataMgr.launchOption = res;
            cc.log("游戏开始", DataMgr.launchOption);
            this.checkShareQuery();
        });
        wx.onShareAppMessage(() => {
            return {
                title: "来和我一起成为店长拥有自己的小店吧~",
                imageUrl: `https://cdn.nuojuekeji.com/uploadImages/share/xuanchuan2.png`,
                query: `scene=${DataMgr.launchOption.scene}`
            };
        });
        wx.onMemoryWarning(() => {
            wx.triggerGC();
        });
        cc.log("loginFinish", DataMgr.launchOption);
        this.checkShareQuery();

        let updateManager = wx.getUpdateManager();
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，请重启应用',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })
        updateManager.onUpdateFailed(function () {
            // 新版本下载失败
            // UIMgr.showTextTip();
            wx.showModal({
                title: '更新失败',
                content: '新版本更新失败，建议手动重启小游戏',
                showCancel: false,
                success: function (res) {

                }
            })
        })
    }

    checkShareQuery() {//检测分享参数 上传活动数据
        if (DataMgr.launchOption.query.activityId != null) {
            console.log("checkShareQuery:",DataMgr.launchOption.query.activityId);
            // if (DataMgr.launchOption.query.activityId == 10002) {
            //     HttpInst.postData(NetConfig.INVITED_FRIEND,
            //         [DataMgr.launchOption.query.openid], (response: IRespData) => {
            //             cc.log(response);
            //         }, null, null, false);
            // }
        }
        cc.log("checkShareQuery", DataMgr.launchOption.query, DataMgr.userData);
        if (DataMgr.launchOption.query.requestAddFriendFrom != null) {//userid
            HttpInst.postData(NetConfig.ADDFRIEND, [DataMgr.launchOption.query.requestAddFriendFrom], () => { });
        }
    }

    public _wxGetUserInfo(cb: Function) {//绑定用户
        wx.getUserInfo({
            withCredentials: true,
            lang: "zh_CN",
            success: (res: any) => {
                HttpInst.postData(NetConfig.WX_GETUSER,
                    [res.encryptedData, res.iv, res.rawData, res.signature], (response) => {
                        cb && cb();
                    });

            },
        });
    }

    public _wxGetSetting(suc: Function, fail: Function) {//获取是否授权
        if (GameManager.isDebug) {
            suc();
        } else {
            wx.getSetting({
                success: (res: any) => {
                    if (res.authSetting['scope.userInfo']) {
                        suc();
                    } else {
                        fail();
                    }
                }
            });
        }
    }

    private getNetworkType(): string {//获取网络状态
        let netType = "4g";
        wx.getNetworkType({
            success: (res: any) => {
                netType = res.networkType;
            }
        });
        return netType;
    }

    private getStaticInfo() {//获取打点信息
        wx.getSystemInfo({
            success: (res: any) => {
                let systemArr = res.system.split(" ");
                GameManager.wxVersion = res.version;
                GameManager.system = systemArr[0];
                let staticInfo = {
                    "client_version": DataManager.version,
                    "download_from": this.getQuery(),
                    "network_type": this.getNetworkType(),
                    "os_type": systemArr[0],
                    "phone_type": res.model,
                    "phone_version": systemArr[1],
                    "ratio": res.screenWidth + "x" + res.screenHeight,
                    "ad_extra": DataMgr.launchOption.referrerInfo ? DataMgr.launchOption.referrerInfo.extraData : "",
                    "ad_qurey": DataMgr.launchOption.query,
                    "ad_id": this.getAdid(),
                    "wx_version": res.version
                };
                DataManager.statisticsInfo = staticInfo;
                // console.log("getStaticInfo", staticInfo);
            },
            fail: (e) => {
                console.error(e);
            }
        });
    }

    getQuery(): string {//adid
        let download_from: string = DataMgr.launchOption.scene + "_unknown";
        if (DataMgr.launchOption.referrerInfo && DataMgr.launchOption.referrerInfo.appId != null) {
            download_from = DataMgr.launchOption.scene + "_" + DataMgr.launchOption.referrerInfo.appId;
        }
        return download_from;
    }
    getAdid(): string {
        let adid = "unknown";
        if (DataMgr.launchOption.query.adid != null) {
            adid = DataMgr.launchOption.query.adid;
        }
        return adid;
    }

    public shareGame(title: string, imageUrl: string, query: string = "", success?: Function): void {//分享游戏 query格式必须是`key1=${DataMgr.launchOption.scene}&key2=${DataMgr.launchOption.scene}`
        cc.log("shareGame :", title, query);
        if (GameManager.isDebug) {
        } else {
            let queryData = `scene=${DataMgr.launchOption.scene}&openid=${DataMgr.userData.openid}&requestAddFriendFrom=${DataMgr.userData.id}`;
            if (query != "") {
                queryData += "&" + query;
            }
            let time = new Date().getTime();
            wx.shareAppMessage({
                title: title,
                imageUrl: imageUrl,
                query: queryData
            });
            this.checkShareQuery();
        }
        success && success();
    }

    public submitUserInfo() {//上传玩家信息到公共域
        if (GameManager.isDebug) return;
        let jsonObj1 = {
            "wxgame": {
                "playerId": DataMgr.userData.openid,
                "level": DataMgr.userData.level,
                "update_time": new Date().getTime(),
            },
        };
        wx.setUserCloudStorage({ KVDataList: [{ key: "wxFriendRank", value: JSON.stringify(jsonObj1) }] });
    }

    public setMessageToFriendQuery(query: Object) {
        if (this.checkVersion("2.9.0")) {
            wx.setMessageToFriendQuery({
                shareMessageToFriendScene: 0,
                ...query
            });
        }
    }

    public postMessage(type: WxMessage, data: Object) {//公共数据与发送数据
        wx.getOpenDataContext().postMessage({
            type,
            openid: DataMgr.userData.openid,
            canShareToFriend: this.checkVersion("2.9.0"),
            ...data
        });
    }

    public checkVersion(version: string): boolean {//检测api是否兼容版本
        return this.compareVersion(GameManager.wxVersion, version) >= 0;
    }

    private compareVersion(v11: string, v21: string): number {
        let v1: string[] = v11.split('.');
        let v2: string[] = v21.split('.');
        const len = Math.max(v1.length, v2.length);

        while (v1.length < len) {
            v1.push('0')
        }
        while (v2.length < len) {
            v2.push('0')
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i]);
            const num2 = parseInt(v2[i]);

            if (num1 > num2) {
                return 1
            } else if (num1 < num2) {
                return -1
            }
        }

        return 0
    }

    public payHandler(buyCount: number, success?: Function) {
        console.log("---buyQuantity..." + buyCount);
        let jsonObg1 = {
            "mode": "game",
            "env": ServerConst.pay_env,
            "offerId": 1450022680,
            "currencyType": "CNY",
            "platform": "android",
            "buyQuantity": buyCount,
            "success": success,
            "fail": (msg) => {
                console.log("---失败...{}", msg);
            }
        };
        wx.requestMidasPayment(jsonObg1)
    }

    public setPreferredFramesPerSecond(num: number) {//设置渲染帧率
        if (GameManager.isDebug) return;
        wx.setPreferredFramesPerSecond(num);
    }

}
