/**
 * A fullscreen WebGL "ink field": domain-warped noise in deep blue and violet,
 * with lime filaments, a swirl that follows the pointer, film grain and a
 * vignette. One triangle, one fragment shader, rendered at reduced resolution
 * (the field is soft, so nobody can tell) to stay cheap on laptops and phones.
 */

const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

const FRAG = /* glsl */ `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;   // canvas pixels, origin bottom-left
uniform float uScroll; // page scroll in viewport heights
uniform float uEnergy; // 0..1, swells briefly on clicks and page changes

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.045;

  p.y += uScroll * 0.18;
  m.y += uScroll * 0.18;

  vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, 1.3) - t));
  float d = length(p - m);
  float pull = exp(-d * 2.6) * (0.55 + uEnergy * 0.8);
  vec2 r = vec2(fbm(p * 1.5 + 3.2 * q + vec2(1.7, 9.2) + t * 1.4),
                fbm(p * 1.5 + 3.2 * q + vec2(8.3, 2.8) - t * 1.1));
  // swirl the field around the pointer
  vec2 dir = p - m;
  r += vec2(-dir.y, dir.x) * pull * 0.9;

  float f = fbm(p * 1.15 + 2.6 * r);

  vec3 col = vec3(0.012, 0.013, 0.02);
  col = mix(col, vec3(0.05, 0.12, 0.21), smoothstep(0.2, 0.8, f));
  col = mix(col, vec3(0.26, 0.13, 0.55), smoothstep(0.5, 1.1, length(q)) * 0.7);
  col = mix(col, vec3(0.02, 0.2, 0.22), smoothstep(0.6, 1.0, r.y) * 0.45);
  float fil = pow(smoothstep(0.3, 0.78, r.x * f * 1.3), 2.6);
  col += vec3(0.78, 1.0, 0.24) * fil * (0.6 + uEnergy * 0.6);
  col += vec3(0.78, 1.0, 0.24) * exp(-d * 4.0) * (0.1 + uEnergy * 0.16) * (0.5 + f);

  vec2 v = uv - 0.5;
  col *= 1.0 - dot(v, v) * 0.9;
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.03;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`

/** canvas pixels per CSS pixel; the field is soft, so it can be rendered small */
const RENDER_SCALE = 0.55

export class ShaderField {
  private gl: WebGLRenderingContext
  private program: WebGLProgram
  private buffer: WebGLBuffer | null
  private uniforms: Record<string, WebGLUniformLocation | null> = {}
  private raf = 0
  private start = performance.now()
  private mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6 }
  private energy = 0
  private scroll = 0
  private running = false
  private readonly onResize = () => this.resize()
  private readonly onVisibility = () => (document.hidden ? this.stop() : this.play())

  private constructor(
    private canvas: HTMLCanvasElement,
    gl: WebGLRenderingContext,
    private animate: boolean,
  ) {
    this.gl = gl
    this.program = this.link()
    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(this.program, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    for (const name of ['uRes', 'uTime', 'uMouse', 'uScroll', 'uEnergy']) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name)
    }
    this.resize()
    window.addEventListener('resize', this.onResize)
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  /** Returns null when WebGL is unavailable; the CSS gradient behind the canvas then shows instead. */
  static create(canvas: HTMLCanvasElement, animate: boolean): ShaderField | null {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' })
    if (!gl || gl.isContextLost()) return null
    try {
      return new ShaderField(canvas, gl, animate)
    } catch (err) {
      console.warn('ShaderField disabled:', err)
      return null
    }
  }

  private link(): WebGLProgram {
    const gl = this.gl
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader')
      return s
    }
    const p = gl.createProgram()!
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? 'link')
    gl.useProgram(p)
    return p
  }

  private resize() {
    const w = Math.max(1, Math.round(window.innerWidth * RENDER_SCALE))
    const h = Math.max(1, Math.round(window.innerHeight * RENDER_SCALE))
    this.canvas.width = w
    this.canvas.height = h
    this.gl.viewport(0, 0, w, h)
    if (!this.running) this.draw(performance.now())
  }

  /** pointer position in CSS pixels */
  pointer(x: number, y: number) {
    this.mouse.tx = x / window.innerWidth
    this.mouse.ty = 1 - y / window.innerHeight
  }

  setScroll(viewports: number) {
    this.scroll = viewports
    if (!this.running) this.draw(performance.now())
  }

  /** a brief swell of brightness: clicks, page changes */
  pulse(amount = 1) {
    this.energy = Math.min(1.4, this.energy + amount)
  }

  play() {
    if (!this.animate || this.running || document.hidden) return
    this.running = true
    const loop = (now: number) => {
      this.draw(now)
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  private draw(now: number) {
    const gl = this.gl
    const m = this.mouse
    m.x += (m.tx - m.x) * 0.06
    m.y += (m.ty - m.y) * 0.06
    this.energy *= 0.965
    const t = this.animate ? (now - this.start) / 1000 : 12
    gl.uniform2f(this.uniforms.uRes, this.canvas.width, this.canvas.height)
    gl.uniform1f(this.uniforms.uTime, t)
    gl.uniform2f(this.uniforms.uMouse, m.x * this.canvas.width, m.y * this.canvas.height)
    gl.uniform1f(this.uniforms.uScroll, this.scroll)
    gl.uniform1f(this.uniforms.uEnergy, this.energy)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  destroy() {
    this.stop()
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibility)
    // free GPU resources but keep the context: React may mount this canvas again
    this.gl.deleteBuffer(this.buffer)
    this.gl.deleteProgram(this.program)
  }
}
