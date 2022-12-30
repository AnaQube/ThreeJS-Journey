import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * 1. A raycaster is not for lights but for collision. It casts a ray in a direction and checks what collides with it as well as distance.
 * 2. Use cases: Hit detection, wall proximity detection, mouse event detection, collision detection
 * 3. Ray needs an origin and a direction, both Vector 3. Call .normalize() on direction afterwards. This will make vector length 1.
 * 4. Set the raycaster using .set(origin, direction)
 * 5. Test object(s) using .intersectObject(object). Objects can intersect multiple times (donut).
 * 6. Distance, face, faceIndex, Object instance, exact point of collision (vec3), and uv coordinates of collision are logged by ray caster
 * 7. Ray casting is expensive since you do it on each frame
 * 8. Mouse collision: Need [-1, 1] position for x and y axes so you normalize it
 * 9. Don't put other functions besides coord updates in window event listener as it can fire more than once per frame. Use the tick() function to change stuff
 * 10. ThreeJS provides an easy solution: raycaster.setFromCamera(mouse coords, camera)
 * 11. Mouse enter/leave: Have an array that is updated when mouse hovers, check next frame if intersects has object, update array. Not very performant
 * 12. Mouse click: check if you're currently intersecting with something while clicking event
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
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

// const rayOrigin = new THREE.Vector3(-3, 0, 0)
// const rayDirection = new THREE.Vector3(10, 0, 0)
// rayDirection.normalize()

// raycaster.set(rayOrigin, rayDirection)

// const intersect = raycaster.intersectObject(object2)
// const intersects = raycaster.intersectObjects([object1, object2, object3])
// console.log(intersect)
// console.log(intersects)

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
 * Mouse events
 */
const mouse = new THREE.Vector2()
window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX / sizes.width * 2 - 1
    mouse.y = -(e.clientY / sizes.height * 2 - 1)
})

window.addEventListener('click', () => {
    if (currentIntersect) {
        console.log('click on sphere')
    }
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

let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    
    // Animate objects
    object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
    object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
    object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

    // Ray caster
    raycaster.setFromCamera(mouse, camera)

    // const rayOrigin = new THREE.Vector3(-3, 0, 0)
    // const rayDirection = new THREE.Vector3(1, 0, 0)
    // rayDirection.normalize()
    // raycaster.set(rayOrigin, rayDirection)    

    const objectsToTest = [object1, object2, object3]
    const intersects = raycaster.intersectObjects(objectsToTest)
    
    for (const object of objectsToTest) {
        object.material.color.set('#ff00aa')
    }
    for (const intersect of intersects) {
        intersect.object.material.color.set('#aaffff')
    }
    if (intersects.length) {
        if (currentIntersect === null)
            console.log('mouse enter')
        currentIntersect = intersects[0]
    } else {
        if (currentIntersect)
            console.log('mouse leave')
        currentIntersect = null
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()