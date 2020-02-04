import { GameComponent } from "../../core/component/GameComponent";
import { ClientEvents } from "../../global/manager/ClientEventCenter";
import { DataMgr } from "../../Model/DataManager";
import { TimeUtil } from "../../Utils/TimeUtil";
import { UIUtil } from "../../Utils/UIUtil";
import { ButtonMgr } from "../common/ButtonClick";
import { COUNTERTYPE, DotInst, DotVo } from "../common/dotClient";
import richtextNodeItem from "./richtextNodeItem";

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
export default class announcementActivate extends GameComponent {
    static url: string = "announcement/announcementActivate";
    @property(cc.Label)
    activateTitle: cc.Label = null;

    @property(cc.Label)
    activateDate: cc.Label = null;

    @property(cc.Label)
    title: cc.Label = null;

    @property(cc.ScrollView)
    labelScroll: cc.ScrollView = null;

    @property(cc.Prefab)
    richTextPrefab: cc.Prefab = null;

    @property(cc.Node)
    returnNode: cc.Node = null;

    @property(cc.Node)
    goseeBtn: cc.Node = null;

    @property(cc.Node)
    private aniNode: cc.Node = null;


    private contentHeight: number = 0;

    private timeoutNindx: number = 0;
    private timeoutBoolean: boolean = false;

    private contentStr: string = null;

    private jumpId: number = 0;
    private annouceid: number = 0;

    private returnbtnX: number = 0;

    ble: boolean;

    getBaseUrl() {
        return announcementActivate.url;
    }

    start() {
        this.returnbtnX = this.returnNode.x;
        this.updateItem(this.node['data'].nIndx)
    }

    onLoad() {
        ButtonMgr.addClick(this.returnNode, this.closeHandler);
        ButtonMgr.addClick(this.goseeBtn, this.goLookHandler);
    }

    onEnable() {
        this.onShowPlay(2, this.aniNode)
    }


    updateItem(nIndx: number, ble: boolean = false) {
        this.ble = ble;
        this.contentHeight = 0;
        this.node.active = true;
        let noticeData = DataMgr.announcementData.NoticeData[nIndx];
        this.annouceid = noticeData.id;
        this.jumpId = noticeData.frontSkipPos;
        if (this.jumpId < 0) {
            this.returnNode.x = 0;
            this.goseeBtn.active = false;
        } else {
            if (ble) {
                this.returnNode.x = 0;
                this.goseeBtn.active = false;
            } else {
                this.returnNode.x = -144;
                this.goseeBtn.active = true;
            }
        }
        this.contentStr = noticeData.content;
        this.setContent()
        this.activateTitle.string = noticeData.title;
        this.title.string = noticeData.typeStr ? noticeData.typeStr : "";
        this.activateDate.string = TimeUtil.getDataYearStr(noticeData.startTime);

    }

    setContent() {
        let content: string[] = this.contentStr.split(";")

        for (let nid = this.timeoutNindx; nid < content.length; nid++) {
            this.timeoutNindx = nid + 1;
            let conArr: string = content[nid];
            let contentArr: string[] = conArr.split("&");
            if (Number(contentArr[1]) == 1) {
                this.addRichText(contentArr[0]);
            } else if (Number(contentArr[1]) == 2) {
                this.addSprite(contentArr[0]);
                break;
            }
        }
        this.labelScroll.content.setContentSize(this.labelScroll.content.getContentSize().width, this.contentHeight);
    }

    addRichText(test: string) {
        let richPrefab = cc.instantiate(this.richTextPrefab);
        let richNode: richtextNodeItem = richPrefab.getComponent("richtextNodeItem");
        richNode.setRichText(test);
        richNode.setposition(-this.contentHeight);
        this.labelScroll.content.addChild(richPrefab);
        this.contentHeight += richNode.getRichHeight();
    }

    addSprite = (url: string) => {
        url = url.trim();
        let node1: cc.Node = new cc.Node();
        node1.addComponent(cc.Sprite);
        let sprite1: cc.Sprite = node1.getComponent(cc.Sprite);
        sprite1.sizeMode = cc.Sprite.SizeMode.TRIMMED;
        sprite1.node.setAnchorPoint(0, 1);
        sprite1.node.setPosition(0, -this.contentHeight);

        DataMgr.addUrlData(url);
        UIUtil.loadUrlImage(url, (spriteFrame: cc.SpriteFrame) => {
            if(!this.labelScroll || !sprite1.isValid || !spriteFrame) return;
            sprite1.spriteFrame = spriteFrame;
            this.labelScroll.content.addChild(node1);
            this.contentHeight += spriteFrame.getOriginalSize().height;
            this.timeoutBoolean = true;
        });

    }


    closeHandler = () => {
        DotInst.clientSendDot(COUNTERTYPE.announce, "1005", this.annouceid + "");
        this.timeoutBoolean = false;
        this.timeoutNindx = 0;
        this.closeOnly();
    }

    goLookHandler = () => {
        this.closeHandler();
        DotInst.clientSendDot(COUNTERTYPE.announce, "1002", this.annouceid + "");
        ClientEvents.CLOSE_ANNOUNEC_VIEW.emit();
        ClientEvents.EVENT_OPEN_UI.emit(this.jumpId);
    }

    update(dt) {
        if (this.timeoutBoolean) {
            this.timeoutBoolean = false;
            this.setContent()
        }
    }
}
