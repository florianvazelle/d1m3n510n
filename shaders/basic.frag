
#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;
uniform sampler2D iChannel0;

// ========= perlin_noise ===========
vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float perlin_noise(vec2 p) {
  vec2 pi = floor(p);
  vec2 pf = p - pi;

  vec2 w = pf * pf * (3.0 - 2.0 * pf);

  return mix(mix(dot(hash22(pi + vec2(0.0, 0.0)), pf - vec2(0.0, 0.0)),
                 dot(hash22(pi + vec2(1.0, 0.0)), pf - vec2(1.0, 0.0)), w.x),
             mix(dot(hash22(pi + vec2(0.0, 1.0)), pf - vec2(0.0, 1.0)),
                 dot(hash22(pi + vec2(1.0, 1.0)), pf - vec2(1.0, 1.0)), w.x),
             w.y);
}

// ========== Different function ==========
float noise_itself(vec2 p) { return perlin_noise(p * 8.0); }

float noise_sum(vec2 p) {
  float f = 0.0;
  p = p * 4.0;
  f += 1.0000 * perlin_noise(p);
  p = 2.0 * p;
  f += 0.5000 * perlin_noise(p);
  p = 2.0 * p;
  f += 0.2500 * perlin_noise(p);
  p = 2.0 * p;
  f += 0.1250 * perlin_noise(p);
  p = 2.0 * p;
  f += 0.0625 * perlin_noise(p);
  p = 2.0 * p;

  return f;
}

float noise_sum_abs(vec2 p) {
  float f = 0.0;
  p = p * 7.0;
  f += 1.0000 * abs(perlin_noise(p));
  p = 2.0 * p;
  f += 0.5000 * abs(perlin_noise(p));
  p = 2.0 * p;
  f += 0.2500 * abs(perlin_noise(p));
  p = 2.0 * p;
  f += 0.1250 * abs(perlin_noise(p));
  p = 2.0 * p;
  f += 0.0625 * abs(perlin_noise(p));
  p = 2.0 * p;

  return f;
}

float noise_sum_abs_sin(vec2 p) {
  float f = noise_sum_abs(p);
  f = sin(f * 1.5 + p.x * 7.0);

  return f * f;
}

// ========== Draw ==========
vec3 draw_simple(float f) {
  f = f * 0.5 + 0.5;
  return f * vec3(25.0 / 255.0, 161.0 / 255.0, 245.0 / 255.0);
}

vec3 draw_cloud(float f) {
  f = f * 0.5 + 0.5;
  return mix(vec3(8.0 / 255.0, 65.0 / 255.0, 82.0 / 255.0),
             vec3(178.0 / 255.0, 161.0 / 255.0, 205.0 / 255.0), f * f);
}

vec3 draw_fire(float f) {
  f = f * 0.5 + 0.5;
  return mix(vec3(131.0 / 255.0, 8.0 / 255.0, 0.0 / 255.0),
             vec3(204.0 / 255.0, 194.0 / 255.0, 56.0 / 255.0), pow(f, 3.));
}

vec3 draw_marble(float f) {
  f = f * 0.5 + 0.5;
  return mix(vec3(31.0 / 255.0, 14.0 / 255.0, 4.0 / 255.0),
             vec3(172.0 / 255.0, 153.0 / 255.0, 138.0 / 255.0),
             1.0 - pow(f, 5.));
}

void main(void) {
  vec2 p = gl_FragCoord.xy / resolution.xy;
  vec2 uv = p * vec2(resolution.x / resolution.y, 1.0) + time / 15.0;
  vec2 split = vec2(0.5, 0.5);

  float f = 0.0;
  vec3 col = vec3(0.0, 0.0, 0.0);

  if (p.x < split.x && p.y > split.y) {
    f = noise_itself(uv);
    col = draw_simple(f);
  } else if (p.x < split.x && p.y <= split.y) {
    f = noise_sum(uv);
    col = draw_cloud(f);
  } else if (p.x >= split.x && p.y < split.y) {
    f = noise_sum_abs(uv);
    col = draw_fire(f);
  } else {
    f = noise_sum_abs_sin(uv);
    col = draw_marble(f);
  }

  vec3 tex = texture2D(iChannel0, -p).xyz;
  gl_FragColor = vec4(tex * col, 1.0);
}
