import { Html, OrbitControls, PivotControls, TransformControls, Text, Float, MeshReflectorMaterial } from '@react-three/drei'
import { useRef } from 'react'
/**
 * 1. Since React is based on reusable components, developers created their own components/hooks ready-made and shared them. This is Drei for R3F.
 * 2. The list of components is very long so make sure to check them before you start coding since there might be a component already.
 * 3. Install @react-three/drei dependencies. Import the OrbitControls module from drei. Damping is enabled by default. Look up the parameters to customize the controls.
 * 4. Transform controls. You could wrap the mesh in transform control to group them together but if you wanted to disable the control, it wouldn't be easy.
 *    Instead, make a reference and set the object property of the controls to the mesh reference. The mesh can be outside of the controls.
 *    Orbit controls will override the transform so the camera will move while moving the cube. Add 'makeDefault' to the orbit controls to tell R3F that orbit is the main control.
 *    This will disable the orbit controls when dragging the transform controls. Can also set transform to something else by setting mode="scale" or rotate.
 * 5. Pivot controls are for rotating and translating. It doesn't work as a group like Transform so you can't just wrap the component in a pivot control. Set the 'anchor' attribute
 *    to put the pivot at the center of the component. To render it on top of the object, set the 'depthTest' attribute to false. The anchor is relative to the object.
 *    Pivot controls have perspective so they scale with the scene by default. Set the 'fixed' to true to make the scale fixed.
 * 6. HTML - This adds stuff like tags or text boxes in the 3D scene. Html in drei adds a DOM element that sticks to the object. If you want to style it, you need to add the 'wrapperClass' attribute.
 *    The Html tag adds two divs one for the position and one for the text. If you add a wrapperClass, that will get added to the position div so you need to target the child div.
 *    Can do .label > div to target the first child div of label class. You need to add the 'center' attribute if you want the html to rotate around the center of the div.
 *    To apply perspective, set the 'distanceFactor' attribute. To occlude the tag when something is in front of it, set the 'occlude' attribute. You need to reference what objects can occlude it.
 *    (Weird bug with transform controls that causes html tags to not occlude properly)
 * 7. 3D Text - SDF Fonts: Signed Distance Field usually used in frag shaders to draw shapes. Send a 2d/3d point to a SDF function that tells you how far away it is from a shape.
 *    For example, given a center point and a radius, the SDF will tell you if the point is in the circle or outside of a circle.
 *    For fonts, devs have made textures with distance data for each letter.
 *    To actually use text, just use the <Text> tag. You can change the font by setting the property. Troika supports tff, woff, otf. Woff is the lightest. You can try and convert with transfonter
 * 8. Float - Makes the object float like a balloon
 * 9. MeshReflectorMaterial - Material reflections, read the docs
 */

export default function Experience()
{
    const cubeRef = useRef()
    const sphereRef = useRef()

    return <>
        <OrbitControls makeDefault/>
        
        <directionalLight position={ [ 1, 2, 3 ] } intensity={ 1.5 } />
        <ambientLight intensity={ 0.5 } />

        <PivotControls anchor={ [0, 0, 0] } depthTest={ false } lineWidth={ 4 } axisColors={ ['#9381ff', '#ff4d6d', '#7ae582'] } scale={ 1 } fixed={ false }>
            <mesh position-x={ - 2 } ref={ sphereRef }>
                <sphereGeometry />
                <meshStandardMaterial color="orange" />

                <Html position={ [1, 1, 0] } wrapperClass='label' center distanceFactor={ 6 } occlude={ [sphereRef, cubeRef] }>That's a sphere Okayge</Html>
            </mesh>
        </PivotControls>
        
        <mesh position-x={ 2 } scale={ 1.5 } ref={ cubeRef }>
                <boxGeometry />
                <meshStandardMaterial color="mediumpurple" />
        </mesh>
        
        <TransformControls object={ cubeRef } mode='translate'/>

        <mesh position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
            <planeGeometry />
            <MeshReflectorMaterial resolution={ 512 } blur={ [1000, 1000] } mixBlur={ 1 } mirror={ 0.75 } color='greenyellow'/>
        </mesh>

        <Float speed={ 5 } floatIntensity={ 10 }>
            <Text font='./bangers-v20-latin-regular.woff' fontSize={ 1 } color='salmon' position-y={ 2 } maxWidth={ 2 } textAlign='center'>
                I LOVE R3F
                <meshNormalMaterial />
            </Text>
        </Float>
    </>
}