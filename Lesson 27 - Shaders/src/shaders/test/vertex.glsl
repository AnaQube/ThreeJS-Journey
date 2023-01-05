// These 3 matrices transforms position to clip space for gl_Position
// modelMatrix applies transformations relative to the Mesh (position, rotation, scale)
// viewMatrix applies transformations relative to the camera (how far the object is from camera, rotation, FOV, etc...)
// projectionMatrix transforms these coordinates to clip space
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat4 modelMatrix;
uniform vec2 uFrequency;
uniform float uTime;

// XYZ position of the vertex
// attribute vec3 position;
// Custom attribute added to geometry
// attribute float aRandom;

// attribute for uv coords
// attribute vec2 uv;

// Varying to send to frag shader, just a copy of aRandom, copy of uv
varying float vRandom;
varying vec2 vUV;
varying float vElevation;

// A lot of misc functions like: sin, cos, max, min, pow, exp, normalize, reflect...
// Not a lot of good documentation: Shaderific, The Book of Shaders - Glossary

// Function
float loremIpsum(float c, float d) {
    float a = 1.0;
    float b = 2.0;

    float e = c + d;

    return a + b + e;
}

// The main function is called automatically and doesn't return anything
// gl_Position already exists, we just assign a value to it. It contains the position of the vertex on the render
// gl_Position is simply a vec4, XYZW
// Vertices are positioned in clip space which is like a box. The w is the homogeneous coordinate which deals with perspective.
// gl_Position converts position vec3 to vec4
void main() {
    // Vec2 good for coordinates
    vec2 foo = vec2(1.0, 2.0);
    foo.x = 1.0;
    foo.y = 2.0;
    foo *= 2.0; // multiplies both values by 2

    vec3 food = vec3(0.0); // all values are 0.0
    vec3 bar = vec3(1.0, 2.0, 3.0);

    // Vec3 good for RGB, XYZ (rgb and xyz are interchangeable)
    vec3 purpleColor = vec3(0.0);
    purpleColor.r = 0.5;
    purpleColor.b = 1.0;

    // Vec3 can be created from vec2
    vec3 partial = vec3(foo, 3.0);

    // Vec2 can be created from vec3 by selecting some variables "swizzle"
    vec2 opposite = partial.yx;

    // Vec4 good for RGBA, XYZW. W since there is no value after z.
    vec4 fourVal = vec4(1.0, 2.0, 3.0, 4.0);
    float barW = fourVal.w;
    vec4 fourSwiz = vec4(fourVal.zw, vec2(5.0, 6.0));

    float result = loremIpsum(4.0, 5.0);

    // It is multiplied in reverse order so it's actually: vec4 * model * view * projection
    // This order is SET and cannot be changed.
    // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    // Doing the above gl_Position calculation on separate lines, first calculate modelMatrix * vec4, then viewMatrix * result and so on...
    // Now you can play with vertex positions before the view is applied
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // modelPosition.z += aRandom * 0.1;
    // modelPosition.z += sin(modelPosition.x * uFrequency.x + uTime) * 0.1;
    // modelPosition.z += sin(modelPosition.y * uFrequency.y + uTime) * 0.1;

    float elevation = sin(modelPosition.x * uFrequency.x + uTime) * 0.1;
    elevation += sin(modelPosition.y * uFrequency.y + uTime) * 0.1;
    modelPosition.z += elevation;
    vElevation = elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    // vRandom = aRandom;
    vUV = uv;

    gl_Position = projectedPosition;
}