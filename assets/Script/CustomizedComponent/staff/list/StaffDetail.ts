import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {ResManager, ResMgr} from "../../../global/manager/ResManager";
import {UIMgr} from "../../../global/manager/UIManager";
import {DataMgr} from "../../../Model/DataManager";
import {Staff, StaffAdvantage} from "../../../Model/StaffData";
import {CompositeDisposable} from "../../../Utils/event-kit";
import {UIUtil} from "../../../Utils/UIUtil";
import {ButtonMgr} from "../../common/ButtonClick";
import {Type} from "../../common/CommonBtn";
import CommoTips, {CommonTipInter} from "../../common/CommonTips";
import {COUNTERTYPE, DotInst, DotVo} from "../../common/dotClient";
import FavorabilityUpView from "../../favorability/FavorabilityUpView";
import {LevelPanel} from "./LevelPanel";
import {StaffRole} from "./StaffRole";
import {TrainPanel} from "./TrainPanel";
import {StaffSpecial} from "./StaffSpecial";
import {HashSet} from "../../../Utils/dataStructures/HashSet";

const {ccclass, property} = cc._decorator;

@ccclass
export class StaffDetail extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;

    @property([cc.Sprite])
    starIcons: Array<cc.Sprite> = [];

    @property([cc.Sprite])
    advantageIcons: Array<cc.Sprite> = [];
    @property([cc.Sprite])
    advFrameIcons: Array<cc.Sprite> = [];

    @property(cc.Sprite)
    jobNameIcon: cc.Sprite = null;

    @property(cc.Label)
    introLabel: cc.Label = null;

    @property(cc.Label)
    lvLabel: cc.Label = null;

    @property(cc.Label)
    expLabel: cc.Label = null;

    @property(cc.ProgressBar)
    expProgressBar: cc.ProgressBar = null;

    @property(cc.Label)
    intelligenceLabel: cc.Label = null;
    @property(cc.Label)
    powerLabel: cc.Label = null;
    @property(cc.Label)
    glamourLabel: cc.Label = null;
    @property(cc.Label)
    patienceLabel: cc.Label = null;

    @property(StaffRole)
    staffRole: StaffRole = null;

    @property(cc.Button)
    trainBtn: cc.Button = null;

    @property(cc.Button)
    levelBtn: cc.Button = null;

    @property(cc.Button)
    specialBtn: cc.Button = null;

    @property(cc.Prefab)
    tip: cc.Prefab = null;

    @property(cc.Node)
    rightMenuMask: cc.Node = null;

    @property(cc.Sprite)
    detailRed: cc.Sprite = null;

    @property(cc.Node)
    favorabilityNode: cc.Node = null;

    @property(cc.Sprite)
    favorabilityIcon: cc.Sprite = null;

    @property(cc.Node)
    favorabilityLock: cc.Node = null;

    @property(cc.Label)
    favorIconLv: cc.Label = null;

    @property(cc.Node)
    trainLock: cc.Node = null;

    @property(cc.Sprite)
    cardIcon: cc.Sprite = null;

    @property(cc.Node)
    favorArrow: cc.Node = null;

    @property(sp.Skeleton)
    advantageSkelet: sp.Skeleton = null;

    @property(sp.Skeleton)
    advantageSkelet2: sp.Skeleton = null;

    @property(sp.Skeleton)
    goodUnlock: sp.Skeleton = null;

    @property(sp.Skeleton)
    specialUnLock: sp.Skeleton = null;

    @property(cc.Sprite)
    specialIcon: cc.Sprite = null;

    private dispose: CompositeDisposable = new CompositeDisposable();

    private staffId: number = -1;
    private remeberLvX: number = 0;

    private specialGuideNode: cc.Node = null;
    private staffAdvantages: Array<StaffAdvantage> = [];
    private levelUnlock: number = 0;
    private favorStatus: boolean = false;

    onLoad() {
        //因为StaffItem的start方法会触发选择第一个员工，所以下面就不需要onload的时候init，而是等到选择员工的时候init员工
        //this.onStaffNormalSelected();

        this.dispose.add(ClientEvents.STAFF_ITEM_NORMAL_SELECTED.on(this.onStaffNormalSelected));
        this.dispose.add(ClientEvents.UPDATE_STAFF_VIEW.on(this.onUpdateStaff));
        this.dispose.add(ClientEvents.UPDATE_STAFF_VIEW.on(this.upCheckLock));
        this.dispose.add(ClientEvents.STAFF_UPDATE_STAFF.on(this.onUpdateStaffs));
        this.dispose.add(ClientEvents.OPEN_STAFF_LEVEL.on(this.showLevelPanel));
        this.dispose.add(ClientEvents.OPEN_FAVOR_DETAIL.on(this.showFavorability));
        ButtonMgr.addClick(this.levelBtn.node, this.showLevelPanel);
        ButtonMgr.addClick(this.trainBtn.node, this.showTrainPanel);
        ButtonMgr.addClick(this.favorabilityNode, this.showFavorability);
        ButtonMgr.addClick(this.specialBtn.node, this.showSpecialPanel);
        this.remeberLvX = this.levelBtn.node.x;
        this.specialGuideNode = null;
        DataMgr.speciality = true;
    }

    setLeftPawSpine1 = (err: Error, res: sp.SkeletonData) => {
        this.advantageSkelet.skeletonData = res;
        this.advantageSkelet.setAnimation(0, "animation", false);
    };
    setLeftPawSpine2 = (err: Error, res: sp.SkeletonData) => {
        this.advantageSkelet2.skeletonData = res;
        this.advantageSkelet2.setAnimation(1, "animation", false);
    };
    setGoodUnlock = (err: Error, res: sp.SkeletonData) => {
        this.goodUnlock.skeletonData = res;
        this.goodUnlock.setAnimation(1, "animation", false);
    };

    private showFavorability = () => {
        DotInst.clientSendDot(COUNTERTYPE.staff, "6013", this.staffId.toString());
        let staff: Staff = DataMgr.getChooseStaff();
        let favorOpenLv: number = Number(JsonMgr.getConstVal("favorOpenLv"));
        if (staff.level < favorOpenLv) {
            UIMgr.showTipText(staff.getName() + "达到" + favorOpenLv + "级解锁");
            return;
        }
        DataMgr.speciality = false;
        UIMgr.showView(FavorabilityUpView.url);
    };

    onDestroy() {
        if (this.specialGuideNode) {
            this.specialGuideNode.removeFromParent();
            this.specialGuideNode = null;
        }
        this.dispose.dispose();
    }

    onStaffNormalSelected = () => {
        //cc.log("StaffDetail onStaffNormalSelected");
        // cc.log("执行");
        let staff: Staff = DataMgr.getChooseStaff();
        this.staffAdvantages = staff.getAdvantages();
        this.levelUnlock = staff.level;
        if (!staff || this.staffId == staff.staffId) {
            return;
        }
        this.favorStatus = staff.favorLevel >= 2 && staff.favorStage >= 1;
        ResMgr.getStaffUIIcon(this.specialIcon, this.favorStatus ? "tezhi2" : "tezhi1");
        DataMgr.speciality = true;
        this.staffId = staff.staffId;
        this.checkLock(staff);
        this.specialUnLockSpine(staff);
        this.initAdvantageIcons(staff);
        this.init(staff);
    };

    private onUpdateStaffs = (staffIds: HashSet<number>) => {
        if (!staffIds.has(this.staffId)) {
            return;
        }
        this.onUpdateStaff();
    };

    onUpdateStaff = () => {
        let staff: Staff = DataMgr.getStaff(this.staffId);
        this.init(staff);
    };

    private init(staff: Staff) {
        this.initStarIcons(staff);
        UIUtil.setLabel(this.nameLabel, staff.getName());
        UIUtil.asyncSetImage(this.jobNameIcon, staff.getSuggestJobImageUrl());
        UIUtil.setLabel(this.introLabel, staff.getIntro());

        UIUtil.asyncSetImage(this.cardIcon, staff.getStaffCardColorUrl(), false);
        // cc.log("staff.getStaffCardColorUrl===背景图" + staff.getStaffCardColorUrl());
        this.updateStaff(staff);
        this.staffRole.init(staff);
        let MaxLvArr: string[] = JsonMgr.getConstVal("staffLevelLimit").split(",");
        let Maxlevel = 0;
        switch (staff.star) {
            case 3:
                Maxlevel = Number(MaxLvArr[0]);
                break;
            case 4:
                Maxlevel = Number(MaxLvArr[1]);
                break;
            case 5:
            case 6:
                Maxlevel = Number(MaxLvArr[2]);
                break;
        }
        this.trainBtn.node.active = Maxlevel >= JsonMgr.getConstVal("trainOpenLv");
        if (Maxlevel >= JsonMgr.getConstVal("trainOpenLv")) {
            this.levelBtn.node.x = this.remeberLvX;
        } else {
            this.levelBtn.node.x = 28;
        }

        this.special(staff);
    }

    private special(staff: Staff) {
        this.specialBtn.node.active = staff.isUnique();
    }

    upCheckLock = () => {
        let staff: Staff = DataMgr.getStaff(this.staffId);
        this.checkLock(staff);
        this.specialUnLockSpine(staff);
        this.initAdvantageIcons(staff);
    };

    checkLock(staff: Staff) {
        //判断训练
        let trainOpenLv: number = Number(JsonMgr.getConstVal("trainOpenLv"));
        this.trainLock.active = staff.level < trainOpenLv;
        //cc.log("this.trainLock.active" + this.trainLock.active);
        //判断好感度
        let isUnique = staff.isUnique();
        this.favorabilityNode.active = isUnique;
        if (isUnique) {
            let favorOpenLv: number = Number(JsonMgr.getConstVal("favorOpenLv"));
            this.favorabilityLock.active = staff.level < favorOpenLv;
            this.favorIconLv.node.active = false;
            if (staff.level >= favorOpenLv) {
                if (this.levelUnlock < favorOpenLv && staff.level >= favorOpenLv && DataMgr.speciality) {
                    cc.loader.loadRes(ResManager.STAFF_GOODS_UNLOCK, sp.SkeletonData, this.setGoodUnlock);
                    this.levelUnlock = staff.level;
                }
                this.updateFavorability(staff);
            } else {
                ResMgr.getFavorIcon(this.favorabilityIcon, "staff_caixin0");
            }
        }
    }

    specialUnLockSpine(staff: Staff) {
        if (!this.favorStatus && staff.favorStage >= 1 && staff.favorLevel >= 2) {
            this.specialUnLock.node.active = true;
            this.favorStatus = staff.favorLevel >= 2 && staff.favorStage >= 1;
            cc.loader.loadRes(ResManager.STAFF_SPECIAL_LOCK, sp.SkeletonData, () => {
            }, this.setSpecailUnLock);
        } else {
            this.specialUnLock.node.active = false;
            this.specialUnLock.clearTracks();
        }
    }

    setSpecailUnLock = (error, res) => {
        this.specialIcon.node.active = false;
        this.specialUnLock.skeletonData = res;
        this.specialUnLock.setAnimation(2, "animation", true);
        this.scheduleOnce(() => {
            this.specialUnLock.clearTracks();
            this.specialIcon.node.active = true;
            this.specialUnLock.node.active = false;
            ResMgr.getStaffUIIcon(this.specialIcon, "tezhi2");
        }, 2);
    };

    updateFavorability(staff: Staff) {
        let favorJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(staff.favorStage, staff.favorLevel);
        ResMgr.getFavorIcon(this.favorabilityIcon, favorJson.icon);
        if (favorJson.iconLevel) {
            this.favorIconLv.node.active = true;
            this.favorIconLv.string = favorJson.iconLevel + "";
        }
    }

    private updateStaff(staff: Staff) {
        UIUtil.setLabel(this.lvLabel, staff.level);
        UIUtil.setLabel(this.expLabel, staff.getExpLabelStr());
        UIUtil.setProgressBar(this.expProgressBar, staff.getExpProgress());
        UIUtil.setLabel(this.intelligenceLabel, staff.getIntelligence());  //智慧
        UIUtil.setLabel(this.powerLabel, staff.getPower());                //体力
        UIUtil.setLabel(this.patienceLabel, staff.getPatience());          //亲和
        UIUtil.setLabel(this.glamourLabel, staff.getGlamour());            //灵巧
        this.detailRed.node.active = false;//staff.isCanLv();
        this.checkButtonsActive(staff);
    }


    private initStarIcons(staff: Staff) {
        Staff.initStarIcon(staff.star, this.starIcons);
    }

    private initAdvantageIcons(staff: Staff) {
        let staffAdvList: Array<StaffAdvantage> = staff.getAdvantages();
        // cc.log("this.staff:{}", this.staffAdvantages);
        // cc.log("staff:{}", staffAdvList);
        if (DataMgr.speciality) {
            this.visibleAdvFrameIcons(staffAdvList);
        }
        this.advantageIcons.forEach((advantageIcon: cc.Sprite, index: number) => {
            advantageIcon.node.name = index + "";
            advantageIcon.node.on(cc.Node.EventType.TOUCH_END, this.openTips);
        });
        Staff.initAdvantageIcon(staffAdvList, this.advantageIcons, true, true);
    }

    private visibleAdvFrameIcons(staffAdvList: Array<StaffAdvantage>) {
        this.advFrameIcons.forEach((advFrameIcon: cc.Sprite) => {
            UIUtil.hide(advFrameIcon);
        });
        let staff: Staff = DataMgr.getStaff(this.staffId);
        let isAdvantageAnimation: boolean = false;
        for (let i in staffAdvList) {
            isAdvantageAnimation = this.staffAdvantages[i] != staffAdvList[i];
            isAdvantageAnimation = this.staffAdvantages[i] !== staffAdvList[i];
        }
        if (isAdvantageAnimation) {
            // cc.log("动画播放");
            for (let i = 0; i < staffAdvList.length; i++) {
                UIUtil.show(this.advFrameIcons[i]);
                if (i == 0) {
                    cc.loader.loadRes(ResManager.STAFF_ADVANTAFE, sp.SkeletonData, this.setLeftPawSpine1);
                    this.advantageSkelet.setCompleteListener(() => {
                        UIUtil.asyncSetImage(this.advFrameIcons[i], staff.getStaffCardPanColorUrl());
                    });
                } else {
                    cc.loader.loadRes(ResManager.STAFF_ADVANTAFE, sp.SkeletonData, this.setLeftPawSpine2);
                    this.advantageSkelet2.setCompleteListener(() => {
                        UIUtil.asyncSetImage(this.advFrameIcons[i], staff.getStaffCardPanColorUrl());
                    });
                }
            }
        } else {
            // cc.log("动画没播放");
            for (let i = 0; i < staffAdvList.length; i++) {
                UIUtil.show(this.advFrameIcons[i]);
                UIUtil.asyncSetImage(this.advFrameIcons[i], staff.getStaffCardPanColorUrl());
            }
        }
    }

    openTips = (btn) => {
        let nidx = Number(btn.target.name);
        let staff: Staff = DataMgr.getStaff(this.staffId);
        let advList = staff.getAdvantages();
        let advantageId = staff.advantages.length >= 5 ? 10 : advList[nidx];
        if (!advantageId) {
            return;
        }
        DotInst.clientSendDot(COUNTERTYPE.staff, "6006", advantageId.toString());
        this.rightMenuMask.active = true;
        this.rightMenuMask.on(cc.Node.EventType.TOUCH_END, () => {
            UIMgr.closeView(CommoTips.url);
            this.rightMenuMask.active = false;
        });

        btn.stopPropagation();
        let canvas = UIMgr.getCanvas();
        let pos = canvas.convertToNodeSpaceAR(btn.getStartLocation());

        let tipData: CommonTipInter = {
            state: Type.STAFF,
            data: {advantageId: advantageId},
            worldPos: pos
        };
        UIMgr.showView(CommoTips.url, null, tipData, null, false)

    };

    private checkButtonsActive(staff: Staff) {
        this.levelBtn.interactable = !staff.isMaxLevel();
    }

    private showLevelPanel = () => {
        if (this.levelBtn.interactable) {
            DataMgr.speciality = true;
            UIMgr.showView(LevelPanel.url);
        }
    };

    private showTrainPanel = () => {
        //ClientEvents.CLEAN_SOFT_LEAD.emit(2);
        let staff: Staff = DataMgr.getChooseStaff();
        let favorOpenLv: number = Number(JsonMgr.getConstVal("trainOpenLv"));
        if (staff.level < favorOpenLv) {
            UIMgr.showTipText(staff.getName() + "达到" + favorOpenLv + "级解锁");
            return;
        }
        if (this.trainBtn.interactable) {
            UIMgr.showView(TrainPanel.url);
        }
    };

    private showSpecialPanel = () => {
        DotInst.clientSendDot(COUNTERTYPE.staff, "6011", this.staffId.toString());
        if (this.specialBtn.interactable) {
            if (this.specialGuideNode) {
                this.specialGuideNode.removeFromParent();
                this.specialGuideNode = null;
            }
            UIMgr.showView(StaffSpecial.url);
        }
    };

    show() {
        if (!this.node.active) {
            this.node.active = true;
        }
    }

    hide() {
        if (this.node.active) {
            this.node.active = false;
        }
    }

}
