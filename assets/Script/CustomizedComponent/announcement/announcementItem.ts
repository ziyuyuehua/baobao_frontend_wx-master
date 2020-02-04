import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { DataMgr } from "../../Model/DataManager";
import { TimeUtil } from "../../Utils/TimeUtil";
import { COUNTERTYPE, DotInst, DotVo } from "../common/dotClient";

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
export default class announcementItem extends cc.Component {
    @property(cc.Node)
    red: cc.Node = null;
    @property(cc.Label)
    titleLab: cc.Label = null;

    @property(cc.Node)
    textNode: cc.Node = null;

    @property(cc.Label)
    textNodeLab: cc.Label = null;

    @property(cc.Label)
    textNodeDate: cc.Label = null;

    @property(cc.Node)
    sprNode: cc.Node = null;

    @property(cc.Sprite)
    sprNodeSprite: cc.Sprite = null;

    @property(cc.Label)
    sprNodeLab: cc.Label = null;

    @property(cc.Label)
    sprNodeDate: cc.Label = null;

    curnIndx: number = 0;
    announceId: number = 0;

    start() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.openActivateInfo)
    }

    openActivateInfo = () => {
        DotInst.clientSendDot(COUNTERTYPE.announce, "1001", this.announceId + "");

        this.red.active = false;
        ClientEvents.OPEN_ACTIVATEIN_INFO_VIEW.emit(this.curnIndx);
    }

    reuse = (nIndx: number) => {
        //getAnnounceIcon
        this.curnIndx = nIndx;
        let notice = DataMgr.announcementData.NoticeData[nIndx];
        this.red.active = notice.id > DataMgr.announcementData.LastReadNoticeId;
        if (notice.titleImg != "") {
            this.textNode.active = false;
            this.sprNode.active = true;
            cc.loader.load(notice.titleImg, (err, texture) => {
                if(!this.sprNodeSprite) return;
                var sprite = new cc.SpriteFrame(texture);
                this.sprNodeSprite.spriteFrame = sprite;
            });
            this.sprNodeLab.string = notice.title;
            this.sprNodeDate.string = TimeUtil.getDataYearStr(notice.startTime);
        } else {
            this.textNode.active = true;
            this.sprNode.active = false;
            this.textNodeLab.string = notice.title;
            this.textNodeDate.string = TimeUtil.getDataYearStr(notice.startTime);
        }
        this.announceId = notice.id;
        this.titleLab.string = notice.typeStr ? notice.typeStr : "";
    }
}
