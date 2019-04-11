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

var map = svg.append("g")
	.call(d3.zoom().scaleExtent([1, 10]).on("zoom", function() {
		d3.select(this).attr("transform", "translate(" + d3.event.translate + ")" +
											+ " scale(" + d3.event.scale + ")");
	}))
	.call(d3.drag().on("drag", function() {
		d3.select(this).attr("transform", "translate(" + d3.event.translate + ")" +
											+ " scale(" + d3.event.scale + ")");
	}));
	
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
});