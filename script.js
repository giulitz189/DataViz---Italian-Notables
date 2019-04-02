var width = 1000,
	height = 500;
	
var map = d3.select(".map")
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("viewBox", "0 0 " + width + " " + height)
	.append("g");
	
var projection = d3.geoMercator()
	.translate([width/2, height/2])
	.center([12, 42.3])
	.scale(1950);
	
var path = d3.geoPath()
	.projection(projection);
	
var mapData = d3.json("http://giulitz189.github.io/geodata/italy_reg.json");
var queryData = d3.tsv("http://giulitz189.github.io/query.tsv", type);

Promise.all([mapData, queryData]).then(function(data) {
	function stringToPoint(str) {
		var res = str.split(" ");
		var x_str = res[0].split("Point(");
		var y_str = res[1].split(")");
		var x = +x_str[1];
		var y = +y_str[0];
		return [x, y];
	};
	
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
			});
});

function type(d) {
	d.age = +d.age;
	return d;
}
