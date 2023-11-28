import { ResizeSystem } from './common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from './common/engine/systems/UpdateSystem.js';

import { GLTFLoader } from './common/engine/loaders/GLTFLoader.js';

import { OrbitController } from './common/engine/controllers/OrbitController.js';
import { RotateAnimator } from './common/engine/animators/RotateAnimator.js';
import { LinearAnimator } from './common/engine/animators/LinearAnimator.js';

import {
    Camera,
    Model,
    Node,
    Transform,
} from './common/engine/core.js';

import { Renderer } from './Renderer.js';
import { Light } from './Light.js';
import { Physics } from './common/engine/core/Physics.js';
import {
    calculateAxisAlignedBoundingBox,
    mergeAxisAlignedBoundingBoxes,
} from './common/engine/core/MeshUtils.js';

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load('common/models/kitchen.gltf');

// making the kitchen static
gltfLoader.loadNode("wall").isStatic = true;
gltfLoader.loadNode("wall_orderwindow").isStatic = true;
gltfLoader.loadNode("wall.001").isStatic = true;
gltfLoader.loadNode("wall.002").isStatic = true;
gltfLoader.loadNode("wall.003").isStatic = true;
gltfLoader.loadNode("wall.004").isStatic = true;
gltfLoader.loadNode("wall.006").isStatic = true;
gltfLoader.loadNode("wall.007").isStatic = true;
gltfLoader.loadNode("wall_window_closed").isStatic = true;
gltfLoader.loadNode("door_B").isStatic = true;
gltfLoader.loadNode("kitchencounter_sink").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.001").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.002").isStatic = true;
gltfLoader.loadNode("kitchencounter_innercorner").isStatic = true;
gltfLoader.loadNode("kitchencounter_innercorner").isStatic = true;
gltfLoader.loadNode("fridge_B_door").isStatic = true;
gltfLoader.loadNode("fridge_B").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.003").isStatic = true;
gltfLoader.loadNode("stove_single").isStatic = true;
gltfLoader.loadNode("stove_single.001").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.004").isStatic = true;
gltfLoader.loadNode("kitchentable_B_large").isStatic = true;
gltfLoader.loadNode("wall_half").isStatic = true;
gltfLoader.loadNode("wall_half.001").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.005").isStatic = true;
gltfLoader.loadNode("kitchentable_B_large.001").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.006").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.007").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.008").isStatic = true;
const scene = gltfLoader.loadScene(gltfLoader.defaultScene);

const camera = scene.find(node => node.getComponentOfType(Camera));
/*camera.addComponent(new OrbitController(camera, document.body, {
    distance: 8,
}));*/
camera.isDynamic = true;
camera.aabb = {
    min: [-1, -1, -1],
    max: [1, 1, 1],
}

//const model = scene.find(node => node.getComponentOfType(Model));
const chef =  gltfLoader.loadNode("Chef");
/* model.addComponent(new RotateAnimator(model, {
    startRotation: [0, 0, 0, 1],
    endRotation: [0.7071, 0, 0.7071, 0],
    duration: 5,
    loop: true,
})); */
// making chef static
chef.isDynamic = true;
chef.aabb = {
    min: [-1, -1, -1],
    max: [1, 1, 1],
}

const light = new Node();
light.addComponent(new Transform({
    translation: [3, 5, 5],
}));
light.addComponent(new Light({
    ambient: 0.3,
}));
/*light.addComponent(new LinearAnimator(light, {
    startPosition: [3, 3, 3],
    endPosition: [-3, -3, -3],
    duration: 1,
    loop: true,
}));*/
scene.addChild(light);

// chef's position
let chefPosition = [0, 0, 1];
// chef's movement speed
const chefSpeed = 0.5;
chef.addComponent(new LinearAnimator(chef, {
    startPosition: [0, 0, 1],
    endPosition: [...chefPosition],
    duration: 0.1,
    loop: false,
}));

// listening for keydown event (chef movement)
document.addEventListener('keydown', handleKeyDown);
function handleKeyDown(event) {
    // updating chef's position
    switch (event.key) {
        case 'w':
            chefPosition[2] -= chefSpeed;
            break;
        case 'a':
            chefPosition[0] -= chefSpeed;
            break;
        case 's':
            chefPosition[2] += chefSpeed;
            break;
        case 'd':
            chefPosition[0] += chefSpeed;
            break;
    }
}

// adding physics
const physics = new Physics(scene);
scene.traverse(node => {
    const model = node.getComponentOfType(Model);
    if (!model) {
        return;
    }
    const kitchenItem = model.primitives.map(primitive => calculateAxisAlignedBoundingBox(primitive.mesh));
    node.aabb = mergeAxisAlignedBoundingBoxes(kitchenItem);
});

function update(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });
    
    // updating chef's position
    chef.components.forEach(component => {
        component.endPosition = [...chefPosition];
        component.update?.(time, dt);
    });

    // updating physics
    physics.update(time, dt);
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
