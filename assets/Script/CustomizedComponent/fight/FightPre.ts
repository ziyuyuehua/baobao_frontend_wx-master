import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {GameComponent} from "../../core/component/GameComponent";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {JsonMgr, ShopBattleConfig, ShopBattleCustomerInforConfig} from "../../global/manager/JsonManager";
import {UIUtil} from "../../Utils/UIUtil";
import {COUNTERTYPE, DotInst, DotVo} from "../common/dotClient";
import FriendsList from "../friendsList/friendsList";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import {ChoiceShopPanel} from "./ChoiceShopPanel";
import {item1} from "./item1";
import {item2} from "./item2";
import {item3} from "./item3";
import {ButtonMgr} from "../common/ButtonClick";
import {CacheMap} from "../MapShow/CacheMapDataManager";
import {DataMgr} from "../../Model/DataManager";
import {UIMgr} from "../../global/manager/UIManager";
import {TextTipConst} from "../../global/const/TextTipConst";

@ccclass()
export class FightPre extends GameComponent {
    static url: string = "Prefab/fight/FightPre";
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Node)
    scrContent: cc.Node = null;
    @property(cc.Node)
    bg: cc.Node = null;
    @property(sp.Skeleton)
    yunSke: sp.Skeleton = null;
    @property(sp.Skeleton)
    yunSke2: sp.Skeleton = null;
    @property(sp.Skeleton)
    yunSke3: sp.Skeleton = null;

    @property(cc.Node)
    startNode: cc.Node = null;
    @property(cc.Node)
    closeNode: cc.Node = null;

    private fightServerData: any = null;//关卡界面数据
    private fightConfig: ShopBattleConfig;//对决总数据
    private battleCustomerConfig: ShopBattleCustomerInforConfig[];//对局关卡模版数据

    private itemArr: cc.Node[] = [];

    private isFight: boolean = false;

    load() {
        this.isFight = false;
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(false);
        this.addEvent(ClientEvents.START_FIGHT.on(this.fightHandler.bind(this)));
        UIMgr.hideMap();

        ButtonMgr.addClick(this.startNode, this.startHandler);
        ButtonMgr.addClick(this.closeNode, this.closeHandler.bind(this));
    }
    onEnable() {
        this.onShowPlay(1, this.bg);
    }
    getBaseUrl() {
        return FightPre.url;
    }
    start() {
        this.scrollView.scrollToTop(0.1);
    }

    initFightData(data: any) {
        this.fightServerData = data;
        this.fightConfig = JsonMgr.getShopBattleConfig(this.fightServerData.stage);
        this.battleCustomerConfig = JsonMgr.getShopBattleCustomerInforConfig(this.fightConfig.informationId);
        this.createItem();
    }

    createItem() {
        if (this.itemArr.length == this.battleCustomerConfig.length) {//是否播完
        } else {
            let battleInfo: ShopBattleCustomerInforConfig = this.battleCustomerConfig[this.itemArr.length];
            UIUtil.dynamicLoadPrefab("Prefab/fight/" + this.choiceItem(battleInfo.chatType), (prefab: cc.Node) => {
                if(!this.itemArr) return;
                let item: cc.Node = prefab;
                item.parent = this.scrContent;
                this.itemArr.push(item);
                this.scrContent.height += item.height + 20;
                if (this.choiceItem(battleInfo.chatType) == "item1" || this.choiceItem(battleInfo.chatType) == "item1") {
                    let component1: item1 = item.getComponent(item.name);
                    component1.initData(battleInfo, this.fightConfig, this.fightServerData.first, this.createItem.bind(this));
                } else if (this.choiceItem(battleInfo.chatType) == "item3") {
                    let component3: item3 = item.getComponent(item.name);
                    component3.initData(battleInfo, this.fightConfig, this.fightServerData.first, this.createItem.bind(this));
                } else if (this.choiceItem(battleInfo.chatType) == "item2") {
                    let component2: item2 = item.getComponent(item.name);
                    component2.initData(battleInfo, this.fightConfig, this.fightServerData.first, this.createItem.bind(this));
                }
                if (this.fightServerData.first) {
                    this.scrollView.scrollToBottom(0.1);
                }
            });
        }
    }

    choiceItem(type: number): string {
        let name: string = '';
        switch (type) {
            case 1:
            case 2:
                name = "item1";
                break;
            case 3:
                name = "item3";
                break;
            case 4:
                name = "item2";
                break;
        }
        return name;
    }
    fightHandler() {
        let moveBg = cc.moveBy(0.5, cc.v2(0, -1600));
        moveBg.easing(cc.easeBackIn());
        this.bg.runAction(cc.sequence(moveBg, cc.callFunc(() => {
            let Dot: DotVo = {
                COUNTER: COUNTERTYPE.FIGHT,
                PHYLUM: "13001",
                CLASSFIELD: this.fightServerData.stage + ""
            };
            DotInst.sendDot(Dot);

            // UIMgr.showMap();
            this.isFight = true;
            HttpInst.postData(NetConfig.MARKET_BATTLE,
                [DataMgr.fightViewData.shopSelect], (response) => {
                    UIMgr.deleteView(FriendsList.url);
                    DataMgr.fillFightData(response);
                    this.yunSke.setAnimation(0, "xuanwo1", false);
                    this.yunSke.setCompleteListener(() => {
                        this.yunSke.node.active = false;
                        this.yunSke2.animation = "xuanwo2";
                        this.scheduleOnce(() => {
                            cc.director.preloadScene("fightScene", (completedCount: number, totalCount: number, item: any) => {
                                let pro = completedCount / totalCount;
                            }, (error: Error) => {
                                if (error) {
                                    cc.log(error);
                                    return;
                                }
                                CacheMap.recoverFutures();
                                MapMgr.clearData();
                                DataMgr.setClickTaskJumpMap(0);
                                this.yunSke3.setAnimation(0, "xuanwo3", false);
                                this.yunSke3.setCompleteListener(() => {
                                    this.yunSke.clearTracks();
                                    this.yunSke2.clearTracks();
                                    cc.director.loadScene("fightScene", () => {
                                    });
                                });
                            })
                        }, 0.5);
                    });
                });
        })));
    }

    startHandler = () => {
        if (this.isFight) return;
        DotInst.clientSendDot(COUNTERTYPE.fight, "5501");
        if (DataMgr.hasSubMarket()) {
            UIMgr.showView(ChoiceShopPanel.url, this.node, null, null, false);
        } else {
            this.fightHandler();
        }
    }

    closeHandler() {
        if (this.isFight) return;
        let moveBg = cc.moveBy(0.5, cc.v2(0, -1600));
        moveBg.easing(cc.easeBackIn());
        this.bg.runAction(cc.sequence(moveBg, cc.callFunc(() => {
            DotInst.clientSendDot(COUNTERTYPE.fight, "5504");
            //刷新主界面红点
            HttpInst.postData(NetConfig.REDPOLLING, [], (response) => {
                if (response.redDots) {
                    DataMgr.setRedData(response.redDots);
                    ClientEvents.UPDATE_MAINUI_RED.emit(response.redDots);
                    UIMgr.showMap();
                }
            });
            ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(true);
            this.node.cleanup();
            this.node.removeFromParent(true);
            this.node.resumeAllActions();
            this.node.destroy();
        })));
    }
    explainHandler(){
        UIMgr.showTextTip(TextTipConst.ShopFight_Explain,cc.director.getScene());
    }
}
