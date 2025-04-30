// content.js
// Ce script gère l'affichage/fermeture du panneau latéral personnalisé (toggle)
// Il est injecté à chaque clic sur l'icône de l'extension

// On cherche le panneau par son id
const existingPanel = document.getElementById('custom-side-panel');

if (existingPanel) {
    // Si le panneau existe déjà, on le retire (toggle off)
    existingPanel.remove();
} else {
    // Sinon, on le crée et on l’ajoute (toggle on)
    const panel = document.createElement('div');
    panel.id = 'custom-side-panel';
    panel.className = 'custom-side-panel';

    panel.innerHTML = `
        <div style="text-align:center;">
            <h2>Volet latéral personnalisé</h2>
            <p>Ici tu pourras ajouter du contenu plus tard.</p>
        </div>
    `;

    document.body.appendChild(panel);
}
