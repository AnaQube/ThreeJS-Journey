import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'

/**
 * 1. This lesson will cover how to modify materials and add your own stuff to threejs materials.
 * 2. 2 ways of doing it: Hook that lets us inject our own code OR recreating the material by copying and pasting.
 *    This lesson uses hook.
 * 3. To hook, do material.onBeforeCompile = () => ... This code is executed before the material compiles
 * 4. Now, you can get the vertexShader code and modify it. You can replace code in the shader using .replace()
 *    To do multiple lines of code, you can use backticks ` to write block code.
 * 5. Hooking is very much just writing your own code into the shader. You have to plan where to inject your code to make sure it compiles.
 * 6. Since you need to rotate the head, you need a rotation matrix. Provided a function that does it for you.
 * 7. To animate, we also have access to uniforms. Create uTime in the onBeforeCompile. The issue now is that we don't have access to it in tick() cause scope.
 *    To fix this scope issue, create a dummy object with uTime in it and set the uniform in the shader to the dummy object reference.
 * 8. Shadows aren't updating rn. ThreeJS uses shadow maps created from the light "camera" renders. ThreeJS then replaces all the materials with depthMaterials. Depthmaterials don't twist.
 *    If you put a plane behind your head, you will see the shadow doesn't change.
 * 9. To fix this: you will need to override the depth material with your own. Create a MeshDepthMaterial with depthPacking = RGBA and set it when you load the GLTF model using customDepthMaterial property.
 *    Now you have to hook it and inject the same code. This fixes the DROP shadow, which is the shadow behind it, but the shadow on the model itself is not correct still.
 * 10. To fix the core shadows on the MODEL, it has to do with the normals of the model. Have to rotate the normals as well. The code you need to inject has to do with beginnormal_vertex
 * 11. TLDR: Inject your own code into shader by replacing/adding code with .replace()
 *     Add your uniforms to your own custom object for scope, add uniform to the shader using material.onBeforeCompile, add uniform in the shader code too.
 *     Update shadows in the depth material using your own custom depth material. Update shadows in the normals of the model as well.
 *     You can add the shaders to different files and inejct that as well.
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
 * Loaders
 */
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.envMapIntensity = 1
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.jpg',
    '/textures/environmentMaps/0/nx.jpg',
    '/textures/environmentMaps/0/py.jpg',
    '/textures/environmentMaps/0/ny.jpg',
    '/textures/environmentMaps/0/pz.jpg',
    '/textures/environmentMaps/0/nz.jpg'
])
environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Material
 */

// Textures
const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg')
mapTexture.encoding = THREE.sRGBEncoding

const normalTexture = textureLoader.load('/models/LeePerrySmith/normal.jpg')

// Material
const material = new THREE.MeshStandardMaterial( {
    map: mapTexture,
    normalMap: normalTexture
})

const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking
})

const customUniforms = {
    uTime: { value: 0 },
    uSpeed: { value: 0.9 }
}

material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime
    shader.uniforms.uSpeed = customUniforms.uSpeed

    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>', 
        `
            #include <common>

            uniform float uTime;
            uniform float uSpeed;

            mat2 get2dRotateMatrix(float _angle) {
                return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
            }
        `
    )
    shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `
            #include <beginnormal_vertex>

            float angle = (position.y + uTime) * uSpeed;
            mat2 rotateMatrix = get2dRotateMatrix(angle);

            objectNormal.xz = rotateMatrix * objectNormal.xz;
        `
    )
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>', 
        `
            #include <begin_vertex>

            transformed.xz = rotateMatrix * transformed.xz;
        `
    )
}

depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime
    shader.uniforms.uSpeed = customUniforms.uSpeed

    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>', 
        `
            #include <common>

            uniform float uTime;
            uniform float uSpeed;

            mat2 get2dRotateMatrix(float _angle) {
                return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
            }
        `
    )
    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>', 
        `
            #include <begin_vertex>

            float angle = (position.y + uTime) * uSpeed;
            mat2 rotateMatrix = get2dRotateMatrix(angle);

            transformed.xz = rotateMatrix * transformed.xz;
        `
    )
}

gui.add(customUniforms.uSpeed, 'value', 0.0, 10.0, '0.001')
/**
 * Models
 */
gltfLoader.load(
    '/models/LeePerrySmith/LeePerrySmith.glb',
    (gltf) =>
    {
        // Model
        const mesh = gltf.scene.children[0]
        mesh.rotation.y = Math.PI * 0.5
        mesh.material = material
        mesh.customDepthMaterial = depthMaterial
        scene.add(mesh)

        // Update materials
        updateAllMaterials()
    }
)

/**
 * Plane
 */
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15, 15),
    new THREE.MeshStandardMaterial()
)
plane.rotation.y = Math.PI
plane.position.set(0, -5, 5)
scene.add(plane)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, - 2.25)
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
camera.position.set(4, 1, - 4)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update uniform
    customUniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()