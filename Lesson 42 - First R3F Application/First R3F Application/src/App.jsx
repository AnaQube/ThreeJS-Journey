import { extend, useFrame, useThree } from "@react-three/fiber"
import { useRef } from "react"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import CustomGeometry from "./CustomGeometry"

extend({ OrbitControls: OrbitControls })

export default function App() {
    const cubeRef = useRef()
    const groupRef = useRef()
    const { camera, gl } = useThree()
    
    useFrame((state, delta) => {
        cubeRef.current.rotation.y += delta

        // state.camera.position.set(Math.sin(state.clock.getElapsedTime()) * 5, 1, Math.cos(state.clock.getElapsedTime()) * 5)
        // state.camera.lookAt(0, 0, 0)
        // groupRef.current.rotation.y += delta
    })

    return <>
        <orbitControls args={ [ camera, gl.domElement ] }/>

        <directionalLight position={ [1, 2, 3] } intensity={ 1.5 }/>
        <ambientLight intensity={ 0.5 }/>

        <group ref={ groupRef }>
            <mesh position= { [2, 0, 0] } scale={ 1.5 } position-x={ 2 } rotation-y={ Math.PI * 0.23 } ref={ cubeRef }>
                <boxGeometry scale={ 1.5 }/>
                <meshStandardMaterial color='mediumpurple'/>
            </mesh>
            <mesh position-x={ -2 } rotation-y={ Math.PI * 0.23 }>
                <sphereGeometry/>
                <meshStandardMaterial color='orange'/>
            </mesh>
        </group>

        <mesh scale={ 10 } rotation-x={ -Math.PI / 2 } position-y={ -1 }>
            <planeGeometry/>
            <meshStandardMaterial color='greenyellow'/>
        </mesh>

        <CustomGeometry />
    </>
}