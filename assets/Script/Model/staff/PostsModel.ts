/**
 * @Author whg
 * @Date 2019/9/3
 * @Desc 单一店铺的岗位数据
 */
import {IPost, IPosts} from "../../types/Response";
import {JobType} from "../StaffData";
import {CommonUtil} from "../../Utils/CommonUtil";

export class PostsModel {

    private _marketId: number = -1;
    private _postMap: Map<JobType, IPost> = new Map();

    private unlockJobType: JobType = -1; //首次解锁需要播放动画的岗位

    constructor(posts: IPosts){
        this.updatePosts(posts);
    }

    updatePosts(posts: IPosts){
        this._marketId = posts.id;
        posts.positions.forEach((post: IPost) => {
            this.updatePost(post);
        });
    }

    updatePost(post: IPost) {
        this._postMap.set(post.positionId, post);
        if(post.newLockFlag){
            this.unlockJobType = post.positionId;
        }
    }

    getPosts(): Array<IPost>{
        return CommonUtil.mapValues(this._postMap);
    }

    getPost(jobType: JobType): IPost {
        return this._postMap.get(jobType);
    }

    getAllSumScore():number{//单个店铺总战力
        let sumScore:number = 0;
        let posts:Array<IPost> = this.getPosts();
        for(let i = 0;i<posts.length;i++){
            let post:IPost = posts[i];
            sumScore+=post.sumScore;
        }
        return sumScore;
    }
    get marketId(): number {
        return this._marketId;
    }

    getUnlockJobType(){
        return this.unlockJobType;
    }

    resetUnlockJobType(){
        this.unlockJobType = -1;
    }

}
