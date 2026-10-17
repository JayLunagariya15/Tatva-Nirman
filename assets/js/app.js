/* ==========================================================================
   Tatva Nirman Infra — homepage renderer
   Reads window.SITE_CONTENT (assets/js/content.js) and window.TN
   (assets/js/common.js — header/footer/FAB/icons/helpers) and builds the
   homepage. You should not need to edit this file to change content.
   ========================================================================== */
(function () {
  "use strict";

  var TN = window.TN;
  if (!TN) { console.error("common.js did not load"); return; }
  var C = TN.C;
  if (!C) return;

  var $ = TN.$, esc = TN.esc, t = TN.t, set = TN.set, arr = TN.arr, digits = TN.digits,
    media = TN.media, ico = TN.ico;

  /* ======================================================================
     SEO
     ====================================================================== */
  (function () {
    var seo = C.seo || {};
    var ro = (C.contact.registeredOffice || {}).lines || [];
    TN.setSEO({
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords,
      ld: {
        "@context": "https://schema.org",
        "@type": "GeneralContractor",
        name: C.company.legalName || C.company.name,
        alternateName: C.company.name,
        description: seo.description,
        url: seo.siteUrl,
        telephone: C.contact.phonePrimary,
        email: C.contact.emailPrimary,
        foundingDate: C.company.established,
        address: { "@type": "PostalAddress", streetAddress: ro.join(", "), addressCountry: "IN" },
        areaServed: arr((C.presence || {}).states).map(function (s) { return { "@type": "State", name: s.state }; }),
        makesOffer: arr((C.services || {}).items).map(function (s) {
          return { "@type": "Offer", itemOffered: { "@type": "Service", name: s.title } };
        })
      }
    });
  })();

  TN.renderHeader();

  /* ======================================================================
     HERO + CLIENT WALL + STATS
     ====================================================================== */
  var h = C.hero;
  var slides = arr(h.slides);
  set("#hero", '<div class="hero__bgs">' + slides.map(function (s, i) {
    return '<div class="hero__bg' + (i === 0 ? " is-active" : "") + '" data-figure="' + i + '">' + media(s.image, s.imageAlt, "", "civil") + "</div>";
  }).join("") + "</div>" +
    '<div class="hero__scrim" aria-hidden="true"></div>' +
    '<div class="container hero__in">' +
    '<div class="hero__slidetext">' + slides.map(function (s, i) {
      return '<div class="hero__slide' + (i === 0 ? " is-active" : "") + '" data-slide="' + i + '">' +
        '<span class="hero__eyebrow">' + esc(s.eyebrow) + "</span>" +
        "<h1>" + t(s.title) + "</h1>" +
        '<p class="hero__sub">' + t(s.subtitle) + "</p></div>";
    }).join("") + "</div>" +
    '<ul class="hero__list">' + arr(h.highlights).map(function (x) {
      return "<li>" + ico("check") + "<span>" + t(x) + "</span></li>";
    }).join("") + "</ul>" +
    '<div class="hero__actions">' +
    '<a class="btn btn--onDark" href="' + esc(h.secondaryCta.href) + '">' + esc(h.secondaryCta.label) + "</a>" +
    "</div>" +
    '<div class="hero__dots" id="heroDots">' + slides.map(function (s, i) {
      return '<button class="hero__dot' + (i === 0 ? " is-active" : "") + '" data-goto="' + i + '" aria-label="Show slide ' + (i + 1) + '"></button>';
    }).join("") + "</div>" +
    "</div>");

  var cw = C.clientWall;
  if (cw && arr(cw.items).length) {
    var cwPalette = ["c1", "c2", "c3", "c4", "c5"];
    var cwItems = arr(cw.items).map(function (c2, i) {
      var cls = cwPalette[i % cwPalette.length];
      var badge = c2.logo
        ? '<span class="clientcard__badge clientcard__badge--img"><img src="' + esc(c2.logo) + '" alt=""></span>'
        : '<span class="clientcard__badge">' + ico(c2.icon || "civil") + "</span>";
      return '<div class="clientcard clientcard--text ' + cls + '">' + badge + esc(c2.name) + "</div>";
    }).join("");
    set("#clientwall", '<div class="container">' +
      '<div class="section-head section-head--center reveal"><span class="eyebrow">Trusted partners</span>' +
      "<h2>" + esc(cw.heading) + "</h2></div></div>" +
      '<div class="clientmarquee"><div class="clientmarquee__track">' + cwItems + cwItems + "</div></div>");
  }

  set("#stats", '<div class="container"><div class="stats stats--overlap reveal">' +
    arr(C.stats).map(function (s) {
      /* "States of operation" is always derived from the actual presence
         list, so it can't go stale when a state is added or removed. */
      var value = s.label === "States of operation" ? arr((C.presence || {}).states).length : s.value;
      return '<div class="stat"><b data-count="' + esc(value) + '" data-suffix="' + esc(s.suffix || "") + '">0' +
        esc(s.suffix || "") + '</b><span class="stat__label">' + esc(s.label) + "</span></div>";
    }).join("") + "</div></div>");

  /* ======================================================================
     ABOUT
     ====================================================================== */
  var a = C.about, co = C.company;
  set("#about", '<div class="container">' +
    '<div class="about__grid">' +
    '<div class="reveal">' +
    '<span class="eyebrow">' + esc(a.eyebrow) + "</span>" +
    "<h2>" + t(a.heading) + "</h2>" +
    '<p class="about__lead" style="margin-top:1.1rem">' + t(a.lead) + "</p>" +
    '<div class="about__body">' + arr(a.paragraphs).map(function (p) { return "<p>" + t(p) + "</p>"; }).join("") + "</div>" +
    '<ul class="ticks">' + arr(a.bullets).map(function (b) {
      return "<li>" + ico("check") + "<span>" + t(b) + "</span></li>";
    }).join("") + "</ul></div>" +
    '<div class="reveal"><div class="about__figure">' +
    media(a.image, a.imageAlt, "Add team / site photo", "people") + "</div></div>" +
    "</div>" +

    '<div class="values reveal">' + arr(a.values).map(function (v) {
      return '<div class="value"><h4>' + esc(v.title) + "</h4><p>" + t(v.desc) + "</p></div>";
    }).join("") + "</div>" +

    (a.capacityBars ? '<div class="capbars reveal"><h3 class="capbars__head">' + esc(a.capacityBars.heading) + "</h3>" +
      /* Each bar's number comes straight from the matching "stats" entry
         (matched by unit — MLD/km/MW) instead of a separately-typed value,
         so editing a number once in Stats updates it here too. */
      arr(a.capacityBars.items).map(function (c2) {
        var stat = arr(C.stats).filter(function (s) { return (s.suffix || "").trim() === c2.statUnit; })[0];
        var value = stat ? stat.value : 0;
        var displayText = stat ? (stat.value + stat.suffix) : "—";
        var pct = Math.max(4, Math.min(100, (value / (c2.max || 100)) * 100));
        return '<div class="capbar"><div class="capbar__icon">' + ico(c2.icon) + "</div>" +
          '<div class="capbar__main"><div class="capbar__top"><span>' + esc(c2.label) + '</span><b>' + esc(displayText) + "</b></div>" +
          '<div class="capbar__track"><div class="capbar__fill" data-pct="' + pct + '" style="width:0"></div></div></div></div>';
      }).join("") + "</div>" : "") +
    "</div>");

  /* ======================================================================
     VISION & MISSION — standalone statement band
     ====================================================================== */
  set("#visionmission", '<div class="container">' +
    '<div class="visionmission__panel reveal">' +
    '<div class="visionmission__quotewrap">' +
    '<span class="eyebrow">Our vision</span>' +
    '<p class="visionmission__quote">' + t(a.vision) + "</p>" +
    "</div>" +
    '<div class="visionmission__mission">' +
    "<h3>Our Mission</h3>" +
    "<p>" + t(a.mission) + "</p>" +
    "</div></div></div>");

  /* ======================================================================
     COMPANY PROFILE — numbered tab switcher (01–05), built from data
     already defined elsewhere in content.js. Click a number to switch pane.
     ====================================================================== */
  (function profileTabs() {
    var panes = [
      { n: "01", icon: "doc", label: "Our DNA", body: "<p>" + t(a.lead) + "</p><p>" + t(a.paragraphs[0] || "") + "</p>" },
      { n: "02", icon: "leaf", label: "Vision & Mission", body: '<div class="profile__vm"><div><h4>Vision</h4><p>' + t(a.vision) + '</p></div><div><h4>Mission</h4><p>' + t(a.mission) + "</p></div></div>" },
      { n: "03", icon: "people", label: "Leadership", body: '<ul class="profile__list">' + arr(co.directors).map(function (d) {
          return "<li><b>" + t(d.name) + "</b><span>" + esc(d.designation) + "</span></li>";
        }).join("") + "</ul>" },
      { n: "04", icon: "shield", label: "Our Strengths", body: '<ul class="profile__list profile__list--tick">' + arr(a.bullets).map(function (b) {
          return "<li>" + ico("check") + "<span>" + t(b) + "</span></li>";
        }).join("") + "</ul>" },
      { n: "05", icon: "award", label: "Our Values", body: '<div class="profile__values">' + arr(a.values).map(function (v) {
          return "<div><h4>" + esc(v.title) + "</h4><p>" + t(v.desc) + "</p></div>";
        }).join("") + "</div>" }
    ];
    set("#profile", '<div class="container">' +
      '<div class="section-head reveal"><span class="eyebrow">Company profile <i class="livepulse" aria-hidden="true"></i></span><h2>A closer look at Tatva Nirman</h2></div>' +
      '<div class="profile reveal"><div class="profile__nums" id="profileNums">' +
      panes.map(function (p, i) {
        return '<button class="profile__num' + (i === 0 ? " is-active" : "") + '" data-pane="' + i + '">' +
          '<span class="profile__progress"><span class="profile__progress-fill" data-fill="' + i + '"></span></span>' +
          '<span class="profile__numicon">' + ico(p.icon) + '</span>' +
          '<b>' + p.n + "</b><span>" + p.label + "</span></button>";
      }).join("") + "</div>" +
      '<div class="profile__pane">' + panes.map(function (p, i) {
        return '<div class="profile__body' + (i === 0 ? " is-active" : "") + '" data-body="' + i + '">' + p.body + "</div>";
      }).join("") + "</div></div></div>");

    var numEls = document.querySelectorAll("#profileNums .profile__num");
    var bodyEls = document.querySelectorAll("#profile .profile__body");
    var fillEls = document.querySelectorAll("#profileNums .profile__progress-fill");

    /* static — starts on "01 Our DNA", changes only when a tab is clicked */
    function show(i) {
      var idx = (i + numEls.length) % numEls.length;
      numEls.forEach(function (b, j) { b.classList.toggle("is-active", j === idx); });
      bodyEls.forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-body") === String(idx)); });
      fillEls.forEach(function (f, j) { f.style.width = j === idx ? "100%" : "0%"; });
    }
    show(0);

    numEls.forEach(function (btn) {
      btn.addEventListener("click", function () { show(parseInt(btn.getAttribute("data-pane"), 10)); });
    });
  })();

  /* ======================================================================
     SERVICES
     ====================================================================== */
  var sv = C.services;
  set("#services", '<div class="container">' +
    '<div class="section-head section-head--center reveal"><span class="eyebrow">' + esc(sv.eyebrow) + "</span>" +
    "<h2>" + esc(sv.heading) + '</h2><p class="sub">' + t(sv.subheading) + "</p></div>" +
    '<div class="services">' + arr(sv.items).map(function (s) {
      return '<article class="svc reveal" id="' + esc(s.id) + '">' +
        '<div class="svc__icon">' + ico(s.icon) + "</div>" +
        "<h3>" + esc(s.title) + '</h3><p class="svc__summary">' + t(s.summary) + "</p>" +
        '<ul class="svc__points">' + arr(s.points).slice(0, 4).map(function (p) { return "<li>" + t(p) + "</li>"; }).join("") + "</ul>" +
        "</article>";
    }).join("") + "</div></div>");

  /* ======================================================================
     CAPABILITIES
     ====================================================================== */
  var cp = C.capabilities;
  set("#capabilities", '<div class="container">' +
    '<div class="section-head reveal"><span class="eyebrow">' + esc(cp.eyebrow) + "</span><h2>" + esc(cp.heading) + "</h2></div>" +
    '<div class="caps">' + arr(cp.items).map(function (i) {
      return '<div class="cap reveal"><div class="cap__icon">' + ico(i.icon) + "</div><h4>" + esc(i.title) + "</h4><p>" + t(i.desc) + "</p></div>";
    }).join("") + "</div></div>");

  /* ======================================================================
     SECTORS & SCHEMES
     ====================================================================== */
  var sec = C.sectors;
  set("#sectors", '<div class="container">' +
    '<div class="section-head reveal"><span class="eyebrow">' + esc(sec.eyebrow) + "</span><h2>" + esc(sec.heading) + "</h2></div>" +
    '<h3 class="sectors__subhead reveal">Client categories</h3>' +
    '<ul class="chiplist reveal">' + arr(sec.clientTypes).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" +
    '<h3 class="sectors__subhead reveal">Government programmes we execute under</h3>' +
    '<div class="schemecards">' + arr(sec.schemes).map(function (s) {
      var mark = s.logo ? '<img src="' + esc(s.logo) + '" alt="' + esc(s.name) + ' logo">' : ico("scheme");
      return '<div class="schemecard reveal"><div class="schemecard__logo' + (s.logo ? "" : " schemecard__logo--icon") + '">' + mark + "</div><h4>" + esc(s.name) + "</h4><p>" + t(s.desc) + "</p></div>";
    }).join("") + "</div></div>");

  /* ======================================================================
     PROCESS
     ====================================================================== */
  var pr = C.process;
  set("#process", '<div class="container">' +
    '<div class="section-head section-head--center reveal"><span class="eyebrow">' + esc(pr.eyebrow) + "</span><h2>" + esc(pr.heading) + "</h2></div>" +
    '<div class="process">' + arr(pr.steps).map(function (s) {
      return '<div class="step reveal"><span class="step__no">' + esc(s.step) + "</span><h4>" + esc(s.title) + "</h4><p>" + t(s.desc) + "</p></div>";
    }).join("") + "</div></div>");

  /* ======================================================================
     PROJECTS — teaser only. Full list with filters lives on projects.html.
     ====================================================================== */
  var pj = C.projects;
  /* Homepage shows whichever projects are marked featured:true (checked in
     the admin panel), independent of their order on the full projects.html
     list. Falls back to the first 3 if nothing is marked, so the teaser is
     never empty. */
  var featuredProjects = arr(pj.items).filter(function (p) { return p.featured; }).slice(0, 3);
  if (!featuredProjects.length) featuredProjects = arr(pj.items).slice(0, 3);
  set("#projects", '<div class="container">' +
    '<div class="section-head reveal"><span class="eyebrow">' + esc(pj.eyebrow) + "</span><h2>" + esc(pj.heading) + '</h2><p class="sub">' + t(pj.subheading) + "</p></div>" +
    '<div class="projects">' + featuredProjects.map(function (p, i) { return TN.projectCard(p, i); }).join("") + "</div>" +
    '<div class="teaser-actions"><a class="btn btn--primary" href="projects.html">View All Projects' + ico("arrow") + "</a></div>" +
    "</div>");

  /* ======================================================================
     PRESENCE
     ====================================================================== */
  var pe = C.presence;
  var presenceHeading = "Present across India";
  set("#presence", '<div class="container">' +
    '<div class="section-head reveal"><span class="eyebrow">' + esc(pe.eyebrow) + "</span><h2>" + esc(presenceHeading) + '</h2><p class="sub">' + t(pe.subheading) + "</p></div>" +
    '<div class="presence">' + arr(pe.states).map(function (s) {
      return '<div class="state reveal"><span class="state__code">' + esc(s.code) + "</span>" +
        '<span class="state__pin">' + ico("pin") + "</span>" +
        "<h4>" + esc(s.state) + '</h4><p class="state__role">' + esc(s.role) + "</p>" +
        '<p class="state__note">' + t(s.note) + "</p>" +
        '<ul class="state__districts">' + arr(s.districts).map(function (d) { return "<li>" + t(d) + "</li>"; }).join("") + "</ul>" +
        '<p class="state__count">' + t(s.projects) + "</p>" +
        "</div>";
    }).join("") + "</div></div>");

  /* ======================================================================
     CAREERS — teaser only. Full listings + vendor registration live on
     careers.html.
     ====================================================================== */
  var cra = C.careers;
  var openCount = arr(cra.openings).length;
  set("#careers", '<div class="container">' +
    '<div class="section-head section-head--center reveal"><span class="eyebrow">' + esc(cra.eyebrow) + "</span>" +
    "<h2>" + esc(cra.heading) + "</h2>" +
    '<p class="sub">' + t(cra.intro) +
    (openCount ? " Currently " + openCount + " open position" + (openCount === 1 ? "" : "s") + " across our states of operation." : "") +
    "</p></div>" +
    '<div class="teaser-actions"><a class="btn btn--primary" href="careers.html">View Careers &amp; Vendor Registration' + ico("arrow") + "</a></div>" +
    "</div>");

  TN.renderCta();

  /* ======================================================================
     CONTACT
     ====================================================================== */
  var ct = C.contact, fm = C.form, ro = ct.registeredOffice;
  var roQuery = arr(ro.lines).filter(function (l) { return !/\[\[.+?\]\]/.test(l); }).join(", ");
  var roMapSrc = ro.mapEmbedUrl
    ? esc(ro.mapEmbedUrl)
    : "https://www.google.com/maps?q=" + encodeURIComponent(roQuery || (co.name + ", India")) + "&output=embed";
  set("#contact", '<div class="container">' +
    '<div class="section-head reveal"><span class="eyebrow">' + esc(fm.eyebrow) + "</span><h2>" + esc(fm.heading) + '</h2><p class="sub">' + t(fm.subheading) + "</p></div>" +
    '<div class="contact__grid">' +
    '<div class="cinfo reveal">' +
    '<div class="map"><iframe src="' + roMapSrc + '" title="Office location map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>' +
    "</div>" +

    /* --- form --- */
    '<div class="reveal"><form class="form" id="enquiryForm" novalidate>' +
    '<div class="field field--hp" aria-hidden="true">' +
    '<label for="f-company">Company</label>' +
    '<input type="text" id="f-company" name="company_website" tabindex="-1" autocomplete="off"></div>' +
    '<div class="form__grid">' +
    '<div class="field" id="field-name"><label for="f-name">Full name <span class="req">*</span></label>' +
    '<input id="f-name" name="name" required autocomplete="name" aria-describedby="err-name">' +
    '<span class="field__err" id="err-name" role="alert"></span></div>' +

    '<div class="field"><label for="f-org">Organisation / Department</label><input id="f-org" name="organisation" autocomplete="organization"></div>' +

    '<div class="field" id="field-email"><label for="f-email">Email <span class="req">*</span></label>' +
    '<input id="f-email" name="email" type="email" required autocomplete="email" aria-describedby="err-email">' +
    '<span class="field__err" id="err-email" role="alert"></span></div>' +

    '<div class="field" id="field-phone"><label for="f-phone">Phone <span class="req">*</span></label>' +
    '<input id="f-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" aria-describedby="err-phone">' +
    '<span class="field__err" id="err-phone" role="alert"></span></div>' +

    '<div class="field"><label for="f-subject">Enquiry type</label><select id="f-subject" name="subject">' +
    arr(fm.subjects).map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + "</option>"; }).join("") + "</select></div>" +
    '<div class="field"><label for="f-state">State / Location</label><select id="f-state" name="state"><option value="">Select…</option>' +
    arr(pe.states).map(function (s) { return '<option value="' + esc(s.state) + '">' + esc(s.state) + "</option>"; }).join("") +
    '<option value="Other">Other</option></select></div>' +

    '<div class="field field--full" id="field-message"><label for="f-msg">Project details <span class="req">*</span></label>' +
    '<textarea id="f-msg" name="message" required placeholder="Scheme / tender reference, scope, capacity, approximate value and expected timeline" aria-describedby="err-message"></textarea>' +
    '<span class="field__err" id="err-message" role="alert"></span></div>' +

    '<div class="field field--check" id="field-consent"><input id="f-consent" name="consent" type="checkbox" required aria-describedby="err-consent">' +
    '<label for="f-consent">' + esc(fm.consentText) + "</label>" +
    '<span class="field__err" id="err-consent" role="alert"></span></div>' +
    "</div>" +
    '<div class="form__actions"><button class="btn btn--primary" type="submit">Send enquiry' + ico("arrow") + "</button>" +
    '<span class="form__note">Or call ' + esc(ct.phonePrimary) + "</span></div>" +
    '<div class="form__msg" id="formMsg" role="status" aria-live="polite"></div>' +
    "</form></div></div></div>");

  TN.renderFooter();
  TN.renderFab();

  /* ======================================================================
     BEHAVIOUR
     ====================================================================== */
  TN.bindImagePlaceholders();
  TN.initCommonBehaviour();

  /* hero slider — auto-rotate + manual dots (no pause-on-hover — the hero
     fills most of the first screen, so hovering it is unavoidable) */
  (function heroSlider() {
    var slideEls = Array.prototype.slice.call(document.querySelectorAll(".hero__slide"));
    var figureEls = Array.prototype.slice.call(document.querySelectorAll(".hero__bg"));
    var dotEls = Array.prototype.slice.call(document.querySelectorAll(".hero__dot"));
    if (slideEls.length < 2) return;
    var idx = 0, timer;
    var go = function (i) {
      idx = (i + slideEls.length) % slideEls.length;
      slideEls.forEach(function (el, j) { el.classList.toggle("is-active", j === idx); });
      figureEls.forEach(function (el, j) { el.classList.toggle("is-active", j === idx); });
      dotEls.forEach(function (el, j) { el.classList.toggle("is-active", j === idx); });
    };
    var start = function () { timer = setInterval(function () { go(idx + 1); }, 6000); };
    var stop = function () { clearInterval(timer); };
    dotEls.forEach(function (d) {
      d.addEventListener("click", function () { go(parseInt(d.getAttribute("data-goto"), 10)); stop(); start(); });
    });
    start();
  })();

  /* enquiry form — field validation + spam guard (honeypot + timing) */
  (function enquiryForm() {
    var form = $("#enquiryForm"), msg = $("#formMsg");
    if (!form) return;

    var formLoadedAt = Date.now();

    function setFieldError(key, message) {
      var wrap = $("#field-" + key), errEl = $("#err-" + key);
      if (!wrap || !errEl) return;
      wrap.classList.toggle("field--err", !!message);
      errEl.textContent = message || "";
    }

    var VALIDATORS = {
      name: function () { return form.elements.name.value.trim().length >= 2 ? "" : "Please enter your full name."; },
      email: function () {
        var v = form.elements.email.value.trim();
        if (!v) return "Please enter your email.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email address.";
      },
      phone: function () {
        var last10 = form.elements.phone.value.replace(/\D/g, "").slice(-10);
        return /^[6-9]\d{9}$/.test(last10) ? "" : "Please enter a valid 10-digit phone number.";
      },
      message: function () { return form.elements.message.value.trim().length >= 10 ? "" : "Please add a few details about the project."; },
      consent: function () { return form.elements.consent.checked ? "" : "Please confirm you agree to be contacted."; }
    };

    ["name", "email", "phone", "message"].forEach(function (key) {
      form.elements[key].addEventListener("blur", function () { setFieldError(key, VALIDATORS[key]()); });
    });
    form.elements.consent.addEventListener("change", function () { setFieldError("consent", VALIDATORS.consent()); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      msg.className = "form__msg";

      var ok = function () {
        msg.className = "form__msg is-ok";
        msg.textContent = fm.successMessage;
        form.reset();
        ["name", "email", "phone", "message", "consent"].forEach(function (k) { setFieldError(k, ""); });
      };
      var fail = function () {
        msg.className = "form__msg is-err";
        msg.textContent = fm.errorMessage;
      };

      /* spam guard — fail silently with the normal success message */
      if (form.elements.company_website.value || (Date.now() - formLoadedAt) < 2000) {
        ok();
        return;
      }

      var firstBadEl = null;
      Object.keys(VALIDATORS).forEach(function (key) {
        var err = VALIDATORS[key]();
        setFieldError(key, err);
        if (err && !firstBadEl) firstBadEl = form.elements[key];
      });
      if (firstBadEl) {
        msg.className = "form__msg is-err";
        msg.textContent = "Please fix the highlighted fields.";
        firstBadEl.focus();
        return;
      }

      if (fm.endpoint) {
        var btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        fetch(fm.endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
          .then(function (r) { r.ok ? ok() : fail(); })
          .catch(fail)
          .then(function () { btn.disabled = false; });
      } else {
        /* no server configured — hand off to the visitor's email client */
        var body = [
          "Name: " + form.elements.name.value,
          "Organisation: " + (form.elements.organisation.value || "-"),
          "Email: " + form.elements.email.value,
          "Phone: " + form.elements.phone.value,
          "Enquiry type: " + form.elements.subject.value,
          "State: " + (form.elements.state.value || "-"),
          "", "Details:", form.elements.message.value
        ].join("\n");
        window.location.href = "mailto:" + ct.emailPrimary +
          "?subject=" + encodeURIComponent("Website enquiry: " + form.elements.subject.value) +
          "&body=" + encodeURIComponent(body);
        ok();
      }
    });
  })();
})();
