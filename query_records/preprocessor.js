const fetch = require('node-fetch');
const fs = require('fs');

class SPARQLQueryDispatcher {
	constructor(endpoint) {
		this.endpoint = endpoint;
	}

	query(sparqlQuery) {
		const fullUrl = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery);
		const headers = { 'Accept': 'application/sparql-results+json' };

		return fetch(fullUrl, { 'headers': headers })
				.then(body => body.json())
				.catch(function(e) { console.log(e); });
	}
}

const endpointUrl = 'https://query.wikidata.org/sparql';

const sq_living = 'SELECT DISTINCT ?personaLabel ?genderLabel ?occupazioneLabel (YEAR(?dob) AS ?anno) ?coord ?articolo WHERE {\
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

const sq_dead = 'SELECT DISTINCT ?personaLabel ?genderLabel ?occupazioneLabel (YEAR(?dob) AS ?anno_nascita) (YEAR(?dod) AS ?anno_morte) ?coord ?articolo WHERE {\
  ?persona wdt:P31 wd:Q5;\
           wdt:P27 wd:Q38;\
           wdt:P1412 wd:Q652;\
           wdt:P21 ?gender;\
           wdt:P106 ?occupazione;\
           wdt:P19 [wdt:P625 ?coord].\
  ?articolo schema:about ?persona;\
            schema:isPartOf <https://it.wikipedia.org/>.\
  FILTER EXISTS { ?persona wdt:P569 ?data_nascita. }\
  FILTER EXISTS { ?persona wdt:P570 ?data_morte. }\
  ?persona wdt:P569 ?dob;\
           wdt:P570 ?dod.\
  BIND(YEAR(?dob) - 1850 as ?yob)\
  BIND(YEAR(?dod) - 1850 as ?yod)\
  FILTER(?yob >= 0 && ?yod >= 0)\
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }\
} ORDER BY ?personaLabel';

// data fetch phase
console.log("Fetching data...");
const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
var living_data = queryDispatcher.query(sq_living);
var dead_data = queryDispatcher.query(sq_dead);

var query_results = {
	'results': []
};

Promise.all([living_data, dead_data]).then(function(data) {
	var ld = data[0].results.bindings;
	var dd = data[1].results.bindings;
	
	// generating points
	console.log("Generating records...");
	
	var prev_name = '';
	for (i = 0; i < ld.length; i++) {
		if (ld[i].personaLabel.value != prev_name) {
			var obj = {
				'name': ld[i].personaLabel.value,
				'gender': ld[i].genderLabel.value,
				'occupation': [],
				'dob': toInteger(ld[i].anno.value),
				'dod': 0,
				'coords': toPointObj(ld[i].coord.value),
				'article': ld[i].articolo.value
			};
			obj.occupation.push(ld[i].occupazioneLabel.value);
			query_results.results.push(obj);
			prev_name = ld[i].personaLabel.value;
		} else {
			var last = query_results.results.length - 1;
			query_results.results[last]
				.occupation.push(ld[i].occupazioneLabel.value);
		}
	}
	
	prev_name = '';
	for (i = 0; i < dd.length; i++) {
		if (dd[i].personaLabel.value != prev_name) {
			var obj = {
				'name': dd[i].personaLabel.value,
				'gender': dd[i].genderLabel.value,
				'occupation': [],
				'dob': toInteger(dd[i].anno_nascita.value),
				'dod': toInteger(dd[i].anno_morte.value),
				'coords': toPointObj(dd[i].coord.value),
				'article': dd[i].articolo.value
			};
			obj.occupation.push(dd[i].occupazioneLabel.value);
			query_results.results.push(obj);
			prev_name = dd[i].personaLabel.value;
		} else {
			var last = query_results.results.length - 1;
			query_results.results[last]
				.occupation.push(dd[i].occupazioneLabel.value);
		}
	}
	
	// sorting alphabetically by name
	console.log("Sorting records by name...");
	query_results.results.sort(function (a, b) {
		a = a.name.toLowerCase();
		b = b.name.toLowerCase();
		return a < b ? -1 : a > b ? 1 : 0;
	});
	
	// save on json file
	console.log("Saving...");
	var json_string = JSON.stringify(query_results);
	fs.writeFile('query_results.json', json_string, function(err) {
		if (err) throw err;
		console.log('Data retrieved successfully!');
	});
}).catch(function(e) { console.log(e); });

function toInteger(s) {
	return +s;
}

function toPointObj(pt) {
	var res = pt.split(" ");
	var x_str = res[0].split("Point(");
	var y_str = res[1].split(")");
	var x = +x_str[1];
	var y = +y_str[0];
	return { 'x': x, 'y': y };
}