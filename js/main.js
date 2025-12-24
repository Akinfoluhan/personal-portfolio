(() => {
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  
    const header = document.querySelector("header");
    
    // Mobile nav: hamburger toggle
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.getElementById("primary-navigation");

    const setMobileNavOpen = (open) => {
      if (!header || !navToggle) return;

      header.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    if (navToggle && navMenu && header) {
      navToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        setMobileNavOpen(!header.classList.contains("nav-open"));
      });

      // Close when a link is clicked
      navMenu.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => setMobileNavOpen(false));
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (!header.classList.contains("nav-open")) return;
        if (!header.contains(e.target)) setMobileNavOpen(false);
      });

      // Close on Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setMobileNavOpen(false);
      });
    }


    const navLinks = Array.from(document.querySelectorAll(".navigation-links a[href^='#']"));
    const heroLinks = Array.from(document.querySelectorAll("#hero a[href^='#']"));
    const inPageLinks = [...navLinks, ...heroLinks];

    const sections = navLinks
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);
  
    const getHeaderOffset = () => (header ? header.offsetHeight + 12 : 12);
  
    // -----------------------------
    // 1) Smooth scroll with offset
    // -----------------------------
    inPageLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        const target = document.querySelector(href);
        if (!target) return;
  
        e.preventDefault();
  
        const y = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
        window.scrollTo({
          top: y,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
  
        history.pushState(null, "", href);
      });
    });
  
    // Also fix the scroll-down arrow in hero (if clicked)
    const heroArrow = document.querySelector("#hero .scroll-down-indicator[href^='#']");
    if (heroArrow) {
      heroArrow.addEventListener("click", (e) => {
        const href = heroArrow.getAttribute("href");
        const target = document.querySelector(href);
        if (!target) return;
  
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
        window.scrollTo({ top: y, behavior: prefersReducedMotion ? "auto" : "smooth" });
        history.pushState(null, "", href);
      });
    }
  
    // -------------------------------------
    // 2) Active nav link while scrolling
    // -------------------------------------
    const setActiveLink = (id) => {
      navLinks.forEach((a) => {
        const isActive = a.getAttribute("href") === `#${id}`;
        a.classList.toggle("is-active", isActive);
  
        // nice for accessibility
        if (isActive) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    };
  
    if ("IntersectionObserver" in window && sections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          // choose the most visible intersecting section
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  
          if (visible?.target?.id) setActiveLink(visible.target.id);
        },
        {
          root: null,
          // shifts “active” a bit earlier so it feels natural with sticky header
          rootMargin: `-${getHeaderOffset()}px 0px -55% 0px`,
          threshold: [0.15, 0.25, 0.35, 0.5, 0.65],
        }
      );
  
      sections.forEach((sec) => observer.observe(sec));
    }
  
    // -------------------------------------
    // 3) Scroll reveal (no CSS required)
    // -------------------------------------
    const revealTargets = document.querySelectorAll(
      [
        ".about-card",
        ".skill-item-card",
        ".project-item-card",
        ".experience-item-card",
        ".education-item-card",
        "#contact .contact-card",
        "#contact .contact-info-item",
      ].join(",")
    );
  
    const prepReveal = (el) => {
      if (prefersReducedMotion) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity 500ms ease, transform 500ms ease";
    };
  
    const doReveal = (el) => {
      if (prefersReducedMotion) return;
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    };
  
    if (!prefersReducedMotion) {
      revealTargets.forEach(prepReveal);
  
      if ("IntersectionObserver" in window && revealTargets.length) {
        const revealObs = new IntersectionObserver(
          (entries, obs) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              doReveal(entry.target);
              obs.unobserve(entry.target);
            });
          },
          { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
        );
  
        revealTargets.forEach((el) => revealObs.observe(el));
      } else {
        // fallback
        revealTargets.forEach(doReveal);
      }
    }
  
    // -------------------------------------
    // 4) Contact form: send via Formspree
    // -------------------------------------
    const contactForm = document.querySelector("#contact .contact-form");

    const showToast = (message) => {
      const toast = document.createElement("div");
      toast.textContent = message;

      toast.style.position = "fixed";
      toast.style.left = "50%";
      toast.style.bottom = "22px";
      toast.style.transform = "translateX(-50%)";
      toast.style.padding = "12px 16px";
      toast.style.borderRadius = "12px";
      toast.style.background = "rgba(10, 16, 34, 0.92)";
      toast.style.border = "1px solid rgba(255,255,255,0.10)";
      toast.style.boxShadow = "0 10px 28px rgba(0,0,0,0.35)";
      toast.style.color = "rgba(230,230,235,0.95)";
      toast.style.zIndex = "9999";
      toast.style.maxWidth = "92vw";
      toast.style.textAlign = "center";

      if (!prefersReducedMotion) {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 250ms ease";
      }

      document.body.appendChild(toast);

      requestAnimationFrame(() => {
        if (!prefersReducedMotion) toast.style.opacity = "1";
      });

      setTimeout(() => {
        if (!prefersReducedMotion) toast.style.opacity = "0";
        setTimeout(() => toast.remove(), prefersReducedMotion ? 0 : 250);
      }, 2200);
    };

    if (contactForm) {
      contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!contactForm.action || contactForm.action.endsWith("#")) {
          showToast("⚠️ Add your Formspree form URL to the form's action attribute.");
          return;
        }

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.textContent : "";

        try {
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending...";
          }

          const formData = new FormData(contactForm);

          const res = await fetch(contactForm.action, {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" },
          });

          if (res.ok) {
            contactForm.reset();
            showToast("✅ Message sent! I’ll get back to you ASAP.");
          } else {
            showToast("❌ Something went wrong. Please try again in a moment.");
          }
        } catch (err) {
          showToast("❌ Network error. Check your connection and try again.");
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        }
      });
    }

  
    // -------------------------------------
    // 5) Footer year auto-update
    // -------------------------------------
    const footerP = document.querySelector(".site-footer p");
    if (footerP) {
      const year = new Date().getFullYear();
      footerP.innerHTML = `© ${year} Akinfoluhan Akinleye. Built with HTML &amp; CSS.`;
    }
  })();
  