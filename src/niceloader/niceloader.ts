import {
  AbstractMesh,
  AssetsManager,
  FilesInput,
  MeshAssetTask,
  Scene,
  Color3,
  MeshExploder,
  ArcRotateCamera,
  FramingBehavior,
} from "@babylonjs/core";
import { GLTF2Export } from "@babylonjs/serializers/glTF";

import { createUploadButton } from "./createui";

export class NiceLoader {
  scene: Scene;
  arr: Array<MeshAssetTask>;

  constructor(scene: Scene, arr: Array<MeshAssetTask>) {
    this.scene = scene;
    this.arr = arr;

    createUploadButton();
    this.uploadModel(scene, arr);

    let firstFileLoaded = false;
  }

  uploadModel(scene: Scene, arr: Array<MeshAssetTask>) {
    let assetsManager = new AssetsManager(scene);
    let root: any;
    let modelsArray = arr;

    const tempNodes = scene.getNodes(); // To store existing nodes and not export them later

    console.log("tempNodes", tempNodes);

    assetsManager.onTaskSuccessObservable.add(function (task: any) {
      root = task.loadedMeshes[0]; //will hold the mesh that has been loaded recently\
      root.name = task.name;
      console.log("task successful", task);
      task.loadedMeshes.forEach((element: any) => {
        element.checkCollisions = true;
      });
      modelsArray.push(task);

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
      analyzeModel(task);

      //  explodeModel(task, scene);
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

      assetsManager.addMeshTask(filename, "", "file:", filename);
      assetsManager.load();

      // Enable camera's behaviors

      let camera = scene.activeCamera as ArcRotateCamera;
      camera.useFramingBehavior = true;

      const framingBehavior = camera.getBehaviorByName(
        "Framing"
      ) as FramingBehavior;
      framingBehavior.framingTime = 0;
      framingBehavior.elevationReturnTime = -1;

      if (scene.meshes.length) {
        camera.lowerRadiusLimit = null;

        const worldExtends = scene.getWorldExtends(function (mesh) {
          return mesh.isVisible && mesh.isEnabled();
        });
        framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
      }
    };

    // DELETE ALL
    document.getElementById("deleteButton")!.onclick = function (_e) {
      modelsArray.forEach((element: MeshAssetTask) => {
        element.loadedMeshes[0].dispose(false, true);

        element.loadedAnimationGroups.forEach((a) => {
          a.dispose();
        });

        element.loadedSkeletons.forEach((a) => {
          a.dispose();
        });
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
function analyzeModel(task: MeshAssetTask) {
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

function explodeModel(task: MeshAssetTask, scene: Scene) {
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
    key.position = value;
  });
}
