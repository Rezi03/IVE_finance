document.addEventListener('DOMContentLoaded', () => {
  if (typeof translations === 'undefined') {
    console.error("Le fichier translations.js doit être chargé avant news.js");
    return;
  }

  const newsContainer = document.getElementById('news-list-container');
  const statusEl = document.getElementById('news-status');
  const searchInput = document.getElementById('news-search');
  const sortSelect = document.getElementById('news-sort');

  if (!newsContainer || !statusEl || !searchInput || !sortSelect) {
    return;
  }

  const currentLang = localStorage.getItem('lang') || 'fr';
  const t = (key) => translations[currentLang]?.news?.[key] || key;

  let allArticles = []; // Pour stocker tous les articles chargés

  const renderNews = (articlesToRender) => {
    // Affiche le message "aucun résultat" si la liste est vide
    if (!articlesToRender || articlesToRender.length === 0) {
      newsContainer.innerHTML = `<p>${t('noResults')}</p>`;
      return;
    }

    // Construit le HTML pour chaque article
    const newsHtml = articlesToRender.map(article => `
      <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="news-article">
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <div class="news-meta">
          <span class="source">${t('source')} ${article.source.name}</span>
          <span class="date">${new Date(article.publishedAt).toLocaleDateString(currentLang)}</span>
        </div>
      </a>
    `).join('');

    newsContainer.innerHTML = newsHtml;
  };

  const updateView = () => {
    let filteredArticles = [...allArticles];
    const searchTerm = searchInput.value.toLowerCase();

    // 1. Applique le filtre de recherche
    if (searchTerm) {
      filteredArticles = filteredArticles.filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.description.toLowerCase().includes(searchTerm)
      );
    }

    // 2. Applique le tri
    const sortBy = sortSelect.value;
    if (sortBy === 'recent') {
      filteredArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (sortBy === 'oldest') {
      filteredArticles.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
    }

    // Affiche le résultat final
    renderNews(filteredArticles);
  };

  const loadNews = async () => {
    const newsFile = `../assets/api/news_${currentLang}.json`;
    try {
      const response = await fetch(newsFile);
      if (!response.ok) {
        throw new Error('Le fichier d\'actualités n\'a pas pu être chargé.');
      }
      const data = await response.json();
      allArticles = data.articles || []; // Stocke les articles
      updateView(); // Affiche la vue initiale (tout trié par "plus récents")
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error);
      statusEl.textContent = t('error');
      newsContainer.innerHTML = '';
      newsContainer.appendChild(statusEl);
    }
  };

  // Ajoute les écouteurs pour la recherche et le tri
  searchInput.addEventListener('input', updateView);
  sortSelect.addEventListener('change', updateView);

  // Lance le chargement initial des actualités
  loadNews();
});