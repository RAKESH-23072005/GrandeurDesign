/* ============================================================
   THE GRANDEUR DESIGN — jquery-custom.js
   jQuery interactions kept separate per project convention:
   header/footer includes, mobile menu polish, smooth anchors,
   stat counters, FAQ accordion.
   NOTE: header/footer includes use $.get — they require the
   site to be served over HTTP (e.g. VS Code Live Server or
   any web host). Opening via file:// will show fallback nav.
   ============================================================ */

$(function () {
  "use strict";

  /* ---------- Reusable header / footer ---------- */
  var includes = [];
  $("[data-include]").each(function () { includes.push($(this)); });
  if (includes.length) {
    var pending = includes.length;
    includes.forEach(function ($el) {
      $.get($el.data("include"), function (html) {
        $el.replaceWith(html);
      }).fail(function () {
        $el.html('<div class="alert alert-warning m-3 small">Component failed to load. Serve the site over HTTP (see README) or paste the header/footer markup inline.</div>');
      }).always(function () {
        if (--pending === 0) {
          /* re-run nav behaviours after inject */
          $(".gd-navbar .nav-link").each(function () {
            var href = ($(this).attr("href") || "").split("#")[0].toLowerCase();
            var path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
            if (href === path || (path === "" && href === "index.html")) $(this).addClass("active");
          });
          $(".navbar-toggler").on("click", function () {
            $(this).toggleClass("gd-open");
          });
        }
      });
    });
  }

  /* ---------- Smooth anchor scroll ---------- */
  $('a[href^="#"]').on("click", function (e) {
    var target = $($(this).attr("href"));
    if (target.length) {
      e.preventDefault();
      $("html, body").animate({ scrollTop: target.offset().top - 90 }, 600);
    }
  });

  /* ---------- Animated stat counters ---------- */
  var $stats = $(".gd-counter");
  if ($stats.length) {
    var counted = false;
    var runCounters = function () {
      if (counted) return;
      counted = true;
      $stats.each(function () {
        var $el = $(this), end = parseInt($el.data("count"), 10) || 0;
        $({ val: 0 }).animate({ val: end }, {
          duration: 1600, easing: "swing",
          step: function (now) { $el.text(Math.floor(now).toLocaleString("en-IN")); },
          complete: function () { $el.text(end.toLocaleString("en-IN")); }
        });
      });
    };
    if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { runCounters(); io.disconnect(); } });
      }, { threshold: 0.4 });
      io.observe($stats[0]);
    } else { runCounters(); }
  }

  /* ---------- FAQ accordion ---------- */
  $(".gd-faq-q").on("click", function () {
    var $item = $(this).closest(".gd-faq-item");
    var isOpen = $item.hasClass("open");
    $(".gd-faq-item.open").removeClass("open").find(".gd-faq-a").slideUp(250);
    if (!isOpen) $item.addClass("open").find(".gd-faq-a").slideDown(250);
  });
});
