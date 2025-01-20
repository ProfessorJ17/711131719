import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

class TetrahedronScene {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // Enable transparency

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    
    this.createTetrahedron();
    this.setupLighting();
    this.setupCamera();
    this.animate();
    
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  createTetrahedron() {
    const geometry = new THREE.TetrahedronGeometry(1, 0);
    
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('https://threejs.org/examples/textures/uv_grid_opengl.jpg'); // Replace with your desired texture URL
    const material = new THREE.MeshStandardMaterial({ 
      map: texture,
      metalness: 0.7,
      roughness: 0.3
    });
    
    this.tetrahedron = new THREE.Mesh(geometry, material);
    this.scene.add(this.tetrahedron);
  }
  
  setupLighting() {
    this.pointLights = [];
    const positions = [
      [-3, 3, 0],
      [3, 3, 0],
      [0, -3, 0]
    ];
    
    positions.forEach(pos => {
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(...pos);
      this.scene.add(pointLight);
      this.pointLights.push(pointLight);
    });

    this.createNeonLight(-5, 5, 0, 0x00FFFF); // Neon Cyan
    this.createNeonLight(5, 5, 0, 0xFF00FF); // Neon Pink
    this.createNeonLight(0, 5, -5, 0x800080); // Neon Purple
    this.createNeonLight(0, 5, 5, 0x00FF00); // Neon Green
    
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);
  }

  createNeonLight(x, y, z, color) {
    const light = new THREE.PointLight(color, 1, 10);
    light.position.set(x, y, z);
    this.scene.add(light);
    this.pointLights.push(light);
  }
  
  setupCamera() {
    this.camera.position.z = 5;
    this.camera.position.y = -1; // Added to move camera up slightly so tetrahedron appears higher
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    this.tetrahedron.rotation.x += 0.01;
    this.tetrahedron.rotation.y += 0.02;
    
    const time = Date.now() * 0.001;
    this.pointLights.forEach((light, index) => {
      const radius = 5;
      light.position.x = radius * Math.sin(time + index * Math.PI / 2);
      light.position.z = radius * Math.cos(time + index * Math.PI / 2);
    });

    const r = Math.sin(time) * 0.5 + 0.5;
    const g = Math.sin(time + 2) * 0.5 + 0.5;
    const b = Math.sin(time + 4) * 0.5 + 0.5;
    
    this.ambientLight.color.setRGB(r, g, b);
    
    this.renderer.render(this.scene, this.camera);
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

new TetrahedronScene();
