import { TextIncidentConst } from "../../global/const/TextTipConst";
import { ResManager } from "../../global/manager/ResManager";
import { Staff } from "../../Model/StaffData";
import { StringUtil } from "../../Utils/StringUtil";
import { UIUtil } from "../../Utils/UIUtil";
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
export default class incidentAddSpecialInfo extends cc.Component {

    @property(cc.Label)
    titlelbl: cc.Label = null;

    @property(cc.Sprite)
    iconSprite: cc.Sprite = null;

    @property(cc.Label)
    contentlbl: cc.Label = null;

    private _genders: string[] = ["女", "男"];

    init(strs: string) {
        let values = strs.split(',');
        if (values.length != 3) {
            // console.log("specialAdd is miss.");
            return;
        }

        let value0: number = Number(values[1]);
        let value1: number = Number(values[2]);

        if (values[0] == "1") {//性别
            this.titlelbl.string = "性别:";
            UIUtil.asyncSetImage(this.iconSprite, ResManager.getIncidentSpecialUrl() + "incident_" + (value0 ? "nan" : "nv"), false);
            this.contentlbl.string = StringUtil.format("{0}性 +{1}", TextIncidentConst.getGenderTex(value0), value1);
        } else if (values[0] == "2") {//角色
            this.titlelbl.string = "角色:";
            UIUtil.asyncSetImage(this.iconSprite, ResManager.getIncidentSpecialUrl() + "incident_juese", false);
            this.contentlbl.string = StringUtil.format("{0} +{1}", Staff.getStaffName(value0), value1);
        } else if (values[0] == "3") {//推荐岗位
            this.titlelbl.string = "推荐岗位:";
            UIUtil.asyncSetImage(this.iconSprite, ResManager.getIncidentSpecialUrl() + "incident_jian", false);
            this.contentlbl.string = StringUtil.format("{0} +{1}", Staff.getJobName(value0), value1);
        } else if (strs[0] == "4") {//好感度
            this.titlelbl.string = "好感度:";
            UIUtil.asyncSetImage(this.iconSprite, ResManager.getIncidentSpecialUrl() + "incident_haogandu", false);
            this.contentlbl.string = StringUtil.format("红心{0}阶 +{1}", value0, value1);
        } else { //擅长类型
            this.titlelbl.string = "技能:";
            UIUtil.asyncSetImage(this.iconSprite, Staff.getStaffAdvantageMinIconUrl(value0), false);
            this.contentlbl.string = StringUtil.format("{0} +{1}", Staff.getStaffAdvStr(value0) + "推销员", value1);
        }

    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}
