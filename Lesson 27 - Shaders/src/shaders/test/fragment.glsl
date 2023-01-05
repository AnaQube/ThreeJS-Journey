// Precision for float: highp can have performance issues and not work on some devices
// lowp is inaccurate
// precision mediump float;

// Receive vRandom from vertex shader
// varying float vRandom;

// uniform for uColor
uniform vec3 uColor;

// uniform for texture, sampler2D type, it is vec4
uniform sampler2D uTexture;

uniform float uShadow;

varying vec2 vUV;
varying float vElevation;

// Fragment shader will color each vertex. gl_FragColor is RGBA
// Activate transparent = true on the shader if you want to color alpha
// Use the vRandom as the color value, now you have something like an elevation map
// You'll see the colors smoothly transition from green to black. This is the interpolation applied to varyings.
void main() {
    // texture2D takes in the uniform texture and the UV coordinates to pick which pixel to pick up from
    vec4 textureColor = texture2D(uTexture, vUV);
    // vertex shader sends over the z value/elevation of vertex, frag shader multiplies rgb channel to create shadows
    textureColor.rgb *= vElevation * 2.0 + uShadow;

    // gl_FragColor = vec4(uColor, 1.0);
    gl_FragColor = textureColor;
}