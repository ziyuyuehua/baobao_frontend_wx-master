export default class ConfigResManager {

    private static _instance: ConfigResManager = null;

    static instance() {
        if (!ConfigResManager._instance) {
            ConfigResManager._instance = new ConfigResManager();
        }
        return ConfigResManager._instance;
    }

    private resMap: Map<string, IConfigDepends> = new Map();

    loadSpriteFrameRes(url: string, cb: Function) {
        cc.loader.loadRes(url, cc.SpriteFrame, (error: Error, spriteFrame: cc.SpriteFrame) => {
            if (error) {
                cc.log(error);
            } else {
                this.addRes(url, spriteFrame);
                cb && cb(spriteFrame);
            }
        });
    }

    loadSpineRes(url: string, cb: Function) {
        cc.loader.loadRes(url, sp.SkeletonData, (error: Error, skeletonData: sp.SkeletonData) => {
            if (error) {
                cc.log(error);
            } else {
                this.addRes(url, skeletonData);
                cb && cb(skeletonData);
            }
        });
    }

    addRes(url: string, assets: cc.Asset) {
        let configData = this.resMap.get(url);
        if (configData) {
            configData.count++;
        } else {
            this.resMap.set(url, {count: 1, depends: cc.loader.getDependsRecursively(assets), assets: assets});
        }
    }

    releaseSpine(url: string, node: cc.Node, isRemoveComponent: boolean = false, force: boolean = false) {
        let spine = node.getComponent(sp.Skeleton);
        if(spine){
            spine.skeletonData = null;
            isRemoveComponent && node.removeComponent(sp.Skeleton);
            this.releaseRes(url, force);
        }
    }

    releaseSprite(url: string, node: cc.Node, isRemoveComponent: boolean = false, force: boolean = false) {
        let sprite = node.getComponent(cc.Sprite);
        if(sprite){
            sprite.spriteFrame = null;
            isRemoveComponent && node.removeComponent(cc.Sprite);
            this.releaseRes(url, force);
        }
    }

    releaseRes(url: string, force: boolean = false) {
        let configData = this.resMap.get(url);
        if(!configData) return;
        configData.count--;
        if (configData.count === 0 || force) {
            configData.depends.forEach((value) => {
                cc.log(value);
                cc.loader.release(value);
            });
            // cc.loader.release(configData.depends);
            this.resMap.delete(url);
        }
    }

    getResMap(){
        return this.resMap;
    }

}

export const ConfigMgr = ConfigResManager.instance();

export interface IConfigDepends {
    count: number;
    depends: string[];
    assets: cc.Asset;
}