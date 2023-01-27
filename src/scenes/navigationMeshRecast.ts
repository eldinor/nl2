import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CubeTexture } from "@babylonjs/core/Materials";
import { FramingBehavior } from "@babylonjs/core";

import { CreateSceneClass } from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
// import "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

import grassTextureUrl from "../../assets/grass.jpg";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

import { NiceLoader } from "../niceLoader/niceloader";
import ApexCharts from "apexcharts";

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
    const modelsArray: any = [];

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

    //new NiceLoader(scene, modelsArray);

    const worker = new Worker(
      new URL("../externals/worker.js", import.meta.url)
    );

    console.log(worker);

    worker.postMessage({
      question:
        "The Answer to the Ultimate Question of Life, The Universe, and Everything.",
    });
    worker.onmessage = ({ data: { answer } }) => {
      console.log(answer);
    };
    //
    let _canvas;
    /*
    if (!document.getElementById("workerRenderCanvas")) {
      _canvas = document.getElementById("workerRenderCanvas") as any;

      _canvas.width = _canvas.clientWidth;
      _canvas.height = _canvas.clientHeight;
    }

    let imageURL = "https://playground.babylonjs.com/textures/grass.jpg";
    var offscreen: any = _canvas.transferControlToOffscreen();

    var newWebWorker = new Worker(
      new URL("../externals/testworker.js", import.meta.url)
    );
    newWebWorker.postMessage({ canvas: offscreen }, [offscreen]);
    newWebWorker.postMessage({ imageURL });

    //
    */
    //

    var options = {
      series: [
        {
          name: "Actual",
          data: [
            {
              x: "2011",
              y: 12,
              goals: [
                {
                  name: "Expected",
                  value: 14,
                  strokeWidth: 2,
                  strokeDashArray: 2,
                  strokeColor: "#775DD0",
                },
              ],
            },
            {
              x: "2012",
              y: 44,
              goals: [
                {
                  name: "Expected",
                  value: 54,
                  strokeWidth: 5,
                  strokeHeight: 10,
                  strokeColor: "#775DD0",
                },
              ],
            },
            {
              x: "2013",
              y: 54,
              goals: [
                {
                  name: "Expected",
                  value: 52,
                  strokeWidth: 10,
                  strokeHeight: 0,
                  strokeLineCap: "round",
                  strokeColor: "#775DD0",
                },
              ],
            },
            {
              x: "2014",
              y: 66,
              goals: [
                {
                  name: "Expected",
                  value: 61,
                  strokeWidth: 10,
                  strokeHeight: 0,
                  strokeLineCap: "round",
                  strokeColor: "#775DD0",
                },
              ],
            },
            {
              x: "2015",
              y: 81,
              goals: [
                {
                  name: "Expected",
                  value: 66,
                  strokeWidth: 10,
                  strokeHeight: 0,
                  strokeLineCap: "round",
                  strokeColor: "#775DD0",
                },
              ],
            },
            {
              x: "2016",
              y: 67,
              goals: [
                {
                  name: "Expected",
                  value: 70,
                  strokeWidth: 5,
                  strokeHeight: 10,
                  strokeColor: "#775DD0",
                },
              ],
            },
          ],
        },
      ],
      chart: {
        height: 350,
        type: "bar",
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      colors: ["#00E396"],
      dataLabels: {
        formatter: function (val: any, opt: any) {
          const goals =
            opt.w.config.series[opt.seriesIndex].data[opt.dataPointIndex].goals;

          if (goals && goals.length) {
            return `${val} / ${goals[0].value}`;
          }
          return val;
        },
      },
      legend: {
        show: true,
        showForSingleSeries: true,
        customLegendItems: ["Actual", "Expected"],
        markers: {
          fillColors: ["#00E396", "#775DD0"],
        },
      },
    };

    var chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();

    //
    return scene;
  };
}

export default new DefaultSceneWithTexture();
