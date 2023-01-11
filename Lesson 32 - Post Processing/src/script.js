import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

/**
 * 1. This lesson covers how to use post processing. Post processing is effects applied to the final image.
 *    DOF, bloom, god rays, motion blur, glitch effects, outlines, color tinting, antialiasing, reflections/refractions, etc...
 * 2. Instead of the camera rendering straight to the screen, we do it first in a render target. Another camera is pointed at the render target.
 *    The render target is basically a plane and a shader material is applied. This is the post processing effect. Each effect is called a "pass".
 * 3. There will be 2 render targets since you can't write and read a texture at the same time. ThreeJS swaps between the two to write and read each pass.
 *    This is called "ping pong buffering".
 * 4. This lesson uses the EffectComposer class to apply post processing.
 * 5. Post processing is omega bad for performance since you have to do a render for each pass.
 * 6. Import EffectComposer. Import Render pass and add it to effect composer. Render the effect composer rather than the renderer.
 * 7. Gonna use DotScreenPass, GlitchPass. There's properties that you can play with for each pass so study the docs.
 * 8. RGBShift is a shader, not a pass. To use shader passes, import ShaderPass and make a new ShaderPass(RGBShiftShader)
 *    RGBShift is like chromatic abberation. The colors will be darker in the render. This is because renderer.outputEncoding doesn't work since we're using a different renderer.
 *    To fix the darker color, effectcomposer doesn't support encoding. We add a GammaCorrectionShader pass to fix the colors instead.
 * 9. The effect composer isn't resizing correctly. You can see a low res effect when you shrink the window, refresh, and stretch it.
 *    To add resizing, you need to update the effect composer in the resize event.
 * 10. The effect composer also loses antialiasing since you're applying the antialias: true in the renderer. 
 *     There are a few solutions: give up, add our own render target (doesn't work on all browsers), use an antialias pass (less performance, different result), combo of the previous 2
 *     Browsers that support render target will use that, otherwise use antialiasing pass.
 *     To add antialiasing again, first make sure you have more than one render pass, otherwise you're not using post processing in the first place. Make a WebGLRenderTarget, read the constructor doc.
 *     Add samples in constructor of WebGLRenderTarget.
 * 11. The other method is to use an antialias pass. We have the FXAA, TAA, etc... methods. Default for ThreeJS is MSAA. Here we use SMAA.
 *     Import SMAPass, construct it using SMAAPass, add it. Antialiasing has to be the LAST pass.
 * 12. The samples property in the renderTarget is ignored automatically if the browser doesn't support it. You can find stuff in renderer.capabilities (look for WebGL2). 
 *     Just check if renderer.capabilities.isWebGL2 is false and if pixel ratio is 1, then do AA pass. You can test by setting Webgl renderer to WebGL1Renderer
 * 13. Unreal bloom pass, import, add it to effect composer. There's a bunch of properties to mess with to tune down the strength of the bloom.
 *     Honestly, looks kinda weird with gamma correction on.
 * 14. Creating your own pass: Pretty much just make your own shader (uniforms, vertex, frag shader) and add it to a ShaderPass.
 *     Absolutely NEED "tDiffuse" in your uniforms to get the previous pass' texture. Since it's a texture, you need the uvs which you pass from vertex as a varying. Grab the vec4 colors from the texture.
 * 15. TintShader is the object/blueprint the pass is created from. tintPass is the material that you can modify/set properties on.
 * 16. Displacement pass: Make the uv do waves. Make a new displacementShader and a new pass from that.
 * 17. Better displacement pass: Use a texture to create displacement. Make a uniform for the normal map, get the normalMap in the fragShader, add the xy uvs to the original uvs. Now, do texture2D on the previous pass using the modified UVs.
 *     TLDR: Get previous pass' texture2D by adding uniform tDiffuse in shader object and frag shader. Do texture2D(texture, uv) to get whatever normal or tDiffuse. You can modify the uvs to do a distortion/displacement effect.
 *     To apply a texture on displacement, load the normalMap using texture2D and apply that to the tDiffuse texture2D.
 * 18. dot(vecAny, vecAny) returns the dot product of two vectors. Without going into math, right angle vectors return 0, opposite direction vectors return 1, same direction vectors return -1.
 *     This is a way to cast light.
 * 19. TLDR: Random passes -> Gamma correction -> AntiAliasing -> Bloom -> Custom passes. Post processing sucks performance wise cause you do 1 render per pass.
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
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.envMapIntensity = 2.5
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
 * Models
 */
gltfLoader.load(
    '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
    (gltf) =>
    {
        gltf.scene.scale.set(2, 2, 2)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        updateAllMaterials()
    }
)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, - 2.25)
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

    // Update effect composer
    effectComposer.setSize(sizes.width, sizes.height)
    effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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
const renderer = new THREE.WebGL1Renderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 1.5
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Post processing
 */
const renderTarget = new THREE.WebGLRenderTarget(
    800, 
    600,
    {
        // if pixel ratio == 1, then set to 2 otherwise set to 0
        samples: renderer.getPixelRatio() === 1 ? 2 : 0
    }
)

// Effect composer
const effectComposer = new EffectComposer(renderer, renderTarget)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)

const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

const dotScreenPass = new DotScreenPass()
dotScreenPass.enabled = false
effectComposer.addPass(dotScreenPass)

const glitchPass = new GlitchPass()
glitchPass.enabled = false
glitchPass.goWild = false
effectComposer.addPass(glitchPass)

const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.enabled = false
effectComposer.addPass(rgbShiftPass)

const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
effectComposer.addPass(gammaCorrectionPass)

if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)
}

const unrealBloomPass = new UnrealBloomPass()
unrealBloomPass.strength = 0.3
unrealBloomPass.radius = 1
unrealBloomPass.threshold = 0.6
effectComposer.addPass(unrealBloomPass)

gui.add(unrealBloomPass, 'enabled')
gui.add(unrealBloomPass, 'strength', 0, 2, 0.001)
gui.add(unrealBloomPass, 'radius', 0, 2, 0.001)
gui.add(unrealBloomPass, 'threshold', 0, 1, 0.001)

const TintShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTint: { value: null }
    },
    vertexShader: `
        varying vec2 vUV;

        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUV = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 uTint;

        varying vec2 vUV;

        void main() {
            vec4 color = texture2D(tDiffuse, vUV);
            color.rgb += uTint;
            gl_FragColor = color;
        }
    `
}
const tintPass = new ShaderPass(TintShader)
tintPass.material.uniforms.uTint.value = new THREE.Vector3()
effectComposer.addPass(tintPass)

gui.add(tintPass.material.uniforms.uTint.value, 'x', -1, 1, 0.001).name('Red');
gui.add(tintPass.material.uniforms.uTint.value, 'y', -1, 1, 0.001).name('Green');
gui.add(tintPass.material.uniforms.uTint.value, 'z', -1, 1, 0.001).name('Blue');

const DisplacementShader = {
    uniforms: {
        tDiffuse: { value: null },
        uNormalMap: { value: null }
    },
    vertexShader: `
        varying vec2 vUV;

        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUV = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        // uniform float uTime;
        uniform sampler2D uNormalMap;

        varying vec2 vUV;

        void main() {
            vec3 normalColor = texture2D(uNormalMap, vUV).xyz * 2.0 - 1.0;
            
            vec2 newUV = vUV + normalColor.xy * 0.1;
            vec4 color = texture2D(tDiffuse, newUV);
            
            vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
            float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
            color.rgb += lightness * 2.0;

            gl_FragColor = color;
        }
    `
}
const displacementPass = new ShaderPass(DisplacementShader)
// displacementPass.material.uniforms.uTime.value = 0
displacementPass.material.uniforms.uNormalMap.value = textureLoader.load('/textures/interfaceNormalMap.png')
effectComposer.addPass(displacementPass)


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update pass
    // displacementPass.material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()