importScripts('https://d3js.org/d3-collection.v1.min.js');
importScripts('https://d3js.org/d3-dispatch.v1.min.js');
importScripts('https://d3js.org/d3-quadtree.v1.min.js');
importScripts('https://d3js.org/d3-timer.v1.min.js');
importScripts('https://d3js.org/d3-force.v1.min.js');

onmessage = function(event) {
	var nodes = event.data.nodes,
		radius = event.data.radius;
	
	var simulation = d3.forceSimulation(nodes)
        .force('collision', d3.forceCollide().radius(radius + 0.2).iterations(10))
        .force('x', d3.forceX(d => d.origX))
        .force('y', d3.forceY(d => d.origY))
        .force('r', d3.forceRadial(0).x(d => d.origX).y(d => d.origY))
        .stop();
		
	for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
		simulation.tick();
		postMessage({ type: 'progress', nodes: nodes });
	}
	
	postMessage({ type: 'end', nodes: nodes });
};