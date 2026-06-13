/**
 * Aerukart-style rotating glass prism letters — T + G
 */
import * as THREE from './vendor/three.module.min.js';
import { FontLoader } from './vendor/FontLoader.js';
import { TextGeometry } from './vendor/TextGeometry.js';

const TEXT_OPTS = {
  size: 1.35,
  depth: 0.42,
  curveSegments: 10,
  bevelEnabled: true,
  bevelThickness: 0.065,
  bevelSize: 0.045,
  bevelOffset: 0,
  bevelSegments: 5,
};

const PrismRenderer = {
  _inited: false,
  _renderer: null,
  _scene: null,
  _camera: null,
  _letters: null,
  _raf: 0,
  _mouse: { x: 0, y: 0 },
  _canvasHost: null,
  _onMouseMove: null,
  _onResize: null,
  _resizeObserver: null,

  init(containerId = 'hero-canvas') {
    if (this._inited) return Promise.resolve();
    const container = document.getElementById(containerId);
    if (!container) return Promise.resolve();
    return this._setup(container);
  },

  async _setup(container) {
    container.innerHTML = '';
    container.classList.add('prism-hero');

    const wrap = document.createElement('div');
    wrap.className = 'prism-hero__wrap';

    const canvasHost = document.createElement('div');
    canvasHost.className = 'prism-hero__canvas-host';
    wrap.appendChild(canvasHost);

    const glow = document.createElement('div');
    glow.className = 'prism-hero__glow';
    glow.setAttribute('aria-hidden', 'true');
    wrap.appendChild(glow);

    container.appendChild(wrap);
    this._canvasHost = canvasHost;

    await this._waitForLayout(canvasHost);

    const fontUrl = new URL('./vendor/helvetiker_bold.typeface.json', import.meta.url).href;
    const font = await new Promise((resolve, reject) => {
      new FontLoader().load(fontUrl, resolve, undefined, reject);
    });

    const { w, h } = this._hostSize(canvasHost);

    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._renderer.setSize(w, h, false);
    this._renderer.setClearColor(0x000000, 0);
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = 1.15;
    canvasHost.appendChild(this._renderer.domElement);

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    this._camera.position.set(0, 0.05, 5.8);

    this._letters = new THREE.Group();
    this._letters.add(this._createChromaticLetter(font, 'T', -0.72));
    this._letters.add(this._createChromaticLetter(font, 'G', 0.72));
    this._letters.scale.setScalar(0.78);
    this._scene.add(this._letters);

    this._addLights();

    this._onMouseMove = (e) => {
      this._mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this._mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    this._onResize = () => this._resize(canvasHost);
    window.addEventListener('mousemove', this._onMouseMove, { passive: true });
    window.addEventListener('resize', this._onResize);

    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this._resize(canvasHost));
      this._resizeObserver.observe(canvasHost);
    }

    this._inited = true;
    this._loop();
    return Promise.resolve();
  },

  _waitForLayout(el) {
    return new Promise((resolve) => {
      const tick = () => {
        const { w, h } = this._hostSize(el);
        if (w > 40 && h > 40) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
  },

  _hostSize(el) {
    const rect = el.getBoundingClientRect();
    const w = Math.round(rect.width) || Math.min(window.innerWidth * 0.13, 160);
    const h = Math.round(rect.height) || Math.min(window.innerHeight * 0.17, 210);
    return { w, h };
  },

  _glassMaterial(tint, transmission, opacity = 1) {
    return new THREE.MeshPhysicalMaterial({
      color: tint,
      metalness: 0.05,
      roughness: 0.03,
      transmission,
      thickness: 1.35,
      ior: 1.52,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      transparent: opacity < 1,
      opacity,
      reflectivity: 1,
      specularIntensity: 1.2,
      envMapIntensity: 1.4,
    });
  },

  _createChromaticLetter(font, char, xPos) {
    const group = new THREE.Group();
    const layers = [
      { x: -0.012, tint: 0xff0088, transmission: 0.5, opacity: 0.45 },
      { x: 0, tint: 0xffffff, transmission: 0.94, opacity: 1 },
      { x: 0.012, tint: 0x00eeff, transmission: 0.5, opacity: 0.45 },
    ];

    layers.forEach(({ x, tint, transmission, opacity }) => {
      const geo = new TextGeometry(char, { font, ...TEXT_OPTS });
      geo.computeVertexNormals();
      geo.center();
      const mesh = new THREE.Mesh(geo, this._glassMaterial(tint, transmission, opacity));
      mesh.position.x = x;
      mesh.renderOrder = tint === 0xffffff ? 2 : 1;
      group.add(mesh);
    });

    group.position.x = xPos;
    return group;
  },

  _addLights() {
    const magenta = new THREE.DirectionalLight(0xff00aa, 2.2);
    magenta.position.set(5, 4, 3);
    this._scene.add(magenta);

    const cyan = new THREE.DirectionalLight(0x00f0ff, 1.8);
    cyan.position.set(-5, 1, 4);
    this._scene.add(cyan);

    const yellow = new THREE.DirectionalLight(0xd4ff00, 1.1);
    yellow.position.set(1, -5, 2);
    this._scene.add(yellow);

    const rim = new THREE.DirectionalLight(0xffffff, 0.45);
    rim.position.set(0, 0, -4);
    this._scene.add(rim);

    this._scene.add(new THREE.AmbientLight(0x303050, 0.25));
  },

  _resize(host) {
    if (!this._renderer || !this._camera) return;
    const { w, h } = this._hostSize(host);
    this._camera.aspect = w / h;
    this._camera.updateProjectionMatrix();
    this._renderer.setSize(w, h, false);
  },

  _loop() {
    const t = performance.now() * 0.001;
    if (this._letters) {
      this._letters.rotation.x = t * 0.22 + this._mouse.y * 0.32;
      this._letters.rotation.y = t * 0.34 + this._mouse.x * 0.38;
      this._letters.rotation.z = Math.sin(t * 0.3) * 0.08;
    }
    this._renderer.render(this._scene, this._camera);
    this._raf = requestAnimationFrame(() => this._loop());
  },

  destroy() {
    cancelAnimationFrame(this._raf);
    if (this._onMouseMove) window.removeEventListener('mousemove', this._onMouseMove);
    if (this._onResize) window.removeEventListener('resize', this._onResize);
    if (this._resizeObserver) this._resizeObserver.disconnect();
    this._inited = false;
  },
};

window.PrismRenderer = PrismRenderer;
window.dispatchEvent(new Event('prism-renderer-ready'));
export default PrismRenderer;
