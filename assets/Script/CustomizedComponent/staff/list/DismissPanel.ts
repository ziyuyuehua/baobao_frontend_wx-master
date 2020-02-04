import {DismissItem} from "./DismissItem";
import {Staff, StaffData} from "../../../Model/StaffData";
import {HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import {ItemPrefab} from "./ItemPrefab";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {CommonUtil, Reward} from "../../../Utils/CommonUtil";
import {JsonMgr} from "../../../global/manager/JsonManager";
import {UIUtil} from "../../../Utils/UIUtil";
import {DataMgr} from "../../../Model/DataManager";
import {GameComponent} from "../../../core/component/GameComponent";
import {ButtonMgr} from "../../common/ButtonClick";
import {IRespData} from "../../../types/Response";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";

const { ccclass, property } = cc._decorator;

@ccclass
export class DismissPanel extends GameComponent {

    static url = "staff/list/DismissPanel";

    @property(cc.ScrollView)
    private dismissStaffs: cc.ScrollView = null;

    @property(cc.Prefab)
    private dismissItem: cc.Prefab = null;

    @property(cc.Prefab)
    private dismissItemPre: cc.Prefab = null;

    @property(cc.ScrollView)
    private returnGifts: cc.ScrollView = null;

    @property(cc.Node)
    private cancelNode: cc.Node = null;

    @property(cc.Button)
    private confirmBtn: cc.Button = null;

    @property(cc.Node)
    private blockPanel: cc.Node = null;

    @property(cc.Toggle)
    private checkToggle: cc.Toggle = null;

    getBaseUrl(){
        return DismissPanel.url;
    }

    onLoad() {
        ButtonMgr.addClick(this.blockPanel, this.closeOnly);
        ButtonMgr.addClick(this.cancelNode, this.closeOnly);
        ButtonMgr.addClick(this.confirmBtn.node, this.confirmDismiss);
        ButtonMgr.addToggle(this.checkToggle, this.onCheckToggle);
    }

    //TODO 涉及到频繁的cc.instantiate创建节点，之后要改成NodePool复用
    onEnable() {
        this.onShowPlay(2, this.node.getChildByName("view"));
        UIUtil.cleanScrollView(this.dismissStaffs);

        let staffData: StaffData = DataMgr.staffData;
        const selectStaffIds: Set<number> = staffData.getSelectStaffs();
        let hasFiveStar: boolean = false;
        let prefabWidth = this.dismissItem.data.width;
        let prefabHeight = this.dismissItem.data.height;

        let staff: Staff = null;
        let item: DismissItem = null;
        let allRewards: Array<Reward> = [];

        const column: number = 4;
        const spacingY: number = 10;
        this.dismissStaffs.content.height = (Math.trunc((selectStaffIds.size - 1) / column)) * (prefabHeight+spacingY) + prefabHeight;
        //cc.log("height=", this.dismissStaffs.content.height);
        Array.from(selectStaffIds).forEach((staffId: number) => {
            //cc.log(staffId, index);
            staff = staffData.getStaff(staffId);
            if (!hasFiveStar && staff.isStar(5)) {
                hasFiveStar = true;
            }

            item = cc.instantiate(this.dismissItem).getComponent(DismissItem);
            item.init(staff);

            this.collectRewards(staff, allRewards);

            //item.node.setScale(1, 1);
            //item.node.x = (index % column) * prefabWidth + prefabWidth / 2;
            //item.node.y = -(Math.trunc(index / column) * prefabHeight + prefabHeight / 2);
            //cc.log(item.node.position);

            this.dismissStaffs.content.addChild(item.node);
        });
        allRewards = CommonUtil.mergeRewards(allRewards);

        UIUtil.cleanScrollView(this.returnGifts);
        prefabWidth = this.dismissItemPre.data.width;
        this.returnGifts.content.width = allRewards.length * prefabWidth;
        allRewards.forEach((reward: Reward, index) => {
            let item: ItemPrefab = cc.instantiate(this.dismissItemPre).getComponent(ItemPrefab);
            let itemData = JsonMgr.getItem(reward.xmlId);
            item.init(itemData, reward.number);

            item.node.setScale(0.85, 0.85);
            item.node.x = index * prefabWidth + prefabWidth / 2;

            this.returnGifts.content.addChild(item.node);
        });

        this.checkToggle.isChecked = false;
        UIUtil.visible(this.checkToggle, hasFiveStar);
        this.confirmBtn.interactable = !hasFiveStar;
    }

    private collectRewards(staff: Staff, allRewards: Array<Reward>){
        let staffRandomConfig = JsonMgr.getStaffRandom(staff.xmlId);
        if(staffRandomConfig){
            staffRandomConfig.getLeaveRewards().forEach((reward: Reward) => {
                allRewards.push(reward);
            });

            if(staff.isMaxLevel()){
                let maxRewards: Array<Reward> = staffRandomConfig.getLeaveMaxRewards();
                maxRewards.forEach((reward: Reward) => {
                    allRewards.push(reward);
                });
            }
        }

        let staffLevelConfig = JsonMgr.getStaffLevelConfig(staff.level);
        if(staffLevelConfig && staffLevelConfig.leave && staffLevelConfig.leave.length > 0){
            CommonUtil.toRewards(staffLevelConfig.leave).forEach((reward: Reward) => {
                allRewards.push(reward);
            });
        }
    }

    private confirmDismiss = () => {
        if (!this.confirmBtn.interactable) {
            return;
        }

        let selectStaffs: Set<number> = DataMgr.staffData.getSelectStaffs();
        let selectStaffArray: Array<number> = Array.from(selectStaffs);
        cc.log("confirmDismiss", selectStaffArray);
        DotInst.clientSendDot(COUNTERTYPE.staff, "6005", selectStaffArray.toString());
        HttpInst.postData(NetConfig.dismissStaff,
            [selectStaffArray], (response: IRespData) => {
                this.closeView();
                ClientEvents.STAFF_DISMISS_CONFIRM.emit();
            });
    };

    private onCheckToggle = (toggle: cc.Toggle) => {
        this.confirmBtn.interactable = toggle.isChecked;
    };

}
