/* =============================================================
   ARTIFICIAL INTELLIGENCE — Presentation Site
   Vanilla JS only. No dependencies, no build step.
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNeuralCanvas();
  initScrollProgress();
  initFadeIns();
  initDotNav();
  initTimelineFill();
  initSmoothButtons();
  initQuiz();
  initBackToTop();
});

/* -------------------------------------------------------------
   1. Neural network background animation (hero canvas)
   ------------------------------------------------------------- */
function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');

  let width, height, nodes;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    width = canvas.width = hero.offsetWidth;
    height = canvas.height = hero.offsetHeight;
    const count = Math.min(70, Math.floor((width * height) / 18000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 1
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Update positions
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });

    // Draw connections
    const maxDist = Math.min(160, width / 6);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.35;
          ctx.strokeStyle = `rgba(45, 212, 191, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(210, 245, 240, 0.85)';
      ctx.fill();
    });

    if (!prefersReducedMotion) requestAnimationFrame(draw);
  }

  resize();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });
}

/* -------------------------------------------------------------
   2. Scroll progress bar at top of page
   ------------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  function update() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = percent + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* -------------------------------------------------------------
   3. Fade-in elements as they enter the viewport
   ------------------------------------------------------------- */
function initFadeIns() {
  const items = document.querySelectorAll('.fade-in');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(item => observer.observe(item));
}

/* -------------------------------------------------------------
   4. Dot navigation — highlight active section + click to scroll
   ------------------------------------------------------------- */
function initDotNav() {
  const dots = document.querySelectorAll('.dot-nav .dot');
  const sections = Array.from(dots).map(dot => document.querySelector(dot.getAttribute('href')));
  if (!dots.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const index = sections.indexOf(entry.target);
      if (entry.isIntersecting && index !== -1) {
        dots.forEach(d => d.classList.remove('active'));
        dots[index].classList.add('active');
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(sec => sec && observer.observe(sec));

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(dot.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* -------------------------------------------------------------
   5. Timeline progress fill, tied to scroll position
   ------------------------------------------------------------- */
function initTimelineFill() {
  const timeline = document.querySelector('.timeline');
  const fill = document.getElementById('timelineFill');
  if (!timeline || !fill) return;

  function update() {
    const rect = timeline.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const total = rect.height;
    // How much of the timeline has scrolled past the middle of the viewport
    const progressed = (viewportH * 0.75) - rect.top;
    const percent = Math.max(0, Math.min(1, progressed / total));
    fill.style.height = (percent * 100) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* -------------------------------------------------------------
   6. Buttons that smooth-scroll to a target section
   ------------------------------------------------------------- */
function initSmoothButtons() {
  const startBtn = document.getElementById('startExploring');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      document.getElementById('what-is-ai').scrollIntoView({ behavior: 'smooth' });
    });
  }
}

/* -------------------------------------------------------------
   7. Quiz logic — 3 questions, instant feedback, score at end
   ------------------------------------------------------------- */
function initQuiz() {
  const quizBox = document.getElementById('quizBox');
  if (!quizBox) return;

  const questions = Array.from(quizBox.querySelectorAll('.quiz-question'));
  const progressBar = document.getElementById('quizProgressBar');
  const resultBox = document.getElementById('quizResult');
  const scoreEl = document.getElementById('quizScore');
  const resultTextEl = document.getElementById('quizResultText');
  const restartBtn = document.getElementById('quizRestart');

  let currentIndex = 0;
  let score = 0;

  function updateProgress() {
    const percent = ((currentIndex) / questions.length) * 100;
    progressBar.style.width = Math.min(percent, 100) + '%';
  }

  function showQuestion(index) {
    questions.forEach((q, i) => q.classList.toggle('active', i === index));
    updateProgress();
  }

  function showResult() {
    resultBox.classList.add('active');
    progressBar.style.width = '100%';
    scoreEl.textContent = `${score}/${questions.length}`;

    let message = 'Nice try! Review the topics and try again.';
    if (score === questions.length) message = 'Perfect score! You know your AI facts.';
    else if (score >= questions.length / 2) message = 'Good job! You know AI pretty well.';
    resultTextEl.textContent = message;
  }

  questions.forEach((question) => {
    const options = question.querySelectorAll('.quiz-option');
    const feedback = question.querySelector('.quiz-feedback');

    options.forEach(option => {
      option.addEventListener('click', () => {
        // Lock all options in this question
        options.forEach(o => o.disabled = true);

        const isCorrect = option.getAttribute('data-correct') === 'true';
        if (isCorrect) {
          option.classList.add('correct');
          feedback.textContent = 'Correct! Well done.';
          feedback.style.color = 'var(--good)';
          score++;
        } else {
          option.classList.add('wrong');
          feedback.textContent = 'Not quite. The correct answer is highlighted.';
          feedback.style.color = 'var(--bad)';
          options.forEach(o => {
            if (o.getAttribute('data-correct') === 'true') o.classList.add('correct');
          });
        }

        // Move to next question (or show result) after a short pause
        setTimeout(() => {
          currentIndex++;
          if (currentIndex < questions.length) {
            showQuestion(currentIndex);
          } else {
            showResult();
          }
        }, 1100);
      });
    });
  });

  function resetQuiz() {
    currentIndex = 0;
    score = 0;
    resultBox.classList.remove('active');
    questions.forEach(q => {
      const opts = q.querySelectorAll('.quiz-option');
      opts.forEach(o => {
        o.disabled = false;
        o.classList.remove('correct', 'wrong');
      });
      q.querySelector('.quiz-feedback').textContent = '';
    });
    showQuestion(0);
  }

  if (restartBtn) restartBtn.addEventListener('click', resetQuiz);

  showQuestion(0);
}

/* -------------------------------------------------------------
   8. Back-to-top button in footer
   ------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
