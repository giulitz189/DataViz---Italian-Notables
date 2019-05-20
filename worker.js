importScripts("https://d3js.org/d3-collection.v1.min.js");
importScripts("https://d3js.org/d3-dispatch.v1.min.js");
importScripts("https://d3js.org/d3-quadtree.v1.min.js");
importScripts("https://d3js.org/d3-timer.v1.min.js");
importScripts("https://d3js.org/d3-force.v1.min.js");

onmessage = function(event) {
	var nodes = event.data.nodes,
		radius = event.data.radius;
	
	var simulation = d3.forceSimulation(nodes)
		.force("collision", d3.forceCollide().radius(radius + 0.5))
		.stop();
		
	for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
		simulation.tick();
	}
	
	postMessage({type: "end", nodes: nodes, radius: radius});
};