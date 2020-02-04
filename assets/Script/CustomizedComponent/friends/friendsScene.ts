import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {Staff, StaffData} from "../../Model/StaffData";
import {Focus, FosterCareData} from "../../Model/FriendsData";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {UIUtil} from "../../Utils/UIUtil";
import {DataMgr} from "../../Model/DataManager";
import {FunctionName, JsonMgr} from "../../global/manager/JsonManager";
import {ResMgr} from "../../global/manager/ResManager";
import {IFosterInfo, IRespData} from "../../types/Response";
import {GameComponent} from "../../core/component/GameComponent";
import {UIMgr} from "../../global/manager/UIManager";
import FriendsList from "../friendsList/friendsList";
import MapLoading from "../MapShow/MapInit/MapLoading";
import {CommonUtil} from "../../Utils/CommonUtil";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import {FutureState} from "../MapShow/CacheMapDataManager";
import {ExpUtil} from "../MapShow/Utils/ExpandUtil";
import {ButtonMgr} from "../common/ButtonClick";
import {IncidentModel} from "../../Model/incident/IncidentModel";
import CommunityRank from "../communityActivity/CommunityRank";
import CommunityActive from "../communityActivity/CommunityActive";
import {ServerConst} from "../../global/const/ServerConst";
import {JumpConst} from "../../global/const/JumpConst";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FriendsScene extends GameComponent {
    static url = "friendsList/friendsScene";
    private incidents: IncidentModel[] = [];

    getBaseUrl() {
        return FriendsScene.url;
    }

    @property(cc.Label)
    private Name: cc.Label = null;
    @property(cc.Label)
    private Lv: cc.Label = null;
    @property(cc.Label)
    private turnoverLabel: cc.Label = null;
    // @property(cc.Label)
    // private popularityNode: cc.Label = null;//人气值
    // //头像框
    // @property(cc.Sprite)
    // private pictureframe: cc.Sprite = null;
    @property(cc.Sprite)
    private positionIcon: cc.Sprite = null;//店长段位
    // //头像
    @property(cc.Sprite)
    private headportrait: cc.Sprite = null;
    // @property(cc.Prefab)
    // private borrowStaff: cc.Prefab = null;
    // @property(cc.Node)
    // private fosterCare: cc.Node = null;
    // @property(cc.Node)
    // private gainExp: cc.Node = null;
    @property(cc.Node)
    private upgrade: cc.Node = null;
    @property(cc.Node)
    private numImg: cc.Node = null;
    @property(cc.Node)
    private spineNode: cc.Node = null;
    private spine: sp.Skeleton = null;
    @property(cc.Button)
    private fosterCareButton: cc.Button = null;
    @property(cc.Node)
    private cancelFosterCareMask: cc.Node = null;
    @property(cc.Sprite)
    private employeesFace: cc.Sprite = null;
    @property(cc.Node)
    private countdownLabel: cc.Node = null;
    @property(cc.Node)
    private treasureBoxBtn: cc.Node = null;
    @property(cc.Node)
    private fosterCareLabel: cc.Node = null;
    @property(cc.Label)
    private friendsName: cc.Label = null;
    @property(cc.Label)
    private timeRemaining: cc.Label = null;
    @property(cc.Label)
    private exp: cc.Label = null;
    @property(cc.Node)
    private offSeeFurniture: cc.Node = null;
    @property(cc.Node)
    private downMenu: cc.Node = null;
    @property(cc.Node)
    private furniture: cc.Node = null;
    @property(cc.Sprite)
    private furnitureModel: cc.Sprite = null;
    @property(cc.Label)
    private furnitureName: cc.Label = null;
    @property(cc.Label)
    private saleOfGoods: cc.Label = null;
    @property(cc.Label)
    private sellingRate: cc.Label = null;
    @property(cc.Label)
    private getWay: cc.Label = null;
    @property(cc.Label)
    private expLabel: cc.Label = null;
    @property(cc.SpriteFrame)
    private sf: cc.SpriteFrame = null;
    @property(cc.Animation)
    private onceAnima: cc.Animation = null;
    @property(cc.Sprite)
    private treasureBoxImg: cc.Sprite = null;
    private ble: boolean = false;
    // @property(cc.Node)
    // private returnHome: cc.Node = null;
    // @property(cc.Label)
    // private friendMarketId: cc.Label = null
    private friendsData: any;
    ble1: boolean;
    private staffData: StaffData;

    @property(cc.Node)
    private friendUitop: cc.Node = null

    @property([cc.Node])//招募。。大巴。。危机事件
    private btn: cc.Node[] = [];
    @property([cc.Label])
    private btnLab: cc.Label[] = [];
    @property(cc.Node)
    private homeS: cc.Node = null;
    @property(cc.Node)
    private friendsBtn: cc.Node = null;

    //IncidentView

    onLoad() {
        this.addEvent(ClientEvents.HANDLE_FRIENDS_HOME.on(this.homeType));
        let name: string = this.friendsBtn.name.replace("Btn", "");
        this.friendsBtn.active = JsonMgr.isFunctionOpen(FunctionName[name]);
        this.addEvent(ClientEvents.EVENT_HIDE_FRIEND_UI_TOP.on(this.hideTopUI));
        // ClientEvents.EVENT_HIDE_MAIN_UI_TOP.emit(false);
        // this.addEvent(ClientEvents.EVENT_CANCEL_FOSTER_CARE.on(this.cancelFosterCare));
        // this.addEvent(ClientEvents.EVENT_FOSTER_CARE_OK.on(this.initfosterCareBtn));
        // this.dispose.add(ClientEvents.EVENT_ON_FURNITURE.on(this.loadFurniture));
        this.furniture.on(cc.Node.EventType.TOUCH_END, () => {
            this.furniture.active = false
        }, this);
    }

    start() {
        // this.initfosterCareBtn();
        this.cancelFosterCareMask.on(cc.Node.EventType.TOUCH_END, () => {
            this.cancelFosterCareMask.active = false;
        });

        ButtonMgr.addClick(this.btn[0], () => {
            UIMgr.resetToRecruitMiddle(null)
        });
        ButtonMgr.addClick(this.btn[1], () => {
            UIMgr.resetStationMiddle(null);
        });

        ButtonMgr.addClick(this.btn[2], () => {
            if (this.incidents.length <= 0) {
                return;
            }
            let nindx = CommonUtil.getRandomNum(this.incidents.length);
            let incidentData: IncidentModel = this.incidents[nindx];
            UIMgr.resetView(incidentData.getMapNode());
        });
    }

    hideTopUI = (ble: boolean) => {
        this.friendUitop.active = ble;
    };

    homeType = (idx: number) => {
        // HttpInst.postData(NetConfig.VISIT_FRIEND, [this.friendsData.friendInfo.id, DataMgr.getCurMarketId()], (resp: IRespData) => {
        //     this.loadFriends(resp);
        // });
        let num: number[] = [];
        this.btnLab.forEach((Lab: cc.Label, id: number) => {
            num[id] = parseInt(Lab.string);
        });
        if ((num[idx] - 1) >= 0) {
            num[idx]--;
        }
        this.btn[idx].active = num[idx] > 0;
        if (this.btn[idx].active) {
            this.btnLab[idx].node.parent.active = num[idx] > 1;
            this.btnLab[idx].string = num[idx] + "";
        }
        this.homeS.active = num[0] + num[1] + num[2] > 0;
        let data: Focus = DataMgr.getFocusData();
        data.upSingleFriedns(this.friendsData.friendInfo.id, num);
    };

    loadHomeState = (resp: IRespData) => {
        this.btnLab.forEach((Lab: cc.Label) => {
            Lab.string = 0 + "";
        });
        let num: number[] = [0, 0, 0];
        if (!resp.friend) {
            this.btn[0].active = false;
            this.btn[1].active = false;
        } else {
            this.btn[0].active = resp.hasRecruitCount > 0;
            if (this.btn[0].active) {
                this.btnLab[0].node.parent.active = resp.hasRecruitCount > 1;
                this.btnLab[0].string = resp.hasRecruitCount + "";
                num[0] = resp.hasRecruitCount;
            }
            this.btn[1].active = resp.friendTourBuses && resp.friendTourBuses.busOpen && DataMgr.tourBusData.getWaitingBuses().length > 0;
            if (this.btn[1].active) {
                this.btnLab[1].node.parent.active = DataMgr.tourBusData.getWaitingBuses().length > 1;
                this.btnLab[1].string = DataMgr.tourBusData.getWaitingBuses().length + "";
                num[1] = DataMgr.tourBusData.getWaitingBuses().length;
            }
        }
        this.btn[2].active = resp.incidents && resp.incidents.list.length > 0;
        if (this.btn[2].active) {
            this.btnLab[2].node.parent.active = resp.incidents.list.length > 1;
            this.btnLab[2].string = resp.incidents.list.length + "";
            num[2] = resp.incidents.list.length;
        }
        this.homeS.active = this.btn[0].active || this.btn[1].active || this.btn[2].active;
        let data: Focus = DataMgr.getFocusData();
        if (data) {
            data.upSingleFriedns(resp.friendInfo.id, num);
        }
    };

    loadFriends = (resp: IRespData) => {
        this.friendsData = resp;
        let user = resp.friendInfo;
        this.Name.string = user.nickName;
        // this.Lv.string = user.level + "";
        // cc.log("营业额：", resp.friendBusiness);
        let robotSales:number = JsonMgr.getConstVal("robotSales");
        let num: number = user.id < 0 ? (robotSales ? robotSales : 10000) : resp.friendBusiness;
        this.turnoverLabel.string = CommonUtil.numChange(num, 1) + "/分钟";
        // this.popularityNode.string = DataMgr.iMarket.getPopularity() + "";
        // this.friendMarketId.string = DataMgr.getCurMarketId() + "";
        this.loadHomeState(resp);
        this.incidents = DataMgr.incidentData.getExistIncidents();
        DataMgr.addUrlData(user.avatar);
        UIUtil.loadUrlImg(user.avatar, this.headportrait); //头像
        let postionJson: IPositionJson = JsonMgr.getPositionJson(user.positionId);
        ResMgr.setPositionIcon(this.positionIcon, postionJson.positionIcon, false);
    };

    //好友按钮
    onfriendsBtn() {
        let node1: cc.Node = UIMgr.getView(FriendsList.url);
        if (!node1) {
            ClientEvents.EVENT_OPEN_UI.emit(JumpConst.FRIENDVIEW);
        } else {
            ClientEvents.GO_HOME.emit(false);
        }
    };


    //家具一览
    // furniturePreviewBtn() {
    //     this.offSeeFurniture.active = true;
    //     this.downMenu.active = false;
    //     this.ble = true;
    // }

    // offSeeFurnitureBtn() {
    //     this.offSeeFurniture.active = false;
    //     this.downMenu.active = true;
    //     this.ble = false;
    // }

    // loadFurniture = (data: any) => {
    //     if (!this.ble) {
    //         return;
    //     }
    //     this.furniture.active = true;
    //     let decoShop: IDecoShopJson = JsonMgr.getDecoShopJson(data.id);
    //     ResMgr.imgTypeJudgment(this.furnitureModel, data.id);
    //     //家具名称
    //     this.furnitureName.string = decoShop.name;
    //     //获取途径
    //     this.getWay.string = decoShop.getWay;
    //     if (decoShop.mainType !== 1) {
    //         this.saleOfGoods.node.parent.active = false;
    //         this.sellingRate.node.parent.active = false;
    //         return;
    //     }
    //     this.saleOfGoods.node.parent.active = true;
    //     this.sellingRate.node.parent.active = true;
    //     //售卖货物
    //     let saleType = decoShop.saleType;
    //     let goodsTypeName: IGoodsTypeJson = JsonMgr.getGoodsType(saleType);
    //     this.saleOfGoods.string = goodsTypeName.goodsTypeName;
    //     //售卖速度
    //     let saleSpeed = decoShop.saleSpeed;
    //     this.sellingRate.string = "+" + saleSpeed;
    //
    // };

    //员工寄养
    // fosterCareBtn() {
    //     if (!this.fosterCare.getChildByName("staffFosterCareList")) {
    //         let borrowStaff = cc.instantiate(this.borrowStaff);
    //         borrowStaff.setPosition(-250, 400);
    //         borrowStaff.zIndex = -1;
    //         this.fosterCare.addChild(borrowStaff);
    //     } else {
    //         this.fosterCare.getChildByName("staffFosterCareList").destroy();
    //     }
    // }

    //寄养按钮状态
    // initfosterCareBtn = () => {
    //     this.staffData = DataMgr.getCurStaffData();
    //     let staffSize: number = this.staffData.getSortedSize();
    //     let fosterCareData: FosterCareData = DataMgr.getFosterCare();
    //     let fosterCare: IFosterInfo = fosterCareData.findFosterCare();
    //     let fosterCareSize: number = fosterCareData.getFosterCareSize();
    //     if (fosterCare) {
    //         let staff: Staff = this.staffData.getStaff(fosterCare.staffId);
    //         this.fosterCareLabel.active = true;
    //         this.employeesFace.node.active = true;
    //         UIUtil.asyncSetImage(this.employeesFace, staff.getAvatarUrl(), false);
    //         this.fosterCareButton.interactable = true;
    //         return;
    //     }
    //
    //     if (staffSize > 0) {
    //         if (fosterCareSize < 3) {
    //             this.employeesFace.node.active = false;
    //             this.countdownLabel.active = false;
    //             this.fosterCareLabel.active = false;
    //             this.fosterCareButton.interactable = true;
    //         }
    //     }
    // };

    //经验宝箱
    // treasureBoxButtn() {
    //     this.treasureBoxImg.spriteFrame = this.sf;
    //     this.onceAnima.play();
    //     setTimeout(() => {
    //         let fosterCareData: FosterCareData = DataMgr.getFosterCare();
    //         let fosterCare = fosterCareData.findFosterCare();
    //         //取消寄养，领取奖励
    //         HttpInst.postData(NetConfig.CANCEL_FOSTER, [fosterCare.friendId], (res: any) => {
    //             this.treasureBoxBtn.active = false;
    //             this.initfosterCareBtn();
    //             this.fosterCareLabel.active = false;
    //             this.gainExpPopup(res);
    //         });
    //     }, 600)
    // }

    //取消寄养
    // cancelFosterCare = () => {
    //     // let user = this.friendsData.friendInfo;
    //     // let name = user.userProperty.shopName;
    //     this.cancelFosterCareMask.active = true;
    //     this.friendsName.string = this.Name.string;
    // };

    //取消寄养按钮
    // cancelFosterCareBtn() {
    //     let fosterCareData: FosterCareData = DataMgr.getFosterCare();
    //     let fosterCare = fosterCareData.findFosterCare();
    //     //取消寄养，领取奖励
    //     HttpInst.postData(NetConfig.CANCEL_FOSTER, [fosterCare.friendId], (res: any) => {
    //         this.staffData.resetCurStaff();
    //         this.cancelFosterCareMask.active = false;
    //         ClientEvents.EVENT_REFRESH_FOSTER_CARE_LIST.emit();
    //         this.initfosterCareBtn();
    //         this.gainExpPopup(res);
    //     });
    // }

    //领取经验弹窗
    // gainExpPopup = (res: any) => {
    //     if (this.ble1) {
    //         let newstaff: Staff = res.staff;
    //         this.initRole(newstaff.artResId);
    //         let staff: Staff = this.staffData.getStaff(newstaff.staffId);
    //         let staff1: Staff = new Staff(staff);
    //         let newstaff1 = DataMgr.updateStaff(res);
    //         if (newstaff1.level > staff1.level) {
    //             this.upgrade.active = true;
    //             this.numImg.getComponent("NumberImgs").setNum(newstaff1.level);
    //             let upExp = newstaff1.getTotalExp() - staff1.getTotalExp();
    //             this.expLabel.string = "+" + upExp;
    //         } else {
    //             this.expLabel.string = "+" + (newstaff1.exp - staff1.exp);
    //         }
    //         this.gainExp.active = true;
    //         return;
    //     }
    //     let newstaff: Staff = res.staff;
    //     DataMgr.updateStaff(res);
    //     this.initRole(newstaff.artResId);
    //     this.expLabel.string = "+0";
    //     this.gainExp.active = true;
    // };

    // initRole = (index: number) => {
    //
    //     let url = this.getSpineUrl(index);
    //     cc.loader.loadRes(url, sp.SkeletonData, this.onProcess, this.onComplete);
    // };
    //
    // onProcess = (completeCount, totalCount, item) => {
    //
    // };
    //
    // onComplete = (err, res) => {
    //     if (err) {
    //         cc.error(err);
    //     }
    //     this.spine = this.spineNode.getComponent('sp.Skeleton');
    //     this.spine.skeletonData = res;
    //     this.spine.setAnimation(0, "zhanli", true);
    //     this.spine.setSkin("weixiao");
    // };
    //
    // getSpineUrl(artResId: number) {
    //     let staffMod = this.spineRoleName(artResId);
    //     if (!staffMod) {
    //         //没有找到模型的都用路飞代替。。。;
    //         return "spine/role/lufei/lufei";
    //     }
    //     return "spine/role/" + staffMod.name + "/" + staffMod.name;
    // }
    //
    // private spineRoleName(artResId: number) {
    //     return JsonMgr.getStaffMod(artResId);
    // }
    //
    // //关闭领取经验
    // determineBtn() {
    //     this.upgrade.active = false;
    //     this.gainExp.active = false;
    // }
    //
    // //关闭取消寄养
    // shutDownBtn() {
    //     this.cancelFosterCareMask.active = false;
    // }

    //返回自己店铺
    returnButton() {
        this.closeOnly();
        let nowMarket = DataMgr.iMarket.getMarketId();
        HttpInst.postData(NetConfig.GET_HOME_INFO, [], () => {
            UIMgr.showView(MapLoading.url, null, null, (node: cc.Node) => {
                DataMgr.starPolling();
                node.getComponent(MapLoading).init(() => {
                    UIMgr.resetViewToMiddle();
                    ExpUtil.refreshData();
                    ClientEvents.MAP_CLEAR_PEOPLE.emit(); //在切换自己家和好友家的时候，更新数据时做清理了
                    ClientEvents.EVENT_HIDE_UI.emit(true);
                    ClientEvents.LOAD_NEW_MARKET.emit(nowMarket);
                    ClientEvents.GO_HOME.emit(true);
                    MapMgr.setMapState(FutureState.NORMAL);
                    ClientEvents.BACK_HOME.emit();
                });
            }, false, 1001);
        });
    }

    // private getHomeInfo(cb: Function = null) {
    //     HttpInst.postData(NetConfig.GET_HOME_INFO,
    //         [], (response: any) => {
    //             // this.fillServerData(response, false);
    //             // cb && cb();
    //             DataMgr.backHome(response);
    //         });
    // }

    onDestroy() {
        this.dispose.dispose();
    }

    // update(dt) {
    // let fosterCareData: FosterCareData = DataMgr.getFosterCare();
    // let fosterCare = fosterCareData.findFosterCare();
    // if (fosterCare) {
    //     let nowTimeStamp = DataMgr.getServerTime();
    //     let fosterTime: any = JsonMgr.getConstVal("fosterTime");
    //     if (nowTimeStamp > (fosterCare.fosterStarTime * 1000 + fosterTime * 3600000)) {
    //         this.treasureBoxBtn.active = true;
    //     } else {
    //         let da = (fosterTime * 3600000 + fosterCare.fosterStarTime * 1000) - nowTimeStamp;
    //         let h = Math.floor(da / 1000 / 60 / 60 % 24);
    //         let h1 = h < 10 ? "0" + h : h;
    //         let m = Math.floor(da / 1000 / 60 % 60);
    //         let m1 = m < 10 ? "0" + m : m;
    //         let s = Math.floor(da / 1000 % 60);
    //         let s1 = s < 10 ? "0" + s : s;
    //         this.countdownLabel.active = true;
    //         this.timeRemaining.string = h1 + ":" + m1 + ":" + s1;
    //         let da1 = nowTimeStamp - fosterCare.fosterStarTime * 1000;
    //         if (da1 > 300000) {
    //             this.ble1 = true;
    //             this.exp.string = "" + Math.floor((fosterTime * 3600000 - da) * fosterCare.canGainExp / (fosterTime * 3600000));
    //         } else {
    //             this.ble1 = false;
    //             this.exp.string = "0";
    //         }
    //         // this.exp.string = "" + Math.floor((fosterTime * 3600000 - da) * fosterCare.canGainExp / (fosterTime * 3600000));
    //         this.countdownLabel.getComponent(cc.Label).string = h1 + ":" + m1 + ":" + s1;
    //     }
    // }
    // }
}
