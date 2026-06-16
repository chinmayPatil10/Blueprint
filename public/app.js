/* Blueprint — app.js */

(function () {
  'use strict';

  /* ── Subcategory map ───────────────────────────────────── */
  var SUBCATEGORIES = {
    engineering: ['Frontend', 'Backend', 'Architecture', 'APIs', 'Mobile'],
    'ai-data':   ['LLM Integration', 'RAG / Retrieval', 'Agents', 'ML Pipelines', 'Data Engineering'],
    design:      ['Product Design', 'UX Research', 'Design Systems', 'Accessibility'],
    security:    ['AppSec', 'Cloud Security', 'Pen Testing', 'Auth / Identity'],
    devops:      ['CI/CD', 'Cloud Setup', 'Infrastructure', 'Deployment']
  };

  /* ── State ─────────────────────────────────────────────── */
  var activeMain = 'all';
  var activeSubs = new Set();

  /* ── Escape helpers ────────────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  function escAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ── Reward badge helper ───────────────────────────────── */
  function rewardBadge(works) {
    if (works === 'paid') {
      return '<span class="reward-badge reward-paid">Works for pay</span>';
    }
    if (works === 'shout') {
      return '<span class="reward-badge reward-shout">Works for a shoutout</span>';
    }
    return '<span class="reward-badge reward-both">Pay or shoutout</span>';
  }

  /* ── Focus label helper ────────────────────────────────── */
  function focusLabel(focus) {
    if (focus === 'rescues') return 'Rescues';
    if (focus === 'blueprints') return 'Blueprints';
    return 'Both';
  }

  /* ── Build card HTML ───────────────────────────────────── */
  function buildCard(arch) {
    var tagsHtml = arch.tags.map(function (t) {
      return '<span class="arch-tag">' + escHtml(t) + '</span>';
    }).join('');

    var gradientStyle = 'background: linear-gradient(135deg, ' +
      escAttr(arch.gradientFrom) + ', ' + escAttr(arch.gradientTo) + ')';

    return '<article class="arch-card reveal" data-id="' + escAttr(arch.id) + '">' +
      '<div class="arch-header">' +
        '<div class="arch-avatar" style="' + gradientStyle + '" aria-hidden="true">' +
          escHtml(arch.initials) +
        '</div>' +
        '<div>' +
          '<div class="arch-name-row">' +
            '<span class="arch-name">' + escHtml(arch.name) + '</span>' +
            '<span class="vetted-badge">✓ Vetted</span>' +
          '</div>' +
          '<div class="arch-role">' + escHtml(arch.role) + '</div>' +
        '</div>' +
      '</div>' +
      '<p class="arch-bio">' + escHtml(arch.bio) + '</p>' +
      rewardBadge(arch.works) +
      '<div class="arch-tags">' + tagsHtml + '</div>' +
      '<div class="arch-meta">' +
        '<div class="arch-meta-line"><strong>Turnaround:</strong> ' + escHtml(arch.turnaround) + '</div>' +
        '<div class="arch-meta-line"><strong>Focus:</strong> ' + escHtml(focusLabel(arch.focus)) + '</div>' +
      '</div>' +
      '<div class="arch-footer">' +
        '<button class="arch-cta" data-arch-id="' + escAttr(arch.id) + '">Get in touch →</button>' +
        (arch.linkedin
          ? '<a class="arch-linkedin" href="' + escAttr(arch.linkedin) + '" target="_blank" rel="noopener noreferrer" aria-label="' + escHtml(arch.name) + ' on LinkedIn">' +
              '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' +
            '</a>'
          : '') +
      '</div>' +
    '</article>';
  }

  /* ── Filter architects ─────────────────────────────────── */
  function filterArchitects() {
    var list = window.ARCHITECTS || [];
    if (activeMain !== 'all') {
      list = list.filter(function (a) {
        return a.main && a.main.indexOf(activeMain) !== -1;
      });
    }
    if (activeSubs.size > 0) {
      list = list.filter(function (a) {
        if (!a.subs) return false;
        for (var i = 0; i < a.subs.length; i++) {
          if (activeSubs.has(a.subs[i])) return true;
        }
        return false;
      });
    }
    return list;
  }

  /* ── Render grid ───────────────────────────────────────── */
  function renderGrid() {
    var grid = document.getElementById('architect-grid');
    if (!grid) return;
    var list = filterArchitects();

    if (list.length === 0) {
      grid.innerHTML = '<div class="empty-state">' +
        '<div class="empty-icon">🔍</div>' +
        '<strong>No specialists match those filters.</strong>' +
        '<p>Try removing a filter or selecting a different category.</p>' +
      '</div>';
      return;
    }

    grid.innerHTML = list.map(buildCard).join('');

    // Wire up card CTA buttons
    var btns = grid.querySelectorAll('.arch-cta');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        openContactModal(btn.getAttribute('data-arch-id'));
      });
    });

    // Trigger reveal for newly rendered cards
    initReveal(grid.querySelectorAll('.reveal'));
  }

  /* ── Render sub-row chips ──────────────────────────────── */
  function renderSubChips() {
    var subRow = document.getElementById('sub-chip-row');
    var subWrapper = document.getElementById('sub-row-wrapper');
    if (!subRow || !subWrapper) return;

    if (activeMain === 'all') {
      subWrapper.classList.remove('sub-row--visible');
      subRow.innerHTML = '';
      return;
    }

    var subs = SUBCATEGORIES[activeMain] || [];
    subRow.innerHTML = subs.map(function (sub) {
      var isActive = activeSubs.has(sub) ? ' active-sub' : '';
      return '<button class="sub-chip' + isActive + '" data-sub="' + escAttr(sub) + '">' +
        escHtml(sub) + '</button>';
    }).join('');

    subWrapper.classList.add('sub-row--visible');

    subRow.querySelectorAll('.sub-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var sub = chip.getAttribute('data-sub');
        if (activeSubs.has(sub)) {
          activeSubs.delete(sub);
          chip.classList.remove('active-sub');
        } else {
          activeSubs.add(sub);
          chip.classList.add('active-sub');
        }
        renderGrid();
      });
    });
  }

  /* ── Main filter buttons ───────────────────────────────── */
  function initMainFilters() {
    var chips = document.querySelectorAll('.filter-chip[data-main]');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeMain = chip.getAttribute('data-main');
        activeSubs.clear();

        chips.forEach(function (c) { c.classList.remove('active-main'); });
        chip.classList.add('active-main');

        renderSubChips();
        renderGrid();
      });
    });
  }

  /* ── Hero roster ───────────────────────────────────────── */
  function renderHeroRoster() {
    var roster = document.getElementById('hero-roster');
    if (!roster) return;
    var architects = window.ARCHITECTS || [];
    if (!architects.length) return;

    var shown = architects.slice(0, 6);
    var total = architects.length;

    var allCats = ['engineering', 'ai-data', 'design', 'security', 'devops'];
    var catLabels = {
      'engineering': 'engineering',
      'ai-data': 'AI / data',
      'design': 'design',
      'security': 'security',
      'devops': 'DevOps'
    };
    var presentCats = [];
    allCats.forEach(function (c) {
      if (architects.some(function (a) { return a.main && a.main.indexOf(c) !== -1; })) {
        presentCats.push(catLabels[c] || c);
      }
    });
    // dedupe
    presentCats = presentCats.filter(function (v, i, arr) { return arr.indexOf(v) === i; });

    var avatarsHtml = shown.map(function (a) {
      var grad = 'linear-gradient(135deg,' + escAttr(a.gradientFrom) + ',' + escAttr(a.gradientTo) + ')';
      return '<div class="mini-avatar" style="background:' + grad + '" title="' + escAttr(a.name) + '" aria-label="' + escAttr(a.name) + '">' +
        escHtml(a.initials) + '</div>';
    }).join('');

    var catStr = presentCats.slice(0, 3).join(', ');
    if (presentCats.length > 3) catStr += ' &amp; more';
    var labelHtml = '<strong>' + total + ' vetted specialists</strong> across ' + catStr + '.';

    roster.innerHTML =
      '<div class="hero-roster-avatars">' + avatarsHtml + '</div>' +
      '<p class="hero-roster-label">' + labelHtml + '</p>';
  }

  /* ── Count-up animation ────────────────────────────────── */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCountUp(el) {
    var prefix = el.getAttribute('data-prefix') || '';
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1500;
    var startTime = null;

    if (prefersReduced) {
      el.textContent = prefix + target + suffix;
      return;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = easeOutCubic(progress);
      var current = Math.round(eased * target);
      el.textContent = prefix + current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  function initCountUp() {
    var els = document.querySelectorAll('.stat-number');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(animateCountUp);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCountUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ── Focus trap ────────────────────────────────────────── */
  function trapFocus(modalEl) {
    var focusable = modalEl.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    var focusableArr = Array.prototype.slice.call(focusable);
    var first = focusableArr[0];
    var last = focusableArr[focusableArr.length - 1];
    if (!first) return function () {};
    first.focus();

    function handler(e) {
      if (e.key !== 'Tab') return;
      if (focusableArr.length === 1) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    modalEl.addEventListener('keydown', handler);
    return function () { modalEl.removeEventListener('keydown', handler); };
  }

  /* ── Contact modal ─────────────────────────────────────── */
  var contactTrapCleanup = null;

  function openContactModal(archId) {
    var overlay = document.getElementById('contact-modal');
    if (!overlay) return;

    var arch = null;
    var architects = window.ARCHITECTS || [];
    for (var i = 0; i < architects.length; i++) {
      if (architects[i].id === archId) { arch = architects[i]; break; }
    }

    var idInput = document.getElementById('contact-arch-id');
    var nameInput = document.getElementById('contact-arch-name');
    var titleEl = document.getElementById('contact-modal-title');
    var introEl = overlay.querySelector('.modal-intro');

    if (idInput) idInput.value = archId || '';
    if (arch) {
      if (nameInput) nameInput.value = arch.name;
      var firstName = arch.name.split(' ')[0];
      if (titleEl) titleEl.textContent = 'See ' + firstName;
      if (introEl) introEl.textContent = 'Blueprint makes the intro. You and ' + firstName + ' agree terms, confidentiality and reward directly — only share what you\'re comfortable sharing until that\'s set up.';
    }

    overlay.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    contactTrapCleanup = trapFocus(overlay.querySelector('.modal-card'));
  }

  function closeContactModal() {
    var overlay = document.getElementById('contact-modal');
    if (!overlay) return;
    overlay.classList.remove('modal-open');
    document.body.style.overflow = '';
    if (contactTrapCleanup) { contactTrapCleanup(); contactTrapCleanup = null; }
  }

  function initContactModal() {
    var overlay = document.getElementById('contact-modal');
    if (!overlay) return;

    var closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeContactModal);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeContactModal();
    });

    wireForm('contact-form', 'contact-success');
  }

  /* ── Apply modal ───────────────────────────────────────── */
  var applyTrapCleanup = null;

  function openApplyModal() {
    var overlay = document.getElementById('apply-modal');
    if (!overlay) return;
    overlay.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    applyTrapCleanup = trapFocus(overlay.querySelector('.modal-card'));
  }

  function closeApplyModal() {
    var overlay = document.getElementById('apply-modal');
    if (!overlay) return;
    overlay.classList.remove('modal-open');
    document.body.style.overflow = '';
    if (applyTrapCleanup) { applyTrapCleanup(); applyTrapCleanup = null; }
  }

  function initApplyModal() {
    var overlay = document.getElementById('apply-modal');
    if (!overlay) return;

    var closeBtn = overlay.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeApplyModal);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeApplyModal();
    });

    wireForm('apply-form', 'apply-success');
  }

  /* ── Apply triggers ────────────────────────────────────── */
  function initApplyTriggers() {
    var triggers = document.querySelectorAll('[data-open-apply]');
    triggers.forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openApplyModal();
      });
    });
  }

  /* ── Mobile nav ────────────────────────────────────────── */
  function initMobileNav() {
    var hamburger = document.querySelector('.hamburger');
    var nav = document.querySelector('.site-nav');
    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Escape key ────────────────────────────────────────── */
  function initEscapeKey() {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var contact = document.getElementById('contact-modal');
      var apply = document.getElementById('apply-modal');
      if (contact && contact.classList.contains('modal-open')) closeContactModal();
      else if (apply && apply.classList.contains('modal-open')) closeApplyModal();
    });
  }

  /* ── Form wiring ───────────────────────────────────────── */
  function wireForm(formId, successId) {
    var form = document.getElementById(formId);
    var successEl = document.getElementById(successId);
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector('[type="submit"]');
      var originalText = submitBtn ? submitBtn.textContent : '';
      var errorEl = form.querySelector('.form-error');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      if (errorEl) errorEl.remove();

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        if (res.ok) {
          form.style.display = 'none';
          if (successEl) successEl.removeAttribute('hidden');
        } else {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }
          var err = document.createElement('p');
          err.className = 'form-error';
          err.textContent = 'Something went wrong. Please try again.';
          form.appendChild(err);
        }
      }).catch(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
        var err = document.createElement('p');
        err.className = 'form-error';
        err.textContent = 'Network error. Please check your connection and try again.';
        form.appendChild(err);
      });
    });
  }

  /* ── Scroll reveal ─────────────────────────────────────── */
  function initReveal(elements) {
    if (prefersReduced) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach(function (el) { observer.observe(el); });
  }

  function initAllReveal() {
    initReveal(document.querySelectorAll('.reveal'));
  }

  /* ── Footer year ───────────────────────────────────────── */
  function setFooterYear() {
    var el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ── Init ──────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    renderGrid();
    renderHeroRoster();
    initCountUp();
    initMainFilters();
    initContactModal();
    initApplyModal();
    initApplyTriggers();
    initMobileNav();
    initEscapeKey();
    initAllReveal();
    setFooterYear();
  });

})();
