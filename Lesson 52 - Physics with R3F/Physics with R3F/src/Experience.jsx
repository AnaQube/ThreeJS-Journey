import { OrbitControls, useGLTF } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { BallCollider, CuboidCollider, CylinderCollider, Debug, InstancedRigidBodies, Physics, RigidBody } from '@react-three/rapier'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * This lesson covers using physics in R3F. The physics library is Rapier.
 * 
 * Intro
 * 1. Rapier is written in Rust and works in websites using WebAssembly. 
      Rapier is deterministic so running the simulation multiple times results in the same thing no matter what by default.
 * 2. Install @react-three/rapier.
 * 3. <Physics> - Import Physics from rapier. Wrap only meshes that you want to be affected by physics in the <Physics> tag.
 * 4. <RigidBody> - Wrap each mesh that will act as a rigid body. Setting "type" to "fixed" will make it so that it doesn't move (floors).
 *    <RigidBody> only works inside <Physics>
 * 5. Don't need to update physics each frame. Happens automatically. Rapier creates a shape that matches the geometry.
 * 6. <Debug> - Add it inside <Physics> to see some debug things (wireframe)
 * 
 * Colliders
 * 1. Using debug, the collider for the sphere is a "cuboid" created automatically. It scales automatically according to the scale of the mesh/geometry.
      It still works for rectangular cubes.
 * 2. If you add two cubes inside one <RigidBody>, it will still work and conform to the shape. 
      Even if the cubes are separated, the <RigidBody> will still work on both but they will act as one mesh.
 * 3. Changing to ball collider - "colliders" attribute default is "cuboid" so change it to "ball"
 * 4. Hull Collider - Remove the cube. Make a donut with physics and make the ball fall into the donut.
      Need a custom collider for a torus because box and sphere don't fit very well. Set "colliders" to "hull".
      This acts like shrinkwrap but doesn't fit holes or empty spaces very well.
 * 5. Trimesh Collider - Fits pretty well on anything. Avoid using trimesh with DYNAMIC rigid bodies. 
      Trimesh are empty on the inside so you might run into super fast objects clipping into trimeshes.
 * 6. Custom colliders - Turn off colliders by setting "colliders" to { false }. Rapier has classes for colliders so look up the docs.
 * 7. <CuboidCollider> - args={ [1, 1, 1] } the size is half-extent meaning the length you send to this class originates from the center.
      The real size of this CuboidCollider is 2, 2, 2. To line up the position and rotation, apply the transforms to the <RigidBody> instead.
      Scale does not work on colliders btw. You can add two <CuboidColliders> to one <RigidBody>
 * 8. <BallCollider> - Args is for radius only. No need for subdivision.
 * 9. Look up the rest in the docs yourself.
 * 
 * Forces
 * 1. Want the player to jump or move a sphere by clicking on it. Need to get a reference to the mesh to apply a force.
      useRef() to get a reference and associate it with the <RigidBody>. Create a function and use it in onClick.
 * 2. The reference you get is the actual RigidBody class so look up the Rapier docs.
 * 3. addForce() is used to apply force that lasts a long time (wind). applyImpulse() is more for sudden impacts.
 *    applyImpulse() needs a vec3 object where the length of the vector is the strength of the impulse
 * 4. Torque is for rotation. applyTorqueImpulse() needs a vec3 which acts as a Euler.
 * 
 * Object Settings
 * 1. Want to control gravity, mass, friction, etc...
 * 2. Gravity - Default is 9.8 for Earth gravity. Set the "gravity" attribute on <Physics>. 
 *    Every object can have a "gravityScale" which is how much the gravity affects the object. You can also change gravity at runtime.
 * 3. Restitution - The bounciness of an object. Default is 0 so objects don't bounce. Set "restitution" on a <RigidBody>
 *    Since the floor doesn't have restitution, objects will not retain their velocity so they will come to rest.
 * 4. Friction - How much an object slows down when sliding on something. Default value is 0.7.
 *    Set the "friction" attribute on the <RigidBody>. The floor has friction as well so it takes an average of the two Rigid bodies.
 * 5. Mass - The mass of the <RigidBody> is the sum of the masses of the Colliders. Big objects will automatically have bigger mass.
 *    Mass DOES NOT affect the speed at which objects fall (contrary to real life). If there was air friction, then mass would make a difference.
 *    Mass will influence forces. Need to create a <Collider> on the box so set colliders to false. Set "mass" attribute.
 *    What if we want the jump height to remain the same no matter the mass? Need to get mass and scale according to it.
 *    ref.current.mass()
 * 6. Position and Rotation - Should not be changed at runtime but you have 2 options if you need it:
 *    If you need to move a rigid body once, reset the velocities and do not move it while inside another rigid body.
 *    If you need to move it in time (carousel), there are kinematic "types". 
 *    "kinematicPosition" provide the next position and Rapier will update the velocities. "kinematicVelocity" provide the next velocity.
 *    The only way to move a kinematic object is by acting on it directly, so it doesn't get pushed by other objects.
 * 7. Create a long box that rotates and moves in a circle. Set "type" to "kinematicPosition". Import useFrame()
 *    setNextKinematicRotation() expects a Quarternion. Going to make a ThreeJS Euler -> Quarternion. Look at the useFrame() for example.
 *    For moving in a circle, it's trig. The x and z position will be cos and sin of the time which results in a circle.
 * 
 * Events
 * 1. "onCollisionEnter" - when RigidBody hits something
 *    "onCollisionExit" - when RigidBody separates from the thing hit
 *    "onSleep" - when RigidBody starts sleeping
 *    "onWake" - when RigidBody stops sleeping
 * 2. Create a collisionEnter function. Set the cube's "onCollisionEnter" attribute to the function.
 *    Try and play a sound on collision in the function. Audio in R3F is a bit different. Use useState() to create audio only once.
 *    Don't need a function to change the hitSound, just create the state from it.
 *    Reset the time on the sound, then play it every collision.
 * 3. Object sleeps if it stops moving. Rapier will not update it unless it colliders or you apply force.
 * 
 * Model
 * 1. A collider will be created for each part of the hamburger. Turn off colliders and make your own. Cylinder should work better.
 *    IMPORTANT: When using custom colliders, set the scale on the mesh itself rather than the RigidBody cause scale doesn't work on Colliders.
 * 2. Try a hull collider now. Some weird bug where the origin isn't set correctly so hulls are not reliable.
 * 
 * Stress Test
 * 1. Try and break your experience by adding a lot of cubes. First, add walls. Best way to do this is one <RigidBody> and 4 colliders.
 *    CuboidColliders don't use position-x, only regular position array.
 * 2. InstancedMesh - Create a bunch of meshes that are just instances of one. <instancedMesh> takes 3 args: geometry, material, number of instances.
 *    Set geo and mat to null since we will make it later. Create geometry and material tags inside the <instancedMesh>.
 *    Create a ref to the <instancedMesh>. Need to first render only (useEffect) to create the matrices for the instanced meshes.
 *    Take a look at useEffect() to see how to create matrices for each instance. Matrix4 is a combo of position, rotation, and scale.
 *    Used for moving vertices according to object transformation. ThreeJS has a method to set the pos, rot, and scale using .compose().
 *    Compose() takes in a Vec3 for position, Quarternion for rotation, and Vec3 for scale.
 *    InstancedMeshes count as ONE DRAW CALL.
 * 3. <InstancedRigidBodies> - used for instanced meshes and wraps around the tag. The cubes will explode from the center.
 *    Rapier doesn't use the Matrix4 to calculate the pos/rot/scale. Need another way to send that data. 
 *    Going to use useMemo() to create the 3 properties once and reuse them whenever refreshed.
 *    Just create a positions array that spaces out the squares by 2 on the x axis, don't touch rotation or scale.
 *    Then, send those arrays to the "positions", "rotations", "scales" attributes in <InstancedRigidBodies>
 * 
 * Extra: Joints for robot arms, tentacles, etc.
 */

export default function Experience()
{   
    const cubeRef = useRef()
    const twister = useRef()
    const [ hitSound ] = useState(() => { return new Audio('./hit.mp3') })
    const hamburger = useGLTF('./hamburger.glb')
    const cubesCount = 100
    const cubes = useRef()

    const cubeJump = () => {
        const mass = cubeRef.current.mass()

        cubeRef.current.applyImpulse({x: 0, y: 5 * mass, z: 0})
        cubeRef.current.applyTorqueImpulse({ 
            x: Math.random() - 0.5, 
            y: Math.random() - 0.5, 
            z: Math.random() - 0.5 
        })
    }

    const collisionEnter = () => {
        hitSound.currentTime = 0
        hitSound.volume = Math.random()
        hitSound.play()
    }

    const cubeTransforms = useMemo(() => {
        const positions = []
        const rotations = []
        const scales = []

        for (let i = 0; i < cubesCount; i++) {
            positions.push([ (Math.random() - 0.5) * 8, 6 + i, (Math.random() - 0.5) * 8 ])
            rotations.push([ 0, 0, 0 ])

            const scale = 0.2 + Math.random() * 0.8
            scales.push([ scale, scale, scale ])
        }

        return { positions, rotations, scales }
    }, [])

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime()

        const eulerRotation = new THREE.Euler(0, time * 2, 0)
        const quarternionRotation = new THREE.Quaternion()
        quarternionRotation.setFromEuler(eulerRotation)
        twister.current.setNextKinematicRotation(quarternionRotation)

        const angle = time * 2
        const x = Math.cos(angle) * 2
        const z = Math.sin(angle) * 2
        twister.current.setNextKinematicTranslation({ x: x, y: -0.8, z: z })
    })

    // useEffect(() => {
    //     for (let i = 0; i < cubesCount; i++) {
    //         const matrix = new THREE.Matrix4()
    //         matrix.compose(
    //             new THREE.Vector3(i * 2, 0, 0),
    //             new THREE.Quaternion,
    //             new THREE.Vector3(1, 1, 1)
    //         )
    //         cubes.current.setMatrixAt(i, matrix)
    //     }
    // }, [])

    return <>
        
        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 1.5 } />
        <ambientLight intensity={ 0.5 } />

        <Physics gravity={ [0, -9.81, 0] }>
            {/* <Debug /> */}
            <RigidBody colliders="ball" position={ [ -1.5, 2, 0 ] } gravityScale={ 1 }  restitution={ 0 }>
                <mesh castShadow>
                    <sphereGeometry />
                    <meshStandardMaterial color="orange" />
                </mesh>
            </RigidBody>

            {/* <RigidBody colliders={ false } position={ [0, 0, 0] } rotation={ [ Math.PI / 2, 0, 0] }> 
                <BallCollider args={ [1.5] }/>
                <mesh castShadow>
                    <torusGeometry args={ [1, 0.5, 16, 32] }/>
                    <meshStandardMaterial color="mediumpurple" />
                </mesh>
            </RigidBody> */}

            {/* Cube */}
            <RigidBody position={ [1.5, 2, 0] } ref={ cubeRef } restitution={ 0 } friction={ 0.7 } colliders={ false } 
                onCollisionEnter={ collisionEnter }
                onCollisionExit={ () => { console.log('exit') } }
            >
                <mesh castShadow  onClick={ cubeJump }>
                    <boxGeometry />
                    <meshStandardMaterial color="mediumpurple" />
                </mesh>
                <CuboidCollider mass={ 2 } args={ [0.5, 0.5, 0.5] }/>
            </RigidBody>

            {/* Floor */}
            <RigidBody type="fixed" position-y={ - 1.25 } friction={ 0.7 }>
                <mesh receiveShadow>
                    <boxGeometry args={ [ 10, 0.5, 10 ] } />
                    <meshStandardMaterial color="greenyellow" />
                </mesh>
            </RigidBody>

            {/* Walls */}
            <RigidBody type="fixed">
                <CuboidCollider args={ [0.5, 5, 5] } position={ [ 5, 0, 0 ] }/>
                <CuboidCollider args={ [0.5, 5, 5] } position={ [ -5, 0, 0 ]  }/>
                <CuboidCollider args={ [5, 5, 0.5] } position={ [ 0, 0, 5 ]  }/>
                <CuboidCollider args={ [5, 5, 0.5] } position={ [ 0, 0, -5 ]  }/>
            </RigidBody>

            {/* Spinner */}
            <RigidBody position={ [ 0, -0.8, 0 ] } friction={ 0 } type="kinematicPosition" ref={ twister }>
                <mesh castShadow scale={ [ 0.4, 0.4, 4 ] }>
                    <boxGeometry />
                    <meshStandardMaterial color="red" />
                </mesh>
            </RigidBody>

            <RigidBody colliders={ false } position={ [ 0, 4, 0 ] }>
                <primitive object={ hamburger.scene } scale={ 0.25 }/>
                <CylinderCollider args={ [ 0.5, 1.25 ] }/>
            </RigidBody>

            <InstancedRigidBodies positions={ cubeTransforms.positions } rotations={ cubeTransforms.rotations } scales={ cubeTransforms.scales }>
                <instancedMesh castShadow args={ [ null, null, cubesCount ] } ref={ cubes }>
                    <boxGeometry />
                    <meshStandardMaterial color="tomato" />
                </instancedMesh>
            </InstancedRigidBodies>
        </Physics>
    </>
}