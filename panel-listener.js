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
        panel.innerHTML = `
            <div style="text-align:center;">
                <h2>Volet latéral personnalisé</h2>
                <p>ça fonctionne</p>
            </div>
        `;
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
