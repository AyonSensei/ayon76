/**
 * BEFORE IT FADES — Main Vanilla JavaScript
 * Pure vanilla JavaScript for atmospheric interactions, lightbox,
 * page transitions, scroll reveals, and restrained hero parallax.
 * No external runtime dependencies or frameworks.
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // =========================================================================
  // 1. Mobile Navigation Menu Toggle
  // =========================================================================
  const menuBtn = document.getElementById('mobileMenuToggle');
  const primaryNav = document.getElementById('primaryNav');

  if (menuBtn && primaryNav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuBtn.contains(e.target) && !primaryNav.contains(e.target) && primaryNav.classList.contains('is-open')) {
        primaryNav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        primaryNav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
      }
    });
  }

  // On phones, the home navigation points into the continuous one-page portfolio.
  const mobilePortfolioSections = document.getElementById('mobilePortfolioSections');
  if (mobilePortfolioSections && primaryNav) {
    primaryNav.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-onepage-target]');
      if (!link || !window.matchMedia('(max-width: 768px)').matches) return;

      const target = document.querySelector(link.dataset.onepageTarget);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      primaryNav.classList.remove('is-open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // Give touch users a brief glow response when a portfolio card is tapped.
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    let touchGlowTimer;
    document.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('.mobile-onepage-content .work-card, .mobile-onepage-content .hobby-card, .mobile-onepage-content .archive-card, .mobile-onepage-content .education-card');
      if (!card) return;
      card.classList.add('is-touch-active');
      window.clearTimeout(touchGlowTimer);
      touchGlowTimer = window.setTimeout(() => card.classList.remove('is-touch-active'), 850);
    }, { passive: true });
  }

  // =========================================================================
  // 2. Cinematic Page Transitions (View Transitions API + Fallback)
  // =========================================================================
  const handlePageNavigation = (e) => {
    if (e.defaultPrevented) return;
    if (prefersReducedMotion) return;

    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Filter out non-navigating links or external links
    if (
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      link.getAttribute('rel') === 'external' ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      e.ctrlKey || e.metaKey || e.shiftKey || e.altKey ||
      e.button !== 0
    ) {
      return;
    }

    // Resolve URL to check origin
    const targetUrl = new URL(link.href, window.location.origin);
    if (targetUrl.origin !== window.location.origin) return;

    // If navigating to the exact current URL path
    if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) {
      return;
    }

    // Check if View Transitions API is natively available
    if ('startViewTransition' in document) {
      // Modern browsers with View Transitions support
      e.preventDefault();
      document.startViewTransition(() => {
        window.location.href = targetUrl.href;
      });
      return;
    }

    // Graceful CSS transition fallback for all other browsers
    e.preventDefault();
    document.body.classList.add('page-is-exiting');

    setTimeout(() => {
      window.location.href = targetUrl.href;
    }, 180);
  };

  document.addEventListener('click', handlePageNavigation);

  // Clear exit state on browser back/forward (bfcache support)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      document.body.classList.remove('page-is-exiting');
    }
  });

  // =========================================================================
  // 3. Cinematic Scroll Reveals with Staggering (IntersectionObserver)
  // =========================================================================
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll(
      '.archive-card, .timeline-card, .timeline-entry, .work-card, .place-card, .friendship-card, .cinematic-quote, .contact-container, .reveal-on-scroll'
    );

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    revealTargets.forEach((el) => {
      // Calculate stagger delay based on sibling index in grid/parent container
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children);
        const index = siblings.indexOf(el);
        if (index > 0) {
          const delay = (index % 4) * 85;
          el.style.transitionDelay = `${delay}ms`;
        }
      }

      el.classList.add('reveal-on-scroll');
      revealObserver.observe(el);
    });
  }

  // =========================================================================
  // 4. Hero Enter The Archive Smooth Navigation (Home Screen)
  // =========================================================================
  const enterArchiveBtn = document.getElementById('enterArchiveBtn');
  if (enterArchiveBtn) {
    enterArchiveBtn.addEventListener('click', (e) => {
      const href = enterArchiveBtn.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          const header = document.querySelector('.site-header');
          const headerHeight = header ? header.offsetHeight : 72;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });

          // Accessibility focus management
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus({ preventScroll: true });
        }
      }
    });
  }

  // =========================================================================
  // 4b. Hero Portrait Stable Grounding (Home Screen)
  // Portrait remains firmly and permanently anchored to the floor plane without cursor drift
  // =========================================================================
  const heroPortraitFrame = document.getElementById('heroPortraitFrame');
  if (heroPortraitFrame) {
    heroPortraitFrame.addEventListener('animationend', (e) => {
      if (e.target === heroPortraitFrame) {
        heroPortraitFrame.classList.add('entrance-complete');
      }
    });
  }

  // =========================================================================
  // 5. Image Lightbox for Photographs and Memory Cards
  // =========================================================================
  const lightboxModal = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightboxModal && lightboxImg && lightboxClose) {
    const triggerImages = document.querySelectorAll('[data-lightbox="true"], .card-media img, .photo-frame img');

    triggerImages.forEach((img) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', (e) => {
        e.preventDefault();
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || 'Archive Photograph';
        if (lightboxCaption) {
          lightboxCaption.textContent = img.dataset.caption || img.alt || '';
        }
        lightboxModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('is-open');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

  // =========================================================================
  // 6. Contact Form Submission (Client-Side Graceful Feedback)
  // =========================================================================
  const contactForm = document.getElementById('archiveContactForm');
  const formSuccess = document.getElementById('formSuccessMessage');
  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.style.display = 'none';
      formSuccess.style.display = 'block';
    });
  }

  // =========================================================================
  // 7. ABOUT PAGE CINEMATIC INTERACTION SUITE
  // =========================================================================
  const aboutMain = document.getElementById('aboutPageMain');
  if (aboutMain) {
    // 7.1 Typographic Reveal for Major Headings
    const typoHeadings = aboutMain.querySelectorAll('[data-typo-reveal="true"]');
    typoHeadings.forEach((heading) => {
      const text = heading.textContent.trim();
      const words = text.split(/\s+/);
      heading.textContent = '';

      words.forEach((word, index) => {
        const wrap = document.createElement('span');
        wrap.className = 'typo-word-wrap';
        const inner = document.createElement('span');
        inner.className = 'typo-word-inner';
        inner.style.setProperty('--w-idx', index);
        inner.textContent = word;
        wrap.appendChild(inner);
        heading.appendChild(wrap);
      });
    });

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const headingObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -20px 0px'
      });

      typoHeadings.forEach((heading) => {
        headingObserver.observe(heading);
      });
    } else {
      typoHeadings.forEach((h) => h.classList.add('is-revealed'));
    }

    // 7.2 Interactive About Hero Parallax
    const aboutHero = document.getElementById('aboutHero');
    if (aboutHero && isFinePointer && !prefersReducedMotion) {
      const heroGlow = aboutHero.querySelector('.about-ambient-glow');
      const heroContent = aboutHero.querySelector('.about-hero-content');
      const heroBadge = aboutHero.querySelector('.about-hero-badge');

      let targetX = 0;
      let targetY = 0;
      let curX = 0;
      let curY = 0;
      let isHeroHover = false;
      let heroRafId = null;

      const updateHeroParallax = () => {
        curX += (targetX - curX) * 0.08;
        curY += (targetY - curY) * 0.08;

        if (heroGlow) {
          heroGlow.style.transform = `translate3d(${-curX * 22}px, ${-curY * 16}px, 0)`;
        }
        if (heroContent) {
          heroContent.style.transform = `translate3d(${curX * 7}px, ${curY * 5}px, 0) rotateY(${curX * 1.5}deg) rotateX(${-curY * 1.5}deg)`;
        }
        if (heroBadge) {
          heroBadge.style.transform = `translate3d(${-curX * 5}px, ${-curY * 4}px, 0)`;
        }

        if (isHeroHover || Math.abs(curX) > 0.005 || Math.abs(curY) > 0.005) {
          heroRafId = requestAnimationFrame(updateHeroParallax);
        } else {
          if (heroGlow) heroGlow.style.transform = '';
          if (heroContent) heroContent.style.transform = '';
          if (heroBadge) heroBadge.style.transform = '';
          heroRafId = null;
        }
      };

      aboutHero.addEventListener('mousemove', (e) => {
        const rect = aboutHero.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        targetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
        targetY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
        isHeroHover = true;

        if (!heroRafId) {
          heroRafId = requestAnimationFrame(updateHeroParallax);
        }
      });

      aboutHero.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        isHeroHover = false;
        if (!heroRafId) {
          heroRafId = requestAnimationFrame(updateHeroParallax);
        }
      });
    }

    // 7.3 About Portrait Pointer Tracking & Glare Micro-Interaction
    const portraitCard = document.getElementById('aboutPortraitCard');
    if (portraitCard && isFinePointer && !prefersReducedMotion) {
      let cardTargetX = 0;
      let cardTargetY = 0;
      let cardCurX = 0;
      let cardCurY = 0;
      let isCardHover = false;
      let cardRafId = null;

      const updateCardTilt = () => {
        cardCurX += (cardTargetX - cardCurX) * 0.09;
        cardCurY += (cardTargetY - cardCurY) * 0.09;

        const rotX = (-cardCurY * 3.5).toFixed(2);
        const rotY = (cardCurX * 3.5).toFixed(2);
        const transY = (-Math.abs(cardCurX) * 2 - 3).toFixed(2);

        portraitCard.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(${transY}px)`;

        if (isCardHover || Math.abs(cardCurX) > 0.005 || Math.abs(cardCurY) > 0.005) {
          cardRafId = requestAnimationFrame(updateCardTilt);
        } else {
          portraitCard.style.transform = '';
          cardRafId = null;
        }
      };

      portraitCard.addEventListener('mousemove', (e) => {
        const rect = portraitCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        portraitCard.style.setProperty('--mouse-x', `${x}px`);
        portraitCard.style.setProperty('--mouse-y', `${y}px`);

        cardTargetX = Math.max(-1, Math.min(1, (x / rect.width - 0.5) * 2));
        cardTargetY = Math.max(-1, Math.min(1, (y / rect.height - 0.5) * 2));
        isCardHover = true;

        if (!cardRafId) {
          cardRafId = requestAnimationFrame(updateCardTilt);
        }
      });

      portraitCard.addEventListener('mouseleave', () => {
        cardTargetX = 0;
        cardTargetY = 0;
        isCardHover = false;
        if (!cardRafId) {
          cardRafId = requestAnimationFrame(updateCardTilt);
        }
      });
    }

    // 7.4 Scroll Progress & Section Indicators (Desktop Tracker & Mobile Bar)
    const trackerPip = document.getElementById('aboutTrackerPip');
    const trackerRail = document.querySelector('.about-tracker-rail');
    const trackerDots = document.querySelectorAll('.tracker-dot');
    const mobileProgressFill = document.getElementById('aboutProgressFill');

    const sections = [
      { el: document.getElementById('aboutHero'), dot: document.querySelector('.tracker-dot[data-target="#aboutHero"]') },
      { el: document.getElementById('personBehind'), dot: document.querySelector('.tracker-dot[data-target="#personBehind"]') },
      { el: document.getElementById('personalOverview'), dot: document.querySelector('.tracker-dot[data-target="#personalOverview"]') },
      { el: document.getElementById('thingsThatMatter'), dot: document.querySelector('.tracker-dot[data-target="#thingsThatMatter"]') },
      { el: document.getElementById('beyondScreen'), dot: document.querySelector('.tracker-dot[data-target="#beyondScreen"]') },
      { el: document.getElementById('whyThisExists'), dot: document.querySelector('.tracker-dot[data-target="#whyThisExists"]') },
      { el: document.getElementById('feelingToLeave'), dot: document.querySelector('.tracker-dot[data-target="#feelingToLeave"]') }
    ].filter(item => item.el && item.dot);

    // Click waypoint to smoothly scroll
    trackerDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetSel = dot.getAttribute('data-target');
        const targetEl = document.querySelector(targetSel);
        if (targetEl) {
          const headerOffset = 90;
          const elementPosition = targetEl.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    });

    // Scroll progress handler
    let ticking = false;
    const handleAboutScroll = () => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const totalDocHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progressFraction = totalDocHeight > 0 ? Math.min(1, Math.max(0, scrollY / totalDocHeight)) : 0;

      // Update mobile progress bar
      if (mobileProgressFill) {
        mobileProgressFill.style.width = `${(progressFraction * 100).toFixed(1)}%`;
      }

      // Update desktop tracker pip
      if (trackerPip && trackerRail) {
        const railHeight = trackerRail.clientHeight;
        const pipHeight = trackerPip.clientHeight || 28;
        const travelDistance = Math.max(0, railHeight - pipHeight);
        const pipY = (progressFraction * travelDistance).toFixed(1);
        trackerPip.style.transform = `translateY(${pipY}px)`;
      }

      // Determine active section based on viewport center
      const viewCenter = scrollY + (window.innerHeight * 0.35);
      let currentSection = sections[0];

      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        const secTop = sec.el.offsetTop;
        if (secTop <= viewCenter) {
          currentSection = sec;
        }
      }

      if (currentSection && currentSection.dot) {
        trackerDots.forEach(d => d.classList.remove('is-active'));
        currentSection.dot.classList.add('is-active');
      }

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(handleAboutScroll);
        ticking = true;
      }
    }, { passive: true });

    // Initial positioning call
    handleAboutScroll();
  }

  // =========================================================================
  // 8. JOURNEY CINEMATIC TIMELINE CONTROLLER
  // =========================================================================
  const journeyTimeline = document.getElementById('journeyTimeline');
  if (journeyTimeline) {
    const spineFill = document.getElementById('journeySpineFill');
    const spineGlow = document.getElementById('journeySpineGlow');
    const milestones = Array.from(document.querySelectorAll('.journey-milestone'));
    const navChips = Array.from(document.querySelectorAll('.journey-nav-chip'));
    const revealMilestones = document.querySelectorAll('.reveal-milestone');

    // 8.1 Progressive Milestone Reveal Observer
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const milestoneObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      });

      revealMilestones.forEach((el, idx) => {
        el.style.transitionDelay = `${(idx % 2) * 90}ms`;
        milestoneObserver.observe(el);
      });
    } else {
      revealMilestones.forEach(el => el.classList.add('is-revealed'));
    }

    // 8.2 Scroll Tracking for Vertical Spine & Active Chapter
    let isScrollTicking = false;

    const updateJourneyScroll = () => {
      const rect = journeyTimeline.getBoundingClientRect();
      const timelineHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Start calculating when timeline enters middle of viewport
      const startTrigger = windowHeight * 0.55;
      const scrollPos = startTrigger - rect.top;
      const progress = Math.min(Math.max(scrollPos / timelineHeight, 0), 1);

      if (spineFill) {
        spineFill.style.height = `${(progress * 100).toFixed(1)}%`;
      }
      if (spineGlow) {
        spineGlow.style.top = `${(progress * 100).toFixed(1)}%`;
        spineGlow.style.opacity = progress > 0.01 && progress < 0.99 ? '1' : '0';
      }

      // Highlight active milestone based on viewport focus
      const focusPoint = windowHeight * 0.42;
      let activeIndex = 0;

      milestones.forEach((milestone, idx) => {
        const mRect = milestone.getBoundingClientRect();
        if (mRect.top <= focusPoint) {
          activeIndex = idx;
        }
      });

      milestones.forEach((m, idx) => {
        if (idx === activeIndex) {
          m.classList.add('is-active');
        } else {
          m.classList.remove('is-active');
        }
      });

      // Synchronize Quick Nav Chips
      if (milestones[activeIndex]) {
        const activeChapterId = milestones[activeIndex].id;
        navChips.forEach(chip => {
          if (chip.getAttribute('href') === `#${activeChapterId}`) {
            chip.classList.add('is-active');
          } else {
            chip.classList.remove('is-active');
          }
        });
      }

      isScrollTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!isScrollTicking) {
        requestAnimationFrame(updateJourneyScroll);
        isScrollTicking = true;
      }
    }, { passive: true });

    // 8.3 Quick Nav Smooth Scroll
    navChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const targetId = chip.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            const topOffset = targetEl.getBoundingClientRect().top + window.pageYOffset - 90;
            window.scrollTo({
              top: topOffset,
              behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
            targetEl.focus();
          }
        }
      });
    });

    // Initial calculation
    updateJourneyScroll();
  }

  // =========================================================================
  // 9. WORK SECTION INTERACTION & REVEAL CONTROLLER
  // =========================================================================
  const workMain = document.getElementById('workPageMain');
  if (workMain) {
    const revealWorkCards = workMain.querySelectorAll('.reveal-work-card');

    // 9.1 Progressive Viewport Reveal with Stagger
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const workObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
      });

      revealWorkCards.forEach((card, idx) => {
        card.style.transitionDelay = `${(idx % 2) * 120}ms`;
        workObserver.observe(card);
      });
    } else {
      revealWorkCards.forEach(card => card.classList.add('is-revealed'));
    }

    // 9.2 Subtle Cursor Depth Feedback (fine pointer & no reduced motion)
    if (isFinePointer && !prefersReducedMotion) {
      const workCards = workMain.querySelectorAll('.work-card');
      workCards.forEach((card) => {
        let isCardHover = false;
        let cTargetX = 0;
        let cTargetY = 0;
        let cCurX = 0;
        let cCurY = 0;
        let cRafId = null;

        const updateCardSpring = () => {
          cCurX += (cTargetX - cCurX) * 0.1;
          cCurY += (cTargetY - cCurY) * 0.1;

          if (isCardHover) {
            card.style.transform = `translate3d(${cCurX * 3}px, ${-6 + cCurY * 3}px, 0)`;
          }

          if (isCardHover || Math.abs(cCurX) > 0.005 || Math.abs(cCurY) > 0.005) {
            cRafId = requestAnimationFrame(updateCardSpring);
          } else {
            card.style.transform = '';
            cRafId = null;
          }
        };

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          cTargetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
          cTargetY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
          isCardHover = true;
          if (!cRafId) {
            cRafId = requestAnimationFrame(updateCardSpring);
          }
        });

        card.addEventListener('mouseleave', () => {
          cTargetX = 0;
          cTargetY = 0;
          isCardHover = false;
        });
      });
    }
  }

  // =========================================================================
  // 10. Hobbies Collection Interactivity & Staggered Reveal System
  // =========================================================================
  const hobbyMain = document.getElementById('hobbyPageMain');
  if (hobbyMain) {
    const revealHobbyCards = hobbyMain.querySelectorAll('.reveal-hobby-card');

    // 10.1 Progressive Viewport Reveal with Stagger
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
      const hobbyObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
      });

      revealHobbyCards.forEach((card, idx) => {
        card.style.transitionDelay = `${(idx % 3) * 90}ms`;
        hobbyObserver.observe(card);
      });
    } else {
      revealHobbyCards.forEach(card => card.classList.add('is-revealed'));
    }

    // 10.2 Subtle Cursor Spring Depth (fine pointer & no reduced motion)
    if (isFinePointer && !prefersReducedMotion) {
      const hobbyCards = hobbyMain.querySelectorAll('.hobby-card');
      hobbyCards.forEach((card) => {
        let isCardHover = false;
        let cTargetX = 0;
        let cTargetY = 0;
        let cCurX = 0;
        let cCurY = 0;
        let cRafId = null;

        const updateCardSpring = () => {
          cCurX += (cTargetX - cCurX) * 0.1;
          cCurY += (cTargetY - cCurY) * 0.1;

          if (isCardHover) {
            card.style.transform = `translate3d(${cCurX * 3}px, ${-6 + cCurY * 3}px, 0)`;
          }

          if (isCardHover || Math.abs(cCurX) > 0.005 || Math.abs(cCurY) > 0.005) {
            cRafId = requestAnimationFrame(updateCardSpring);
          } else {
            card.style.transform = '';
            cRafId = null;
          }
        };

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          cTargetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
          cTargetY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
          isCardHover = true;
          if (!cRafId) {
            cRafId = requestAnimationFrame(updateCardSpring);
          }
        });

        card.addEventListener('mouseleave', () => {
          cTargetX = 0;
          cTargetY = 0;
          isCardHover = false;
        });
      });
    }
  }

  // =========================================================================
  // 11. Cinematic Cartography Atlas & Holographic Theatre System
  // =========================================================================
  const placesMain = document.getElementById("placesMain");
  if (placesMain) {
    const theatreChamber = document.getElementById("atlasTheatre");
    const tabButtons = Array.from(document.querySelectorAll(".atlas-tab-btn"));
    const destinationCards = Array.from(document.querySelectorAll(".atlas-destination-card"));
    const dockCards = Array.from(document.querySelectorAll(".deck-thumb-card"));
    const quickPills = Array.from(document.querySelectorAll(".atlas-quick-pill"));
    
    // Header & Cockpit controls
    const cockpitCoords = document.getElementById("atlasActiveCoords") || document.getElementById("cockpitCoords");
    const stepPrevBtn = document.getElementById("atlasPrevBtn") || document.getElementById("atlasStepPrev");
    const stepNextBtn = document.getElementById("atlasNextBtn") || document.getElementById("atlasStepNext");
    const stepCurEl = document.querySelector("#atlasStepIndicator .step-cur") || document.getElementById("atlasStepCur");
    const watermarkStamp = document.getElementById("atlasWatermarkStamp");

    // Circular Flanking Controls (ByndLabs style)
    const holoNavPrev = document.getElementById("holoNavPrev");
    const holoNavNext = document.getElementById("holoNavNext");

    // 4-Corner Telemetry HUD elements
    const hudSectorCode = document.getElementById("hudSectorCode");
    const hudMainTitle = document.getElementById("hudMainTitle");
    const hudStatusText = document.getElementById("hudStatusText");
    const hudElevation = document.getElementById("hudElevation");
    const hudAtmosphere = document.getElementById("hudAtmosphere");
    const hudQuoteLine = document.getElementById("hudQuoteLine");
    const hudTagsRow = document.getElementById("hudTagsRow");
    const hudCoords = document.getElementById("hudCoords");
    const pedestalReadout = document.getElementById("pedestalReadoutText");

    // Floating Cursor Follower Badge
    const holoCursorBadge = document.getElementById("holoCursorBadge");
    const holoBadgeText = document.getElementById("holoBadgeText");

    // Modal elements
    const placesDetailOverlay = document.getElementById("placesDetailOverlay");
    const placesDetailBackdrop = document.getElementById("placesDetailBackdrop");
    const placesDetailCloseBtn = document.getElementById("placesDetailCloseBtn");
    const placesDetailFooterCloseBtn = document.getElementById("placesDetailFooterCloseBtn");
    const detailPanes = placesDetailOverlay ? placesDetailOverlay.querySelectorAll(".detail-pane") : [];
    const detailBadgeText = document.getElementById("detailBadgeText");

    // Teleport overlay directly to <body> so its containing block is strictly the viewport Window
    if (placesDetailOverlay && placesDetailOverlay.parentElement !== document.body) {
      document.body.appendChild(placesDetailOverlay);
    }

    const order = ["sylhet", "coxsbazar", "bandarban", "faridpur", "dhaka"];
    let currentIndex = 0;

    const destinationMeta = {
      sylhet: {
        coords: "24.8949° N, 91.8687° E",
        step: "01",
        sectorCode: "01 OF 05",
        title: "SYLHET HIGHLANDS",
        statusText: "CATALOGUED RECORD",
        elevation: "35M · TEA HILLS & VALLEYS",
        atmosphere: "ATMOSPHERE: MORNING RAIN HORIZONS",
        quote: "“Quiet green tea slopes and distant rain horizons.”",
        tags: ["NORTHEAST", "PAST EXPEDITION", "SURMA BASIN"],
        pedestal: "EXPEDITION CHAMBER // ARCHIVAL EMITTER ACTIVE · UNIT 01",
        watermark: "SYLHET // 24.8949° N",
        theme: "sylhet",
        badgePrompt: "EXPLORE HIGHLANDS",
        canvasColor: { r: 16, g: 185, b: 129 }
      },
      coxsbazar: {
        coords: "21.4272° N, 92.0058° E",
        step: "02",
        sectorCode: "02 OF 05",
        title: "COX'S BAZAR COASTLINE",
        statusText: "CATALOGUED RECORD",
        elevation: "4M · INTERTIDAL HORIZON",
        atmosphere: "ATMOSPHERE: COASTAL WIND & SURF",
        quote: "“Long stretches of surf, amber salt foam, and endless horizons.”",
        tags: ["BAY OF BENGAL", "COASTLINE", "120KM SHORE"],
        pedestal: "EXPEDITION CHAMBER // MARINE ARCHIVE EMITTER · UNIT 02",
        watermark: "COXS BAZAR // 21.4272° N",
        theme: "coxsbazar",
        badgePrompt: "EXPLORE COASTLINE",
        canvasColor: { r: 6, g: 182, b: 212 }
      },
      bandarban: {
        coords: "22.1953° N, 92.2184° E",
        step: "03",
        sectorCode: "03 OF 05",
        title: "BANDARBAN MOUNTAIN PASSES",
        statusText: "CATALOGUED RECORD",
        elevation: "790M · DIM PAHAR PEAK",
        atmosphere: "ATMOSPHERE: HIGH ALTITUDE CLOUD BANKS",
        quote: "“Winding asphalt cutting across high cloud passes and river foothills.”",
        tags: ["4 PASSES", "DIM PAHAR", "MIRINJA", "TOMA-TUNGI"],
        pedestal: "EXPEDITION CHAMBER // HIGH ALTITUDE EMITTER · UNIT 03",
        watermark: "BANDARBAN // 22.1953° N",
        theme: "bandarban",
        badgePrompt: "EXPLORE 4 PASSES",
        canvasColor: { r: 225, g: 29, b: 72 }
      },
      faridpur: {
        coords: "23.6071° N, 89.8429° E",
        step: "04",
        sectorCode: "04 OF 05",
        title: "FARIDPUR RIVER PLAINS",
        statusText: "CATALOGUED RECORD",
        elevation: "12M · ALLUVIAL DELTA BASIN",
        atmosphere: "ATMOSPHERE: DUSK MIST & SILENT CURRENTS",
        quote: "“A personal homecoming — shared laughter, boat crossings, and family roots.”",
        tags: ["FAMILY ROOTS", "PADMA BASIN", "NOSTALGIA"],
        pedestal: "EXPEDITION CHAMBER // ALLUVIAL MEMORIAL EMITTER · UNIT 04",
        watermark: "FARIDPUR // 23.6071° N",
        theme: "faridpur",
        badgePrompt: "EXPLORE ROOTS",
        canvasColor: { r: 245, g: 158, b: 11 }
      },
      dhaka: {
        coords: "23.8860° N, 90.3182° E",
        step: "05",
        sectorCode: "05 OF 05",
        title: "DHAKA LIVING CHAPTER",
        statusText: "LIVING RESIDENCE // ACTIVE",
        elevation: "14M · ASHULIA PERIMETER",
        atmosphere: "ATMOSPHERE: URBAN LIGHT & ACTIVE CODE",
        quote: "“The living anchor where daily light is captured and all journeys connect.”",
        tags: ["PRESENT DAY", "ASHULIA", "CURRENT CHAPTER"],
        pedestal: "EXPEDITION CHAMBER // ACTIVE BEACON BROADCAST · UNIT 05",
        watermark: "DHAKA // 23.8860° N",
        theme: "dhaka",
        badgePrompt: "EXPLORE LIVING FOLIO",
        canvasColor: { r: 99, g: 102, b: 241 }
      }
    };

    let activeThemeColor = destinationMeta.sylhet.canvasColor;

    // Switch Destination Handler
    const switchDestination = (placeId, updateFocus = false) => {
      const targetIndex = order.indexOf(placeId);
      if (targetIndex === -1 || targetIndex === currentIndex) return;

      currentIndex = targetIndex;
      const meta = destinationMeta[placeId];
      if (!meta) return;

      activeThemeColor = meta.canvasColor;

      // Update Holographic Theatre Theme attribute for CSS color shifts
      if (theatreChamber) {
        theatreChamber.setAttribute("data-current-theme", meta.theme);
      }

      // Update cockpit metadata
      if (cockpitCoords) {
        cockpitCoords.style.opacity = "0";
        cockpitCoords.style.transform = "translateY(-4px)";
        setTimeout(() => {
          cockpitCoords.textContent = meta.coords;
          cockpitCoords.style.opacity = "1";
          cockpitCoords.style.transform = "translateY(0)";
        }, 120);
      }

      if (watermarkStamp) {
        watermarkStamp.textContent = meta.watermark;
      }

      if (stepCurEl) {
        stepCurEl.textContent = meta.step;
      }

      // Update 4-Corner Telemetry HUD
      if (hudSectorCode) hudSectorCode.textContent = meta.sectorCode;
      if (hudMainTitle) hudMainTitle.textContent = meta.title;
      if (hudStatusText) hudStatusText.textContent = meta.statusText;
      if (hudElevation) hudElevation.textContent = meta.elevation;
      if (hudAtmosphere) hudAtmosphere.textContent = meta.atmosphere;
      if (hudQuoteLine) hudQuoteLine.textContent = meta.quote;
      if (hudCoords) hudCoords.textContent = meta.coords;
      if (pedestalReadout) pedestalReadout.textContent = meta.pedestal;
      if (holoBadgeText) holoBadgeText.textContent = meta.badgePrompt;

      if (hudTagsRow) {
        hudTagsRow.innerHTML = meta.tags.map(t => `<span class="hud-tag">${t}</span>`).join("");
      }

      // Update top tab buttons
      tabButtons.forEach((btn) => {
        const isActive = btn.getAttribute("data-place") === placeId;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        btn.setAttribute("tabindex", isActive ? "0" : "-1");
        if (isActive && updateFocus) {
          btn.focus();
        }
      });

      // Update bottom dock deck
      dockCards.forEach((card) => {
        const isActive = card.getAttribute("data-place") === placeId;
        card.classList.toggle("is-active", isActive);
        card.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      // Update destination cards: mark active card in vertical view
      const activeIdx = order.indexOf(placeId);
      destinationCards.forEach((card) => {
        const cPlace = card.getAttribute("data-place");
        const cIdx = order.indexOf(cPlace);

        card.classList.remove("is-active", "is-prev", "is-next");
        if (cIdx === activeIdx) {
          card.classList.add("is-active");
          card.setAttribute("aria-hidden", "false");
          // Smoothly bring the selected card into viewport
          if (updateFocus) {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        } else {
          card.setAttribute("aria-hidden", "false");
        }
      });
    };

    // -------------------------------------------------------------------------
    // STEP 1: HERO BIG IMAGE -> CLICK -> SHRINK ANIMATION (AS DRAWN ON PAPER)
    // -------------------------------------------------------------------------
    const heroBigStage = document.getElementById("heroBigStage");
    const heroBigFrame = document.getElementById("heroBigFrame");
    const placesAtlasStage = document.getElementById("placesAtlasStage");

    const triggerShrinkToCarousel = () => {
      if (!heroBigStage || !placesAtlasStage) return;
      heroBigStage.classList.add("is-shrunk");
      placesAtlasStage.classList.remove("is-collapsed");
      placesAtlasStage.classList.add("is-revealed");

      // Smooth scroll to the destination atlas stream
      setTimeout(() => {
        placesAtlasStage.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 250);
    };

    if (heroBigFrame) {
      heroBigFrame.addEventListener("click", triggerShrinkToCarousel);
      heroBigFrame.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          triggerShrinkToCarousel();
        }
      });
    }

    // -------------------------------------------------------------------------
    // NATURAL VERTICAL SCROLL SPY (OBSERVES ACTIVE CARD IN FULL SCREEN)
    // Synchronizes the cockpit bar, active indicators, and theme colors
    // -------------------------------------------------------------------------
    if ("IntersectionObserver" in window) {
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const placeId = entry.target.getAttribute("data-place");
            if (placeId && order.indexOf(placeId) !== -1 && order.indexOf(placeId) !== currentIndex) {
              switchDestination(placeId, false);
            }
          }
        });
      }, {
        root: null,
        rootMargin: "-25% 0px -25% 0px",
        threshold: 0.35
      });

      destinationCards.forEach((card) => {
        cardObserver.observe(card);
      });
    }

    // -------------------------------------------------------------------------
    // BANDARBAN CARD EXPANSION INTO 4 SUB-CARDS (AS REQUESTED)
    // "bandarban er card e click korle aro 4ta card asbe as oikhane aro 4ta place ghura hoiche amar"
    // -------------------------------------------------------------------------
    const bandarbanCard = document.getElementById("atlasCard-bandarban");
    const bandarbanSubDeck = document.getElementById("bandarbanSubCardsStage");
    const bandarbanToggleBtns = document.querySelectorAll(".bandarban-toggle-expand-btn");
    const bandarbanToggleBtnText = document.getElementById("bandarbanToggleBtnText");
    const bandarbanActionBtnText = document.getElementById("bandarbanActionBtnText");
    const bandarbanMainImg = document.getElementById("bandarbanMainImg");
    const bandarbanSubcards = document.querySelectorAll(".bandarban-subcard");
    const bandarbanMediaTitle = document.getElementById("bandarbanMediaTitle");
    const bandarbanMediaMeta = document.getElementById("bandarbanMediaMeta");
    const bandarbanMediaTag = document.getElementById("bandarbanMediaTag");
    const bandarbanElevVal = document.getElementById("bandarbanElevVal");

    let isBandarbanExpanded = false;

    const toggleBandarbanSubCards = (forceState) => {
      if (!bandarbanSubDeck) return;
      isBandarbanExpanded = (typeof forceState === "boolean") ? forceState : !isBandarbanExpanded;
      bandarbanSubDeck.classList.toggle("is-expanded", isBandarbanExpanded);

      if (bandarbanToggleBtnText) {
        bandarbanToggleBtnText.textContent = isBandarbanExpanded ? "Collapse 4 Places" : "Click to Expand 4 Places";
      }
      if (bandarbanActionBtnText) {
        bandarbanActionBtnText.textContent = isBandarbanExpanded ? "Close 4 Visited Sub-Cards" : "Click to Expand 4 Visited Cards";
      }

      // Smooth scroll slightly if expanded
      if (isBandarbanExpanded) {
        bandarbanSubDeck.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    };

    bandarbanToggleBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleBandarbanSubCards();
      });
    });

    // Clicking anywhere on Bandarban card when active toggles expansion
    if (bandarbanCard) {
      bandarbanCard.addEventListener("click", (e) => {
        // Prevent triggering when clicking on subcards or modal links
        if (e.target.closest(".bandarban-subcard") || e.target.closest(".atlas-inspect-btn") || e.target.closest(".bandarban-toggle-expand-btn")) {
          return;
        }
        if (bandarbanCard.classList.contains("is-active")) {
          toggleBandarbanSubCards();
        }
      });
    }

    // Subcard Selection within the 4 Visited places
    bandarbanSubcards.forEach((sc) => {
      sc.addEventListener("click", (e) => {
        e.stopPropagation();
        bandarbanSubcards.forEach(c => c.classList.remove("is-active"));
        sc.classList.add("is-active");

        const subImg = sc.getAttribute("data-sub-img");
        const subTitle = sc.getAttribute("data-sub-title");
        const subMeta = sc.getAttribute("data-sub-meta");
        const subElev = sc.getAttribute("data-sub-elev");

        if (bandarbanMainImg && subImg) {
          bandarbanMainImg.style.opacity = "0.4";
          bandarbanMainImg.style.transform = "scale(0.97)";
          setTimeout(() => {
            bandarbanMainImg.src = subImg;
            bandarbanMainImg.style.opacity = "1";
            bandarbanMainImg.style.transform = "scale(1)";
          }, 180);
        }

        if (bandarbanMediaTitle && subTitle) bandarbanMediaTitle.textContent = subTitle;
        if (bandarbanMediaMeta && subMeta) bandarbanMediaMeta.textContent = subMeta;
        if (bandarbanMediaTag && subElev) bandarbanMediaTag.textContent = `[ ${subElev.toUpperCase()} ]`;
        if (bandarbanElevVal && subElev) bandarbanElevVal.textContent = subElev;
        if (hudElevation && subElev) hudElevation.textContent = `${subElev.toUpperCase()} · ${subTitle.toUpperCase()}`;
      });

      sc.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          sc.click();
        }
      });
    });

    // Tab buttons click & keyboard navigation
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const placeId = btn.getAttribute("data-place");
        switchDestination(placeId, true);
      });

      btn.addEventListener("keydown", (e) => {
        let newIdx = currentIndex;
        if (e.key === "ArrowRight") {
          e.preventDefault();
          newIdx = (currentIndex + 1) % order.length;
          switchDestination(order[newIdx], true);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          newIdx = (currentIndex - 1 + order.length) % order.length;
          switchDestination(order[newIdx], true);
        }
      });
    });

    // Quick pills in header click
    quickPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const placeId = pill.getAttribute("data-place");
        switchDestination(placeId, true);
      });
    });

    // Bottom dock filmstrip click
    dockCards.forEach((card) => {
      card.addEventListener("click", () => {
        const placeId = card.getAttribute("data-place");
        switchDestination(placeId, true);
      });
    });

    // Cockpit Step navigation buttons
    if (stepPrevBtn) {
      stepPrevBtn.addEventListener("click", () => {
        const prevIdx = (currentIndex - 1 + order.length) % order.length;
        switchDestination(order[prevIdx], true);
      });
    }

    if (stepNextBtn) {
      stepNextBtn.addEventListener("click", () => {
        const nextIdx = (currentIndex + 1) % order.length;
        switchDestination(order[nextIdx], true);
      });
    }

    // Circular Flanking Controls (Left and Right massive arrows)
    if (holoNavPrev) {
      holoNavPrev.addEventListener("click", () => {
        const prevIdx = (currentIndex - 1 + order.length) % order.length;
        switchDestination(order[prevIdx], true);
      });
    }

    if (holoNavNext) {
      holoNavNext.addEventListener("click", () => {
        const nextIdx = (currentIndex + 1) % order.length;
        switchDestination(order[nextIdx], true);
      });
    }

    // Interactive Bandarban Mountain Pass Waypoints (Fallback micro-pins sync)
    const waypointBtns = Array.from(document.querySelectorAll(".atlas-micro-pins-row .micro-pin"));
    if (waypointBtns.length > 0) {
      waypointBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          waypointBtns.forEach(b => b.classList.remove("is-active"));
          btn.classList.add("is-active");

          const imgSrc = btn.getAttribute("data-waypoint-img");
          const wpName = btn.getAttribute("data-waypoint-name");
          const wpMeta = btn.getAttribute("data-waypoint-meta");
          const wpElev = btn.getAttribute("data-waypoint-elev");

          if (bandarbanMainImg && imgSrc) {
            bandarbanMainImg.style.opacity = "0.5";
            bandarbanMainImg.style.transform = "scale(0.98)";
            setTimeout(() => {
              bandarbanMainImg.src = imgSrc;
              bandarbanMainImg.style.opacity = "1";
              bandarbanMainImg.style.transform = "scale(1)";
            }, 150);
          }

          if (bandarbanMediaTitle && wpName) bandarbanMediaTitle.textContent = wpName;
          if (bandarbanMediaMeta && wpMeta) bandarbanMediaMeta.textContent = wpMeta;
          if (bandarbanMediaTag && wpElev) bandarbanMediaTag.textContent = `[ ${wpElev} ]`;
          if (hudElevation && wpElev) hudElevation.textContent = `${wpElev.toUpperCase()} · ${wpName.toUpperCase()}`;
        });
      });
    }

    // Modal: Open In-Place Folio Detail View
    const openDetailView = (placeId) => {
      if (!placesDetailOverlay) return;

      // Ensure overlay is a direct child of document.body
      if (placesDetailOverlay.parentElement !== document.body) {
        document.body.appendChild(placesDetailOverlay);
      }

      detailPanes.forEach((pane) => {
        pane.classList.remove("is-active");
      });

      const targetPane = document.getElementById(`pane-${placeId}`);
      if (targetPane) {
        targetPane.classList.add("is-active");
      }

      const meta = destinationMeta[placeId];
      if (detailBadgeText && meta) {
        detailBadgeText.textContent = meta.title;
      }

      // Reset scroll position of modal content so it always starts at the top
      const modalBox = document.getElementById("placesDetailModal");
      if (modalBox) {
        modalBox.scrollTop = 0;
      }

      placesDetailOverlay.classList.add("is-active");
      placesDetailOverlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      if (placesDetailCloseBtn) {
        setTimeout(() => {
          placesDetailCloseBtn.focus();
        }, 80);
      }
    };

    // Close Folio Modal
    const closeDetailView = () => {
      if (!placesDetailOverlay || !placesDetailOverlay.classList.contains("is-active")) return;

      placesDetailOverlay.classList.remove("is-active");
      placesDetailOverlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      // Return focus to active tab
      const activeTab = tabButtons[currentIndex];
      if (activeTab) {
        activeTab.focus();
      }
    };

    // Attach inspect triggers inside theatre cards
    document.querySelectorAll("[data-detail-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const placeId = trigger.getAttribute("data-detail-trigger");
        openDetailView(placeId);
      });
    });

    if (placesDetailCloseBtn) {
      placesDetailCloseBtn.addEventListener("click", closeDetailView);
    }
    if (placesDetailFooterCloseBtn) {
      placesDetailFooterCloseBtn.addEventListener("click", closeDetailView);
    }
    if (placesDetailBackdrop) {
      placesDetailBackdrop.addEventListener("click", closeDetailView);
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (placesDetailOverlay && placesDetailOverlay.classList.contains("is-active")) {
          closeDetailView();
        }
      }
    });

    // Floating Magnetic Follower Pill across Theatre Mat
    if (theatreChamber && holoCursorBadge && isFinePointer && !prefersReducedMotion) {
      const activeMatArea = theatreChamber;

      activeMatArea.addEventListener("mousemove", (e) => {
        const matTarget = e.target.closest(".atlas-photo-mat");
        if (matTarget) {
          const chamberRect = theatreChamber.getBoundingClientRect();
          const posX = e.clientX - chamberRect.left;
          const posY = e.clientY - chamberRect.top;

          holoCursorBadge.style.left = `${posX}px`;
          holoCursorBadge.style.top = `${posY}px`;
          holoCursorBadge.classList.add("is-visible");
        } else {
          holoCursorBadge.classList.remove("is-visible");
        }
      });

      theatreChamber.addEventListener("mouseleave", () => {
        holoCursorBadge.classList.remove("is-visible");
      });

      // Clicking photo mat opens detail folio
      theatreChamber.querySelectorAll(".atlas-photo-mat").forEach((mat) => {
        mat.style.cursor = "pointer";
        mat.addEventListener("click", (e) => {
          if (e.target.closest("button")) return; // Don't trigger if clicked waypoint button
          const currentPlace = order[currentIndex];
          openDetailView(currentPlace);
        });
      });
    }

    // 3D Tilt Effect on Atlas Photo Mats (Fine Pointer)
    if (isFinePointer && !prefersReducedMotion) {
      const photoMats = Array.from(document.querySelectorAll(".atlas-photo-mat"));
      photoMats.forEach((mat) => {
        let isHover = false;
        let tX = 0;
        let tY = 0;
        let cX = 0;
        let cY = 0;
        let rafId = null;

        const loopTilt = () => {
          cX += (tX - cX) * 0.12;
          cY += (tY - cY) * 0.12;

          if (isHover) {
            mat.style.transform = `perspective(1000px) rotateX(${-cY * 8}deg) rotateY(${cX * 8}deg) translateY(-4px)`;
          }

          if (isHover || Math.abs(cX) > 0.005 || Math.abs(cY) > 0.005) {
            rafId = requestAnimationFrame(loopTilt);
          } else {
            mat.style.transform = "";
            rafId = null;
          }
        };

        mat.addEventListener("mousemove", (e) => {
          const rect = mat.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          tX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
          tY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
          isHover = true;
          if (!rafId) {
            rafId = requestAnimationFrame(loopTilt);
          }
        });

        mat.addEventListener("mouseleave", () => {
          tX = 0;
          tY = 0;
          isHover = false;
        });
      });
    }

    // Interactive Atmospheric Starfield & Topographical Mountain Contour Canvas
    const canvas = document.getElementById("holoStageCanvas");
    if (canvas && !prefersReducedMotion) {
      const ctx = canvas.getContext("2d");
      let width = 0;
      let height = 0;
      let animationFrameId = null;
      let mouseNormX = 0.5;
      let mouseNormY = 0.5;

      const resizeCanvas = () => {
        if (!theatreChamber) return;
        const rect = theatreChamber.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas, { passive: true });

      // Generate 38 floating constellation nodes
      const pointsCount = 38;
      const points = [];
      for (let i = 0; i < pointsCount; i++) {
        points.push({
          x: Math.random() * 1000,
          y: Math.random() * 600,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.6 + 0.6,
          alpha: Math.random() * 0.6 + 0.2
        });
      }

      theatreChamber.addEventListener("mousemove", (e) => {
        const rect = theatreChamber.getBoundingClientRect();
        mouseNormX = (e.clientX - rect.left) / rect.width;
        mouseNormY = (e.clientY - rect.top) / rect.height;
      }, { passive: true });

      let time = 0;

      const renderCanvas = () => {
        if (width === 0 || height === 0) {
          animationFrameId = requestAnimationFrame(renderCanvas);
          return;
        }

        ctx.clearRect(0, 0, width, height);
        time += 0.012;

        const { r, g, b } = activeThemeColor;

        // 1. Draw connecting constellation nodes
        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          pt.x += pt.vx;
          pt.y += pt.vy;

          if (pt.x < 0) pt.x = width;
          if (pt.x > width) pt.x = 0;
          if (pt.y < 0) pt.y = height;
          if (pt.y > height) pt.y = 0;

          // Parallax nudge from cursor
          const drawX = pt.x + (mouseNormX - 0.5) * 20;
          const drawY = pt.y + (mouseNormY - 0.5) * 15;

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pt.alpha * 0.7})`;
          ctx.beginPath();
          ctx.arc(drawX, drawY, pt.radius, 0, Math.PI * 2);
          ctx.fill();

          // Connect adjacent nodes with faint lines
          for (let j = i + 1; j < points.length; j++) {
            const pt2 = points[j];
            const dx = pt.x - pt2.x;
            const dy = pt.y - pt2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 110) {
              const lineAlpha = (1 - dist / 110) * 0.18;
              ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
              ctx.lineWidth = 0.75;
              ctx.beginPath();
              ctx.moveTo(drawX, drawY);
              ctx.lineTo(pt2.x + (mouseNormX - 0.5) * 20, pt2.y + (mouseNormY - 0.5) * 15);
              ctx.stroke();
            }
          }
        }

        // 2. Draw Topographic Wireframe Wave Line at bottom
        ctx.save();
        ctx.beginPath();
        const baseHeight = height - 40;
        ctx.moveTo(0, baseHeight);

        for (let x = 0; x <= width; x += 15) {
          const sin1 = Math.sin(x * 0.006 + time) * 18;
          const sin2 = Math.sin(x * 0.015 - time * 0.6) * 10;
          const y = baseHeight + sin1 + sin2 + (mouseNormY - 0.5) * 12;
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.22)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Second slightly higher ridge
        ctx.beginPath();
        ctx.moveTo(0, baseHeight - 35);
        for (let x = 0; x <= width; x += 20) {
          const sin3 = Math.cos(x * 0.005 + time * 0.8) * 14;
          const y2 = baseHeight - 35 + sin3 + (mouseNormY - 0.5) * 8;
          ctx.lineTo(x, y2);
        }
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        animationFrameId = requestAnimationFrame(renderCanvas);
      };

      renderCanvas();
    }
  }

  // =========================================================================
  // 12. Cinematic Custom Cursor, Ambient Spotlight & Kinetic Card System
  // =========================================================================
  if (isFinePointer && !prefersReducedMotion) {
    document.body.classList.add('has-fine-pointer');

    const cursorContainer = document.getElementById('cinematicCursor');
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    const cursorBadge = document.getElementById('cursorBadge');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isCursorVisible = false;
    let cursorRaf = null;

    // Smooth physics loop for cursor ring
    const renderCursor = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (cursorRing) {
        cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      if (isCursorVisible) {
        cursorRaf = requestAnimationFrame(renderCursor);
      } else {
        cursorRaf = null;
      }
    };

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (cursorDot) {
        cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      // Update ambient spotlight position on CSS variables
      document.documentElement.style.setProperty('--cursor-x', `${mouseX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${mouseY}px`);

      if (!isCursorVisible) {
        isCursorVisible = true;
        if (cursorContainer) cursorContainer.classList.add('is-visible');
        if (!cursorRaf) {
          cursorRaf = requestAnimationFrame(renderCursor);
        }
      }
    }, { passive: true });

    document.addEventListener('mouseenter', () => {
      isCursorVisible = true;
      if (cursorContainer) cursorContainer.classList.add('is-visible');
      if (!cursorRaf) {
        cursorRaf = requestAnimationFrame(renderCursor);
      }
    });

    document.addEventListener('mouseleave', () => {
      isCursorVisible = false;
      if (cursorContainer) cursorContainer.classList.remove('is-visible');
    });

    // Click impulse animation
    window.addEventListener('mousedown', () => {
      if (cursorContainer) cursorContainer.classList.add('is-clicking');
    });

    window.addEventListener('mouseup', () => {
      if (cursorContainer) cursorContainer.classList.remove('is-clicking');
    });

    // Smart interactive element inspection for cursor morphing & states
    document.addEventListener('mouseover', (e) => {
      if (!cursorContainer) return;

      const target = e.target;
      if (!target) return;

      // 1. Calligraphy Signature (Gold Aura State)
      if (target.closest('.hero-editorial-script')) {
        cursorContainer.className = 'cinematic-cursor is-visible is-hover-gold';
        return;
      }

      // 2. Media / Photographs / Lightbox (Media Badge State)
      const mediaEl = target.closest('[data-lightbox="true"], .fragment-frame, .photo-frame, .card-media, .chapter-preview-frame');
      if (mediaEl) {
        cursorContainer.className = 'cinematic-cursor is-visible is-hover-media';
        if (cursorBadge) cursorBadge.textContent = 'VIEW';
        return;
      }

      // 3. Interactive controls (Links, buttons, form inputs, pills)
      const interactiveEl = target.closest('a, button, input, textarea, select, [role="button"], .mobile-menu-btn, .hero-enter-link, .archival-pill, .hero-journal-marker, .cadence-item');
      if (interactiveEl) {
        cursorContainer.className = 'cinematic-cursor is-visible is-hover-interactive';
        return;
      }

      // 4. Important Headings and Title Words (Text Glow State)
      const textEl = target.closest('.hero-editorial-title, .hero-title-word, .hero-supporting-line, h1, h2, h3, .fragments-title, .archive-section-title, .cinematic-quote');
      if (textEl) {
        cursorContainer.className = 'cinematic-cursor is-visible is-hover-text';
        return;
      }

      // Default clean state
      cursorContainer.className = 'cinematic-cursor is-visible';
    });

    // 3D Perspective Tilt & Specular Sheen for Fragment Plates
    const fragmentFrames = document.querySelectorAll('.fragment-frame');
    fragmentFrames.forEach((frame) => {
      let fHover = false;
      let targetRotX = 0;
      let targetRotY = 0;
      let curRotX = 0;
      let curRotY = 0;
      let frameRaf = null;

      const updateFrameTilt = () => {
        curRotX += (targetRotX - curRotX) * 0.12;
        curRotY += (targetRotY - curRotY) * 0.12;

        if (fHover) {
          frame.style.transform = `perspective(1000px) rotateX(${curRotX}deg) rotateY(${curRotY}deg) translateY(-6px) scale(1.015)`;
        }

        if (fHover || Math.abs(curRotX) > 0.01 || Math.abs(curRotY) > 0.01) {
          frameRaf = requestAnimationFrame(updateFrameTilt);
        } else {
          frame.style.transform = '';
          frameRaf = null;
        }
      };

      frame.addEventListener('mousemove', (e) => {
        const rect = frame.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width;
        const normY = (e.clientY - rect.top) / rect.height;

        frame.style.setProperty('--sheen-x', `${(normX * 100).toFixed(1)}%`);
        frame.style.setProperty('--sheen-y', `${(normY * 100).toFixed(1)}%`);

        targetRotY = (normX - 0.5) * 8;
        targetRotX = -(normY - 0.5) * 8;

        fHover = true;
        if (!frameRaf) {
          frameRaf = requestAnimationFrame(updateFrameTilt);
        }
      });

      frame.addEventListener('mouseleave', () => {
        fHover = false;
        targetRotX = 0;
        targetRotY = 0;
      });
    });

    // Interactive Ripple on Clicking the Hero Title Dot
    const heroTitleDot = document.querySelector('.hero-title-dot');
    if (heroTitleDot) {
      heroTitleDot.addEventListener('click', () => {
        heroTitleDot.style.transform = 'scale(2.2) translateY(-6px)';
        setTimeout(() => {
          heroTitleDot.style.transform = '';
        }, 400);
      });
    }
  }
});

// Start project demos when their cards enter view; pause them when they leave.
document.addEventListener('DOMContentLoaded', () => {
  const projectVideos = document.querySelectorAll('.work-media-video');
  if (!projectVideos.length) return;

  if (!('IntersectionObserver' in window)) {
    projectVideos.forEach((video) => video.play().catch(() => {}));
    return;
  }

  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.play().catch(() => {});
      } else {
        entry.target.pause();
      }
    });
  }, { threshold: 0.35 });

  projectVideos.forEach((video) => videoObserver.observe(video));
});



