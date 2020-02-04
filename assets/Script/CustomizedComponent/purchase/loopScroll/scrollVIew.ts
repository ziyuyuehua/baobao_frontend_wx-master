import { CompositeDisposable } from "../../../Utils/event-kit";
import { ClientEvents } from "../../../global/manager/ClientEventCenter";
import { StaffItem } from "../../staff/list/StaffItem";

/** 
 * （垂直方向的无限滑动）
 * 最终版本的无限滑动视图， 可以复用
 * 刷新视图的消息发送到加载的item的绑定的ts里，只发送要刷掉的item节点以及当前index位置，本视图主要以item的名字来做标识来区别刷新哪个item将刷新信息发送到
 * item里后，让item根据自己的需求刷新数据，有item本身来控制, colue是显示多少列，这个写你需要的列数乘以3
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class scrollView extends cc.Component {

    //加载总数量
    @property(cc.Integer)
    private totalCount = 4;
    //一列显示数据个数
    @property(cc.Integer)
    private column: number = 8;
    //一行显示个数
    @property(cc.Integer)
    private line: number = 1;
    //x方向偏移量
    @property(cc.Integer)
    private offsetX: number = 10;
    //y方向偏移量
    @property(cc.Integer)
    private offsetY: number = 10;
    @property(cc.Node)
    private content: cc.Node = null;
    @property(cc.Node)
    private slider: cc.Node = null;
    @property(cc.String)
    private target = "";

    @property
    private showSlider: boolean = true;

    private dispose = new CompositeDisposable();
    private cacheItem = new Map<string, cc.Node>();
    private allItem = new Map<string, cc.Node>();
    private index = 0;
    private itemHeight = null;
    private startPositionY = 0;
    private maxPositionY = null;
    private minPositionY = null;
    private interval = null;

    private itemNodePool: cc.NodePool = null;

    private hasIndexs: boolean = false;

    private finishedNodePool: boolean = false;

    onLoad() {
        this.dispose.add(ClientEvents.EVENT_SCROLLVIEW_LOADITEM.on(this.init));
        this.dispose.add(ClientEvents.EVENT_REFRESH_FINALLY_SCROLLVIEW.on(this.refreshScroll));

        this.dispose.add(ClientEvents.EVENT_SCROLLVIEW_SCROLL_TO_INDEX.on(this.scrollToIndex));
    }

    private initNodePool(maxCount: number, showPrefab: cc.Prefab) {
        if (this.finishedNodePool) {
            cc.log("scrollView had finishedNodePool");
            return;
        }
        this.itemNodePool = new cc.NodePool();
        let node: cc.Node;
        for (let i = 1; i <= maxCount; i++) {
            node = cc.instantiate(showPrefab);
            this.itemNodePool.put(node);
        }
        this.finishedNodePool = true;
    }

    private createPrefab(showPrefab: cc.Prefab) {
        // let node: cc.Node = this.itemNodePool.get();
        // if(!node){
        //     cc.log("scrollView not enought node");
        //     node = cc.instantiate(showPrefab);
        // }
        // return node;
        return cc.instantiate(showPrefab);
    }

    init = (showPrefab: cc.Prefab, count: number, target: string) => {
        if (target !== this.target) {
            return;
        }
        //初始化数据
        this.cacheItem.forEach((value: cc.Node, key) => {
            value.destroy();
            //this.itemNodePool.put(value);
        });
        this.cacheItem.clear();
        this.allItem.clear();
        this.node.getComponent(cc.ScrollView).stopAutoScroll();
        this.node.getComponent(cc.ScrollView).scrollToTop();
        this.slider.getComponent(cc.Slider).progress = 1;

        this.index = 0;
        this.totalCount = count;
        let maxCount = this.totalCount > this.line * this.column ? this.line * this.column : this.totalCount;

        //为了满足员工底部列表和布阵上面的相互关联，StaffItem里添加了记录节点共享的index数组
        let items: Array<StaffItem> = new Array<StaffItem>();

        //this.initNodePool(maxCount, showPrefab);

        for (let i = 1; i <= maxCount; i++) {
            let item: cc.Node = this.createPrefab(showPrefab);
            this.content.addChild(item);
            item.name = this.index + "";

            let remainder: number = i % this.line;
            item.position = cc.v2((remainder === 0 ? this.line : remainder) * (this.offsetX + item.width) - item.width / 2,
                -(Math.ceil(i / this.line) * (this.offsetY + item.height) - item.height / 2));
            this.cacheItem.set(this.index + "", item);
            this.allItem.set(this.index + "", item);

            if (this.checkStaffItemAddIndex(item, items) && !this.hasIndexs) {
                this.hasIndexs = true;
            }

            this.index++;
            this.itemHeight = item.height;
        }

        this.content.height = Math.ceil(this.totalCount / this.line) * (this.itemHeight + this.offsetY) + this.offsetY;
        this.maxPositionY = (this.itemHeight + this.offsetY) * this.column / 3 + this.node.getChildByName("view").height / 2;
        this.minPositionY = this.content.height - (this.itemHeight + this.offsetY) * this.column / 3 - this.node.getChildByName("view").height / 2;
        this.startPositionY = this.maxPositionY;

        if (maxCount < this.totalCount) {
            this.refresh();
            this.checkLeftStaffItemAddIndex(maxCount, items);
        }

        if (this.content.height > this.node.getChildByName("view").height) {
            this.slider.active = this.showSlider;
            this.slider.on("slide", () => {
                //this.node.getComponent(cc.ScrollView).stopAutoScroll();
                let percent: number = this.slider.getComponent(cc.Slider).progress;
                this.node.getComponent(cc.ScrollView).scrollToPercentVertical(percent);
            });
        } else {
            this.slider.active = false;
        }
    };

    //检测是否是StaffItem，是的话则额外添加indexs数组，记录该共享节点所管理的index数组
    private checkStaffItemAddIndex(item: cc.Node, items: Array<StaffItem>): boolean {
        let staffItem: StaffItem = item.getComponent("StaffItem");
        if (staffItem) {
            staffItem.addIndexs(this.index);
            items.push(staffItem);
            return true;
        }
        return false;
    }

    //继续把剩余共享节点外，所需要管理的index添加进来
    private checkLeftStaffItemAddIndex(maxCount: number, items: Array<StaffItem>) {
        if (this.hasIndexs) {
            let lastIndex = this.index;
            const size = this.totalCount - maxCount;
            for (let i = 0; i < size; i++) {
                let index = i % maxCount;
                let staffItem: StaffItem = items[index];
                staffItem.addIndexs(lastIndex);
                lastIndex++;
            }
        }
    }

    scrollToIndex = (index: number) => {
        if (index < 0) {
            return;
        }
        let row: number = Math.floor(index / this.line + 1);
        let totalRow = Math.ceil(this.totalCount / this.line);
        //let percent: number = row == 1 || row == 2 || row == 3 ? 1 : 1-(row / totalRow);
        let p = row * (this.itemHeight + this.offsetY) / (this.content.height - this.offsetY);
        let percent: number = this.hasIndexs
            ? row == 1 || row == 2 ? 1 : row == 3 ? 0.8 : 1 - p
            : totalRow - row < 3 ? 0 : 1 - p;
        this.slider.getComponent(cc.Slider).progress = percent;
        this.node.getComponent(cc.ScrollView).scrollToPercentVertical(percent, 1);
    };

    scrollScroll() {
        this.slider.getComponent(cc.Slider).progress =
            1 - (this.content.y - this.node.getChildByName("view").height / 2) / (this.content.height - this.node.getChildByName("view").height);
    }

    refresh = () => {
        this.checkClearInterval();

        this.interval = setInterval(() => {
            if (this.index < this.totalCount) {
                if (this.content.y > this.maxPositionY && this.content.y - this.startPositionY >= this.itemHeight + this.offsetY) {
                    for (let i = 0; i < this.line; i++) {
                        let item = this.cacheItem.get(this.index - this.line * this.column + "");
                        item.setPosition(item.x, -(Math.ceil((this.index + 1) / this.line) * (this.offsetY + this.itemHeight) - this.itemHeight / 2));
                        this.cacheItem.delete(this.index - this.line * this.column + "");
                        this.cacheItem.set(this.index + "", item);
                        item.active = this.index < this.totalCount;
                        if (item.active) {
                            ClientEvents.EVENT_REFRESH_GOODSITEM.emit(this.index, item);
                        }

                        this.index++;
                    }
                    this.startPositionY += this.itemHeight + this.offsetY;

                }
            } if (this.index > this.column * this.line) {
                if (this.content.y < this.minPositionY && this.content.y - this.startPositionY <= -(this.itemHeight + this.offsetY)) {
                    for (let i = 0; i < this.line; i++) {
                        let item = this.cacheItem.get(this.index - 1 + "");
                        item.active = true;
                        item.setPosition(item.x, item.y + this.column * (this.itemHeight + this.offsetY));
                        ClientEvents.EVENT_REFRESH_GOODSITEM.emit(this.index - this.column * this.line - 1, item);
                        this.cacheItem.delete(this.index - 1 + "");
                        this.cacheItem.set(this.index - 1 - this.column * this.line + "", item);
                        this.index--;
                    }
                    this.startPositionY -= this.itemHeight + this.offsetY;
                }
            }
        }, 10);
    }

    start() {
    }

    refreshScroll = (showPrefab: cc.Prefab, count: number, target: string) => {
        if (target !== this.target) {
            return;
        }
        this.cacheItem.forEach((value: cc.Node, key) => {
            value.destroy();
            //this.itemNodePool.put(value);
        });
        this.cacheItem.clear();
        this.allItem.clear();
        this.index = 0;
        this.init(showPrefab, count, this.target);
    }

    onDestroy() {
        this.checkClearInterval();
        this.dispose.dispose();
    }

    private checkClearInterval() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    // update(dt) {

    // }
}
