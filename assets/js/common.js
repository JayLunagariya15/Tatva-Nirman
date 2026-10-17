/* ==========================================================================
   Tatva Nirman Infra — shared utilities, header/footer/FAB, common page
   behaviour. Loaded on every page, after content.js and before that page's
   own script (app.js / projects.js / careers.js). Exposes everything on
   window.TN so the page scripts can use it.
   ========================================================================== */
window.TN = (function () {
  "use strict";

  var C = window.SITE_CONTENT;
  if (!C) { console.error("content.js did not load"); return {}; }

  /* ---------------- tiny helpers ---------------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };
  /* highlights [[PLACEHOLDER]] text so unfilled fields are obvious */
  var t = function (v) {
    return esc(v).replace(/\[\[(.+?)\]\]/g, '<span class="todo" title="Placeholder — replace in content.js">$1</span>');
  };
  var set = function (sel, html) { var el = $(sel); if (el) el.innerHTML = html; };
  var arr = function (a) { return Array.isArray(a) ? a : []; };
  var digits = function (v) { return String(v || "").replace(/[^\d+]/g, ""); };
  var slugify = function (v) {
    return String(v || "").replace(/\[\[|\]\]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
  };

  /* image with graceful placeholder fallback.
     If the file is missing, the <img> is swapped for a styled placeholder
     (see bindImagePlaceholders() below). */
  var placeholder = function (phLabel, icon) {
    return '<div class="ph">' + ico(icon || "image") + "<em>" + esc(phLabel || "Add photo") + "</em></div>";
  };
  var media = function (src, alt, phLabel, icon) {
    if (!src) return placeholder(phLabel, icon);
    return '<img src="' + esc(src) + '" alt="' + esc(alt || "") + '" loading="lazy"' +
      ' data-ph="' + esc(phLabel || "Add photo") + '" data-ph-icon="' + esc(icon || "image") + '">';
  };

  /* ---------------- icon set (inline SVG, no external requests) ---------------- */
  var P = {
    water: '<path d="M12 2.7s6.3 6.6 6.3 11a6.3 6.3 0 1 1-12.6 0C5.7 9.3 12 2.7 12 2.7Z"/><path d="M8.7 14.2c0 1.7 1.3 2.9 3 2.9" stroke-width="1.3"/><path d="M9.3 8.6c1-1.2 1.9-2.2 2.7-3.2" stroke-width="1.1" opacity=".55"/>',
    pipe: '<path d="M3 7h7a4 4 0 0 1 4 4v3a4 4 0 0 0 4 4h3"/><path d="M3 4v6M21 14v6"/><circle cx="6.5" cy="7" r="1.15" fill="currentColor" stroke="none"/><circle cx="17.5" cy="17" r="1.15" fill="currentColor" stroke="none"/><path d="M9 11.2h5" stroke-width="1.1" opacity=".5"/>',
    solar: '<rect x="6" y="6" width="12" height="9" rx="1"/><path d="M6 9.5h12M6 12.5h12M10.5 6v9M15.5 6v9" stroke-width="1"/><path d="M12 2v2M18.5 4.2l-1.2 1.5M5.5 4.2l1.2 1.5" stroke-width="1.2"/>',
    civil: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-5h6v5"/><path d="M9 11h1.4M13.6 11H15M9 15h1.4M13.6 15H15" stroke-width="1.1" opacity=".55"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    draft: '<path d="M4 3h11l5 5v13H4z"/><path d="M15 3v5h5M8 13h8M8 17h5"/>',
    machine: '<path d="M3 18h13l3-5h2v5"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/><path d="M6 13V6h5l3 7"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.5a3.2 3.2 0 0 1 0 6M17.5 20a6.4 6.4 0 0 0-2-4.6"/>',
    lab: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7 15h10"/>',
    shield: '<path d="M12 2.6 20 6v6c0 5-3.4 8-8 9.4C7.4 20 4 17 4 12V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    doc: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 12h6M9 16h6"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.8M12 18.7v2.8M21.5 12h-2.8M5.3 12H2.5M18.7 5.3l-2 2M7.3 16.7l-2 2M18.7 18.7l-2-2M7.3 7.3l-2-2"/>',
    leaf: '<path d="M20 4C10 4 4 9 4 16c0 2.2.8 4 .8 4S8 12 20 4Z"/><path d="M4.8 20C8 15 13 12 18 11"/>',
    phone: '<path d="M21 16.9v2.6a2 2 0 0 1-2.2 2 19.5 19.5 0 0 1-8.5-3 19.2 19.2 0 0 1-5.9-5.9 19.5 19.5 0 0 1-3-8.6A2 2 0 0 1 3.4 2H6a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.1 9.8a15.8 15.8 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7A2 2 0 0 1 21 16.9Z"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/>',
    pin: '<path d="M20 10.5c0 6-8 11.5-8 11.5s-8-5.5-8-11.5a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10.5" r="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3.5 2"/>',
    download: '<path d="M12 3v12M7 11l5 5 5-5M4 20h16"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    wa: '<path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2Zm4.9 13.6c-.2.6-1.2 1.2-1.7 1.2-1.6 0-4-1.3-5.6-3.4-1-1.3-1.6-2.7-1.6-3.7 0-.7.5-1.6 1-1.9.2-.2.5-.2.8-.1l.6.1c.2 0 .3.2.4.4l.6 1.5c.1.2 0 .4-.1.5l-.5.6c-.1.2-.2.4 0 .6.5 1 1.6 2 2.6 2.5.2.1.4 0 .6-.1l.6-.7c.1-.2.3-.2.5-.1l1.5.7c.2.1.3.3.3.5 0 .3 0 .8-.1 1.1Z"/>',
    linkedin: '<path d="M4.5 9h3v10.5h-3zM6 3.8a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6ZM10 9h2.9v1.5c.6-1 1.7-1.8 3.3-1.8 2.4 0 3.8 1.5 3.8 4.5v6.3h-3v-5.6c0-1.5-.6-2.4-1.9-2.4-1.2 0-2.1.9-2.1 2.4v5.6h-3z"/>',
    youtube: '<path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18 5 12 5 12 5s-6 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2C2 9 2 12 2 12s0 3 .4 4.8a2.6 2.6 0 0 0 1.8 1.8C6 19 12 19 12 19s6 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8C22 15 22 12 22 12s0-3-.4-4.8ZM10 15.2V8.8L15.5 12z"/>',
    facebook: '<path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.4v2H7.5V13h2.3v8z"/>',
    image: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><circle cx="8.5" cy="10" r="1.8"/><path d="m3.5 17 5-4.5 4 3.5 3-2.5 5 4"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14.5-1.5 7 5-2.5 5 2.5-1.5-7"/>',
    scheme: '<path d="M3 21h18M6 21V9l6-4 6 4v12"/><path d="M10 21v-6h4v6"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>'
  };
  function ico(n, cls) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (cls ? ' class="' + cls + '"' : "") + ">" +
      (P[n] || P.check) + "</svg>";
  }
  var icoFill = function (n) {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + (P[n] || "") + "</svg>";
  };

  /* replace any image whose file is missing with a styled placeholder.
     Callable again for images injected later. */
  function bindImagePlaceholders(root) {
    var swap = function (img) {
      if (!img.parentNode) return;
      var box = document.createElement("div");
      box.innerHTML = placeholder(img.getAttribute("data-ph"), img.getAttribute("data-ph-icon"));
      img.parentNode.replaceChild(box.firstChild, img);
    };
    (root || document).querySelectorAll("img[data-ph]").forEach(function (img) {
      if (img.complete && img.naturalWidth === 0) { swap(img); return; }
      img.addEventListener("error", function () { swap(img); }, { once: true });
    });
  }

  /* ---------------- project card (shared by homepage teaser + projects.html) ----------------
     Each card gets a stable, unique anchor id so it can be deep-linked /
     shared directly, e.g. projects.html#project-2-sewage-treatment-plant.
     Cards themselves aren't links — the "View All Projects" button is the
     only way from the homepage teaser to projects.html. */
  function projectCard(p, i) {
    var id = "project-" + i + "-" + slugify(p.name);
    return '<article class="project" id="' + id + '" data-category="' + esc(p.category) + '" data-status="' + esc(p.status) + '">' +
      '<div class="project__media">' + media(p.image, p.name, "Add project photo", "civil") +
      '<span class="project__tag">' + esc(p.category) + "</span>" +
      '<span class="project__status" data-status="' + esc(p.status) + '">' + esc(p.status) + "</span>" +
      "</div>" +
      '<div class="project__body"><h3>' + t(p.name) + "</h3>" +
      '<p class="project__client">' + t(p.client) + "</p>" +
      '<p class="project__scope">' + t(p.scope) + "</p>" +
      '<dl class="project__meta">' +
      "<div><dt>Location</dt><dd>" + t(p.location) + ", " + esc(p.state) + "</dd></div>" +
      "<div><dt>Capacity / Scale</dt><dd>" + t(p.capacity) + "</dd></div>" +
      "<div><dt>Contract value</dt><dd>" + t(p.contractValue) + "</dd></div>" +
      "<div><dt>Year</dt><dd>" + esc(p.year) + "</dd></div>" +
      "</dl></div></article>";
  }

  /* ---------------- per-page SEO ---------------- */
  function setSEO(opts) {
    opts = opts || {};
    document.title = opts.title || C.company.name;
    var m = function (name, val, prop) {
      if (!val) return;
      var el = document.createElement("meta");
      el.setAttribute(prop ? "property" : "name", name);
      el.setAttribute("content", val);
      document.head.appendChild(el);
    };
    m("description", opts.description);
    m("keywords", opts.keywords);
    m("og:title", opts.title, 1); m("og:description", opts.description, 1); m("og:type", "website", 1);
    if (opts.ld) {
      var sc = document.createElement("script");
      sc.type = "application/ld+json";
      sc.textContent = JSON.stringify(opts.ld);
      document.head.appendChild(sc);
    }
  }

  /* ---------------- header / footer / FAB ---------------- */
  var brandBlock = function (subline) {
    var co = C.company;
    var mark = co.logoImage
      ? '<img class="brand__logoImg" src="' + esc(co.logoImage) + '" alt="' + esc(co.name) + '">'
      : '<span class="brand__mark">' + esc(co.logoMark || "TN") + "</span>";
    return '<a class="brand" href="index.html#home" aria-label="' + esc(co.name) + ' — home">' + mark +
      '<span class="brand__text"><span class="brand__name">' + esc(co.name) +
      '</span><span class="brand__sub">' + esc(subline) + "</span></span></a>";
  };

  function renderHeader() {
    set("#header", '<div class="container header__in">' + brandBlock("Water • Sewerage • Solar EPC") +
      '<button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="mainNav" aria-label="Toggle menu"><span></span></button>' +
      '<nav class="nav" id="mainNav" aria-label="Main">' +
      arr(C.nav).map(function (n) { return '<a href="' + esc(n.href) + '">' + esc(n.label) + "</a>"; }).join("") +
      "</nav></div>");
  }

  function renderFooter() {
    var co = C.company, ct = C.contact, ft = C.footer, ro = ct.registeredOffice;
    var fLinks = function (list) {
      return '<ul class="footer__links">' + arr(list).map(function (l) {
        return '<li><a href="' + esc(l.href) + '">' + esc(l.label) + "</a></li>";
      }).join("") + "</ul>";
    };
    set("#footer", '<div class="container"><div class="footer__top">' +
      '<div><div class="footer__brand">' +
      (co.logoImage ? '<img class="brand__logoImg" src="' + esc(co.logoImage) + '" alt="">' : '<span class="brand__mark">' + esc(co.logoMark) + "</span>") +
      '<span class="brand__text"><span class="brand__name">' + esc(co.name) + '</span><span class="brand__sub">Infrastructure &amp; EPC</span></span></div>' +
      '<p class="footer__about">' + t(ft.about) + "</p>" +
      '<div class="footer__ids"><span><b>CIN:</b> ' + t(co.cin) + "</span></div></div>" +
      "<div><h4>Company</h4>" + fLinks(ft.quickLinks) + "</div>" +
      "<div><h4>Services</h4>" + fLinks(ft.serviceLinks) + "</div>" +
      '<div><h4>Reach us</h4><div class="footer__contact">' +
      "<div>" + ico("pin") + "<address style=\"font-style:normal\">" + arr(ro.lines).map(t).join("<br>") + "</address></div>" +
      "<div>" + ico("phone") + '<a href="tel:' + digits(ct.phonePrimary) + '">' + esc(ct.phonePrimary) + "</a></div>" +
      "<div>" + ico("mail") + '<a href="mailto:' + esc(ct.emailPrimary) + '">' + esc(ct.emailPrimary) + "</a></div>" +
      "<div>" + ico("clock") + "<span>" + esc(ct.workingHours) + "</span></div>" +
      "</div></div></div>" +
      '<div class="footer__bar"><span>&copy; <span id="year"></span> ' + esc(ft.copyright) + "</span>" +
      '<div class="footer__legal">' + arr(ft.legalLinks).map(function (l) {
        return '<a href="' + esc(l.href) + '">' + esc(l.label) + "</a>";
      }).join("") + "</div></div></div>");
    var y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function renderCta() {
    var ct = C.contact;
    set("#cta", '<div class="container cta__in"><div>' +
      "<h2>Have a tender or project requirement?</h2>" +
      "<p>Share the scope and we will revert with our credentials, capability statement and a technical response.</p></div>" +
      '<div class="cta__actions">' +
      '<a class="btn btn--accent" href="tel:' + digits(ct.phonePrimary) + '">' + ico("phone") + esc(ct.phonePrimary) + "</a>" +
      '<a class="btn btn--onDark" href="mailto:' + esc(ct.emailTenders) + '">' + ico("mail") + "Email tender desk</a></div></div>");
  }

  function renderFab() {
    var ct = C.contact;
    set("#fab", '<a class="fab__wa" href="https://wa.me/' + digits(ct.whatsapp) + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' + icoFill("wa") + "</a>" +
      '<a class="fab__call" href="tel:' + digits(ct.phonePrimary) + '" aria-label="Call us">' + ico("phone") + "</a>" +
      '<a class="fab__top" id="toTop" href="#" aria-label="Back to top">' + ico("up") + "</a>");
  }

  /* ---------------- shared page behaviour ----------------
     Mobile menu, sticky header shadow, nav active-state (in-page
     scroll-spy where the link is an anchor on THIS page, static
     current-page highlighting for links to other pages), reveal-on-
     scroll, animated counters, capacity bar fill-in. Call once per page
     after the header/footer/content are in the DOM. */
  function initCommonBehaviour() {
    var header = $("#header"), toggle = $("#navToggle");
    if (toggle && header) {
      toggle.addEventListener("click", function () {
        var open = header.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      header.addEventListener("click", function (e) {
        if (e.target.closest(".nav a")) {
          header.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    var toTop = $("#toTop");
    if (toTop) {
      toTop.addEventListener("click", function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var currentFile = (location.pathname.split("/").pop() || "index.html");
    var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
    var anchorLinks = [], anchorTargets = [], hasHomeAnchor = false;

    navLinks.forEach(function (l) {
      var href = l.getAttribute("href") || "";
      var hashIdx = href.indexOf("#");
      if (hashIdx === -1) {
        if (href === currentFile) l.classList.add("is-active");
        return;
      }
      var filePart = href.slice(0, hashIdx);
      var hash = href.slice(hashIdx);
      if (filePart && filePart !== currentFile) return; /* anchor lives on a different page */
      if (hash === "#home") hasHomeAnchor = true;
      var target = null;
      try { target = document.querySelector(hash); } catch (e) { target = null; }
      if (target) { anchorLinks.push(l); anchorTargets.push(target); }
    });

    var onScroll = function () {
      var y = window.scrollY;
      if (header) header.classList.toggle("is-stuck", y > 8);
      if (toTop) toTop.classList.toggle("is-on", y > 700);
      if (hasHomeAnchor && y < 260) {
        navLinks.forEach(function (l) {
          var href = l.getAttribute("href") || "";
          l.classList.toggle("is-active", href.slice(href.indexOf("#")) === "#home");
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if ("IntersectionObserver" in window) {
      if (anchorTargets.length) {
        var navObs = new IntersectionObserver(function (entries) {
          if (window.scrollY < 260) return;
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            var i = anchorTargets.indexOf(en.target);
            if (i < 0) return;
            anchorLinks.forEach(function (l, j) { l.classList.toggle("is-active", i === j); });
          });
        }, { rootMargin: "-45% 0px -50% 0px" });
        anchorTargets.forEach(function (s) { navObs.observe(s); });
      }

      var revObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-in"); revObs.unobserve(en.target); }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
      document.querySelectorAll(".reveal").forEach(function (el) { revObs.observe(el); });

      var cntObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target, target = parseFloat(el.getAttribute("data-count")) || 0;
          var sfx = el.getAttribute("data-suffix") || "", start = null, dur = 1100;
          var tick = function (ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + sfx;
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          cntObs.unobserve(el);
        });
      }, { threshold: 0.4 });
      document.querySelectorAll("[data-count]").forEach(function (el) { cntObs.observe(el); });

      var barObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          requestAnimationFrame(function () { el.style.width = el.getAttribute("data-pct") + "%"; });
          barObs.unobserve(el);
        });
      }, { threshold: 0.4 });
      document.querySelectorAll(".capbar__fill").forEach(function (el) { barObs.observe(el); });
    } else {
      document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
      document.querySelectorAll("[data-count]").forEach(function (el) {
        el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
      });
      document.querySelectorAll(".capbar__fill").forEach(function (el) { el.style.width = el.getAttribute("data-pct") + "%"; });
    }
  }

  return {
    C: C, $: $, esc: esc, t: t, set: set, arr: arr, digits: digits, slugify: slugify,
    media: media, placeholder: placeholder, ico: ico, icoFill: icoFill,
    bindImagePlaceholders: bindImagePlaceholders, setSEO: setSEO,
    renderHeader: renderHeader, renderFooter: renderFooter, renderFab: renderFab, renderCta: renderCta,
    initCommonBehaviour: initCommonBehaviour, projectCard: projectCard
  };
})();
