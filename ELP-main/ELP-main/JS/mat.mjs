export const initializeMats = async () => {
    const player1Mat = Array(7).fill('');
    const player2Mat = Array(7).fill('');
    return { player1Mat, player2Mat };
};

export const isValidNoun = async (word) => {
    return word.length >= 3;
};
