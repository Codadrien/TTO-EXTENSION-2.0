// image-collector.js
// Script pour récupérer toutes les images de la page

function collectImages() {
    console.log('Collecte des images en cours...');
    
    // Sélectionne toutes les balises img de la page
    const images = document.getElementsByTagName('img');
    console.log('Nombre d\'images trouvées:', images.length);
    
    // Crée un tableau pour stocker les URLs des images
    const imageUrls = [];
    
    // Parcourt toutes les images et récupère leurs URLs
    for (const img of images) {
        // Vérifie si l'image est assez grande (> 300px)
        if (img.naturalWidth >= 300 || img.naturalHeight >= 300) {
            const src = img.src;
            if (src && !src.startsWith('data:')) { // Ignore les images en base64
                imageUrls.push(src);
                console.log('Image trouvée (>300px):', src, `${img.naturalWidth}x${img.naturalHeight}`);
            }
        }
    }
    
    console.log('Envoi des URLs au background:', imageUrls);
    
    // Envoie les URLs au panel via un message
    chrome.runtime.sendMessage({
        type: 'update-images',
        images: imageUrls
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Erreur lors de l\'envoi:', chrome.runtime.lastError);
        } else {
            console.log('Message envoyé avec succès');
        }
    });
}

// Exécute la collecte au chargement de la page
collectImages();

// Observe les changements dans le DOM pour détecter les nouvelles images
const observer = new MutationObserver(() => {
    collectImages();
});

// Configure l'observation du DOM
observer.observe(document.body, {
    childList: true,
    subtree: true
});
