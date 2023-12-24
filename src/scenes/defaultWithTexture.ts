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

    // This creates and positions a free camera (non-mesh)
    const camera = new ArcRotateCamera(
      "my first camera",
      0,
      Math.PI / 3,
      10,
      new Vector3(0, 0, 0),
      scene
    );

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    new NiceLoader(scene, modelsArray);

    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 10, height: 10 },
      scene
    );
    const groundMat = new PBRMaterial("groundMat");
    groundMat.roughness = 0.5;

    ground.material = groundMat;

    const gridMat = new GridMaterial("gridMat");
    ground.material = gridMat;

    const backPlane = MeshBuilder.CreatePlane("backPlane", {
      size: 10,
      sideOrientation: 0,
    });
    backPlane.position.x -= 5;
    // backPlane.position.y += 5;
    backPlane.rotation.x = Math.PI;
    backPlane.rotation.y = Math.PI / 2;
    backPlane.material = gridMat;

    const rightPlane = MeshBuilder.CreatePlane("backPlane", {
      size: 10,
      sideOrientation: 0,
    });
    rightPlane.position.z += 5;
    rightPlane.rotation.x = Math.PI;
    rightPlane.rotation.y = -Math.PI;
    rightPlane.material = gridMat;

    //  rightPlane.inspectableCustomProperties;

    let myPoints = [new Vector3(0, 0.01, 0), new Vector3(1, 0.01, 0)];

    const lines = MeshBuilder.CreateLines("lines", {
      points: myPoints,
    });
    lines.color = new Color3(1, 0, 0);

    let myPointsZ = [new Vector3(0, 0.01, 0), new Vector3(0, 0.01, 1)];

    const linesZ = MeshBuilder.CreateLines("linesZ", {
      points: myPointsZ,
    });
    linesZ.color = new Color3(0, 0, 1);

    return scene;
  };
}

export default new DefaultSceneWithTexture();
