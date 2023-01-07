import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'

/**
 * 1. We can "draw" with shaders in a sense, without textures. This lesson covers patterns.
 * 2. UV ccordinates go from 0.0, 0.0 to 1.0, 1.0 where 0,0 starts at bottom left and 1,1 is top right.
 * 3. This lesson is purely example based and just creating shader patterns. I will just write some important notes
 *    rather than list each pattern since there's like 50 of them.
 * 4. Modulo in GLSL is NOT the same as remainder. It is a LIMIT function that sets the first parameter to 0 if it reaches the limit
 *    mod(param, limit). Think of a gradient going from 0 to 1, 0 to 1, 0 to 1... Multiply the first parameter if you want more separate areas
 * 5. If/else works but it's so bad for performance. You can do the ? : if function too but it sucks.
 * 6. step(value, variable) is a toggle for 0 or 1. If the variable is below the value then it's 0, else 1.
 * 7. Combining patterns can be done through adding their two strengths. Multiplying can get the overlap of the two patterns.
 * 8. To translate a pattern on an axis, subtract/add from the uv.x or uv.y
 * 9. So step can divide an area into 0 or 1 (black or white). Module creates a repeating pattern. Combining these gives you repeating dashes
 *    or a grid of something depending on how you set the mod and step values. Then, multiplying/adding will give you different results as well.
 *    Adding usually gives you a grid while multiplying gives you the intersection.
 * 10. Perlin noise is used for clouds, fire, water, terrain, elevation, etc... There are a lot of algorithms and different dimensions (2D, 3D, 4D).
 *     Just copy the noise algorithm from github
 * 11. mix(colorA, colorB, value) mixes two colors using the value as the weight of colorA
 * 12. When the strength value of a color goes ABOVE 1.0, then you get strange colors. This usually happens with intersecting bars. You need to clamp the strength using
 *     clamp(value, 0.0, 1.0). This clamps the value to the range 0.0 to 1.0
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
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)

// Material
const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
        uTest: { value: 0.0 }
    }
})

gui.add(material.uniforms.uTest, 'value', 0.0, 200.0, 0.001).name('oiliness');

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