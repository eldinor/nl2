import {
  AbstractMesh,
  AssetsManager,
  FilesInput,
  MeshAssetTask,
  ContainerAssetTask,
  Scene,
  Color3,
  MeshExploder,
  ArcRotateCamera,
  FramingBehavior,
  Animation,
} from "@babylonjs/core";
import { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { GLTF2Export } from "@babylonjs/serializers/glTF";

import ColorThief from "colorthief";

import { createUploadButton } from "./createuiCONT";

export class NiceLoaderCONT {
  scene: Scene;
  arr: Array<ContainerAssetTask>;

  constructor(scene: Scene, arr: Array<ContainerAssetTask>) {
    this.scene = scene;
    this.arr = arr;

    createUploadButton();
    this.uploadModel(scene, arr);

    let firstFileLoaded = false;
  }

  uploadModel(scene: Scene, arr: Array<ContainerAssetTask>) {
    let assetsManager = new AssetsManager(scene);
    let root: any;
    let modelsArray = arr;

    const tempNodes = scene.getNodes(); // To store existing nodes and not export them later

    console.log("tempNodes", tempNodes);

    var duplicate = function (container: any, offset: any, offsetY: any) {
      let entries = container.instantiateModelsToScene(undefined, true, {
        doNotInstantiate: true,
      });

      for (var node of entries.rootNodes) {
        node.position.x += offset;
        node.position.y += offsetY;
      }
    };

    assetsManager.onTaskSuccessObservable.add(function (task: any) {
      root = task.loadedMeshes[0]; //will hold the mesh that has been loaded recently\
      root.name = task.name;

      console.log(task);

      task.loadedContainer.addAllToScene();

      modelsArray.push(task);

      //   duplicate(task.loadedContainer, 22, 0);
      /*
      const mClone = task.loadedContainer.instantiateModelsToScene(
        undefined,
        false,
        { doNotInstantiate: true }
      );

      console.log("mClone", mClone);
*/
      //   root.normalizeToUnitCube(true);
      //   root.scaling.scaleInPlace(10);

      console.log("task successful", task);
      task.loadedMeshes.forEach((element: any) => {
        element.checkCollisions = true;
      });
      // Enable camera's behaviors

      let camera = scene.activeCamera as ArcRotateCamera;

      camera.useFramingBehavior = true;
      //camera.radius = 1000;

      const framingBehavior = camera.getBehaviorByName(
        "Framing"
      ) as FramingBehavior;
      framingBehavior.framingTime = 0.2;
      framingBehavior.elevationReturnTime = -1;

      if (scene.meshes.length) {
        camera.lowerRadiusLimit = null;

        const worldExtends = scene.getWorldExtends(function (root) {
          return root.isVisible && root.isEnabled();
        });
        framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
      }

      scene.debugLayer.show({
        overlay: true,
        embedMode: true,
        enablePopup: false,
      });
      scene.debugLayer.select(root);

      document.getElementById("deleteButton")!.style.display = "initial";
      document.getElementById("exportButton")!.style.display = "initial";

      document.getElementById("saveAll")!.style.display = "initial";
      document.getElementById("saveAllLabel")!.style.display = "initial";

      document.getElementById("loadFile")!.style.display = "none";
      //
      // analyzeModel(task);

      // explodeModel(task, scene);

      getCommonColor(scene);
    });
    //
    assetsManager.onTaskErrorObservable.add(function (task) {
      console.log(
        "task failed: " + task.name,
        task.errorObject.message,
        task.errorObject.exception
      );
    });

    const loadButton = document.getElementById("loadFile");

    loadButton!.onchange = function (evt) {
      let files: any = (evt.target as HTMLInputElement)!.files;
      let filename = files[0].name;
      let blob = new Blob([files[0]]);

      console.log(files[0].size);

      let sizeInMB = (files[0].size / (1024 * 1024)).toFixed(2);

      console.log(sizeInMB + " MB");

      document.getElementById("flieName")!.innerHTML = filename;
      document.getElementById("flieSize")!.innerHTML = sizeInMB + " MB";
      document.getElementById("fileInfo")!.style.display = "initial";

      FilesInput.FilesToLoad[filename.toLowerCase()] = blob as File;

      assetsManager.addContainerTask(filename, "", "file:", filename);
      assetsManager.load();
    };

    // DELETE ALL
    document.getElementById("deleteButton")!.onclick = function (_e) {
      modelsArray.forEach((element: ContainerAssetTask) => {
        console.log("element", element);

        element.loadedContainer.dispose();

        /*
        element.loadedMeshes.forEach((a) => {
          a.dispose();
        });
        element.loadedAnimationGroups.forEach((a) => {
          a.dispose();
        });

        element.loadedSkeletons.forEach((a) => {
          a.dispose();
        });

        */
      });

      modelsArray = [];

      (document.getElementById("loadFile") as HTMLInputElement).value = "";
      loadButton!.innerHTML = "";

      document.getElementById("deleteButton")!.style.display = "none";
      document.getElementById("exportButton")!.style.display = "none";

      document.getElementById("saveAll")!.style.display = "none";
      document.getElementById("saveAllLabel")!.style.display = "none";
      // To clear the deleted node
      scene.debugLayer.hide();
      scene.debugLayer.show({ embedMode: true });
      document.getElementById("loadFile")!.style.display = "initial";
      document.getElementById("fileInfo")!.style.display = "none";
    };

    // EXPORT
    document.getElementById("exportButton")!.onclick = function (_e) {
      let saveAll = (document.getElementById("saveAll") as HTMLInputElement)
        .checked;

      let options = {
        shouldExportNode: function (node: any) {
          if (!saveAll) {
            if (!(tempNodes as any).includes(node)) {
              return node;
            }
          } else {
            return node;
          }
        },
      };

      console.log(modelsArray);

      let exportFileName = "";

      modelsArray.forEach((m) => {
        exportFileName += m.name.slice(0, 6) + "-";
      });

      exportFileName = "NL-" + exportFileName.slice(0, -1);

      console.log("EXPORT " + exportFileName);

      GLTF2Export.GLBAsync(scene, exportFileName, options).then((glb) => {
        glb.downloadFiles();
      });
    };
  }
}
function analyzeModel(task: ContainerAssetTask) {
  console.log("ANALYZE");
  const vertArray = new Map();

  task.loadedMeshes[0].getChildMeshes().forEach((m) => {
    vertArray.set(m, m.getTotalVertices());
  });

  console.log(vertArray);

  let sum = 0;

  vertArray.forEach((value) => {
    sum += value;
  });

  console.log(sum);

  let shareArray = new Map(vertArray);

  // Some consts for coloring

  let colorMap = new Map();

  colorMap.set(0.2, Color3.Teal());
  colorMap.set(1, new Color3(0.32, 0.3, 0.55));
  colorMap.set(2, Color3.Blue());
  colorMap.set(5, Color3.Green());
  colorMap.set(7, Color3.Yellow());
  colorMap.set(10, Color3.Purple());
  colorMap.set(15, Color3.Magenta());
  colorMap.set(20, Color3.Red());

  console.log(colorMap);
  console.log([...colorMap.entries()]);

  const cmArr = [...colorMap.entries()];

  //
  shareArray.forEach((value, key) => {
    let sharePercent = (value / sum) * 100;
    shareArray.set(key, sharePercent);
    console.log(sharePercent);

    key.overlayColor = Color3.Gray();
    key.renderOverlay = true;

    for (let i = 0; i < cmArr.length; i++) {
      //   console.log(cmArr[i], cmArr[i + 1]);
      let cc = cmArr[i];
      if (sharePercent > cc[0]) {
        key.overlayColor = cc[1];
        key.renderOverlay = true;
      }
    }
  });

  //
}

function explodeModel(task: ContainerAssetTask, scene: Scene) {
  scene.executeWhenReady(function () {
    console.log(task);

    const root = task.loadedMeshes[0];

    //  const rootClone = root.instantiateHierarchy();

    const oldPos = new Map();

    task.loadedMeshes.forEach((m) => {
      oldPos.set(m, m.position);
    });

    console.log(oldPos);

    const newExplosion = new MeshExploder(
      task.loadedMeshes as any,
      task.loadedMeshes[0] as any
    );
    newExplosion.explode(1);

    setTimeout(() => {
      deExplodeMesh(oldPos);
      console.log("DeExploded");
    }, 5000);
  });
}

function deExplodeMesh(arr: any) {
  arr.forEach((key: any, value: any) => {
    //  console.log(key);
    //  console.log("VALUE ", value);

    Animation.CreateAndStartAnimation(
      "deexplode",
      value,
      "position",
      60,
      60,
      value.position,
      Vector3.Zero(),
      Animation.ANIMATIONLOOPMODE_CONSTANT,
      undefined,
      undefined
    );

    // value.position = Vector3.Zero();
  });
}

function getCommonColor(scene: Scene) {
  console.log("getCommonColor");

  const colorThief = new ColorThief();
  console.log(colorThief);

  console.log(scene.textures);

  const sceneTex = scene.textures;

  let modelTex: any = [];

  // Remove CubeTexture
  sceneTex.forEach((t) => {
    console.log(t.getClassName());
    if (t.getClassName() !== "CubeTexture") {
      if (!t.name.includes("EnvironmentBRDFTexture")) {
        modelTex.push(t);
      }
    }
  });

  console.log(modelTex);
  //
  modelTex.forEach((element: any) => {
    console.log(element);

    const texture = element;

    console.log(texture);
    console.log(texture._buffer);
    const b64 = _arrayBufferToBase64(texture._buffer);

    console.log(b64);

    var imageELement = document.createElement("img");
    imageELement.setAttribute("src", "data:image/png;base64," + b64);

    imageELement.setAttribute("width", "200px");
    imageELement.setAttribute("height", "200px");

    imageELement.style.position = "absolute";
    imageELement.style.top = "100px";
    imageELement.style.left = "100px";
    imageELement.style.zIndex = "10000";
    document.body.appendChild(imageELement);
  });
  /*
    console.log(element.readPixels());

    element.readPixels().then((content: any) => {
      console.log(content);
      const b64 = _arrayBufferToBase64(content);
      console.log(b64);

      var imageELement = document.createElement("IMG");
      imageELement.setAttribute("src", "data:image/png;base64," + b64);

      imageELement.setAttribute("width", "200px");
      imageELement.setAttribute("height", "200px");

      imageELement.style.position = "absolute";
      imageELement.style.top = "100px";
      imageELement.style.left = "100px";
      imageELement.style.zIndex = "10000";
      document.body.appendChild(imageELement);
    });
  });
  */
  /*
  const content = new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 5, 0,
    0, 0, 5, 8, 6, 0, 0, 0, 141, 111, 38, 229, 0, 0, 0, 28, 73, 68, 65, 84, 8,
    215, 99, 248, 255, 255, 63, 195, 127, 6, 32, 5, 195, 32, 18, 132, 208, 49,
    241, 130, 88, 205, 4, 0, 14, 245, 53, 203, 209, 142, 14, 31, 0, 0, 0, 0, 73,
    69, 78, 68, 174, 66, 96, 130,
  ]);
*/
  function _arrayBufferToBase64(buffer: any) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  //
}
