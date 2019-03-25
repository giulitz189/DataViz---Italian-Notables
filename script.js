var width = 750,
	barHeight = 20,
	maxAge = 110;
	
var ageBar = d3.scaleLinear()
	.range([0, width]);
	
var ruler = d3.axisTop()
	.scale(ageBar);
	
var chart = d3.select(".chart")
	.attr("width", width)

d3.tsv("http://127.0.0.1:8765/query.tsv", type).then(function(data) {
	ageBar.domain([0, maxAge]);
	
	chart.attr("height", barHeight + (data.length * barHeight));
	
	chart.append("g")
		.attr("class", "age")
		.call(ruler);
	
	var bar = chart.selectAll(".bar")
		.data(data)
	  .enter().append("g")
		.attr("transform", function(d, i) { return "translate(0," + ((i + 1) * barHeight) + ")"; })
	  .append("a")
		.attr("xlink:href", function(d) { return d.articolo; });
	
	bar.append("rect")
		.attr("width", function(d) { return ageBar(d.age); })
		.attr("height", barHeight - 1)
		.attr("fill", function(d) {
			switch (d.genderLabel) {
				case "maschio": return "#0099FF";
				case "femmina": return "#FF00FF";
				default: return "#66FF66";
			}
		});
		
	bar.append("text")
		.attr("x", 3)
		.attr("y", barHeight / 2)
		.attr("dy", ".35em")
		.text(function(d) { return d.personaLabel; });
});

function type(d) {
	d.age = +d.age;
	return d;
}