/**
 * User: cJian
 * Date: 2019/8/13 7:57 PM
 * Note: ...
 */
import {IAssist, IAssistInfo,AssistanceInfoVO } from "../../types/Response";
import {IncidentModel} from "./IncidentModel";

export class AssistModel {
    private assist: IAssist = null;
    private incidentModel:IncidentModel = null ;
    constructor() {

    }
    init(assist:IAssist) {
        this.assist = assist;
        if(this.incidentModel == null) {
            this.incidentModel = new IncidentModel();
        }
        this.incidentModel.init(this.assist.incident);
    }
    update(assist:IAssist) {
        if(assist.info) {
            this.assist.info = assist.info ;
        }
        if(assist.incident) {
            this.incidentModel.init(this.assist.incident);
        }
    }
    getTotalDegree() {
        return this.incidentModel.conf.getDegree();
    }
    getMembers() {
        return this.assist.members;
    }
    set info(info:AssistanceInfoVO) {
        this.assist.info = info ;
    }
    get info() {
        return this.assist.info
    }
    getAssistCount() {
        return this.info.assistanceCount ;
    }
    getRecoverTime() {
        return this.info.recoveryTime;
    }
    getSelfRank() {
        return this.info.rank ;
    }
    getTotalMember() {
        return this.info.totoalMember ;
    }
    getIncident() {
        return this.incidentModel ;
    }
}
