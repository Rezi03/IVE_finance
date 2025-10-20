document.addEventListener('DOMContentLoaded', () => {
  if (typeof translations === 'undefined') {
    console.error("Le fichier translations.js doit être chargé avant news.js");
    return;
  }

  const newsContainer = document.getElementById('news-list-container');
  const statusEl = document.getElementById('news-status');

  if (!newsContainer || !statusEl) {
    return;
  }

  const currentLang = localStorage.getItem('lang') || 'fr';
  const t = (key) => translations[currentLang]?.news?.[key] || key;

  const renderNews = (articles) => {
    if (!articles || articles.length === 0) {
      statusEl.textContent = t('error');
      newsContainer.innerHTML = '';
      newsContainer.appendChild(statusEl);
      return;
    }

    const newsHtml = articles.map(article => `
      <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="news-article">
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <div class="news-meta">
          <span class="source">${t('source')} ${article.source.name}</span>
          <span class="date">${new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
      </a>
    `).join('');

    newsContainer.innerHTML = newsHtml;
  };

  const loadNews = async () => {
    try {
      const response = await fetch('../assets/api/news.json');

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      renderNews(data.articles);

    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error);
      statusEl.textContent = t('error');
      newsContainer.innerHTML = '';
      newsContainer.appendChild(statusEl);
    }
  };

  loadNews();
});