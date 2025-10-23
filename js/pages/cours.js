document.addEventListener('DOMContentLoaded', function() {

    const setupRepeatingScrollAnimations = () => {
        const observerOptions = {
            root: null, 
            rootMargin: '0px',
            threshold: 0.1 
        };

        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { 
                    entry.target.classList.add('visible'); 
                } else {
                    entry.target.classList.remove('visible'); 
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        const elementsToReveal = document.querySelectorAll('.course-page .reveal'); 
        
        elementsToReveal.forEach(el => {
             if (!el.classList.contains('reveal')) {
                 el.classList.add('reveal');
             }
            observer.observe(el);
        });
    };

    if (document.body.dataset.pageKey === 'courses') {
         setupRepeatingScrollAnimations();
    }

});