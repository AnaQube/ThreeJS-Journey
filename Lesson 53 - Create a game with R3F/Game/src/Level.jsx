import { Float, Text, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { forwardRef, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * This component contains the "level". The structure of the game, walls, blocks, etc is contained here.
 * 
 * 1. You can create a component within a component and use it in the same component. EX: <BlockStart> created here is used in <Level>
 * 2. To optimize a bit, you only need ONE box geometry and then every other mesh can use that box geometry.
 *    Create a box geometry using native ThreeJS and set the "geometry" attribute on the <mesh>. Then, change the scale on the <mesh>
 * 3. Create all the materials using native ThreeJS so that they're reusable.
 *    IMPORTANT: Native ThreeJS material colors aren't encoded properly. Deactivate "THREE.ColorManagement.legacyMode"
 * 4. Every additional function component here can be exported to its own file (and it SHOULD BE cause it's so much cleaner).
 *    Each function component can use all the hooks and references just like a normal component. They are each self-contained.
 * 5. Need to randomize the spinner rotation, otherwise they will all rotate the same when duplicated. 
 *    Need to create a random variable to use in the speed for the spinner, useState(). If component is re-rendered, speed will be the same.
 *    On refresh, the speed will change since refresh is not the same as a re-render. Randomize the rotation too.
 * 
 * Limbo Bar
 * 1. Duplicate the spinner and make the bar go up and down. Need to randomize the position of the bar (offset the time).
 *    sin() wave goes from 0 to 2 * Math.PI so randomize on that.
 * 2. A little bug is that if you duplicate the limbo bar, the next component's limbo bar will have the exact same position as the first's.
 *    setNextKinematicTranslation() is ABSOLUTE not relative. Use the "position" prop provided to set the bar to the position of the floor underneath.
 * 
 * Axe trap
 * 1. Swings back and forth horizontally like a dungeon axe trap. 
 * 
 * Randomness
 * 1. Want to randomize how many traps of each there are. Set count and the types of traps as props to Level. 
 *    Allows other devs to modify count/traps in the Experience. Need to EXPORT those trap functions if you want to reference those in Experience.
 *    Also, means that the Level shouldn't be the default function. Have to specify which functions you want by importing using { Level, Block... }
 *    Now, you can specify which types of traps and how many to generate in the Experience.
 * 2. Need to use useMemo() to save the count/types of blocks. Will only regenerate when count or type changes. 
 *    Just populate an array with random Block types.
 * 
 * Walls
 * 1. Just calculate the length, scale, and position. Use one wall for each side.
 * 2. The reason why you didn't make a <RigidBody> for each Block is so that you just need one <CuboidCollider> which you can make here.
 * 
 * Side note: If ball has friction of 0 and floor has friction of 0, then rotating the ball does not move it. It can't grip to the floor.
 * 
 * Randomizing Levels
 * 1. Need to get useMemo() to restart and change the level. Adding a dependency that changes on restart would get useMemo to change.
 * 
 */
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

THREE.ColorManagement.legacyMode = false

const floor1Material = new THREE.MeshStandardMaterial({ color: '#111111', metalness: 0, roughness: 0 })
const floor2Material = new THREE.MeshStandardMaterial({ color: '#222222', metalness: 0, roughness: 0 })
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: '#ff0000', metalness: 0, roughness: 1 })
const wallMaterial = new THREE.MeshStandardMaterial({ color: '#887777', metalness: 0, roughness: 0 })

/** Function for creating the start floor of the game */
function BlockStart({ position = [0, 0, 0] }) {
    return <group position={ position }>
        <Float floatIntensity={ 0.25 } rotationIntensity={ 0.25 }>
            <Text 
                scale={ 0.5 } 
                font="./bebas-neue-v9-latin-regular.woff"
                maxWidth={ 0.25 }
                lineHeight={ 0.75 }
                textAlign="right"
                position={ [ 0.75, 0.65, 0 ] }
                rotation-y={ -0.25 }
            >
                Marble Race
                <meshBasicMaterial toneMapped={ false }/>
            </Text>
        </Float>
        
        <mesh 
            geometry={ boxGeometry } 
            material={ floor1Material }
            position={ [ 0, -0.1, 0 ] } 
            scale={ [ 4, 0.2, 4 ] } 
            receiveShadow
        />
    </group>
}

/** Function for creating the trap spinner and the floor */
export function BlockSpinner({ position = [0, 0, 0] }) {
    const obstacleRef = useRef()

    const [ speed ] = useState(() => {

        return (Math.random() + 0.2) * (Math.random() < 0.5 ? -1 : 1)
    })

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime()

        const eulerRotation = new THREE.Euler(0, time * speed, 0)
        const quarternionRotation = new THREE.Quaternion()
        quarternionRotation.setFromEuler(eulerRotation)
        obstacleRef.current.setNextKinematicRotation(quarternionRotation)
    })

    return <group position={ position }>
        <mesh 
            geometry={ boxGeometry } 
            material={ floor2Material }
            position={ [ 0, -0.1, 0 ] } 
            scale={ [ 4, 0.2, 4 ] } 
            receiveShadow
        />

        <RigidBody type="kinematicPosition" position={ [0, 0.3, 0] } restitution={ 0.2 } friction={ 0 } ref={ obstacleRef }>
            <mesh
                geometry={ boxGeometry }
                material={ obstacleMaterial }
                scale={ [3.5, 0.3, 0.3] }
                castShadow
                receiveShadow
            />
        </RigidBody>
    </group>
}

/** Function for creating the limbo bar */
export function BlockLimbo({ position = [0, 0, 0] }) {
    const obstacleRef = useRef()

    const [ timeOffset ] = useState(() => {
        return Math.random() * Math.PI * 2
    })

    useFrame((state, delta) => {
        const height = Math.sin(state.clock.getElapsedTime() + timeOffset) + 1.15

        obstacleRef.current.setNextKinematicTranslation({ x: position[0], y: position[1] + height, z: position[2] })
    })

    return <group position={ position }>
        <mesh 
            geometry={ boxGeometry } 
            material={ floor2Material }
            position={ [ 0, -0.1, 0 ] } 
            scale={ [ 4, 0.2, 4 ] } 
            receiveShadow
        />

        <RigidBody type="kinematicPosition" position={ [0, 0.3, 0] } restitution={ 0.2 } friction={ 0 } ref={ obstacleRef }>
            <mesh
                geometry={ boxGeometry }
                material={ obstacleMaterial }
                scale={ [3.5, 0.3, 0.3] }
                castShadow
                receiveShadow
            />
        </RigidBody>
    </group>
}

/** Function for creating the Axe trap */
export function BlockAxe({ position = [0, 0, 0] }) {
    const obstacleRef = useRef()

    const [ timeOffset ] = useState(() => {
        return Math.random() * Math.PI * 2
    })

    useFrame((state, delta) => {
        const side = Math.sin(state.clock.getElapsedTime() + timeOffset) * 1.25

        obstacleRef.current.setNextKinematicTranslation({ x: position[0] + side, y: position[1] + 0.75, z: position[2] })
    })

    return <group position={ position }>
        <mesh 
            geometry={ boxGeometry } 
            material={ floor2Material }
            position={ [ 0, -0.1, 0 ] } 
            scale={ [ 4, 0.2, 4 ] } 
            receiveShadow
        />

        <RigidBody type="kinematicPosition" position={ [0, 0.3, 0] } restitution={ 0.2 } friction={ 0 } ref={ obstacleRef }>
            <mesh
                geometry={ boxGeometry }
                material={ obstacleMaterial }
                scale={ [1.5, 1.5, 0.3] }
                castShadow
                receiveShadow
            />
        </RigidBody>
    </group>
}

/** End block */
function BlockEnd({ position = [0, 0, 0] }) {
    const hamburger = useGLTF('./hamburger.glb')

    hamburger.scene.children.forEach((mesh) => {
        mesh.castShadow = true
    })

    return <group position={ position }>
        <Text
            scale={ 0.5 } 
            font="./bebas-neue-v9-latin-regular.woff"
            maxWidth={ 0.25 }
            lineHeight={ 0.75 }
            textAlign="right"
            position={ [ 0, 2.25, 2 ] }
            rotation-y={ -0.25 }
        >
            Finish
            <meshBasicMaterial toneMapped={ false }/>
        </Text>
        <mesh 
            geometry={ boxGeometry } 
            material={ floor1Material }
            position={ [ 0, 0, 0 ] } 
            scale={ [ 4, 0.2, 4 ] } 
            receiveShadow
        />
        <RigidBody type="fixed" colliders="hull" scale={ 0.2 } restitution={ 0.2 } friction={ 0 } position={ [0, 0.25, 0] }>
            <primitive object={ hamburger.scene }/>
        </RigidBody>
    </group>
}

/** Function to create Walls */
function Bounds({ length = 1 }) {
    return <>
        <RigidBody type='fixed' restitution={ 0.2 } friction={ 0 }>
            <mesh
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [0.3, 1.5, 4 * length] }
                position={ [2.15, 0.75, -(length * 2) + 2] }
                castShadow
            />
            <mesh
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [0.3, 1.5, 4 * length] }
                position={ [-2.15, 0.75, -(length * 2) + 2] }
                receiveShadow
            />
            <mesh
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [4, 1.5, 0.3] }
                position={ [0, 0.75, -(length * 4) + 2] }
                receiveShadow
            />
            <CuboidCollider 
                args={ [ 2, 0.1, 2 * length ] }
                position={ [ 0, -0.1, -(length * 2) + 2 ] }
                restitution={ 0.2 }
                friction={ 1 }
            />
        </RigidBody>
        
    </>
}

export function Level({ count = 5, types = [ BlockSpinner, BlockAxe, BlockLimbo ] }, seed = 0) {
    const blocks = useMemo(() => {
        const blocks = []
        
        for (let i = 0; i < count; i++) {
            const type = types[ Math.floor(Math.random() * types.length) ]
            blocks.push(type)
        }
        return blocks
    }, [count, types, seed])

    return <>
        <BlockStart position={ [ 0, 0, 0 ] }/>

        { blocks.map((Block, index) => { return <Block key={ index } position={ [0, 0, -(index + 1) * 4] }/> }) }

        <BlockEnd position={ [0, 0, -(count + 1) * 4] }/>

        <Bounds length={ count + 2 }/>
    </>
}