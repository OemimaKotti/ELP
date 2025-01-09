package main

import (
	"encoding/gob"
	"fmt"
	"net"
	"time"
)

func main() {
	// Connexion au serveur sur le port 8082
	conn, err := net.Dial("tcp", "127.0.0.1:8084")
	if err != nil {
		fmt.Println("Erreur lors de la connexion au serveur:", err)
		return
	}
	defer conn.Close()

	// Matrices 100x100
	matrixSize := 100
	matrixA := make([][]int, matrixSize)
	matrixB := make([][]int, matrixSize)
	for i := 0; i < matrixSize; i++ {
		matrixA[i] = make([]int, matrixSize)
		matrixB[i] = make([]int, matrixSize)
		for j := 0; j < matrixSize; j++ {
			matrixA[i][j] = i + j
			matrixB[i][j] = i - j
		}
	}

	fmt.Println("Envoi de matrices au serveur...")

	startTimeClient := time.Now() // Enregistrez le temps de début

	encoder := gob.NewEncoder(conn)
	if err := encoder.Encode(matrixA); err != nil {
		fmt.Println("Erreur lors de l'encodage de matrixA:", err)
		return
	}
	if err := encoder.Encode(matrixB); err != nil {
		fmt.Println("Erreur lors de l'encodage de matrixB:", err)
		return
	}
	fmt.Println("Matrices envoyées avec succès.")

	// Réception de la matrice résultante du serveur
	var result [][]int
	decoder := gob.NewDecoder(conn)
	if err := decoder.Decode(&result); err != nil {
		fmt.Println("Erreur lors du décodage de la réponse du serveur:", err)
		return
	}

	// Afficher une partie du résultat (pour éviter un affichage trop long)
	fmt.Println("Résultat de la multiplication matricielle (partie) :")
	for i := 0; i < 5; i++ {
		fmt.Println(result[i])
	}

	elapsedClient := time.Since(startTimeClient)
	fmt.Println("Temps total d'exécution (client):", elapsedClient)
}