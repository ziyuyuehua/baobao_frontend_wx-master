// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import {GameComponent} from "../../core/component/GameComponent";
import {ButtonMgr} from "../common/ButtonClick";
import {ResMgr} from "../../global/manager/ResManager";
import {Staff} from "../../Model/StaffData";
import {JsonMgr} from "../../global/manager/JsonManager";
import {FavorType} from "./FavorHelp";
import {ClientEvents} from "../../global/manager/ClientEventCenter";

const {ccclass, property} = cc._decorator;

@ccclass
export default class breakAniView extends GameComponent {

    static url: string = "favorability/breakAniView";

    @property(sp.Skeleton)
    breakAni: sp.Skeleton = null;

    @property(cc.Node)
    breakSuccess: cc.Node = null;

    @property(cc.Sprite)
    favorIcon: cc.Sprite = null;

    @property(cc.Label)
    LvLab: cc.Label = null;

    @property(cc.Label)
    attrNamelabel: cc.Label = null;

    @property(cc.Label)
    attrNumlabel: cc.Label = null;

    @property(cc.Node)
    sureBtn: cc.Node = null;

    staff: Staff = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    }

    start() {
        this.staff = this.node["data"];

        this.breakAni.setAnimation(0, "animation", false);
        this.breakAni.setCompleteListener(() => {
            let favorLvJson: IFavorLevelJson = JsonMgr.getFavorLevelJson(this.staff.favorStage, this.staff.favorLevel);
            ResMgr.getFavorIcon(this.favorIcon, favorLvJson.icon);
            if (this.staff.favorStage == 3) {
                this.LvLab.string = this.staff.favorLevel + "";
            }
            this.breakSuccess.active = true;
            this.breakAni.setAnimation(0, "animation2", true);
        })
        this.attrNamelabel.node.active = true;
        this.attrNamelabel.node.opacity = 0;
        let action = cc.sequence(cc.fadeTo(1, 255), cc.callFunc(() => {
            this.attrNamelabel.node.opacity = 255;
            this.sureBtn.active = true;
        }))
        this.attrNamelabel.node.runAction(action);
        ButtonMgr.addClick(this.sureBtn, () => {
            ClientEvents.GOON_PLAY_ANIMATION.emit();
            this.closeOnly();
        })
        let breakFavorId: number = JsonMgr.getFavorLevelJson(this.staff.favorStage, 0).id;
        let breakFavorJson: IFavorJson = JsonMgr.getFavorJson(this.staff.xmlId, breakFavorId);
        this.setAttLable(breakFavorJson);
    }

    setAttLable(favorJson) {
        switch (favorJson.type) {
            case FavorType.StaffAttNum:
            case FavorType.StaffAttBai:
                let itemstr: string[] = favorJson.para.split(",");
                let itemId: number = Number(itemstr[0])
                let attJson: IAttributeJson = JsonMgr.getAttributeJson(itemId);
                this.attrNamelabel.string = attJson.attributeName;
                if (favorJson.type == FavorType.StaffAttNum) {
                    this.attrNumlabel.string = "+" + itemstr[1];
                } else {
                    this.attrNumlabel.string = "+" + itemstr[1] + "%";
                }
                break;
            case FavorType.StaffAllBai:
            case FavorType.StaffAllNum:
                this.attrNamelabel.string = "全属性";
                if (favorJson.type == FavorType.StaffAllNum) {
                    this.attrNumlabel.string = "+" + favorJson.para;
                } else {
                    this.attrNumlabel.string = "+" + favorJson.para + "%";
                }
                break;
        }
    }

    protected getBaseUrl(): string {
        return breakAniView.url;
    }

    // update (dt) {}
}
