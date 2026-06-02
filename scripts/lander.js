/* DressVintage lander — light interactions (no dependencies) */
(function () {
  'use strict';

  /* ---- Scroll reveal (scroll/resize based — reliable everywhere) ---- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if (reduce) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var checkReveals = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = reveals.length - 1; i >= 0; i--) {
        var el = reveals[i];
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.9 && r.bottom > 0) {
          el.classList.add('in');
          reveals.splice(i, 1);
        }
      }
    };
    window.addEventListener('scroll', checkReveals, { passive: true });
    window.addEventListener('resize', checkReveals);
    window.addEventListener('load', checkReveals);
    checkReveals();
    // safety: ensure nothing stays hidden if events never fire
    setTimeout(checkReveals, 250);
    setTimeout(function () { reveals.forEach(function (el) { el.classList.add('in'); }); }, 2500);
  }

  /* ---- FAQ accordion: smooth height + single-open ---- */
  var items = [].slice.call(document.querySelectorAll('.faq-item'));
  items.forEach(function (item) {
    var ans = item.querySelector('.faq-a');
    var sum = item.querySelector('.faq-q');
    sum.addEventListener('click', function (ev) {
      ev.preventDefault();
      var isOpen = item.hasAttribute('open');
      if (isOpen) {
        ans.style.maxHeight = ans.scrollHeight + 'px';
        requestAnimationFrame(function () { ans.style.maxHeight = '0px'; });
        ans.addEventListener('transitionend', function te() {
          item.removeAttribute('open'); ans.style.maxHeight = ''; ans.removeEventListener('transitionend', te);
        });
      } else {
        items.forEach(function (other) {
          if (other !== item && other.hasAttribute('open')) {
            var oa = other.querySelector('.faq-a');
            oa.style.maxHeight = oa.scrollHeight + 'px';
            requestAnimationFrame(function () { oa.style.maxHeight = '0px'; });
            oa.addEventListener('transitionend', function te2() {
              other.removeAttribute('open'); oa.style.maxHeight = ''; oa.removeEventListener('transitionend', te2);
            });
          }
        });
        item.setAttribute('open', '');
        ans.style.maxHeight = '0px';
        requestAnimationFrame(function () { ans.style.maxHeight = ans.scrollHeight + 'px'; });
        ans.addEventListener('transitionend', function te3() {
          if (item.hasAttribute('open')) ans.style.maxHeight = 'none';
          ans.removeEventListener('transitionend', te3);
        });
      }
    });
  });

  /* ---- Sticky mobile CTA: show after hero ---- */
  var sticky = document.getElementById('stickyCta');
  var hero = document.querySelector('.hero');
  var product = document.getElementById('product');
  if (sticky && hero) {
    var update = function () {
      var pastHero = hero.getBoundingClientRect().bottom < 0;
      // hide when the product/purchase area is on screen
      var atProduct = product && product.getBoundingClientRect().top < window.innerHeight * 0.85
                      && product.getBoundingClientRect().bottom > 0;
      if (pastHero && !atProduct) { sticky.classList.add('show'); sticky.setAttribute('aria-hidden', 'false'); }
      else { sticky.classList.remove('show'); sticky.setAttribute('aria-hidden', 'true'); }
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---- Product option selectors (color + size) ---- */
  function singleSelect(groupSel, onSelect) {
    var groups = [].slice.call(document.querySelectorAll(groupSel));
    groups.forEach(function (group) {
      group.addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn || !group.contains(btn)) return;
        [].slice.call(group.querySelectorAll('button')).forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        if (onSelect) onSelect(btn);
      });
    });
  }

  /* color selector also swaps the main product image (crossfade) */
  var productImg = document.getElementById('productImg');
  singleSelect('.swatches', function (btn) {
    if (!productImg) return;
    var src = btn.getAttribute('data-img');
    var color = btn.getAttribute('data-color') || '';
    if (!src || src === productImg.getAttribute('src')) return;
    var pre = new Image();
    pre.onload = function () {
      productImg.style.opacity = '0';
      setTimeout(function () {
        productImg.src = src;
        productImg.alt = 'Studio product image of the Heritage Bomber Jacket on a model in ' + color;
        productImg.style.opacity = '1';
      }, reduce ? 0 : 180);
    };
    pre.src = src;
  });
  singleSelect('.sizes');

  /* ---- Add to cart: lightweight confirmation (demo) ---- */
  var addBtn = document.querySelector('.product-actions .btn--gold');
  if (addBtn) {
    var original = addBtn.textContent;
    addBtn.addEventListener('click', function () {
      var color = (document.querySelector('.swatch[aria-pressed="true"]') || {}).getAttribute
        ? document.querySelector('.swatch[aria-pressed="true"]').dataset.color : '';
      var size = (document.querySelector('.size[aria-pressed="true"]') || {}).textContent || '';
      addBtn.textContent = 'Added · ' + color + ' / ' + size;
      addBtn.style.background = 'var(--olive)';
      clearTimeout(addBtn._t);
      addBtn._t = setTimeout(function () {
        addBtn.textContent = original; addBtn.style.background = '';
      }, 2200);
    });
  }

  /* ---- Smooth anchor scrolling ---- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var header = document.querySelector('.site-header');
    var offset = (header ? header.offsetHeight : 0) + 12;
    var y = window.pageYOffset + target.getBoundingClientRect().top - offset;
    window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
  });
})();
