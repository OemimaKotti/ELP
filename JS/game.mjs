import { initializeLetterBags, drawLetters, drawFromDeck } from './letterBag.mjs';
import { initializeMats, isValidNoun } from './mat.mjs';
import { enterWordOrPass } from './input.mjs';
import { logToFile } from './fileUtils.mjs';

export const runGame = async () => {
    const { player1Bag, player2Bag } = await initializeLetterBags();
    const { player1Mat, player2Mat } = await initializeMats();

    let currentPlayer = 1;
    let passPlayed = false;

    while (true) {
        const playerBag = currentPlayer === 1 ? player1Bag : player2Bag;
        const playerMat = currentPlayer === 1 ? player1Mat : player2Mat;

        const playerDrawnLetters = await drawLetters(playerBag, 6);
        console.log(`Lettres du joueur ${currentPlayer}: ${playerDrawnLetters.join(', ')}`);

        const word = await enterWordOrPass(currentPlayer);

        if (word.toUpperCase() === 'PASSER') {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            continue;
        }

        if (await isValidNoun(word)) {
            let wordPlaced = false;
            for (let i = 0; i < playerMat.length; i++) {
                if (playerMat[i] === '') {
                    playerMat[i] = word;
                    wordPlaced = true;
                    break;
                }
            }
            if (wordPlaced) {
                console.log(`Mot valide, placé sur le tapis du Joueur ${currentPlayer} :`, playerMat);
                await logToFile(`Mot valide, placé sur le tapis du Joueur ${currentPlayer} : ${playerMat}`);
                const remainingLetters = playerDrawnLetters.filter(letter => !word.includes(letter));
                console.log(`Lettres restantes du joueur ${currentPlayer}: ${remainingLetters.join(', ')}`);

                if (remainingLetters.length === 0) {
                    console.log('Toutes les lettres de votre main ont été utilisées.');
                } else {
                    const drawnLetter = await drawFromDeck(playerBag);
                    console.log(`Lettre piochée par le joueur ${currentPlayer}: ${drawnLetter}`);
                    remainingLetters.push(drawnLetter);
                    console.log(`Lettres du joueur ${currentPlayer}: ${remainingLetters.join(', ')}`);
                }

                // Vérifier si la table du joueur est remplie
                if (playerMat.filter(word => word !== '').length === 7) {
                    console.log(`La table du Joueur ${currentPlayer} est remplie. Fin du jeu.`);
                    return; // Arrêter la fonction runGame et donc le jeu
                }
            } else {
                console.log('Il n\'y a pas d\'espace libre sur le tapis.');
            }
        } else {
            console.log('Mot invalide. Veuillez entrer un mot de trois lettres ou plus.');
        }

        if (passPlayed) {
            passPlayed = false;
            currentPlayer = currentPlayer === 1 ? 2 : 1;
        }
    }
};