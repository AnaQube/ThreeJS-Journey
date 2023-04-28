import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import Model from './Model'
import { Suspense } from 'react'
import PlaceHolder from './Placeholder'
import Hamburger from './Hamburger'
import Fox from './Fox'

/**
 * 1. This lesson covers GLTF loading, models, and animation.
 * 
 * Loading a Model
 * 1. "useLoader" hook - Import from R3F. Import GLTFLoader as well. Assign the useLoader hook to a const variable and give it the path to the model.
 * 2. To get the model into the actual scene, you need to use <primitive>. This tag is a container supported by R3F and displays whatever we give it.
 *    Add an "object" attribute and assign it the model.scene. Scale it down as well
 * 3. For DRACO compressed models, we need the Draco Loader. Old way is to do a callback function as the 3rd arg in useLoader hook.
 * 
 * Lazy Loading
 * 1. R3F isn't rendering until everything is done loading. To use lazy loading, you need the <Suspense> tag.
 *    The <Suspense> tag applies to the whole component so you need to separate the model into another component to apply lazy loading.
 *    Make another component and move all the GLTF loading, <primitive>, and imports into that component.
 *    Import Suspense from react and wrap the model component in <Suspense> tags.
 * 2. Fallback - What if you want the user to see something while it's loading? The "fallback" attribute in the <Suspense> tag handles this.
 *    Inject an entire mesh component into the "fallback" attribute.
 * 3. You can add props and destructure them in a Placeholder component. Send props like "position-y scale rotation"
 *    The constructor accepts props and you can directly send them into the <mesh> using the spread operator EX: <mesh {...props}>
 * 
 * GLTF Loading with Drei
 * 1. Import "useGLTF" from Drei. Set a const to useGLTF('path'). This also works with Draco compression. MUCH SIMPLER
 * 2. Preloading - Models only start loading when the component is created. If the component isn't shown yet, then the model will need to load.
 *    The "useGLTF" function has a method for preloading called "preload". You can call this function anywhere in the component it's in.
 * 
 * Multiple Instances
 * 1. Drei has a <Clone> helper. This replaces the <primitive> tag and you can just copy and paste these.
 * 2. The clones all use the same geometry but the draw calls and tris will still go up. There's probably a way to reuse materials.
 * 
 * GLTF to component
 * 1. What if you wanted to change the color of a specific part of the model (assuming that it's not one big mesh/material)?
 *    You need to traverse and separate out the model into parts/components. GLTF to R3F helps with this. https://gltf.pmnd.rs/
 *    Copy and paste that code into a new component.
 * 2. The website separates every part into a <mesh> and <group>. Now you can edit every mesh's material, position, etc.
 * 3. Edit the shadow-normalBias on the directional light.
 * 
 * Animation
 * 1. "useAnimations" from Drei provides animations from the model. Set a const to useAnimations(model.animations, model.scene)
 * 2. You need to call the animation once the component is rendered, so "useEffect" hook works here.
 *    animations.action.NameOfAction.play()
 * 3. If you want to fade/mix animations, use the "crossFadeFrom(animationFrom, time)" method on the animation.
 *    First play the animation that you want next, then call cross fade on that animation.
 * 4. Animation controls - Use Leva. Provide the useControls function. In the animationControls, it will be an object.
 *    You can use animations.names and that will provide all of the animation names as an array.
 * 5. How do you change the animation when the user changes it in Leva? Provide useEffect with a dependency on the Leva const.
 * 6. BUT, the animations are blending together as you change them. Animations need to be stopped before playing another.
 *    Need to fadeOut and fadeIn between animations. You can do action.fadeIn(time).play() and combine those two functions.
 *    To fade out and get rid of the previous animation, useEffect provides a return function which runs when the dependency changes(or component is destroyed)
 *    This is the clean up phase. Do action.fadeOut(time) and that's it. Also, need to call reset on the action.play() so that the animation resets.
 *    action.reset().fadeIn(time).play()
 */

export default function Experience()
{
    return <>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 1.5 } shadow-normalBias={ 0.04 }/>
        <ambientLight intensity={ 0.5 } />

        <mesh receiveShadow position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
            <planeGeometry />
            <meshStandardMaterial color="greenyellow" />
        </mesh>

        <Suspense fallback={ <PlaceHolder position-y={0.5} scale={ [2, 3, 2] }/> }>
            {/* <Model /> */}
            <Hamburger scale={ 0.35 }/>
        </Suspense>

        <Suspense fallback={ <PlaceHolder position-y={0.5} scale={ [2, 3, 2] }/> }>
            {/* <Model /> */}
            <Fox scale={ 0.02 } position={ [-2.5, 0, 2.5] } rotation-y={ 0.3 }/>
        </Suspense>
    </>
}