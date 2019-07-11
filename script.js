// INITIALIZATION PHASE - MAP
// Map box dimensions
var viewBoxMapCoordinates = {
	x: 0,
	y: 0,
	width: 1000,
	height: 500
};

// Point radius
var circleRadius = 0.5;

// SVG viewport creation
var svgMap = d3.select('.map-box')
	.append('svg')
		.attr('preserveAspectRatio', 'xMinYMin meet')
		.attr('viewBox', viewBoxMapCoordinates.x + ' ' + viewBoxMapCoordinates.y + ' ' +
						+ viewBoxMapCoordinates.width + ' ' + viewBoxMapCoordinates.height);

var map = svgMap.append('g');
	
// Geographical Mercator projection function
var projection = d3.geoMercator()
	.translate([viewBoxMapCoordinates.width/2, viewBoxMapCoordinates.height/2])
	.center([12, 42.1])
	.scale(1950);
	
var path = d3.geoPath()
	.projection(projection);
	
// Heatmap initialization
var heatmapInstance = h337.create({
	container: document.querySelector('.map-box')
});
	
// INITIALIZATION PHASE - YEAR RANGE SLIDER
// Slider box dimensions
var viewBoxSliderCoordinates = {
	x: 0,
	y: 0,
	width: 1000,
	height: 100
};

// SVG box creation
var svgSlider = d3.select('.slider-box')
	.append('svg')
		.attr('xmlns', 'http://www.w3.org/2000/svg')
		.attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
		.attr('preserveAspectRatio', 'xMinYMin meet')
		.attr('viewBox', viewBoxSliderCoordinates.x + ' ' + viewBoxSliderCoordinates.y + ' ' +
						+ viewBoxSliderCoordinates.width + ' ' + viewBoxSliderCoordinates.height);
						
var scaleW = viewBoxSliderCoordinates.width - 100;
var scaleH = viewBoxSliderCoordinates.height - 30;

// Minimum and maximum year of birth
var nowYear = new Date().getFullYear();

var minYear = 1850;
var maxYear = nowYear;
	
// Slider range definition
var x = d3.scaleLinear()
	.domain([minYear, maxYear])
	.range([0, scaleW]);
	
// Brush rectangle definition
var brush = d3.brushX()
	.extent([[0, 0], [scaleW, scaleH]]);
	
// Slider construction
var slider = svgSlider.append('g')
	.attr('class', 'slider')
	.attr('transform', 'translate(50, 10)');
	
var areaGraph = slider.append('g');
	
var brushSelection = slider.append('g')
	.attr('class', 'brush')
	.call(brush)
	.call(brush.move, [minYear, maxYear].map(x));
	
// Rectangular selection handles, useful if you don't know where to click and drag
var brushHandle = brushSelection.selectAll('.handle--custom')
	.data([{type: 'w'}, {type: 'e'}])
	.enter().append('rect')
		.attr('class', 'handle--custom')
		.attr('fill', 'red')
		.attr('cursor', 'ew-resize')
		.attr('x', d => {
			if (d.type == 'w')
				return (parseInt(d3.select('.handle--w').attr('x')) + 2.5);
			else return (parseInt(d3.select('.handle--e').attr('x')) + 1);
		})
		.attr('y', 25)
		.attr('width', 3)
		.attr('height', 20);
	
// Horizontal ruler for year values
slider.append('g')
	.attr('class', 'x axis')
	.attr('transform', 'translate(0, ' + scaleH + ')')
	.call(d3.axisBottom(x)
			.ticks(maxYear - minYear)
			.tickFormat(d => (d % 10 != 0) ? '' : d.toString()));
			
d3.selectAll('g.x.axis g.tick line')
	.attr('y2', d => (d % 10 == 0) ? 6 : (d % 10 == 5) ? 4 : 2);

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
	.default(0.5)
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
	.text('Intervallo nascite: dal ' + minYear + ' al ' + maxYear);
	
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
	
	for (var row = 0; row < occupationCategories.length; row++) {
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
	
var column = row.selectAll('.square')
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
	for (i = 0; i < provinceDataFiles.length; i++) {
		var provinceShape = d3.json('geodata/' + provinceDataFiles[i]);
		provinces.push(provinceShape);
	}
	return provinces;
}

// ...and from query result files (data previously fetched from Wikidata)
var provinceDataRequest = loadProvinces();
var regionShapeDataRequest = d3.json('geodata/italy_reg.json');
var queryDataRequest = d3.json('query_records/query_results.json');
var regionMetadataRequest = d3.json('region_dimensions.json');

// We'll waiting until all data has been loaded from all the files
Promise.all(provinceDataRequest).then(function(provinceData) {
	Promise.all([regionShapeDataRequest, queryDataRequest, regionMetadataRequest]).then(function(data) {
		var regionShapeData = data[0];
		var queryData = data[1].results;
		// Region metadata records needs to be sorted by region ID for simpler access
		var regionMetadata = data[2].regions.sort((a, b) => {
			a = a.RID;
			b = b.RID;
			return a < b ? -1 : a > b ? 1 : 0;
		});
		
		// Map drawing by path string extraction - Regions
		map.selectAll('.region')
			.data(topojson.feature(regionShapeData, regionShapeData.objects.sub).features)
			.enter()
			.append('path')
				.attr('class', 'region')
				.attr('id', (_, i) => regionMetadata[i].regionLabel)
				.attr('d', path);
		
		// Map drawing by path string extraction - Provinces
		for (i = 0; i < provinceData.length; i++) {
			map.selectAll('.prov')
				.data(topojson.feature(provinceData[i], provinceData[i].objects.sub).features)
				.enter()
				.append('path')
					.attr('class', 'province')
					.attr('id', d => d.id) // IDs are used to further accesses
					.attr('d', path)
					.attr('data-name', d => { // add province name as HTML5 dataset metadata
						var provinceIndex = findZoneIndexes(regionMetadata, d.id);
						return regionMetadata[provinceIndex.r].provinces[provinceIndex.p].provinceLabel;
					})
					.attr('data-population', d => { // add total population as HTML5 dataset metadata
						var provinceIndex = findZoneIndexes(regionMetadata, d.id);
						return regionMetadata[provinceIndex.r].provinces[provinceIndex.p].population;
					})
					.attr('data-male', 0) // no. of male notable people, initialized to 0
					.attr('data-female', 0) // no. of female notable people, initialized to 0
		}

		// Provide tip info for every province (FIXME: try to bind tipbox position to cursor position...)
		var provinceTipbox = d3.tip()
			.attr('class', 'd3-tip')
			.attr('id', 'map-tip')
			.html(d => {
				var provinceId = d.id;
				var provinceElement = map.selectAll('.province')
										.select((_, i, nodes) => {
											var thisElement = nodes[i];
											var elementId = d3.select(thisElement).attr('id');
											return elementId == provinceId ? thisElement : null;
										}).node();
				var total = parseInt(provinceElement.dataset.male) + parseInt(provinceElement.dataset.female);
				return provinceElement.dataset.name + '</br>' + 'Pop. ' + provinceElement.dataset.population + ' (' + total + ')';
			})
			.offset((_, i, nodes) => {
				var thisProvince = nodes[i];
				switch (thisProvince.id) {
					case '49': return [(thisProvince.getBoundingClientRect().height / 2) - 10, thisProvince.getBoundingClientRect().width / 4];
					case '81': return [(thisProvince.getBoundingClientRect().height / 4) - 10, 0];
					case '82': return [(3 * (thisProvince.getBoundingClientRect().height / 4)) - 10, 0];
					case '83': return [(3 * (thisProvince.getBoundingClientRect().height / 4)) - 10, 0];
					case '84': return [(thisProvince.getBoundingClientRect().height / 8) - 10, 0];
					default: return [(thisProvince.getBoundingClientRect().height / 2) - 10, 0];
				}
			});

		map.call(provinceTipbox);
		map.selectAll('.province')
			.on('mouseover', provinceTipbox.show) // show tipbox if mouse is hovering upon this element
			.on('mouseout', provinceTipbox.hide);
		
		// Finding valid points (all people born within Italian territory)
		var visiblePoints = [];
		var transformablePointCoords = [];
		var birthplaceDensity = [];
		for (var i = 0, len = queryData.length; i < len; i++) {
			var record = queryData[i];
			// For every person we need to know in which province its dot is clipped
			var provinceElement = svgNodeFromCoordinates(record.coords.x, record.coords.y);
			if (provinceElement != null && provinceElement.classList[0] == 'province') {
				// Insert one male or one female in the province record count
				if (record.gender == 'maschio')
					provinceElement.dataset.male++;
				else if (record.gender == 'femmina')
					provinceElement.dataset.female++;
				visiblePoints.push(record);
				
				// Precalculation of the density population for every birthplace
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
				var exagonalCoords = getExagonalLayoutCoordinates(pointNo - 1, record.coords.x, record.coords.y);

				// For each record generate an object with initial cooordinates and a province id
				// reference: will be used in heatmap generation and dynamic collision resolving
				var dataPoint = {
					origX: record.coords.x,
					origY: record.coords.y,
					x: exagonalCoords.x,
					y: exagonalCoords.y,
					provinceIndex: provinceElement.id,
					value: 1
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
					for (var j = 0; j < record.professions.categories.length; j++) {
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
		
		// Write occupation filter grid values
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
		var circleTipbox = d3.tip()
			.attr('class', 'd3-tip')
			.attr('id', 'circle-tip')
			.html((_, i) => {
				var genderLetter = '';
				switch (visiblePoints[i].gender) {
					case 'maschio': genderLetter = 'M';
								 	break;
					case 'femmina': genderLetter = 'F';
								   	break;
					default: genderLetter = 'X';
							 break;
				}
				if (visiblePoints[i].dod > 0) {
					return visiblePoints[i].name + ' (' + genderLetter + ')</br>' + visiblePoints[i].pob +
						' ' + visiblePoints[i].dob + ' - ' + visiblePoints[i].dod;
				} else {
					return visiblePoints[i].name + ' (' + genderLetter + ')</br>' + visiblePoints[i].pob +
						' ' + visiblePoints[i].dob + ' -';
				}
			});
		map.call(circleTipbox);
		
		// Point insertion into the map
		var circles = map.selectAll('circle')
			.data(transformablePointCoords)
			.enter()
			.append('circle')
				.attr('class', 'person')
				.attr('display', 'block')
				.attr('cx', d => d.x)
				.attr('cy', d => d.y)
				.attr('r', circleRadius)
				.attr('data-province-id', d => d.provinceIndex) // index of belonging province
				.attr('data-year', (_, i) => visiblePoints[i].dob) // year of birth
				.attr('data-gender', (_, i) => visiblePoints[i].gender) // gender
				.attr('data-categories', (_, i) => { // professional categories (for filtering purposes)
					var cat = visiblePoints[i].professions.categories;
					if (cat.length > 0) return JSON.stringify(cat);
					else return '["other"]';
				})
				.style('stroke', 'black')
				.style('stroke-width', 0.1)
				.style('fill', (_, i) => { // point color identifies the gender
					switch (visiblePoints[i].gender) {
						case 'maschio': return '#00BFFF';
						case 'femmina': return '#FF1493';
						default: return '#66FF66';
					}
				})
				.on('mouseover', (d, i) => {
					var idx = i;
					circleTipbox.style('background', _ => {
						switch (visiblePoints[idx].gender) {
							case 'maschio': return '#00BFFF';
							case 'femmina': return '#FF1493';
							default: return '#66FF66';
						}
					})
					circleTipbox.style('color', _ => {
						if (visiblePoints[idx].gender == 'maschio' || visiblePoints[idx].gender == 'femmina')
							return '#FFF';
						else return '#000';
					});
					circleTipbox.show(d, idx);
				}) // show tipbox at mouse hovering
				.on('mouseout', circleTipbox.hide)
				// if clicked, show detailed information in red infobox on the right
				.on('click', (_, i) => writePersonInfo(visiblePoints[i])); 
			
		// Visualize circle count (FIXME: use occupationCategories values instead of recalculation)
		var totalCircles = circles.size();
		var maleCircles = circles.filter((_, i) => visiblePoints[i].gender == 'maschio').size();
		var femaleCircles = circles.filter((_, i) => visiblePoints[i].gender == 'femmina').size();
		rangeInfoboxPointQuantity.text(totalCircles + ' persone visualizzate, ' +
								'di cui ' + maleCircles + ' uomini e ' + femaleCircles + ' donne');
		
		// Draw area chart within the year slider
		drawAreaChart(visiblePoints);
		
		// Heatmap draw
		var heatmapMaxValue = Math.max.apply(Math, birthplaceDensity.map(o => o.value)) * 100;
		heatmapInstance.setData({
			max: heatmapMaxValue,
			min: 0,
			data: transformablePointCoords
		});
		
		var heatmapDataURL = heatmapInstance.getDataURL();
		map.append('image')
			.attr('class', 'heatmap-image')
			.attr('display', 'none')
			.attr('width', _ => d3.select('.heatmap-canvas').attr('width'))
			.attr('height', _ => d3.select('.heatmap-canvas').attr('height'))
			.attr('xlink:href', heatmapDataURL);
			
		// Anti-collision animation (TODO: add time limit to prevent infinite animation)
		simulation.nodes(transformablePointCoords)
			.force('collision', d3.forceCollide().radius(circleRadius + 0.2))
			.force('x', d3.forceX(d => d.origX))
			.force('y', d3.forceY(d => d.origY))
			.force('r', d3.forceRadial(0).x(d => d.origX).y(d => d.origY))
			.on('tick', _ => {
				map.selectAll('circle')
					.attr('cx', (_, i) => transformablePointCoords[i].x)
					.attr('cy', (_, i) => transformablePointCoords[i].y);
			});
		
		// Associate event handlers to page elements
		svgMap.call(d3.zoom().on('zoom', updateTransform)),
			
		brush.on('start brush', _ => brushed(d3.event, visiblePoints))
			.on('end', _ => brushended(d3.event, visiblePoints)),
			
		brushSelection.selectAll('.overlay')
			.each(d => d.type = 'selection')
			.on('mousedown touchstart', (_, i, nodes) => brushcentered(d3.mouse(nodes[i]), visiblePoints)),
			
		d3.select('#visualization-type')
			.selectAll('input')
			.on('change', (_, i, nodes) => {
				visualizationFilterValue = nodes[i].value;
				updateVisualizedPoints(visiblePoints);
			}),
			
		d3.select('#gender-sel')
			.selectAll('input')
			.on('change', (_, i, nodes) => {
				genderFilterValue = nodes[i].value;
				updateVisualizedPoints(visiblePoints);
			});

		sliderHandle.on('onchange', val => {
				circleRadius = val;
				d3.selectAll('.person').attr('r', circleRadius);
				updateVisualizedPoints(visiblePoints);
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
// Converts string data to floating point number
function stringToFloat(str) {
	return +str;
}

function exagonalCenteredNumber(n) {
	return 1 + 3 * n * (n - 1);
}

// Given center coordinates and the position in exagonal layout, this function determines x and y coordinates for the specified position
// (Info about exagonal centered numbers here: https://w.wiki/5fx)
function getExagonalLayoutCoordinates(pointNo, x0, y0) {
	if (pointNo == 0) return {x: x0, y: y0};
	else {
		// Get minimum and maximum points for each layer
		var currentLayer = 1;
		var minPoints = exagonalCenteredNumber(currentLayer);
		var maxPoints = exagonalCenteredNumber(currentLayer+1);
		while (pointNo >= maxPoints) {
			currentLayer++;
			minPoints = exagonalCenteredNumber(currentLayer);
			maxPoints = exagonalCenteredNumber(currentLayer+1);
		}

		// Obtain edge and offset index
		var edge = Math.floor((pointNo - minPoints) / currentLayer);
		var offset = (pointNo - minPoints) % currentLayer;		// Calculate resulting x and y position
		var x = x0, y = y0;
		switch (edge) {
			case 0:
				x += circleRadius * 2 * currentLayer - circleRadius * offset;
				y -= circleRadius * 2 * offset;
				break;
			case 1:
				x += circleRadius * currentLayer - circleRadius * 2 * offset;
				y -= circleRadius * 2 * currentLayer;
				break;
			case 2:
				x -= circleRadius * currentLayer - circleRadius * offset;
				y -= circleRadius * 2 * currentLayer + circleRadius * 2 * offset;
				break;
			case 3:
				x -= circleRadius * 2 * currentLayer + circleRadius * offset;
				y += circleRadius * 2 * offset;
				break;
			case 4:
				x -= circleRadius * currentLayer + circleRadius * 2 * offset;
				y += circleRadius * 2 * currentLayer;
				break;
			case 5:
				x += circleRadius * currentLayer + circleRadius * offset;
				y += circleRadius * 2 * currentLayer - circleRadius * 2 * offset;
		}

		return {x: x, y: y};
	}
}

// Find region and province indexes (province IDs are not sorted by numeric order)
function findZoneIndexes(regionMetadataArray, provinceId) {
	var idx = 0;
	while (idx < regionMetadataArray.length) {
		var provinceArray = regionMetadataArray[idx].provinces;
		var check = provinceArray.findIndex(p => p.PID == provinceId);
		if (check < 0) idx++;
		else return { r: idx, p: check };
	}
	return { r: -1, p: -1 };
}

// Find an SVG province by x and y coordinates
function svgNodeFromCoordinates(x, y) {
	var root = document.getElementsByClassName('map-box')[0]
						.getElementsByTagName('svg')[0];
	var rootPosition = root.createSVGPoint();
	rootPosition.x = x;
	rootPosition.y = y;
	var position = rootPosition.matrixTransform(root.getScreenCTM());
	return document.elementFromPoint(position.x, position.y);
}

// Writes detailed information about a person visualized on the map
function writePersonInfo(data) {
	circleInfobox.selectAll('.section')
		.html((_, i) => {
			switch (i) {
				case 0:
					return '<b>Nome:</b> ' + data.name;
				case 1:
					return '<b>Sesso:</b> ' + data.gender;
				case 2:
					var str = '<b>Occupazioni:</b> ';
					for (idx = 0; idx < data.professions.occupations.length; idx++) {
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
					return '<b>Articolo Wikipedia:</b> <a href="' + data.article +
							'" target="_blank">' + data.article + '</a>';
			}
		});
}

// Draw area chart inside the year slider rectangle and adjust y-axis ruler
function drawAreaChart(elems) {
	var areaValues = [];
	// For every year determine how many people are born, filtering results by selected occupation category
	// or subcategory
	for (i = 1850; i < nowYear; i++) {
		var maleCircles = elems.filter(el => {
			if (el.gender == 'maschio' && el.dob == i) {
				var cat = el.professions.categories;
				if (occupationFilterSelected[0] == 'all' ||	(occupationFilterSelected[0] == 'other' && cat.length == 0))
					return true;
				else {
					for (var idx = 0; idx < cat.length; idx++) {
						if (occupationFilterSelected.findIndex(v => v == cat[idx]) >= 0)
							return true;
					}
				}
				return false;
			}
		}).length;
		var femaleCircles = elems.filter(el => {
			if (el.gender == 'femmina' && el.dob == i) {
				var cat = el.professions.categories;
				if (occupationFilterSelected[0] == 'all' || (occupationFilterSelected[0] == 'other' && cat.length == 0))
					return true;
				else {
					for (var idx = 0; idx < cat.length; idx++) {
						if (occupationFilterSelected.findIndex(v => v == cat[idx]) >= 0)
							return true;
					}
				}
				return false;
			}
		}).length;
		areaValues.push({ year: i, m: maleCircles, f: femaleCircles });
	}
	
	// Generate y-axis ruler for area chart
	var yMax = d3.max(areaValues, d => d.m > d.f ? d.m + 1 : d.f + 1);
	var y = d3.scaleLinear()
		.domain([0, yMax])
		.range([scaleH, 0]);
		
	slider.select('.y-axis').remove();
		
	slider.append('g')
		.attr('class', 'y-axis')
		.call(d3.axisLeft(y).ticks(Math.floor(yMax / 50) + 1));
				
	// Redraw area chart
	areaGraph.select('.male-graph').remove();
	areaGraph.select('.female-graph').remove();
	
	areaGraph.append('path')
		.datum(areaValues)
		.attr('class', 'male-graph')
		.attr('fill', 'rgba(0, 191, 255, 0.5)')
		.attr('stroke', 'rgba(0, 191, 255, 1)')
		.attr('stroke-width', 1.5)
		.attr('d', d3.area().x(d => x(d.year)).y0(y(0)).y1(d => y(d.m)));
		
	areaGraph.append('path')
		.datum(areaValues)
		.attr('class', 'female-graph')
		.attr('fill', 'rgba(255, 20, 147, 0.5)')
		.attr('stroke', 'rgba(255, 20, 147, 1)')
		.attr('stroke-width', 1.5)
		.attr('d', d3.area().x(d => x(d.year)).y0(y(0)).y1(d => y(d.f)));
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
					if (el.dob >= minYear && el.dob <= maxYear) {
						indexList.push(i);
						return true;
					}
				} else {
					for (var idx = 0; idx < cat.length; idx++) {
						if (occupationFilterSelected.findIndex(v => v == cat[idx]) >= 0 && el.dob >= minYear && el.dob <= maxYear) {
							indexList.push(i);
							return true;
						}
					}
				}
			}
			return false;
		})
		.attr('display', _ => { // DOTMAP MODE ONLY
			if (visualizationFilterValue == 'dotmap') return 'block';
			else return 'none';
		});
		
	// If heatmap mode is selected, show heatmap over the map (HEATMAP MODE ONLY)
	map.selectAll('image')
		.attr('display', function(d) {
			if (visualizationFilterValue == 'heatmap') return 'block';
			else return 'none';
		});
		
	// Reset province point count (DENSITY MODE ONLY)
	map.selectAll('.province')
		.attr('data-male', 0)
		.attr('data-female', 0);
	
	// Get coordinates of visualized points for collision resolving and heatmap generation
	var transformablePointCoords = [];
	var birthplaceDensity = [];
	for (var i = 0, len = indexList.length; i < len; i++) {
		var idx = indexList[i];
		var circleElement = elems[idx];

		// Precalculation of the density population for every birthplace
		var birthplaceIndex = birthplaceDensity.findIndex(v => v.place == circleElement.pob);
		if (birthplaceIndex < 0) {
			var birthplaceRecord = {
				place: circleElement.pob,
				value: 1
			};
			birthplaceDensity.push(birthplaceRecord);
			birthplaceIndex = birthplaceDensity.length - 1;
		} else birthplaceDensity[birthplaceIndex].value++;

		// Convert point coordinates in exagonal layout
		var pointNo = birthplaceDensity[birthplaceIndex].value;
		var exagonalCoords = getExagonalLayoutCoordinates(pointNo - 1, circleElement.coords.x, circleElement.coords.y);

		// For each record generate an object with initial cooordinates and a province id
		// reference: will be used in heatmap generation and dynamic collision resolving
		var dataPoint = {
			origX: circleElement.coords.x,
			origY: circleElement.coords.y,
			idx: idx,
			x: exagonalCoords.x,
			y: exagonalCoords.y,
			value: 1
		};
		transformablePointCoords.push(dataPoint);
	}
	
	// For each point, increase their belonging province's gender count by one (DENSITY MODE ONLY)
	selected.each((_, i, nodes) => {
		var element = d3.select(nodes[i]);
		var provinceId = element.attr('data-province-id');
		var province = document.querySelector('[id=\'' + provinceId + '\']');
		if (element.attr('data-gender') == 'maschio') province.dataset.male++;
		else if (element.attr('data-gender') == 'femmina') province.dataset.female++;
	});

	// Write in the infobox how many people are currently visualized (FIXME: insert values
	// from category grid)
	var totalCircles = selected.size();
	var maleCircles = selected.filter((_, i) => {
		if (i < indexList.length) {
			var idx = indexList[i];
			return elems[idx].gender == 'maschio';
		}
	}).size();
	var femaleCircles = selected.filter((_, i) => {
		if (i < indexList.length) {
			var idx = indexList[i];
			return elems[idx].gender == 'femmina';
		}
	}).size();
	rangeInfoboxPointQuantity.text(totalCircles + ' persone visualizzate, ' +
							'di cui ' + maleCircles + ' uomini e ' + femaleCircles + ' donne');
	
	// Redraw area chart inside year range slider
	drawAreaChart(elems);
	
	// Heatmap draw (HEATMAP MODE ONLY)
	var heatmapMaxValue = Math.max.apply(Math, birthplaceDensity.map(o => o.value)) * 100;
	heatmapInstance.setData({
		max: heatmapMaxValue,
		min: 0,
		data: transformablePointCoords
	});
	
	var heatmapDataURL = heatmapInstance.getDataURL();
	map.selectAll('.heatmap-image')
		.attr('xlink:href', heatmapDataURL);

	// Reset and restart collision resolver engine (DOTMAP MODE ONLY)
	simulation.stop();
	simulation.nodes(transformablePointCoords)
		.force('collision', d3.forceCollide().radius(circleRadius + 0.2))
		.force('x', d3.forceX(d => d.origX))
		.force('y', d3.forceY(d => d.origY))
		.force('r', d3.forceRadial(0).x(d => d.origX).y(d => d.origY))
		.on('tick', _ => {
			map.selectAll('circle')
				.attr('cx', (_, i) => {
					var currentIdx = indexList.findIndex(val => val == i);
					if (currentIdx >= 0) return transformablePointCoords[currentIdx].x;
				})
				.attr('cy', (_, i) => {
					var currentIdx = indexList.findIndex(val => val == i);
					if (currentIdx >= 0) return transformablePointCoords[currentIdx].y;
				});
		});
	simulation.alpha(1).restart();
	
	// Generate color density (DENSITY MODE ONLY)
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
	minYear = Math.floor(x.invert(lx));
	maxYear = Math.floor(x.invert(lx + width));
	
	// Visualize updated limits in an infobox
	rangeInfoboxYearRange.text('Intervallo nascite: dal ' + minYear + ' al ' + maxYear);
	
	// Reset occupation categories values
	for (var i = 0; i < occupationCategories.length; i++) {
		occupationCategories[i].m = 0;
		occupationCategories[i].f = 0;
		occupationCategories[i].other = 0;
	}
	 
	for (var i = 0; i < elems.length; i++) {
		var record = elems[i];
		
		if (record.dob >= minYear && record.dob <= maxYear) {
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
				for (var j = 0; j < record.professions.categories.length; j++) {
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
	brushSelection.call(brush.move, x1 > scaleW ? [scaleW - dx, scaleW] : x0 < 0 ? [0, dx] : [x0, x1]);
	
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

// Set occupation category filtering
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
