Nous avons élaboré 2 programme en Go(serveur/client) pour exécuter la multiplication des matrices complexes de manière parallèle. 
Lorsqu'un client se connecte, le serveur reçoit deux matrices du client, les multiplie en parallèle à l'aide de goroutines, puis renvoie le résultat au client.
On a aussi implémenté le code sans les goroutines et ajouté un timer pour comparer les performances en temps.
Pour exécuter le code, vous devrez ouvrir deux fenêtres de terminal distinctes.
