import {GameComponent} from "../../core/component/GameComponent";
import {JsonManager, JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {DataMgr} from "../../Model/DataManager";
import {ButtonMgr} from "../common/ButtonClick";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {UIMgr} from "../../global/manager/UIManager";
import SpecialDesc from "../DetailTip/SpecialDesc";

const {ccclass, property} = cc._decorator;
@ccclass
export default class treasureItemDetail extends GameComponent {
    static url: string = "treasureChest/treasureItemDetail";
    @property(cc.Node)
    aniNode: cc.Node = null;
    @property(cc.Node)
    tips: cc.Node = null;
    @property(cc.Label)
    nameLab: cc.Label = null;
    @property(cc.Label)
    desLab: cc.Label = null;
    @property(cc.Sprite)
    colorIcon: cc.Sprite = null;
    @property(cc.Sprite)
    itemIcon: cc.Sprite = null;
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    chooseBtn: cc.Node = null;
    @property(cc.Node)
    unChooseBtn: cc.Node = null;
    @property(cc.Label)
    renqiLab: cc.Label = null;
    @property(cc.Prefab)
    specialLabel: cc.Prefab = null;
    private curId: number = 0;
    private curIndex: number = 0;
    private specialXmlData: IDecoEffectJson = null;

    onEnable() {
        this.onShowPlay(2, this.aniNode);
    }

    start() {
        this.curId = this.node["data"].id;
        this.curIndex = this.node["data"].index;
        let curJson = JsonMgr.getInformationAndItem(this.curId);
        this.nameLab.string = curJson.name;
        this.desLab.string = curJson.description;
        let color = curJson.color ? curJson.color : curJson.star;
        ResMgr.getItemBox(this.colorIcon, "k" + color);
        ResMgr.imgTypeJudgment(this.itemIcon, curJson.id);
        if (JsonManager.isCase(this.curId)) {
            // if (curJson.Popularity > 0) {
            //     this.renqiLab.node.active = true;
            //     this.renqiLab.node.getChildByName("numLab").getComponent(cc.Label).string = "+" + curJson.Popularity;
            // }
            this.specialXmlData = JsonMgr.getDecoEffect(this.curId);
            if (this.specialXmlData) {
                this.tips.height = 561;
                this.specialInit();
            }
        }
        this.addClickEvent();
        this.chooseBtn.active = !(DataMgr.getSelIdxArr().indexOf(this.curIndex) >= 0);
        this.unChooseBtn.active = DataMgr.getSelIdxArr().indexOf(this.curIndex) >= 0;
    }

    specialInit() {
        let descArr = this.specialXmlData.decoDecs.split(";");
        let len = descArr.length;
        descArr.forEach((value, key) => {
            let node = cc.instantiate(this.specialLabel);
            this.tips.addChild(node);
            node.getComponent(SpecialDesc).init(value, len, key, cc.v2(10, -395), [cc.v2(10, -369), cc.v2(10, -418)]);
        });
    }


    addClickEvent() {
        ButtonMgr.addClick(this.closeBtn, () => {
            this.closeOnly();
        });
        ButtonMgr.addClick(this.chooseBtn, () => {
            if (DataMgr.getSelIdxArr().length >= DataMgr.getSelMaxNum()) {
                UIMgr.showTipText("选择数量达到上限!");
            } else {
                this.closeOnly();
                DataMgr.setSelIdxArr(this.curIndex);
                ClientEvents.CHOOSE_THIS_AWARD.emit();
            }
        });
        ButtonMgr.addClick(this.unChooseBtn, () => {
            this.closeOnly();
            DataMgr.setSelIdxArr(this.curIndex);
            ClientEvents.CHOOSE_THIS_AWARD.emit();
        });
    }

    protected getBaseUrl(): string {
        return treasureItemDetail.url;
    }

}
