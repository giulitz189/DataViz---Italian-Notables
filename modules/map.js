/** 
 * Map box dimensions
 */
const VIEWBOX_MAP_COORDINATES = {
	x: 0,
	y: 0,
	width: 1000,
	height: 500
};

/**
 * Map point radius
 */
var circleRadius = 0.3;

/**
 * Getter function for circleRadius variable
 */
export let getCircleRadius = _ => circleRadius

/**
 * Setter function for circleRadius variable
 * 
 * @param {number} val - new value for circleRadius
 */
export let setCircleRadius = val => circleRadius = val;

/**
 * Create SVG container element for map
 */
export let getMapBox = _ => {
  return d3.select('.map-box')
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', VIEWBOX_MAP_COORDINATES.x + ' ' + VIEWBOX_MAP_COORDINATES.y + ' ' +
                    + VIEWBOX_MAP_COORDINATES.width + ' ' + VIEWBOX_MAP_COORDINATES.height);
}

/**
 * Create drawable bounding box for map
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} svgMap - The SVG container for the map
 */
export let getDrawableMap = svgMap => svgMap.append('g')

/**
 * Internal function for color legend creation
 */
let generateColors = _ => {
	// rows corresponds to density, columns to gender ratio
	var colorArray = [];

	for (var i = 0; i < 5; i++) {
		for (var j = 0; j < 6; j++) {
			var h = 240 + (15 * i);
			var l = 100 - (10 * j);
			var data = { row: i, column: j, color: 'hsla(' + h + ', 100%, ' + l + '%, 0.8)'};
			colorArray.push(data);
		}
	}
	return colorArray;
}

/**
 * Legend box for density map
 */
export let getDensityLegendBox = _ => {
  return d3.select('.map-box')
    .append('div')
      .attr('class', 'legend')
      .style('display', 'none');
}

/**
 * Create SVG container for density legend box
 * 
 * @param {Selection<BaseType, any, HTMLElement, any>} dlb - the density box
 */
export let getDensityLegendSvg = dlb => {
  return dlb.append('svg')
    .attr('width', 360)
    .attr('height', 165)
    .append('g')
      .attr('transform', 'translate(180, 70)');
}

/**
 * Create X-axis for density legend
 */
export let generateLegendXAxis = _ => {
  var densityValues = [0, 20, 40, 60, 80, 100];
  return d3.scaleBand()
    .range([0, 120])
    .domain(densityValues)
    .padding(0.05);
}

/**
 * Create Y-axis for density legend (this function is private because the labels of this axis does not
 * modify with different years/gender/occupation filtering)
 */
let generateLegendYAxis = _ => {
  var genderRatio = ['100% m, 0% f', '75% m, 25% f', '50% m, 50% f', '25% m, 75% f', '0% m, 100% f'];
  return d3.scaleBand()
    .range([100, 0])
    .domain(genderRatio.reverse())
    .padding(0.05);
}

/**
 * Insert legend notes over the color grid
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} dl - the density legend SVG container
 */
export let getLegendNotes = dl => {
  return dl.append('text')
    .attr('x', 0)
    .attr('y', -30)
    .attr('text-anchor', 'middle')
    .style('font-size', '13px')
    .style('font-style', 'italic')
    .style('fill', 'grey')
    .style('max-width', 400)
    .text('(m: maschio, f: femmina, max popolazione per provincia: X)');
}

/**
 * Initialize a new legend for density visualization map.
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} dl - the density legend SVG container
 * @param {ScaleBand<string>} x - ScaleBand instance for x-axis
 */
export let initDensityLegend = (dl, x) => {
  dl.append('g')
    .attr('class', 'x-axis')
    .attr('transform', 'translate(-63, 80)')
    .style('font-size', '10px')
    .call(d3.axisBottom(x).tickSize(0))
    .select('.domain').remove();

  dl.append('g')
    .style('font-size', '12px')
    .attr('transform', 'translate(55, -17)')
    .call(d3.axisRight(generateLegendYAxis()).tickSize(0))
    .select('.domain').remove();

  dl.selectAll()
    .data(_ => generateColors())
    .enter()
    .append('rect')
      .attr('x', d => (d.column * 20) - 60)
      .attr('y', d => (d.row * 20) - 15)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('width', 15)
      .attr('height', 15)
      .style('fill', d => d.color)
      .style('stroke-width', 1)
      .style('stroke', 'black');

  dl.append('text')
    .attr('x', 0)
    .attr('y', -50)
    .attr('text-anchor', 'middle')
    .style('font-size', '22px')
    .text('Distribuzione notables:');
}

/**
 * Geographical Mercator projection function for transformation path generation.
 */
export let generateProjectionPath = _ => {
  var projection = d3.geoMercator()
    .translate([VIEWBOX_MAP_COORDINATES.width/2, VIEWBOX_MAP_COORDINATES.height/2])
    .center([12, 42.1])
    .scale(1950);

  var path = d3.geoPath()
    .projection(projection);

  return path;
}

/**
 * Map drawing by path string extraction. This function refers to region shapes only.
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} map - SVG container instance of the map
 * @param {GeoPath<any, GeoPermissibleObjects>} projectionPath - path of the geographical projection applied to the map
 * @param {any} shapes - TopoJSON objects array corresponding to region shapes data
 * @param {any} metadata - JSON object containing region metadata (IDs, names, etc.)
 */
export let generateRegions = (map, projectionPath, shapes, metadata) => {
  map.selectAll('.region')
    .data(topojson.feature(shapes, shapes.objects.sub).features)
    .enter()
    .append('path')
      .attr('class', 'region')
      .attr('id', (_, i) => metadata[i].regionLabel)
      .attr('d', projectionPath);
}

/**
 * Find region and province indexes (province IDs are not sorted by numeric order)
 * 
 * @param {any[]} metadataArray - array for region and province metadata records
 * @param {string} provinceId - ID number of specified province
 */
let findZoneIndexes = (metadataArray, provinceId) => {
	var idx = 0;
	while (idx < metadataArray.length) {
		var provinceArray = metadataArray[idx].provinces;
		var check = provinceArray.findIndex(p => p.PID == provinceId);
		if (check < 0) idx++;
		else return { r: idx, p: check };
	}
	return { r: -1, p: -1 };
}

/**
 * Map drawing by path string extraction - Provinces
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} map - SVG container instance of the map
 * @param {GeoPath<any, GeoPermissibleObjects>} projectionPath - path of the geographical projection applied to the map
 * @param {any[]} shapesArray - array containing TopoJSON province shape data for every region
 * @param {any} metadata - JSON object containing province metadata (IDs, names, etc.)
 */
export let generateProvinces = (map, projectionPath, shapesArray, metadata) => {
  for (var i = 0, len = shapesArray.length; i < len; i++) {
    map.selectAll('.prov')
      .data(topojson.feature(shapesArray[i], shapesArray[i].objects.sub).features)
      .enter()
      .append('path')
        .attr('class', 'province')
        .attr('id', d => d.id) // IDs are used to further accesses
        .attr('d', projectionPath)
        .attr('data-name', d => { // add province name as HTML5 dataset metadata
          var provinceIndex = findZoneIndexes(metadata, d.id);
          return metadata[provinceIndex.r].provinces[provinceIndex.p].provinceLabel;
        })
        .attr('data-population', d => { // add total population as HTML5 dataset metadata
          var provinceIndex = findZoneIndexes(metadata, d.id);
          return metadata[provinceIndex.r].provinces[provinceIndex.p].population;
        })
        .attr('data-male', 0) // no. of male notable people, initialized to 0
        .attr('data-female', 0) // no. of female notable people, initialized to 0
  }
}

/**
 * Provide tip info for every province
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} map - SVG container object for map instance
 */
export let generateProvinceTipbox = map => {
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
}

/**
 * Create and returns a new instance of tipbox, dedicated to people information and initially hidden.
 * 
 * @param {any[]} peopleArray - array containing record info about people
 */
export let createCircleTipbox = peopleArray => {
  return d3.tip()
    .attr('class', 'd3-tip')
    .attr('id', 'circle-tip')
    .html((_, i) => {
      var genderLetter = '';
      switch (peopleArray[i].gender) {
        case 'maschio': genderLetter = 'M';
                break;
        case 'femmina': genderLetter = 'F';
                  break;
        default: genderLetter = 'X';
              break;
      }
      if (peopleArray[i].dod > 0) {
        return peopleArray[i].name + ' (' + genderLetter + ')</br>' + peopleArray[i].pob +
          ' ' + peopleArray[i].dob + ' - ' + peopleArray[i].dod;
      } else {
        return peopleArray[i].name + ' (' + genderLetter + ')</br>' + peopleArray[i].pob +
          ' ' + peopleArray[i].dob + ' -';
      }
    });
}

/**
 * Inserts an array of points in the specified map instance, adding infos from metadata array to be visualized by tipbox.
 * 
 * @param  {Selection<SVGSVGElement, any, HTMLElement, any>} map - SVG map instance
 * @param  {any[]} coords - array for coordinates and other map information
 * @param  {any[]} metadata - array for metadata people information
 * @param  {any} tipbox - tipbox instance for circles
 */
export let insertPointArray = (map, coords, metadata, tipbox) => {
  return map.selectAll('circle')
    .data(coords)
    .enter()
    .append('circle')
      .attr('class', 'person')
      .attr('display', 'block')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', circleRadius)
      .attr('data-province-id', d => d.provinceIndex) // index of belonging province
      .attr('data-year', (_, i) => metadata[i].dob) // year of birth
      .attr('data-gender', (_, i) => metadata[i].gender) // gender
      .attr('data-categories', (_, i) => { // professional categories (for filtering purposes)
        var cat = metadata[i].professions.categories;
        if (cat.length > 0) return JSON.stringify(cat);
        else return '["other"]';
      })
      .style('stroke', 'black')
      .style('stroke-width', 0.1)
      .style('fill', (_, i) => { // point color identifies the gender
        switch (metadata[i].gender) {
          case 'maschio': return '#00BFFF';
          case 'femmina': return '#FF1493';
          default: return '#66FF66';
        }
      })
      .on('mouseover', (d, i) => {
        var idx = i;
        tipbox.style('background', _ => {
          switch (metadata[idx].gender) {
            case 'maschio': return '#00BFFF';
            case 'femmina': return '#FF1493';
            default: return '#66FF66';
          }
        })
        tipbox.style('color', _ => {
          if (metadata[idx].gender == 'maschio' || metadata[idx].gender == 'femmina')
            return '#FFF';
          else return '#000';
        });
        tipbox.show(d, idx);
      }) // show tipbox at mouse hovering
      .on('mouseout', tipbox.hide)
}

/**
 * Finds the n-th exagonal centered number (further infos here: https://w.wiki/5fx)
 * 
 * @param {number} n - grade of the exagonal number
 */
let exagonalCenteredNumber = n => 1 + 3 * n * (n - 1)

/**
 * Given center coordinates and the position in exagonal layout, this function determines x and y coordinates
 * for the specified position
 * 
 * @param {number} pointNo - cardinal number of the position
 * @param {number} x0 - starting x-axis coordinate
 * @param {number} y0 - starting y-axis coordinate
 */
export let getExagonalLayoutCoordinates = (pointNo, x0, y0) => {
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
		switch (edge) {
			case 0:
				var x = x0 + (((circleRadius * 1.5) * 2) * currentLayer) - ((circleRadius * 1.5) * offset);
				var y = y0 - (((circleRadius * 1.5) * 2) * offset);
				break;
			case 1:
				var x = x0 + ((circleRadius * 1.5) * currentLayer) - (((circleRadius * 1.5) * 2) * offset);
				var y = y0 - (((circleRadius * 1.5) * 2) * currentLayer);
				break;
			case 2:
				var x = x0 - ((circleRadius * 1.5) * currentLayer) - ((circleRadius * 1.5) * offset);
				var y = y0 - (((circleRadius * 1.5) * 2) * currentLayer) + (((circleRadius * 1.5) * 2) * offset);
				break;
			case 3:
				var x = x0 - (((circleRadius * 1.5) * 2) * currentLayer) + ((circleRadius * 1.5) * offset);
				var y = y0 + (((circleRadius * 1.5) * 2) * offset);
				break;
			case 4:
				var x = x0 - ((circleRadius * 1.5) * currentLayer) + (((circleRadius * 1.5) * 2) * offset);
				var y = y0 + (((circleRadius * 1.5) * 2) * currentLayer);
				break;
			case 5:
				var x = x0 + ((circleRadius * 1.5) * currentLayer) + ((circleRadius * 1.5) * offset);
				var y = y0 + (((circleRadius * 1.5) * 2) * currentLayer) - (((circleRadius * 1.5) * 2) * offset);
		}

		return {x: x, y: y};
	}
}

/**
 * Find an SVG province by x and y coordinates
 * 
 * @param {number} x - x-axis coordinate of the position
 * @param {number} y - y-axis coordinate of the position
 */
export let svgNodeFromCoordinates = (x, y) => {
	var root = document.getElementsByClassName('map-box')[0]
						.getElementsByTagName('svg')[0];
	var rootPosition = root.createSVGPoint();
	rootPosition.x = x;
	rootPosition.y = y;
	var position = rootPosition.matrixTransform(root.getScreenCTM());
	return document.elementFromPoint(position.x, position.y);
}

/**
 * Get coordinates of visualized points for collision resolving
 * 
 * @param {number[]} idxList - list of indexes of all the selected items
 * @param {any[]} elems - list of all points in the map
 */
export let getDerivatedCoords = (idxList, elems) => {
	var transformablePointCoords = [];
	var birthplaceDensity = [];

	for (var i = 0, len = idxList.length; i < len; i++) {
		var idx = idxList[i];
		var circleElement = elems[idx];

		// Precalculation of the density population for every birthplace
		var birthplaceIndex = birthplaceDensity.findIndex(v => v.place == circleElement.pob);
		if (birthplaceIndex < 0) {
			var birthplaceRecord = {
				place: circleElement.pob,
				x: circleElement.coords.x,
				y: circleElement.coords.y,
				value: 1
			};
			birthplaceDensity.push(birthplaceRecord);
			birthplaceIndex = birthplaceDensity.length - 1;
		} else birthplaceDensity[birthplaceIndex].value++;

		// Convert point coordinates in exagonal layout
		var pointNo = birthplaceDensity[birthplaceIndex].value;
		var exagonalCoords = getExagonalLayoutCoordinates(pointNo - 1, circleElement.coords.x, circleElement.coords.y);

		// For each record generate an object with initial cooordinates and a province id
		// reference: will be used in dynamic collision resolving
		var dataPoint = {
			origX: circleElement.coords.x,
			origY: circleElement.coords.y,
			idx: idx,
			x: exagonalCoords.x,
			y: exagonalCoords.y,
		};
		transformablePointCoords.push(dataPoint);
	}

	return { tpc: transformablePointCoords, bd: birthplaceDensity };
}