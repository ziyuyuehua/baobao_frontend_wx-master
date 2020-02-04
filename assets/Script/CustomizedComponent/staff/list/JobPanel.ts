import { NetConfig } from "../../../global/const/NetConfig";
import { ClientEvents } from "../../../global/manager/ClientEventCenter";
import { JsonMgr } from "../../../global/manager/JsonManager";
import { ResManager } from "../../../global/manager/ResManager";
import { UIMgr } from "../../../global/manager/UIManager";
import { DataMgr } from "../../../Model/DataManager";
import { JobType, SortType, Staff, StaffAdvantage, StaffData, StaffSort } from "../../../Model/StaffData";
import { HttpInst } from "../../../core/http/HttpClient";
import { CompositeDisposable } from "../../../Utils/event-kit";
import { StringUtil } from "../../../Utils/StringUtil";
import { UIUtil } from "../../../Utils/UIUtil";
import { COUNTERTYPE, DotInst, DotVo } from "../../common/dotClient";
import { AdvantagePanel } from "./AdvantagePanel";
import { JobAdvChange } from "./JobAdvChange";
import { JobItem } from "./JobItem";
import { JobUpView } from "./JobUpView";
import { ButtonMgr } from "../../common/ButtonClick";
import { IPost, IRespData } from "../../../types/Response";
import { ARROW_DIRECTION, GuideMgr } from "../../common/SoftGuide";
import { ArrowType } from "../../common/Arrow";
import {TextTipConst} from "../../../global/const/TextTipConst";

const { ccclass, property } = cc._decorator;

@ccclass
export class JobPanel extends cc.Component {

    @property([cc.Toggle])
    jobTypeToggle: Array<cc.Toggle> = [];

    @property([JobItem])
    jobItems: Array<JobItem> = [];

    @property(cc.Sprite)
    jobBg: cc.Sprite = null;

    @property(cc.Button)
    advantageBg: cc.Button = null;

    @property(cc.Prefab)
    staffItem: cc.Prefab = null;

    @property([cc.Sprite])
    red: Array<cc.Sprite> = [];

    @property(cc.String)
    private target = "";

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Node)
    advDecrList: cc.Node = null;
    @property(cc.Prefab)
    jobAdvChangePre: cc.Prefab = null;

    @property(sp.SkeletonData)
    jobUnlock: sp.SkeletonData = null;

    private jobType: JobType = JobType.cashier;
    private choseIndex: number = 0;

    dispose: CompositeDisposable = new CompositeDisposable();

    private softGuide: cc.Node = null;

    onLoad() {
        this.dispose.add(ClientEvents.STAFF_JOBS_RED.on(this.refreshJobRed));
        this.dispose.add(ClientEvents.STAFF_ITEM_NORMAL_SELECTED.on(this.onStaffNormalSelected));
        this.dispose.add(ClientEvents.STAFF_ITEM_JOB_SELECTED.on(this.onStaffJobSelected));
        this.dispose.add(ClientEvents.STAFF_JOB_WORK_ONE_KEY.on(this.workOneKey));

        ButtonMgr.addClick(this.advantageBg.node, () => {
            DotInst.clientSendDot(COUNTERTYPE.post, "6509");
            UIMgr.showView(AdvantagePanel.url);
        });

        this.jobTypeToggle.forEach((toggle: cc.Toggle) => {
            ButtonMgr.addToggle(toggle, this.onJobTypeSelect);
        });

        //设置层级显示
        this.jobBg.node.zIndex = 3;
        for (let i = 0; i < 4; i++) {
            this.jobTypeToggle[i].node.zIndex = 2;
        }
    }

    start() {
        this.refreshJobRed(DataMgr.staffData.getJobRed());
        this.refreshUI();
        this.refreshSoftGuide();
        this.checkUnlockJob();
    }

    private checkUnlockJob() {
        let staffData = DataMgr.staffData;
        let unlockJobType = staffData.getUnlockJobType();
        // unlockJobType = 1;
        if (unlockJobType < 0) return;

        staffData.resetUnlockJobType();
        this.scheduleOnce(() => {
            let jobTypeToggle = this.jobTypeToggle[unlockJobType];
            let jobTypeNode = jobTypeToggle.node;
            let glPos = jobTypeNode.convertToWorldSpaceAR(cc.v2(0, 0));
            let canvas = UIMgr.getCanvas();
            let nodePos = canvas.convertToNodeSpaceAR(glPos);
            nodePos.x += 33;
            nodePos.y -= 120;
            let node = new cc.Node();
            node.setPosition(nodePos);
            canvas.addChild(node, cc.macro.MAX_ZINDEX - 1);

            let unlockJobSpine = node.addComponent(sp.Skeleton);
            unlockJobSpine.skeletonData = this.jobUnlock;
            unlockJobSpine.setAnimation(0, "animation", false);
            unlockJobSpine.setCompleteListener(() => {
                // jobTypeToggle.check();
                node.destroy();
                // this.scheduleOnce(() => {
                //     jobTypeToggle && jobTypeToggle.check();
                // }, 0.3);
            });
        }, 0.3);
    }

    private refreshJobRed = (jobRed: boolean[]) => {
        if (!DataMgr.getCanShowRedPoint()) return;
        for (let jobType = JobType.cashier; jobType < JobType.anyJob; jobType++) {
            if (!jobRed[0]) {
                this.red[jobType].node.active = false;
            } else {
                this.red[jobType].node.active = jobRed[jobType + 1];
            }
        }
    };

    private refreshSoftGuide(needSendSoft: boolean = false) {
        this.destroySoftGuide();
        let count = DataMgr.getGuideCompleteTimeById(ArrowType.StaffPosts);
        if (count >= 1) {
            return;
        }

        let staffData: StaffData = DataMgr.staffData;
        let emptyPostsIdx: number = staffData.findEmptyPostsIdx(DataMgr.getMarketId());
        let idleStaffIdx: number = staffData.findIdleStaffIdx();
        if (emptyPostsIdx >= 0 && idleStaffIdx >= 0) {
            if (emptyPostsIdx != this.jobType) {
                ClientEvents.POSTS_GUIDE_STAFF.emit(-1);
                setTimeout(() => {
                    GuideMgr.showSoftGuide(this.jobTypeToggle[emptyPostsIdx].node, ARROW_DIRECTION.BOTTOM, "这里\n可以上岗", (node: cc.Node) => {
                        node.y -= 50;
                        this.softGuide = node;
                    }, true, 0, false, () => {
                        this.onJobTypeSelect(this.jobTypeToggle[emptyPostsIdx]);
                    });
                }, 200);
            } else {
                setTimeout(() => {
                    ClientEvents.POSTS_GUIDE_STAFF.emit(idleStaffIdx);
                }, 200);
            }
        } else {
            ClientEvents.POSTS_GUIDE_STAFF.emit(-1);
            if (GuideMgr.needGoHomeGuide()) {
                setTimeout(() => {
                    ClientEvents.POSTS_GUIDE_BACK.emit();
                }, 200);
            }

            if (needSendSoft) {
                let count = DataMgr.getGuideCompleteTimeById(ArrowType.StaffPosts);
                cc.log("StaffPosts count=", count);
                if (count <= 0/* || !GuideMgr.needGuide()*/) {
                    HttpInst.postData(NetConfig.SOFT_LED_INFO, [ArrowType.StaffPosts], () => {
                    });
                }
            }
        }
    }

    private destroySoftGuide() {
        this.softGuide && this.softGuide.destroy();
    }

    private refreshUI(isOnekey: boolean = false) {
        this.refreshUIAndRed(-1, isOnekey);
    };

    private showJobTypes() {
        if(!this.jobTypeToggle) return;
        let staffData: StaffData = DataMgr.staffData;
        staffData.getPostShow().forEach((unlock: boolean, index: number) => {
            let toggle: cc.Toggle = this.jobTypeToggle[index];
            // UIUtil.visible(this.jobTypeToggle[index], value);
            // this.jobTypeToggle[index].enabled = unlock;
            // this.jobTypeToggle[index].interactable = unlock;
            // this.jobTypeToggle[index].node.color = cc.Color.GRAY;

            // let jobTypeToggleBg: cc.Sprite = this.jobTypeToggle[index].node
            //     .getChildByName("Background")
            //     .getComponent(cc.Sprite);
            // let jobImg = Staff.getJobImage(index);
            // UIUtil.asyncSetImage(jobTypeToggleBg, ResManager.STAFF_UI + jobImg + (unlock ? "_c" : "_l"));

            let jobTypeToggleBg: cc.Sprite = toggle.node
                .getChildByName("Background")
                .getComponent(cc.Sprite);
            UIUtil.visible(jobTypeToggleBg, !toggle.isChecked);
            this.jobTypeToggle[index].node.zIndex = toggle.isChecked ? 4 : 2;

            let lockIcon: cc.Sprite = toggle.node
                .getChildByName("lockIcon")
                .getComponent(cc.Sprite);
            UIUtil.visible(lockIcon, !unlock);
            if (!unlock) {
                UIUtil.setImageGray(jobTypeToggleBg);
                toggle.node.getChildByName("jobNameLab").getComponent(cc.Label).node.color = cc.Color.GRAY;
            }
        });
    }

    private loadJobTypeInfo(isUpWork: boolean = false, isOnekey: boolean = false) {
        if(!this.jobItems) return;
        let staffData: StaffData = DataMgr.staffData;
        let post: IPost = staffData.getPost(this.jobType);
        if(!post) return;
        let onWorkStaffs: number[] = post.staffIds.filter((staffId: number) => staffId > 0);
        let onWorkStaffsSize: number = onWorkStaffs.length;
        for (let i = 0; i < post.staffIds.length; i++) {
            this.fillJobItem(post.staffIds[i], i,
                isOnekey ? true : isUpWork ? (i == onWorkStaffsSize - 1) : false);
        }
        this.refreshSumScore(post);
        this.checkShowAdvantage();
    }

    private fillJobItem(staffId: number, index: number, isNew: boolean) {
        let item: JobItem = this.jobItems[index];
        item.initItem(staffId, this.jobType, index, isNew);
    }

    private refreshSumScore(post: IPost) {
        if (post.sumScore >= 0) {
            //UIUtil.setLabel(this.scoreLabel, Math.round(post.sumScore));
            //cc.log("post.sumScore =", post.sumScore);
            let calcSumScore = DataMgr.staffData.calcPostScore(post.positionId);
            UIUtil.setLabel(this.scoreLabel, calcSumScore);
        }
    };

    private checkShowAdvantage() {
        let staffAdvMap: Map<StaffAdvantage, number[]> = DataMgr.staffData.refreshStaffAdvMap();
        let isShow: boolean = false;
        for (let staffAdv = StaffAdvantage.poster; staffAdv <= StaffAdvantage.cd; staffAdv++) {
            let staffIds: number[] = staffAdvMap.get(staffAdv);
            let staffIdNum: number = staffIds ? staffIds.length : 0;
            if (staffIdNum > 0) {
                isShow = true;
                break;
            }
        }

        UIUtil.visible(this.advantageBg, isShow);
    }

    private onJobTypeSelect = (toggle: cc.Toggle) => {
        let index = this.jobTypeToggle.indexOf(toggle);
        if (index == this.jobType) {
            return;
        }
        if (!DataMgr.staffData.getPostShow()[index]) {
            let lv = JsonMgr.getJobLimitLv(index, 1, DataMgr.getMarketId());
            let diffLv = lv - DataMgr.iMarket.getExFrequency();
            let str = StringUtil.format(JsonMgr.getTips(TextTipConst.STAFFJOBTIP), diffLv);
            UIMgr.showTipText(str);
            this.jobTypeToggle[this.jobType].check();
            return;
        }

        this.choseIndex = index;

        DotInst.clientSendDot(COUNTERTYPE.post, (6502 + index) + "");

        cc.log("onStaffAttrSelect index=" + index);
        this.jobType = index;

        this.refreshUIAndRed(index);
        this.refreshSoftGuide();
    };

    private refreshUIAndRed(redIndex: number, isOnekey: boolean = false) {
        this.showJobTypes();
        this.loadJobTypeInfo(false, isOnekey);
        this.sortByJobType();

        if (redIndex < 0) {
            this.requestSeeNewPos(-1);
        } else if (this.red[redIndex].node.active) {
            this.requestSeeNewPos(redIndex);
        }
    }

    requestSeeNewPos(index: number) {
        // HttpInst.postData(NetConfig.seeNewPos, [DataMgr.getMarketId(), index], (response: any) => {
        //     this.updateRed(response.newPos)
        // });
    }

    private sortByJobType() {
        UIUtil.asyncSetImage(this.jobBg, ResManager.STAFF_JOB + "job_beijing" + this.jobType, false);

        const staffData: StaffData = DataMgr.staffData;
        const staffSort: StaffSort = new StaffSort(staffData.getStaffSort());
        staffSort.attr = Staff.getAttrByJob(this.jobType);
        staffSort.type = SortType.DESC;
        if (staffData.isFilter()) {
            staffSort.advantages.clear(); //重置一下筛选全部员工
            staffSort.needFilter = true;
        }

        staffData.setJobAttr(staffSort.attr);
        staffData.setStaffSort(staffSort);

        staffData.sort();
        staffData.clearSelectedStaffs(this.staffItem, this.target);
        ClientEvents.STAFF_SORT_CONFIRM.emit();

        // setTimeout(() => {
        //     this.jobItems[0].onSelect();
        // }, 100);
    };

    private onStaffJobSelected = (staffId: number) => {
        let staffData: StaffData = DataMgr.staffData;
        let staff: Staff = staffData.getChooseStaff();
        if (staff.inDuty()) {
            cc.log("staffId=", staffId, "下岗");
            this.checkDownWork(staff);
        } else {
            cc.log("staffId=", staffId, "上岗");
            if (staff.inWork()) {
                UIMgr.showTipText(TextTipConst.YUANGOGNNOTIHUAN);
                return;
            }
            this.upWork(staff);
        }
    };

    private isLastStaff() {
        let staffSize: number = 0;
        this.jobItems.forEach((jobItem: JobItem) => {
            if (jobItem.hasStaff()) {
                staffSize++;
            }
        });
        return staffSize <= 1;
    }

    private onStaffNormalSelected = (index: number, isSelf: boolean) => {
        //!isSelf为true，代表是JobItem岗位的关联staffId触发的StaffItem选中，所以不做处理
        if (!isSelf) {
            return;
        }
        let staffData: StaffData = DataMgr.staffData;
        if (!staffData.isJobState()) {
            return;
        }
        let staff: Staff = staffData.getChooseStaff();
        if (!staff) {
            return;
        }
        if (staff.inWork() && !staff.inDuty()) {
            cc.log("员工在工作不可选中替换 1");
            return;
        }

        if (staff.inDuty()) {
            this.checkDownWork(staff);
        } else {
            this.upWork(staff);
        }
    };

    private checkDownWork(staff: Staff) {
        if (staff.positionId == this.jobType) {
            if (this.jobType == JobType.cashier && this.isLastStaff()) {
                UIMgr.showTipText(TextTipConst.LASTNOXIAGUANG);
            } else {
                this.downWork(staff);
            }
        } else {
            cc.log("岗位类型不一样不可下岗");
        }
    }

    private workOneKey = () => {

        DotInst.clientSendDot(COUNTERTYPE.post, "6510");
        let staffData = DataMgr.staffData;
        if (staffData.isEmpty()) {
            UIMgr.showTipText(TextTipConst.JOB_STAFF_IS_EMPTY);
            return;
        }

        let oldAdvSpeedAddMap = staffData.getStaffAdvSpeedAddMap();
        let oldBusinessOneHour: number = DataMgr.businessOneHour;

        HttpInst.postData(NetConfig.workOneKey,
            [DataMgr.getMarketId()], (response: IRespData) => {
                if(!this.isValid) return;
                //UIMgr.showTipText("一键分配成功！");
                this.refreshUI(true);

                this.showJobUpView(response.businessOneHour, oldBusinessOneHour, oldAdvSpeedAddMap, true);

                staffData.clearSelectedStaffs(this.staffItem, this.target);
            });
    };

    private upWork(staff: Staff) {

        cc.log("upWork chooseStaffId=" + staff.staffId + ", staffName=" + staff.getName());

        let staffData = DataMgr.staffData;
        let post: IPost = staffData.getPost(this.jobType);
        let staffSize: number = post.staffIds.filter(staffId => staffId > 0).length;
        if (this.isPostFull(staffSize)) {
            //cc.log(this.jobType, "is full! can not upWork, please downWork first");
            UIMgr.showTipText(TextTipConst.JOB_IS_FULL);
            return;
        }
        if (this.isPostLock(post, staffSize)) {
            UIMgr.showTipText(TextTipConst.JOB_IS_LOCK);
            return;
        }

        let oldAdvSpeedAddMap = staffData.getStaffAdvSpeedAddMap();
        let oldBusinessOneHour: number = DataMgr.businessOneHour;
        DotInst.clientSendDot(COUNTERTYPE.post, "6506", staff.xmlId + "," + staff.level, this.jobType + "", DataMgr.getMarketId() + "")
        HttpInst.postData(NetConfig.work,
            [DataMgr.getMarketId(), staff.staffId, this.jobType], (response: IRespData) => {
                if(!this.isValid) return;
                this.refreshPosition(response, true);
                this.showJobUpView(response.businessOneHour, oldBusinessOneHour, oldAdvSpeedAddMap);
            });
    }

    private isPostFull(staffSize: number) {
        return staffSize >= 4;
    }

    private isPostLock(post: IPost, staffSize: number) {
        return post.staffIds[staffSize] <= -1;
    }

    //展示上岗成功，只有营业额变化才展示擅长的变化
    private showJobUpView = (businessOneHour: number, oldBusinessOneHour: number,
        oldAdvSpeedAddMap: Map<StaffAdvantage, number>, isOnekey: boolean = false) => {
        let staffData = DataMgr.staffData;
        let advSpeedAddMap = staffData.getStaffAdvSpeedAddMap();
        let advIncrMap: Map<StaffAdvantage, number> = new Map<StaffAdvantage, number>();
        let advDecrMap: Map<StaffAdvantage, number> = new Map<StaffAdvantage, number>();
        for (let type = StaffAdvantage.poster; type < StaffAdvantage.cd; type++) {
            let speedAdd = advSpeedAddMap.get(type);
            let oldSpeedAdd = oldAdvSpeedAddMap.get(type);
            if (speedAdd > oldSpeedAdd) {
                advIncrMap.set(type, speedAdd - oldSpeedAdd);
            } else if (speedAdd < oldSpeedAdd) {
                advDecrMap.set(type, speedAdd - oldSpeedAdd);
            }
        }

        let saleAdd: number = businessOneHour - oldBusinessOneHour;
        if (saleAdd > 0 || advIncrMap.size > 0) {
            UIMgr.showView(JobUpView.url, null, null, (node: cc.Node) => {
                node.getComponent(JobUpView).initView(saleAdd, advIncrMap);
                let close = cc.callFunc(() => {
                    UIMgr.closeView(JobUpView.url);
                });
                node.setScale(0, 0);
                node.runAction(cc.sequence(cc.scaleTo(0.2, 1),
                    cc.delayTime(1), cc.scaleTo(0.1, 0), close));
            });
        } else {
            UIMgr.showTipText((isOnekey ? "一键" : "") + "上岗成功！");
        }

        this.advDecrList.removeAllChildren();
        if (advDecrMap.size > 0) {
            advDecrMap.forEach((value: number, staffAdv: StaffAdvantage) => {
                let jobAdvChanger: JobAdvChange = cc.instantiate(this.jobAdvChangePre).getComponent(JobAdvChange);
                jobAdvChanger.initView(staffAdv, value * 100);
                this.advDecrList.addChild(jobAdvChanger.node);
            });
            //UIUtil.showNode(this.advDecrList);
            this.advDecrList.runAction(cc.sequence(cc.fadeIn(1), cc.fadeOut(1)));
        }

        this.refreshSoftGuide(true);
    };

    private downWork(staff: Staff) {
        cc.log("downWork chooseStaffId=" + staff.staffId + ", staffName=" + staff.getName());
        DotInst.clientSendDot(COUNTERTYPE.post, "6507", staff.xmlId + "," + staff.level, this.jobType + "", DataMgr.getMarketId() + "")
        HttpInst.postData(NetConfig.downWork,
            [staff.staffId], (response: IRespData) => {
                this.refreshPosition(response);
                this.refreshSoftGuide();
            });
    }

    private refreshPosition(response: IRespData, isUpWork: boolean = false) {
        if (!response.posts) {
            cc.log("服务器没有返回变化的岗位信息");
            return;
        }

        // DataMgr.updatePositions(response);
        DataMgr.updateStaff(response);

        this.loadJobTypeInfo(isUpWork);
    }

    show() {
        if (!this.node.active) {
            this.node.active = true;
        }
    }

    hide = () => {
        if (this.node.active) {
            this.node.active = false;
        }
    };

    onDisable() {

    }

    onDestroy() {
        this.dispose.dispose();
        this.softGuide && this.softGuide.destroy();
    }

}
