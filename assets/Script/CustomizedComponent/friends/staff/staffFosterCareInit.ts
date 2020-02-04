import {Staff, StaffWorkStatus} from "../../../Model/StaffData";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {UIUtil} from "../../../Utils/UIUtil";
import {DataMgr} from "../../../Model/DataManager";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {NetConfig} from "../../../global/const/NetConfig";
import {HttpInst} from "../../../core/http/HttpClient";
import {IFosterFriend} from "../../../types/Response";
import {UIMgr} from "../../../global/manager/UIManager";
import friendFosterCareList from "./friendFosterCareList";
import goToFriends from "../fosterCare/goToFriends";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";
import {ButtonMgr} from "../../common/ButtonClick";
import {RedConst} from "../../../global/const/RedConst";

const {ccclass, property} = cc._decorator;

@ccclass
export class staffFosterCareInit extends cc.Component {

    static highlightColor: cc.Color = new cc.Color(219, 234, 157);
    @property(cc.Node)
    private mask: cc.Node = null;
    @property(cc.Sprite)
    private maskImg: cc.Sprite = null;
    @property(cc.SpriteFrame)
    private sf: Array<cc.SpriteFrame> = [];
    @property(cc.SpriteFrame)
    private workingStateSF: Array<cc.SpriteFrame> = [];

    @property(cc.Sprite)
    uniqueBg: cc.Sprite = null;

    @property(cc.Node)
    private banImg: cc.Node = null;

    @property(cc.Label)
    starLabel: cc.Label = null;

    @property(cc.Label)
    lvLabel: cc.Label = null;

    @property(cc.Sprite)
    staffBg: cc.Sprite = null;

    @property(cc.Sprite)
    staffIcon: cc.Sprite = null;

    @property(cc.Sprite)
    selectBg: cc.Sprite = null;

    @property(cc.Node)
    private redPoint: cc.Node = null;

    private dispose = new CompositeDisposable();

    private curIndex: number = -1;

    //因为scrollView复用同一个节点，所以需要单独存储key为索引index，值为ItemState状态对象

    private staffid: number = 0;
    staffData: any;
    private index: number = 0;

    onLoad() {
        ButtonMgr.addClick(this.node, this.onSelect);
        this.dispose.add(ClientEvents.GUIDE_CLICK.on(this.guideClickHandler));
    }

    start() {

    }

    guideClickHandler = () => {
        if (this.index === 0) {
            this.onSelect();
        }
    }

    onSelect = () => {
        DotInst.clientSendDot(COUNTERTYPE.fostercase, "10302", this.staffid + "");
        if (DataMgr.fosterCare.fosterCare.length == 3) {
            UIMgr.showTipText("派遣位满啦");
            return;
        }
        if (this.mask.active) {
            return;
        }
        HttpInst.postData(NetConfig.FOSTER_FRIEND, [1], (res: IFosterFriend) => {
            if (res.focus.length == 0) {
                UIMgr.showView(goToFriends.url, cc.director.getScene());
                return;
            } else {
                DataMgr.fosterCare.setFocusSzie(res.focusSize);
                DataMgr.fosterCare.setFosterFriends(res.focus);
                DataMgr.fosterCare.softLeftCount = 1;
                // DataMgr.fosterCare.focus = res.focus;
                ClientEvents.FOSTER_ARROW.emit(false);
                UIMgr.showView(friendFosterCareList.url, cc.director.getScene());
            }
        });
        DataMgr.staffData.fosteCareStaffId = this.staffid;
    }

    initItem = (data: Staff, index: number, idx: number, size: number) => {
        this.curIndex = index;
        this.staffid = data.staffId;
        UIUtil.setLabel(this.lvLabel, /*"resId " +*/ "LV" + data.level/*this.node.name*/);

        UIUtil.asyncSetImage(this.staffBg, data.getStarBorderUrl(), false);
        UIUtil.asyncSetImage(this.staffIcon, data.getAvatarUrl(), false);
        this.checkIsUnique(data);

        let isRed: boolean = DataMgr.getRedData().indexOf(RedConst.FOSTERRED) !== -1;
        let isLevel: boolean = DataMgr.getCanShowRedPoint();
        let isFirst: boolean = index === idx;
        let isSize: boolean = size < 3;
        this.redPoint.active = isRed && isLevel && isFirst && isSize;
        //是否上岗
        if (data.inDuty()) {
            this.mask.active = true;
            this.mask.getComponent(cc.Sprite).spriteFrame = this.sf[0];
            this.maskImg.spriteFrame = this.workingStateSF[data.positionId];
            return;
        }
        //是否在寄养
        if (data.isFoster()) {
            this.mask.active = true;
            this.mask.getComponent(cc.Sprite).spriteFrame = null;
            this.maskImg.spriteFrame = this.sf[1];
            return;
        }
        this.mask.active = false;
    };

    private checkIsUnique(staff: Staff) {
        UIUtil.visible(this.uniqueBg, staff.isUnique());
    }

    onDestroy() {
        this.dispose.dispose();
    }
}

