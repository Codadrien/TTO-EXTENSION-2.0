// background.js
// Ce fichier centralise la communication entre les différents scripts de l'extension.
// Son rôle est uniquement de relayer les messages entre l'icône, le collecteur d'images et le panneau UI.

/**
 * Lorsque l'utilisateur clique sur l'icône de l'extension,
 * on envoie un message à l'onglet courant pour ouvrir/fermer le panneau latéral.
 */
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { type: 'toggle-panel' });
});

/**
 * Écoute les messages provenant du collecteur d'images (image-collector.js)
 * et les transmet au script du panneau (panel-listener.js).
 * Le background ne fait que relayer, il ne traite pas les données.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[background] Message reçu:', message);
    if (message.type === 'update-images' && sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, {
            type: 'update-images',
            images: message.images
        });
        console.log('[background] URLs des images transmises au panel:', message.images);
    }
});
