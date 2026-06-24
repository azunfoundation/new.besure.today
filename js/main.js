/* ============================================
   BeSURE Business Consulting - Main JavaScript
   Core functionality: Navigation, Animations, 
   Counters, Carousel, Accordion, Filters
   ============================================ */

(function() {
  'use strict';

  /* ===== DOM Ready ===== */
  document.addEventListener('DOMContentLoaded', function() {
    initStickyHeader();
    initMobileMenu();
    initScrollAnimations();
    initCounterAnimation();
    initTestimonialCarousel();
    initFaqAccordion();
    initPortfolioFilters();
    initIndustryTabs();
    initSmoothScroll();
    initScrollToTop();
    initActiveNavState();
    initClientMarquee();
    initScrollProgress();
  });

  /* ===== 1. STICKY HEADER ===== */
  function initStickyHeader() {
    var header = document.querySelector('.header');
    if (!header) return;

    var isTransparent = header.classList.contains('header-transparent');
    var scrollThreshold = isTransparent ? 80 : 50;

    function handleScroll() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ===== 1b. SCROLL PROGRESS BAR ===== */
  function initScrollProgress() {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;

    function updateProgress() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ===== 2. MOBILE MENU ===== */
  function initMobileMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.mobile-menu');
    var overlay = document.querySelector('.mobile-overlay');
    var body = document.body;

    if (!toggle || !menu) return;

    function openMenu() {
      toggle.classList.add('active');
      menu.classList.add('active');
      if (overlay) overlay.classList.add('active');
      body.style.overflow = 'hidden';
    }

    function closeMenu() {
      toggle.classList.remove('active');
      menu.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      body.style.overflow = '';
    }

    toggle.addEventListener('click', function() {
      if (menu.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (overlay) {
      overlay.addEventListener('click', closeMenu);
    }

    // Close menu on link click
    var menuLinks = menu.querySelectorAll('a:not(.mobile-dropdown-toggle)');
    menuLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        if (!link.classList.contains('mobile-dropdown-toggle')) {
          closeMenu();
        }
      });
    });

    // Mobile dropdown toggles
    var dropdownToggles = menu.querySelectorAll('.mobile-dropdown-toggle');
    dropdownToggles.forEach(function(toggleBtn) {
      toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        var dropdown = toggleBtn.nextElementSibling;
        var icon = toggleBtn.querySelector('.dropdown-arrow');

        if (dropdown) {
          dropdown.classList.toggle('active');
          if (icon) {
            icon.style.transform = dropdown.classList.contains('active') 
              ? 'rotate(180deg)' 
              : 'rotate(0deg)';
          }
        }
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && menu.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  /* ===== 3. SCROLL ANIMATIONS ===== */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.animate');
    if (elements.length === 0) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      elements.forEach(function(el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show all elements
      elements.forEach(function(el) {
        el.classList.add('animated');
      });
    }
  }

  /* ===== 4. COUNTER ANIMATION ===== */
  function initCounterAnimation() {
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    function animateCounter(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var duration = 2000;
      var start = 0;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        var current = Math.floor(eased * target);
        el.textContent = prefix + current + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target + suffix;
        }
      }

      requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.5
      });

      counters.forEach(function(counter) {
        observer.observe(counter);
      });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ===== 5. TESTIMONIAL CAROUSEL ===== */
  function initTestimonialCarousel() {
    var carousel = document.querySelector('.testimonial-slider');
    if (!carousel) return;

    var track = carousel.querySelector('.testimonial-track');
    var cards = carousel.querySelectorAll('.testimonial-card');
    var dotsContainer = carousel.querySelector('.testimonial-dots');
    var prevBtn = carousel.querySelector('.testimonial-prev');
    var nextBtn = carousel.querySelector('.testimonial-next');

    if (!track || cards.length === 0) return;

    var currentIndex = 0;
    var visibleCards = getVisibleCards();
    var totalSlides = Math.ceil(cards.length / visibleCards);
    var autoplayInterval = null;

    function getVisibleCards() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function updateCarousel() {
      var cardWidth = cards[0].offsetWidth + 16; // card width + gap
      var offset = currentIndex * cardWidth * visibleCards;
      var maxOffset = track.scrollWidth - carousel.offsetWidth;
      offset = Math.min(offset, maxOffset);
      track.style.transform = 'translateX(-' + offset + 'px)';
      updateDots();
    }

    function updateDots() {
      if (!dotsContainer) return;
      var dots = dotsContainer.querySelectorAll('.testimonial-dot');
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function createDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      for (var i = 0; i < totalSlides; i++) {
        var dot = document.createElement('button');
        dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        (function(index) {
          dot.addEventListener('click', function() {
            currentIndex = index;
            updateCarousel();
            resetAutoplay();
          });
        })(i);
        dotsContainer.appendChild(dot);
      }
    }

    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalSlides;
      updateCarousel();
    }

    function prevSlide() {
      currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
      updateCarousel();
    }

    function resetAutoplay() {
      if (autoplayInterval) clearInterval(autoplayInterval);
      autoplayInterval = setInterval(nextSlide, 5000);
    }

    if (nextBtn) nextBtn.addEventListener('click', function() { nextSlide(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function() { prevSlide(); resetAutoplay(); });

    createDots();
    resetAutoplay();

    // Handle resize
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        var newVisible = getVisibleCards();
        if (newVisible !== visibleCards) {
          visibleCards = newVisible;
          totalSlides = Math.ceil(cards.length / visibleCards);
          currentIndex = Math.min(currentIndex, totalSlides - 1);
          createDots();
          updateCarousel();
        }
      }, 250);
    });
  }

  /* ===== 6. FAQ ACCORDION ===== */
  function initFaqAccordion() {
    var faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;

    faqItems.forEach(function(item) {
      var question = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');

      if (!question || !answer) return;

      question.addEventListener('click', function() {
        var isActive = item.classList.contains('active');

        // Close all items
        faqItems.forEach(function(otherItem) {
          otherItem.classList.remove('active');
          var otherAnswer = otherItem.querySelector('.faq-answer');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        });

        // Toggle current
        if (!isActive) {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });

    // Open first FAQ by default
    if (faqItems[0]) {
      faqItems[0].classList.add('active');
      var firstAnswer = faqItems[0].querySelector('.faq-answer');
      if (firstAnswer) {
        firstAnswer.style.maxHeight = firstAnswer.scrollHeight + 'px';
      }
    }
  }

  /* ===== 7. PORTFOLIO FILTERS ===== */
  function initPortfolioFilters() {
    var filters = document.querySelectorAll('.portfolio-filter');
    var items = document.querySelectorAll('.portfolio-item');

    if (filters.length === 0 || items.length === 0) return;

    filters.forEach(function(filter) {
      filter.addEventListener('click', function() {
        var category = filter.getAttribute('data-filter');

        // Update active filter
        filters.forEach(function(f) { f.classList.remove('active'); });
        filter.classList.add('active');

        // Filter items
        items.forEach(function(item) {
          var itemCategory = item.getAttribute('data-category');

          if (category === 'all' || itemCategory === category) {
            item.style.display = '';
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(function() {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
              item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            }, 50);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            setTimeout(function() {
              item.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  /* ===== 8. INDUSTRY TABS ===== */
  function initIndustryTabs() {
    var tabs = document.querySelectorAll('.industry-tab');
    var contents = document.querySelectorAll('.industry-content');

    if (tabs.length === 0) return;

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var target = tab.getAttribute('data-tab');

        tabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');

        contents.forEach(function(content) {
          if (content.getAttribute('data-tab-content') === target) {
            content.classList.add('active');
          } else {
            content.classList.remove('active');
          }
        });
      });
    });
  }

  /* ===== 9. SMOOTH SCROLL ===== */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var targetId = link.getAttribute('href');
        var targetEl = document.querySelector(targetId);

        if (targetEl) {
          e.preventDefault();
          var headerHeight = document.querySelector('.header')
            ? document.querySelector('.header').offsetHeight
            : 0;
          var targetPosition = targetEl.getBoundingClientRect().top 
            + window.pageYOffset 
            - headerHeight 
            - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /* ===== 10. SCROLL TO TOP ===== */
  function initScrollToTop() {
    var btn = document.querySelector('.scroll-top');
    if (!btn) return;

    function toggleButton() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }

    window.addEventListener('scroll', toggleButton, { passive: true });
    toggleButton();

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===== 11. ACTIVE NAV STATE ===== */
  function initActiveNavState() {
    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.nav-link, .dropdown-link');

    navLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (!href) return;

      // Normalize paths
      var linkPath = href.split('/').pop() || 'index.html';
      var pagePath = currentPath.split('/').pop() || 'index.html';

      if (linkPath === pagePath) {
        link.classList.add('active');
        // Also highlight parent nav item if in dropdown
        var parentItem = link.closest('.nav-item');
        if (parentItem) {
          var parentLink = parentItem.querySelector('.nav-link');
          if (parentLink) parentLink.classList.add('active');
        }
      }
    });
  }

  /* ===== 12. CLIENT LOGO MARQUEE ===== */
  function initClientMarquee() {
    var track = document.querySelector('.clients-track');
    if (!track) return;

    // Clone items for infinite scroll
    var items = track.innerHTML;
    track.innerHTML = items + items;
  }

})();
