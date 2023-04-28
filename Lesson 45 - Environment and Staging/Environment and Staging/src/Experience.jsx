import { useFrame } from '@react-three/fiber'
import { useHelper, OrbitControls, BakeShadows, softShadows, AccumulativeShadows, 
    RandomizedLight, ContactShadows, Sky, Environment, Lightformer, Stage } from '@react-three/drei'
import { useRef } from 'react'
import { Perf } from 'r3f-perf'
import * as THREE from 'three'
import { useControls } from 'leva'

/**
 * 1. This lesson is about the environment and different features in R3F like shadows and other lights.
 * 2. Background Color - There are a few different ways but might have different results (due to post processing).
 *    a. The default background is transparent so the color of the html body behind the canvas is showing. Change the html body background in CSS.
 *    b. "setClearColor" on the renderer once when it is created. Set the "onCreated" attribute of the canvas to run a function.
 *    Functions in R3F will always have the state variable as the first parameter so you can desctructure that for the { gl } renderer part.
 *    c. Using the scene property from the state, set the scene.background to a THREE.Color
 *    d. Create a R3F color by making <color> tag and setting the args to a color. R3F version of doing THREE.Color. Then, attach it to "background".
 *    You can put this tag anywhere as long as the parent of the tag is the scene. Works in this Experience class too.
 * 3. Lights - Default ThreeJS lights are supported, just add the tags. To get light helpers, you need "useHelpers" from Drei.
 *    useHelper(light reference, which ThreeJS helper to use)
 * 4. Shadows - Add the "shadows" attribute to <Canvas>, add "castShadow" attribute to the <Light> & <Mesh>, add "receiveShadow" attribute to <Mesh>
 * 5. Baking - R3F has a baking helper if shadows are static. Import "BakeShadows" and add the tag.
 * 6. Configuring shadows - You can get nested properties by replacing "." with "-" For example: shadow.mapSize would be shadow-mapSize
 *    Same for the near/far/shadow camera: shadow-camera-top/near/bottom/far/left/...
 *    You can up the size of the shadow camera to get "soft/low res" shadows.
 * 7. Soft shadows - PCSS (Percent Closer Soft Shadows) makes the shadow look more blurry based on distance.
 *    Import softShadows and call it once outside of the function. Bake shadows doesn't help since this is called every frame.
 *    softShadows modifies shaders directly so it may cause some bugs. You can also use <SoftShadows> component instead.
 * 8. Accumulative shadows - Only works on a plane. Make sure to turn off receiveShadow on the floor. Cannot be a single tag close.
 *    Spawns a black plane that needs to be a little above the floor. Make a RandomizedLight as a child (random lights in an area).
 *    Basically, just takes a bunch of shadow maps and accumulates them into one shadow. There's a bunch of parameters to play with.
 *    "frames" is how many renders to accumulate, "temporal" spreads the renders out over time, "blend" blends the last x frames
 *    Use Leva to figure out good parameters
 * 9. Contact shadows - Doesn't rely on ThreeJS shadows so deactivate shadows on <Canvas>. 
 *    Contact shadows works without light and takes the place of the floor. Move it right above the floor.
 *    Increase the scale, resolution, far (if you have far objects). You can bake shadows by setting "frames" to 1.
 *    Limitations: Shadows always come from the front, blur distance is static, performance is bad
 * 10. Sky - Import Sky from Drei. Physics based and accurate. Read the docs if you want more scientific details.
 *     Usually use Spherical coordinates rather than x,y,z because the sun will always be rotating around the scene
 *     Create a Spherical, use Vector3.setFromSpherical() and set the position to the vec3.
 *     NOTE: The shadows won't follow the sun because the light isn't the sun. Set the directional light position to the sun
 * 11. Environment Maps - WE CAN USE HDRI TEXTURES!!! It also provides lighting so turn off the lights and sky.
 *     Add the <Environment> tag with "files" attribute (x,y,z positive first then negative).
 *     Need to set "envMapIntensity" on the materials.
 * 12. Background - Add "background" attribute to <Environment>
 * 13. HDRI - Replace the files array with the path to the HDR. HDR provides better lighting than cube maps.
 * 14. Presets - Drei has a few presets that take HDRs from Poly Haven. Set the "preset" attribute to ("sunset", "night", ...)
 * 15. Custom env map - You can add meshes as a child of the <Environment> and those will affect the environment lighting.
 *     You can also add a <color> tag to the Environment to change the background/ambient color of the env map.
 * 16. What if you wanted to control the color intensity of those meshes? The color of the material can use RGB [1, 1, 1].
 *     Going beyond 1 will mean brighter intensity. There is a helper called "Lightformer" in Drei for this. Lightformer also has "form"/shapes.
 * 17. You can also animate the lightformers and adjust the roughness so that the mesh reflects the light.
 * 18. Ground - Env map feels like it's infinitely far away compared to the scene. 
 *     Add the "ground" attribute to <Environment> and remove the "background" attribute. Objects will be inside the ground so you need to move up.
 * 19. Stage - The Stage helper provides minimal default configuration for quick good looking scenes.
 */

// softShadows({
//     frustum: 3.75,
//     size: 0.005,
//     near: 9.5,
//     samples: 17,
//     rings: 11
// })

export default function Experience()
{
    const cube = useRef()
    const directionalLight = useRef()
    useHelper(directionalLight, THREE.DirectionalLightHelper, 1)
    
    useFrame((state, delta) =>
    {
        cube.current.rotation.y += delta * 0.2
        // cube.current.position.x = 2 + Math.sin(state.clock.elapsedTime)
    })

    const { color, opacity, blur } = useControls('contact shadows', {
        color: '#1d8f75',
        opacity: { value: 0.4, min: 0, max: 1 },
        blur: { value: 2.8, min: 0, max: 10}
    })

    const { sunPosition } = useControls('sky', {
        sunPosition: { value: [1, 2, 3] }
    })

    const { envMapIntensity, envMapHeight, envMapRadius, envMapScale } = useControls('envMap', {
        envMapIntensity: { value: 1, min: 0, max: 12 },
        envMapHeight: {value: 7, min: 0, max: 100}, 
        envMapRadius: {value: 20, min: 10, max: 1000},
        envMapScale: {value: 100, min: 10, max: 1000}
    })

    return <>
        {/* <Environment 
            // background
            // files={ './environmentMaps/the_sky_is_on_fire_2k.hdr' }
            preset='sunset'
            ground={{
                height: envMapHeight,
                radius: envMapRadius,
                scale: envMapScale
            }}
            // resolution={ 32 }
        > */}
            {/* <color args={ [ 'black' ] } attach='background'/> */}
            {/* <Lightformer position-z={ -5 } scale={ 10 } color='red' intensity={ 10 } form="ring"/> */}
            {/* <mesh position-z={ -2 } scale={ 10 }>
                <planeGeometry />
                <meshBasicMaterial color="red"/>
            </mesh> */}
        {/* </Environment> */}

        

        {/* <BakeShadows /> */}
        {/* <color args={ ['ivory'] } attach="background"/> */}

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        {/* <AccumulativeShadows
            position={ [0, -0.99, 0] }
            scale={ 10 } 
            color='#316d39'
            opacity={0.8}
            frames={Infinity}
            blend={100}
            temporal
        >
            <RandomizedLight
                position={ [1, 2, 3] }
                amount={ 8 }
                radius={1}
                ambient={0.5}
                intensity={1}
                bias={0.001}
            />
        </AccumulativeShadows> */}

        {/* <ContactShadows 
            position={ [0, 0, 0] }
            scale={ 10 }
            resolution={ 512 }
            far= { 5 }
            color={ color }
            opacity={ opacity }
            blur={ blur }
            frames={ 1 }
        /> */}

        {/* <directionalLight position={ sunPosition } intensity={ 1.5 } ref={ directionalLight }
            castShadow shadow-mapSize={ [1024, 1024] }
            shadow-camera-top={ 5 }
            shadow-camera-right={ 5 }
            shadow-camera-bottom={ -5 }
            shadow-camera-left={ -5 }
            shadow-camera-near={ 1 }
            shadow-camera-far={ 10 }
        />
        <ambientLight intensity={ 0.5 } /> */}

        {/* <Sky sunPosition={ sunPosition }/> */}

        {/* <mesh position-x={ - 2 } castShadow position-y={ 1 }>
            <sphereGeometry />
            <meshStandardMaterial color="orange" envMapIntensity={ envMapIntensity }/>
        </mesh>

        <mesh ref={ cube } position-x={ 2 } scale={ 1.5 } castShadow position-y={ 1 }>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" envMapIntensity={ envMapIntensity }/>
        </mesh> */}

        {/* <mesh position-y={ 0 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
            <planeGeometry />
            <meshStandardMaterial color="greenyellow" envMapIntensity={ envMapIntensity }/>
        </mesh> */}
        <Stage
            contactShadow={ { opacity: 0.2, blur: 3 } }
            environment="sunset"
            preset="portrait"
            intensity={ 2 }
        >
            <mesh position-x={ - 2 } castShadow position-y={ 1 }>
                <sphereGeometry />
                <meshStandardMaterial color="orange" envMapIntensity={ envMapIntensity }/>
            </mesh>

            <mesh ref={ cube } position-x={ 2 } scale={ 1.5 } castShadow position-y={ 1 }>
                <boxGeometry />
                <meshStandardMaterial color="mediumpurple" envMapIntensity={ envMapIntensity }/>
            </mesh>
        </Stage>
    </>
}