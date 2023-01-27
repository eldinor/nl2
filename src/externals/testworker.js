import * as BABYLON from "@babylonjs/core";

self.onmessage = function (evt) {
  let canvas;
  let scene;

  if (evt.data.canvas) {
    canvas = evt.data.canvas;

    const engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(this._engine);

    // engine.runRenderLoop(function() {
    //     engine.resize();
    //     if (scene.activeCamera) {
    //         scene.render();
    //     }
    // });
  }

  if (evt.data.imageURL) {
    const imageURL = evt.data.imageURL;

    const customImage = new BABYLON.Texture(imageURL, scene);

    BABYLON.RawTexture.WhenAllReady([customImage], () => {
      customImage.readPixels()?.then((bv) => {
        postMessage({
          bv,
        });
      });
    });
  }
};