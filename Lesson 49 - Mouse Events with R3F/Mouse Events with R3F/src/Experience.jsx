import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, meshBounds, useGLTF } from '@react-three/drei'
import { useRef } from 'react'

/**
 * This lesson covers mouse/pointer/touch events. 
 * These events only trigger when your mouse is interacting (or not) with the object the event handler is attached to.
 * So a "onPointerMove" event will only trigger when your pointer is moving in (for example) a cube that has the "onPointerMove" attribute.
 * 
 * Click events
 * 1. Add an "onClick" attribute to an object. Create a function and send the function to the "onClick" attribute.
 * 2. A click only counts as mouse down and mouse up while touching the same object.
 * 
 * Event information
 * 1. In the arrow function, you get (event) => {} where event is info on the event. 
 *    Useful ones are: .point coordinates in 3d, .object which object, .eventObject which object has the event, .x/y on the canvas, .shiftKey/ctrlKey/metaKey
 * 
 * Other events
 * 1. "onContextMenu" - right click or Ctrl+Left click or pressing down on mobile for some time.
 * 2. "onDoubleClick" - double click/tap. OS determines the double click time.
 * 3. "onPointerUp" - when click is released
 * 4. "onPointerDown" - when click is started
 * 5. "onPointerOver"/"onPointerEnter" - when pointer hovers/enters the object (no difference in R3F)
 * 6. "onPointerOut"/"onPointerLeave" - when pointer leaves the object (no difference in R3F)
 * 7. "onPointerMove" - when pointer is moving inside the object
 * 8. "onPointerMissed" - when pointer clicks outside of object, if added to <Canvas> this triggers if clicking on a mesh with no mouse events
 * 
 * Occluding
 * 1. Default behavior is that click events go through meshes without events. Think of the mouse as a ray passing through objects.
 *    You can set any object to stop the ray/occlude it so maybe the mouse can click through some objects but not others.
 * 2. Set "onClick" attribute and use event.stopPropagation()
 * 3. The events that you're occluding have to match up, so if a mesh occludes "onClick" it will only stop "onClick" and not double click.
 * 
 * Cursor
 * 1. How do you get the click cursor/finger cursor? Set the "onPointerEnter" and "onPointerLeave" attributes to edit the cursor.
 *    If you have more than just your ThreeJS experience on your website, then get the gl.domElement from useThree(). 
 *    This will give you the canvas element and you can set the cursor style there. Otherwise, use document.body.style.cursor
 * 2. Drei has a helper called "useCursor"
 * 
 * Events on complex objects
 * 1. Add the hamburger by useGLTF and primitive. When you add "onClick" to it, the event will trigger through every part of the mesh (4x).
 *    You can test by using event.object which should log all the meshes that event is triggered on. 
 *    event.eventObject will return the top object that has the event handler, which is probably a group in this case.
 *    Need to stopPropagation() 
 * 
 * Performance
 * 1. Pointer events are taxing for the CPU. Keep an eye on the performance.
 * 2. "onPointerOver"/"onPointerEnter" & "onPointerOut"/"onPointerLeave" & "onPointerMove" are tested on each frame which is expensive.
 * 3. Minimise the number of event handlers.
 * 4. If the app freezes while clicking or some event, rework it.
 * 5. There is a "meshBounds" helper from Drei to create a bounding sphere. 
 *    Mouse events will be calculated on this simple sphere rather than a complex mesh. It also works for being more generous on click accuracy.
 * 6. "meshBounds" only works on single meshes so you can't use it on the hamburger.
 * 7. Set the "raycast" attribute to meshBounds.
 * 8. BVH (Bounding Volume Heirarchy) - helps with complex mesh and accurate clicks. "useBVH" from Drei.
 */

export default function Experience()
{
    const cube = useRef()
    const { gl } = useThree()

    useFrame((state, delta) =>
    {
        cube.current.rotation.y += delta * 0.2
    })

    const model = useGLTF('./hamburger.glb')
    console.log(model)

    const eventHandler = () => {
        cube.current.material.color.set(`hsl(${Math.random() * 360}, 100%, 75%)`)
    }

    return <>

        <OrbitControls makeDefault />

        <directionalLight position={ [ 1, 2, 3 ] } intensity={ 1.5 } />
        <ambientLight intensity={ 0.5 } />

        <mesh position-x={ - 2 } onClick={ (event) => event.stopPropagation() }>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
        </mesh>

        <mesh ref={ cube } 
            raycast={ meshBounds }
            position-x={ 2 } 
            scale={ 1.5 } 
            onClick={ eventHandler }
            onPointerEnter={ () => { gl.domElement.style.cursor = 'pointer' } }
            onPointerLeave={ () => { gl.domElement.style.cursor = 'default'  } }
        >
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" />
        </mesh>

        <mesh position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
            <planeGeometry />
            <meshStandardMaterial color="greenyellow" />
        </mesh>

        <primitive object={ model.scene } scale={ 0.25 } position-y={ 0.5 } 
            onClick={ (event) => {
                event.stopPropagation()
            }}
        />
    </>
}