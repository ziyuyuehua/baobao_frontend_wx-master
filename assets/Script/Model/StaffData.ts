/**
 * @Author whg
 * @Date 2019/2/26
 * @Desc
 */
import {CommonUtil, Reward} from "../Utils/CommonUtil";
import {ClientEvents} from "../global/manager/ClientEventCenter";
import {HashSet} from "../Utils/dataStructures/HashSet";
import {Role} from "../CustomizedComponent/map/Role";
import {JsonMgr, NameConfig, StaffConfig, StaffModConfig, StaffRandomConfig} from "../global/manager/JsonManager";
import {UIUtil} from "../Utils/UIUtil";
import {ResManager} from "../global/manager/ResManager";
import {DataMgr} from "./DataManager";
import {IAdvantage, IPost, IPosts, IStaffPool, IActivitiesInfo} from "../types/Response";
import {PostsModel} from "./staff/PostsModel";
import {ActiVityType} from "./activity/ActivityModel";
import {IncidentModel} from "./incident/IncidentModel";
import {EffectiveType} from "./BuffData";

enum OperateState {
    normal,     //正常排序/筛选 状态
    dismiss,    //前往告别（解雇）状态
    job,        //上下岗位（布阵）状态
}

export enum StaffAttr {
    level,          //等级
    star,           //星级

    intelligence,   //智力/智慧
    patience,       //耐力/灵巧
    glamour,        //魅力/亲和
    power,          //体力/体力
}

export enum JobType {
    cashier,    //收银员//智力/智慧
    saleman,    //售货员//耐力/灵巧
    touter,     //揽客员//魅力/亲和
    tallyman,   //理货员//体力/体力
    anyJob,     //任意
}

export enum JobTypeStr {
    cashier = "cash",    //收银员//智力/智慧
    saleman = "sales",    //售货员//耐力/灵巧
    touter = "soli",     //揽客员//魅力/亲和
    tallyman = "tally",   //理货员//体力/体力
    any = "any",
}

class StaffJobInfo {
    type: JobType;
    image: string;
    name: string;
    actions: Array<string>;
    attr: StaffAttr;
    typeStr: JobTypeStr;

    constructor(type: JobType, image: string, name: string, actions: Array<string>, attr: StaffAttr, typeStr: JobTypeStr) {
        this.type = type;
        this.image = image;
        this.name = name;
        this.actions = actions;
        this.attr = attr;
        this.typeStr = typeStr;
    }
}

const STAFF_JOB_INFO: Array<StaffJobInfo> = [
    new StaffJobInfo(JobType.cashier, "job_cash", "收银员", Role.CASHIER_ACTIONS, StaffAttr.intelligence, JobTypeStr.cashier),
    new StaffJobInfo(JobType.saleman, "job_sale", "售货员", Role.SALEMAN_ACTIONS, StaffAttr.patience, JobTypeStr.saleman),
    new StaffJobInfo(JobType.touter, "job_tout", "揽客员", Role.TOUTER_ACTIONS, StaffAttr.glamour, JobTypeStr.touter),
    new StaffJobInfo(JobType.tallyman, "job_tally", "理货员", Role.TALLYMAN_ACTIONS, StaffAttr.power, JobTypeStr.tallyman),
    new StaffJobInfo(JobType.anyJob, "job_any", "任意", Role.STAFF_ACTIONS, StaffAttr.star, JobTypeStr.any),
];

export enum SortType {
    ASC,    //升序，从小到大
    DESC,   //降序，从大到小
}

export enum StaffAdvantage {
    poster = 1,     //海报
    book,           //书籍
    shirt,          //T恤
    bolster,        //抱枕
    cd,             //光盘
}

export enum StaffWorkStatus {
    IDEA = 0,       //空闲
    DUTY = 1,       //上岗
    FOSTER = 2,     //寄养
    PEPLENISH = 3,  //进货
}

export class StaffSort {

    attr: StaffAttr;
    type: SortType;
    advantages: HashSet<StaffAdvantage>;
    needFilter: boolean = false;

    constructor(staffSort: StaffSort) {
        this.attr = staffSort.attr;
        this.type = staffSort.type;
        this.advantages = new HashSet<StaffAdvantage>();
        this.advantages.addArray(staffSort.advantages.values());
        this.needFilter = staffSort.needFilter;
    }

}

class StaffAdvInfo {
    type: StaffAdvantage;
    name: string;

    constructor(type: StaffAdvantage, name: string) {
        this.type = type;
        this.name = name;
    }
}

const STAFF_ADV_INFO: Array<StaffAdvInfo> = [
    new StaffAdvInfo(StaffAdvantage.poster, "海报"),
    new StaffAdvInfo(StaffAdvantage.book, "书籍"),
    new StaffAdvInfo(StaffAdvantage.shirt, "T恤"),
    new StaffAdvInfo(StaffAdvantage.bolster, "抱枕"),
    new StaffAdvInfo(StaffAdvantage.cd, "光盘"),
];

export class StaffData {

    static SEPARATOR: string = "/";
    static MAX_STRING: string = "MAX";
    static MAX_FIRE_NUM: number = -1;

    private opState: OperateState = OperateState.normal;

    //正常模式下单选
    private curStaff: number = -1;
    //解雇模式下多选
    private selectStaffs: Set<number> = new Set();

    //已经排序好的员工数组
    private sortedStaffs: Array<Staff> = null;

    private staffMap: Map<number, Staff> = new Map();
    private staffAdvMap: Map<StaffAdvantage, number[]> = new Map();
    private staffResIds: Set<number> = new Set();

    private postsMap: Map<number, PostsModel> = new Map();

    private capacity: number = -1;
    private unlockDismiss: boolean = false;

    FavorIsCollision: boolean = false;

    defaultSelect: number = 0; //打开员工列表默认选中索引index

    staffLvPos: cc.Vec2 = null;
    fosteCareStaffId: number = 0;
    favorCount: number = 0;
    staffSort: StaffSort = new StaffSort({
        attr: StaffAttr.star,
        type: SortType.DESC,
        advantages: new HashSet<StaffAdvantage>(),
        needFilter: false,
    });

    private diamondDeletes: Array<boolean> = [false, false];

    getJobRed = () => {
        return this.doUpdateJobRe();
    };


    getDiamondDelete(index: number) {
        return this.diamondDeletes[index];
    }

    setDiamondDelete(index: number, value: boolean) {
        this.diamondDeletes[index] = value;
    }

    resetDiamondDelete() {
        for (let i = 0; i < this.diamondDeletes.length; i++) {
            this.diamondDeletes[i] = false;
        }
    }

    fill(staffPool: IStaffPool) {
        this.capacity = staffPool.capacity;
        this.unlockDismiss = staffPool.unlockDismiss;
        this.fillStaffMap(staffPool.staffs);
        this.updatePostsList(staffPool.postsList);
        this.updateJobRed();
    }

    private updateJobRed = () => {
        let jobRed = this.doUpdateJobRe();
        ClientEvents.STAFF_JOBS_RED.emit(jobRed);
    };

    private doUpdateJobRe(): boolean[] {
        let jobRed = [false, false, false, false, false];
        jobRed[0] = this.hasIdleStaff();

        let posts: PostsModel = this.postsMap.get(DataMgr.getMarketId());
        if (posts) {
            for (let jobType = JobType.cashier; jobType < JobType.anyJob; jobType++) {
                let post: IPost = posts.getPost(jobType);
                jobRed[jobType + 1] = post.staffIds.indexOf(0) !== -1;
            }
        }

        return jobRed;
    }

    showNewStaffRed(): boolean {
        let showNewStaffLv: number = JsonMgr.getConstVal("showNewStaffLv");
        return DataMgr.getUserLv() < showNewStaffLv && this.hasNewStaff();
    }

    //是否有新增的员工
    private hasNewStaff(onlyUnique: boolean = true): boolean {
        return this.sortedStaffs.some((staff: Staff) => staff.getIsNew() && (onlyUnique ? staff.isUnique() : true));
    }

    //是否有空闲的员工
    hasIdleStaff(onlyUnique: boolean = false): boolean {
        return this.sortedStaffs.some((staff: Staff) => staff.isIdle() && (onlyUnique ? staff.isUnique() : true));
    }

    //查找空闲员工索引
    findIdleStaffIdx(onlyUnique: boolean = false): number {
        return this.sortedStaffs.findIndex((staff: Staff) => staff.isIdle() && (onlyUnique ? staff.isUnique() : true));
    }

    findIdleStaffNum(onlyUnique: boolean = false): number {
        return this.sortedStaffs.filter((staff: Staff) => staff.isIdle() && (onlyUnique ? staff.isUnique() : true)).length;
    }

    setStaffSort(staffSort: StaffSort) {
        this.staffSort = staffSort;
    }

    getStaffSort() {
        return this.staffSort;
    }

    getMinLvStaffID() {
        let staffVo: Staff = null;
        let nindx: number = 0;
        let staffArr = this.getSorted();
        for (let nid in staffArr) {
            let staff: Staff = staffArr[nid];
            if (staff.inDuty()) {
                if (!staffVo) {
                    staffVo = staff;
                    nindx = Number(nid);
                } else {
                    if (staff.level < staffVo.level) {
                        staffVo = staff;
                        nindx = Number(nid);
                    } else if (staff.level == staffVo.level) {
                        if (staff.isUnique()) {
                            staffVo = staff;
                            nindx = Number(nid);
                        }
                    }
                }
            }
        }
        return nindx;
    }

    getNearLvStaffNindx(lv) {
        let compareLv: number = Number(lv);
        let staffVo: Staff = null;
        let nindx: number = -1;
        let staffArr = this.getSorted();
        for (let nid in staffArr) {
            let staff: Staff = staffArr[nid];
            if (staff.level < compareLv) {
                if (!staffVo) {
                    staffVo = staff;
                    nindx = Number(nid);
                } else {
                    if ((Math.abs(staff.level - compareLv)) < (Math.abs(staffVo.level - compareLv))) {
                        staffVo = staff;
                        nindx = Number(nid);
                    } else if ((Math.abs(staff.level - compareLv)) == (Math.abs(staffVo.level - compareLv))) {
                        if (staff.star > staffVo.star) {
                            staffVo = staff;
                            nindx = Number(nid);
                        }
                    }
                }
            }
        }
        return nindx;
    }

    isSortDesc(): boolean {
        return this.staffSort.type == SortType.DESC;
    }

    getSortAttr(): StaffAttr {
        return this.staffSort.attr;
    }

    isFilter() {
        let advSize = this.staffSort.advantages.size();
        return advSize > 0;
    }

    getCapacity(): number {
        return this.capacity;
    }

    setCanDismiss() {
        this.unlockDismiss = true;
    }

    canDismiss(): boolean {
        return this.unlockDismiss;
    }

    fillStaffMap(staffs: Array<Staff>) {
        this.staffMap.clear();
        this.staffResIds.clear();
        staffs.forEach((staff: Staff) => {
            this.staffMap.set(staff.staffId, new Staff(staff));
            this.staffResIds.add(staff.artResId);
        });

        this.fillSortedStaffs();
    }

    hasStaffByResId(resId: number) {
        return this.staffResIds.has(resId);
    }

    fillSortedStaffs() {
        this.sortedStaffs = [];
        this.staffMap.forEach((staff: Staff) => {
            this.sortedStaffs.push(staff);
        });
    }

    curMaxStaffLv() {
        let curLv: number = 0;
        for (let index = 0; index < this.sortedStaffs.length; index++) {
            let staffLv = this.sortedStaffs[index].level;
            if (curLv == 0) {
                curLv = staffLv;
            } else {
                if (staffLv > curLv) {
                    curLv = staffLv;
                }
            }
        }
        return curLv;
    }

    isFreeStaff() {
        for (let index = 0; index < this.sortedStaffs.length; index++) {
            if (this.sortedStaffs[index].positionId < 0) {
                return true;
            }
        }
        return false;
    }

    isHaveUnMaxLv() {
        for (let index = 0; index < this.sortedStaffs.length; index++) {
            if (!this.sortedStaffs[index].isMaxLevel()) {
                return true;
            }
        }
        return false;
    }

    refreshStaffAdvMap(): Map<StaffAdvantage, number[]> {
        this.staffAdvMap.clear();
        this.getAllPostStaffs().forEach((value: Staff) => {
            this.collectStaffAdvMap(value);
        });
        return this.staffAdvMap;
    }

    private collectStaffAdvMap = (staff: Staff) => {
        if (!staff.inDuty()) {
            return;
        }
        staff.advantages
            .filter((staffAdv: IAdvantage) => staffAdv.unlock)
            .forEach((staffAdv: IAdvantage) => {
                let staffAdvType: StaffAdvantage = staffAdv.type;
                let staffIds: number[] = this.staffAdvMap.get(staffAdvType);
                if (staffIds) {
                    staffIds.push(staff.staffId);
                } else {
                    staffIds = [];
                    staffIds.push(staff.staffId);
                    this.staffAdvMap.set(staffAdvType, staffIds);
                }
            });
    };

    getStaffAdvSpeedAddMap(): Map<StaffAdvantage, number> {
        this.refreshStaffAdvMap();

        let staffAdvSpeedAddMap: Map<StaffAdvantage, number> = new Map<StaffAdvantage, number>();
        for (let type = StaffAdvantage.poster; type <= StaffAdvantage.cd; type++) {
            let staffIds: number[] = this.staffAdvMap.get(type);
            staffAdvSpeedAddMap.set(type, staffIds ? JsonMgr.getSkillBonusByNum(staffIds.length).speedAdd : 0);
        }
        return staffAdvSpeedAddMap;
    }

    updatePostsList(postsList: Array<IPosts>) {
        this.postsMap.clear();
        if (postsList) {
            postsList.forEach((posts: IPosts) => {
                this.updatePosts(posts);
            });
        }
        this.updateJobRed();
    }

    updatePosts(posts: IPosts) {
        this.postsMap.set(posts.id, new PostsModel(posts));
    }

    getUnlockJobType(): JobType {
        let postsModel: PostsModel = this.postsMap.get(DataMgr.getCurMarketId());
        return postsModel.getUnlockJobType();
    }

    resetUnlockJobType() {
        let postsModel: PostsModel = this.postsMap.get(DataMgr.getCurMarketId());
        return postsModel.resetUnlockJobType();
    }

    getAllPostStaffs(): Array<Staff> {
        return this.getAllPostStaffByMarketId(DataMgr.getCurMarketId());
    }

    getAllPostStaffByMarketId(marketId: number): Array<Staff> {
        let postsModel: PostsModel = this.postsMap.get(marketId);
        let posts: Array<IPost> = postsModel.getPosts();
        let allPosStaffs: Array<Staff> = [];
        posts.forEach((position: IPost) => {
            position.staffIds.forEach((staffId: number) => {
                if (staffId > 0) {
                    allPosStaffs.push(this.getStaff(staffId));
                }
            });
        });
        return allPosStaffs;
    }

    getPostShow(): boolean[] {
        return this.getPostShowByMarketId(DataMgr.getCurMarketId());
    }

    getPostShowByMarketId(marketId: number): boolean[] {
        let postsModel: PostsModel = this.postsMap.get(marketId);
        return postsModel.getPosts().map((position: IPost) => {
            return position.staffIds.find((staffId: number) => {
                return staffId >= 0;
            }) != undefined;
        });
    }

    findEmptyPostsIdx(marketId: number): number {
        let postsModel: PostsModel = this.postsMap.get(marketId);
        let posts = postsModel.getPosts();
        for (let i = 0; i < posts.length; i++) {
            let post: IPost = posts[i];
            if (post.staffIds.findIndex((staffId: number) => staffId == 0) >= 0) {
                return i;
            }
        }
        return -1;
    }

    getMarketType(jobType: JobType, marketId: number): number {//获取店铺状态 -1未开启 0开始没人 1开始上岗
        let type: number = -1;
        if (this.getPostShowByMarketId(marketId)[jobType]) {
            if (this.getPostStaffsByMarketId(jobType, marketId).length > 0) {
                type = 1;
            } else {
                type = 0
            }
        } else {
            type = -1;
        }
        return type;
    }

    getBestPostMap(): PostsModel {//获得最大战力店铺
        let postsModels = CommonUtil.mapValues(this.postsMap);
        let postsModel: PostsModel = postsModels[0];
        for (let i = 0; i < postsModels.length; i++) {
            let post: PostsModel = postsModels[i];
            if (post.getAllSumScore() > postsModel.getAllSumScore()) {
                postsModel = post;
            }
        }
        return postsModel;
    }

    calcPostScore(jobType: JobType): number {
        return this.calcPostScoreByMarketId(jobType, DataMgr.getCurMarketId());
    }

    private calcPostScoreByMarketId(jobType: JobType, marketId: number): number {
        return this.getPostStaffsByMarketId(jobType, marketId)
            .map((staff: Staff) => staff.getAttrValue(Staff.jobType2StaffAttr(jobType), true))
            .reduce((sum, num) => sum + num, 0);
    }

    getPost(jobType: JobType): IPost {
        return this.getPostByMarketId(jobType, DataMgr.getCurMarketId());
    }

    getPostByMarketId(jobType: JobType, marketId: number): IPost {
        let postsModel: PostsModel = this.postsMap.get(marketId);
        return postsModel.getPost(jobType);
    }

    getPostStaffs(jobType: JobType): Array<Staff> {
        let marketId = DataMgr.getCurMarketId();
        return this.getPostStaffsByMarketId(jobType, marketId);
    }

    getPostStaffsByMarketId(jobType: JobType, marketId: number): Array<Staff> {
        let postsModel: PostsModel = this.postsMap.get(marketId);
        if (!postsModel) {
            cc.log("marketId", marketId, "not", jobType, "posts");
            return [];
        }
        let post: IPost = postsModel.getPost(jobType);
        let posStaffs: Array<Staff> = [];
        post.staffIds.forEach((staffId: number) => {
            if (staffId > 0) {
                posStaffs.push(this.getStaff(staffId));
            }
        });
        return posStaffs;
    }

    getPostIndex(jobType: JobType, staffId: number): number {
        let marketId = DataMgr.getCurMarketId();
        return this.getPostIndexByMarketId(jobType, staffId, marketId);
    }

    getPostIndexByMarketId(jobType: JobType, staffId: number, marketId: number) {
        if (staffId <= 0) {
            return -1;
        }
        let postsModel: PostsModel = this.postsMap.get(marketId);
        let post: IPost = postsModel.getPost(jobType);
        for (let i = 0; i < post.staffIds.length; i++) {
            if (post.staffIds[i] == staffId) {
                return i;
            }
        }
        return -1;
    }

    //是否有分店，岗位数据长度大于1时代表有分店岗位
    hasSubMarket(): boolean {
        return this.getMarketNum() > 1;
    }

    //获取拥有的超市店铺数目
    getMarketNum(): number {
        return this.postsMap.size;
    }

    // 获取岗位数据map，注意只能访问，不能修改
    getPostsMap(): Map<number, PostsModel> {
        return this.postsMap;
    }

    dismissState() {
        this.opState = OperateState.dismiss;
    }

    normalState() {
        this.opState = OperateState.normal;
    }

    jobState() {
        this.opState = OperateState.job;
    }

    isNormalState() {
        return this.opState == OperateState.normal;
    }

    isDismissState() {
        return this.opState == OperateState.dismiss;
    }

    isJobState() {
        return this.opState == OperateState.job;
    }

    getCurStaff() {
        return this.curStaff;
    }

    //StaffList在disable后重置，便于下次StaffItem初始化时员工列表第1个为选中的
    resetCurStaff() {
        this.setCurStaff(-1);
    }

    setCurStaff(index: number) {
        this.curStaff = index;
    }

    hasChooseStaff() {
        return this.curStaff > 0;
    }

    getChooseStaff() {
        return this.getSortedStaff(this.curStaff);
    }

    getSelectStaffs(): Set<number> {
        return this.selectStaffs;
    }

    clearSelectStaffs() {
        this.selectStaffs.clear();
    }

    onSelectStaff(selected: boolean, index: number) {
        if (index >= 0) {
            let staff: Staff = this.getSortedStaff(index);
            let staffId = staff.staffId;
            if (selected) {
                this.selectStaffs.add(staffId);
                //cc.log("add", index, staffId);
            } else {
                this.selectStaffs.delete(staffId);
                //cc.log("delete", index, staffId);
            }
        }
        //cc.log("selectedStaffs", this.selectStaffs);
    }

    isMaxSelectCount() {
        return this.selectStaffsSize() >= StaffData.getMaxFireNum();
    }

    static getMaxFireNum() {
        if (StaffData.MAX_FIRE_NUM < 0) {
            StaffData.MAX_FIRE_NUM = JsonMgr.getConstVal("fireNum");
        }
        return StaffData.MAX_FIRE_NUM;
    }

    selectStaffsSize() {
        return this.selectStaffs.size;
    }

    update(staff: Staff): Staff {
        //直接把服务器的响应对象set进去，会导致本来的Staff类型变成Object，所以下面改为使用浅拷贝
        //this.staffMap.set(staff.staffId, staff);

        if (!staff || staff.staffId <= 0) {
            cc.log("not staffId can not update");
            return;
        }

        let exist: Staff = this.staffMap.get(staff.staffId);
        if (exist) {
            CommonUtil.copy(exist, staff);
            ClientEvents.STAFF_UPDATE_STAFF.emit(HashSet.oneSet(staff.staffId));
            this.updateJobRed();
            return exist;
        } else {
            return this.addNewStaff(staff); //添加新的员工
        }

        //存在复杂属性的话浅拷贝不好用就得自己写构造函数做深拷贝，类似RecruitStaff
        //this.staffMap.set(staff.staffId, new Staff(staff));
    }

    addNewStaff(newStaff: Staff) {
        if (this.staffMap.has(newStaff.staffId)) {
            cc.log("已存在员工，不可重复添加！");
            return;
        }
        const staff: Staff = new Staff(newStaff);
        this.staffMap.set(newStaff.staffId, staff);
        this.staffResIds.add(newStaff.artResId);
        this.fillSortedStaffs();
        this.updateJobRed();
        return staff;
    }

    removeStaff(staffId: number) {
        this.staffMap.delete(staffId);
        this.staffResIds.delete(staffId);
        this.fillSortedStaffs();
    }

    updateCapacity(newCapacity: number) {
        this.capacity = newCapacity;
    }

    getStaff(staffId: number): Staff {
        return this.staffMap.get(staffId);
    }

    findSortedIndex(staffId: number) {
        let size = this.getSortedSize();
        for (let i = 0; i < size; i++) {
            if (this.getSortedStaff(i).staffId == staffId) {
                return i;
            }
        }
        return -1;
    }

    getSortedStaff(index: number): Staff {
        return this.sortedStaffs[index];
    }

    //TODO 之后需要做成排序后保留选择状态，筛选才清除选择状态
    clearSelectedStaffs(staffItem: cc.Prefab, target: string) {
        this.clearSelectStaffs();
        this.resetCurStaff();

        let staffSize: number = this.getSortedSize();
        //筛选员工后也不修改显示员工的数目，只能通过是否开启过滤（on或者off）识别
        // UIUtil.setLabel(this.numLabel, staffSize + StaffData.SEPARATOR + staffData.getCapacity());

        // if (staffSize > 0) {
        //     staffData.sort(this.staffSort);
        // }

        ClientEvents.STAFF_ITEM_DISMISS_SELECTED.emit(false, -1); //重置已选数目
        ClientEvents.EVENT_REFRESH_FINALLY_SCROLLVIEW.emit(staffItem, staffSize, target);
        //cc.log("staffData sort refresh scroll view")
    }

    sort() {
        if (this.staffSort.needFilter) {
            this.filter();
            this.staffSort.needFilter = false;
        }
        this.doSort(this.staffSort);
    }

    private filter() {
        this.fillSortedStaffs();
        let size = this.sortedStaffs.length;
        if (this.isFilter()) {
            for (let i = 0; i < size; i++) {
                if (!this.sortedStaffs[i].hasAdvantage(this.staffSort.advantages)) {
                    //每次删除后往前移位，所以i和size都需要减1
                    this.sortedStaffs.splice(i, 1);
                    i--;
                    size--;
                }
            }
        }
    }

    doSort(staffSort: StaffSort) {
        //cc.log(staffSort);
        if (this.isJobState()) {
            this.sortByJobAttr(staffSort.type, staffSort.attr);
        } else {
            if (staffSort.attr == StaffAttr.star) {
                this.sortByStar(staffSort.type);
            } else if (staffSort.attr == StaffAttr.level) {
                this.sortByLevel(staffSort.type);
            } else {
                this.sortByAttr(staffSort.type, staffSort.attr);
            }
        }
    }

    private sortByStar(sortType: SortType) {
        let sortFn = this.doSortByStar;
        this.sortedStaffs.sort((a: Staff, b: Staff) => {
            if (this.needSortByPosts(a, b)) {
                return this.sortByPosts(a, b, sortType, sortFn);
            }
            return sortFn(a, b, sortType);

        });
    }

    private doSortByStar(a: Staff, b: Staff, sortType: SortType) {
        let diff = b.star - a.star;
        if (diff == 0) {
            diff = b.level - a.level;
            if (diff == 0) {
                //diff = b.exp - a.exp;
                //if (diff == 0) {
                diff = b.sumAttribute() - a.sumAttribute();
                //}
            }
        }
        return sortType == SortType.DESC ? diff : -diff;
    }

    //员工满级排序置灰
    sortByLevelMax() {
        let leg = this.sortedStaffs.length;
        let Max = JsonMgr.getMaxStaffLevel();
        for (let j = 0; j < leg; j++) {

            if (this.sortedStaffs[j].level === Max) {
                this.sortedStaffs.push(this.sortedStaffs[j]);
                this.sortedStaffs.splice(j, 1);
                leg--;
                j--;
                continue;
            }
            if (this.sortedStaffs[j].workStatusIndex === StaffWorkStatus.PEPLENISH || this.sortedStaffs[j].workStatusIndex === StaffWorkStatus.DUTY) {
                this.sortedStaffs.push(this.sortedStaffs[j]);
                this.sortedStaffs.splice(j, 1);
                leg--;
                j--;
            }
        }
    }

    private sortByLevel(sortType: SortType) {
        let sortFn = this.doSortByLevel;
        this.sortedStaffs.sort((a: Staff, b: Staff) => {
            if (this.needSortByPosts(a, b)) {
                return this.sortByPosts(a, b, sortType, sortFn);
            }

            return sortFn(a, b, sortType);
        });
    }

    private doSortByLevel(a: Staff, b: Staff, sortType: SortType) {
        let diff = b.level - a.level;
        if (diff == 0) {
            //diff = b.exp - a.exp;
            //if (diff == 0) {
            diff = b.star - a.star;
            if (diff == 0) {
                diff = b.sumAttribute() - a.sumAttribute();
            }
            //}
        }
        return sortType == SortType.DESC ? diff : -diff;
    }

    //是否需要根据岗位排序——员工列表岗位优先排在前面
    private needSortByPosts(a: Staff, b: Staff): boolean {
        return a.inWork() || b.inWork();
    }

    //根据岗位排序——员工列表岗位优先排在前面
    private sortByPosts(a: Staff, b: Staff, sortType: SortType, sortFn: Function, attrDiff: number = 0): number {
        if (a.inWork() && !b.inWork()) {
            return -1;
        } else if (!a.inWork() && b.inWork()) {
            return 1;
        } else if (a.inWork() && b.inWork()) {
            if(a.inDuty() !&& !b.inDuty()){
                return -1;
            }else if(!a.inDuty() && b.inDuty()){
                return 1;
            }else if(a.inDuty() && b.inDuty()){
                let diff = a.positionId - b.positionId;
                if (diff == 0) {
                    return sortFn(a, b, sortType, attrDiff);
                }
                return diff;
            }else{
                return sortFn(a, b, sortType, attrDiff);
            }
        }
    }

    private sortByJobAttr(sortType: SortType, staffAttr: StaffAttr) {
        this.sortedStaffs.sort((a: Staff, b: Staff) => {
            return this.diffByJob(a, b, sortType, this.getWorkValue(a, b, this.jobAttr), staffAttr);
        });
    }

    private getWorkValue(a: Staff, b: Staff, staffAttr: StaffAttr) {
        if (!a.inWork() && !b.inWork()) {
            return 0;
        }
        let jobType: JobType = Staff.staffAttr2JobType(staffAttr);
        if (a.inWork() && !b.inWork()) {
            return a.positionId == jobType ? -1 : 1;
        }
        if (!a.inWork() && b.inWork()) {
            return b.positionId == jobType ? 1 : -1;
        }
        if (a.positionId == jobType && b.positionId != jobType) {
            return -1;
        }
        if (a.positionId != jobType && b.positionId == jobType) {
            return 1;
        }
        return 0;
    }

    private diffByJob(a: Staff, b: Staff, sortType: SortType, diff: number, staffAttr: StaffAttr) {
        if (diff == 0) {
            diff = b.getAttrValue(staffAttr, true) - a.getAttrValue(staffAttr, true);
            if (diff == 0) {
                diff = b.staffId - a.staffId;
            }
        }
        const jobAttrId = Staff.staffAttr2JobType(this.jobAttr);
        if (b.positionId == jobAttrId && a.positionId == jobAttrId) {
            return sortType == SortType.DESC ? diff : -diff;
        }
        return (b.inWork() || a.inWork()) ? diff : (sortType == SortType.DESC ? diff : -diff);
    }

    private sortByAttr(sortType: SortType, staffAttr: StaffAttr) {
        let sortFn = this.diffByDefault;
        this.sortedStaffs.sort((a: Staff, b: Staff) => {
            let diff = b.getAttrValue(staffAttr) - a.getAttrValue(staffAttr);
            if (this.needSortByPosts(a, b)) {
                return this.sortByPosts(a, b, sortType, sortFn, diff);
            }
            return sortFn(a, b, sortType, diff);
        });
    }

    private diffByDefault(a: Staff, b: Staff, sortType: SortType, diff: number) {
        if (diff == 0) {
            diff = b.level - a.level;
            if (diff == 0) {
                //diff = b.exp - a.exp;
                //if (diff == 0) {
                diff = b.star - a.star;
                //}
            }
        }
        return sortType == SortType.DESC ? diff : -diff;
    }

    //岗位界面当前选择的岗位员工属性
    jobAttr: StaffAttr = StaffAttr.intelligence;

    setJobAttr(staffAttr: StaffAttr) {
        this.jobAttr = staffAttr;
    }

    getJobAttr(){
        return this.jobAttr;
    }

    isEmpty() {
        return this.getSize() <= 0;
    }

    getSize() {
        return this.staffMap.size;
    }

    getSortedSize() {
        return this.sortedStaffs.length;
    }

    getSorted() {
        return this.sortedStaffs;
    }

    getSortedAttr(staffAttrs: string[]) {
        staffAttrs.sort((a, b) => {
            let strsA = a.split(",");
            let strsB = b.split(",");
            let needAid = Number(strsA[0]);
            let needAval = Number(strsA[1]);

            let needBid = Number(strsB[0]);
            let needBval = Number(strsB[1]);

            if (needAval == needBval) {
                return needAid - needBid;
            } else {
                return needBval - needAval;
            }

        });
        return staffAttrs;
    }

    //危机员工排序(要求属性是经过排序的，谁的高他就在前面)
    getSortedByStaffAttr(staffLevel: number, staffAttrs: string[], helps: number[] = [],
                         isNeedFatigue: boolean = true, isJudgeUp: boolean = false, model: IncidentModel) {
        this.sortedStaffs.sort((a, b) => {

            let fatigue0: boolean = false;
            let fatigue1: boolean = false;
            if (helps.length > 0) {
                for (let i = 0; i < helps.length; ++i) {
                    if (helps[i] == a.staffId) {
                        fatigue0 = true;
                    }
                    if (helps[i] == b.staffId) {
                        fatigue1 = true;
                    }
                }
            } else {
                fatigue0 = a.isFatigue();
                fatigue1 = b.isFatigue();
            }

            fatigue0 = isNeedFatigue ? fatigue0 : false;
            fatigue1 = isNeedFatigue ? fatigue1 : false;
            if (fatigue0 && !fatigue1) {
                return 1;
            }
            if (!fatigue0 && fatigue1) {
                return -1;
            }

            let effct = this.getEffect(a.xmlId, model);
            let isACondition = a.isConditionCan(staffLevel, staffAttrs, effct, a.xmlId);
            let effct1 = this.getEffect(b.xmlId, model);
            let isBCondition = b.isConditionCan(staffLevel, staffAttrs, effct1, b.xmlId);
            if (isACondition && !isBCondition) {
                return -1;
            }
            if (!isACondition && isBCondition) {
                return 1;
            }

            if (isJudgeUp) {
                let aIsUp = a.judgeIsUpStaff();
                let bIsUp = b.judgeIsUpStaff();
                if (aIsUp && !bIsUp) {
                    return -1
                }
                if (!aIsUp && bIsUp) {
                    return 1
                }
            }

            for (let nid = 0; nid < staffAttrs.length; nid++) {
                let strs = staffAttrs[nid].split(',');
                let needId = Number(strs[0]);

                let lhs1 = a.attrValues()[needId];
                let effct = this.getEffect(a.xmlId, model);
                if (effct && CommonUtil.isEmpty(effct.effects)) {
                    lhs1 = effct.getAttribute(a.xmlId, needId, lhs1);
                }

                let rhs1 = b.attrValues()[needId];
                let effct1 = this.getEffect(b.xmlId, model);
                if (effct1 && CommonUtil.isEmpty(effct1.effects)) {
                    rhs1 = effct1.getAttribute(b.xmlId, needId, rhs1);
                }
                if (lhs1 == rhs1) {
                    continue;
                } else {
                    return rhs1 - lhs1;
                }
            }
        });

        return this.sortedStaffs;
    }

    getEffect(staffXmlId, model: IncidentModel) {
        let effct = null;
        if (model.getIsIncident()) {
            effct = DataMgr.getBuffData().getEffects(EffectiveType.CRISIS, [staffXmlId]);
        } else if (model.getIsAssist()) {
            effct = DataMgr.getBuffData().getEffects(EffectiveType.ASSISTANCE, [staffXmlId]);
        }
        return effct;
    }

    //寄养员工排序
    fosterCareSort() {
        this.sortedStaffs.sort((a: Staff, b: Staff) => {
                let aFoster: boolean = a.workStatusIndex == StaffWorkStatus.FOSTER;
                let bFoster: boolean = b.workStatusIndex == StaffWorkStatus.FOSTER;
                if (aFoster && !bFoster) {
                    return -1;
                }
                if (!aFoster && bFoster) {
                    return 1;
                }
                let aLineUp: boolean = a.workStatusIndex == StaffWorkStatus.DUTY;
                let bLineUp: boolean = b.workStatusIndex == StaffWorkStatus.DUTY;
                if (aLineUp && !bLineUp) {
                    return 1;
                }
                if (!aLineUp && bLineUp) {
                    return -1;
                }
                if (a.star != b.star) {
                    return b.star - a.star;
                }
            }
        );
    }
}

export class Staff {

    static NOT_FOUND_INTRO: string = "暂无介绍。。。";

    static ATTR_INDEX: Array<number> = [0, 1, 2, 3]; //attribute表对应到员工UI面板

    //attribute表对应到StaffAttr员工属性
    static XML_ATTR: Array<number> = [
        StaffAttr.intelligence,
        StaffAttr.patience,
        StaffAttr.glamour,
        StaffAttr.power
    ];

    staffId: number;
    xmlId: number;
    artResId: number;

    firstName: number;
    lastName: number;

    level: number;
    exp: number;
    star: number;

    intelligenceGrow: number;
    intelligence: number;// 智力
    intelligenceLv: number;// 智等级
    intelligenceAdd: number;

    powerGrow: number;
    power: number;// 体力
    powerLv: number;// 体等级
    powerAdd: number;

    patienceGrow: number;
    patience: number;// 亲和
    patienceLv: number;// 耐等级
    patienceAdd: number;

    glamourGrow: number;
    glamour: number;// 灵巧
    glamourLv: number;// 魅等级
    glamourAdd: number;

    proportion: Array<number>;//属性比例

    advantages: Array<IAdvantage>;// 擅长
    suggestId: JobType;// 建议岗位，现在收到特质的影响回改变，以后端为准
    summary: number;

    favorStage: number;
    favorLevel: number;
    favorExp: number;

    special: Array<number>;

    postsId: number; //所在店铺id，即marketId
    positionId: JobType;// 所在岗位
    workStatusIndex: StaffWorkStatus;  //工作状态

    private isNew: boolean; //是否是新招聘的

    fatigueCd: number = 0; //疲劳cd时间


    constructor(staff: Staff) {
        CommonUtil.copy(this, staff);
    }

    //是否是up员工 社区协助使用
    judgeIsUpStaff(): IAssistanceUpJson {
        let activityId = 0;
        let active: IActivitiesInfo[] = DataMgr.getMainActivities();
        for (let index = 0; index < active.length; index++) {
            let activityJson = JsonMgr.getActivityJson(active[index].xmlId);
            if (activityJson && activityJson.type == ActiVityType.CommunityBig) {
                activityId = active[index].xmlId;
                break;
            }
        }
        if (activityId != 0) {
            let upStaffIds = JsonMgr.getAssistanceUpStaffIds(activityId);
            for (let index = 0; index < upStaffIds.length; index++) {
                if (upStaffIds[index].staffId == this.xmlId) {
                    return upStaffIds[index];
                }
            }
        }
        return null
    }

    //是否达标
    isConditionCan(staffLevel: number, attr: string[], effct, staffXmlId) {
        if (this.level < staffLevel) {
            return false;
        }
        for (let i = 0; i < attr.length; i++) {
            let strs = attr[i].split(',');
            let needId = Number(strs[0]);
            let needNum = Number(strs[1]);
            let staffNum = this.attrValues()[needId];
            if (effct && CommonUtil.isEmpty(effct.effects)) {
                staffNum = effct.getAttribute(staffXmlId, needId, staffNum);
            }
            if (staffNum < needNum) {
                return false;
            }
        }
        return true;
    }

    //是否疲劳
    isFatigue() {
        let now = DataMgr.getServerTime();
        return now < this.fatigueCd;
    }

    //查找是否拥有擅长
    isHaveAdvantages(type: StaffAdvantage): boolean {
        for (let i = 0; i < this.advantages.length; i++) {
            let advantage = this.advantages[i];
            if (advantage.unlock && advantage.type === type) {
                return true;
            }
        }
        return false;
    }

    getGender() {//0 女 1男
        if (this.isUnique()) {
            return JsonMgr.getStaffConfig(this.xmlId).sex;
        } else {
            return JsonMgr.getStaffRandom(this.xmlId).sex;
        }
    }

    //擅长岗位
    getSuggestId() {
        return this.suggestId;
    }

    //是否在工作
    inWork() {
        return this.workStatusIndex > 0;
    }

    //是否在岗位
    inDuty() {
        return this.workStatusIndex == StaffWorkStatus.DUTY;
    }

    isIdle() {
        return this.workStatusIndex == StaffWorkStatus.IDEA;
    }

    isFoster() {
        return this.workStatusIndex == StaffWorkStatus.FOSTER;
    }

    isUnique() {
        return this.star > 5;
    }

    isStar(star: number) {
        return this.star == star;
    }

    getIsNew() {
        return this.isNew;
    }

    notNew() {
        this.isNew = false;
    }

    getBreakThroughItemId(stage): string {
        const config: StaffConfig = this.getStaffConfig();
        if (config) {
            let stagestr: string[] = config.favorAdvancedItem.split(";");
            for (let nid = 0; nid < stagestr.length; nid++) {
                let str = stagestr[nid].split(":");
                if (str[0] == stage) {
                    return str[1];
                }
            }
        }
        return "";
    }

    getAvantages(): number[] {
        if (this.isUnique()) {
            const config: StaffConfig = this.getStaffConfig();
            if (config) {
                return config.advantage;
            }
        } else {
            const config: StaffRandomConfig = this.getStaffRandomConfig();
            if (config) {
                return config.skill;
            }
        }
        return [];
    }

    getAvantagesLimit(): number[] {
        if (this.isUnique()) {
            const config: StaffConfig = this.getStaffConfig();
            if (config) {
                return config.advantageLimit;
            }
        } else {
            const config: StaffRandomConfig = this.getStaffRandomConfig();
            if (config) {
                return config.advantageLimit;
            }
        }
        return [];
    }

    getName(): string {
        if (this.isUnique()) {
            const config: StaffConfig = this.getStaffConfig();
            if (config) {
                //cc.log(this.xmlId, this.artResId, staffJson.id, staffJson.name);
                return config.name;
            }
            return this.firstName + "." + this.lastName;
        }
        return JsonMgr.getStaffFirstName(this.firstName) + JsonMgr.getStaffLastName(this.lastName);
    }

    getResId() {
        return this.isUnique() ? this.getStaffConfig().artResId : this.xmlId;
    }

    getIntro() {
        if (this.isUnique()) {
            const config: StaffConfig = this.getStaffConfig();
            if (config) {
                if (config.description) {
                    return config.description;
                } else {
                    return Staff.NOT_FOUND_INTRO;
                }
            }
            return Staff.NOT_FOUND_INTRO;
        } else {
            const nameConfig: NameConfig = this.getStaffNameConfig();
            if (nameConfig) {
                return nameConfig.description;
            }
            return Staff.NOT_FOUND_INTRO;
        }
    }

    sumAttribute(): number {
        return this.intelligence
            + this.power
            + this.patience
            + this.glamour;
    }

    getIntelligence(trunc: boolean = true): number {
        return (trunc ? Math.ceil(this.intelligence) : this.intelligence);
    }

    getPower(trunc: boolean = true): number {
        return (trunc ? Math.ceil(this.power) : this.power);
    }

    getGlamour(trunc: boolean = true): number {
        return (trunc ? Math.ceil(this.glamour) : this.glamour);
    }

    getPatience(trunc: boolean = true): number {
        return (trunc ? Math.ceil(this.patience) : this.patience);
    }


    isMaxLevel() {
        return this.level >= JsonMgr.getMaxStaffLvByStar(this.star);
    }

    static isMaxTrainLv(trainLv: number) {
        return trainLv >= 200;
    }

    attrGrowth(): Array<number> {
        return [this.intelligenceGrow, this.patienceGrow, this.glamourGrow, this.powerGrow]
    }

    attrLevels(): Array<number> {
        return [this.intelligenceLv, this.patienceLv, this.glamourLv, this.powerLv];
    }

    attrAdd(): number[] {
        return [this.intelligenceAdd, this.patienceAdd, this.glamourAdd, this.powerAdd];
    }

    //智慧 灵巧 亲和 体力
    attrValues(): Array<number> {
        return [this.getIntelligence(), this.getPatience(), this.getGlamour(), this.getPower()];
    }

    mainAttribute(): StaffAttr {
        let max = Math.max(this.intelligence, this.power, this.patience, this.glamour);
        switch (max) {
            case this.intelligence:
                return StaffAttr.intelligence;
            case this.power:
                return StaffAttr.power;
            case this.patience:
                return StaffAttr.patience;
            case this.glamour:
                return StaffAttr.glamour;
        }
    }

    mainAttributeStr(): string {
        let attr: StaffAttr = this.mainAttribute();
        switch (attr) {
            case StaffAttr.intelligence:
                return "智力";
            case StaffAttr.power:
                return "体力";
            case StaffAttr.patience:
                return "灵巧";
            case StaffAttr.glamour:
                return "亲和";
        }
    }

    //根据attribute表的key获取对应员工属性值
    getAttrByXmlId(xmlId: number): number {
        return this.getAttrValue(Staff.XML_ATTR[xmlId]);
    }

    getAttrValue(staffAttr: StaffAttr, isJobState: boolean = false): number {
        //isJobState = false;
        if (staffAttr >= StaffAttr.intelligence && isJobState) {
            let jobScore: number = JsonMgr.calculateJob(Staff.getJobTypeStr(staffAttr),
                this.getIntelligence(false), this.getPower(false),
                this.getGlamour(false), this.getPatience(false));
            return Math.round(jobScore);
        }

        switch (staffAttr) {
            case StaffAttr.level:
                return this.level;
            case StaffAttr.star:
                return this.star;
            default:
                return this.attrValues()[Staff.staffAttr2JobType(staffAttr)];
        }
    }

    static staffAttr2JobType(staffAttr: StaffAttr): JobType {
        return staffAttr - 2; //减2是因为后端存储的岗位id从0开始，比前端从星级开始少了2
    }

    static jobType2StaffAttr(jobType: JobType): StaffAttr {
        return jobType + 2; //staffAttr2JobType的逆操作
    }

    static getJobTypeStr(staffAttr: StaffAttr): JobTypeStr {
        return STAFF_JOB_INFO[Staff.staffAttr2JobType(staffAttr)].typeStr;
    }

    static getStaffAdvStr(adv: StaffAdvantage): string {
        return STAFF_ADV_INFO[adv - 1].name;
    }

    static getAttrIconUrl(staffAttr: StaffAttr, isJobState: boolean = false): string {
        return Staff.getStaffAttrIconUrl(staffAttr, isJobState);
    }

    static getStaffAttrIconByXmlId(xmlId: number): string {
        return Staff.getStaffAttrIconUrl(Staff.XML_ATTR[xmlId], false);
    }

    static getStaffAttrIconUrl(staffAttr: StaffAttr, isJobState: boolean = false): string {
        return ResManager.STAFF_UI + Staff.getStaffAttrIconName(staffAttr, isJobState);
    }

    static getStaffAttrIconName(staffAttr: StaffAttr, isJobState: boolean = false): string {
        //isJobState = false;
        switch (staffAttr) {
            case StaffAttr.level:
                return "lv";

            case StaffAttr.intelligence:
                return isJobState ? "job_cashier" : "attr_zl";
            case StaffAttr.power:
                return isJobState ? "job_tallyman" : "attr_tl";
            case StaffAttr.glamour:
                return isJobState ? "job_touter" : "attr_qh";
            case StaffAttr.patience:
                return isJobState ? "job_saleman" : "attr_lq";
        }
    }

    //获取已经解锁的擅长类型数组
    getAdvantages(): Array<StaffAdvantage> {
        return this.advantages.filter((advanatge: IAdvantage) => {
            return advanatge.unlock;
        }).map((advanatge: IAdvantage) => {
            return advanatge.type;
        });
    }

    hasAdvantage(filter: HashSet<StaffAdvantage>): boolean {
        for (let value of this.advantages) {
            if (value.unlock && filter.has(value.type)) {
                return true;
            }
        }
        return false;
    }

    //员工头像框
    getStarBorderUrl() {
        let index: number = Math.min(this.star - 2, 4); //星级在3～5之间
        //cc.log((index + 1), ResManager.STAFF_UI + "b" + (index + 1));
        return ResManager.STAFF_UI + "b" + (index + 2);
    }

    getStarBorderNoUrl() {
        let index: number = Math.min(this.star - 2, 4); //星级在3～5之间
        //cc.log((index + 1), ResManager.STAFF_UI + "b" + (index + 1));
        return ResManager.getItemBoxBasePathUrl() + "c" + (index + 2);
    }

    //员工卡牌颜色
    getStaffCardColorUrl() {
        let index: number = Math.min(this.star - 2, 4); //星级在3～5之间
        return ResManager.STAFF_COLOR + "staffk" + (index + 2);
    }

    //员工卡牌旁颜色
    getStaffCardPanColorUrl() {
        let index: number = Math.min(this.star - 2, 4); //星级在3～5之间
        return ResManager.STAFF_COLOR + "staffkt" + (index + 2);
    }

    //岗位头像框
    getJobBorderUrl() {
        let index: number = Math.min(this.star - 2, 4); //星级在3～5之间
        return ResManager.STAFF_UI + "job_b" + index;
    }

    getColor(): number {
        return Math.min(this.star - 2, 4); //星级在3～5之间
    }

    getResumeBgImageUrl() {
        // return ResMgr.getStaffRecruitImage("recruit_resume");
        let index: number = Math.min(this.star - 2, 4); //星级在3～5之间
        return ResManager.platformPath("images/staff/recruit/recruit_resume") + index;
    }

    getSpineUrl(): string {
        return Staff.getStaffSpineUrl(this.artResId);
    }

    static getLowStaffSpineUrl(artResId: number) {
        return Staff.getStaffSpineUrl(artResId, true);
    }

    static getStaffSpineUrl(artResId: number, isLow: boolean = false) {
        const modName: string = Staff.getStaffModName(artResId);
        return ResManager.STAFF_SPINE + Staff.getSpineDir(isLow) + modName + "/" + modName;
    }

    static getSpineDir(isLow: boolean = false): string {
        if (!isLow) {
            isLow = DataMgr.isLowPhone();
        }
        return isLow ? "low/" : "high/";
    }

    getAvatarUrl(): string {
        return Staff.getStaffAvataUrl(this.getModName());
    }

    getModName(): string {
        return Staff.getStaffModName(this.artResId);
    }

    getStaffMode(): StaffModConfig {
        return JsonMgr.getStaffMod(this.artResId);
    }

    //根据员工配置表xmlId获取 员工头像
    static getStaffAvataUrlById(xmlId: number, isBig: boolean = false): string {
        let config: StaffConfig = Staff.getUniqueStaffConfig(xmlId);
        return Staff.getStaffAvataUrlByResId(config.artResId, isBig);
    }

    //根据员工配置表artResId获取 员工头像
    static getStaffAvataUrlByResId(resId: number, isBig: boolean = false): string {
        let modName: string = Staff.getStaffModName(resId, isBig);
        return Staff.getStaffAvataUrl(modName);
    }

    //根据员工配置表artResId获取 员工模型名字
    static getStaffModName(artResId: number, isBig: boolean = false): string {
        let staffMod: StaffModConfig = JsonMgr.getStaffMod(artResId);
        if (!staffMod) {
            console.error("not found staffMod", artResId);
            return "DMHaiZeiLuFei"; //没有找到模型的都用路飞代替。。。;
        }
        return staffMod.name + (isBig ? "_big" : "");
    }

    //根据 员工模型名字 获取员工头像，例如modName为lufei
    static getStaffAvataUrl(modName: string) {
        return ResManager.STAFF_AVATAR + modName;
    }

    private getStaffConfig(): StaffConfig {
        return Staff.getUniqueStaffConfig(this.xmlId);
    }

    getStaffRandomConfig(): StaffRandomConfig {
        return JsonMgr.getStaffRandom(this.xmlId);
    }

    //根据员工配置表xmlId 获取Unique员工名字
    static getStaffName(xmlId: number): string {
        let config: StaffConfig = Staff.getUniqueStaffConfig(xmlId);
        return config ? config.name : "未找到Unique员工名字";
    }

    //根据员工配置表xmlId 获取Unique员工配置表对象
    static getUniqueStaffConfig(xmlId: number): StaffConfig {
        return JsonMgr.getStaffConfig(xmlId);
    }

    private getStaffNameConfig(): NameConfig {
        return JsonMgr.getNameConfig(this.summary);
    }

    static initStarIcon(star: number, starIcons: Array<cc.Sprite>) {
        let starSize = Math.min(star, starIcons.length);
        for (let i = 0; i < starSize; i++) {
            starIcons[i].node.active = true;
        }
        for (let i = starSize; i < starIcons.length; i++) {
            starIcons[i].node.active = false;
        }
    }

    static initAdvantageIcon(advantages: Array<StaffAdvantage>, advantageIcons: Array<cc.Sprite>, isMax: boolean = true, isDetail: boolean = false) {
        advantageIcons.forEach((value: cc.Sprite) => {
            value.spriteFrame = null;
        });
        advantageIcons[0].node.parent.setScale(1, 1);
        this.fillAllAdvantages(advantages, advantageIcons, isMax, !isDetail);
    }

    private static fillAllAdvantages(advantages: Array<StaffAdvantage>, advantageIcons: Array<cc.Sprite>,
                                     isMax: boolean = true, useSrcRect: boolean = true) {
        advantages.forEach((value, index) => {
            if (!advantageIcons[index]) {
                return;
            }
            UIUtil.asyncSetImage(advantageIcons[index],
                isMax ? Staff.getStaffAdvantageMaxIconUrl(value) : Staff.getStaffAdvantageMinIconUrl(value), useSrcRect);
        });
    }

    static getStaffAdvantageAllIconUrl() {
        return ResManager.STAFF_UI + "adv_all";
    }

    getAdvantageMaxIconUrl(index: number): string {
        return Staff.getStaffAdvantageMaxIconUrl(index);
    }

    static getStaffAdvantageMaxIconUrl(index: number) {
        return ResManager.STAFF_UI + "adv_max" + index;
    }

    getAdvantageIconUrl(index: number): string {
        return Staff.getStaffAdvantageIconUrl(index);
    }

    static getStaffAdvantageIconUrl(index: number) {
        return ResManager.STAFF_UI + "adv" + index;
    }

    getAdvantageMinIconUrl(index: number): string {
        return Staff.getStaffAdvantageMinIconUrl(index);
    }

    static getStaffAdvantageMinIconUrl(index: number) {
        return ResManager.STAFF_UI + "adv_min" + index;
    }

    getJobIconUrl() {
        if (this.workStatusIndex == StaffWorkStatus.DUTY) {
            return ResManager.STAFF_UI + "job_" + (this.positionId + 1);
        }
        return ResManager.STAFF_UI + "work" + this.workStatusIndex;
    }

    getSuggestJobImageUrl(): string {
        return Staff.getStaffSuggestJobImageUrl(this.suggestId);
    }

    static getStaffSuggestJobImageUrl(suggest: number) {
        return ResManager.STAFF_UI + Staff.getJobImage(suggest);
    }

    static getJobImage(suggestId: JobType): string {
        return STAFF_JOB_INFO[suggestId].image;
    }

    getSuggestJobName(): string {
        return Staff.getJobName(this.suggestId);
    }

    getSuggestJobAction(): Array<string> {
        return Staff.gatJobAction(this.suggestId);
    }

    static getJobName(suggestId: JobType): string {
        return STAFF_JOB_INFO[suggestId].name;
    }

    static gatJobAction(suggestId: JobType): Array<string> {
        return STAFF_JOB_INFO[suggestId].actions;
    }

    getJobActions(): Array<string> {
        if (this.positionId < 0) {
            return Role.STAFF_ACTIONS;
        }
        return STAFF_JOB_INFO[this.positionId].actions;
    }

    static getAttrByJob(jobType: JobType): StaffAttr {
        return STAFF_JOB_INFO[jobType].attr;
    }

    getTotalExp() {
        let totalExp: number = 0;
        for (let i = 1; i < this.level; i++) {
            totalExp += JsonMgr.getStaffLevelExp(i);
        }
        totalExp += this.exp;
        return totalExp;
    }

    getExpLabelStr(): string {
        if (this.isMaxLevel()) {
            return StaffData.MAX_STRING + StaffData.SEPARATOR + StaffData.MAX_STRING;
        } else {
            return this.exp + StaffData.SEPARATOR + this.getLevelUpExp();
        }
    }

    getExpProgress() {
        return this.isMaxLevel() ? 1 : this.exp / this.getLevelUpExp();
    }

    getLevelUpExpStr(): string {
        const levelUpExp: number = this.getLevelUpExp();
        return levelUpExp < 0 ? StaffData.MAX_STRING : levelUpExp + "";
    }

    getLevelUpExp(): number {
        return JsonMgr.getStaffLevelExp(this.level);
    }

    static calcLevelAttr(grow: number, level: number, star: number): number {
        return grow * level + 15
        // return Math.pow(grow, 2) * (level * 0.1 + 1.25) * Math.min(star, 5) / 5;
    }

    getProportionSum() {
        let sum: number = 0;
        this.proportion.forEach((value) => {
            sum += value;
        });
        return sum;
    }

    getGoldFailRewards(): Array<Reward> {
        if (this.isUnique()) {
            const config: StaffConfig = JsonMgr.getStaffConfig(this.xmlId);
            return config.getGoldFailRewards();
        } else {
            const config: StaffRandomConfig = JsonMgr.getStaffRandom(this.xmlId);
            return config.getGoldFailRewards();
        }
    }

    getGoldRepeatRewards(): Array<Reward> {
        if (this.isUnique()) {
            const config: StaffConfig = JsonMgr.getStaffConfig(this.xmlId);
            return config.getGoldRepeatRewards();
        }
        return [];
    }

    getDiamRepeatRewards(): Array<Reward> {
        if (this.isUnique()) {
            const config: StaffConfig = JsonMgr.getStaffConfig(this.xmlId);
            return config.getDiamRepeatRewards();
        }
        return [];
    }

    getLeaveRewards(): Array<Reward> {
        if (this.isUnique()) {
            cc.log("Unique员工不可解雇告别");
            return [];
        }
        const config: StaffRandomConfig = JsonMgr.getStaffRandom(this.xmlId);
        return config.getLeaveRewards();
    }

    getLeaveMaxRewards(): Array<Reward> {
        if (this.isUnique()) {
            cc.log("Unique员工不可解雇告别");
            return [];
        }
        const config: StaffRandomConfig = JsonMgr.getStaffRandom(this.xmlId);
        return config.getLeaveMaxRewards();
    }

}
