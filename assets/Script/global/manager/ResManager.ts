/*
 * @Author: tyq 
 * @Date: 2019-01-06 
 * @Desc: 资源管理类
 */

import { UIUtil } from "../../Utils/UIUtil";
import { JsonManager, JsonMgr } from "./JsonManager";
import { Staff } from "../../Model/StaffData";
import { MapResMgr } from "../../CustomizedComponent/MapShow/MapResManager";
import { ShelvesType } from "../../Model/market/ShelvesDataModle";
import { DataMgr, IPhoneState } from "../../Model/DataManager";
import { MapMgr } from "../../CustomizedComponent/MapShow/MapInit/MapManager";
import { FutureState } from "../../CustomizedComponent/MapShow/CacheMapDataManager";
import callFunc = cc.callFunc;

const DIR: string = "platform/";

export class ResManager {

    static STAFF_SPINE: string = ResManager.platformPath("spine/role/");
    static STAFF_AVATAR: string = ResManager.platformPath("images/staff/list/avatar/");

    static RECRUIT_BEAR_URL: string = ResManager.platformPath("spine/recruit/staffRecruitSpine/skeleton");
    static RECRUIT_URL: string = ResManager.platformPath("spine/recruit/recruitNew/zhaomu");

    static STAFF_JOB: string = ResManager.platformPath("images/staff/job/");
    static STAFF_UI: string = ResManager.platformPath("images/staff/list/ui/");
    static STAFF_COLOR: string = ResManager.platformPath("images/staff/list/color/");

    static MAP_BASE_URL: string = "Prefab/Market/Map";
    static LONG_ORDER_HOUSE: string[] = [
        "Prefab/Map/Market1/",
        "Prefab/Map/Market2/",
        "Prefab/Map/Market3/"
    ];

    static STOCK_URL: string = ResManager.platformPath("spine/getStock/skeleton");

    static GOLD_RECTUI: string = ResManager.platformPath("texture/rectui/");//金币招募动态资源
    static GOLD_RECRUIT_SPINE: string = ResManager.platformPath("spine/recruit/gold/quality/");//金币招募动态资源

    private static GOODS_ICON: string = ResManager.platformPath("images/icon/goodsIcon/");
    private static FUTURE_ICON: string = ResManager.platformPath("images/icon/caseIcon/");
    private static VIP_BUFF_ICON: string = ResManager.platformPath("images/icon/buffIcon/");
    private static COMMUNITY_ICON: string = ResManager.platformPath("images/icon/communityIcon/");
    private static DECORATE_ICON: string = ResManager.platformPath("images/icon/decorateIcon/");
    private static FLOOR_ICON: string = ResManager.platformPath("images/icon/floorIcon/");
    private static POPULARITY_ICON: string = ResManager.platformPath("images/icon/popularityIcon/");
    private static WALLPAPER_ICON: string = ResManager.platformPath("images/icon/wallPaperIcon/");
    private static FLOOR_MOUDLE: string = ResManager.platformPath("texture/floor/");
    private static ITEM_ICON: string = ResManager.platformPath("images/icon/itemIcon/");
    private static FAVOR_ICON: string = ResManager.platformPath("images/icon/favorIcon/");
    private static ATTRIBUTE_ICON: string = ResManager.platformPath("images/icon/attIcon/");
    private static ATTRIBUTE_BIG__ICON: string = ResManager.platformPath("images/icon/bigAttIcon/");
    private static ACTION_ICON: string = ResManager.platformPath("images/icon/actionIcon/");
    static ITEM_BOX: string = ResManager.platformPath("images/common/item_box/");

    private static INCIDENT_SPECIALICON: string = ResManager.platformPath("images/icon/incident/");

    private static CASE_LEVEL: string = ResManager.platformPath("images/caseLv/");
    private static ANNOUNCEMENT: string = ResManager.platformPath("images/announcement/");
    private static IMAGES_COMMON: string = ResManager.platformPath("images/common/");

    private static CUCRRENCY_ICON = ResManager.platformPath("images/icon/currencyIcon/");

    private static SPECIAL_PATH: string = ResManager.platformPath("images/staff/special/");
    private static LINE_ICON: string = ResManager.platformPath("images/icon/lineIcon/");

    private static LONG_ORDER: string = ResManager.platformPath("texture/longOrder/");
    private static FIGHT: string = ResManager.platformPath("images/fight/");
    static STAFF_LV: string = ResManager.platformPath("spine/staff/staffLevel/staff_chenggong");
    static STAFF_LV2: string = ResManager.platformPath("spine/staff/staffLevel/staff_chenggong2");
    static POPULARIRT_UP: string = ResManager.platformPath("spine/popularity/map_renqizhitisheng");
    static STAFF_ADVANTAFE: string = ResManager.platformPath("spine/staff_jiesuo/staff_jiesuo");
    static STAFF_GOODS_UNLOCK: string = ResManager.platformPath("spine/staff/job/job_jiesuo/job_jiesuo");
    static STAFF_SPECIAL_LOCK: string = ResManager.platformPath("spine/staff/staff_anniutishi/staff_anniutishi");
    static FutureDirUrl = ResManager.platformPath("texture/futureAtlas/");
    static INCIDENT_BACKGROUND = ResManager.platformPath("texture/incident/");
    static INCIDENT_ATK: string = ResManager.platformPath("spine/incident/incident_atk/incident_shijian");
    static INCIDENT_ATK1: string = ResManager.platformPath("spine/incident/incident_atk1/incident_gongji");

    static HOLE: string = ResManager.platformPath("spine/Market1/hongyadong/map_hongyadong");
    static RIGHT_DOWN_HOUSE: string = ResManager.platformPath("spine/Market1/wawaji/map_zhuawawaji");
    static TRAIN: string = ResManager.platformPath("spine/Market1/Train/map_qinggui");
    static GOODS_LEFT_PAW = ResManager.platformPath("spine/purchase/goods_zhuazizuo/goods_zhuazizuo");
    static GOODS_RIGHT_PAW = ResManager.platformPath("spine/purchase/goods_zhuaziyou/goods_zhuaziyou");
    static GOODS_COMPLETE = ResManager.platformPath("spine/purchase/goods_hezi/goods_hezi1");
    static GOODS_EXPANSION = ResManager.platformPath("spine/purchase/goods_shengji/goods_shengji");
    static GOODS_DIAOLUO1 = ResManager.platformPath("spine/purchase/goods_diaoluo1/goods_diaoluo1");
    static GOODS_DIAOLUO2 = ResManager.platformPath("spine/purchase/goods_diaoluo2/goods_diaoluo2");
    static GOODS_DIAOLUO3 = ResManager.platformPath("spine/purchase/goods_diaoluo3/goods_diaoluo3");
    static GOODS_DIAOLUO4 = ResManager.platformPath("spine/purchase/goods_diaoluo4/goods_diaoluo4");
    static GOODS_DIAOLUO5 = ResManager.platformPath("spine/purchase/goods_diaoluo5/goods_diaoluo5");
    static GOODS_EMPTYBOX = ResManager.platformPath("spine/purchase/goods_kongxiangzi/goods_kongxiangzi");

    static WAREHOUR_EXPAND = ResManager.platformPath("spine/warehouse/warehour_expand");

    private static BRANCH_MARKET_BANNER = ResManager.platformPath("texture/marketBanner/");
    static MAP_BG_DIR = ResManager.platformPath("texture/MapBack/");
    static FIRST_MAP_DIR = ResManager.platformPath("texture/MapBack/marketFirst");

    static WX_HOUSE_DIR = ResManager.platformPath("texture/MapHouse/WxHouse/");
    static HOLE_SPRITE = ResManager.platformPath("texture/MapHouse/hole");
    static RIGHT_DOWN_HOUSE_SPRITE = ResManager.platformPath("texture/MapHouse/rightDownHouse");

    private static FRIENDFRAME_ICON = ResManager.platformPath("images/icon/friendFrameIcon/");

    private static ACCESSPATH_ICON = ResManager.platformPath("images/icon/accessPathIcon/");

    private static POSITION_ICON = ResManager.platformPath("images/icon/positionIcon/");

    private static FUNCTIONOPEN_ICON = ResManager.platformPath("images/icon/functionOpenIcon/");

    private static RECRUIT_RESULT = ResManager.platformPath("images/staff/recruit/recruit/");

    static MAIN_UI = ResManager.platformPath("texture/mainUI/");
    static FOSTER_SPINE = ResManager.platformPath("spine/fosterCare/fosterCare_play/fosterCare_play");
    static VIP_ICON = ResManager.platformPath("images/setting/");

    static SPINE_DIR = ResManager.platformPath("spine/");
    static RANDOM_ORDER = ResManager.SPINE_DIR+"randomOrder/";

    static platformPath(path: string) {
        return DIR + path;
    };

    asyncLoadEffectRes(func: Function) {
        cc.loader.loadResArray(
            ["frame/goodsComplete/goodsComplete", "frame/goodsWan/goodsWan",
                "frame/goodshouseWan/goodshouseWan", "frame/goodsxiangzi/goodsxiangzi"], cc.SpriteAtlas,
            (err: Error, atlas: cc.Sprite[]) => {
                if (err) {
                    cc.log(err);
                    return;
                }
                func && func();
            });
    }

    asyncLoadFrameRes(farme, func: Function) {
        cc.loader.loadRes(farme, cc.AnimationClip, (err: Error, clip: cc.AnimationClip) => {
            if (err) {
                return null;
            }
            func && func(clip);
        })
    }


    asyncLoadRecruitRes(cb: Function) {
        cc.loader.loadResArray([ResManager.RECRUIT_BEAR_URL, ResManager.RECRUIT_URL], sp.SkeletonData,
            (err: Error, atlas: sp.SkeletonData[]) => {
                if (err) {
                    cc.log(err);
                    return;
                }
                cb && cb();
            });
    }

    asyncLoadStockRes(cb: Function) {
        cc.loader.loadResArray([ResManager.STOCK_URL], sp.SkeletonData,
            (err: Error, atlas: sp.SkeletonData[]) => {
                if (err) {
                    cc.log(err);
                    return;
                }
                cb && cb();
            });
    }

    getBranchMarketBanner(sprite: cc.Sprite, imageName: string, cb: Function) {
        let url = ResManager.BRANCH_MARKET_BANNER + imageName;
        UIUtil.dynamicLoadImage(url, (spriteFrame: cc.SpriteFrame) => {
            sprite.spriteFrame = spriteFrame;
            cb && cb(sprite);
        });
    }

    getFutureMoudle = (sprite: cc.Sprite, imageName: string, cb: Function = null, id: number) => {
        let url = imageName;
        let func = (pre: cc.SpriteFrame) => {
            if (!sprite.isValid || !pre) return;
            let size = pre.getOriginalSize();
            let rate: number;
            if (MapMgr.getMapState() === FutureState.ACCESS) {
                rate = .5;
            } else {
                rate = DataMgr.getPhoneState() === IPhoneState.HIGH ? .8 : .5;
            }
            size.width /= rate;
            size.height /= rate;
            sprite.spriteFrame = pre;
            sprite.node.parent.setContentSize(size);
            sprite.node.setContentSize(size);
            sprite.node.setPosition(-size.width / 2, size.height / 2);
            cb && cb();
        };
        MapResMgr.loadFutureAssets(url, func, id);
    };

    static LoadFuture(sprite: cc.Sprite, imageName: string, mainType: number) {
        switch (mainType) {
            case ShelvesType.FeaturesShelve:
                let url = imageName.split(",")[0];
                UIUtil.asyncSetImage(sprite, ResManager.FutureDirUrl + url);
                break;
            case ShelvesType.GroundShelve:
            case ShelvesType.WallShelve:
                UIUtil.asyncSetImage(sprite, ResManager.FutureDirUrl + imageName);
                break;
        }
    }

    static getFloorMoudle(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.FLOOR_MOUDLE + imageName, false);
    }

    static getCaseIcon(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = true, cb?) {
        UIUtil.asyncSetImage(sprite, ResManager.FUTURE_ICON + imageName, useSrcRect, cb);
    }

    static getVipBuffIcon(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = true) {
        UIUtil.asyncSetImage(sprite, ResManager.VIP_BUFF_ICON + imageName, useSrcRect);
    }

    static getDecorateIcon(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = true, cb?) {
        UIUtil.asyncSetImage(sprite, ResManager.DECORATE_ICON + imageName, useSrcRect, cb);
    }

    static getFloorIcon(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = true, cb?) {
        UIUtil.asyncSetImage(sprite, ResManager.FLOOR_ICON + imageName, useSrcRect, cb);
    }

    static setIncidentBackground(sprite: cc.Sprite, imageNameName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.INCIDENT_BACKGROUND + imageNameName, false);
    }

    getPopularityIcon(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.POPULARITY_ICON + imageName, false);
    }

    getWallPaperIcon(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = true, cb?) {
        UIUtil.asyncSetImage(sprite, ResManager.WALLPAPER_ICON + imageName, useSrcRect, cb);
    }

    getStaffUIIcon(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.STAFF_UI + imageName, false);
    }

    static getShelvesItemIcon(sprite: cc.Sprite, imageName: string, type: ShelvesType, cb?) {
        switch (type) {
            case ShelvesType.FeaturesShelve:
            case ShelvesType.CheckoutShelve:
                ResManager.getCaseIcon(sprite, imageName, true, cb);
                break;
            case ShelvesType.GroundShelve:
            case ShelvesType.WallShelve:
                ResManager.getDecorateIcon(sprite, imageName, true, cb);
                break;
            case ShelvesType.FloorShelve:
                ResManager.getFloorIcon(sprite, imageName, true, cb);
                break;
            case ShelvesType.WallPaperShelve:
                ResMgr.getWallPaperIcon(sprite, imageName, true, cb);
                break;
        }
    }

    setMainUIIcon(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.MAIN_UI + imageName, false);
    }

    getItemBox(sprite: cc.Sprite, imageName: string, Scale: number = 0.7) {
        sprite.node.setScale(Scale);
        UIUtil.asyncSetImage(sprite, ResManager.ITEM_BOX + imageName, false);
    }

    getItemBox2(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.ITEM_BOX + imageName, false);
    }

    getItemIcon(sprite: cc.Sprite, imageName: string, Scale: number = 1, cb?) {
        sprite.node.setScale(Scale);
        UIUtil.asyncSetImage(sprite, ResManager.ITEM_ICON + imageName, false, cb);
    }

    getTreasureIcon(sprite: cc.Sprite, imageName: string, Scale: number = 0.6) {
        sprite.node.setScale(Scale);
        UIUtil.asyncSetImage(sprite, ResManager.ITEM_ICON + imageName + "_close", false);
    }

    getTreasureBox(sprite: cc.Sprite, color: number, Scale: number = 1) {
        sprite.node.setScale(Scale);
        UIUtil.asyncSetImage(sprite, ResManager.ITEM_ICON + "decBox_" + color, false);
    }

    getTreasureOpenIcon(sprite: cc.Sprite, imageName: string, Scale: number = 0.6, callback) {
        sprite.node.setScale(Scale);
        UIUtil.asyncSetImage(sprite, ResManager.ITEM_ICON + imageName + "_open", false, callback);
    }

    getItemIcons(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.ITEM_ICON + imageName, false);
    }

    getFavorIcon(Sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(Sprite, ResManager.FAVOR_ICON + imageName, false);
    }

    getAttributeIcon(Sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(Sprite, ResManager.ATTRIBUTE_ICON + imageName, false);
    }

    getBigAttributeIcon(Sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(Sprite, ResManager.ATTRIBUTE_BIG__ICON + imageName, false);
    }

    getSpacialTaiCiIcon(Sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(Sprite, ResManager.SPECIAL_PATH + imageName, false);
    }

    getActionIcon(Sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(Sprite, ResManager.ACTION_ICON + imageName, false);
    }

    getLineIcon(Sprite: cc.Sprite, imageName: string, cb?) {
        UIUtil.asyncSetImage(Sprite, ResManager.LINE_ICON + imageName, false, cb);
    }

    getItemIconSF(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = true) {
        UIUtil.asyncSetImage(sprite, ResManager.ITEM_ICON + imageName, useSrcRect);
    }

    getCurrency(sprite: cc.Sprite, imageName: string, Scale: number = 1) {
        sprite.node.setScale(Scale);
        UIUtil.asyncSetImage(sprite, ResManager.CUCRRENCY_ICON + imageName, false);
    }

    getNumberImg(url: string, imageName: string, sprite: cc.Sprite) {
        UIUtil.asyncSetImage(sprite, ResManager.IMAGES_COMMON + url + "/" + imageName);
    }

    setStaffGoodAtIcon(sprite: cc.Sprite, imageName) {
        UIUtil.asyncSetImage(sprite, ResManager.STAFF_COLOR + imageName, false);
    }

    getCommunityIcon(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = true, isShow: boolean = true) {
        UIUtil.asyncSetImage(sprite, ResManager.COMMUNITY_ICON + imageName, useSrcRect, null, isShow);
    }

    setAccessPathIcon(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = true) {
        UIUtil.asyncSetImage(sprite, ResManager.ACCESSPATH_ICON + imageName, useSrcRect);
    }

    setPositionIcon(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = true) {
        UIUtil.asyncSetImage(sprite, ResManager.POSITION_ICON + imageName, useSrcRect);
    }

    setFunctionOpenIcon(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = true, cb: (spriteFrame: cc.SpriteFrame) => void = null) {
        UIUtil.asyncSetImage(sprite, ResManager.FUNCTIONOPEN_ICON + imageName, useSrcRect, cb);
    }

    setGoodsIcon(sprite: cc.Sprite, imageName, Scale: number = 1) {
        sprite.node.setScale(Scale);
        UIUtil.asyncSetImage(sprite, ResManager.GOODS_ICON + imageName, false);
    }

    setVipIcon(sprite: cc.Sprite, imageName) {
        UIUtil.asyncSetImage(sprite, ResManager.VIP_ICON + imageName);
    }

    getGoodsIconSf(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = false) {
        UIUtil.asyncSetImage(sprite, ResManager.GOODS_ICON + imageName, useSrcRect);
    }

    getUnRotateLv(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.CASE_LEVEL + imageName + "_" + imageName);
    }

    getRotateLv(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.CASE_LEVEL + imageName);
    }

    getAnnounceIcon(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.ANNOUNCEMENT + imageName);
    }

    getSpecialBackgroundImg(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.SPECIAL_PATH + imageName, false);
    }

    setLongOrderImage(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.LONG_ORDER + imageName);
    }

    setFightImage(sprite: cc.Sprite, imageName: string, useSrcRect: boolean = true, cb: (spriteFrame: cc.SpriteFrame) => void = null) {
        UIUtil.asyncSetImage(sprite, ResManager.FIGHT + imageName, useSrcRect, cb);
    }

    setRecruitResultImg(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.RECRUIT_RESULT + imageName);
    }

    setFrameIcon(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.FRIENDFRAME_ICON + imageName, false);
    }

    setTrainBgXianIcon(sprite: cc.Sprite, imageName: string) {
        UIUtil.asyncSetImage(sprite, ResManager.STAFF_COLOR + imageName, false);
    }

    getBubbleImg(sprite: cc.Sprite, imageName: string) {
        UIUtil.dynamicLoadImage(ResManager.MAIN_UI + imageName, (pre: cc.SpriteFrame) => {
            sprite.spriteFrame = pre;
        });
    }

    initCashier(url: string, num: number, sprite: cc.Sprite, cb: Function = null) {
        let trueUrl = url + "/" + "Cashier" + num;
        UIUtil.dynamicLoadImage(trueUrl, (sp: cc.SpriteFrame) => {
            let size = sp.getOriginalSize();
            sprite.spriteFrame = sp;
            sprite.node.parent.setContentSize(size);
            sprite.node.setPosition(-size.width / 2, size.height / 2);
            cb && cb();
        });
    }

    imgTypeJudgment(sprite: cc.Sprite, id: number, currScale: number = 1) {
        let json: any = JsonMgr.getInformationAndItem(id);
        if (JsonManager.isCase(id)) {
            switch (json.mainType) {//家具
                case 1://功能性家具
                    ResManager.getCaseIcon(sprite, json.icon, false);
                    break;
                case 2://墙上装饰
                    ResManager.getDecorateIcon(sprite, json.icon, false);
                    break;
                case 3://地面装饰
                    ResManager.getDecorateIcon(sprite, json.icon, false);
                    break;
                case 4://地板
                    ResManager.getFloorIcon(sprite, json.icon, false);
                    break;
                case 5://墙纸
                    this.getWallPaperIcon(sprite, json.icon, false);
                    break;
                case 6://活动家具
                    ResManager.getCaseIcon(sprite, json.icon, false);
                    break;
            }
        } else {
            // if (id > 310000) {//货物
            //     this.getGoodsIconSf(sprite, json.icon.split(",")[0]);
            // } else
            if (id >= 101 && id <= 105) {
                this.getGoodsIconSf(sprite, json.icon.split(",")[0]);
            } else {
                if (id < 0) {//货币
                    this.getCurrency(sprite, json.icon, currScale);
                } else {//员工
                    if ((id >= 1000 && id < 9999) || (id >= 10000 && id < 100000)) {
                        UIUtil.asyncSetImage(sprite, Staff.getStaffAvataUrlByResId(json.artResId), false);
                    } else {//道具
                        if (json.type == 13) {
                            this.getTreasureIcon(sprite, json.icon, 1);
                        } else {
                            this.getItemIconSF(sprite, json.icon, false);
                        }
                    }
                }
            }
        }
    }

    static getFavorIconPathbyLevel(level: number) {
        return ResManager.FAVOR_ICON + "hx" + level.toString();
    }

    static getItemBoxBasePathUrl() {
        return ResManager.ITEM_BOX;
    }

    static getIncidentSpecialUrl() {
        return ResManager.INCIDENT_SPECIALICON;
    }


    static instance: ResManager = new ResManager();

    private constructor() {

    }

}

export const ResMgr: ResManager = ResManager.instance;

