
(function () {
  "use strict";

  /* ============================================================
     CONFIG — change these if needed
  ============================================================ */
  const WORK_EMAIL      = "pawangrover904@gmail.com";  // where messages arrive
  const WHATSAPP_NUMBER = "918595256390";              // country code + number, no +

  /* ============================================================
     Header / nav
  ============================================================ */
  const header = document.getElementById("header");
  const toTop  = document.getElementById("toTop");

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 30);
    toTop.classList.toggle("show", y > 500);
    setActiveLink();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger   = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");

  burger.addEventListener("click", function () {
    const open = navLinks.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });

  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  const sections = Array.from(document.querySelectorAll("section[id]"));
  const links    = Array.from(navLinks.querySelectorAll("a"));

  function setActiveLink() {
    const pos = window.scrollY + 140;
    let current = sections[0] ? sections[0].id : "";
    sections.forEach(function (s) {
      if (s.offsetTop <= pos) current = s.id;
    });
    links.forEach(function (l) {
      l.classList.toggle("active", l.getAttribute("href") === "#" + current);
    });
  }

  /* ============================================================
     Typewriter
  ============================================================ */
  const roles = [
    "responsive websites",
    "MERN full stack apps",
    "REST APIs",
    "React.js interfaces",
    "AI-powered features"
  ];
  const typedEl = document.getElementById("typed");
  let rIndex = 0, cIndex = 0, deleting = false;

  function type() {
    const word = roles[rIndex];
    typedEl.textContent = deleting
      ? word.substring(0, cIndex--)
      : word.substring(0, cIndex++);

    let delay = deleting ? 45 : 85;

    if (!deleting && cIndex === word.length + 1) {
      deleting = true;
      delay = 1600;
    } else if (deleting && cIndex === 0) {
      deleting = false;
      rIndex = (rIndex + 1) % roles.length;
      delay = 320;
    }
    setTimeout(type, delay);
  }
  if (typedEl) type();

  /* ============================================================
     Reveal on scroll
  ============================================================ */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          const el = entry.target;
          setTimeout(function () { el.classList.add("visible"); }, i * 90);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ============================================================
     MODAL (Hire Me popup)
  ============================================================ */
  const modal = document.getElementById("hireModal");

  function openModal() {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    const first = modal.querySelector("input, textarea");
    if (first) setTimeout(function () { first.focus(); }, 320);
  }
  function closeModal() {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-open-modal]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });
  });

  document.querySelectorAll("[data-close-modal]").forEach(function (btn) {
    btn.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });

  /* ============================================================
     FORM SENDING
     Primary  : FormSubmit.co  → sends email silently
     Fallback : WhatsApp       → opens chat with prefilled text
  ============================================================ */

  function setStatus(el, type, msg) {
    if (!el) return;
    if (!type) {
      el.className = "form-status";
      el.textContent = "";
      return;
    }
    el.className = "form-status show " + type;
    el.textContent = msg;
  }

  function getFormData(form) {
    const q = function (n) {
      const el = form.querySelector('[name="' + n + '"]');
      return el ? el.value.trim() : "";
    };
    return {
      name:    q("name"),
      email:   q("email"),
      phone:   q("phone"),
      message: q("message")
    };
  }

  // Send via FormSubmit.co (AJAX — no page reload)
  function sendByEmail(data) {
    return fetch("https://formsubmit.co/ajax/" + WORK_EMAIL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name:    data.name,
        email:   data.email,
        phone:   data.phone || "Not provided",
        message: data.message,
        _subject: "🚀 New enquiry from " + data.name + " — Portfolio",
        _template: "table",
        _captcha: "false"
      })
    }).then(function (res) {
      if (!res.ok) throw new Error("Request failed");
      return res.json();
    });
  }

  // WhatsApp fallback with prefilled message
  function openWhatsApp(data) {
    const lines = [
      "Hi Pawan, I found your portfolio.",
      "",
      "Name: " + (data.name || "-"),
      "Email: " + (data.email || "-")
    ];
    if (data.phone) lines.push("Phone: " + data.phone);
    lines.push("", "Message:", data.message || "-");

    const url = "https://wa.me/" + WHATSAPP_NUMBER +
                "?text=" + encodeURIComponent(lines.join("\n"));

    window.open(url, "_blank");
  }

  function wireForm(form) {
    const statusEl = form.querySelector(".form-status");
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn ? submitBtn.innerHTML : "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const data = getFormData(form);

      // Basic validation
      if (!data.name || !data.email || !data.message) {
        setStatus(statusEl, "err", "Please fill in your name, email and message.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        setStatus(statusEl, "err", "Please enter a valid email address.");
        return;
      }

      if (submitBtn) {
        submitBtn.classList.add("loading");
        submitBtn.innerHTML = "Sending...";
      }
      setStatus(statusEl, "", "");

      sendByEmail(data)
        .then(function () {
          setStatus(statusEl, "ok",
            "✅ Message sent! I'll get back to you soon. Thank you 🙌");
          form.reset();

          // Auto-close modal after success
          if (form.closest("#hireModal")) {
            setTimeout(function () {
              closeModal();
              setStatus(statusEl, "", "");
            }, 2200);
          }
        })
        .catch(function () {
          setStatus(statusEl, "err",
            "⚠️ Couldn't send automatically. Opening WhatsApp so your message still reaches me...");
          setTimeout(function () { openWhatsApp(data); }, 900);
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.classList.remove("loading");
            submitBtn.innerHTML = originalHTML;
          }
        });
    });
  }

  // Wire up every contact form (modal + inline)
  document.querySelectorAll("form[data-contact]").forEach(wireForm);

  // "Chat on WhatsApp Instead" button inside the modal
  const waDirect = document.querySelector("[data-wa-direct]");
  if (waDirect) {
    waDirect.addEventListener("click", function () {
      const form = waDirect.closest("form");
      const data = form ? getFormData(form) : { name: "", email: "", phone: "", message: "" };
      openWhatsApp(data);
    });
  }

  /* ============================================================
     Back to top + year
  ============================================================ */
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  onScroll();
})();
