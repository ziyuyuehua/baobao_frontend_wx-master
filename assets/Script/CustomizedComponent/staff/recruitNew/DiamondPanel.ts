import {RecruitStaff} from "./RecruitStaff";
import {NetConfig} from "../../../global/const/NetConfig";
import {HttpInst} from "../../../core/http/HttpClient";
import {StaffData} from "../../../Model/StaffData";
import {HashSet} from "../../../Utils/dataStructures/HashSet";
import {ShowType} from "../../../Model/ExchangeData";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {Pos} from "../../map/MapInfo";
import {UIUtil} from "../../../Utils/UIUtil";
import {DataMgr, SHARE_TYPE} from "../../../Model/DataManager";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {ResMgr} from "../../../global/manager/ResManager";
import {ItemIdConst} from "../../../global/const/ItemIdConst";
import {RecruitResult} from "../../../Model/RecruitData";
import {DiamondRecruitAni} from "./DiamondRecruitAni";
import {GameComponent} from "../../../core/component/GameComponent";
import {ARROW_DIRECTION, GuideMgr} from "../../common/SoftGuide";
import {ButtonMgr} from "../../common/ButtonClick";
import {CommonUtil} from "../../../Utils/CommonUtil";
import {UIMgr} from "../../../global/manager/UIManager";
import RechargeMain from "../../Recharge/RechargeMain";
import {topUiType} from "../../MainUiTopCmpt";
import {GameManager} from "../../../global/manager/GameManager";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";
import CommonInsufficient, {InsufficientType} from "../../common/CommonInsufficient";
import {GuideIdType} from "../../../global/const/GuideConst";

const {ccclass, property} = cc._decorator;

const RECRUIT_STAFF_POS: Array<Pos> = [
    {x: -230, y: -150},
    {x: 0, y: -125},
    {x: 230, y: -150},
    {x: -115, y: -245},
    {x: 115, y: -245},
];

const MAX_RECRUIT_NUM: number = 5;

@ccclass
export class DiamondPanel extends GameComponent {
    @property(cc.Label)
    private diamondLabel: cc.Label = null;
    @property(cc.Node)
    private starListNode: cc.Node = null;
    @property(cc.Prefab)
    private recruitStaffPrefab: cc.Prefab = null;

    @property(cc.Button)
    private againBtn: cc.Button = null;

    @property([cc.Toggle])
    private deleteToggle: Array<cc.Toggle> = [];

    @property(cc.Prefab)
    showStaffResumePrefab: cc.Prefab = null;

    @property(cc.Label)
    itemName: cc.Label = null;
    @property(cc.Label)
    itemNum: cc.Label = null;

    @property(cc.Sprite)
    diamondItemIcon: cc.Sprite = null;
    @property(cc.Label)
    diamondItemLabel: cc.Label = null;
    @property(cc.Label)
    diamondCostLabel: cc.Label = null;

    @property(sp.Skeleton)
    successSpine: sp.Skeleton = null;
    @property(cc.Node)
    shareNode: cc.Node = null;

    private showDelete: boolean = true;
    private showType: ShowType = ShowType.RecruitStaff;

    private deleteStar: HashSet<number> = new HashSet<number>();
    private hasStarStaff: boolean[] = [false, false];

    private resultList: Array<RecruitStaff> = null;
    private results: Array<RecruitResult> = null;

    //抽取多个的时候，判断多个里面是否有重复的
    private staffResIds: HashSet<number> = new HashSet<number>();

    private oneCost: number = 0;
    private fiveCost: number = 0;

    static url: string = "staff/recruit/diamondPanel";

    getBaseUrl() {
        return DiamondPanel.url;
    }

    onLoad() {
        this.deleteToggle.forEach((toggle: cc.Toggle) => {
            ButtonMgr.addToggle(toggle, this.onDeleteSelect);
        });
        ButtonMgr.addClick(this.shareNode, this.shareHandler);

        this.oneCost = JsonMgr.getConstVal("diamondSingleCost");
        this.fiveCost = JsonMgr.getConstVal("diamondFiveCost");
        this.addEvent(ClientEvents.EVENT_REFRESH_GOLD.on(this.loadDiamond));
        this.loadDiamond();
    }

    onEnable() {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.gold);
    }

    onDisable() {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -2);
    }

    loadDiamond = () => {
        this.diamondLabel && UIUtil.setLabel(this.diamondLabel, CommonUtil.numChange(DataMgr.userData.diamond)); //钻石
    };

    onAgainBtnClick() {
        if (this.results.length == 1) {
            const hasDiamondFreeCount: boolean = DataMgr.recruitData.hasDiamondFreeCount();
            const diamondOneItemNum: number = DataMgr.getItemNum(ItemIdConst.STAFF_PAPER_ONE);
            const hasDiamondOneItem: boolean = diamondOneItemNum > 0;
            if (!hasDiamondFreeCount && !hasDiamondOneItem) {
                if (DataMgr.userData.diamond < JsonMgr.getConstVal("diamondSingleCost")) {
                    UIMgr.showView(CommonInsufficient.url, cc.director.getScene(), InsufficientType.Diamond);
                    return;
                }
            }
        }

        if (this.results.length == 5) {
            const diamondFiveItemNum: number = DataMgr.getItemNum(ItemIdConst.STAFF_PAPER_FIVE);
            const hasDiamondFiveItem: boolean = diamondFiveItemNum > 0;
            if (!hasDiamondFiveItem) {
                if (DataMgr.userData.diamond < JsonMgr.getConstVal("diamondFiveCost")) {
                    UIMgr.showView(CommonInsufficient.url, cc.director.getScene(), InsufficientType.Diamond);
                    return;
                }
            }
        }

        HttpInst.postData(NetConfig.diamondRecruit,
            [this.results.length, true,
                this.deleteToggle[0].isChecked, this.deleteToggle[1].isChecked], (response) => {
                if (response.talentMarket && this.showStaffResumePrefab) {
                    const diamondStaffs: Array<RecruitResult> = DataMgr.recruitData.getDiamondRecruitResults();
                    const showStaffResume: DiamondRecruitAni = cc.instantiate(this.showStaffResumePrefab).getComponent("DiamondRecruitAni");
                    showStaffResume.initAndPlay(diamondStaffs, () => {
                        this.initResultList(diamondStaffs);
                        ClientEvents.RECRUIT_REFRESH_TYPE_LABELS.emit(true);
                        showStaffResume.node.destroy();
                    });
                }
            });
    };

    private refreshLabels() {
        const isFive: boolean = this.results.length >= MAX_RECRUIT_NUM;
        ResMgr.getItemIcon(this.diamondItemIcon, isFive ? "icon_wulianniudanbi" : "icon_niudanbi");
        ResMgr.setRecruitResultImg(this.againBtn.node.getChildByName("againImg").getComponent(cc.Sprite),
            isFive ? "recruit_zailaiwuci" : "recruit_zailaiyici");

        const diamondItemNum: number = DataMgr.getItemNum(isFive ? ItemIdConst.STAFF_PAPER_FIVE : ItemIdConst.STAFF_PAPER_ONE);
        UIUtil.setLabel(this.diamondItemLabel, diamondItemNum + "/1");
        const hasDiamondItem: boolean = diamondItemNum > 0;
        this.diamondItemLabel.node.parent.active = hasDiamondItem;

        UIUtil.setLabel(this.diamondCostLabel, isFive ? this.fiveCost : this.oneCost);
        this.diamondCostLabel.node.parent.active = !hasDiamondItem;
    }

    onConfirmBtnClick() {
        if (this.showType == ShowType.RecruitStaff) {
            HttpInst.postData(NetConfig.chooseStaff,
                [this.deleteToggle[0].isChecked, this.deleteToggle[1].isChecked]);
        }
        this.closeOnly();
    };

    onDeleteSelect = (toggle: cc.Toggle) => {
        const index: number = this.deleteToggle.indexOf(toggle);
        const isCheck: boolean = toggle.isChecked;
        this.setDiamondDelete(index, isCheck);
        cc.log("onDeleteSelect index=" + index);
        const star: number = this.getDeleteStar(index);
        if (isCheck) {
            this.deleteStar.add(star)
        } else {
            this.deleteStar.delete((star));
        }
        this.visibleGoodbyeNew(true);
    };

    private setDiamondDelete(index: number, isCheck: boolean) {
        DataMgr.staffData.setDiamondDelete(index, isCheck);
    }

    private getDeleteStar(index: number) {
        return index == 0 ? 3 : 4;
    }

    showRecruitResultList(resultList: Array<RecruitResult>, showType: ShowType, hasGuide: boolean = false, cb: Function = null) {
        this.showType = showType;
        this.showDelete = showType == ShowType.RecruitStaff || showType == ShowType.MustGetStaff;
        this.initResultList(resultList, cb);
        this.doOnShow();
        if (hasGuide) {
            let endSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.FunDiam, 4);
            if (endSoftGuide && DataMgr.getGuideCompleteTimeById(endSoftGuide.id) <= 0) {
                HttpInst.postData(NetConfig.SOFT_LED_INFO, [endSoftGuide.id], (response) => {
                    GuideMgr.showSoftGuide(this.node.getChildByName("interaction").children[1].children[1], ARROW_DIRECTION.BOTTOM, endSoftGuide.displayText, null, false, 0, false, () => {
                        this.onConfirmBtnClick();
                    });
                });
            }
        }
    }

    private doOnShow() {
        // this.deleteStar.clear();
        this.againBtn.node.active = this.showType == ShowType.RecruitStaff;
    }

    private initResultList(resultList: Array<RecruitResult>, cb: Function = null) {
        const staffSize = Math.min(resultList.length, MAX_RECRUIT_NUM);
        this.showItemInfo(staffSize);

        this.hasStarStaff = [false, false];
        this.results = [];
        let hasUnique: boolean = false;
        for (let i = 0; i < staffSize; i++) {
            let result: RecruitResult = resultList[i];
            if (result.isStaff()) {
                if (result.isStar(3)) this.hasStarStaff[0] = true;
                else if (result.isStar(4)) this.hasStarStaff[1] = true;
            }
            if (result.isUnique()) {
                hasUnique = true;
            }
            this.shareNode.active = hasUnique;

            this.results.push(result);
        }

        if (!this.resultList) {
            this.initResultNodeList();
        }

        UIUtil.hide(this.successSpine);
        if (staffSize == 1) {
            this.resultList.forEach((value, index) => {
                if (index != 1) {
                    value.node.active = false;
                }
            });
            this.initResultAniPos(this.resultList[1], 1);
            this.resultList[1].initResult(this.results[0], this.showType);
            this.resultList[1].node.scale = 1.3;
            this.resultList[1].node.setPosition(0, -165);
            this.scheduleOnce(() => {
                UIUtil.show(this.successSpine);
                this.successSpine.setAnimation(0, "animation", false);
            }, 0.5)
        } else {
            for (let i = 0; i < staffSize; i++) {
                this.initResultAniPos(this.resultList[i], i);
                this.resultList[i].initResult(this.results[i], this.showType);
                this.resultList[i].node.active = true;
            }
            for (let i = staffSize; i < this.resultList.length; i++) {
                this.resultList[i].node.active = false;
            }
            this.scheduleOnce(() => {
                UIUtil.show(this.successSpine);
                this.successSpine.setAnimation(0, "animation", false);
            }, 1)
        }

        this.visibleGoodbyeNew();
        this.refreshUI();
        cb && cb();
    }

    private initResultAniPos(recruitStaff: RecruitStaff, index: number) {
        recruitStaff.putTop();
        recruitStaff.scheduleOnce(() => {
            recruitStaff.fallDown();
        }, 0.1 * index);
    }

    private showItemInfo(staffSize: number) {
        const diamondItem: string = JsonMgr.getConstVal("diamondItemId");
        const itemInfo: Array<string> = diamondItem.split(",");
        const itemXml = JsonMgr.getItem(Number(itemInfo[0]));
        UIUtil.setLabel(this.itemName, "【" + itemXml.name + "】");
        UIUtil.setLabel(this.itemNum, "x " + staffSize * parseInt(itemInfo[1]));
    }

    private initResultNodeList() {
        this.resultList = new Array<RecruitStaff>(MAX_RECRUIT_NUM);
        for (let i = 0; i < this.resultList.length; i++) {
            const recruitStaff: RecruitStaff = cc.instantiate(this.recruitStaffPrefab).getComponent(RecruitStaff);
            recruitStaff.node.setPosition(RECRUIT_STAFF_POS[i].x, RECRUIT_STAFF_POS[i].y);
            this.resultList[i] = recruitStaff;
            this.starListNode.addChild(recruitStaff.node);
        }
    }

    /**
     * 根据业务判断是否展示或者隐藏goodbye和new图标
     * @param {boolean} immed 即immediately是否立即显示new/goodbye，默认为false代表掉落完成后才显示
     */
    private visibleGoodbyeNew(immed: boolean = false) {
        this.staffResIds.clear();
        const size = this.results.length;
        if (size == 1) {
            let staff: RecruitResult = this.results[0];
            this.visibleGoodbyeNewIcon(staff, 1, immed);
        } else {
            this.results.forEach((staff: RecruitResult, index) => {
                this.visibleGoodbyeNewIcon(staff, index, immed);
            });
        }
    }

    private visibleGoodbyeNewIcon(result: RecruitResult, index: number, immed: boolean = false) {
        let hasStaff = false;
        const isUnique: boolean = result.isUnique();
        if (isUnique) {
            hasStaff = this.hasStaffByResId(result) || this.staffResIds.has(result.getResId());
            if (!hasStaff) {
                this.staffResIds.add(result.getResId());
            }
        }

        const recruitStaff: RecruitStaff = this.resultList[index];
        recruitStaff.nontransparent();
        if (this.isDeleteStar(result) || hasStaff) {
            if (this.showDelete) {
                recruitStaff.showGoodbye(immed);
                if (hasStaff) { //已拥有的5星员工直接分解成奖励
                    recruitStaff.transparent();
                    recruitStaff.hideNew();
                }
            }
        } else {
            recruitStaff.hideGoodbye();
        }
    }

    private refreshUI() {
        this.refreshToggles();
        this.refreshLabels();
    }

    private refreshToggles() {
        this.deleteStar.clear();
        const staffData: StaffData = DataMgr.staffData;
        let canDismissStaff: boolean = DataMgr.canDismissStaff();
        if (!canDismissStaff) {
            staffData.resetDiamondDelete();
        }
        this.deleteToggle.forEach((toggle, index) => {
            toggle.isChecked = staffData.getDiamondDelete(index);
            if (toggle.isChecked) {
                this.deleteStar.add(this.getDeleteStar(index))
            }
            toggle.node.active = (this.showDelete && canDismissStaff) ? this.hasStarStaff[index] : false;
        });
    }

    private hasStaffByResId(result: RecruitResult) {
        // return !result.isNew();
        if (result.isStaff()) {
            return result.staff.isUnique() ? DataMgr.staffData.hasStaffByResId(result.staff.artResId) : false;
        } else {
            // return DataMgr.iMarket.checkHasCaseById(result.itemXmlId);
            return result.isRepeated();
        }
    }

    private isDeleteStar(staff: RecruitResult): boolean {
        const stars: Array<number> = this.deleteStar.values();
        // cc.log("deleteStar=", stars);
        for (let i = 0; i < stars.length; i++) {
            if (staff.isStaff() && staff.getStar() == stars[i]) {
                return true;
            }
        }
        return false;
    }

    onDiamondExchange() {
        // UIMgr.showView(RechargeMain.url);
        ClientEvents.EVENT_POPUP_DIAMOND_EXCHANGE.emit();
    }

    shareHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.share, "14004");
        let shareJs: IShareJson = JsonMgr.getShareJsonByType(SHARE_TYPE.recruit);
        GameManager.WxServices.shareGame(shareJs.word, shareJs.pictrue);
    }
}
