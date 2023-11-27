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

const canvas = document.querySelector('canvas');
const renderer = new Renderer(canvas);
await renderer.initialize();

const gltfLoader = new GLTFLoader();
await gltfLoader.load('common/models/kitchen.gltf');

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);

const camera = scene.find(node => node.getComponentOfType(Camera));
/*camera.addComponent(new OrbitController(camera, document.body, {
    distance: 8,
}));*/

const model = scene.find(node => node.getComponentOfType(Model));
const chef =  gltfLoader.loadNode("Chef");
/* model.addComponent(new RotateAnimator(model, {
    startRotation: [0, 0, 0, 1],
    endRotation: [0.7071, 0, 0.7071, 0],
    duration: 5,
    loop: true,
})); */

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
const chefSpeed = 1;
chef.addComponent(new LinearAnimator(chef, {
    startPosition: [0, 0, 1],
    endPosition: [...chefPosition],
    duration: 0.1,
    loop: false,
}));

// listening for keydown event (chef movement)
document.addEventListener('keydown', handleKeyDown);
function handleKeyDown(event) {
    console.log(event.key);
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
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
