import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

/**
 * 1. This lesson covers mixing HTML and webGL. For example, adding points of interest to a model.
 * 2. Add a label and nested text to the html. This is ALL CSS. Read up on CSS if you wanna learn the first half of this lesson.
 * 3. Don't put transitions on the (hover) :events in CSS. The transitions only activate on that event but not leaving the event.
 *    If you want transitions going both ways (on/off), add the transition to the class css properties instead.
 * 4. The reason why .point:hover events work on the text even though you put it on the point is because text is a div child of point.
 *    CSS classes inherit events. To fix this, put pointer-events: none in .point .text class.
 * 5. BTW, you can combine class labels to be more specific. 
 *    EX: .class1 .class2 {} will select elements that are children of class1 and have class2.
 *    .class1.class2 {} no space selects elements that have both class1 and class2.
 * 6. We want to hide the point when looking at the model from a certain angle. Use the visible property and scale transform.
 *    If the point is visible, transform the scale to (1, 1).
 * 7. We want the point to follow the model in 3D space. Gonna have to update the position in tick(). 
 *    How do we translate the 3D position to the screen 2D position? First, we need the position of the point in 3D (just position it where you want it).
 *    Clone the position, then Vector3.project(camera) it. This returns the x,y position of it on the camera.
 * 8. To actually hide the point when we can't see it, use a RayCaster. 
 *    If the ray hits nothing while trying to get to the point, then the point is visible.
 *    If the ray hits something, compare the distance of the point to the distance of the collision. If collision further than point, visible still.
 *    Otherwise, not visible.
 * 9. Set the raycaster to the camera by doing raycaster.setFromCamera(position, camera). You need the screen cords but this is done already using .project(camera)
 * 10. Test intersections by doing raycaster.intersectObjects(scene.children, true). True sets recursion
 * 11. Get the distance of the intersections. You already have the intersects & distance object from the previous step. Just do distanceTo to find the distance between vectors.
 *     point.position.distanceTo(camera.position)
 * 12. Hide the point before the scene is ready. You can do this by setting a ready var = false, setting it to true after load is done, then checking in tick() if it's true.
 * 13. REMEMBER: Html with WebGL performance sucks big time.
 */

/**
 * Loaders
 */
let sceneReady = false

const loadingBarElement = document.querySelector('.loading-bar')
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        // Wait a little
        window.setTimeout(() =>
        {
            // Animate overlay
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

            // Update loadingBarElement
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
        }, 500)

        window.setTimeout(() => {
            sceneReady = true
        }, 3000) 
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        // Calculate the progress and update the loadingBarElement
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
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
    // wireframe: true,
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
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
    '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(2.5, 2.5, 2.5)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)

/**
 * Points of Interest
 */
const rayCaster = new THREE.Raycaster()
const points = [
    {
        position: new THREE.Vector3(1.55, 0.3, -0.6),
        element: document.querySelector('.point-0')
    }
    // {
    //     position: new THREE.Vector3(0.5, 0.8, -1.6),
    //     element: document.querySelector('.point-1')
    // },
    // {
    //     position: new THREE.Vector3(1.6, -1.3, -0.7),
    //     element: document.querySelector('.point-2')
    // }
]

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

    // Go through each point
    if (sceneReady) {
        for (const point of points) {
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            rayCaster.setFromCamera(screenPosition, camera)
            const intersects = rayCaster.intersectObjects(scene.children, true)

            if (intersects.length === 0)
                point.element.classList.add('visible')
            else {
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)

                if (intersectionDistance < pointDistance)
                    point.element.classList.remove('visible')
                else   
                    point.element.classList.add('visible')
            }

            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = -screenPosition.y * sizes.height * 0.5
            
            point.element.style.transform = `translate(${translateX}px, ${translateY}px)`
        }
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()