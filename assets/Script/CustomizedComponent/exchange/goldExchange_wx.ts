import {GameComponent} from "../../core/component/GameComponent";
import {HttpInst} from "../../core/http/HttpClient";
import {NetConfig} from "../../global/const/NetConfig";
import {JsonMgr} from "../../global/manager/JsonManager";
import {IRespData} from "../../types/Response";
import {UIMgr} from "../../global/manager/UIManager";
import {DataMgr} from "../../Model/DataManager";
import {ButtonMgr} from "../common/ButtonClick";
import {TextTipConst} from "../../global/const/TextTipConst";
import {ClientEvents} from "../../global/manager/ClientEventCenter";
import CommonGiftView from "../common/CommonGiftView";
import {topUiType} from "../MainUiTopCmpt";
import {COUNTERTYPE, DotInst} from "../common/dotClient";
import {GoldRectuitPanel} from "../staff/recruitNew/recruitAni/gold/GoldRectuitPanel";
import {WxVideoAd} from "../login/WxVideoAd";
import {GameManager} from "../../global/manager/GameManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class GoldExchange_wx extends GameComponent {
    static url = 'exchange/goldExchange_wx';

    @property(cc.Label)
    private numLabel: cc.Label = null;
    @property(cc.Label)
    private maxNumLabel: cc.Label = null;
    @property(cc.RichText)
    private timeLabel: cc.RichText = null;
    @property(cc.Label)
    private goldLabel: cc.Label = null;
    @property(cc.Node)
    private helpTip: cc.Node = null;
    @property(cc.Node)
    private shutButton: cc.Node = null;
    @property(cc.Node)
    private confirmButton: cc.Node = null;
    @property(sp.Skeleton)
    private zhadan: sp.Skeleton = null;
    @property(sp.Skeleton)
    private baoqian: sp.Skeleton = null;
    @property(sp.Skeleton)
    private baoji: sp.Skeleton = null;
    @property(cc.Node)
    private egg: cc.Node = null;
    @property([cc.Sprite])
    private buttnImgs: cc.Sprite[] = [];
    private num: number = -1;
    private ble: boolean = true;
    private number: number = -1;
    private isVip: boolean = false;
    private advertId: number = 0;


    onEnable(): void {
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(false, topUiType.diamond_mg);
        DataMgr.increaseTopUiNum();
    }

    onDisable(): void {
        DataMgr.decrTopUiNum();
        ClientEvents.EVENT_SWITCH_MAIN_UI.emit(true, DataMgr.friendshipUiTop ? topUiType.friendship : -2);
    }

    onLoad() {
        ButtonMgr.addClick(this.helpTip, () => {
            UIMgr.showTextTip(TextTipConst.GoldExchange);
        });
        ButtonMgr.addClick(this.shutButton, () => {
            this.shutDownBtn();
        });
        ButtonMgr.addClick(this.confirmButton, () => {
            this.dhBtn();
        });
        this.addEvent(ClientEvents.UP_GOLD_EXCHANGE.on(this.up));
    }

    start() {
        this.init(this.node['data']);
    }

    up = () => {
        HttpInst.postData(NetConfig.GET_EXCHANGE_GOLD, [], (response: IRespData) => {
            this.init(response);
        });
    };


    init = (resp: IRespData) => {
        cc.log("IRespData：", resp);
        let dailyData: IWxGoldExchange[] = JsonMgr.getWXGoldExchangeNum(0);
        let vipData: IWxGoldExchange[] = JsonMgr.getWXGoldExchangeNum(1);

        let dailyNum: number = dailyData.length;
        let vipNum: number = vipData.length;

        let data = dailyData[dailyNum === resp.exchangeCount ? dailyNum - 1 : resp.exchangeCount];
        if (resp.isVip) {
            if (resp.vipCount < vipNum) {
                data = vipData[resp.vipCount];
            }
        }
        this.advertId = resp.advertId;
        let num: number = resp.isVip ? resp.vipCount + resp.exchangeCount : resp.exchangeCount;
        let number: number = resp.isVip ? dailyNum + vipNum : dailyNum;
        this.num = num;
        this.number = number;
        this.isVip = resp.isVip;

        this.numLabel.string = number - num + "";
        this.maxNumLabel.string = "/" + number;
        if (num === number) {
            this.numLabel.node.color = cc.color(255, 0, 0);
        }
        let profitMultiple: number = data.profitMultiple;
        cc.log("广告剩余次数：" + DataMgr.advertSumCount);
        if (DataMgr.isCanWatchAdvert()) {
            this.timeLabel.string = "<color=#814d34>观看广告，兑换 </c><color=#ff5300>" + profitMultiple + "分钟</c><color=#814d34>的店铺收益</c>";
        } else {
            this.timeLabel.string = "<color=#814d34>分享给好友，兑换 </c><color=#ff5300>" + profitMultiple + "分钟</c><color=#814d34>的店铺收益</c>";
        }
        this.buttnImgs[0].node.active = !DataMgr.isCanWatchAdvert();
        this.buttnImgs[1].node.active = DataMgr.isCanWatchAdvert();
        this.goldLabel.string = profitMultiple * resp.maxSale + "";
    };

    dhBtn() {
        if (this.num === this.number) {
            UIMgr.showTipText("今日兑换次数已用完，请明天再来兑换");
            return;
        }
        this.advertHandler();
    }

    advertHandler = () => {
        if (DataMgr.isCanWatchAdvert()) {
            WxVideoAd.showVideo(() => {
                this.sendMovieMsg();
            }, () => {
                UIMgr.showTipText("请观看完整广告！");
            });
        } else {
            GameManager.WxServices.shareGame("来和我一起成为店长拥有自己的小店吧~", `https://cdn.nuojuekeji.com/uploadImages/share/xuanchuan2.png`, "", () => {
                this.sendMovieMsg();
            });
        }
    }


    sendMovieMsg() {
        if (this.ble) {
            this.ble = false;
            HttpInst.postData(NetConfig.EXCHANGE_GOLD_WX, [this.isVip], (response: IRespData) => {
                this.paly(response.multy);
                this.init(response);
            });
        }
    }


    paly = (num: number) => {
        this.zhadan.node.active = true;
        this.egg.active = false;
        this.zhadan.setAnimation(0, "animation", false);
        this.baoqian.setCompleteListener(() => {
            this.ble = true;
            this.baoqian.node.active = false;
            this.baoji.node.active = false;
            this.zhadan.node.active = false;
            this.egg.active = true;
        });
        switch (num) {
            default:
                this.baoqian.node.active = true;
                this.baoqian.setAnimation(0, "animation", false);
                break;
            case 2:
                this.baoqian.node.active = true;
                this.baoqian.setAnimation(0, "animation", false);
                setTimeout(() => {
                    this.baoji.node.active = true;
                    this.baoji.setAnimation(0, "animation", false);
                }, 200);
                break;
            case 5:

                this.baoqian.node.active = true;
                this.baoqian.setAnimation(0, "animation2", false);
                setTimeout(() => {
                    this.baoji.node.active = true;
                    this.baoji.setAnimation(0, "animation2", false);
                }, 200);
                break;
            case 10:

                this.baoqian.node.active = true;
                this.baoqian.setAnimation(0, "animation2", false);
                setTimeout(() => {
                    this.baoji.node.active = true;
                    this.baoji.setAnimation(0, "animation3", false);
                }, 200);
                break;
        }

    };


    //关闭
    shutDownBtn() {
        DotInst.clientSendDot(COUNTERTYPE.exchangeGold, "4002");
        this.closeOnly();
    }


    protected getBaseUrl(): string {
        return GoldExchange_wx.url;
    }

}
