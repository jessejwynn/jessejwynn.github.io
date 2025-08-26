(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xEDE1D4, 0);
    
    const canvas = renderer.domElement;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    document.body.insertBefore(canvas, document.body.firstChild);
    
    // Increased detail with more segments
    const geometry = new THREE.PlaneGeometry(25, 10, 250, 250);
    const material = new THREE.MeshPhongMaterial({
        color: 0xEDE1D4,
        wireframe: false,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        flatShading: true,
        shininess: 2
    });
    
    const waves = new THREE.Mesh(geometry, material);
    
    // Enhanced lighting for close-up detail
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const softLight = new THREE.DirectionalLight(0xffffff, 0.5);
    softLight.position.set(-5, 5, 5);
    scene.add(softLight);
    
    // Position camera closer to the cloth
    waves.rotation.x = -Math.PI / 2.2;
    waves.position.y = -1;
    camera.position.z = 15;
    camera.position.y = 3;
    scene.add(waves);
    
    function animate() {
        requestAnimationFrame(animate);
        
        const vertices = waves.geometry.attributes.position.array;
        const time = Date.now() * 0.0002;
        
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            vertices[i + 2] = 
                Math.sin(x * 0.5 + time) * 
                Math.sin(y * 0.5 + time) * 1.5 +
                Math.sin(x * 0.25 - time * 0.7) * 
                Math.sin(y * 0.25 + time * 0.8) * 1.0;
        }
        
        waves.geometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
    }
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    animate();
})();
  