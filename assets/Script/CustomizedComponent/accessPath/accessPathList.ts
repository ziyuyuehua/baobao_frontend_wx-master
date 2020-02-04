import {JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import AccessPathItem from "./accessPathItem";
import {ButtonMgr} from "../common/ButtonClick";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {GameComponent} from "../../core/component/GameComponent";
import {TextTipConst} from "../../global/const/TextTipConst";


const {ccclass, property} = cc._decorator;

@ccclass
export default class AccessPathList extends GameComponent {
    static url: string = "accessPath/accessPathList";

    @property(cc.Sprite)
    private itemSprite: cc.Sprite = null;
    @property(cc.Label)
    private itemName: cc.Label = null;
    @property(cc.Label)
    private itemDescribe: cc.Label = null;
    @property(cc.Node)
    private content: cc.Node = null;
    @property(cc.Node)
    private list: cc.Node = null;
    @property(cc.Sprite)
    private iconFrame: cc.Sprite = null;
    @property(cc.Prefab)
    private accessPathItem: cc.Prefab = null;
    @property(cc.ScrollView)
    private pathScroll: cc.ScrollView = null;

    @property(cc.Node)
    private closeNode: cc.Node = null;
    private data = null;

    // onLoad () {}
    start() {
        this.data = this.node["data"];
        this.loadAccessList();
    }


    loadAccessList = () => {
        ButtonMgr.addClick(this.closeNode, this.onGbBtn)
        let json = null;
        let source: string = "";
        if (this.data.isItem) {
            json = JsonMgr.getItemMod(this.data.xmlId);
            source = json.source;
            ResMgr.getItemIconSF(this.itemSprite, json.icon);
        } else {
            if (this.data.xmlId < 0) {
                json = JsonMgr.getInforMationJson(this.data.xmlId);
                source = json.sourceId;
            } else {
                json = JsonMgr.getItem(this.data.xmlId);
                source = json.source;
            }
            if (!source || source === "") {
                UIMgr.showTipText("没有配置来源");
                return
            }
            ResMgr.imgTypeJudgment(this.itemSprite, this.data.xmlId);
        }
        this.loadItem(source, json);
        this.itemName.string = json.name;
        ResMgr.getItemBox(this.iconFrame, "k" + json.color, 1);
        this.itemDescribe.string = json.description;

        if (!json.source) {
            UIMgr.showTipText(TextTipConst.NOSOURCE);
        }
    }


    getBaseUrl(): string {
        return AccessPathList.url;
    }

    loadItem = (source: string, itemJson: any) => {
        let sourcere = source.toString();
        let arr = sourcere.split(",");
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr.length - 1 - i; j++) {
                let aTemp = JsonMgr.getSource(parseInt(arr[j]));
                let bTemp = JsonMgr.getSource(parseInt(arr[j + 1]));
                let temp: string = "";
                if (aTemp.lockId != -1 && bTemp.lockId == -1) {
                    temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                } else if (aTemp.lockId != -1 && bTemp.lockId != -1) {
                    let temp1: string = "";
                    if (!JsonMgr.isFunctionOpen(aTemp.lockId) && JsonMgr.isFunctionOpen(bTemp.lockId)) {
                        temp1 = arr[j];
                        arr[j] = arr[j + 1];
                        arr[j + 1] = temp1;
                    }
                }
            }
        }
        arr.sort((a, b) => {
            let aTemp = JsonMgr.getSource(parseInt(a));
            let lockLevel: number = -1;
            if (aTemp.lockId === -1 && aTemp.type === 11) {
                lockLevel = JsonMgr.getShopJsonByComId(itemJson.id).unclockLevel;
            }
            if (DataMgr.iMarket.getTrueExpandTime() >= lockLevel && aTemp.lockId == -1) return -1;
        });
        let size = arr.length;
        let contentNode = null;
        if (size <= 3) {
            contentNode = this.list;
        } else {
            contentNode = this.content;
        }
        this.pathScroll.node.active = size > 3;
        this.list.active = size <= 3;
        for (let i = 0; i < size; i++) {
            let json = JsonMgr.getSource(parseInt(arr[i]));
            let node = cc.instantiate(this.accessPathItem);
            node.getComponent(AccessPathItem).load(json, itemJson, this.node);
            contentNode.addChild(node);
        }
    };

    onGbBtn = () => {
        DotInst.clientSendDot(COUNTERTYPE.assistant, "6302");
        this.closeOnly();
    }

    // update (dt) {}
}
