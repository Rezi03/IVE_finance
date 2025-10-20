const fetch = require('node-fetch');
const fs = require('fs');

const apiKey = process.env.GNEWS_API_KEY;
const keywords = "finance OR banking OR markets OR stocks OR investment";
const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(keywords)}&lang=fr&country=fr&max=10&apikey=${apiKey}`;

const fetchNews = async () => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.statusText}`);
        }
        const data = await response.json();

        // Crée le dossier s'il n'existe pas
        const dir = './assets/api';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(`${dir}/news.json`, JSON.stringify(data, null, 2));
        console.log('Les actualités ont été récupérées et sauvegardées !');

    } catch (error) {
        console.error('Erreur lors de la récupération des actualités:', error);
        process.exit(1); // Fait échouer l'action pour être notifié
    }
};

fetchNews();