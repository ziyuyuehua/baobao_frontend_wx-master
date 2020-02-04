import {UIMgr} from "../../../global/manager/UIManager";
import {HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import {IFocusInfo} from "../../../types/Response";
import {DataMgr} from "../../../Model/DataManager";
import {ButtonMgr} from "../../common/ButtonClick";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {GameComponent} from "../../../core/component/GameComponent";
import {ArrowType} from "../../common/Arrow";
import fosterDropItem from "../fosterCare/fosterDropItem";
import {topUiType} from "../../MainUiTopCmpt";
import List from "../../../Utils/GridScrollUtil/List";
import friendFosterCareItem from "../fosterCare/friendFosterCareItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class friendFosterCareList extends GameComponent {
    static url: string = "fosterCare/friendFosterCareList";
    @property(List)
    focusListV: List = null;

    @property(cc.Button)
    private fosterCareBtn: cc.Button = null;

    @property(cc.Prefab)
    private dropItem: cc.Prefab = null;

    @property(cc.Node)
    private dropNode: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.Node)
    private arrow: cc.Node = null;

    private index: number = -1;

    start() {
        this.addEvent(ClientEvents.SELECT_CLICK.on(this.updateSelected));
        this.addEvent(ClientEvents.REFRESH_FOSTER_SCROLL.on(this.initScroll));
        ButtonMgr.addClick(this.fosterCareBtn.node, this.sendRequest);
        ButtonMgr.addClick(this.arrow, this.sendRequest);
        this.setFosterCareArrow();
        this.init();
    }

    setFosterCareArrow = () => {
        this.arrow.active = DataMgr.getGuideCompleteTimeById(ArrowType.FosterCareArrow) <= 0;
    }

    protected getBaseUrl(): string {
        return friendFosterCareList.url;
    }

    onEnable(): void {
        this.onShowPlay(2, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    updateSelected = (id: number, isDefault: boolean) => {
        this.index = id;
        let nid: number = -1;
        let data: IFocusInfo[] = DataMgr.fosterCare.getFosterFriends();
        for (let i = 0; i < data.length; i++) {
            if (DataMgr.fosterCare.friendsIdArray.indexOf(data[i].id) <= -1) {
                nid = i;
                break;
            }
        }
        if (!isDefault) {
            nid = id;
        }
        if (nid == -1) return;
        ClientEvents.REFRESH_SELECT.emit(nid);
        DataMgr.fosterCare.friendId = data[nid].id;
        this.fosterCareBtn.interactable = this.index != -1;
        this.fosterCareBtn.enableAutoGrayEffect = this.index == -1;
    }

    sendRequest = () => {
        let friendId: number = DataMgr.fosterCare.friendId;
        let staffId: number = DataMgr.staffData.fosteCareStaffId;
        HttpInst.postData(NetConfig.FOSTER_STAFF, [friendId, staffId], (res) => {
            if (DataMgr.getGuideCompleteTimeById(ArrowType.FosterCareArrow) <= 0) {
                HttpInst.postData(NetConfig.SOFT_LED_INFO, [ArrowType.FosterCareArrow], (response) => {
                    ClientEvents.FOSTER_ARROW.emit(false);
                });
            }
            DataMgr.getFosterCare().setFosterCare(res.fosterList);
            DataMgr.staffData.update(res.staff);
            ClientEvents.UPDATE_STAFFLIST.emit();
            ClientEvents.REFRESH_FOSTERLIST.emit();
            UIMgr.closeView(friendFosterCareList.url);
        });
    }

    init() {
        this.index = -1;
        this.updateSelected(0, true);
        this.initScroll();
        this.setDropItem();
        this.fosterCareBtn.interactable = this.index != -1;
        this.fosterCareBtn.enableAutoGrayEffect = this.index == -1;
    }

    initScroll = () => {
        let data = DataMgr.fosterCare;
        this.focusListV.selectedId = -1;
        if (data && data.getFocusSize() > 0) {
            this.focusListV.scrollTo(0, 0);
            this.focusListV.numItems = data.getFocusSize();
        } else {
            this.focusListV.numItems = 0;
        }
    };

    setDropItem() {
        let id: number = DataMgr.staffData.fosteCareStaffId;
        let star: number = DataMgr.getStaff(id).star;
        let fosterTemp: IFoster = JsonMgr.getFoster(star);
        let dropArr: number[] = fosterTemp.itemId;
        dropArr.sort((a, b) => {
            let aTemp = JsonMgr.getInformationAndItem(a);
            let bTemp = JsonMgr.getInformationAndItem(b);
            if (aTemp.color != bTemp.color) {
                return bTemp.color - aTemp.color;
            }
        });
        for (let i = 0; i < dropArr.length; i++) {
            let prefab = cc.instantiate(this.dropItem);
            let node: fosterDropItem = prefab.getComponent("fosterDropItem");
            node.loadItem(dropArr[i]);
            this.dropNode.addChild(prefab);
        }
    }

    //列表渲染器
    onListVRender(item: cc.Node, idx: number) {
        //let data: Focus = DataMgr.getFocusData();
        let data1: Array<IFocusInfo> = DataMgr.fosterCare.getFosterFriends();
        DataMgr.fosterCare.upFocusData(idx);
        let friendsItem: friendFosterCareItem = item.getComponent(friendFosterCareItem);
        friendsItem.itemInit(data1[idx], idx);
    }

    destroyBtn() {
        UIMgr.closeView(friendFosterCareList.url);
    }
}

