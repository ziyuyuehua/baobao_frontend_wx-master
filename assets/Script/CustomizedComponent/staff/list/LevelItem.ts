import {JsonMgr} from "../../../global/manager/JsonManager";
import {ResMgr} from "../../../global/manager/ResManager";
import {UIMgr} from "../../../global/manager/UIManager";
import {Consume, DataMgr} from "../../../Model/DataManager";
import {UIUtil} from "../../../Utils/UIUtil";
import {LevelPanel} from "./LevelPanel";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";

const {ccclass, property} = cc._decorator;

@ccclass
export class LevelItem extends cc.Component {

    @property(cc.Sprite)
    itemBg: cc.Sprite = null;
    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;
    @property(cc.Label)
    itemNameLabel: cc.Label = null;

    @property(cc.Label)
    useNumLabel: cc.Label = null;
    @property(cc.Label)
    totalNumLabel: cc.Label = null;

    @property(cc.Slider)
    itemSlider: cc.Slider = null;
    @property(cc.ProgressBar)
    itemProgressBar: cc.ProgressBar = null;
    @property(cc.Button)
    decrBtn: cc.Button = null;
    @property(cc.Button)
    incrBtn: cc.Button = null;
    // @property(cc.Button)
    // incrBtnIn: cc.Button = null;


    private levelPanel: LevelPanel = null;
    private item: IItemJson = null;
    private index: number = -1;

    private useNum: number = 0;
    private totalNum: number = 0;
    private isMax: boolean = false;

    changedExp: number = 0; //使用此道具增加的经验

    //是否超出界限被禁用
    private disable: boolean = false;

    private animationId: number = 0;


    onLoad() {
        this.itemSlider.progress = 0;

        this.itemSlider.node.on("slide", this.calExp);
        this.decrBtn.node.on(cc.Node.EventType.TOUCH_END, this.decrExp);
        this.incrBtn.node.on(cc.Node.EventType.TOUCH_END, this.incrExp);
    }

    init(levelPanel: LevelPanel, itemId: number, index: number) {
        this.levelPanel = levelPanel;
        this.item = JsonMgr.getItem(itemId);
        this.index = index;

        ResMgr.getItemBox(this.itemBg, "k" + this.item.color, 1);
        this.itemBg.node.on(cc.Node.EventType.TOUCH_END, () => {
            UIMgr.loadaccessPathList(itemId);
        });

        //image = ResMgr.getAtlasRes(RES_PATH, this.item.icon);
        ResMgr.getItemIcon(this.itemIcon, this.item.icon, 0.6);
        UIUtil.setLabel(this.itemNameLabel, this.item.name);

        this.resetNum();
    }

    resetNum() {
        this.resetTotalNum();
        this.resetUseNum();
    }

    resetTotalNum() {
        this.totalNum = this.getItemNum();
        UIUtil.setLabel(this.totalNumLabel, this.totalNum);
    }

    setUseNum(useNum: number) {
        this.useNum = useNum;
        this.useNumChanged();
    }

    setIsMax(isMax: boolean) {
        this.isMax = isMax;
    }

    resetUseNum() {
        this.useNum = 0;
        this.useNumChanged(true);
    }

    getItemNum(): number {
        return DataMgr.getItemNum(this.item.id);
    }

    oneItemExp(): number {
        return this.item.value;
    }

    getAllExp(): number {
        return this.getItemNum() * this.oneItemExp();
    }

    calExp = (expSlider) => {
        let curUseNum = Math.floor(this.totalNum * expSlider.progress);

        this.useNum = curUseNum < this.useNum ? curUseNum : (this.disable ? this.useNum : curUseNum);
        this.useNumChanged();
        this.decrBtn.node.active = true;
        if (this.useNum >= this.totalNum) {
            // UIMgr.showTipText("没有道具了哟，去补充吧");
        }
        if (this.useNum <= 0) {
            this.decrBtn.node.active = false;
        }
    };

    decrExp = (incrBtn) => {
        this.doDecrExp(1);
    };

    doDecrExp(num: number) {
        if (this.useNum <= 0) {
            return;
        }
        this.useNum = Math.max(0, this.useNum - num);
        this.useNumChanged();
    }

    incrExp = (decrBtn) => {
        cc.log("等级1");
        cc.log("ismax:" + this.isMax);
        if (this.disable && this.totalNum > 0 && this.isMax) {
            UIMgr.showTipText("等级满啦！换个人吧");
        }
        if (this.disable && this.totalNum > 0 && !this.isMax) {
            UIMgr.showTipText("只有这么多道具了，快去补充一下");
        }
        if (this.useNum >= this.totalNum) {
            if (this.useNum > 0) {
            } else {
                DotInst.clientSendDot(COUNTERTYPE.staff, "6025", this.item.id.toString());
                UIMgr.loadaccessPathList(this.item.id);
            }
            return;
        }
        this.useNum++;
        this.useNumChanged();
    };

    setIncrbtnState() {
        if (this.useNum >= this.totalNum) {
            this.disableIncrBtn();
        }
    }

    private useNumChanged(isReset: boolean = false) {
        if (!this.decrBtn.node.active) {
            this.decrBtn.node.active = true;
        }
        if (this.useNum <= 0) {
            this.decrBtn.node.active = false;
        }

        //useNum使用数量
        //totalNum总数
        UIUtil.setLabel(this.useNumLabel, this.useNum);
        if (this.totalNum <= 0) {
            this.itemProgressBar.progress = 0;
            this.itemSlider.progress = 0;
        } else {
            this.itemProgressBar.progress = this.useNum / this.totalNum;
            this.itemSlider.progress = this.useNum / this.totalNum;
        }

        this.changedExp = this.useNum * this.item.value;
        if (!isReset) {
            this.levelPanel.changedExp(this.index);
        }

        this.setIncrbtnState();

        this.levelPanel.checkUseBtnActiveByConsumes();
    }

    returnItem(returnNum: number) {
        this.doDecrExp(returnNum);
    }

    enableIncrBtn() {
        this.disable = false;
        if (!this.incrBtn.node.active) {
            this.incrBtn.node.active = true;
        }
    }

    resetExpNum() {
        this.changedExp = 0;
    }

    disableIncrBtn() {
        this.disable = true;
        // cc.log("useNum:" + this.useNum);
        // cc.log("totalNum:" + this.totalNum);
        // if (this.useNum == this.totalNum && this.useNum > 0 && this.totalNum > 0&&!this.isMax) {
        //     UIMgr.showTipText("只有这么多道具了，快去补充一下");
        // }
    }

    consume(): Consume {
        if (this.useNum <= 0) {
            return null;
        }
        return new Consume({xmlId: this.item.id, number: this.useNum});
    }

}
