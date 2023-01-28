import * as BABYLON from "@babylonjs/core";

self.onmessage = function (evt) {
  let canvas;
  let scene;

  if (evt.data.canvas) {
    canvas = evt.data.canvas;

    const engine = new BABYLON.Engine(canvas, true);
    scene = new BABYLON.Scene(this._engine);

    var camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(65), 10, BABYLON.Vector3.Zero(), scene);
    camera.useAutoRotationBehavior = true
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);

    // Move the sphere upward 1/2 its height
    sphere.position.y = 1;

    // Our built-in 'ground' shape. Params: name, options, scene
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);


    self.onmessage = ({ data: { question } }) => {

        console.log(evt.data)
        console.log(question)
        console.log(scene)


        self.postMessage({
          answer: 42,
        });
      };


  
     engine.runRenderLoop(function() {
         engine.resize();
     if (scene.activeCamera) {
            scene.render();
        }
    });
  }


  /*
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
  //
  */
};