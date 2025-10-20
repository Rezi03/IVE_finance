document.addEventListener('DOMContentLoaded', () => {
  if (typeof translations === 'undefined') {
    console.error("Le fichier translations.js doit être chargé avant main.js");
    return;
  }

  const getStoredTheme = () => localStorage.getItem('theme') || 'light';
  const getStoredLang = () => localStorage.getItem('lang') || 'fr';

  const getTranslation = (lang, key) => {
    const pageName = document.body.dataset.page || 'home'; // 'home' par défaut

    // 1. Chercher dans les traductions communes
    if (translations[lang]?.common?.[key]) {
      return translations[lang].common[key];
    }
    // 2. Chercher dans les traductions de la page spécifique
    if (translations[lang]?.[pageName]?.[key]) {
      return translations[lang][pageName][key];
    }
    // 3. Si rien n'est trouvé, retourner null pour éviter "undefined"
    return null; 
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  // ---- applyLang CORRIGÉ ----
  const applyLang = (lang) => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-translate-key]').forEach(el => {
      const key = el.getAttribute('data-translate-key');
      const translation = getTranslation(lang, key); // Utilise notre nouvelle fonction
      if (translation) {
        if (key.endsWith('_html')) el.innerHTML = translation;
        else if (el.tagName === 'META') el.content = translation;
        else el.textContent = translation;
      }
    });
  };

  // ---- buildLayout CORRIGÉ ----
  const buildLayout = (lang) => {
    const header = document.getElementById('main-header');
    const footer = document.getElementById('main-footer');
    if (!header || !footer) return;

    const isIndexPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html');
    const basePath = isIndexPage ? '' : '../';
    const ongletsPath = isIndexPage ? 'onglets/' : '';
    const faviconPath = isIndexPage ? 'assets/img/favicon.png' : '../assets/img/favicon.png';

    const navLinks = [
      { key: 'navHome', href: `${basePath}index.html` },
      { key: 'navMa', href: `${ongletsPath}m&a.html` },
      { key: 'navBacktester', href: `${ongletsPath}backtester.html` },
      { key: 'navDcf', href: `${ongletsPath}dcf.html` },
      { key: 'navTrading', href: `${basePath}trading.html` },
      { key: 'navNews', href: `${ongletsPath}news.html` },
      { key: 'navContact', href: `${ongletsPath}contact.html` },
      { key: 'navCourses', href: `${ongletsPath}cours.html`, isBottom: true },
    ];

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const mainNavLinks = navLinks.filter(link => !link.isBottom);
    const bottomNavLink = navLinks.find(link => link.isBottom);

    let linksHtml = '';
    mainNavLinks.forEach(link => {
      const linkPage = link.href.split('/').pop() || 'index.html';
      const currentPageName = currentPage.replace(/%26/g, '&');
      const linkPageName = linkPage.replace(/%26/g, '&');
      const isActive = linkPageName === currentPageName ? 'class="active"' : '';
      // CORRECTION ICI : on cherche dans la section 'common'
      const linkText = translations[lang].common[link.key]; 
      linksHtml += `<li><a data-target="${link.href}" ${isActive}>${linkText}</a></li>`;
    });
    
    // CORRECTION ICI : on cherche dans la section 'common'
    const coursesText = bottomNavLink ? translations[lang].common[bottomNavLink.key] : '';

    const newSunSvg = '<svg class="icon-sun" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';

    header.innerHTML = `
      <nav>
        <a data-target="${basePath}index.html" class="logo">
          <img src="${faviconPath}" alt="Finteker Favicon" class="logo-icon">
          <div class="logo-text">
            <span class="logo-title">FINTEKER</span>
            <span class="logo-subtitle">Financial Intelligence</span>
          </div>
        </a>
        <ul class="nav-links">${linksHtml}</ul>
        <div class="header-controls">
          ${bottomNavLink ? `<a data-target="${bottomNavLink.href}" class="btn-courses">${coursesText}</a>` : ''}
          <button id="lang-toggle" class="control-btn" title="Changer la langue">${lang === 'fr' ? 'EN' : 'FR'}</button>
          <button id="theme-toggle" class="control-btn" title="Changer le thème">
            <svg class="icon-moon" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            ${newSunSvg}
          </button>
        </div>
      </nav>`;

    footer.innerHTML = `
      <div class="footer-content-wrapper">
        <p>&copy; ${new Date().getFullYear()} <span data-translate-key="footerRights">${translations[lang].common['footerRights']}</span></p>
        <div class="footer-links">
          <a id="open-legal-modal">${translations[lang].common['footerLegal']}</a>
        </div>
      </div>`;
  };

  const setupEventListeners = () => {
    // ... votre code setupEventListeners reste identique
    const modal = document.getElementById('legal-modal');
    const closeModalBtn = document.getElementById('close-legal-modal');
    document.body.addEventListener('click', (event) => {
      const target = event.target;
      const link = target.closest('a[data-target]');
      const themeToggle = target.closest('#theme-toggle');
      const langToggle = target.closest('#lang-toggle');
      const openModalBtn = target.closest('#open-legal-modal');
      if (link) {
        event.preventDefault();
        const targetUrl = link.getAttribute('data-target');
        if (targetUrl) window.location.href = targetUrl;
      }
      if (themeToggle) {
        const newTheme = getStoredTheme() === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
      }
      if (langToggle) {
        const newLang = getStoredLang() === 'fr' ? 'en' : 'fr';
        localStorage.setItem('lang', newLang);
        location.reload();
      }
      if (openModalBtn && modal) modal.classList.add('open');
    });
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => modal.classList.remove('open'));
    if (modal) modal.addEventListener('click', (event) => { if (event.target === modal) modal.classList.remove('open') });
  };

  const setupScrollAnimations = () => {
    // ... votre code setupScrollAnimations reste identique
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  };

  // Initialisation du site
  const currentTheme = getStoredTheme();
  const currentLang = getStoredLang();
  applyTheme(currentTheme);
  buildLayout(currentLang);
  applyLang(currentLang);
  setupEventListeners();
  setupScrollAnimations();
});