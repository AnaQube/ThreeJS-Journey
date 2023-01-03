import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * 1. Shaders are programs written in GLSL. The GPU processes these shaders. They do 2 things: 
 *    Positioning vertices of the geometry and coloring each visible pixel of the geometry
 * 2. "Pixel" isn't accurate since the render doesn't line up with the pixel screens. More on "fragments" later
 * 3. The shader gets a lot of information: coordinates, transformation, camera info, color, textures, lights, fog, etc...
 * 4. Vertex shaders deal with the vertex positions of the geometry. The same vertex shader will be used for all vertices of the geometry.
 *    Of course, some data like position will be different between vertices. 
 * 5. Data that isn't the same between vertices is called "attributes" (vertex position)
 * 6. Data that IS the same between vertices is called "uniform" (camera position, mesh position, color maybe)
 * 7. After the GPU knows what to render, it goes to the fragment shader.
 * 8. Fragment shaders deal with the color of each vertex. The same shader will be used for all vertices of the geometry.
 *    GPU receives data on what to color from fragment shader.
 * 9. Fragment shaders can get uniform data but do not get attributes. Instead, they get "varyings" from the vertex shader.
 *    Vertex shaders can share data with fragment shaders in "varyings". These "varyings" can be interpolated (averaged from surrounding pixels).
 *    They're interpolated because a fragment shader can be working on more than one vertex, hence "fragment" (i think).
 * 10. Why shaders? If you wanted a flat plane to wave like a flag, you'd have to rig an animation. Shaders can just edit the vertex positions and make the plane wave.
 *     There's a bunch more cool stuff and performance optimizations that you can do. Also, post processing is cool.
 * 11. ShaderMaterial has some code for you. RawShaderMaterial has nothing to start with. This lesson uses RawShaderMaterial.
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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)

// Material
const material = new THREE.RawShaderMaterial()

// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

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
camera.position.set(0.25, - 0.25, 1)
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()