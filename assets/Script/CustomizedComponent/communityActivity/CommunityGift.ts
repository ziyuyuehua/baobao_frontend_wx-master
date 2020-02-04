import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {DataMgr} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {IncidentConf} from "../../Model/incident/jsonconfig/IncidentConf";
import {RankType} from "./CommunityRank";
import CommunityRankItem from "./CommunityRankItem";
import CommunityGiftAllItem from "./CommunityGiftAllItem";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";

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
export default class CommunityGift extends GameComponent {

    static url: string = "CommunityActivity/CommunityGift"

    @property(cc.Node)
    aniNode: cc.Node = null;

    @property(cc.Node)
    returnBtn: cc.Node = null;

    @property(cc.Node)
    itemLayout: cc.Node = null;

    @property(cc.Prefab)
    itemPrefab: cc.Prefab = null;

    getBaseUrl() {
        return CommunityGift.url
    }


    onEnable() {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
        this.onShowPlay(2, this.aniNode);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.ordinary);
    }

    onLoad() {
        ButtonMgr.addClick(this.returnBtn, this.closeOnly);
    }

    start() {
        let xmlid = DataMgr.activityModel.getIncitentActicityXmlId();
        let dataVo: IAssistanceRewardJson[] = JsonMgr.getIncidentRewardByActivityID(xmlid);
        this.itemLayout.removeAllChildren();
        for (let index = 0; index < dataVo.length; index++) {
            let node = cc.instantiate(this.itemPrefab);
            let item: CommunityGiftAllItem = node.getComponent(CommunityGiftAllItem);
            item.updateItem(dataVo[index]);
            this.itemLayout.addChild(node);
        }
    }

    // update (dt) {}
}
