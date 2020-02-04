// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {IFanInfo, IFansInfo, ISearchFanInfo} from "../../types/Response";
import {DataMgr} from "../../Model/DataManager";
import {CommonUtil} from "../../Utils/CommonUtil";
import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";
import List from "../../Utils/GridScrollUtil/List";
import fanListItem from "./fanListItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class fanList extends GameComponent {
    static url: string = "setting/other/fanList";
    @property(cc.Node)
    private fansScrollView: cc.Node = null;

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    @property(cc.Label)
    private fansLabel: cc.Label = null;

    @property(cc.EditBox)
    private searchEdit: cc.EditBox = null;

    @property(cc.Prefab)
    private fanListItem: cc.Prefab = null;

    @property(cc.Node)
    private searchNode: cc.Node = null;

    @property(cc.Node)
    private noFansNode: cc.Node = null;

    @property(cc.Node)
    private noSearchNode: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(List)
    private fansListV = null;

    private fansScroll = null;
    private fansSize: number = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.init();
        ButtonMgr.addClick(this.closeBtn, this.closeHandler);
        ButtonMgr.addClick(this.searchNode, this.searchFanInfo);
    }

    protected getBaseUrl(): string {
        return fanList.url;
    }

    onEnable(): void {
        this.onShowPlay(2, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    init() {
        HttpInst.postData(NetConfig.FANS_INFO, [1], (response: IFansInfo) => {
            this.fansSize = response.fansSize;
            DataMgr.settingData.setFansData(response.fans);
            DataMgr.settingData.setFansSzie(response.fansSize);
            this.fansLabel.string = "当前粉丝数量: " + CommonUtil.calculate(response.fansSize);
            this.initScroll();
        });
    }

    closeHandler = () => {
        UIMgr.closeView(fanList.url);
    }

    initScroll() {
        let data = DataMgr.settingData;
        this.fansListV.selectedId = -1;
        if (data && data.getFansSzie() > 0) {
            this.fansListV.scrollTo(0, 0);
            this.fansListV.numItems = data.getFansSzie();
            let scrollView: cc.Node = this.fansListV.scrollView.node;
            let content: cc.Node = this.fansListV.scrollView.content;
            if (scrollView.height > content.height) {
                content.height = scrollView.height + 10;
            }
        } else {
            this.fansListV.numItems = 0;
        }
    }

    searchFanInfo = () => {
        if (this.fansSize == 0) return;
        let text: string = this.searchEdit.string;
        if (text.length == 0) {
            UIMgr.showTipText("输入内容不能为空");
            return;
        }
        HttpInst.postData(NetConfig.SEARCH_FAN, [text], (response: ISearchFanInfo) => {
            if (response.queryFriend.length == 0) {
                this.noFansNode.active = false;
                this.noSearchNode.active = true;
                this.fansScrollView.active = false;
                return;
            }
            DataMgr.settingData.setFansData(response.queryFriend);
            DataMgr.settingData.setFansSzie(response.queryFriend.length);
            this.initScroll();
        });
    }

    //列表渲染器
    onListVRender(item: cc.Node, idx: number) {
        //let data: Focus = DataMgr.getFocusData();
        let data: Array<IFanInfo> = DataMgr.settingData.getFansData();
        DataMgr.settingData.updateFans(idx);
        let fansItem: fanListItem = item.getComponent(fanListItem);
        fansItem.itemInit(data[idx], idx);
    }

    // update (dt) {}
}
