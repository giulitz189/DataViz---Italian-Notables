var viewBox = {
	x: 0,
	y: 0,
	width: 1000,
	height: 500
};
	
var svg = d3.select(".map")
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("viewBox", viewBox.x + " " + viewBox.y + " " +
					+ viewBox.width + " " + viewBox.height);

var map = svg.append("g");
	
var projection = d3.geoMercator()
	.translate([viewBox.width/2, viewBox.height/2])
	.center([12, 42.1])
	.scale(1950);
	
var path = d3.geoPath()
	.projection(projection);
	
var mapData = d3.json("https://giulitz189.github.io/geodata/italy_reg.json");
var queryData = d3.json("https://giulitz189.github.io/query_records/query_results.json");

Promise.all([mapData, queryData]).then(function(data) {
	// map clipping
	svg.append("defs")
		.append("clipPath")
			.attr("id", "italy-borders")
		.selectAll("path")
		.data(topojson.feature(data[0], data[0].objects.sub).features)
		.enter()
		.append("path")
			.attr("d", path);
	
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
			
	// handlers binding
	svg.on("mousedown", onMouseDown)
		.on("mouseup", onMouseUp)
		.on("mouseleave", onMouseUp)
		.on("mousemove", onMouseMove),
		
	svg.on("touchstart", onTouchStart)
		.on("touchend", onMouseUp)
		.on("touchmove", onTouchMove);
});

// event handling
var isPointerDown = false;

var newViewBox = {
	x: 0,
	y: 0
};

var pointerOrigin = {
	x: 0,
	y: 0
};

function onMouseDown() {
	isPointerDown = true;
	
	pointerOrigin.x = d3.mouse(this)[0];
	pointerOrigin.y = d3.mouse(this)[1];
}

function onMouseUp() {
	isPointerDown = false;
	
	viewBox.x = newViewBox.x;
	viewBox.y = newViewBox.y;
}

function onMouseMove() {
	if (!isPointerDown) {
		return;
	}
	
	newViewBox.x = viewBox.x - (d3.mouse(this)[0] - pointerOrigin.x);
	newViewBox.y = viewBox.y - (d3.mouse(this)[1] - pointerOrigin.y);
	
	var viewBoxString = newViewBox.x + " " + newViewBox.y + " " +
						+ viewBox.width + " " + viewBox.height;
	svg.attr("viewBox", viewBoxString);
}

function onTouchStart() {
	isPointerDown = true;
	
	pointerOrigin.x = d3.touch(this)[0];
	pointerOrigin.y = d3.touch(this)[1];
}

function onTouchMove() {
	if (!isPointerDown) {
		return;
	}
	
	newViewBox.x = viewBox.x - (d3.touch(this)[0] - pointerOrigin.x);
	newViewBox.y = viewBox.y - (d3.touch(this)[1] - pointerOrigin.y);
	
	var viewBoxString = newViewBox.x + " " + newViewBox.y + " " +
						+ viewBox.width + " " + viewBox.height;
	svg.attr("viewBox", viewBoxString);
}