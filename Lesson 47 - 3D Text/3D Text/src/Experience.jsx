import { Text3D ,OrbitControls, Center, useMatcapTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * This lesson covers 3D Text. You won't be using <Text> as that is 2D.
 *
 * Text3D
 * 1. To use Text3D, import it from Drei. You need to provide a typeface font to use text.
 * 2. Centering - In Three, you calculated the bounds and centered from that. In R3F, just use the <Center> tag
 * 3. All parameters from Three can be provided as attributes (size, bevel, height, etc...)
 * 4. Matcaps - "useMatcapTexture" from Drei pulls from a github repo. First parameter is name of matcap and second parameter is the width.
 *    Returns an array of stuff. First value is the texture. Destructure it. Change the material to matcap material and set the "matcap" attribute.
 * 
 * Donuts
 * 1. Need to make a bunch of donuts randomly dispersed and sized.
 * 2. "map" method since you can't use for loops. 
 *    [...Array(100)] creates an undefined array with 100 length and then you can use it as a for loop in JSX.
 *    Inject a map method like so: [...Array(100)].map(() => { return components })
 * 3. To get random position, scale, and rotation, you can inject Math.random() into the attributes.
 * 4. You need a key attribute for each component when doing a map method. (value, index) => {  }
 * 
 * Optimization
 * 1. Geometries - Two ways: Create a geometry outside the mesh, store it in useState, then set the "geometry" attribute on the mesh.
 *    Set the "ref" attribute (why does this work) of the mesh to the setter of the useState hook.
 *    The other way: Create the geometry and material before the Experience function using vanilla ThreeJS.
 *    Since you can't get the matcap texture before the function begins, use the useEffect hook. Also, add the needs update = true.
 *    Set the encoding on the matcap texture since ThreeJS doesn't do it for you.
 * 
 * Animate the donuts
 * 1. Creating references to a bunch of objects is tricky. Going to use a <group> as a parent so that we can access all children of the group.
 *    Create a useFrame hook. Get the state and delta and then animate the children by doing a for loop.
 *    This method is weird because <group> is used for the children and not to group things.
 * 2. Another solution: References are objects with a "current" property. You will create a reference and then add the donuts to the "current".
 *    "current" will be an empty array initially. Provide useRef([]) with an empty array so that it has something instead of an object.
 *    In the <mesh> tag, "ref" attribute will have a function instead. (element) => { push to reference array }
 *    Every time the component is re-rendered, the meshes will be pushed into the array again without resetting, so it keeps adding length.
 *    Instead, use the index to place the donuts in that array index.
 */

const torusGeometry = new THREE.TorusGeometry(1, 0.6, 16, 32)
const matcap = new THREE.MeshMatcapMaterial()

export default function Experience()
{
    const [ matcaptexture ] = useMatcapTexture('7B5254_E9DCC7_B19986_C8AC91', 256)
    const donutsGroup = useRef([])

    // const [ torusGeometry, setTorusGeometry ] = useState()
    // const [ matcap, setMatcap ] = useState()

    useEffect(() => {
        matcaptexture.encoding = THREE.sRGBEncoding
        matcaptexture.needsUpdate = true

        matcap.matcap = matcaptexture
        matcap.needsUpdate = true
    }, [])

    useFrame((state, delta) => {
        for (const donut of donutsGroup.current) {
            donut.rotation.y += delta * 0.2
        }

    })

    return <>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        {/* <torusGeometry args={ [ 1, 0.6, 16, 32 ] } ref={ setTorusGeometry }/>
        <meshMatcapMaterial matcap={ matcaptexture } ref={ setMatcap }/> */}

        <Center>
            <Text3D 
                font="./fonts/helvetiker_regular.typeface.json"
                size={ 0.75 }
                height={ 0.2 }
                curveSegments={ 12 }
                bevelEnabled
                bevelThickness={ 0.02 }
                bevelSize={ 0.02 }
                bevelOffset={ 0 }
                bevelSegments={ 5 }
            >
                HELLO R3F
                <meshMatcapMaterial matcap={ matcaptexture } />
            </Text3D>
        </Center>

        {/* <group ref={ donutsGroup }> */}
            { [...Array(100)].map((value, index) => {
                return <mesh
                    ref={ (element) => donutsGroup.current[index] = element }
                    geometry={ torusGeometry }
                    material={ matcap }
                    key={ index }
                    position= { [
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10,
                        (Math.random() - 0.5) * 10
                    ] }
                    scale = {
                        0.2 + Math.random() * 0.2
                    }
                    rotation = { [
                        Math.random() * Math.PI,
                        Math.random() * Math.PI,
                        0
                    ] }
                    
                >
                    {/* <torusGeometry args={ [ 1, 0.6, 16, 32 ] }/> */}
                    {/* <meshMatcapMaterial matcap={ matcaptexture } /> */}
                </mesh>
            }) }
        {/* </group> */}
        
    </>
}