// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {IMarketSetInfo} from "../../types/Response";
import {DataMgr} from "../../Model/DataManager";
import {ResMgr} from "../../global/manager/ResManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    private popularityLabel: cc.Label = null;

    @property(cc.Label)
    private incomeLabel: cc.Label = null;

    @property(cc.Label)
    private marketLevel: cc.Label = null;

    @property(cc.Label)
    private marketName: cc.Label = null;

    @property(cc.Sprite)
    private marketSprite: cc.Sprite = null;

    start() {

    }

    reuse = (index: number) => {
        let data: IMarketSetInfo[] = DataMgr.settingData.getMarketInfo();
        this.popularityLabel.string = data[index].popularity.toString();
        this.incomeLabel.string = data[index].profitOneHour.toString();
        this.marketLevel.string = data[index].marketLevel.toString();
        this.marketName.string = data[index].marketName;
        let str: string = "setting_" + (index + 1);
        ResMgr.setMainUIIcon(this.marketSprite, str);
    }
    // update (dt) {}
}
