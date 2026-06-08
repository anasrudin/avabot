document.addEventListener('DOMContentLoaded', () => {
  // ==================== DIAGNOSTIC MODAL LOGIC ====================
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

  let currentStepIndex = 0;
  let scores = [0, 0, 0, 0];

  function openModal() {
    modal.classList.add('open');
    resetQuiz();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  openModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  launchConsoleBtn.addEventListener('click', () => {
    openModal();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  quizStepContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.option-card');
    if (!card) return;
    const score = parseInt(card.getAttribute('data-score'), 10);
    scores[currentStepIndex] = score;
    if (currentStepIndex < steps.length - 1) {
      nextStep();
    } else {
      showResults();
    }
  });

  function nextStep() {
    steps[currentStepIndex].classList.remove('active');
    currentStepIndex++;
    steps[currentStepIndex].classList.add('active');
    progressBar.style.width = `${((currentStepIndex + 1) / steps.length) * 100}%`;
    stepCounterText.textContent = `Question ${currentStepIndex + 1} of ${steps.length}`;
  }

  function showResults() {
    quizStepContainer.style.display = 'none';
    progressBar.parentElement.style.display = 'none';
    stepCounterText.style.display = 'none';
    
    const totalScore = scores.reduce((sum, val) => sum + val, 0);
    const maxScore = steps.length * 5;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    let level, title, desc;
    if (percentage <= 25) {
      level = 'L1'; title = 'Prompt Apprentice';
      desc = 'Your agent operates primarily on linear instructions and static prompts. It requires human oversight for every execution step.';
    } else if (percentage <= 50) {
      level = 'L2'; title = 'Task Automator';
      desc = 'Your agent successfully handles simple automated loops and session-based caching, performing pre-defined task workflows.';
    } else if (percentage <= 70) {
      level = 'L3'; title = 'Workflow Orchestrator';
      desc = 'Your agent utilizes Chain-of-Thought planning and integrates with core tool APIs. It requires oversight only for high-risk decisions.';
    } else if (percentage <= 90) {
      level = 'L4'; title = 'Cognitive Integrator';
      desc = 'Your agent utilizes advanced self-reflection, stores episodic context in RAG vector layers, and automates high-complexity task sequences.';
    } else {
      level = 'L5'; title = 'Autonomous Architect';
      desc = 'Congratulations! Your agent system operates fully autonomously, dynamic-planning across semantic networks, generating custom tools, and self-auditing.';
    }

    resultLevelNum.textContent = level;
    resultScorePercent.textContent = `${percentage}%`;
    resultTierTitle.textContent = title;
    resultTierDesc.textContent = desc;
    resultsScreen.classList.add('active');

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    scoreRing.getBoundingClientRect();
    scoreRing.style.strokeDashoffset = offset;

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
    quizStepContainer.style.display = 'flex';
    progressBar.parentElement.style.display = 'block';
    stepCounterText.style.display = 'block';
    resultsScreen.classList.remove('active');
    steps.forEach((step, idx) => {
      step.classList[idx === 0 ? 'add' : 'remove']('active');
    });
    progressBar.style.width = `${(1 / steps.length) * 100}%`;
    stepCounterText.textContent = `Question 1 of ${steps.length}`;
    scoreRing.style.strokeDashoffset = 282.74;
    barPlanning.style.width = '0%';
    barMemory.style.width = '0%';
    barTools.style.width = '0%';
    barAutonomy.style.width = '0%';
  }

  restartBtn.addEventListener('click', resetQuiz);
  optimizeBtn.addEventListener('click', () => {
    closeModal();
  });

  // ==================== THREE.JS 3D ROBOT ====================
  function init3D() {
    const container = document.getElementById('canvas3d-container');
    if (!container) {
      console.error('[Avabot3D] #canvas3d-container not found');
      return;
    }

    if (typeof THREE === 'undefined') {
      console.error('[Avabot3D] THREE is undefined - CDN failed to load');
      return;
    }

    console.log('[Avabot3D] Initializing Three.js scene...');

    try {
      // Get container dimensions with fallback
      let w = container.clientWidth;
      let h = container.clientHeight;
      if (w === 0 || h === 0) {
        w = Math.min(window.innerHeight * 0.8, 680);
        h = w;
        console.warn('[Avabot3D] Container had 0 dimensions, using fallback:', w, h);
      }
      console.log('[Avabot3D] Canvas dimensions:', w, 'x', h);

      // Scene
      const scene = new THREE.Scene();

      // Camera
      const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
      camera.position.set(0, 0, 9);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.LinearToneMapping;
      renderer.toneMappingExposure = 1.0;
      container.appendChild(renderer.domElement);
      console.log('[Avabot3D] Renderer created and appended');

      // ---- Procedural Environment Map ----
      // This creates a simple gradient cubemap so metallic surfaces have something to reflect
      function createEnvMap() {
        const size = 64;
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(size);
        const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget);
        
        // Create a simple gradient background sphere for the env map
        const envScene = new THREE.Scene();
        const envGeo = new THREE.SphereGeometry(5, 32, 32);
        const envMat = new THREE.ShaderMaterial({
          side: THREE.BackSide,
          uniforms: {},
          vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPos.xyz;
              gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
          `,
          fragmentShader: `
            varying vec3 vWorldPosition;
            void main() {
              vec3 dir = normalize(vWorldPosition);
              float t = dir.y * 0.5 + 0.5;
              vec3 colorBottom = vec3(0.0, 0.0, 0.0);
              vec3 colorTop = vec3(0.12, 0.12, 0.15);
              vec3 colorHighlight = vec3(0.25, 0.28, 0.35);
              vec3 color = mix(colorBottom, colorTop, t);
              // Add some subtle horizontal highlights
              float hAngle = atan(dir.z, dir.x);
              float highlight = pow(max(0.0, cos(hAngle * 2.0)), 8.0) * 0.3;
              color += colorHighlight * highlight;
              gl_FragColor = vec4(color, 1.0);
            }
          `
        });
        const envMesh = new THREE.Mesh(envGeo, envMat);
        envScene.add(envMesh);
        
        cubeCamera.position.set(0, 0, 0);
        cubeCamera.update(renderer, envScene);
        
        envMesh.geometry.dispose();
        envMat.dispose();
        
        return cubeRenderTarget.texture;
      }

      const envMap = createEnvMap();

      // ---- Materials ----
      // Using MeshStandardMaterial with envMap ensures proper reflections in r128
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        metalness: 0.85,
        roughness: 0.15,
        envMap: envMap,
        envMapIntensity: 2.0
      });

      const jointMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.7,
        roughness: 0.3,
        envMap: envMap,
        envMapIntensity: 1.5
      });

      const visorMat = new THREE.MeshPhongMaterial({
        color: 0x111111,
        specular: 0x666666,
        shininess: 120,
        transparent: true,
        opacity: 0.9,
        envMap: envMap,
        reflectivity: 0.6
      });

      const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const glowMatDim = new THREE.MeshBasicMaterial({ color: 0x003344 });

      // ---- Robot Group ----
      const robot = new THREE.Group();
      scene.add(robot);

      // Helper functions
      function makeSphere(r, mat, pos, scl) {
        const geo = new THREE.SphereGeometry(r, 32, 32);
        const mesh = new THREE.Mesh(geo, mat);
        if (pos) mesh.position.set(pos.x, pos.y, pos.z);
        if (scl) mesh.scale.set(scl.x, scl.y, scl.z);
        return mesh;
      }

      function makeCylinder(rt, rb, h, mat, pos, rot) {
        const geo = new THREE.CylinderGeometry(rt, rb, h, 20);
        const mesh = new THREE.Mesh(geo, mat);
        if (pos) mesh.position.set(pos.x, pos.y, pos.z);
        if (rot) mesh.rotation.set(rot.x, rot.y, rot.z);
        return mesh;
      }

      // ===== HEAD =====
      const head = makeSphere(0.65, bodyMat, {x:0, y:2.1, z:0}, {x:1, y:1.2, z:0.95});
      robot.add(head);

      // Visor
      const visor = makeSphere(0.58, visorMat, {x:0, y:2.2, z:0.22}, {x:1.02, y:0.55, z:0.7});
      robot.add(visor);

      // Eye dots (LED matrix)
      const eyePositions = [
        // Left eye cluster
        {x:-0.18, y:2.22, z:0.48}, {x:-0.13, y:2.22, z:0.49}, {x:-0.08, y:2.22, z:0.50},
        {x:-0.16, y:2.26, z:0.48}, {x:-0.11, y:2.26, z:0.49},
        {x:-0.18, y:2.18, z:0.48}, {x:-0.13, y:2.18, z:0.49}, {x:-0.08, y:2.18, z:0.50},
        // Right eye cluster  
        {x:0.08, y:2.22, z:0.50}, {x:0.13, y:2.22, z:0.49}, {x:0.18, y:2.22, z:0.48},
        {x:0.11, y:2.26, z:0.49}, {x:0.16, y:2.26, z:0.48},
        {x:0.08, y:2.18, z:0.50}, {x:0.13, y:2.18, z:0.49}, {x:0.18, y:2.18, z:0.48},
      ];

      const eyeDots = [];
      eyePositions.forEach(p => {
        const dot = makeSphere(0.018, glowMat, p);
        robot.add(dot);
        eyeDots.push(dot);
      });

      // ===== NECK =====
      const neck = makeCylinder(0.15, 0.18, 0.25, jointMat, {x:0, y:1.55, z:0});
      robot.add(neck);

      // Neck ring details
      const neckRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.19, 0.02, 8, 24),
        jointMat
      );
      neckRing.position.set(0, 1.45, 0);
      neckRing.rotation.x = Math.PI / 2;
      robot.add(neckRing);

      // ===== TORSO =====
      // Upper chest
      const chest = makeCylinder(0.55, 0.42, 0.9, bodyMat, {x:0, y:1.0, z:0}, null);
      chest.scale.set(1.2, 1, 0.7);
      robot.add(chest);

      // Lower torso / waist
      const waist = makeCylinder(0.38, 0.30, 0.45, bodyMat, {x:0, y:0.45, z:0});
      waist.scale.set(1.1, 1, 0.65);
      robot.add(waist);

      // Chest panel / plate
      const chestPlate = makeCylinder(0.35, 0.30, 0.12, jointMat, {x:0, y:1.1, z:0.28});
      chestPlate.scale.set(1.4, 1, 0.3);
      robot.add(chestPlate);

      // Glowing core (center of chest)
      const core = makeSphere(0.06, glowMat, {x:0, y:1.05, z:0.36});
      robot.add(core);

      // Core ring
      const coreRing = new THREE.Mesh(
        new THREE.RingGeometry(0.09, 0.12, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.2 })
      );
      coreRing.position.set(0, 1.05, 0.37);
      robot.add(coreRing);

      // "AVABOT" label area (subtle strip)
      const labelStrip = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.06),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 })
      );
      labelStrip.position.set(0, 0.85, 0.35);
      robot.add(labelStrip);

      // ===== SHOULDERS =====
      const shoulderL = makeSphere(0.18, jointMat, {x:-0.72, y:1.3, z:0});
      const shoulderR = makeSphere(0.18, jointMat, {x:0.72, y:1.3, z:0});
      robot.add(shoulderL);
      robot.add(shoulderR);

      // Shoulder armor plates
      const shoulderArmorGeo = new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const shoulderArmorL = new THREE.Mesh(shoulderArmorGeo, bodyMat);
      shoulderArmorL.position.set(-0.72, 1.32, 0);
      shoulderArmorL.scale.set(1.1, 0.8, 0.9);
      robot.add(shoulderArmorL);
      const shoulderArmorR = new THREE.Mesh(shoulderArmorGeo.clone(), bodyMat);
      shoulderArmorR.position.set(0.72, 1.32, 0);
      shoulderArmorR.scale.set(1.1, 0.8, 0.9);
      robot.add(shoulderArmorR);

      // ===== UPPER ARMS =====
      const upperArmL = makeCylinder(0.12, 0.10, 0.55, bodyMat, {x:-0.78, y:0.9, z:0});
      upperArmL.rotation.z = 0.15;
      const upperArmR = makeCylinder(0.12, 0.10, 0.55, bodyMat, {x:0.78, y:0.9, z:0});
      upperArmR.rotation.z = -0.15;
      robot.add(upperArmL);
      robot.add(upperArmR);

      // Elbow joints
      const elbowL = makeSphere(0.11, jointMat, {x:-0.82, y:0.58, z:0});
      const elbowR = makeSphere(0.11, jointMat, {x:0.82, y:0.58, z:0});
      robot.add(elbowL);
      robot.add(elbowR);

      // ===== LOWER ARMS =====
      const lowerArmL = makeCylinder(0.10, 0.09, 0.5, bodyMat, {x:-0.85, y:0.28, z:0});
      lowerArmL.rotation.z = 0.08;
      const lowerArmR = makeCylinder(0.10, 0.09, 0.5, bodyMat, {x:0.85, y:0.28, z:0});
      lowerArmR.rotation.z = -0.08;
      robot.add(lowerArmL);
      robot.add(lowerArmR);

      // ===== HANDS =====
      const handL = makeSphere(0.09, jointMat, {x:-0.86, y:0.0, z:0}, {x:0.9, y:1.1, z:0.7});
      const handR = makeSphere(0.09, jointMat, {x:0.86, y:0.0, z:0}, {x:0.9, y:1.1, z:0.7});
      robot.add(handL);
      robot.add(handR);

      // ===== HIP / PELVIS =====
      const hip = makeCylinder(0.28, 0.22, 0.2, jointMat, {x:0, y:0.2, z:0});
      hip.scale.set(1.2, 1, 0.7);
      robot.add(hip);

      // ===== UPPER LEGS =====
      const upperLegL = makeCylinder(0.12, 0.10, 0.65, bodyMat, {x:-0.22, y:-0.22, z:0});
      const upperLegR = makeCylinder(0.12, 0.10, 0.65, bodyMat, {x:0.22, y:-0.22, z:0});
      robot.add(upperLegL);
      robot.add(upperLegR);

      // Knee joints
      const kneeL = makeSphere(0.11, jointMat, {x:-0.22, y:-0.58, z:0});
      const kneeR = makeSphere(0.11, jointMat, {x:0.22, y:-0.58, z:0});
      robot.add(kneeL);
      robot.add(kneeR);

      // ===== LOWER LEGS =====
      const lowerLegL = makeCylinder(0.10, 0.09, 0.6, bodyMat, {x:-0.22, y:-0.92, z:0});
      const lowerLegR = makeCylinder(0.10, 0.09, 0.6, bodyMat, {x:0.22, y:-0.92, z:0});
      robot.add(lowerLegL);
      robot.add(lowerLegR);

      // ===== FEET =====
      const footGeo = new THREE.BoxGeometry(0.16, 0.06, 0.26);
      const footL = new THREE.Mesh(footGeo, jointMat);
      footL.position.set(-0.22, -1.25, 0.04);
      const footR = new THREE.Mesh(footGeo.clone(), jointMat);
      footR.position.set(0.22, -1.25, 0.04);
      robot.add(footL);
      robot.add(footR);

      // Center the robot group vertically
      robot.position.set(0, 0.2, 0);

      // ===== BACKGROUND PARTICLES =====
      const particleCount = 250;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const pSpeeds = [];

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i]     = (Math.random() - 0.5) * 14;
        positions[i + 1] = (Math.random() - 0.5) * 14;
        positions[i + 2] = (Math.random() - 0.5) * 8;
        pSpeeds.push({
          x: (Math.random() - 0.5) * 0.002,
          y: (Math.random() - 0.5) * 0.002,
          z: (Math.random() - 0.5) * 0.001
        });
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Particle texture
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 32; pCanvas.height = 32;
      const pCtx = pCanvas.getContext('2d');
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.2, 'rgba(0,200,255,0.8)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);

      const particleMat = new THREE.PointsMaterial({
        size: 0.08,
        map: new THREE.CanvasTexture(pCanvas),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // ===== LIGHTING =====
      // Strong ambient so the robot is always visible
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      // Key light from top-right-front
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
      keyLight.position.set(3, 4, 5);
      scene.add(keyLight);

      // Cyan fill light from left
      const fillLight = new THREE.DirectionalLight(0x00ccff, 2.5);
      fillLight.position.set(-5, 2, 3);
      scene.add(fillLight);

      // Backlight for rim/edge lighting
      const backLight = new THREE.DirectionalLight(0xffffff, 1.5);
      backLight.position.set(0, 3, -5);
      scene.add(backLight);

      // Bottom subtle up-light 
      const bottomLight = new THREE.DirectionalLight(0x003355, 1.0);
      bottomLight.position.set(0, -3, 2);
      scene.add(bottomLight);

      // Point light near the core for localized glow
      const coreLight = new THREE.PointLight(0x00f0ff, 2, 3);
      coreLight.position.set(0, 1.05, 0.4);
      scene.add(coreLight);

      console.log('[Avabot3D] Scene built. Starting animation loop.');

      // ===== MOUSE TRACKING =====
      let targetRotY = 0;
      let targetRotX = 0;

      document.addEventListener('mousemove', (e) => {
        const mx = (e.clientX / window.innerWidth) - 0.5;
        const my = (e.clientY / window.innerHeight) - 0.5;
        targetRotY = mx * 0.6;
        targetRotX = my * 0.3;
      });

      // ===== ANIMATION LOOP =====
      let time = 0;

      function animate() {
        requestAnimationFrame(animate);
        time += 0.016;

        // Smooth lerp rotation
        robot.rotation.y += (targetRotY - robot.rotation.y) * 0.06;
        robot.rotation.x += (targetRotX - robot.rotation.x) * 0.06;

        // Breathing float
        robot.position.y = 0.2 + Math.sin(time * 1.2) * 0.1;

        // Eye + core glow pulsation
        const pulse = 0.5 + Math.sin(time * 3.0) * 0.5;
        const r = 0.0;
        const g = pulse * 0.94 + 0.06;
        const b = pulse * 1.0;
        glowMat.color.setRGB(r, g, b);
        coreLight.intensity = 1.0 + pulse * 2.0;

        // Particle drift
        const posArr = particleGeo.attributes.position.array;
        for (let i = 0; i < particleCount * 3; i += 3) {
          const idx = i / 3;
          posArr[i]     += pSpeeds[idx].x;
          posArr[i + 1] += pSpeeds[idx].y;
          posArr[i + 2] += pSpeeds[idx].z;
          if (Math.abs(posArr[i]) > 7) posArr[i] = (Math.random() - 0.5) * 14;
          if (Math.abs(posArr[i+1]) > 7) posArr[i+1] = (Math.random() - 0.5) * 14;
          if (Math.abs(posArr[i+2]) > 4) posArr[i+2] = (Math.random() - 0.5) * 8;
        }
        particleGeo.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
      }

      animate();

      // ===== RESIZE =====
      window.addEventListener('resize', () => {
        const rw = container.clientWidth || w;
        const rh = container.clientHeight || h;
        camera.aspect = rw / rh;
        camera.updateProjectionMatrix();
        renderer.setSize(rw, rh);
      });

    } catch (err) {
      console.error('[Avabot3D] Fatal error:', err);
      const errEl = document.createElement('div');
      errEl.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;background:rgba(200,30,30,0.95);color:#fff;padding:15px;border-radius:8px;z-index:999999;font:13px/1.4 monospace;box-shadow:0 10px 30px rgba(0,0,0,0.5)';
      errEl.innerHTML = `<b>Avabot WebGL Error:</b> ${err.message}<br><small>${err.stack||''}</small>`;
      document.body.appendChild(errEl);
    }
  }

  // Trigger init on window load to ensure CSS layout is fully resolved
  if (document.readyState === 'complete') {
    init3D();
  } else {
    window.addEventListener('load', init3D);
  }
});
