import * as mapUtils from './modules/map.js';
import * as sliderUtils from './modules/slider.js';

// Define radius for all circles on the map
var circleRadius = new mapUtils.CircleRadius();

// Map instance generation
var svgMap = mapUtils.getMapBox();
var map = mapUtils.getDrawableMap(svgMap);

var projectionPath = mapUtils.generateProjectionPath();

// Density map generation
var densityLegendBox = mapUtils.getDensityLegendBox();
var densityLegend = mapUtils.getDensityLegendSvg(densityLegendBox);

var legendXAxis = mapUtils.generateLegendXAxis();
var legendNotes = mapUtils.getLegendNotes(densityLegend);

mapUtils.initDensityLegend(densityLegend, legendXAxis);

// Slider dimension and year limits definition
var sliderDim = new sliderUtils.SliderDimension();
var yearBounds = new sliderUtils.YearBounds();
	
// Slider scale factor definition
var x = sliderUtils.createXAxisScaleFactor(yearBounds, sliderDim);
	
// Brush rectangle definition
var brush = sliderUtils.createXAxisBrush(sliderDim);
	
// Slider construction
var svgSlider = sliderUtils.createSliderInstance();
var slider = sliderUtils.createDrawableSliderBox(svgSlider);
	
var areaGraph = slider.append('g');
var brushSelection = sliderUtils.createSelectionRectangle(slider, brush, yearBounds, x);
	
// Selection box controls
var brushHandle = sliderUtils.createSelectionHandles(brushSelection);
var resetBtn = sliderUtils.createResetButton(svgSlider);
	
// Horizontal ruler for year values
sliderUtils.createSliderRuler(slider, sliderDim, x, yearBounds);

// INITIALIZATION PHASE - SELECTORS
// Point radius regulator
d3.select('.selector')
	.append('div')
		.attr('class', 'section')
		.text('Raggio dei punti:')
	.append('div')
		.attr('class', 'radius-slider');
		
// Tick values, and possible choices for circle radius
var radiusOptions = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

// Circular handle
var sliderHandle = d3.sliderBottom()
	.min(d3.min(radiusOptions))
	.max(d3.max(radiusOptions))
	.width(160)
	.tickFormat(d3.format('.1'))
	.ticks(9)
	.default(circleRadius.radius)
	.handle(
		d3.symbol()
			.type(d3.symbolCircle)
			.size(100)()
	);
	
// Graphic container of the slider
var radiusSelectorGraphicContainer = d3.select('.radius-slider')
	.append('svg')
		.attr('width', '200')
		.attr('height', '50')
	.append('g')
		.attr('transform', 'translate(20, 10)');

// Filtering values, respectively for type of visualization and gender
var visualizationFilterValue = 'dotmap';
var genderFilterValue = 'all';

// Circle infobox
var circleInfobox = d3.select('.circleInfo');

circleInfobox.append('div')
	.attr('class', 'section')
	.html('<b>Nome:</b> ');
	
circleInfobox.append('div')
	.attr('class', 'section')
	.html('<b>Sesso:</b> ');
	
circleInfobox.append('div')
	.attr('class', 'section')
	.html('<b>Occupazioni:</b> ');
	
circleInfobox.append('div')
	.attr('class', 'section')
	.html('<b>Anno di nascita:</b> ');
	
circleInfobox.append('div')
	.attr('class', 'section')
	.html('<b>Anno di morte:</b> ');
	
circleInfobox.append('div')
	.attr('class', 'section')
	.html('<b>Luogo di nascita:</b> ');
	
circleInfobox.append('div')
	.attr('class', 'section')
	.html('<b>Articolo Wikipedia:</b> ');
	
// Data range infobox
var rangeInfobox = d3.select('.rangeInfo');

var rangeInfoboxYearRange = rangeInfobox.append('div')
	.attr('class', 'section')
	.text('Intervallo nascite: dal ' + yearBounds.min + ' al ' + yearBounds.max);
	
var rangeInfoboxPointQuantity = rangeInfobox.append('div')
	.attr('class', 'section');
	
// Occupation grid selector
var occupationCategories = [
	{ name: 'TUTTO', type: 'special', m: 0, f: 0, other: 0 },
	{ name: 'Figure Sportive', type: 'category', m: 0, f: 0, other: 0 },
	{ name: 'Calciatore', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Allenatore', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Pilota', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Ciclista', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Tennista', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Arbitro', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Sciatore', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Artisti', type: 'category', m: 0, f: 0, other: 0 },
	{ name: 'Cantante', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Attore', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Compositore', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Regista', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Direttore d\'Orchestra', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Architetto', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Stilista', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Fumettista', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Pittore', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Fotografo', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Istituzioni', type: 'category', m: 0, f: 0, other: 0 },
	{ name: 'Politico', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Figura Religiosa', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Militare', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Giudice', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Agente Diplomatico', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Umanistica', type: 'category', m: 0, f: 0, other: 0 },
	{ name: 'Scrittore', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Giornalista', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Filosofo', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Scienza e Tecnologia', type: 'category', m: 0, f: 0, other: 0 },
	{ name: 'Biologo', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Fisico', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Economista', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Matematico', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Chimico', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Medico', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Astronomo', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Ingegnere', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Figure Pubbliche', type: 'category', m: 0, f: 0, other: 0 },
	{ name: 'Modello', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Business', type: 'category', m: 0, f: 0, other: 0 },
	{ name: 'Produttore', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Affarista', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Esplorazione', type: 'category', m: 0, f: 0, other: 0 },
	{ name: 'Astronauta', type: 'subcategory', m: 0, f: 0, other: 0 },
	{ name: 'Altro', type: 'special', m: 0, f: 0, other: 0 }
];

// This function generates the grid layout, returns an array that contain infos about dimension and position
// of every cell
function generateGridLayout() {
	var data = new Array();
	var xPos = 0;
	var yPos = 0;
	var width = 0;
	var height = 30;
	
	for (var row = 0, len = occupationCategories.length; row < len; row++) {
		data.push(new Array());
		for (var column = 0; column < 4; column++) {
			width = column == 0 ? 130 : 30;
			data[row].push({
				x: xPos,
				y: yPos,
				width: width,
				height: height,
				rowIndex: row
			})
			xPos += width;
		}
		xPos = 0;
		yPos += height;
	}
	return data;
}

// Drawing the grid (TODO: can we convert this grid into an hidden checkbox field?)
var grid = d3.select('#occ-select-grid')
	.text('Occupazione: ')
	.append('div')
		.style('width', '100%')
		.style('height', '800px')
		.style('overflow-x', 'hidden')
		.style('overflow-y', 'auto')
	.append('svg')
		.attr('width', '100%')
		.attr('height', _ => '' + (occupationCategories.length * 30))
		.style('margin', '2px 2px 2px 2px');
	
var row = grid.selectAll('.row')
	.data(generateGridLayout)
	.enter().append('g')
	.attr('class', 'row')
	.style('cursor', 'pointer');
	
row.selectAll('.square')
	.data(d => d)
	.enter()
	.append('g')
		.attr('class', 'cell')
		.attr('data-row-id', d => d.rowIndex)
		.attr('data-type', (_, i) => {
			switch (i) {
				case 1: return 'male-count';
				case 2: return 'female-count';
				case 3: return 'other-count';
				default: return 'name';
			}
		})
	.append('rect')
		.attr('class', 'square')
		.attr('x', d => d.x)
		.attr('y', d => d.y)
		.attr('width', d => d.width)
		.attr('height', d => d.height)
		.attr('fill', '#fff')
		.attr('stroke', '#222');
		
// Filling all cells
var cellsText = d3.selectAll('.cell')
	.filter((_, i, nodes) => d3.select(nodes[i]).attr('data-type') == 'name')
	.append('text')
	.attr('x', '65')
	.attr('y', (_, i, nodes) => {
		var el = d3.select(nodes[i]).node().parentNode;
		var idx = el.dataset.rowId;
		return '' + ((idx * 30) + 15);
	})
	.attr('text-anchor', 'middle')
	.style('font-size', '13px')
	.style('font-weight', (_, i, nodes) => {
		var el = d3.select(nodes[i]).node().parentNode;
		var idx = el.dataset.rowId;
		if (occupationCategories[idx].type == 'category') return 'bold';
		else return 'normal';
	})
	.style('font-style', (_, i, nodes) => {
		var el = d3.select(nodes[i]).node().parentNode;
		var idx = el.dataset.rowId;
		if (occupationCategories[idx].type == 'special') return 'italic';
		else return 'normal';
	})
	.text((_, i, nodes) => {
		var el = d3.select(nodes[i]).node().parentNode;
		var idx = el.dataset.rowId;
		return occupationCategories[idx].name;
	});

if (navigator.userAgent.indexOf("Edge") != -1) cellsText.attr('dy', 4.5);
else cellsText.attr('dominant-baseline', 'middle');
	
// Occupation categories currently selected
var occupationFilterSelected = ['all'];
	
// Force simulation init
var simulation = d3.forceSimulation();
	
// DATA LOAD PHASE
var provinceDataFiles = [
	'abruzzo.json',
	'basilicata.json',
	'calabria.json',
	'campania.json',
	'emilia.json',
	'friuli.json',
	'lazio.json',
	'liguria.json',
	'lombardia.json',
	'marche.json',
	'molise.json',
	'piemonte.json',
	'puglia.json',
	'sardegna.json',
	'sicilia.json',
	'toscana.json',
	'trentino.json',
	'umbria.json',
	'valledaosta.json',
	'veneto.json'
];

// Fetching data from province files (map shapes in TopoJSON)...
function loadProvinces() {
	var provinces = [];
	for (var i = 0, len = provinceDataFiles.length; i < len; i++) {
		var provinceShape = d3.json('geodata/' + provinceDataFiles[i]);
		provinces.push(provinceShape);
	}
	return provinces;
}

// ...and from query result files (data previously fetched from Wikidata)
var provinceDataRequest = loadProvinces();
var regionShapeDataRequest = d3.json('geodata/italy_reg.json');
var queryDataRequest = d3.json('query_records/query_results.json');
var metadataRequest = d3.json('geodata/region_dimensions.json');

// We'll waiting until all data has been loaded from all the files
Promise.all(provinceDataRequest).then(function(provinceData) {
	Promise.all([regionShapeDataRequest, queryDataRequest, metadataRequest]).then(function(data) {
		var regionShapeData = data[0];
		var queryData = data[1].results;
		// Region metadata records needs to be sorted by region ID for simpler access
		var metadata = data[2].regions.sort((a, b) => {
			a = a.RID;
			b = b.RID;
			return a < b ? -1 : a > b ? 1 : 0;
		});
    
    // draw regions and provinces
    mapUtils.generateRegions(map, projectionPath, regionShapeData, metadata);
		mapUtils.generateProvinces(map, projectionPath, provinceData, metadata);

		// Provide tip info for every province
		mapUtils.generateProvinceTipbox(map);
		
		// Finding valid points (all people born within Italian territory)
		var visiblePoints = [];
		var transformablePointCoords = [];
		var birthplaceDensity = [];
		for (var i = 0, len1 = queryData.length; i < len1; i++) {
			var record = queryData[i];
			// For every person we need to know in which province its dot is clipped
			var provinceElement = mapUtils.svgNodeFromCoordinates(record.coords.x, record.coords.y);
			if (provinceElement != null && provinceElement.classList[0] == 'province') {
				// For each point, increase their belonging province's gender count by one
				if (record.gender == 'maschio') provinceElement.dataset.male++;
				else if (record.gender == 'femmina') provinceElement.dataset.female++;
				visiblePoints.push(record);

				var birthplaceIndex = birthplaceDensity.findIndex(v => v.place == record.pob);
				if (birthplaceIndex < 0) {
					var birthplaceRecord = {
						place: record.pob,
						value: 1
					};
					birthplaceDensity.push(birthplaceRecord);
					birthplaceIndex = birthplaceDensity.length - 1;
				} else birthplaceDensity[birthplaceIndex].value++;
				
				// Convert point coordinates in exagonal layout
				var pointNo = birthplaceDensity[birthplaceIndex].value;
				var exagonalCoords = mapUtils.getExagonalLayoutCoordinates(pointNo - 1, record.coords.x, record.coords.y, circleRadius);

				// For each record generate an object with initial cooordinates and a province id
				// reference: will be used in dynamic collision resolving
				var dataPoint = {
					origX: record.coords.x,
					origY: record.coords.y,
					x: exagonalCoords.x,
					y: exagonalCoords.y,
					provinceIndex: provinceElement.id,
				};
				transformablePointCoords.push(dataPoint);

				// Increment "ALL" occupation filter value by one
				if (record.gender == 'maschio') occupationCategories[0].m++;
				else if (record.gender == 'femmina') occupationCategories[0].f++;
				else occupationCategories[0].other++;
				
				// For each occupation category and subcategory in which this record belongs, increment
				// respective filter value by one (FIXME: don't count records multiple times in categories)
				if (record.professions.categories.length == 0) {
					var l = occupationCategories.length;
					if (record.gender == 'maschio') occupationCategories[l-1].m++;
					else if (record.gender == 'femmina') occupationCategories[l-1].f++;
					else occupationCategories[l-1].other++;
				} else {
					var previousCategoryIndex = -1;
					for (var j = 0, len2 = record.professions.categories.length; j < len2; j++) {
						var currentSubcategory = record.professions.categories[j];
						var idx = occupationCategories.findIndex(cat => cat.name == currentSubcategory);
						var categoryIndex = idx;
						while (occupationCategories[categoryIndex].type != 'category') categoryIndex--;
						if (record.gender == 'maschio') {
							occupationCategories[idx].m++;
							if (previousCategoryIndex != categoryIndex) {
								occupationCategories[categoryIndex].m++;
								previousCategoryIndex = categoryIndex;
							}
						} else if (record.gender == 'femmina') {
							occupationCategories[idx].f++;
							if (previousCategoryIndex != categoryIndex) {
								occupationCategories[categoryIndex].f++;
								previousCategoryIndex = categoryIndex;
							}
						} else {
							occupationCategories[idx].other++;
							if (previousCategoryIndex != categoryIndex) {
								occupationCategories[categoryIndex].other++;
								previousCategoryIndex = categoryIndex;
							}
						}
					}
				}
			}
		}
		
		// Write occupation filter grid values (SELECTOR)
		var occupationMaleCount = d3.selectAll('.cell')
			.filter((_, i, nodes) =>  d3.select(nodes[i]).attr('data-type') == 'male-count')
			.append('text')
			.attr('x', '145')
			.attr('y', (_, i, nodes) => {
				var el = d3.select(nodes[i]).node().parentNode;
				var idx = el.dataset.rowId;
				return '' + ((idx * 30) + 15);
			})
			.attr('text-anchor', 'middle')
			.style('font-size', '11px')
			.text((_, i, nodes) => {
				var el = d3.select(nodes[i]).node().parentNode;
				var idx = el.dataset.rowId;
				return '' + occupationCategories[idx].m;
			});
			
		var occupationFemaleCount = d3.selectAll('.cell')
			.filter((_, i, nodes) => d3.select(nodes[i]).attr('data-type') == 'female-count')
			.append('text')
			.attr('x', '175')
			.attr('y', (_, i, nodes) => {
				var el = d3.select(nodes[i]).node().parentNode;
				var idx = el.dataset.rowId;
				return '' + ((idx * 30) + 15);
			})
			.attr('text-anchor', 'middle')
			.style('font-size', '11px')
			.text((_, i, nodes) => {
				var el = d3.select(nodes[i]).node().parentNode;
				var idx = el.dataset.rowId;
				return '' + occupationCategories[idx].f;
			});
			
		var occupationOtherCount = d3.selectAll('.cell')
			.filter((_, i, nodes) => d3.select(nodes[i]).attr('data-type') == 'other-count')
			.append('text')
			.attr('x', '205')
			.attr('y', (_, i, nodes) => {
				var el = d3.select(nodes[i]).node().parentNode;
				var idx = el.dataset.rowId;
				return '' + ((idx * 30) + 15);
			})
			.attr('text-anchor', 'middle')
			.style('font-size', '11px')
			.text((_, i, nodes) => {
				var el = d3.select(nodes[i]).node().parentNode;
				var idx = el.dataset.rowId;
				return '' + occupationCategories[idx].other;
			});

		if (navigator.userAgent.indexOf("Edge") != -1) {
			occupationMaleCount.attr('dy', 4.5);
			occupationFemaleCount.attr('dy', 4.5);
			occupationOtherCount.attr('dy', 4.5);
		} else {
			occupationMaleCount.attr('dominant-baseline', 'middle');
			occupationFemaleCount.attr('dominant-baseline', 'middle');
			occupationOtherCount.attr('dominant-baseline', 'middle');
		}
		
		// Creating tipbox for circles
		var circleTipbox = mapUtils.createCircleTipbox(visiblePoints);
		map.call(circleTipbox);
		
		// Point insertion into the map
		var circles = mapUtils.insertPointArray(map, transformablePointCoords, visiblePoints, circleTipbox, circleRadius);
		// if clicked, show detailed information in red infobox on the right
		circles.on('click', (_, i) => writePersonInfo(visiblePoints[i]));
			
		// Visualize circle count (FIXME: use occupationCategories values instead of recalculation)
		var totalCircles = circles.size();
		var maleCircles = circles.filter((_, i, nodes) => nodes[i].dataset.gender == 'maschio').size();
		var femaleCircles = circles.filter((_, i, nodes) => nodes[i].dataset.gender == 'femmina').size();
		rangeInfoboxPointQuantity.text(totalCircles + ' persone visualizzate, ' +
								'di cui ' + maleCircles + ' uomini e ' + femaleCircles + ' donne');
		
		// Draw area chart within the year slider
		sliderUtils.drawAreaChart(visiblePoints, occupationFilterSelected, slider, areaGraph, x, sliderDim);
			
		// Anti-collision animation
		simulation.nodes(transformablePointCoords)
			.force('collision', d3.forceCollide().radius(_ => circleRadius.radius * 1.5).iterations(3))
			.force('r', d3.forceRadial(0).x(d => d.origX).y(d => d.origY))
			.on('tick', _ => {
				map.selectAll('circle')
					.attr('cx', (_, i) => transformablePointCoords[i].x)
					.attr('cy', (_, i) => transformablePointCoords[i].y);
			});
		
		// Associate event handlers to page elements
		svgMap.call(d3.zoom().on('zoom', updateTransform));
			
		brush.on('start brush', _ => brushed(d3.event, visiblePoints))
			.on('end', _ => brushended(d3.event, visiblePoints));
			
		brushSelection.selectAll('.overlay')
			.each(d => d.type = 'selection')
			.on('mousedown touchstart', (_, i, nodes) => brushcentered(d3.mouse(nodes[i]), visiblePoints));

		resetBtn.on('mousedown', _ => resetBtn.selectAll('rect').style('fill', '#00cccc'))
			.on('mouseup', _ => {
				var now = new Date().getFullYear();
				resetBtn.selectAll('rect').style('fill', '#fff');
				brushSelection.transition().call(brush.move, [1850, now].map(x));
				getYearLimits(visiblePoints);
			});
			
		d3.select('#visualization-type')
			.selectAll('input')
			.on('change', (_, i, nodes) => {
				visualizationFilterValue = nodes[i].value;
				updateVisualizedPoints(visiblePoints);
			});
			
		d3.select('#gender-sel')
			.selectAll('input')
			.on('change', (_, i, nodes) => {
				genderFilterValue = nodes[i].value;
				updateVisualizedPoints(visiblePoints);
			});

		sliderHandle.on('onchange', val => {
			circleRadius.radius = val;
			if (visualizationFilterValue == 'dotmap') updateVisualizedPoints(visiblePoints);
		});
		radiusSelectorGraphicContainer.call(sliderHandle);
		
		d3.selectAll('.row')
			.on('click', (_, i) => {
				gridSelection(i);
				updateVisualizedPoints(visiblePoints);
			});
	});
});

// UTILITY FUNCTIONS
// Javascript class for Wikidata query dispatcher (SELECTOR)
class SPARQLQueryDispatcher {
	constructor(endpoint) {
		this.endpoint = endpoint;
	}

	async query(sparqlQuery) {
		const fullUrl = this.endpoint + '?query=' + encodeURIComponent(sparqlQuery);
		const headers = { 'Accept': 'application/sparql-results+json' };

		const body = await fetch(fullUrl, { headers });
		return await body.json();
	}
}

// Function that fetch from Wikidata all Wikipedia links of a specific person (SELECTOR)
function fetchArticle(data) {
	var endpointUrl = 'https://query.wikidata.org/sparql';
	var sparqlQuery = 'SELECT ?articolo WHERE {\
	  VALUES (?persona) {(wd:' + data.wiki_id + ')}\
	  ?articolo schema:about ?persona.\
	  FILTER (SUBSTR(str(?articolo), 11, 15) = ".wikipedia.org/").\
	}';

	var queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
	return queryDispatcher.query(sparqlQuery);
}

// Writes detailed information about a person visualized on the map (SELECTOR)
function writePersonInfo(data) {
	var fetchedRecords = fetchArticle(data); // Treat fetchArticle funcion as a Promise in order to wait for results
	Promise.all([fetchedRecords]).then(articles => {
		circleInfobox.selectAll('.section')
			.html((_, i) => {
				switch (i) {
					case 0:
						return '<b>Nome:</b> ' + data.name;
					case 1:
						return '<b>Sesso:</b> ' + data.gender;
					case 2:
						var str = '<b>Occupazioni:</b> ';
						for (var idx = 0, len = data.professions.occupations.length; idx < len; idx++) {
							if (idx == data.professions.occupations.length - 1)
								str += data.professions.occupations[idx];
							else str += data.professions.occupations[idx] + ', ';
						}
						return str;
					case 3:
						return '<b>Anno di nascita:</b> ' + data.dob;
					case 4:
						if (data.dod == 0) return '<b>Anno di morte:</b> -';
						else return '<b>Anno di morte:</b> ' + data.dod;
					case 5:
						return '<b>Luogo di nascita:</b> ' + data.pob;
					case 6:
						var links = articles[0].results.bindings;
						var idx = -1;
						idx = links.findIndex(el => el.articolo.value.includes('it.wikipedia.org'));
						if (idx >= 0) {
							return '<b>Articolo Wikipedia:</b> <a href="' + links[idx].articolo.value +
									'" target="_blank">' + links[idx].articolo.value + '</a>';
						} else {
							idx = links.findIndex(el => el.articolo.value.includes('en.wikipedia.org'));
							if (idx >= 0) {
								return '<b>Articolo Wikipedia:</b> <a href="' + links[idx].articolo.value +
										'" target="_blank">' + links[idx].articolo.value + '</a>';
							} else {
								return '<b>Articolo Wikipedia:</b> <a href="' + links[0].articolo.value +
									'" target="_blank">' + links[0].articolo.value + '</a>';
							}
						}
				}
			});
	});
}

// Update procedure for all visualized data
function updateVisualizedPoints(elems) {
	// First of all hide all points on the map
	map.selectAll('circle')
		.filter((_, i, nodes) => d3.select(nodes[i]).attr('display') == 'block')
		.attr('display', 'none');
	
	// Determine which points are visualized after applying filter parameters and add their indexes in
	// indexList array
	var indexList = [];
	var selected = map.selectAll('circle')
		.filter((_, i) => {
			var el = elems[i];
			if (genderFilterValue == 'all' || el.gender == genderFilterValue) {
				var cat = el.professions.categories;
				if (occupationFilterSelected[0] == 'all' || (occupationFilterSelected[0] == 'other' && cat.length == 0)) {
					if (yearBounds.isValueInInterval(el.dob)) {
						indexList.push(i);
						return true;
					}
				} else {
					for (var idx = 0, len = cat.length; idx < len; idx++) {
						if (occupationFilterSelected.findIndex(v => v == cat[idx]) >= 0 && yearBounds.isValueInInterval(el.dob)) {
							indexList.push(i);
							return true;
						}
					}
				}
			}
			return false;
		});

	// Reset province point count
	map.selectAll('.province')
		.attr('data-male', 0)
		.attr('data-female', 0);
	
	// For each point, increase their belonging province's gender count by one
	selected.each((_, i, nodes) => {
		var element = d3.select(nodes[i]);
		var provinceId = element.attr('data-province-id');
		var province = document.querySelector('[id=\'' + provinceId + '\']');
		if (element.attr('data-gender') == 'maschio') province.dataset.male++;
		else if (element.attr('data-gender') == 'femmina') province.dataset.female++;
	});

	// Write in the infobox how many people are currently visualized (FIXME: insert values from category grid)
	var totalCircles = selected.size();
	var maleCircles = selected.filter((_, i, nodes) => nodes[i].dataset.gender == 'maschio').size();
	var femaleCircles = selected.filter((_, i, nodes) => nodes[i].dataset.gender == 'femmina').size();
	rangeInfoboxPointQuantity.text(totalCircles + ' persone visualizzate, ' +
							'di cui ' + maleCircles + ' uomini e ' + femaleCircles + ' donne');
	
	// Redraw area chart inside year range slider
	sliderUtils.drawAreaChart(elems, occupationFilterSelected, slider, areaGraph, x, sliderDim);

	simulation.stop();
	if (visualizationFilterValue == 'dotmap') {
		selected.attr('display', 'block');
		map.selectAll('image').attr('display', 'none');
		map.selectAll('.province').style('fill', '#FFF');
		d3.selectAll('.person').attr('r', circleRadius.radius)
		densityLegendBox.style('display', 'none');

		var pointGroupsElement = mapUtils.getDerivatedCoords(indexList, elems, circleRadius);

		// Reset and restart collision resolver engine
		simulation.nodes(pointGroupsElement.tpc)
			.force('collision', d3.forceCollide().radius(_ => circleRadius.radius * 1.5).iterations(3))
			.force('r', d3.forceRadial(0).x(d => d.origX).y(d => d.origY))
			.on('tick', _ => {
				map.selectAll('circle')
					.attr('cx', (_, i) => {
						var currentIdx = indexList.findIndex(val => val == i);
						if (currentIdx >= 0) return pointGroupsElement.tpc[currentIdx].x;
					})
					.attr('cy', (_, i) => {
						var currentIdx = indexList.findIndex(val => val == i);
						if (currentIdx >= 0) return pointGroupsElement.tpc[currentIdx].y;
					});
			});
		simulation.alpha(1).restart();
	} else if (visualizationFilterValue == 'density') {
		map.selectAll('image').attr('display', 'none');
		densityLegendBox.style('display', 'block');

		// Generate color density
		var maxProvincePeopleNo = 0;
		map.selectAll('.province')
			.each((_, i, nodes) => {
				var province = d3.select(nodes[i]).node();
				var total = parseInt(province.dataset.male) + parseInt(province.dataset.female);
				if (total > maxProvincePeopleNo) maxProvincePeopleNo = total;
			});
		map.selectAll('.province')
			.style('fill', (_, i, nodes) => {
				if (visualizationFilterValue == 'density') {
					var province = d3.select(nodes[i]).node();
					var m = parseInt(province.dataset.male);
					var f = parseInt(province.dataset.female);
					var total = m + f;

					if (maxProvincePeopleNo > 0 && total > 0) {
						var h = 240 + Math.floor(60 * (f / total));
						var l = 100 - Math.ceil(50 * (total / maxProvincePeopleNo));
						switch (genderFilterValue) {
							case 'maschio':
								l = 100 - Math.ceil(50 * (m / maxProvincePeopleNo));
								return 'hsla(240, 100%, ' + l + '%, 0.8)';
							case 'femmina':
								l = 100 - Math.ceil(50 * (f / maxProvincePeopleNo));
								return 'hsla(300, 100%, ' + l + '%, 0.8)';
							default: return 'hsla(' + h + ', 100%, ' + l + '%, 0.8)';
						}
					}
				}
				return '#fff';
			});
		
		var labelArray = [];
		for (var i = 0; i <= 100; i = i + 20) {
			var value = Math.floor((maxProvincePeopleNo / 100) * i)
			labelArray.push(value);
		}

		legendXAxis.domain(labelArray);
		densityLegend.select('.x-axis').remove();
		densityLegend.append('g')
			.attr('class', 'x-axis')
			.attr('transform', 'translate(-63, 80)')
			.style('font-size', _ => {
				if (maxProvincePeopleNo >= 1000) return '8px';
				else return '10px';
			})
			.call(d3.axisBottom(legendXAxis).tickSize(0))
			.select('.domain').remove();

		legendNotes.text('(m: maschio, f: femmina, max popolazione per provincia: ' + maxProvincePeopleNo + ')');
	}
}

// EVENT HANDLERS
// Apply transform matrix to all map elements
function updateTransform() {
	map.attr('transform', d3.event.transform);
}

// Modifies birthyear limits
function getYearLimits(elems) {
	// Update min and max limits
	var lx = +d3.select('.selection').attr('x'),
			width = +d3.select('.selection').attr('width');
	yearBounds.min = Math.floor(x.invert(lx));
	yearBounds.max = Math.floor(x.invert(lx + width));
	
	// Visualize updated limits in an infobox
	rangeInfoboxYearRange.text('Intervallo nascite: dal ' + yearBounds.min + ' al ' + yearBounds.max);
	
	// Reset occupation categories values
	for (var i = 0, len = occupationCategories.length; i < len; i++) {
		occupationCategories[i].m = 0;
		occupationCategories[i].f = 0;
		occupationCategories[i].other = 0;
	}
	 
	for (var i = 0, len1 = elems.length; i < len1; i++) {
		var record = elems[i];
		
		if (yearBounds.isValueInInterval(record.dob)) {
			// Increment "ALL" occupation filter value by one
			if (record.gender == 'maschio') occupationCategories[0].m++;
			else if (record.gender == 'femmina') occupationCategories[0].f++;
			else occupationCategories[0].other++;
			
			// For each occupation category and subcategory in which this record belongs, increment
			// respective filter value by one (FIXME: don't count records multiple times in categories)
			if (record.professions.categories.length == 0) {
				var l = occupationCategories.length;
				if (record.gender == 'maschio') occupationCategories[l-1].m++;
				else if (record.gender == 'femmina') occupationCategories[l-1].f++;
				else occupationCategories[l-1].other++;
			} else {
				var previousCategoryIndex = -1;
				for (var j = 0, len2 = record.professions.categories.length; j < len2; j++) {
					var currentSubcategory = record.professions.categories[j];
					var idx = occupationCategories.findIndex(cat => cat.name == currentSubcategory);
					var categoryIndex = idx;
					while (occupationCategories[categoryIndex].type != 'category') categoryIndex--;
					if (record.gender == 'maschio') {
						occupationCategories[idx].m++;
						if (previousCategoryIndex != categoryIndex) {
							occupationCategories[categoryIndex].m++;
							previousCategoryIndex = categoryIndex;
						}
					} else if (record.gender == 'femmina') {
						occupationCategories[idx].f++;
						if (previousCategoryIndex != categoryIndex) {
							occupationCategories[categoryIndex].f++;
							previousCategoryIndex = categoryIndex;
						}
					} else {
						occupationCategories[idx].other++;
						if (previousCategoryIndex != categoryIndex) {
							occupationCategories[categoryIndex].other++;
							previousCategoryIndex = categoryIndex;
						}
					}
				}
			}
		}
	}
	
	// Update the content of value cells
	d3.selectAll('.cell')
		.filter((_, i, nodes) => d3.select(nodes[i]).attr('data-type') == 'male-count')
		.select('text')
		.text((_, i, nodes) => {
			var el = d3.select(nodes[i]).node().parentNode;
			var idx = el.dataset.rowId;
			return '' + occupationCategories[idx].m;
		});
		
	d3.selectAll('.cell')
		.filter((_, i, nodes) => d3.select(nodes[i]).attr('data-type') == 'female-count')
		.select('text')
		.text((_, i, nodes) => {
			var el = d3.select(nodes[i]).node().parentNode;
			var idx = el.dataset.rowId;
			return '' + occupationCategories[idx].f;
		});
		
	d3.selectAll('.cell')
		.filter((_, i, nodes) => d3.select(nodes[i]).attr('data-type') == 'other-count')
		.select('text')
		.text((_, i, nodes) => {
			var el = d3.select(nodes[i]).node().parentNode;
			var idx = el.dataset.rowId;
			return '' + occupationCategories[idx].other;
		});
	
	// Apply to points
	updateVisualizedPoints(elems);
}

// Year range slider event handler for click on unselected spaces
function brushcentered(mouseEvt, elems) {
	var dx = x(1860) - x(1850),
		cx = mouseEvt[0],
		x0 = cx - dx / 2,
		x1 = cx + dx / 2;
	
	brushHandle.attr('x', d => {
		if (d.type == 'w')
			return (parseInt(d3.select('.handle--w').attr('x')) + 2.5);
		else return (parseInt(d3.select('.handle--e').attr('x')) + 1);
	});
	brushSelection.call(brush.move, x1 > sliderDim.width ? [sliderDim.width - dx, sliderDim.width] : x0 < 0 ? [0, dx] : [x0, x1]);
	
	getYearLimits(elems);
}

// Year range slider mousein event handler
function brushed(evt, elems) {
	if (!evt.selection) return;
	brushHandle.attr('x', d => {
		if (d.type == 'w')
			return (parseInt(d3.select('.handle--w').attr('x')) + 2.5);
		else return (parseInt(d3.select('.handle--e').attr('x')) + 1);
	});
	
	getYearLimits(elems);
}

// Year range slider mouseout event handler
function brushended(evt, elems) {
	if (!evt.sourceEvent) return;
	if (!evt.selection) return;
	var d0 = evt.selection.map(x.invert),
		d1 = d0.map(Math.round);
		
	if (d1[0] >= d1[1]) {
		d1[0] = Math.floor(d0[0]);
		d1[1] = d1[0] + 1;
	}
	
	brushHandle.attr('x', d => {
		if (d.type == 'w')
			return (parseInt(d3.select('.handle--w').attr('x')) + 2.5);
		else return (parseInt(d3.select('.handle--e').attr('x')) + 1);
	});
	brushSelection.transition().call(brush.move, d1.map(x));
	
	getYearLimits(elems);
}

// Set occupation category filtering (SELECTOR)
function gridSelection(rowId) {
	grid.selectAll('rect')
		.attr('fill', '#fff')
		
	occupationFilterSelected = [];
	d3.selectAll('.cell')
		.filter((_, i, nodes) => {
			var id = d3.select(nodes[i]).attr('data-row-id');
			return parseInt(id) == rowId;
		})
		.selectAll('rect')
		.attr('fill', '#00cccc');
	
	if (rowId == 0) {
		occupationFilterSelected.push('all');
	} else if (rowId == occupationCategories.length - 1) {
		occupationFilterSelected.push('other');
	} else {
		if (occupationCategories[rowId].type == 'category') {
			var lastSubcategoryId = rowId + 1;
			while (occupationCategories[lastSubcategoryId].type == 'subcategory') {
				occupationFilterSelected.push(occupationCategories[lastSubcategoryId].name);
				lastSubcategoryId++;
			}
			d3.selectAll('.cell')
				.filter((_, i, nodes) => {
					var id = d3.select(nodes[i]).attr('data-row-id');
					return parseInt(id) > rowId && parseInt(id) < lastSubcategoryId;
				})
				.selectAll('rect')
				.attr('fill', '#97eaea');
		} else occupationFilterSelected.push(occupationCategories[rowId].name);
	}
}