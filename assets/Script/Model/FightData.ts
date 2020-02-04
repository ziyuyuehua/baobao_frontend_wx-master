export class FightData {
    public attackWin: boolean;
    public totalAttack: number;
    public postionResults: any[] = [];

    fill(fightData) {
        this.attackWin = fightData.attackWin;
        this.totalAttack = fightData.totalAttack;
        this.postionResults = fightData.postionResults;
    }
}