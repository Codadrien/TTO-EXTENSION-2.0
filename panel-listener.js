// panel-listener.js
// Ce script gère l'affichage du panneau latéral et des images

// Variable pour stocker les dernières images reçues
let lastReceivedImages = [];

// Fonction pour afficher les images dans le panel
function updateImages(images) {
    const container = document.querySelector('#custom-side-panel .image-grid');
    if (!container) return;

    container.innerHTML = ''; // Vide le conteneur
    images.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Image de la page';
        container.appendChild(img);
    });
}

// Fonction pour afficher ou retirer le panneau
function togglePanel() {
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
        const panel = document.createElement('div');
        panel.id = 'custom-side-panel';
        panel.className = 'custom-side-panel';
        
        // Crée la structure du panel directement
        panel.innerHTML = `
            <div class="image-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 10px;">
            </div>
        `;
        
        document.body.appendChild(panel);
        void panel.offsetWidth;
        panel.classList.add('visible');
        
        // Affiche les images si on en a déjà
        if (lastReceivedImages.length > 0) {
            updateImages(lastReceivedImages);
        }
    }
}

// Écoute les messages du background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message reçu:', request);

    if (request.type === 'toggle-panel') {
        togglePanel();
    } else if (request.type === 'update-images') {
        lastReceivedImages = request.images;
        const panel = document.getElementById('custom-side-panel');
        if (panel) {
            updateImages(request.images);
        }
    }
});

/*
Explications pédagogiques :
- Ce script ne fait rien tant qu'il ne reçoit pas le message 'toggle-panel'.
- Quand il reçoit ce message, il affiche ou retire le panneau (toggle).
- C'est la méthode recommandée pour un comportement réactif et performant dans une extension Chrome moderne.
*/
