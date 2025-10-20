document.addEventListener('DOMContentLoaded', () => {
  if (typeof translations === 'undefined') return;

  const newsListEl = document.getElementById('news-list');
  const statusElNews = document.getElementById('news-status');

  if (newsListEl && statusElNews) {
    const currentLang = localStorage.getItem('lang') || 'fr';
    const t = (key) => translations[currentLang]?.news?.[key] || key;

    const formatTime = (isoString) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString(currentLang, options);
    };

    const fetchNewsFromFile = async () => {
      statusElNews.textContent = t('loading');
      newsListEl.innerHTML = '';

      // On lit le fichier JSON local généré par le robot
      const url = '../data/news.json';

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Fichier news.json introuvable.");
        
        const articles = await response.json();

        if (!articles || articles.length === 0) {
          statusElNews.textContent = t('noData');
          return;
        }

        statusElNews.textContent = '';

        articles.forEach(article => {
          // ... (le reste du code pour afficher l'article est identique)
          const articleEl = document.createElement('a');
          articleEl.className = 'news-article';
          articleEl.href = article.url;
          articleEl.target = '_blank';
          articleEl.rel = 'noopener noreferrer';
          let summary = article.description || '';
          if (summary.length > 200) summary = summary.substring(0, 200) + '...';
          articleEl.innerHTML = `
            <h3>${article.title}</h3>
            <p>${summary}</p>
            <div class="news-meta">
              <span class="source">${article.source.name}</span>
              <span class="date">${formatTime(article.publishedAt)}</span>
            </div>`;
          newsListEl.appendChild(articleEl);
        });
      } catch (error) {
        console.error('Erreur:', error);
        statusElNews.textContent = t('error');
        statusElNews.classList.add('error');
      }
    };
    
    // On désactive les filtres car tout est géré par le robot maintenant
    document.getElementById('sector-filter').disabled = true;
    document.getElementById('sort-filter').disabled = true;
    document.getElementById('apply-filters').disabled = true;

    fetchNewsFromFile();
  }
});