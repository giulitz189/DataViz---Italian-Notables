importScripts("https://d3js.org/d3-collection.v1.min.js");
importScripts("https://d3js.org/d3-dispatch.v1.min.js");
importScripts("https://d3js.org/d3-quadtree.v1.min.js");
importScripts("https://d3js.org/d3-timer.v1.min.js");
importScripts("https://d3js.org/d3-force.v1.min.js");

onmessage = function(event) {
	var nodes = event.data.nodes,
		radius = event.data.radius;
		maxTicks = 300;
	
	var simulation = d3.forceSimulation(nodes)
		.force("collision", d3.forceCollide().radius(radius + 0.1))
		.stop();
		
	for (i = 0; i < maxTicks; i++) {
		simulation.tick();
		postMessage({ type: "progress", nodes: nodes });
	}
	
	postMessage({ type: "end", nodes: nodes });
};