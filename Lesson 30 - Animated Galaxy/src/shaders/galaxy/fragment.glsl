varying vec3 vColor;

void main() {
    // float radius = distance(vec2(0.5, 0.5), gl_PointCoord);
    // radius = 1.0 - step(0.5, radius);

    // Diffuse point since the above formula has too sharp edges (step)
    // Same distance from center but multiply by 2 since the range is 0 to 0.5 because you're starting from center
    // float radius = distance(vec2(0.5, 0.5), gl_PointCoord) * 2.0;
    // radius = 1.0 - radius;

    // Light point - apply a power to the radius to make it fade faster/less diffuse
    // Increase the uSize since it'll be tiny now with pow 10
    float radius = distance(vec2(0.5, 0.5), gl_PointCoord) * 2.0;
    radius = 1.0 - radius;
    radius = pow(radius, 10.0);

    // Final Color - mix between black and the color set from attribute
    // The color sent in attribute is lerped already between the inside/outside color.
    // This frag shader will mix between black and the lerped color to get that diffuse effect on the star.
    // Another way is to set radius as the alpha in fragColor and use vColor right away, set transparent = true.
    vec3 color = mix(vec3(0.0), vColor, radius);

    gl_FragColor = vec4(color, 1.0);
}