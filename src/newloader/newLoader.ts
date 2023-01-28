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
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { BaseTexture } from "@babylonjs/core/Materials/Textures/baseTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { GLTF2Export } from "@babylonjs/serializers/glTF";

import ColorThief from "colorthief";

export class newLoader {
  scene: Scene;
  arr: Array<ContainerAssetTask>;

  constructor(scene: Scene, arr: Array<ContainerAssetTask>) {
    this.scene = scene;
    this.arr = arr;

    console.log("newLoader");

    let parent = document.getElementById("topBar");
    // makeFileInput(parent);

    let myInput = document.getElementById("fileUpload");
    if (myInput) {
      myInput!.onchange = (e) => this.handleChange(e);
    }
    let myButton = document.getElementById("fubutton");

    if (myButton) {
      myButton!.onclick = () => this.handleRemove();
    }
  }

  handleChange(_e: any) {
    const file = _e.target.files[0];
    console.log(_e.target.files[0].name);
    document.getElementById("fubutton")!.innerText = _e.target.files[0].name;
    document.getElementById("fusection")!.style.visibility = "visible";
  }

  handleRemove() {}
}
//#######################################
function makeFileInput(parent: HTMLElement | null) {
  let fileInput = document.getElementById("loadFile");
  if (!fileInput) {
    fileInput = document.createElement("input");
    fileInput.setAttribute("id", "loadFile");
    fileInput.setAttribute("type", "file");
    fileInput.style.color = "transparent";
    console.log(fileInput);

    parent!.appendChild(fileInput);
  }
}
