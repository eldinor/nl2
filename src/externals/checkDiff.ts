import pixelmatch from "pixelmatch";
//
//
interface IpmResult {
  pm: number;
  error: number;
}
//
//

export function getElements() {
  let canvas1 = document.getElementById("canvas1") as HTMLCanvasElement;
  if (!canvas1) {
    canvas1 = document.createElement("canvas");
    canvas1.id = "canvas1";
  }
  let canvas2 = document.getElementById("canvas2") as HTMLCanvasElement;
  if (!canvas2) {
    canvas2 = document.createElement("canvas");
    canvas2.id = "canvas2";
  }
  let canvasDiff = document.getElementById("canvasDiff") as HTMLCanvasElement;
  if (!canvasDiff) {
    canvasDiff = document.createElement("canvas");
    canvasDiff.id = "canvasDiff";
  }
  return [canvas1, canvas2, canvasDiff];
}

const loadImage = (path: string) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // to avoid CORS if used with Canvas
    img.src = path;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
    };
  });
};
export default loadImage;

export async function buildImages(src1: string, src2: string) {
  const img1 = (await loadImage(src1)) as HTMLImageElement;
  const img2 = (await loadImage(src2)) as HTMLImageElement;
  const { width, height } = img1;

  const canvas1 = getElements()[0];
  const canvas2 = getElements()[1];
  const canvasDiff = getElements()[2];

  canvas1.width = canvas2.width = canvasDiff.width = width;
  canvas1.height = canvas2.height = canvasDiff.height = height;
  let context1 = canvas1.getContext("2d");

  context1!.drawImage(img1, 0, 0);

  let context2 = canvas2.getContext("2d");

  context2!.drawImage(img2, 0, 0);

  let contextD = canvas2.getContext("2d");

  contextD!.drawImage(img1, 0, 110);

  const i1 = context1!.getImageData(0, 0, width, height);
  const i2 = context2!.getImageData(0, 0, width, height);
  const diff = contextD!.createImageData(width, height);

  const pm = pixelmatch(
    i1.data,
    i2.data,
    diff.data,
    canvas1.width,
    canvas1.height,
    {
      threshold: 0.1,
      diffMask: true, //??
    }
  );

  console.log(pm);
  console.log(
    `error: ${
      Math.round((100 * 100 * pm) / (canvas1.width * canvas1.height)) / 100
    }%`
  );
  console.log(diff);
  console.log(canvasDiff.toDataURL());
}
