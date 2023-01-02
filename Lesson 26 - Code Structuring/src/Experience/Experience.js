import Sizes from "./Utils/Sizes"
import Time from "./Utils/Time"
import * as THREE from 'three'
import Camera from "./Camera"
import Renderer from "./Renderer"

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

        this.canvas = canvas

        this.sizes = new Sizes()
        this.sizes.on('resize', () => {
            this.resize()
        })

        this.time = new Time()
        this.time.on('tick', () => {
            this.update()
        })

        this.scene = new THREE.Scene()
        this.camera = new Camera()
        this.renderer = new Renderer()
    }
    // Update on resize (updates camera aspect)
    resize() {
        this.camera.resize()
        this.renderer.resize()
    }
    // Update each frame: Camera controls
    update() {
        this.camera.update()
        this.renderer.update()
    }
}