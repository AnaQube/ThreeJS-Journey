import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { Bloom, DepthOfField, EffectComposer, Glitch, Noise, SSR, Vignette } from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing'
import { useControls } from 'leva'
import Drunk from './Drunk'
import { useRef } from 'react'
/**
 * This lesson covers post processing in R3F.
 * 
 * Basic Implementation
 * 1. In ThreeJS, each pass would have its own render (or multiple renders). In R3F, post processing tries to combine passes into the least amount.
 *    Since these passes are combined, they are called "effects" instead. When merged, the order of the passes are kept.
 * 2. The module for this is react-three/postprocessing. npm install @react-three/postprocessing
 * 3. Import EffectComposer from @react-three/postprocessing. Add it to JSX <EffectComposer>
 * 4. Set the "multisampling" attribute for antialiasing. Default is 8
 * 
 * Finding effects and implementing
 * 1. Check react-postprocessing and post processing docs.
      https://docs.pmnd.rs/react-postprocessing/introduction https://pmndrs.github.io/postprocessing/public/docs/
 * 
 * Effects
 * 1. <Vignette> - Import it from R3 PP. Slight bug with vignette where it doesn't work on the "white" background since the render is transparent.
      Just set the <color> in the JSX
 * 2. Blending - How colors blend, import it from postprocessing and set the "blendFunction" on <Vignette>
 * 3. <Glitch> - Glitch effect on screen, test attributes by yourself. Postprocessing has "GlitchMode" which you can set on "mode" in <Glitch>
      Lets you do constant glitch effects rather than sporadic.
 * 4. <Noise> - Import from R3 PP, kind of a radioactive noise effect. Definitely use a blend function with this (OVERLAY, SOFT_LIGHT, AVERAGE, SCREEN)
      "premultiply" multiplies with the image before applying blending, usually darker but blends better
 * 5. <Bloom> - Makes objects glow only when their RGB values go beyond 1. R3F has tonemapping that clamp color values between 0 and 1.
      Just need to deactivate tonemapping on the objects, not the whole render. Set "toneMapped" to false on the materials.
      Cannot use a color like "salmon" or "purple", need to provide a RGB array [ 13, 1, 4 ]
      The brighter it is, the more it should bloom. To do that, add the "mipmapBlur" attribute.
      An issue? is that a face that is illuminated by a directional light will be brighter in bloom. If you want uniform light, use basic materials.
      You can add an "emissive" attribute and set it to a color if you're not using RGB values. "emissiveIntensity" also controls the brightness.
      When using basic material, the emission is set through RGB array so you can just multiply the values if using Leva.
      You can also control the general intensity of <Bloom> using "intensity". You can control "luminanceThreshold" as well.
       Good technique is to use low luminanceThreshold and set the intensity low but adjust the RGB on the materials.
 * 6. <DepthOfField> - blurs closer and farther things. "focusDistance" controls distance at which image is sharp.
      "focalLength" is the distance to travel from focusDistance to reach max blur. "bokehScale" is how blurry.
      The values will be in normalized space [0, 1] according to camera near and far values.
      Not great for performance, need to play with values.
 * 7. <SSR> - add screen space reflection, meh performance. Need to set the roughness and metalness to see some reflections.
      Definitely use Leva and spread the props in <SSR> to tweak values.
 * 
 * Custom Effects
 * 1. Need to create the effect for post processing and then make it available in R3F. There are specific rules to follow for R3F.
 * 2. Going to create a drunk effect (make screen wiggle and green tint). Check pmndrs post processing links for custom effects too.
 * 3. Make another jsx file: DrunkEffect.jsx  More notes in there
 * 4. Make another jsx file: Drunk.jsx  More notes in there. Import it. Use <Drunk /> INSIDE THE <EffectComposer> TAG
 * 5. Send props to <Drunk />
 * 6. References - you can make references to the post processing effects. You cannot use useRef() because function components <Drunk> cannot have a ref.
      Instead, use "forwardRef" in the Drunk.jsx
 * 7. Use Leva to adjust those <Drunk> props.
 */

export default function Experience()
{
    // const ssrProps = useControls('SSR Effect', {
    //     temporalResolve: true,
    //     STRETCH_MISSED_RAYS: true,
    //     USE_MRT: true,
    //     USE_NORMALMAP: true,
    //     USE_ROUGHNESSMAP: true,
    //     ENABLE_JITTERING: true,
    //     ENABLE_BLUR: true,
    //     temporalResolveMix: { value: 0.9, min: 0, max: 1 },
    //     temporalResolveCorrectionMix: { value: 0.25, min: 0, max: 1 },
    //     maxSamples: { value: 0, min: 0, max: 1 },
    //     resolutionScale: { value: 1, min: 0, max: 1 },
    //     blurMix: { value: 0.5, min: 0, max: 1 },
    //     blurKernelSize: { value: 8, min: 0, max: 8 },
    //     blurSharpness: { value: 0.5, min: 0, max: 1 },
    //     rayStep: { value: 0.3, min: 0, max: 1 },
    //     intensity: { value: 1, min: 0, max: 5 },
    //     maxRoughness: { value: 0.1, min: 0, max: 1 },
    //     jitter: { value: 0.7, min: 0, max: 5 },
    //     jitterSpread: { value: 0.45, min: 0, max: 1 },
    //     jitterRough: { value: 0.1, min: 0, max: 1 },
    //     roughnessFadeOut: { value: 1, min: 0, max: 1 },
    //     rayFadeOut: { value: 0, min: 0, max: 1 },
    //     MAX_STEPS: { value: 20, min: 0, max: 20 },
    //     NUM_BINARY_SEARCH_STEPS: { value: 5, min: 0, max: 10 },
    //     maxDepthDifference: { value: 3, min: 0, max: 10 },
    //     maxDepth: { value: 1, min: 0, max: 1 },
    //     thickness: { value: 10, min: 0, max: 10 },
    //     ior: { value: 1.45, min: 0, max: 2 }
    // })
    
    const drunkRef = useRef()
    const drunkProps = useControls('Drunk Effect', {
        frequency: { value: 10, min: 0, max: 30 },
        amplitude: { value: 0.1, min: 0, max: 2 },
    })


    return <>
        <color args={ ['#ffffff'] } attach="background"/>

        
        <EffectComposer multisampling={ 8 }>
            {/* <Vignette offset={ 0.3 } darkness={ 0.9 } blendFunction={ BlendFunction.NORMAL }/> */}
            {/* <Glitch delay={ [ 0.5, 1 ] } duration={ [ 0.1, 0.3 ] } strength={ [ 0.1, 2.0 ] } mode={ GlitchMode.CONSTANT_WILD }/> */}
            {/* <Noise blendFunction={ BlendFunction.SOFT_LIGHT }/> */}
            {/* <Bloom mipmapBlur intensity={ 1.1 } luminanceThreshold={ 0.5 }/> */}
            {/* <DepthOfField focusDistance={ 0.025 } focalLength={ 0.025 } bokehScale={ 6 }/> */}
            {/* <SSR {...ssrProps}/> */}
            <Drunk {...drunkProps} ref={ drunkRef } blendFunction={ BlendFunction.DARKEN }/>
        </EffectComposer>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 1.5 } />
        <ambientLight intensity={ 0.5 } />

        <mesh castShadow position-x={ - 2 }>
            <sphereGeometry />
            <meshStandardMaterial color="orange" />
        </mesh>

        <mesh castShadow position-x={ 2 } scale={ 1.5 }>
            <boxGeometry />
            <meshStandardMaterial color="mediumpurple" toneMapped={ false } />
        </mesh>

        <mesh receiveShadow position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
            <planeGeometry />
            <meshStandardMaterial color="greenyellow" roughness={ 0 } metalness={ 0 }/>
        </mesh>

    </>
}