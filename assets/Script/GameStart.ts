/*
 * @Author: tyq
 * @Date: 2019-01-08
 * @Desc: 入口
 */


import {CompositeDisposable} from "./Utils/event-kit";
import {ClientEvents} from "./global/manager/ClientEventCenter";
import {DataMgr} from "./Model/DataManager";
import {UIMgr} from "./global/manager/UIManager";
import {UIUtil} from "./Utils/UIUtil";
import {MapResMgr} from "./CustomizedComponent/MapShow/MapResManager";
import {GameManager} from "./global/manager/GameManager";
import {MainUiPrefad} from "./CustomizedComponent/mainUiPrefad";
import {MainUiTopCmpt} from "./CustomizedComponent/MainUiTopCmpt";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameStart extends cc.Component {

    @property(cc.Node)
    private masks: cc.Node = null;

    @property(cc.Prefab)
    private mainUiPrefab: cc.Prefab = null;

    private dispose = new CompositeDisposable();

    onLoad() {
        this.dispose.add(ClientEvents.INIT_NEW_MAP.on(this.refreshMap));
        this.dispose.add(ClientEvents.ADD_MAIN_UI_TOP.on(this.addMainUiTop));

        UIUtil.resize(this.node.getComponent(cc.Canvas));

        UIMgr.addLoading();
        UIMgr.addMapToCanvas(this.node);
        UIMgr.setMask(this.masks);

        DataMgr.setFinishedLoad();
    }

    start() {
        this.addMainUi();

        if (!DataMgr.checkInPowerGuide()) {
            DataMgr.starPolling();
        }
        if(!DataMgr.isFirstPowerGuide()){
            this.addMainUiTop();
        }
    }

    private addMainUi(){
        // UIUtil.dynamicLoadPrefab(MainUiPrefad.url, (mainUiNode: cc.Node) => {
            let mainUiNode = cc.instantiate(this.mainUiPrefab);
            this.node.addChild(mainUiNode, 10);
            cc.log("add mainUi");
            // mainUiNode.getComponent(MainUiPrefad).infoNovice();
        // });
    }

    private addMainUiTop = () => {
        UIMgr.closeView(MainUiTopCmpt.url);
        UIMgr.showView(MainUiTopCmpt.url, this.node, null, null, false, 1000);
        // UIUtil.dynamicLoadPrefab(MainUiTopCmpt.url, (mainUiTopNode: cc.Node) => {
        //     // let mainUiTopNode = cc.instantiate(this.mainUiTop);
        //     this.node.addChild(mainUiTopNode, 1000);
        //     cc.log("add mainUiTop");
        // });
    };

    refreshMap = () => {
        setTimeout(() => {
            MapResMgr.loadMapBg(null);
        }, 200);
    };

    onEnable() {
        if (DataMgr.assistanceRewards != null) {//登陆的时候显示界面
            UIMgr.showPopupDialog(DataMgr.assistanceRewards);
            DataMgr.assistanceRewards = null;
        }
    }

    onDestroy() {
        UIMgr.closeSceneClearNode();
        DataMgr.stopPolling();
        UIMgr.setMask(null);
        this.dispose.dispose();
        if(!GameManager.isDebug){
            wx && wx.triggerGC();
        }
    }

}
