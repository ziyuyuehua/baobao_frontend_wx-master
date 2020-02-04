import ccclass = cc._decorator.ccclass;
import property = cc._decorator.property;
import {ButtonMgr} from "../../common/ButtonClick";
import {DataMgr} from "../../../Model/DataManager";
import {Staff} from "../../../Model/StaffData";
import {ClientEvents} from "../../../global/manager/ClientEventCenter";
import {HashSet} from "../../../Utils/dataStructures/HashSet";
import {FunctionName, JsonMgr} from "../../../global/manager/JsonManager";
import {ResMgr} from "../../../global/manager/ResManager";
import {UIUtil} from "../../../Utils/UIUtil";
import {HttpInst} from "../../../core/http/HttpClient";
import {NetConfig} from "../../../global/const/NetConfig";
import {GameComponent} from "../../../core/component/GameComponent";
import {StaffRole} from "./StaffRole";
import {IRespData} from "../../../types/Response";
import {UIMgr} from "../../../global/manager/UIManager";
import CommoTips from "../../common/CommonTips";
import {Direction, Role} from "../../map/Role";
import {COUNTERTYPE, DotInst} from "../../common/dotClient";
import CommonInsufficient, {InsufficientType} from "../../common/CommonInsufficient";
import {CommonUtil} from "../../../Utils/CommonUtil";
import GoldExchange_wx from "../../exchange/goldExchange_wx";

export interface Attrib_I {
    id?: number;
    value?: number;
}

@ccclass
export class StaffSpecial extends GameComponent {

    @property(cc.Sprite)
    private attribTotalIcon: cc.Sprite = null;

    @property([cc.Node])
    private specialArray: Array<cc.Node> = [];

    @property(cc.Button)
    private backBtn: cc.Button = null;

    @property(cc.Button)
    private changeBtn: cc.Button = null;

    @property(cc.Label)
    private changeConditionLab: cc.Label = null;

    @property(StaffRole)
    private staffRole: StaffRole = null;

    @property(cc.Sprite)
    private jobNameIcon: cc.Sprite = null;

    @property(cc.Label)
    private costValueLab: cc.Label = null;

    @property(cc.Sprite)
    private costIcon: cc.Sprite = null;

    @property(cc.Node)
    private starNode: cc.Node = null;

    @property(cc.Node)
    private tipsNode: cc.Node = null;

    @property(cc.Node)
    private tipBac: cc.Node = null;

    @property(cc.Node)
    private tip: cc.Node = null;

    @property(cc.Node)
    private endNode: cc.Node = null;

    @property(cc.Label)
    private goldLabel: cc.Label = null;

    @property(cc.Node)
    private goldBtn: cc.Node = null;

    @property(cc.Sprite)
    private itemSprite: cc.Sprite = null;

    @property(cc.Label)
    private itemLabel: cc.Label = null;

    @property(cc.Node)
    private itemBtn: cc.Node = null;

    @property(cc.Sprite)
    private talkKuang: cc.Sprite = null;

    @property(cc.Sprite)
    private talkAttrIcon: cc.Sprite = null;

    private chooseStaffData: Staff = null;

    private specialTemplateArray: Array<ISpecialJson> = [];

    private totalAttribArray: Array<Attrib_I> = [];

    private attribTotalIconArray: Array<cc.Sprite> = [];

    static url: string = "staff/list/StaffSpecial";

    // static sendDoneSoftGuide() {
    //     HttpInst.postData(NetConfig.SOFT_LED_INFO, [ArrowType.StaffSpecialArrow]);
    // }
    private isClick: boolean = true;
    private changeType: number = 1;
    private isOpen: boolean = false;

    getBaseUrl() {
        return StaffSpecial.url;
    }

    protected onLoad(): void {
        this.addEvent(ClientEvents.STAFF_UPDATE_STAFF.on(this.onUpdateStaff));
        ButtonMgr.addClick(this.backBtn.node, () => {
            DotInst.clientSendDot(COUNTERTYPE.staff, "6019");
            ClientEvents.UPDATE_STAFF_VIEW.emit();
            this.closeOnly();
        });
        ButtonMgr.addClick(this.tipBac, () => {
            this.tipsNode.active = false;
        })
        ButtonMgr.addClick(this.tip, (btn: cc.Event.EventTouch) => {
            btn.stopPropagation();
        })
        ButtonMgr.addClick(this.changeBtn.node, this.changeBtnCallback);
        this.attribTotalIconArray.push(this.attribTotalIcon);

        ButtonMgr.addClick(this.changeBtn.node, this.changeBtnCallback);
        ButtonMgr.addClick(this.goldBtn, this.goldExchangeBtn);
        this.addEvent(ClientEvents.EVENT_REFRESH_GOLD.on(this.setTopUI));
        this.dispose.add(ClientEvents.REFERSH_MINIWAREHOUSE_NEW.on(() => {
            this.refreshItemNum();
            this.updateCost();
        }));
        this.setTopUI();
        this.refreshItemNum();
        this.dispose.add(ClientEvents.WAREHOUSE_UPDATE_WAREHOUSE.on(() => {
            this.refreshItemNum();
            this.updateCost();
        }))
    }

    goldExchangeBtn = () => {
        if (!JsonMgr.isFunctionOpen(FunctionName.GoldExchange)) {
            let openJson: IFunctionOpenJson = JsonMgr.getFunctionOpenByName(FunctionName.GoldExchange);
            if (openJson.openType == 1) {
                UIMgr.showTipText("金币兑换将于等级" + openJson.value + "级后开启");
                return;
            } else if (openJson.openType == 2) {
                let positionJson: IPositionJson = JsonMgr.getPositionJson(openJson.value);
                UIMgr.showTipText("金币兑换将于职位达到【" + positionJson.name + positionJson.level + "阶】后开启");
                return;
            }
        }
        HttpInst.postData(NetConfig.GET_EXCHANGE_GOLD, [], (response: IRespData) => {
            UIMgr.showView(GoldExchange_wx.url, null, response);
        });
    };

    refreshItemNum = () => {
        let ItemJson: IItemJson = JsonMgr.getItem(150001);
        ResMgr.getItemIcon(this.itemSprite, ItemJson.icon);
        this.itemLabel.string = DataMgr.warehouseData.getItemNum(150001) + "";
    }

    setTopUI = () => {
        const userData = DataMgr.userData;
        UIUtil.setLabel(this.goldLabel, CommonUtil.numChange(userData.gold)); //金币
    }

    onEnable() {
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(false);
        this.onShowPlay(2, this.node.getChildByName("background"));
    }

    onDisable() {
        ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(true);
    }


    protected start(): void {
        this.chooseStaffData = DataMgr.getChooseStaff();
        let curFavorId = JsonMgr.getFavorLevelJson(this.chooseStaffData.favorStage, this.chooseStaffData.favorLevel).id;
        let openFavorId = Number(JsonMgr.getConstVal("refreshSpecialFavor"));
        this.initRole();
        if (curFavorId < openFavorId) {
            this.changeConditionLab.node.active = true;
            this.changeBtn.node.active = false;
            this.backBtn.node.x = -7;
            this.isOpen = false;
        } else {
            this.changeConditionLab.node.active = false;
            this.changeBtn.node.active = true;
            this.isOpen = true;
            this.backBtn.node.x = -167;
            this.updateCost();
        }
        this.refreshView();

        // if (!DataMgr.checkGuideHasCompleteById(ArrowType.StaffSpecialArrow)) {
        //     StaffSpecial.sendDoneSoftGuide();
        // }
    }

    updateCost() {
        let costConfigStr: string = JsonMgr.getConstVal("refreshSpecialIcon1");
        let itemId = Number(costConfigStr.split(",")[0]);
        let itemNum = Number(costConfigStr.split(",")[1]);
        let tzItemNum = DataMgr.getItemNum(itemId);
        if (tzItemNum < itemNum) {
            this.changeType = 2;
            let costConfigStr: string = JsonMgr.getConstVal("refreshSpecialIcon2");
            let moneyId = Number(costConfigStr.split(",")[0]);
            let icon = JsonMgr.getInforMationJson(moneyId).icon;
            ResMgr.getCurrency(this.costIcon, icon, 0.35);
            let cost = Number(costConfigStr.split(",")[1]);
            this.costValueLab.string = "X" + cost;
        } else if (tzItemNum >= itemNum) {
            this.changeType = 1;
            let icon = JsonMgr.getItem(itemId).icon;
            ResMgr.getItemIcon(this.costIcon, icon, 0.35);
            let cost = Number(costConfigStr.split(",")[1]);
            this.costValueLab.string = "X" + cost;
        }
    }

    initRole() {
        UIUtil.asyncSetImage(this.jobNameIcon, this.chooseStaffData.getSuggestJobImageUrl());
        let name: string = this.chooseStaffData.getSuggestJobName();
        let action = null;
        switch (name) {
            case "收银员" :
                action = Role.CASH_ACTION;
                break;
            case "售货员" :
                action = Role.SEAL_ACTION;
                break;
            case "揽客员" :
                action = Role.TOUTER_ACTION;
                break;
            case "理货员" :
                action = Role.TALL_ACTION;
                break;
        }
        this.staffRole.init(this.chooseStaffData, Direction.LEFT, false, action, Role.SMILE_SKIN);
    }

    protected unload(): void {
        this.specialTemplateArray = [];
    }

    private onUpdateStaff = (staffIds: HashSet<number>) => {
        if (!staffIds.has(this.chooseStaffData.staffId)) {
            return;
        }
        this.chooseStaffData = DataMgr.getStaff(this.chooseStaffData.staffId);
        this.specialAnimation();
        //this.refreshView();
    };

    private enableThisSpecial(specialId: number): boolean {
        for (let id of this.chooseStaffData.special) {
            if (id == specialId) return true;
        }
        return false;
    }

    private refreshView() {
        this.totalAttribArray = [];
        if (this.specialTemplateArray.length == 0) {
            this.specialTemplateArray = JsonMgr.getSpecialTemplate(this.chooseStaffData.xmlId);
        }
        UIUtil.asyncSetImage(this.jobNameIcon, this.chooseStaffData.getSuggestJobImageUrl());
        this.initRole();
        for (let i = 0; i < this.specialArray.length; i++) {
            let template = this.specialTemplateArray[i];
            let specialNode = this.specialArray[i];

            let nameLab = specialNode.getChildByName("nameLab").getComponent(cc.Label);
            nameLab.string = template.specialName;

            let nameBgImg = specialNode.getChildByName("nameBgImg").getComponent(cc.Sprite);

            let attribNode = <cc.Node>specialNode.getChildByName("attribBgImg");

            if (this.enableThisSpecial(template.specialId)) {
                DotInst.clientSendDot(COUNTERTYPE.staff, "6017", template.specialId.toString(), "0");
                let index = Number(template.specialAdd.split(";")[0].split(",")[0]);
                this.setSpecialTiao(nameBgImg, index);
                attribNode.active = true;
                this.refreshSingleAttribView(attribNode, template.specialAdd);
            } else {
                ResMgr.getSpecialBackgroundImg(nameBgImg, "special_tiao4");
                ButtonMgr.addClick(this.specialArray[i], (btn: cc.Event.EventTouch) => {
                    DotInst.clientSendDot(COUNTERTYPE.staff, "6017", template.specialId.toString(), "1");
                    btn.stopPropagation();
                    this.tipsNode.active = true;
                    this.tip.x = this.specialArray[i].position.x;
                    this.tip.y = this.specialArray[i].position.y;
                    this.showTips(template.specialAdd);
                }, null, null, this.TouchCancle, this);
                attribNode.active = false;
            }
        }

        this.refreshTopTotalAttribView();
    }

    showTips(data) {
        let attribArray: Array<Attrib_I> = [];
        let attribStrArray = data.split(";");   //"2，50","6，20"
        for (let attribStr of attribStrArray) {
            let attrib: Attrib_I = {};
            let temp = attribStr.split(",");
            attrib.id = Number(temp[0]);
            attrib.value = Number(temp[1]);
            attribArray.push(attrib);        //[{2,50},{6,20}]
        }
        // attribArray.sort((a: Attrib_I, b: Attrib_I) => {
        //     if (a.id > b.id) return 1;
        //     return -1;
        // });
        for (let i = 0; i < attribArray.length; i++) {
            let attrib = attribArray[i];
            let Icon = this.tip.getChildByName("icon" + (i + 1)).getComponent(cc.Sprite);
            let value = this.tip.getChildByName("num" + (i + 1)).getComponent(cc.Label);
            let icon = Staff.getStaffAttrIconByXmlId(attrib.id);
            UIUtil.asyncSetImage(Icon, icon);
            value.string = "+" + attrib.value;
        }
    }

    TouchCancle = (event) => {
        if (event.currentTouch) {
            UIMgr.closeView(CommoTips.url);
        }
    };

    private refreshTopTotalAttribView() {
        this.totalAttribArray.sort((a: Attrib_I, b: Attrib_I) => {
            if (a.id > b.id) return 1;
            return -1;
        });
        for (let icon of this.attribTotalIconArray) {
            icon.node.active = false;
        }
        let range = [-300, 240];
        let totalCount = this.totalAttribArray.length;
        let step = (range[1] - range[0]) / (totalCount + 1) + 10;
        let attArr: number[] = [];
        let attIdArr: number[] = [];
        for (let i = 0; i < totalCount; i++) {
            let attrib = this.totalAttribArray[i];
            let attribSprite = this.attribTotalIconArray[i];
            if (!attribSprite) {
                let cloneNode = cc.instantiate(this.attribTotalIconArray[0].node);
                cloneNode.parent = this.attribTotalIconArray[0].node.parent;
                attribSprite = cloneNode.getComponent(cc.Sprite);
                this.attribTotalIconArray.push(attribSprite);
            }
            attribSprite.node.active = true;

            let icon = Staff.getStaffAttrIconByXmlId(attrib.id);
            UIUtil.asyncSetImage(attribSprite, icon);

            let attribTotalValueRichLab = attribSprite.node.getChildByName("attribTotalValue").getComponent(cc.RichText);
            // let attJson: IAttributeJson = JsonMgr.getAttributeJson(attrib.id);
            // attribTotalValueRichLab.string = "<color=#956247>" + attJson.attributeName + "</c><color=#3ca900>+" + attrib.value + "</color>";
            attribTotalValueRichLab.string = "<color=#3ca900>+" + attrib.value + "</color>";
            attArr.push(Number(attrib.value));
            attIdArr.push(Number(attrib.id));
            attribSprite.node.x = range[0] + step * (i + 1) - 40;
        }
        this.talkKuang.node.active = this.isOpen;
        if (this.isOpen) {
            let max = Math.max.apply(null, attArr);
            let attId = attIdArr[attArr.indexOf(max)];
            let attIcon: string = JsonMgr.getAttributeById(attId).attributeIcon;
            // let calc = new MathCalc();
            // let degree = JsonMgr.getConstVal("specialDescriNum");
            // let expr = calc.parse(degree);
            // expr.scope = {value: Number(max)};
            let testnum = max < 185 ? 1 : (max < 256 ? 2 : 3);
            switch (testnum) {
                case 1:
                    ResMgr.getSpacialTaiCiIcon(this.talkKuang, "fensan");
                    this.talkAttrIcon.node.active = false;
                    break;
                case 2:
                    ResMgr.getSpacialTaiCiIcon(this.talkKuang, "good");
                    this.talkAttrIcon.node.active = true;
                    ResMgr.getAttributeIcon(this.talkAttrIcon, attIcon);
                    break;
                case 3:
                    ResMgr.getSpacialTaiCiIcon(this.talkKuang, "zuiqiang");
                    this.talkAttrIcon.node.active = true;
                    ResMgr.getAttributeIcon(this.talkAttrIcon, attIcon);
                    break;
            }
        }
    }

    private refreshSingleAttribView(attribNode: cc.Node, specialAdd: string) {
        let attribArray: Array<Attrib_I> = [];

        let attribStrArray = specialAdd.split(";");
        for (let attribStr of attribStrArray) {
            let attrib: Attrib_I = {};
            let temp = attribStr.split(",");
            attrib.id = Number(temp[0]);
            attrib.value = Number(temp[1]);
            attribArray.push(attrib);
        }
        // attribArray.sort((a: Attrib_I, b: Attrib_I) => {
        //     if (a.id > b.id) return 1;
        //     return -1;
        // });

        for (let i = 0; i < attribArray.length; i++) {
            let attrib = attribArray[i];
            let node = <cc.Node>attribNode.getChildByName("attribIcon" + (i + 1));

            let attribIcon = <cc.Sprite>node.getComponent(cc.Sprite);
            let icon = Staff.getStaffAttrIconByXmlId(attrib.id);
            UIUtil.asyncSetImage(attribIcon, icon);

            let attribValue = <cc.Label>node.getChildByName("attribValue").getComponent(cc.Label);
            attribValue.string = "+" + attrib.value;

            let had = false;
            for (let totalAttrib of this.totalAttribArray) {
                if (totalAttrib.id == attrib.id) {
                    totalAttrib.value += attrib.value;
                    had = true;
                    break;
                }
            }
            if (!had) {
                this.totalAttribArray.push(attrib);
            }
        }
    }

    private changeBtnCallback = () => {
        if (!this.isClick) return;
        if (this.changeType == 2) {
            let costConfigStr: string = JsonMgr.getConstVal("refreshSpecialIcon2");
            let cost = Number(costConfigStr.split(",")[1]);
            if (DataMgr.userData.gold < cost) {
                UIMgr.showView(CommonInsufficient.url, null, InsufficientType.Gold);
                return;
            }
        }
        DotInst.clientSendDot(COUNTERTYPE.staff, "6018");
        this.talkKuang.node.active = false;
        HttpInst.postData(NetConfig.SPECIAL_INFO, [this.chooseStaffData.staffId],
            (resp: IRespData) => {
                DataMgr.updateStaff(resp);
            });
    };

    setSpecialStatus() {
        this.starNode.active = false;
        this.endNode.active = true;
        if (this.specialTemplateArray.length == 0) {
            this.specialTemplateArray = JsonMgr.getSpecialTemplate(this.chooseStaffData.xmlId);
        }
        for (let i = 0; i < this.specialArray.length; i++) {
            let specialNode = this.specialArray[i];
            let nameBgImg = specialNode.getChildByName("nameBgImg").getComponent(cc.Sprite);
            let attribNode = specialNode.getChildByName("attribBgImg");
            let animation = specialNode.getChildByName("animation").getComponent(cc.Animation);
            let frameNode = specialNode.getChildByName("frameIcon").getComponent(cc.Sprite);
            ResMgr.getSpecialBackgroundImg(nameBgImg, "special_tiao4");
            if (i < 4) {
                let str: string = "light" + i;
                let lightNode = this.endNode.getChildByName(str).getComponent(cc.Sprite);
                lightNode.node.active = false;
            }
            animation.stop();
            attribNode.active = false;
            frameNode.node.active = false;
            animation.node.active = false;
        }
    }

    specialAnimation() {
        this.setSpecialStatus();
        let nid = 0;
        let end = 0;
        let lightNum: number = 0;
        let num = [];
        this.schedule(() => {
            this.isClick = false;
            let template = this.specialTemplateArray[nid];
            let index: number = Number(template.specialAdd.split(";")[0].split(",")[0]);
            let frameNode = this.specialArray[nid].getChildByName("frameIcon").getComponent(cc.Sprite);
            let attribNode = this.specialArray[nid].getChildByName("attribBgImg");
            let nameBgImg = this.specialArray[nid].getChildByName("nameBgImg").getComponent(cc.Sprite);
            let animation = this.specialArray[nid].getChildByName("animation").getComponent(cc.Animation);
            if (nid % 2 == 0) {
                nid += 2;
            } else {
                nid -= 2;
            }
            if (nid == 8) {
                nid = 7;
            }
            this.setSpecialFrame(frameNode, index);
            if (lightNum == 4) lightNum = 0;
            this.setLightAni(lightNum);
            lightNum++;
            frameNode.node.active = true;
            let action = cc.sequence(cc.fadeIn(0.1), cc.callFunc(() => {
                frameNode.node.active = false;
                if (end == 2) {
                    if (this.enableThisSpecial(template.specialId)) {
                        attribNode.active = true;
                        animation.node.active = true;
                        frameNode.node.active = true;
                        num.push(template.specialId);
                        this.setSpecialTiao(nameBgImg, index);
                        this.setSpecialFrame(frameNode, index);
                        animation.play();
                        if (num.length == 4) {
                            this.isClick = true;
                            this.initRole();
                            this.refreshView();
                            frameNode.node.active = false;
                            this.unscheduleAllCallbacks();
                            this.setEndLightStatus();
                            this.itemRearesh();
                        }
                    }
                }
            }));
            frameNode.node.runAction(action);
            if (nid < 0) {
                lightNum = 0;
                nid = 0;
                end++;
            }
        }, 0.15);
    }

    itemRearesh() {
        for (let i = 0; i < this.specialArray.length; i++) {
            let template = this.specialTemplateArray[i];
            ButtonMgr.removeClick(this.specialArray[i], this);
            if (!this.enableThisSpecial(template.specialId)) {
                ButtonMgr.addClick(this.specialArray[i], null, null, (btn: cc.Event.EventTouch) => {
                    btn.stopPropagation();
                    btn.stopPropagation();
                    this.tipsNode.active = true;
                    this.tip.x = this.specialArray[i].position.x;
                    this.tip.y = this.specialArray[i].position.y;
                    this.showTips(template.specialAdd);
                }, this.TouchCancle, this);
            }
        }
    }

    setSpecialTiao(sprite: cc.Sprite, index: number) {
        if (index == 0) {
            ResMgr.getSpecialBackgroundImg(sprite, "special_tiao3");
        } else if (index == 1) {
            ResMgr.getSpecialBackgroundImg(sprite, "special_tiao1");
        } else if (index == 2) {
            ResMgr.getSpecialBackgroundImg(sprite, "special_tiao2");
        } else {
            ResMgr.getSpecialBackgroundImg(sprite, "special_tiao5");
        }
    }

    setSpecialFrame(sprite: cc.Sprite, index: number) {
        if (index == 0) {
            ResMgr.getSpecialBackgroundImg(sprite, "lanse");
        } else if (index == 1) {
            ResMgr.getSpecialBackgroundImg(sprite, "lvse");
        } else if (index == 2) {
            ResMgr.getSpecialBackgroundImg(sprite, "zise");
        } else {
            ResMgr.getSpecialBackgroundImg(sprite, "chengse");
        }
    }

    setLightAni(index: number) {
        let str: string = "light" + index;
        let lightNode = this.endNode.getChildByName(str);
        lightNode.active = true;
        let action = cc.sequence(cc.fadeIn(0.1), cc.callFunc(() => {
            lightNode.active = false;
        }));
        lightNode.runAction(action);
    }

    setEndLightStatus() {
        let specialArr = this.chooseStaffData.special.sort((a, b) => {
            return a - b;
        });
        for (let i = 0; i < specialArr.length; i++) {
            let str: string = "light" + i;
            let lightNode = this.endNode.getChildByName(str);
            lightNode.active = true;
        }
    }
}
