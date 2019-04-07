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
	
var projection = d3.geoMercator()
	.translate([viewBox.width/2, viewBox.height/2])
	.center([12, 42.1])
	.scale(1950);
	
var path = d3.geoPath()
	.projection(projection);
	
var mapData = d3.json("https://giulitz189.github.io/geodata/italy_reg.json");
var queryData = d3.tsv("https://giulitz189.github.io/query.tsv", type);

Promise.all([mapData, queryData]).then(function(data) {
	function stringToPoint(str) {
		var res = str.split(" ");
		var x_str = res[0].split("Point(");
		var y_str = res[1].split(")");
		var x = +x_str[1];
		var y = +y_str[0];
		return [x, y];
	};
	
	// map clipping
	svg.append("defs")
		.append("clipPath")
			.attr("id", "italy-borders")
		.selectAll("path")
		.data(topojson.feature(data[0], data[0].objects.sub).features)
		.enter()
		.append("path")
			.attr("d", path);
			
	var map = svg.append("g");
	
	// draw map
	map.selectAll("path")
		.data(topojson.feature(data[0], data[0].objects.sub).features)
		.enter()
		.append("path")
			.attr("class", "region")
			.attr("d", path),
		
	// draw point
	map.selectAll("circle")
		.data(data[1])
		.enter()
		.append("circle")
			.attr("class", "circles")
			.attr("cx", function(d) {
				var point = stringToPoint(d.coord);
				return projection(point)[0];
			})
			.attr("cy", function(d) {
				var point = stringToPoint(d.coord);
				return projection(point)[1];
			})
			.attr("r", "1px")
			.attr("fill", function(d) {
				switch (d.genderLabel) {
					case "maschio": return "#0099FF";
					case "femmina": return "#FF00FF";
					default: return "#66FF66";
				}
			})
			.attr("clip-path", "url(#italy-borders)");
});

function type(d) {
	d.age = +d.age;
	return d;
}

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

svg.on("mousedown", onMouseDown)
	.on("mouseup", onMouseUp)
	.on("mouseleave", onMouseUp)
	.on("mousemove", onMouseMove),
		
svg.on("touchstart", onTouchStart)
	.on("touchend", onMouseUp)
	.on("touchmove", onTouchMove);