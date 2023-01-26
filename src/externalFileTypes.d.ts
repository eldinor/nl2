// Images
declare module "*.jpg";
declare module "*.png";
declare module "*.env";

// 3D types
declare module "*.glb";
declare module "*.stl";

// Physics
declare module "ammo.js";

declare module "colorthief" {
  export type RGBColor = [number, number, number];
  export default class ColorThief {
    getColor: (img: HTMLImageElement | null, quality: number = 10) => RGBColor;
    getPalette: (
      img: HTMLImageElement | null,
      colorCount: number = 10,
      quality: number = 10
    ) => RGBColor[];
  }
}
