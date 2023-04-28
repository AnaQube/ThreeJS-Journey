import DrunkEffect from "./DrunkEffect"
import { forwardRef } from "react"

/**
 * 1. This is a classic React JSX component, NOT A CLASS. It takes in props and ref.
 * 2. Import the DrunkEffect.jsx and instantiate it in a const. Remember that DrunkEffect is a regular JS class and not a function.
 * 3. Return a <primitive> and set the "object" attribute to the effect.
 * 4. Start using props and forward those to the DrunkEffect()
 * 5. Add forwardRef to this function so that Experience can create references to this component.
      Just add forwardRef before the function keyword. The parameters for this function will now be props AND ref.
      The ref can be FORWARDED to the primitive object containing the DrunkEffect.
 */

export default forwardRef(function Drunk(props, ref) {
    const effect = new DrunkEffect(props)

    return <primitive object={ effect } ref={ ref }/>

})