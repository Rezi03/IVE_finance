document.addEventListener('DOMContentLoaded', () => {
  const translations = {
    fr: {
      pageTitle: "Finteker.fr - Outils Financiers & Intelligence",
      metaDescription: "Plateforme d'outils financiers en temps réel : M&A Tracker, Portfolio Backtester, DCF Lab, Trading, Actualités et Banking Intelligence.",
      heroTitle: "Outils Financiers Pour les Professionnels",
      heroSubtitle: "Analyses, backtesting et veille stratégique en temps réel.",
      cardMaTitle: "M&A Tracker",
      cardMaDesc: "Suivez les dernières transactions de fusions et acquisitions avec des données en temps réel.",
      cardBacktesterTitle: "Portfolio Backtester",
      cardBacktesterDesc: "Analysez le risque crédit et la performance de portefeuilles obligataires.",
      cardDcfTitle: "DCF Lab",
      cardDcfDesc: "Modélisez des valorisations d'entreprise avec des analyses de sensibilité complètes.",
      cardTradingTitle: "Trading",
      cardTradingDesc: "Outils et analyses de trading en temps réel pour optimiser vos stratégies de marché.",
      cardBankingTitle: "Banking Intelligence",
      cardBankingDesc: "Un dashboard de veille concurrentielle sur le secteur bancaire (via Streamlit).",
      cardCoursesTitle: "Cours",
      cardCoursesDesc: "Ressources et modules d'apprentissage sur la finance de marché.",
      cardContactTitle: "Contact",
      cardContactDesc: "Pour toute question ou proposition, n'hésitez pas à nous contacter.",
      cardButtonLaunch: "Lancer l'outil",
      cardButtonSoon: "Bientôt disponible",
      cardButtonConsult: "Consulter",
      cardButtonWrite: "Nous écrire",
      footerRights: "Finteker.fr - Tous droits réservés.",
      footerLegal: "Mentions Légales",
      navHome: "Accueil",
      navMa: "M&A Tracker",
      navBacktester: "Backtester",
      navDcf: "DCF Lab",
      navNews: "Actualités",
      navTrading: "Trading",
      navCourses: "Cours",
      navContact: "Contact",
      legalHeader: "Mentions Légales",
      legalEditorTitle: "Éditeur du site",
      legalEditorContent_html: "Nom de l'entreprise / Votre Nom<br>Adresse...<br>Email...<br>Téléphone...",
      legalHostingTitle: "Hébergement",
      legalHostingContent_html: "Ce site est hébergé par GitHub Pages.<br>GitHub, Inc.<br>88 Colin P Kelly Jr St<br>San Francisco, CA 94107<br>United States",
      legalIpTitle: "Propriété intellectuelle",
      legalIpContent: "L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés.",
      contactPageTitle: "Contact - Finteker.fr",
      contactH1: "Nous Contacter",
      contactSub: "Une question, une proposition ou une envie de collaborer ? Envoyez-nous un message.",
      contactInfoTitle: "Entrer en contact",
      contactInfoDesc: "Nous répondons généralement sous 24 heures ouvrées. Remplissez le formulaire et notre équipe vous recontactera.",
      contactLocation: "Reims, France",
      contactFormName: "Nom",
      contactFormEmail: "Email",
      contactFormMessage: "Message",
      contactFormBtnSend: "Envoyer le Message",
      status_sending: "Envoi en cours…",
      status_success: "Merci ! Votre message a bien été envoyé.",
      status_error: "Une erreur est survenue. Vérifiez les champs et réessayez.",
      status_error_network: "Impossible d’envoyer le message (problème de réseau).",
      maPageTitle: "Transactions M&A - Finteker.fr",
      maH1: "Transactions M&A",
      maSub: "Recherche rapide, filtres par date, onglets, tri et pagination.",
      maTabLatest: "Récentes",
      maTabAcquirer: "Acquéreur",
      maLabelStart: "Date de début",
      maLabelEnd: "Date de fin",
      maLabelSearch: "Recherche (Acquéreur / Cible / Ticker)",
      maLabelAcquirer: "Acquéreur",
      maOptionAll: "Tous les acquéreurs",
      maBtnApply: "Appliquer",
      maShowing: "Affichage de",
      maOf: "sur",
      maRows: "lignes",
      maLastUpdate: "Dernière MAJ",
      maThDate: "Date",
      maThAcquirer: "Acquéreur",
      maThTickerA: "Ticker Acquéreur",
      maThTarget: "Cible",
      maThTickerT: "Ticker Cible",
      maThLink: "Lien SEC",
      maLoading: "Chargement...",
      maNoData: "Aucune donnée pour la vue/filtres actuels",
      maError: "Erreur de chargement des données",
      newsPageTitle: "Actualités Financières - Finteker.fr",
      newsMetaDescription: "Actualités financières en temps réel, filtres par secteur et tri par date.",
      newsH1: "Actualités Financières",
      newsSub: "Veille stratégique, analyse des marchés et tendances clés en temps réel.",
      newsLabelSector: "Filtrer par secteur:",
      newsOptionAll: "Tous les secteurs",
      newsLabelSort: "Trier par:",
      newsSortLatest: "Plus récentes",
      newsSortRelevance: "Pertinence",
      newsBtnApply: "Appliquer",
      newsLoading: "Chargement des actualités...",
      newsError: "Erreur lors du chargement des actualités. (Limite API Alpha Vantage atteinte ou clé invalide.)",
      newsNoData: "Aucune actualité trouvée pour ces filtres.",
      newsOptionTechnology: "Technologie",
      newsOptionFinance: "Finance",
      newsOptionEnergy: "Énergie",
      newsOptionHealthcare: "Santé",
      newsOptionRealEstate: "Immobilier"
    },
    en: {
      pageTitle: "Finteker.fr - Financial Tools & Intelligence",
      metaDescription: "Real-time financial tools platform: M&A Tracker, Portfolio Backtester, DCF Lab, Trading, News, and Banking Intelligence.",
      heroTitle: "Financial Tools For Professionals",
      heroSubtitle: "Real-time analysis, backtesting, and strategic intelligence.",
      cardMaTitle: "M&A Tracker",
      cardMaDesc: "Track the latest merger and acquisition transactions with real-time data.",
      cardBacktesterTitle: "Portfolio Backtester",
      cardBacktesterDesc: "Analyze credit risk and performance of bond portfolios.",
      cardDcfTitle: "DCF Lab",
      cardDcfDesc: "Model company valuations with comprehensive sensitivity analysis.",
      cardTradingTitle: "Trading",
      cardTradingDesc: "Real-time trading tools and analysis to optimize your market strategies.",
      cardBankingTitle: "Banking Intelligence",
      cardBankingDesc: "A competitive intelligence dashboard for the banking sector (via Streamlit).",
      cardCoursesTitle: "Courses",
      cardCoursesDesc: "Resources and learning modules on market finance.",
      cardContactTitle: "Contact",
      cardContactDesc: "For any questions or proposals, do not hesitate to contact us.",
      cardButtonLaunch: "Launch Tool",
      cardButtonSoon: "Coming Soon",
      cardButtonConsult: "Consult",
      cardButtonWrite: "Write to Us",
      footerRights: "Finteker.fr - All rights reserved.",
      footerLegal: "Legal Notice",
      navHome: "Home",
      navMa: "M&A Tracker",
      navBacktester: "Backtester",
      navDcf: "DCF Lab",
      navNews: "News",
      navTrading: "Trading",
      navCourses: "Courses",
      navContact: "Contact",
      legalHeader: "Legal Notice",
      legalEditorTitle: "Site Editor",
      legalEditorContent_html: "Company Name / Your Name<br>Address...<br>Email...<br>Phone...",
      legalHostingTitle: "Hosting",
      legalHostingContent_html: "This site is hosted by GitHub Pages.<br>GitHub, Inc.<br>88 Colin P Kelly Jr St<br>San Francisco, CA 94107<br>United States",
      legalIpTitle: "Intellectual Property",
      legalIpContent: "This entire site is subject to French and international legislation on copyright and intellectual property. All reproduction rights are reserved.",
      contactPageTitle: "Contact - Finteker.fr",
      contactH1: "Contact Us",
      contactSub: "A question, a proposal or a collaboration idea? Send us a message.",
      contactInfoTitle: "Get in touch",
      contactInfoDesc: "We usually reply within 24 business hours. Fill out the form and our team will get back to you.",
      contactLocation: "Reims, France",
      contactFormName: "Name",
      contactFormEmail: "Email",
      contactFormMessage: "Message",
      contactFormBtnSend: "Send Message",
      status_sending: "Sending…",
      status_success: "Thanks! Your message has been sent.",
      status_error: "Something went wrong. Please check the fields and try again.",
      status_error_network: "Couldn’t send the message (network issue).",
      newsPageTitle: "Financial News - Finteker.fr",
      newsMetaDescription: "Real-time financial news, filter by topic and sort by date.",
      newsH1: "Financial News",
      newsSub: "Strategic intelligence, market analysis, and key trends in real-time.",
      newsLabelSector: "Filter by topic:",
      newsOptionAll: "All Topics",
      newsLabelSort: "Sort by:",
      newsSortLatest: "Latest",
      newsSortRelevance: "Relevance",
      newsBtnApply: "Apply",
      newsLoading: "Loading news...",
      newsError: "Error loading news. (Alpha Vantage API limit reached or invalid key.)",
      newsNoData: "No news found for these filters.",
      newsOptionTechnology: "Technology",
      newsOptionFinance: "Finance",
      newsOptionEnergy: "Energy",
      newsOptionHealthcare: "Healthcare",
      newsOptionRealEstate: "Real Estate"
    }
  }

  const getStoredTheme = () => localStorage.getItem('theme') || 'light';
  const getStoredLang = () => localStorage.getItem('lang') || 'fr';
  const applyTheme = (theme) => document.documentElement.setAttribute('data-theme', theme);
  const applyLang = (lang) => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-translate-key]').forEach(el => {
      const key = el.getAttribute('data-translate-key');
      const translation = translations[lang]?.[key];
      if (translation) {
        if (key.endsWith('_html')) el.innerHTML = translation;
        else if (el.tagName === 'META') el.content = translation;
        else el.textContent = translation;
      }
    });
  }

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
      linksHtml += `<li><a data-target="${link.href}" ${isActive}>${translations[lang][link.key]}</a></li>`;
    });

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
          ${bottomNavLink ? `<a data-target="${bottomNavLink.href}" class="btn-courses">${translations[lang][bottomNavLink.key]}</a>` : ''}
          <button id="lang-toggle" class="control-btn" title="Changer la langue">${lang === 'fr' ? 'EN' : 'FR'}</button>
          <button id="theme-toggle" class="control-btn" title="Changer le thème">
            <svg class="icon-moon" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            ${newSunSvg}
          </button>
        </div>
      </nav>`;

    footer.innerHTML = `
      <div class="footer-content-wrapper">
        <p>&copy; ${new Date().getFullYear()} <span data-translate-key="footerRights">${translations[lang]['footerRights']}</span></p>
        <div class="footer-links">
          <a id="open-legal-modal">${translations[lang]['footerLegal']}</a>
        </div>
      </div>`;
  }

  const setupEventListeners = () => {
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
  }

  const setupScrollAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  const currentTheme = getStoredTheme();
  const currentLang = getStoredLang();
  applyTheme(currentTheme);
  buildLayout(currentLang);
  applyLang(currentLang);
  setupEventListeners();
  setupScrollAnimations();

  const form = document.getElementById('contact-form');
  const statusElForm = document.getElementById('form-status');
  if (form && statusElForm) {
    const t = (key) => translations[currentLang][key] || key;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusElForm.textContent = t('status_sending');
      statusElForm.style.color = '#FFA500';
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      try {
        const data = new FormData(form);
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          statusElForm.textContent = t('status_success');
          statusElForm.style.color = '#4CAF50';
          form.reset();
          setTimeout(() => statusElForm.textContent = '', 4000);
        } else {
          statusElForm.textContent = t('status_error');
          statusElForm.style.color = '#F44336';
        }
      } catch {
        statusElForm.textContent = t('status_error_network');
        statusElForm.style.color = '#F44336';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  // --- Logic for News Page (news.html) ---
  const newsListEl = document.getElementById('news-list');
  const statusElNews = document.getElementById('news-status');

  if (newsListEl && statusElNews) {
    const API_KEY = '75O243WCTQ424P1O';
    const t = (key) => translations[currentLang][key] || key;

    const formatTime = (time) => {
      if (!time) return '';
      const year = time.substring(0, 4);
      const month = time.substring(4, 6) - 1;
      const day = time.substring(6, 8);
      const hour = time.substring(9, 11);
      const minute = time.substring(11, 13);
      const date = new Date(Date.UTC(year, month, day, hour, minute));
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString(currentLang, options);
    };

    const topicMap = {
      'Technology': 'technology',
      'Finance': 'financial_markets',
      'Energy': 'energy',
      'Healthcare': 'life_sciences',
      'Real Estate': 'real_estate_and_construction',
      '': 'financial_markets' // Fallback pour "Tous les secteurs"
    };

    const fetchNews = async (topicKey, sort) => {
      statusElNews.textContent = t('newsLoading');
      statusElNews.className = 'status-message';
      newsListEl.innerHTML = '';

      const apiTopic = topicMap[topicKey] || 'financial_markets';
      const sortValue = sort === 'latest' ? 'LATEST' : 'RELEVANCE';
      const url = `https://taupe-puffpuff-a81143.netlify.app/.netlify/functions/getNews`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data.Note || data["Error Message"]) {
          console.error("Alpha Vantage API Error:", data);
          statusElNews.textContent = t('newsError');
          statusElNews.classList.add('error');
          return;
        }

        if (!data.feed || data.feed.length === 0) {
          statusElNews.textContent = t('newsNoData');
          return;
        }

        statusElNews.textContent = ''; // Succès, on efface le message

        data.feed.forEach(article => {
          const articleEl = document.createElement('a');
          articleEl.className = 'news-article';
          articleEl.href = article.url;
          articleEl.target = '_blank';
          articleEl.rel = 'noopener noreferrer';

          let summary = article.summary || '';
          if (summary.length > 200) {
            summary = summary.substring(0, 200) + '...';
          }

          articleEl.innerHTML = `
            <h3>${article.title}</h3>
            <p>${summary}</p>
            <div class="news-meta">
              <span class="source">${article.source}</span>
              <span class="date">${formatTime(article.time_published)}</span>
            </div>
          `;
          newsListEl.appendChild(articleEl);
        });
      } catch (error) {
        console.error('Error fetching news:', error);
        statusElNews.textContent = t('newsError') + ' (Network or fetch failed)';
        statusElNews.classList.add('error');
      }
    };

    const applyFilters = () => {
      const topic = document.getElementById('sector-filter').value || '';
      const sort = document.getElementById('sort-filter').value;
      fetchNews(topic, sort);
    };

    const applyBtn = document.getElementById('apply-filters');
    const sectorFilter = document.getElementById('sector-filter');
    const sortFilter = document.getElementById('sort-filter');

    if (applyBtn) applyBtn.addEventListener('click', applyFilters);
    if (sectorFilter) sectorFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);

    // Lancement initial au chargement de la page
    applyFilters();
  }
});