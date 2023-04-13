import * as THREE from 'three'

/**
 * 1. You cannot just open an HTML file and expect it to load your Javascript. Browsers will block it for security reasons so you can't load your models, files, etc...
 * 2. To solve this issue, you run a local server. A bundler builds your project for this local server to run.
 * 3. The old lesson 04 used webpack. This lesson will use Vite.js. It's faster to install, faster to run, less bugs, and better dev UX.
 * 4. The Vite config and behavior is pretty similar to webpack. We write code and Vite will build the website as well as optimize stuff.
 * 5. For Vite, you need Node.js. Node lets you run Javascript outside of your browser.
 * 6. If you're switching from Webpack to Vite, you'll need to edit your package.json files to build with vite instead.
 * 7. Vite also uses a vite.config.js file to configure the build. Vite also needs a script tag block in the index.html file.
 */
// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('canvas.webgl')
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)