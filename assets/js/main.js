/* ══════════════════════════════════════════════════════════════
   UvVL Impact 2025–'26 — interactions
   ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── scroll progress + sticky nav ──────────────────────────── */
  var progress = document.querySelector(".progress");
  var nav = document.querySelector(".nav");
  var hero = document.querySelector(".hero");

  function onScroll() {
    var st = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (st / h) * 100 : 0) + "%";
    if (nav && hero) {
      var trigger = hero.offsetHeight - 90;
      if (st > trigger) nav.classList.add("show");
      else nav.classList.remove("show");
    }
    updateParaTargets();
    kickPara();
    if (typeof updateDeckCount === "function") updateDeckCount();
  }

  /* ── smooth (lerp) parallax for decorations ────────────────── */
  var paraEls = [].slice.call(document.querySelectorAll("[data-speed]")).map(function (el) {
    return {
      el: el,
      speed: parseFloat(el.getAttribute("data-speed")) || 0,
      rot: el.getAttribute("data-rot") || "0",
      base: 0, cur: 0, tgt: 0
    };
  });
  function measurePara() {
    var sy = window.pageYOffset || document.documentElement.scrollTop;
    paraEls.forEach(function (p) {
      var r = p.el.getBoundingClientRect();
      p.base = r.top + sy + r.height / 2 - p.cur; // doc-space centre, minus applied translate
    });
  }
  function updateParaTargets() {
    if (reduce) return;
    var sy = window.pageYOffset || document.documentElement.scrollTop;
    var vc = sy + window.innerHeight / 2;
    paraEls.forEach(function (p) { p.tgt = (vc - p.base) * p.speed * 0.14; });
  }
  var paraRunning = false;
  function paraLoop() {
    var moving = false;
    paraEls.forEach(function (p) {
      var d = p.tgt - p.cur;
      if (Math.abs(d) > 0.08) moving = true;
      p.cur += d * 0.065; // ease toward target → longer, buttery trail
      p.el.style.transform = "translate3d(0," + p.cur.toFixed(2) + "px,0) rotate(" + p.rot + "deg)";
    });
    if (moving) requestAnimationFrame(paraLoop);
    else paraRunning = false;
  }
  function kickPara() { if (!paraRunning && !reduce) { paraRunning = true; requestAnimationFrame(paraLoop); } }
  function refreshPara() { measurePara(); updateParaTargets(); kickPara(); }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", refreshPara);
  window.addEventListener("load", refreshPara);

  /* ── number formatting (nl-NL) ─────────────────────────────── */
  function fmt(n, dec) {
    return n.toLocaleString("nl-NL", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = prefix + fmt(target, dec) + suffix; return; }
    var dur = 2200, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = prefix + fmt(target * eased, dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + fmt(target, dec) + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ── growth bars ───────────────────────────────────────────── */
  function fillBar(el) {
    var pct = parseFloat(el.getAttribute("data-fill")) || 0;
    el.style.width = Math.max(4, Math.min(100, pct)) + "%";
  }

  /* ── donut builder ─────────────────────────────────────────── */
  var R = 80, C = 2 * Math.PI * R, GAP = 0.6; // gap in % terms handled via small dashoffset
  function buildDonut(host) {
    var data = JSON.parse(host.getAttribute("data-donut"));
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 200 200");
    var g = document.createElementNS(ns, "g");
    g.setAttribute("transform", "rotate(-90 100 100)");
    svg.appendChild(g);

    var total = 0; data.forEach(function (d) { total += d.value; });
    var acc = 0;
    var segs = [];
    data.forEach(function (d) {
      var frac = d.value / total;
      var circle = document.createElementNS(ns, "circle");
      circle.setAttribute("cx", 100); circle.setAttribute("cy", 100); circle.setAttribute("r", R);
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", d.color);
      circle.setAttribute("stroke-width", 30);
      var len = frac * C;
      var gap = 2; // px gap between segments
      circle.setAttribute("stroke-dasharray", Math.max(0, len - gap) + " " + (C - Math.max(0, len - gap)));
      circle.setAttribute("stroke-dashoffset", -(acc * C));
      circle.setAttribute("class", "donut-seg");
      // start hidden: collapse the visible arc
      circle.style.strokeDasharray = "0 " + C;
      circle.dataset.target = Math.max(0, len - gap) + " " + (C - Math.max(0, len - gap));
      g.appendChild(circle);
      segs.push(circle);
      acc += frac;
    });
    host.appendChild(svg);
    host._segs = segs;
  }

  function animateDonut(host) {
    if (!host._segs) return;
    host._segs.forEach(function (c, i) {
      setTimeout(function () {
        if (reduce) { c.style.strokeDasharray = c.dataset.target; return; }
        c.style.strokeDasharray = c.dataset.target;
      }, reduce ? 0 : 180 + i * 200);
    });
  }

  // build donuts up front (hidden state)
  [].slice.call(document.querySelectorAll("[data-donut]")).forEach(buildDonut);

  /* ── slope (line) chart builder — toont groei juni '25 → nu ── */
  function fmtSlope(v, unit) {
    var s = (v % 1 === 0) ? String(v) : v.toFixed(1).replace(".", ",");
    return s + (unit || "");
  }
  function buildSlope(host) {
    var data = JSON.parse(host.getAttribute("data-slope"));
    var ns = "http://www.w3.org/2000/svg";
    var W = 640, H = 470, padT = 34, padB = 52, xL = 96, xR = 392;
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("class", "slope-svg");

    var vals = []; data.forEach(function (d) { vals.push(d.from, d.to); });
    var lmin = Math.log(Math.min.apply(null, vals)), lmax = Math.log(Math.max.apply(null, vals));
    function y(v) { return padT + (1 - (Math.log(v) - lmin) / (lmax - lmin)) * (H - padT - padB); }

    function ax(x, label) {
      var t = document.createElementNS(ns, "text");
      t.setAttribute("x", x); t.setAttribute("y", H - 16); t.setAttribute("text-anchor", "middle");
      t.setAttribute("class", "slope-axis"); t.textContent = label; svg.appendChild(t);
    }
    ax(xL, "juni 2025"); ax(xR, "nu");

    // resolve right-label y positions to avoid overlap
    var labels = data.map(function (d, i) { return { i: i, y: y(d.to) }; });
    var sorted = labels.slice().sort(function (a, b) { return a.y - b.y; });
    var minGap = 48;
    for (var k = 1; k < sorted.length; k++) {
      if (sorted[k].y - sorted[k - 1].y < minGap) sorted[k].y = sorted[k - 1].y + minGap;
    }
    var over = sorted[sorted.length - 1].y - (H - padB);
    if (over > 0) sorted.forEach(function (s) { s.y -= over; });
    var labelY = {}; sorted.forEach(function (s) { labelY[s.i] = s.y; });

    var lines = [];
    data.forEach(function (d, i) {
      var col = d.strong ? "#004B36" : "#A7C3B8", w = d.strong ? 4.5 : 3;
      var y1 = y(d.from), y2 = y(d.to);
      var ln = document.createElementNS(ns, "line");
      ln.setAttribute("x1", xL); ln.setAttribute("y1", y1); ln.setAttribute("x2", xR); ln.setAttribute("y2", y2);
      ln.setAttribute("stroke", col); ln.setAttribute("stroke-width", w); ln.setAttribute("stroke-linecap", "round");
      ln.setAttribute("class", "slope-line");
      var len = Math.sqrt((xR - xL) * (xR - xL) + (y2 - y1) * (y2 - y1));
      ln.style.strokeDasharray = len; ln.style.strokeDashoffset = len;
      svg.appendChild(ln); lines.push(ln);
      [[xL, y1], [xR, y2]].forEach(function (pt) {
        var c = document.createElementNS(ns, "circle");
        c.setAttribute("cx", pt[0]); c.setAttribute("cy", pt[1]); c.setAttribute("r", d.strong ? 5 : 4);
        c.setAttribute("fill", col); c.setAttribute("class", "slope-dot"); svg.appendChild(c);
      });
      var ft = document.createElementNS(ns, "text");
      ft.setAttribute("x", xL - 14); ft.setAttribute("y", y1 + 4); ft.setAttribute("text-anchor", "end");
      ft.setAttribute("class", "slope-from"); ft.textContent = fmtSlope(d.from, d.unit); svg.appendChild(ft);
      var ly = labelY[i];
      var leader = document.createElementNS(ns, "path");
      leader.setAttribute("d", "M" + (xR + 7) + "," + y2 + " L" + (xR + 24) + "," + ly);
      leader.setAttribute("class", "slope-leader"); svg.appendChild(leader);
      var nm = document.createElementNS(ns, "text");
      nm.setAttribute("x", xR + 32); nm.setAttribute("y", ly - 5); nm.setAttribute("class", "slope-name");
      nm.textContent = d.name; svg.appendChild(nm);
      var tv = document.createElementNS(ns, "text");
      tv.setAttribute("x", xR + 32); tv.setAttribute("y", ly + 21);
      tv.setAttribute("class", "slope-to" + (d.strong ? " strong" : "")); tv.textContent = fmtSlope(d.to, d.unit);
      svg.appendChild(tv);
    });
    host.appendChild(svg);
    host._lines = lines;
  }
  function animateSlope(host) {
    if (!host._lines) return;
    host._lines.forEach(function (ln, i) {
      setTimeout(function () { ln.style.strokeDashoffset = "0"; }, reduce ? 0 : 150 + i * 170);
    });
  }
  [].slice.call(document.querySelectorAll("[data-slope]")).forEach(buildSlope);

  /* ── intersection observer for reveals & triggers ─────────── */
  var seen = new WeakSet();
  function trigger(el) {
    if (seen.has(el)) return;
    seen.add(el);
    el.classList.add("in");
    // counters within
    [].slice.call(el.querySelectorAll("[data-count]")).forEach(function (c) {
      if (!c._done) { c._done = true; countUp(c); }
    });
    if (el.hasAttribute("data-count")) { if (!el._done) { el._done = true; countUp(el); } }
    // bars
    [].slice.call(el.querySelectorAll("[data-fill]")).forEach(fillBar);
    if (el.hasAttribute("data-fill")) fillBar(el);
    // donut
    if (el.hasAttribute("data-donut")) animateDonut(el);
    [].slice.call(el.querySelectorAll("[data-donut]")).forEach(animateDonut);
    // slope chart
    if (el.hasAttribute("data-slope")) animateSlope(el);
    [].slice.call(el.querySelectorAll("[data-slope]")).forEach(animateSlope);
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { trigger(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    [].slice.call(document.querySelectorAll(".reveal, [data-count], [data-fill], [data-donut], [data-slope]")).forEach(function (el) {
      io.observe(el);
    });
  } else {
    [].slice.call(document.querySelectorAll(".reveal, [data-count], [data-fill], [data-donut], [data-slope]")).forEach(trigger);
  }

  /* ── trailer play button ───────────────────────────────────── */
  var trailerVid = document.getElementById("trailer");
  var trailerBtn = document.querySelector(".playbtn");
  if (trailerVid && trailerBtn) {
    trailerBtn.addEventListener("click", function () {
      trailerVid.setAttribute("controls", "controls");
      var pr = trailerVid.play();
      if (pr && pr.catch) pr.catch(function () {});
      trailerBtn.classList.add("hidden");
    });
  }

  /* ── slidedeck: pijltjestoetsen, teller, fullscreen ─────────── */
  var slides = [].slice.call(document.querySelectorAll("body > header.hero, body > section, body > footer.site"));
  var deckCur = document.getElementById("deckCur");
  var deckTot = document.getElementById("deckTot");
  if (deckTot) deckTot.textContent = slides.length;

  function currentSlide() {
    var idx = 0, best = Infinity;
    for (var i = 0; i < slides.length; i++) {
      var d = Math.abs(slides[i].getBoundingClientRect().top);
      if (d < best) { best = d; idx = i; }
    }
    return idx;
  }
  function goToSlide(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[i].scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  function updateDeckCount() { if (deckCur && slides.length) deckCur.textContent = currentSlide() + 1; }

  document.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    switch (e.key) {
      case "ArrowDown": case "ArrowRight": case "PageDown": case " ":
        e.preventDefault(); goToSlide(currentSlide() + 1); break;
      case "ArrowUp": case "ArrowLeft": case "PageUp":
        e.preventDefault(); goToSlide(currentSlide() - 1); break;
      case "Home": e.preventDefault(); goToSlide(0); break;
      case "End": e.preventDefault(); goToSlide(slides.length - 1); break;
      case "f": case "F": toggleFullscreen(); break;
    }
  });

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
      var p = document.documentElement.requestFullscreen();
      if (p && p.catch) p.catch(function () {});
    }
  }
  var fsBtn = document.getElementById("fsBtn");
  if (fsBtn) fsBtn.addEventListener("click", toggleFullscreen);
  var prevBtn = document.querySelector("[data-prev]");
  var nextBtn = document.querySelector("[data-next]");
  if (prevBtn) prevBtn.addEventListener("click", function () { goToSlide(currentSlide() - 1); });
  if (nextBtn) nextBtn.addEventListener("click", function () { goToSlide(currentSlide() + 1); });

  /* ── fit-to-screen: schaal slide-inhoud zodat elke slide in 1 scherm past ── */
  function fitSlides() {
    var deck = window.matchMedia("(min-width: 860px)").matches;
    for (var i = 0; i < slides.length; i++) {
      var slide = slides[i];
      var isHero = slide.matches("header.hero");
      var inner = isHero ? slide.querySelector(".hero-main") : slide.querySelector(".wrap");
      if (!inner) continue;
      inner.style.transform = "";
      if (!deck) continue;
      var reserve = isHero ? (((slide.querySelector(".hero-top") || {}).offsetHeight || 0) + 56) : 44;
      var avail = slide.clientHeight - reserve;
      var nat = inner.scrollHeight;
      if (nat > avail && avail > 0) {
        var s = Math.max(0.5, avail / nat);
        inner.style.transformOrigin = "center center";
        inner.style.transform = "scale(" + s.toFixed(4) + ")";
      }
    }
  }
  var fitTimer;
  function scheduleFit() { clearTimeout(fitTimer); fitTimer = setTimeout(fitSlides, 150); }
  window.addEventListener("resize", scheduleFit);
  window.addEventListener("load", fitSlides);

  /* ── autoplay van (gedempte) video's forceren ──────────────── */
  function playVideos() {
    [].forEach.call(document.querySelectorAll("video"), function (v) {
      v.muted = true; v.defaultMuted = true;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
  }
  playVideos();
  window.addEventListener("load", playVideos);

  /* ── initial paint ─────────────────────────────────────────── */
  fitSlides();
  refreshPara();
  onScroll();
  updateDeckCount();
  setTimeout(function () { fitSlides(); refreshPara(); }, 450); // re-meten als fonts/beeld geladen zijn
})();
