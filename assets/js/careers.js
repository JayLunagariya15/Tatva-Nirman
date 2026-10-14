/* ==========================================================================
   Tatva Nirman Infra — Careers & Vendor Registration page renderer
   Reads window.SITE_CONTENT (assets/js/content.js) and window.TN
   (assets/js/common.js) and builds two separate sections: job listings,
   then vendor/subcontractor registration. You should not need to edit
   this file to change content — edit content.js under "careers" /
   "vendors" instead.
   ========================================================================== */
(function () {
  "use strict";

  var TN = window.TN;
  if (!TN) { console.error("common.js did not load"); return; }
  var C = TN.C;
  if (!C) return;

  var esc = TN.esc, t = TN.t, set = TN.set, arr = TN.arr, ico = TN.ico, slugify = TN.slugify;

  var cra = C.careers, vd = C.vendors;

  TN.setSEO({
    title: "Careers & Vendor Registration | " + C.company.name,
    description: cra.intro || (C.seo || {}).description,
    keywords: (C.seo || {}).keywords
  });

  TN.renderHeader();

  /* ---------- Careers ---------- */
  set("#careersJobs", '<div class="container">' +
    '<div class="section-head section-head--center reveal"><span class="eyebrow">' + esc(cra.eyebrow) + "</span>" +
    "<h2>" + esc(cra.heading) + '</h2><p class="sub">' + t(cra.intro) + "</p></div>" +
    '<div class="jobs" style="max-width:780px;margin-inline:auto">' + arr(cra.openings).map(function (j, i) {
      var id = "job-" + i + "-" + slugify(j.title);
      return '<div class="job" id="' + id + '"><div><h4>' + t(j.title) + '</h4><div class="job__meta">' +
        "<span>" + ico("pin") + t(j.location) + "</span><span>" + ico("clock") + esc(j.experience) + "</span><span>" + esc(j.type) + "</span></div></div>" +
        '<a class="btn btn--ghost btn--sm" href="mailto:' + esc(C.contact.emailCareers) + "?subject=" + encodeURIComponent("Application: " + String(j.title).replace(/\[\[|\]\]/g, "")) + '">Apply</a></div>';
    }).join("") + "</div>" +
    '<p class="reveal" style="margin-top:1.2rem;text-align:center;font-size:.86rem;color:var(--ink-3)">' + esc(cra.applyNote) + " <a href=\"mailto:" + esc(C.contact.emailCareers) + '">' + esc(C.contact.emailCareers) + "</a></p></div>");

  /* ---------- Vendor & subcontractor registration ---------- */
  set("#vendors", '<div class="container">' +
    '<div class="section-head section-head--center reveal"><span class="eyebrow">' + esc(vd.eyebrow) + "</span>" +
    "<h2>" + esc(vd.heading) + '</h2><p class="sub">' + t(vd.text) + "</p></div>" +
    '<div class="panel reveal" style="max-width:640px;margin-inline:auto"><h3>Documents required</h3><ul class="ticks">' +
    arr(vd.requirements).map(function (x) { return "<li>" + ico("check") + "<span>" + esc(x) + "</span></li>"; }).join("") +
    '</ul><a class="btn btn--primary btn--sm" style="margin-top:1.25rem" href="' + esc(vd.cta.href) + '">' + esc(vd.cta.label) + ico("arrow") + "</a></div></div>");

  TN.renderCta();
  TN.renderFooter();
  TN.renderFab();

  TN.bindImagePlaceholders();
  TN.initCommonBehaviour();

  /* if the URL points at a specific job (or the vendor section itself),
     scroll to it and briefly highlight it so it's easy to find. */
  if (location.hash) {
    var target = null;
    try { target = document.querySelector(location.hash); } catch (e) { target = null; }
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (target.classList.contains("job")) {
          target.classList.add("job--highlight");
          setTimeout(function () { target.classList.remove("job--highlight"); }, 2200);
        }
      }, 60);
    }
  }
})();
