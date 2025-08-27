(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(20, innerWidth / innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0xEDE1D4, 0);
  
    const canvas = renderer.domElement;
    Object.assign(canvas.style, { position: "fixed", top: 0, left: 0, zIndex: "-1" });
    document.body.insertBefore(canvas, document.body.firstChild);
  
    // --- geometry (dense grid) ---
    const geometry = new THREE.PlaneGeometry(25, 80, 40, 50);
  
    // Smoother cloth shading (turn OFF flatShading)
    const material = new THREE.MeshPhongMaterial({
      color: 0xF4EEE6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      shininess: 4,
      flatShading: false
    });
  
    const waves = new THREE.Mesh(geometry, material);
  
    // soft, studio-like lighting so folds read gently
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const softLight = new THREE.DirectionalLight(0xffffff, 0.5);
    softLight.position.set(-5, 5, 5);
    scene.add(softLight);
    
    waves.rotation.x = -Math.PI / 2.5;
    waves.position.y = 4;
    camera.position.set(0, 3, 15);
    scene.add(waves);
  
    // ======= noise helpers (lightweight 2D value-noise + fBm) =======
    const fract = x => x - Math.floor(x);
    function rand2(x, y) {
      // deterministic pseudo-random (value noise)
      return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
    }
    function smoothstep(t) { return t * t * (3 - 2 * t); }
  
    function noise2(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi,      yf = y - yi;
      const u = smoothstep(xf), v = smoothstep(yf);
  
      const v00 = rand2(xi,     yi);
      const v10 = rand2(xi + 1, yi);
      const v01 = rand2(xi,     yi + 1);
      const v11 = rand2(xi + 1, yi + 1);
  
      const x1 = v00 * (1 - u) + v10 * u;
      const x2 = v01 * (1 - u) + v11 * u;
      return (x1 * (1 - v) + x2 * v) * 2 - 1; // -> [-1,1]
    }
  
    function fbm(x, y, octaves = 2, gain = 0.5, lac = 2.0) {
      let amp = 1, freq = 1, sum = 0, norm = 0;
      for (let o = 0; o < octaves; o++) {
        sum  += amp * noise2(x * freq, y * freq);
        norm += amp;
        amp  *= gain;
        freq *= lac;
      }
      return sum / norm; // [-1,1]
    }
  
    // ======= vertex data =======
    const pos  = geometry.attributes.position;
    const base = pos.array.slice();         // original XY/Z
    // static per-vertex amplitude map so some areas rise more than others
    const ampMap = new Float32Array(pos.count);
    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3;
      const x = base[i3], y = base[i3 + 1];
      // slow-varying map, 0.6..1.4 range
      const n = fbm(x * 0.12, y * 0.12, 3, 0.55, 1.9);
      ampMap[i] = 0.6 + 0.8 * (0.5 * (n + 1)); // map [-1,1] -> [0,1]
    }
  
    // ======= animate with multi-layer noise =======
    function animate() {
      requestAnimationFrame(animate);
      const time = performance.now() * 0.001;
  
      // two long, slow layers + one shorter, faster layer
      const L1 = { f: 0.5, sx: 0.7, sy: 0.42, speed: 0.1 };
      const L2 = { f: 0.3, sx: 0.30, sy: 0.36, speed: -0.18 };
      const L3 = { f: 0.4, sx: 0.85, sy: 0.80, speed: 0.35 }; // adds fine ripples
  
      for (let i = 0; i < pos.count; i++) {
        const i3 = i * 3;
        const x = base[i3], y = base[i3 + 1];
  
        // domain-warp the coords a little so crests meander
        const warpX = x + 0.6 * noise2(x * 0.15 + time * 0.1, y * 0.15 - time * 0.08);
        const warpY = y + 0.6 * noise2(x * 0.12 - time * 0.07, y * 0.12 + time * 0.09);
  
        // fBm layers
        let h =
          L1.f * fbm(warpX * L1.sx + time * L1.speed, warpY * L1.sy - time * L1.speed, 4, 0.5, 2.0) +
          L2.f * fbm(warpX * L2.sx - time * L2.speed, warpY * L2.sy + time * L2.speed, 4, 0.5, 2.0) +
          L3.f * fbm(warpX * L3.sx + time * L3.speed, warpY * L3.sy - time * L3.speed, 3, 0.55, 2.2);
  
        // optional "ridge" shaping for sharper crests (comment if too sharp)
        const r = 1 - Math.abs(h);       // ridge signal [0..1]
        h = 0.7 * h + 0.3 * (r * r);     // blend
  
        // vary height by our static amplitude map
        h *= ampMap[i];
  
        // set Z as height
        pos.array[i3 + 2] = h;
      }
  
      pos.needsUpdate = true;
      geometry.computeVertexNormals(); // crucial for smooth lighting
      renderer.render(scene, camera);
    }
  
    addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  
    animate();
  })();
  