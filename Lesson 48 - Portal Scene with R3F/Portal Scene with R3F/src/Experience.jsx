import { Center, OrbitControls, Sparkles, useGLTF, useTexture, shaderMaterial } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragShader from './shaders/portal/fragment.glsl'
import { extend, useFrame } from '@react-three/fiber'

/**
 * This lesson covers the previous Portal lesson in ThreeJS.
 * 
 * Model
 * 1. Import the model using "useGLTF". You can use your previous model.
 * 2. Need to separate the model out into parts since there's meshes like the pole light and portal that need different materials.
 *    These separate meshes will be in the "nodes" property of the model.
 * 3. No need to use <primitive> as you need to apply your own materials and <primitive> doesn't support materials.
 *    Make a <mesh> and set the "geometry" attribute to the geometry of the imported node.
 * 4. Load the texture of your model. Set the material "map" to the texture. Flip the y coordinates of the texture
 * 5. Pole lights - Add the pole lights as a separate mesh. It will be in the center of the scene so you have to move it.
 *    nodes.polelight.position will have the position data of the mesh. 
 *    nodes.portalLight.rotation will have rotation data
 * 
 * Colors
 * 1. R3F has a default ACESToneMapping. This scene already has filmic color management from baking.
 *    To fix this, add "flat" attribute in the <Canvas> so no tonemapping is applied.
 * 
 * Fireflies
 * 1. In the original, fireflies were created using a shader. Drei has a helper called "Sparkles". Play with the attributes
 * 
 * Portal
 * 1. Need to apply the custom shader that you made. <shaderMaterial> tag is used for custom shaders
 * 2. IMPORTANT: The vite-plugin-glsl is used to import glsl shader files. Import those shader files now.
 * 3. Inject those shader files you imported into "vertexShader" and "fragmentShader" attributes.
 * 4. It doesn't work because the shaders need uniforms (uTime, uColorStart, uColorEnd) to animate the time and colors.
 *    Inject into "uniforms" attribute. Send an object of these uniforms with value objects.
 * 5. Drei has a "shaderMaterial" to help with this.
 *    Send the uniforms first as an object, then send the vertex and frag shaders to this function.
 *    To use this as a JSX tag, you need to "extend" it using R3F. MAKE SURE THAT IT'S IN PASCAL CASE <portalMaterial> FOR THE TAG!!!
 * 6. To update the uTime, need to "useRef" to get the reference to the shader material. "useFrame" and update the uTime in the material by delta.
 */

const poleLightMaterial = new THREE.MeshBasicMaterial({
    color: '#ffffe5'
})
const PortalMaterial = shaderMaterial({
    uTime: 0,
    uColorStart: new THREE.Color('#ffffff'),
    uColorEnd: new THREE.Color('#000000')
    },
    portalVertexShader,
    portalFragShader
)

extend({ PortalMaterial: PortalMaterial })

export default function Experience()
{
    const { nodes } = useGLTF('./model/portal.glb')
    console.log(nodes)
    const bakedTexture = useTexture('./model/baked.jpg')
    bakedTexture.flipY = false

    const portalMaterial = useRef()

    useFrame((state, delta) => {
        portalMaterial.current.uTime += delta * 2
    })

    return <>
        <color attach="background" args={ [ '#030202' ] }/>
        <OrbitControls makeDefault />

        <Center>
            
            <mesh geometry={ nodes.Plane003.geometry }>
                <meshBasicMaterial map={ bakedTexture }/>
            </mesh>

            <mesh 
                geometry={ nodes.poleLightA.geometry }
                position={ nodes.poleLightA.position }
                material={ poleLightMaterial }
            />

            <mesh 
                geometry={ nodes.poleLightB.geometry }
                position={ nodes.poleLightB.position }
                material={ poleLightMaterial }
            />

            <mesh
                geometry={ nodes.portalLight.geometry }
                position={ nodes.portalLight.position }
                rotation={ nodes.portalLight.rotation }
            >
                {/* <shaderMaterial 
                    vertexShader={ portalVertexShader }
                    fragmentShader={ portalFragShader }
                    uniforms={ { 
                        uTime: { value: 0 },
                        uColorStart: { value: new THREE.Color('#ffffff') },
                        uColorEnd: { value: new THREE.Color('#000000') }
                     } }
                /> */}
                <portalMaterial ref={ portalMaterial }/>
            </mesh>

            <Sparkles 
                size={ 6 }
                scale={ [ 4, 2, 4 ] }
                position-y={ 1 }
                speed={ 0.2 }
                count={ 40 }
            />
        </Center>
    </>
}