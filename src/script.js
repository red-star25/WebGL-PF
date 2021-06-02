import "./styles.css";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * Variable Declaration
 */
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let boost = false;
let axisDown = new THREE.Vector3(1, 0, 0);
let axisUp = new THREE.Vector3(-1, 0, 0);
let axisLeft = new THREE.Vector3(0, 1, 0);
let axisRight = new THREE.Vector3(0, -1, 0);
let speed = 0.05;
let velocity = 8;
let goal;
let distance = 0.3;
let a = new THREE.Vector3();
let b = new THREE.Vector3();
let dir = new THREE.Vector3();

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

/**
 * Canvas
 */
const canvas = document.querySelector(".webgl");

/**
 * Scene
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color("#E6B992");

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

/**
 * GLTF
 */
const gltfLoader = new GLTFLoader();
let truck = null;
gltfLoader.load("/model/truck.glb", (gltf) => {
  console.log("success");
  truck = gltf.scene;
  goal = new THREE.Object3D();
  goal.add(camera);
  scene.add(gltf.scene);
});

document.addEventListener("keydown", onDocumentKeyDown, false);
document.addEventListener("keyup", onDocumentKeyUp, false);
function onDocumentKeyUp(event) {
  var keyCode = event.which;
  switch (keyCode) {
    case 87:
      moveForward = false;
      break;
    case 65:
      moveLeft = false;
      // Straightning the wheel when A key lift up
      truck.children[0].children[3].rotation.y = 0;
      truck.children[0].children[4].rotation.y = 0;
      break;
    case 83:
      moveBackward = false;
      break;
    case 68:
      moveRight = false;
      // Straightning the wheel when D key lift up
      truck.children[0].children[3].rotation.y = 0;
      truck.children[0].children[4].rotation.y = 0;
      break;
    case 16:
      boost = false;
      velocity = 8;
      break;
    default:
      break;
  }
}
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  switch (keyCode) {
    case 87:
      moveForward = true;
      break;
    case 65:
      moveLeft = true;
      break;
    case 83:
      moveBackward = true;
      break;
    case 68:
      moveRight = true;
      break;
    case 16:
      boost = true;
      velocity = 15;
      break;
    default:
      break;
  }
}

/**
 * floor
 */
const floorGeometry = new THREE.PlaneBufferGeometry(1000, 1000);
const floorMaterial = new THREE.MeshBasicMaterial({
  color: "#FE981F",
  side: THREE.DoubleSide,
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

var gridHelper = new THREE.GridHelper(40, 40);
scene.add(gridHelper);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#ffffff");
scene.add(ambientLight);

const directionalLights = new THREE.DirectionalLight("#ffffff", 5);
scene.add(directionalLights);
directionalLights.position.set(3, 30, -3);
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLights
);
scene.add(directionalLightHelper);

const pointLight = new THREE.PointLight("#ffffff", 5);
scene.add(pointLight);
pointLight.position.set(-3, 30, 0);
const pointLightHelper = new THREE.PointLightHelper(pointLight);
scene.add(pointLightHelper);

/**
 * Axis helper
 */
const axisHelper = new THREE.AxesHelper(2);
axisHelper.position.y = 1;
scene.add(axisHelper);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(-3, 6, -6);
// camera.position.set(0, 3, 3);
camera.lookAt(scene.position);
scene.add(camera);

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

window.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) {
    //go fullscreen
    canvas.requestFullscreen();
  } else {
    //leave fullscreen
    document.exitFullscreen();
  }
});

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;

const clock = new THREE.Clock();
let time = 0;

/**
 * Functions
 */
const moveCar = (deltaTime) => {
  if (truck != null) {
    if (moveForward) {
      // Rotating the Wheel Mesh
      truck.children[0].children[1].rotateOnAxis(axisUp, speed);
      truck.children[0].children[2].rotateOnAxis(axisUp, speed);
      truck.children[0].children[3].rotateOnAxis(axisUp, speed);
      truck.children[0].children[4].rotateOnAxis(axisUp, speed);

      // Moving the truck backward
      truck.translateZ(-deltaTime * velocity);

      // Straightning the wheel
      truck.children[0].children[3].rotation.y = 0;
      truck.children[0].children[4].rotation.y = 0;
    }
    if (moveBackward) {
      // Rotating the Wheel Mesh
      truck.children[0].children[1].rotateOnAxis(axisDown, speed);
      truck.children[0].children[2].rotateOnAxis(axisDown, speed);
      truck.children[0].children[3].rotateOnAxis(axisDown, speed);
      truck.children[0].children[4].rotateOnAxis(axisDown, speed);

      // Moving the truck backward
      truck.translateZ(deltaTime * velocity);

      // Straightning the wheel when D key lift up
      truck.children[0].children[3].rotation.y = 0;
      truck.children[0].children[4].rotation.y = 0;
    }

    // If truck is not moving, then just rotating the wheel
    if (moveLeft) {
      if (truck.children[0].children[3].rotation.y < 0.4) {
        // Limiting the wheel rotating angle
        truck.children[0].children[3].quaternion.setFromAxisAngle(
          axisLeft,
          Math.PI / 6
        );
        truck.children[0].children[4].quaternion.setFromAxisAngle(
          axisLeft,
          Math.PI / 6
        );
      }
    }

    if (moveLeft && moveForward) {
      // Turning The Truck Left
      truck.rotation.y += (Math.PI / 2) * 2 * deltaTime;
    }
    if (moveLeft && moveBackward) {
      truck.rotation.y -= (Math.PI / 2) * 2 * deltaTime;
    }

    // If truck is not moving, then just rotating the wheel
    if (moveRight) {
      if (truck.children[0].children[3].rotation.y > -0.4) {
        // Limiting the wheel rotating angle
        truck.children[0].children[3].setRotationFromAxisAngle(axisRight, 0.5);
        truck.children[0].children[4].setRotationFromAxisAngle(axisRight, 0.5);
      }
    }
    if (moveRight && moveForward) {
      // Turning The Truck Right
      truck.rotation.y -= (Math.PI / 2) * 2 * deltaTime;
    }
    if (moveRight && moveBackward) {
      truck.rotation.y += (Math.PI / 2) * 2 * deltaTime;
    }
  }
};

const moveCamera = () => {
  if (truck) {
    a.lerp(truck.position, 0.4);
    b.copy(goal.position);
    dir.copy(a).sub(b).normalize();
    const dis = a.distanceTo(b) - distance;
    goal.position.addScaledVector(dir, dis);

    camera.lookAt(truck.position);
  }
};

//Animation
const tick = () => {
  const currentTime = clock.getElapsedTime();
  const deltaTime = currentTime - time;
  time = currentTime;
  moveCar(deltaTime);
  moveCamera();
  controls.update();
  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
