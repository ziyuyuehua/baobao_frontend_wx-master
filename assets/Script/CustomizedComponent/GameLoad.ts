import {AudioMgr} from "../global/manager/AudioManager";
import {ClientEvents} from "../global/manager/ClientEventCenter";
import {DataManager, DataMgr} from "../Model/DataManager";
import {Native} from "../Native";
import {CompositeDisposable} from "../Utils/event-kit";
import {COUNTERTYPE, DotInst, DotVo} from "./common/dotClient";
import {MapResMgr} from "./MapShow/MapResManager";
import {GameManager} from "../global/manager/GameManager";
import PowerGuide from "./PowerGuide/PowerGuide";
import {WxVideoAd} from "./login/WxVideoAd";
import {IRespData} from "../types/Response";
import {ServerConst} from "../global/const/ServerConst";
import {HttpInst} from "../core/http/HttpClient";
import {JsonMgr} from "../global/manager/JsonManager";
import {UIMgr} from "../global/manager/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameLoad extends cc.Component {

    @property({ type: cc.ProgressBar })
    private loadingBar: cc.ProgressBar = null;
    @property(cc.Node)
    private LogingEffect: cc.Node = null;
    @property(cc.Node)
    private WhiteBeer: cc.Node = null;

    @property([cc.Node])
    private xinArr: cc.Node[] = [];

    @property(cc.Node)
    private maoHeadNode: cc.Node = null;

    @property(sp.Skeleton)
    private maoSkelteon: sp.Skeleton = null;

    @property(cc.Sprite)
    private GuangSpri: cc.Sprite = null;
    @property(cc.Label)
    private VersionLab: cc.Label = null;

    @property(cc.Node)
    private normalNode: cc.Node = null;

    @property(cc.Node)
    private stopNode: cc.Node = null;

    @property(cc.Node)
    private statBtn: cc.Node = null;

    @property(cc.Label)
    private stopTitle: cc.Label = null;

    @property(cc.RichText)
    private stopContent: cc.RichText = null;

    @property(cc.ScrollView)
    labelScroll: cc.ScrollView = null;

    private dispose = new CompositeDisposable();
    private addNum: number = 0;

    protected onLoad() {
        this.statBtn.active = false;
        this.dispose.add(ClientEvents.STOP_SERVER_STATE.on(this.openStopServer));

        //logo加载完打点
        //初始化平台id和服务器url数据
        DataManager.initStaticData(() => {
            this.setCocosConfig();
            this.addGlobalHandler();
        });

        //1、获取服务器信息，后端地址以及CDN地址
        //2、获取玩家信息，然后构建主场景
        this.getServerInfo(this.getUserInfo);
    }

    start() {
        for (let index = 0; index < this.xinArr.length; index++) {
            this.xinArr[index].active = false;
        }
        this.VersionLab.string = DataManager.version;
        this.maoSkelteon.setAnimation(0, "animation", true);
    }

    private getServerInfo(cb: (value: void) => void) {
        HttpInst.get(ServerConst.CENTER_URL,
            {version: ServerConst.SERVER_VER}, (response: IRespData) => {
                this.fillServerInfo(response);
                JsonMgr.loadJson().then(cb);
            });
    }

    private fillServerInfo(response: IRespData){
        cc.log(response);
        if(!response.server){
            UIMgr.showTipText("ServerInfo数据错误 ！！！");
            throw new Error("Can not found ServerInfo !!!");
        }
        ServerConst.SERVER_URL = response.server.serverUrl;
        ServerConst.JSON_URL = response.server.outJsonUrl;
        ServerConst.SHOW_LOG = response.server.showLog;

        ServerConst.gameid = response.server.trackGameId;
    }

    private getUserInfo = () => {
        GameManager.WxServices._wxLogin(this.loadMainScene);
    };

    private setCocosConfig() {
        cc.view.enableAutoFullScreen(false);
        this.addGameHideAndShow();
    }

    private addGameHideAndShow = () => {
        cc.systemEvent.on(cc.game.EVENT_HIDE, () => {
            cc.audioEngine.pauseAll();
        });
        cc.systemEvent.on(cc.game.EVENT_SHOW, () => {
            cc.audioEngine.resumeAll();
        });

        cc.game.on(cc.game.EVENT_HIDE, () => {
            // AudioMgr.setStopAllEffect();

            DataMgr.stopPolling();
        });
        cc.game.on(cc.game.EVENT_SHOW, () => {
            // AudioMgr.setResumeAllEffect();
            ClientEvents.GAME_SHOW.emit();

            DataMgr.setRememberHeard();
            DataMgr.starPolling(true);
            ClientEvents.SHOW_PLANE.emit();
        });
    };

    private addGlobalHandler() {
        this.addGlobalBtnClickSound();
        this.addGlobalErrorHandler();
    }

    // 按钮全局添加音效事件
    private addGlobalBtnClickSound() {
        (<any>cc.Component.EventHandler)._emitEvents = cc.Component.EventHandler.emitEvents;
        cc.Component.EventHandler.emitEvents = function (clickEvents, event) {
            //cc.log(clickEvents, event);
            if (event instanceof cc.Event.EventTouch) {
                if (event.type == "touchend") {
                    //AudioManager.playEffect('click');
                    AudioMgr.playEffect("Audio/clickSound");
                } else {
                }
            }
            (<any>cc.Component.EventHandler)._emitEvents.apply(this, arguments);
        };
    }

    private addGlobalErrorHandler() {
        if (<any>window) {
            (<any>window).onerror = function (msg, url, row, column, err) {
                const dot: DotVo = {
                    COUNTER: COUNTERTYPE.EXCEPTION,
                    VALUE: err.stack,
                    KINGDOM: "client",
                    PHYLUM: DataManager.version,
                    CLASSFIELD: msg,
                    FAMILY: url,
                };
                DotInst.sendDot(dot);
                // cc.error(dot);

                return false;
            };
        }
    }

    openStopServer = (msg: string) => {
        this.normalNode.active = false;
        this.stopNode.active = true;

        let msgData = JSON.parse(msg);
        this.stopTitle.string = msgData.title;
        this.stopContent.string = msgData.content;

        this.labelScroll.content.setContentSize(this.labelScroll.content.getContentSize().width, this.stopContent.node.getContentSize().height);
    };

    private loadMainScene = (response: IRespData) => {
        ServerConst.pay_env = response.wechatPayEnv;
        console.warn("pay_env", ServerConst.pay_env);
        DataMgr.isNeedAuthorize = response.authorize;
        response.user && DataMgr.userData.fill(response.user);

        DotInst.clientSendDot(COUNTERTYPE.loading, "1"); //getUserInfo完成打点
        DataMgr.setRememberHeard();

        // CacheMap.initMapArea();
        cc.director.preloadScene("mainScene", this.onProgress, (error: Error) => {
            if (error) {
                cc.error(error);
                return;
            }
            DotInst.clientSendDot(COUNTERTYPE.loading, "2"); //main场景加载完成
            //主场景mainScene完成
            this.showSetting(() => {
                GameManager.WxServices.bindUser(response, () => {
                    DotInst.clientSendDot(COUNTERTYPE.loading, "6"); //授权同步用户
                    GameManager.WxServices.loginFinish();
                    MapResMgr.loadMapBg((cb: Function) => {
                        DotInst.clientSendDot(COUNTERTYPE.loading, "7"); //地图加载完成
                        if (DataMgr.checkInPowerGuide()) {
                            cc.loader.loadRes(PowerGuide.url, cc.Prefab, () => {
                                DotInst.clientSendDot(COUNTERTYPE.loading, "8"); //新手引导显示
                                cc.director.loadScene("mainScene", () => {
                                    DotInst.clientSendDot(COUNTERTYPE.loading, "9"); //进入main场景
                                    cb && cb(); //调用MapShow的initMap
                                    DotInst.clientSendDot(COUNTERTYPE.loading, "end", null, null, null, null, null, DataManager.statisticsInfo);
                                });
                            });
                        } else {
                            cc.director.loadScene("mainScene", () => {
                                DotInst.clientSendDot(COUNTERTYPE.loading, "9"); //进入main场景
                                cb && cb(); //调用MapShow的initMap
                                DotInst.clientSendDot(COUNTERTYPE.loading, "end", null, null, null, null, null, DataManager.statisticsInfo);
                            });
                        }
                        WxVideoAd.createVideo();//初始化广告组建
                    });
                });
            });
        });
    };

    showSetting(cb: Function) {//是否现实开始游戏的按钮
        if (!DataMgr.isNeedAuthorize) {
            GameManager.WxServices._wxGetSetting(() => {
                this.statBtn.active = false;
                this.normalNode.active = true;
                cb && cb();
            }, () => {
                this.statBtn.active = true;
                this.normalNode.active = false;
                this.createLoginBtn(cb);
            })
        } else {
            cb && cb();
        }
    }

    private wxLoginBtn = null;

    private createLoginBtn(cb: Function): void {
        let btnSize = cc.size(this.statBtn.width + 5, this.statBtn.height + 5);
        let frameSize = cc.view.getFrameSize();
        let winSize = cc.winSize;
        //适配不同机型来创建微信授权按钮
        let left = (winSize.width * 0.5 + this.statBtn.x - btnSize.width * 0.5) / winSize.width * frameSize.width;
        let top = (winSize.height * 0.5 - this.statBtn.y - btnSize.height * 0.5) / winSize.height * frameSize.height;
        let width = btnSize.width / winSize.width * frameSize.width;
        let height = btnSize.height / winSize.height * frameSize.height;

        this.wxLoginBtn = wx.createUserInfoButton({
            type: 'text',
            text: "",
            style: {
                left: left,
                top: top,
                width: width,
                height: height,
                lineHeight: 0,
                backgroundColor: '',
                color: '',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 4
            }
        });
        this.wxLoginBtn.show();
        DotInst.clientSendDot(COUNTERTYPE.loading, "3"); //授权显示打点

        this.wxLoginBtn.onTap((res: any) => {
            cb && cb();
            if(this.statBtn){
                this.statBtn.active = false;
            }
            if (this.wxLoginBtn != null) {
                this.wxLoginBtn.hide();
                this.wxLoginBtn.destroy();
            }
            if (res.userInfo) {
                DotInst.clientSendDot(COUNTERTYPE.loading, "4"); //授权成功打点
            } else {
                DotInst.clientSendDot(COUNTERTYPE.loading, "5"); //授权失败打点
            }
        });
    }


    /** 加载进度条 */
    private onProgress = (completedCount: number, totalCount: number, item: any) => {
        let contentWidth: number = this.loadingBar.node.getContentSize().width;
        let pro = completedCount / totalCount;
        let curPro = this.loadingBar.progress;
        pro = pro < curPro ? curPro : pro;
        this.loadingBar.progress = pro;
        if (pro > 0.9) {
            this.LogingEffect.active = false;
            for (let index = 0; index < this.xinArr.length; index++) {
                this.xinArr[index].active = true;
            }
            this.maoHeadNode.x = 0;
        } else {
            let moveWidth = contentWidth * pro;
            let sureWidth = contentWidth - this.WhiteBeer.getContentSize().width / 2;
            this.GuangSpri.node.active = false;
            if (moveWidth > sureWidth) {
                this.addNum++;
                this.GuangSpri.node.active = true;
                this.addGuangEff();
                moveWidth = sureWidth;
            }

            this.LogingEffect.setPosition(moveWidth, this.LogingEffect.position.y);
            // let action = cc.moveTo(0.01,moveWidth,this.LogingEffect.position.y);
            // this.LogingEffect.stopAllActions();
            // this.LogingEffect.runAction(action);
        }
    };

    private addGuangEff() {
        if (this.addNum == 1) {
            let scale1 = cc.scaleTo(0.2, 1);
            this.GuangSpri.node.runAction(scale1);
        }
    }

    returnMengGu() {
        Native.closeGame(true);
    }

    onDestroy() {
        this.dispose.dispose();
        if (!GameManager.isDebug) {
            wx && wx.triggerGC();
        }
    }
}
