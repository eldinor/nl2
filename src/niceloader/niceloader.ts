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
  Tools,
  Quaternion,
  SceneLoader,
} from "@babylonjs/core";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { GLTF2Export } from "@babylonjs/serializers/glTF";
import { GridMaterial } from "@babylonjs/materials";
import { Pane } from "tweakpane";
//
import { Document, NodeIO, WebIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  inspect,
  join,
  prune,
  reorder,
  simplify,
  textureCompress,
  weld,
} from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

//

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
      container.style.marginBottom = "14px";

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
    let root: any;
    let modelsArray = arr;

    const tempNodes = scene.getNodes(); // To store existing nodes and not export them later

    console.log("tempNodes", tempNodes);

    assetsManager.onTaskSuccessObservable.add(function (task) {
      root = (task as MeshAssetTask).loadedMeshes[0]; //will hold the mesh that has been loaded recently\
      root.name = task.name;
      root.rotationQuaternion = null;
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
      //
      // ######################################################################################
      //
      const pane = new Pane({
        container: document.getElementById("nl-wrapper") as HTMLElement,
      });

      const f1 = pane.addFolder({
        title: "ROTATION",
      });

      const clockwiseButton = f1.addButton({
        title: "Clockwise",
        label: "Clockwise >>>", // optional
      });

      let countCW = 0;

      clockwiseButton.on("click", () => {
        countCW += 15;

        root.rotation.y = Tools.ToRadians(countCW);

        console.log(countCW);
        clockwiseButton.title = countCW.toString();
        counterClockwiseButton.title = countCW.toString();
      });

      const counterClockwiseButton = f1.addButton({
        title: "CounterClockwise",
        label: "CounterClockwise <<<", // optional
      });

      counterClockwiseButton.on("click", () => {
        countCW -= 15;
        console.log(countCW);
        root.rotation.y = Tools.ToRadians(countCW);
        counterClockwiseButton.title = countCW.toString();
        clockwiseButton.title = countCW.toString();
      });

      //
      //
      // ###############################################
    });

    assetsManager.onTaskErrorObservable.add(function (task) {
      console.log(
        "task failed: " + task.name,
        task.errorObject.message,
        task.errorObject.exception
      );
    });

    const loadButton = document.getElementById("loadFile");

    loadButton!.onchange = async function (evt) {
      const files: any = (evt.target as HTMLInputElement)!.files;
      const filename: string = files[0].name;
      const blob = new Blob([files[0]]);
      const arr = new Uint8Array(await blob.arrayBuffer());

      console.log(arr);

      //  console.log(files[0].size);

      const sizeInMB = (files[0].size / (1024 * 1024)).toFixed(2);

      //   console.log(sizeInMB + " MB");

      const filesizeElement = document.getElementById("filesizeElement");
      filesizeElement!.innerHTML = sizeInMB + " MB";

      FilesInput.FilesToLoad[filename.toLowerCase()] = blob as File;

      assetsManager.addMeshTask(filename, "", "file:", filename);
      console.log(filename);
      assetsManager.load();

      //
      //
      await MeshoptEncoder.ready;

      const io = new WebIO().registerExtensions(ALL_EXTENSIONS);

      const doc = await io.readBinary(arr);
      console.log(doc);

      const report = inspect(doc);
      console.log(report);

      await doc.transform(
        dedup(),
        join({ keepMeshes: false, keepNamed: false }),
        weld({ tolerance: 0.0001 }),
        simplify({ simplifier: MeshoptSimplifier, ratio: 0.75, error: 0.001 }),
        prune(),
        reorder({ encoder: MeshoptEncoder }),
        textureCompress({ targetFormat: "webp", resize: [1024, 1024] })
      );

      const glb = await io.writeBinary(doc);
      console.log(glb);

      const assetBlob = new Blob([glb]);
      const assetUrl = URL.createObjectURL(assetBlob);
      /*
      const newGLB = await SceneLoader.AppendAsync(
        assetUrl,
        undefined,
        scene,
        undefined,
        ".glb"
      );
      console.log(newGLB);

      const rr = newGLB.meshes.find((m) => m.name.includes("root"));
      console.log(rr);
      scene.debugLayer.select(rr);
*/
      const newGLB = await SceneLoader.ImportMeshAsync(
        "",
        assetUrl,
        undefined,
        scene,
        undefined,
        ".glb"
      );

      console.log(newGLB);
      const rr = newGLB.meshes[0];
      scene.debugLayer.select(rr);

      const link = document.createElement("a"); // Or maybe get it from the current document
      link.href = assetUrl;
      link.download = "aDefaultFileName.glb";
      link.innerHTML = "Click here to download the file";
      document.getElementById("topBar")!.appendChild(link); // Or append it whereever you want
      scene.getMeshByName(filename)?.setEnabled(false);
      //
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
