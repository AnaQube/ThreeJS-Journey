import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

export default function CustomGeometry() {
    const verticesCount = 10 * 3
    const buffer = useRef()
    
    /** Called on first render only */
    useEffect(() => {
        buffer.current.computeVertexNormals()
    }, [])

    /** Use memo to save the positions of the vertices when component is being re-rendered. */
    const positions = useMemo(() => {
        const positions = new Float32Array(verticesCount * 3)

        for (let i = 0; i < verticesCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 3
        }

        return positions
    }, [])

    return <mesh>
        <bufferGeometry ref={ buffer }>
            <bufferAttribute attach='attributes-position' count={ verticesCount } itemSize={ 3 } array={ positions }/>
        </bufferGeometry>
        <meshStandardMaterial color='red' side={ THREE.DoubleSide }/>
    </mesh>
}