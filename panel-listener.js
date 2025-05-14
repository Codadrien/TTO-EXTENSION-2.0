// panel-listener.js
// Script pour gérer l'affichage du panneau (test ou extension)

let lastReceivedImages = [];

/**
 * Affiche les images dans le panneau latéral.
 * @param {string[]} images - URLs d'images à afficher
 */
function updateImages(images) {
    const container = document.getElementById('imageContainer');
    container.innerHTML = '';
    const template = document.getElementById('image-card-template');

    images.forEach(url => {
        // Clone le template et sélectionne les éléments
        const card = template.content.cloneNode(true);
        const img = card.querySelector('.image-item');
        const details = card.querySelector('.image-details');
        const sizeElement = card.querySelector('.size');
        const formatElement = card.querySelector('.format');
        const weightElement = card.querySelector('.weight');
        img.src = url;
        img.alt = 'Image';

        // Format (extension du fichier) - Méthode améliorée
        let format = '';
        try {
            // 1. On extrait d'abord le nom de fichier en ignorant les paramètres d'URL
            const urlWithoutParams = url.split('?')[0];
            // 2. On extrait le dernier segment du chemin (le nom de fichier)
            const fileName = urlWithoutParams.split('/').pop();
            // 3. On récupère l'extension (dernière partie après le point)
            if (fileName && fileName.includes('.')) {
                format = fileName.split('.').pop().toLowerCase();
                // Vérification que c'est bien un format d'image connu
                const validFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
                if (!validFormats.includes(format)) {
                    format = format + ' (?)'; // Format non standard
                }
            } else {
                format = 'inconnu';
            }
        } catch (e) {
            format = 'inconnu';
            console.warn('Erreur lors de l\'extraction du format:', e);
        }
        
        img.setAttribute('data-format', format);
        if (formatElement) formatElement.textContent = `${format}`;

        // Poids (Content-Length via HEAD)
        fetch(url, { method: 'HEAD' })
            .then(response => {
                const weight = response.headers.get('Content-Length');
                if (weight) {
                    img.setAttribute('data-weight', weight);
                    if (weightElement) weightElement.textContent = `${Math.round(weight/1024)} Ko`;
                } else {
                    img.setAttribute('data-weight', '?');
                    if (weightElement) weightElement.textContent = 'Poids : ?';
                }
            })
            .catch(error => {
                img.setAttribute('data-weight', '?');
                if (weightElement) weightElement.textContent = 'Poids : ?';
                console.warn('Impossible de récupérer le poids de l\'image (CORS ou autre) :', error);
            });

        // Taille (dimensions de l'image)
        img.onload = function() {
            if (details) {
                details.setAttribute('data-width', img.naturalWidth);
                details.setAttribute('data-height', img.naturalHeight);
            }
            if (sizeElement) sizeElement.textContent = `${img.naturalWidth}x${img.naturalHeight}`;
        };
        
        // Gestion des erreurs
        img.onerror = function() {
            if (details) details.textContent = 'Erreur de chargement';
            if (sizeElement) sizeElement.textContent = 'Erreur de chargement';
        };
        
        container.appendChild(card);
    });

    // Debug pédagogique : affiche le tableau d'images
    console.log('Tableau des images reçues :', images);
}

/**
 * Ouvre ou ferme le panneau latéral dynamiquement (utilisé côté extension)
 */
// togglePanel utilise désormais un template HTML pour garantir une structure unique et modifiable facilement.
function togglePanel() {
    // Ne pas injecter le panneau si on est déjà sur panel.html (mode test)
    if (window.location.pathname.endsWith('panel.html')) {
        return;
    }
    const existingPanel = document.getElementById('custom-side-panel');
    if (existingPanel) {
        existingPanel.classList.remove('visible');
        existingPanel.addEventListener('transitionend', function handler(e) {
            if (e.propertyName === 'transform') {
                existingPanel.removeEventListener('transitionend', handler);
                existingPanel.remove();
            }
        });
    } else {
        // Charge panel.html comme template HTML externe
        fetch(chrome.runtime.getURL('panel.html'))
            .then(response => response.text())
            .then(html => {
                // On parse le HTML pour extraire la structure du panneau uniquement (hors <html>, <head>, <body>)
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                // On cherche le panneau (id="custom-side-panel") dans le HTML chargé
                const panel = tempDiv.querySelector('#custom-side-panel');
                if (panel) {
                    // On clone le panneau pour l'injecter dans la page
                    const panelClone = panel.cloneNode(true);
                    document.body.appendChild(panelClone);
                    void panelClone.offsetWidth;
                    panelClone.classList.add('visible');
                    // Affiche les images déjà reçues si elles existent
                    if (lastReceivedImages.length > 0) {
                        updateImages(lastReceivedImages);
                    }
                } else {
                    console.error('custom-side-panel non trouvé dans panel.html');
                }
            })
            .catch(err => {
                console.error('Erreur lors du chargement du template panneau:', err);
            });
    }
}

// La logique d'insertion du panneau est intégrée directement dans togglePanel


/**
 * Charge les données de test (utilisé uniquement dans panel.html)
 */
async function loadTestData() {
    const response = await fetch('test-data.json');
    if (!response.ok) {
        throw new Error('Erreur lors du chargement des données de test');
    }
    return await response.json();
}

// Détecte automatiquement le contexte :
const IS_PANEL_HTML = window.location.pathname.endsWith('panel.html');

if (IS_PANEL_HTML) {
    // Mode test/dev : charge et affiche les images de test dès le chargement
    window.addEventListener('DOMContentLoaded', () => {
        loadTestData().then(testImages => {
            updateImages(testImages);
        }).catch(error => {
            console.error('Erreur lors du chargement des données de test:', error);
        });
    });
} else {
    // Mode extension : écoute les messages du background
    // On écoute les messages envoyés par le background (mode extension uniquement)
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'toggle-panel') {
            togglePanel();
            // Demande explicitement la liste d'images au background à l'ouverture du panneau
            chrome.runtime.sendMessage({ type: 'request-images' });
        } else if (request.type === 'update-images') {
            // Ne met à jour la liste que si elle a changé
            if (JSON.stringify(request.images) !== JSON.stringify(lastReceivedImages)) {
                lastReceivedImages = request.images;
                const panel = document.getElementById('custom-side-panel');
                if (panel) {
                    updateImages(lastReceivedImages);
                }
            }
        }
    }); // ← On ferme correctement la parenthèse ici
} // ← On ferme le else principal ici !

// Toutes les fonctions sont maintenant bien séparées, sans redondance, et commentées pour faciliter la compréhension.