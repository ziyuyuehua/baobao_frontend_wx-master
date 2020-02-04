import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../../CustomizedComponent/common/ButtonClick";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr} from "../../global/manager/JsonManager";
import {DataMgr} from "../../Model/DataManager";
import {IItem} from "../../types/Response";
import List from "../../Utils/GridScrollUtil/List";
import FilterItem from "./FilterItem";
import ItemHouseItem from "./ItemHouseItem";
import {topUiType} from "../MainUiTopCmpt";
import {COUNTERTYPE, DotInst} from "../common/dotClient";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class ItemHouse extends GameComponent {
    static url = "warehouse/items/ItemHouse";

    @property(List)
    private scrollNode: List = null;

    @property(cc.Node)
    private returnBtn: cc.Node = null;

    @property(cc.Node)
    private filterBtn: cc.Node = null;

    @property(cc.Label)
    private curFilterLab: cc.Label = null;

    @property(cc.Node)
    private filterNode: cc.Node = null;

    @property(cc.Node)
    private filterBg: cc.Node = null;

    @property(cc.Prefab)
    private filterPrefab: cc.Prefab = null;

    @property(cc.Node)
    private noItem: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;

    private ItemArr: IItem[] = [];
    private curChoseType = -1;

    getBaseUrl() {
        return ItemHouse.url;
    }

    start() {
        ButtonMgr.addClick(this.returnBtn, this.closeView);
        ButtonMgr.addClick(this.filterBtn, this.filterHandler);
        ButtonMgr.addClick(this.filterBg, this.closeFilterHandler);
        this.dispose.add(ClientEvents.CHOSE_FILITER_VIEW.on(this.choseItemType));
        this.dispose.add(ClientEvents.UPDATE_ITEM_HOUSE.on(() => {
            this.updateItemArr();
        }));
        this.updateItemArr();
        this.addFilterItem();
        this.setFilterState(false);
    }

    onEnable() {
        this.onShowPlay(1, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, -1);
    }

    choseItemType = (itemType: IItemTypeJson) => {
        this.setFilterState(false);
        this.curChoseType = itemType.id;
        this.curFilterLab.string = itemType.name;
        this.updateItemArr();
        DotInst.clientSendDot(COUNTERTYPE.bag, "10401",itemType.id + ""); //筛选打点
    }

    updateItemArr() {
        this.ItemArr = [];
        if (this.curChoseType == -1) {
            this.ItemArr = DataMgr.warehouseData.getAllItemDataArr();
        } else {
            let BagArr = DataMgr.warehouseData.getAllItemDataArr();
            for (let nid = 0; nid < BagArr.length; nid++) {
                let itemJson: IItemJson = JsonMgr.getItem(BagArr[nid].id);
                if (itemJson.bagType == this.curChoseType) {
                    this.ItemArr.push(BagArr[nid]);
                }
            }
        }
        if (this.ItemArr.length == 0) {
            this.noItem.active = true;
        } else if (this.ItemArr.length != 0) {
            this.noItem.active = false;
        }
        this.scrollNode.numItems = this.ItemArr.length;
        //this.scrollNode.scrollTo(0);
    }


    setFilterState(state) {
        this.filterBg.active = state;
        this.filterNode.active = state;
    }

    addFilterItem() {
        let ItemTypeArr = JsonMgr.getItemTypeJson();
        ItemTypeArr.unshift({id: -1, name: "全部"});
        for (let nid = 0; nid < ItemTypeArr.length; nid++) {
            let node = cc.instantiate(this.filterPrefab);
            let filiterItem: FilterItem = node.getComponent(FilterItem);
            filiterItem.updateItem(ItemTypeArr[nid]);
            this.filterNode.addChild(node);
        }
    }

    onListVRender(item: cc.Node, idx: number) {
        let popularityItem: ItemHouseItem = item.getComponent(ItemHouseItem);
        let itemVo: IItem = this.ItemArr[idx];
        popularityItem.updateItem(itemVo);
    }

    filterHandler = () => {
        this.setFilterState(true);
    }

    closeFilterHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.bag,"10412"); //背包返回打点
        this.setFilterState(false);
    }

    // update (dt) {}
}
