export enum CarName {
    LongOrderCar,
    BusCar,
    OrderCar
}

export class CarMoveManager {

    private carQue: Array<ICarMove> = new Array<ICarMove>();
    private carState: boolean = false;
    private static _instance: CarMoveManager = null;

    static instance() {
        if (!CarMoveManager._instance) {
            CarMoveManager._instance = new CarMoveManager();
        }
        return CarMoveManager._instance;
    }

    addCarToQue(iCarMove: ICarMove) {
        this.carQue.push(iCarMove);
        if (!this.carState) {
            this.carState = true;
            this.carQue[0].cb(this.nextFunc);
        }
    }

    clearQue(key: any) {
        this.carQue.splice(0, this.carQue.length);
    }

    nextFunc = () => {
        this.carQue.splice(0, 1);
        let carMove = this.carQue[0];
        if (carMove) {
            this.carState = true;
            carMove.cb(this.nextFunc);
        } else {
            this.carState = false;
        }
    };

}

export interface ICarMove {
    cb: Function;
    carName: CarName;
}

export const CarMgr = CarMoveManager.instance();
