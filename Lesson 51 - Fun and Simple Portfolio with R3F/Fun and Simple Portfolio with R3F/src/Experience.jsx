import { PresentationControls, Environment, Float, ContactShadows, Html, Text } from '@react-three/drei'
import { useGLTF } from '@react-three/drei/core/useGLTF'

/**
 * This lesson will cover a simple portfolio using R3F. The scene will contain a laptop displaying an HTML page.
 * 
 * Background
 * 1. <color> tag
 * 
 * Laptop
 * 1. Download or use the CDN and add to the scene using <primitive>
 * 
 * Environment
 * 1. <Environment> use the city preset
 * 
 * Animation
 * 1. Want the laptop to float. Need to center but <Center> wouldn't really have the screen in the center so just adjust manually.
 * 2. Wrap the <primitive> in a <Float>
 * 
 * Camera and Controls
 * 1. Want to limit the camera controls so that it's not 360 freedom. 
      Drei has a helper <PresentationControls> which manipulates the model instead of the camera. Rotates model and then goes back to initial position.
 * 2. Wrap the <Float> in <PresentationControls> and also get rid of <OrbitControls>. To make it global (drag from anywhere) add "global"
 * 3. Set 'touch-action' to none on the canvas in CSS for mobile drag issues. Set "rotation" on the component to set the default rotation.
 * 4. Need to limit the rotation now. Set "polar" attribute for up/down dragging. Set "azimuth" for left/right dragging.
 * 5. Need to Spring and play animation when dragging the laptop around. It's just like a little mass and physics and bounce.
 *    Add "config" attribute and set { mass: , tension: }
 * 6. Need to reset the laptop back to default rotation. Add "snap" attribute and do the same for "config"
 * 
 * Shadows
 * 1. Gonna use <ContactShadows>. Don't add it to the <PresentationControls> cause you don't want the shadow to move.
 * 
 * <iframe> / HTML portfolio
 * 1. Some servers don't let you use HTMLs as iframe so make sure to check with your hosting providers.
 * 2. <iframe> lets you do websites inside websites. We need the <iframe> to follow the model. Drei has an "Html" helper for this
 * 3. Insert an <Html> tag inside <primitive>. Insert an <iframe> tag inside the <Html>
 * 4. Add "transform" attribute to <Html> to make the iframe follow the model drag.
 * 5. Need to fix size since the resolution of the <iframe> is not ideal. Use CSS. Set "wrapperClass" on <Html> to add a CSS class to it.
      Need to target the <iframe> so do .htmlScreen iframe {}. Set height and width. Set border to none. Set a border-radius. Set background to black.
      Need to make the <iframe> smaller as well so set the "distanceFactor" on the <Html>
      Need to set the position and rotation MANUALLY so just test it.
 * 
 * Screen Light
 * 1. Want a orange light from screen. <rectAreaLight> should do the trick.
 * 
 * Text
 * 1. Import <Text> from Drei. Add it to <Float>
 */

export default function Experience()
{
    const computer = useGLTF('./model.gltf')

    return <>
        <Environment preset="city" />

        <color args={ ['#241a1a'] } attach="background"/>
        
        <PresentationControls 
            global 
            rotation={ [0.13, 0.1, 0] } 
            polar={ [-4.4, 0.2] } 
            azimuth={ [-1, 0.75] }
            config={ { mass: 2, tension: 400 } }
            snap={ { mass: 4, tension: 400 } }
        >
            <Float rotationIntensity={ 0.4 }>
                <rectAreaLight 
                    width={ 2.5 }
                    height={ 1.65 }
                    intensity={ 65 }
                    color={ '#ff6900' }
                    rotation={ [0.1, Math.PI, 0] }
                    position={ [0, 0.55, -1.15] }
                />
                <primitive object={ computer.scene } position-y={ -1.2 }>
                    <Html transform wrapperClass="htmlScreen" distanceFactor={ 1.17 } position={ [ 0, 1.56, -1.4 ] } rotation-x={ -0.256 }>
                        <iframe src="https://bruno-simon.com/html/" />
                    </Html> 
                </primitive>
                <Text 
                    font="./bangers-v20-latin-regular.woff" 
                    fontSize={ 1 } 
                    position={ [2, 0.75, 0.75] } 
                    rotation-y={ -1.25 }
                    maxWidth={ 2 }
                    textAlight="center"
                >
                    BRUNO SIMON
                </Text>
            </Float>
        </PresentationControls>

        <ContactShadows position-y={ -1.4 } opacity={ 0.4 } scale={ 5 } blur={ 2.4 }/>
    </>
}