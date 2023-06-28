import * as THREE from "three";
import fitty from "fitty";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import { degToRad } from "three/src/math/MathUtils";
import Zdog from "zdog";

const BODY_STYLE = getComputedStyle(document.body);
const COLORS = {
  bg: BODY_STYLE.getPropertyValue("--bg"),
  fg: BODY_STYLE.getPropertyValue("--text"),
};

const body = document.getElementsByTagName("body")[0];
const elem = document.documentElement;

// Number of cards
const numCards = 10;

// Distance between each card
const distance = 600;

// Width of each card
const cardWidth = 320;

let targetRotation = 0;
let targetRotationOnPointerDown = 0;

let pointerX = 0;
let pointerXOnPointerDown = 0;

let smiley;
let smileyX = 0;
let smileyY = 0;

let windowHalfX = window.innerWidth / 2;

// Function to calculate the position of each card
function calculateCardPosition(radius, index) {
  const angle = (2 * Math.PI * index) / numCards;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return { x, z };
}

// Function to create a card element
function createCardElement(index) {
  const element = document.createElement("a");

  element.classList.add("website-card");
  element.setAttribute("index", index);
  element.setAttribute(":href", `students[${index}].website`);
  element.setAttribute("target", "_blank");
  element.innerHTML = `
    <img draggable="false" class="w-full h-auto bg-[var(--fg)]" :src="'https://image.thum.io/get/maxAge/1/width/600/crop/800/' + students[${index}].website" width="600" height="400">
    <div class="px-2 py-1">
      <h2 x-text="students[${index}].name + ' ' + students[${index}].surname"></h2>
    </div>
  `;
  return element;
}

// Create the scene
const scene = new THREE.Scene();

// Create the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  5000
);
camera.position.set(0, 0, 1000);

// Create the renderer
const renderer = new CSS3DRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "absolute";
const container = document.getElementById("container");
container.appendChild(renderer.domElement);

container.addEventListener("pointerdown", onPointerDown);

// Create the card group
const cardGroup = new THREE.Group();
scene.add(cardGroup);

// Add cards to the scene
for (let i = 0; i < numCards; i++) {
  const cardElement = createCardElement(i);
  const cardObject = new CSS3DObject(cardElement);

  // Calculate the position of the card in a circle
  const position = calculateCardPosition(distance, i);

  // Position the card in 3D space
  cardObject.position.set(position.x, 0, position.z);
  // Rotate the card to face the camera
  cardObject.lookAt(camera.position);

  // Add the card to the group
  cardGroup.add(cardObject);
}

const smileyElement = document.createElement("canvas");
smileyElement.className =
  "rounded-full zdog-canvas shadow-2xl shadow-[var(--fg)]";
smileyElement.width = 700;
smileyElement.height = 700;
const smileyObject = new CSS3DObject(smileyElement);
smileyObject.position.y = 100;
scene.add(smileyObject);

function createSmiley() {
  smiley = new Zdog.Illustration({
    element: ".zdog-canvas",
    zoom: 6,
  });

  let occhi = new Zdog.Group({
    addTo: smiley,
    translate: { y: -18, x: -16, z: 40 },
    rotate: { x: -Zdog.TAU / 2.2 },
  });

  // . - Creiamo un occhio
  let occhio = new Zdog.Ellipse({
    addTo: occhi,
    width: 8,
    height: 26,
    stroke: 5,
    color: COLORS.fg,
    fill: true,
  });

  // : - Duplichiamo l'occhio
  occhi.copyGraph({
    translate: { y: -18, x: 16, z: 40 },
  });

  // :) - Creiamo la bocca
  let bocca = new Zdog.Shape({
    addTo: smiley,
    path: [
      { x: -35, y: 20 },
      {
        bezier: [
          { x: -18, y: 48 },
          { x: 18, y: 48 },
          { x: 35, y: 20 },
        ],
      },
    ],
    closed: false,
    stroke: 7,
    color: COLORS.fg,
    translate: { y: -2, z: 40 },
  });

  // Aggiungiamo la famosa rughetta
  let ruga = new Zdog.Shape({
    addTo: bocca,
    path: [
      { x: 0, y: 0 },
      {
        arc: [
          { x: 6, y: -5 },
          { x: 12, y: 0 },
        ],
      },
    ],
    translate: { x: -40.5, y: 23 },
    rotate: { z: -Zdog.TAU / 13 },
    stroke: 6,
    closed: false,
    color: COLORS.fg,
  });

  // Duplichiamo la ruga anche di là
  ruga.copyGraph({
    translate: { x: 29, y: 18 },
    rotate: { z: Zdog.TAU / 12 },
  });

  let faccia = new Zdog.Shape({
    addTo: smiley,
    stroke: 120,
    color: COLORS.bg,
  });
}

// Function to find the card currently in the center of the screen
function findCenterCard() {
  const center = new THREE.Vector2(
    window.innerWidth / 2,
    window.innerHeight / 2
  );
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  mouse.x = (center.x / window.innerWidth) * 2 - 1;
  mouse.y = -(center.y / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(cardGroup.children);
  if (intersects.length > 0) {
    const centerCard = intersects[0].object;
    return centerCard;
  } else {
    return null;
  }
}

// Animate the rotation of the card group
function animate() {
  requestAnimationFrame(animate);

  // Rotate the card to face the camera
  cardGroup.children.forEach((card) => {
    const target = new THREE.Vector3(0, -200, camera.position.z);
    card.lookAt(target);
  });

  cardGroup.rotation.x = degToRad(18);
  cardGroup.rotation.y += (targetRotation - cardGroup.rotation.y) * 0.05;

  // Render the scene
  renderer.render(scene, camera);

  if (smiley) {
    smiley.rotate.x = smileyX;
    smiley.rotate.y = smileyY;
    smiley.updateRenderGraph();
  }

  var centerCard = findCenterCard();
  if (centerCard) {
    // console.log("Center card:", centerCard);
  } else {
    // console.log("No center card");
  }

  // Find the center card
  findCenterCard();
}

function onPointerDown(event) {
  console.log(event.type);
  if (event.isPrimary === false) return;

  pointerXOnPointerDown = event.clientX - windowHalfX;
  targetRotationOnPointerDown = targetRotation;

  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
}

function onPointerMove(event) {
  console.log(event.type);

  if (event.isPrimary === false) return;

  pointerX = event.clientX - windowHalfX;

  targetRotation =
    targetRotationOnPointerDown + (pointerX - pointerXOnPointerDown) * 0.002;
}

function onPointerUp(event) {
  console.log(event.type);

  if (event.isPrimary === false) return;

  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", onPointerUp);
}

function follow(event) {
  let windowWidth = window.innerWidth || elem.clientWidth || body.clientWidth;
  let windowHeight =
    window.innerHeight || elem.clientHeight || body.clientHeight;

  let touch =
    (event.touches && event.touches[0]) ||
    (event.pointerType && event.pointerType === "touch" && event);
  let clientX = (touch || event).clientX;
  let clientY = (touch || event).clientY;

  let limit = 0.35;
  let x = Math.cos((Math.PI * clientY) / windowHeight) * limit;
  let y = Math.cos((Math.PI * clientX) / windowWidth) * limit;

  smileyX = x;
  smileyY = y;
}

document.addEventListener("mousemove", follow);
document.addEventListener("touchmove", follow);

function handleResize(event) {
  console.log("resized");
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  windowHalfX = window.innerWidth / 2;
}

window.addEventListener("resize", handleResize);

// Start the animation
animate();
createSmiley();

document.addEventListener("DOMContentLoaded", function () {
  fitty(".fit", {
    maxSize: 300,
  });
});
