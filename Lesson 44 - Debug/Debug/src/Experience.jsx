import { OrbitControls } from '@react-three/drei'
import { button, useControls } from 'leva'
import { Perf } from 'r3f-perf'

/**
 * 1. StrictMode warns you about potential problems in your application. You need to import it from react into the index.jsx. Then wrap the Canvas in the StrictMode tag.
 * 2. Browser extension - React DevTools. Shows the React virtual DOM components. Shows the props and state stuff.
 *    Open the cogwheel in Components and turn off the filter to see all meshes, materials, etc. DevTools by default hides these small components.
 * 3. Leva - Debug UI for R3F. Install leva and import it by importing the useControls module from leva. You can add this to any component and it will be the same result.
 *    Everytime you change something in the UI, the component gets re-rendered. This is normal. The useControl returns a JSON object containing all the properties.
 *    To do ranges and steps, use an object when setting a key.
 * 4. Vectors - You could do one slider for each axis (x, y, z) but there is an easier way. When setting value, you can give an object { x: 0, y: 0 } and this shows up as a 2d slider.
 *    You could do 3 values but you don't get the joystick thing. Set 'joystick' to invertY.
 *    (Odd bug but if you change stuff too fast, an error will appear in the console. Probably due to re-rendering too many times too quickly)
 * 5. Color - Just add a string value to a key using hex and Leva will recognize it. Various formats are 'rgb(255, 255, 255)' || 'orange' || 'hsl(100deg, 100%, 50%)' || 'hsla(hsl, 0.5)'
 * 6. Visible - Add visible key val to useControls. Use it in attribute on mesh.
 * 7. Interval - Just an interval. Check myInterval
 * 8. Button - Does something when clicked. Provide a function in a button() function.
 * 9. Select - Choose between multiple options. Provide an object with options key and array of values.
 * 10. Folders - Create folders by providing in the first parameter of useControls a string useControls('folder', {...})
 *     Every folder needs a call to useControls.
 * 11. Folders inside Folders - You'll need the folder function from Leva
 * 12. Add the Leva tag outside of the canvas in index.jsx. Now you can modify attributes on Leva like 'collapsed'
 * 13. R3F-perf - This is R3F's solution for monitoring performance. Just like Stats.js. Import it and add the Perf tag in the Experience. You can set the position so it doesn't overlap with Leva.
 *     You can also use Leva to control the visibility on R3F-perf. Use a ternary operator to display it or null.
 */

export default function Experience()
{
    const { perfVisible } = useControls({
        perfVisible: true
    })

    const { position, color, visible } = useControls('sphere', {
        position: {
            value: { x: -2, y: 0 },
            step: 0.01,
            joystick: 'invertY'
        },
        color: 'red',
        visible: true,
        myInterval: {
            min: 0,
            max: 10,
            value: [4, 5]
        },
        clickMe: button(() => { console.log('ok') }),
        choice: { options: ['a', 'b', 'c'] }
    })

    const { scale } = useControls('cube', {
        scale: {
            value: 1,
            min: 0,
            max: 5,
            step: 0.01
        }
    })
    return <>
        { perfVisible ? <Perf position='top-left'/> : null}
        <OrbitControls makeDefault />

        <directionalLight position={ [ 1, 2, 3 ] } intensity={ 1.5 } />
        <ambientLight intensity={ 0.5 } />

        <mesh position={ [position.x, position.y, 0 ]} visible={ visible }>
            <sphereGeometry />
            <meshStandardMaterial color={ color } />
        </mesh>

        <mesh position-x={ 2 } scale={ scale }>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
        </mesh>

        <mesh position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
            <planeGeometry />
            <meshStandardMaterial color="greenyellow" />
        </mesh>

    </>
}