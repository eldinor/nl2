import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CubeTexture } from "@babylonjs/core/Materials";

import { CreateSceneClass } from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
// import "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import { NiceLoader } from "../niceLoader/niceloader";
import { MeshBuilder } from "@babylonjs/core";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { GridMaterial } from "@babylonjs/materials";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";

export class DefaultSceneWithTexture implements CreateSceneClass {
  createScene = async (
    engine: Engine,
    canvas: HTMLCanvasElement
  ): Promise<Scene> => {
    // This creates a basic Babylon Scene object (non-mesh)
    const scene = new Scene(engine);

    if (!scene.environmentTexture) {
      const hdrTexture = new CubeTexture(
        "https://playground.babylonjs.com/textures/environment.env",
        scene
      );
      hdrTexture.gammaSpace = false;
      scene.environmentTexture = hdrTexture;
    }

    // Provide the array
    const modelsArray: Array<any> = [];

    void Promise.all([
      import("@babylonjs/core/Debug/debugLayer"),
      import("@babylonjs/inspector"),
    ]).then((_values) => {
      // console.log(_values);
      /*
            scene.debugLayer.show({
                handleResize: true,
                overlay: true,
                embedMode: true,
                globalRoot: document.getElementById("#root") || undefined,
            });
            */
    });

    const grWidth = 10;
    const grHeight = 8;
    // This creates and positions a free camera (non-mesh)
    const camera = new ArcRotateCamera(
      "my first camera",
      0,
      Math.PI / 3,
      grWidth,
      new Vector3(0, 0, 0),
      scene
    );

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
    camera.speed = 0.8;
    camera.wheelDeltaPercentage = 0.01;

    console.log(camera.wheelDeltaPercentage);

    new NiceLoader(scene, modelsArray);

    /*
    gridPlaneHelper();

    function gridPlaneHelper() {
      const ground = MeshBuilder.CreateGround(
        "ground",
        { width: grWidth, height: grHeight },
        scene
      );
      const groundMat = new PBRMaterial("groundMat");
      groundMat.roughness = 0.5;

      ground.material = groundMat;

      const gridMat = new GridMaterial("gridMat");
      ground.material = gridMat;

      const minusXPlane = MeshBuilder.CreatePlane("minusXPlane", {
        width: grWidth,
        height: grHeight,
        sideOrientation: 0,
      });
      minusXPlane.position.x -= grWidth / 2;
      minusXPlane.rotation.x = Math.PI;
      minusXPlane.rotation.y = Math.PI / 2;
      minusXPlane.rotation.z = Math.PI / 2;
      minusXPlane.material = gridMat;

      const plusZPlane = MeshBuilder.CreatePlane("plusZPlane", {
        width: grWidth,
        height: grHeight,
        sideOrientation: 0,
      });
      plusZPlane.position.z += grHeight / 2;
      plusZPlane.rotation.x = Math.PI;
      plusZPlane.rotation.y = -Math.PI;
      plusZPlane.material = gridMat;

      const plusXPlane = minusXPlane.createInstance("plusXPlane");
      plusXPlane.position.x += grWidth;
      plusXPlane.rotation.x = Math.PI;
      plusXPlane.rotation.y = -Math.PI / 2;
      plusXPlane.rotation.z = Math.PI / 2;

      const minusZPlane = plusZPlane.createInstance("minusZPlane");
      minusZPlane.position.z -= grHeight;
      minusZPlane.rotation.x = 0;
      minusZPlane.rotation.y = -Math.PI;

      //  minusZPlane.material = gridMat;

      let myPoints = [
        new Vector3(0, 0.01, 0),
        new Vector3(grWidth / 2, 0.01, 0),
      ];

      const lines = MeshBuilder.CreateLines("lines", {
        points: myPoints,
      });
      lines.color = Color3.Red();

      let myPointsZ = [
        new Vector3(0, 0.01, 0),
        new Vector3(0, 0.01, grHeight / 2),
      ];

      const linesZ = MeshBuilder.CreateLines("linesZ", {
        points: myPointsZ,
      });
      linesZ.color = Color3.Blue();
    }
*/
    return scene;
  };
}

export default new DefaultSceneWithTexture();
