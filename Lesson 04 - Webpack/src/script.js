import './style.css'
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as lil from 'lil-gui'
import { MaterialLoader } from 'three';

/* 
 *  This file contains lessons 4 to 12, covering rotation, groups, cursor event listening, OrbitalControls, Perspective/Ortho Cameras, GSAP (tween), Animations, rendering, resizing, debug, 
 *  buffergeometry
 */

/* 
 *  Debug GUI
 */

const gui = new lil.GUI({ width: 400 });
const GUIparameters = {
    color: 0xffff00,
    spin: () => {
        gsap.to(mesh.rotation, { y: mesh.rotation.y + 10, duration: 2 })
        //gsap.to(mesh.rotation, { y: 0, duration: 1, delay: 1})
    }
}

/*
 *  Scene 
 */

const scene = new THREE.Scene();
/* 
 *  Lesson 11 - Textures
 */

const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () => {
    console.log('onStart')
}
loadingManager.onLoad = () => {
    console.log('onLoad')
}
loadingManager.onProgress = () => {
    console.log('onProgress')
}

const textureLoader = new THREE.TextureLoader(loadingManager)
const colorTexture = textureLoader.load('/textures/door/color.jpg')
const alphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const heightTexture = textureLoader.load('/textures/door/height.jpg')
const normalTexture = textureLoader.load('/textures/door/normal.jpg')
const AOTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const metalTexture = textureLoader.load('/textures/door/metalness.jpg')
const roughTexture = textureLoader.load('/textures/door/roughness.jpg')
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
const matTexture = textureLoader.load('/textures/matcaps/3.png')

// colorTexture.repeat.x = 2
// colorTexture.repeat.y = 3
// colorTexture.wrapS = THREE.MirroredRepeatWrapping
// colorTexture.wrapT = THREE.MirroredRepeatWrapping

// colorTexture.offset.x = 0.5
// colorTexture.offset.y = 0.5

// colorTexture.rotation = Math.PI * 0.25
// colorTexture.center.x = 0.5
// colorTexture.center.y = 0.5

colorTexture.generateMipmaps = false
colorTexture.minFilter = THREE.NearestFilter
colorTexture.magFilter = THREE.NearestFilter

/* 
 *  Lesson 12 - Materials & Textures: The flow is texture -> material & geometry -> mesh
 *  Regular Textures give you the base color textures. Alpha Textures tell you which parts of the texture to show/hide/transparent.
 *  Normal textures are like height textures except they don't modify vertices. They give the impression that there is depth to the texture.
 *  Matcaps apply a texture that follows the camera. You can use these to simulate reflections, lighting, other stuff.
 *  Ambient Occlusion adds shadows/makes things darker from the texture. You need a second UV map for this.
 *  MeshDepth is used to apply fog effects. It hides meshes when far and shows when close. Lights do not work on this material.
 *  MeshLambertMaterial reacts to light. It will have strange line artifacts.
 *  MeshPhoneMaterial is the same but doesn't artifact and you can see light bouncing off of it. Less performant. Specular controls the color of the shiny light bounce
 *  MeshToonMaterial has the toon effect. It uses a gradient to achieve this effect. Mipmapping might mess with the gradient so you wanna turn that to nearestfilter.
 *  MeshStandardMaterial is the standard material. Supports lights, roughness, metalness. Uses PBR. Just realistic. Can't combine metalness/roughness with respective maps
 *  MeshPhysicalMaterial is the same but with clear coat.
 *  PointsMaterial is for particles. TBD
 *  ShaderMaterial/RawShaderMaterial is for custom materials
 *  Environment map is used to generate the skybox/scene. It can generate lighting, reflection, and refraction. You'll be able to see the surrounding environment on the mesh.
 */

// const material = new THREE.MeshBasicMaterial();
// material.map = colorTexture
// material.color = new THREE.Color(0x00ff00)
// material.wireframe = true
// material.opacity = 0.5
// material.transparent = true
// material.alphaMap = alphaTexture
// material.side = THREE.DoubleSide

// const material = new THREE.MeshNormalMaterial()
// material.flatShading = true
// material.normalMap = normalTexture

// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matTexture

// const material = new THREE.MeshDepthMaterial()

// const material = new THREE.MeshLambertMaterial()

// const material = new THREE.MeshPhongMaterial()
// material.shininess = 50
// material.specular = new THREE.Color('blue')

// const material = new THREE.MeshToonMaterial()
// gradientTexture.minFilter = THREE.NearestFilter
// gradientTexture.magFilter = THREE.NearestFilter
// gradientTexture.generateMipmaps = false
// material.gradientMap = gradientTexture

const material = new THREE.MeshStandardMaterial()
material.metalness = 0.7
material.roughness = 0.2
// material.map = colorTexture
// material.aoMap = AOTexture
// material.displacementMap = heightTexture
// material.displacementScale = 0.05
// material.metalnessMap = metalTexture
// material.roughnessMap = roughTexture
// material.normalMap = normalTexture
// material.normalScale.set(0.5, 0.5)
// material.alphaMap = alphaTexture
// material.transparent = true
const cubeLoader = new THREE.CubeTextureLoader()
const environmentMapTexture = cubeLoader.load([
    '/textures/environmentMaps/1/px.jpg',
    '/textures/environmentMaps/1/nx.jpg',
    '/textures/environmentMaps/1/py.jpg',
    '/textures/environmentMaps/1/ny.jpg',
    '/textures/environmentMaps/1/pz.jpg',
    '/textures/environmentMaps/1/nz.jpg',
])
material.envMap = environmentMapTexture

gui.add(material, 'roughness', 0, 1, 0.0001)
gui.add(material, 'metalness', 0, 1, 0.0001)
gui.add(material, 'aoMapIntensity', 0, 10, 0.001)
gui.add(material, 'displacementScale', 0, 1, 0.0001)

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 64, 64),
    material
)
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1, 100, 100),
    material
)
const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 64, 128),
    material
)
scene.add(sphere, plane, torus)
sphere.position.set(-1.5, 0, 0)
torus.position.set(1.5, 0, 0)

// Setting AO uv maps
plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2))
sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2))
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))



/* 
 *  Lights
 */

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(2, 3, 4)
scene.add(ambientLight, pointLight)

/*
 * Cursor
 */

const cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (e) =>  {
    cursor.x = e.clientX / sizes.width - 0.5;
    cursor.y = - (e.clientY / sizes.height - 0.5);
})

/*
 * Geometry 
 */

// const group = new THREE.Group();
// scene.add(group);

const geometry = new THREE.BufferGeometry();
const positionsArray = new Float32Array(10 * 3 * 3);
for (let i = 0; i < positionsArray.length; i++) {
    positionsArray[i] = (Math.random() - 0.5) * 4;
}
const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
geometry.setAttribute('position', positionsAttribute);

const mesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({
        map: colorTexture
    })
)
mesh.position.set(0, 0, 0)
//scene.add(mesh);

gui.add(mesh.position, 'x', -3, 3, 0.01);
gui.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('elevation');
gui.add(mesh.position, 'z', -3, 3, 0.01);
gui.add(mesh, 'visible')
gui.add(mesh.material, 'wireframe')
gui.addColor(mesh.material, 'color')
gui.add(GUIparameters, 'spin')

/* 
 *  Groups
 */

// const cube2 = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({color: 'green'})
// )
// const cube3 = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({color: 'blue'})
// )
// cube2.position.set(-2, 0, 0);
// cube3.position.set(2, 0, 0);
// group.add(mesh);
// group.add(cube2);
// group.add(cube3);

/* 
 *  Axes Helper
 */

const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

/* 
 *  Event Listeners
 */

window.addEventListener('resize', (e) => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera aspect
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update canvas size and pixel ratio
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

// Full screen double click event listener
window.addEventListener('dblclick', (e) => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    if (!fullscreenElement) {
        if (canvas.requestFullscreen)
            canvas.requestFullscreen();
        else if (canvas.webkitRequestFullscreen)
            canvas.webkitRequestFullscreen();
    }
    else {
        if (document.exitFullscreen)
            document.exitFullscreen();
        else if (canvas.webkitExitFullscreen)
            canvas.webkitExitFullscreen();
    }
})

// Hide debug event listener
window.addEventListener('keydown', (e) => {
    if (e.key === 'h') {
        if (gui._hidden)
            gui.show()
        else
            gui.hide()
    }
})

/* 
 *  Cameras
 */

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100);
// const aspectRatio = sizes.width / sizes.height;
// const camera = new THREE.OrthographicCamera(-1 * aspectRatio, 
//     1 * aspectRatio, 
//     1, -1, 0.1, 100);
camera.position.set(0, 0, 2);
scene.add(camera);

// Renderer cause you need to render to canvas
const canvas = document.querySelector('.lmao');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);

/* 
 *  Controls
 */

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true;
// controls.target.y = 1;

/*
 *  Animation 
 */

const clock = new THREE.Clock();
function tick() {
    // Clock
    const elapsedTime = clock.getElapsedTime();

    // Update objects
    sphere.rotation.y = elapsedTime * 0.1;
    plane.rotation.y = elapsedTime * 0.1;
    torus.rotation.y = elapsedTime * 0.1;

    sphere.rotation.x = elapsedTime * 0.15;
    plane.rotation.x = elapsedTime * 0.15;
    torus.rotation.x = elapsedTime * 0.15;

    // Update camera
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
    // camera.position.y = cursor.y * 5
    // camera.lookAt(mesh.position);

    controls.update()

    // Re render the scene
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}

// gsap.to(mesh.position, { x: 2, duration: 1, delay: 1 })
// gsap.to(mesh.position, { x: 0, duration: 0, delay: 2 })
tick();