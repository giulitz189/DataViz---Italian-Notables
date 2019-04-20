// INITIALIZATION PHASE
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

var circle_rad = 1;

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
	
var transform = d3.zoomIdentity;
transform.x = projection.translate()[0];
transform.y = projection.translate()[1];
transform.k = projection.scale();

var isDragging = false;
	
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
		.attr("class", "track-overlay"),
		
slider.insert("g", ".track-overlay")
		.attr("class", "ticks")
		.attr("transform", "translate(0, " + 18 + ")")
	.selectAll("text")
	.data(x.ticks(18))
	.enter().append("text")
		.attr("x", x)
		.attr("text-anchor", "middle")
		.text(function(d) { return d; });
		
var handle_lx = slider.insert("circle", ".track-overlay")
	.attr("class", "handle")
	.attr("cx", x(d3.min(labels)))
	.attr("r", 8);
	
var handle_rx = slider.insert("circle", ".track-overlay")
	.attr("class", "handle")
	.attr("cx", x(d3.max(labels)))
	.attr("r", 8);
	
var minYear = x.invert(+handle_lx.attr("cx"));
var maxYear = x.invert(+handle_rx.attr("cx"));

// UI Selector - Coming soon...
	
// DATA LOAD PHASE
var mapData = d3.json("https://giulitz189.github.io/geodata/italy_reg.json");
var queryData = d3.json("https://giulitz189.github.io/query_records/query_results.json");
var heatmapData = d3.json("https://giulitz189.github.io/region_dimensions.json");

Promise.all([mapData, queryData, heatmapData]).then(function(data) {
	var htd = data[2].regions.sort(function (a, b) {
		a = a.FID;
		b = b.FID;
		return a < b ? -1 : a > b ? 1 : 0;
	});
	
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
			.attr("d", path);
		
	// draw point
	var male_points = d3.path();
	var female_points = d3.path();
	var other_points = d3.path();
	
	function assignPointToRegion(x, y, gender) {
		var isAssigned = false;
		var idx = 0;
		while (!isAssigned && idx < htd.length) {
			var regionElem = map.selectAll(".region").select(function (d, i) {
				return i == idx ? this : null;
			});
			if (pointInSvgPath(regionElem.attr("d"), x, y)) {
				if (gender == "male") htd[idx].number_of_people[0]++;
				else if (gender == "female") htd[idx].number_of_people[1]++;
				isAssigned = true;
			} else idx++;
		}
	}
	
	data[1].results.forEach(function (r) {
		var ptx = projection([r.coords.x, r.coords.y])[0];
		var pty = projection([r.coords.x, r.coords.y])[1];
		switch (r.gender) {
			case "male":
				male_points.moveTo(ptx + circle_rad, pty);
				male_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
				assignPointToRegion(ptx, pty, r.gender);
				break;
			case "female":
				female_points.moveTo(ptx + circle_rad, pty);
				female_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
				assignPointToRegion(ptx, pty, r.gender);
				break;
			default:
				other_points.moveTo(ptx + circle_rad, pty);
				other_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
		}
	});
	
	map.append("path")
		.attr("class", "male")
		.attr("d", function() { return male_points.toString(); })
		.attr("clip-path", "url(#italy-borders)"),
		
	map.append("path")
		.attr("class", "female")
		.attr("d", function() { return female_points.toString(); })
		.attr("clip-path", "url(#italy-borders)"),
		
	map.append("path")
		.attr("class", "other")
		.attr("d", function() { return other_points.toString(); })
		.attr("clip-path", "url(#italy-borders)");
		
	// generate heatmap by region
	map.selectAll(".region")
		.style("fill", function(d, i) {
			var total = htd[i].number_of_people[0] + htd[i].number_of_people[1];
			var dim = stringToFloat(htd[i].dimensions);
			var h = 240 + (60 * (htd[i].number_of_people[1] / total));
			var v = Math.floor(100 - (50 * (total / dim)));
			return "hsl(" + h + ", 100%, " + v + "%)";
		})
		
	// Associate event handlers to page elements
	var dragHandler = d3.drag()
		.on("start", function() { isDragging = true; })
		.on("drag", function() { updateDrag(data[1].results); })
		.on("end", function() { isDragging = false; });
	
	svg_map.call(dragHandler)
		.call(d3.zoom().on("zoom", function() { updateZoom(data[1].results); })),
		
	slider.selectAll(".track-overlay")
		.call(d3.drag()
			.on("start.interrupt", function() { slider.interrupt(); })
			.on("start drag", function() {
				updateCursorPositions(x.invert(d3.event.x), data[1].results);
			})
		);
});

// UTILITY FUNCTIONS AND EVENT HANDLERS
// Utilities
function stringToFloat(str) {
	return +str;
}

function pointInSvgPath(ps, x, y) {
	var elem = document.elementFromPoint(x, y);
	if (elem != null) return elem.getAttribute("d") == ps;
	else return false;
}

// Event handlers
function redrawPoints(points) {
	var male_points = d3.path();
	var female_points = d3.path();
	var other_points = d3.path();
	
	points.forEach(function(record) {
		if (record.dob >= minYear && record.dob <= maxYear) {
			var ptx = projection([record.coords.x, record.coords.y])[0];
			var pty = projection([record.coords.x, record.coords.y])[1];
			switch (record.gender) {
				case "male":
					male_points.moveTo(ptx + circle_rad, pty);
					male_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
					break;
				case "female":
					female_points.moveTo(ptx + circle_rad, pty);
					female_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
					break;
				default:
					other_points.moveTo(ptx + circle_rad, pty);
					other_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
			}
		}
	});
	
	map.selectAll(".male")
		.attr("d", male_points.toString()),
	
	map.selectAll(".female")
		.attr("d", female_points.toString()),
	
	map.selectAll(".other")
		.attr("d", other_points.toString());
}

function updateCursorPositions(v, elems) {
	// Update cursor position
	var rangeVal = (((v % 1) <= 0.5) ? Math.floor(v) : Math.ceil(v));
	var mouseCoord = x(rangeVal);
	var pos_lx = +handle_lx.attr("cx");
	var pos_rx = +handle_rx.attr("cx");
	var mid = pos_lx + ((pos_rx - pos_lx) / 2);
	if (mouseCoord <= mid) handle_lx.attr("cx", mouseCoord);
	else handle_rx.attr("cx", mouseCoord);
	
	minYear = x.invert(+handle_lx.attr("cx"));
	maxYear = x.invert(+handle_rx.attr("cx"));
	
	// Apply to points
	redrawPoints(elems);
}

function updateDrag(elems) {
	if (isDragging) {
		transform = d3.event.transform;
		var updatedX = projection.translate()[0] + d3.event.dx,
			updatedY = projection.translate()[1] + d3.event.dy;
		projection.translate([updatedX, updatedY]);
		
		// Apply to map
		svg_map.selectAll("path").attr("d", path);
		redrawPoints(elems);
	}
}

function updateZoom(elems) {
	transform = d3.event.transform;
	projection.scale(transform.k);
	
	// Apply to map
	svg_map.selectAll("path").attr("d", path);
	redrawPoints(elems);
}