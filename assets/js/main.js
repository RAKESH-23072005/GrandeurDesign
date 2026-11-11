/* ============================================================
   THE GRANDEUR DESIGN — main.js
   Shared behaviour: navbar, reveal animations, filters,
   lightbox, project rendering, enquiry form -> n8n webhook.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- CONFIG — EDIT THESE BEFORE DEPLOYMENT ---------- */
  const GD_CONFIG = {
    // Formspree form endpoint for testing (FREE tier)
    // Sign up at https://formspree.io/ to get your form ID
    // Replace 'YOUR_FORMSPREE_ID' with your actual form ID
    formspreeUrl: "https://formspree.io/f/mzerbedj",

    // n8n webhook URL (for production use - set up n8n automation)
    n8nWebhookUrl: "https://YOUR-N8N-INSTANCE/webhook/grandeur-enquiry",

    whatsappNumber: "916383116616",
    whatsappPrefillMessage: "Hello The Grandeur Design, I would like to discuss a project.",

    phoneDisplay: "",
    phoneTel: "+91 99525 44586",
    email: "thegrandeurdesign@gmail.com"
  };
  window.GD_CONFIG = GD_CONFIG;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Navbar shrink on scroll ---------- */
    const nav = document.querySelector(".gd-navbar");
    if (nav) {
      const onScroll = () => nav.classList.toggle("gd-scrolled", window.scrollY > 40);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    /* ---------- Active nav state ---------- */
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".gd-navbar .nav-link").forEach(a => {
      const href = (a.getAttribute("href") || "").split("#")[0].toLowerCase();
      if (href === path || (path === "" && href === "index.html")) a.classList.add("active");
    });

    /* ---------- Reveal on scroll ---------- */
    const revealEls = document.querySelectorAll(".gd-reveal");
    if (revealEls.length && !prefersReducedMotion && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("gd-visible"); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      revealEls.forEach(el => io.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add("gd-visible"));
    }

    /* ---------- Footer year ---------- */
    document.querySelectorAll(".gd-year").forEach(el => el.textContent = new Date().getFullYear());

    /* ---------- Floating WhatsApp button ---------- */
    if (!document.querySelector(".gd-whatsapp-float")) {
      const wa = document.createElement("a");
      wa.className = "gd-whatsapp-float";
      wa.href = "https://wa.me/" + GD_CONFIG.whatsappNumber + "?text=" + encodeURIComponent(GD_CONFIG.whatsappPrefillMessage);
      wa.target = "_blank";
      wa.rel = "noopener";
      wa.setAttribute("aria-label", "Chat with The Grandeur Design on WhatsApp");
      wa.innerHTML = '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.6.8 5 2.3 7L4.5 27l5.3-1.7c1.9 1.1 4 1.6 6.2 1.6 6.6 0 12-5.3 12-11.9C28 8.3 22.6 3 16 3zm0 21.8c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-3.1 1 1-3-.3-.4c-1.3-1.8-2-3.9-2-6.1C6 9.4 10.4 5 16 5s10 4.4 10 9.9-4.4 9.9-10 9.9zm5.5-7.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.3c.2.2 2.3 3.5 5.6 4.9.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.3.2-1.5-.1-.1-.3-.2-.6-.4z"/></svg>';
      document.body.appendChild(wa);
    }

    /* ---------- Project grid + filters ---------- */
    const grid = document.getElementById("gd-project-grid");
    if (grid && typeof GD_PROJECTS !== "undefined") {
      const render = cat => {
        const list = cat === "All" ? GD_PROJECTS : GD_PROJECTS.filter(p => p.category === cat);
        grid.innerHTML = list.map(p => `
          <div class="col-md-6 col-lg-4 gd-reveal gd-visible">
            <a class="gd-project-card d-block mb-4" href="project.html?id=${encodeURIComponent(p.id)}" aria-label="View project ${p.name}">
              <img src="assets/images/projects/${p.images[0]}" alt="${p.name} — ${p.scope} by The Grandeur Design" loading="lazy">
              <div class="gd-project-overlay">
                <span class="gd-cat">${p.category}</span>
                <h3>${p.name}</h3>
                <span class="gd-view">View Project</span>
              </div>
            </a>
          </div>`).join("");
        document.getElementById("gd-project-count").textContent =
          "Showing " + list.length + (list.length === 1 ? " project" : " projects");
      };
      render("All");
      document.querySelectorAll(".gd-filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".gd-filter-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          render(btn.dataset.filter);
        });
      });
    }

    /* ---------- Project detail page ---------- */
    const pdRoot = document.getElementById("gd-project-detail");
    if (pdRoot && typeof GD_PROJECTS !== "undefined") {
      const id = new URLSearchParams(location.search).get("id");
      const p = GD_PROJECTS.find(x => x.id === id) || GD_PROJECTS[0];
      document.title = p.name + " — The Grandeur Design";
      pdRoot.innerHTML = `
        <nav aria-label="breadcrumb"><ol class="breadcrumb small text-uppercase" style="letter-spacing:.15em">
          <li class="breadcrumb-item"><a href="projects.html">Projects</a></li>
          <li class="breadcrumb-item active" aria-current="page">${p.name}</li>
        </ol></nav>
        <h1 class="gd-h2 mb-3">${p.name}</h1>
        <div class="row gd-pd-meta mb-5">
          <div class="col-6 col-md-3"><strong>Category</strong><span>${p.category}</span></div>
          <div class="col-6 col-md-3"><strong>Scope</strong><span>${p.scope}</span></div>
          <div class="col-6 col-md-3"><strong>Location</strong><span>${p.location || "On request"}</span></div>
          <div class="col-6 col-md-3"><strong>Studio</strong><span>The Grandeur Design</span></div>
        </div>
        <div class="row g-3" id="gd-pd-gallery">
          ${p.images.map((img, i) => `
            <div class="col-md-6"><div class="gd-gallery-item gd-img-frame">
              <img src="assets/images/projects/${img}" alt="${p.name} — photo ${i + 1}" loading="${i ? "lazy" : "eager"}">
            </div></div>`).join("")}
        </div>
        <div class="row mt-5">
          <div class="col-lg-8">
            <p class="gd-lead">${p.description}</p>
            ${p.description.indexOf("[Client-approved") !== -1
          ? '<p class="gd-stat-note text-start">This description is a client-confirmation placeholder. Replace it with the approved project story before launch.</p>' : ''}
          </div>
          <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
            <a class="btn-gd" href="contact.html">Start a Similar Project</a>
          </div>
        </div>`;
    }

    /* ---------- Lightbox ---------- */
    const lb = document.createElement("div");
    lb.className = "gd-lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-label", "Image viewer");
    lb.innerHTML = '<img alt=""><button class="gd-lightbox-btn gd-lightbox-close" aria-label="Close">&times;</button>' +
      '<button class="gd-lightbox-btn gd-lightbox-prev" aria-label="Previous image">&#8249;</button>' +
      '<button class="gd-lightbox-btn gd-lightbox-next" aria-label="Next image">&#8250;</button>';
    document.body.appendChild(lb);
    const lbImg = lb.querySelector("img");
    let lbList = [], lbIdx = 0;
    const openLb = i => { lbIdx = i; lbImg.src = lbList[i]; lb.classList.add("open"); document.body.style.overflow = "hidden"; };
    const closeLb = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
    const stepLb = d => { lbIdx = (lbIdx + d + lbList.length) % lbList.length; lbImg.src = lbList[lbIdx]; };
    lb.querySelector(".gd-lightbox-close").addEventListener("click", closeLb);
    lb.querySelector(".gd-lightbox-prev").addEventListener("click", () => stepLb(-1));
    lb.querySelector(".gd-lightbox-next").addEventListener("click", () => stepLb(1));
    lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", e => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") stepLb(-1);
      if (e.key === "ArrowRight") stepLb(1);
    });
    document.querySelectorAll("#gd-pd-gallery .gd-gallery-item img, .gd-lightbox-source img").forEach((img, i, all) => {
      img.closest(".gd-gallery-item, .gd-lightbox-source").addEventListener("click", () => {
        lbList = Array.from(all).map(x => x.src);
        openLb(i);
      });
    });

    /* ---------- Enquiry form -> n8n webhook (email + WhatsApp) ---------- */
    const form = document.getElementById("gd-enquiry-form");
    if (form) {
      const alertBox = document.getElementById("gd-form-alert");
      const submitBtn = document.getElementById("gd-submit-btn");
      const btnLabel = submitBtn.innerHTML;
      let submitting = false;

      const showError = (field, msg) => {
        const input = form.querySelector("#" + field);
        if (input) {
          input.classList.add("is-invalid");
          const parent = input.closest(".mb-3, .mb-4");
          if (parent) {
            const fb = parent.querySelector(".gd-invalid-feedback");
            if (fb) {
              fb.textContent = msg;
              fb.classList.add("show");
            }
          }
        }
      };

      form.querySelectorAll(".form-control, .form-select").forEach(el =>
        el.addEventListener("input", () => {
          el.classList.remove("is-invalid");
          const parent = el.closest(".mb-3, .mb-4");
          if (parent) {
            const fb = parent.querySelector(".gd-invalid-feedback");
            if (fb) fb.classList.remove("show");
          }
        }));

      form.addEventListener("submit", async e => {
        e.preventDefault();
        if (submitting) return;

        alertBox.className = "gd-alert";
        alertBox.textContent = "";
        form.querySelectorAll(".gd-invalid-feedback").forEach(f => f.classList.remove("show"));
        form.querySelectorAll(".is-invalid").forEach(i => i.classList.remove("is-invalid"));

        const data = {
          name: form.querySelector("#gd-name").value.trim(),
          phone: form.querySelector("#gd-phone").value.trim(),
          email: form.querySelector("#gd-email").value.trim(),
          service: form.querySelector("#gd-service").value,
          location: form.querySelector("#gd-location").value.trim(),
          message: form.querySelector("#gd-message").value.trim(),
          whatsappOptIn: form.querySelector("#gd-wa-optin") ? form.querySelector("#gd-wa-optin").checked : false,
          page: location.href,
          submittedAt: new Date().toISOString()
        };

        console.log("Form data:", data);

        let valid = true;
        if (data.name.length < 2) { showError("gd-name", "Please enter your full name (min 2 characters)."); valid = false; }
        if (!/^[+]?[0-9\s-]{8,15}$/.test(data.phone)) { showError("gd-phone", "Please enter a valid phone number (8-15 digits)."); valid = false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { showError("gd-email", "Please enter a valid email address."); valid = false; }
        if (!data.service) { showError("gd-service", "Please select a service."); valid = false; }
        if (data.message.length < 10) { showError("gd-message", "Please tell us a little about your project (min 10 characters)."); valid = false; }

        if (!valid) {
          alertBox.className = "gd-alert gd-alert-error show";
          alertBox.textContent = "Please fix the errors above and try again.";
          return;
        }

        submitting = true;
        submitBtn.disabled = true;
        submitBtn.innerHTML = "Sending…";

        try {
          // Check if n8n webhook is configured
          if (!GD_CONFIG.n8nWebhookUrl || GD_CONFIG.n8nWebhookUrl.includes("YOUR-N8N-INSTANCE")) {
            throw new Error("n8n webhook URL not configured. Please set GD_CONFIG.n8nWebhookUrl in main.js");
          }

          console.log("Submitting to n8n:", GD_CONFIG.n8nWebhookUrl);

          const res = await fetch(GD_CONFIG.n8nWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });

          console.log("Response status:", res.status);

          if (!res.ok) {
            const errorText = await res.text();
            console.error("Error response:", errorText);
            throw new Error("Server responded with status " + res.status);
          }

          const result = await res.json().catch(() => ({}));
          console.log("Response data:", result);

          if (result.success === false) {
            throw new Error(result.message || "Automation reported a failure.");
          }

          alertBox.className = "gd-alert gd-alert-success show";
          alertBox.textContent = "Thank you, " + data.name.split(" ")[0] + ". Your enquiry has been received — our team will contact you shortly.";
          form.reset();
        } catch (err) {
          console.error("Form submission error:", err);
          alertBox.className = "gd-alert gd-alert-error show";
          alertBox.textContent = "We could not submit your enquiry right now. Error: " + err.message + ". Please try again, or reach us directly on WhatsApp / " + GD_CONFIG.phoneDisplay + ".";
        } finally {
          submitting = false;
          submitBtn.disabled = false;
          submitBtn.innerHTML = btnLabel;
        }
      });
    }
  });
})();
