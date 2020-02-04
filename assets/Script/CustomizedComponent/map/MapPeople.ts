import {MapInfo, MapInst} from "./MapInfo";
import {JobMapInfo, Role, RoleType, State} from "./Role";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {CompositeDisposable} from "../../Utils/event-kit";
import {CommonUtil} from "../../Utils/CommonUtil"
import {JobType, Staff, StaffData} from "../../Model/StaffData";
import {Touter} from "./roleAI/Touter";
import {Tallyman} from "./roleAI/Tallyman";
import {HashSet} from "../../Utils/dataStructures/HashSet";
import {Customer} from "./roleAI/Customer";
import {JsonMgr} from "../../global/manager/JsonManager";
import {CashierNew} from "./roleAI/CashierNew";
import {UIUtil} from "../../Utils/UIUtil";
import {GridNode} from "./Astar";
import {Saleman} from "./roleAI/Saleman";
import {DataMgr} from "../../Model/DataManager";
import {IncidentModel, IncidentType} from "../../Model/incident/IncidentModel";
import {IncidentShowConf} from "../../Model/incident/jsonconfig/IncidentShowConf";
import {Enemy} from "./roleAI/incindent/Enemy";
import {IncidentConf} from "../../Model/incident/jsonconfig/IncidentConf";
import {CustomerHelper} from "./roleAI/CustomerHelper";
import {CashierHelper, RoleCaseHelper} from "./roleAI/CaseHelper";
import {Storage} from "../../core/storage/Storage";
import {CacheMap, FutureState} from "../MapShow/CacheMapDataManager";
import {ACTOR_LINES_TYPE, ActorLinesHelper} from "./roleAI/ActorLinesHelper";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import {UIMgr} from "../../global/manager/UIManager";
import {AudioMgr} from "../../global/manager/AudioManager";

const {ccclass, property} = cc._decorator;

let JOB_MAP_INFO: Array<JobMapInfo> = [];

export const CASHIER_POS = [
    cc.v2(22, 23),
    cc.v2(17, 23),
    cc.v2(22, 22),
    cc.v2(17, 22),
];

@ccclass
export class MapPeople extends cc.Component {

    @property(cc.Node)
    private futureAndPeopleNode: cc.Node = null;
    @property(cc.Prefab)
    private testRolePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    private touterPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    private tallymanPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    private salemanPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    private cashierPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    private customerPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    private enemyPrefab: cc.Prefab = null;

    private cashierNodePool: cc.NodePool = new cc.NodePool();
    private tallymanNodePool: cc.NodePool = new cc.NodePool();
    private touterNodePool: cc.NodePool = new cc.NodePool();
    private salemanNodePool: cc.NodePool = new cc.NodePool();

    private customerNodePool: cc.NodePool = new cc.NodePool();
    private enemyNodePool: cc.NodePool = new cc.NodePool();

    private roleMap: Map<string, Role> = new Map<string, Role>();

    //事件监听控制
    private dispose: CompositeDisposable = new CompositeDisposable();

    private testRole: Role = null;

    private frame: number = 0; //每帧计数

    private incidentMapPosIdSet: HashSet<number> = new HashSet(); //被占用的危机mapId集合
    private randomEnemyPosSet: Set<number> = new Set(); //被占用的随机危机位置集合

    private customerId: number = null;
    private busTourId: number = null;
    private specialId: number = -1;

    static isGeneratingPeople: boolean = false;

    onLoad() {
        this.dispose.add(ClientEvents.MAP_INIT_FINISHED.on(this.initPeople));
        // this.dispose.add(ClientEvents.MAP_CUSTOMER_BUY_GOODS.on(this.customerBuyGoods));

        this.dispose.add(ClientEvents.MAP_CLEAR_PEOPLE.on(this.clearPeople));
        this.dispose.add(ClientEvents.MAP_REFRESH_PEOPLE.on(this.generatePeople));

        this.dispose.add(ClientEvents.INCIDENT_ADD.on(this.addIncidentEnemy));
        this.dispose.add(ClientEvents.INCIDENT_DELETE.on(this.deleteIncidents));

        this.dispose.add(ClientEvents.TOUR_ADD_BUS_CUSTOMER.on(this.addBusCustomer));

        this.dispose.add(ClientEvents.MAP_CUSTOMER_ENTER_MARKET.on(this.customerEnterMarketEvent));
        this.dispose.add(ClientEvents.MAP_CUSTOMER_EXIT_MARKET.on(this.customerExitMarketEvent));

        this.dispose.add(ClientEvents.MAP_ROLE_UP_WORK.on(this.playUpWork));
        this.dispose.add(ClientEvents.MAP_ROLE_LV_UP.on(this.playLvUp));
        this.dispose.add(ClientEvents.SET_SPECIAL_ID.on(this.setSpecialId));
        this.dispose.add(ClientEvents.ADD_STAFF_TO_MAP.on(this.addJobStaffById));
        MapInst.initData(this);
        this.initNodePool();
        this.initPeople(true);
    }

    setSpecialId = (id: number) => {
        this.specialId = id;
    };

    private customerEnterMarketEvent = () => {
        if (this.roleMap.size > 0) {
            this.roleMap.forEach((role: Role) => {
                if (ActorLinesHelper.checkOccur(ACTOR_LINES_TYPE.CUSTOMER_ENTER_MARKET, role)) {
                    role.showActorLines(ACTOR_LINES_TYPE.CUSTOMER_ENTER_MARKET);
                }
            });
        }
    };

    private customerExitMarketEvent = () => {
        if (this.roleMap.size > 0) {
            this.roleMap.forEach((role: Role) => {
                if (ActorLinesHelper.checkOccur(ACTOR_LINES_TYPE.CUSTOMER_EXIT_MARKET, role)) {
                    role.showActorLines(ACTOR_LINES_TYPE.CUSTOMER_EXIT_MARKET);
                }
            });
        }
    };

    private playUpWork = (staffIds: number[]) => {
        let staffSet: Set<number> = new Set<number>(staffIds);
        this.roleMap.forEach((role: Role) => {
            if(staffSet.has(role.staffId)){
                role.playUpWork();
            }
        });
    };

    private playLvUp = (staffIds: number[]) => {
        let staffSet: Set<number> = new Set<number>(staffIds);
        this.roleMap.forEach((role: Role) => {
            if(staffSet.has(role.staffId)){
                role.playLvUp();
            }
        });
    };

    private initNodePool() {
        UIUtil.initNodePool(this.cashierNodePool, 4, this.cashierPrefab);
        UIUtil.initNodePool(this.tallymanNodePool, 4, this.tallymanPrefab);
        UIUtil.initNodePool(this.touterNodePool, 4, this.touterPrefab);
        UIUtil.initNodePool(this.salemanNodePool, 4, this.salemanPrefab);

        const size = CustomerHelper.getMaxNum();
        UIUtil.initNodePool(this.customerNodePool, size, this.customerPrefab);

        UIUtil.initNodePool(this.enemyNodePool, 8, this.enemyPrefab);

        JOB_MAP_INFO = [
            new JobMapInfo(JobType.cashier, "CashierNew", [cc.v2(15, 17), cc.v2(22, 23)], this.cashierNodePool, this.cashierPrefab),
            new JobMapInfo(JobType.saleman, "Saleman", [cc.v2(15, 17), cc.v2(22, 23)], this.salemanNodePool, this.salemanPrefab),
            new JobMapInfo(JobType.touter, "Touter", [cc.v2(16, 25), cc.v2(28, 28)], this.touterNodePool, this.touterPrefab),
            new JobMapInfo(JobType.tallyman, "Tallyman", [cc.v2(15, 17), cc.v2(22, 23)], this.tallymanNodePool, this.tallymanPrefab)
        ];
    }

    private addJobStaff(staffData: StaffData, jobMapInfo: JobMapInfo) {
        let staffs = staffData.getPostStaffs(jobMapInfo.type);
        staffs.forEach((staff: Staff) => {
            this.generateJobStaff(staffData, staff, jobMapInfo);
        });
    }

    private birthPos(roleType: RoleType, staffData: StaffData, staff: Staff): cc.Vec2 {
        switch (roleType) {
            case RoleType.CASHIER:
                return this.cashierPos(staffData, JobType.cashier, staff.staffId);
            case RoleType.TOUTER:
                return MapInst.touterRandomPos();
            case RoleType.TALLYMAN:
                return MapInst.tallymanRandomPos();
            case RoleType.SALEMAN:
                let pos = RoleCaseHelper.popBindingSalemanPos();
                if (pos) return pos;
                return MapPeople.randomInMarketPos();
            default :
                cc.error("MapPeople.ts birthPos roleType Error!");
                return cc.v2(0, 0);
        }
    };

    private cashierPos(staffData: StaffData, jobType: JobType, staffId: number): cc.Vec2 {
        const index: number = staffData.getPostIndex(jobType, staffId);
        return CASHIER_POS[index];
    }

    addTestRole() {
        let testStaffId: number = 0;
        this.testRole = cc.instantiate(this.testRolePrefab).getComponent("TestRole");
        this.testRole.init(testStaffId, MapInst, this);
        this.testRole.setMapPos(26, 26);
        this.futureAndPeopleNode.addChild(this.testRole.node, 26 + 26);
        this.roleMap.set(this.testRole.getKey(), this.testRole);
        this.futureAndPeopleNode.on(cc.Node.EventType.TOUCH_END, this.testRoleTouchEnd);
    }

    private testRoleTouchEnd = (event) => {
        let curPos = this.testRole.curMapPos();
        let curGLPos = MapInst.toGLPos(curPos);
        let curNodeLocation = this.node.convertToWorldSpaceAR(curGLPos);
        let curNodeLocation5: cc.Vec2 = this.node.convertToNodeSpaceAR(curNodeLocation);
        // let curNodeLocation2 = this.node.convertToWorldSpace(curGLPos);
        // let curNodeLocation3 = this.node.convertToNodeSpace(curGLPos);
        // let curNodeLocation4 = this.node.convertToNodeSpaceAR(curGLPos);
        // cc.log("1", curPos, curGLPos, curNodeLocation, curNodeLocation2, curNodeLocation3, curNodeLocation4, curNodeLocation5);

        let location = event.getLocation();
        let nodeLocation: cc.Vec2 = this.node.convertToNodeSpaceAR(location);
        let mapPos = MapInst.clickToMapPos(nodeLocation);
        // cc.log("2", mapPos, nodeLocation, location);

        let path: Array<GridNode> = MapInst.search(curPos, mapPos);

        const jump: boolean = path.length > 5; //路径长度大于5就跳跃
        if (jump) {
            this.jump(nodeLocation, curNodeLocation5);
            // this.testRole.doJump(curNodeLocation5, nodeLocation);
        } else {
            ClientEvents.MAP_ROLE_CHANGE_STATE.emit(0, State.RUN, mapPos, State.IDLE);
        }
    };

    private jump(nodeLocation: cc.Vec2, curNodeLocation5: cc.Vec2) {
        let jumpAction = cc.jumpTo(0.5, nodeLocation, 100, 1);
        // let testRoleScale: cc.Vec2 = cc.v2();
        // this.testRole.node.getScale(testRoleScale);
        // cc.log("jump ~~~ ", nodeLocation, curNodeLocation5);

        let startJump = cc.callFunc(() => {
            // this.testRole.node.setScale(testRoleScale.x, testRoleScale.y*0.7);
            if (nodeLocation.x > curNodeLocation5.x) {
                this.testRole.turnRight();
            } else {
                this.testRole.turnLeft();
            }
            this.testRole.doChangeState(State.RUN);
        });
        let endJump = cc.callFunc(() => {
            this.testRole.doChangeState(State.IDLE);
            // this.testRole.node.setScale(testRoleScale.x, testRoleScale.y);
        });
        this.testRole.node.runAction(cc.sequence(startJump, jumpAction, endJump));
    }

    // private addEnemy() {
    //     let incidents: IncidentModel[] = DataMgr.incidentData.getExistIncidents();
    //     if (DataMgr.isInFriendHome()) { //好友家只显示危机（type为1），不显示事件
    //         incidents = incidents.filter((model: IncidentModel) => model.getIsIncident());
    //     }
    //
    //     return PromiseForEach(incidents, (incident: IncidentModel) => {
    //         return this.addIncidentEnemy(incident);
    //     }).catch((e) => {
    //         cc.error(e);
    //     });
    // }

    private addIncidentEnemy = (incident: IncidentModel) => {
        const conf: IncidentConf = incident.conf;
        let showId = incident.getShowId();
        const showConf: IncidentShowConf = JsonMgr.getIncidentShowById(showId);
        if (!showConf) {
            cc.error("getIncidentShowById return null! id = " + showId);
            return;
        }
        let incidentId = incident.getId();
        let enemyKey = Role.getRoleKey(Enemy.PREFIX, incidentId);
        if(this.roleMap.has(enemyKey)){
            cc.warn("repeated enemy!!!");
            return;
        }

        const enemy: Enemy = UIUtil.getNodeFromPool(this.enemyNodePool, this.enemyPrefab).getComponent(Enemy);
        enemy.init(incidentId, MapInst, this, showConf.getName(), showConf.getMod());

        let type: number = conf.getType();
        let randomPosKey = this.randomEnemyPosKey(enemy, type, showConf);
        let randomPos = CommonUtil.keyToPos(randomPosKey);
        // cc.log("enemy", incident.getId(), conf.getType(), randomPos, TimeUtil.format(incident.getExpireTime()));
        enemy.setMapPos(randomPos.x, randomPos.y);
        incident.setMapPos(randomPos);
        incident.setMapNode(enemy.node);

        let action = JsonMgr.getRoleAction(showConf.getAction()).action;
        enemy.fillData(incident.getXmlId(), type, action, showConf.getFace(), showConf.getTargetPic());

        this.futureAndPeopleNode.addChild(enemy.node, randomPos.x + randomPos.y + (type == IncidentType.event ? 0 : 1));
        this.roleMap.set(enemy.getKey(), enemy);
    };

    private randomEnemyPosKey(enemy: Enemy, type: number, showConf: IncidentShowConf): number {
        let roleKey: string = enemy.getKey();
        let posKey: number = Storage.getItem(roleKey);
        if (posKey) {
            //cc.log("get random enemy (key, pos)", roleKey, posKey);
            if (type == IncidentType.incident || !CacheMap.isOnShelfClose(CommonUtil.keyToPos(posKey))) {
                this.randomEnemyPosSet.add(posKey);
                return posKey;
            }
        }

        let randomPosKey: number = this.randomEnemyPosByType(type, showConf);
        let tryCount: number = 0;
        while (this.randomEnemyPosSet.has(randomPosKey) && tryCount < 3) {
            randomPosKey = this.randomEnemyPosByType(type, showConf);
            tryCount++;
        }
        if (tryCount >= 3) {
            cc.log("超过最大尝试随机危机小人位置次数, enemy staffId =", enemy.staffId)
        }
        this.randomEnemyPosSet.add(randomPosKey);
        Storage.setItem(roleKey, randomPosKey);
        //cc.log("set random enemy (key, pos)", roleKey, randomPosKey);
        return randomPosKey;
    }


    private randomEnemyPosByType(type: number, showConf: IncidentShowConf): number {
        let randomPosKey = -1;
        if (type == IncidentType.incident) { // 1为危机，2为事件
            randomPosKey = this.randomEnemyPosByConf(type, showConf);
        } else {
            let randomPos: cc.Vec2 = MapPeople.randomInMarketPos(); //先在店内找空余位置
            if (randomPos) {
                let tryCount: number = 0;
                while (this.randomEnemyPosSet.has(CommonUtil.posToKey(randomPos)) && tryCount < 3) {
                    randomPos = MapPeople.randomInMarketPos();
                    tryCount++;
                }
                if (tryCount >= 3) {
                    cc.log("超过最大尝试随机危机小人位置次数！！！");
                    // UIMgr.showTipText("超过最大尝试随机危机小人位置次数！！！");
                } else {
                    randomPosKey = CommonUtil.posToKey(randomPos);
                }
            }

            if (randomPosKey < 0) { //店内找不到空余位置才在配置的坐标范围随机
                randomPosKey = this.randomEnemyPosByConf(type, showConf);
            }
        }
        return randomPosKey;
    }

    private randomEnemyPosByConf(type: number, showConf: IncidentShowConf): number {
        let mapPos: Array<number> = showConf.getMapPos();
        if (type != IncidentType.incident || mapPos.length == 1) {
            let mapPosArr: Array<cc.Vec2> = JsonMgr.getIncidentMapPosArr(mapPos[0]);
            return this.randomEnemyPosByMapPos(mapPosArr);
        } else {
            let mapPosSet: HashSet<number> = new HashSet<number>(mapPos);
            mapPosSet = mapPosSet.diff(this.incidentMapPosIdSet);
            if (mapPosSet.isEmpty()) {
                cc.log("危机坐标已经被随机完了！！！", this.incidentMapPosIdSet.values());
                // UIMgr.showTipText("危机坐标已经被随机完了！！！" + this.incidentMapPosIdSet.values());
                mapPosSet.addArray(mapPos);
            }
            let uniquePosArr = mapPosSet.values();
            let mapPosId = uniquePosArr[CommonUtil.getRandomNum(uniquePosArr.length)];
            let mapPosArr: Array<cc.Vec2> = JsonMgr.getIncidentMapPosArr(mapPosId);
            this.incidentMapPosIdSet.add(mapPosId);
            return this.randomEnemyPosByMapPos(mapPosArr);
        }
    }

    private randomEnemyPosByMapPos(mapPos: Array<cc.Vec2>): number {
        let rangePosSet = MapInst.rangePosSet(mapPos[0], mapPos[1]);
        rangePosSet.deleteArray(MapInfo.ENEMY_CLOSE_POS);
        rangePosSet.deleteArray(Array.from(this.randomEnemyPosSet.values()).map((key: number) => CommonUtil.keyToPos(key)));
        let mapPosArr: Array<cc.Vec2> = rangePosSet.values();
        if (mapPosArr.length > 0) {
            let randomPos: cc.Vec2 = MapInst.randomInPosArray(mapPosArr);
            return CommonUtil.posToKey(randomPos);
        } else {
            cc.log("随机危机坐标可能出现重复！！！");
            // UIMgr.showTipText("随机危机坐标可能出现重复！！！");
            rangePosSet = MapInst.rangePosSet(mapPos[0], mapPos[1]);
            rangePosSet.deleteArray(MapInfo.ENEMY_CLOSE_POS);
            let randomPos: cc.Vec2 = MapInst.randomInPosArray(rangePosSet.values());
            return CommonUtil.posToKey(randomPos);
        }
    }

    private addBusCustomer = (customerNum: number) => {
        this.schedule(() => {
            this.addCustomer2Map(--this.busTourId, false, cc.v2(26, 22 + (CommonUtil.randomBoolean() ? 0 : 1)));
        }, 1, customerNum - 1, 0);
    };

    // private addCustomer() {
    //     let insideNum = CustomerHelper.getInsideMaxNum();
    //     let insideNumArr = [];
    //     for (let i = 0; i < insideNum; i++) {
    //         insideNumArr.push(i);
    //     }
    //
    //     let isInside = true;
    //     if (DataMgr.getGuideCount() == 2) isInside = false;
    //
    //     PromiseForEach(insideNumArr, (insideNum: number) => {
    //         return this.addCustomer2Map(--this.customerId, isInside, null);
    //     }).then(() => {
    //         let outsideNum = CustomerHelper.getOutsideMaxNum();
    //         if (DataMgr.getGuideCount() == 2) outsideNum = 0;
    //         let outsideNumArr = [];
    //         for (let i = 0; i < outsideNum; i++) {
    //             outsideNumArr.push(i);
    //         }
    //         return PromiseForEach(outsideNumArr, (outsideNum: number) => {
    //             return this.addCustomer2Map(--this.customerId, false);
    //         }).catch((e) => {
    //             cc.error(e);
    //         });
    //     }).catch((e) => {
    //         cc.error(e);
    //     });
    // }

    static randomInMarketPos(except?: cc.Vec2): cc.Vec2 {
        let pos = CacheMap.randomInMarketPos();
        if (except) {
            while (true) {
                if (!except.equals(pos)) {
                    return pos;
                }
                pos = CacheMap.randomInMarketPos();
            }
        }
        return pos;
    }

    private addCustomer2Map(customerId: number, isInside: boolean, pos: cc.Vec2 = null) {
        const customer: Customer = UIUtil.getNodeFromPool(this.customerNodePool, this.customerPrefab).getComponent(Customer);
        const mapInfo: MapInfo = MapInst;

        customer.init(customerId, mapInfo, this);

        customer.setInMarket(isInside);

        let getOutsidePos = () => {
            return mapInfo.homeRandomPos();
        };

        let randomPos: cc.Vec2 = pos ? pos : (isInside ? MapPeople.randomInMarketPos() : getOutsidePos());
        customer.setMapPos(randomPos.x, randomPos.y);

        this.futureAndPeopleNode.addChild(customer.node, randomPos.x + randomPos.y + 1);
        this.roleMap.set(customer.getKey(), customer);
    }

    getAroundCustomer(): Customer {
        if (this.roleMap.size > 0) {
            let roleArray = this.roleMap.values();
            for (let role of roleArray) {
                if (role.isRoleType(RoleType.CUSTOMER)) {
                    let customer = <Customer>role;
                    if (customer.isLoaded() && !customer.isInMarket() && !customer.isGoingHomeFunc() && !customer.isInToutingFunc() && !role.hadInteractive() && !role.isBusCustomer()) {
                        if (role.curMapPos().x >= MapInfo.CUSTOMER_MIN_X && role.curMapPos().y >= MapInfo.CUSTOMER_MIN_Y) {
                            return customer;
                        }
                    }
                }
            }
        }
        return null;
    }

    inMarketCustomerSize(): number {
        if (this.roleMap.size <= 0) return 0;
        let size = 0;
        this.roleMap.forEach((role: Customer) => {
            if (role.isRoleType(RoleType.CUSTOMER) && role.isInMarket()) {
                if (!role.enableLeaveMarket()) {
                    size++;
                }
            }
        });
        return size;
    }

    getTouterSize(): number {
        let size = 0;
        if (this.roleMap.size > 0) {
            this.roleMap.forEach((role: Touter) => {
                if (role.isRoleType(RoleType.TOUTER)) {
                    size++;
                }
            });
        }
        return size;
    }

    getTalkingTallyman(except: Tallyman): Tallyman {
        let tallymanArray: Array<Tallyman> = [];
        if (this.roleMap.size > 0) {
            this.roleMap.forEach((role: Tallyman) => {
                if (role.isRoleType(RoleType.TALLYMAN) && role.staffId != except.staffId) {
                    if (!role.isStartTalking() && role.in(State.IDLE)) {
                        tallymanArray.push(role);
                    }
                }
            });
        }

        if (tallymanArray.length > 0) {
            tallymanArray.sort((a: Tallyman, b: Tallyman) => {
                if (a.getSleepyCount() < b.getSleepyCount()) return 1;
                return -1;
            });
            return tallymanArray[0];
        }

        return null;
    }

    initPeople = (isInit: boolean = true) => {
        MapInst.init();
        isInit && this.generatePeople();

        // setInterval(() => {
        //     ClientEvents.MAP_ROLE_UP_WORK.emit([2, 1, 4, 6, 5]);
        // }, 5000);
        // setInterval(() => {
        //     ClientEvents.MAP_ROLE_LV_UP.emit([2, 1, 4, 6, 5]);
        // }, 5000);

        // setInterval(() => {
        //     ClientEvents.MAP_CUSTOMER_BUY_GOODS.emit({x: 18, y: 17}, Direction.LEFT, {x: 20, y: 23}, Direction.RIGHT);
        // }, 10000);
        // setInterval(() => {
        //     ClientEvents.MAP_CUSTOMER_BUY_GOODS.emit({x: 16, y: 18}, Direction.RIGHT);
        // }, 15000);

        // setTimeout(() => {
        //     ClientEvents.MAP_CUSTOMER_BUY_GOODS.emit({x: 20, y: 18}, Direction.LEFT);
        // }, 10000);
        // setTimeout(() => {
        //     ClientEvents.MAP_ROLE_CHANGE_STATE.emit(76, State.TOUT1, {x: 20, y: 20}, State.TOUT2);
        // }, 3000);
        // setTimeout(() => {
        //     ClientEvents.MAP_ROLE_CHANGE_STATE.emit(76, State.TALLY1, {x: 10, y: 15}, State.TALLY2);
        // }, 30000);

        // setTimeout(() => {
        //     ClientEvents.MAP_CLEAR_PEOPLE.emit();
        // }, 10000);
        // setTimeout(() => {
        //     ClientEvents.MAP_REFRESH_PEOPLE.emit();
        // }, 15000);
    };

    private getRoleSize(){
        let size = 0;
        this.roleMap.forEach((role: Role) => {
            if(!role.isEnemy()){
                size++;
            }
        });
        return size;
    }

    private generatePeople = () => {
        let roleSize = this.getRoleSize();
        let mapState = MapMgr.getMapState();
        if (!DataMgr.seePeople || MapPeople.isGeneratingPeople || !MapMgr.getIsLoaded() || roleSize > 0
            || (mapState != FutureState.NORMAL && mapState != FutureState.ACCESS)) {
            // cc.log("can not generatePeople!!!");
            return;
        }
        MapPeople.isGeneratingPeople = true;

        cc.warn(">>> generatePeople");
        this.busTourId = Role.BUS_TOUR_START_ID;
        this.customerId = Role.CUSTOMER_START_ID;

        RoleCaseHelper.initRoleCase();
        CashierHelper.initCashier();

        // if (DataMgr.checkInPowerGuide()) {
        //     let step = DataMgr.getGuideCount();
        //     if (step == 0) {
        //         this.finishGeneratePeople();
        //     } else if (step == 1) {
        //         UIMgr.showMask();
        //         let staffData: StaffData = DataMgr.getCurStaffData();
        //         this.addJobStaff(staffData, JOB_MAP_INFO[JobType.cashier]);
        //         this.finishGeneratePeople();
        //     } else {
        //         let staffData: StaffData = DataMgr.getCurStaffData();
        //         this.addJobStaff(staffData, JOB_MAP_INFO[JobType.cashier]);
        //
        //         let insideCount = CustomerHelper.getInsideMaxNum();
        //         for (let i = 0; i < insideCount; i++) {
        //             this.addCustomer2Map(--this.customerId, true);
        //         }
        //
        //         let outsideCount = CustomerHelper.getOutsideMaxNum();
        //         for (let i = 0; i < outsideCount; i++) {
        //             this.addCustomer2Map(--this.customerId, false);
        //         }
        //
        //         this.finishGeneratePeople();
        //     }
        // } else {
            let incidents: IncidentModel[] = DataMgr.incidentData.getExistIncidents();
            if (DataMgr.isInFriendHome()) { //好友家只显示危机（type为1），不显示事件
                incidents = incidents.filter((model: IncidentModel) => model.getIsIncident());
            }
            let enemyCount = incidents.length;

            let staffData: StaffData = DataMgr.getCurStaffData();
            let jobKindCount = JOB_MAP_INFO.length;

            let insideCount = CustomerHelper.getInsideMaxNum();

            let outsideCount = CustomerHelper.getOutsideMaxNum();

            let asyncGenerate = () => {
                if (enemyCount > 0) {
                    this.addIncidentEnemy(incidents[enemyCount - 1]);
                    enemyCount--;
                } else if (jobKindCount > 0) {
                    this.addJobStaff(staffData, JOB_MAP_INFO[jobKindCount - 1]);
                    jobKindCount--;
                } else if (insideCount > 0) {
                    this.addCustomer2Map(--this.customerId, true);
                    insideCount--;
                } else if (outsideCount > 0) {
                    this.addCustomer2Map(--this.customerId, false);
                    outsideCount--;
                } else {
                    // this.addTestRole();
                    this.unschedule(asyncGenerate);
                    this.finishGeneratePeople();
                }
            };
            this.schedule(asyncGenerate, 0, cc.macro.REPEAT_FOREVER);
        // }
    };

    addJobStaffById = (staffIds: number[], showSmoke: boolean = true) => {
        let staffData: StaffData = DataMgr.getCurStaffData();
        for(let i=0;i<staffIds.length;i++){
            let staffId = staffIds[i];
            let staff: Staff = staffData.getStaff(staffId);
            if(!staff.inDuty()){
                continue;
            }
            let jobMapInfo: JobMapInfo = JOB_MAP_INFO[staff.positionId];
            this.generateJobStaff(staffData, staff, jobMapInfo, showSmoke);
        }
    };

    private generateJobStaff(staffData: StaffData, staff: Staff, jobMapInfo: JobMapInfo, showSmoke: boolean = false){
        let role: Role = UIUtil.getNodeFromPool(jobMapInfo.nodePool, jobMapInfo.prefab).getComponent(jobMapInfo.roleScript);
        let upWorkSmoke: boolean = staff.staffId == this.specialId;
        upWorkSmoke && this.setSpecialId(-1);
        role.init(staff.staffId, MapInst, this, null, null, showSmoke || upWorkSmoke);
        let randomPos: cc.Vec2 = this.birthPos(role.getRoleType(), staffData, staff);
        role.setMapPos(randomPos.x, randomPos.y);
        this.futureAndPeopleNode.addChild(role.node, jobMapInfo.type === JobType.cashier ? randomPos.x + randomPos.y : randomPos.x + randomPos.y + 1);
        this.roleMap.set(role.getKey(), role);
    }

    private finishGeneratePeople() {
        MapPeople.isGeneratingPeople = false;
        AudioMgr.init();
    }

    // private addJobStaffRole() {
    //     let staffData: StaffData = DataMgr.getCurStaffData();
    //     this.addJobStaff(staffData, this.tallymanNodePool, this.tallymanPrefab, JOB_MAP_INFO[JobType.tallyman]).then(() => {
    //         return this.addJobStaff(staffData, this.touterNodePool, this.touterPrefab, JOB_MAP_INFO[JobType.touter]);
    //     }).then(() => {
    //         return this.addJobStaff(staffData, this.salemanNodePool, this.salemanPrefab, JOB_MAP_INFO[JobType.saleman]);
    //     }).then(() => {
    //         return this.addJobStaff(staffData, this.cashierNodePool, this.cashierPrefab, JOB_MAP_INFO[JobType.cashier]);
    //     })
    // }

    private clearPeople = () => {
        cc.warn(">>> clearPeople");
        this.unscheduleAllCallbacks();
        if (this.roleMap.size > 0) {
            this.roleMap.forEach((role: Role) => {
                if (role.isRoleType(RoleType.TESTROLE)) {
                    role.node.destroy();
                    this.roleMap.delete(role.getKey());
                    this.node.off(cc.Node.EventType.TOUCH_END, this.testRoleTouchEnd);
                } else {
                    this.deleteRole(role);
                }
            });
            // cc.log("clearPeople ConfigMgr.resMap", ConfigMgr.getResMap());
            this.roleMap.clear();
            this.incidentMapPosIdSet.clear();
            this.randomEnemyPosSet.clear();
        }
        MapPeople.isGeneratingPeople = false;
    };

    private getNodePool(role: Role) {
        switch (role.getRoleType()) {
            case RoleType.CASHIER:
                return this.cashierNodePool;
            case RoleType.TALLYMAN:
                return this.tallymanNodePool;
            case RoleType.TOUTER:
                return this.touterNodePool;
            case RoleType.SALEMAN:
                return this.salemanNodePool;
            case RoleType.CUSTOMER:
                return this.customerNodePool;
            case RoleType.ENEMY:
                return this.enemyNodePool;
        }
    }

    private deleteIncidents = (ids: number[]) => {
        ids.forEach(this.deleteIncidentEnemy);
    };

    private deleteIncidentEnemy = (id: number) => {
        const key = Role.getRoleKey(Enemy.PREFIX, id);
        cc.log("deleteIncidentEnemy " + key);
        const enemy: Enemy = <Enemy>this.roleMap.get(key);
        if (enemy) {
            this.deleteRole(enemy);
        }

        let posKey: number = Storage.getItem(key);
        this.randomEnemyPosSet.delete(posKey);
        Storage.removeItem(key);
    };

    deleteRole(role: Role) {
        role.reset();
        UIUtil.putNodeToPool(this.getNodePool(role), role.node);
        this.roleMap.delete(role.getKey());
    }

    update(dt: number) {
        this.frame++;
        if (this.frame < Role.UPDATE_PER_FRAME) {
            return;
        }
        this.frame = 0;
        this.updatePeople(dt);
    }

    private updateIndex: number = 0; //当前帧更新开始索引
    private perUpdateNum: number = 20; //每帧更新数目

    private updatePeople(dt: number) {
        // const roleSize: number = this.roleMap.length;
        // if(roleSize <= this.perUpdateNum){
        this.roleMap.forEach((role) => {
            if (!role.isReset() && !role.isInHouyangAnimation()) {
                role.updatePos(dt);
            }
        });
        // }else{
        //     for(let i=this.updateIndex,step=0; step<this.perUpdateNum; i++,step++){
        //         this.roleMap[i].updatePos(dt);
        //         if(i == roleSize-1){
        //             this.updateIndex = 0;
        //             break;
        //         }
        //         if(step == this.perUpdateNum-1){
        //             this.updateIndex += this.perUpdateNum;
        //         }
        //     }
        // }
    }

    getRoleListAround(centerPos: cc.Vec2, roleType: RoleType = RoleType.ALL, checkInteractive: boolean = true): Array<Role> {
        const aroundPosSet: HashSet<cc.Vec2> = MapInst.aroundPosSet(centerPos, 3);
        const roleList: Array<Role> = new Array<Role>();
        this.roleMap.forEach((role: Role) => {
            if (!role.isLoaded() || !aroundPosSet.has(role.curMapPos()) || !role.isRoleType(roleType)) {
                return;
            }
            if (checkInteractive && role.hadInteractive()) {
                return;
            }
            if (role.isInToutingFunc()) {
                return;
            }
            roleList.push(role);
        });
        return roleList;
    }

    getRoleIn(mapPos: cc.Vec2): Role {
        let roleArr: Array<Role> = CommonUtil.mapValues(this.roleMap);
        return roleArr.find((role: Role) => {
            return !role.isMoving() && role.curMapPos().equals(mapPos);
        });
    }

    //获取所有非移动角色的坐标集合，减少随机到同一个坐标的概率
    getAllRolePosSet(): HashSet<cc.Vec2> {
        const posSet: HashSet<cc.Vec2> = new HashSet<cc.Vec2>();
        this.roleMap.forEach((role: Role) => {
            if (role.isMoving()) {
                return;
            }
            posSet.add(role.curMapPos());
        });
        return posSet;
    }

    //获取所有非移动角色的坐标列表，减少随机到同一个坐标的概率
    getAllRolePosList(): Array<cc.Vec2> {
        const posList: Array<cc.Vec2> = [];
        this.roleMap.forEach((role: Role) => {
            if (role.isMoving()) {
                return;
            }
            posList.push(role.curMapPos());
        });
        return posList;
    }

    onDestroy() {
        this.dispose.dispose();
        UIUtil.clearPool(this.cashierNodePool);
        UIUtil.clearPool(this.tallymanNodePool);
        UIUtil.clearPool(this.touterNodePool);
        UIUtil.clearPool(this.salemanNodePool);
        UIUtil.clearPool(this.customerNodePool);
    }
}
