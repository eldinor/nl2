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
  ContainerAssetTask,
} from "@babylonjs/core";
import { GLTF2Export } from "@babylonjs/serializers/glTF";

import { createUploadButton } from "./createui2";

// Create template
const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <style>
      :host {
        font-size: 13px;
        font-family: arial;
      }
      article {
          display: flex;
          align-items: center;  color:#FFF; 
      }
      label {
        background-color: rgb(239, 239, 239);
        border: 1px solid rgb(118, 118, 118);
        padding: 2px 6px 2px 6px;
        border-radius: 2px;
        margin-right: 5px;
      
      }
      button {
          border:0;
          background: transparent;
          cursor: pointer;
      }
      button::before {
          content: '\\2716';
      }
  </style>
  <article>
    <label part="upload-button" for="fileUpload">Upload</label>
    <section hidden>
      <span></span><button></button>
    </section>
  </article>
  <input hidden id="fileUpload" type="file" />
`;

export class FileUpload {
  scene: Scene;
  arr: ContainerAssetTask;

  constructor(scene: Scene, arr: ContainerAssetTask) {
    // Inititialize custom component
    this.scene = scene;
    this.arr = arr;
    console.log("loadContainer");
  }

  loadAsset(file: any, scene: Scene) {
    let assetsManager = new AssetsManager(scene);
    let filename = file.name;
    /*
    this.select("section")!.style.display = "block";
    this.select("span")!.innerText = file.name + " " + file.size;
    this.dispatch("change", file);
*/
    console.log("handleChange ", file);
    let blob = new Blob([file]);

    console.log(blob);

    FilesInput.FilesToLoad[filename.toLowerCase()] = blob as File;

    let task = assetsManager.addContainerTask(filename, "", "file:", filename);
    assetsManager.load();
    task.onSuccess = (task) => {
      console.log(task);
      task.loadedContainer.addAllToScene();
    };
  }

  ggg(params?: any) {
    console.log("GGG GGG GGG");
    console.log(this.scene);
  }
}

export function createUploadButton() {
  let wrapper = document.getElementById("nl-wrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.setAttribute("id", "nl-wrapper");
    wrapper.style.position = "absolute";
    wrapper.style.top = "41px";
    wrapper.style.width = "400px";
    //    wrapper.style.left = "15px";
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
    fileInput.style.color = "transparent";
    console.log(fileInput);

    container.appendChild(fileInput);
  }
