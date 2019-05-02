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
};

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

// UI Selector
var sf_mapviz = d3.select(".selector")
	.append("div")
		.attr("class", "section")
		.text("Tipo visualizzazione:")
	.append("div")
		.attr("class", "switch-field");
		
sf_mapviz.append("input")
	.attr("type", "radio")
	.attr("id", "dotmap-btn")
	.attr("name", "mapviz")
	.attr("value", "dotmap")
	.property("checked", true),
	
sf_mapviz.append("label")
	.attr("for", "dotmap-btn")
	.text("A punti"),
	
sf_mapviz.append("input")
	.attr("type", "radio")
	.attr("id", "heatmap-btn")
	.attr("name", "mapviz")
	.attr("value", "heatmap"),
	
sf_mapviz.append("label")
	.attr("for", "heatmap-btn")
	.text("Densità");

var sf_gender = d3.select(".selector")
	.append("div")
		.attr("class", "section")
		.text("Sesso:")
	.append("div")
		.attr("class", "switch-field");
		
sf_gender.append("input")
	.attr("type", "radio")
	.attr("id", "male-btn")
	.attr("name", "gender")
	.attr("value", "male"),
	
sf_gender.append("label")
	.attr("for", "male-btn")
	.text("Uomini"),
	
sf_gender.append("input")
	.attr("type", "radio")
	.attr("id", "all-btn")
	.attr("name", "gender")
	.attr("value", "all")
	.property("checked", true),
	
sf_gender.append("label")
	.attr("for", "all-btn")
	.text("Tutti"),
	
sf_gender.append("input")
	.attr("type", "radio")
	.attr("id", "female-btn")
	.attr("name", "gender")
	.attr("value", "female"),
	
sf_gender.append("label")
	.attr("for", "female-btn")
	.text("Donne");
	
var sf_occupation = d3.select(".selector")
	.append("div")
		.attr("class", "section")
		.text("Occupazione:")
	.append("div")
		.attr("class", "selectbox");
		
var opts = sf_occupation.append("form")
	.append("select")
		.attr("id", "occ-select")
		.attr("name", "occupations");
		
opts.append("option")
	.attr("value", "0")
	.text("All");

var vval = "dotmap";
var gval = "all";
	
// DATA LOAD PHASE
var mapData = d3.json("https://giulitz189.github.io/geodata/italy_reg.json");
var queryData = d3.json("https://giulitz189.github.io/query_records/query_results.json");
var heatmapData = d3.json("https://giulitz189.github.io/region_dimensions.json");

Promise.all([mapData, queryData, heatmapData]).then(function(data) {
	var md = data[0];
	var qd = data[1].results;
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
		.data(topojson.feature(md, md.objects.sub).features)
		.enter()
		.append("path")
			.attr("d", path)
			.style("pointer-events", "none"),
	
	// draw map
	map.selectAll("path")
		.data(topojson.feature(md, md.objects.sub).features)
		.enter()
		.append("path")
			.attr("class", "region")
			.attr("id", function (d, i) {
				return htd[i].regionLabel;
			})
			.attr("d", path);
		
	// draw point
	var male_points = d3.path();
	var female_points = d3.path();
	var other_points = d3.path();
	
	qd.forEach(function (r) {
		var ptx = projection([r.coords.x, r.coords.y])[0];
		var pty = projection([r.coords.x, r.coords.y])[1];
		switch (r.gender) {
			case "male":
				male_points.moveTo(ptx + circle_rad, pty);
				male_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
				assignPointToRegion(htd, ptx, pty, r.gender);
				break;
			case "female":
				female_points.moveTo(ptx + circle_rad, pty);
				female_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
				assignPointToRegion(htd, ptx, pty, r.gender);
				break;
			default:
				other_points.moveTo(ptx + circle_rad, pty);
				other_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
		}
		for (i = 0; i < r.occupation.length; i++) {
			var sel = opts.selectAll("option").select(function(d) {
				return this.value === r.occupation[i];
			}).node();
			if (sel == null) {
				opts.append("option")
					.attr("value", r.occupation[i])
					.text(r.occupation[i]);
			}
		}
	}),
	
	map.append("path")
		.attr("class", "male")
		.attr("d", male_points.toString())
		.attr("display", "block")
		.attr("clip-path", "url(#italy-borders)"),
		
	map.append("path")
		.attr("class", "female")
		.attr("d", female_points.toString())
		.attr("display", "block")
		.attr("clip-path", "url(#italy-borders)"),
		
	map.append("path")
		.attr("class", "other")
		.attr("d", other_points.toString())
		.attr("display", "block")
		.attr("clip-path", "url(#italy-borders)"),
		
	// generate heatmap by region
	map.selectAll(".region")
		.style("fill", function(d, i) {
			var total = htd[i].number_of_people[0] + htd[i].number_of_people[1];
			var dim = stringToFloat(htd[i].dimensions);
			var h = 240 + (60 * (htd[i].number_of_people[1] / total));
			var v = Math.floor(100 - (50 * (total / dim)));
			return "hsl(" + h + ", 100%, " + v + "%)";
		});
		
	// Associate event handlers to page elements
	var dragHandler = d3.drag()
		.on("start", function() { isDragging = true; })
		.on("drag", function() { updateDrag(qd, htd); })
		.on("end", function() { isDragging = false; });
	
	svg_map.call(dragHandler)
		.call(d3.zoom().on("zoom", function() { updateZoom(qd, htd); })),
		
	slider.selectAll(".track-overlay")
		.call(d3.drag()
			.on("start.interrupt", function() { slider.interrupt(); })
			.on("start drag", function() {
				updateCursorPositions(x.invert(d3.event.x), qd, htd);
			})
		),
		
	sf_mapviz.selectAll("input")
		.on("change", function(d) {
			vval = this.value;
			updateVisualization();
		}),
		
	sf_gender.selectAll("input")
		.on("change", function(d) {
			gval = this.value;
			updateVisualization();
		});
});

// UTILITY FUNCTIONS AND EVENT HANDLERS
// Utilities
function stringToFloat(str) {
	return +str;
}

function svgNodeFromCoordinates(x, y) {
	var root = document.getElementsByClassName("map")[0]
						.getElementsByTagName("svg")[0];
	var rpos = root.createSVGPoint();
	rpos.x = x;
	rpos.y = y;
	var position = rpos.matrixTransform(root.getScreenCTM());
	return document.elementFromPoint(position.x, position.y);
}

// Event handlers
function assignPointToRegion(htd, x, y, gender) {
	var elem = svgNodeFromCoordinates(x, y);
	if (elem != null) {
		var regionElem = map.selectAll(".region")
			.select(function (d) {
				return (this.id == elem.id) ? this : null;
			})
			.node();
		if (regionElem != null) {
			var isAssigned = false;
			var idx = 0;
			while (!isAssigned && idx < htd.length) {
				if (htd[idx].regionLabel == regionElem.id) {
					if (gender == "male") htd[idx].number_of_people[0]++;
					else if (gender == "female") htd[idx].number_of_people[1]++;
					isAssigned = true;
				} else idx++;
			}
		}
	}
}

function redrawPoints(points, htd, isNOPModified) {
	var male_points = d3.path();
	var female_points = d3.path();
	var other_points = d3.path();
	
	map.selectAll(".male")
		.style("pointer-events", "none"),
		
	map.selectAll(".female")
		.style("pointer-events", "none"),
		
	map.selectAll(".other")
		.style("pointer-events", "none");
	
	// reset point count per region
	if (isNOPModified) {
		for (i = 0; i < htd.length; i++) {
			htd[i].number_of_people[0] = 0;
			htd[i].number_of_people[1] = 0;
		}
	}
	
	points.forEach(function (r) {
		if (r.dob >= minYear && r.dob <= maxYear) {
			var ptx = projection([r.coords.x, r.coords.y])[0];
			var pty = projection([r.coords.x, r.coords.y])[1];
			switch (r.gender) {
				case "male":
					male_points.moveTo(ptx + circle_rad, pty);
					male_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
					if (isNOPModified) assignPointToRegion(htd, ptx, pty, r.gender);
					break;
				case "female":
					female_points.moveTo(ptx + circle_rad, pty);
					female_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
					if (isNOPModified) assignPointToRegion(htd, ptx, pty, r.gender);
					break;
				default:
					other_points.moveTo(ptx + circle_rad, pty);
					other_points.arc(ptx, pty, circle_rad, 0, 2 * Math.PI);
			}
		}
	}),
	
	map.selectAll(".male")
		.attr("d", male_points.toString())
		.style("pointer-events", "auto"),
	
	map.selectAll(".female")
		.attr("d", female_points.toString())
		.style("pointer-events", "auto"),
	
	map.selectAll(".other")
		.attr("d", other_points.toString())
		.style("pointer-events", "auto");
		
	if (isNOPModified) {
		// generate heatmap by region
		map.selectAll(".region")
			.style("fill", function(d, i) {
				var total = htd[i].number_of_people[0] + htd[i].number_of_people[1];
				var dim = stringToFloat(htd[i].dimensions);
				var h = 240 + (60 * (htd[i].number_of_people[1] / total));
				var v = Math.floor(100 - (50 * (total / dim)));
				return "hsl(" + h + ", 100%, " + v + "%)";
			});
	}
}

function updateCursorPositions(v, elems, htd) {
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
	redrawPoints(elems, htd, true);
}

function updateDrag(elems, htd) {
	if (isDragging) {
		transform = d3.event.transform;
		var updatedX = projection.translate()[0] + d3.event.dx,
			updatedY = projection.translate()[1] + d3.event.dy;
		projection.translate([updatedX, updatedY]);
		
		// Apply to map
		svg_map.selectAll("path").attr("d", path);
		
		// Apply to points
		redrawPoints(elems, htd, false);
	}
}

function updateZoom(elems, htd) {
	transform = d3.event.transform;
	projection.scale(transform.k);
	
	// Apply to map
	svg_map.selectAll("path").attr("d", path);
	
	// Apply to points
	redrawPoints(elems, htd, false);
}

function updateVisualization() {
	map.select(".male")
		.attr("display", function(d) {
			if (vval == "dotmap" && (gval == "male" || gval == "all"))
				return "block";
			else return "none";
		}),
		
	map.select(".female")
		.attr("display", function(d) {
			if (vval == "dotmap" && (gval == "female" || gval == "all"))
				return "block";
			else return "none";
		}),
	
	map.select(".other")
		.attr("display", function(d) {
			if (vval == "dotmap" && gval == "all") return "block";
			else return "none";
		});
}