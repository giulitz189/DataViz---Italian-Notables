const fs = require('fs');
const fetch = require('node-fetch');

class SPARQLQueryDispatcher {
	constructor(endpoint) {
		this.endpoint = endpoint;
	}

	query(sparqlQuery) {
		const fullUrl = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery);
		const headers = { 'Accept': 'application/sparql-results+json' };

		return fetch(fullUrl, { 'headers': headers }).then(body => body.json());
	}
}

const endpointUrl = 'https://query.wikidata.org/sparql';
const sparqlQuery = 'SELECT DISTINCT ?personaLabel ?genderLabel ?occupazioneLabel (YEAR(?dob) AS ?anno) ?coord ?articolo WHERE {\
  ?persona wdt:P31 wd:Q5;\
           wdt:P27 wd:Q38;\
           wdt:P1412 wd:Q652;\
           wdt:P21 ?gender;\
           wdt:P106 ?occupazione;\
           wdt:P19 [wdt:P625 ?coord].\
  ?articolo schema:about ?persona;\
            schema:isPartOf <https://it.wikipedia.org/>.\
  FILTER EXISTS { ?persona wdt:P569 ?data_nascita. }\
  FILTER NOT EXISTS { ?persona wdt:P570 ?data_morte. }\
  ?persona wdt:P569 ?dob. BIND(YEAR(now()) - YEAR(?dob) as ?age)\
  FILTER(?age <= 110)\
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }\
} ORDER BY ?personaLabel';

const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
queryDispatcher.query(sparqlQuery).then(function (data) {
	var json_string = JSON.stringify(data);
	fs.writeFile('query_results.json', json_string, function(err) {
		if (err) throw err;
		console.log('Data retrieved successfully!');
	});
});