// background.js
// Ce script gère la communication entre les composants de l'extension

// Au clic sur l'icône, envoie un message à l'onglet courant pour toggler le panneau
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { type: 'toggle-panel' });
});

// Écoute les messages de l'image-collector et les transmet au panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message reçu dans background:', message);
    
    if (message.type === 'update-images' && sender.tab) {
        // Envoie les URLs des images au panel dans le même onglet
        chrome.tabs.sendMessage(sender.tab.id, {
            type: 'update-images',
            images: message.images
        });
        console.log('URLs des images transmises au panel:', message.images);
    }
});
