// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import { JsonMgr } from "../../global/manager/JsonManager";
import { ButtonMgr } from './ButtonClick';
import { GameComponent } from "../../core/component/GameComponent";
import { ClientEvents } from "../../global/manager/ClientEventCenter";

const { ccclass, property } = cc._decorator;

export interface peoplePos {
    startX: number;
    startY: number;
    reboundX: number;
    reboundY: number;
    endX: number;
    endY: number;
}

@ccclass
export default class dialogueView extends GameComponent {
    static url: string = "Prefab/common/dialogueView";
    @property([cc.Node])
    pepoleNodes: cc.Node[] = [];

    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Node)
    mask: cc.Node = null;

    private talkId: number = 0;
    private peopleNode: cc.Node = null;
    private qipao: cc.Node = null;
    private talkStr: cc.RichText = null;
    private curText: string[] = [];
    private curIndex: number = 0;
    private curType: number = 7;
    private talkJson: IOptionalTutorialsTextJson = null;
    private allText: string = "";
    private textAniType: number = 0;
    private isOperation: boolean = false;
    private isRepeat: boolean = false;

    //0->未开始 1->进行中 2->完成

    getBaseUrl() {
        return dialogueView.url;
    }

    onLoad() {
        this.textAniType = 0;
        ButtonMgr.addClick(this.bg, this.clickEndHandler);
    }

    clickEndHandler = () => {
        switch (this.textAniType) {
            case 1:
                this.unscheduleAllCallbacks();
                this.curIndex = 0;
                this.talkStr.string = this.allText;
                this.textAniType = 2;
                break;
            case 2:
                if (this.isOperation) {
                    this.bg.active = false;
                    return;
                }
                this.closeOnly();
                ClientEvents.DIALO_END_SEND.emit();
                break;

        }
    };

    start() {
        this.talkId = this.node['data'];
        this.setTalkData();
    }

    setTalkData() {
        this.talkJson = JsonMgr.getOptionalTutorialsJson(this.talkId);
        this.mask.active = this.talkId > 17;
        this.isOperation = this.talkId<=17 && this.talkJson.type == 2;
        let repeatID:number[] = [2,3,5];
        this.isRepeat = repeatID.indexOf(this.talkId) > -1;
        this.curText = this.talkJson.text.split(";");
        for (let nid = 0; nid < this.curText.length; nid++) {
            this.allText += this.curText[nid]
        }
        this.curType = this.talkJson.direction;
        this.updateView();
    }

    updateView() {
        this.setAction(this.pepoleNodes[this.curType - 1]);
    }

    setAction(curChoseNode: cc.Node) {
        curChoseNode.active = true;
        this.peopleNode = curChoseNode.getChildByName("people" + this.talkJson.face);
        this.qipao = curChoseNode.getChildByName("qipao");
        this.talkStr = curChoseNode.getChildByName("talk").getComponent(cc.RichText);
        this.playAction();
    }

    playAction() {
        switch (this.curType) {
            case 1:
            case 2:
                let pos: peoplePos = {
                    startX: this.peopleNode.x,
                    startY: 0,
                    reboundX: this.peopleNode.x,
                    reboundY: -20,
                    endX: this.peopleNode.x,
                    endY: -10,
                };
                this.peopleAction(pos);
                break;
            case 3:
                let pos1: peoplePos = {
                    startX: this.peopleNode.x - 240,
                    startY: this.peopleNode.y + 240,
                    reboundX: this.peopleNode.x - 240 + 20,
                    reboundY: this.peopleNode.y + 240 - 20,
                    endX: this.peopleNode.x - 240 + 20 - 10,
                    endY: this.peopleNode.y + 240 - 20 + 10,
                };
                this.peopleAction(pos1);
                break;
            case 4:
                let pos2: peoplePos = {
                    startX: this.peopleNode.x + 240,
                    startY: this.peopleNode.y + 240,
                    reboundX: this.peopleNode.x + 240 - 20,
                    reboundY: this.peopleNode.y + 240 - 20,
                    endX: this.peopleNode.x + 240 - 20 + 10,
                    endY: this.peopleNode.y + 240 - 20 + 10,
                };
                this.peopleAction(pos2);
                break;
            case 5:
                let pos3: peoplePos = {
                    startX: this.peopleNode.x - 240,
                    startY: this.peopleNode.y - 240,
                    reboundX: this.peopleNode.x - 240 + 20,
                    reboundY: this.peopleNode.y - 240 + 20,
                    endX: this.peopleNode.x - 240 + 20 - 10,
                    endY: this.peopleNode.y - 240 + 20 - 10,
                };
                this.peopleAction(pos3);
                break;
            case 6:
                let pos4: peoplePos = {
                    startX: this.peopleNode.x + 240,
                    startY: this.peopleNode.y - 240,
                    reboundX: this.peopleNode.x + 240 - 20,
                    reboundY: this.peopleNode.y - 240 + 20,
                    endX: this.peopleNode.x + 240 - 20 + 10,
                    endY: this.peopleNode.y - 240 + 20 - 10,
                };
                this.peopleAction(pos4);
                break;
            case 7:
                let pos5: peoplePos = {
                    startX: 88,
                    startY: 88,
                    reboundX: 88 - 20,
                    reboundY: 88 - 20,
                    endX: 88 - 20 + 10,
                    endY: 88 - 20 + 10,
                };
                this.peopleAction(pos5);
                break;
        }
    }

    peopleAction(pos: peoplePos) {
        let action = cc.sequence( cc.moveTo(0.3, pos.startX, pos.startY), cc.callFunc(() => {
            let peopleAction = cc.sequence(cc.moveTo(0.1, pos.reboundX, pos.reboundY), cc.callFunc(() => {
                let peopleAction1 = cc.moveTo(0.1, pos.endX, pos.endY);
                this.peopleNode.runAction(peopleAction1)
            }));
            this.peopleNode.runAction(peopleAction);
            this.qiPaoAction();
        }));
        if (this.isRepeat) {
            this.peopleNode.runAction(cc.sequence(cc.place(pos.endX,pos.endY),cc.callFunc(()=>{this.qiPaoAction()})));
        }else {
            this.peopleNode.runAction(action);
        }
    }

    qiPaoAction() {
        let firstRo = -4;
        let TwoRo = 2.5;
        if (this.curType % 2 == 0) {
            firstRo = 4;
            TwoRo = -2.5
        }
        let qiAction = cc.sequence(cc.spawn(cc.fadeTo(0.1, 85), cc.rotateTo(0.1, firstRo)), cc.callFunc(() => {
            let qiAction1 = cc.sequence(cc.spawn(cc.fadeTo(0.2, 170), cc.rotateTo(0.2, TwoRo)), cc.callFunc(() => {
                let qiAction2 = cc.sequence(cc.spawn(cc.fadeTo(0.1, 255), cc.rotateTo(0.1, 0)), cc.callFunc(() => {
                    this.setText();
                }));
                this.qipao.runAction(qiAction2);
            }));
            this.qipao.runAction(qiAction1);
        }));
        this.qipao.runAction(qiAction);
    }

    setText() {
        this.addString(this.curText[this.curIndex]);
    }

    addString(str) {
        this.talkStr.string += str;
        this.scheduleOnce(() => {
            this.textAniType = 1;
            this.curIndex++;
            if (this.curText[this.curIndex]) {
                this.addString(this.curText[this.curIndex]);
            } else {
                this.curIndex = 0;
                this.textAniType = 2;
                this.unscheduleAllCallbacks();
            }
        }, 0.03)
    }
}
