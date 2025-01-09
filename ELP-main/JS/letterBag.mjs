const letterFrequencies = {
    'A': 14, 'B': 4, 'C': 7, 'D': 5, 'E': 19, 'F': 2, 'G': 4, 'H': 2, 'I': 11,
    'J': 1, 'K': 1, 'L': 6, 'M': 5, 'N': 9, 'O': 8, 'P': 4, 'Q': 1, 'R': 10,
    'S': 7, 'T': 9, 'U': 8, 'V': 2, 'W': 1, 'X': 1, 'Y': 1, 'Z': 2
};

export const initializeLetterBags = async () => {
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


export const drawLetters = async (letterBag, numLetters) => {
    const lettersDrawn = [];
    for (let i = 0; i < numLetters; i++) {
        const randomIndex = Math.floor(Math.random() * letterBag.length);
        lettersDrawn.push(letterBag.splice(randomIndex, 1)[0]);
    }
    return lettersDrawn;
};
export const drawFromDeck = async (letterBag) => {
    if (letterBag.length === 0) {
        console.log('La pioche est vide.');
        return '';
    }
    const randomIndex = Math.floor(Math.random() * letterBag.length);
    return letterBag.splice(randomIndex, 1)[0];
};
