/* bold.js — load at the end of <body> (after resume.min.js). No dependencies. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  document.documentElement.classList.add('js');

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 1. Scroll progress bar */
  var bar = document.createElement('div');
  bar.id = 'scrollbar';
  document.body.appendChild(bar);
  var ticking = false;
  function updateBar() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateBar); }
  }, { passive: true });
  updateBar();

  /* 2. Hero: name slams in letter by letter */
  var hero = $('#about h1');
  if (hero && !reduce) {
    var text = hero.textContent;
    hero.setAttribute('aria-label', text);
    hero.textContent = '';
    text.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'char';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.style.animationDelay = (150 + i * 55) + 'ms';
      hero.appendChild(s);
    });
  }

  /* 3. Observers: headings wipe in, badge walls pop in, typewriter starts */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.classList.contains('subheading')) typeWrite(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 }) : null;

  $$('h2, h3, h4').forEach(function (h) {
    h.classList.add('wipe');
    io ? io.observe(h) : h.classList.add('in');
  });

  var walls = $$('#box');
  walls.forEach(function (w) {
    if (!w.querySelector('img')) return;
    w.classList.add('wall');
    $$('img', w).forEach(function (img, i) { img.style.setProperty('--i', Math.min(i, 30)); });
    io ? io.observe(w) : w.classList.add('in');
  });

  function typeWrite(el) {
    if (reduce) return;
    var full = el.getAttribute('data-text') || el.textContent;
    el.setAttribute('data-text', full);
    el.textContent = '';
    el.classList.add('typing');
    var i = 0;
    (function tick() {
      el.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(tick, 70);
      else setTimeout(function () { el.classList.remove('typing'); }, 1200);
    })();
  }
  $$('.subheading').forEach(function (el) { io ? io.observe(el) : null; });

  /* 4. Badge walls react to the cursor like a dock: nearby badges grow */
  if (finePointer && !reduce) {
    walls.forEach(function (wall) {
      var imgs = $$('img', wall);
      var raf = null, mx = 0, my = 0, active = false;

      function frame() {
        raf = null;
        imgs.forEach(function (img) {
          var r = img.getBoundingClientRect();
          var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          var d = Math.hypot(mx - cx, my - cy);
          var t = Math.max(0, 1 - d / 130);
          var scale = 1 + t * t * 1.25;
          img.style.transform = 'scale(' + scale.toFixed(3) + ')';
          img.style.zIndex = t > 0 ? Math.round(t * 10) : '';
          img.style.boxShadow = t > 0.5 ? '4px 4px 0 #000' : '';
        });
      }
      function request() { if (!raf) raf = requestAnimationFrame(frame); }

      wall.addEventListener('mouseenter', function () {
        active = true;
        /* stop the entrance animation from overriding inline transforms */
        imgs.forEach(function (img) { img.style.animation = 'none'; img.style.opacity = 1; });
      });
      wall.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; if (active) request(); });
      wall.addEventListener('mouseleave', function () {
        active = false;
        imgs.forEach(function (img) {
          img.style.transition = 'transform .3s ease';
          img.style.transform = ''; img.style.zIndex = ''; img.style.boxShadow = '';
          setTimeout(function () { img.style.transition = ''; }, 320);
        });
      });
    });
  }

  /* 5. Scrollspy: highlight the nav link for the section in view */
  var links = $$('#sideNav .nav-link');
  var map = {};
  links.forEach(function (l) { map[(l.getAttribute('href') || '').replace('#', '')] = l; });
  var sections = $$('section[id]').filter(function (s) { return map[s.id]; });
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('active'); });
        map[e.target.id].classList.add('active');
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* 6. Skill cards tilt toward the cursor */
  if (finePointer && !reduce) {
    $$('.intro').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateX(' + (-py * 8).toFixed(2) + 'deg) rotateY(' + (px * 10).toFixed(2) + 'deg) translateY(-3px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform .35s ease';
        card.style.transform = '';
        setTimeout(function () { card.style.transition = ''; }, 360);
      });
    });
  }

  /* 7. Soft light that follows the cursor */
  if (finePointer && !reduce) {
    var glow = document.createElement('div');
    glow.id = 'glow';
    document.body.insertBefore(glow, document.body.firstChild);
    var gx = 0, gy = 0, gRaf = null;
    window.addEventListener('mousemove', function (e) {
      gx = e.clientX; gy = e.clientY; glow.style.opacity = 1;
      if (!gRaf) gRaf = requestAnimationFrame(function () {
        glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px)';
        gRaf = null;
      });
    }, { passive: true });
    document.addEventListener('mouseleave', function () { glow.style.opacity = 0; });
  }
})();
