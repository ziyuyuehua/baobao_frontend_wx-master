import {IRespData} from "../../types/Response";
import {ArrowType} from "./Arrow";

export class GuideDataManager {
    private guideData: Map<ArrowType, IGuideData> = new Map<ArrowType, IGuideData>();

    pullData(response: IRespData) {
        this.analysisGuideData(response.softLedMap);
    }

    analysisGuideData(guideData: any) {
        this.guideData.clear();
        Object.keys(guideData).map((v, k) => {
            let id = parseInt(v);
            this.guideData.set(id, {id: id, completeTime: guideData[v]});
        });
    }

    /**
     * 获取软引导完成次数
     */
    getCompleteTimeById(id: ArrowType) {
        let time = this.guideData.get(id);
        if(time) {
            return time.completeTime;
        } else {
            return 0;
        }
    }

    /**
     * 该方法针对的是只需要完成一次软引导的检测
     */
    checkHasCompleteById(id: ArrowType) {
        return !!this.guideData.get(id);
    }
}

export interface IGuideData {
    id: number;
    completeTime: number;
}