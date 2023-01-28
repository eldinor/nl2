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

export class loadContainer {
  scene: Scene;
  arr: Array<ContainerAssetTask>;

  constructor(scene: Scene, arr: Array<ContainerAssetTask>) {
    this.scene = scene;
    this.arr = arr;
    console.log("loadContainer");
    new FileUpload(scene);
  }
}

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
          align-items: center;
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

class FileUpload extends HTMLElement {
  am: AssetsManager;
  scene: Scene;
  constructor(scene: Scene) {
    // Inititialize custom component
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));

    // Add event listeners
    this.select("input")!.onchange = (e) => this.handleChange(e);
    this.select("button")!.onclick = () => this.handleRemove();
    this.scene = scene;
    this.am = new AssetsManager(scene);
  }

  handleChange(e: any) {
    const file = e.target.files[0];

    this.loadAsset(file, this.scene);
  }

  handleRemove() {
    const el = this.select("input");
    const file = el!.files![0];
    el!.value = "";
    this.select("section")!.style.display = "none";
    this.dispatch("change", file);
  }

  static get observedAttributes() {
    return ["upload-label"];
  }

  attributeChangedCallback(name: any, oldValue: any, newValue: any) {
    if (name === "upload-label") {
      console.log("attributeChangedCallback ");
      if (newValue && newValue !== "") {
        this.select("label")!.innerText = newValue;
        console.log("attributeChangedCallback 2 ");
      }
    }
  }

  dispatch(event: any, arg: any) {
    this.dispatchEvent(new CustomEvent(event, { detail: arg }));
  }

  get select() {
    return this.shadowRoot!.querySelector.bind(this.shadowRoot);
  }

  loadAsset(file: any, scene: Scene) {
    let assetsManager = new AssetsManager(scene);
    let filename = file.name;
    this.select("section")!.style.display = "block";
    this.select("span")!.innerText = file.name + " " + file.size;
    this.dispatch("change", file);

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
}

window.customElements.define("file-upload", FileUpload);
