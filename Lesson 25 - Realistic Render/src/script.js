import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { generateUUID } from 'three/src/math/mathutils'

/**
 * 1. ThreeJS light intensities are kinda arbitrary. If you want to use physically correct lights, do renderer.physicallyCorrectLights = true
 * 2. You can use the environment map (cubemap) for lighting. To do this, you need to update all the materials in the scene.
 *    Do scene.traverse(function()) to traverse all children in the scene. Use instanceof to target Mesh and MeshStandardMaterial
 *    Then, set child.material.envMap to the environment map texture.
 * 3. The easy way is to set scene.environment to the environment Map
 * 4. Change renderer encoding to sRGBEncoding. sRGB "squishes" the color gradient in a sense. 
 *    It's like an exponential curve where colors with more perceivable difference are given more of the gradient to work with.
 *    GammaEncoding also includes brightness. sRGB uses 2.2 gamma.
 * 5. You SHOULD also set the encoding on color textures to sRGB Textures (environment map, etc...). GLTFLoader will implement the correct encoding on models automatically.
 * 6. Encoding for non-COLOR textures should ALWAYS be LinearEncoding.
 * 7. Tone mapping - HDR lets colors go beyond "1" (white). Set the renderer.toneMapping and set the toneMappingExposure
 * 8. You can set a GUI select by providing an object after the string property
 * 9. Anti-aliasing has to do with the stair like effect on edges. Think rotating a square on a grid, those edges will be a stair.
 *    Supersampling multiplies the resolution to get more clarity on the edges and then averages out the "higher resolution pixels". Bad performance
 *    Multisampling (MSAA) multiplies the resolution ONLY on the geometry edges.
 * 10. Activate antialias = true in the WebGLRenderer CONSTRUCTOR
 * 11. Screens with pixel ration > 1 don't really need antialias.
 * 12. If you want to enable shadows, you'll have to set cast/receive shadow on each mesh
 * 13. "Shadow acne" occurs on smooth/round surfaces. It kinda looks like a cloth texture. It occurs because of the same reason anti alias occurs.
 *     The shadow camera can't decide ACCURATELY if the edge is inside or outside the mesh, so it will cast a shadow on itself, creating a divet.
 *     The way to fix this is to push the shadow detection "mesh" inside the mesh a little bit.
 * 14. Set the directionalLight.shadow.normalBias to something small 0.05~
 * 15. Set directionalLight.shadow.bias for FLAT SURFACES
 */

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh && (child.material instanceof THREE.MeshStandardMaterial)) {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}


/**
 * Environment Map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/3/px.jpg',
    '/textures/environmentMaps/3/nx.jpg',
    '/textures/environmentMaps/3/py.jpg',
    '/textures/environmentMaps/3/ny.jpg',
    '/textures/environmentMaps/3/pz.jpg',
    '/textures/environmentMaps/3/nz.jpg'
])
environmentMap.encoding = THREE.sRGBEncoding
scene.background = environmentMap
scene.environment = environmentMap

debugObject.envMapIntensity = 2.5
gui.add(debugObject, 'envMapIntensity', 0, 10, 0.001).onChange(updateAllMaterials)

/**
 * Models
 */
gltfLoader.load(
    '/models/hamburger.glb',
    (gltf) => {
        gltf.scene.scale.set(0.3, 0.3, 0.3)
        gltf.scene.position.set(0, -1, 0)
        gltf.scene.rotation.y = Math.PI
        scene.add(gltf.scene)

        gui.add(gltf.scene.rotation, 'y', -Math.PI, Math.PI, 0.001).name('rotation')
    
        updateAllMaterials()
    }
)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(0.25, 3, -2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
scene.add(directionalLight)

// const lightHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(lightHelper)

gui.add(directionalLight, 'intensity', 0, 10, 0.001).name('lightIntensity')
gui.add(directionalLight.position, 'x', -5, 5, 0.001).name('lightX')
gui.add(directionalLight.position, 'y', -5, 5, 0.001).name('lightY')
gui.add(directionalLight.position, 'z', -5, 5, 0.001).name('lightZ')

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
camera.position.set(4, 1, - 4)
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
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    ReinHard: THREE.ReinhardToneMapping,
    Cinenon: THREE.CineonToneMapping,
    ACES: THREE.ACESFilmicToneMapping
})
gui.add(renderer, 'toneMappingExposure', 0, 10, 0.001)
/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()