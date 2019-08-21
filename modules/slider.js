/**
 * Slider box dimensions
 */
const VIEWBOX_SLIDER_COORDINATES = {
	x: 0,
	y: 0,
	width: 1000,
	height: 100
};

/**
 * Dimensions of the year slider
 */
export class SliderDimension {
  constructor() {
    this.scaleW = VIEWBOX_SLIDER_COORDINATES.width - 100;
    this.scaleH = VIEWBOX_SLIDER_COORDINATES.height - 30;
  }

  get width() {
    return this.scaleW;
  }

  get height() {
    return this.scaleH;
  }
}

/**
 * Year limits represented by the range slider. This class provides also value difference between
 * min and max years and checks if specified value is in range.
 */
export class YearBounds {
  constructor() {
    this.minYear = 1850;
    this.maxYear = new Date().getFullYear();
  }

  get min() {
    return this.minYear;
  }

  set min(v) {
    if (typeof(v) == 'number') this.minYear = v;
  }

  get max() {
    return this.maxYear;
  }

  set max(v) {
    if (typeof(v) == 'number') this.maxYear = v;
  }

  getInterval() {
    return this.maxYear - this.minYear;
  }

  isValueInInterval(v) {
    if (typeof(v) == 'number') return v >= this.minYear && v <= this.maxYear;
    else return false;
  }
}

/**
 * Creates a new instance for year slider bar
 */
export let createSliderInstance = _ => {
  return d3.select('.slider-box')
    .append('svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', VIEWBOX_SLIDER_COORDINATES.x + ' ' + VIEWBOX_SLIDER_COORDINATES.y + ' ' +
              + VIEWBOX_SLIDER_COORDINATES.width + ' ' + VIEWBOX_SLIDER_COORDINATES.height);
}

/**
 * Creates a new instance of the x-axis scale factor.
 * 
 * @param {YearBounds} bounds - starting year bounds
 * @param {SliderDimension} dim - dimensions of the slider
 */
export let createXAxisScaleFactor = (bounds, dim) => {
  return d3.scaleLinear()
	  .domain([bounds.min, bounds.max])
	  .range([0, dim.width]);
}

/**
 * Creates a new instance of draggable x-axis selector for year slider.
 * 
 * @param {SliderDimension} dim - dimensions of the slider
 */
export let createXAxisBrush = dim => {
  return d3.brushX()
	  .extent([[0, 0], [dim.width, dim.height]]);
}

/**
 * Reserve a rectangle in specified SVG instance for slider drawing.
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} svg - The SVG instance
 */
export let createDrawableSliderBox = svg => {
  return svg.append('g')
    .attr('class', 'slider')
    .attr('transform', 'translate(30, 10)');
}

/**
 * Draw graph corresponding to the birth distribution by year inside the slider.
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} area - area of drawing
 * @param {any[]} values - birth values for each year
 * @param {ScaleLinear<number, number>} xscale - x-axis ruler
 * @param {ScaleLinear<number, number>} yscale - y-axis ruler
 */
let drawGraph = (area, values, xscale, yscale) => {
  area.select('.male-graph').remove();
	area.select('.female-graph').remove();
	
	area.append('path')
		.datum(values)
		.attr('class', 'male-graph')
		.attr('fill', 'rgba(0, 191, 255, 0.5)')
		.attr('stroke', 'rgba(0, 191, 255, 1)')
		.attr('stroke-width', 1.5)
		.attr('d', d3.area().x(d => xscale(d.year)).y0(yscale(0)).y1(d => yscale(d.m)));
		
  area.append('path')
		.datum(values)
		.attr('class', 'female-graph')
		.attr('fill', 'rgba(255, 20, 147, 0.5)')
		.attr('stroke', 'rgba(255, 20, 147, 1)')
		.attr('stroke-width', 1.5)
		.attr('d', d3.area().x(d => xscale(d.year)).y0(yscale(0)).y1(d => yscale(d.f)));
}

/**
 * Create a new draggable rectangle for year selection.
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} slider - the year slider
 * @param {BrushBehavior<any>} brush - instance of selector to be drawn
 * @param {YearBounds} bounds - year limit range
 * @param {ScaleLinear<number, number>} xscale - x-axis ruler
 */
export let createSelectionRectangle = (slider, brush, bounds, xscale) => {
  return slider.append('g')
	  .attr('class', 'brush')
	  .call(brush)
	  .call(brush.move, [bounds.min, bounds.max].map(xscale));
}

/**
 * Create two handles at the left and right border of the selection rectangle
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} selectionBox - the selection rectangle
 */
export let createSelectionHandles = selectionBox => {
  return selectionBox.selectAll('.handle--custom')
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
}

/**
 * Create a selection reset button on the right side of the slider
 * 
 * @param {Selection<SVGElement, any, HTMLElement, any>} svgSlider - the SVG slider instance
 */
export let createResetButton = svgSlider => {
  var resetBtn = svgSlider.append('g')
    .attr('transform', 'translate(950, 30)');

  resetBtn.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 30)
    .attr('height', 30)
    .style('stroke-width', '2px')
    .style('stroke', '#00cccc')
    .style('fill', '#fff');

  resetBtn.append('image')
    .attr('xlink:href', 'images/restore_img.png')
    .attr('x', 5)
    .attr('y', 5)
    .attr('width', 20)
    .attr('height', 20);

  return resetBtn;
}

/**
 * Create a ruler for the year slider.
 * 
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} slider - the SVG slider instance
 * @param {SliderDimension} dim - dimension of the slider
 * @param {ScaleLinear<number, number>} xscale - x-axis scale factor
 * @param {YearBounds} bounds - current year bounds
 */
export let createSliderRuler = (slider, dim, xscale, bounds) => {
  slider.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0, ' + dim.height + ')')
    .call(d3.axisBottom(xscale)
      .ticks(bounds.getInterval())
      .tickFormat(d => (d % 10 != 0) ? '' : d.toString()));
        
  d3.selectAll('g.x.axis g.tick line')
    .attr('y2', d => (d % 10 == 0) ? 6 : (d % 10 == 5) ? 4 : 2);
}

/**
 * Draw area chart inside the year slider rectangle and adjust y-axis ruler.
 * 
 * @param {any[]} elems - data group for which we need to extrapolate the graph
 * @param {string[]} occSelected - list of currently selected occupation groups
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} slider - the SVG slider element
 * @param {Selection<SVGSVGElement, any, HTMLElement, any>} areaGraph - area reserved for graph drawing
 * @param {ScaleLinear<number, number>} xscale - x-axis scaling factor
 * @param {SliderDimension} dim - the slider dimension values
 */
export let drawAreaChart = (elems, occSelected, slider, areaGraph, xscale, dim) => {
	var areaValues = [];
	// For every year determine how many people are born, filtering results by selected occupation category
	// or subcategory
	for (var i = 1850, max = new Date().getFullYear(); i < max; i++) {
		var maleCircles = elems.filter(el => {
			if (el.gender == 'maschio' && el.dob == i) {
				var cat = el.professions.categories;
				if (occSelected[0] == 'all' ||	(occSelected[0] == 'other' && cat.length == 0))
					return true;
				else {
					for (var idx = 0, len = cat.length; idx < len; idx++) {
						if (occSelected.findIndex(v => v == cat[idx]) >= 0)
							return true;
					}
				}
				return false;
			}
		}).length;
		var femaleCircles = elems.filter(el => {
			if (el.gender == 'femmina' && el.dob == i) {
				var cat = el.professions.categories;
				if (occSelected[0] == 'all' || (occSelected[0] == 'other' && cat.length == 0))
					return true;
				else {
					for (var idx = 0, len = cat.length; idx < len; idx++) {
						if (occSelected.findIndex(v => v == cat[idx]) >= 0)
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
	var yscale = d3.scaleLinear()
		.domain([0, yMax])
		.range([dim.height, 0]);
		
  slider.select('.y-axis').remove();
		
  slider.append('g')
		.attr('class', 'y-axis')
		.call(d3.axisLeft(yscale).ticks(Math.floor(yMax / 50) + 1));
				
	// Redraw area chart
	drawGraph(areaGraph, areaValues, xscale, yscale);
}