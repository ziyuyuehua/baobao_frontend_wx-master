/**
 * User: cJian
 * Date: 2019/8/8 3:13 PM
 * Note: ...
 */
import { IAssist, IAssistInfo, IIncident, IIncidents, AssistanceInfoVO } from "../types/Response";
import { IncidentModel } from "./incident/IncidentModel";
import { ClientEvents } from "../global/manager/ClientEventCenter";
import { AssistModel } from "./incident/AssistModel";
import { DataMgr } from "./DataManager";
import { MapMgr } from "../CustomizedComponent/MapShow/MapInit/MapManager";

export class IncidentData {

    //危机map
    private incidentMap: Map<number, IncidentModel> = new Map<number, IncidentModel>();

    private isOtherMarket: boolean = false;

    //社区协助数据
    private assistModel: AssistModel = null;

    fill(incidents: IIncidents) {
        if (incidents && incidents.list) {
            this.initIncidentModels(incidents.list);
        }
    }

    private initIncidentModels(incidents: IIncident[]) {
        this.incidentMap.clear();
        for (let i = 0; i < incidents.length; i++) {
            this.addIncident(incidents[i]);
        }
    }

    updateIncidents(incidents: IIncidents) {
        if (!incidents || !incidents.list) {
            return;
        }
        for (let i = 0; i < incidents.list.length; i++) {
            let incident: IIncident = incidents.list[i];
            this.update(incident);
        }
    }

    //更新单一一个IIncident，自动增删改
    update(incident: IIncident) {
        if (this.isNew(incident)) {
            this.addIncident(incident, true);
        } else if (this.isComplete(incident)) {
            this.deleteIncident(incident);
        } else {
            this.updateIncident(incident);
        }
    }

    isNew(incident: IIncident) {
        return incident.state == 1;
    }

    isComplete(incident: IIncident) {
        return incident.state == 3;
    }

    hasIncident(id: number): boolean {
        return this.incidentMap.has(id);
    }

    addIncident(incident: IIncident, isUpdate: boolean = false) {
        if (this.hasIncident(incident.id)) {
            cc.log("后端给的新的id其实已经存在，需要前后的确认哪里出问题了");
        } else {
            const model = new IncidentModel();
            model.init(incident);
            this.incidentMap.set(model.getId(), model);
            if (isUpdate && !DataMgr.isInFriendHome() && MapMgr.mapIsNormal()) {
                ClientEvents.INCIDENT_ADD.emit(model);
            }
        }
    }

    deleteIncident(incident: IIncident) {
        this.deleteIncidentById(incident.id);
        ClientEvents.INCIDENT_DELETE.emit([incident.id]);
    }

    deleteIncidentById = (id: number) => {
        this.incidentMap.delete(id);
    };

    getIncident(id: number): IncidentModel {
        return this.incidentMap.get(id);
    }

    updateIncident(incident: IIncident) {
        let incidentModel: IncidentModel = this.getIncident(incident.id);
        // cc.log("incidentModel:{}", incidentModel);
        if (incidentModel) {
            incidentModel.init(incident);
            return incidentModel;
        } else {
            cc.log("后端给的更新id其实不存在，需要前后的确认哪里出问题了......." + incident.id);
            return null;
        }
    }

    //清除过期的危机
    clearExpire() {
        let incidentIds: number[] = this.getExpireIncidents()
            .map((model: IncidentModel) => model.getId());
        incidentIds.forEach(this.deleteIncidentById);
        ClientEvents.INCIDENT_DELETE.emit(incidentIds);
    }

    initAssist(assist: IAssist) {
        if (this.assistModel == null) {
            this.assistModel = new AssistModel();
        }
        this.assistModel.init(assist);
        return this.assistModel;
    }

    updateAssist(assist: IAssist) {
        this.assistModel.update(assist);
        return this.assistModel;
    }

    updateAssistInfo(info: AssistanceInfoVO) {
        if (info) {
            this.assistModel.info = info;
        }
        return this.assistModel;
    }

    getAssist() {
        return this.assistModel;
    }

    getExistIncidents(): IncidentModel[] {
        return this.getIncidents()
            .filter((model: IncidentModel) => !model.isExpire() && !model.getIsAssist());
    }

    getMapEvents(): IncidentModel[] {
        return this.getIncidents()
            .filter((model: IncidentModel) => !model.isExpire() && model.getIsEvent());
    }

    getMapIncidents(): IncidentModel[]{
        return this.getIncidents()
            .filter((model: IncidentModel) => !model.isExpire() && model.getIsIncident());
    }

    private getExpireIncidents(): IncidentModel[] {
        return this.getIncidents()
            .filter((model: IncidentModel) => model.isExpire());
    }

    private getIncidents(): IncidentModel[] {
        return Array.from(this.incidentMap.values());
    }

    setIsOtherMarket(result: boolean) {
        this.isOtherMarket = result;
    }

    getIsOtherMarket() {
        return this.isOtherMarket;
    }
}
