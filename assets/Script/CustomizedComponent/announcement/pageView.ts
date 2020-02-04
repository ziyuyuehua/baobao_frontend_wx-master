import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { COUNTERTYPE, DotVo, dotClient, DotInst } from "../common/dotClient";
import { DataMgr } from "../../Model/DataManager";

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
export default class pageView extends cc.Component {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    curnIndx: number;
    annocuceId: number = 0;
    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.openDesc)
    }

    openDesc = () => {
        DotInst.clientSendDot(COUNTERTYPE.announce, "1004", this.annocuceId + "");

        ClientEvents.OPEN_ACTIVATEIN_INFO_VIEW.emit(this.curnIndx);
    }

    initView(nIndx: number) {
        this.curnIndx = nIndx;
        let noticeData = DataMgr.announcementData.NoticeData;
        if (noticeData[nIndx]) {
            this.annocuceId = noticeData[nIndx].id;
            cc.loader.load(noticeData[nIndx].adImg, (err, texture) => {
                if(err){
                    cc.error(err);
                    return;
                }
                this.setImage && this.setImage(texture);
            });
        }
    }

    private setImage = (texture) => {
        if(!this.sprite.isValid) return;
        let sprite = new cc.SpriteFrame(texture);
        this.sprite.spriteFrame = sprite;
    }
}
