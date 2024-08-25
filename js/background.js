// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '-1';
renderer.domElement.style.pointerEvents = 'none';

document.body.appendChild(renderer.domElement);

// Stars setup
let stars = [];
function addSphere() {
    for (let z = -1000; z < 1000; z += 20) {
        let geometry = new THREE.SphereGeometry(0.5, 32, 32);
        let material = new THREE.MeshBasicMaterial({ color: 0xFF69B4 });
        let sphere = new THREE.Mesh(geometry, material);
        sphere.position.x = Math.random() * 1000 - 500;
        sphere.position.y = Math.random() * 1000 - 500;
        sphere.position.z = z;
        sphere.scale.x = sphere.scale.y = 2;
        scene.add(sphere);
        stars.push(sphere);
    }
}

function animateStars() {
    for (let i = 0; i < stars.length; i++) {
        let star = stars[i];
        star.position.z += i / 10;
        if (star.position.z > 1000) star.position.z -= 2000;
    }
}

function animate() {
    requestAnimationFrame(animate);
    animateStars();
    renderer.render(scene, camera);
}

// Ensure the renderer resizes correctly on window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

addSphere();
animate();
