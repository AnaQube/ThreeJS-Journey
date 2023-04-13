import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import App from './App.jsx'
import * as THREE from 'three'
/**
 * 1. R3F is a React rendered. We write JSX and it gets rendered into ThreeJS. R3F sets default parameters for ThreeJS objects.
 * 2. Install react-three/fiber and three.
 * 3. Native ThreeJS uses const mesh = new THREE.Mesh() and create geometry/material. R3F uses tags to create them instead.
 * 4. How does R3F combine tags into one object? EX: Combining <boxGeometry> and <meshBasicMaterial> with the <mesh>.
 *    The 'attach' attribute tells what to attach to the mesh and that these tags shouldn't be "grouped" with <mesh>.
 * 5. R3F does some automatic checking. If the component ends with 'material', 'geometry', etc... then it will do the attach automatically.
 * 6. R3F auto updates with ThreeJS. It takes the Three classes and turns them into components. These classes will be in camel case. Specific components will be in PascalCase.
 * 7. R3F needs a canvas component to render anything first. Import that. Resize the html, body, and root using css to fill the window.
 * 8. Resizing is handled automatically. Scene, renderer, camera created automatically. Camera pulled back. Antialias, encoding done automatically. Rendering already at x FPS.
 * 9. We need an App component to use the useEffect, useState hooks.
 * 10. R3F uses default parameters for the constructor. If you want to change them, you use the args attribute and send it in array.
 *     EX: For a sphere geometry, the radius, width segments, and height segments are the first 3 parameters in the constructor. Send it using args={ [rad, width, height] }
 *     For materials, since you need to send an object... it's going to be { [ { map: ... } ] }.
 *     A simpler way is to set the attributes themselves by doing color='red' or wireframe
 * 11. You can target specific axes by doing position-x or scale-y.
 * 12. By the way, { } means injecting JS code.
 * 13. Order of ThreeJS components in R3F does not matter.
 * 14. How to animate stuff and see that the app is being rendered in real time? Use the 'useFrame' hook. In the hook, how are we supposed to get the cube and animate stuff?
 *     Do NOT change the state since that will re-render the component. Changing color and stuff is fine but doing re-renders on every frame is bad for performance.
 *     Need to get a reference by doing 'useRef' then doing whatever you want in the useFrame hook.
 * 15. Need to account for frame rate. 'useFrame' hook has (state, delta) parameters. The delta is the delta time which you can use.
 * 16. If we want to use orbit controls, we need to get the three class and then "extend" it using R3F to use it. Where is the camera and renderer to use for the orbit controls?
 *     The state from 'useThree' has it. Can get the camera and gl renderer from it by destructuring or using the whole state object.
 * 17. To create custom geometries (with buffer attributes, position arrays, blah blah) you'll have to create another component. Check CustomGeometry.jsx
 * 18. To get double side, import three and then set the side attribute in the material.
 * 19. Buffer geometry doesn't have any normals so it would black in light when using standard material. Just do computeVertexNormals.
 *     Make sure to do it in useEffect hook since the geometry doesn't exist yet.
 * 20. <Canvas> component sets up a bunch of stuff for you. Can modify the camera here. If using orthographic, use the zoom since R3F uses the left/right/up/down parameters.
 * 21. State also contains a ThreeJS Clock. Use it to get the elapsedTime.
 * 22. Antialias is on by default but you can disable in gl.
 * 23. Tone mapping is set to ACES Filmic already. Set canvas to flat if you don't want it (no tone mapping/ linear tone mapping). Import other tone mapping from Three if you want.
 * 24. Output encoding is sRGB encoding already. If you want different encoding, set it in the renderer.
 * 25. Background is transparent. It's white because that's the HTML page. Set it to something else in the css.
 * 26. Pixel ratio is handled automatically. You should clamp it still on devices with high pixel ratio (MAX 2). Set the dpr= { [1, 2] } in Canvas for min 1 max 2 pixel ratio. This is default.
 * 27. R3F has some performance improvements so check the docs.
 */
const root = ReactDOM.createRoot(document.querySelector('#root'))

const cameraSettings = {
    fov: 45,
    // zoom: 100,
    near: 0.1,
    far: 200,
    position: [3, 2, 6]
}
root.render(
    <Canvas
        // dpr={ [1, 2] }
        // flat
        // orthographic
        gl={ {
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            outputEncoding: THREE.sRGBEncoding
        } }
        camera={ cameraSettings }>
        <App />
    </Canvas>
)