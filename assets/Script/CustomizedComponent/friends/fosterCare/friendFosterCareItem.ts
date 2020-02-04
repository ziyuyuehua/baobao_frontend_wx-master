import {CompositeDisposable} from "../../../Utils/event-kit";
import {DataMgr} from "../../../Model/DataManager";
import {Focus, FosterCareData} from "../../../Model/FriendsData";
import {ButtonMgr} from "../../common/ButtonClick";
import {IFocusInfo, IFriendsItem} from "../../../types/Response";
import {HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import {UIUtil} from "../../../Utils/UIUtil";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {CommonUtil} from "../../../Utils/CommonUtil";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {ResMgr} from "../../../global/manager/ResManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class friendFosterCareItem extends cc.Component {

    // @property(cc.Node)
    // private headportrait: cc.Node = null;

    //头像框
    @property(cc.Sprite)
    private pictureframe: cc.Sprite = null;
    //头像
    @property(cc.Sprite)
    private headportrait: cc.Sprite = null;

    @property(cc.Node)
    private inFosterCare: cc.Node = null;
    @property(cc.Label)
    private storeNameLabel: cc.Label = null;
    @property(cc.Label)
    private getExpLabel: cc.Label = null;
    @property(cc.Node)
    private selected: cc.Node = null;
    @property(cc.Label)
    private popuLabel: cc.Label = null;
    @property(cc.Sprite)
    private levelIcon: cc.Sprite = null;
    private dispose = new CompositeDisposable();
    private friendsData: IFocusInfo = null;
    private index: number = 0;


    onLoad() {
        //this.dispose.add(ClientEvents.EVENT_FOCUS_SLIDE.on(this.panduan));
        //this.dispose.add(ClientEvents.EVENT_REFRESH_GOODSITEM.on(this.refreshItem));
    }

    start() {
        this.dispose.add(ClientEvents.REFRESH_SELECT.on(this.updateSelected));
        ButtonMgr.addClick(this.node, this.selectedIndex);
    }

    updateSelected = (id: number) => {
        this.selected.active = this.index == id;
    }

    selectedIndex = () => {
        if(!this.friendsData) return;
        let data: Array<IFocusInfo> = DataMgr.fosterCare.fosterFriends;
        if (DataMgr.fosterCare.friendsIdArray.indexOf(this.friendsData.id) > -1) {
            return;
        }
        DotInst.clientSendDot(COUNTERTYPE.fostercase, "10304", this.friendsData.id + "");
        DataMgr.loadFocusData(null);
        DataMgr.getFocusData().setFriendsID(data[this.index].id);
        ClientEvents.SELECT_CLICK.emit(this.index, false);
    }

    itemInit = (data: IFocusInfo, idx: number) => {
        this.index = idx;
        this.friendsData = data;
        if(!this.friendsData) return;
        this.selected.active = this.friendsData.id == DataMgr.fosterCare.friendId;
        this.popuLabel.string = CommonUtil.calculate(this.friendsData.allPopularity).toString();
        //头像
        DataMgr.addUrlData(this.friendsData.head);
        UIUtil.loadUrlImg(this.friendsData.head, this.headportrait); //头像
        //玩家名字
        this.storeNameLabel.string = this.friendsData.nickName.length > 6 ? this.friendsData.nickName.substring(0, 6) + "..." : this.friendsData.nickName;
        //是否已寄养
        this.inFosterCare.active = DataMgr.fosterCare.friendsIdArray.indexOf(this.friendsData.id) > -1;
        let postionJson: IPositionJson = JsonMgr.getPositionJson(data.positionId);
        ResMgr.setPositionIcon(this.levelIcon, postionJson.positionIcon, false);
    }

    protected onDestroy(): void {
        this.dispose.dispose();
        this.node.destroy();
    }

    // update (dt) {}
}
