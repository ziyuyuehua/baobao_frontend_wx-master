import {GameComponent} from "../../../core/component/GameComponent";
import {HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import {TextTipConst} from "../../../global/const/TextTipConst";
import {AudioMgr} from "../../../global/manager/AudioManager";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {UIMgr} from "../../../global/manager/UIManager";
import {Consume, DataMgr} from "../../../Model/DataManager";
import {Staff, StaffData} from "../../../Model/StaffData";
import {IStaffAttColor, IStaffExp} from "../../../types/Response";
import {HashSet} from "../../../Utils/dataStructures/HashSet";
import {StringUtil} from "../../../Utils/StringUtil";
import {ActionMgr} from "../../common/Action";
import {ButtonMgr} from "../../common/ButtonClick";
import {COUNTERTYPE, DotInst, DotVo} from "../../common/dotClient";
import {LevelItem} from "./LevelItem";
import {LevelUpPop} from "./LevelUpPop";
import StaffComHead from "./StaffComHead";
import {ArrowTextConst} from "../../../global/const/ArrowTextConst";
import BindingGuide from "../../common/BindingGuide";
import {topUiType} from "../../MainUiTopCmpt";

const {ccclass, property} = cc._decorator;

const itemIds: Array<number> = [100101, 100102, 100103];

const attrColor: cc.Color = new cc.Color(0, 0, 0);
const changedAttrColor: cc.Color = new cc.Color(220, 110, 31);

export interface lvUpSucc {
    staff,
    newStaff
}

@ccclass
export class LevelPanel extends GameComponent {

    @property(cc.Prefab)
    private levelItem: cc.Prefab = null;
    @property(cc.Node)
    private levelList: cc.Node = null;
    @property(cc.Node)
    private blockPanel: cc.Node = null;

    @property(cc.Node)
    private staffCom: cc.Node = null;

    @property(cc.Button)
    private backBtn: cc.Button = null;
    @property(cc.Button)
    private useBtn: cc.Button = null;
    @property(cc.Button)
    private onekeyBtn: cc.Button = null;

    private levelItems: Array<LevelItem> = null;

    private staff: Staff = null;

    @property(cc.Node)
    playAniMark: cc.Node = null;

    @property([cc.Node])
    animationArr: Array<cc.Node> = [];

    @property(cc.Animation)
    lveffect: cc.Animation = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.Node)
    private onKeyAddSoftLead: cc.Node = null;

    @property(cc.Node)
    private useSoftLead: cc.Node = null;

    @property(cc.Node)
    private backLead: cc.Node = null;

    @property(cc.Node)
    private levelMask: cc.Node = null;

    private aniStartArr = [];   //动画初始位置

    private maxLv: number = -1;
    private maxLvNeedExp: number = -1;

    private animationPlayArr: number[] = [];    //需要播放的动画itemID 0 1 2

    private returnResponse = null;

    static url: string = "staff/list/levelPanelNew";
    canUpLevel: boolean = false;

    hasClickUseBtn: boolean = false;

    private oneKeyState: boolean = false;

    getBaseUrl() {
        return LevelPanel.url;
    }

    onLoad() {
        this.dispose.add(ClientEvents.ClOSE_STAFF_LEVEL_VIEW.on(this.closeHandler));
        ButtonMgr.setInteractableNoClick(false);
        ButtonMgr.addClick(this.blockPanel, this.closeHandler);
        ButtonMgr.addClick(this.backBtn.node, this.closeHandler);
        ButtonMgr.addClick(this.backLead, this.closeHandler);
        ButtonMgr.addClick(this.useBtn.node, this.useLvUpItem);
        ButtonMgr.addClick(this.useSoftLead, this.useLvUpItem);
        ButtonMgr.addClick(this.onekeyBtn.node, this.onekeyLvUp);
        ButtonMgr.addClick(this.onKeyAddSoftLead, this.onekeyLvUp);
        this.addEvent(ClientEvents.STAFF_UPDATE_STAFF.on(this.onUpdateStaff));
        this.addEvent(ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.on(this.resetItemNum));
        this.lveffect.on(cc.Animation.EventType.STOP, () => {
            this.animationPlayArr = [];
            this.lveffect.node.active = false;
            // this.hideAmation();
            // this.resetAnimationPos();
            this.updateLvUp(this.returnResponse);
            this.playAniMark.active = false;
            this.levelMask.active = false;
        })
        this.showSoftLead();
        this.dispose.add(ClientEvents.SHOW_BACK_STAFF_SOFT.on(() => {
            this.backLead.active = true;
            this.backLead.getComponent(BindingGuide).loadLabText(ArrowTextConst.BACK_TO_STAFF);
        }));
    }

    closeHandler = () => {
        this.closeOnly();
        if (DataMgr.getUserLv() < Number(JsonMgr.getConstVal("guideArrow")) && this.hasClickUseBtn) {
            ClientEvents.SHOW_BACK_SOFT.emit();
        }
        ClientEvents.UPDATE_STAFF_VIEW.emit();
        ClientEvents.UPDATE_POP.emit();
    }

    curStaffCanUpLevel() {
        let nextLevelneedExp: number = JsonMgr.getStaffLevelConfig(this.staff.level).exp;
        let needExp: number = nextLevelneedExp - this.staff.exp;
        this.canUpLevel = DataMgr.warehouseData.getAllCanAddExp() > needExp;
    }

    showSoftLead() {
        if (DataMgr.getUserLv() < Number(JsonMgr.getConstVal("guideArrow")) && !this.hasClickUseBtn) {
            //引导升级
            this.onKeyAddSoftLead.active = this.canUpLevel;
            this.onKeyAddSoftLead.getComponent(BindingGuide).loadLabText(ArrowTextConst.ADD_TEXP);
            ClientEvents.CLEAN_SOFT_LEAD.emit();
        }
    }

    //重置动画位置
    resetAnimationPos() {
        for (let nid = 0; nid < this.animationArr.length; nid++) {
            let pos: cc.Vec2[] = this.aniStartArr[nid];
            for (let nIndx = 1; nIndx <= 4; nIndx++) {
                let node = this.animationArr[nid].getChildByName("start" + nIndx);
                node.position = pos[nIndx - 1];
            }
        }
    }

    //隐藏动画组
    hideAmation() {
        for (let nid = 0; nid < this.animationArr.length; nid++) {
            this.animationArr[nid].active = false;
        }
        this.lveffect.node.active = false;
    }

    //播放动画
    playAnimation() {
        let aniend: number = 1;
        this.playAniMark.active = true;
        this.levelMask.active = true;
        for (let nid = 0; nid < this.animationPlayArr.length; nid++) {
            let animationNode = this.animationArr[this.animationPlayArr[nid]];
            animationNode.active = true;
            if (animationNode) {
                for (let nIndx = 1; nIndx <= 4; nIndx++) {
                    let node = animationNode.getChildByName("start" + nIndx);
                    ActionMgr.MoveAction(node, () => {
                        aniend++;
                        if (aniend == this.animationPlayArr.length * 4) {
                            this.hideAmation();
                            this.resetAnimationPos();
                            this.lveffect.node.active = true;
                            this.lveffect.play();
                        }
                    }, this.lveffect.node.x, this.lveffect.node.y);
                }
            }
        }
    }

    start() {
        UIMgr.showView(StaffComHead.url, this.staffCom);
        this.addLevelItems();
        this.init(DataMgr.getChooseStaff());
        for (let nid = 0; nid < this.animationArr.length; nid++) {
            let animationNode = this.animationArr[nid];
            let vecArr: cc.Vec2[] = []
            for (let nIndx = 1; nIndx <= 4; nIndx++) {
                let node = animationNode.getChildByName("start" + nIndx);
                vecArr.push(node.position);
            }
            this.aniStartArr.push(vecArr);
        }
        this.hideAmation();
    }


    private addLevelItems() {
        this.levelItems = new Array<LevelItem>(itemIds.length);
        this.levelList.removeAllChildren();
        itemIds.forEach((itemId, index) => {
            let levelItem: LevelItem = cc.instantiate(this.levelItem).getComponent(LevelItem);
            levelItem.init(this, itemId, index);
            this.levelList.addChild(levelItem.node);
            this.levelItems[index] = levelItem;
        });
        this.judgeOneKeyState();
    }

    judgeOneKeyState() {
        this.oneKeyState = false;
        itemIds.forEach((itemId, index) => {
            let itemNum = DataMgr.warehouseData.getItemNum(itemId);
            if (itemNum > 0) {
                this.oneKeyState = true;
            }
        })
        this.onekeyBtn.interactable = this.oneKeyState;
    }

    onUpdateStaff = (staffIds: HashSet<number>) => {
        if (!staffIds.has(this.staff.staffId)) {
            return;
        }
        let staff: Staff = DataMgr.getStaff(this.staff.staffId);
        this.updateStaff(staff);
        this.addLevelItems();
    };

    //注意staff只能读取数值，千万不能修改！
    private init(staff: Staff) {
        this.staff = staff;
        ClientEvents.UPDATE_STAFF.emit(staff);
        this.updateStaff(staff);
        this.resetItemUseNum();
        this.curStaffCanUpLevel();
        this.showSoftLead();
    }

    private updateStaff(staff: Staff) {
        this.maxLv = JsonMgr.getMaxStaffLvByStar(staff.star);
        let totalLevelExp: number = JsonMgr.getTotalStaffLvExpByStar(staff.star);
        let staffTotalExp: number = staff.getTotalExp();
        this.maxLvNeedExp = totalLevelExp - staffTotalExp;
        //cc.log("maxLvNeedExp=", this.maxLvNeedExp);

        this.checkUseBtnActive();
    }

    private checkUseBtnActive() {
        this.checkUseBtnActiveByLv(this.staff.isMaxLevel());
    }

    private checkUseBtnActiveByLv(isMaxlv: boolean) {

        if (isMaxlv) {
            this.switchUseBtn(false);
            cc.log("等级已满");
        } else {
            this.checkUseBtnActiveByConsumes();
        }
    }

    checkUseBtnActiveByConsumes() {
        let consumes: Array<Consume> = this.collectConsumes();
        if (consumes.length <= 0) {
            this.switchUseBtn(false);
        } else {
            this.switchUseBtn(true);
        }
    };

    switchUseBtn(enable: boolean) {
        this.useBtn.interactable = enable;
    }

    private onekeyLvUp = () => {
        DotInst.clientSendDot(COUNTERTYPE.staff, "6002");
        if (!this.oneKeyState) {
            UIMgr.showTipText("店长快去补充道具哟");
            return;
        }
        if (this.staff.isMaxLevel()) {
            return;
        }
        if (this.onKeyAddSoftLead.active) {
            this.onKeyAddSoftLead.active = false;
            this.useSoftLead.active = true;
            this.useSoftLead.getComponent(BindingGuide).loadLabText(ArrowTextConst.USE_TEXP);
        }

        this.resetItemExpNum();
        const size: number = this.levelItems.length;
        const itemNums: Array<number> = new Array<number>(size);
        let allItemSumExp: number = 0;
        this.levelItems.forEach((item: LevelItem, index) => {
            itemNums[index] = item.getItemNum();
            allItemSumExp += item.getAllExp();
        });
        if (allItemSumExp < this.maxLvNeedExp) {
            this.useAllItems();
        } else {
            this.calculateUseItems(size, itemNums);
        }

    };

    private useAllItems() {
        this.levelItems.forEach((item: LevelItem) => {
            item.setUseNum(item.getItemNum());
        });
    }

    private leftItemEnough(index: number, needExp: number): boolean {
        let allItemSumExp: number = 0;
        for (let i = index - 1; i >= 0; i--) {
            allItemSumExp += this.levelItems[i].getAllExp();
        }
        return allItemSumExp >= needExp;
    }

    private calculateUseItems(size: number, itemNums: Array<number>) {
        const itemUseNums: Array<number> = new Array<number>(size);
        for (let i = 0; i < size; i++) {
            itemUseNums[i] = 0;
        }

        let isMaxLv: boolean = false;
        let changed: boolean = false;
        let needExp: number = this.maxLvNeedExp;
        for (let i = size - 1; i >= 0; i--) {
            if (itemNums[i] <= 0) {
                continue;
            }

            changed = true;
            const oneItemExp: number = this.levelItems[i].oneItemExp();
            for (let j = 1; j <= itemNums[i]; j++) {
                if (needExp < oneItemExp && this.leftItemEnough(i, needExp)) {
                    break;
                }
                needExp -= oneItemExp;
                itemUseNums[i]++;
                if (needExp <= 0) {
                    isMaxLv = true;
                    break;
                }
            }

            if (isMaxLv) {
                break;
            }
        }
        cc.log("itemUseNums", itemUseNums);

        if (changed) {
            this.levelItems.forEach((item: LevelItem, index) => {
                item.setUseNum(itemUseNums[index]);
            });
        }
    }

    changedExp(itemIndex: number) {
        //cc.log(itemIndex);
        let changedSumExp: number = 0;
        this.levelItems.forEach((item: LevelItem, index) => {
            if (index != itemIndex) {
                changedSumExp += item.changedExp;
            }
        });

        //最后一个操作的LevelItem，超过最大经验等级时，对其进行返还操作
        let operateLvItem: LevelItem = this.levelItems[itemIndex];
        if (operateLvItem) {
            changedSumExp += operateLvItem.changedExp;
            if (changedSumExp >= this.maxLvNeedExp) {
                this.disableItemIncrBtn();

                if (changedSumExp != this.maxLvNeedExp) {
                    let diffExp: number = changedSumExp - this.maxLvNeedExp;
                    let oneItemExp = operateLvItem.oneItemExp();
                    if (diffExp >= oneItemExp) {
                        let returnItemNum: number = Math.floor(diffExp / oneItemExp);
                        operateLvItem.returnItem(returnItemNum);
                        return;
                    }
                }
            } else {
                operateLvItem.enableIncrBtn();
                // this.enableItemIncrBtn();
            }
        }

        let afterChangedExp = this.staff.exp + changedSumExp;
        //cc.log("afterChangedExp=", afterChangedExp);
        this.changedUI(afterChangedExp);
    }

    private resetItemUseNum() {
        if (this.levelItems) {
            this.levelItems.forEach((item: LevelItem) => {
                item.resetUseNum();
            });
        }
    }

    private enableItemIncrBtn() {
        this.levelItems.forEach((item: LevelItem) => {
            item.enableIncrBtn();
        });
    }

    private disableItemIncrBtn() {
        this.levelItems.forEach((item: LevelItem) => {
            item.disableIncrBtn();
        });
    }


    private resetItemExpNum() {
        this.levelItems.forEach((item: LevelItem) => {
            item.resetExpNum();
        });
    }

    private leveMaxItem(isMax: boolean) {
        this.levelItems.forEach((item: LevelItem) => {
            item.setIsMax(isMax);
        });
    }

    private resetItemNum = () => {
        this.levelItems.forEach((item: LevelItem) => {
            item.resetNum();
        });
        this.judgeOneKeyState();
    };

    private changedUI(afterChangedExp: number) {
        cc.log("afterChangedExp---:" + afterChangedExp);
        if (this.onKeyAddSoftLead.active) {
            this.onKeyAddSoftLead.active = false;
            this.useSoftLead.active = true;
            this.useSoftLead.getComponent(BindingGuide).loadLabText(ArrowTextConst.USE_TEXP);
        }
        let lvUpExp = this.staff.getLevelUpExp();
        let nextExp = lvUpExp - afterChangedExp;
        let lv = this.staff.level;

        let isMaxLv: boolean = false;
        while (afterChangedExp >= lvUpExp) {
            lv++;
            afterChangedExp = afterChangedExp - lvUpExp;
            let nextLvUpExp: number = JsonMgr.getStaffLevelExp(lv);
            if (!nextLvUpExp || nextLvUpExp < 0 || lv >= this.maxLv) {
                isMaxLv = true;
                this.leveMaxItem(true);
                break;
            } else {
                lvUpExp = nextLvUpExp;
                this.leveMaxItem(false);
            }
            nextExp = lvUpExp - afterChangedExp;
        }
        let lvUpExpSe = isMaxLv ? StaffData.MAX_STRING : lvUpExp;
        let afterChangedExpSe = isMaxLv ? StaffData.MAX_STRING : afterChangedExp;
        let progress = isMaxLv ? 1 : afterChangedExp / lvUpExp;

        let changedIntel: number = this.staff.intelligence;
        let changedPower: number = this.staff.power;
        let changedPatience: number = this.staff.patience;
        let changedGlamour: number = this.staff.glamour;

        let lvUpCount: number = lv - this.staff.level;
        let isLvUp: boolean = lvUpCount > 0;
        if (isLvUp) {
            //this.addExpProgressBar.node.zIndex = this.expProgressBar.node.zIndex + 1;

            let beforInterLvAdd = Staff.calcLevelAttr(this.staff.intelligenceGrow, this.staff.level, this.staff.star);
            let otherAdd = this.staff.intelligence - beforInterLvAdd;
            changedIntel = otherAdd + Staff.calcLevelAttr(this.staff.intelligenceGrow, lv, this.staff.star);

            let beforPowerLvAdd = Staff.calcLevelAttr(this.staff.powerGrow, this.staff.level, this.staff.star);
            let otherPowerAdd = this.staff.power - beforPowerLvAdd;
            changedPower = otherPowerAdd + Staff.calcLevelAttr(this.staff.powerGrow, lv, this.staff.star);

            let beforPatienceLvAdd = Staff.calcLevelAttr(this.staff.patienceGrow, this.staff.level, this.staff.star);
            let otherPatienceAdd = this.staff.patience - beforPatienceLvAdd;
            changedPatience = otherPatienceAdd + Staff.calcLevelAttr(this.staff.patienceGrow, lv, this.staff.star);

            let beforGlamourLvAdd = Staff.calcLevelAttr(this.staff.glamourGrow, this.staff.level, this.staff.star);
            let otherGlamourAdd = this.staff.glamour - beforGlamourLvAdd;
            changedGlamour = otherGlamourAdd + Staff.calcLevelAttr(this.staff.glamourGrow, lv, this.staff.star);
        }

        let color: cc.Color = isLvUp ? changedAttrColor : attrColor;


        let expsend: IStaffExp = {
            lv: lv,
            lvUpExp: lvUpExpSe,
            afterChangedExp: afterChangedExpSe,
            progress: progress,
            isup: isLvUp
        };
        ClientEvents.UPDATE_STAFF_EXP.emit(expsend);


        //更新属性
        let arr: IStaffAttColor[] = [];
        arr.push({staffNum: Math.trunc(changedIntel), color: color});
        arr.push({staffNum: Math.trunc(changedPower), color: color});
        arr.push({staffNum: Math.trunc(changedPatience), color: color});
        arr.push({staffNum: Math.trunc(changedGlamour), color: color});
        ClientEvents.UPDATE_STAFF_ATT.emit(arr);

    }

    //复写父类closeComponent方法
    closeComponent = () => {
        if (!this.backBtn.interactable) {
            return;
        }
        UIMgr.closeView(StaffComHead.url);
        UIMgr.closeView(this.getBaseUrl());
    };

    private useLvUpItem = () => {
        this.hasClickUseBtn = true;
        if (!this.oneKeyState) {
            UIMgr.showTipText("店长快去补充道具哟");
            return;
        }
        if (this.useSoftLead.active) {
            this.useSoftLead.active = false;
        }
        if (!this.useBtn.interactable) {
            return;
        }

        if (this.staff.isMaxLevel()) {
            cc.log("员工最大等级不可升级", this.staff);
            return;
        }

        let consumes: Array<Consume> = this.collectConsumes();
        if (consumes.length <= 0) {
            //cc.log("没有消耗升级道具不可升级", consumes);
            return;
        }

        //判断那个需要播放动画
        for (let nid = 0; nid < consumes.length; nid++) {
            this.animationPlayArr.push(consumes[nid].xmlId - 100101);
        }

        cc.log("升级消耗", consumes);
        this.enableBackBtn(false);
        // let curExp = this.staff.exp;
        let curlv = this.staff.level;
        HttpInst.postData(NetConfig.lvUp, [this.staff.staffId, consumes], (response: any) => {
            if (!response.staff) {
                //cc.log("服务器没有返回变化的员工staff");
                return;
            }
            DotInst.clientSendDot(COUNTERTYPE.staff, "6001", this.staff.staffId.toString(), consumes.toString(), (response.staff.level - curlv).toString());
            this.returnResponse = response;
            this.playAnimation();
            // DataMgr.loadWarehouse(response);

        });
    };

    //升级之后更新界面
    updateLvUp(response) {
        let curExp = this.staff.exp;
        let curlv = this.staff.level;
        this.resetItemNum();

        if (response.staff.level > curlv) {
            AudioMgr.playEffect("Audio/staff/staffUp", false);
            this.staff = new Staff(this.staff);
            const newStaff: Staff = DataMgr.updateStaff(response);
            let data: lvUpSucc = {
                staff: this.staff,
                newStaff: newStaff
            }
            UIMgr.showView(LevelUpPop.url, null, data, null, false, 1100);
            // this.levelUpPop.show(this.staff, newStaff, this);
            this.init(newStaff);
            ClientEvents.RESET_STAFF_EXP.emit();
            ClientEvents.UPDATE_STAFF.emit(newStaff);
            this.enableBackBtn(true);
        } else {
            let newStaff: Staff = DataMgr.updateStaff(response);
            ClientEvents.UPDATE_STAFF.emit(newStaff);
            let addLv: number = newStaff.exp - curExp;
            UIMgr.showTipText(StringUtil.format(JsonMgr.getTips(TextTipConst.EXPENG), addLv));
            this.enableBackBtn(true);
        }

        ClientEvents.UPDATE_MAINUI_STAFF_RED.emit();
    }


    private enableBackBtn(enable: boolean) {
        this.backBtn.interactable = enable;
    }

    private collectConsumes(): Array<Consume> {
        let consumes: Array<Consume> = [];
        if (this.levelItems) {
            this.levelItems.forEach((item: LevelItem) => {
                let lvUpConsume: Consume = item.consume();
                if (lvUpConsume) {
                    consumes.push(lvUpConsume);
                }
            });
        }
        return consumes;
    }

    tipHandler() {
        UIMgr.showTextTip(TextTipConst.StaffUpTip);
    }

}
