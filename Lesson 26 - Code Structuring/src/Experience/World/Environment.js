import * as THREE from 'three'
import Experience from '../Experience'

/**
 * Sets up the environment lights and environment cube texture map
 */
export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('environment')
        }
        this.setSunLight()
        this.setEnvironmentMap()
    }
    // Sets up the directional light
    setSunLight() {
        this.sunLight = new THREE.DirectionalLight('#ffffff', 4)
        this.sunLight.castShadow = true
        this.sunLight.shadow.camera.far = 15
        this.sunLight.shadow.mapSize.set(1024, 1024)
        this.sunLight.shadow.normalBias = 0.05
        this.sunLight.position.set(3.5, 2, - 1.25)
        this.scene.add(this.sunLight)

        if (this.debug.active) {
            this.debugFolder.add(this.sunLight, 'intensity', 0, 10, 0.001).name('sunLightIntensity')
            this.debugFolder.add(this.sunLight.position, 'x', -5, 5, 0.001).name('sunLightx')
            this.debugFolder.add(this.sunLight.position, 'y', -5, 5, 0.001).name('sunLighty')
            this.debugFolder.add(this.sunLight.position, 'z', -5, 5, 0.001).name('sunLightz')
        }
    }

    // Creating the environment map object is just for debug purposes to edit in gui
    setEnvironmentMap() {
        this.environmentMap = {}
        this.environmentMap.intensity = 0.4
        this.environmentMap.texture = this.resources.items.environmentMapTexture
        this.environmentMap.texture.encoding = THREE.sRGBEncoding

        this.scene.environment = this.environmentMap.texture

        // Maybe environment gets loaded after mesh, so environment doesn't apply to materials
        // This will update the materials by traversing each mesh and updating the mats
        this.environmentMap.updateMaterial = () => {
            this.scene.traverse((child) => {
                if (child instanceof THREE.Mesh && (child.material instanceof THREE.MeshStandardMaterial)) {
                    child.material.envMap = this.environmentMap.texture
                    child.material.envMapIntensity = this.environmentMap.intensity
                    child.material.needsUpdate = true
                }
            })
        }
        this.environmentMap.updateMaterial()

        // Debug
        if (this.debug.active) {
            this.debugFolder.add(this.environmentMap, 'intensity', 0, 4, 0.001).name('envMapIntensity').onChange(this.environmentMap.updateMaterial)
        }
    }
}