// image-collector.js
// Ce script collecte toutes les images visibles de la page et les envoie au background.
// Il n'a qu'un seul rôle : détecter les images pertinentes et les transmettre.

/**
 * Collecte les images visibles de la page (taille > 300px, pas en base64)
 * et envoie la liste au background pour affichage dans le panneau.
 */
function collectImages() {
    // Récupère toutes les balises <img> de la page
    const images = document.getElementsByTagName('img');
    const imageUrls = [];
    for (const img of images) {
        // On filtre les images trop petites ou en base64
        if ((img.naturalWidth >= 300 || img.naturalHeight >= 300) && img.src && !img.src.startsWith('data:')) {
            imageUrls.push(img.src);
        }
    }
    // Envoie la liste au background
    chrome.runtime.sendMessage({
        type: 'update-images',
        images: imageUrls
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('[image-collector] Erreur lors de l\'envoi:', chrome.runtime.lastError);
        }
    });
}

// Collecte les images au chargement de la page
collectImages();

// Observe les changements du DOM pour détecter les nouvelles images dynamiques
const observer = new MutationObserver(() => {
    collectImages();
});
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Ce fichier n'a qu'un seul rôle : collecter et transmettre les images. Rien de plus, rien de moins.
