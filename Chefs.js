import { LinearAnimator } from './common/engine/animators/LinearAnimator.js';

export class Chefs {
    constructor({
        // chefs is an array of chef nodes
        chefs = [],
        // currentChef is the chef that is currently selected
        currentChef = chefs[0],
        chefSpeed = 0.5,
        chefPosition = [0, 0, 0],
    } = {}) {
        this.chefs = chefs;
        this.currentChef = currentChef;
        this.chefSpeed = chefSpeed;
        this.chefPosition = chefPosition;
    };

    createChefs(gltfLoader, scene) {
        // Add the initial chef
        const chef = gltfLoader.loadNode("Chef");
        scene.addChild(chef);

        // add the chef to the chefs array
        this.chefs.push(chef);

        // Set chef to be dynamic
        chef.isDynamic = true;

        // Set chef's aabb
        chef.aabb = {
            min: [-1, -1, -1],
            max: [1, 1, 1],
        };

        // Add a linear animator to the chef
        chef.addComponent(new LinearAnimator(chef, {
            startPosition: [0, 0, 0],
            endPosition: [...this.chefPosition],
            duration: 0.01,
            loop: false,
        }));
    
        // adding a variable for the current chef
        this.currentChef = chef;
    
        // Add the other chefs
        for (let i = 1; i < 5; i++) {
            let newChef = gltfLoader.loadNode("Chef.00" + i);

            // Adding the chefs to the array
            this.chefs.push(newChef);
            
            // Dynamic & aabb
            newChef.isDynamic = true;
            newChef.aabb = {
                min: [-1, -1, -1],
                max: [1, 1, 1],
            };
    
            // Add a linear animator to the chef
            newChef.addComponent(new LinearAnimator(newChef, {
                startPosition: [0, -5, 0],
                endPosition: [0, -5, 0],
                duration: 0.01,
                loop: false,
            }));
        }
    }
}
