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
gltfLoader.loadNode("kitchencounter_straight_B.004").isStatic = true;
gltfLoader.loadNode("kitchentable_B_large").isStatic = true;
gltfLoader.loadNode("wall_half").isStatic = true;
gltfLoader.loadNode("wall_half.001").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.005").isStatic = true;
gltfLoader.loadNode("kitchentable_B_large.001").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.006").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.007").isStatic = true;
gltfLoader.loadNode("kitchencounter_straight_B.008").isStatic = true;

const stove1 = gltfLoader.loadNode("stove_single");
stove1.isStatic = true;
const stove2 = gltfLoader.loadNode("stove_single.001");
stove2.isStatic = true;
const blender = gltfLoader.loadNode("Blender");
blender.isStatic = true;
const window = gltfLoader.loadNode("wall_orderwindow");
window.isStatic = true;
const trash = gltfLoader.loadNode("Trash");
trash.isStatic = true;

const scene = gltfLoader.loadScene(gltfLoader.defaultScene);

// camera
const camera = scene.find(node => node.getComponentOfType(Camera));
camera.isDynamic = true;
camera.aabb = {
    min: [-1, -1, -1],
    max: [1, 1, 1],
}

// chefs
const chefs = [];

// Add the initial chef
const chef = gltfLoader.loadNode("Chef");
scene.addChild(chef);
chefs.push(chef);
let chefPosition = [0, 0, 0];
chef.isDynamic = true;
chef.aabb = {
    min: [-1, -1, -1],
    max: [1, 1, 1],
};
chef.addComponent(new LinearAnimator(chef, {
    startPosition: [0, 0, 0],
    endPosition: [...chefPosition],
    duration: 0,
    loop: false,
}));
const chefSpeed = 0.5

// adding a variable for the current chef
let currentChef = chef;

// Add the other chefs
for (let i = 1; i < 4; i++) {
    let newChef = gltfLoader.loadNode("Chef.00" + i);
    chefs.push(newChef);

    // Set initial positions for other chefs
    const newPosition = [0, -5, 0];
    
    newChef.isDynamic = true;
    newChef.aabb = {
        min: [-1, -1, -1],
        max: [1, 1, 1],
    };

    newChef.addComponent(new LinearAnimator(newChef, {
        startPosition: [0, -5, 0],
        endPosition: [...newPosition],
        duration: 0,
        loop: false,
    }));
}

// array that stores the rats
const rats = [];

// array that stores dead rats
const deadRats = [];

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
        duration: 0,
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
    // check if there are no rats left
    if (rats.length === 0) {
        return;
    }

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

// array that stores if the utensils are free or not
const isStoveFree = [true, true];
const isBlenderFree = [true];

// timers for the utensils in order: stove 1, stove 2, blender
const timers = [0, 0, 0];

// listening for keydown event (chef movement)
document.addEventListener('keydown', handleKeyDown);
function handleKeyDown(event) {
    // checking if the event was to kill a rat (space)
    if (event.key === ' ') {

        // check if the chef is near the trash
        const nearTrash = checkIfNearTrash();
        if (nearTrash && (currentChef === chefs[1] || currentChef === chefs[2] || currentChef === chefs[3])) {
            // hide the current chef below the floor
            currentChef.getComponentOfType(LinearAnimator).endPosition = [0, -5, 0];
            currentChef.getComponentOfType(LinearAnimator).updateNode(0);

            // change the chef model to the one with no rat
            currentChef = chefs[0];

            // change the chef[1] model to the position of the current chef
            currentChef.getComponentOfType(Transform).translation = [...chefPosition];
            return;
        }

        // checking if this is chef[0], then we can kill a rat
        if (currentChef === chefs[0]) {

            // if we are near the stove 1, we retrieve the rat from the stove
            const nearStove1 = checkIfNearStove1();
            if (nearStove1 && !isStoveFree[0] && timers[0] >= 5) {
                // set the stove to be free
                isStoveFree[0] = true;

                // hide the current chef below the floor
                currentChef.getComponentOfType(LinearAnimator).endPosition = [0, -5, 0];
                currentChef.getComponentOfType(LinearAnimator).updateNode(0);

                // change the chef model to the one with the rat steak
                currentChef = chefs[3];

                // change the chefs[3] model to the position of the current chef
                currentChef.getComponentOfType(Transform).translation = [...chefPosition];
                return;
            }

            // if we are near the stove 2, we retrieve the rat from the stove
            const nearStove2 = checkIfNearStove2();
            if (nearStove2 && !isStoveFree[1] && timers[1] >= 5) {
                // set the stove to be free
                isStoveFree[1] = true;

                // hide the current chef below the floor
                currentChef.getComponentOfType(LinearAnimator).endPosition = [0, -5, 0];
                currentChef.getComponentOfType(LinearAnimator).updateNode(0);

                // change the chef model to the one with the rat steak
                currentChef = chefs[3];

                // change the chef[2] model to the position of the current chef
                currentChef.getComponentOfType(Transform).translation = [...chefPosition];
                return;
            }

            // if we are near the blender, we retrieve the rat from the blender
            const nearBlender = checkIfNearBlender();
            if (nearBlender && !isBlenderFree[0] && timers[2] >= 5) {
                // set the blender to be free
                isBlenderFree[0] = true;

                // hide the current chef below the floor
                currentChef.getComponentOfType(LinearAnimator).endPosition = [0, -5, 0];
                currentChef.getComponentOfType(LinearAnimator).updateNode(0);

                // change the chef model to the one with the rat wine
                currentChef = chefs[2];

                // change the chef[2] model to the position of the current chef
                currentChef.getComponentOfType(Transform).translation = [...chefPosition];
                return;
            }

            // check if the chef is near a rat
            const rat = checkIfNearRat();
            if (rat != null) {
                // remove the rat from the scene and from the rats array
                scene.removeChild(rat);
                rats.splice(rats.indexOf(rat), 1);
                deadRats.push(rat);

                // hide the current chef below the floor
                currentChef.getComponentOfType(LinearAnimator).endPosition = [0, -5, 0];
                currentChef.getComponentOfType(LinearAnimator).updateNode(0);

                // change the chef model to the one with the dead rat
                currentChef = chefs[1];

                // change the chef[1] model to the position of the current chef
                currentChef.getComponentOfType(Transform).translation = [...chefPosition];
            }
        }

        // if this is chef[1], then we can cook the rat and change the model to chef[0]
        else if (currentChef === chefs[1]) {
            // check if the chef is close to the stove 1 and if the stove is free
            const nearStove1 = checkIfNearStove1();
            if (nearStove1 && isStoveFree[0]) {
                // set the stove to be occupied
                isStoveFree[0] = false;
                
                // start the timer for the stove
                timers[0] = 0;

                // hide the current chef below the floor
                currentChef.getComponentOfType(LinearAnimator).endPosition = [0, -5, 0];
                currentChef.getComponentOfType(LinearAnimator).updateNode(0);

                // change the chef model to the one with no rat
                currentChef = chefs[0];

                // change the chef[1] model to the position of the current chef
                currentChef.getComponentOfType(Transform).translation = [...chefPosition];
            }

            // check if the chef is close to the stove 2
            const nearStove2 = checkIfNearStove2();
            if (nearStove2 && isStoveFree[1]) {
                // set the stove to be occupied
                isStoveFree[1] = false;

                // start the timer for the stove
                timers[1] = 0;

                // hide the current chef below the floor
                currentChef.getComponentOfType(LinearAnimator).endPosition = [0, -5, 0];
                currentChef.getComponentOfType(LinearAnimator).updateNode(0);

                // change the chef model to the one with no rat
                currentChef = chefs[0];

                // change the chef[1] model to the position of the current chef
                currentChef.getComponentOfType(Transform).translation = [...chefPosition];
            }

            // check if the chef is close to the blender
            const nearBlender = checkIfNearBlender();
            if (nearBlender && isBlenderFree[0]) {
                // set the blender
                isBlenderFree[0] = false;

                // start the timer for the stove
                timers[2] = 0;

                // hide the current chef below the floor
                currentChef.getComponentOfType(LinearAnimator).endPosition = [0, -5, 0];
                currentChef.getComponentOfType(LinearAnimator).updateNode(0);

                // change the chef model to the one with no rat
                currentChef = chefs[0];

                // change the chef[1] model to the position of the current chef
                currentChef.getComponentOfType(Transform).translation = [...chefPosition];
            }
        }

        // if this is chef[2] or chef[3], we have to deliver the food to the window
        else if (currentChef === chefs[2] || currentChef === chefs[3]) {
            // check if the chef is close to the window
            const nearWindow = checkIfNearWindow();

            // check if close to the 
            if (nearWindow) {
                // hide the current chef below the floor
                currentChef.getComponentOfType(LinearAnimator).endPosition = [0, -5, 0];
                currentChef.getComponentOfType(LinearAnimator).updateNode(0);

                // change the chef model to the one with no rat
                currentChef = chefs[0];

                // change the chef[0] model to the position of the current chef
                currentChef.getComponentOfType(Transform).translation = [...chefPosition];
            }

        }

    } else {
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
}

// function for checking if the chef is near a rat
function checkIfNearRat() {
    if (rats.length === 0) {
        return null;
    }
    const chefAABB = physics.getTransformedAABB(currentChef);
    for (const rat of rats) {
        const ratAABB = physics.getTransformedAABB(rat);
        if (physics.aabbIntersection(chefAABB, ratAABB)) {
            return rat;
        }
    }
    return null;
}

function checkIfNearStove1() {
    const chefAABB = physics.getTransformedAABB(currentChef);
    const stoveAABB = physics.getTransformedAABB(stove1);
    if (physics.aabbIntersection(chefAABB, stoveAABB)) {
        return true;
    }
    return false;
}

function checkIfNearStove2() {
    const chefAABB = physics.getTransformedAABB(currentChef);
    const stoveAABB = physics.getTransformedAABB(stove2);
    if (physics.aabbIntersection(chefAABB, stoveAABB)) {
        return true;
    }
    return false;
}

function checkIfNearBlender() {
    const chefAABB = physics.getTransformedAABB(currentChef);
    const blenderAABB = physics.getTransformedAABB(blender);
    if (physics.aabbIntersection(chefAABB, blenderAABB)) {
        return true;
    }
    return false;
}

function checkIfNearWindow() {
    const chefAABB = physics.getTransformedAABB(currentChef);
    const windowAABB = physics.getTransformedAABB(window);
    if (physics.aabbIntersection(chefAABB, windowAABB)) {
        return true;
    }
    return false;
}

function checkIfNearTrash() {
    const chefAABB = physics.getTransformedAABB(currentChef);
    const trashAABB = physics.getTransformedAABB(trash);
    if (physics.aabbIntersection(chefAABB, trashAABB)) {
        return true;
    }
    return false;
}

// function for spawning a new rat
function spawnRat() {
    // if all rats are alive, return
    if (deadRats.length === 0) {
        return;
    }

    // take the first rat from the deadRats array
    const respawnRat = deadRats.shift();

    // set its position, under the fridge
    const respawnRatTransform = respawnRat.getComponentOfType(Transform);
    const respawnRatAnimator = respawnRat.getComponentOfType(LinearAnimator);
    respawnRatTransform.translation = [
        6,
        0,
        -3.5,
    ];
    respawnRatAnimator.startPosition = [...respawnRatTransform.translation];
    respawnRatAnimator.endPosition = [...respawnRatTransform.translation];

    // add it to the scene and to the rats array
    scene.addChild(respawnRat);
    rats.push(respawnRat);
}

// function for updating the utensil timers
function updateUtensils(time, dt) {
    // check if stove 1 is occupied
    if (!isStoveFree[0]) {
        // update the timer
        timers[0] += dt;
    }

    if (!isStoveFree[1]) {
        // update the timer
        timers[1] += dt;
    }

    if (!isBlenderFree[0]) {
        // update the timer
        timers[2] += dt;
    }
}

function update(time, dt) {
    scene.traverse(node => {
        for (const component of node.components) {
            component.update?.(time, dt);
        }
    });
    
    // updating chef's position
    currentChef.components.forEach(component => {
        component.endPosition = [...chefPosition];
        component.update?.(time, dt);
    });

    // updating rats' positions
    updateRats(time, dt);

    // updating physics
    physics.update(time, dt);

    // if 5 seconds have passed, spawn a new rat
    if (deadRats.length > 2) {
        spawnRat();
    }

    // updating the timer for the stove
    updateUtensils(time, dt);
}

function render() {
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
