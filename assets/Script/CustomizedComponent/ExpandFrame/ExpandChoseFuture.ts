/**
 * @Description:
 * @Author: ljx
 * @date 2019/11/26
*/
import {GameComponent} from "../../core/component/GameComponent";
import {JsonMgr} from "../../global/manager/JsonManager";
import {DataMgr} from "../../Model/DataManager";
import {UIUtil} from "../../Utils/UIUtil";
import {ButtonMgr} from "../common/ButtonClick";
import {UIMgr} from "../../global/manager/UIManager";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {ChestRes} from "./ChestResManager";
import {CacheMap} from "../MapShow/CacheMapDataManager";
import {MapMgr} from "../MapShow/MapInit/MapManager";
import {ExpUtil} from "../MapShow/Utils/ExpandUtil";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
const { ccclass, property } = cc._decorator;

@ccclass
export default class ExpandChoseFuture extends GameComponent {

    static url = "expandFrame/choseFuture";

    @property(cc.Node)
    private leftNode: cc.Node = null;
    @property(cc.Node)
    private rightNode: cc.Node = null;
    @property(cc.Sprite)
    private leftSprite: cc.Sprite = null;
    @property(cc.Sprite)
    private rightSprite: cc.Sprite = null;
    @property(cc.Label)
    private leftLabel: cc.Label = null;
    @property(cc.Label)
    private rightLabel: cc.Label = null;

    private sceneData: ISceneJson = null;
    private assetsMap: Map<string, cc.SpriteFrame> = new Map<string, cc.SpriteFrame>();
    private choice: number = -1;
    private hasChosen: boolean = false;

    protected start(): void {
        this._bindEvent();
    }

    initSceneData() {
        let iMarket = DataMgr.iMarket;
        this.sceneData = JsonMgr.getSceneDataByMarketId(iMarket.getExFrequency() + 1, iMarket.getMarketId());
        this.leftLabel.string = this.sceneData.choiceTypeA;
        this.rightLabel.string = this.sceneData.choiceTypeB;
        this.initSprite(this.leftSprite, this.sceneData.choiceA);
        this.initSprite(this.rightSprite, this.sceneData.choiceB);
    }

    private _bindEvent() {
        ButtonMgr.addClick(this.leftNode, this.choseA);
        ButtonMgr.addClick(this.rightNode, this.choseB);
    }

    choseA = () => {
        this.choice = 0;
        this.commitChoice();
    };

    choseB = () => {
        this.choice = 1;
        this.commitChoice();
    };

    commitChoice = () => {
        if(this.hasChosen) {
            return;
        }
        this.hasChosen = true;
        let errorCb = () => {
            this.hasChosen = false;
        };
        ChestRes.httpExpand(this.choice, this.closeOnly, errorCb);
    };

    initSprite(sprite: cc.Sprite, url: string) {
        UIUtil.loadUrlImage(url, (spriteFrame: cc.SpriteFrame) => {
            if(!sprite || !sprite.isValid || !spriteFrame) return;
            sprite.spriteFrame = spriteFrame;
            this.assetsMap.set(url, spriteFrame);
        });
    }

    clearAssets() {
        let keyArr: string[] = [];
        this.assetsMap.forEach((value, key) => {
            value.clearTexture();
            keyArr.push(key);
        });
        UIUtil.deleteLoadUrlImg(keyArr);
        this.assetsMap.clear();
    }

    protected getBaseUrl(): string {
        return ExpandChoseFuture.url;
    }

}