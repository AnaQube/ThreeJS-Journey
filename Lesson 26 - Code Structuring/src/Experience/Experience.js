import Sizes from "./Utils/Sizes"
import Time from "./Utils/Time"
import * as THREE from 'three'
import Camera from "./Camera"
import Renderer from "./Renderer"
import World from "./World/World"
import Resources from "./Utils/Resources"
import sources from './sources'
import Debug from "./Utils/Debug"

/**
 * Kinda like the main/driver class where it brings all the util functions together
 * Listens to events from each class and acts upon those
 */
let instance = null

export default class Experience {
    constructor(canvas) {
        if (instance)
            return instance
        instance = this

        this.debug = new Debug()
        this.canvas = canvas

        this.sizes = new Sizes()
        this.sizes.on('resize', () => {
            this.resize()
        })

        this.time = new Time()
        this.time.on('tick', () => {
            this.update()
        })

        this.resources = new Resources(sources)
        this.scene = new THREE.Scene()
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()
        
    }
    // Update on resize (updates camera aspect)
    resize() {
        this.camera.resize()
        this.renderer.resize()
    }
    // Update each frame: Camera controls
    update() {
        this.camera.update()
        this.world.update()
        this.renderer.update()
    }
    // Dispose of events, scene
    destroy() {
        // Dispose of events
        this.sizes.off('resize')
        this.time.off('tick')

        // Scan scene to dispose of stuff, theres a doc page for how to do this
        this.scenetraverse((child) => {
            // Dispose of mesh
            if (child instanceof THREE.Mesh) {
                // Dispose of geometry
                child.geometry.dispose()
                
                // for every key,value pair in material, check if the value has a dispose function
                // if so, dispose of it. Kinda sucks
                for (const key in child.material) {
                    const value = child.material[key]

                    if (value && typeof value.dispose === 'function')
                        value.dispose()
                }
            }
        })
        // Dispose of camera controls
        this.camera.controls.dispose()
        // Dispose of renderer
        this.renderer.instance.dispose()
        // Dispose of debug
        if (this.debug.active)
            this.debug.ui.destroy
    }
}