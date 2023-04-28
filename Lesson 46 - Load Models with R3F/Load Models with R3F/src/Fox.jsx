import { useAnimations, useGLTF } from "@react-three/drei"
import { useEffect } from "react"
import { useControls } from 'leva'

export default function Fox(props) {
    const model = useGLTF('./Fox/glTF-Binary/Fox.glb')
    const animations = useAnimations(model.animations, model.scene)

    // Leva Animation control
    const { animationControls } = useControls('Fox Animation', {
        animationControls: { options: animations.names }
    })

    // First render only
    useEffect(() => {
        const action = animations.actions[animationControls]
        action
            .reset()
            .fadeIn(0.5)
            .play()

        return () => {
            action.fadeOut(0.5)
        }

        // setTimeout(() => {
        //     animations.actions.Walk.play()
        //     animations.actions.Walk.crossFadeFrom(animations.actions.Run, 1)
        // }, 2000)
    }, [animationControls])

    return <primitive {...props} object={ model.scene }/>
}