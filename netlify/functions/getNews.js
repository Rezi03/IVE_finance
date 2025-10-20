const cache = {
  data: null, 
  lastFetch: 0, 
};

const CACHE_DURATION = 3600 * 1000;

exports.handler = async function (event, context) {
  const currentTime = Date.now();

  if (cache.data && (currentTime - cache.lastFetch < CACHE_DURATION)) {
    console.log("Données servies depuis le cache.");
    return {
      statusCode: 200,
      body: JSON.stringify(cache.data),
    };
  }

  console.log("Cache expiré ou vide. Récupération depuis Alpha Vantage.");

  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  const API_URL = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=financial_markets&sort=LATEST&apikey=${API_KEY}`;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.statusText}`);
    }
    const data = await response.json();
    
    if (data.Note) {
        console.error("Limite API Alpha Vantage atteinte.");
        return {
            statusCode: 503, 
            body: JSON.stringify({ message: "Limite API externe atteinte." })
        };
    }

    cache.data = data;
    cache.lastFetch = currentTime;

    return {
      statusCode: 200,
      body: JSON.stringify(data), 
    };

  } catch (error) {
    console.error("Erreur lors de la récupération des données :", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Impossible de récupérer les actualités." }),
    };
  }
};