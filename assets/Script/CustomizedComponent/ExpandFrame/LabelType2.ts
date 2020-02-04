/**
*@Athuor ljx
*@Date 23:53
*/

const {ccclass, property} = cc._decorator;

@ccclass

export default class LabelType2 extends cc.Component {
    @property(cc.Label)
    private desc: cc.Label = null;
    @property(cc.Label)
    private beforeValue: cc.Label = null;
    @property(cc.Label)
    private afterLabel: cc.Label = null;

    init(desc: string, key: number) {
        this.desc.string = desc;
        this.setBefore(key);
    }

    setBefore(key: number) {
        switch (key) {
            case 0:
                this.beforeValue.string = "收银员";
                break;
            case 1:
                this.beforeValue.string = "售货员";
                break;
            case 2:
                this.beforeValue.string = "揽客员";
                break;
            case 3:
                this.beforeValue.string = "理货员";
                break;
        }
        this.afterLabel.string = "+1";
    }
}