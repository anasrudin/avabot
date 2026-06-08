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
      // Creates a studio environment map with sharp, high-contrast softbox panel reflections
      function createEnvMap() {
        const size = 256;
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(size);
        const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget);
        
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
              
              // Dark background
              vec3 color = vec3(0.015, 0.015, 0.02);
              
              // Softbox 1: Left-Front Studio Light
              float angleY = atan(dir.z, dir.x);
              float softbox1 = smoothstep(0.88, 0.92, cos(angleY - 0.7)) * 
                               smoothstep(-0.6, -0.4, dir.y) * 
                               smoothstep(-0.6, -0.4, -dir.y);
              
              // Softbox 2: Right-Front Studio Light
              float softbox2 = smoothstep(0.88, 0.92, cos(angleY + 0.7)) * 
                               smoothstep(-0.6, -0.4, dir.y) * 
                               smoothstep(-0.6, -0.4, -dir.y);
                               
              // Softbox 3: Top Ambient Sky Highlight
              float softbox3 = smoothstep(0.85, 0.95, dir.y);
              
              // Softbox 4: Back Rim Highlight
              float softbox4 = smoothstep(0.92, 0.96, cos(angleY - 3.14)) * 
                               smoothstep(-0.8, -0.6, dir.y) * 
                               smoothstep(-0.8, -0.6, -dir.y);
              
              color += vec3(1.0, 1.0, 1.0) * softbox1 * 2.5;
              color += vec3(0.95, 0.98, 1.0) * softbox2 * 2.5;
              color += vec3(1.0, 1.0, 1.0) * softbox3 * 1.5;
              color += vec3(1.0, 1.0, 1.0) * softbox4 * 2.0;
              
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
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x050505,
        metalness: 0.98,
        roughness: 0.08,
        envMap: envMap,
        envMapIntensity: 2.5
      });

      const jointMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.85,
        roughness: 0.25,
        envMap: envMap,
        envMapIntensity: 1.5
      });

      const visorMat = new THREE.MeshStandardMaterial({
        color: 0x010101,
        metalness: 0.95,
        roughness: 0.02,
        envMap: envMap,
        envMapIntensity: 3.0
      });

      // ---- Robot Group ----
      const robot = new THREE.Group();
      scene.add(robot);

      // Helper functions for geometry creation
      function makeSphere(r, mat, pos, scl) {
        const geo = new THREE.SphereGeometry(r, 32, 32);
        const mesh = new THREE.Mesh(geo, mat);
        if (pos) mesh.position.set(pos.x, pos.y, pos.z);
        if (scl) mesh.scale.set(scl.x, scl.y, scl.z);
        return mesh;
      }

      // Explicit segmentation to prevent cache conflict
      function makeCylinder(rt, rb, h, mat, pos, rot) {
        const geo = new THREE.CylinderGeometry(rt, rb, h, 32);
        const mesh = new THREE.Mesh(geo, mat);
        if (pos) mesh.position.set(pos.x, pos.y, pos.z);
        if (rot) mesh.rotation.set(rot.x, rot.y, rot.z);
        return mesh;
      }

      function makeBox(w, h, d, mat, pos, rot) {
        const geo = new THREE.BoxGeometry(w, h, d);
        const mesh = new THREE.Mesh(geo, mat);
        if (pos) mesh.position.set(pos.x, pos.y, pos.z);
        if (rot) mesh.rotation.set(rot.x, rot.y, rot.z);
        return mesh;
      }

      // ===== HEAD & HELMET =====
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 2.1, 0);
      robot.add(headGroup);

      const helmetBase = makeSphere(0.48, bodyMat, {x:0, y:0, z:0}, {x:1.0, y:1.2, z:1.0});
      headGroup.add(helmetBase);

      const visorPanel = makeSphere(0.46, visorMat, {x:0, y:0.04, z:0.08}, {x:1.02, y:0.8, z:1.02});
      headGroup.add(visorPanel);

      const earL = makeCylinder(0.08, 0.08, 0.06, jointMat, {x:-0.46, y:0, z:0}, {x:0, y:0, z:Math.PI/2});
      const earR = makeCylinder(0.08, 0.08, 0.06, jointMat, {x:0.46, y:0, z:0}, {x:0, y:0, z:Math.PI/2});
      headGroup.add(earL);
      headGroup.add(earR);

      const jawPlate = makeSphere(0.3, bodyMat, {x:0, y:-0.2, z:0.12}, {x:0.9, y:0.7, z:1.0});
      headGroup.add(jawPlate);

      // ===== NECK =====
      const neckGroup = new THREE.Group();
      neckGroup.position.set(0, 1.55, 0);
      robot.add(neckGroup);

      const neckSpindle = makeCylinder(0.12, 0.14, 0.28, jointMat);
      neckGroup.add(neckSpindle);

      const neckRingUpper = makeCylinder(0.16, 0.16, 0.04, jointMat, {x:0, y:0.1, z:0});
      const neckRingLower = makeCylinder(0.18, 0.18, 0.04, jointMat, {x:0, y:-0.1, z:0});
      neckGroup.add(neckRingUpper);
      neckGroup.add(neckRingLower);

      // ===== SPINE =====
      const spineGroup = new THREE.Group();
      robot.add(spineGroup);
      for (let i = 0; i < 5; i++) {
        const segY = 0.45 + i * 0.22;
        const spineSeg = makeSphere(0.09, jointMat, {x:0, y:segY, z:-0.1});
        spineGroup.add(spineSeg);
      }

      // ===== CHEST / TORSO =====
      const chestGroup = new THREE.Group();
      robot.add(chestGroup);

      const chestCore = makeCylinder(0.3, 0.24, 0.75, jointMat, {x:0, y:1.15, z:0});
      chestCore.scale.set(1.4, 1, 0.8);
      chestGroup.add(chestCore);

      const pecL = makeSphere(0.28, bodyMat, {x:-0.22, y:1.24, z:0.16}, {x:0.9, y:0.7, z:0.6});
      pecL.rotation.set(0.1, 0.2, -0.05);
      chestGroup.add(pecL);

      const pecR = makeSphere(0.28, bodyMat, {x:0.22, y:1.24, z:0.16}, {x:0.9, y:0.7, z:0.6});
      pecR.rotation.set(0.1, -0.2, 0.05);
      chestGroup.add(pecR);

      const clavicleL = makeCylinder(0.03, 0.03, 0.52, jointMat, {x:-0.3, y:1.44, z:0.06}, {x:0, y:0, z:Math.PI/2 - 0.15});
      const clavicleR = makeCylinder(0.03, 0.03, 0.52, jointMat, {x:0.3, y:1.44, z:0.06}, {x:0, y:0, z:-Math.PI/2 + 0.15});
      chestGroup.add(clavicleL);
      chestGroup.add(clavicleR);

      const absPositions = [
        {x:-0.11, y:0.88, z:0.18}, {x:0.11, y:0.88, z:0.18},
        {x:-0.10, y:0.72, z:0.16}, {x:0.10, y:0.72, z:0.16},
        {x:-0.09, y:0.56, z:0.14}, {x:0.09, y:0.56, z:0.14}
      ];

      absPositions.forEach(p => {
        const abPlate = makeSphere(0.09, bodyMat, p, {x:1.0, y:0.68, z:0.5});
        chestGroup.add(abPlate);
      });

      const latL1 = makeSphere(0.15, bodyMat, {x:-0.34, y:0.92, z:0.06}, {x:0.6, y:1.2, z:0.8});
      latL1.rotation.z = -0.15;
      const latR1 = makeSphere(0.15, bodyMat, {x:0.34, y:0.92, z:0.06}, {x:0.6, y:1.2, z:0.8});
      latR1.rotation.z = 0.15;
      chestGroup.add(latL1);
      chestGroup.add(latR1);

      const latL2 = makeSphere(0.14, bodyMat, {x:-0.32, y:0.74, z:0.04}, {x:0.6, y:1.2, z:0.8});
      latL2.rotation.z = -0.1;
      const latR2 = makeSphere(0.14, bodyMat, {x:0.32, y:0.74, z:0.04}, {x:0.6, y:1.2, z:0.8});
      latR2.rotation.z = 0.1;
      chestGroup.add(latL2);
      chestGroup.add(latR2);

      // ===== SHOULDERS & ARMS =====
      const shoulders = [
        {side: 'L', sign: -1, posX: -0.66, posY: 1.34},
        {side: 'R', sign: 1, posX: 0.66, posY: 1.34}
      ];

      shoulders.forEach(s => {
        const shoulderJoint = makeSphere(0.14, jointMat, {x:s.posX, y:s.posY, z:0});
        robot.add(shoulderJoint);

        const pauldron = makeSphere(0.2, bodyMat, {x:s.posX, y:s.posY + 0.06, z:0}, {x:1.1, y:0.9, z:1.1});
        robot.add(pauldron);

        const upperArmStrut = makeCylinder(0.06, 0.05, 0.52, jointMat, {x:s.posX + s.sign * 0.05, y:s.posY - 0.32, z:0});
        upperArmStrut.rotation.z = s.sign * 0.08;
        robot.add(upperArmStrut);

        const bicepPlate = makeSphere(0.12, bodyMat, {x:s.posX + s.sign * 0.05, y:s.posY - 0.3, z:0.03}, {x:0.8, y:1.4, z:0.8});
        bicepPlate.rotation.z = s.sign * 0.08;
        robot.add(bicepPlate);

        const elbow = makeSphere(0.1, jointMat, {x:s.posX + s.sign * 0.09, y:s.posY - 0.62, z:-0.02});
        robot.add(elbow);

        const forearmStrut = makeCylinder(0.05, 0.042, 0.48, jointMat, {x:s.posX + s.sign * 0.12, y:s.posY - 0.88, z:-0.02});
        forearmStrut.rotation.z = s.sign * 0.06;
        robot.add(forearmStrut);

        const forearmPlate = makeCylinder(0.09, 0.07, 0.44, bodyMat, {x:s.posX + s.sign * 0.12, y:s.posY - 0.86, z:0.01});
        forearmPlate.rotation.z = s.sign * 0.06;
        robot.add(forearmPlate);

        const wristRing = makeCylinder(0.06, 0.06, 0.04, jointMat, {x:s.posX + s.sign * 0.14, y:s.posY - 1.12, z:-0.02});
        wristRing.rotation.z = s.sign * 0.06;
        robot.add(wristRing);

        const handGroup = new THREE.Group();
        handGroup.position.set(s.posX + s.sign * 0.15, s.posY - 1.2, -0.02);
        handGroup.rotation.z = s.sign * 0.06;
        robot.add(handGroup);

        const palm = makeBox(0.09, 0.09, 0.038, jointMat);
        handGroup.add(palm);

        const fingerSpread = [-0.032, -0.011, 0.011, 0.032];
        const fingerHeights = [0.06, 0.07, 0.07, 0.06];
        
        for (let f = 0; f < 4; f++) {
          const fx = fingerSpread[f];
          const fh = fingerHeights[f];
          
          const knuckle = makeSphere(0.015, jointMat, {x:fx, y:-0.05, z:0.01});
          const seg1 = makeCylinder(0.012, 0.01, fh * 0.6, jointMat, {x:fx, y:-0.05 - fh*0.3, z:0.01});
          const seg2 = makeCylinder(0.009, 0.007, fh * 0.4, jointMat, {x:fx, y:-0.05 - fh*0.7, z:0.01});
          
          handGroup.add(knuckle);
          handGroup.add(seg1);
          handGroup.add(seg2);
        }
        
        const thumbKnuckle = makeSphere(0.016, jointMat, {x: s.sign * -0.045, y:-0.02, z: 0.02});
        const thumbSeg = makeCylinder(0.012, 0.009, 0.045, jointMat, {x: s.sign * -0.062, y:-0.042, z:0.025});
        thumbSeg.rotation.z = s.sign * -0.4;
        handGroup.add(thumbKnuckle);
        handGroup.add(thumbSeg);
      });

      // ===== PELVIS / HIPS =====
      const pelvisGroup = new THREE.Group();
      pelvisGroup.position.set(0, 0.18, 0);
      robot.add(pelvisGroup);

      const pelvisCore = makeCylinder(0.25, 0.2, 0.24, jointMat);
      pelvisCore.scale.set(1.2, 1, 0.75);
      pelvisGroup.add(pelvisCore);

      const pelvisCenterArmor = makeSphere(0.18, bodyMat, {x:0, y:-0.06, z:0.08}, {x:1.1, y:1.4, z:0.9});
      pelvisGroup.add(pelvisCenterArmor);

      const hipPlateL = makeSphere(0.16, bodyMat, {x:-0.2, y:0.02, z:0.02}, {x:0.9, y:1.0, z:0.9});
      const hipPlateR = makeSphere(0.16, bodyMat, {x:0.2, y:0.02, z:0.02}, {x:0.9, y:1.0, z:0.9});
      pelvisGroup.add(hipPlateL);
      pelvisGroup.add(hipPlateR);

      // ===== LEGS =====
      const legs = [
        {side: 'L', sign: -1, posX: -0.22},
        {side: 'R', sign: 1, posX: 0.22}
      ];

      legs.forEach(l => {
        const hipJoint = makeSphere(0.13, jointMat, {x:l.posX, y:0.14, z:0});
        robot.add(hipJoint);

        const thighStrut = makeCylinder(0.075, 0.062, 0.68, jointMat, {x:l.posX, y:-0.24, z:0});
        robot.add(thighStrut);

        const thighPlate = makeCylinder(0.14, 0.11, 0.62, bodyMat, {x:l.posX, y:-0.24, z:0.04});
        thighPlate.scale.set(1.15, 1, 0.85);
        robot.add(thighPlate);

        const knee = makeSphere(0.11, jointMat, {x:l.posX, y:-0.63, z:0.01});
        robot.add(knee);

        const kneecapPlate = makeSphere(0.09, bodyMat, {x:l.posX, y:-0.6, z:0.09}, {x:0.85, y:1.1, z:0.5});
        robot.add(kneecapPlate);

        const shinStrut = makeCylinder(0.06, 0.05, 0.65, jointMat, {x:l.posX, y:-1.0, z:0});
        robot.add(shinStrut);

        const shinPlate = makeCylinder(0.11, 0.08, 0.58, bodyMat, {x:l.posX, y:-0.98, z:0.04});
        shinPlate.scale.set(1.1, 1, 0.85);
        robot.add(shinPlate);

        const calfPlate = makeSphere(0.11, bodyMat, {x:l.posX, y:-0.94, z:-0.05}, {x:0.85, y:1.3, z:0.85});
        robot.add(calfPlate);

        const ankleJoint = makeSphere(0.07, jointMat, {x:l.posX, y:-1.34, z:0.01});
        robot.add(ankleJoint);

        const footGroup = new THREE.Group();
        footGroup.position.set(l.posX, -1.41, 0.04);
        robot.add(footGroup);

        const heel = makeBox(0.08, 0.06, 0.1, jointMat, {x:0, y:0, z:-0.03});
        const arch = makeBox(0.07, 0.04, 0.12, bodyMat, {x:0, y:-0.01, z:0.06});
        const toes = makeBox(0.09, 0.03, 0.08, jointMat, {x:0, y:-0.025, z:0.14});
        
        footGroup.add(heel);
        footGroup.add(arch);
        footGroup.add(toes);
      });

      robot.position.set(0, 0.35, 0);
      robot.scale.set(1.1, 1.1, 1.1);

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
      grad.addColorStop(0.2, 'rgba(210,225,255,0.6)');
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
      scene.add(new THREE.AmbientLight(0xffffff, 0.03));

      const keyLight = new THREE.DirectionalLight(0xffffff, 0.35);
      keyLight.position.set(0, 2, 4);
      scene.add(keyLight);

      const rimLightLeft = new THREE.DirectionalLight(0xffffff, 4.0);
      rimLightLeft.position.set(-5, 3, -4);
      scene.add(rimLightLeft);

      const rimLightRight = new THREE.DirectionalLight(0xffffff, 4.0);
      rimLightRight.position.set(5, 3, -4);
      scene.add(rimLightRight);

      const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
      topLight.position.set(0, 5, 0);
      scene.add(topLight);

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

        robot.rotation.y += (targetRotY - robot.rotation.y) * 0.06;
        robot.rotation.x += (targetRotX - robot.rotation.x) * 0.06;

        robot.position.y = 0.35 + Math.sin(time * 1.0) * 0.06;

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
