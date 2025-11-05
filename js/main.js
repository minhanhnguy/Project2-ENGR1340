// ========== MOBILE NAV BURGER ==========
(() => {
  const navbar = document.querySelector('.navbar');
  const menuBtn = document.getElementById('mobileMenuBtn');
  const primaryNav = document.getElementById('primary-nav');

  if (!navbar || !menuBtn || !primaryNav) return;

  const closeMenu = () => {
    navbar.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    const willOpen = !navbar.classList.contains('open');
    navbar.classList.toggle('open', willOpen);
    menuBtn.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) {
      // focus first link for convenience
      const firstLink = primaryNav.querySelector('a');
      firstLink && firstLink.focus();
    }
  };

  menuBtn.addEventListener('click', toggleMenu);

  // Close when clicking a link (typical mobile UX)
  primaryNav.addEventListener('click', (e) => {
    if (e.target instanceof HTMLElement && e.target.tagName === 'A') closeMenu();
  });

  // Close with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close if resized back to desktop
  const MQ = window.matchMedia('(min-width: 769px)');
  MQ.addEventListener ? MQ.addEventListener('change', (ev) => { if (ev.matches) closeMenu(); })
                      : MQ.addListener && MQ.addListener((ev) => { if (ev.matches) closeMenu(); });
})();
