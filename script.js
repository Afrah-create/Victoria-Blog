document.addEventListener('DOMContentLoaded', () => {
  // ══ Navigation — Scroll Behavior ══
  const siteNav = document.querySelector('.site-nav');
  const navAnchorLinks = document.querySelectorAll('.site-nav a, .mobile-menu a, .footer-nav a, .back-top, .cta');

  const handleNavScrollState = () => {
    if (!siteNav) return;
    if (window.scrollY > 80) {
      siteNav.classList.add('is-scrolled');
    } else {
      siteNav.classList.remove('is-scrolled');
    }
  };
  handleNavScrollState();
  window.addEventListener('scroll', handleNavScrollState, { passive: true });

  navAnchorLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, { passive: false });
  });

  // ══ Navigation — Mobile Toggle ══
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  const closeMobileMenu = () => {
    if (!mobileMenu || !navToggle) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      navToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }

  mobileMenuLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });

  // ══ Navigation — Active Section Tracking ══
  const sections = document.querySelectorAll('main section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-links a');

  if (sections.length && desktopNavLinks.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        desktopNavLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${id}`;
          if (isCurrent) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { threshold: 0.5 });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // ══ Hero — Entrance Animations ══
  const heroRevealItems = document.querySelectorAll('.hero .reveal');
  heroRevealItems.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add('is-revealed');
    }, index * 140 + 140);
  });

  // ══ Scroll Reveal — IntersectionObserver ══
  const revealItems = document.querySelectorAll('.reveal:not(.hero .reveal)');
  if (revealItems.length) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // ══ Portfolio — Filter System ══
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');

      galleryItems.forEach((item) => {
        const category = item.dataset.category || '';
        const shouldShow = filter === 'all' || category === filter;
        item.classList.toggle('is-hidden', !shouldShow);
      });
    });
  });

  // ══ Portfolio — Lightbox ══
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxMeta = document.getElementById('lightbox-meta');
  const lightboxDescription = document.getElementById('lightbox-description');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  let currentIndex = 0;
  let lastFocusedElement = null;

  const getVisibleItems = () => Array.from(galleryItems).filter((item) => !item.classList.contains('is-hidden'));

  const categoryLabels = {
    social: 'Social Narrative',
    process: 'Process',
    gallery: 'Gallery',
  };

  const updateLightbox = (index) => {
    const visibleItems = getVisibleItems();
    if (!visibleItems.length || !lightboxImage || !lightboxTitle || !lightboxMeta || !lightboxDescription) return;
    currentIndex = (index + visibleItems.length) % visibleItems.length;
    const item = visibleItems[currentIndex];
    lightboxImage.src = item.dataset.src || '';
    lightboxImage.alt = item.dataset.title || 'Artwork preview';
    lightboxTitle.textContent = item.dataset.title || '';
    const cat = item.dataset.category || '';
    lightboxMeta.textContent = categoryLabels[cat] || cat || '';
    lightboxDescription.textContent = item.dataset.description || '';
  };

  const openLightbox = (clickedItem) => {
    if (!lightbox || !(clickedItem instanceof HTMLElement)) return;
    const visibleItems = getVisibleItems();
    const idx = visibleItems.indexOf(clickedItem);
    if (idx === -1) return;
    lastFocusedElement = document.activeElement;
    updateLightbox(idx);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(item);
      }
    });
  });

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => updateLightbox(currentIndex - 1));
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => updateLightbox(currentIndex + 1));
  }
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  // ══ Journal — Read more / extended note ══
  document.querySelectorAll('.read-more').forEach((button) => {
    button.addEventListener('click', () => {
      const row = button.closest('.journal-row');
      const more = row?.querySelector('.journal-row__more');
      if (!row || !more) return;
      const willOpen = more.hidden;
      more.hidden = !willOpen;
      const isOpen = !more.hidden;
      button.setAttribute('aria-expanded', String(isOpen));
      button.textContent = isOpen ? 'Close note' : 'Read note';
    });
  });

  // ══ Contact — Form Handler ══
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const success = document.createElement('div');
      success.className = 'contact-success';
      success.innerHTML = '<h3>Thank you for getting in touch.</h3><p>I’ve received your message and will reply as soon as I can.</p>';
      contactForm.replaceWith(success);
    });
  }

  // ══ Scroll Progress Indicator ══
  const scrollRingButton = document.querySelector('.scroll-ring');
  const ringProgress = document.querySelector('.ring-progress');
  const ringLabel = scrollRingButton ? scrollRingButton.querySelector('span') : null;
  const ringCircumference = 151;

  const updateScrollProgress = () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? Math.min(100, Math.round((scrollTop / maxScroll) * 100)) : 0;
    const offset = ringCircumference - (ringCircumference * percent) / 100;
    if (ringProgress) ringProgress.style.strokeDashoffset = `${offset}`;
    if (ringLabel) ringLabel.textContent = `${percent}%`;
  };
  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });

  if (scrollRingButton) {
    scrollRingButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ══ Page Loader ══
  window.addEventListener('load', () => {
    const maxWait = setTimeout(removeLoader, 3000);
    function removeLoader() {
      clearTimeout(maxWait);
      const loader = document.getElementById('page-loader');
      if (!loader) return;
      loader.classList.add('loader--hiding');
      setTimeout(() => loader.remove(), 800);
    }
    setTimeout(removeLoader, 1400);
  });

  // ══ Utilities & Helpers ══
  document.addEventListener('keydown', (event) => {
    if (!lightbox || lightbox.getAttribute('aria-hidden') === 'true') return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') updateLightbox(currentIndex + 1);
    if (event.key === 'ArrowLeft') updateLightbox(currentIndex - 1);

    // Basic focus trap for accessibility inside the modal.
    if (event.key === 'Tab') {
      const focusables = lightbox.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
});
