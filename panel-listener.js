// panel-listener.js
// Script unique pour gérer l'affichage du panneau, que ce soit dans panel.html (mode test) ou sur une page web (mode extension).
// La logique d'affichage et de mise en page est centralisée ici.

// Variable pour stocker les dernières images reçues
let lastReceivedImages = [];

/**
 * Affiche les images dans le panneau latéral.
 * @param {string[]} images - Liste des URLs d'images à afficher
 */
function updateImages(images) {
    const container = document.getElementById('imageContainer');
    if (!container) {
        console.error('Container imageContainer non trouvé!');
        return;
    }
    container.innerHTML = '';
    images.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Image de la page';
        container.appendChild(img);
    });
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

// insertPanelFromTemplate n'est plus nécessaire, la logique est intégrée ici.


// Fonction utilitaire pour insérer le panneau à partir du template
function insertPanelFromTemplate(template) {
    // Clone le contenu du template (structure HTML du panneau)
    const panel = template.content.cloneNode(true).children[0];
    document.body.appendChild(panel);
    void panel.offsetWidth;
    panel.classList.add('visible');
    // Affiche les images déjà reçues si elles existent
    if (lastReceivedImages.length > 0) {
        updateImages(lastReceivedImages);
    }
}


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
        } else if (request.type === 'update-images') {
            lastReceivedImages = request.images;
            const panel = document.getElementById('custom-side-panel');
            if (panel) {
                updateImages(lastReceivedImages);
            }
        }
    }); // ← On ferme correctement la parenthèse ici
} // ← On ferme le else principal ici !

// Toutes les fonctions sont maintenant bien séparées, sans redondance, et commentées pour faciliter la compréhension.