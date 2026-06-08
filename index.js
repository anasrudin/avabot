document.addEventListener('DOMContentLoaded', () => {
  // Selectors
  const modal = document.getElementById('diagnostic-modal');
  const openModalBtn = document.getElementById('open-diagnostic-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const launchConsoleBtn = document.getElementById('launch-console-btn');
  const restartBtn = document.getElementById('restart-diagnostic-btn');
  const optimizeBtn = document.getElementById('diagnostic-optimize-btn');
  
  const quizStepContainer = document.getElementById('quiz-step-container');
  const steps = Array.from(document.querySelectorAll('.quiz-step'));
  const progressBar = document.getElementById('diagnostic-progress');
  const stepCounterText = document.getElementById('step-counter-text');
  
  const resultsScreen = document.getElementById('results-screen');
  const scoreRing = document.getElementById('score-ring');
  const resultLevelNum = document.getElementById('result-level-num');
  const resultScorePercent = document.getElementById('result-score-percent');
  const resultTierTitle = document.getElementById('result-tier-title');
  const resultTierDesc = document.getElementById('result-tier-desc');
  
  const barPlanning = document.getElementById('bar-planning');
  const barMemory = document.getElementById('bar-memory');
  const barTools = document.getElementById('bar-tools');
  const barAutonomy = document.getElementById('bar-autonomy');
  
  const centerpieceWrapper = document.getElementById('centerpiece-wrapper');

  // Quiz State
  let currentStepIndex = 0;
  let scores = [0, 0, 0, 0];

  // Modal Functionality
  function openModal() {
    modal.classList.add('open');
    resetQuiz();
    document.body.style.overflow = 'hidden'; // Prevent scrolling underlying page
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  openModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  launchConsoleBtn.addEventListener('click', () => {
    alert("Console initializing. Initiating connection with Avabot cluster...");
    openModal();
  });
  
  // Close modal when clicking backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Esc key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // Card options event delegation
  quizStepContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.option-card');
    if (!card) return;

    const score = parseInt(card.getAttribute('data-score'), 10);
    scores[currentStepIndex] = score;

    // Advanced to next step or show results
    if (currentStepIndex < steps.length - 1) {
      nextStep();
    } else {
      showResults();
    }
  });

  function nextStep() {
    // Hide current step
    steps[currentStepIndex].classList.remove('active');
    
    // Increment step index
    currentStepIndex++;
    
    // Show next step
    steps[currentStepIndex].classList.add('active');
    
    // Update progress bar
    const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Update counter text
    stepCounterText.textContent = `Question ${currentStepIndex + 1} of ${steps.length}`;
  }

  function showResults() {
    // Hide quiz steps & headers
    quizStepContainer.style.display = 'none';
    progressBar.parentElement.style.display = 'none';
    stepCounterText.style.display = 'none';
    
    // Calculate Score
    const totalScore = scores.reduce((sum, val) => sum + val, 0);
    const maxScore = steps.length * 5;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    // Determine Tiers
    let level = 'L1';
    let title = '';
    let desc = '';
    
    if (percentage <= 25) {
      level = 'L1';
      title = 'Prompt Apprentice';
      desc = 'Your agent operates primarily on linear instructions and static prompts. It requires human oversight for every execution step.';
    } else if (percentage <= 50) {
      level = 'L2';
      title = 'Task Automator';
      desc = 'Your agent successfully handles simple automated loops and session-based caching, performing pre-defined task workflows.';
    } else if (percentage <= 70) {
      level = 'L3';
      title = 'Workflow Orchestrator';
      desc = 'Your agent utilizes Chain-of-Thought planning and integrates with core tool APIs. It requires oversight only for high-risk decisions.';
    } else if (percentage <= 90) {
      level = 'L4';
      title = 'Cognitive Integrator';
      desc = 'Your agent utilizes advanced self-reflection, stores episodic context in RAG vector layers, and automates high-complexity task sequences.';
    } else {
      level = 'L5';
      title = 'Autonomous Architect';
      desc = 'Congratulations! Your agent system operates fully autonomously, dynamic-planning across semantic networks, generating custom tools, and self-auditing.';
    }

    // Set level text and score percentage
    resultLevelNum.textContent = level;
    resultScorePercent.textContent = `${percentage}%`;
    resultTierTitle.textContent = title;
    resultTierDesc.textContent = desc;

    // Show result view
    resultsScreen.classList.add('active');

    // Animate radial progress ring
    const radius = 45;
    const circumference = 2 * Math.PI * radius; // 282.74
    const offset = circumference - (percentage / 100) * circumference;
    
    // Force reflow for animation to trigger
    scoreRing.getBoundingClientRect();
    scoreRing.style.strokeDashoffset = offset;

    // Animate metric bars
    // Score is 1 to 5, mapping to 20% to 100%
    setTimeout(() => {
      barPlanning.style.width = `${scores[0] * 20}%`;
      barMemory.style.width = `${scores[1] * 20}%`;
      barTools.style.width = `${scores[2] * 20}%`;
      barAutonomy.style.width = `${scores[3] * 20}%`;
    }, 150);
  }

  function resetQuiz() {
    currentStepIndex = 0;
    scores = [0, 0, 0, 0];
    
    // Reset layout displays
    quizStepContainer.style.display = 'flex';
    progressBar.parentElement.style.display = 'block';
    stepCounterText.style.display = 'block';
    resultsScreen.classList.remove('active');
    
    // Reset steps
    steps.forEach((step, idx) => {
      if (idx === 0) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // Reset progress details
    progressBar.style.width = `${(1 / steps.length) * 100}%`;
    stepCounterText.textContent = `Question 1 of ${steps.length}`;
    scoreRing.style.strokeDashoffset = 282.74; // Reset radial stroke
    
    barPlanning.style.width = '0%';
    barMemory.style.width = '0%';
    barTools.style.width = '0%';
    barAutonomy.style.width = '0%';
  }

  restartBtn.addEventListener('click', resetQuiz);
  optimizeBtn.addEventListener('click', () => {
    alert("Deploying Avabot Cognitive Core upgrade. Connecting to your local runtime...");
    closeModal();
  });

  // Three.js 3D Initialization
  function init3D() {
    const container = document.getElementById('canvas3d-container');
    if (!container || typeof THREE === 'undefined') {
      console.warn("Three.js not loaded or canvas container missing.");
      return;
    }

    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 7.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Main Robot Group
    const robotGroup = new THREE.Group();
    robotGroup.position.set(0, 1.2, 0); // Center in vertical viewport
    scene.add(robotGroup);

    // Materials
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x060606,
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0
    });

    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.9,
      roughness: 0.25
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f0ff
    });

    const visorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x020202,
      metalness: 0.2,
      roughness: 0.02,
      transparent: true,
      opacity: 0.8,
      transmission: 0.4,
      ior: 1.5
    });

    // 1. Head
    const headGeo = new THREE.SphereGeometry(1, 32, 32);
    headGeo.scale(1, 1.28, 0.95);
    const headMesh = new THREE.Mesh(headGeo, bodyMaterial);
    robotGroup.add(headMesh);

    // 2. Visor
    const visorGeo = new THREE.SphereGeometry(0.88, 32, 32);
    visorGeo.scale(1.02, 0.65, 0.8);
    const visorMesh = new THREE.Mesh(visorGeo, visorMaterial);
    visorMesh.position.set(0, 0.18, 0.38);
    robotGroup.add(visorMesh);

    // 3. LED Matrix Eyes (Grid)
    const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const eyeGroup = new THREE.Group();
    
    // Left & Right eye dot layout
    const leftEyePos = [
      {x: -0.3, y: 0.2, z: 0.78}, {x: -0.22, y: 0.2, z: 0.80}, {x: -0.14, y: 0.2, z: 0.81},
      {x: -0.26, y: 0.25, z: 0.79}, {x: -0.18, y: 0.25, z: 0.80}
    ];
    const rightEyePos = [
      {x: 0.14, y: 0.2, z: 0.81}, {x: 0.22, y: 0.2, z: 0.80}, {x: 0.3, y: 0.2, z: 0.78},
      {x: 0.18, y: 0.25, z: 0.80}, {x: 0.26, y: 0.25, z: 0.79}
    ];

    const eyePixels = [];
    [...leftEyePos, ...rightEyePos].forEach(pos => {
      const pixel = new THREE.Mesh(eyeGeo, glowMaterial);
      pixel.position.set(pos.x, pos.y, pos.z);
      eyeGroup.add(pixel);
      eyePixels.push(pixel);
    });
    robotGroup.add(eyeGroup);

    // 4. Neck
    const neckGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.5, 16);
    const neckMesh = new THREE.Mesh(neckGeo, jointMaterial);
    neckMesh.position.set(0, -1.25, -0.05);
    robotGroup.add(neckMesh);

    // 5. Torso/Chest
    const chestGeo = new THREE.CylinderGeometry(0.85, 0.55, 1.8, 16);
    chestGeo.scale(1.25, 1, 0.7); // Flatten on Z axis
    const chestMesh = new THREE.Mesh(chestGeo, bodyMaterial);
    chestMesh.position.set(0, -2.35, -0.12);
    robotGroup.add(chestMesh);

    // 6. Glowing Core inside Chest
    const coreGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const coreMesh = new THREE.Mesh(coreGeo, glowMaterial);
    coreMesh.position.set(0, -2.05, 0.45);
    robotGroup.add(coreMesh);

    // 7. Chest logo details
    const ringGeo = new THREE.RingGeometry(0.2, 0.24, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, -2.05, 0.46);
    robotGroup.add(ringMesh);

    // 8. Shoulders
    const shGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const shL = new THREE.Mesh(shGeo, jointMaterial);
    shL.position.set(-1.15, -1.9, -0.12);
    const shR = new THREE.Mesh(shGeo, jointMaterial);
    shR.position.set(1.15, -1.9, -0.12);
    robotGroup.add(shL);
    robotGroup.add(shR);

    // 9. Upper Arms
    const armGeo = new THREE.CylinderGeometry(0.23, 0.2, 1.1, 16);
    const armL = new THREE.Mesh(armGeo, bodyMaterial);
    armL.position.set(-1.3, -2.5, -0.12);
    armL.rotation.z = Math.PI / 12;
    const armR = new THREE.Mesh(armGeo, bodyMaterial);
    armR.position.set(1.3, -2.5, -0.12);
    armR.rotation.z = -Math.PI / 12;
    robotGroup.add(armL);
    robotGroup.add(armR);

    // 10. Background Particles
    const particlesCount = 200;
    const particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const speeds = [];

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 6;
      speeds.push({
        x: (Math.random() - 0.5) * 0.0015,
        y: (Math.random() - 0.5) * 0.0015,
        z: (Math.random() - 0.5) * 0.0015
      });
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Circle particle canvas texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 16, 16);
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.06,
      map: particleTexture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particlesGeo, particlesMaterial);
    scene.add(particleSystem);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x00f0ff, 3.2);
    fillLight.position.set(-6, 2, 2);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 0.8);
    backLight.position.set(0, 1, -5);
    scene.add(backLight);

    // Mouse Tracking Parallax
    let targetRotX = 0;
    let targetRotY = 0;

    document.addEventListener('mousemove', (e) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const mx = (e.clientX / width) - 0.5;
      const my = (e.clientY / height) - 0.5;

      targetRotY = mx * 0.75;
      targetRotX = my * 0.45;
    });

    // Animation Loop
    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.012;

      // Smooth rotate interpolation (lerp)
      robotGroup.rotation.y += (targetRotY - robotGroup.rotation.y) * 0.08;
      robotGroup.rotation.x += (targetRotX - robotGroup.rotation.x) * 0.08;

      // Auto float breathing motion
      robotGroup.position.y = 1.25 + Math.sin(time * 1.5) * 0.12;

      // Visor light pulse (eyes + core)
      const intensity = 0.5 + Math.sin(time * 4.0) * 0.5;
      glowMaterial.color.setRGB(0.0, intensity * 0.9 + 0.1, intensity * 1.0);

      // Drift background particles
      const posArr = particlesGeo.attributes.position.array;
      for (let i = 0; i < particlesCount * 3; i += 3) {
        posArr[i] += speeds[i/3].x;
        posArr[i+1] += speeds[i/3].y;
        posArr[i+2] += speeds[i/3].z;

        // Reset if drifted too far
        if (Math.abs(posArr[i]) > 5) posArr[i] = (Math.random() - 0.5) * 10;
        if (Math.abs(posArr[i+1]) > 5) posArr[i+1] = (Math.random() - 0.5) * 10;
        if (Math.abs(posArr[i+2]) > 3) posArr[i+2] = (Math.random() - 0.5) * 6;
      }
      particlesGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    // Window Resize Handler
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  // Initialize 3D Centerpiece
  init3D();
});
