import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Mesh } from 'three'
import { gsap } from 'gsap'

/**
 * 1. This lesson covers loading screen and intro. Setup is the flight helmet.
 * 2. We want a black overlay that fades out when loading is finished. Couple of ways to do this: animate canvas in CSS, animate a div on top of the canvas
 *    The way we're going to do it is animate a black rectangle in front of the camera.
 *    We can put a plane in the scene and position it using a vertex shader.
 * 3. How do we get the plane to always face the camera? Remove the projection matrix and modelView matrix in the gl_position calculation
 * 4. Now we need the plane to fill the entire camera. Just double the size since size 1 only covers half the screen.
 * 5. Animate the alpha using uniforms. Remember to set transparent: true in the material.
 * 6. We need to know when everything is loaded. Assets are environment map, model geometry, textures. Loaders are GLTFLoader and CubeTextureLoader.
 *    The loaders can take LoadingManager as a parameter. Need to listen to events on the LoadingManager and trigger callbacks. Now when loaded event is triggered, animate the overlay uniform.
 *    You can use GSAP library to do animation for the uniform.
 * 7. Loading bar in HTML: First we need to simulate bad internet cause this is a local server. Check disable cache in Network dev tools, use Wifi throttling (30mbps).
 *    You could do a small plane with a frag shader but we're gonna use HTML. Add a div class below the canvas for the loading bar and add the css.
 *    Add a transform: scaleX() and transform-origin: top left to animate the loading bar.
 * 8. The progress callback in loading manager can have 3 arguments: URL of asset, number of assets loaded, total number of assets to load
 * 9. Grab the loading bar from the document using querySelector('.loading-bar'). Set the style of the loading bar to the ratio of loaded:total by using backticks.
 *    To insert variables into style, use ${var} so style.transform = `scaleX(${progressRatio})`
 * 10. To smooth the animation, you can add transition: transform 0.5s; Can be a little buggy sometimes if your computer sucks
 * 11. To get rid of the loading bar after loading is done, make a new combined class .loading-bar .ended in the CSS and add a bunch of animations/scaleX(0)
 * 12. To add the new class, element.classList.add('ended'). Btw, Javascript overrides CSS so if you have JS modifying a CSS style, JS always wins.
 *     So, set the element.style.transform = '' to an empty string to override the previous JS
 * 13. When animating an element, add will-change: transform to the CSS
 * 14. If you loading bar looks like it's jumping/skipping frames, that's cause it is. Loading the mesh takes GPU time and frames. The bar basically skips its 0.5s animation.
 *     To fix this, add a wait/setTimeout or gsap.delayedCall(0.5, () => callback function). 500 ms is a good bet
 * 15. Mixing HTML and WebGL is bad. Stick to Three.JS and create the loading bar using a plane
 */

/**
 * Loaders
 */
const loadingBar = document.querySelector('.loading-bar')

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        window.setTimeout(() => {
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
            loadingBar.classList.add('ended')
            loadingBar.style.transform = ''
        }, 1000)
        
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal
        loadingBar.style.transform = `scaleX(${progressRatio})`
    }
)
const gltfLoader = new GLTFLoader(loadingManager)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

/**
 * Base
 */
// Debug
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;

        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})
const overlay = new Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)


/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])

environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

debugObject.envMapIntensity = 2.5

/**
 * Models
 */
gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(10, 10, 10)
        gltf.scene.position.set(0, - 4, 0)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, - 2.25)
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
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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