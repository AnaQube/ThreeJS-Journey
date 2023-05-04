import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

/**
 *  Shadows
 * 1. The shadows clip at a certain point due to the shadow camera being orthographic and having a size.
 *    It's not efficient to increase the size of the shadow camera and it will look bad. Instead, have the light follow the ball.
 * 2. Just update the light's current z position to the camera's position. Also, need to update the light target z position.
 *    The target will not update because ThreeJS only updates if the object is in the scene but target is not in the scene (visible).
 *    The fix is to call updateMatrixWorld() on the light target.
 */
export default function Lights()
{
    const lightRef = useRef()

    useFrame((state) => {
        lightRef.current.position.z = state.camera.position.z + 1 - 4
        lightRef.current.target.position.z = state.camera.position.z - 4
        lightRef.current.target.updateMatrixWorld()
    })

    return <>
        <directionalLight
            castShadow
            position={ [ 4, 4, 1 ] }
            intensity={ 1.5 }
            shadow-mapSize={ [ 1024, 1024 ] }
            shadow-camera-near={ 1 }
            shadow-camera-far={ 10 }
            shadow-camera-top={ 10 }
            shadow-camera-right={ 10 }
            shadow-camera-bottom={ - 10 }
            shadow-camera-left={ - 10 }
            ref = { lightRef }
        />
        <ambientLight intensity={ 0.5 } />
    </>
}