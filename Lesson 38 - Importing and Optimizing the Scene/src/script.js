import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * 1. This lesson covers adding the previous lesson's model to ThreeJS and optimizing it.
 * 2. Add model to scene, load texture, add texture to material.
 * 3. The texture might look incorrect so you may have to flip the texture on the Y coordinates (set to false). Set encoding on texture and renderer to sRGB.
 * 4. Fixing the emission objects: The lamp and portal will have the texture map on them. Need to select the correct objects to apply material. 
 *    Use .find() on array to apply materials instead of traverse. You can use regex to pick specific objects. Set the material on objects to a basic material with your color.
 * 5. For the portal, it's gonna be a shader. Just use a temp basic material for now.
 * 6. SpectorJS to see the performance and draw calls of your scene. 
 *    Right now, it's about 173 draw calls since each rock, stone, log is being drawn separately. We should batch this all into one geometry.
 * 7. Go into blender, dupe everything besides the emissions, put those into a new collection, then merge them (ctrl J). Blender also does multiple materials for a single object as well (like multi materials for one avatar)
 * 8. You can also remove the materials from the merged object but it's up to you. If you need to rebake, you still got the original scene. If you want multi materials, check export materials.
 * 9. Now we're at 16 draw calls. Remember to export those emissions as part of the model.
 * 10. Since we're now at 1 object for the entire scene, we can now do .find() to get the one object instead of traversing.
 */

/**
 * Spector JS
 */
const SPECTOR = require('spectorjs')
const spector = new SPECTOR.Spector()
spector.displayUI()

/**
 * Base
 */
// Debug
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xCEA859 })
const portalLightMaterial = new THREE.MeshBasicMaterial({ color: 0x5F73FF })

/**
 * Model
 */
gltfLoader.load('portal.glb', (gltf) => {
    // gltf.scene.traverse((child) => {
    //     console.log(child)
    //     child.material = bakedMaterial
    // })
    const bakedMesh = gltf.scene.children.find((child) => {
        return child.name === 'Plane003'
    })
    const poleLightAMesh = gltf.scene.children.find((child) => {
        return child.name === 'poleLightA'
    })
    const poleLightBMesh = gltf.scene.children.find((child) => {
        return child.name === 'poleLightB'
    })
    const portalLightMesh = gltf.scene.children.find((child) => {
        return child.name === 'portalLight'
    })
    poleLightAMesh.material = poleLightMaterial
    poleLightBMesh.material = poleLightMaterial
    portalLightMesh.material = portalLightMaterial
    bakedMesh.material = bakedMaterial
    scene.add(gltf.scene)
})

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()