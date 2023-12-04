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

// camera
const camera = scene.find(node => node.getComponentOfType(Camera));
camera.isDynamic = true;
camera.aabb = {
    min: [-1, -1, -1],
    max: [1, 1, 1],
}

// chef
const chef =  gltfLoader.loadNode("Chef");
chef.isDynamic = true;
chef.aabb = {
    min: [-1, -1, -1],
    max: [1, 1, 1],
}
// chef's position
let chefPosition = [0, 0, 0];
// chef's movement speed
const chefSpeed = 0.5;
chef.addComponent(new LinearAnimator(chef, {
    startPosition: [0, 0, 0],
    endPosition: [...chefPosition],
    duration: 2,
    loop: false,
}));

// array that stores the rats
const rats = [];

// creating rats and adding them to the scene
for (let i = 0; i < 6; i++) {
    const newRat = gltfLoader.loadNode("Rat.00" + (i));
    newRat.isDynamic = true;

    // set initial position for each rat
    newRat.getComponentOfType(Transform).translation = [
        Math.random() * 10 - 5, // x position between -5 and 5
        0,
        Math.random() * 10 - 5, // z position between -5 and 5
    ];

    // add the rat to the scene
    scene.addChild(newRat);
    rats.push(newRat);

    newRat.aabb = {
        min: [-1, -1, -1],
        max: [1, 1, 1],
    }

    // add a linear animator to each rat
    newRat.addComponent(new LinearAnimator(newRat, {
        startPosition: newRat.getComponentOfType(Transform).translation,
        endPosition: newRat.getComponentOfType(Transform).translation,
        duration: 3,
        loop: false,
    }));

    // add a rotate animator to each rat
    newRat.addComponent(new RotateAnimator(newRat, {
        startRotation: [0, 0, 1, 0],
        endRotation: [0, 0, 1, 0],
        duration: 0,
        loop: false,
    }));
}

// function for updating the rats' positions
function updateRats(time, dt) {
    // randomly select an index from the rats array that will be updated
    const randomIndex = Math.floor(Math.random() * rats.length);
    const randomRat = rats[randomIndex];

    const ratTransform = randomRat.getComponentOfType(Transform);
    const ratAnimator = randomRat.getComponentOfType(LinearAnimator);
    const ratRotateAnimator = randomRat.getComponentOfType(RotateAnimator);

    // check if the rat is not currently moving
    if (time >= ratAnimator.startTime + ratAnimator.duration) {
        // set a new position only if the rat is not in motion
        const newPosition = [
            Math.random() * 10 - 5, // x position between -5 and 5
            0,
            Math.random() * 10 - 5, // z position between -5 and 5
        ];
        ratAnimator.startPosition = [...ratTransform.translation];
        ratAnimator.endPosition = newPosition;
        ratAnimator.startTime = time;
        ratAnimator.duration = 3;

        // angle between the rat's current position and the new position
        const angle = Math.atan2(newPosition[0] - ratTransform.translation[0], newPosition[2] - ratTransform.translation[2]);

        // set a new rotation only if the rat is not in motion
        const newRotation = [
            Math.sin((angle + Math.PI /2) / 2),
            0,
            Math.cos((angle + Math.PI /2) / 2),
            0,
        ];
        ratRotateAnimator.startRotation = [...ratTransform.rotation];
        ratRotateAnimator.endRotation = newRotation;
        ratRotateAnimator.startTime = time;
        ratRotateAnimator.duration = 0;

        // update the rat's position and rotation
        ratAnimator.updateNode(0);
        ratRotateAnimator.updateNode(0);
    } else {
        // if the rat is still moving, update its position and rotation based on the ongoing animation
        ratAnimator.update(time, dt);
        ratRotateAnimator.update(time, dt);
    }
}

// light
const light = new Node();
light.addComponent(new Transform({
    translation: [3, 5, 5],
}));
light.addComponent(new Light({
    ambient: 0.3,
}));
scene.addChild(light);

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

// listening for keydown event (chef movement)
document.addEventListener('keydown', handleKeyDown);
function handleKeyDown(event) {
    let newChefPosition = [...chefPosition];
    // updating chef's position
    switch (event.key) {
        case 'w':
        case 'W':
            newChefPosition[2] -= chefSpeed;
            break;
        case 'a':
        case 'A':
            newChefPosition[0] -= chefSpeed;
            break;
        case 's':
        case 'S':
            newChefPosition[2] += chefSpeed;
            break;
        case 'd':
        case 'D':
            newChefPosition[0] += chefSpeed;
            break;
    }

    // checking if chef's position is valid
    let validPosition = true;
    scene.traverse(node => {
        if (node.isStatic) {
            const aabb = physics.getTransformedAABB(node);
            if (physics.aabbIntersection({ min: newChefPosition, max: newChefPosition }, aabb)) {
                validPosition = false;
            }
        }
    });

    if (validPosition) {
        // checking if chef's position is out of bounds (bottom, where there is no wall)
        if (newChefPosition[2] < 6) {
            chefPosition = newChefPosition;
        }
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

    // updating rats' positions
    updateRats(time, dt);

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
