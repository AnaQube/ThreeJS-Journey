import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { SpotLightHelper } from 'three'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'

/**
 * 1. Ambient light is omni directional light. Basically just like a light that applies no matter what direction.
 * 2. Directional light is directional like the sun.
 * 3. Hemisphere Light emits two colors, one from the ground and one from the sky globally.
 * 4. Point Light emits light from a point in all directions. Has falloff and stuff like that.
 * 5. RectArea Light emits light from a customizable rectangle area. Has falloff and stuff. Can target it to look at something
 * 6. SpotLight emits light in a cone. It has a target that you can move around.
 * 7. Add Helpers to the scene to visualize the lights. You might need to import some helpers manually from the file.
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
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
gui.add(ambientLight, 'intensity', 0, 1, 0.001).name('Ambient Intesity')

const directionalLight = new THREE.DirectionalLight(0x00fffc, 0.3)
gui.addColor(directionalLight, 'color')
gui.add(directionalLight, 'intensity', 0, 1, 0.001).name('Directional Intensity')
gui.add(directionalLight.position, 'x', -5, 5)

const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 1)
gui.addColor(hemisphereLight, 'color').name('Hemisphere Color')
gui.addColor(hemisphereLight, 'groundColor')
gui.add(hemisphereLight, 'intensity', 0, 1, 0.001).name('hemisphere intensity')

const pointLight = new THREE.PointLight(0xff9000, 0.5, 10, 3)
gui.add(pointLight, 'intensity', 0, 1, 0.001).name('Point Intensity')
gui.addColor(pointLight, 'color')
gui.add(pointLight.position, 'x', -3, 3, 0.001)
gui.add(pointLight.position, 'y', -3, 3, 0.001)
gui.add(pointLight.position, 'z', -3, 3, 0.001)

const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
gui.add(rectAreaLight.position, 'x', -3, 3, 0.001)
gui.add(rectAreaLight.position, 'y', -3, 3, 0.001)
gui.add(rectAreaLight.position, 'z', -3, 3, 0.001)

const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1)
gui.add(spotLight.position, 'x', -3, 3, 0.001)
gui.add(spotLight.position, 'y', -3, 3, 0.001)
gui.add(spotLight.position, 'z', -3, 3, 0.001)
gui.add(spotLight.target.position, 'x', -3, 3, 0.001)
scene.add(spotLight)
scene.add(ambientLight, directionalLight, hemisphereLight, pointLight, rectAreaLight, spotLight, spotLight.target)

// Helpers
const hemiHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
const directionalHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
const pointHelper = new THREE.PointLightHelper(pointLight, 0.2)
const spotHelper = new THREE.SpotLightHelper(spotLight, 0.2)
const rectHelper = new RectAreaLightHelper(rectAreaLight, 0.2)

scene.add(hemiHelper, directionalHelper, pointHelper, spotHelper, rectHelper)

/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()
    rectAreaLight.lookAt(new THREE.Vector3())
    spotHelper.update()
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()