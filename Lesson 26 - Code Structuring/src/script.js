import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Experience from './Experience/Experience'

/**
 * 1. Already know about classes and modules so this is just review and extra notes. This lesson goes over splitting this file into multiple classes
 * 2. Can export anything basically using export default class/function/x. Then import as 'import x from 'file.js'
 * 3. If you want to export only specific functions/objects, do 'import { thing, things } from 'file.js'
 * 4. You can make a main class file. You already know this, it's just the app.js or driver class basically.
 * 5. He sets up a different class file for sizes and adds the event listeners in there. How will other classes know when to adjust?
 * 6. Event emitters - Sizes can trigger an event that other classes can listen for. Node.js does this natively.
 *    Better to have one class have a window event listener and then emit events to other classes.
 * 7. Don't forget about arrow functions! They retain the 'this' context so if 'this' is undefined, check context.
 * 8. Time class - handles all the time stuff
 * 9. Singleton creates a single instance of a class and will return that instance everytime new Instance() is called.
 *    Basically, use a class variable to store the first instance, check if the var is empty, return the var if it exists.
 * 10. The other method would be to just pass 'this' instance through a constructor down.
 * 11. Remember, this is just code copied from the guy. You don't have to organize your code like this way at all.
 * 12. Also covers, how to destroy stuff and clean up memory.
 *     Remove your event listeners, event emitter listeners, remove geometry, remove key,value pairs of materials, remove controls, renderer, post processing, webglrendertarget, passes, debug
 *     Syntax might be different b/w destroy/dispose
 */

const experience = new Experience(document.querySelector('canvas.webgl'))
// /**
//  * Loaders
//  */
// const gltfLoader = new GLTFLoader()
// const textureLoader = new THREE.TextureLoader()
// const cubeTextureLoader = new THREE.CubeTextureLoader()

// /**
//  * Base
//  */
// // Debug
// const gui = new dat.GUI()
// const debugObject = {}

// // Canvas
// const canvas = document.querySelector('canvas.webgl')

// // Scene
// const scene = new THREE.Scene()

// /**
//  * Update all materials
//  */
// const updateAllMaterials = () =>
// {
//     scene.traverse((child) =>
//     {
//         if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
//         {
//             // child.material.envMap = environmentMap
//             child.material.envMapIntensity = debugObject.envMapIntensity
//             child.material.needsUpdate = true
//             child.castShadow = true
//             child.receiveShadow = true
//         }
//     })
// }

// /**
//  * Environment map
//  */
// const environmentMap = cubeTextureLoader.load([
//     '/textures/environmentMap/px.jpg',
//     '/textures/environmentMap/nx.jpg',
//     '/textures/environmentMap/py.jpg',
//     '/textures/environmentMap/ny.jpg',
//     '/textures/environmentMap/pz.jpg',
//     '/textures/environmentMap/nz.jpg'
// ])

// environmentMap.encoding = THREE.sRGBEncoding

// // scene.background = environmentMap
// scene.environment = environmentMap

// debugObject.envMapIntensity = 0.4
// gui.add(debugObject, 'envMapIntensity').min(0).max(4).step(0.001).onChange(updateAllMaterials)

// /**
//  * Models
//  */
// let foxMixer = null

// gltfLoader.load(
//     '/models/Fox/glTF/Fox.gltf',
//     (gltf) =>
//     {
//         // Model
//         gltf.scene.scale.set(0.02, 0.02, 0.02)
//         scene.add(gltf.scene)

//         // Animation
//         foxMixer = new THREE.AnimationMixer(gltf.scene)
//         const foxAction = foxMixer.clipAction(gltf.animations[0])
//         foxAction.play()

//         // Update materials
//         updateAllMaterials()
//     }
// )

// /**
//  * Floor
//  */
// const floorColorTexture = textureLoader.load('textures/dirt/color.jpg')
// floorColorTexture.encoding = THREE.sRGBEncoding
// floorColorTexture.repeat.set(1.5, 1.5)
// floorColorTexture.wrapS = THREE.RepeatWrapping
// floorColorTexture.wrapT = THREE.RepeatWrapping

// const floorNormalTexture = textureLoader.load('textures/dirt/normal.jpg')
// floorNormalTexture.repeat.set(1.5, 1.5)
// floorNormalTexture.wrapS = THREE.RepeatWrapping
// floorNormalTexture.wrapT = THREE.RepeatWrapping

// const floorGeometry = new THREE.CircleGeometry(5, 64)
// const floorMaterial = new THREE.MeshStandardMaterial({
//     map: floorColorTexture,
//     normalMap: floorNormalTexture
// })
// const floor = new THREE.Mesh(floorGeometry, floorMaterial)
// floor.rotation.x = - Math.PI * 0.5
// scene.add(floor)

// /**
//  * Lights
//  */
// const directionalLight = new THREE.DirectionalLight('#ffffff', 4)
// directionalLight.castShadow = true
// directionalLight.shadow.camera.far = 15
// directionalLight.shadow.mapSize.set(1024, 1024)
// directionalLight.shadow.normalBias = 0.05
// directionalLight.position.set(3.5, 2, - 1.25)
// scene.add(directionalLight)

// gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('lightIntensity')
// gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001).name('lightX')
// gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001).name('lightY')
// gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001).name('lightZ')

// /**
//  * Sizes
//  */
// const sizes = {
//     width: window.innerWidth,
//     height: window.innerHeight
// }

// window.addEventListener('resize', () =>
// {
//     // Update sizes
//     sizes.width = window.innerWidth
//     sizes.height = window.innerHeight

//     // Update camera
//     camera.aspect = sizes.width / sizes.height
//     camera.updateProjectionMatrix()

//     // Update renderer
//     renderer.setSize(sizes.width, sizes.height)
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// })

// /**
//  * Camera
//  */
// // Base camera
// const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
// camera.position.set(6, 4, 8)
// scene.add(camera)

// // Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

// /**
//  * Renderer
//  */
// const renderer = new THREE.WebGLRenderer({
//     canvas: canvas,
//     antialias: true
// })
// renderer.physicallyCorrectLights = true
// renderer.outputEncoding = THREE.sRGBEncoding
// renderer.toneMapping = THREE.CineonToneMapping
// renderer.toneMappingExposure = 1.75
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
// renderer.setClearColor('#211d20')
// renderer.setSize(sizes.width, sizes.height)
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// /**
//  * Animate
//  */
// const clock = new THREE.Clock()
// let previousTime = 0

// const tick = () =>
// {
//     const elapsedTime = clock.getElapsedTime()
//     const deltaTime = elapsedTime - previousTime
//     previousTime = elapsedTime

//     // Update controls
//     controls.update()

//     // Fox animation
//     if(foxMixer)
//     {
//         foxMixer.update(deltaTime)
//     }

//     // Render
//     renderer.render(scene, camera)

//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick)
// }

// tick()