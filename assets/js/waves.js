(() => {
    console.log("waves.js cloth version ✅");
  
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xefe7de);
  
    // Camera
    const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
    camera.position.set(0, 3, 8); // pull back & up for better cloth perspective
    camera.lookAt(0, 0, 0);
  
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight);
    renderer.domElement.id = "bg3d";
    Object.assign(renderer.domElement.style, {
      position: "fixed", inset: "0", zIndex: "-1", pointerEvents: "none"
    });
    document.body.appendChild(renderer.domElement);
  
    // Cloth plane
    const geom = new THREE.PlaneGeometry(16, 9, 250, 160);
    const mat = new THREE.MeshPhongMaterial({
      color: 0xf3eee7,
      shininess: 80,
      specular: 0x999999,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.rotation.x = -0.45; // tilt a bit more
    scene.add(mesh);
  
    // Lights (make folds visible)
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(-2, 3, 4);
    scene.add(dir);
    const point = new THREE.PointLight(0xffffff, 0.5);
    point.position.set(3, 2, 5);
    scene.add(point);
  
    // Vertex data
    const pos = geom.attributes.position;
    const base = pos.array.slice();
  
    // Animation loop
    function animate(tms) {
      const t = tms * 0.001;
      for (let i = 0; i < pos.count; i++) {
        const i3 = i * 3;
        const x = base[i3];
        const z = base[i3 + 2];
        // smaller amplitudes for cloth-like subtle motion
        pos.array[i3 + 1] =
          0.25 * Math.sin(x * 0.8 + t * 0.6) +
          0.15 * Math.sin((x + z) * 0.5 - t * 0.3) +
          0.10 * Math.cos(z * 1.0 + t * 0.7);
      }
      pos.needsUpdate = true;
      geom.computeVertexNormals();
  
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  
    // Resize
    addEventListener("resize", () => {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    });
  
    window._three = { renderer, scene, camera, mesh }; // debug
  })();
  