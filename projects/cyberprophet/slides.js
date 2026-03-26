/* ── Theme Manager ── */
class ThemeManager {
  constructor() {
    this.btn = document.querySelector('.theme-toggle');
    this.modes = ['dark', 'light'];
    this.idx = this.modes.indexOf(localStorage.getItem('theme') || 'dark');
    if (this.idx < 0) this.idx = 0;
    this.apply();
    this.btn?.addEventListener('click', () => this.cycle());
  }
  cycle() { this.idx = (this.idx + 1) % this.modes.length; this.apply(); }
  apply() {
    const m = this.modes[this.idx];
    localStorage.setItem('theme', m);
    document.documentElement.setAttribute('data-theme', m);
    this.updateIcon();
  }
  isDark() {
    const m = this.modes[this.idx];
    return m === 'dark';
  }
  updateIcon() {
    if (!this.btn) return;
    const dark = this.isDark();
    this.btn.querySelector('.icon-sun').style.display = dark ? 'none' : 'block';
    this.btn.querySelector('.icon-moon').style.display = dark ? 'block' : 'none';
  }
}

/* ── Slide Manager ── */
class SlideManager {
  constructor() {
    this.slides = [...document.querySelectorAll('.slide')];
    this.current = 0;
    this.isTransitioning = false;
    this.total = this.slides.length;
    this.progressFill = document.querySelector('.progress-fill');
    this.counterCurrent = document.querySelector('.slide-counter .current');
    this.counterTotal = document.querySelector('.slide-counter .total');
    this.prevBtn = document.querySelector('.nav-prev');
    this.nextBtn = document.querySelector('.nav-next');
  }

  init() {
    if (this.counterTotal) this.counterTotal.textContent = this.total;

    // Hash navigation
    const hash = parseInt(location.hash.replace('#', ''), 10);
    if (!isNaN(hash) && hash >= 0 && hash < this.total) this.current = hash;

    this.goTo(this.current, false);
    this.initKeyboard();
    this.initTouch();
    this.initNav();
  }

  goTo(index, animate = true) {
    if (index < 0 || index >= this.total) return;
    if (animate && this.isTransitioning) return;

    const dir = index > this.current ? 1 : -1;
    const prev = this.slides[this.current];
    const next = this.slides[index];

    if (animate && prev !== next) {
      this.isTransitioning = true;
      prev.classList.remove('active');
      prev.classList.add(dir > 0 ? 'exit-left' : 'exit-right');

      next.classList.add(dir > 0 ? 'enter-right' : 'enter-left');
      requestAnimationFrame(() => {
        next.classList.add('active');
        next.classList.remove('enter-right', 'enter-left');
      });

      setTimeout(() => {
        prev.classList.remove('exit-left', 'exit-right');
        this.isTransitioning = false;
      }, 600);
    } else {
      this.slides.forEach(s => s.classList.remove('active', 'exit-left', 'exit-right', 'enter-left', 'enter-right'));
      next.classList.add('active');
    }

    this.current = index;
    this.updateProgress();
    this.resetAnimations(next);
    location.hash = index;
  }

  next() { this.goTo(this.current + 1); }
  prev() { this.goTo(this.current - 1); }

  updateProgress() {
    const pct = ((this.current + 1) / this.total) * 100;
    if (this.progressFill) this.progressFill.style.width = pct + '%';
    if (this.counterCurrent) this.counterCurrent.textContent = this.current + 1;
    if (this.prevBtn) this.prevBtn.disabled = this.current === 0;
    if (this.nextBtn) this.nextBtn.disabled = this.current === this.total - 1;
  }

  resetAnimations(slide) {
    slide.querySelectorAll('.animate-in').forEach(el => {
      el.classList.remove('animate-in');
      void el.offsetWidth; // force reflow
      el.classList.add('animate-in');
    });
  }

  initKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input,textarea,select')) return;
      switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case ' ':
          e.preventDefault(); this.next(); break;
        case 'ArrowLeft': case 'ArrowUp':
          e.preventDefault(); this.prev(); break;
        case 'Home': e.preventDefault(); this.goTo(0); break;
        case 'End': e.preventDefault(); this.goTo(this.total - 1); break;
      }
    });
  }

  initTouch() {
    let startX = 0;
    document.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
    document.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) dx < 0 ? this.next() : this.prev();
    });
  }

  initNav() {
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());
  }
}

/* ── 3D Card Tilt ── */
class CardTilt {
  constructor() {
    this.nodes = document.querySelectorAll('.arch-node, .persona-card');
    this.init();
  }
  init() {
    this.nodes.forEach(node => {
      // Add glare overlay
      const glare = document.createElement('div');
      glare.classList.add('card-glare');
      node.appendChild(glare);

      node.addEventListener('mousemove', (e) => this.onMove(e, node, glare));
      node.addEventListener('mouseleave', () => this.onLeave(node, glare));
    });
  }
  onMove(e, node, glare) {
    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 15;
    const rotateX = ((centerY - y) / centerY) * 15;

    node.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    node.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';

    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;
    glare.style.backgroundPosition = `${bgX}% ${bgY}%`;
  }
  onLeave(node, glare) {
    node.style.transform = '';
    node.style.boxShadow = '';
    glare.style.backgroundPosition = '';
  }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  const sm = new SlideManager();
  sm.init();
  new CardTilt();
});
