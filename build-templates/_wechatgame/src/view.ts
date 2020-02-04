/// <reference path="./canvas.ts" />

interface Viewport {
    x: number, y: number, width: number, height: number
}

abstract class View {
    constructor() {
        let ctx = sharedContext;
        ctx.save();
        ctx.scale(pixelRatio, pixelRatio);
        ctx.clearRect(0, 0, screenWidth, screenHeight);
        ctx.scale(winRatio, winRatio);
    }
    
    abstract onViewport(viewport: Viewport);
    
    abstract onEvent(event: number, data?: any);
    
    abstract onTouchStart(touches: Array<{clientX: number, clientY: number}>);
        
    onClose() {
        sharedContext.restore();
    }
}
