import ActivaMainPage from "./ActivaMainPage";
import {GameComponent} from "../../core/component/GameComponent";
import {DataMgr} from "../../Model/DataManager";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../global/manager/JsonManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ActiveMain extends GameComponent {
    static url: string = "active/activeMain";

    @property(cc.Prefab)
    PageViewPre: cc.Prefab = null;

    @property(cc.PageView)
    PageView: cc.PageView = null;

    private maxPage: number = 3;

    getBaseUrl() {
        return ActiveMain.url
    }

    start() {
        this.setPage();
        this.dispose.add(ClientEvents.ACTIVE_BANNER.on(this.pageScroll));
        this.dispose.add(ClientEvents.STOP_ACTIVITE_BANNER.on(()=>{
            this.unscheduleAllCallbacks();
        }));
        this.dispose.add(ClientEvents.UPDATE_BANNER_PLAY.on(this.setPage));
    }

    setPage = () => {
        this.maxPage = DataMgr.getBannerData().length;
        this.PageView.removeAllPages();
        for (let nid = 0; nid < this.maxPage; nid++) {
            let node = cc.instantiate(this.PageViewPre);
            node.getComponent(ActivaMainPage).initView(nid);
            this.PageView.addPage(node);
        }
        // cc.log("pageNum_____",this.PageView.getPages().length)
        this.stopOrAuto();
    };

    //判断banner是否自动播
    stopOrAuto = () => {
        // if (DataMgr.GetSellReward()) {  //有可领取，滑到第二页
        //     this.PageView.setCurrentPageIndex(1);
        // } else {                        //没有自动播
        this.pageScroll();
        // }
    };


    pageScroll = () => {
        this.unscheduleAllCallbacks();
        this.schedule(() => {
            let ncurIndx: number = this.PageView.getCurrentPageIndex();
            let nNextInde: number = ncurIndx + 1;
            if (nNextInde >= this.maxPage) {
                nNextInde = 0
            }
            this.PageView.setCurrentPageIndex(nNextInde);
        }, 3);
    };

    CarouselPage = () => {
        let ncurIndx: number = this.PageView.getCurrentPageIndex();
        let nNextInde: number = ncurIndx + 1;
        if (nNextInde >= 3) {
            nNextInde = 0
        }
        this.PageView.setCurrentPageIndex(nNextInde);
    }

}
