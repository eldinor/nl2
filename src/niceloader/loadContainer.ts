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

export default class FileUpload extends HTMLElement {
  scene: Scene;
  arr: any;

  constructor(scene: Scene, arr: any) {
    // Inititialize custom component
    super();
    console.log(scene);
    this.attachShadow({ mode: "open" });
    this.shadowRoot!.appendChild(template.content.cloneNode(true));

    this.scene = scene;
    this.arr = arr;
    let am = new AssetsManager(this.scene);

    // Add event listeners
    this.select("input")!.onchange = (e) => this.handleChange(e);
    this.select("button")!.onclick = () => this.handleRemove(this.scene, am);

    console.log(this.scene);
    console.log(this.arr);
  }

  handleChange(e: any) {
    const file = e.target.files[0];

    this.loadAsset(file, this.scene, this.arr);
  }

  handleRemove(scene: Scene, am: AssetsManager) {
    // scene.onBeforeRenderObservable.addOnce(() => console.log(scene));
    this.removeAsset(this.scene, am);
    console.log("SDFSDFKLSDFJSDF");
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
    console.log("dispatch", event);
  }

  get select() {
    return this.shadowRoot!.querySelector.bind(this.shadowRoot);
  }

  loadAsset(file: any, scene: Scene, array: any) {
    let assetsManager = new AssetsManager();
    let filename = file.name;
    this.select("section")!.style.display = "block";
    this.select("span")!.innerText = file.name + " " + file.size;
    this.dispatch("change", file);
    let arr = this.arr;

    console.log(arr);

    console.log("loadAsset ", file);
    let blob = new Blob([file]);

    console.log(blob);

    FilesInput.FilesToLoad[filename.toLowerCase()] = blob as File;

    let task = assetsManager.addContainerTask(filename, "", "file:", filename);
    assetsManager.load();
    task.onSuccess = (task) => {
      console.log(task);
      task.loadedContainer.addAllToScene();
      console.log(this.scene);

      console.log(this.arr);
    };
  }
  //
  removeAsset(scene: Scene, am: AssetsManager) {
    const el = this.select("input");
    const file = el!.files![0];
    el!.value = "";
    this.select("section")!.style.display = "none";
    this.dispatch("change", file);
    console.log(this.scene);

    console.log("remove");
    console.log(scene);
  }
  //
}

window.customElements.define("file-upload", FileUpload);
