document.addEventListener('DOMContentLoaded', function() {

    if (typeof translations === 'undefined') {
        console.error("Le fichier translations.js doit être chargé avant main.js");
        return;
    }

    const getStoredTheme = () => localStorage.getItem('theme') || 'light';
    const getStoredLang = () => localStorage.getItem('lang') || 'fr';

    const getTranslation = (lang, key) => {
        const pageKey = document.body.dataset.pageKey || 'home'; 
                         
        if (translations[lang]?.common?.[key]) return translations[lang].common[key];
        if (translations[lang]?.[pageKey]?.[key]) return translations[lang][pageKey][key];
        
        return null; 
    };

    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
    };

    const applyLang = (lang) => {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.getAttribute('data-translate-key');
            const translation = getTranslation(lang, key);
            if (translation !== null) {
                if (key.endsWith('_html')) el.innerHTML = translation;
                else if (el.tagName === 'META') el.content = translation;
                else if (el.tagName === 'BUTTON' && el.querySelector('svg')) {
                }
                else {
                    el.textContent = translation;
                }
            }
        });
    };

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
            { key: 'navTrading', href: `${ongletsPath}Trading.html` },
            { key: 'navNews', href: `${ongletsPath}news.html` }, 
            { key: 'navContact', href: `${ongletsPath}contact.html` },
            { key: 'navCourses', href: `${ongletsPath}cours.html`, isButton: true }, 
        ];
        
        let pathParts = window.location.pathname.split('/');
        let currentPageName = pathParts.pop() || 'index.html'; 

        const mainNavLinks = navLinks.filter(link => !link.isButton); 
        const buttonNavLink = navLinks.find(link => link.isButton); 

        let linksHtml = '';
        mainNavLinks.forEach(link => {
            let linkPageName = link.href.split('/').pop() || 'index.html';
            const isActive = (linkPageName === currentPageName) ? 'class="active"' : '';
            const linkText = getTranslation(lang, link.key) || link.key; // Fallback sur la clé si traduction manque
            linksHtml += `<li><a data-target="${link.href}" ${isActive} data-translate-key="${link.key}">${linkText}</a></li>`;
        });
        
        const coursesText = buttonNavLink ? (getTranslation(lang, buttonNavLink.key) || buttonNavLink.key) : '';
        const coursesHref = buttonNavLink ? buttonNavLink.href : '#';
        const coursesKey = buttonNavLink ? buttonNavLink.key : '';
        
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
                    <a data-target="${coursesHref}" class="btn-courses" data-translate-key="${coursesKey}">${coursesText}</a>
                    <button id="lang-toggle" class="control-btn" title="Change language">${lang === 'fr' ? 'EN' : 'FR'}</button>
                    <button id="theme-toggle" class="control-btn" title="Change theme">
                        <svg class="icon-moon" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                        ${newSunSvg}
                    </button>
                </div>
            </nav>`;

        const footerRightsText = getTranslation(lang, 'footerRights') || 'Finteker.fr - All rights reserved.';
        const footerLegalText = getTranslation(lang, 'footerLegal') || 'Legal Notice';
        footer.innerHTML = `
            <div class="footer-content-wrapper">
                <p>&copy; ${new Date().getFullYear()} <span data-translate-key="footerRights">${footerRightsText}</span></p>
                <div class="footer-links">
                    <a id="open-legal-modal" data-translate-key="footerLegal">${footerLegalText}</a>
                </div>
            </div>`;
    };
    
    const setupEventListeners = () => {
        const legalModal = document.getElementById('legal-modal');
        const closeModalBtn = document.getElementById('close-legal-modal');
        const contactForm = document.getElementById('contact-form');
        const formStatus = document.getElementById('form-status');
        const currentLang = getStoredLang();

        document.body.addEventListener('click', function(event) {
            const target = event.target;
            const internalLink = target.closest('a[data-target]');
            const themeToggle = target.closest('#theme-toggle');
            const langToggle = target.closest('#lang-toggle');
            const openModalBtn = target.closest('#open-legal-modal');

            if (internalLink && !internalLink.classList.contains('disabled')) { 
                event.preventDefault(); 
                window.location.href = internalLink.getAttribute('data-target'); 
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
            if (openModalBtn) { 
                legalModal?.classList.add('open'); 
            }
        });
        
        closeModalBtn?.addEventListener('click', () => legalModal?.classList.remove('open'));
        legalModal?.addEventListener('click', (event) => { if (event.target === legalModal) legalModal?.classList.remove('open'); });

        contactForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const sendingKey = getTranslation(currentLang, 'status_sending') || 'Sending...';
            const successKey = getTranslation(currentLang, 'status_success') || 'Success!';
            const errorKey = getTranslation(currentLang, 'status_error') || 'Error.';
            
            formStatus.textContent = sendingKey;
            formStatus.className = ''; 
            try {
                const response = await fetch(contactForm.action, { method: 'POST', body: new FormData(contactForm), headers: { 'Accept': 'application/json' } });
                if (response.ok) { 
                    formStatus.textContent = successKey; 
                    formStatus.classList.add('success'); 
                    contactForm.reset(); 
                } else { 
                    throw new Error('Network response was not ok.'); 
                }
            } catch (error) { 
                formStatus.textContent = errorKey; 
                formStatus.classList.add('error'); 
            }
        });
    };

    const setupScrollAnimations = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { 
                    entry.target.classList.add('visible'); 
                    observer.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => {
             if (!el.classList.contains('reveal')) {
                 el.classList.add('reveal');
             }
            observer.observe(el);
        });
    };

    const currentTheme = getStoredTheme();
    const currentLang = getStoredLang();
    
    let pageKey = 'home';
    const path = window.location.pathname;
    if (path.includes('/cours.html')) pageKey = 'courses';
    else if (path.includes('/contact.html')) pageKey = 'contact';
    else if (path.includes('/news.html')) pageKey = 'news';
    else if (path.includes('/m&a.html')) pageKey = 'ma';
    else if (path.includes('/trading.html')) pageKey = 'trading'; 
    else if (path.includes('/backtester.html')) pageKey = 'backtester'; 
    else if (path.includes('/dcf.html')) pageKey = 'dcf'; 
    
    document.body.dataset.pageKey = pageKey;

    applyTheme(currentTheme);
    buildLayout(currentLang); 
    applyLang(currentLang);   
    setupEventListeners();
    setupScrollAnimations();
});