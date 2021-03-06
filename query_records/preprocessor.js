const fetch = require('node-fetch');
const d3 = require('d3');
const fs = require('fs');

// This class generate a query request to an endpoint specified in the constructor
// (in this case to the Wikidata Query Service endpoint)
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

// Wikidata Query Service endpoint
const ENDPOINT_URL = 'https://query.wikidata.org/sparql';
// Regular expression for Wikidata entity codes
const WIKIDATA_OBJECT_CODE_REGEXP = /Q[0-9]+/;

// Fetch function for living people data retrieval: here will be sended multiple queries, one for every 25-year interval
// (Source: https://w.wiki/7yj)
function fetchLivingPeople(queryDispatcher) {
	var result = { post_records: [] };
	
	for (var age_min = 0; age_min < 100; age_min += 25) {
		var age_max = (age_min + 25 < 100) ? (age_min + 25) : 110;
		var query_string = 'SELECT ?persona ?personaLabel ?genderLabel ?occupazioneLabel (YEAR(?dob) AS ?anno) ?pobLabel ?coord WITH {\
			SELECT DISTINCT ?persona ?dob WHERE {\
				?persona wdt:P27 wd:Q38;\
						     wdt:P31 wd:Q5.\
				FILTER EXISTS { ?persona wdt:P569 ?data_nascita. }\
				FILTER NOT EXISTS { ?persona wdt:P570 ?data_morte. }\
				?articolo schema:about ?persona.\
				FILTER (SUBSTR(str(?articolo), 16, 5) = "pedia").\
				?persona wdt:P569 ?dob.\
				BIND(YEAR(now()) - YEAR(?dob) as ?age)\
				FILTER(?age >= ' + age_min + ' && ?age < ' + age_max + ').\
			}\
		} AS %i WHERE {\
			include %i\
			?persona wdt:P21 ?gender;\
					 wdt:P106 ?occupazione;\
					 wdt:P19 ?pob.\
			?pob wdt:P625 ?coord.\
			SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }\
		} ORDER BY ?personaLabel';
		
		var fetchedData = queryDispatcher.query(query_string);
		result.post_records.push(fetchedData);
	}

	return result;
}

// Fetch function for dead people data retrieval: here will be sended multiple queries, one for every 25-year interval
// (Source: https://bit.ly/2m1fLeJ)
function fetchDeadPeople(queryDispatcher) {
	var result = { post_records: [] };
	
	for (var year_min = 1850; year_min < 2019; year_min += 25) {
		var year_max = (year_min + 25 > 2019) ? 2019 : (year_min + 25);
		var query_string = 'SELECT ?persona ?personaLabel ?genderLabel ?occupazioneLabel (YEAR(?dob) AS ?anno_nascita) (YEAR(?dod) AS ?anno_morte) ?pobLabel ?coord WITH {\
			SELECT DISTINCT ?persona ?dob ?dod WHERE {\
				?persona wdt:P27 wd:Q38;\
								 wdt:P31 wd:Q5.\
				FILTER EXISTS { ?persona wdt:P569 ?data_nascita. }\
				FILTER EXISTS { ?persona wdt:P570 ?data_morte. }\
				?articolo schema:about ?persona.\
				FILTER (SUBSTR(str(?articolo), 16, 5) = "pedia").\
				?persona wdt:P569 ?dob.\
				hint:Prior hint:rangeSafe true.\
				?persona wdt:P570 ?dod.\
				hint:Prior hint:rangeSafe true.\
				FILTER(?dob >= "' + year_min + '-00-00"^^xsd:dateTime\
							 && ?dob < "' + year_max + '-00-00"^^xsd:dateTime\
							 && ?dod >= "1850-00-00"^^xsd:dateTime).\
			}\
		} AS %i WHERE {\
			include %i\
			?persona wdt:P21 ?gender;\
							 wdt:P106 ?occupazione;\
							 wdt:P19 ?pob.\
			?pob wdt:P625 ?coord.\
			SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }\
		} ORDER BY ?personaLabel';
		
		var fetchedData = queryDispatcher.query(query_string);
		result.post_records.push(fetchedData);
	}

	return result;
}

const queryDispatcher_ = new SPARQLQueryDispatcher(ENDPOINT_URL);
var queryResultsObject = {
	'results': []
};

// Data fetch phase: people lists are fetched via promise functions, occupation lists
// are read by Node.js file system module
console.log('Fetching profession data...');
fs.readFile('professions.json', (err, data) => {
	if (err) throw err;
	var professionList = JSON.parse(data);

	// Geographical Mercator projection is precalculated here in order to avoid
	// heavy calcs during page rendering
	var viewBoxMapCoordinates = {
		x: 0,
		y: 0,
		width: 1000,
		height: 500
	};
	
	var projection = d3.geoMercator()
		.translate([viewBoxMapCoordinates.width/2, viewBoxMapCoordinates.height/2])
		.center([12, 42.1])
		.scale(1950);

	console.log('Living people: fetching...');
	var livingPeopleFetchedData = fetchLivingPeople(queryDispatcher_);
	var livingPeopleRecordsGroup = livingPeopleFetchedData.post_records;
	
	Promise.all(livingPeopleRecordsGroup).then(function(groupData1) {
		console.log('Living people: generating records...');

		// Generating points for living people...
		var previousPersonName = '';
		for (group_idx = 0, len = groupData1.length; group_idx < len; group_idx++) {
			var livingPeopleValues = groupData1[group_idx].results.bindings;
			for (i = 0; i < livingPeopleValues.length; i++) {
				if (!WIKIDATA_OBJECT_CODE_REGEXP.test(livingPeopleValues[i].personaLabel.value)) {
					var occupationValueList = livingPeopleValues[i].occupazioneLabel.value;
					var categories = getCategories(occupationValueList, professionList);
					if (livingPeopleValues[i].personaLabel.value != previousPersonName) {
						// professions object contains occupation labels for every person and
						// their respective categories
						var professions = {
							'categories': categories,
							'occupations': []
						};
						var obj = {
							'wiki_id': livingPeopleValues[i].persona.value.split('http://www.wikidata.org/entity/')[1],
							'name': livingPeopleValues[i].personaLabel.value,
							'gender': livingPeopleValues[i].genderLabel.value,
							'professions': professions,
							'dob': toInteger(livingPeopleValues[i].anno.value),
							'dod': 0,
							'pob': livingPeopleValues[i].pobLabel.value,
							'coords': toPointObj(livingPeopleValues[i].coord.value, projection)
						};

						obj.professions.occupations.push(livingPeopleValues[i].occupazioneLabel.value);
						queryResultsObject.results.push(obj);
						previousPersonName = livingPeopleValues[i].personaLabel.value;
					} else {
						// query records in Wikidata are registered singularly for each
						// occupation value, so if someone is already inserted in results
						// array we'll only add the new occupation value for this person
						var last = queryResultsObject.results.length - 1;
						var currCat = queryResultsObject.results[last].professions.categories;
						for (j = 0; j < categories.length; j++) {
							if (currCat.findIndex(val => val == categories[j]) < 0)
								queryResultsObject.results[last].professions.categories.push(categories[j]);
						}
						queryResultsObject.results[last].professions.occupations.push(livingPeopleValues[i].occupazioneLabel.value);
					}
				}
			}
		}

		console.log('Dead people: fetching...');
		var deadPeopleFetchedData = fetchDeadPeople(queryDispatcher_);
		var deadPeopleRecordsGroup = deadPeopleFetchedData.post_records;

		Promise.all(deadPeopleRecordsGroup).then(function(groupData2) {
			console.log('Dead people: generating records...');

			// ... and dead ones
			previousPersonName = '';
			for (group_idx = 0, len = groupData2.length; group_idx < len; group_idx++) {
				var deadPeopleValues = groupData2[group_idx].results.bindings;
				for (i = 0; i < deadPeopleValues.length; i++) {
					if (!WIKIDATA_OBJECT_CODE_REGEXP.test(deadPeopleValues[i].personaLabel.value)) {
						var occupationValueList = deadPeopleValues[i].occupazioneLabel.value;
						var categories = getCategories(occupationValueList, professionList);
						if (deadPeopleValues[i].personaLabel.value != previousPersonName) {
							var professions = {
								'categories': categories,
								'occupations': []
							};
							var obj = {
								'wiki_id': deadPeopleValues[i].persona.value.split('http://www.wikidata.org/entity/')[1],
								'name': deadPeopleValues[i].personaLabel.value,
								'gender': deadPeopleValues[i].genderLabel.value,
								'professions': professions,
								'dob': toInteger(deadPeopleValues[i].anno_nascita.value),
								'dod': toInteger(deadPeopleValues[i].anno_morte.value),
								'pob': deadPeopleValues[i].pobLabel.value,
								'coords': toPointObj(deadPeopleValues[i].coord.value, projection)
							};
							
							obj.professions.occupations.push(deadPeopleValues[i].occupazioneLabel.value);
							queryResultsObject.results.push(obj);
							previousPersonName = deadPeopleValues[i].personaLabel.value;
						} else {
							var last = queryResultsObject.results.length - 1;
							var currCat = queryResultsObject.results[last].professions.categories;
							for (j = 0; j < categories.length; j++) {
								if (currCat.findIndex(val => val == categories[j]) < 0)
									queryResultsObject.results[last].professions.categories.push(categories[j]);
							}
							queryResultsObject.results[last].professions.occupations.push(deadPeopleValues[i].occupazioneLabel.value);
						}
					}
				}
			}
			
			// sorting alphabetically by name
			console.log('Sorting records by name...');
			queryResultsObject.results.sort(function (a, b) {
				a = a.name.toLowerCase();
				b = b.name.toLowerCase();
				return a < b ? -1 : a > b ? 1 : 0;
			});
			
			// save on json file
			console.log('Saving...');
			var serializedData = JSON.stringify(queryResultsObject);
			fs.writeFile('query_results.json', serializedData, function(err) {
				if (err) throw err;
				console.log('Data retrieved successfully!');
			});
		}).catch(function(e) { console.log(e); });
	}).catch(function(e) { console.log(e); });
});

function toInteger(s) {
	return +s;
}

function toPointObj(pt, projection) {
	var trim = pt.split(" ");
	var xString = trim[0].split('Point(');
	var yString = trim[1].split(')');
	var x = +xString[1];
	var y = +yString[0];
	var transformedPt = projection([x, y]);
	return { 'x': transformedPt[0], 'y': transformedPt[1] };
}

// This function identifies classes that includes occupations of a single person,
// returns an array containing all of this classes
function getCategories(obj, professionList) {
	var cat = [];
	
	for (var i = 0; i < professionList.categories.length; i++) {
		var currentCat = professionList.categories[i];
		for (var j = 0; j < currentCat.classes.length; j++) {
			var currentClass = currentCat.classes[j];
			var idx = currentClass.subclasses.findIndex(occ => occ == obj);
			if (idx >= 0) {
				if (cat.findIndex(val => val == currentClass.jobClass) < 0)
					cat.push(currentClass.jobClass);
			}
		}
	}
	
	return cat;
}
