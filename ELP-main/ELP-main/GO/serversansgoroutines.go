package main

import (
	"encoding/gob"
	"fmt"
	"net"
	"time"
)

func matrixMultiplySequential(a, b, result [][]int) {
	for i := 0; i < len(a); i++ {
		for col := 0; col < len(b[0]); col++ {
			sum := 0
			for j := 0; j < len(a[i]); j++ {
				sum += a[i][j] * b[j][col]
			}
			result[i][col] = sum
		}
	}
}

func handleClient(conn net.Conn) {
	defer conn.Close()

	startTime := time.Now()

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

	// Utiliser la multiplication matricielle séquentielle
	matrixMultiplySequential(matrixA, matrixB, result)

	encoder := gob.NewEncoder(conn)
	encoder.Encode(result)

	elapsed := time.Since(startTime)
	fmt.Println("Temps d'exécution (sans goroutines):", elapsed)
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

		handleClient(conn)
	}
}