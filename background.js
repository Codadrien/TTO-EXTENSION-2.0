// background.js
// Ce script écoute le clic sur l'icône de l'extension et injecte le panneau dans l'onglet courant

// Au clic sur l'icône, envoie un message à l'onglet courant pour toggler le panneau
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { type: 'toggle-panel' });
});

/*
Explications pédagogiques :
- On n'injecte plus de JS dynamiquement.
- On envoie seulement un message 'toggle-panel' à l'onglet courant.
- Le content script (panel-listener.js) écoute ce message et gère l'affichage/fermeture du panneau.
*/

