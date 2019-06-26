const fetch = require('node-fetch');
const d3 = require('d3');
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

const sq_living = 'SELECT DISTINCT ?personaLabel ?genderLabel ?occupazioneLabel (YEAR(?dob) AS ?anno) ?pobLabel ?coord ?articolo WHERE {\
  ?persona wdt:P27 wd:Q38;         # instance of human\
           wdt:P1412 wd:Q652;      # with Italian as spoken language\
           wdt:P21 ?gender;        # fetch gender data value\
           wdt:P106 ?occupazione;  # fetch occupation data value\
		   wdt:P19 ?pob.           # fetch place of birth data value\
  ?pob wdt:P625 ?coord.            # specify place of birth coordinates\
  ?articolo schema:about ?persona;\
            schema:isPartOf <https://it.wikipedia.org/>. # that has a sitelink on Italian Wikipedia (FIXME: consider people that has a sitelink in at least one Wikipedia, regardless of language)\
  FILTER EXISTS { ?persona wdt:P569 ?data_nascita. }     # that have a date of birth field\
  FILTER NOT EXISTS { ?persona wdt:P570 ?data_morte. }   # that don"t have a date of death field\
  ?persona wdt:P569 ?dob. BIND(YEAR(now()) - YEAR(?dob) as ?age)\
  FILTER(?age <= 110)              # only people with age minus that 110\
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }\
} ORDER BY ?personaLabel';

const sq_dead = 'SELECT DISTINCT ?personaLabel ?genderLabel ?occupazioneLabel (YEAR(?dob) AS ?anno_nascita) (YEAR(?dod) AS ?anno_morte) ?pobLabel ?coord ?articolo WHERE {\
  ?persona wdt:P27 wd:Q38;         # instance of human\
           wdt:P1412 wd:Q652;      # with Italian as spoken language\
           wdt:P21 ?gender;        # fetch gender data value\
           wdt:P106 ?occupazione;  # fetch occupation data value\
		   wdt:P19 ?pob.           # fetch place of birth data value\
  ?pob wdt:P625 ?coord.            # specify place of birth coordinates\
  ?articolo schema:about ?persona;\
            schema:isPartOf <https://it.wikipedia.org/>. # that has a sitelink on Italian Wikipedia (FIXME: consider people that has a sitelink in at least one Wikipedia, regardless of language)\
  FILTER EXISTS { ?persona wdt:P569 ?data_nascita. }     # that have a date of birth field\
  FILTER EXISTS { ?persona wdt:P570 ?data_morte. }       # that have a date of death field\
  ?persona wdt:P569 ?dob;\
           wdt:P570 ?dod.\
  BIND(YEAR(?dob) - 1850 as ?yob)\
  BIND(YEAR(?dod) - 1850 as ?yod)\
  FILTER(?yob >= 0 && ?yod >= 0)\
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }\
} ORDER BY ?personaLabel';

// data fetch phase
console.log("Fetching data...");
const queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
var living_data = queryDispatcher.query(sq_living);
var dead_data = queryDispatcher.query(sq_dead);

var query_results = {
	'results': []
};

fs.readFile('professions.json', (err, data) => {
	if (err) throw err;
	var profs = JSON.parse(data);
	
	Promise.all([living_data, dead_data]).then(function(data) {
		var ld = data[0].results.bindings;
		var dd = data[1].results.bindings;
		
		// generating points
		console.log("Generating records...");
		
		var viewBox_map = {
			x: 0,
			y: 0,
			width: 1000,
			height: 500
		};
		
		var projection = d3.geoMercator()
			.translate([viewBox_map.width/2, viewBox_map.height/2])
			.center([12, 42.1])
			.scale(1950);
		
		var prev_name = '';
		for (i = 0; i < ld.length; i++) {
			var occs = ld[i].occupazioneLabel.value;
			var categories = getCategories(occs, profs);
			if (ld[i].personaLabel.value != prev_name) {
				var professions = {
					'categories': categories,
					'occupations': []
				};
				var obj = {
					'name': ld[i].personaLabel.value,
					'gender': ld[i].genderLabel.value,
					'professions': professions,
					'dob': toInteger(ld[i].anno.value),
					'dod': 0,
					'pob': ld[i].pobLabel.value,
					'coords': toPointObj(ld[i].coord.value, projection),
					'article': ld[i].articolo.value
				};

				obj.professions.occupations.push(ld[i].occupazioneLabel.value);
				query_results.results.push(obj);
				prev_name = ld[i].personaLabel.value;
			} else {
				var last = query_results.results.length - 1;
				var currCat = query_results.results[last].professions.categories;
				for (j = 0; j < categories.length; j++) {
					if (currCat.findIndex(val => val == categories[j]) < 0)
						query_results.results[last].professions
							.categories.push(categories[j]);
				}
				query_results.results[last].professions
					.occupations.push(ld[i].occupazioneLabel.value);
			}
		}
		
		prev_name = '';
		for (i = 0; i < dd.length; i++) {
			if (dd[i].personaLabel.value != prev_name) {
				var occs = dd[i].occupazioneLabel.value;
				var categories = getCategories(occs, profs);
				
				var professions = {
					'categories': categories,
					'occupations': []
				};
				var obj = {
					'name': dd[i].personaLabel.value,
					'gender': dd[i].genderLabel.value,
					'professions': professions,
					'dob': toInteger(dd[i].anno_nascita.value),
					'dod': toInteger(dd[i].anno_morte.value),
					'pob': dd[i].pobLabel.value,
					'coords': toPointObj(dd[i].coord.value, projection),
					'article': dd[i].articolo.value
				};
				
				obj.professions.occupations.push(dd[i].occupazioneLabel.value);
				query_results.results.push(obj);
				prev_name = dd[i].personaLabel.value;
			} else {
				var last = query_results.results.length - 1;
				var currCat = query_results.results[last].professions.categories;
				for (j = 0; j < categories.length; j++) {
					if (currCat.findIndex(val => val == categories[j]) < 0)
						query_results.results[last].professions
							.categories.push(categories[j]);
				}
				query_results.results[last].professions
					.occupations.push(dd[i].occupazioneLabel.value);
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
});

function toInteger(s) {
	return +s;
}

function toPointObj(pt, projection) {
	var res = pt.split(" ");
	var x_str = res[0].split("Point(");
	var y_str = res[1].split(")");
	var x = +x_str[1];
	var y = +y_str[0];
	var tp = projection([x, y]);
	return { 'x': tp[0], 'y': tp[1] };
}

function getCategories(obj, profs) {
	var cat = [],
		found = false;
	
	for (var i = 0; i < profs.categories.length; i++) {
		var currCat = profs.categories[i];
		for (var j = 0; j < currCat.classes.length; j++) {
			var currClass = currCat.classes[j];
			var idx = currClass.subclasses.findIndex(occ => occ == obj);
			if (idx >= 0) {
				if (cat.findIndex(val => val == currClass.jobClass) < 0)
					cat.push(currClass.jobClass);
			}
		}
	}
	
	return cat;
}
