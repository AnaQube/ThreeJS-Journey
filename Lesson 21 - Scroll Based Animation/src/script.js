import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import { BufferGeometry, Points, PointsMaterial } from 'three'
import gsap from 'gsap'

/**
 * Covers using ThreeJS as part of an HTML page, scrolling, parallax, triggers
 * 1. Remove overflow hidden from style.css
 * 2. Using position: fixed on canvas makes sure it is always there even if scrolling down.
 * 3. Using position: absolute lets you scroll down from canvas.
 * 4. iOS has that scroll past the page thing which shows white on the bottom/top.
 *    Set alpha: true on the renderer to fix this. Set the background of the html to something.
 * 5. Objects always stay at their position relative to the window. If you resize the window, it will follow the scaling.
 *    (This is good since you don't have to account for window size)
 * 6. To animate the scroll, make a event listener for scroll, set a variable to scrollY, update the camera position y
 * 7. Probably need to calculate the distance of each object relative to the scroll
 * 8. Parallax: Get cursor position / size of canvas to normalize. Set camera to normalized position of cursor.
 *    Issue here is that you can't scroll since you set camera twice. Use a camera group so that you get 2 positions to modify.
 * 9. To smooth parallax, use lerp formula. Each frame the camera gets 1/xth closer to destination.
 *    Instead of setting camera to position of cursor, add (difference of cursor position to camera position) * 1/x each frame
 * 10.An issue occurs with high freq screens since tick() is called more. Use time spent between each frame (deltaTime) and multiply parallax by that.
 * 11.If you have overlapping sets for rotation, a good way to fix it is just += if it's a static constant rotation
 */

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui.addColor(parameters, 'materialColor').onChange(() => {
    material.color.set(parameters.materialColor)
    particleMaterial.color.set(parameters.materialColor)
})

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

const distance = 4
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)

mesh1.position.y = distance * 0
mesh2.position.y = -distance * 1
mesh3.position.y = -distance * 2

mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2

scene.add(mesh1, mesh2, mesh3)

const meshArray = [mesh1, mesh2, mesh3]

/**
 * Particles
 */
const particleCount = 200
const particlePos = new Float32Array(particleCount * 3)

for (let i = 0; i < particleCount; i++) {
    particlePos[i * 3] = (Math.random() - 0.5) * 10
    particlePos[i * 3 + 1] = distance * 0.5 - Math.random() * distance * meshArray.length
    particlePos[i * 3 + 2] = (Math.random() - 0.5) * 10
}
const particleGeometry = new BufferGeometry()
particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePos, 3))

const particleMaterial = new PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
})
const particle = new Points(particleGeometry, particleMaterial)
scene.add(particle)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)
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
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    
    // check if section changed and play animation tween
    const newSection = Math.round(scrollY / sizes.height)
    if (newSection != currentSection) {
        currentSection = newSection
        gsap.to(
            meshArray[currentSection].rotation, {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }
        )
    }
})

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5
    cursor.y = e.clientY / sizes.height - 0.5
})

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

    // Animate camera (scroll should match object distance)
    camera.position.y = (-scrollY / sizes.height) * distance
    
    const parallaxX = cursor.x * 0.5
    const parallaxY = -cursor.y * 0.5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    // Animate meshes
    for (const mesh of meshArray) {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()