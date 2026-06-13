/**
 * Scroll-synced footer reveal (ASCII art, nav chars, name stagger).
 * Used for page footer and About intro clone.
 */
(function () {
  var POOLS = [
    ' ',
    '·.,',
    ':;`-~^',
    '=+<>?!:;',
    '|/\\()[]{}«»',
    '÷×±≈≠≤≥∞∑∏√∫',
    '¤†‡§¶©®™°¬',
    '%&#$@¥€£¢',
  ];

  function imageToAscii(img, cols) {
    var seed = 42;
    function rand() {
      seed = (seed * 16807 + 0) % 2147483647;
      return seed / 2147483647;
    }
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    var aspect = img.height / img.width;
    var rows = Math.round(cols * aspect);
    c.width = cols;
    c.height = rows;
    ctx.drawImage(img, 0, 0, cols, rows);
    var data = ctx.getImageData(0, 0, cols, rows).data;
    var lines = [];
    var poolGrid = [];
    for (var y = 0; y < rows; y++) {
      var line = '';
      var poolRow = [];
      for (var x = 0; x < cols; x++) {
        var i = (y * cols + x) * 4;
        var r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        if (a < 15) {
          line += ' ';
          poolRow.push(-1);
          continue;
        }
        var brightness = ((0.299 * r + 0.587 * g + 0.114 * b) / 255) * (a / 255);
        var pi = Math.min(Math.floor(brightness * (POOLS.length - 1) * 0.8), POOLS.length - 1);
        var pool = POOLS[pi];
        line += pool[Math.floor(rand() * pool.length)];
        poolRow.push(pi);
      }
      lines.push(line);
      poolGrid.push(poolRow);
    }
    return { text: lines.join('\n'), poolGrid: poolGrid };
  }

  function setupHover(preEl, poolGrid) {
    var origLines = null;
    var origGrid = null;
    var mxC = -1000;
    var myC = -1000;
    var radius = 2.5;
    var cols = poolGrid[0] ? poolGrid[0].length : 1;
    var rows = poolGrid.length;
    var noise = [];
    var hitTime = [];
    var cellDuration = [];
    for (var ny = 0; ny < rows; ny++) {
      var nr = [], ht = [], cd = [];
      for (var nx = 0; nx < cols; nx++) {
        var h = (Math.sin(nx * 12.9898 + ny * 78.233) * 43758.5453 % 1 + 1) % 1;
        nr.push(h * 5 - 2.5);
        ht.push(0);
        cd.push(h > 0.5 ? 200 : 100);
      }
      noise.push(nr);
      hitTime.push(ht);
      cellDuration.push(cd);
    }
    var animating = false;

    function init() {
      origLines = preEl.textContent.split('\n');
      origGrid = origLines.map(function (l) { return l.split(''); });
    }

    preEl.addEventListener('mousemove', function (e) {
      if (!origGrid) init();
      var rect = preEl.getBoundingClientRect();
      var charW = rect.width / cols;
      var charH = rect.height / rows;
      mxC = (e.clientX - rect.left) / charW;
      myC = (e.clientY - rect.top) / charH;
      var now = performance.now();
      var maxR = radius + 3;
      var yMin = Math.max(0, Math.floor(myC - maxR));
      var yMax = Math.min(rows - 1, Math.ceil(myC + maxR));
      var xMin = Math.max(0, Math.floor(mxC - maxR));
      var xMax = Math.min(cols - 1, Math.ceil(mxC + maxR));
      for (var y = yMin; y <= yMax; y++) {
        for (var x = xMin; x <= xMax; x++) {
          var dx = x - mxC;
          var dy = y - myC;
          if (dx * dx + dy * dy < (radius + noise[y][x]) * (radius + noise[y][x])) {
            hitTime[y][x] = now;
          }
        }
      }
      if (!animating) {
        animating = true;
        tick();
      }
    });

    preEl.addEventListener('mouseleave', function () {
      mxC = -1000;
      myC = -1000;
    });

    function esc(ch) {
      if (ch === '<') return '&lt;';
      if (ch === '>') return '&gt;';
      if (ch === '&') return '&amp;';
      return ch;
    }

    function tick() {
      var now = performance.now();
      var anyActive = false;
      var html = '';
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var pi = poolGrid[y][x];
          if (pi < 0 || pi === 0) {
            html += ' ';
            continue;
          }
          var elapsed = now - hitTime[y][x];
          if (hitTime[y][x] > 0 && elapsed < cellDuration[y][x]) {
            anyActive = true;
            var idx = (POOLS.length - 1) - pi;
            var pool = POOLS[idx];
            var ch = pool[Math.floor(Math.random() * pool.length)];
            html += '<span style="color:#050508;background:var(--prism-gradient)">' + esc(ch) + '</span>';
          } else {
            html += esc(origGrid[y][x]);
          }
        }
        html += '\n';
      }
      preEl.innerHTML = html;
      if (anyActive) {
        requestAnimationFrame(tick);
      } else {
        animating = false;
        if (origLines) preEl.textContent = origLines.join('\n');
      }
    }
  }

  function loadAndRender(src, targetId, cols) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      var el = document.getElementById(targetId);
      if (!el) return;
      var result = imageToAscii(img, cols);
      el.textContent = result.text;
      setupHover(el, result.poolGrid);
    };
    img.src = src;
  }

  window.setupFooterRevealBlock = function setupFooterRevealBlock(cfg) {
    var footerEl = document.querySelector(cfg.footer);
    var transitionEl = document.querySelector(cfg.transition);
    if (!footerEl || !transitionEl) return;

    var revealStart = cfg.landingFooter ? 'top top' : 'top bottom+=500';
    var revealEnd = cfg.landingFooter ? 'bottom top' : 'bottom bottom';
    var charStart = cfg.landingFooter ? 'top 65%' : 'center bottom+=500';

    loadAndRender('assets/images/footer/left.png', cfg.asciiLeftId, 80);
    loadAndRender('assets/images/footer/right.png', cfg.asciiRightId, 80);

    var asciiLeftWrap = footerEl.querySelector('.footer-ascii.left');
    var asciiRightWrap = footerEl.querySelector('.footer-ascii.right');
    if (asciiLeftWrap && asciiRightWrap) {
      gsap.fromTo(asciiLeftWrap, { xPercent: -100 }, {
        xPercent: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: cfg.transition,
          start: revealStart,
          end: revealEnd,
          scrub: true,
        },
      });
      gsap.fromTo(asciiRightWrap, { xPercent: 100 }, {
        xPercent: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: cfg.transition,
          start: revealStart,
          end: revealEnd,
          scrub: true,
        },
      });
    }

    var asciiLeftPre = document.getElementById(cfg.asciiLeftId);
    var asciiRightPre = document.getElementById(cfg.asciiRightId);
    var mx = 0;
    var my = 0;
    var sx = 0;
    var sy = 0;
    var blockVisible = false;

    if (cfg.enableParallax !== false) {
      document.addEventListener('mousemove', function (e) {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      });
    }

    function parallaxLoop() {
      if (!blockVisible || cfg.enableParallax === false) return;
      sx += (mx - sx) * 0.05;
      sy += (my - sy) * 0.05;
      var lx = Math.min(0, sx * -15 - 15);
      var rx = Math.max(0, sx * 15 + 15);
      var py = sy * -10;
      if (asciiLeftPre) asciiLeftPre.style.transform = 'translate(' + lx + 'px, ' + py + 'px)';
      if (asciiRightPre) asciiRightPre.style.transform = 'translate(' + rx + 'px, ' + py + 'px)';
      requestAnimationFrame(parallaxLoop);
    }

    function showFooterBlock() {
      footerEl.style.visibility = 'visible';
      if (cfg.landingFooter) footerEl.classList.add('about-footer--ready');
      blockVisible = true;
      parallaxLoop();
    }

    function hideFooterBlock() {
      blockVisible = false;
      if (cfg.hideOnLeave === false) return;
      footerEl.style.visibility = 'hidden';
      if (cfg.landingFooter) footerEl.classList.remove('about-footer--ready');
    }

    if (cfg.landingFooter) {
      showFooterBlock();
    }

    footerEl.querySelectorAll('[data-chr-footer]').forEach(function (el) {
      var text = el.getAttribute('data-chr-footer');
      el.removeAttribute('data-chr-footer');
      Array.from(text).forEach(function (ch, i) {
        if (ch === ' ') {
          el.insertAdjacentHTML('beforeend', '<span style="width:0.35em;display:inline-block">&nbsp;</span>');
          return;
        }
        var wrap = document.createElement('span');
        wrap.className = 'ch-wrap';
        wrap.style.setProperty('--i', i);
        var chHTML = window.getCharHTML ? window.getCharHTML(ch) : ch;
        wrap.innerHTML = '<span class="ch-top">' + chHTML + '</span><span class="ch-bot">' + chHTML + '</span>';
        el.appendChild(wrap);
      });
    });

    var footerTopChars = footerEl.querySelectorAll('.footer-top .chr-hover .ch-top');
    if (footerTopChars.length) {
      gsap.set(footerTopChars, { clipPath: 'inset(100% 0 0 0)' });
      gsap.to(footerTopChars, {
        clipPath: 'inset(0 0 0 0)',
        ease: 'power3.out',
        stagger: { each: 0.015, from: 'start' },
        scrollTrigger: {
          trigger: cfg.transition,
          start: charStart,
          end: revealEnd,
          scrub: true,
        },
      });
    }

    (function initNameReveal() {
      function rebuildChars(el, keepFirstLetter) {
        var text = el.textContent;
        el.textContent = '';
        var inners = [];
        for (var i = 0; i < text.length; i++) {
          var outer = document.createElement('span');
          outer.style.display = 'inline-block';
          outer.style.overflow = 'hidden';
          outer.style.verticalAlign = 'top';
          outer.style.padding = '0.1em 0.3em';
          outer.style.margin = '-0.1em -0.3em';
          if (keepFirstLetter && i === 0) outer.className = 'first-letter';
          var inner = document.createElement('span');
          inner.style.display = 'inline-block';
          inner.style.willChange = 'transform';
          inner.textContent = text[i];
          outer.appendChild(inner);
          el.appendChild(outer);
          inners.push(inner);
        }
        return inners;
      }

      var lukeEl = footerEl.querySelector('.footer-name-luke');
      var baffaitEl = footerEl.querySelector('.footer-name-baffait');
      var dotEl = footerEl.querySelector('.footer-name-dot');
      if (!lukeEl || !baffaitEl) return;

      var lukeChars = rebuildChars(lukeEl, true);
      var baffaitChars = rebuildChars(baffaitEl, false);
      var dotChars = dotEl ? rebuildChars(dotEl, false) : [];
      var ordered = [];
      var lukeRev = lukeChars.slice().reverse();
      var rightSide = baffaitChars.concat(dotChars);
      var maxLen = Math.max(lukeRev.length, rightSide.length);
      for (var i = 0; i < maxLen; i++) {
        if (rightSide[i]) ordered.push(rightSide[i]);
        if (lukeRev[i]) ordered.push(lukeRev[i]);
      }

      gsap.set(ordered, { yPercent: 110 });
      gsap.to(ordered, {
        yPercent: 0,
        ease: 'power3.out',
        stagger: { each: 0.04, from: 'start' },
        scrollTrigger: {
          trigger: cfg.transition,
          start: charStart,
          end: revealEnd,
          scrub: true,
        },
      });
    })();

    ScrollTrigger.create({
      trigger: cfg.transition,
      start: revealStart,
      end: revealEnd,
      onEnter: showFooterBlock,
      onLeave: hideFooterBlock,
      onEnterBack: showFooterBlock,
      onLeaveBack: function () {
        if (cfg.landingFooter) {
          showFooterBlock();
          return;
        }
        hideFooterBlock();
      },
    });
  };
})();
