/**
 *@Athuor ljx
 *@Date 11:39
 */
import {UIUtil} from "../../Utils/UIUtil";
import {ResManager} from "../../global/manager/ResManager";
import {DataMgr, IPhoneState} from "../../Model/DataManager";
import {JsonMgr} from "../../global/manager/JsonManager";
import {UIMgr} from "../../global/manager/UIManager";
import {MapMgr} from "./MapInit/MapManager";
import {FutureState} from "./CacheMapDataManager";
import MapShow from "./MapShow";

export default class MapResManager {
    private assetsMap = new Map<string, ResValue>();

    static instance: MapResManager = new MapResManager();

    private mapBgAssets: Map<string, MapBgRes> = new Map<string, MapBgRes>();

    loadFutureAssets(url: string, cb: Function, id: number) {
        let getUrl = this.getFutureUrl(url);
        UIUtil.dynamicLoadImage(getUrl, (sprite: cc.SpriteFrame) => {
            let count = this.assetsMap.get(getUrl);
            if (count) {
                count.useCount++;
                count.isReleased = false;
            } else {
                let ids = cc.loader.getDependsRecursively(sprite);
                this.assetsMap.set(getUrl, {useCount: 1, referenceId: ids, isReleased: false});
            }
            if (id !== MapMgr.getFutureId()) {
                count && count.useCount--;
                return;
            }
            cb && cb(sprite);
        });
    }

    /**
     *注： 这里的release并不是真正的release，只是对其引用的数量进行一个减一操作，在最后的checkAssetsUse的方法中检测为零的引用
     * 实行真正的release
     */
    releaseAssets(url: string) {
        let trueUrl = this.getFutureUrl(url);
        let count = this.assetsMap.get(trueUrl);
        count && count.useCount--;
    }

    checkAssetsUse() {
        this.assetsMap.forEach((value, key) => {
            if (value.useCount <= 0) {
                value.isReleased = true;
                value.useCount = 0;
                value.referenceId.forEach((value1) => {
                    cc.log(value1);
                    cc.loader.release(value1);
                });
            }
        });
        this.changeMapRelease();
    }

    getFutureUrl(url: string) {
        let fix: string = "";
        if (MapMgr.getMapState() === FutureState.ACCESS) {
            fix += "low/";
        } else {
            fix += DataMgr.getPhoneState() === IPhoneState.HIGH ? "high/" : "low/";
        }
        return ResManager.FutureDirUrl + fix + url;
    }

    changeMapRelease() {
        let deleteArr: string[] = [];
        this.assetsMap.forEach((value, key) => {
            if (value.isReleased) {
                deleteArr.push(key);
            }
        });
        for (let i of deleteArr) {
            this.assetsMap.delete(i);
        }
    }

    loadMapBg = (cb: Function, fightCb?: Function) => {
        let marketId = DataMgr.iMarket.getMarketId();
        let xmlData = JsonMgr.getBranchStore(marketId);
        let url = marketId == 1 ? ResManager.FIRST_MAP_DIR : ResManager.MAP_BG_DIR + xmlData.shopMap;
        UIUtil.dynamicLoadDir(url, (assets: cc.SpriteFrame[], urls: string[]) => {
            urls.forEach((value, key) => {
                let sprite: cc.SpriteFrame = assets[key];
                let referenceIds = cc.loader.getDependsRecursively(sprite);
                this.mapBgAssets.set(sprite.name, {referenceId: referenceIds, mapBgTexture: sprite});
            });
            this.loadMapPrefab(cb, fightCb);
        });
    };

    setMapBgSprite(sprite: cc.Sprite, key: string) {
        if(!sprite || !sprite.isValid) return;
        sprite.spriteFrame = this.mapBgAssets.get(key).mapBgTexture;
    }

    releaseMapBgAssets() {
        this.mapBgAssets.forEach((value) => {
            let jsonIds = value.referenceId;
            jsonIds.forEach((value1) => {
                cc.loader.release(value1);
            })
        });
    }

    loadMapPrefab = (cb: Function, fightCb: Function) => {
        let id = DataMgr.iMarket.getMarketId();
        let url = ResManager.MAP_BASE_URL + id;
        cc.loader.loadRes(url, cc.Prefab, (error: Error, prefab: cc.Prefab) => {
            if (error) {
                cc.log(error)
            } else {
                let node = cc.instantiate(prefab);
                UIMgr.setMapNode(node);
                fightCb && fightCb();
                if(cb) {
                    cb(() => {
                        node.getComponent(MapShow).initMap(null);
                    });
                } else {
                    if(!fightCb) {
                        UIMgr.addMapNodeToCanvas();
                    }
                    node.getComponent(MapShow).initMap(null);
                }
            }
        });
    };
}

export const MapResMgr = MapResManager.instance;

export interface ResValue {
    useCount: number;
    referenceId: any[];
    isReleased: boolean;
}

export interface MapBgRes {
    referenceId: string[],
    mapBgTexture: cc.SpriteFrame
}
