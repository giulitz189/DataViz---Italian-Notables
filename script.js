// PRELOAD PHASE
// Map box
var viewBox_map = {
	x: 0,
	y: 0,
	width: 1000,
	height: 500
};

var offset = {
	x: 0,
	y: 0
}

var svg_map = d3.select(".map")
	.append("svg")
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("viewBox", viewBox_map.x + " " + viewBox_map.y + " " +
					+ viewBox_map.width + " " + viewBox_map.height);

var map = svg_map.append("g");
	
var projection = d3.geoMercator()
	.translate([viewBox_map.width/2, viewBox_map.height/2])
	.center([12, 42.1])
	.scale(1950);
	
var path = d3.geoPath()
	.projection(projection);
	
// Slider sector
var viewBox_slide = {
	x: 0,
	y: 0,
	width: 1000,
	height: 100
};

var labels = d3.range(0, 18).map(function(d) {
	return 1850 + (10 * d);
});

var svg_sldr = d3.select(".slider-box")
	.append("svg")
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("viewBox", viewBox_slide.x + " " + viewBox_slide.y + " " +
					+ viewBox_slide.width + " " + viewBox_slide.height);
	
var x = d3.scaleLinear()
	.domain([d3.min(labels), d3.max(labels)])
	.range([0, (viewBox_slide.width - 100)])
	.clamp(true);
	
var slider = svg_sldr.append("g")
	.attr("class", "slider")
	.attr("transform", "translate(50, 50)");
	
slider.append("line")
		.attr("class", "track")
		.attr("x1", x.range()[0])
		.attr("x2", x.range()[1])
	.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-inset")
	.select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
		.attr("class", "track-overlay")
		.call(d3.drag()
			.on("start.interrupt", function() { slider.interrupt(); })
			.on("start drag", function() { update(x.invert(d3.event.x)); })
		),
		
slider.insert("g", ".track-overlay")
		.attr("class", "ticks")
		.attr("transform", "translate(0, " + 18 + ")")
	.selectAll("text")
	.data(x.ticks(18))
	.enter().append("text")
		.attr("x", x)
		.attr("text-anchor", "middle")
		.text(function(d) { return d; });
		
var handle = slider.insert("circle", ".track-overlay")
	.attr("class", "handle")
	.attr("r", 8);
	
function update(v) {
	handle.attr("cx", x(v));
}

// UI Selector - Coming soon...
	
// DATA LOAD PHASE
var mapData = d3.json("https://giulitz189.github.io/geodata/italy_reg.json");
var queryData = d3.json("https://giulitz189.github.io/query_records/query_results.json");

Promise.all([mapData, queryData]).then(function(data) {
	// map clipping
	svg_map.append("defs")
		.append("clipPath")
			.attr("id", "italy-borders")
		.selectAll("path")
		.data(topojson.feature(data[0], data[0].objects.sub).features)
		.enter()
		.append("path")
			.attr("d", path),
	
	// draw map
	map.selectAll("path")
		.data(topojson.feature(data[0], data[0].objects.sub).features)
		.enter()
		.append("path")
			.attr("class", "region")
			.attr("d", path),
		
	// draw point
	map.selectAll("circle")
		.data(data[1].results)
		.enter()
		.append("circle")
			.attr("class", "circles")
			.attr("cx", function(d) {
				var pt = d.coords;
				return projection([pt.x, pt.y])[0];
			})
			.attr("cy", function(d) {
				var pt = d.coords;
				return projection([pt.x, pt.y])[1];
			})
			.attr("r", "1px")
			.attr("fill", function(d) {
				switch (d.gender) {
					case "male": return "#0099FF";
					case "female": return "#FF00FF";
					default: return "#66FF66";
				}
			})
			.attr("clip-path", "url(#italy-borders)");
			
	var circles = map.selectAll(".circles");
	circles.append("name")
		.text(function (d, i) { return data[1].results[i].name; }),
	circles.append("dob")
		.text(function (d, i) { return data[1].results[i].dob; }),
	circles.append("dod")
		.text(function (d, i) { return data[1].results[i].dod; }),
	circles.append("article")
		.text(function (d, i) { return data[1].results[i].article; });
		
	// event handling
	var transform = d3.zoomIdentity;
	transform.x = projection.translate()[0];
	transform.y = projection.translate()[1];
	transform.k = projection.scale();
	
	function updateTransform() {
		transform = d3.event.transform;
		projection.translate([transform.x, transform.y]).scale(transform.k);
	
		// Apply to clip-path and map path
		svg_map.selectAll("path").attr("d", path),
	
		// Apply to points
		map.selectAll(".circles")
			.attr("cx", function(d, i) {
				var pt = data[1].results[i].coords;
				return projection([pt.x, pt.y])[0];
			})
			.attr("cy", function(d, i) {
				var pt = data[1].results[i].coords;
				return projection([pt.x, pt.y])[1];
			});
	}
	
	svg_map.call(d3.zoom().scaleExtent([1, 10]).on("zoom", updateTransform))
		.call(d3.drag().on("drag", updateTransform));
});