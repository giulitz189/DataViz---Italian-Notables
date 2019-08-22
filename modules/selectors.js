/**
 * Enumerator for visualization mode.
 */
export var VisualizationMode = {
  DOTMAP: 1,
  DENSITY: 2,
};

/**
 * Enumerator for gender.
 */
export var Gender = {
  ALL: 0,
  MALE: 1,
  FEMALE: 2,
  properties: {
    0: {radio_value: 'all', code: 0},
    1: {radio_value: 'maschio', code: 1},
    2: {radio_value: 'femmina', code: 2}
  }
};

/**
 * List of all occupation categories and subcategories, with an internal counting system.
 */
export var occupationCategories = [
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

/**
 * Javascript class for Wikidata query dispatcher
 */
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

/**
 * Add a new instance of radius regulator in selectors box.
 */
export let addRadiusRegulator = _ => {
  return d3.select('.selector')
    .append('div')
      .attr('class', 'section')
      .text('Raggio dei punti:')
    .append('div')
      .attr('class', 'radius-slider')
    .append('svg')
      .attr('width', '200')
      .attr('height', '50')
    .append('g')
      .attr('transform', 'translate(20, 10)');
}

/**
 * Add a handle of circular shape to the radius regulator.
 * 
 * @param {mapUtils.CircleRadius} radius - radius of all points on the map
 */
export let addCircularHandle = radius => {
  // Tick values, and possible choices for circle radius
  var radiusOptions = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

  // Circular handle
  return d3.sliderBottom()
    .min(d3.min(radiusOptions))
    .max(d3.max(radiusOptions))
    .width(160)
    .tickFormat(d3.format('.1'))
    .ticks(9)
    .default(radius.radius)
    .handle(
      d3.symbol()
        .type(d3.symbolCircle)
        .size(100)()
    );
}

/**
 * Adds a new infobox for people data visualization.
 */
export let addCircleInfobox = _ => {
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

  return circleInfobox;
}

/**
 * Add year range information inside the infobox.
 * 
 * @param {sliderUtils.YearBounds} bounds 
 */
export let addYearRangeLine = bounds => {
  return d3.select('.rangeInfo')
    .append('div')
      .attr('class', 'section')
      .text('Intervallo nascite: dal ' + bounds.min + ' al ' + bounds.max);
}

/**
 * Add point count inside the infobox.
 */
export let addPointQuantityLine = _ => {
  return d3.select('.rangeInfo')
    .append('div')
      .attr('class', 'section');
}

/**
 * This function generates the grid layout, returns an array that contain infos about dimension and position
 * of every cell.
 */
let generateGridLayout = _ => {
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

/**
 * Draws the outer border of the occupation grid.
 */
export let drawGridBorder = _ => {
  return d3.select('#occ-select-grid')
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
}

/**
 * Draw rows and columns of the occupation grid.
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} grid - the empty grid to be filled
 */
export let createRowsAndColumns = grid => {
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
}

/**
 * Fill cells of the occupation grid with data contained in the specified structure.
 * 
 * @param {any} occCats - the occupation categories structure
 */
export let fillOccupationDataCells = occCats => {
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
      if (occCats[idx].type == 'category') return 'bold';
      else return 'normal';
    })
    .style('font-style', (_, i, nodes) => {
      var el = d3.select(nodes[i]).node().parentNode;
      var idx = el.dataset.rowId;
      if (occCats[idx].type == 'special') return 'italic';
      else return 'normal';
    })
    .text((_, i, nodes) => {
      var el = d3.select(nodes[i]).node().parentNode;
      var idx = el.dataset.rowId;
      return occCats[idx].name;
    });

  if (navigator.userAgent.indexOf("Edge") != -1) cellsText.attr('dy', 4.5);
  else cellsText.attr('dominant-baseline', 'middle');
}

/**
 * Fill count cells reserved for male gender.
 * 
 * @param {any} occCats - instance of the occupation category structure
 */
export let fillMaleCountCells = occCats => {
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
      return '' + occCats[idx].m;
    });

    if (navigator.userAgent.indexOf("Edge") != -1) occupationMaleCount.attr('dy', 4.5);
    else occupationMaleCount.attr('dominant-baseline', 'middle');
}

/**
 * Fill count cells reserved for female gender.
 * 
 * @param {any} occCats - instance of the occupation category structure
 */
export let fillFemaleCountCells = occCats => {
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
      return '' + occCats[idx].f;
    });

  if (navigator.userAgent.indexOf("Edge") != -1) occupationFemaleCount.attr('dy', 4.5);
  else occupationFemaleCount.attr('dominant-baseline', 'middle');
}

/**
 * Fill count cells reserved for other genders.
 * 
 * @param {any} occCats - instance of the occupation category structure
 */
export let fillOtherCountCells = occCats => {
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
      return '' + occCats[idx].other;
    });
  
  if (navigator.userAgent.indexOf("Edge") != -1) occupationOtherCount.attr('dy', 4.5);
  else occupationOtherCount.attr('dominant-baseline', 'middle');
}

/**
 * Function that fetch from Wikidata all Wikipedia links of a specific person.
 * 
 * @param {any} data - record of the person to search
 */
let fetchArticle = data => {
	var endpointUrl = 'https://query.wikidata.org/sparql';
	var sparqlQuery = 'SELECT ?articolo WHERE {\
	  VALUES (?persona) {(wd:' + data.wiki_id + ')}\
	  ?articolo schema:about ?persona.\
	  FILTER (SUBSTR(str(?articolo), 11, 15) = ".wikipedia.org/").\
	}';

	var queryDispatcher = new SPARQLQueryDispatcher(endpointUrl);
	return queryDispatcher.query(sparqlQuery);
}

/**
 * Writes detailed information about a person visualized on the map.
 * 
 * @param {any} data - record from which extrapolate data to visualize
 * @param {Selection<BaseType, any, HTMLElement, any>} infobox - the people infobox
 */
export let writePersonInfo = (data, infobox) => {
	var fetchedRecords = fetchArticle(data); // Treat fetchArticle funcion as a Promise in order to wait for results
	Promise.all([fetchedRecords]).then(articles => {
		infobox.selectAll('.section')
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

/**
 * Set occupation category filtering.
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} grid - the occupation category grid
 * @param {number} rowId - identification number of the selected row
 * @param {any} selectedOccs - list of all selected options on the grid
 */
export let gridSelection = (grid, rowId, selectedOccs) => {
	grid.selectAll('rect')
		.attr('fill', '#fff')
		
  selectedOccs.categoryList = [];
	d3.selectAll('.cell')
		.filter((_, i, nodes) => {
			var id = d3.select(nodes[i]).attr('data-row-id');
			return parseInt(id) == rowId;
		})
		.selectAll('rect')
		.attr('fill', '#00cccc');
	
	if (rowId == 0) selectedOccs.categoryList.push('all');
	else if (rowId == occupationCategories.length - 1) selectedOccs.categoryList.push('other');
	else {
		if (occupationCategories[rowId].type == 'category') {
			var lastSubcategoryId = rowId + 1;
			while (occupationCategories[lastSubcategoryId].type == 'subcategory') {
				selectedOccs.categoryList.push(occupationCategories[lastSubcategoryId].name);
				lastSubcategoryId++;
			}
			d3.selectAll('.cell')
				.filter((_, i, nodes) => {
					var id = d3.select(nodes[i]).attr('data-row-id');
					return parseInt(id) > rowId && parseInt(id) < lastSubcategoryId;
				})
				.selectAll('rect')
				.attr('fill', '#97eaea');
		} else selectedOccs.categoryList.push(occupationCategories[rowId].name);
	}
}