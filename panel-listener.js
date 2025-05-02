// panel-listener.js
// Ce content script écoute les messages du background et gère le toggle du panneau latéral
// Il est injecté sur toutes les pages via le manifest

// Fonction pour afficher ou retirer le panneau
function togglePanel() {
    const existingPanel = document.getElementById('custom-side-panel');
    if (existingPanel) {
        // Si le panneau existe, on retire la classe visible pour lancer l'animation de fermeture
        existingPanel.classList.remove('visible');
        // Attendre la fin de la transition avant de retirer le panneau du DOM
        existingPanel.addEventListener('transitionend', function handler(e) {
            if (e.propertyName === 'transform') {
                existingPanel.removeEventListener('transitionend', handler);
                existingPanel.remove();
            }
        });
    } else {
        // Sinon, on le crée
        const panel = document.createElement('div');
        panel.id = 'custom-side-panel';
        panel.className = 'custom-side-panel';
        // On prépare l'URL du fichier panel.html dans l'extension
        const panelUrl = chrome.runtime.getURL('panel.html');
        console.log('[DEBUG] URL du panel HTML chargé :', panelUrl);

        // On charge dynamiquement le contenu du panneau depuis panel.html
        // panel.html est déclaré dans le manifest, donc accessible
        fetch(panelUrl)
            .then(response => {
                console.log('[DEBUG] Réponse fetch:', response);
                if (!response.ok) {
                    throw new Error('Erreur HTTP : ' + response.status);
                }
                return response.text();
            })
            .then(html => {
                console.log('[DEBUG] HTML récupéré :', html.slice(0, 200)); // Affiche un extrait du HTML
                panel.innerHTML = html;
                // Ici, le HTML du panneau est injecté dynamiquement
                // Avantage : le contenu est séparé et facile à maintenir
            })
            .catch(err => {
                console.error('[DEBUG] Erreur lors du chargement du panneau :', err);
                panel.innerHTML = '<div style="color:red;text-align:center;">Erreur de chargement du panneau</div>';
            });
        // Cette méthode permet de diagnostiquer précisément chaque étape du chargement.
        document.body.appendChild(panel);
        // Forcer le reflow pour que la transition fonctionne même à la création
        void panel.offsetWidth;
        panel.classList.add('visible');
    }
}

// Écoute les messages envoyés depuis le background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request && request.type === 'toggle-panel') {
        togglePanel();
    }
});

/*
Explications pédagogiques :
- Ce script ne fait rien tant qu'il ne reçoit pas le message 'toggle-panel'.
- Quand il reçoit ce message, il affiche ou retire le panneau (toggle).
- C'est la méthode recommandée pour un comportement réactif et performant dans une extension Chrome moderne.
*/
