import {ResManager} from "../../global/manager/ResManager";
import {JobType, Staff} from "../../Model/StaffData";
import {UIUtil} from "../../Utils/UIUtil";
import {JsonMgr} from "../../global/manager/JsonManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class StaffTips extends cc.Component {

    @property(cc.Label)
    private staffName: cc.Label = null;
    @property(cc.Node)
    private advantageIcons: cc.Node = null;

    // @property(cc.Label)
    // intelligenceLabel: cc.Label = null;
    // @property(cc.Label)
    // powerLabel: cc.Label = null;
    // @property(cc.Label)
    // glamourLabel: cc.Label = null;
    // @property(cc.Label)
    // patienceLabel: cc.Label = null;
    @property([cc.Label])
    private attributeLabel: Array<cc.Label> = [];

    @property(cc.Sprite)
    jobNameIcon: cc.Sprite = null;


    // onLoad () {}

    start() {

    }

    load = (id: number) => {
        let json = JsonMgr.getInformationAndItem(id);
        this.staffName.string = json.name;

        if (json.advantage.length >= 5) {
            this.advantageIcons.children.forEach((item: cc.Node, v: number) => {
                item.active = v === 5;
            }, this);
        } else {
            this.advantageIcons.children.forEach((item: cc.Node, v: number) => {
                item.active = (json.advantage.indexOf(v + 1) !== -1);
            }, this);
        }

        UIUtil.asyncSetImage(this.jobNameIcon, Staff.getStaffSuggestJobImageUrl(json.initPost));

        // let levelAttribute = JsonMgr.getConstVal("levelAttribute");
        // grow^2*(level*0.1+1.25)*MIN(star,5)/5
        // levelAttribute.replace("grow",json.property[0]);
        // eval(levelAttribute);
        let size = json.property.length;
        for (let i = 0; i < size; i++) {
            let x = json.property[i] * 1 + 15;
            this.attributeLabel[i].string = Math.trunc(x) + "";
        }
        let specialJson: Array<ISpecialJson> = JsonMgr.getSpecialTemplate(json.id);
        specialJson.forEach((v: ISpecialJson) => {
            if (v.isInitSpecial == 1) {
                let t = v.specialAdd.split(";");
                t.forEach((value: string) => {
                    let t1 = value.split(",");
                    this.attributeLabel[parseInt(t1[0])].string = parseInt(this.attributeLabel[parseInt(t1[0])].string) + parseInt(t1[1]) + "";
                });
            }
        });
    }

    // update (dt) {}
}
