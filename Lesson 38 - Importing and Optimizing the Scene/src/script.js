import './style.css'
import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from './shaders/fireflies/vertex.glsl'
import firefliesFragShader from './shaders/fireflies/frag.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragShader from './shaders/portal/frag.glsl'


/**
 * 1. This lesson covers adding the previous lesson's model to ThreeJS and optimizing it.
 * 2. Add model to scene, load texture, add texture to material.
 * 3. The texture might look incorrect so you may have to flip the texture on the Y coordinates (set to false). Set encoding on texture and renderer to sRGB.
 * 4. Fixing the emission objects: The lamp and portal will have the texture map on them. Need to select the correct objects to apply material. 
 *    Use .find() on array to apply materials instead of traverse. You can use regex to pick specific objects. Set the material on objects to a basic material with your color.
 * 5. For the portal, it's gonna be a shader. Just use a temp basic material for now.
 * 6. SpectorJS to see the performance and draw calls of your scene. 
 *    Right now, it's about 173 draw calls since each rock, stone, log is being drawn separately. We should batch this all into one geometry.
 * 7. Go into blender, dupe everything besides the emissions, put those into a new collection, then merge them (ctrl J). Blender also does multiple materials for a single object as well (like multi materials for one avatar)
 * 8. You can also remove the materials from the merged object but it's up to you. If you need to rebake, you still got the original scene. If you want multi materials, check export materials.
 * 9. Now we're at 16 draw calls. Remember to export those emissions as part of the model.
 * 10. Since we're now at 1 object for the entire scene, we can now do .find() to get the one object instead of traversing all the children of the scene to apply the material.
 * 11. Continuing to lesson 39... we need to add fireflies, portal shader, and just some details.
 * 12. Add a debug color for the background
 * 13. Create particles for the fireflies: Go look at the particles AND shaders lessons since the shaders deals with particles as well.
 *     Couple of reminders: pixel ratio affects shaders and particularly particle size. Need to implement attenuation in shader manually.
 * 14. A little tip on shader randomness: you can use textures for noise, you can use attributes to send a random for every particle, but those are bad for performance (it's ok at small values)
 *     Instead, you can use the position on the x or z axis to add a little bit of randomness (or other attributes that are already random).
 * 15. By the way, points already has a UV vec2 called gl_PointCoord. Everything else needs the varying uv sent to frag shader.
 * 16. If the portal is a flat color when you set the uv coordinates to your fragColor, then it isn't unwrapped. Go back in blender and unwrap it again.
 * 17. To get better perlin noise, you can run it twice. Once, on the original UV coordinates, then take those coordinates and run it again. Apply different time variables cnoise(1st and 2nd parameters are UV, 3rd is time)
 * 18. We want an outer glow on the portal to match the lighting on the bricks of the portal. Do not use step as we want the glow part and not a sharp edge. Just multiply the distance function by 5.0
 *     You will also notice there is black on the edges cause you're adding the original strength still. Use a step function to filter that out but also add the original strength to get a bit of blur.
 *     IMPORTANT: There is also a bug now since you don't get the correct colors when setting them. This is the strength > 1.0 bug. Clamp it to 0.0, 1.0.
 *     ALWAYS CLAMP YOUR STRENGTH IF YOU'RE > 1.0 FOR COLORS.
 */

/**
 * Spector JS
 */
const SPECTOR = require('spectorjs')
const spector = new SPECTOR.Spector()
spector.displayUI()

/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Textures
 */
const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

/**
 * Materials
 */
const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xCEA859 })

debugObject.portalColorStart = '#ff0000'
debugObject.portalColorEnd = '#0000ff'
gui.addColor(debugObject, 'portalColorStart').onChange(() => {
    portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
})
gui.addColor(debugObject, 'portalColorEnd').onChange(() => {
    portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
})
const portalLightMaterial = new THREE.ShaderMaterial({
    vertexShader: portalVertexShader,
    fragmentShader: portalFragShader,
    uniforms: {
        uTime: { value: 0.0 },
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) }
    }
})



/**
 * Model
 */
gltfLoader.load('portal.glb', (gltf) => {
    // gltf.scene.traverse((child) => {
    //     console.log(child)
    //     child.material = bakedMaterial
    // })
    const bakedMesh = gltf.scene.children.find((child) => {
        return child.name === 'Plane003'
    })
    const poleLightAMesh = gltf.scene.children.find((child) => {
        return child.name === 'poleLightA'
    })
    const poleLightBMesh = gltf.scene.children.find((child) => {
        return child.name === 'poleLightB'
    })
    const portalLightMesh = gltf.scene.children.find((child) => {
        return child.name === 'portalLight'
    })
    poleLightAMesh.material = poleLightMaterial
    poleLightBMesh.material = poleLightMaterial
    portalLightMesh.material = portalLightMaterial
    bakedMesh.material = bakedMaterial
    scene.add(gltf.scene)
})

/**
 * Fireflies - Go review the particles lesson
 */
const firefliesGeometry = new THREE.BufferGeometry()
const firefliesCount = 30
const positionArray = new Float32Array(firefliesCount * 3)
const scaleArray = new Float32Array(firefliesCount)

for (let i = 0; i < firefliesCount; i++) {
    positionArray[i * 3] = (Math.random() - 0.5) * 4
    positionArray[i * 3 + 1] = Math.random() * 1.5
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

    scaleArray[i] = Math.random()
}

firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))

// Material
// const firefliesMaterial = new THREE.PointsMaterial({
//     size: 0.1,
//     sizeAttenuation: true
// })
const firefliesMaterial = new THREE.ShaderMaterial({
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragShader,
    uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 100 },
        uTime: { value: 0 }
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
})
gui.add(firefliesMaterial.uniforms.uSize, 'value', 0, 500, 1)

// Points
const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
scene.add(fireflies)

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
    firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding

debugObject.clearColor = '#122030'
gui.addColor(debugObject, 'clearColor').onChange(() => {
    renderer.setClearColor(debugObject.clearColor)
})
renderer.setClearColor(debugObject.clearColor)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    
    firefliesMaterial.uniforms.uTime.value = elapsedTime
    portalLightMaterial.uniforms.uTime.value = elapsedTime
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()