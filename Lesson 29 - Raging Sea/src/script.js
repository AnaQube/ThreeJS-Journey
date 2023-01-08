import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

/**
 * 1. We're going to make a sea shader from scratch. First, change the material to ShaderMaterial
 * 2. Make the 2 shaders file and put appropriate code in both. Import both and use them in the ShaderMaterial.
 * 3. Remember, if you want to play with vertex positions, do it after calculating the modelPosition (modelMatrix * vec4(position, 1.0))
 * 4. Add uniforms for whatever properties you want to edit about the shader. Add GUI options for those uniforms. Get those uniforms and do math in vertex/frag shader.
 * 5. Add uTime uniform to animate properties. Set uTime's VALUE in the tick() function to elapsed time.
 * 6. Add color depending on height of the wave. First a debug object to control the colors. Second, elevation is always gonna be >0 so the mix isn't accurate.
 *    Make an offset to add/subtract from the color to get a better mix.
 * 7. Use Perlin noise to mess with the time and add chaos. This time we use 3D Perlin so that we can add a time variable to x/z for more variation.
 *    In this example, cnoise(vec3(xz, time)) where time controls speed of noise change and xz controls the noise tiling (more noise within smaller area)
 * 8. Right now, the waves are like a sin. We want it to be more like an inverted abs(sin) so that it's always negative but we still get the waves. 
 *    Done by taking abs of the noise and subtracting it from elevation.
 * 9. Need more perlin noise since we can still see the general sin wave. Use a for loop in the vertex shader for subtracting from elevation abs of noise.
 */

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)

// Color
debugObject.depthColor = '#627b9d'
debugObject.surfaceColor = '#a8f9ff'

// Material
const waterMaterial = new THREE.ShaderMaterial({
    fragmentShader: waterFragmentShader,
    vertexShader: waterVertexShader,
    uniforms: {
        uTime: { value: 0.0 },

        uBigWavesElevation: { value: 0.5 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
        uBigWavesSpeed: { value: 0.75 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.25 },
        uColorMultiplier: { value: 2},

        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3.0},
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 4.0 }
        
    }
})
gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value', 0.0, 1.0, 0.001).name('uBigWavesElevation')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x', 0.0, 10.0, 0.001).name('uBigWavesFrequencyX')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y', 0.0, 10.0, 0.001).name('uBigWavesFrequencyY')
gui.add(waterMaterial.uniforms.uBigWavesSpeed, 'value', 0.0, 4, 0.001).name('uBigWavesSpeed')
gui.addColor(debugObject, 'depthColor').onChange(() => {
    waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
})
gui.addColor(debugObject, 'surfaceColor').onChange(() => {
    waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
})
gui.add(waterMaterial.uniforms.uColorOffset, 'value', 0.0, 1.0, 0.001).name('uColorOffset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value', 0.0, 10.0, 0.001).name('uColorMultiplier')

gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value', 0.0, 1.0, 0.001).name('uSmallWavesElevation')
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value', 0.0, 30.0, 0.001).name('uSmallWavesFrequency')
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value', 0.0, 4.0, 0.001).name('uSmallWavesSpeed')
gui.add(waterMaterial.uniforms.uSmallWavesIterations, 'value', 0.0, 5, 1).name('uSmallWavesIterations')

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

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
camera.position.set(1, 1, 1)
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

    // Update water
    waterMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()