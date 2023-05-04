import { useKeyboardControls } from "@react-three/drei"
import useGame from "./stores/useGame"
import { useEffect, useRef } from "react"
import { addEffect } from "@react-three/fiber"

/**
 * This component will containt the UI of the game.
 * Tip: .whatever will create a div component with that class name.
 * 
 * Interface
 * 1. Interface needs a timer, restart button, keyboard interface showing WASD keys and space bar.
 *    Will be created in HTML and overlayed alongside the canvas.
 * 2. pointer-events: none so that user can't click on the interface.
 * 3. Font: Import it using HTML links in index.html. Then, add font-family to the css. 'Bebas Neue' with cursive as fallback.
 * 4. Timer: Add a div with className "timer". Use the css style to adjust it.
 * 5. Restart: Add a div with className "restart". Use the css style to adjust it. Flex box for center justified content.
 * 6. Keyboard Inputs: Copy pasted lol. "active" class makes the keyboard button brighter.
 * 7. Keyboard controls: Previously used as subscriber and getter. Just need to reactive data.
 *    useKeyboardControls((state) => { return state }) returns the keyboard presses like getKeys() function.
 *    IMPORTANT: You should select which keys you want to listen to in 'state'. 
 *    If you had some other key functions that you listen to but don't need to display it, 
 *    then this component would still be listening and re-rendering to those extra keys.
 * 8. Adding .active to the divs: Change className={ `key` } so that you can concatenate classes. Inject the active class using ternary.
 * 
 * Game Mechanics
 * 1. Need timer to count, need restart button to actually restart the game, need marble to reset if it falls, need win condition, etc.
 * 2. This spans multiple components. A global state would be helpful in that multiple components can access the global state at once.
 *    Zustand is a state manager and works with R3F. npm install zustand
 * 3. Store - Global states are called "stores". Good practice to use multiple stores and in a separate file/folder.
 *    It's used like a use Hook and named like one. useGame.jsx
 *    KeyboardControls also uses Zustand internally so it's a similar usage style.
 * 4. Get restart function from the store and set it to "onClick" on the restart div.
 * 5. To display restart div only when phase is 'ended', use a ternary operator to check the phase is 'ended' and inject the div.
 * 6. Timer - How do we update the timer on each frame? This component is not R3F as it is not in the <Canvas>. requestAnimationFrame?
 *    It's not ideal to re-render Interface every frame. Instead, just update it directly.
 *    R3F has a hook called 'addEffect' that can be used outside of the <Canvas> and will be executed after useFrame synchronously.
 *    Need to call addEffect() once so use useEffect(). ALSO, there's an unsubscribe to destroy it so use a const to get that function.
 * 7. The thing is, addEffect() snapshots the data when it is first initialized. 
 *    So, all the keyboardControls and store selectors DO NOT UPDATE in addEffect(). You can try logging those variables in addEffect().
 *    There is another way to get that data though in a non-reactive way. useGame.getState() will provide current store state.
 * 8. The actual timer part. Just create a variable using let and update it using Date.now() - startTime.
 *    Then, update the time reference to the elapsedTime.
 */
export default function Interface() {
    const forward = useKeyboardControls((state) => { return state.forward })
    const backward = useKeyboardControls((state) => { return state.backward })
    const leftward = useKeyboardControls((state) => { return state.leftward })
    const rightward = useKeyboardControls((state) => { return state.rightward })
    const jump = useKeyboardControls((state) => { return state.jump })

    /** Store and reset */
    const restart = useGame((state) => { return state.restart })
    const phase = useGame((state) => { return state.phase })

    /** Timer */
    const time = useRef()

    useEffect(() => {
        const unsubscribeEffect = addEffect(() => {
            const state = useGame.getState()

            let elapsedTime = 0
            if (state.phase === 'playing')
                elapsedTime = Date.now() - state.startTime
            else if (state.phase === 'ended')
                elapsedTime = state.endTime - state.startTime
            elapsedTime /= 1000
            elapsedTime = elapsedTime.toFixed(2)

            if (time.current)
                time.current.textContent = elapsedTime
        })
        return () => {
            unsubscribeEffect()
        }
    }, [])

    return <div className="interface">
        {/* Timer */ }
        <div className="timer" ref={ time }>0.00</div>

        {/* Restart */ }
        { phase === 'ended' ? <div className="restart" onClick={ restart }>Restart</div> : '' }

        {/* Keyboard controls */ }
        <div className="controls">
            <div className="raw">
                <div className={ `key ${ forward ? 'active' : '' }` }></div>
            </div>
            <div className="raw">
                <div className={ `key ${ leftward ? 'active' : '' }` }></div>
                <div className={ `key ${ backward ? 'active' : '' }` }></div>
                <div className={ `key ${ rightward ? 'active' : '' }` }></div>
            </div>
            <div className="raw">
                <div className={ `key large ${ jump ? 'active' : '' }` }></div>
            </div>
        </div>
    </div>

}