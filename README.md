# Interactive Visualization of Notable People on Wikipedia

Questo repository contiene una mappa interattiva dell'Italia raffigurante la posizione di nascita di tutte le persone **notable** (ovvero "famose") presenti in Wikipedia IT dal 1850 ad oggi.

Presenta i seguenti file:
- README.md: questo file
- index.html: la pagina web con la mappa interattiva descritta precedentemente
- region-dimensions.json: file json contenente dati su nomi e dimensioni delle regioni delle province italiane
- script.js e styles.css: rispettivamente script principale e foglio di stile della pagina
- worker.js: worker per il calcolo delle collisioni dei punti (usato per evitare sovrapposizioni di punti sullo stesso luogo)
- geodata: cartella contenente i topojson della penisola italiana e delle sue province (fonte: [TopojsonItaly](https://github.com/qwince/TopojsonItaly))
- query_records/query_results.json: risultati del fetch dei dati delle persone notable registrate su Wikidata. Link delle query utilizzate:
  - Persone vive: [https://w.wiki/4Lq](https://w.wiki/4Lq)
  - Persone defunte: [https://w.wiki/4Lr](https://w.wiki/4Lr)
- query_records/preprocessor.js: script Node.js per l'aggiornamento del contenuto di query_results.json
