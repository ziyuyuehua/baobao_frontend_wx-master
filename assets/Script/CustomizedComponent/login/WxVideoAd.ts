/**
 * @author Lizhen
 * @date 2019/11/6
 * @Description:
 */
import { GameManager } from "../../global/manager/GameManager";
import { JsonMgr } from "../../global/manager/JsonManager";
import { UIMgr } from "../../global/manager/UIManager";
import { DotInst } from "../common/dotClient";

export class WxVideoAd {

    private static videoAd: RewardedVideoAd = null;//广告组件
    private static showVideoFun: Function = null;
    private static notFinishFun: Function = null;

    private static checkVersion(): boolean {
        return GameManager.WxServices.checkVersion("2.0.6");
    }

    public static createVideo(): void {//内部初始化方法
        if (!this.checkVersion() || !GameManager.isHaveAdUnitId()) {
            return;
        }
        let adUnitId = JsonMgr.getAniConstVal("adUnitId");
        this.videoAd = wx.createRewardedVideoAd({ adUnitId: adUnitId });
        DotInst.sendAdvanDot("initVido");
        this.videoAd.onError((err: any) => {
            DotInst.sendAdvanDot("initVidoFail");
            console.log('onError', err);
            UIMgr.showTipText("广告拉取异常，请稍后重试...");
        });
        this.videoAd.onClose((res: any) => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                DotInst.sendAdvanDot("VidoSuccess");
                // 正常播放结束，可以下发游戏奖励
                cc.log("正常播放结束，可以下发游戏奖励");
                if (this.showVideoFun) {
                    this.showVideoFun();
                    this.showVideoFun = null;
                    this.notFinishFun = null;
                }
            } else {
                // 播放中途退出，不下发游戏奖励
                cc.log("播放中途退出，不下发游戏奖励");
                DotInst.sendAdvanDot("midExitVido");
                if (this.notFinishFun) {
                    this.notFinishFun();
                    this.showVideoFun = null;
                    this.notFinishFun = null;
                }
            }
        });
    }

    public static showVideo(callBack: Function, notFinishFun?: Function) {//外部调用的方法 传进来回掉
        if (GameManager.isDebug) {
            callBack && callBack();
            return;
        }
        if (!this.checkVersion()) {
            UIMgr.showTipText("当前版本不支持，请升级微信！");
            return;
        }
        this.showVideoFun = callBack;
        this.notFinishFun = notFinishFun;
        DotInst.sendAdvanDot("showVido");
        this.videoAd.show()
            .catch((err: any) => {
                this.videoAd.load().then(() => this.videoAd.show()
                    .catch(err => {
                        DotInst.sendAdvanDot("showVidoFail");
                        UIMgr.showTipText("广告加载异常，请稍后重试...");
                        // GameManager.WxServices.shareGame("来和我一起成为店长拥有自己的小店吧~",`https://cdn.nuojuekeji.com/uploadImages/share/xuanchuan2.png`,"",callBack);
                    }));
            })
    }
}