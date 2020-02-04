import {IncidentModel} from "../../Model/incident/IncidentModel";
import {JsonMgr} from "../../global/manager/JsonManager";
import {Staff} from "../../Model/StaffData";
import {Face, Role, State} from "../map/Role";

const { ccclass, property } = cc._decorator;
@ccclass
export default class IncidentStaffRole extends cc.Component {

    static url: string = "incident/IncidentStaffRole";
    @property(sp.Skeleton)
    spine: sp.Skeleton = null;

    @property(cc.ProgressBar)
    pro: cc.ProgressBar = null;

    @property(cc.Label)
    nameLab: cc.Label = null;

    private _model:IncidentModel = null ;


    @property(cc.ProgressBar)
    delaypro : cc.ProgressBar = null;   //延迟的滑动条

   
    twinkleEffect : boolean = false;        //闪烁特效


    onLoad() {
        this.twinkleEffect = false;
        this.pauseOpacity = false;
    }
    start() {
        // this.dispose.add(ClientEvents.UPDATE_ACCELERATE_TIME.on(this.updateTime));
    }

    setTwinkleEffect(active : boolean)
    {
        this.twinkleEffect = active;
    }

    initIncidentModel(model:IncidentModel) 
    {
        this._model = model ;
        this.initStaffInfo();
        let isIncident:boolean = this._model.getIsIncident();
        if(this.pro != null)
        {
            this.pro.node.active = isIncident ;
        }
        
        if(isIncident) {
            this.initProgress();
        }
    }

    setPauseOpacity(active : boolean)
    {
        this.pauseOpacity = active;
        if(this.delaypro != null && active)
        {
            this.delaypro.node.opacity = 255;
        }
    }

    initRoleByStaff() {

    }
    refreshModel(model:IncidentModel) {
        this._model = model ;

        this.pauseOpacity = true;

      /*  if(this._model.getIsIncident()) {
            this.initProgress();
        }*/
    }
    initProgress() {
        let percent = this._model.getLastProgressPercent();
        cc.log('curprogress ===',percent);
        if(this.pro != null)
            this.pro.progress = percent

        if(this.delaypro != null)
        {
            this.delaypro.progress = percent;
        }
    }
    initStaffInfo() {

        let showConf = JsonMgr.getIncidentShowById(this._model.getShowId());
        this.nameLab.string = showConf.getName();
        let resUrl = Staff.getLowStaffSpineUrl(showConf.getMod());
        this.initSpine(resUrl);
    }

    initSpine(url) {
        cc.loader.loadRes(url, sp.SkeletonData, this.onProcess, this.onComplete);
    }

    onProcess = (completeCount, totalCount, item) => {
    };

    onComplete = (err: Error, res: sp.SkeletonData) => {
        if (err) {
            cc.error(err);
            return;
        }
        if(!this.spine){
            return;
        }
        this.spine.skeletonData = res;

        let showConf = JsonMgr.getIncidentShowById(this._model.getShowId());
        let action : IRoleAction = JsonMgr.getRoleAction(showConf.getAction());
        let face : IRoleFaceJson = JsonMgr.getRoleFace(showConf.getFace());
        this.spine.setAnimation(0, action.action, true);
        this.spine.setSkin(face.face);
        this.spine.node.active = true;
    };


    setAnimState(state : State,loop : boolean = true)
    {
        if(this.spine == null)
        {
            cc.log("current spint is null.");
            return;
        }
        this.spine.setAnimation(0,Role.STAFF_ACTIONS[state],loop);
    }

    playAnim(animName : string,loop : boolean = true)
    {
        this.spine.setAnimation(0,animName,loop);
    }

    playFace(animName : string,loop : boolean = true)
    {
        this.spine.setSkin(animName);
    }

    removeNode() {
        if(this.node && this.node.isValid) {
            this.node.destroy();
        }
    }


    setCurrentProgress(val : number)
    {
        if(this.pro != null)
        {
            this.pro.progress = val;
        }

        if(this.twinkleEffect)
        {
            this.pauseOpacity = false;
        }
        
    }

    getCurrentProgress()
    {
        if(this.pro.progress != null)
        {
            return this.pro.progress;
        }else
        {
            cc.warn("getProgressVal is zero!!!");
            return 0;
        }
            
        
    }


    getProgressCol()
    {
        return this.pro;
    }

    getDelayProgress()
    {
        return this.delaypro;
    }

    transparency : number = 255;

    transparentDir : number = -1;

    pauseOpacity : boolean;

    update (dt) 
    {
        if(this.pro == null || this.delaypro == null || !this.twinkleEffect || this.pauseOpacity)
        {
            return;
        }
        let minValue = 255 * 0.1;
        let maxValue = 255 * 0.9;
        if(this.pro.progress != this.delaypro.progress)
        {

            this.transparency += (this.transparentDir * maxValue * 1.75 * dt );
            if(this.transparency < minValue)
            {
                this.transparentDir = 1;
            }else if(this.transparency >= maxValue)
            {
                this.transparentDir = -1;
            }
            this.delaypro.node.opacity = this.transparency;
        }else
        {
            this.transparency = maxValue;

            this.transparentDir = -1;
        }
    }
}
