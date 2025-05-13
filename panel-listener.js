let lastReceivedImages = [];

// Fonction pour afficher les images dans le panel
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
window.updateImages = updateImages;

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
        panel.innerHTML = `
            <div id="imageContainer" class="image-grid"></div>
        `;
        document.body.appendChild(panel);
        void panel.offsetWidth;
        panel.classList.add('visible');
        if (lastReceivedImages.length > 0) {
            updateImages(lastReceivedImages);
        }
    }
}

// Fonction pour charger le fichier test-data.json
async function loadTestData() {
    const response = await fetch('test-data.json');
    if (!response.ok) {
        throw new Error('Erreur lors du chargement des données de test');
    }
    return await response.json();
}
window.loadTestData = loadTestData;

// Écoute les messages du background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message reçu:', request);

    if (request.type === 'toggle-panel') {
        togglePanel();
    } else if (request.type === 'update-images') {
        // // On ignore la récupération d'image si on est sur panel.html (mode live server)
        // if (window.location.href.includes('panel.html')) return;
        lastReceivedImages = request.images;
        const panel = document.getElementById('custom-side-panel');
        if (panel) {
            loadTestData().then(testImages => {
                updateImages(testImages);
                if (lastReceivedImages.length > 0) {
                    updateImages(lastReceivedImages);
                }
            }).catch(error => {
                console.error('Erreur lors du chargement des données de test:', error);
            });
        }
    }
});


// if (window.location.href.includes('panel.html')) {
//     console.log("panel-listener.js : extension désactivée car panel.html détecté dans l'URL");
//     // Désactive le CSS du panel si besoin :
//     const css = document.querySelector('link[href*=\"panel.css\"]');
//     if (css) css.disabled = true;
//     document.querySelectorAll('style').forEach(style => {
//         if (style.innerText.includes('.custom-side-panel')) style.disabled = true;
//     });
//     throw new Error("panel-listener.js désactivé (mode dev panel.html)");
// }