import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as lil from 'lil-gui'
import { BooleanKeyframeTrack, GeometryUtils } from 'three'

/**
 * 1. Particles use Point for mesh, BufferGeometry for geometry, and then set positions on the geometry.
 * 2. onFinishChange() to update the galaxy parameters from the GUI
 * 3. When you need to get rid of something/redraw something, .dispose() of the geometry and material, then remove the mesh from scene
 * 4. Putting objects on Math.cos(angle) and Math.sin(angle) on x/z axis gives you a circle
 * 5. If you want a more focused distribution for your random values, use Math.pow(x, 2) to squish your decimals
 * 6. If you want to mix colors, use .lerp() on Color. You can adjust how much is mixed.
 * 7. There's a lot of math involved so it's better to understand this example by going through the code.
 */

/**
 * Base
 */
// Debug
const gui = new lil.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
// Empty object
const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.random = 0.5
parameters.randomPower = 2
parameters.insideColor = '#ff6838'
parameters.outsideColor = '#ff6838'

// Need to destroy old galaxy when changing params
let particleGeometry = null
let particleMaterial = null
let particles = null

const generateGalaxy = () => {
    // Getting rid of old galaxy
    if (particles !== null) {
        particleGeometry.dispose()
        particleMaterial.dispose()
        scene.remove(particles)
    }

    // Geometry
    particleGeometry = new THREE.BufferGeometry()
    
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3
        const radius = Math.pow(Math.random(), parameters.randomPower) * parameters.radius
        // branchAngle represents the branch of the galaxy this star will go on
        // think dividing a circle into slices but in radians, x branches, i is between 0 and x - 1
        // so you get a fraction between 0 and 1, then multiply by a full circle radians
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        // the further from center (greater radius), the more spin (the further away it deviates from its original position)
        const spinAngle = radius * parameters.spin

        const randomX = Math.pow(Math.random() - 0.5, parameters.randomPower) * parameters.random * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random() - 0.5, parameters.randomPower) * parameters.random * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random() - 0.5, parameters.randomPower) * parameters.random * (Math.random() < 0.5 ? 1 : -1)

        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ
        
        // Mix outside and inside color depending on radius (distance from center)
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    particleGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
    )
    particleGeometry.setAttribute(
        'color',
        new THREE.BufferAttribute(colors, 3)
    )

    // Material
    particleMaterial = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    // Points
    particles = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(particles)
}
generateGalaxy()

gui.add(parameters, 'count', 100, 100000, 100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size', 0.001, 0.1, 0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius', 0.01, 20, 0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches', 2, 20, 1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin', -5, 5, 0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'random', 0, 2, 0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomPower', 1, 10, 0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

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
camera.position.x = 3
camera.position.y = 3
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()