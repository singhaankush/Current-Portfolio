/* =========================================================
   ANKUSH SINGHA — PORTFOLIO
   script.js — GSAP hero sequence, ScrollTrigger reveals,
   work list interactions, nav state, EmailJS contact form.

   No cursor-follower. No loading screen / preloader.
   ========================================================= */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     GSAP setup
  --------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------------------------------------------------
     1. HERO — single orchestrated load-in sequence.
        Title lines slide up from behind a mask, description
        and CTAs fade up in step, portrait settles in with a
        soft scale + slight rotation correction.
  --------------------------------------------------------- */
  function playHeroIntro() {
    if (!window.gsap) return;

    const titleSpans = document.querySelectorAll(".hero__title .line > span");
    const heroReveals = document.querySelectorAll(".hero [data-reveal]");
    const portrait = document.getElementById("heroImg");

    if (prefersReduced) {
      // Respect reduced motion: show everything immediately, no animation.
      titleSpans.forEach((s) => (s.style.transform = "none"));
      heroReveals.forEach((el) => el.classList.add("is-visible"));
      if (portrait) portrait.style.transform = "none";
      return;
    }

    // wrap title words already inline-block via CSS; animate from below the mask
    gsap.set(titleSpans, { yPercent: 130, rotate: 3 });
    if (portrait) gsap.set(portrait, { scale: 1.12, rotate: -2, opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.to(titleSpans, {
      yPercent: 0,
      rotate: 0,
      duration: 1.1,
      stagger: 0.09,
    });

    if (portrait) {
      tl.to(
        portrait,
        { scale: 1, rotate: 0, opacity: 1, duration: 1.3, ease: "power3.out" },
        "-=0.9"
      );
    }

    tl.to(
      heroReveals,
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 },
      "-=0.9"
    );
  }

  /* ---------------------------------------------------------
     2. Portrait subtle parallax on scroll (answers scroll,
        not decorative looping) — moves a little slower than
        the page so it reads as anchored, then settles.
  --------------------------------------------------------- */
  function heroParallax() {
    if (!window.gsap || !window.ScrollTrigger || prefersReduced) return;
    const portrait = document.getElementById("heroPortrait");
    if (!portrait) return;

    gsap.to(portrait, {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      },
    });
  }

  /* ---------------------------------------------------------
     3. Scroll reveals for every [data-reveal] element outside
        the hero (hero handled by its own intro timeline).
  --------------------------------------------------------- */
  function scrollReveals() {
    const targets = document.querySelectorAll(
      "[data-reveal]:not(.hero [data-reveal])"
    );

    if (!window.gsap || !window.ScrollTrigger) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    if (prefersReduced) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    targets.forEach((el, i) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: (i % 4) * 0.05,
          });
        },
      });
    });
  }

  /* ---------------------------------------------------------
     4. Section-head titles: light GSAP word-reveal on scroll
        for the "Selected work" / "Got a project" style headers
        (mask + rise), separate from the generic reveal above
        because these are the section's own hero moment.
  --------------------------------------------------------- */
  function sectionTitleReveals() {
    const titles = document.querySelectorAll(
      ".section-head__title, .studio__title, .contact__title"
    );

    // No GSAP/ScrollTrigger, or reduced motion: just show them (CSS starts
    // them hidden, so without this they'd stay invisible).
    if (!window.gsap || !window.ScrollTrigger || prefersReduced) {
      titles.forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    titles.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          });
        },
      });
    });
  }

  /* ---------------------------------------------------------
     5. NAV — background/blur state on scroll (no animation
        library needed here, just a class toggle, but we use
        gsap for the border/opacity transition consistency).
  --------------------------------------------------------- */
  function navScrollState() {
    const nav = document.getElementById("nav");
    if (!nav) return;

    const setState = () => {
      if (window.scrollY > 40) {
        nav.classList.add("is-scrolled");
      } else {
        nav.classList.remove("is-scrolled");
      }
    };
    setState();
    window.addEventListener("scroll", setState, { passive: true });
  }

  /* ---------------------------------------------------------
     6. Mobile menu toggle
  --------------------------------------------------------- */
  function mobileMenu() {
    const burger = document.getElementById("burger");
    const menu = document.getElementById("mobileMenu");
    if (!burger || !menu) return;

    const closeMenu = () => {
      menu.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };

    burger.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    menu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", closeMenu)
    );
  }

  /* ---------------------------------------------------------
     7. Smooth anchor scroll (native, offset for fixed nav) —
        kept simple and dependency-free.
  --------------------------------------------------------- */
  function smoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href");
        if (!id || id === "#" || id === "#top") {
          if (id === "#top") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
          }
          return;
        }
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const navHeight = 90;
        const y = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
      });
    });
  }

  /* ---------------------------------------------------------
     8. WORK — filter tabs + expand/collapse rows.
        Site rows (with browser-mock) open on hover on desktop
        and on tap on touch devices; image rows (thumbnails /
        posters) open only on click/tap, since a real photo
        deserves a deliberate look, not an accidental hover.
  --------------------------------------------------------- */
  function workInteractions() {
    const filters = document.querySelectorAll(".work__filter");
    const items = document.querySelectorAll(".work-item");

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        filters.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");

        const filter = btn.dataset.filter;
        items.forEach((item) => {
          const match = filter === "all" || item.dataset.category === filter;
          item.classList.toggle("is-hidden", !match);
          if (!match) item.classList.remove("is-open");
        });
      });
    });

    const isTouch = window.matchMedia("(hover: none)").matches;

    items.forEach((item) => {
      const row = item.querySelector(".work-item__row");
      const hasHref = !!item.querySelector("a.work-item__link");

      if (!row) return;

      row.addEventListener("click", (e) => {
        const clickedArrow = e.target.closest(".work-item__arrow");

        if (hasHref) {
          if (isTouch) {
            // Touch + site row: first tap opens the preview instead of
            // navigating straight away (no hover to reveal it first).
            // Tapping the arrow, or tapping again once open, navigates.
            if (!item.classList.contains("is-open") && !clickedArrow) {
              e.preventDefault();
              item.classList.add("is-open");
              return;
            }
            if (clickedArrow) {
              e.preventDefault();
              item.classList.toggle("is-open");
            }
            // else: already open + tapped the row again -> let it navigate
            return;
          }
          // Desktop + site row: hover already reveals the preview, so a
          // click anywhere except the arrow navigates normally.
          if (!clickedArrow) return;
          e.preventDefault();
          item.classList.toggle("is-open");
          return;
        }

        // Image rows (thumbnails/posters): click always toggles.
        item.classList.toggle("is-open");
      });

      // desktop hover-reveal for site rows only
      if (!isTouch && hasHref) {
        item.addEventListener("mouseenter", () => item.classList.add("is-open"));
        item.addEventListener("mouseleave", () => item.classList.remove("is-open"));
      }
    });
  }

  /* ---------------------------------------------------------
     9. CONTACT FORM — EmailJS wiring with inline validation.
        Configure your own EmailJS IDs below (see README).
  --------------------------------------------------------- */
  function contactForm() {
    const form = document.getElementById("contactForm");
    const status = document.getElementById("formStatus");
    const submitBtn = document.getElementById("submitBtn");
    if (!form || !status || !submitBtn) return;

    // ---- EmailJS config — replace with your own values ----
    const EMAILJS_CONFIG = window.EMAILJS_CONFIG || {};
    const EMAILJS_PUBLIC_KEY =
      EMAILJS_CONFIG.publicKey || "Rx3X7xdMUoGipOnU2";
    const EMAILJS_SERVICE_ID =
      EMAILJS_CONFIG.serviceId || "service_ph26rrg";
    const EMAILJS_TEMPLATE_ID =
      EMAILJS_CONFIG.templateId || "template_6yez8lo";
    // ---------------------------------------------------------

    const hasEmailJsConfig = [
      EMAILJS_PUBLIC_KEY,
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
    ].every((value) => typeof value === "string" && value.trim().length > 0);

    let emailjsReady = false;
    if (window.emailjs && hasEmailJsConfig) {
      try {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
        emailjsReady = true;
      } catch (err) {
        console.error("EmailJS initialization failed.", err);
        emailjsReady = false;
      }
    }

    const fields = {
      name: form.querySelector("#name"),
      email: form.querySelector("#email"),
      message: form.querySelector("#message"),
    };

    function validate() {
      let valid = true;

      const nameField = fields.name.closest(".field");
      if (!fields.name.value.trim()) {
        nameField.classList.add("is-invalid");
        valid = false;
      } else {
        nameField.classList.remove("is-invalid");
      }

      const emailField = fields.email.closest(".field");
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(fields.email.value.trim())) {
        emailField.classList.add("is-invalid");
        valid = false;
      } else {
        emailField.classList.remove("is-invalid");
      }

      const msgField = fields.message.closest(".field");
      if (!fields.message.value.trim()) {
        msgField.classList.add("is-invalid");
        valid = false;
      } else {
        msgField.classList.remove("is-invalid");
      }

      return valid;
    }

    Object.values(fields).forEach((f) => {
      f.addEventListener("input", () => f.closest(".field").classList.remove("is-invalid"));
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "contact__form-status";

      if (!validate()) {
        status.textContent = "Please fix the highlighted fields.";
        status.classList.add("is-error");
        return;
      }

      const btnLabel = submitBtn.querySelector(".btn__label");
      const originalLabel = btnLabel.textContent;
      submitBtn.disabled = true;
      btnLabel.textContent = "Sending…";
      status.textContent = "";

      const payload = {
        from_name: fields.name.value.trim(),
        from_email: fields.email.value.trim(),
        // Keep the native field names too, so the form works with templates
        // created with either the documented aliases or the input names.
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        reply_to: fields.email.value.trim(),
        message: fields.message.value.trim(),
      };

      if (emailjsReady) {
        emailjs
          .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload)
          .then(() => {
            status.textContent = "Message sent — I'll reply within a day or two.";
            status.classList.add("is-success");
            form.reset();
          })
          .catch((err) => {
            console.error("EmailJS send failed.", err);
            status.textContent =
              "Something went wrong sending that. Try emailing ankushsingha777@gmail.com directly.";
            status.classList.add("is-error");
          })
          .finally(() => {
            submitBtn.disabled = false;
            btnLabel.textContent = originalLabel;
          });
      } else {
        // EmailJS not configured yet — fall back to a mailto link so the
        // form is never a dead end. See README to wire up real EmailJS IDs.
        const subject = encodeURIComponent("Project inquiry from portfolio site");
        const body = encodeURIComponent(
          `Name: ${payload.from_name}\nEmail: ${payload.from_email}\n\n${payload.message}`
        );
        window.location.href = `mailto:ankushsingha777@gmail.com?subject=${subject}&body=${body}`;

        status.textContent = "Opening your email app — EmailJS isn't configured yet (see README).";
        status.classList.add("is-success");
        submitBtn.disabled = false;
        btnLabel.textContent = originalLabel;
      }
    });
  }

  /* ---------------------------------------------------------
     Init
  --------------------------------------------------------- */
  function init() {
    playHeroIntro();
    heroParallax();
    scrollReveals();
    sectionTitleReveals();
    navScrollState();
    mobileMenu();
    smoothAnchors();
    workInteractions();
    contactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
