/* ==========================================================================
   BeSURE Business Consulting — Main JavaScript v2.0
   ========================================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // 1. Dynamic Copyright Year
  // ========================================================================
  const copyrightYear = document.querySelector('.footer__year');
  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }

  // ========================================================================
  // 2. Scroll Progress Bar
  // ========================================================================
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = `${progress}%`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  // ========================================================================
  // 3. Header Scroll Effect
  // ========================================================================
  const header = document.querySelector('.header');
  const topBar = document.querySelector('.top-bar');
  let topBarHeight = topBar ? topBar.offsetHeight : 0;

  const handleHeaderScroll = () => {
    const scrollY = window.scrollY;

    if (scrollY > topBarHeight) {
      header.classList.add('scrolled');
      if (topBar) topBar.style.transform = `translateY(-100%)`;
    } else {
      header.classList.remove('scrolled');
      if (topBar) topBar.style.transform = 'translateY(0)';
    }
  };

  if (header) {
    // Adjust header position for top bar
    if (topBar) {
      topBar.style.position = 'fixed';
      topBar.style.top = '0';
      topBar.style.left = '0';
      topBar.style.width = '100%';
      topBar.style.zIndex = '201';
      topBar.style.transition = 'transform 0.3s ease';
      header.style.top = topBarHeight + 'px';
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();
  }

  // Recalculate on resize
  window.addEventListener('resize', () => {
    topBarHeight = topBar ? topBar.offsetHeight : 0;
    if (topBar && header) {
      header.style.top = window.scrollY > topBarHeight ? '0' : topBarHeight + 'px';
    }
  });

  // ========================================================================
  // 4. Mobile Menu
  // ========================================================================
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const body = document.body;

  const openMobileMenu = () => {
    mobileToggle?.classList.add('active');
    mobileMenu?.classList.add('active');
    mobileOverlay?.classList.add('active');
    body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    mobileToggle?.classList.remove('active');
    mobileMenu?.classList.remove('active');
    mobileOverlay?.classList.remove('active');
    body.style.overflow = '';
  };

  mobileToggle?.addEventListener('click', () => {
    if (mobileMenu?.classList.contains('active')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileOverlay?.addEventListener('click', closeMobileMenu);

  // Escape key closes mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Mobile dropdown toggles
  const mobileDropdownToggles = document.querySelectorAll('.mobile-menu__link[data-dropdown]');
  mobileDropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const sub = toggle.nextElementSibling;
      const isOpen = toggle.classList.contains('open');

      // Close all other dropdowns
      mobileDropdownToggles.forEach(other => {
        if (other !== toggle) {
          other.classList.remove('open');
          const otherSub = other.nextElementSibling;
          if (otherSub) otherSub.style.maxHeight = '0';
        }
      });

      // Toggle current
      toggle.classList.toggle('open');
      if (sub) {
        sub.style.maxHeight = isOpen ? '0' : sub.scrollHeight + 'px';
      }
    });
  });

  // ========================================================================
  // 5. Scroll Reveal Animations (IntersectionObserver)
  // ========================================================================
  const animateElements = document.querySelectorAll('.animate');

  if (animateElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(el => observer.observe(el));
  }

  // ========================================================================
  // 6. Animated Counters
  // ========================================================================
  const counters = document.querySelectorAll('[data-counter]');

  const easeOutExpo = (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = Math.round(target * easedProgress);

      el.textContent = currentValue + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  // ========================================================================
  // 7. FAQ Accordion
  // ========================================================================
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item, index) => {
    const question = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');

    // Auto-open first item
    if (index === 0) {
      item.classList.add('active');
      if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
    }

    question?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherAnswer = otherItem.querySelector('.faq-item__answer');
        if (otherAnswer) otherAnswer.style.maxHeight = '0';
      });

      // Open clicked (if wasn't active)
      if (!isActive) {
        item.classList.add('active');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ========================================================================
  // 8. Portfolio Filters
  // ========================================================================
  const filterButtons = document.querySelectorAll('.portfolio-filter');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const category = item.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          item.style.display = '';
          requestAnimationFrame(() => {
            item.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 400);
        }
      });
    });
  });

  // ========================================================================
  // 9. Scroll to Top
  // ========================================================================
  const scrollTopBtn = document.querySelector('.scroll-top');

  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ========================================================================
  // 10. Smooth Scroll for Anchor Links
  // ========================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length <= 1) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const offset = header ? header.offsetHeight + 20 : 20;
        const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ========================================================================
  // 11. Active Nav State
  // ========================================================================
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav__link, .nav__dropdown-link, .nav__mega-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && currentPath.endsWith(href.replace('./', '').replace('../', ''))) {
      link.classList.add('active');
      // Also activate parent nav item if in dropdown
      const parentItem = link.closest('.nav__item');
      if (parentItem) {
        const parentLink = parentItem.querySelector(':scope > .nav__link');
        if (parentLink) parentLink.classList.add('active');
      }
    }
  });

  // ========================================================================
  // 12. Client Logo Marquee Clone
  // ========================================================================
  const clientTrack = document.querySelector('.clients__track');
  if (clientTrack && clientTrack.children.length > 0) {
    // Clone all items for seamless loop
    const items = Array.from(clientTrack.children);
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clientTrack.appendChild(clone);
    });
  }

  // ========================================================================
  // 13. Hero Word Rotation (reset animation cycle)
  // ========================================================================
  const rotatingWords = document.querySelectorAll('.hero__title-word');
  if (rotatingWords.length > 0) {
    const totalDuration = 2000; // 2s per word
    const cycle = () => {
      rotatingWords.forEach((word, i) => {
        word.style.animation = 'none';
        void word.offsetHeight; // trigger reflow
        word.style.animation = `wordRotate ${rotatingWords.length * totalDuration / 1000}s ease-in-out infinite`;
        word.style.animationDelay = `${i * totalDuration / 1000}s`;
      });
    };
    cycle();
  }

});
