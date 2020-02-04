import { HttpClient } from "../../core/http/HttpClient";

const { ccclass, property } = cc._decorator;

/**
 * scroll的高度需要根据图片进行手动设置。 height = (offsetY + itemHeight) * line;
 */
@ccclass
export default class GridScroll extends cc.Component {

    @property(cc.Node)
    private content: cc.Node = null;
    @property(cc.Integer)
    private line: number = 0;
    @property(cc.Integer)
    private colume: number = 0;
    @property(cc.String)
    private scriptName: string = "";
    @property(cc.Integer)
    private offsetX = 0;
    @property(cc.Integer)
    private offsetY = 0;
    @property(cc.ScrollView)
    private scroll: cc.ScrollView = null;

    private callBack: Function = null;
    private index: number = 0;
    private nodePool: cc.NodePool = null;
    private totalCount: number = 0;
    private startPosY: number = 0;
    private itemHeight: number = 0;
    private itemWidth: number = 0;
    private nodeArray: Array<cc.Node> = new Array<cc.Node>();

    private prefab: cc.Prefab = null;
    onLoad() {
        this.nodePool = new cc.NodePool(this.scriptName);
    }

    start() {
        this.node.on("scrolling", this.refreshItem, this);
    }

    setLine(line: number, colume: number, scale: number) {
        this.line = line;
        this.colume = colume;
        let temp: cc.Node = this.nodeArray[0];
        this.offsetX = this.offsetX * scale;
        for (let nid in this.nodeArray) {
            let node = this.nodeArray[nid];
            // node.scale = scale;
            node.width = node.width * scale;
            node.height = node.height * scale;
        }
        if (this.nodeArray.length != 0) {
            let addCount = ((this.colume + 2) * this.line) - this.nodeArray.length;
            for (let i = 0; i < addCount; i++) {
                cc.log("temp......width....." + temp.width);
                this.nodeArray.push(cc.instantiate(temp));
                let node = cc.instantiate(temp);
                cc.log("temp......width....." + node.width);
            }
        }

    }

    initNodePool = (prefab: cc.Prefab, line?: number, colume?: number, scale: number = 1) => {
        this.prefab = prefab;
        if (line) {
            this.setLine(line, colume, scale);
        }

        let len = (this.colume + 2) * this.line;
        if (!this.nodePool) {
            this.nodePool = new cc.NodePool(this.scriptName);
        }
        for (let i = 0; i < len; i++) {
            let node = cc.instantiate(prefab);
            node.width = node.width * scale;
            node.height = node.height * scale;
            this.nodePool.put(node);
        }
    }


    //这里的回掉是为懒加载准备的
    initGridScroll = (count: number, callBack: Function = null) => {
        this.totalCount = count;
        this.callBack = callBack;
        let defalutOnePage = (this.colume + 2) * this.line;
        let onePage = this.totalCount > defalutOnePage ? defalutOnePage : this.totalCount;
        for (let i = 0; i < onePage; i++) {
            let node = this.nodePool.get(this.index);
            if (!node) {
                node = cc.instantiate(this.prefab);
                this.nodePool.put(node);
            }
            this.content.addChild(node);
            this.nodeArray.push(node);
            this.itemHeight = node.height;
            this.itemWidth = node.width;
            let y = Math.floor((i / this.line)) * (this.offsetY + this.itemHeight) + (this.offsetY + this.itemHeight / 2);
            let x = (i % this.line) * (this.itemWidth + this.offsetX) + (this.offsetX + this.itemWidth / 2);
            node.setPosition(x, -y);
            this.index++;
        }
        this.setContentHeight();
        this.startPosY = this.content.y + this.itemHeight + this.offsetY;
    }

    setContentHeight = () => {
        this.content.height = (this.offsetY + this.itemHeight) * Math.ceil(this.totalCount / this.line);
    }

    refresh = (count: number, isResetTotal: boolean = false) => {
        if (!isResetTotal) {
            let percent = null;
            if (this.scroll) {
                percent = this.scroll.getScrollOffset()
            }

            this.content.y = this.content.parent.height / 2;
            for (let i of this.nodeArray) {
                i.active = true;
                this.nodePool.put(i);
            }
            this.index = 0;
            this.nodeArray.splice(0, this.nodeArray.length);
            this.initGridScroll(count, this.callBack);
            // this.content.y = this.content.parent.height / 2;
            cc.log(percent);
            if (this.scroll) {
                this.scroll.scrollToOffset(percent);
            } else {
                this.content.y = this.content.parent.height / 2;
            }
            cc.log("值。。。4------ " + this.content.y);
        } else {
            this.totalCount = count;
            this.content.height = (this.offsetY + this.itemHeight) * Math.ceil(this.totalCount / this.line);
        }

    }

    refreshItem = () => {
        if (this.index < this.totalCount) {
            if (this.content.y - this.startPosY > this.itemHeight + this.offsetY && this.content.y > this.startPosY) {
                let lastNode = this.nodeArray[this.nodeArray.length - 1];
                if ((this.index + 5) >= this.totalCount && this.callBack !== null) {
                    this.callBack();
                }
                for (let i = 0; i < this.line; i++) {
                    let node = this.nodeArray[0];
                    node.position = cc.v2(node.x, lastNode.y - this.itemHeight - this.offsetY);
                    if (this.index >= this.totalCount) {
                        node.active = false;
                    } else {
                        node.getComponent(this.scriptName).reuse(this.index);
                    }
                    this.index++;
                    this.nodeArray.push(node);
                    this.nodeArray.splice(0, 1);
                }
                this.startPosY += this.itemHeight + this.offsetY;
            }
        }
        if (this.index > this.line * this.colume + 2 * this.line) {
            if (this.content.y - this.startPosY < -(this.itemHeight + this.offsetY) && this.content.y < this.content.height - (this.content.parent.height / 2 + this.itemHeight + this.offsetY)) {
                let startNode = this.nodeArray[0];
                for (let i = 0; i < this.line; i++) {
                    let node = this.nodeArray[this.nodeArray.length - 1];
                    node.position = cc.v2(node.x, startNode.y + this.itemHeight + this.offsetY);
                    node.getComponent(this.scriptName).reuse(Math.trunc(this.index - 1 - this.colume * this.line - 2 * this.line));
                    node.active = true;
                    this.index--;
                    this.nodeArray.unshift(node);
                    this.nodeArray.splice(this.nodeArray.length - 1, 1);
                }
                this.startPosY -= (this.itemHeight + this.offsetY);
            }
        }
    }

    get getNodeArray() {
        return this.nodeArray;
    }

    get getSpriteName() {
        return this.scriptName;
    }

    reset() {
        this.index = 0;
        for (let i = 0; i < this.nodePool.size(); i++) {
            this.nodePool.get(i).destroy();
        }
        this.nodePool.clear();
    }
}
