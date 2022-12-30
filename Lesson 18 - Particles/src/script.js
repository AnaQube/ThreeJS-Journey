import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * 1. Each vertex of the geometry becomes a particle
 * 2. Particles are 2 tris, always facing the camera
 * 3. sizeAttenutation adds distance scaling to particles
 * 4. Need a positions Float32Array for particle positions (x, y, z positions)
 * 5. Particle transparency isn't as simple as alphaMap and transparent: true. The GPU will draw them in the order that they're created.
 *    So, you will get some particles hidden behind while some particles don't get hidden.
 * 6. The GPU will render alpha 0 as invisible, but it still renders it.
 * 7. alphaTest tells the GPU to not render alpha x at all. It is NOT perfect. You will still see the edges of textures.
 * 8. depthTest tells the GPU to not test what is closer when drawing. It results in no depth at all. Things behind an object will appear in front of the object.
 * 9. depthWrite is the correct solution usually. It uses the depth buffer (a grayscale map) that chooses when to draw a particle
 * 10. Blending "blends" colors that stack on top of each other. Results in brighter colors when particles stack. Performance impact
 * 11. Colors uses Float32Array (R, G, B). setAttribute on the geometry using the array and change vertexColors = true on the material 
 *     (geometry has color too, you can even set the colors per vertex)
 * 12. Let's say you want to move particles individually rather than moving the entire particle object
 *     Method 1: Don't do this cause it's so inefficient. Get the positions 1-D array for all the particles and update them using for loop. 
 *     !! Set the .needsUpdate on the position attribute to make sure it updates
 *     Method 2: MAKE YOUR OWN SHADER
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
const particleTexture = textureLoader.load('/textures/particles/12.png')

/**
 * Particles - Each vertex of the geometry becomes a particle
 */
// Geometry
const particlesGeometry = new THREE.BufferGeometry()
const count = 20000

const positions = new Float32Array(count * 3)
const colors = new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
    colors[i] = Math.random()
}
particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)
particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
)

// Material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.5,
    // color: 'red',
    sizeAttenuation: true,
    map: particleTexture,
    transparent: true,
    alphaMap: particleTexture
})
// particlesMaterial.color = new THREE.Color('#aaffff')
// particlesMaterial.alphaTest = 0.001
// particlesMaterial.depthTest = false
particlesMaterial.depthWrite = false
particlesMaterial.blending = THREE.AdditiveBlending
particlesMaterial.vertexColors = true

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

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
camera.position.z = 3
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

    // Update particles
    // particles.position.y = -elapsedTime * 0.1
    for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const x = particlesGeometry.attributes.position.array[i3]
        particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
    }
    particlesGeometry.attributes.position.needsUpdate = true

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()