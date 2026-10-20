/* ISTAstyle – zajednički JavaScript (meni, slajder, forma) */
(function () {
  'use strict';

  /* Hamburger meni */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('glavni-meni');
  if (burger && nav) {
    function setOpen(open) {
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    burger.addEventListener('click', function () {
      setOpen(!nav.classList.contains('open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); burger.focus(); }
    });
  }

  /* Slajder u hero sekciji: brojač, trake napretka i strelice */
  var slider = document.querySelector('.slider');
  if (slider) {
    var slides = slider.querySelectorAll('.slide');
    var box = slider.querySelector('.dots');
    var n = slides.length, current = 0, timer = null;
    var INTERVAL = 5000; // smena na 5 sekundi
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    box.className = 'slide-ctrl';
    box.style.setProperty('--dur', INTERVAL + 'ms');
    box.innerHTML =
      '<span class="sc-count"><b>01</b> / ' + String(n).padStart(2, '0') + '</span>' +
      '<span class="sc-bars"></span>' +
      '<span class="sc-arrows">' +
      '<button type="button" class="sc-btn" aria-label="Prethodna fotografija"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<button type="button" class="sc-btn" aria-label="Sledeća fotografija"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></button>' +
      '</span>';
    var countEl = box.querySelector('.sc-count b');
    var barsEl = box.querySelector('.sc-bars');
    var bars = [];
    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'sc-bar';
      b.setAttribute('aria-label', 'Prikaži fotografiju ' + (i + 1) + ' od ' + n);
      b.appendChild(document.createElement('i'));
      b.addEventListener('click', function () { show(i); start(); });
      barsEl.appendChild(b);
      bars.push(b);
    });
    var arrows = box.querySelectorAll('.sc-btn');
    arrows[0].addEventListener('click', function () { show(current - 1); start(); });
    arrows[1].addEventListener('click', function () { show(current + 1); start(); });

    function show(i) {
      slides[current].classList.remove('on');
      slides[current].setAttribute('aria-hidden', 'true');
      current = (i + n) % n;
      slides[current].classList.add('on');
      slides[current].removeAttribute('aria-hidden');
      bars.forEach(function (b, k) {
        b.classList.remove('on', 'done');
        b.removeAttribute('aria-current');
        if (k < current) b.classList.add('done');
      });
      void bars[current].offsetWidth; /* ponovo pokreni animaciju trake */
      bars[current].classList.add('on');
      bars[current].setAttribute('aria-current', 'true');
      countEl.textContent = String(current + 1).padStart(2, '0');
    }
    function start() {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(function () { show(current + 1); }, INTERVAL);
    }
    if (reduceMotion) box.classList.add('static');
    show(0);
    start();
  }

  /* Forma za upit
     Da bi forma slala upite na mejl, napravite besplatan nalog na https://formspree.io,
     napravite formu i ovde upišite njenu adresu, npr. 'https://formspree.io/f/abcdwxyz'. */
  var FORM_ENDPOINT = '';
  var form = document.getElementById('upit');
  if (form) {
    var note = form.querySelector('.form-note');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!FORM_ENDPOINT) {
        note.innerHTML = 'Slanje upita preko sajta još nije uključeno. Pozovite nas na <a href="tel:+381611868240">+381 61 1868240</a>.';
        note.hidden = false;
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('greška');
          form.reset();
          note.textContent = 'Hvala! Upit je poslat, javićemo vam se uskoro.';
        })
        .catch(function () {
          note.innerHTML = 'Upit nije poslat. Pokušajte ponovo ili nas pozovite na <a href="tel:+381611868240">+381 61 1868240</a>.';
        })
        .finally(function () { note.hidden = false; btn.disabled = false; });
    });
  }
})();

/* ===== Doterivanje: senka zaglavlja, pojavljivanje sekcija, dugme za poziv ===== */
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  var fab = document.querySelector('.fab-call');
  var heroCall = document.querySelector('#top .btn');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Na početnoj sakrij plutajuće dugme dok se vidi dugme „Pozovi” u hero sekciji */
  if (fab && heroCall && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      fab.classList.toggle('hide', entries[0].isIntersecting);
    }).observe(heroCall);
  }

  /* Blago pojavljivanje elemenata pri skrolovanju */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sel = '.sec-head, .sec-head-row > .lead, .card, .steps li, .album, .contact-info, .form-box, .cta, .tile';
  var items = Array.prototype.slice.call(document.querySelectorAll(sel));
  if (reduce || !('IntersectionObserver' in window)) return;
  items.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.matches(sel); });
    var i = sibs.indexOf(el);
    el.style.setProperty('--d', (Math.min(i, 8) * 0.06) + 's');
    el.classList.add('reveal');
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var el = e.target;
        el.classList.add('in');
        io.unobserve(el);
        /* posle animacije vrati elementu njegove hover prelaze */
        setTimeout(function () { el.classList.remove('reveal', 'in'); el.style.removeProperty('--d'); }, 1300);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
