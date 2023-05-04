import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import * as THREE from 'three'
import useGame from "./stores/useGame";

/**
 * This component contains all the player controls, physics, and gameplay logic.
 * 
 * Basic set up - Rigid Body marble (icosahderon) with flat shading. Ball collider
 * 
 * Controls
 * 1. Want to use WASD/Arrow keys to move marble and space bar to jump. 
 *    Drei helper "KeyboardControls" needs to wrap all component that needs to be aware of key presses.
 * 2. Since you will be adding an interface that needs to listen to key presses later, <KeyboardControls> will need to be at the very top level
 *    wrapping <Canvas>.
 * 3. <KeyboardControls> has a "map" attribute array that needs each key to listen to as an object. 
 *    Each object will have a name and keys to listen to as an array.
 * 4. Need a useFrame() to check if key is pressed and apply physics while pressed. "useKeyboardControls" hook from Drei will tell what keys are pressed.
 *    Destructure the array from that hook into "subscribeKeys" and "getKeys"
 * 5. Call getKeys() in useFrame() to get the keys currently pressed. You can destructure it (Object) into the keys that you used in <KeyboardControls>
 * 
 * Physics
 * 1. Two parts to moving the ball: Torque and movement. Torque is physically based on friction but you still want to be able to move the ball midair.
 *    applyTorqueImpulse() and applyImpuse()
 * 2. Want to apply ONE torque and ONE impulse since they are vectors. Don't want to apply one force for each key held down.
 * 3. Frame rate variation: useFrame() will occur more often at higher frame rates which means force is applied more frequently.
 *    Just get deltaTime and apply it to the impulse and torque calculations
 * 4. Torque will be the "rotation" of the ball. If the horizontal axis is the x-axis, then torque on the x-axis will make the ball move forward/backward.
 * 5. Marble will keep rolling even with friction. <RigidBody> has "linearDamping" and "angularDamping"
 * 6. Jump - Don't want to do it in useFrame() otherwise the marble will keep jumping. Should jump on press of spacebar.
 *    Need to "subscribe" which lets you listen to the key state, "subscribe" to that event only once so useEffect().
 *    subscribeKeys() takes two functions: The first is the selector (which keys/events) and the second is what to run when event happens.
 *    subscribeKeys will trigger only once on each key press.
 * 7. Bug with jump - Spam spacebar and you get infinite jumps. Can use a raycaster to test distance from ground.
 *    Need to set the origin of the ray: body.current.translation() returns the body position's center. Translate it down to the bottom of the ball
 *    Need to get Ray class from Rapier. useRapier() hook from R3 rapier lets you access Rapier directly. Destructure into { rapier, world }
 *    Need to test the Ray against the Rapier "world" to test distance and collisions. 
 *    Since the ray position is slightly below the ground, the "toi" (time of impact or simply distance) will be incorrect as it hits the backside of the floor.
 *    Need to tell the Ray that the ground is solid and should impact immediately.
 * 8. Bug with subscribe or useEffect() - Every time component is changed (new component as you change code), useEffect() is called again.
 *    However, the mesh and scene remains the same so the ball is still the same ball. 
 *    Effectively, everytime you change code without refreshing, the ball jump height doubles due to hot module reloading.
 *    TO FIX THIS: Need to clean up in useEffect() by returning a function that is called on clean up.
 *    subscribeKeys() actually returns a function to unsubscribe so you can store that function in a const. Then, just call the const() in the return.
 * 
 * Camera
 * 1. Need camera to follow the ball, so you need the position of the ball. Update camera position every frame so do this in useFrame().
 *    Need the camera target to be slightly above the ball so need another Vec3. Then, access the state.camera var to get camera
 * 2. To smooth the camera movement, lerp is a good technique (get closer by 1/10 distance every instance).
 *    useState() to create ONE variable for the next camera position.
 *    IMPORTANT: Kinda late note about useState but the point of it is to create "state" (React variables) that you want to change later in the component.
 *    Using let is bad since React does not recognize those regular variables. React re-renders everytime "state" changes.
 *    The IMPORTANT thing is that these state variables persist through hot module reloading and don't reset unless a page refresh occurs.
 * 
 * Global Store
 * 1. Need to subscribe to ANY key that has events. Only keys that are bound in the KeyboardControls will trigger this subscription.
 *    Then, just call start() method in the function.
 * 2. Can check restart and end conditions in useFrame by testing the bodyPosition z and y positions. 
 *    If at the end of the level (calculate it), call end(). If below a certain y (fell off the map), call restart().
 * 3. Reset the ball on phase change to 'ready' - Need to subscribe to changes in the store. 
 *    After making it subscribable, do useGame.subscribe(). Now, it's basically the same as useKeyboardControls().
 *    To reset, need to reset ball to starting position and reset velocities.
 */


export default function Player() {
    const [ subscribeKeys, getKeys ] = useKeyboardControls()
    const body = useRef()

    /** Use rapier directly without the R3 wrapper. Get Rapier world as well. raw() gives actual world */
    const { rapier, world } = useRapier()
    const rapierWorld = world.raw()

    /** Variable created once to contain the lerped camera position */
    const [ smoothedCameraPosition ] = useState(() => { return new THREE.Vector3(10, 10, 10) })
    const [ smoothedCameraTarget ] = useState(() => { return new THREE.Vector3() })

    /** Get global store function to change phase */
    const start = useGame((state) => { return state.start })
    const end = useGame((state) => { return state.end })
    const blocksCount = useGame((state) => { return state.blocksCount })
    const restart = useGame((state) => { return state.restart })

    /** Reset the ball after triggering 'ready' */
    const reset = () => {
        body.current.setTranslation({ x: 0, y: 1, z: 0 })
        body.current.setLinvel({ x: 0, y: 0, z:0 })
        body.current.setAngvel({ x: 0, y: 0, z:0 })
    }

    /** Subscribe to key event and store, run once exactly */
    useEffect(() => {
        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (phase) => {
                if (phase === 'ready')
                    reset()
            }
        )

        const unsubscribeJump = subscribeKeys(
            (state) => state.jump,
            (value) => {
                if(value) {
                    /** Get center of ball and set ray origin to below the ball. Direction of ray will be downward */
                    const origin = body.current.translation()
                    origin.y -= 0.31
                    const direction = { x: 0, y: -1, z: 0 }
                    const ray = new rapier.Ray(origin, direction)
                    /** Test for hit castRay(ray, max TOI, solid objects) */
                    const hit = rapierWorld.castRay(ray, 10, true)

                    if (hit.toi < 0.15)
                        body.current.applyImpulse({ x: 0, y: 0.5, z: 0 })
                }
            }
        )

        const unsubscribeAnyKey = subscribeKeys(() => {
            start()
        })

        return () => {
            unsubscribeJump()
            unsubscribeAnyKey()
            unsubscribeReset()
        }
    }, [])

    useFrame((state, delta) => {
        /**
         * Controls
         */
        const { forward, backward, leftward, rightward } = getKeys()

        const impulse = { x: 0, y: 0, z: 0 }
        const torque = { x: 0, y: 0, z: 0 }

        const impulseStrength = 0.6 * delta
        const torqueStrength = 0.2 * delta

        if(forward) {
            impulse.z -= impulseStrength
            torque.x -= torqueStrength
        }
        if(backward) {
            impulse.z += impulseStrength
            torque.x += torqueStrength
        }
        if(leftward) {
            impulse.x -= impulseStrength
            torque.z += torqueStrength
        }
        if(rightward) {
            impulse.x += impulseStrength
            torque.z -= torqueStrength
        }
            
        body.current.applyImpulse(impulse)
        body.current.applyTorqueImpulse(torque)

        /**
         * Camera
         */
        const bodyPosition = body.current.translation()
        const cameraPosition = new THREE.Vector3()
        cameraPosition.copy(bodyPosition)
        cameraPosition.z += 2.25
        cameraPosition.y += 0.65
        
        const cameraTarget = new THREE.Vector3()
        cameraTarget.copy(bodyPosition)
        cameraTarget.y += 0.25

        smoothedCameraPosition.lerp(cameraPosition, 5 * delta)
        smoothedCameraTarget.lerp(cameraTarget, 5 * delta)

        state.camera.position.copy(smoothedCameraPosition)
        state.camera.lookAt(smoothedCameraTarget)

        /**
         * Phases
         */
        // If reached the last block, then end
        if(bodyPosition.z < -(blocksCount * 4 + 2))
            end()

        // If fell off, restart
        if (bodyPosition.y < -4)
            restart()
    })

    return <RigidBody 
            position={ [ 0, 1, 0 ] } 
            colliders="ball" 
            restitution={ 0.2 } 
            friction={ 1 } 
            ref={ body }
            linearDamping={ 0.5 }
            angularDamping={ 0.5 }
        > 
        <mesh castShadow>
            <icosahedronGeometry args={ [ 0.3, 1 ] }/>
            <meshStandardMaterial color="mediumpurple" flatShading/>
        </mesh>
    </RigidBody>
}