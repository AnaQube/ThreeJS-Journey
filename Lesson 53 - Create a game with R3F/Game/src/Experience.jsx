import Lights from './Lights.jsx'
import { Perf } from 'r3f-perf'
import { useControls } from 'leva'
import { Level, BlockSpinner } from './Level.jsx'
import { Debug, Physics } from '@react-three/rapier'
import Player from './Player.jsx'
import useGame from './stores/useGame.jsx'
import Effects from './Effects.jsx'

// console.log(import.meta.env)
/**
 * This lesson covers the final project where the player controls a marble that runs down a hall.
 * 
 * Intro
 * 1. The hall will be composed of multiple squares that each have a trap on them. It could be a moving wall, blender, etc.
 *    The goal is the last square when the marble reaches it.
 * 
 * Level.jsx
 * 1. Will contain all the meshes, blocks, physics for this game.
 * 
 * Global state
 * 1. To get information from the store, import the hook and use a selector to get specific data from the store.
 * 2. Do not use the entire object since any data changes will re-render Experience component. Need to select specific data.
 * 3. Get the blockSeed initially from the store and send it to Level.
 */

export default function Experience()
{
    // Get data from store
    const blocksCount = useGame((state) => { return state.blocksCount })
    const blockSeed = useGame((state) => { return state.blockSeed })
    return <>
        {/* <Perf position="top-left"/> */}

        <color attach="background" args={ [ '#252731' ] }/>

        <Physics>
            {/* <Debug /> */}
            <Level count={ blocksCount } seed={ blockSeed }/>
            <Player />
        </Physics>
        
        <Lights />
        <Effects />
    </>
}