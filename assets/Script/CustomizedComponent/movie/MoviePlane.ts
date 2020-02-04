/**
 * @author Lizhen
 * @date 2019/11/2
 * @Description:
 */
import {GameComponent} from "../../core/component/GameComponent";
import {JsonMgr} from "../../global/manager/JsonManager";
import {CommonUtil, Reward} from "../../Utils/CommonUtil";
import {UIUtil} from "../../Utils/UIUtil";
import CommonSimItem, {SetBoxType} from "../common/CommonSimItem";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {IRespData} from "../../types/Response";
import {WxVideoAd} from "../login/WxVideoAd";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import {GameManager} from "../../global/manager/GameManager";
import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;

const millis2Day = 24 * 60 * 60 * 1000;
const millis2Hour = 60 * 60 * 1000;
const millis2Minute = 60 * 1000;
const millis2Second = 1000;

@ccclass()
export class MoviePlane extends GameComponent {
    static url: string = "Prefab/movie/MoviePlane";
    @property(cc.Node)
    failRewards: cc.Node = null;
    @property(cc.Node)
    rewardNode: cc.Node = null;
    @property(cc.Node)
    cdNode: cc.Node = null;
    @property(cc.Label)
    desLabel: cc.Label = null;
    @property(cc.Node)
    movieNode: cc.Node = null;
    @property(cc.Node)
    shareNode: cc.Node = null;
    private movieJson: IAdvertisementJson = null;
    private movieData: any = null;

    getBaseUrl() {
        return MoviePlane.url;
    }

    onEnable() {
        this.onShowPlay(2, this.node.getChildByName("bg"));
    }

    initData(type: number, data: any) {//看广告类型 advertisement表
        this.movieJson = JsonMgr.getMovieInfo(type);
        this.movieData = data;
        this.initView();
    }

    initView() {
        let cost: number = JsonMgr.getAniConstVal("releaseTimePreDiamond");
        if ((this.movieJson.count - this.movieData.adCount) <= 0) {
            this.desLabel.string = "今天已达到最大观影次数，明天可继续观看领奖哦～";
            this.failRewards.active = false;
            this.cdNode.active = true;
            let Time: number = DataMgr.getServerTime();
            this.getLongOrderTimeStr((this.movieData.timeEnd - (Time)));
            this.refuseCd();
        } else {
            if(!DataMgr.isCanWatchAdvert()){
                this.desLabel.string = "今日还可分享【"+(this.movieJson.count - this.movieData.adCount)+" 】次，分享完毕有几率获得以下道具！";
            }else{
                this.desLabel.string = "今日还可观影【"+(this.movieJson.count - this.movieData.adCount)+" 】次，观影完毕有几率获得以下道具！";
            }
            this.movieNode.active = DataMgr.isCanWatchAdvert();
            this.shareNode.active = !DataMgr.isCanWatchAdvert();
            this.failRewards.active = true;
            this.cdNode.active = false;
            this.initFailRewards();
        }
    }

    getLongOrderTimeStr(millis: number) {//长途订单特殊时间显示
        let hour = Math.floor(millis / millis2Hour);
        let remainder = millis % millis2Hour;
        let minute = Math.floor(remainder / millis2Minute);
        remainder = remainder % millis2Minute;
        let second = Math.floor(remainder / millis2Second);
        this.cdNode.getChildByName("cdTime1").getComponent(cc.Label).string = this.longOrderPadding(hour).toString()[0];
        this.cdNode.getChildByName("cdTime2").getComponent(cc.Label).string = this.longOrderPadding(hour).toString()[1];
        this.cdNode.getChildByName("cdTime3").getComponent(cc.Label).string = this.longOrderPadding(minute).toString()[0];
        this.cdNode.getChildByName("cdTime4").getComponent(cc.Label).string = this.longOrderPadding(minute).toString()[1];
        this.cdNode.getChildByName("cdTime5").getComponent(cc.Label).string = this.longOrderPadding(second).toString()[0];
        this.cdNode.getChildByName("cdTime6").getComponent(cc.Label).string = this.longOrderPadding(second).toString()[1];
    }

    longOrderPadding(num: number) {
        let numStr = num + "";
        return numStr.length < 2 ? "0" + numStr : numStr;
    }

    refuseCd() {
        this.schedule(() => {
            let Time: number = DataMgr.getServerTime();
            if (this.movieData.endCd <= Time) {
                this.unscheduleAllCallbacks();
            } else {
                this.getLongOrderTimeStr((this.movieData.timeEnd - (Time)));
            }
        }, 1);
    }
    private awardsData:any = [];
    initFailRewards() {
        this.rewardNode.removeAllChildren();
        this.itemArr = [];
        if (this.movieJson.rewardType == 1) {
            let drop = JsonMgr.getDropArrByItem(this.movieJson.reward1);
            this.awardsData = drop;
        } else {
            this.awardsData = CommonUtil.toRewards(this.movieJson.reward2);
        }
        cc.log(this.awardsData);
        this.createItem();
        this.rewardNode.width = this.awardsData.length * 106;
    }
    private itemArr:any = [];
    createItem=()=> {
        if (this.itemArr.length == this.awardsData.length) return;
        let data: Reward = this.awardsData[this.itemArr.length];
        UIUtil.dynamicLoadPrefab(CommonSimItem.url, (rewardItem) => {
            if(!this.itemArr) return;
            rewardItem.parent = this.rewardNode;
            this.itemArr.push(rewardItem);
            let component: CommonSimItem = rewardItem.getComponent("CommonSimItem");
            component.updateItem(data.xmlId, data.number,SetBoxType.Item,1,this.createItem);
        });
    }

    sureHandler() {
        if ((this.movieJson.count - this.movieData.adCount) <= 0) {
            UIMgr.showTipText("今天已达到最大观影次数，明天可继续观看领奖哦～");
        } else {
            if(!DataMgr.isCanWatchAdvert()){
                GameManager.WxServices.shareGame("来和我一起成为店长拥有自己的小店吧~",`https://cdn.nuojuekeji.com/uploadImages/share/xuanchuan2.png`,"",()=>{
                    this.hideMovie(1);
                });
            }else{
                WxVideoAd.showVideo(() => {
                    this.hideMovie(0);
                }, () => {
                    UIMgr.showTipText("请观看完整广告！");
                })
            }
        }
    }
    hideMovie(type:number){
        HttpInst.postData(NetConfig.SEE_ADVERT,
            [this.movieJson.id,type], (response: IRespData) => {
                this.movieData = response;
                if ((this.movieJson.count - this.movieData.adCount) <= 0) {
                    UIMgr.hideMovieNode();
                }
                if(!this.isValid) return;
                this.closeOnly();
            });
    }

    closeHandler() {
        this.closeOnly();
        this.unscheduleAllCallbacks();
    }
}