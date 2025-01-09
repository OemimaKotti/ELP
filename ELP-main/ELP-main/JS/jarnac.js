const fs = require('fs').promises;
const readline = require('readline');

// Initialisation des sacs de lettres pour chaque joueur
const initializeLetterBags = async () => {
    const letterFrequencies = {
        'A': 14, 'B': 4, 'C': 7, 'D': 5, 'E': 19, 'F': 2, 'G': 4, 'H': 2, 'I': 11,
        'J': 1, 'K': 1, 'L': 6, 'M': 5, 'N': 9, 'O': 8, 'P': 4, 'Q': 1, 'R': 10,
        'S': 7, 'T': 9, 'U': 8, 'V': 2, 'W': 1, 'X': 1, 'Y': 1, 'Z': 2
    };

    const player1Bag = [];
    const player2Bag = [];

    for (let letter in letterFrequencies) {
        for (let i = 0; i < letterFrequencies[letter]; i++) {
            player1Bag.push(letter);
            player2Bag.push(letter);
        }
    }

    return { player1Bag, player2Bag };
};

// Initialisation des tapis pour chaque joueur
const initializeMats = async () => {
    const player1Mat = Array(7).fill('');
    const player2Mat = Array(7).fill('');
    return { player1Mat, player2Mat };
};

// Fonction pour tirer aléatoirement des lettres du sac pour un joueur
const drawLetters = async (letterBag, numLetters) => {
    const lettersDrawn = [];
    for (let i = 0; i < numLetters; i++) {
        const randomIndex = Math.floor(Math.random() * letterBag.length);
        lettersDrawn.push(letterBag.splice(randomIndex, 1)[0]);
    }
    return lettersDrawn;
};


// Fonction pour vérifier si un mot est un nom commun valide
const isValidNoun = async (word, playerDrawnLetters) => { 
    if (word.length < 3) {
        return false;
    }
    for (let letter of word) {
        if (!playerDrawnLetters.includes(letter)) {
            return false;
        }
    }

    return true;
};


// Fonction pour piocher une lettre de la pioche
const drawFromDeck = async (letterBag) => {
    if (letterBag.length === 0) {
        console.log('La pioche est vide.');
        return '';
    }
    const randomIndex = Math.floor(Math.random() * letterBag.length);
    return letterBag.splice(randomIndex, 1)[0];
};

// Fonction pour permettre au joueur de saisir un mot ou de passer
const enterWordOrPass = async (player) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(`Joueur ${player}, entrez un mot de trois lettres ou plus (nom commun) ou écrivez "passer" pour passer au joueur suivant : `, (word) => {
            rl.close();
            resolve(word.toUpperCase());
        });
    });
};

// Fonction pour enregistrer le message dans un fichier de journal si nécessaire
const logToFile = async (message) => {
    if (message.includes('Mot valide, placé sur le tapis')) {
        try {
            await fs.appendFile('game_log.txt', message + '\n');
            console.log('Message écrit avec succès dans le fichier de journal.');
        } catch (err) {
            console.error('Erreur lors de l\'écriture dans le fichier de journal :', err);
        }
    }
};

const runGame = async () => {
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

        if (await isValidNoun(word, playerDrawnLetters)) {
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
                    const drawnLetter = await drawFromDeck(playerBag); // Attendre la résolution de la promesse
                    console.log(`Lettre piochée par le joueur ${currentPlayer}: ${drawnLetter}`);
                    remainingLetters.push(drawnLetter);
                    console.log(`Lettres du joueur ${currentPlayer}: ${remainingLetters.join(', ')}`);
                }
                if (playerMat.filter(word => word !== '').length === 7) {
                    console.log(`La table du Joueur ${currentPlayer} est remplie. Fin du jeu.`);
                    return; // Arrêter la fonction runGame et donc le jeu
                }
            } else {
                console.log('Il n\'y a pas d\'espace libre sur le tapis.');
            }
        } else {
            console.log('Mot invalide. Veuillez entrer un mot de trois lettres ou plus/Utlisez les lettres données.');
        }

        if (passPlayed) {
            passPlayed = false;
            currentPlayer = currentPlayer === 1 ? 2 : 1;
        }
    }
};

runGame();
