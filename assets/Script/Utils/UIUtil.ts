/*
 * @Author: tyq 
 * @Date: 2019-01-07 
 * @Desc: 
 */

import {CommonUtil} from "./CommonUtil";
import {UIMgr} from "../global/manager/UIManager";
import {ResMgr} from "../global/manager/ResManager";

const PREFAB: string = "Prefab/";

const ORIGIN: cc.Vec2 = cc.v2(0, 0);

export class UIUtil {

    private static urlImpMap: Map<string, cc.SpriteFrame> = new Map<string, cc.SpriteFrame>();

    private static curDR: cc.Size = null;

    public static loadScene(scene, cb?: any) {
        let self = this;
        self.curDR = null;

        cc.director.loadScene(scene, function () {
            cc.log(scene + ' loaded');
            // Utils.resize();
            if (cb) {
                cb();
            }
        });
    }

    //自适配
    public static resize(newCvs: any) {
        // let cvs = cc.find('Canvas').getComponent(cc.Canvas);
        let cvs = newCvs;
        //保存原始设计分辨率，供屏幕大小变化时使用
        if (!this.curDR) {
            this.curDR = cvs.designResolution;
        }
        let dr = this.curDR;
        let s = cc.view.getFrameSize();
        let rw = s.width;
        let rh = s.height;
        let finalW = rw;
        let finalH = rh;

        if ((rw / rh) > (dr.width / dr.height)) {
            //!#zh: 是否优先将设计分辨率高度撑满视图高度。 */
            //cvs.fitHeight = true;

            //如果更长，则用定高
            finalH = dr.height;
            finalW = finalH * rw / rh;
        } else {
            /*!#zh: 是否优先将设计分辨率宽度撑满视图宽度。 */
            //cvs.fitWidth = true;
            //如果更短，则用定宽
            finalW = dr.width;
            finalH = rh / rw * finalW;
        }
        cvs.designResolution = cc.size(finalW, finalH);
        cvs.node.width = finalW;
        cvs.node.height = finalH;
        cvs.node.emit('resize');
    }

    //创建NodePool在外面自己new
    static initNodePool(nodePool: cc.NodePool, size: number, prefab: cc.Prefab) {
        let node: cc.Node;
        for (let i = 0; i < size; i++) {
            node = cc.instantiate(prefab);
            nodePool.put(node);
        }
    }

    static getNodeFromPool(nodePool: cc.NodePool, prefab: cc.Prefab) {
        let node: cc.Node = nodePool.get();
        if (!node) {
            node = cc.instantiate(prefab);
        }
        return node;
    }

    static putNodeToPool(nodePool: cc.NodePool, node: cc.Node) {
        nodePool.put(node);
    }

    //删除NodePool设置为null外面自己做
    static clearPool(nodePool: cc.NodePool) {
        nodePool.clear();
    }

    static getComponentByName(node: cc.Node, name: string): any{
        let show = node.active;
        UIUtil.showNode(node); //先show出来确保下面的getComponent能获取到
        let component = node.getComponent(name);
        UIUtil.visibleNode(node, show);
        return component;
    }

    static getComponent<T extends cc.Component>(node: cc.Node, type: {prototype: T}): T{
        let show = node.active;
        UIUtil.showNode(node); //先show出来确保下面的getComponent能获取到
        let component = node.getComponent(type);
        UIUtil.visibleNode(node, show);
        return component;
    }

    static getChildComponent<T extends cc.Component>(parentNode: cc.Node, childName: string, type: {prototype: T}): T{
        return UIUtil.getChildNode(parentNode, childName).getComponent(type);
    }

    static getChildNode(parentNode: cc.Node, childName: string): cc.Node{
        return parentNode.getChildByName(childName);
    }

    static visible(component: cc.Component, show: boolean) {
        if (component) {
            UIUtil.visibleNode(component.node, show);
        }
    }

    static visibleNode(node: cc.Node, show: boolean) {
        if (show) {
            UIUtil.showNode(node);
        } else {
            UIUtil.hideNode(node);
        }
    }

    static show(component: cc.Component) {
        if (component) {
            UIUtil.showNode(component.node);
        }
    }

    static showNode(node: cc.Node) {
        if (node && !node.active) {
            node.active = true;
        }
    }

    static hide(component: cc.Component) {
        if (component) {
            UIUtil.hideNode(component.node);
        }
    }

    static hideNode(node: cc.Node) {
        if (node && node.active) {
            node.active = false;
        }
    }

    static loadUrlImg(url: string, sprite: cc.Sprite) {
        if (!sprite) {
            cc.log("loadUrlImg --> sprite is null! url=", url);
            return;
        }
        UIUtil.loadUrlImage(url, (spriteFrame: cc.SpriteFrame) => {
            if(!sprite.isValid){
                cc.log("loadUrlImage --> sprite node lost!!!");
                return;
            }
            // cc.log("loadUrlImage --> sprite has node...");
            if (spriteFrame) {
                sprite.spriteFrame = spriteFrame;
            } else {
                ResMgr.setMainUIIcon(sprite, "mrtx");
            }
        });
    }

    static loadUrlImage(url: string, cb: Function) {
        if (url && url.length > 0) {
            let spriteFrame: cc.SpriteFrame = this.urlImpMap.get(url);
            if (spriteFrame) {
                cb(spriteFrame);
            } else {
                const image = new Image();
                image.crossOrigin = "anonymous";
                image.src = url;
                image.onload = () => {
                    const texture: cc.Texture2D = new cc.Texture2D();
                    texture.initWithElement(image);
                    spriteFrame = new cc.SpriteFrame(texture);
                    this.urlImpMap.set(url, spriteFrame);

                    cb(spriteFrame);
                };
                image.onerror = (err) => {
                    // cc.error(err);
                    cb(null);
                };
            }
        } else {
            cb(null);
        }
    }

    static clearUrlImpMap() {
        this.urlImpMap.clear();
    }

    static deleteLoadUrlImg(urls: Array<string>) {
        urls.forEach((url) => {
            const existSprite: cc.SpriteFrame = this.urlImpMap.get(url);
            if (existSprite) {
                if (existSprite.clearTexture) {
                    existSprite.clearTexture();
                }
                this.urlImpMap.delete(url);
            }
        });
    }

    static asyncSetImage(sprite: cc.Sprite, imageUrl: string, useSrcRect: boolean = true, cb: (spriteFrame: cc.SpriteFrame) => void = null, isShow: boolean = true) {
        if (!sprite) {
            cc.log("asyncSetImage --> sprite is null! imageUrl=", imageUrl);
            return;
        }
        cc.loader.loadRes(imageUrl, cc.SpriteFrame, (error: Error, spriteFrame: cc.SpriteFrame) => {
            if (error) {
                cc.error(error);
                return;
            }
            UIUtil.setImage(sprite, spriteFrame, useSrcRect, isShow);
            cb && cb(spriteFrame);
            // if(imageUrl.indexOf("avatar") >= 0){
            //     cc.dynamicAtlasManager.insertSpriteFrame(spriteFrame);
            // }
        });
    }

    //useSrcRect代表是否使用原图大小，默认为true
    private static setImage(sprite: cc.Sprite, image: cc.SpriteFrame, useSrcRect: boolean = true, isShow: boolean = true) {
        if(!sprite.isValid){
            cc.log("setImage --> sprite node lost!!!");
            return;
        }
        // cc.log("setImage --> sprite has node...");
        if (image) {
            sprite.spriteFrame = image;
            if (useSrcRect) {
                let rect: cc.Rect = image.getRect();
                if(rect && sprite.node){
                    sprite.node.width = rect.width;
                    sprite.node.height = rect.height;
                }
            }
            isShow && UIUtil.show(sprite);
        } else {
            sprite.spriteFrame = null;
        }
    }

    //动态加载AnimationClip并播放第一个动画
    static asyncPlayAnim(animation: cc.Animation, animationUrl: string, cb?: Function) {
        if(UIUtil.isAnimEmpty(animation)){
            UIUtil.asyncSetAnim(animation, animationUrl, (clip: cc.AnimationClip) => {
                UIUtil.playFirstAnim(animation);
                cb && cb();
                // animation.on("stop", () => {
                //     cc.log(animation.currentClip.name, "stop");
                // });
                // animation.on("finished", () => {
                //     cc.log(animation.currentClip.name, "finished");
                // });
                // animation.on("lastframe", () => {
                //     cc.log(animation.currentClip.name, "lastframe");
                // });
            });
        }else{
            UIUtil.playFirstAnim(animation);
            cb && cb();
        }
    }

    private static isAnimEmpty(animation: cc.Animation) {
        return animation.getClips().length == 0;
    }

    static asyncSetAnim(animation: cc.Animation, animationUrl: string, cb: (clip: cc.AnimationClip) => void = null) {
        cc.loader.loadRes(animationUrl, cc.AnimationClip, (error: Error, clip: cc.AnimationClip) => {
            if (error) {
                cc.error(error);
                return;
            }
            animation.addClip(clip);
            cb && cb(clip);
        });
    }

    //播放第1个动画
    static playFirstAnim(animation: cc.Animation) {
        let animName = animation.getClips()[0].name;
        let animState = animation.getAnimationState(animName);
        if(animState.isPlaying) return;
        animation.play(animName);
    }

    static asyncPlaySpine(spine: sp.Skeleton, spineUrl: string, name: string, loop: boolean, cb?: Function){
        if(!spine.skeletonData){
            UIUtil.asyncSetSpine(spine, spineUrl, () => {
                spine.setAnimation(0, name, loop);
                cb && cb();
            })
        }else{
            spine.setAnimation(0, name, loop);
            cb && cb();
        }
    }

    //注意：如果想使用spine的默认图片展示，则缓存模式必须为REALTIME
    static asyncSetSpine(spine: sp.Skeleton, spineUrl: string, cb: (skeletonData: sp.SkeletonData) => void = null) {
        cc.loader.loadRes(spineUrl, sp.SkeletonData, (error: Error, skeletonData: sp.SkeletonData) => {
            if (error) {
                cc.error(error);
                return;
            }
            spine.skeletonData = skeletonData;
            // spine.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);//
            cb && cb(skeletonData);
        });
    }

    static setImageGray(sprite: cc.Sprite) {
        sprite.setMaterial(0, cc.Material.getBuiltinMaterial("2d-gray-sprite"));
    }

    static setImageNormal(sprite: cc.Sprite) {
        sprite.setMaterial(0, cc.Material.getBuiltinMaterial("2d-sprite"));
    }

    static setLabel(label: cc.Label, value: any, color: cc.Color = null, visible: boolean = true) {
        color && UIUtil.setColor(label, color);
        UIUtil.visible(label, visible);
        if (!CommonUtil.isString(value)) {
            value = value.toString();
        }
        if (label.string == value) {
            return;
        }
        label.string = value;
    }

    static setColorNode(node: cc.Node, color: cc.Color) {
        if (node.color.equals(color)) {
            return;
        }
        node.color = color;
    }

    static setColor(component: cc.Component, color: cc.Color) {
        if (component.node.color.equals(color)) {
            return;
        }
        component.node.color = color;
    }

    //透明，此方法代替spine动画节点的hide，因为spine动画隐藏后再显示，动画就不播放了
    static transparent(component: cc.Component) {
        UIUtil.setOpacity(component, 0);
    }

    static nontransparent(component: cc.Component) {
        UIUtil.setOpacity(component, 255);
    }

    static setOpacity(component: cc.Component, opacity: number) {
        if (component.node.opacity == opacity) {
            return;
        }
        component.node.opacity = opacity;
    }

    static setProgressBar(progressBar: cc.ProgressBar, progress: number) {
        if (progressBar.progress == progress) {
            return;
        }
        progressBar.progress = progress;
    }

    // 移除ScrollView所有内容并重置位置为(0, 0)原点
    static cleanScrollView(scrollView: cc.ScrollView) {
        scrollView.content.removeAllChildren();
        scrollView.setContentPosition(ORIGIN);
    }

    static loadPrefabAddCanvas(url: string, cb: Function) {//动态加载预设体并添加到场景Canvas
        UIUtil.loadPrefabAndAdd(url, UIMgr.getCanvas(), cb);
    }

    static loadPrefabAndAdd(url: string, parentNode: cc.Node, cb: Function) {//动态加载预设体并添加到场景父节点parentNode
        UIUtil.dynamicLoadPrefab(url, (preNode) => {
            parentNode.addChild(preNode);
            cb && cb();
        });
    }

    static dynamicLoadPrefab(url: string, callBack: Function) {//动态加载预制体
        url = UIUtil.prefabUrl(url);
        cc.loader.loadRes(url, cc.Prefab, (error, pre: cc.Prefab) => {
            // UIUtil.Loading.active = false;
            if (error) {
                cc.error(error);
                return;
            }

            let prefabNode = cc.instantiate(pre);
            callBack && callBack(prefabNode);
        });
    }

    static dynamicLoadImage(url: string, callBack: Function) {//动态加载image
        cc.loader.loadRes(url, cc.SpriteFrame, (error, pre: cc.SpriteFrame) => {
            if (!error) {
                if (callBack) {
                    callBack(pre);
                }
            } else {
                cc.error(error);
            }
        });
    }

    static dynamicLoadAtlasImage(atlas: string, cb: Function) {
        cc.loader.loadRes(atlas, cc.SpriteAtlas, (error, pre: cc.SpriteAtlas) => {
            if (!error) {
                if (cb) {
                    cb(pre);
                }
            } else {
                cc.error(error);
            }
        });
    }

    static dynamicLoadDir(url: string, cb: Function) {
        cc.loader.loadResDir(url, cc.SpriteFrame, (error, assets: cc.SpriteFrame[], urls: string[]) => {
            if (error) {
                cc.error(error);
            } else {
                cb && cb(assets, urls);
            }
        })
    }

    static dynamicLoadRecruitRes(spinName: string, cb: Function) {
        cc.loader.loadRes(spinName, sp.SkeletonData,
            (err: Error, spine: sp.SkeletonData) => {
                if (err) {
                    cc.log(err);
                    return;
                }
                cb && cb(spine);
            });
    }

    //释放资源内存 除了特定exceptDir文件夹（一般是通用common文件夹）
    static releaseAllDeps(url: string, exceptDir: string = null) {
        // window.rawAsseets = realRawAssets;
        // url = UIUtil.prefabUrl(url);
        // let deps = cc.loader.getDependsRecursively(url);
        // deps.forEach((item) => {
        // let resItem = cc.loader.getRes(item);
        // let assetArr = (<any>window).rawAsseets.assets;
        // console.log("1111",resItem);
        // if(resItem){
        //     if(resItem._name == "builtin-2d-sprite" || resItem._name == "default_sprite_splash" || resItem._name == "") return;
        //     if (resItem._uuid != null && resItem._uuid) {
        //         console.log("2222",resItem._uuid);
        //         if (assetArr[resItem._uuid]) {
        //             console.log("3333",assetArr[resItem._uuid]);
        //             let obj = assetArr[resItem._uuid][0].split("/");
        //             if(obj[0] !== "Font" || obj[0] !== "Prefab"){
        //                 // cc.loader.release(item);
        //             }
        //         }else{
        //             console.log("4444",resItem._uuid);
        //             // cc.loader.release(item);
        //         }
        //     }
        // }
        // });
        cc.sys.garbageCollect();
    }

    static prefabUrl(url: string) {
        return url.indexOf(PREFAB) == -1 ? PREFAB + url : url;
    }

    //全屏界面适配
    /**
     * 适配layout
     * 高改变的节点数组
     * 位置改变的节点数组
     */
    static AdaptationView(changeLay: cc.Layout, HeightChangeArr: cc.Node[], posChangeArr: cc.Node[]) {
        let change = (cc.winSize.height - 1334);
        let changeY = change * 0.6;
        let changeMove = change * 0.15;
        let changeMove1 = change * 0.25;
        changeLay.spacingY += changeMove;

        for (let index = 0; index < HeightChangeArr.length; index++) {
            HeightChangeArr[index].height += changeY;
        }
        for (let index = 0; index < posChangeArr.length; index++) {
            posChangeArr[index].y -= changeY;
        }
        changeLay.node.height += changeMove1;
    }

}
