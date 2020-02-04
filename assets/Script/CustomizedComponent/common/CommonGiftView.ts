import CommonGiftItem from "./CommonGiftItem";
import { HttpInst } from "../../core/http/HttpClient";
import { NetConfig } from "../../global/const/NetConfig";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { Staff } from "../../Model/StaffData";
import { RecruitStaff } from "../staff/recruitNew/RecruitStaff";
import { ShowType } from "../../Model/ExchangeData";
import { DataMgr, GET_ANI_TYPE, COM_GIFT_TYPE } from "../../Model/DataManager";
import { JsonMgr } from "../../global/manager/JsonManager";
import { UIMgr } from "../../global/manager/UIManager";
import { ICommonRewardInfo } from "../../types/Response";
import { RecruitResult } from "../../Model/RecruitData";
import UpgradePopover from "../upgradePopover";

import IncidentFollowView from "../incident/IncidentFollowView"
import { GameComponent } from "../../core/component/GameComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonGiftView extends GameComponent {
    protected getBaseUrl(): string {
        return CommonGiftView.url;
    }
    static url = "common/commonGift";
    @property(cc.Node)
    private staff: cc.Node = null;
    @property(cc.Prefab)
    staffPrefab: cc.Prefab = null;

    @property(cc.Node)
    staffNode: cc.Node = null;

    @property(cc.Node)
    staffScrollView: cc.Node = null;

    @property(cc.Node)
    itemScrollView2: cc.Node = null;

    @property(cc.Prefab)
    ItemPrefab: cc.Prefab = null;

    @property(cc.Node)
    private itemLoadNode: Array<cc.Node> = [];

    @property(cc.Node)
    itemNodeBg: cc.Node = null;

    @property(sp.Skeleton)
    private skeleton: sp.Skeleton = null;

    @property(sp.Skeleton)
    private CriisSkeleton: sp.Skeleton = null;

    @property(sp.Skeleton)
    private Eventkeleton: sp.Skeleton = null;

    @property(sp.Skeleton)
    private Helpkeleton: sp.Skeleton = null;

    @property(sp.Skeleton)
    private orderSkeleton: sp.Skeleton = null;


    @property(cc.Animation)
    private commonGift: cc.Animation = null;
    @property(cc.Node)
    private confirmBtn: cc.Node = null;
    reward: string = "";
    ble: boolean = false;
    private loadNode: cc.Node = null;
    private loadStaffNode: cc.Node = null;
    // private LvData: number[];
    private isGetStaff: boolean = false;

    start() {
        let type = DataMgr.getCommGiftType();
        this.skeleton.node.active = type == COM_GIFT_TYPE.normal;
        this.Eventkeleton.node.active = type == COM_GIFT_TYPE.event;
        this.CriisSkeleton.node.active = type == COM_GIFT_TYPE.crisis;
        this.Helpkeleton.node.active = type == COM_GIFT_TYPE.help;
        this.orderSkeleton.node.active = type == COM_GIFT_TYPE.order;

        this.skeleton.setCompleteListener(() => {
            this.skeleton.setAnimation(0, "animation2", true);
        });

        this.Eventkeleton.setCompleteListener(() => {
            this.Eventkeleton.setAnimation(0, "animation2", true);
        });
        this.CriisSkeleton.setCompleteListener(() => {
            this.CriisSkeleton.setAnimation(0, "animation2", true);
        });
        this.Helpkeleton.setCompleteListener(() => {
            this.Helpkeleton.setAnimation(0, "animation2", true);
        });
        this.orderSkeleton.setCompleteListener(() => {
            this.orderSkeleton.setAnimation(0, "animation2", true);
        });

        let data = this.node["data"];
        if (data) {
            switch (this.getGiftType(data.type)) {
                case 0:
                    this.initRewards(data.rewards, data.staff, data.LV);
                    this.sureHandler();
                    break;
                case 1:
                    this.loadView(data.rewards, data.staff, data.LV);
                    break;
            }
        }
        cc.log("DataMgr.getGetAniType()----" + DataMgr.getGetAniType());
        if (DataMgr.getGetAniType() == GET_ANI_TYPE.SHOW_TIPS_ONLY) {
            // this.confirmBtn.once(cc.Node.EventType.TOUCH_END, this.sureHandler, this);
            // this.onceNode();
            this.sureHandler();
        }
    }

    getGiftType(gifttype: string): number {
        let type = 1;
        let json: Array<any> = JsonMgr.getJsonArr("obtainShowType");
        for (let i = 0; i < json.length; i++) {
            let obj: IObtainShowTypeJson = json[i];
            if (obj.interface == gifttype) {
                type = 0;
                return type;
            }
        }
        return type;
    }

    onEnable() {
    }

    loadView(dataVo: ICommonRewardInfo[] = [], staff: Array<Staff> = [], LV?: number[]) {
        // this.LvData = LV;

        if (staff.length > 0) {
            this.staff.active = true;
            if (staff.length > 3) {
                this.loadStaffNode = this.staffScrollView;
                this.staffScrollView.parent.parent.active = true;
            } else {
                this.loadStaffNode = this.staffNode;
                this.staffNode.active = true;
            }
        }

        if (dataVo.length > 8) {
            this.loadNode = this.itemScrollView2;
            this.itemScrollView2.parent.parent.active = true;
            this.itemNodeBg.setContentSize(this.itemScrollView2.getContentSize());
        } else if (dataVo.length > 4) {
            let bei = Math.ceil(dataVo.length / 4);
            if (bei != 0) {
                this.itemNodeBg.setContentSize(this.itemNodeBg.getContentSize().width, this.itemNodeBg.getContentSize().height * bei);
            }
        }

        for (let nid = 0; nid < dataVo.length; nid++) {
            if (this.reward) {
                this.reward = this.reward + ";" + dataVo[nid].xmlId + "," + dataVo[nid].num;
            } else {
                this.reward = dataVo[nid].xmlId + "," + dataVo[nid].num;
            }
            let node = cc.instantiate(this.ItemPrefab);
            let item: CommonGiftItem = node.getComponent(CommonGiftItem);
            item.loadItem(dataVo[nid].xmlId, dataVo[nid].num);
            this.itemNodeBg.active = true;
            if (this.loadNode) {
                this.loadNode.addChild(node);
            } else {
                if (nid > 3) {
                    this.itemLoadNode[1].addChild(node);
                    this.itemLoadNode[1].active = true;
                } else if (nid <= 3) {
                    this.itemLoadNode[0].addChild(node);
                    this.itemLoadNode[0].active = true;
                }
            }
        }

        this.loadStaff(staff);
        if (dataVo.length > 0 && staff.length > 0) {
            this.playStaff();
            setTimeout(() => {
                this.node.once(cc.Node.EventType.TOUCH_END, () => {
                    this.playItem();
                    this.confirmBtn.once(cc.Node.EventType.TOUCH_END, this.sureHandler, this);
                    this.onceNode();
                }, this);
            }, 1200);
            this.confirmBtn.once(cc.Node.EventType.TOUCH_END, () => {
                this.playItem();
                this.confirmBtn.once(cc.Node.EventType.TOUCH_END, this.sureHandler, this);
                this.onceNode();

            }, this);
        } else if (dataVo.length > 0) {
            this.playItem();
            this.confirmBtn.once(cc.Node.EventType.TOUCH_END, this.sureHandler, this);
            this.onceNode();
        } else {
            this.playStaff();
            this.confirmBtn.once(cc.Node.EventType.TOUCH_END, this.sureHandler, this);
            this.onceNode();
        }
    }

    onceNode = () => {
        setTimeout(() => {
            if (this.node) {
                this.node.once(cc.Node.EventType.TOUCH_END, this.sureHandler, this);
            }
        }, 1200);
    };

    playStaff = () => {
        this.commonGift.play("staffRew");    //领员工
        this.skeleton.setAnimation(0, "animation", false);
    };

    playItem = () => {
        this.commonGift.play("itemRew");     //领道具
        let type = DataMgr.getCommGiftType();
        switch (type) {
            case COM_GIFT_TYPE.normal:
                this.skeleton.setAnimation(0, "animation", false);
                break;
            case COM_GIFT_TYPE.crisis:
                this.CriisSkeleton.setAnimation(0, "animation", false);
                break;
            case COM_GIFT_TYPE.event:
                this.Eventkeleton.setAnimation(0, "animation", false);
                break;
            case COM_GIFT_TYPE.help:
                this.Helpkeleton.setAnimation(0, "animation", false);
                break;
            case COM_GIFT_TYPE.order:
                this.orderSkeleton.setAnimation(0, "animation", false);
                break;
        }
    };

    loadStaff = (staff: Array<Staff>) => {
        this.isGetStaff = staff.length > 0;
        let results = staff.map((staff: Staff) => new RecruitResult(<RecruitResult>{ staff: staff }));
        let size = staff.length;
        for (let i = 0; i < size; i++) {
            let node = cc.instantiate(this.staffPrefab);
            let script = node.getComponent(RecruitStaff);
            script.initResult(results[i], ShowType.ExchangeStaff);
            if (staff[i].staffId < 0) {
                let str = JsonMgr.getStaffConfig(staff[i].xmlId).diamRepeat;
                if (this.reward) {
                    this.reward = this.reward + ";" + str;
                } else {
                    this.reward = str;
                }
                script.hideNew();
                script.showGoodbye(true);
            } else {
                if (this.reward) {
                    this.reward = this.reward + ";" + staff[i].xmlId + "," + 1;
                } else {
                    this.reward = staff[i].xmlId + "," + 1;
                }
                DataMgr.updateOneStaff(staff[i]);
                script.showStarAndName();
                script.showNew();
            }
            node.setPosition(0, -60);
            this.loadStaffNode.addChild(node);
        }
    };

    initRewards(dataVo: ICommonRewardInfo[] = [], staff: Array<Staff> = [], LV?: number[]) {
        for (let nid = 0; nid < dataVo.length; nid++) {
            if (this.reward) {
                this.reward = this.reward + ";" + dataVo[nid].xmlId + "," + dataVo[nid].num;
            } else {
                this.reward = dataVo[nid].xmlId + "," + dataVo[nid].num;
            }
        }
        // let results = staff.map((staff: Staff) => new RecruitResult(<RecruitResult>{ staff: staff }));
        let size = staff.length;
        for (let i = 0; i < size; i++) {
            // let node = cc.instantiate(this.staffPrefab);
            // let script = node.getComponent(RecruitStaff);
            // script.initResult(recruitResules[i], ShowType.ExchangeStaff);
            if (staff[i].staffId < 0) {
                let str = JsonMgr.getStaffConfig(staff[i].xmlId).diamRepeat;
                if (this.reward) {
                    this.reward = this.reward + ";" + str;
                } else {
                    this.reward = str;
                }
            } else {
                if (this.reward) {
                    this.reward = this.reward + ";" + staff[i].xmlId + "," + 1;
                } else {
                    this.reward = staff[i].xmlId + "," + 1;
                }
                DataMgr.updateOneStaff(staff[i]);
            }
        }
    }

    sureHandler = () => {
        // this.node.destroy();

        this.isGetStaff ? this.closeView() : this.closeOnly();

        ClientEvents.REFRESH_POWER_GUIDE.emit();
        let giftType = DataMgr.getCommGiftType();
        if (giftType == COM_GIFT_TYPE.crisis ||
            giftType == COM_GIFT_TYPE.help ||
            giftType == COM_GIFT_TYPE.event) {
            ClientEvents.CLOSE_INCIDNT_ANI.emit();
        }

        DataMgr.setCommGiftType(COM_GIFT_TYPE.normal);
        DataMgr.setGetAniType(GET_ANI_TYPE.SHOW_ANI_AND_TIPS);

        if (this.reward) {
            UIMgr.showTipText("领取", this.reward);
        }
        ClientEvents.LV_UP_ANIM.emit(true);
        // if (this.LvData) {
        //     this.upgradePopover(this.LvData[0], this.LvData[1]);
        // }

        if (DataMgr.isInFriendHome() && DataMgr.friendData && DataMgr.friendData.friendFocus) {//需要关注好友
            UIMgr.showView(IncidentFollowView.url, null, DataMgr.getCurUserId());
        }
        let lv = JsonMgr.getConstVal("guideArrow");
        if (!lv) {
            lv = 4;
        }
        if (DataMgr.userData.level < lv) {
            HttpInst.postData(NetConfig.REDPOLLING, [], (response) => {
                if (response.redDots) {
                    DataMgr.setRedData(response.redDots);
                    ClientEvents.UPDATE_MAINUI_RED.emit(response.redDots);
                }
            });
        }
    };

    //升级弹窗
    // upgradePopover = (lv: number, incrHowLv: number) => {
    //     UIMgr.showView(UpgradePopover.url, cc.director.getScene(), null, (node: cc.Node) => {
    //         ClientEvents.EVENT_FUNCTION_OPEN.emit();
    //         node.zIndex = 1002;
    //         let upgradePopoverNode: cc.Node = node.getChildByName("upgradePopover1");
    //         upgradePopoverNode.getComponent(UpgradePopover).loadData(lv, incrHowLv);
    //     });
    // };

    onDestroy() {
    }
}
