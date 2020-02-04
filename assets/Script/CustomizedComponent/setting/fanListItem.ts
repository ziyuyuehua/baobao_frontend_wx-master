// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {IFanInfo, IRespData} from "../../types/Response";
import {DataMgr} from "../../Model/DataManager";
import {ButtonMgr} from "../common/ButtonClick";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import {CacheMap, FutureState} from "../MapShow/CacheMapDataManager";
import {UIMgr} from "../../global/manager/UIManager";
import MapLoading from "../MapShow/MapInit/MapLoading";
import setting from "./setting";
import fanList from "./fanList";
import FriendsScene from "../friends/friendsScene";
import {ExpUtil} from "../MapShow/Utils/ExpandUtil";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {UIUtil} from "../../Utils/UIUtil";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class fanListItem extends cc.Component {

    @property(cc.Node)
    private backNode1: cc.Node = null;

    @property(cc.Node)
    private backNode2: cc.Node = null;

    @property(cc.Sprite)
    private marketlevel: cc.Sprite = null;

    @property(cc.Label)
    private fanName: cc.Label = null;

    @property(cc.Node)
    private fanFocusNode: cc.Node = null;

    @property(cc.Sprite)
    private headSprite: cc.Sprite = null;

    @property(cc.Sprite)
    private pictureSprite: cc.Sprite = null;

    @property(cc.Node)
    private visitNode: cc.Node = null;

    @property(cc.Node)
    private attenNode: cc.Node = null;

    @property(cc.Node)
    private mutualNode: cc.Node = null;

    @property(cc.Sprite)
    private levelIcon: cc.Sprite = null;

    private fanData: IFanInfo = null;
    private isFocus: boolean = false;

    start() {
        ButtonMgr.addClick(this.fanFocusNode, this.focusFriend);
        ButtonMgr.addClick(this.visitNode, this.visitFriend);
    }

    focusFriend = () => {
        if (this.isFocus) {
            HttpInst.postData(NetConfig.QUXIAOGUANZHU, [this.fanData.id], (res) => {
                this.isFocus = false;
                this.attenNode.active = true;
                this.mutualNode.active = false;
                if (res.staff) {
                    DataMgr.staffData.update(res.staff);
                }
            });
        } else {
            HttpInst.postData(NetConfig.GUANZHU, [this.fanData.id], (res) => {
                this.isFocus = true;
                this.attenNode.active = false;
                this.mutualNode.active = true;
            });
        }
    }

    visitFriend = () => {
        let nowMarketId = DataMgr.iMarket.getMarketId();
        DotInst.clientSendDot(COUNTERTYPE.mainPage, "2044");
        HttpInst.postData(NetConfig.VISIT_FRIEND, [this.fanData.id, 1], (resp: IRespData) => {
            UIMgr.closeView(setting.url);
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
            UIMgr.closeView(fanList.url);
            ClientEvents.MAP_CLEAR_PEOPLE.emit();
            UIMgr.showView(MapLoading.url, null, null, (node: cc.Node) => {
                ClientEvents.EVENT_HIDE_UI.emit(false);
                node.getComponent(MapLoading).init(() => {
                    ExpUtil.refreshData();
                    UIMgr.resetViewToMiddle();
                    ExpUtil.refreshData();
                    ClientEvents.LOAD_NEW_MARKET.emit(nowMarketId);
                    MapMgr.setMapState(FutureState.ACCESS);
                    ClientEvents.GO_FRIEND_HOME.emit();
                });
            }, false, 1001);
            setTimeout(() => {
                UIMgr.showView(FriendsScene.url, null, null, (node: cc.Node) => {
                    node.getComponent(FriendsScene).loadFriends(resp);
                    node.zIndex = 99;
                });
            }, 900);
        });
    }

    itemInit = (data: IFanInfo, index: number) => {
        this.fanData = DataMgr.settingData.getFansData()[index];
        this.isFocus = this.fanData.mutualFocus;
        let num: number = (index + 1) % 2;
        this.backNode1.active = num != 0;
        this.backNode2.active = num == 0;
        this.setFansItem();
    }

    setFansItem() {
        DataMgr.addUrlData(this.fanData.head);
        UIUtil.loadUrlImg(this.fanData.head, this.headSprite);
        this.fanName.string = this.fanData.nickName;
        this.attenNode.active = !this.fanData.mutualFocus;
        this.mutualNode.active = this.fanData.mutualFocus;
        let postionJson: IPositionJson = JsonMgr.getPositionJson(this.fanData.positionId);
        ResMgr.setPositionIcon(this.levelIcon, postionJson.positionIcon, false);
        ResMgr.setPositionIcon(this.marketlevel, postionJson.positionName, false);
    }

    // update (dt) {}
}
