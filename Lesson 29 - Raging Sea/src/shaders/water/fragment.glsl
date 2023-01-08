uniform float uTime;
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vHeight;

void main() {
    float mixStrength = (vHeight + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    gl_FragColor = vec4(color, 1.0);

    // Basic plain color
    // gl_FragColor = vec4(0.5, 0.8, 1.0, 1.0);
}