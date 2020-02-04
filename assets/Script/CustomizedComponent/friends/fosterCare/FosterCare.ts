import {GameComponent} from "../../../core/component/GameComponent";
import {NetConfig} from "../../../global/const/NetConfig";
import {TextTipConst} from "../../../global/const/TextTipConst";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {UIMgr} from "../../../global/manager/UIManager";
import {DataMgr} from "../../../Model/DataManager";
import {FosterCareData} from "../../../Model/FriendsData";
import {HttpInst} from "../../../core/http/HttpClient";
import {IFosterList, IFriendFoster, IFriendsFosterInfo} from "../../../types/Response";
import {staffFosterCareRole} from "./staffFosterCareRole";
import {Staff, StaffWorkStatus} from "../../../Model/StaffData";
import {ArrowType} from "../../common/Arrow";
import {topUiType} from "../../MainUiTopCmpt";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";
import {ResManager} from "../../../global/manager/ResManager";
import List from "../../../Utils/GridScrollUtil/List";
import {staffFosterCareInit} from "../staff/staffFosterCareInit";
import {friendsStaffRole} from "./friendsStaffRole";
import {ButtonMgr} from "../../common/ButtonClick";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FosterCare extends GameComponent {
    static url = 'fosterCare/fosterCare';

    getBaseUrl() {
        return FosterCare.url;
    }

    @property(List)
    private fosterListV: List = null;
    @property(List)
    private fosterFriendList: List = null;
    @property(cc.Prefab)
    private staffRole: cc.Prefab = null;
    @property(cc.Button)
    private myFosterCareBtn: cc.Button = null;
    @property(cc.Button)
    private fosterCareFriendBtn: cc.Button = null;
    @property(cc.Node)
    private myFosterCare: cc.Node = null;
    @property(cc.Node)
    private fosterCareFriend: cc.Node = null;
    @property(cc.Node)
    private staffModelNode: cc.Node = null;
    @property(cc.Label)
    private fosterCareNum: cc.Label = null;
    @property(cc.Node)
    thereIsNoFoster: cc.Node = null;
    @property(cc.ScrollView)
    private staffView: cc.ScrollView = null;
    @property(cc.Node)
    private aniNode: cc.Node = null;
    @property(cc.Node)
    private myFosterLabel: cc.Node = null;
    @property(cc.Node)
    private friendFosterLabel: cc.Node = null;
    @property(cc.Node)
    private arrow: cc.Node = null;
    @property(cc.Node)
    private fosterSpineNode: cc.Node = null;
    @property(sp.Skeleton)
    private staffSpine: sp.Skeleton = null;
    @property(sp.Skeleton)
    private taxiSpine: sp.Skeleton = null;

    private index: number = -1;

    onLoad() {
        this.addEvent(ClientEvents.REFRESH_FOSTERCARE.on(this.initFosterCare));
        this.addEvent(ClientEvents.REFRESH_FOSTERLIST.on(this.fosterCareSpine));
        this.addEvent(ClientEvents.UPDATE_STAFFLIST.on(this.initScroll));
        this.addEvent(ClientEvents.FOSTER_ARROW.on(this.fosterArrow));
        this.addEvent(ClientEvents.SHOW_PLANE.on(this.initFosterCare));
    }

    start() {
        this.init();
        this.myFosterLabel.zIndex = 1;
        this.friendFosterLabel.zIndex = 1;
        ButtonMgr.addClick(this.arrow, () => {
            ClientEvents.GUIDE_CLICK.emit();
        });
    }

    init() {
        this.initScroll();
        this.initFosterCare();
        this.fosterArrow(true);
    }

    fosterArrow = (isGuide: boolean) => {
        let staffData: Array<Staff> = DataMgr.staffData.getSorted();
        let isIdea: boolean = false;
        for (let i in staffData) {
            if (staffData[i].workStatusIndex == StaffWorkStatus.IDEA) {
                isIdea = true;
                break;
            }
        }
        this.arrow.active = isIdea && DataMgr.getGuideCompleteTimeById(ArrowType.FosterCareArrow) <= 0 && isGuide;
    }

    onEnable(): void {
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    //我的寄养列表
    initFosterCare = () => {
        this.unscheduleAllCallbacks();
        this.staffModelNode.removeAllChildren();
        let fosterCare: FosterCareData = DataMgr.getFosterCare();
        let fosterCareSize: number = fosterCare.getFosterCareSize();
        this.fosterCareNum.string = fosterCareSize + "/3";
        for (let i = 0; i < 3; i++) {
            let prefab = cc.instantiate(this.staffRole);
            let node: staffFosterCareRole = prefab.getComponent("staffFosterCareRole");
            node.setItem(i);
            this.staffModelNode.addChild(prefab);
        }
    }

    initScroll = () => {
        DataMgr.staffData.fosterCareSort();
        let softData = DataMgr.staffData.getSorted();
        this.index = -1;
        for (let i = 0; i < softData.length; i++) {
            if (softData[i].workStatusIndex === StaffWorkStatus.IDEA) {
                this.index = i;
                break;
            }
        }
        if (DataMgr.staffData.getSorted().length > 0) {
            this.fosterListV.numItems = DataMgr.staffData.getSortedSize();
        } else {
            this.fosterListV.numItems = 0;
        }
    }

    //好友寄养
    fosterCareFriendButton() {
        //获取被寄养在自己家的员工
        HttpInst.postData(NetConfig.GET_BE_FOSTER_INFO, [1], (res: IFriendsFosterInfo) => {
            DotInst.clientSendDot(COUNTERTYPE.fostercase, "10301", "0");
            let data: FosterCareData = DataMgr.getFosterCare();
            this.fosterArrow(false);
            data.setFriendsStaffList(res);
            this.initFriendScroll();
            this.thereIsNoFoster.active = data.friendsStaffList.beFosterList.length === 0;
        });
        this.fosterCareFriendBtn.interactable = false;
        this.myFosterCareBtn.interactable = true;
        this.myFosterCareBtn.node.zIndex = 0;
        this.myFosterCareBtn.node.setPosition(cc.v2(-179, 440));
        this.fosterCareFriendBtn.node.setPosition(cc.v2(-149, 405));
        this.fosterCareFriendBtn.node.zIndex = 1;
        this.myFosterCare.active = false;
        this.fosterCareFriend.active = true;
        ClientEvents.EVENT_FOCUS_SLIDE.emit(true);
    }

    myFosterCareHandler() {
        this.init();
        DotInst.clientSendDot(COUNTERTYPE.fostercase, "10301", "1");
        this.fosterArrow(true);
        this.myFosterCareBtn.node.setPosition(cc.v2(-191, 431));
        this.fosterCareFriendBtn.node.setPosition(cc.v2(-149, 406));
        this.fosterCareFriendBtn.interactable = true;
        this.myFosterCareBtn.interactable = false;
        this.myFosterCareBtn.node.zIndex = 1;
        this.fosterCareFriendBtn.node.zIndex = 0;
        this.myFosterCare.active = true;
        this.fosterCareFriend.active = false;
    }

    initFriendScroll = () => {
        let size: number = DataMgr.getFosterCare().friendsStaffList.beFosterList.length;
        if (size > 0) {
            this.fosterFriendList.numItems = size;
        } else {
            this.fosterFriendList.numItems = 0;
        }
    }

    //关闭寄养界面
    shutDownBtn() {
        DotInst.clientSendDot(COUNTERTYPE.fostercase, "10305");
        DataMgr.staffData.sort();
        ClientEvents.STAFF_SORT_AGAIN.emit();
        this.closeView();
    }

    tipHandler() {
        UIMgr.showTextTip(TextTipConst.FosterCareTip);
    }

    fosterCareSpine = () => {
        this.initSpine();
    }

    initSpine() {
        let staff = DataMgr.getStaff(DataMgr.staffData.fosteCareStaffId);
        cc.loader.loadRes(staff.getSpineUrl(), sp.SkeletonData, this.onProcess, this.onComplete);
    }

    onProcess = (completeCount, totalCount, item) => {

    };

    onComplete = (err, res) => {
        if (err) {
            cc.error(err);
            return;
        }
        if (!this.staffSpine) {
            return;
        }
        this.fosterSpineNode.active = true;
        this.fosterSpineNode.opacity = 0;
        this.staffSpine.skeletonData = res;
        this.staffSpine.setAnimation(1, "zhanli", true);
        this.staffSpine.setSkin("weixiao");
        cc.loader.loadRes(ResManager.FOSTER_SPINE, sp.SkeletonData, () => {
        }, (error, res) => {
            this.taxiSpine.skeletonData = res;
            this.staffSpine.node.active = true;
            let action = cc.sequence(cc.fadeIn(0.7), cc.callFunc(() => {
                this.fosterSpineNode.opacity = 255;
                this.taxiSpine.node.active = true;
                this.taxiSpine.setCompleteListener(() => {
                    this.staffSpine.node.active = false;
                    this.taxiSpine.setCompleteListener(() => {
                        this.taxiSpine.node.active = false;
                        let action1 = cc.sequence(cc.fadeOut(0.7), cc.callFunc(() => {
                            this.fosterSpineNode.active = false;
                        }));
                        this.fosterSpineNode.runAction(action1);
                        this.initFosterCare();
                    });
                    this.taxiSpine.setAnimation(0, "animation2", false);
                });
                this.taxiSpine.setAnimation(0, "animation", false);
            }));
            this.fosterSpineNode.runAction(action);
        });
    };

    //列表渲染器
    onfosterListVRender(item: cc.Node, idx: number) {
        let data: Array<Staff> = DataMgr.staffData.getSorted();
        let staffItem: staffFosterCareInit = item.getComponent(staffFosterCareInit);
        let fosterCare: FosterCareData = DataMgr.getFosterCare();
        let fosterCareSize: number = fosterCare.getFosterCareSize();
        staffItem.initItem(data[idx], idx, this.index, fosterCareSize);
    }

    onfriendListVRender(item: cc.Node, idx: number) {
        let data: Array<IFriendFoster> = DataMgr.getFosterCare().friendsStaffList.beFosterList;
        let fosterFriendItem: friendsStaffRole = item.getComponent(friendsStaffRole);
        fosterFriendItem.initItem(data[idx], idx);
    }
}
