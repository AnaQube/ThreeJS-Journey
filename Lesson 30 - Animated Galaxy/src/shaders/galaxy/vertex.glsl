uniform float uSize;
uniform float uTime;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Spin - since all of these points are based on the CENTER of the galaxy, angle and distance are calculated from that
    float angle = atan(modelPosition.x, modelPosition.z);

    // returns length of the vector created/distance from center
    float distanceToCenter = length(modelPosition.xz);

    // offset calculated since you want the points closer to center to move faster
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;

    angle += angleOffset;

    // Now we have angle and distance from center. How do we get the position on the circle? cos() and sin()
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    // Randomness
    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
    
    // Size needed for particles/points
    gl_PointSize = uSize * aScale;

    // scale (1.0) is the render height and mvPosition is the modelview position or our viewPosition
    gl_PointSize *= ( 1.0 / - viewPosition.z );

    vColor = color;
}