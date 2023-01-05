import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'

/**
 * 1. Shaders are DIFFICULT programs written in GLSL. The GPU processes these shaders. They do 2 things: 
 *    Positioning vertices of the geometry and coloring each visible pixel of the geometry
 * 2. "Pixel" isn't accurate since the render doesn't line up with the pixel screens. More on "fragments" later
 * 3. The shader gets a lot of information: coordinates, transformation, camera info, color, textures, lights, fog, etc...
 * 4. Vertex shaders deal with the vertex positions of the geometry. The same vertex shader will be used for all vertices of the geometry.
 *    Of course, some data like position will be different between vertices. 
 * 5. Data that isn't the same between vertices is called "attributes" (vertex position)
 * 6. Data that IS the same between vertices is called "uniform" (camera position, mesh position, color maybe)
 * 7. After the GPU knows what to render, it goes to the fragment shader.
 * 8. Fragment shaders deal with the color of each vertex. The same shader will be used for all vertices of the geometry.
 *    GPU receives data on what to color from fragment shader.
 * 9. Fragment shaders can get uniform data but do not get attributes. Instead, they get "varyings" from the vertex shader.
 *    Vertex shaders can share data with fragment shaders in "varyings". These "varyings" can be interpolated (averaged from surrounding pixels).
 *    They're interpolated because a fragment shader can be working on more than one vertex, hence "fragment" (i think).
 * 10. Why shaders? If you wanted a flat plane to wave like a flag, you'd have to rig an animation. Shaders can just edit the vertex positions and make the plane wave.
 *     There's a bunch more cool stuff and performance optimizations that you can do. Also, post processing is cool.
 * 11. ShaderMaterial has some code for you. RawShaderMaterial has nothing to start with. This lesson uses RawShaderMaterial.
 * 12. Instead of writing everything using backticks(`), create shader files and then import those files and set them in the rawShaderMaterial
 * 13. A linter shows potential errors with shaders. Kinda clashes if you're using some prewritten shaders.
 * 14. Webpack can't import glsl right now. Add a loader to the webpack.common.js file in bundler and restart server after.
 * 15. Some properties like wireframe, transparent, etc.. work on RawShaderMaterial but most don't
 * 16. In shaders, there is no console. GLSL is very similar to C. There is NO LOGGING. Indentation doesn't matter. Semi colons are necessary.
 *     GLSL is a typed language: Floats are super strict (no ints). Int are just ints. Can cast to float using float(int).
 *     Booleans are bools. vec2 are vectors like coordinates. vec2 has x and y properties to change.
 * 17. The attributes in the geometry are what get sent to the vertex shaders, so normal, position, and uv are sent. You can play with these attributes.
 *     You can also make your own attributes by using .setAttribute('name', BufferAttribute())
 * 18. Uniforms are good for having the same shader but different results (one object blue, other object red). 
 *     You can set uniforms in javascript for animation. Add these in the RawShaderMaterial parameter
 * 19. To get uniform in the material object: material.uniforms.nameOf.value.x/y
 * 20. Add a uniform attribute for time, then update this time in the tick function to pass time into shader
 * 21. You can pass in THREE.Vec2 and THREE.Color and probably other Three objects through uniforms
 * 22. To pass in a texutre, just send it through a uniform. Then, the shader will need to pick up the pixels from the texture and apply them in the frag shader.
 *     The frag shader needs the uv to pick up the texture colors from. The vertex can pass this through a varying.
 * 23. Looks like you might not be able to use the same uniforms in both shaders, it's pick 1?
 * 24. ShaderMaterial comes packed with projection/view/modelMatrix, attribute uv, and precision mediump float
 * 25. SINCE GLSL HAS NO LOGGING, YOU HAVE TO SEND VALUES THAT YOU WANT TO TEST AS A VARYING TO THE FRAG SHADER AND LOG IT AS A COLOR. HUH?
 * 26. GLSLIFY can import and export glsl like modules, you'll have to use glslify-loader in webpack
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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const flagTexture = textureLoader.load('/textures/flag-french.jpg')

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)

// Get number of vertices on geometry
const count = geometry.attributes.position.count
const random = new Float32Array(count)

for (let i = 0; i < count; i++)
    random[i] = Math.random()
geometry.setAttribute('aRandom', new THREE.BufferAttribute(random, 1))

// Material
const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    uniforms: {
        uFrequency: { value: new THREE.Vector2(10, 5) },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('cyan') },
        uTexture: { value: flagTexture },
        uShadow: { value: 0.5 }
    }
})

gui.add(material.uniforms.uFrequency.value, 'x', 0, 200, 0.01).name('frequencyX')
gui.add(material.uniforms.uFrequency.value, 'y', 0, 200, 0.01).name('frequencyY')
gui.add(material.uniforms.uShadow, 'value', 0, 1, 0.001).name('Shadow')

// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
mesh.scale.y = 2/3

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
camera.position.set(0.25, - 0.25, 1)
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

    // Update the material time
    material.uniforms.uTime.value = elapsedTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()