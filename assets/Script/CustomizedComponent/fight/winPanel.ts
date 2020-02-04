import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {ShopBattleConfig} from "../../global/manager/JsonManager";
import {AudioMgr} from "../../global/manager/AudioManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {UIUtil} from "../../Utils/UIUtil";
import CommonSimItem from "../common/CommonSimItem";
import {MapResMgr} from "../MapShow/MapResManager";
import {UIMgr} from "../../global/manager/UIManager";

@ccclass()
export class winPanel extends cc.Component{
    @property(cc.Node)
    guang:cc.Node = null;
    @property(cc.Node)
    sureBtn:cc.Node = null;
    @property(sp.Skeleton)
    box1:sp.Skeleton = null;
    @property(sp.Skeleton)
    box2:sp.Skeleton = null;
    @property(sp.Skeleton)
    box3:sp.Skeleton = null;
    @property(sp.Skeleton)
    box4:sp.Skeleton = null;

    @property(sp.Skeleton)
    titleSke:sp.Skeleton = null;

    private goHomeState: boolean = false;

    private shopBattleConfig:ShopBattleConfig = null;

    private isCanTouch:boolean = false;
    initData(shopBattleConfig:ShopBattleConfig){
        this.shopBattleConfig = shopBattleConfig;
    }
    onLoad(){
        AudioMgr.playEffect("Audio/fight/fight_win");
        this.box1.animation = "kaishi";
        this.box1.setCompleteListener(()=>{
            this.box1.clearTracks();
            this.box1.node.active = false;
            this.box2.animation = "xunhuan";
        });
    }
    openBox(){
        this.box2.clearTracks();
        this.box1.node.active = false;
        this.box2.node.active = false;
        this.box3.animation = "kaibaoxiang";
        this.box3.setCompleteListener(()=>{
            this.box4.animation = "kaibaoxianghou";
            this.sureBtn.active = true;
            this.box3.node.active = false;
            this.playMovie();
        });
    }
    playMovie(){
        this.titleSke.animation = "animation";
        this.titleSke.setCompleteListener(()=>{
            this.titleSke.setCompleteListener(null);
            this.titleSke.setAnimation(0,"animation2",true);
            let scale = cc.scaleTo(0.3,1,1);
            scale.easing(cc.easeBackOut());
            this.guang.runAction(cc.sequence(scale,cc.callFunc(()=>{
                this.initRewards();
                this.isCanTouch = true;
            })));
        });
    }
    BackMainScene(){
        if(!this.isCanTouch) return;
        if(!this.goHomeState) {
            this.goHomeState = true;
            HttpInst.postData(NetConfig.GET_HOME_INFO, [], () => {
                cc.director.preloadScene("mainScene", (completedCount: number, totalCount: number, item: any) => {
                    let pro = completedCount / totalCount;
                }, (error: Error) => {
                    if (error) {
                        cc.log(error);
                        return;
                    }
                    UIMgr.showLoading();
                    MapResMgr.loadMapBg(null, () => {
                        UIMgr.hideLoading();
                        cc.director.loadScene("mainScene",()=>{
                        });
                    });
                })
            });
        }
    }
    initRewards(){
        let arr = this.shopBattleConfig.reward.split(";");
        this.node.getChildByName("content").width = 90*arr.length+10*(arr.length-1);
        for(let i = 0;i<arr.length;i++){
            let rewArr = arr[i].split(",");
            UIUtil.dynamicLoadPrefab(CommonSimItem.url,(rewardItem)=>{
                rewardItem.parent = this.node.getChildByName("content");
                let component:CommonSimItem = rewardItem.getComponent("CommonSimItem");
                component.updateItem(parseInt(rewArr[0]),parseInt(rewArr[1]))
            });
        }
    }
}
