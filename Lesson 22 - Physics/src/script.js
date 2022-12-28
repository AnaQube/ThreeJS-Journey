import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'

/**
 * 1. The theory is that you have two 'worlds': one for physics and one for ThreeJS. The physics world will simulate the physics and ThreeJS will copy the physics.
 * 2. There is a 3D library and a 2D library. You can sometimes reduce 3D physics to 2D (pool, pinball).
 * 3. 3D Libraries: Ammo is heavy, no docs, updated still. Cannon is light, easier to implement, no updates. Oimo is light, easy to implement, more recent that Cannon but no updates.
 * 4. 2D Libraries: Matter, P2, Planck, Box2D. Matter is updated.
 * 5. Physijs combines ThreeJS and physics libraries. Supports workers natively. Uses Ammo.js. Instead of creating ThreeJS mesh and physic body, it does both
 * 6. This project uses Cannon so go through it as it's probably different for other libraries.
 * 7. .step(fixed time step, time passed since last step, catch up iterations if falling behind). Fixed time will usually be 1/60 for 60 fps. Time passed is delta time since last frame.
 * 8. .copy(Cannon position) to the ThreeJS object position
 * 9. Mass = 0 means that it is static
 * 10. Can add multiple shapes to a body to create complex shapes.
 * 11. .setFromAxisAngle(vec3, Radians) sticks an axis through the object depending on which one you choose (x, y, z)
 * 12. The plane actually has its bottom filled. If an object is below it, it gets vaporized. Make sure your object is on top of the plane and your plane is placed/rotated correctly.
 * 13. You can add materials to physics. This isn't texture related, it's related to the actual physical material properties.
 * 14. A contactmaterial tells how two materials interact. There are a bunch of properties like friction.
 * 15. Set body with material to use them.
 * 16. You can also use default materials and set contact material to the same default materials. world.defaultContactMaterial applies the material to all objects
 * 17. applyForce() applies force to a point, doesn't have to be on a body surface. Good for wind/pushes/strong force. applyLocalForce(Vec3 direction, Vec3 position) is local to the Body
 * 18. applyImpulse() adds to velocity. applyLocalImpulse() is local to the Body
 * 19. You can change the size of a ThreeJS geometry after it's created. Scale the mesh instead. Good for creating a bunch of stuff that takes in a size parameter but you want to use the same geometry.
 * 20. To update the rotation of meshes using Cannon, you must use quaternion instead of rotation.
 * 21. Currently, Cannon is testing every body against every other body for collisions. This is called NaiveBroadphase and there are different types of broadphases.
 *     GridBroadphase splits the world into a grid and only tests bodies that are adjacent in the grid. Bad for super fast moving objects since they just phase through at low fps.
 *     SAPBroadphase (sweep and prune) idk how but this is just better though? Still has the super fast object bug.
 *     world.broadphase set this one
 * 22. You can "sleep" bodies when they get too slow so they aren't tested for collision. world.allowSleep = true | sleepSpeedLimit and sleepTimeLimit properties
 * 23. Can listen to events on Body like 'collide', 'sleep', 'wakeup' and do something on event. Do body.addEventListener('event name', function)
 * 24. Javascript by default plays a sound to the end and then restarts it. To bypass this, set the .currentTime on the sound to 0 and lower the collision strength threshold.
 *     There's probably a better way to do this...
 * 25. Constraints: Hinge (door), set distance between objects, lock (merge bodies like they were one piece), point to point (glues 2 bodies at a specific point)
 * 26. Physics works on the CPU. Use workers to use different threads.
 * 27. Cannon-es is a forked updated version of cannon.
 */

/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {}
debugObject.createSphere = () => {
    createSphere(Math.random() * 0.5, { x: (Math.random() - 0.5) * 3, y: 3, z: (Math.random() - 0.5) * 3 })
}
debugObject.createBox = () => {
    createBox(Math.random(), Math.random(), Math.random(), { x: (Math.random() - 0.5) * 3, y: 3, z: (Math.random() - 0.5) * 3 })
}
debugObject.reset = () => {
    objectsToUpdate.forEach((object) => {
        object.body.removeEventListener('collide', playHitSound)
        world.removeBody(object.body)
        scene.remove(object.mesh)
    })
    objectsToUpdate.splice(0, objectsToUpdate.length)
}

gui.add(debugObject, 'createSphere')
gui.add(debugObject, 'createBox')
gui.add(debugObject, 'reset')
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Physics
 */
// World and gravity
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true

// Materials
// const concreteMaterial = new CANNON.Material('concrete')
// const plasticMaterial = new CANNON.Material('plastic')
const defaultMaterial = new CANNON.Material('default')

// Contact - restitution is bounciness
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial
// const concretePlasticContact = new CANNON.ContactMaterial(
//     concreteMaterial,
//     plasticMaterial,
//     {
//         friction: 0.1,
//         restitution: 0.7
//     }
// )
// world.addContactMaterial(concretePlasticContact)


// Sphere - needs a shape and a body, shape representing the actual shape and body representing position, mass, and shape. Then, add to world
// const sphereShape = new CANNON.Sphere(0.5)
// const sphereBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0, 3, 0),
//     shape: sphereShape
// })
// sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0))
// world.addBody(sphereBody)

// Floor - static mass
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1, 0, 0),
    Math.PI * 0.5
)
world.addBody(floorBody)

/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     new THREE.MeshStandardMaterial({
//         metalness: 0.3,
//         roughness: 0.4,
//         envMap: environmentMapTexture,
//         envMapIntensity: 0.5
//     })
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
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
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils - create sphere/box from gui, uses same geometry and materials for all objects. Function creates ThreeJS mesh, Cannon shape, Cannon body, and copies position to mesh & body.
 * objectsToUpdate is an array of objects[mesh, body] that will be updated in the tick function to simulate physics.
 */
const objectsToUpdate = []

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture
})

// Create Sphere function
const createSphere = (radius, position) => {
    // ThreeJS
    const mesh = new THREE.Mesh(
        sphereGeometry,
        sphereMaterial
    )
    mesh.scale.set(radius, radius, radius)
    mesh.castShadow = true
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon
    const shape = new CANNON.Sphere(radius)
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    world.addBody(body)
    objectsToUpdate.push({
        mesh,
        body
    })
    body.addEventListener('collide', playHitSound)
}


// Create box function
const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 2, 2)

const createBox = (width, height, depth, position) => {
    const mesh = new THREE.Mesh(
        boxGeometry,
        sphereMaterial
    )
    mesh.scale.set(width, height, depth)
    mesh.position.copy(position)
    mesh.castShadow = true
    scene.add(mesh)

    const shape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5))
    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    world.addBody(body)
    objectsToUpdate.push({
        mesh,
        body
    })
    body.addEventListener('collide', playHitSound)
}

// Sounds
const hitSound = new Audio('/sounds/hit.mp3')

const playHitSound = (event) => {
    const impactStrength = event.contact.getImpactVelocityAlongNormal()
    if (impactStrength > 1.5) {
        hitSound.volume = Math.random()
        hitSound.currentTime = 0
        hitSound.play()
    }
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldTime
    oldTime = elapsedTime

    // Update physics world
    // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)
    world.step(1/60, deltaTime, 10)
    // sphere.position.copy(sphereBody.position)
    objectsToUpdate.forEach((object) => {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    })

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()