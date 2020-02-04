export class FightViewData {
    public first: boolean;
    // public predictRes: number;
    public stage: number;

    private _shopSelect: number = 1;//选择的店铺
    fill(fightData) {
        this.first = fightData.first;
        // this.predictRes = fightData.predictRes;
        this.stage = fightData.stage;
    }


    get shopSelect(): number {
        return this._shopSelect;
    }

    set shopSelect(value: number) {
        this._shopSelect = value;
    }
}