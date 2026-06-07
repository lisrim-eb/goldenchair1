/* Golden Chair Barbershop — JS */

// ── Silk hero canvas ──────────────────────────────────────────────────────────
(function () {
  const canvas = document.getElementById('hero-silk');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let time = 0;
  let animId;
  let active = true;
  const speed = 0.024;
  const scale = 2;
  const noiseIntensity = 0.3;
  const FPS = 30;
  const FRAME_MS = 1000 / FPS;
  let lastTs = 0;

  const resize = () => {
    canvas.width  = canvas.offsetWidth  || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const noise = (x, y) => {
    const G = 2.71828;
    return (G * Math.sin(G * x) * G * Math.sin(G * y) * (1 + x)) % 1;
  };

  const draw = (ts) => {
    animId = requestAnimationFrame(draw);
    if (!active) return;
    if (ts - lastTs < FRAME_MS) return;
    lastTs = ts;

    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const d = imageData.data;
    const tOff = speed * time;

    for (let x = 0; x < w; x += 2) {
      for (let y = 0; y < h; y += 2) {
        const u = (x / w) * scale;
        const v = (y / h) * scale;
        const tx = u;
        const ty = v + 0.03 * Math.sin(8.0 * tx - tOff);
        const pattern = 0.6 + 0.4 * Math.sin(
          5.0 * (tx + ty + Math.cos(3.0 * tx + 5.0 * ty) + 0.02 * tOff) +
          Math.sin(20.0 * (tx + ty - 0.1 * tOff))
        );
        const intensity = Math.max(0, pattern - (noise(x, y) / 15.0) * noiseIntensity);
        const r = Math.floor(220 * intensity);
        const g = Math.floor(208 * intensity);
        const b = Math.floor(235 * intensity);

        // fill 2×2 block so no black pixel gaps
        for (let dx = 0; dx < 2; dx++) {
          for (let dy = 0; dy < 2; dy++) {
            const px = x + dx, py = y + dy;
            if (px >= w || py >= h) continue;
            const i = (py * w + px) * 4;
            d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // radial vignette
    const vignette = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) / 2);
    vignette.addColorStop(0, 'rgba(0,0,0,0.08)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.40)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    time++;
  };

  // pause when hero is off-screen to save CPU
  const hero = document.getElementById('hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      active = entries[0].isIntersecting;
    }, { threshold: 0 }).observe(hero);
  }

  requestAnimationFrame(draw);
})();

// Nav scroll effect
const nav = document.getElementById('nav');
const fixedUI = document.getElementById('fixed-ui');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
    fixedUI.classList.add('visible');
  } else {
    nav.classList.remove('scrolled');
    fixedUI.classList.remove('visible');
  }
}, { passive: true });

// Scroll indicator — updates label + href to point at next upcoming section
const scrollSections = [
  { id: 'services',      label: 'Our Work'      },
  { id: 'booking',       label: 'Walk In'        },
  { id: 'book-online',   label: 'Booking'        },
  { id: 'testimonials',  label: 'Testimonials'   },
  { id: 'about',         label: 'About'          },
  { id: 'barbers',       label: 'Our Team'       },
  { id: 'contact',       label: 'Contact'        },
];
const pageScrollIndicator = document.getElementById('page-scroll-indicator');
const scrollLabel = document.getElementById('scroll-label');

function updateScrollIndicator() {
  const threshold = window.scrollY + window.innerHeight * 0.55;
  for (const { id, label } of scrollSections) {
    const el = document.getElementById(id);
    if (!el) continue;
    const elTop = el.getBoundingClientRect().top + window.scrollY;
    if (elTop > threshold) {
      scrollLabel.textContent = label;
      pageScrollIndicator.href = '#' + id;
      return;
    }
  }
  scrollLabel.textContent = 'Top';
  pageScrollIndicator.href = '#hero';
}

window.addEventListener('scroll', updateScrollIndicator, { passive: true });
updateScrollIndicator();

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');

hamburger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
});

// Close mobile nav when a link is clicked
navMobile.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navMobile.classList.remove('open'));
});

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

document.querySelectorAll('.sg-item .sg-img').forEach(img => {
  img.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

lightbox.addEventListener('click', () => {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
});

lightboxClose.addEventListener('click', e => {
  e.stopPropagation();
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// Scroll-triggered fade-in (AOS-lite)
const aosObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        aosObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('[data-aos]').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  aosObserver.observe(el);
});

// Booking form
const form = document.getElementById('booking-form');
const formSuccess = document.getElementById('form-success');

form.addEventListener('submit', e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.style.display = 'none';
    formSuccess.classList.add('show');
    form.querySelectorAll('input, select, textarea').forEach(el => el.value = '');
  }, 1200);
});

// Set min date on date input to today
const dateInput = form.querySelector('input[type="date"]');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}
