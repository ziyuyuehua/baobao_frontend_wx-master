// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class shopZheItem extends cc.Component {

    @property({ type: cc.Label, displayName: "折扣数" })
    zheLabel: cc.Label = null;

    @property({ type: cc.Node, displayName: "选中状态" })
    choseState: cc.Node = null;

    @property({ type: cc.RichText, displayName: "当前进度" })
    curProgerss: cc.RichText = null;


    start() {

    }

    updateItem(dailyStr: string, curNum: number, price: string,choseState:boolean) {
        this.choseState.active = choseState;
        if (dailyStr) {
            let daily: string[] = dailyStr.split(",");
            this.zheLabel.string = Number(daily[0]) / 10 + "折";
            this.curProgerss.fontSize = 22;
            let curColor = "#639c61"
            if (curNum >= Number(daily[2])) {
                curColor = "#de4747"
            }
            this.curProgerss.string = "<color=" + curColor + ">" + curNum + "/</c><color=#814d34>" + daily[2] + "</color>";
        } else {
            this.zheLabel.string = "原价";
            this.curProgerss.fontSize = 40;
            this.curProgerss.string = "<color=#814d34>∞</color>";
        }
    }


    // update (dt) {}
}
