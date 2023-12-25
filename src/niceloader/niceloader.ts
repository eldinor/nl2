import {
  AssetsManager,
  BoundingInfo,
  Color3,
  FilesInput,
  Mesh,
  MeshBuilder,
  MeshAssetTask,
  PBRMaterial,
  Scene,
} from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { GLTF2Export } from "@babylonjs/serializers/glTF";
import { GridMaterial } from "@babylonjs/materials";

export class NiceLoader {
  scene: Scene;
  arr: Array<MeshAssetTask>;
  gridHelper?: boolean | undefined;
  grWidth?: number | undefined;
  grHeight?: number | undefined;

  constructor(
    scene: Scene,
    arr: Array<MeshAssetTask>,
    gridHelper?: boolean | undefined,
    grWidth?: number | undefined,
    grHeight?: number | undefined
  ) {
    this.scene = scene;
    this.arr = arr;

    this.gridHelper = gridHelper;
    this.grWidth = grWidth;
    this.grHeight = grHeight;

    this.createUploadButton();
    this.uploadModel(scene, arr);
    if (gridHelper || gridHelper === undefined) {
      this.gridPlaneHelper(this.grWidth, this.grHeight);
    }
  }
  createUploadButton() {
    let wrapper = document.getElementById("nl-wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.setAttribute("id", "nl-wrapper");
      wrapper.style.position = "absolute";
      wrapper.style.top = "41px";
      wrapper.style.width = "400px";
      wrapper.style.border = "1px solid cadetblue";
      wrapper.style.padding = "4px";
      wrapper.style.backgroundColor = "rgba(0.5, 0.5, 1, 0.5)";

      document.body.appendChild(wrapper);
    }

    let container = document.getElementById("nl-container");
    if (!container) {
      container = document.createElement("div");
      container.setAttribute("id", "nl-container");
      container.style.padding = "4px";
      wrapper.appendChild(container);
    }

    let fileInput = document.getElementById("loadFile");
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.setAttribute("id", "loadFile");
      fileInput.setAttribute("type", "file");
      fileInput.style.color = "teal";

      container.appendChild(fileInput);
    }

    let deleteButton = document.getElementById("deleteButton");
    if (!deleteButton) {
      deleteButton = document.createElement("button");
      deleteButton.setAttribute("id", "deleteButton");
      deleteButton.style.float = "right";
      deleteButton.innerText = "Delete Imported";
      deleteButton.style.display = "none";

      deleteButton.style.border = "2px solid palevioletred";
      deleteButton.style.borderRadius = "5px";
      deleteButton.style.backgroundColor = "#7B1F07";
      deleteButton.style.color = "white";

      wrapper.appendChild(deleteButton);
    }
    let exportButton = document.getElementById("exportButton");
    if (!exportButton) {
      exportButton = document.createElement("button");
      exportButton.setAttribute("id", "exportButton");
      exportButton.style.float = "left";

      exportButton.innerText = "EXPORT";
      exportButton.style.display = "none";
      wrapper.appendChild(exportButton);
    }
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "saveAll";
    checkbox.value = "value";
    checkbox.id = "saveAll";
    checkbox.style.display = "none";

    const label = document.createElement("label");
    label.htmlFor = "saveAll";
    label.style.color = "teal";
    label.style.display = "none";
    label.id = "saveAllLabel";
    label.appendChild(document.createTextNode("Save All"));

    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);

    let filesizeElement = document.getElementById("filesizeElement");
    if (!filesizeElement) {
      filesizeElement = document.createElement("span");
      filesizeElement.innerHTML = "Size";
      filesizeElement.id = "filesizeElement";
      filesizeElement.style.color = "ivory";
      filesizeElement.style.fontSize = "small";
      filesizeElement.style.fontFamily = "Segoe UI, Arial";
      container!.appendChild(filesizeElement);
    }
  }

  uploadModel(scene: Scene, arr: Array<MeshAssetTask>) {
    const assetsManager = new AssetsManager(scene);
    let root;
    let modelsArray = arr;

    const tempNodes = scene.getNodes(); // To store existing nodes and not export them later

    console.log("tempNodes", tempNodes);

    assetsManager.onTaskSuccessObservable.add(function (task) {
      root = (task as MeshAssetTask).loadedMeshes[0]; //will hold the mesh that has been loaded recently\
      root.name = task.name;
      console.log("task successful", task);
      (task as MeshAssetTask).loadedMeshes.forEach((element) => {
        element.checkCollisions = true;
      });
      modelsArray.push(task as MeshAssetTask);

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
    });

    assetsManager.onTaskErrorObservable.add(function (task) {
      console.log(
        "task failed: " + task.name,
        task.errorObject.message,
        task.errorObject.exception
      );
    });

    const loadButton = document.getElementById("loadFile");

    loadButton!.onchange = function (evt) {
      const files: any = (evt.target as HTMLInputElement)!.files;
      const filename: string = files[0].name;
      const blob = new Blob([files[0]]);

      //  console.log(files[0].size);

      const sizeInMB = (files[0].size / (1024 * 1024)).toFixed(2);

      //   console.log(sizeInMB + " MB");

      const filesizeElement = document.getElementById("filesizeElement");
      filesizeElement!.innerHTML = sizeInMB + " MB";

      FilesInput.FilesToLoad[filename.toLowerCase()] = blob as File;

      assetsManager.addMeshTask(filename, "", "file:", filename);
      assetsManager.load();
    };

    // DELETE ALL
    document.getElementById("deleteButton")!.onclick = function () {
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

      document.getElementById("filesizeElement")!.innerHTML = "Size";

      document.getElementById("deleteButton")!.style.display = "none";
      document.getElementById("exportButton")!.style.display = "none";

      document.getElementById("saveAll")!.style.display = "none";
      document.getElementById("saveAllLabel")!.style.display = "none";

      // To clear the deleted node
      scene.debugLayer.hide();
      scene.debugLayer.show({ embedMode: true });
    };

    // EXPORT
    document.getElementById("exportButton")!.onclick = function () {
      const saveAll = (document.getElementById("saveAll") as HTMLInputElement)
        .checked;

      console.log(saveAll);

      const options = {
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

      // Forming the name for the export GLB
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

  gridPlaneHelper(grWidth?: number, grHeight?: number) {
    if (!grWidth) {
      grWidth = 10;
    }
    if (!grHeight) {
      grHeight = 10;
    }
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: grWidth, height: grHeight },
      this.scene
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

    const myPoints = [
      new Vector3(0, 0.01, 0),
      new Vector3(grWidth / 2, 0.01, 0),
    ];

    const lines = MeshBuilder.CreateLines("lines", {
      points: myPoints,
    });
    lines.color = Color3.Red();

    const myPointsZ = [
      new Vector3(0, 0.01, 0),
      new Vector3(0, 0.01, grHeight / 2),
    ];

    const linesZ = MeshBuilder.CreateLines("linesZ", {
      points: myPointsZ,
    });
    linesZ.color = Color3.Blue();
  }
}
