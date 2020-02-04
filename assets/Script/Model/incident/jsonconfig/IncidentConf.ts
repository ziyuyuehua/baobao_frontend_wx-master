/**
 * User: cJian
 * Date: 2019/8/9 2:45 PM
 * Note: ...
 */
import { CommonUtil } from "../../../Utils/CommonUtil";
import { IncidentShowConf } from "./IncidentShowConf";
import { JsonMgr } from "../../../global/manager/JsonManager";
import { MathCalc } from "../../../Utils/MathCalc";
export class IncidentConf {
    private json: IIncidentJson = null;

    private _showConf: IncidentShowConf = null;
    constructor() {

    }
    init(json: IIncidentJson) {
        this.json = json;
    }
    get desc() {
        return this.json.description[0];
    }

    getRewards() {
        return CommonUtil.toRewards(this.json.rewards);
    }
    getRewardId() {
        return this.json.assistanceRewardId;
    }
    get staffAttrs() {
        if(this.json.staffAttrs == null)
        {
            return [];
        }
        let attrs = this.json.staffAttrs.split(';');
        return attrs;
    }

    get getSpecialAdd() {
        if(this.json.specialAdd == null)
        {
            return [];
        }
        let specials = this.json.specialAdd.split(';');
        return specials;
    }

    get staffLevel() {
        return this.json.staffLevel;
    }
    get staffMaxNum() {
        if (this.json.staffMaxNum) {
            return this.json.staffMaxNum;
        }
        return 1;
    }
    // readonly degree: number;
    // readonly degreeFormula: string;
    // readonly description: number;
    // readonly duration: number;
    // readonly fatigueTime: number;
    // readonly helpFormula: string;
    // readonly helpRewards: string;
    // readonly levelRange: number[];
    // readonly maxHelpDegree: number;
    // readonly rewards: string;
    // readonly staffAttrs: string;
    // readonly staffLevel: number;
    // readonly type: number;
    // readonly weight: number;

    //疲劳时间
    getFatigueTime() {
        return this.json.fatigueTime;
    }
    getDescription() {
        return this.json.description;
    }
    getDegree() {
        return this.json.degree;
    }

    getDegreeFormula() {
        return this.json.degreeFormula;
    }

    getassistanceRankReward() {
        return this.json.assistanceRankReward;
    }

    calcDegreeFormula(attr: number, limitattr: number, isInHome: boolean = true) {
        let calc = new MathCalc();
        let degree = this.json.degreeFormula;
        if (!isInHome) {
            degree = this.json.helpFormula;
        }
        let expr = calc.parse(degree);
        expr.scope = { attrs: attr, limitAttrs: limitattr };
        let r = expr.eval();
        return Math.floor(r);
    }

    getHelpRewards()
    {
        return this.json.helpRewards;
    }

    getMaxHelpDegree() {
        return this.json.maxHelpDegree;
    }

    getType() {
        return this.json.type;
    }
    get showConf() {
        if (this._showConf == null) {
            this._showConf = JsonMgr.getIncidentShowById(this.desc);
        }
        return this._showConf;
    }
}

