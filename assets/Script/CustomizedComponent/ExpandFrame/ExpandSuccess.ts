/**
 *@Athuor ljx
 *@Date 23:20
 */
import { GameComponent } from "../../core/component/GameComponent";
import { GuideIdType, judgeSoftGuideStart } from "../../global/const/GuideConst";
import { JsonMgr } from "../../global/manager/JsonManager";
import { DataMgr } from "../../Model/DataManager";
import { ButtonMgr } from "../common/ButtonClick";
import { ARROW_DIRECTION, GuideMgr } from "../common/SoftGuide";
import { MiniData } from "../NewMiniWarehouse/MiniWarehouseData";
import LabelType1 from "./LabelType1";
import LabelType2 from "./LabelType2";
import { UIMgr } from "../../global/manager/UIManager";
import PowerGuide from "../PowerGuide/PowerGuide";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { COUNTERTYPE, DotInst } from "../common/dotClient";

const { ccclass, property } = cc._decorator;

@ccclass

export default class ExpandSuccess extends GameComponent {
    static url = "expandFrame/expandSuccess";

    @property(cc.Node)
    private xian: cc.Node = null;
    @property(sp.Skeleton)
    private spine: sp.Skeleton = null;
    @property(cc.Prefab)
    private getLabel1: cc.Prefab = null;
    @property(cc.Prefab)
    private getLabel2: cc.Prefab = null;
    @property(cc.Node)
    private sure: cc.Node = null;
    private beforeData: ISceneJson = null;
    private nowData: ISceneJson = null;

    private arr: cc.Node[] = [];
    private time: number = 0;

    clickSure = () => {
        MiniData.refreshData();
        this.closeOnly();
        DataMgr.judgeStartSoftGuideJson();
        DataMgr.setClickMainTask(0);
    };

    init(time) {
        this.time = time;
        this.initSpineAni()
    }

    initSpineAni = () => {
        this.spine.node.active = true;
        this.xian.active = true;
        this.sure.active = true;
        this.nowData = JsonMgr.getSceneData(this.time);
        this.beforeData = JsonMgr.getSceneData(this.time - 1);
        this.initAni();
        this.spine.setAnimation(0, "animation", false);
        this.spine.setCompleteListener(() => {
            this.spine.setAnimation(0, "animation2", true);
        });
    };

    initAni = () => {
        setTimeout(() => {
            this.initPositionChange();
            this.initPutShelves();
            this.initPopularityUpLabel();
            this.initAction();
        }, 500);
    };

    initPositionChange() {
        let beforPos = this.beforeData.positionLimit.split(";");
        let nowPos = this.nowData.positionLimit.split(";");
        this.getChange(nowPos, beforPos).forEach((value) => {
            let node = cc.instantiate(this.getLabel2);
            node.getComponent(LabelType2).init("员工岗位", value);
            this.arr.push(node);
        });
    }

    initPutShelves() {
        let beforePutShelves = this.beforeData.putShelves;
        let nowShelves = this.nowData.putShelves;
        if (beforePutShelves !== nowShelves) {
            let node = cc.instantiate(this.getLabel1);
            this.arr.push(node);
            node.getComponent(LabelType1).init(beforePutShelves, nowShelves, "货架摆放数量");
        }
    }

    initPopularityUpLabel() {
        let popularity = this.beforeData.maxPopularity;
        let nowPopularity = this.nowData.maxPopularity;
        if (nowPopularity !== popularity) {
            let node = cc.instantiate(this.getLabel1);
            this.arr.push(node);
            node.getComponent(LabelType1).init(popularity, nowPopularity, "人气值上限");
        }
    }

    getChange(nowData: string[], befor: string[]) {
        let keys: number[] = [];
        nowData.forEach((value, key) => {
            let num = value.split(",")[1];
            let beforeNum = befor[key].split(",")[1];
            if (num !== beforeNum) {
                keys.push(key);
            }
        });
        return keys
    }

    initAction() {
        this.xian.runAction(cc.sequence(cc.fadeIn(.2), cc.callFunc(() => {
            this.initArrAni();
        })));
    }

    initArrAni = () => {
        this.arr.forEach((value, key) => {
            this.node.addChild(value);
            value.setPosition(cc.v2(0, (-5 - (70 * key) + 4)));
            value.runAction(cc.sequence(cc.delayTime(.1 * key), cc.fadeIn(.1)));
        });
        this.sure.runAction(cc.sequence(cc.delayTime(this.arr.length * .1), cc.fadeIn(.1), cc.callFunc(() => {
            ButtonMgr.addClick(this.sure, this.clickSure);
            // if (DataMgr.checkInPowerGuide()) {
            //     UIMgr.showView(PowerGuide.url, null, null, (node: cc.Node) => {
            //         node.getComponent(PowerGuide).setNodeToPowerGuide(this.sure, () => {
            //             this.clickSure();
            //             UIMgr.resetViewToMiddle(null);
            //             ClientEvents.UP_POWER_GUIDE.emit(12);
            //         }, 11);
            //     }, null, 10000);
            // }
            this.initGuide()
        })));
    };

    initGuide() {
        let curSoftGuide: ISoftGuideJson = JsonMgr.getSoftGuideJsoById(GuideIdType.expand, 4);
        if (curSoftGuide && judgeSoftGuideStart(curSoftGuide)) {
            DotInst.clientSendDot(COUNTERTYPE.softGuide, "19010");
            GuideMgr.showSoftGuide(this.sure, ARROW_DIRECTION.BOTTOM, curSoftGuide.displayText, (node: cc.Node) => {

            }, false, 0, false, this.clickSure);
        }
    }

    protected getBaseUrl(): string {
        return ExpandSuccess.url;
    }
}