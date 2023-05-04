import create from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

/**
 * This file contains the store for global states.
 * 
 * 1. Import create from 'zustand' first.
 * 2. export default create( function ). Returns an object of data.
 * 3. Phase - 3 phases: 'ready' when just starting the game, 'playing' when any keys are pressed, 'ended' when finished
 *    This way you can tell what to display during which phase.
 * 4. Can add methods to the store. Can't just reference variables outside of the function. Need to add a 'set'
 *    to the create((set) => ) arrow function. This will let you reference the same object and set variables inside it.
 *    Then, call set(function). Very complicated. Summarized: To change something in the store, you need to store a function
 *    inside the store, then call a function in the create((set) => ) which you send a function to.
 * 5. Now you have the 'start', 'restart', and 'end' functions that set the phase to the appropriate one. But, need to call those
 *    functions whenever something happens. In Player, need to change to call 'start' when button is pressed.
 * 6. Limiting phase changes - Only certain phases can transition to other phases. For example: can't go from 'ended' to 'start'
 *    This means the set() function needs to provide the current phase which it does. set((state) => {}) where state is itself.
 *    Now you can check state.phase for which phase you are in. If you don't want to change anything, return {}
 * 7. To allow SUBSCRIPTIONS to this store for tracking changes, need a Zustand middleware 'subscribeWithSelector'
 *    import { subscribeWithSelector } from 'zustand/middleware'
 *    Place this function in create() but the function needs to encapsulate all the code that was originally in create().
 * 8. Time - Don't want to update the store every frame by setting the elapsed time. Instead, have a start and end time.
 * 9. BlockSeed - randomize the levels in Level.jsx using useMemo() and generate a new blockSeed on restart.
 */

export default create(subscribeWithSelector((set) => {
    return {
        blocksCount: 3,
        blockSeed: 0,

        /**
         * Phases
         */
        phase: 'ready',
        startTime: 0,
        endTime: 0,

        start: () => {
            set((state) => { 
                if (state.phase === 'ready')
                    return { phase: 'playing', startTime: Date.now() }
                return {}
            })
        },
        restart: () => {
            set((state) => { 
                if (state.phase === 'playing' || state.phase === 'ended')
                    return { phase: 'ready', blockSeed: Math.random() }
                return {}
            })
        },
        end: () => {
            set((state) => {
                if (state.phase === 'playing')
                    return { phase: 'ended', endTime: Date.now() } 
                return {}
            })
        }
    }
}))