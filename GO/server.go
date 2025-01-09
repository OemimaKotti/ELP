package main

import (
	"encoding/gob"
	"fmt"
	"net"
	"sync"
	"time"
)

func matrixMultiplyParallel(a, b, result [][]int, row int, wg *sync.WaitGroup, ch chan<- []int) {
	defer wg.Done()

	sums := make([]int, len(b[0]))
	for col := 0; col < len(b[0]); col++ {
		sum := 0
		for i := 0; i < len(a[row]); i++ {
			sum += a[row][i] * b[i][col]
		}
		sums[col] = sum
	}

	// Envoyer la ligne résultante au canal
	ch <- sums
}

func handleClient(conn net.Conn) {
	defer conn.Close()

	startTime := time.Now() // Enregistrer le temps de début

	var matrixA, matrixB [][]int
	decoder := gob.NewDecoder(conn)
	decoder.Decode(&matrixA)
	decoder.Decode(&matrixB)

	rowsA := len(matrixA)

	if len(matrixA[0]) != len(matrixB) {
		fmt.Println("Les dimensions des matrices ne permettent pas la multiplication matricielle.")
		return
	}

	result := make([][]int, rowsA)
	for i := range result {
		result[i] = make([]int, len(matrixB[0]))
	}

	// Créer un canal pour recevoir les résultats des goroutines
	resultChannel := make(chan []int, rowsA)

	// Lancer des goroutines pour calculer les lignes de la matrice résultante en parallèle
	var wg sync.WaitGroup
	for i := 0; i < rowsA; i++ {
		wg.Add(1)
		go matrixMultiplyParallel(matrixA, matrixB, result, i, &wg, resultChannel)
	}

	// Fonction anonyme pour attendre la fin de toutes les goroutines et fermer le canal
	go func() {
		wg.Wait()
		close(resultChannel)
	}()

	// Récupérer les résultats du canal et les mettre dans la matrice résultante
	for rowIndex := 0; rowIndex < len(result); rowIndex++ {
		sums, ok := <-resultChannel
		if !ok {
			fmt.Println("Erreur: canal fermé prématurément.")
			return
		}
		result[rowIndex] = sums
	}

	// Envoyer la matrice résultante au client
	encoder := gob.NewEncoder(conn)
	encoder.Encode(result)

	elapsed := time.Since(startTime) // Calculer le temps écoulé
	fmt.Println("Temps d'exécution:", elapsed)
}

func main() {
	listener, err := net.Listen("tcp", ":8084")
	if err != nil {
		fmt.Println("Erreur lors du démarrage du serveur:", err)
		return
	}
	defer listener.Close()

	fmt.Println("Serveur en attente de connexions...")

	for {
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Erreur lors de la connexion d'un client:", err)
			continue
		}

		// Démarrer une goroutine pour gérer le client
		go handleClient(conn)
	}
}