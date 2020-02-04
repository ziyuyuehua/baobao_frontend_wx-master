import {GameComponent} from "../../core/component/GameComponent";
import {ResMgr} from "../../global/manager/ResManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import property = cc._decorator.property;

const {ccclass} = cc._decorator;
@ccclass
export default class treasureChest extends GameComponent {
    static url: string = "treasureChest/treasureChest";
    @property(cc.Node)
    treasureBox: cc.Node = null;
    @property(cc.Node)
    treasureBox1: cc.Node = null;
    @property(cc.Node)
    BoxNode: cc.Node = null;
    @property(cc.Animation)
    openAni: cc.Animation = null;
    @property([cc.Animation])
    boomAni: cc.Animation[] = [];
    @property([cc.Node])
    Items: cc.Node[] = [];
    @property(cc.Node)
    closeBtn: cc.Node = null;
    @property(cc.Node)
    crossAni: cc.Node = null;
    @property(cc.Node)
    nextPage: cc.Node = null;
    @property(cc.Label)
    pageLab: cc.Label = null;
    @property(cc.Label)
    pageDes: cc.Label = null;
    @property(cc.Node)
    caiSprite: cc.Node = null;
    @property(cc.Node)
    huangSprite: cc.Node = null;

    private awards = [];
    private boxId: number = 0;
    private boxIndex: number = 0;
    private itemIndex: number = 0;
    private boxStartY: number = 0;
    private isUniDec: boolean = false;   //五星以上家具
    private posArr: cc.Vec2[] = [cc.v2(-220, 280), cc.v2(7, 280), cc.v2(223, 280), cc.v2(-108, -6), cc.v2(124, -6)];

    onLoad() {
        this.boxId = this.node["data"].boxId;
        let itemJson: IItemJson = JsonMgr.getItem(this.boxId);
        this.isUniDec = itemJson.color == 6;
        this.awards = this.node["data"].awards;
        ButtonMgr.addClick(this.closeBtn, () => {
            this.closeOnly();
        });
        ButtonMgr.addClick(this.nextPage, () => {
            this.nextPageHandler();
        });
        ButtonMgr.addClick(this.crossAni, () => {
            this.crossAnimation();
        })
    }

    start() {
        this.itemIndex = 0;
        for (let item of this.Items) {
            item.active = false;
        }
        let boxJson = JsonMgr.getItem(this.boxId);
        ResMgr.getTreasureIcon(this.treasureBox.getComponent(cc.Sprite), boxJson.icon, 2);
        //this.boxStartY = this.boxStartY;
        let action = cc.sequence(
            cc.spawn(cc.moveTo(0.2, this.BoxNode.x, this.BoxNode.y + 260), cc.scaleTo(0.3, 1.2)),
            cc.moveTo(0.1, this.BoxNode.x, this.BoxNode.y + 240),
            cc.moveTo(0.1, this.BoxNode.x, this.BoxNode.y + 260),
            cc.callFunc(() => {
                ResMgr.getTreasureOpenIcon(this.treasureBox1.getComponent(cc.Sprite), boxJson.icon, 2, () => {
                    this.openAni.play();
                    this.treasureBox.active = false;
                    this.caiSprite.active = this.isUniDec;
                    this.huangSprite.active = !this.isUniDec;
                    ResMgr.getTreasureOpenIcon(this.treasureBox1.getComponent(cc.Sprite), boxJson.icon, 2, null);
                });
            })
        );
        this.BoxNode.runAction(action);
        this.pageLab.string = DataMgr.getNowBoxIndex() + "/" + DataMgr.getOpenBoxNum();
        this.pageDes.string = "开到第" + DataMgr.getNowBoxIndex() + "个宝箱";
        if (DataMgr.getNowBoxIndex() == DataMgr.getOpenBoxNum()) {
            this.closeBtn.active = true;
        }
        this.boxStartY = 0;
        this.openAni.on("stop", () => {
            this.openAni.node.active = false;
            this.treasureBox1.active = true;
            let action = cc.sequence(
                cc.scaleTo(0.4, 1.2),
                cc.spawn(
                    cc.moveTo(0.3, this.BoxNode.x, this.BoxNode.y - 260),
                    cc.scaleTo(0.3, 0.8)),
                cc.moveTo(0.1, this.BoxNode.x, this.BoxNode.y - 240),
                cc.moveTo(0.1, this.BoxNode.x, this.BoxNode.y - 260),
                cc.callFunc(() => {
                    this.lightFly();
                }));
            this.BoxNode.runAction(action);
        })
        if (this.awards.length > 1 && this.boxIndex < this.awards.length - 1) {
            this.nextPage.active = true;
        } else {
            this.nextPage.active = false;
        }
    }

    setAwardItem(data, index) {
        let item = this.Items[index];
        let itemData = JsonMgr.getDecoShopJson(data[index].xmlId);
        item.getChildByName("furnitureName").getComponent(cc.Label).string = itemData.name;
        ResMgr.imgTypeJudgment(item.getChildByName("furnitureIcon").getComponent(cc.Sprite), itemData.id);
        ResMgr.getTreasureBox(item.getChildByName("frame").getComponent(cc.Sprite), itemData.color);
        if (itemData.color >= 5) {
            item.getChildByName("rotateAni").getComponent(cc.Animation).play();
        }
        for (let i = 1; i <= itemData.color; i++) {
            if (i == 6) {
                return;
            }
            item.getChildByName("stars").getChildByName("starIcon" + i).active = true;
        }
    }

    lightFly() {
        if (this.itemIndex > 4) {
            this.BoxNode.getChildByName("rotateAni").getComponent(cc.Animation).play();
            return;
        }
        this.boomAni[this.itemIndex].node.active = true;
        this.boomAni[this.itemIndex].play();
        this.boomAni[this.itemIndex].on("stop", () => {
            this.boomAni[this.itemIndex].node.active = false;
            this.Items[this.itemIndex].active = true;
            let action1 = cc.sequence(
                cc.spawn(
                    cc.moveTo(0.5, this.posArr[this.itemIndex].x, this.posArr[this.itemIndex].y + 30),
                    cc.scaleTo(0.5, 1), cc.rotateTo(0.5, 0)),
                cc.moveTo(0.2, this.posArr[this.itemIndex].x, this.posArr[this.itemIndex].y));
            this.Items[this.itemIndex].runAction(action1);
            this.setAwardItem(this.awards[this.boxIndex], this.itemIndex);
            this.itemIndex++;
            this.lightFly();
        });
        if (this.awards.length > 1 && this.boxIndex < this.awards.length - 1) {
            this.nextPage.active = true;
        } else {
            this.nextPage.active = false;
        }
    }

    nextPageHandler = () => {
        this.closeOnly();
        let awards = [];
        for (let nid in this.awards) {
            if (Number(nid) > 0) {
                awards.push(this.awards[nid]);
            }
        }
        DataMgr.setNowBoxIndex(DataMgr.getNowBoxIndex() + 1);
        UIMgr.showView(treasureChest.url, null, {boxId: this.boxId, awards: awards});
    };

    protected getBaseUrl(): string {
        return treasureChest.url;
    }

    //跳过动画
    crossAnimation = () => {
        this.closeOnly();
        UIMgr.loadCommonGiftView(DataMgr.getOpenBoxAward(), [], "missionService.receiveAward");
    }

}

