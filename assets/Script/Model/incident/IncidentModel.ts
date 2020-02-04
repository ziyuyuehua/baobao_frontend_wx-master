/**
 * User: cJian
 * Date: 2019/8/9 3:10 PM
 * Note: ...
 */
import { JsonMgr } from "../../global/manager/JsonManager";
import { IIncident } from "../../types/Response";
import { DataMgr } from "../DataManager";
import { IncidentConf } from "./jsonconfig/IncidentConf";
import { IncidentShowConf } from "./jsonconfig/IncidentShowConf";
export class IncidentModel {

    private incident: IIncident = null;
    private _showConf: IncidentShowConf = null;
    private _conf: IncidentConf = null;

    private mapNode: cc.Node = null;
    private mapPos: cc.Vec2 = null;

    constructor() {

    }
    init(incident: IIncident) {
        this.incident = incident;
    }

    setMapNode(node: cc.Node) {
        this.mapNode = node
    }
    getMapNode() {
        return this.mapNode
    }

    setMapPos(mapPos: cc.Vec2){
        this.mapPos = mapPos;
    }
    getMapPos(): cc.Vec2{
        return this.mapPos;
    }

    gethelped() {
        return this.incident.helped;
    }

    getId() {
        return this.incident.id;
    }
    getXmlId() {
        return this.incident.xmlId;
    }
    getShowId() {
        return this.incident.showId;
    }
    getCoordId() {
        return this.incident.coordId;
    }
    getExpireTime() {
        return this.incident.expireTime;
    }
    getLeftTime() {
        let leftTime = DataMgr.getLeftTime(this.incident.expireTime);
        return Math.ceil(leftTime / 1000);
    }
    getCurProgress() {
        return this.incident.process;
    }
    getLastProgress() {
        return this.conf.getDegree() - this.getCurProgress();
    }
    //平时就显示小数点后1位数字（.0时隐藏），在低于1时，显示小数点后2位数字，如果倒数第二位数字也是0，则显示为0.01%
    static formatProgress(progress: number) {
        if (progress >= -0.0001 && progress <= 0.0001) {
            return "0";
        }

        if (progress < 1) {
            let progressStr = progress.toFixed(2);
            if (progressStr[progressStr.length - 1] == "0") {
                if (progressStr[progressStr.length - 2] == "0") {
                    progressStr = "0.01";
                } else {
                    progressStr = progress.toFixed(1);
                }
            }
            return progressStr;

        } else {
            let progressStr = progress.toFixed(1);
            if (progressStr[progressStr.length - 1] == "0") {
                progressStr = progress.toFixed(0);
            }
            return progressStr;
        }
    }


    getLastProgressPercent() {
        // console.log('getLastProgressPercent ===', this.getCurProgress(), '   ', this.conf.getDegree());
        return this.getLastProgress() / this.conf.getDegree();
    }

    getLastProgressPercentStr() {
        let progress: number = this.getLastProgressPercent() * 100;
        return IncidentModel.formatProgress(progress) + "%";
    }

    getCurrentProcessPercent() {
        return this.getCurProgress() / this.conf.getDegree();
    }

    getCurrentValueAndProgressPercentStr() {
        let val: number = this.getCurProgress();
        let progress: number = this.getCurrentProcessPercent() * 100;
        return val.toFixed() + "/" + this.conf.getDegree() + "(" + IncidentModel.formatProgress(progress) + "%)";
    }

    getAdditionProgress(value: number) {
        return this.getCurProgress() + value;
    }

    getAdditionProgressPercent(value: number) {
        let currentProcess: number = this.getCurProgress() + value;
        return currentProcess / this.conf.getDegree();
    }

    getConfDegree(){
        return this.conf.getDegree();
    }

    getAdditionProgressPercentStr(value: number) {
        let progress = this.getAdditionProgressPercent(value) * 100;
        return IncidentModel.formatProgress(progress) + "%";
    }

    getAssistProgressPercentStr(value: number) {
        let progressStr = this.getAdditionProgressPercentStr(value);
        let val: number = this.getAdditionProgress(value);
        return val.toFixed(0) + "/" + this.conf.getDegree() + "(" + progressStr + ")";
    }

    getRewards() {
        return this.incident.rewardList;
    }

    get showConf() {
        if (this._showConf == null) {
            this._showConf = JsonMgr.getIncidentShowById(this.incident.showId);
        }
        return this._showConf;
    }

    getSubProgressPercent(value: number) {
        let currentProcess: number = Math.min(this.getCurProgress() + value, this.conf.getDegree());

        return 1 - currentProcess / this.conf.getDegree();
    }

    getSubProgressPercentStr(value: number) {
        let progress = this.getSubProgressPercent(value) * 100;
        return IncidentModel.formatProgress(progress) + "%";
    }

    getSubProgressPrecentNnm(value: number) {
        let endValue = this.getLastProgress() - value;
        return endValue < 0 ? 0 : endValue;
    }

    isAssistOver() {
        return this.getLastProgress() <= 0;
    }
    getHelpMax() {
        return this.incident.helpMax;
    }

    getMaxHelpDegree() {
        return this.conf.getMaxHelpDegree();
    }

    getHelpProcess() {
        return this.incident.helpProcess;
    }

    getHelpPercent() {
        let percent =  (this.incident.helpProcess / this.conf.getDegree() * 100) ;
        return IncidentModel.formatProgress(percent) +"%";
    }
    getState() {
        //状态：1-新的；2-进行中；3-完成 ;4-过期
        return this.incident.state;
    }
    get conf() {
        if (this._conf == null) {
            this._conf = JsonMgr.getIncidentById(this.getXmlId());
        }
        return this._conf;
    }

    getSpecialAdd() {
        //加成类型
        //判定类型 ' 判定值 ' 额外加成
        // 1:性别 0女1男
        // 2:角色 角色ID
        // 3:推荐岗位 0收银员、1理货员、2招揽员、3售货员(和staff表对应)
        // 4:星级 星级
        // 5:擅长类型 (和staff表对应)

        return this.conf.getSpecialAdd;
    }

    getDescription() {
        return this.conf.getDescription();
    }

    isNew() {
        return this.getState() == IncidentState.new;
    }
    isDoing() {
        return this.getState() == IncidentState.doing;
    }
    isComplete() {
        return this.getState() == IncidentState.complete;
    }
    isExpire() {
        if (this.getExpireTime() == -1) {
            return false;
        }
        return this.getLeftTime() <= 0;
    }
    getIsIncident = () => {
        return this.conf.getType() == IncidentType.incident;
    };
    getIsEvent() {
        return this.conf.getType() == IncidentType.event;
    }
    getIsAssist() {
        return this.conf.getType() == IncidentType.assist;
    }
}

export enum IncidentState {
    new = 1,        //新增
    doing = 2,      //在处理
    complete = 3,   //完成
}

export enum IncidentType {
    incident = 1,   //危机
    event = 2,      //事件
    assist = 3,     //协助
}
