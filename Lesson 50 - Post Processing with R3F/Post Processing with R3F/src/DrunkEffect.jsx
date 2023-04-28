import { Effect, BlendFunction } from "postprocessing"
import { Uniform } from "three"

/**
 * 1. This effect is a CLASS not a function, so it takes no args but has a constructor. Extend the Effect class and import that.
 * 2. The shader has very specific code so you need to copy that for post processing. Make a const var for the frag shader and use ``
 * 3. WebGL 2 syntax explanation: "const" means not writable, "in" copies the actual variable to a temp one, "out" does not copy the actual
      "in" and "out" are just like pass by reference. "inout" is both read and write
      Variable explanation: "inputColor" contains current color of pixel defined by previous effects, "uv" contains render coordinates,
      "outputColor" is what you need to change in order to apply the effect (so if outputColor is red, then the effect is a red screen)
 * 4. The super() needs 3 parameters: name of the effect, frag shader, options in an object
 * 5. You also need to make the React post processing part that will use this effect -> Drunk.jsx
 * 6. If you set outputColor = inputColor, then the effect does nothing.
 * 7. Do not alter inputColor directly (not like you can). Create a vec4 color and set it to inputColor. 
      Do whatever you want to that color. Then assign it to output.
 * 8. You don't need to know what the uv coordinate is, just need to change it. Need a mainUv() function, emphasis on mainUv capitalization.
      mainUv(inout vec2 uv) can modify the x and y axis of the uv to deform the screen.
 * 9. Now, need to send the props from Experience -> Drunk -> DrunkEffect and use them in the shader.
      Destructure them in the constructor { frequency, amplitude }
      Need to send them as uniforms but it's a little different. JS has a Map object that is a mix of an array and an object. Look up the docs.
      Start creating those uniforms in the empty object of super() 3rd arg. VERY SPECIFIC SYNTAX. You can use THREE.Uniform in the Map too.
 * 10. Retrieve those uniforms in the shader and use them in the mainUv function.
 * 11. Blending colors - Right now it just looks like a green overlay. Want to use the inputColor alpha and blend function in the props of <Drunk>
       blendFunction will just be a number but forward that to the options of the super().
       Need a default blend function
   12. Animating - Add an "offset" uniform and set to 0. Retrieve it in the frag shader and add it to sin(). Kind of like a uTime uniform.
       This is not a R3F component so you can't use useFrame(). Just need an update() method which gets called automatically each frame.
       Access uniforms through this.uniforms and get the 'offset'.value
   13. Accounting for frame rate - update(renderer, inputBuffer, deltaTime) has parameters which you can use. 
       Renderer and inputBuffer are the first two params always. Just need deltaTime and add that to offset.value
*/

const fragmentShader = /* glsl */ `
    uniform float frequency;
    uniform float amplitude;
    uniform float offset;

    void mainUv(inout vec2 uv) {
        uv.y += sin(uv.x * frequency + offset) * amplitude;
    }

    void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        outputColor = vec4(0.8, 1.0, 0.5, inputColor.a);
    }
`

export default class DrunkEffect extends Effect {
    constructor({ frequency = 10, amplitude = 0.1, blendFunction = BlendFunction.DARKEN }) {
        super(
            'DrunkEffect', 
            fragmentShader, 
            {
                blendFunction,
                uniforms: new Map([
                    [ 'frequency', new Uniform(frequency) ],
                    [ 'amplitude', new Uniform(amplitude) ],
                    [ 'offset', new Uniform(0) ]
                ])
            }
        )
    }
    update(renderer, inputBuffer, deltaTime) {
        this.uniforms.get('offset').value += deltaTime
    }
}