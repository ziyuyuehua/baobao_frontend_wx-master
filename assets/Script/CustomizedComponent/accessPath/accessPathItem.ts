import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {DataMgr} from "../../Model/DataManager";
import {CompositeDisposable} from "../../Utils/event-kit";
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {JumpConst} from "../../global/const/JumpConst";
import {IncidentModel} from "../../Model/incident/IncidentModel";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import {FutureState} from "../MapShow/CacheMapDataManager";
import AccessPathList from "./accessPathList";


const {ccclass, property} = cc._decorator;

@ccclass
export default class AccessPathItem extends cc.Component {
    @property(cc.Node)
    private lockNode: cc.Node = null;
    @property(cc.Sprite)
    private pathIcon: cc.Sprite = null;
    @property(cc.Sprite)
    private pathIconLock: cc.Sprite = null;

    private dispoe = new CompositeDisposable();
    private dotData = null;
    private itemId: number = 0;
    private json: any;
    private parentNode: cc.Node = null;

    start() {
        ButtonMgr.addClick(this.node, this.jumpPage);
    }

    load = (json: any, itemJson: any, parentNode: cc.Node) => {
        this.parentNode = parentNode;
        this.json = json;
        this.dotData = itemJson;
        this.itemId = itemJson.id;
        if (json.lockId != -1) {
            let isLock: boolean = JsonMgr.isFunctionOpen(json.lockId);
            this.lockNode.active = !isLock;
            this.pathIcon.node.active = isLock;
            this.pathIconLock.node.active = !isLock;
            this.setPathIcon(!isLock, json.icon);
        }
        if (json.type == 11) {
            let temp: IShopJson = JsonMgr.getShopJsonByComId(this.itemId);
            let isLock: boolean = DataMgr.iMarket.getTrueExpandTime() < temp.unclockLevel || !JsonMgr.isFunctionOpen(json.lockId);
            this.lockNode.active = isLock;
            this.pathIcon.node.active = !isLock;
            this.pathIconLock.node.active = isLock;
            this.setPathIcon(isLock, json.icon);
        }
    }

    setPathIcon(isLock: boolean, icon) {
        if (isLock) {
            ResMgr.setAccessPathIcon(this.pathIconLock, icon, false);
        } else {
            ResMgr.setAccessPathIcon(this.pathIcon, icon, false);
        }
    }

    jumpPage = () => {
        DotInst.clientSendDot(COUNTERTYPE.assistant, "6301", this.json.id + "");
        if (this.lockNode.active) {
            let str = "";
            let openJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(this.json.lockId);
            if (openJson.openType == 1) {
                str = this.json.descKey + "将于等级" + openJson.value + "级后解锁";
            } else if (openJson.openType == 2) {
                let positionJson: IPositionJson = JsonMgr.getPositionJson(openJson.value);
                str = this.json.descKey + "将于职位达到【" + positionJson.name + positionJson.level + "阶】后解锁";
            }
            if (this.json.type == 11 && JsonMgr.isFunctionOpen(this.json.lockId)) {
                let lockLv = JsonMgr.getShopJsonByComId(this.itemId).unclockLevel;
                let lockNum = lockLv - DataMgr.iMarket.getTrueExpandTime();
                str = this.dotData.name + "将于扩建" + lockNum + "次后解锁商店购买";
            }
            UIMgr.showTipText(str);
            return;
        }
        this.parentNode.destroy();
        let isOpen: boolean = this.json.jumpPage !== JumpConst.JUMPSHOPITEM && this.json.jumpPage !== JumpConst.FOSTERVIEW;
        if (isOpen && DataMgr.isInFriendHome()) {
            UIMgr.showTipText("请店长回到自己店铺后在进行获取~");
            return;
        }
        ClientEvents.EVENT_OPEN_UI.emit(this.json.jumpPage, this.itemId);
        UIMgr.closeView(AccessPathList.url);
        switch (this.json.jumpPage) {
            case JumpConst.LOGNGORDERVIEW:
            case JumpConst.LONG_ORDER_JUMP:
                // case JumpConst.CRISISVIEW:
                // case JumpConst.TASKCRISISVIEW:
                // case JumpConst.TASKEVENTVIEW:
                // case JumpConst.EVENTVIEW:
                // case JumpConst.TASKMAPINCITENT:
                ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
                break;
        }
        if (this.json.jumpPage === JumpConst.TASKMAPINCITENT) {
            let mapIncitents: IncidentModel[] = DataMgr.incidentData.getMapIncidents();
            if (mapIncitents.length <= 0) {
                return;
            }
        }
        if (this.json.jumpPage === JumpConst.TASKMAPEVENT) {
            let mapEvents: IncidentModel[] = DataMgr.incidentData.getMapEvents();
            if (mapEvents.length <= 0) {
                return;
            }
        }
        let closeArr = [];
        if (this.json.closeView !== 0) {
            closeArr = this.json.closeView.split(",");
            ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
            UIMgr.closeSomeView(closeArr);
            if (MapMgr.getMapState() === FutureState.NORMAL) {
                UIMgr.showMap();
            }
        }
    }

    onDestroy() {
        this.dispoe.dispose();
    }

}
