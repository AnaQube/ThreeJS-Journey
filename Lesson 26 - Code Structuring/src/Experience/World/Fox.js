import Experience from "../Experience";
import * as THREE from 'three'

/**
 * Fox model. Gltf contains all things (animation, scene, etc)
 */
export default class Fox {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Add debug folder 'Fox' in the debug UI, lets you switch animations
        if (this.debug.active) {
            const debugObject = {
                playIdle: () => { this.animation.play('idle')},
                playWalking: () => { this.animation.play('walking') },
                playRunning: () => { this.animation.play('running') }
            }
            this.debugFolder = this.debug.ui.addFolder('fox')
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playWalking')
            this.debugFolder.add(debugObject, 'playRunning')
        }

        this.gltf = this.resources.items.foxModel
        this.model = this.gltf.scene
        this.model.scale.set(0.02, 0.02, 0.02)
        this.scene.add(this.model)

        // cast shadow on all meshes in the model
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh)
                child.castShadow = true
        })

        // Make the animation mixer and load the action
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        this.animation.actions = {}
        this.animation.actions.idle = this.animation.mixer.clipAction(this.gltf.animations[0])
        this.animation.actions.walking = this.animation.mixer.clipAction(this.gltf.animations[1])
        this.animation.actions.running = this.animation.mixer.clipAction(this.gltf.animations[2])

        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Crossfade from current action to new action
        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current
            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 1)
            this.animation.actions.current = newAction
        }
    }
    // Update animation mixer every frame from time class stored in Experience
    // * 0.001 cause GLTF animation time is different
    update() {
        this.animation.mixer.update(this.time.delta * 0.001)
    }
}