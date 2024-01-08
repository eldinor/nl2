/**
 * This file demonstrates how to create a simple scene with GLSL shaders
 * loaded from separate files.
 *
 * There are other ways to load shaders, see https://doc.babylonjs.com/advanced_topics/shaders/shaderCodeInBjs
 */

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
// import "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Effect } from "@babylonjs/core/Materials/effect";
import { ShaderMaterial } from "@babylonjs/core/Materials/shaderMaterial";

import grassTextureUrl from "../../assets/grass.jpg";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";

import fresnelVertexShader from "../glsl/fresnel/vertex.glsl";
import fresnelFragmentShader from "../glsl/fresnel/fragment.glsl";

import pixelmatch from "pixelmatch";
import { Tools } from "@babylonjs/core";
// import { compareImages } from "../externals/getDiff";

import { buildImages, getElements } from "../externals/checkDiff";

interface IpmResult {
  pm: number;
  error: number;
}

export class FresnelShaderScene implements CreateSceneClass {
  createScene = async (
    engine: Engine,
    canvas: HTMLCanvasElement
  ): Promise<Scene> => {
    // This creates a basic Babylon Scene object (non-mesh)
    const scene = new Scene(engine);
    /*
        void Promise.all([
            import("@babylonjs/core/Debug/debugLayer"),
            import("@babylonjs/inspector"),
        ]).then((_values) => {
            console.log(_values);
            scene.debugLayer.show({
                handleResize: true,
                overlay: true,
                globalRoot: document.getElementById("#root") || undefined,
            });
        });
*/
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

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    // const light = new HemisphericLight(
    //     "light",
    //     new Vector3(0, 1, 0),
    //     scene
    // );

    // // Default intensity is 1. Let's dim the light a small amount
    // light.intensity = 0.7;

    // Our built-in 'sphere' shape.
    const sphere = CreateSphere("sphere", { diameter: 2, segments: 32 }, scene);

    // Move the sphere upward 1/2 its height
    sphere.position.y = 1;

    // Add shaders to the store
    Effect.ShadersStore["fresnelVertexShader"] = fresnelVertexShader;
    Effect.ShadersStore["fresnelFragmentShader"] = fresnelFragmentShader;

    // Create shader material to use with the sphere
    const shaderMaterial = new ShaderMaterial(
      "fresnel",
      scene,
      {
        vertex: "fresnel",
        fragment: "fresnel",
      },
      {
        attributes: ["position", "normal"],
        defines: [],
        samplers: [],
        uniforms: ["cameraPosition", "world", "worldViewProjection"],
      }
    );

    sphere.material = shaderMaterial;

    // Our built-in 'ground' shape.
    const ground = CreateGround("ground", { width: 6, height: 6 }, scene);

    // Load a texture to be used as the ground material
    const groundMaterial = new StandardMaterial("ground material", scene);
    groundMaterial.diffuseTexture = new Texture(grassTextureUrl, scene);

    ground.material = groundMaterial;
    ground.receiveShadows = true;

    const light = new DirectionalLight("light", new Vector3(0, -1, 1), scene);
    light.intensity = 0.5;
    light.position.y = 10;

    const shadowGenerator = new ShadowGenerator(512, light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurScale = 2;
    shadowGenerator.setDarkness(0.2);

    shadowGenerator.getShadowMap()!.renderList!.push(sphere);

    /*
    const compImg = compareImages(
      "https://raw.githubusercontent.com/eldinor/ForBJS/master/file_example_WEBP_250kB.webp",
      "https://raw.githubusercontent.com/eldinor/ForBJS/master/file_example_WEBP_250kB.webp"
    );

    console.log(compImg);
    */

    /*
    const img1 = await Tools.LoadFileAsync(
      "https://playground.babylonjs.com/textures/floor.png"
    );

    const img2 = await Tools.LoadFileAsync(
      "https://playground.babylonjs.com/textures/fire.png"
    );

    console.log(img1, img2);
*/
    //
    //

    let canvas1 = document.getElementById("canvas1") as HTMLCanvasElement;
    if (!canvas1) {
      canvas1 = document.createElement("canvas");
      canvas1.id = "canvas1";
    }
    let context1 = canvas1.getContext("2d");
    let canvas2 = document.getElementById("canvas2") as HTMLCanvasElement;
    if (!canvas2) {
      canvas2 = document.createElement("canvas");
      canvas2.id = "canvas2";
    }
    let context2 = canvas2.getContext("2d");

    let canvasDiff = document.createElement("canvas");

    let contextD = canvasDiff.getContext("2d");

    make_base(
      context1,
      context2,
      "https://raw.githubusercontent.com/eldinor/ForBJS/master/file_example_WEBP_250kB.webp",
      "https://raw.githubusercontent.com/eldinor/ForBJS/master/file_example_WEBP_250kB.webp"
    );

    function make_base(
      context1: any,
      context2: any,
      src1: string,
      src2: string
    ) {
      let base_image = new Image();
      base_image.src = src1;
      base_image.crossOrigin = "Anonymous";
      base_image.onload = function () {
        canvas1.width = base_image.width;
        canvas1.height = base_image.height;
        context1.drawImage(base_image, 0, 0);

        //
        //
        let base_image2 = new Image();
        base_image2.src = src2;

        base_image2.crossOrigin = "Anonymous";
        base_image2.onload = function () {
          //
          canvas2.width = base_image.width;
          canvas2.height = base_image.height;
          context2.drawImage(base_image2, 10, 0);
          console.log(context2);

          canvasDiff.width = canvas1.width;
          canvasDiff.height = canvas1.height;
          const img1 = context1.getImageData(
            0,
            0,
            canvas1.width,
            canvas1.height
          );
          const img2 = context2.getImageData(
            0,
            0,
            canvas2.width,
            canvas2.height
          );
          const diff = contextD!.createImageData(canvas1.width, canvas1.height);

          console.log(img1.data);

          const pm = pixelmatch(
            img1.data,
            img2.data,
            diff.data,
            canvas1.width,
            canvas1.height,
            {
              threshold: 0.1,
              diffMask: true, //??
            }
          );

          console.log(pm);
          contextD!.putImageData(diff, 0, 0);

          const dataURL = canvasDiff.toDataURL();
          console.log(dataURL); // DIFF IMAGE

          const pmResult: IpmResult = {
            pm: pm,
            error:
              Math.round((100 * 100 * pm) / (canvas1.width * canvas1.height)) /
              100,
          };

          console.log(
            `error: ${
              Math.round((100 * 100 * pm) / (canvas1.width * canvas1.height)) /
              100
            }%`
          );
        };
      };
    }

    return scene;
  };
}

export default new FresnelShaderScene();
