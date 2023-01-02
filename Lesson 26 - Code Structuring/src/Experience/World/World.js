import Experience from "../Experience";
import Environment from "./Environment";
import Floor from "./Floor";
import Fox from "./Fox";

/**
 * World file to consolidate all mesh objects. Listens for Resources ready event
 * Think of it as the driver for creating meshes
 */
export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        // Environment - since Environment class contains the update material to environment map
        // Create all meshes first before doing creating environment
        this.resources.on('ready', () => {
            this.floor = new Floor()
            this.fox = new Fox()
            this.environment = new Environment()
        })
    }
    update() {
        if (this.fox)
            this.fox.update()
    }
}