import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import List from "../../Utils/GridScrollUtil/List";
import {JsonMgr} from "../../global/manager/JsonManager";
import ShopJiaItem from "./ShopJiaItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BoxOpenDetail extends GameComponent {

    static url: string = "shop/BoxOpenDetail";

    @property(cc.Label)
    label: cc.Label = null;

    @property(cc.ScrollView)
    private scrollNode: cc.ScrollView = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    @property(cc.Node)
    private closeBtn: cc.Node = null;

    boxId: number = 0;
    dropData = []


    // onLoad () {}

    onLoad() {
        this.boxId = this.node["data"];
        let itemVo: IItemJson = JsonMgr.getItem(this.boxId);
        this.label.string = itemVo.name + "可开出的家具一览";
        let dropID: number = Number(JsonMgr.getItem(this.boxId).uniqueValue.split(",")[0]);
        this.dropData = JsonMgr.getTreasureBoxDropArr(dropID);
        this.scrollNode.getComponent(List).numItems = Math.ceil(this.dropData.length / 3);
    }

    start() {
        ButtonMgr.addClick(this.closeBtn, () => {
            this.closeOnly();
        })
    }

    onEnable() {
        this.onShowPlay(2, this.aniNode);
    }

    protected getBaseUrl(): string {
        return BoxOpenDetail.url;
    }

    onListVRender(item: cc.Node, idx: number) {
        let shopItem: ShopJiaItem = item.getComponent(ShopJiaItem);
        let dropIds: number[] = [];
        let maxNum: number = idx * 3 + 3;
        if (maxNum > this.dropData.length) {
            maxNum = this.dropData.length;
        }
        for (let nid = idx * 3; nid < maxNum; nid++) {
            dropIds.push(this.dropData[nid]);
        }
        shopItem.updateDecItem(dropIds);
    }

}
