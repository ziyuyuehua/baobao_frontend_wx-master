export enum TileSize{
    width = 100,
    height = 50
}

export enum MapWAndH {
    WIDTH = 29,
    HEIGHT = 29
}

export enum MapOffset {
    X = 1450,
    Y = 725,
}

//公式   position(点击)  地图原点在GL里的坐标： orgin  地图大小: mapSize 格子大小: tileSize
// 点击点在GL里的坐标： GLposition
//orgin.x = mapSize.width / 2; orgin.y = mapSize.height
// 额外-1与额外+2 的原因是因为原点的 x坐标占了前一个点的二分之一，相当于坐标值前移了比预期值少了 tilesize.width / 2  y方向+2 是因为原点位置Y轴方向少了一个 tilesize.height的长度。
// GLposition.x = orgin.x + tileSize.width / 2 * postion.x + (-tileSize.width / 2) * postion.y = orgin.x + (position.x - position.y - 1) * tileSize.width / 2
//GLposition.y = orgin.y - (postion.x + position.y) * tileSize.height / 2

//反之 求地图坐标公式： position.x = (g.x - o.x) / tilesize.width + (o.y - g.y) / tilesize.height - 0.5
// position.y = (o.y - g.y) / tilesize.height - 1.5 - (g.x - o.x) / tilesize.width
export class CoordinateTranslate {
    //地图转GL坐标
    static changeToGLPosition(MapPosition: { x: number, y: number }): cc.Vec2 {
        let mapSize = {width: TileSize.width * MapWAndH.WIDTH, height: TileSize.height * MapWAndH.HEIGHT};
        let x: number = mapSize.width / 2 + (MapPosition.x - MapPosition.y) * TileSize.width / 2;
        let y: number = mapSize.height - (MapPosition.x + MapPosition.y) * TileSize.height / 2;
        return cc.v2(x - MapOffset.X, y - MapOffset.Y);
    }
    //GL转地图坐标
    static changeToMapPosition(GLPosition: { x: number, y: number }): cc.Vec2 {
        let mapSize = {width: TileSize.width * MapWAndH.WIDTH, height: TileSize.height * MapWAndH.HEIGHT};
        let x: number = Math.floor((GLPosition.x + MapOffset.X - mapSize.width / 2) / TileSize.width + (mapSize.height - (GLPosition.y + MapOffset.Y)) / TileSize.height);
        let y: number = Math.floor((mapSize.height - (GLPosition.y + MapOffset.Y)) / TileSize.height - (GLPosition.x + MapOffset.X - mapSize.width / 2) / TileSize.width);
        return cc.v2(x, y);
    }
}
