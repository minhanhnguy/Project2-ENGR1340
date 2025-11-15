// js/main.js

// ====== helpers ======
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// announce focus-visible outlines when using keyboard (you already have CSS for .keyboard-navigation)
(() => {
  let usingKeyboard = false;
  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      usingKeyboard = true;
      document.body.classList.add("keyboard-navigation");
    }
  });
  window.addEventListener("mousedown", () => {
    if (usingKeyboard) {
      usingKeyboard = false;
      document.body.classList.remove("keyboard-navigation");
    }
  });
})();

// ====== mobile left drawer (replaces old navbar.open toggle) ======
(() => {
  const btn = $("#mobileMenuBtn");
  const drawer = $("#mobileDrawer");
  const backdrop = $("#drawerBackdrop");
  const closeBtn = $("#closeDrawer");

  if (!btn || !drawer || !backdrop || !closeBtn) return;

  let lastFocused = null;
  const FOCUSABLE = "a,button,[href],[tabindex]:not([tabindex='-1'])";

  const openDrawer = () => {
    lastFocused = document.activeElement;
    drawer.classList.add("open");
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("show"));
    document.body.classList.add("drawer-open");
    btn.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    // focus first focusable inside
    const first = drawer.querySelector(FOCUSABLE);
    if (first) first.focus();
  };

  const closeDrawer = () => {
    drawer.classList.remove("open");
    backdrop.classList.remove("show");
    document.body.classList.remove("drawer-open");
    btn.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    setTimeout(() => (backdrop.hidden = true), 200);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    } else {
      btn.focus();
    }
  };

  // open/close interactions
  btn.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);

  // close on ESC + focus trap
  document.addEventListener("keydown", (e) => {
    if (!drawer.classList.contains("open")) return;

    if (e.key === "Escape") {
      closeDrawer();
    } else if (e.key === "Tab") {
      const nodes = Array.from(
        drawer.querySelectorAll(FOCUSABLE)
      ).filter((el) => !el.hasAttribute("disabled"));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });

  // clicking any link inside drawer closes it
  $$(".mobile-drawer a", drawer).forEach((a) =>
    a.addEventListener("click", closeDrawer)
  );

  // Optional: Login CTA inside drawer opens the same dialog
  const openLoginMobile = $("#openLogin_mobile");
  const loginDialog = /** @type {HTMLDialogElement|null} */ ($("#loginDialog"));
  if (openLoginMobile && loginDialog) {
    openLoginMobile.addEventListener("click", () => {
      closeDrawer();
      if (typeof loginDialog.showModal === "function") loginDialog.showModal();
      else loginDialog.setAttribute("open", "");
      document.body.classList.add("modal-open");
      // attempt to focus email field for convenience
      const email = $("#email", loginDialog);
      setTimeout(() => email && email.focus(), 0);
    });
  }
})();

// ====== login dialog logic ======
(() => {
  const dialog = /** @type {HTMLDialogElement|null} */ ($("#loginDialog"));
  const openBtn = $("#openLogin");
  const closeBtn = $("#closeLogin");
  if (!dialog || !openBtn || !closeBtn) return;

  // Create an aria-live region for unobtrusive status updates
  let live = document.createElement("div");
  live.id = "loginStatus";
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  dialog.appendChild(live);

  const email = $("#email", dialog);
  const password = $("#password", dialog);
  const form = $("form.project-form", dialog);
  const submitBtn = $("button[type='submit']", dialog);

  let lastFocused = null;

  // Disable background scroll when modal open
  const lockScroll = () => document.body.classList.add("modal-open");
  const unlockScroll = () => document.body.classList.remove("modal-open");

  const focusable = () =>
    $$(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      dialog
    ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));

  const trapFocus = (e) => {
    if (!dialog.open || e.key !== "Tab") return;
    const nodes = focusable();
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const goingBack = e.shiftKey;

    if (goingBack && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!goingBack && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  };

  const openDialog = () => {
    lastFocused = document.activeElement;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      // Very old browsers: fall back to open attribute
      dialog.setAttribute("open", "");
    }
    lockScroll();
    // Focus the email field for quick entry
    setTimeout(() => email?.focus(), 0);
  };

  const closeDialog = () => {
    if (dialog.open) dialog.close();
    dialog.removeAttribute("open");
    unlockScroll();
    live.textContent = "";
    // restore focus
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    } else {
      openBtn.focus();
    }
  };

  // Open / close bindings
  openBtn.addEventListener("click", openDialog);
  closeBtn.addEventListener("click", closeDialog);

  // Click outside (backdrop) closes
  dialog.addEventListener("click", (e) => {
    const rect = dialog.getBoundingClientRect();
    const inDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inDialog) closeDialog();
  });

  // ESC is handled by <dialog> automatically, but keep for safety
  dialog.addEventListener("cancel", (e) => {
    e.preventDefault(); // ensures consistent close handling
    closeDialog();
  });

  // Focus trapping
  dialog.addEventListener("keydown", trapFocus);

  // Simple form validity + demo submit
  const setSubmitting = (on) => {
    submitBtn.toggleAttribute("disabled", on);
    submitBtn.setAttribute("aria-disabled", String(on));
    submitBtn.textContent = on ? "Signing in…" : "Sign In";
  };

  const validate = () => {
    const ok = form.checkValidity();
    submitBtn.toggleAttribute("disabled", !ok);
    submitBtn.setAttribute("aria-disabled", String(!ok));
    return ok;
  };

  ["input", "change"].forEach((ev) => {
    form.addEventListener(ev, validate, { passive: true });
  });
  validate(); // initialize disabled state

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) {
      live.textContent = "Please fill out all required fields correctly.";
      return;
    }

    // DEMO ONLY: pretend to submit, then close dialog
    setSubmitting(true);
    live.textContent = "Signing you in…";
    try {
      await new Promise((r) => setTimeout(r, 700)); // fake latency
      live.textContent = "Signed in successfully.";
      closeDialog();
      // If you later wire to a backend, do redirects here.
      // window.location.href = "/StudentProfile.html";
    } catch {
      live.textContent = "Something went wrong. Please try again.";
    } finally {
      setSubmitting(false);
    }
  });
})();
