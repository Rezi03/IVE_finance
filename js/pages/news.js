// /js/pages/news.js

document.addEventListener('DOMContentLoaded', () => {
  if (typeof translations === 'undefined') {
    console.error("Le fichier translations.js doit être chargé avant news.js");
    return;
  }

  const newsListEl = document.getElementById('news-list');
  const statusElNews = document.getElementById('news-status');

  if (newsListEl && statusElNews) {
    // Votre clé API est ici
    const GNEWS_API_KEY = 'b9772b572dc4c07e5430a0dcd1f63287'; 
    
    const currentLang = localStorage.getItem('lang') || 'fr';
    const t = (key) => translations[currentLang]?.news?.[key] || key;

    const formatTime = (isoString) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString(currentLang, options);
    };

    const fetchNews = async (topic) => {
      statusElNews.textContent = t('loading');
      statusElNews.className = 'status-message';
      newsListEl.innerHTML = '';

      // ---- Le bloc 'if' qui posait problème a été supprimé ----
      
      const topicMap = {
        'Technology': 'technologie',
        'Finance': 'bourse',
        'Energy': 'énergie',
        'Healthcare': 'santé',
        'Real Estate': 'immobilier',
        '': 'finance' // Sujet par défaut
      };
      
      const query = topicMap[topic] || 'finance';
      
      const langParam = (currentLang === 'fr') ? 'fr' : 'en';
      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${langParam}&country=fr,us&max=10&apikey=${GNEWS_API_KEY}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();

        if (!data.articles || data.articles.length === 0) {
          statusElNews.textContent = t('noData');
          return;
        }

        statusElNews.textContent = '';

        data.articles.forEach(article => {
          const articleEl = document.createElement('a');
          articleEl.className = 'news-article';
          articleEl.href = article.url;
          articleEl.target = '_blank';
          articleEl.rel = 'noopener noreferrer';

          let summary = article.description || '';
          if (summary.length > 200) {
            summary = summary.substring(0, 200) + '...';
          }

          articleEl.innerHTML = `
            <h3>${article.title}</h3>
            <p>${summary}</p>
            <div class="news-meta">
              <span class="source">${article.source.name}</span>
              <span class="date">${formatTime(article.publishedAt)}</span>
            </div>
          `;
          newsListEl.appendChild(articleEl);
        });
      } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error);
        statusElNews.textContent = t('error');
        statusElNews.classList.add('error');
      }
    };

    const applyFilters = () => {
      const topic = document.getElementById('sector-filter').value || '';
      fetchNews(topic);
    };
    
    // GNews ne gère pas le tri par pertinence, donc ce filtre est désactivé.
    document.getElementById('sort-filter').disabled = true;

    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('sector-filter').addEventListener('change', applyFilters);

    applyFilters();
  }
});