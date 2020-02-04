/**
 * @Author lz
 * @Date 2019/7/31
 * @Desc 游戏脚本基类
 */
import ccclass = cc._decorator.ccclass;
import {CompositeDisposable, Disposable} from "../../Utils/event-kit";
import {UIMgr} from "../../global/manager/UIManager";
import {UIUtil} from "../../Utils/UIUtil";
import {ButtonMgr} from "../../CustomizedComponent/common/ButtonClick";

@ccclass()
export abstract class GameComponent extends cc.Component {

    //事件监听注册器
    protected dispose: CompositeDisposable = new CompositeDisposable();
    protected popLevel: number = 0;//弹窗等级
    protected gameNode: cc.Node = null;//游戏节点


    protected onLoad() {
        this.load();
    }

    protected load() {

    }

    protected addEvent(disposable: Disposable) {
        this.dispose.add(disposable);
    }

    /**
     * 好像都用不到removeEvent和clearAllEvent，
     * 关闭面板直接执行onDestroy里的dispose了，
     * 所以暂时注释掉了
     *
     protected removeEvent(disposable: Disposable){
        this.dispose.remove(disposable);
    }

     protected clearAllEvent(){
        this.dispose.clear();
    }
     **/

    show = () => {
        UIUtil.show(this);
    };

    hide = () => {
        UIUtil.hide(this);
    };

    //关闭面板且showMap，适用于一级弹版
    closeView = () => {
        this.closeComponent(true);
    };

    //仅仅关闭面板，不showMap,适用于二级、三级弹版
    closeOnly = () => {
        this.closeComponent(false);
    };

    // Uncaught TypeError: (intermediate value).closeComponent is not a function，
    // 报错原因是因为箭头函数的继承有问题，所以改成非箭头函数，额外提供箭头函数closeView和closeOnly便于绑定事件
    // 子类关闭面板调用，子类可复写
    protected closeComponent(showMap: boolean = true) {
        UIMgr.closeView("common/tips");
        ButtonMgr.setInteractableNoClick(true);
        UIMgr.closeView(this.getBaseUrl(), true, showMap);
    };

    protected onDestroy() {
        this.unload();
        this.dispose.dispose();
        this.gameNode = null;
    }

    protected unload() {

    }

    //动态加载预设的路径
    protected abstract getBaseUrl(): string;

    /**
     * 使用UIMgr.showView打开时，在onEnable调用次方法添加弹版动画
     * @param {number} popLevel 1级弹版传1，2级弹版传2
     * @param {cc.Node} gameNode 预设除开黑色背景外的游戏展示节点
     * @param {Function} cb
     */
    protected onShowPlay(popLevel: number, gameNode: cc.Node, cb: Function = null) {
        this.popLevel = popLevel;
        this.gameNode = gameNode;
        this.playMovie(cb);
    }

    private playMovie(cb: Function = null) {//子类调用播放动画
        UIMgr.showMask();
        setTimeout(() => {
            UIMgr.hideMask();
        }, 500);
        switch (this.popLevel) {
            case 0:
                break;
            case 1:
                this.gameNode.setPosition(cc.v2(this.gameNode.x, this.gameNode.y - 200));
                this.gameNode.opacity = 0;
                let moveBg = cc.moveBy(0.3, cc.v2(0, 200));
                moveBg.easing(cc.easeBackOut());
                let faceIn = cc.fadeIn(0.2);
                this.gameNode.runAction(cc.sequence(cc.spawn(faceIn, moveBg), cc.callFunc(() => {
                    cb && cb();
                    UIMgr.hideMask();
                })));
                break;
            case 2:
                this.gameNode.scale = 0.2;
                let scaleBg = cc.scaleTo(0.5, 1);
                scaleBg.easing(cc.easeBackOut());
                this.gameNode.runAction(cc.sequence(scaleBg, cc.callFunc(() => {
                    cb && cb();
                    UIMgr.hideMask();
                })));
                break;
        }
    };

}
