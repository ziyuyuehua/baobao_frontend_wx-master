/**
 * @Description: 扩建倒计时脚本
 * @Author: ljx
 * @date 2019/11/25
 */
import {DataMgr, SHARE_TYPE} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ChestRes} from "./ChestResManager";
import {TimeUtil} from "../../Utils/TimeUtil";
import {ButtonMgr} from "../common/ButtonClick";
import {WxVideoAd} from "../login/WxVideoAd";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {UIMgr} from "../../global/manager/UIManager";
import {GameManager} from "../../global/manager/GameManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../Utils/event-kit";
import ExpandChoseFuture from "./ExpandChoseFuture";
import {GuideIdType, judgeSoftGuideStart} from "../../global/const/GuideConst";
import {ARROW_DIRECTION, GuideMgr} from "../common/SoftGuide";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ExpandInterServal extends cc.Component {

    static url = "expandFrame/expandInterval";

    @property(cc.Node)
    private seeMovie: cc.Node = null;
    @property(cc.Node)
    private shareGame: cc.Node = null;
    @property(cc.Label)
    private timeLabel: cc.Label = null;
    @property(cc.Node)
    private expandTimeEnd: cc.Node = null;
    @property(cc.Node)
    private expandingNode: cc.Node = null;

    private endTime: number = 1;
    private serverTime: number = 1;
    private movieJson: any = null;
    private hasTime: number = 0;
    private needTime: number = 0;
    private dispose: CompositeDisposable = new CompositeDisposable();
    private hasClick: boolean = false;
    private curSoftGuide: ISoftGuideJson = null;
    private scene: ISceneJson = null;

    protected start(): void {
        this._bindEvent();
        this._addListener();
    }

    showAction(isDoReset: boolean = false) {
        this.node.runAction(cc.sequence(cc.spawn(cc.moveBy(.2, 0, -30), cc.fadeIn(.2)), cc.callFunc(() => {
            ClientEvents.HIDE_MAIN_SOFT_GUIDE.emit();
            isDoReset && UIMgr.resetViewForExpandNode(() => {
                this.initGuide();
            });
        })));
    }

    initGuide() {
        this.curSoftGuide = JsonMgr.getSoftGuideJsoById(GuideIdType.expand, 3);
        if (this.curSoftGuide && judgeSoftGuideStart(this.curSoftGuide)) {
            DataMgr.setIsJudgeSoft(false);
            DotInst.clientSendDot(COUNTERTYPE.softGuide, "19009");
            GuideMgr.showSoftGuide(this.node, ARROW_DIRECTION.BOTTOM, this.curSoftGuide.displayText, (node: cc.Node) => {
                node.scale = 0.72;
            }, false, 0, false, this.goToExpand);
        }
    }

    initPos() {
        let node = UIMgr.getExpandNode();
        let pos = node.getPosition();
        this.node.setPosition(pos.x, pos.y + node.height / 2 + 100);
    }

    private _addListener() {
        this.dispose.add(ClientEvents.CLOSE_EXPAND_INTERVAL.on(this.close));
        this.dispose.add(ClientEvents.EXPAND_ENDING_TIME.on(this.timeEndAni));
        this.dispose.add(ClientEvents.GO_FRIEND_HOME.on(this.hideBubble));
        this.dispose.add(ClientEvents.BACK_HOME.on(this.showBubble));
        this.dispose.add(ClientEvents.GAME_SHOW.on(this.gameShowResetInterval));
    }

    close = () => {
        this.node.removeFromParent(true);
        this.node.destroy();
    };

    hideBubble = () => {
        this.node.active = false;
        this.unscheduleAllCallbacks();
    };

    gameShowResetInterval = () => {
        this.unscheduleAllCallbacks();
        this.initInterval();
    };

    showBubble = () => {
        this.node.active = true;
        this.initInterval();
    };

    private _bindEvent() {
        ButtonMgr.addClick(this.seeMovie, this.openMovie);
        ButtonMgr.addClick(this.shareGame, this.shareExpand);
        ButtonMgr.addClick(this.expandTimeEnd, this.goToExpand);
    }

    openMovie = () => {
        WxVideoAd.showVideo(() => {
            DotInst.clientSendDot(COUNTERTYPE.expandMarket, "18001", DataMgr.iMarket.getExFrequency().toString());
            HttpInst.postData(NetConfig.RESET_EXPAND_TIME, [], () => {
                DataMgr.iMarket.resetExpandTime();
                this.timeEndAni();
                ChestRes.addTime();
                DataMgr.setAdInfoById(7, ChestRes.getExpandSeeMovieTime());
            });
        }, () => {
            UIMgr.showTipText("请观看完整广告！");
        });
    };

    shareExpand = () => {
        let shareJs: IShareJson = JsonMgr.getShareJsonByType(SHARE_TYPE.wxExpand);
        GameManager.WxServices.shareGame(shareJs.word, shareJs.pictrue, "", () => {
            DotInst.clientSendDot(COUNTERTYPE.expandMarket, "18002", DataMgr.iMarket.getExFrequency().toString());
            HttpInst.postData(NetConfig.RESET_EXPAND_TIME, [], () => {
                DataMgr.iMarket.resetExpandTime();
                this.timeEndAni();
            });
        });
    };

    initInterval() {
        let iMarket = DataMgr.iMarket;
        this.scene = JsonMgr.getSceneDataByMarketId(iMarket.getExFrequency(), iMarket.getMarketId());
        this.needTime = this.scene.waitTime;
        this.endTime = DataMgr.iMarket.getExpandTime();
        this.serverTime = DataMgr.getServerTime();
        if (this.endTime < this.serverTime || this.endTime === -1) {
            this.timeEndAni();
        } else {
            this.hasTime = Math.ceil((this.endTime - this.serverTime) / 1000);
            this.initWithInterval();
        }
    }

    initWithInterval() {
        this.movieJson = JsonMgr.getMovieInfo(7);
        let seeResult = (ChestRes.getExpandSeeMovieTime() < this.movieJson.count) && DataMgr.isCanWatchAdvert();
        this.shareGame.active = !seeResult;
        this.seeMovie.active = seeResult;
        this.initProgress();
        this.progressInterVal();
    }

    initProgress() {
        let time = TimeUtil.getTimeBySecond(this.hasTime);
        let h = this.formatTime(time.h);
        let m = this.formatTime(time.m);
        let s = this.formatTime(time.s);
        this.timeLabel.string = h + ":" + m + ":" + s;
    }

    formatTime(time: number) {
        return time / 10 >= 1 ? time.toString() : "0" + time.toString()
    }

    refreshTime(changeTime: number) {
        this.hasTime -= changeTime;
        this.initProgress();
    }

    progressInterVal() {
        this.schedule(() => {
            this.hasTime--;
            if (!this.hasTime) {
                this.hasTime = 0;
                this.timeEndAni();
            } else {
                this.initProgress();
            }
        }, 1);
    }

    timeEnd = () => {
        this.unscheduleAllCallbacks();
        this.expandingNode.active = false;
        this.expandTimeEnd.active = true;
    };

    timeEndAni = () => {
        this.unscheduleAllCallbacks();
        this.expandingNode.runAction(cc.sequence(cc.spawn(cc.fadeOut(.2), cc.moveBy(.2, 0, 20))
            , cc.callFunc(() => {
                this.expandTimeEnd.opacity = 0;
                this.expandTimeEnd.y += 20;
                this.expandTimeEnd.active = true;
                this.expandTimeEnd.runAction(cc.spawn(cc.fadeIn(.2), cc.moveBy(.2, 0, -20)));
            })));
    };

    goToExpand = () => {
        if (this.hasClick) {
            return;
        }
        let iMarket = DataMgr.iMarket;
        DotInst.clientSendDot(COUNTERTYPE.expandMarket, "18005", DataMgr.iMarket.getExFrequency().toString());
        let sceneData = JsonMgr.getSceneDataByMarketId(iMarket.getExFrequency() + 1, iMarket.getMarketId());
        if (!sceneData.choiceB) {
            ChestRes.httpExpand(0, () => {
                ChestRes.destroyNode();
            }, () => {
                this.hasClick = false;
            });
        } else {
            UIMgr.showView(ExpandChoseFuture.url, null, null, (node: cc.Node) => {
                node.getComponent(ExpandChoseFuture).initSceneData();
            }, false, 1002);
        }
    };

    protected onDestroy(): void {
        this.dispose.dispose();
    }
}