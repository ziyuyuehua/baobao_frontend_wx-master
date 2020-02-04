import {GameComponent} from "../../core/component/GameComponent";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {RedConst} from "../../global/const/RedConst";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {DataMgr} from "../../Model/DataManager";
import List from "../../Utils/GridScrollUtil/List";
import {UIUtil} from "../../Utils/UIUtil";
import {COUNTERTYPE, DotInst, DotVo} from "../common/dotClient";
import announcementItem from "./announcementItem";
import pageView from "./pageView";
import {UIMgr} from "../../global/manager/UIManager";
import announcementActivate from "./announcementActivate";
import {topUiType} from "../MainUiTopCmpt";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class AnnouncementView extends GameComponent {
    static url = 'announcement/announcementView';

    @property(List)
    private grideScroll: List = null;

    @property(cc.Prefab)
    AnnounceItem: cc.Prefab = null;

    @property(cc.Node)
    announcement: cc.Node = null;

    @property(cc.Sprite)
    TipBg: cc.Sprite = null;

    @property(cc.Sprite)
    Tip: cc.Sprite = null;

    @property(cc.Prefab)
    pagePrefab: cc.Prefab = null;

    @property(cc.PageView)
    PageView: cc.PageView = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    private noticeBarData: any[] = [];
    private timeAddNum: number = 0;
    ble: boolean;

    getBaseUrl() {
        return AnnouncementView.url;
    }

    start() {
        this.registeredClientEvent();
        this.TipBg.node.on(cc.Node.EventType.TOUCH_END, this.ChangeNoticeStatus)
        this.Tip.node.active = !DataMgr.getPopUp();
        // ClientEvents.EVENT_SWITCH_MASK.emit(true);
        this.updateScroll();
    }

    onEnable() {
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
        DataMgr.increaseTopUiNum();
    }

    onDisable() {
        this.dispose.dispose();
        DataMgr.decrTopUiNum();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    // updateUserNoticeLisrt() {
    //     let list = DataMgr.getNoticeListr();
    //     this.updateScroll(list);
    // }

    // sendNoticeList=(response)=> {
    //     // HttpInst.postData(NetConfig.NOTICE_LIST, [], (response) => {
    //         this.updateScroll(response.notices);
    //     // })
    // };

    updateScroll() {
        this.initScrillView();
        this.setBarData();
    }

    setBarData() {
        let noticeData = DataMgr.announcementData.NoticeData;
        for (let nid in noticeData) {
            if (noticeData[nid].adImg != "") {
                this.noticeBarData.push(noticeData);
                let mailboxPrefab = cc.instantiate(this.pagePrefab);
                let item: pageView = mailboxPrefab.getComponent("pageView");
                item.initView(Number(nid));
                this.PageView.addPage(mailboxPrefab);
            }
        }
    }

    initScrillView() {

        let heightArr: number[] = [];
        let noticeDataVo = DataMgr.announcementData.NoticeData;
        for (let nid = 0; nid < noticeDataVo.length; nid++) {
            if (noticeDataVo[nid].titleImg != "") {
                heightArr.push(184);
            } else {
                heightArr.push(142);
            }
        }
        this.grideScroll.customSize = heightArr;
        this.grideScroll.numItems = DataMgr.announcementData.NoticeData.length;
    }

    onListVRender(item: cc.Node, idx: number) {
        let announceItem: announcementItem = item.getComponent(announcementItem);
        announceItem.reuse(idx);
        // popularityItem.updateItem(this.favorAllData[idx]);
    }

    ChangeNoticeStatus = () => {
        let type = 0;
        if (this.Tip.node.active == false) {
            type = 1
        }

        HttpInst.postData(NetConfig.CHANG_NOTICE_STATUS, [], (response) => {
            cc.log(response);
            this.Tip.node.active = !response.popUp;
            DataMgr.setPopUp(response.popUp);
        });
    }

    registeredClientEvent() {
        this.addEvent(ClientEvents.OPEN_ACTIVATEIN_INFO_VIEW.on(this.openActivate));
        this.addEvent(ClientEvents.CLOSE_ANNOUNEC_VIEW.on(() => {
            this.closeHandler();
        }))
    }

    openActivate = (nIndx, ble: boolean = false) => {
        this.ble = ble;
        let send = {nIndx: nIndx}
        UIMgr.showView(announcementActivate.url, null, send);
    }

    closeHandler() {
        DotInst.clientSendDot(COUNTERTYPE.announce, "1003");

        ClientEvents.UPDATE_MAINUI_RED_GONG.emit({FeaturesId: RedConst.ANNOUNCENENTRED, status: false});
        if (!this.ble) {
            // ClientEvents.EVENT_SWITCH_MASK.emit(false);
        }

        UIUtil.deleteLoadUrlImg(DataMgr.getUrlDataArr());
        DataMgr.clearUrlData();
        // this.node.destroy();
        this.closeView();
        this.node.removeFromParent();
        // DataMgr.showMap();
    }

    update(dt) {
        if (this.noticeBarData.length > 0) {
            this.timeAddNum++
            if (this.timeAddNum == 300) {
                this.timeAddNum = 0;
                let ncurIndx: number = this.PageView.getCurrentPageIndex();
                let nNextInde: number = ncurIndx + 1;
                if (nNextInde >= this.noticeBarData.length) {
                    nNextInde = 0
                }
                this.PageView.setCurrentPageIndex(nNextInde);
            }
        }
    }
}
