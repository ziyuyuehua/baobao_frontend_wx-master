
let sharedCanvas = wx.getSharedCanvas();
let sharedContext = sharedCanvas.getContext('2d');
if (!sharedContext) {
    throw new Error("Cannot get context 2d of shared canvas");
}

let contentCanvas = wx.createCanvas();
let contentContext = contentCanvas.getContext('2d');
if (!contentContext) {
    throw new Error("Cannot get context 2d of canvas");
}

const screenWidth = wx.getSystemInfoSync().screenWidth;
const screenHeight = wx.getSystemInfoSync().screenHeight;
const pixelRatio = wx.getSystemInfoSync().pixelRatio;

let viewport = { x: 0, y: 0, width: screenWidth / pixelRatio, height: screenHeight / pixelRatio };

const winWidth = 320;
const winHeight = winWidth * screenHeight / screenWidth;
const winRatio = screenWidth / winWidth;

function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        let image = wx.createImage();
        image.src = src;
        image.onload = function() {
            resolve(image);
        }
        image.onerror = function() {
            reject();
        }
    });
}

function drawSlicedImage(image: HTMLImageElement, context: CanvasRenderingContext2D, rect: { x: number, y: number, width: number, height: number }) {
    const ratio = winRatio * pixelRatio;
    const width = image.width / ratio;
    const height = image.height / ratio;
    if (rect.width > width) {
        if (rect.height > height) {
            context.drawImage(image, 0, 0, image.width / 2, image.height / 2,
                rect.x, rect.y, width / 2, height / 2);
            context.drawImage(image, image.width / 2, 0, 1, image.height / 2,
                rect.x + width / 2, rect.y, rect.width - width, height / 2);
            context.drawImage(image, image.width / 2, 0, image.width / 2, image.height / 2,
                rect.x + rect.width - width / 2, rect.y, width / 2, height / 2);

            context.drawImage(image, 0, image.height / 2, image.width / 2, 1,
                rect.x, rect.y + height / 2, width / 2, rect.height - height);
            context.drawImage(image, image.width / 2, image.height / 2, 1, 1,
                rect.x + width / 2, rect.y + height / 2, rect.width - width, rect.height - height);
            context.drawImage(image, image.width / 2, image.height / 2, image.width / 2, 1,
                rect.x + rect.width - width / 2, rect.y + height / 2, width / 2, rect.height - height);

            context.drawImage(image, 0, image.height / 2, image.width / 2, image.height / 2,
                rect.x, rect.y + rect.height - height / 2, width / 2, height / 2);
            context.drawImage(image, image.width / 2, image.height / 2, 1, image.height / 2,
                rect.x + width / 2, rect.y + rect.height - height / 2, rect.width - width, height / 2);
            context.drawImage(image, image.width / 2, image.height / 2, image.width / 2, image.height / 2,
                rect.x + rect.width - width / 2, rect.y + rect.height - height / 2, width / 2, height / 2);
        } else {
            context.drawImage(image, 0, 0, image.width / 2, image.height,
                rect.x, rect.y, width / 2, rect.height);
            context.drawImage(image, image.width / 2, 0, 1, 1,
                rect.x + width / 2, rect.y, rect.width - width, rect.height);
            context.drawImage(image, image.width / 2, 0, image.width / 2, image.height,
                rect.x + rect.width - width / 2, rect.y, width / 2, rect.height);
        }
    } else {
        if (rect.height > height) {
            context.drawImage(image, 0, 0, image.width, image.height / 2,
                rect.x, rect.y, rect.width, height / 2);
            context.drawImage(image, 0, image.height / 2, 1, 1,
                rect.x, rect.y + height / 2, rect.width, rect.height - height);
            context.drawImage(image, 0, image.height / 2, image.width, image.height / 2,
                rect.x, rect.y + rect.height - height / 2, rect.width, height / 2);
        } else {
            context.drawImage(image, rect.x, rect.y, rect.width, rect.height);
        }
    }
}
