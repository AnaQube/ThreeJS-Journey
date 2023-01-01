import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/dracoloader'

/**
 * 1. You can import models externally as an asset. Right now, GLTF is popular for ThreeJS. GLTF supports geometries, materials (PBR supported), camera, light, a lot more...
 *    File format can be json, binary, etc...
 * 2. Every file format has its tradeoffs (size, decompress, weight, difficulty)
 * 3. GLTF contains information for the binary and textures by referencing the file names.
 * 4. GLTF-Binary is one file, lighter weight, easy to load, and hard to alter (can't change texture/color)
 * 5. GLTF-Draco is like the default but the buffer data is compressed using Draco algorithm. Lighter weight
 * 6. GLTF-Embedded is one file but in JSON. Heavier than all of them.
 * 7. If you want to be able to alter anything in the GLTF (camera, geometry, material, texture, light...) then default is the way, otherwise binary.
 * 8. Load the model using GLTFLoader() from ThreeJS. Import the class manually since it's not packed with the default.
 * 9. The gltf object it loads contains a lot of data nested. Go through it manually with console.log()
 * 10. There are a lot of ways to add a model to scene. Depending on how your GLTF is setup, you can add the scene, add the mesh only, filter out children, or just clean the model and import it.
 *     scene.add(gltf.scene.children[x])
 * 11. GLTFLoader subtracts from the children array whenever it loads a mesh. This means that the loader will not load all of the mesh when you use a for loop.
 *     The real fix is to just add the entire scene. To fix this, use a while loop over the length or duplicate the array to a regular Javascript array
 * 12. Draco needs a special DracoLoader imported. It can use web assembly which means it can run in threads. Copy the wasm/draco folder from node modules three and put it in the static folder.'
 *     Point your .setDecoderPath() to the draco folder '/draco/' in static assets. Set the gltfLoader.setDRACOLoader() to your DracoLoader
 * 13. When to use Draco: When Draco has a substantially lower file size compared to GLTF. You tradeoff CPU/loading time for file size.
 * 14. Not a good idea to scale children. Scale the scene instead when it's too big.
 * 15. Animations: ThreeJS animations are from the class AnimationClip. To play an animation, you need an AnimationMixer. Use .clipAction() to load it using the mixer then call .play() on the action var.
 *     Animations need to play on every frame.
 * 16. TLDR 4 parts to animation: Create mixer from THREE.AnimationMixer(scene), load clip from mixer.clipAction(animation), play() animation, update mixer in tick
 * 17. threejs.org/editor/ is an online 3d editor. You can drag and drop gltf files.
 */

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
let mixer = null

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        // scene.add(gltf.scene.children[0])
        // while (gltf.scene.children.length)
        //     scene.add(gltf.scene.children[0])

        // Create mixer, load action, and play the animation
        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[2])
        action.play()

        gltf.scene.scale.set(0.025, 0.025, 0.025)
        scene.add(gltf.scene)
    }
)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update mixer
    if (mixer !== null)
        mixer.update(deltaTime)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()