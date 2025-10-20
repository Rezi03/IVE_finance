document.addEventListener('DOMContentLoaded', () => {
  // Étape 1: On vérifie que le fichier de traductions est bien là.
  if (typeof translations === 'undefined') {
    console.error("Le fichier translations.js doit être chargé avant contact.js");
    return;
  }

  const form = document.getElementById('contact-form');
  const statusElForm = document.getElementById('form-status');

  // Étape 2: On s'assure que le formulaire existe bien sur cette page.
  if (form && statusElForm) {
    const currentLang = localStorage.getItem('lang') || 'fr';
    // On crée une fonction de traduction simple et locale à ce fichier.
    const t = (key) => translations[currentLang]?.contact?.[key] || key;
    
    form.addEventListener('submit', async (e) => {
      // Étape 3: C'est la ligne la plus importante. Elle empêche la redirection vers Formspree.
      e.preventDefault(); 

      statusElForm.textContent = t('status_sending');
      statusElForm.className = 'status-message sending';
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;

      try {
        const data = new FormData(form);
        // On envoie les données en arrière-plan (AJAX)
        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' } // On demande une réponse JSON, pas une redirection
        });

        if (response.ok) {
          statusElForm.textContent = t('status_success');
          statusElForm.className = 'status-message success';
          form.reset();
          setTimeout(() => {
            statusElForm.textContent = '';
            statusElForm.className = 'status-message';
          }, 6000); // Le message reste 6 secondes
        } else {
          // Si Formspree renvoie une erreur
          statusElForm.textContent = t('status_error');
          statusElForm.className = 'status-message error';
        }
      } catch (error) {
        // Si la connexion internet échoue
        console.error("Erreur de réseau:", error);
        statusElForm.textContent = t('status_error_network');
        statusElForm.className = 'status-message error';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }
});