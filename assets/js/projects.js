/* ==========================================================================
   Tatva Nirman Infra — Projects page renderer
   Reads window.SITE_CONTENT (assets/js/content.js) and window.TN
   (assets/js/common.js) and builds the full projects listing with filters.
   You should not need to edit this file to change content — edit
   content.js under "projects" instead.
   ========================================================================== */
(function () {
  "use strict";

  var TN = window.TN;
  if (!TN) { console.error("common.js did not load"); return; }
  var C = TN.C;
  if (!C) return;

  var $ = TN.$, esc = TN.esc, t = TN.t, set = TN.set, arr = TN.arr;

  var pj = C.projects;

  TN.setSEO({
    title: "Projects | " + C.company.name,
    description: pj.subheading || (C.seo || {}).description,
    keywords: (C.seo || {}).keywords
  });

  TN.renderHeader();

  var categoryFilters = arr(pj.filters).length ? pj.filters : ["All"];

  set("#projectsPage", '<div class="container">' +
    '<div class="section-head reveal"><span class="eyebrow">' + esc(pj.eyebrow) + "</span><h2>" + esc(pj.heading) + '</h2><p class="sub">' + t(pj.subheading) + "</p></div>" +
    '<div class="filters" id="projectFilters" role="tablist" aria-label="Filter projects by category">' +
    categoryFilters.map(function (f, i) {
      return '<button class="filter' + (i === 0 ? " is-active" : "") + '" data-filter="' + esc(f) + '">' + esc(f) + (f !== "All" ? " Projects" : "") + "</button>";
    }).join("") + "</div>" +
    '<div class="projects" id="projectGrid">' + arr(pj.items).map(function (p, i) { return TN.projectCard(p, i); }).join("") + "</div>" +
    "</div>");

  TN.renderCta();
  TN.renderFooter();
  TN.renderFab();

  TN.bindImagePlaceholders();
  TN.initCommonBehaviour();

  /* project filters (by category — see C.projects.filters in content.js) */
  var filterBar = $("#projectFilters");
  if (filterBar) {
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;
      var f = btn.getAttribute("data-filter");
      filterBar.querySelectorAll(".filter").forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      document.querySelectorAll("#projectGrid .project").forEach(function (card) {
        card.style.display = (f === "All" || card.getAttribute("data-category") === f) ? "" : "none";
      });
    });
  }

  /* if the URL points at a specific project (e.g. shared from the
     homepage teaser or a search result), scroll to it once the layout
     has settled and give it a brief highlight so it's easy to find. */
  if (location.hash) {
    var target = null;
    try { target = document.querySelector(location.hash); } catch (e) { target = null; }
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        target.classList.add("project--highlight");
        setTimeout(function () { target.classList.remove("project--highlight"); }, 2200);
      }, 60);
    }
  }
})();
