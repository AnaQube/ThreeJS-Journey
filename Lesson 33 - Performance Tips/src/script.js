import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats.js'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { TetrahedronGeometry } from 'three'

/**
 * 1. The target is 60fps at least. Two limitations: CPU/GPU. Keep an eye on the weight of your website.
 * 2. You can have a FPS counter like stats.js. npm install --save stats.js. Copy the code from the docs. Add stats.begin() and stats.end() to tick() function.
 * 3. Disable the FPS limit if your computer is too good. Google it for each browser.
 * 4. Monitoring draw calls - Chrome has Spector.js. It snapshots a frame and tells you every draw call that happens, step by step.
 * 5. Renderer information - just log the renderer.info and read through it. Tells you calls, tris, memory, etc.
 * 6. Generally, just have good, optimized Javascript code.
 * 7. Dispose of your geometries, materials, stuff from Three.JS, textures, etc. Read the docs, they're very thorough. You'll get memory leaks if you don't dispose properly.
 * 8. Don't use lights. If you have to, ambient light, directional light, and hemisphere light are the best. Bake your textures.
 * 9. Don't add/remove light. Materials need to be recompiled whenever there's a new light.
 * 10. Avoid shadows. Bake them. If you have to, optimize the shadow map using camera helpers, far, near clips, mapSize / resolution...
 *     Use cast shadow and receive shadow wisely. If an object can't receive a shadow, set receiveShadow = false.
 *     You can turn shadow map autoUpdate off/every x frames (and doing needsUpdate to force the renderer to recognize it). This renders the shadow once and never again. Pretty much a bake.
 * 11. Resize your textures. Textures take up a lot of space in GPU memory (cause of mipmaps). Keep your resolutions to pow of 2. Doesn't have to be a square.
 *     PNG has alpha, or you could use 2 jpgs (one for alpha map). Compress your images using some online tool.
 * 12. Don't update vertices in ThreeJS (esp in tick function). Use a vertex shader if you have to.
 * 13. Combine same geometry/materials to use on a mesh when you're looping through to make multiple copies of a mesh.
 * 14. (tip 20) Since each mesh would be a draw call, you can merge static objects. You can also use BufferGeometryUtils.
 *     So instead of making multiple meshes, you create multiple geometries, manipulate those however you want (position/rotation/scale), then add those geometries to an array.
 *     Make a const mergedGeometry using BufferGeometryUtils.mergeBufferGeometries(array), then create the Mesh from the new mergedGeometry. Now that group of geometries is ONE mesh takes one draw call.
 * 15. If you're using the same materials in a loop, just make one and use it for multiple meshes.
 * 16. Try to use cheap materials. Basic, Lambert, and Phong are cheap.
 * 17. If you used 14 and merged all the meshes but need to move individual meshes, you can use InstancedMesh. Idea is to create a matrix that has the rotation & position modifications created from Quarternion & vec3.
 *     VERY ANNOYING AND HARD TO DO CAUSE YOU HAVE TO SET MATRICES. Set mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage) if you're modifying pos/rotation it
 * 18. Fewer polygons on models the better. Use normal maps for details.
 * 19. Use Draco Compression if you have high weight models.
 * 20. Use Gzip if you're using a server. It's compression that happens on the server side. You can see this in the network dev tool (transferred vs resources). Content-encoding will be gzip when you inspect a resource.
 * 21. Objects not in field of view (frustum culling) are not rendered. Consider reducing FOV.
 * 22. Reduce near and far properties of the camera so that it doesn't render things a million miles away.
 * 23. Don't use the default window pixel ratio. Some devices have super high pixel ratio so limit it to 2 at the MOST.
 * 24. Some devices can siwtch GPUs. You can set in the renderer constructor " powerPreference: 'high-performance' ". If you don't need it don't use it.
 * 25. Don't use antialias if you don't see aliasing. Also, don't use if pixel ratio is > 1.
 * 26. Don't use post processing. If you do, try and combine passes by using your own custom pass. Every pass is a render.
 * 27. SHADERS: You can force lowp precision by setting the precision in the ShaderMaterial constructor. Test for bugs.
 *     AVOID if statements. Use swizzles (xzy or zyx or xyz) and built in functions (clamp, step, max, mix, etc...).
 * 28. Perlin noise is BAD for performance. Use textures as noise instead (you won't be able to animate unless using UVs).
 * 29. Use defines if a value doesn't change at all (or PI and other set numbers). Do #define var_name value;
 *     Another way is to add defines: property in the ShaderMaterial. Do NOT change defines value since shader getes recompiled.
 * 30. Do calculations in the vertex shader, then send it to the fragment shader. There are less vertices than frags so there are less details.
 * 31. For more tips: discoverthreejs.com/tips-and-tricks/
 */

/**
 * Stats
 */
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

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
const displacementTexture = textureLoader.load('/textures/displacementMap.png')

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
camera.position.set(2, 2, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    powerPreference: 'high-performance',
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(window.devicePixelRatio)

/**
 * Test meshes
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial()
)
cube.castShadow = true
cube.receiveShadow = true
cube.position.set(- 5, 0, 0)
scene.add(cube)

const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 128, 32),
    new THREE.MeshStandardMaterial()
)
torusKnot.castShadow = true
torusKnot.receiveShadow = true
scene.add(torusKnot)

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial()
)
sphere.position.set(5, 0, 0)
sphere.castShadow = true
sphere.receiveShadow = true
scene.add(sphere)

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial()
)
floor.position.set(0, - 2, 0)
floor.rotation.x = - Math.PI * 0.5
floor.castShadow = true
floor.receiveShadow = true
scene.add(floor)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, 2.25)
scene.add(directionalLight)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()

    const elapsedTime = clock.getElapsedTime()

    // Update test mesh
    torusKnot.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    stats.end()
}

tick()

/**
 * Tips
 */

// // Tip 4
// console.log(renderer.info)

// // Tip 6
// scene.remove(cube)
// cube.geometry.dispose()
// cube.material.dispose()

// // Tip 10
// directionalLight.shadow.camera.top = 3
// directionalLight.shadow.camera.right = 6
// directionalLight.shadow.camera.left = - 6
// directionalLight.shadow.camera.bottom = - 3
// directionalLight.shadow.camera.far = 10
// directionalLight.shadow.mapSize.set(1024, 1024)

// const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(cameraHelper)

// // Tip 11
// cube.castShadow = true
// cube.receiveShadow = false

// torusKnot.castShadow = true
// torusKnot.receiveShadow = false

// sphere.castShadow = true
// sphere.receiveShadow = false

// floor.castShadow = false
// floor.receiveShadow = true

// // Tip 12
// renderer.shadowMap.autoUpdate = false
// renderer.shadowMap.needsUpdate = true

// // Tip 18
// for(let i = 0; i < 50; i++)
// {
//     const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

//     const material = new THREE.MeshNormalMaterial()
    
//     const mesh = new THREE.Mesh(geometry, material)
//     mesh.position.x = (Math.random() - 0.5) * 10
//     mesh.position.y = (Math.random() - 0.5) * 10
//     mesh.position.z = (Math.random() - 0.5) * 10
//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

//     scene.add(mesh)
// }

// // Tip 19
// for(let i = 0; i < 50; i++)
// {
//     const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

//     const material = new THREE.MeshNormalMaterial()
    
//     const mesh = new THREE.Mesh(geometry, material)
//     mesh.position.x = (Math.random() - 0.5) * 10
//     mesh.position.y = (Math.random() - 0.5) * 10
//     mesh.position.z = (Math.random() - 0.5) * 10
//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

//     scene.add(mesh)
// }

// // Tip 20
// const geometries = []


// for(let i = 0; i < 50; i++)
// {
//     const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    
//     geometry.translate(
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10
//     )
//     geometries.push(geometry)
// }

// const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
// const material = new THREE.MeshNormalMaterial()

//     const mesh = new THREE.Mesh(mergedGeometry, material)
//     mesh.position.x = (Math.random() - 0.5) * 10
//     mesh.position.y = (Math.random() - 0.5) * 10
//     mesh.position.z = (Math.random() - 0.5) * 10
//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

// scene.add(mesh)

// // Tip 22
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

const material = new THREE.MeshNormalMaterial()

const mesh = new THREE.InstancedMesh(geometry, material, 50)

scene.add(mesh)

for(let i = 0; i < 50; i++)
{
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
    )
    const quarternion = new THREE.Quaternion()
    quarternion.setFromEuler(new THREE.Euler(
        (Math.random() - 0.5) * Math.PI * 2,
        (Math.random() - 0.5) * Math.PI * 2,
        0
    ))

    const matrix = new THREE.Matrix4()
    matrix.makeRotationFromQuaternion(quarternion)
    matrix.setPosition(position)
    mesh.setMatrixAt(i, matrix)
    // const mesh = new THREE.Mesh(geometry, material)
    // mesh.position.x = (Math.random() - 0.5) * 10
    // mesh.position.y = (Math.random() - 0.5) * 10
    // mesh.position.z = (Math.random() - 0.5) * 10
    // mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
    // mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

    // scene.add(mesh)
}

// // Tip 29
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// // Tip 31, 32, 34 and 35
// const shaderGeometry = new THREE.PlaneGeometry(10, 10, 256, 256)

// const shaderMaterial = new THREE.ShaderMaterial({
//     uniforms:
//     {
//         uDisplacementTexture: { value: displacementTexture },
//         uDisplacementStrength: { value: 1.5 }
//     },
//     vertexShader: `
//         uniform sampler2D uDisplacementTexture;
//         uniform float uDisplacementStrength;

//         varying vec2 vUv;

//         void main()
//         {
//             vec4 modelPosition = modelMatrix * vec4(position, 1.0);

//             float elevation = texture2D(uDisplacementTexture, uv).r;
//             if(elevation < 0.5)
//             {
//                 elevation = 0.5;
//             }

//             modelPosition.y += elevation * uDisplacementStrength;

//             gl_Position = projectionMatrix * viewMatrix * modelPosition;

//             vUv = uv;
//         }
//     `,
//     fragmentShader: `
//         uniform sampler2D uDisplacementTexture;

//         varying vec2 vUv;

//         void main()
//         {
//             float elevation = texture2D(uDisplacementTexture, vUv).r;
//             if(elevation < 0.25)
//             {
//                 elevation = 0.25;
//             }

//             vec3 depthColor = vec3(1.0, 0.1, 0.1);
//             vec3 surfaceColor = vec3(0.1, 0.0, 0.5);
//             vec3 finalColor = vec3(0.0);
//             finalColor.r += depthColor.r + (surfaceColor.r - depthColor.r) * elevation;
//             finalColor.g += depthColor.g + (surfaceColor.g - depthColor.g) * elevation;
//             finalColor.b += depthColor.b + (surfaceColor.b - depthColor.b) * elevation;

//             gl_FragColor = vec4(finalColor, 1.0);
//         }
//     `
// })

// const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial)
// shaderMesh.rotation.x = - Math.PI * 0.5
// scene.add(shaderMesh)