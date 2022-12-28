const scene = new THREE.Scene();

// Geometry of the box, Material of the box, and the mesh which combines the two
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color : 'red' });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const sizes = {
    width: 800,
    height: 600
};

// Camera (FOV Vertical, Aspect ratio width/height)
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;
camera.position.x = 3;
camera.position.y = 3;
camera.rotation.x = -1;
camera.scale.x = 2;
scene.add(camera);

// Renderer cause you need to render to canvas
const canvas = document.querySelector('.lmao');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height);
renderer.render(scene, camera);