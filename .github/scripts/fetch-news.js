const fetch = require('node-fetch');
const fs = require('fs');

const apiKey = process.env.GNEWS_API_KEY;

const frenchQuery = `(finance OR "marchés financiers" OR bourse OR investissement OR banque OR croissance OR économie) AND (taux OR inflation OR dette)`;

const englishQuery = `(finance OR "financial markets" OR stock exchange OR investment OR banking OR growth OR economy) AND (rates OR inflation OR debt)`;

const fetchNews = async (query, lang, country, outputFile) => {
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=${lang}&country=${country}&max=10&apikey=${apiKey}`;
    
    try {
        console.log(`Récupération des actualités pour ${lang}...`);
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Erreur API pour ${lang}: ${response.statusText} - ${errorBody}`);
        }
        const data = await response.json();

        const dir = './assets/api';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(`${dir}/${outputFile}`, JSON.stringify(data, null, 2));
        console.log(`Actualités pour ${lang} sauvegardées dans ${outputFile} !`);

    } catch (error) {
        console.error(`Échec de la récupération pour ${lang}:`, error);
        throw error;
    }
};

const run = async () => {
    try {
        await Promise.all([
            fetchNews(frenchQuery, 'fr', 'fr', 'news_fr.json'),      
            fetchNews(englishQuery, 'en', 'us', 'news_en.json')  
        ]);
        console.log('Toutes les actualités ont été récupérées avec succès.');
    } catch (error) {
        process.exit(1);
    }
};

run();