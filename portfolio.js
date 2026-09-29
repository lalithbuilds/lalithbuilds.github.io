(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const body = document.body;
  const scene = document.getElementById('hero-scene');
  const wraps = [...scene.querySelectorAll('.scene-wrap')];
  const motion = document.getElementById('motion-toggle');
  // Respect each visitor's reduced-motion preference until they explicitly
  // choose Play; the visible control remains available in either state.
  let manualMotion = false;
  let motionOff = reduced.matches;
  let pointerX = 0, pointerY = 0, currentX = 0, currentY = 0;
  const updateMotion = () => {
    body.classList.toggle('motion-off', motionOff);
    body.classList.toggle('force-motion', manualMotion && !motionOff);
    motion.textContent = motionOff ? 'Play motion ◉' : 'Pause motion ◉';
    motion.setAttribute('aria-pressed', String(motionOff));
  };
  motion.addEventListener('click', () => { manualMotion = true; motionOff = !motionOff; updateMotion(); });
  reduced.addEventListener('change', event => { if (!manualMotion) { motionOff = event.matches; updateMotion(); } });
  updateMotion();
  scene.addEventListener('pointermove', event => {
    const r = scene.getBoundingClientRect();
    pointerX = (event.clientX - r.left) / r.width * 2 - 1;
    pointerY = (event.clientY - r.top) / r.height * 2 - 1;
  });
  scene.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  let last = 0;
  function animate(time) {
    const dt = Math.min(time - last || 16, 50); last = time;
    if (!motionOff && !document.hidden) {
      currentX += (pointerX - currentX) * Math.min(dt * .006, .3);
      currentY += (pointerY - currentY) * Math.min(dt * .006, .3);
      wraps.forEach((wrap, i) => {
        const depth = [.8, .45, 1.15, 1.5][i];
        wrap.style.setProperty('--px', `${(currentX * depth * 22).toFixed(1)}px`);
        wrap.style.setProperty('--py', `${(currentY * depth * 18).toFixed(1)}px`);
      });
    }
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  const slides = [...document.querySelectorAll('.slide')];
  const tabs = [...document.querySelectorAll('[data-go]')];
  const count = document.getElementById('slide-count');
  let active = -1;
  let transitionTimer = 0;
  function commitSlide(index, focus) {
    active = index;
    slides.forEach((slide, i) => {
      const selected = i === active;
      slide.classList.toggle('active', selected);
      slide.setAttribute('aria-hidden', String(!selected));
      slide.inert = !selected;
    });
    tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === active)); tab.tabIndex = i === active ? 0 : -1; });
    count.textContent = `0${active + 1} / 0${slides.length}`;
    if (focus) tabs[active].focus();
    slider.classList.remove('is-changing');
  }
  function go(index, focus = false) {
    const next = (index + slides.length) % slides.length;
    if (next === active) return;
    clearTimeout(transitionTimer);
    if (active < 0 || motionOff) { commitSlide(next, focus); return; }
    slider.dataset.direction = next > active || (active === slides.length - 1 && next === 0) ? 'next' : 'prev';
    slider.classList.add('is-changing');
    const incoming = slides[next];
    incoming.classList.add('entering');
    requestAnimationFrame(() => requestAnimationFrame(() => incoming.classList.add('entering-now')));
    transitionTimer = setTimeout(() => {
      slides.forEach(slide => slide.classList.remove('entering', 'entering-now'));
      commitSlide(next, focus);
    }, 560);
  }
  document.getElementById('slide-prev').addEventListener('click', () => go(active - 1));
  document.getElementById('slide-next').addEventListener('click', () => go(active + 1));
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => go(i));
    tab.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); go(active + 1, true); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); go(active - 1, true); }
      if (event.key === 'Home') { event.preventDefault(); go(0, true); }
      if (event.key === 'End') { event.preventDefault(); go(slides.length - 1, true); }
    });
  });
  let touchStart = null;
  const slider = document.getElementById('project-slider');
  slider.addEventListener('touchstart', event => { touchStart = event.touches[0].clientX; }, { passive:true });
  slider.addEventListener('touchend', event => {
    if (touchStart === null) return;
    const delta = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 55) go(active + (delta < 0 ? 1 : -1));
    touchStart = null;
  }, { passive:true });
  go(0);

  const reveals = [...document.querySelectorAll('.reveal')];
  if ('IntersectionObserver' in window && !reduced.matches) {
    body.classList.add('js-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('in-view', entry.isIntersecting);
    }), { threshold:.08, rootMargin:'0px 0px 30px 0px' });
    reveals.forEach(element => observer.observe(element));
  }
  const sim = document.querySelector('.simulation-art');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { sim.classList.add('in-view'); }
    }), { threshold:.2 }).observe(sim);
  } else sim.classList.add('in-view');
  const progress = document.getElementById('scroll-progress');
  const manifesto = document.querySelector('.manifesto');
  const orbit = document.querySelector('.manifesto-orbit');
  const phrases = [...document.querySelectorAll('.manifesto-phrase')];
  const stepLabel = document.getElementById('manifesto-step');
  const chapterFill = document.querySelector('.manifesto-counter');
  const hero = document.querySelector('.hero');
  const clamp01 = value => Math.min(Math.max(value, 0), 1);
  const ease = value => { const t = clamp01(value); return t * t * (3 - 2 * t); };
  // Keep the chapter copy as normal readable text. The scene transition
  // animates whole phrases instead of hundreds of independently blurred nodes.
  function updateScenes() {
    const heroProgress = Math.min(Math.max(scrollY / Math.max(hero.offsetHeight, 1), 0), 1);
    if (!motionOff && (!reduced.matches || manualMotion)) {
      hero.querySelector('h1').style.opacity = (1 - Math.max(heroProgress - .24, 0) * 1.2).toFixed(3);
      scene.style.opacity = (1 - Math.max(heroProgress - .4, 0) * 1.25).toFixed(3);
      scene.style.setProperty('--hero-blur', `${Math.max(heroProgress - .55, 0) * 13}px`);
      scene.style.setProperty('--hero-drift', `${(-heroProgress * 70).toFixed(1)}px`);
      scene.style.setProperty('--hero-scale', (1 + heroProgress * .09).toFixed(3));
    }
    const max = Math.max(manifesto.offsetHeight - innerHeight, 1);
    const chapter = Math.min(Math.max((scrollY - manifesto.offsetTop) / max, 0), 1);
    const index = Math.min(Math.floor(chapter * phrases.length), phrases.length - 1);
    phrases.forEach((item, i) => {
      const phase = motionOff ? (i === index ? .5 : -1) : chapter * phrases.length - i;
      const entrance = ease((phase + .55) / .55);
      const exit = i === phrases.length - 1 ? 0 : ease((phase - .72) / .28);
      // Start the next panel just before the previous one vanishes so a
      // coarse wheel/touch scroll never lands on an empty frame.
      const opacity = entrance * (1 - exit);
      const y = 72 * (1 - entrance) - 220 * exit;
      const scale = .9 + .1 * entrance - .025 * exit;
      const blur = 8 * (1 - entrance) + 11 * exit;
      const clipTop = Math.round(exit * 38);
      const clipBottom = Math.round((1 - entrance) * 28);
      item.style.setProperty('--panel-opacity', opacity.toFixed(3));
      item.style.setProperty('--panel-y', `${y.toFixed(1)}px`);
      item.style.setProperty('--panel-scale', scale.toFixed(3));
      item.style.setProperty('--panel-blur', `${blur.toFixed(1)}px`);
      item.style.setProperty('--panel-clip-top', `${clipTop}%`);
      item.style.setProperty('--panel-clip-bottom', `${clipBottom}%`);
      item.setAttribute('aria-hidden', String(opacity < .45));
    });
    stepLabel.textContent = `0${index + 1}`;
    chapterFill.style.setProperty('--manifesto-fill', `${Math.round(chapter * 100)}%`);
    if (!motionOff && (!reduced.matches || manualMotion)) {
      const labSection = document.querySelector('.lab-section');
      const labObject = document.querySelector('.lab-object');
      const labProgress = Math.min(Math.max((scrollY + innerHeight - labSection.offsetTop) / Math.max(labSection.offsetHeight + innerHeight, 1), 0), 1);
      labObject.style.setProperty('--lab-rise', `${(-labProgress * 70).toFixed(1)}px`);
      labObject.style.setProperty('--lab-scale', (1 + labProgress * .08).toFixed(3));
      labObject.style.opacity = (1 - Math.max(labProgress - .73, 0) * 2.5).toFixed(3);
      orbit.style.setProperty('--orbit-scale', (1 + chapter * .32).toFixed(3));
      orbit.style.setProperty('--orbit-rotate', `${(chapter * 18).toFixed(1)}deg`);
      orbit.style.setProperty('--chapter-progress', chapter.toFixed(3));
    }
  }

  let ticking = false;
  function updateProgress() {
    const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
    progress.style.width = `${Math.min(scrollY / max * 100, 100)}%`;
    updateScenes();
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); } }, { passive:true });
  updateProgress();
})();
