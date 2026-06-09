import * as THREE from 'three';
import * as GaussianSplats3D from 'https://cdn.jsdelivr.net/npm/@mkkellogg/gaussian-splats-3d@0.4.7/build/gaussian-splats-3d.module.js';

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

    console.log('[Avabot3D] Initializing Three.js scene with Gaussian Splatting...');

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
      camera.position.set(0, 0, 5);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);
      console.log('[Avabot3D] Renderer created and appended');

      // ---- Gaussian Splat DropInViewer ----
      const viewer = new GaussianSplats3D.DropInViewer({
        'gpuAcceleratedSort': false,
        'selfDrivenMode': true
      });

      // Position the viewer nicely in the scene
      viewer.position.set(0, 0.35, 0);
      viewer.scale.set(1.1, 1.1, 1.1);
      scene.add(viewer);

      // Load the splat scene
      viewer.addSplatScenes([{
        'path': 'splat.splat',
        'splatAlphaRemovalThreshold': 5
      }]).then(() => {
        console.log('[Avabot3D] Splat loaded successfully');
        const loader = document.getElementById('splat-loading');
        if (loader) {
          loader.classList.add('fade-out');
        }
      }).catch((err) => {
        console.error('[Avabot3D] Error loading splat:', err);
      });

      // ===== BACKGROUND PARTICLES =====
      const particleCount = 200;
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

        // Rotate viewer according to mouse
        viewer.rotation.y += (targetRotY - viewer.rotation.y) * 0.06;
        viewer.rotation.x += (targetRotX - viewer.rotation.x) * 0.06;

        // Floating animation
        viewer.position.y = 0.35 + Math.sin(time * 1.0) * 0.06;

        // Drift particles
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
