/**
 * author: ljx
 */
import List from "../../Utils/GridScrollUtil/List";
import MiniItem from "./MiniItem";
import ResolveItem from "./ResolveItem";
import {ButtonMgr} from "../common/ButtonClick";
import {GameComponent} from "../../core/component/GameComponent";
import ResolveGetNode from "./ResolveGetNode";
import {HttpInst} from "../../core/http/HttpClient";
import {MiniData} from "./MiniWarehouseData";
import {NetConfig} from "../../global/const/NetConfig";

const {ccclass, property} = cc._decorator;

export enum ResolveState {
    Future,
    Staff
}

@ccclass
export default class ResolveCommonNode extends GameComponent {

    static url = "miniWarehouse/resolveFutureNode";

    @property(cc.Node)
    private middleView: cc.Node = null;
    @property(cc.Node)
    private pageView: cc.Node[] = [];
    @property(cc.Label)
    private titleName: cc.Label = null;
    @property(cc.Label)
    private resolveFiveDesc: cc.Label = null;
    @property(cc.Label)
    private tittleDesc: cc.Label = null;
    @property(cc.Node)
    private resolveSureNode: cc.Node = null;
    @property(cc.Node)
    private resolveSprite: cc.Node = null;
    @property(cc.Node)
    private sure: cc.Node = null;
    @property(cc.Node)
    private cancel: cc.Node = null;
    @property(cc.Node)
    private pageNumNode: cc.Node = null;
    @property(cc.Node)
    private leftPage: cc.Node = null;
    @property(cc.Node)
    private rightPage: cc.Node = null;
    @property(List)
    private getItemScroll: List = null;
    @property(cc.SpriteFrame)
    private pageNumSpriteFrame: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    private choicePageSpriteFrame: cc.SpriteFrame = null;
    @property(cc.Prefab)
    private resolveItem: cc.Prefab = null;

    private pageNumArr: cc.Node[] = [];
    private data: ResolveData[] = [];
    private nowChoosePage: number = 0;
    private resolveGetData: ResolveGetData[] = [];
    private resolveDownLoadCb: Function = null;
    private allPage: number = 0;
    private dataLen: number = 0;
    private inChange: boolean = false;
    private fiveStar: boolean = false;
    private canSaleFiveStar: boolean = false;
    private showPage: cc.Node = null;
    private hidePage: cc.Node = null;
    private resolveOverCb: Function = null;
    private state: ResolveState = ResolveState.Future;

    protected start(): void {
        this._bindEvent();
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.sure, this.sureClick);
        ButtonMgr.addClick(this.cancel, this.closeOnly);
        ButtonMgr.addClick(this.rightPage, this.pageRight);
        ButtonMgr.addClick(this.leftPage, this.pageLeft);
        ButtonMgr.addClick(this.resolveSureNode, this.changeFiveStarState);
    }

    init(data: ResolveData[], resolveGetData: ResolveGetData[], tittleName: string, tittleDesc: string, resolveDesc: string, initItemDownNode: Function, resolveOverCb: Function) {
        this.resolveOverCb = resolveOverCb;
        this.resolveDownLoadCb = initItemDownNode;
        this.resolveGetData = resolveGetData;
        this.titleName.string = tittleName;
        this.tittleDesc.string = tittleDesc;
        this.resolveFiveDesc.string = resolveDesc;
        this.data = data;
        this.dataLen = this.data.length;
        this.allPage = Math.ceil(this.dataLen / 12);
        this.showPage = this.pageView[0];
        this.hidePage = this.pageView[1];
        this.nowChoosePage = 1;
        this.checkHasFiveStar();
        this.setSureState();
        this.initPageCount();
        this.initPage();
        this.initGetScroll();
        this.initChangePage();
        this.resolveSprite.active = this.canSaleFiveStar;
        this.changePageSpriteFrame(this.choicePageSpriteFrame, 0);
    }

    setResolveState(resolve: ResolveState) {
        this.state = resolve;
    }

    checkHasFiveStar() {
        for (let i = 0; i < this.dataLen; i++) {
            if (this.data[i].xmlData.color >= 5) {
                this.fiveStar = true;
                return;
            }
        }
    }

    sureClick = () => {
        switch (this.state) {
            case ResolveState.Future:
                HttpInst.postData(NetConfig.SALE_FUTURE, [MiniData.getPushSaleArr()], () => {
                    this.closeOnly();
                    this.resolveOverCb && this.resolveOverCb();
                    MiniData.refreshData();
                });
                break;
            case ResolveState.Staff:
                // 员工分解的接口
                break;
            default:
                break;
        }

    };

    initPageCount() {
        if (this.allPage >= 1) {
            this.pageNumNode.active = true;
            this.pageNumNode.width = (this.pageNumNode.width + 10) * this.allPage;
            for (let i = 0; i < this.allPage; i++) {
                let node = new cc.Node();
                node.setContentSize(this.pageNumSpriteFrame.getRect().size);
                let sprite = node.addComponent(cc.Sprite);
                sprite.spriteFrame = this.pageNumSpriteFrame;
                this.pageNumNode.addChild(node);
                this.pageNumArr.push(node);
            }
        }
    }

    initGetScroll() {
        this.getItemScroll.numItems = this.resolveGetData.length;
    }

    changeFiveStarState = () => {
        this.canSaleFiveStar = !this.canSaleFiveStar;
        this.resolveSprite.active = this.canSaleFiveStar;
        this.setSureState();
    };

    setSureState() {
        this.sure.getComponent(cc.Button).interactable = this.canSaleFiveStar || !this.fiveStar;
    }

    renderGetItem(item: cc.Node, index: number) {
        let script: ResolveGetNode = item.getComponent("ResolveGetNode");
        let data = this.resolveGetData[index];
        script.init(data.xmlData, data.count);
    }

    initPage() {
        let count = this.allPage > 1 ? 12 : this.dataLen;
        for (let i = 0; i < count; i++) {
            this.initPageItem(i, this.showPage);
        }
    }

    renderPage() {
        let nodeArr = this.hidePage.children;
        let count = this.nowChoosePage < this.allPage ? 12 : 12 - (this.nowChoosePage * 12 - this.dataLen);
        if (nodeArr.length === 0) {
            for (let i = 0; i < count; i++) {
                this.initPageItem((this.nowChoosePage - 1) * 12 + i, this.hidePage);
            }
        } else {
            nodeArr.forEach((value, key) => {
                if (key + 1 > count) {
                    value.active = false
                } else {
                    value.active = true;
                    value.getComponent(ResolveItem).init(this.data[(this.nowChoosePage - 1) * 12 + key], this.resolveDownLoadCb);
                }
            });
        }
    }

    initPageItem(index: number, fatherNode: cc.Node) {
        let node = cc.instantiate(this.resolveItem);
        node.getComponent(ResolveItem).init(this.data[index], this.resolveDownLoadCb);
        fatherNode.addChild(node);

    }

    initChangePage() {
        this.rightPage.active = this.nowChoosePage < this.allPage;
        this.leftPage.active = this.nowChoosePage > 1;
    }

    pageRight = () => {
        if (!this.inChange) {
            this.inChange = true;
            this.changePageSpriteFrame(this.pageNumSpriteFrame);
            this.nowChoosePage++;
            this.renderPage();
            this.changePageSpriteFrame(this.choicePageSpriteFrame);
            this.initChangePage();
            this.changePageMove(false);
        }
    };

    pageLeft = () => {
        if (!this.inChange) {
            this.inChange = true;
            this.changePageSpriteFrame(this.pageNumSpriteFrame);
            this.nowChoosePage--;
            this.renderPage();
            this.changePageSpriteFrame(this.choicePageSpriteFrame);
            this.initChangePage();
            this.changePageMove(true);
        }
    };

    changePageMove(isLeft: boolean) {
        this.hidePage.active = true;
        if (isLeft) {
            this.hidePage.setPosition(-560, 0);
            this.changeAni(this.showPage, 560);
            this.changeAni(this.hidePage, 560, () => {
                this.inChange = false;
                this.hidePage.active = false
            });
        } else {
            this.hidePage.setPosition(560, 0);
            this.changeAni(this.showPage, -560);
            this.changeAni(this.hidePage, -560, () => {
                this.inChange = false;
                this.hidePage.active = false
            });
        }
        let temp = this.showPage;
        this.showPage = this.hidePage;
        this.hidePage = temp;
    }

    changeAni(node: cc.Node, deltaX: number, cb?: Function) {
        node.runAction(cc.sequence(cc.moveBy(.4, deltaX, 0).easing(cc.easeCircleActionInOut()), cc.callFunc(() => {
            cb && cb();
        })));
    }

    changePageSpriteFrame(spriteFrame: cc.SpriteFrame, index: number = this.nowChoosePage - 1) {
        this.pageNumArr[index].getComponent(cc.Sprite).spriteFrame = spriteFrame;
    }

    protected getBaseUrl(): string {
        return ResolveCommonNode.url;
    }

}


export interface ResolveData {
    id: number;
    count: number;
    xmlData: any;
}

export interface ResolveGetData {
    xmlData: any;
    count: number
}
