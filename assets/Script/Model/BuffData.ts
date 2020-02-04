import { StaffAttr } from "./StaffData";
import { JsonMgr } from "../global/manager/JsonManager";


export class BuffData {
    buffIds: Array<number> = [];

    setBuffIds = (response: number[]) => {
        this.buffIds = response;
    };

    private getStaffEffects = (effectiveType: EffectiveType, staffIds: Array<number>): { [key: number]: Array<IDecoEffectJson> } => {
        let staffEffects: { [key: number]: Array<IDecoEffectJson> } = {};
        this.buffIds
            .filter(buffId => this.selectFilter(buffId, effectiveType, staffIds))
            .forEach((id: number, idx: number, ids: Array<number>) => {
                let effect: IDecoEffectJson = JsonMgr.getDecoEffectJson(id);

                let effectArray: Array<IDecoEffectJson> = staffEffects[effect.staffId];
                if (effectArray == null || effectArray == undefined) {
                    effectArray = new Array<IDecoEffectJson>();
                    staffEffects[effect.staffId] = effectArray;
                }

                effectArray.push(effect);
            });
        for (let index = 0; index < staffIds.length; index++) {
            if (!staffEffects[staffIds[index]]) {
                staffEffects[staffIds[index]] = [];
            }
        }
        return staffEffects;
    };

    //特殊家具加成
    getEffects = (effectiveType: EffectiveType, staffIds: Array<number>): Effects => {
        let staffEffects: { [key: number]: Array<IDecoEffectJson> } = this.getStaffEffects(effectiveType, staffIds);

        if (effectiveType == EffectiveType.ASSISTANCE) {
            return new Effects(staffEffects);
        }
        if (effectiveType == EffectiveType.CRISIS) {
            let crisisEffect = new CrisisEffects(staffEffects);
            crisisEffect.init();
            return crisisEffect;
        }
        return null;
    };

    private selectFilter = (buffId: number, effectiveType: EffectiveType, staffIds: Array<number>): boolean => {
        let effect: IDecoEffectJson = JsonMgr.getDecoEffectJson(buffId);
        if (effect == null || effect == undefined || effect.functionType != effectiveType) {
            return false;
        }
        return staffIds.indexOf(effect.staffId) >= 0;
    };
}


export enum EffectiveType {
    /** 上岗 **/
    JOB = 1,
    /** 巅峰对决 **/
    BATTLE = 2,
    /** 协助 **/
    ASSISTANCE = 3,
    /** 危机 **/
    CRISIS = 4,
}

export enum EffectType {
    /** 智慧 **/
    INTELLIGENCE = 0,
    /** 灵巧 机敏 口才 **/
    PATIENCE = 1,
    /** 亲和力 **/
    GLAMOUR = 2,
    /** 体力 耐力 **/
    POWER = 3,
    /** 海报架销售额增加（只有上岗用） **/
    POSTER = 4,
    /** 书架销售额增加（只有上岗用） **/
    BOOKSHELF = 5,
    /** 衣架销售额增加（只有上岗用） **/
    HANGER = 6,
    /** 展示架销售额增加（只有上岗用） **/
    DISPLAY_STAND = 7,
    /** 光盘架销售额增加（只有上岗用） **/
    CD_HOLDER = 8,
    /** 收银员智慧增加（只有店铺对决用） **/
    CASHIER = 9,
    /** 售货员灵巧增加（只有店铺对决用） **/
    SALESPERSON = 10,
    /** 揽客员亲和增加（只有店铺对决用） **/
    CROWD = 11,
    /** 理货员体力增加（只有店铺对决用） **/
    TALLY = 12,
    /** 数值影响增加（只有社区协助、危机用） **/
    INCIDENT = 13,
    /** 全体数值影响增加（只有危机用） **/
    CRISIS = 14,
}


export class Effects {
    effects: { [key: number]: Array<IDecoEffectJson> } = {};

    constructor(effects: { [key: number]: Array<IDecoEffectJson> }) {
        this.effects = effects;
        this.init();
    }


    protected init = () => {

    };

    private checkEffectType = (config: IDecoEffectJson, effectType: EffectType): boolean => {
        if (config.effectType == effectType) {
            return true;
        }
        return effectType == EffectType.INCIDENT && config.effectType == EffectType.CRISIS;
    }

    private getValue = (staffXmlId: number, effectType: EffectType, value: number): number => {
        let list: Array<IDecoEffectJson> = this.effects[staffXmlId];
        if (list == null || list == undefined || list.length <= 0) {
            return value;
        }

        let dataVo1: number[] = list.filter(effect => this.checkEffectType(effect, effectType) && effect.valueType == 1).map(effect => effect.value)
        let incrValue: number = dataVo1.length > 0 ? dataVo1.reduce((a, b) => a + b) : 0;
        let dataVo: number[] = list.filter(effect => this.checkEffectType(effect, effectType) && effect.valueType == 2).map(effect => effect.value)
        let percent: number = dataVo.length > 0 ? dataVo.reduce((a, b) => a + b) : 0;
        return (value + incrValue) * (100 + percent) / 100;
    };

    private transform = (staffAttr: StaffAttr): EffectType => {
        if (staffAttr == StaffAttr.power) {
            return EffectType.POWER;
        }
        if (staffAttr == StaffAttr.patience) {
            return EffectType.PATIENCE;
        }
        if (staffAttr == StaffAttr.intelligence) {
            return EffectType.INTELLIGENCE;
        }
        if (staffAttr == StaffAttr.glamour) {
            return EffectType.GLAMOUR;
        }
        return null;
    };
    // getAttribute = (staffXmlId: number, staffAttr: StaffAttr, value: number): number => {
    //     return this.getValue(staffXmlId, this.transform(staffAttr), value);
    // };
    //属性加成
    getAttribute = (staffXmlId: number, staffAttr: EffectType, value: number): number => {
        return this.getValue(staffXmlId, staffAttr, value);
    };

    //总值
    getIncident = (staffXmlId: number, value: number): number => {
        return this.getValue(staffXmlId, EffectType.INCIDENT, value);
    };
}

class CrisisEffects extends Effects {

    init = () => {
        let globalEffects: { [key: number]: Array<IDecoEffectJson> } = {};

        for (let staffId in this.effects) {
            let es: Array<IDecoEffectJson> = this.effects[staffId].filter(effect => effect.effectType == EffectType.CRISIS);
            if (es == null || es == undefined || es.length <= 0) {
                continue;
            }
            globalEffects[staffId] = es;
        }
        for (let globalStaffId in globalEffects) {
            for (let staffId in this.effects) {
                if (staffId == globalStaffId) {
                    continue;
                }
                globalEffects[globalStaffId].forEach(effect => this.effects[staffId].push(effect));
            }
        }
    };
}