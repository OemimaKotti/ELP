import { promises as fs } from 'fs';

export const logToFile = async (message) => {
    if (message.includes('Mot valide, placé sur le tapis')) {
        try {
            await fs.appendFile('game_log.txt', message + '\n');
            console.log('Message écrit avec succès dans le fichier de journal.');
        } catch (err) {
            console.error('Erreur lors de l\'écriture dans le fichier de journal :', err);
        }
    }
};