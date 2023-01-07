varying vec2 vUV;
uniform float uTest;
#define PI 3.141592653589793238462433

// Random function
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

// Rotate function
vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//

vec4 permute(vec4 x)
{
    return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

void main()
{
    // Pattern 3
    // float strength = vUV.x;

    // Pattern 4
    // float strength = vUV.y;

    // Pattern 5
    // float strength = 1.0 - vUV.y;

    // Pattern 6
    // float strength = vUV.y * 10.0;

    // Pattern 7 - Section gradients
    // float strength = mod(vUV.y * 10.0, 1.0);

    // Pattern 8 - Hard limit gradients
    // float strength = step(0.5, mod(vUV.y * 10.0, 1.0));

    // Pattern 9 - Less white
    // float strength = step(0.8, mod(vUV.y * 10.0, 1.0));

    // Pattern 10 - Vertical less white
    // float strength = step(0.8, mod(vUV.x * 10.0, 1.0));

    // Pattern 11 - Net, add vertical and horizontal
    // float barX = step(0.8, mod(vUV.x * 10.0, 1.0));
    // float barY = step(0.8, mod(vUV.y * 10.0, 1.0));
    
    // float strength = barX + barY;

    // Pattern 12 - Net intersections, multiply produces only overlapping white
    // float barX = step(0.8, mod(vUV.x * 10.0, 1.0));
    // float barY = step(0.8, mod(vUV.y * 10.0, 1.0));
    
    // float strength = barX * barY;

    // Pattern 13 - Dashes, make x dashes (length) longer
    // float barX = step(0.4, mod(vUV.x * 10.0, 1.0));
    // float barY = step(0.8, mod(vUV.y * 10.0, 1.0));
    
    // float strength = barX * barY;

    // Pattern 14 - Inverted L shapes, refactored here since previously barY was making the gaps in the X
    // Now, since we need 4 patterns, I combined 2 patterns into each barX/barY
    // float barX = step(0.4, mod(vUV.x * 10.0, 1.0)); // Vertical fat bars
    // barX *= step(0.8, mod(vUV.y * 10.0, 1.0)); // Horizontal thin bars for intersection, result is thin horizontal dashes
    
    // float barY = step(0.4, mod(vUV.y * 10.0, 1.0)); // Horizontal fat bars
    // barY *= step(0.8, mod(vUV.x * 10.0, 1.0)); // Vertical thin bars for intersection, result is thin vertical dashes

    // float strength = barX + barY; // adding combines the patterns
    
    // Pattern 15 - Plus signs
    // float barX = step(0.4, mod(vUV.x * 10.0 - 0.2, 1.0)); // Vertical fat bars, offset by 0.2
    // barX *= step(0.8, mod(vUV.y * 10.0 + 0.2, 1.0)); // Horizontal thin bars for intersection, result is thin horizontal dashes
    
    // float barY = step(0.4, mod(vUV.y * 10.0, 1.0)); // Horizontal fat bars
    // barY *= step(0.8, mod(vUV.x * 10.0, 1.0)); // Vertical thin bars for intersection, result is thin vertical dashes

    // float strength = barX + barY; // adding combines the patterns
    
    // Pattern 16 - Divide the ocean, void down the middle, sin would work but use abs instead
    // float strength = abs(vUV.x - 0.5);

    // Pattern 17 - Divide into 4 square, use the minimum value between the x and y patterns
    // float strength = abs(vUV.x - 0.5);
    // strength = min(abs(vUV.y - 0.5), strength);

    // Pattern 18 - Inverted 17, use the max value
    // float strength = abs(vUV.x - 0.5);
    // strength = max(abs(vUV.y - 0.5), strength);

    // Pattern 19 - Empty square, clear limit here so use step to cut out the center
    // float strength = abs(vUV.x - 0.5);
    // strength = step(0.2, max(abs(vUV.y - 0.5), strength));

    // Pattern 20 - Actually 3 squares here, you just don't see the outer black square
    // Cut out a black square in square1, make another square slightly larger than that black square, get the intersection
    // float square1 = step(0.2, max(abs(vUV.y - 0.5), abs(vUV.x - 0.5)));
    // float square2 = 1.0 - step(0.25, max(abs(vUV.y - 0.5), abs(vUV.x - 0.5)));

    // float strength = square1 * square2;

    // Pattern 21 - Gradient steps, round rounds to the nearest integer, floor rounds to the bottom int
    // float strength = floor(vUV.x * 10.0) / 10.0;

    // Pattern 22 - Gradient steps on x and y
    // float strength = floor(vUV.x * 10.0) / 10.0;
    // strength *= floor(vUV.y * 10.0) / 10.0;

    // Pattern 23 - TV Static/Noise, there is no random in GLSL, use this random math formula
    // float strength = random(vUV);

    // Pattern 24 - TV Static mega zoomed in, random gradient steps
    // Here, pattern 22 comes into use since it's the same pattern, just random colors. The idea is to use the UVs of that pattern
    // but apply the strength/color of random. So we make a vec2 UV using pattern 22 but provide that to the random function.
    // This way, not every pixel is random, just the pixel UVs within the floor ranges.
    // vec2 gridUV = vec2(
    //     floor(vUV.x * 10.0) / 10.0,
    //     floor(vUV.y * 10.0) / 10.0
    // );
    // float strength = random(gridUV);

    // Pattern 25 - pattern 24 but stretched on a corner or slanted texture, add x uv to y uv
    // vec2 gridUV = vec2(
    //     floor(vUV.x * 10.0) / 10.0,
    //     floor((vUV.y + vUV.x * 0.5) * 10.0) / 10.0
    // );
    // float strength = random(gridUV);

    // Pattern 26 - Expanding circle gradient void from bottom left, calculate the LENGTH/distance of a VECTOR, not like vec size
    // float strength = length(vUV);

    // Pattern 27 - Void circle gradient in the center, offset the uv by -0.5 OR calculate distance from center to the UV coords
    // float strength = distance (vUV, vec2(0.5, 0.5));
    // float strength = length(vUV - 0.5);

    // Pattern 28 - Inverted 27
    // float strength = 1.0 - distance(vUV, vec2(0.5, 0.5));

    // Pattern 29 - Point light/solar flare, very specific formula that's exponential. Less distance from 0,0 the greater the intensity
    // 0.015 represents radius of sun
    // float strength = 0.015 / distance(vUV, vec2(0.5));

    // Pattern 30 - Horizontally stretched point light, create a new UV to have more control over x and y
    // vec2 lightUV = vec2(
    //     vUV.x * 0.1 + 0.45,
    //     vUV.y * 0.5 + 0.25
    // );
    // float strength = 0.015 / distance(lightUV, vec2(0.5));

    // Pattern 31 - Star, create two of 30 (horizontal/vertical), then multiply for clean rays
    // vec2 lightUVX = vec2(
    //     vUV.x * 0.1 + 0.45,
    //     vUV.y * 0.5 + 0.25
    // );
    // float lightX = 0.010 / distance(lightUVX, vec2(0.5));

    // vec2 lightUVY = vec2(
    //     vUV.x * 0.5 + 0.25,
    //     vUV.y * 0.1 + 0.45
    // );
    // float lightY = 0.010 / distance(lightUVY, vec2(0.5));
    // float strength = lightX * lightY;

    // Pattern 32 - Rotated star, rotate the UVs using the function rotate(uv, rotation in radians, midpoint)
    // We can #define pi which is like constant/FINAL variables
    // vec2 rotatedUV = rotate(vUV, PI * 0.25, vec2(0.5));

    // vec2 lightUVX = vec2(
    //     rotatedUV.x * 0.1 + 0.45,
    //     rotatedUV.y * 0.5 + 0.25
    // );
    // float lightX = 0.010 / distance(lightUVX, vec2(0.5));

    // vec2 lightUVY = vec2(
    //     rotatedUV.x * 0.5 + 0.25,
    //     rotatedUV.y * 0.1 + 0.45
    // );
    // float lightY = 0.010 / distance(lightUVY, vec2(0.5));
    // float strength = lightX * lightY;

    // Pattern 33 - Cutout a circle in the square
    // float strength = step(0.25, distance(vUV, vec2(0.5)));

    // Pattern 34 - Outline a circle in the square with soft edges, first make the dark center wider, then abs to get the white inside again
    // float strength = abs(distance(vUV, vec2(0.5)) - 0.25);

    // Pattern 35 - Outline a circle with hard edges
    // float strength = step(0.01, abs(distance(vUV, vec2(0.5)) - 0.25));

    // Pattern 36 - Invert 35
    // float strength = 1.0 - step(0.01, abs(distance(vUV, vec2(0.5)) - 0.25));

    // Pattern 37 - Wavy/Distorted 36, remember to try all 4 operations if one doesn't work
    // y UV is modified since the waves are on the y axis as x increases
    // vec2 waveUV = vec2(
    //     vUV.x,
    //     vUV.y + sin(vUV.x * 30.0) * 0.1
    // );
    // float strength = 1.0 - step(0.01, abs(distance(waveUV, vec2(0.5)) - 0.25));

    // Pattern 38 - 37 but also on wavy x
    // vec2 waveUV = vec2(
    //     vUV.x + sin(vUV.y * 30.0) * 0.1,
    //     vUV.y + sin(vUV.x * 30.0) * 0.1
    // );
    // float strength = 1.0 - step(0.01, abs(distance(waveUV, vec2(0.5)) - 0.25));

    // Pattern 39 - Omega wavy
    // vec2 waveUV = vec2(
    //     vUV.x + sin(vUV.y * 100.0) * 0.1,
    //     vUV.y + sin(vUV.x * 100.0) * 0.1
    // );
    // float strength = 1.0 - step(0.01, abs(distance(waveUV, vec2(0.5)) - 0.25));

    // Pattern 40 - ANGLES, basic gradient rotated, atan = arc tangent, calculates angle from opposite/adjacent (UVs)
    // float angle = atan(vUV.x, vUV.y);
    // float strength = angle;

    // Pattern 41 - offset 40
    // float angle = atan(vUV.x - 0.5, vUV.y - 0.5);
    // float strength = angle;

    // Pattern 42 - full circle 41, angle is like how long it takes for gradient to go from 0 to 1 but in a circle
    // Dividing it makes it take longer to hit 1.0 and adding 0.5 makes it go full circle
    // float angle = atan(vUV.x - 0.5, vUV.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float strength = angle;

    // Pattern 43 - 42 but split into section gradients, use mod to section off gradients and multiply for more areas
    // float angle = atan(vUV.x - 0.5, vUV.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // angle *= 20.0;
    // angle = mod(angle, 1.0);
    // float strength = angle;

    // Pattern 44 - 43 but actual b/w sections
    // float angle = atan(vUV.x - 0.5, vUV.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;

    // float strength = sin(angle * 100.0);

    // Pattern 45 - Circle but symmetrical wavy, apply the angle to the circle by adding it
    // float radius = 0.25;

    // float angle = atan(vUV.x - 0.5, vUV.y - 0.5);
    // angle /= PI * 2.0;
    // angle += 0.5;
    // float sinusoid = sin(angle * 100.0);

    // radius += sinusoid * 0.02;
    // float strength = 1.0 - step(0.01, abs(distance(vUV, vec2(0.5)) - radius));

    // Pattern 46 - NOISE, specifically Perlin noise
    // float strength = cnoise(vUV * 10.0);

    // Pattern 47 - 46 but using step
    // float strength = step(0.1, cnoise(vUV * 10.0));

    // Pattern 48 - Snake path noise
    // float strength = 1.0 - abs(cnoise(vUV * 10.0));

    // Pattern 49 - Oily noise
    // float strength = sin(cnoise(vUV * 10.0) * 20.0);

    // Pattern 50 - Sharp oily noise
    float strength = step(0.9, sin(cnoise(vUV * uTest) * 20.0));
    strength = clamp(strength, 0.0, 1.0);
    // Colors time - mix 2 colors based on distance, use mix(firstColor, secondColor, strength)
    vec3 blackColor = vec3(0.0);
    vec3 uvColor = vec3(vUV, 1.0);
    vec3 mixedColor = mix(blackColor, uvColor, strength);

    gl_FragColor = vec4(mixedColor, 1.0);

    // Black and white version
    // gl_FragColor = vec4(vec3(strength), 1.0);
}