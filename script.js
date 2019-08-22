import * as mapUtils from './modules/map.js';
import * as sliderUtils from './modules/slider.js';
import * as selectorUtils from './modules/selectors.js';

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
// Circular handle
var sliderHandle = selectorUtils.addCircularHandle(circleRadius);
	
// Graphic container of the slider
var radiusSelectorGraphicContainer = selectorUtils.addRadiusRegulator();

// Filtering values, respectively for type of visualization and gender
var VisualizationMode = selectorUtils.VisualizationMode;
var Gender = selectorUtils.Gender;

var visualizationFilterValue = VisualizationMode.DOTMAP;
var genderFilterValue = Gender.ALL;

// Circle infobox
var circleInfobox = selectorUtils.addCircleInfobox();
	
// Data range infobox
var rangeInfoboxYearRange = selectorUtils.addYearRangeLine(yearBounds);
var rangeInfoboxPointQuantity = selectorUtils.addPointQuantityLine();

// Occupation grid selector
var occCats = selectorUtils.occupationCategories;

// Drawing the grid (TODO: can we convert this grid into an hidden checkbox field?)
var grid = selectorUtils.drawGridBorder();
selectorUtils.createRowsAndColumns(grid);
		
// Filling all cells
selectorUtils.fillOccupationDataCells(occCats);
	
// Occupation categories currently selected
var occupationFilterSelected = {
	index: 0,
	categoryList: ['all']
}
	
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
				if (record.gender == 'maschio') occCats[0].m++;
				else if (record.gender == 'femmina') occCats[0].f++;
				else occCats[0].other++;
				
				// For each occupation category and subcategory in which this record belongs, increment
				// respective filter value by one (FIXME: don't count records multiple times in categories)
				if (record.professions.categories.length == 0) {
					var l = occCats.length;
					if (record.gender == 'maschio') occCats[l-1].m++;
					else if (record.gender == 'femmina') occCats[l-1].f++;
					else occCats[l-1].other++;
				} else {
					var previousCategoryIndex = -1;
					for (var j = 0, len2 = record.professions.categories.length; j < len2; j++) {
						var currentSubcategory = record.professions.categories[j];
						var idx = occCats.findIndex(cat => cat.name == currentSubcategory);
						var categoryIndex = idx;
						while (occCats[categoryIndex].type != 'category') categoryIndex--;
						if (record.gender == 'maschio') {
							occCats[idx].m++;
							if (previousCategoryIndex != categoryIndex) {
								occCats[categoryIndex].m++;
								previousCategoryIndex = categoryIndex;
							}
						} else if (record.gender == 'femmina') {
							occCats[idx].f++;
							if (previousCategoryIndex != categoryIndex) {
								occCats[categoryIndex].f++;
								previousCategoryIndex = categoryIndex;
							}
						} else {
							occCats[idx].other++;
							if (previousCategoryIndex != categoryIndex) {
								occCats[categoryIndex].other++;
								previousCategoryIndex = categoryIndex;
							}
						}
					}
				}
			}
		}
		
		// Write occupation filter grid values
		selectorUtils.fillMaleCountCells(occCats);
		selectorUtils.fillFemaleCountCells(occCats);
		selectorUtils.fillOtherCountCells(occCats);
		
		// Creating tipbox for circles
		var circleTipbox = mapUtils.createCircleTipbox(visiblePoints);
		map.call(circleTipbox);
		
		// Point insertion into the map
		var circles = mapUtils.insertPointArray(map, transformablePointCoords, visiblePoints, circleTipbox, circleRadius);
		// if clicked, show detailed information in red infobox on the right
		circles.on('click', (_, i) => selectorUtils.writePersonInfo(visiblePoints[i], circleInfobox));
			
		// Visualize circle count
		var maleCircles = occCats[0].m;
		var femaleCircles = occCats[0].f;
		var totalCircles = maleCircles + femaleCircles + occCats[0].other;
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
		svgMap.call(d3.zoom().on('zoom', _ => map.attr('transform', d3.event.transform)));
			
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
				switch (nodes[i].value) {
					case 'dotmap':
						visualizationFilterValue = VisualizationMode.DOTMAP;
						break;
					case 'density':
						visualizationFilterValue = VisualizationMode.DENSITY;
						break;
					default: ;
				}
				nodes[i].value;
				updateVisualizedPoints(visiblePoints);
			});
			
		d3.select('#gender-sel')
			.selectAll('input')
			.on('change', (_, i, nodes) => {
				switch (nodes[i].value) {
					case 'all':
						genderFilterValue = Gender.ALL;
						break;
					case 'maschio':
						genderFilterValue = Gender.MALE;
						break;
					case 'femmina':
						genderFilterValue = Gender.FEMALE;
						break;
					default: ;
				}
				updateVisualizedPoints(visiblePoints);
			});

		sliderHandle.on('onchange', val => {
			circleRadius.radius = val;
			if (visualizationFilterValue == VisualizationMode.DOTMAP) updateVisualizedPoints(visiblePoints);
		});
		radiusSelectorGraphicContainer.call(sliderHandle);
		
		d3.selectAll('.row')
			.on('click', (_, i) => {
				occupationFilterSelected.index = i;
				selectorUtils.gridSelection(grid, i, occupationFilterSelected);
				updateVisualizedPoints(visiblePoints);
			});
	});
});

// UTILITY FUNCTIONS
/**
 * Update procedure for all visualized data.
 * 
 * @param {any[]} elems - list of all people on the map
 */
let updateVisualizedPoints = elems => {
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
			if (genderFilterValue == Gender.ALL || el.gender == Gender.properties[genderFilterValue].radio_value) {
				var cat = el.professions.categories;
				if (occupationFilterSelected.categoryList[0] == 'all' || (occupationFilterSelected.categoryList[0] == 'other' && cat.length == 0)) {
					if (yearBounds.isValueInInterval(el.dob)) {
						indexList.push(i);
						return true;
					}
				} else {
					for (var idx = 0, len = cat.length; idx < len; idx++) {
						if (occupationFilterSelected.categoryList.findIndex(v => v == cat[idx]) >= 0 && yearBounds.isValueInInterval(el.dob)) {
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

	// Write in the infobox how many people are currently visualized
	var maleCircles = occCats[occupationFilterSelected.index].m;
	var femaleCircles = occCats[occupationFilterSelected.index].f;
	var totalCircles = maleCircles + femaleCircles + occCats[occupationFilterSelected.index].other;
	rangeInfoboxPointQuantity.text(totalCircles + ' persone visualizzate, ' +
							'di cui ' + maleCircles + ' uomini e ' + femaleCircles + ' donne');
	
	// Redraw area chart inside year range slider
	sliderUtils.drawAreaChart(elems, occupationFilterSelected, slider, areaGraph, x, sliderDim);

	simulation.stop();
	if (visualizationFilterValue == VisualizationMode.DOTMAP) {
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
	} else if (visualizationFilterValue == VisualizationMode.DENSITY) {
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
				if (visualizationFilterValue == VisualizationMode.DENSITY) {
					var province = d3.select(nodes[i]).node();
					var m = parseInt(province.dataset.male);
					var f = parseInt(province.dataset.female);
					var total = m + f;

					if (maxProvincePeopleNo > 0 && total > 0) {
						var h = 240 + Math.floor(60 * (f / total));
						var l = 100 - Math.ceil(50 * (total / maxProvincePeopleNo));
						switch (genderFilterValue) {
							case Gender.MALE:
								l = 100 - Math.ceil(50 * (m / maxProvincePeopleNo));
								return 'hsla(240, 100%, ' + l + '%, 0.8)';
							case Gender.FEMALE:
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
/**
 * Modifies birthyear limits.
 * 
 * @param {any[]} elems - list of all people on the map
 */
let getYearLimits = elems => {
	// Update min and max limits
	var lx = +d3.select('.selection').attr('x'),
			width = +d3.select('.selection').attr('width');
	yearBounds.min = Math.floor(x.invert(lx));
	yearBounds.max = Math.floor(x.invert(lx + width));
	
	// Visualize updated limits in an infobox
	rangeInfoboxYearRange.text('Intervallo nascite: dal ' + yearBounds.min + ' al ' + yearBounds.max);
	
	// Reset occupation categories values
	for (var i = 0, len = occCats.length; i < len; i++) {
		occCats[i].m = 0;
		occCats[i].f = 0;
		occCats[i].other = 0;
	}
	 
	for (var i = 0, len1 = elems.length; i < len1; i++) {
		var record = elems[i];
		
		if (yearBounds.isValueInInterval(record.dob)) {
			// Increment "ALL" occupation filter value by one
			if (record.gender == 'maschio') occCats[0].m++;
			else if (record.gender == 'femmina') occCats[0].f++;
			else occCats[0].other++;
			
			// For each occupation category and subcategory in which this record belongs, increment
			// respective filter value by one (FIXME: don't count records multiple times in categories)
			if (record.professions.categories.length == 0) {
				var l = occCats.length;
				if (record.gender == 'maschio') occCats[l-1].m++;
				else if (record.gender == 'femmina') occCats[l-1].f++;
				else occCats[l-1].other++;
			} else {
				var previousCategoryIndex = -1;
				for (var j = 0, len2 = record.professions.categories.length; j < len2; j++) {
					var currentSubcategory = record.professions.categories[j];
					var idx = occCats.findIndex(cat => cat.name == currentSubcategory);
					var categoryIndex = idx;
					while (occCats[categoryIndex].type != 'category') categoryIndex--;
					if (record.gender == 'maschio') {
						occCats[idx].m++;
						if (previousCategoryIndex != categoryIndex) {
							occCats[categoryIndex].m++;
							previousCategoryIndex = categoryIndex;
						}
					} else if (record.gender == 'femmina') {
						occCats[idx].f++;
						if (previousCategoryIndex != categoryIndex) {
							occCats[categoryIndex].f++;
							previousCategoryIndex = categoryIndex;
						}
					} else {
						occCats[idx].other++;
						if (previousCategoryIndex != categoryIndex) {
							occCats[categoryIndex].other++;
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
			return '' + occCats[idx].m;
		});
		
	d3.selectAll('.cell')
		.filter((_, i, nodes) => d3.select(nodes[i]).attr('data-type') == 'female-count')
		.select('text')
		.text((_, i, nodes) => {
			var el = d3.select(nodes[i]).node().parentNode;
			var idx = el.dataset.rowId;
			return '' + occCats[idx].f;
		});
		
	d3.selectAll('.cell')
		.filter((_, i, nodes) => d3.select(nodes[i]).attr('data-type') == 'other-count')
		.select('text')
		.text((_, i, nodes) => {
			var el = d3.select(nodes[i]).node().parentNode;
			var idx = el.dataset.rowId;
			return '' + occCats[idx].other;
		});
	
	// Apply to points
	updateVisualizedPoints(elems);
}

/**
 * Year range slider event handler for click on unselected spaces.
 * 
 * @param {[number, number]} mouseEvt - event coordinates of the mouse
 * @param {any[]} elems - list of all people on the map
 */
let brushcentered = (mouseEvt, elems) => {
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

/**
 * Year range slider mousein event handler
 * 
 * @param {any} evt - event object
 * @param {any[]} elems - list of all people on the map
 */
let brushed = (evt, elems) => {
	if (!evt.selection) return;
	brushHandle.attr('x', d => {
		if (d.type == 'w')
			return (parseInt(d3.select('.handle--w').attr('x')) + 2.5);
		else return (parseInt(d3.select('.handle--e').attr('x')) + 1);
	});
	
	getYearLimits(elems);
}

/**
 * Year range slider mouseout event handler
 * 
 * @param {any} evt - event object
 * @param {any[]} elems - list of all people on the map
 */
let brushended = (evt, elems) => {
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