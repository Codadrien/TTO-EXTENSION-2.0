// image-collector.js
// Ce script collecte toutes les images visibles de la page et les envoie au background.
// Il n'a qu'un seul rôle : détecter les images pertinentes et les transmettre.

/**
 * Collecte les images visibles de la page (taille > 300px, pas en base64)
 * et envoie la liste au background pour affichage dans le panneau.
 */
// Cache local pour éviter d'envoyer plusieurs fois la même liste d'images
let lastSentImages = [];

/**
 * Collecte toutes les images pertinentes de la page (taille > 300px, pas en base64)
 * Retourne un tableau d'URL uniques (sans doublons)
 */
function collectImages() {
    const images = document.getElementsByTagName('img');
    const imageUrls = [];
    for (const img of images) {
        if ((img.naturalWidth >= 300 || img.naturalHeight >= 300) && img.src && !img.src.startsWith('data:')) {
            imageUrls.push(img.src);
        }
    }
    // On retire les doublons
    return [...new Set(imageUrls)];
}

/**
 * Envoie la liste d'images au background UNIQUEMENT si elle a changé
 */
function sendImagesIfChanged() {
    const images = collectImages();
    if (JSON.stringify(images) !== JSON.stringify(lastSentImages)) {
        // On n'attend pas de réponse, donc on ne met pas de callback (évite l'erreur de callback non géré)
        chrome.runtime.sendMessage({
            type: 'update-images',
            images
        });
        lastSentImages = images;
    }
}

// Écoute les demandes du panneau pour envoyer la liste d'images à la demande
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'request-images') {
        // Répond immédiatement avec la liste courante
        chrome.runtime.sendMessage({
            type: 'update-images',
            images: collectImages()
        });
    }
});

// Observe les changements du DOM pour détecter les nouvelles images dynamiques
const observer = new MutationObserver(() => {
    sendImagesIfChanged();
});
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Première collecte au chargement de la page
sendImagesIfChanged();

/**
 * Fonction utilitaire pédagogique : affiche les dimensions réelles de toutes les images du DOM
 * Affiche dans la console un objet {src, width, height} pour chaque <img> présent dans la page
 * Utile pour le debug ou l'analyse rapide
 */
function logAllImageDimensions() {
    const images = document.querySelectorAll('img');
    // On construit un tableau d'objets {src, width, height}
    const result = Array.from(images).map(img => ({
        src: img.src,
        width: img.naturalWidth,
        height: img.naturalHeight
    }));
    // On affiche le tableau complet dans la console
    console.log(result);
}

// Appel automatique après le chargement complet de la page pour garantir que les images sont bien chargées
window.addEventListener('load', () => {
    logAllImageDimensions();
});


// Ce fichier n'a qu'un seul rôle : collecter et transmettre les images. Rien de plus, rien de moins.
