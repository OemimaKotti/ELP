import readline from 'readline';

export const enterWordOrPass = async (player) => {
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
