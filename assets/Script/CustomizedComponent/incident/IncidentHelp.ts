import {IncidentModel} from "../../Model/incident/IncidentModel";
import IncidentSpecilAddItem from "./IncidentSpecilAddItem";
import {IncidentSpecialInfo} from "./IncidentSpecialInfo";
import {TextIncidentConst, TextTipConst} from "../../global/const/TextTipConst";
import {ResManager} from "../../global/manager/ResManager";
import {Staff} from "../../Model/StaffData";
import {ConditionType, IncidentStaffItem} from "./IncidentStaffItem";
import List from "../../Utils/GridScrollUtil/List";
import {DataMgr} from "../../Model/DataManager";
import {UIMgr} from "../../global/manager/UIManager";
import {StaffRole} from "../staff/list/StaffRole";
import {EffectiveType, Effects} from "../../Model/BuffData";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

export class StaffItemInfo {
    public listId: number = -1;
    public isSelect: boolean = false;
    public staff: Staff = null;
    public notype: ConditionType = null;
}

export interface IncidentAnimationInter {
    _model: IncidentModel,
    staffIds: StaffItemInfo[],
    _finish: boolean
}

//计算增加的属性
/**
 * 数据->incidentModel
 * 存放的位置->layout
 * 属性预设->prefab
 * 属性arr->智力，体力，亲和，灵敏->口才
 * staff
 */
export function CalculationSpecialAdd(incidentModel: IncidentModel, incidentLayout: cc.Layout, incidentPrefab: cc.Prefab,
                                      staffattris: string[], values: StaffItemInfo[], isInHome: boolean = true) {
    let conf = incidentModel.conf;
    let specials = conf.getSpecialAdd;
    let specialValue: number = 0;

    if (specials.length > 0) {
        if (incidentLayout) {
            incidentLayout.node.removeAllChildren();
        }
        for (let index = 0; index < specials.length; index++) {
            let item: IncidentSpecilAddItem = null;
            if (incidentPrefab) {
                let node = cc.instantiate(incidentPrefab);
                incidentLayout.node.addChild(node);
                item = node.getComponent(IncidentSpecilAddItem);
            }
            let strs = specials[index].split(',');
            if (strs.length != 3) {
                console.log("specialaddtion data is less than 3.");
                continue;
            }
            let key = Number(strs[1]);
            let value = Number(strs[2]);
            let info: IncidentSpecialInfo = null;

            if (strs[0] == "1") {
                info = getSpecialAdditionGenderNo(key, value, values, incidentModel);
            } else if (strs[0] == "2") {
                info = getSpecialAdditionRoleNo(key, value, values, incidentModel);
            } else if (strs[0] == "3") {
                info = getSpecialAdditionRecommendedNo(key, value, values, incidentModel);
            } else if (strs[0] == "4") {
                info = getSpecialAdditionSensibilityNo(key, value, values, incidentModel);
            } else {
                info = getSpecialAdditionType(key, value, values, incidentModel);
            }
            if (item) {
                item.init(info);
            }
            specialValue += info.value;
        }
    }

    let attrisval: number = 0;
    //智力，体力，亲和，灵敏->口才
    let attrarrays: number[] = [];

    //特殊装饰加成->value
    let keys: number[] = [];
    for (let i = 0; i < values.length; ++i) {
        keys.push(values[i].staff.xmlId);
    }
    let effct: Effects = null
    if (incidentModel.getIsIncident()) {
        effct = DataMgr.getBuffData().getEffects(EffectiveType.CRISIS, keys);
    } else if (incidentModel.getIsAssist()) {
        effct = DataMgr.getBuffData().getEffects(EffectiveType.ASSISTANCE, keys);
    }

    for (let i = 0; i < values.length; i++) {
        let staffValue: number = 0;
        let staffXmlId = values[i].staff.xmlId;
        let qualified: boolean = true;
        attrarrays.splice(0, attrarrays.length);
        for (let index = 0; index < staffattris.length; ++index) {
            let staffattr = staffattris[index];
            let attris: string[] = staffattr.split(',');
            if (attris.length != 2) {
                // console.log("attris length is not good!");
                continue;
            }

            let key: number = Number(attris[0]);
            let value: number = Number(attris[1]);

            let val: number = values[i].staff.attrValues()[key];
            if (effct) {
                val = effct.getAttribute(staffXmlId, key, values[i].staff.getAttrByXmlId(key))
            }

            if (val >= value) {//条件符合
                attrarrays.push(val);
                attrarrays.push(value);
            } else {
                qualified = false;
                break;
            }
        }

        if (qualified) {
            let curStaffAtt: number = 0;
            for (let i = 0; i < attrarrays.length; i += 2) {
                curStaffAtt += conf.calcDegreeFormula(attrarrays[i], attrarrays[i + 1], isInHome);
            }
            if (effct) {
                curStaffAtt = Math.floor(effct.getIncident(staffXmlId, curStaffAtt));
            }
            staffValue += curStaffAtt;
        }

        if (incidentModel.getIsAssist()) {
            if (values[i]) {
                let upVo: IAssistanceUpJson = values[i].staff.judgeIsUpStaff()
                if (upVo) {
                    staffValue *= (100 + upVo.addPercent) / 100;
                }
            }
        }
        attrisval += staffValue;
    }


    attrisval += specialValue;

    return Math.floor(attrisval);
}


//性别
export function getSpecialAdditionGenderNo(gender: number, value: number, values: StaffItemInfo[], incidentInfo: IncidentModel): IncidentSpecialInfo {
    let num = 0;
    let genderStr: string = TextIncidentConst.getGenderTex(gender);
    for (let i = 0; i < values.length; i++) {
        if (gender == values[i].staff.getGender()) {
            ++num;
        }
    }

    let speInfo: IncidentSpecialInfo = new IncidentSpecialInfo;
    let des = genderStr + " +" + value.toString() + ((num > 1) ? (" x" + num) : "");
    speInfo.useColor = (num != 0);
    speInfo.iconUrl = ResManager.getIncidentSpecialUrl() + "incident_" + (gender ? "nan" : "nv");
    speInfo.descTxt = des;
    speInfo.value = num * value;
    return speInfo;
}

//角色
export function getSpecialAdditionRoleNo(roleid: number, value: number, values: StaffItemInfo[], incidentInfo: IncidentModel): IncidentSpecialInfo {
    let num = 0;
    let roleName: string = Staff.getStaffName(roleid);
    //let roleIcon : string = Staff.getStaffAvataUrlById(roleid);
    for (let i = 0; i < values.length; ++i) {
        if (roleid == values[i].staff.xmlId) {
            ++num;
        }
    }

    let speInfo: IncidentSpecialInfo = new IncidentSpecialInfo;
    speInfo.iconUrl = ResManager.getIncidentSpecialUrl() + "incident_juese";
    speInfo.descTxt = roleName + " +" + value.toString() + ((num > 1) ? (" x" + num) : "");
    speInfo.useColor = (num != 0);
    speInfo.value = num * value;
    return speInfo;
}

//推荐岗位
export function getSpecialAdditionRecommendedNo(fitjob: number, value: number, values: StaffItemInfo[], incidentInfo: IncidentModel): IncidentSpecialInfo {
    let num = 0;
    //let jobUrl :string = Staff.getStaffSuggestJobImageUrl(fitjob);

    for (let i = 0; i < values.length; ++i) {
        if (values[i].staff.getSuggestId() == fitjob) {
            ++num;
        }
    }
    let speInfo: IncidentSpecialInfo = new IncidentSpecialInfo;
    speInfo.iconUrl = ResManager.getIncidentSpecialUrl() + "incident_jian";
    speInfo.descTxt = Staff.getJobName(fitjob) + " +" + value.toString() + ((num > 1) ? (" x" + num) : "");
    ;
    speInfo.useColor = (num != 0);
    speInfo.value = value * num;
    return speInfo;
}

//好感度
export function getSpecialAdditionSensibilityNo(starLevel: number, value: number, values: StaffItemInfo[], incidentInfo: IncidentModel): IncidentSpecialInfo {
    let num = 0;
    for (let i = 0; i < values.length; ++i) {
        if (values[i].staff.favorLevel >= starLevel) {
            ++num;
        }
    }
    let speInfo: IncidentSpecialInfo = new IncidentSpecialInfo;
    speInfo.iconUrl = ResManager.getIncidentSpecialUrl() + "incident_haogandu";
    speInfo.descTxt = "红心" + starLevel + "阶 +" + value.toString() + ((num > 1) ? (" x" + num) : "");
    ;
    speInfo.useColor = (num != 0);
    speInfo.value = num * value;
    return speInfo;
}

//擅长类型
export function getSpecialAdditionType(type: number, value: number, values: StaffItemInfo[], incidentInfo: IncidentModel): IncidentSpecialInfo {
    let num = 0;
    for (let i = 0; i < values.length; ++i) {
        if (values[i].staff.isHaveAdvantages(type)) {
            ++num;
        }
    }
    let speInfo: IncidentSpecialInfo = new IncidentSpecialInfo;
    speInfo.iconUrl = Staff.getStaffAdvantageMinIconUrl(type);
    speInfo.descTxt = Staff.getStaffAdvStr(type) + "推销员" + " +" + value.toString() + ((num > 1) ? (" x" + num) : "");
    speInfo.useColor = (num != 0);
    speInfo.value = num * value;
    return speInfo;
}

//一键选择逻辑
/**
 *
 * 列表
 * 进度
 * isForward
 * 数据
 * 初始方法
 * StaffItemInfo[]
 * 增加选中角色
 * 回调函数
 */
export function autoSelectHandle(scol: List, progress: cc.ProgressBar, isForward: boolean = true, _model: IncidentModel, clearFunc: Function = null,
                                 staffItems: StaffItemInfo[], addSelectRole: Function = null, cb: Function = null) {
    clearFunc && clearFunc(scol)
    let hasAnyBody: boolean = false;
    let values = staffItems;
    let count = 0;
    let maxStaffNum: number = 0;

    if (_model.getIsIncident()) {
        maxStaffNum = DataMgr.isInFriendHome() ? 1 : _model.conf.staffMaxNum;
    } else {
        maxStaffNum = _model.conf.staffMaxNum;
    }

    //for(let i = 0; i < values.length && count < maxStaffNum;++i)
    for (let i = getStart(values, isForward); checkEnd(i, values, isForward) && count < maxStaffNum; i = getNext(i, isForward)) {
        if (values[i].notype.isConditionCan()) {
            hasAnyBody = true;
            ++count;
            values[i].isSelect = true;

            if (values[i].listId >= 0) {
                let itemNode = scol.getItemByListId(values[i].listId);
                if (itemNode != null) {
                    let item: IncidentStaffItem = itemNode.getComponent(IncidentStaffItem);
                    if (item != null) {
                        item.isSelect = true;
                    } else {
                        addSelectRole && addSelectRole(values[i]);
                        cb && cb();
                    }
                } else {
                    addSelectRole && addSelectRole(values[i]);
                    cb && cb();
                }
            } else {
                addSelectRole && addSelectRole(values[i]);
                cb && cb();
            }

            if (_model.getIsIncident()) {
                if (progress == null || progress.progress <= 0) {
                    break;
                }
            }

        }
    }

    if (!hasAnyBody) {
        UIMgr.showTipText(TextTipConst.QUICK_SELECTION);
    }

}

function getStart(values: StaffItemInfo[], isForward: boolean) {
    return isForward ? 0 : values.length - 1;
}

function checkEnd(index: number, values: StaffItemInfo[], isForward: boolean) {
    return isForward ? index < values.length : index >= 0;
}

function getNext(index: number, isForward: boolean) {
    return isForward ? ++index : --index;
}

/**
 * 增加选中角色
 * StaffItemInfo -> staffitem信息
 * modle->当前协助数据
 * selectRoles -> 选中的角色组
 * selectMaps
 * rolePrefab->角色模型
 * selectNode->父类
 * 回调函数
 */
export function comAddSelectRole(staffItemInfo: StaffItemInfo, _model: IncidentModel, selectRoles: StaffRole[], selectMaps: StaffItemInfo[],
                                 rolePrefab: cc.Prefab, selectNode: cc.Node, cb: Function) {
    let staff = staffItemInfo.staff;
    for (let i = 0; i < selectRoles.length; ++i) {
        if (selectRoles[i] != null && selectRoles[i].getStaff().staffId == staff.staffId) {
            return;
        }
    }
    selectMaps.push(staffItemInfo);
    let conf = _model.conf;
    if (isMaxSelectRole(_model, selectRoles)) {
        UIMgr.showTipText(TextTipConst.MAX_ROLEMODEL);
        return;
    }
    let pos = getEmptyIndex(selectRoles);
    let node = cc.instantiate(rolePrefab);
    let role: StaffRole = node.getComponent(StaffRole);
    role.setStaff(staff);
    selectRoles[pos] = role;
    node.parent = selectNode;
    cb && cb();
    return role;
}

//是否大于最多上人数
function isMaxSelectRole(_model, selectRoles) {
    let conf = _model.conf;
    let maxNum = conf.staffMaxNum;//最多模型数量
    let count = 0;
    for (let index = 0; index < selectRoles.length; ++index) {
        if (selectRoles[index] != null) {
            ++count;
        }
    }

    return count >= maxNum;
}

//找空模型Index
function getEmptyIndex(selectRoles): number {
    for (let index = 0; index < selectRoles.length; ++index) {
        if (selectRoles[index] == null) {
            return index;
        }
    }
    return -1;
}


//选择武将的三个位置
let selectPoints: cc.Vec2[] = [cc.v2(-80, -80), cc.v2(0, -80), cc.v2(80, -80)];

//更新角色位置
export function comUpdateRolePos(selectRoles) {
    let count = 0;
    for (let i = 0; i < selectRoles.length; ++i) {
        if (selectRoles[i] != null) {
            ++count;
        }
    }

    if (count == 1) {
        for (let i = 0; i < selectRoles.length; ++i) {
            if (selectRoles[i] != null) {
                selectRoles[i].node.position = selectPoints[1];
                break;
            }
        }
    } else if (count == 2) {
        let ccTemp = 0;
        for (let i = 0; i < selectRoles.length; ++i) {
            if (selectRoles[i] != null) {
                let pos = selectPoints[ccTemp == 0 ? 0 : 2];
                selectRoles[i].node.position = new cc.Vec2(pos.x * 0.5, pos.y);
                ++ccTemp;
            }
        }
    } else if (count == 3) {
        for (let i = 0; i < selectRoles.length; ++i) {
            if (selectRoles[i] != null) {
                selectRoles[i].node.position = selectPoints[i];
            }
        }
    }
}

