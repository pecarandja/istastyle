/* ISTAstyle – galerija: albumi i pregled fotografija */
(function () {
  'use strict';

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  var heading = document.getElementById('gal-naslov');
  var albums = { sve: 'Naši radovi' };
  var current = 'sve';

  /* Broj fotografija po albumu */
  tabs.forEach(function (t) {
    var id = t.getAttribute('data-album');
    var n = id === 'sve' ? tiles.length : tiles.filter(function (x) { return x.getAttribute('data-album') === id; }).length;
    t.querySelector('.count').textContent = n;
    if (id !== 'sve') albums[id] = t.firstChild.textContent.trim();
  });

  function visible() {
    return tiles.filter(function (x) { return !x.hidden; });
  }

  function pick(id, updateHash) {
    if (!albums[id]) id = 'sve';
    current = id;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-album') === id;
      t.classList.toggle('on', on);
      t.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    tiles.forEach(function (x) {
      x.hidden = id !== 'sve' && x.getAttribute('data-album') !== id;
    });
    heading.textContent = albums[id];
    /* mozaik: svaka sedma fotografija velika, svaka peta od sedam visoka */
    visible().forEach(function (x, i) {
      x.classList.toggle('big', i % 7 === 0);
      x.classList.toggle('tall', i % 7 === 4);
    });
    if (updateHash) {
      history.replaceState(null, '', id === 'sve' ? location.pathname : '#' + id);
    }
  }

  tabs.forEach(function (t) {
    t.addEventListener('click', function () { pick(t.getAttribute('data-album'), true); });
  });

  /* Otvaranje albuma preko linka, npr. galerija.html#kuhinje */
  function fromHash() { pick(location.hash.replace('#', '') || 'sve', false); }
  window.addEventListener('hashchange', fromHash);
  fromHash();

  /* Pregled fotografija (lightbox) */
  var lb = document.querySelector('.lightbox');
  var lbImg = lb.querySelector('.lb-img');
  var lbCount = lb.querySelector('.lb-count');
  var closeBtn = lb.querySelector('.lb-close');
  var list = [];
  var index = 0;
  var opener = null;

  function render() {
    var img = list[index].querySelector('img');
    lbImg.src = img.getAttribute('src');
    lbImg.alt = img.getAttribute('alt');
    lbCount.textContent = (index + 1) + ' / ' + list.length;
  }
  function open(tile) {
    list = visible();
    index = list.indexOf(tile);
    opener = tile;
    render();
    lb.hidden = false;
    document.body.classList.add('no-scroll');
    closeBtn.focus();
  }
  function close() {
    lb.hidden = true;
    document.body.classList.remove('no-scroll');
    if (opener) opener.focus();
  }
  function step(d) {
    index = (index + d + list.length) % list.length;
    render();
  }

  tiles.forEach(function (x) {
    x.addEventListener('click', function () { open(x); });
  });
  closeBtn.addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  /* Prevlačenje prstom na telefonu */
  var startX = null;
  lb.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    startX = null;
  });
})();
