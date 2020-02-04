import {JsonMgr} from "../../global/manager/JsonManager";
import {UIMgr} from "../../global/manager/UIManager";
import {GameComponent} from "../../core/component/GameComponent";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {topUiType} from "../MainUiTopCmpt";


const {ccclass, property} = cc._decorator;

@ccclass
export default class helpClass extends GameComponent {
    static url: string = "setting/other/help";
    @property(cc.Prefab)
    private helpItem: cc.Prefab = null;
    @property(cc.Node)
    private con: cc.Node = null;
    @property(cc.Node)
    private aniNode: cc.Node = null;

    onLoad() {
        this.initList();
    }

    start() {

    }

    protected getBaseUrl(): string {
        return helpClass.url;
    }

    onEnable(): void {
        this.onShowPlay(2, this.aniNode);
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false,topUiType.gold);
    }

    onDisable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true,-2);
    }

    initList = () => {
        let help = JsonMgr.getHelp();

        for (let i = 1; i < 20; i++) {
            if (!help[i]) {
                return;
            }
            let item = cc.instantiate(this.helpItem);
            this.con.addChild(item);
            item.getComponent("helpItem").init(help[i]);
        }
    }

    closeHandler() {
        UIMgr.closeView(helpClass.url);
    }

    // update (dt) {}
}

export interface help {
    id: number;
    question: string;
    answer: string;
}
