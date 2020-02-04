const {ccclass, property} = cc._decorator;

@ccclass
export class ExchangeStaffList extends cc.Component {

    // @property(cc.Prefab)
    // private exchangeStaffPrefab: cc.Prefab = null;
    // @property(String)
    // private target = "";
    //
    // @property(cc.Node)
    // private blockPanel: cc.Node = null;
    //
    // @property(cc.Button)
    // private backBtn: cc.Button = null;
    //
    // private dispose: CompositeDisposable = new CompositeDisposable();
    //
    // onLoad(){
    //     this.dispose.add(ClientEvents.STAFF_EXCHANGE_SELECTED.on(this.onExchangeStaffSelected));
    //
    //     //const staffConfig: StaffConfig = JsonMgr.getStaffConfigByShopId(1001);
    //     //cc.log(staffConfig.advantage);
    //     //cc.log(staffConfig);
    //
    //     this.backBtn.node.on("click", this.hide);
    // }
    //
    // start(){
    //     this.refresh();
    // }
    //
    // onExchangeStaffSelected = (index: number) => {
    //     //cc.log("onExchangeStaffSelected", index);
    //     let exchangeData: ExchangeData = DataMgr.getExchangeData();
    //     this.lastIndexUnSelect(exchangeData, index);
    // };
    //
    // private lastIndexUnSelect(exchangeData: ExchangeData, curIndex: number){
    //     const index = exchangeData.getIndex();
    //     if (index >= 0) { //如果存在上一个选中的，则发出通知事件令上一个变成未选中状态
    //         ClientEvents.STAFF_EXCHANGE_UNSELECTED.emit(index);
    //     }
    //     exchangeData.setIndex(curIndex);
    // }
    //
    // show() {
    //     if(!this.node.active){
    //         this.node.active = true;
    //         this.blockPanel.active = true;
    //     }
    // }
    //
    // private hide = () => {
    //     if(this.node.active){
    //         this.node.active = false;
    //         this.blockPanel.active = false;
    //     }
    // };
    //
    // onEnable(){
    //
    // }
    //
    // refresh(){
    //     const staffJsonSize: number = JsonMgr.getStaffConfigSize();
    //     ClientEvents.EVENT_REFRESH_FINALLY_SCROLLVIEW.emit(this.exchangeStaffPrefab, staffJsonSize, this.target);
    //     //cc.log("ExchangeStaffList refresh scroll view");
    // }
    //
    // onDisable(){
    //     //DataMgr.getExchangeData().resetIndex();
    // }
    //
    // onDestroy() {
    //     this.dispose.dispose();
    // }

}
