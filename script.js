// INITIALIZATION PHASE
// Map box
var viewBox_map = {
	x: 0,
	y: 0,
	width: 1000,
	height: 500
};

var circle_rad = 0.5;

var svg_map = d3.select(".map-box")
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
	.attr("id", "density-btn")
	.attr("name", "mapviz")
	.attr("value", "density"),
	
sf_mapviz.append("label")
	.attr("for", "density-btn")
	.text("Densità");
	
sf_mapviz.append("input")
	.attr("type", "radio")
	.attr("id", "heatmap-btn")
	.attr("name", "mapviz")
	.attr("value", "heatmap"),
	
sf_mapviz.append("label")
	.attr("for", "heatmap-btn")
	.text("Heatmap");

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
	.attr("value", "maschio"),
	
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
	.attr("value", "femmina"),
	
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

// Circle infobox
var ci = d3.select(".circleInfo");

ci.append("div")
	.attr("class", "section")
	.html("Nome: ");
	
ci.append("div")
	.attr("class", "section")
	.html("Sesso: ");
	
ci.append("div")
	.attr("class", "section")
	.html("Occupazioni: ");
	
ci.append("div")
	.attr("class", "section")
	.html("Anno di nascita: ");
	
ci.append("div")
	.attr("class", "section")
	.html("Anno di morte: ");
	
ci.append("div")
	.attr("class", "section")
	.html("Luogo di nascita: ");
	
ci.append("div")
	.attr("class", "section")
	.html("Articolo Wikipedia: ");
	
// DATA LOAD PHASE
// Timestamp test - BEGIN
var startTime, endTime;

function start() {
  startTime = new Date();
};

function end() {
  endTime = new Date();
  var timeDiff = endTime - startTime; //in ms
  // strip the ms
  timeDiff /= 1000;

  // get seconds
  console.log(timeDiff + " s");
}
// Timestamp test - END

var endpoint = "http://127.0.0.1:8765/"
//"https://giulitz189.github.io/";

var provinceDataFiles = [
	"abruzzo.json",
	"basilicata.json",
	"calabria.json",
	"campania.json",
	"emilia.json",
	"friuli.json",
	"lazio.json",
	"liguria.json",
	"lombardia.json",
	"marche.json",
	"molise.json",
	"piemonte.json",
	"puglia.json",
	"sardegna.json",
	"sicilia.json",
	"toscana.json",
	"trentino.json",
	"umbria.json",
	"valledaosta.json",
	"veneto.json"
];

function loadProvinces() {
	var provinces = [];
	for (i = 0; i < provinceDataFiles.length; i++) {
		var provShape = d3.json(endpoint + "geodata/" + provinceDataFiles[i]);
		provinces.push(provShape);
	}
	return provinces;
}

var provinceData = loadProvinces();
var regionData = d3.json(endpoint + "geodata/italy_reg.json");
var queryData = d3.json(endpoint + "query_records/query_results.json");
var heatmapData = d3.json(endpoint + "region_dimensions.json");

Promise.all(provinceData).then(function(data_1) {
	var pd = data_1;
	
	Promise.all([regionData, queryData, heatmapData]).then(function(data_2) {
		var rd = data_2[0];
		var qd = data_2[1].results;
		var htd = data_2[2].regions.sort(function (a, b) {
			a = a.RID;
			b = b.RID;
			return a < b ? -1 : a > b ? 1 : 0;
		});
		
		// draw map
		map.selectAll(".region")
			.data(topojson.feature(rd, rd.objects.sub).features)
			.enter()
			.append("path")
				.attr("class", "region")
				.attr("id", function (d, i) { return htd[i].regionLabel; })
				.attr("d", path);
				
		var map_tip = d3.tip()
			.attr("class", "d3-tip")
			.html(function(d, i) {
				var provId = d.id;
				var provElem = map.selectAll(".province")
								.select(function(d) {
									var elemId = d3.select(this).attr("id")
									return elemId == provId ? this : null;
								}).node();
				var tot = parseInt(provElem.dataset.male) + parseInt(provElem.dataset.female);
				return 'Nome: ' + provElem.dataset.name + '</br>' +
					'Popolazione: ' + provElem.dataset.population + '</br>' +
					'Di cui notables: ' + tot;
			});
		map.call(map_tip);
		
		for (i = 0; i < pd.length; i++) {
			map.selectAll(".prov")
				.data(topojson.feature(pd[i], pd[i].objects.sub).features)
				.enter()
				.append("path")
					.attr("class", "province")
					.attr("id", function (d) { return d.id; })
					.attr("d", path)
					.attr("data-name", function(d) {
						var prov_idx = findZoneIndexes(htd, d.id);
						return htd[prov_idx.r].provinces[prov_idx.p].provinceLabel;
					})
					.attr("data-population", function(d) {
						var prov_idx = findZoneIndexes(htd, d.id);
						return htd[prov_idx.r].provinces[prov_idx.p].population;
					})
					.attr("data-male", 0)
					.attr("data-female", 0)
					.on("mouseover", map_tip.show)
					.on("mouseout", map_tip.hide);
		}
		
		// heatmap initialization
		var hm_points = [];
		var qd_visible = [];
		
		qd.forEach((d) => {
			var elem = svgNodeFromCoordinates(d.coords.x, d.coords.y);
			if (elem != null && elem.classList[0] == "province") {
				if (d.gender == "maschio")
					elem.dataset.male++;
				else if (d.gender == "femmina")
					elem.dataset.female++;
				qd_visible.push(d);
				
				var dataPoint = {
					x: d.coords.x,
					y: d.coords.y,
					value: 0.5,
					province_idx: elem.id
				};
				hm_points.push(dataPoint);
			}
		});
		
		// draw points
		var container = document.querySelector(".map-box");
		var worker = new Worker("worker.js");
		
		var circle_tip = d3.tip()
			.attr("class", "d3-tip")
			.html(function(d, i) {
				if (qd_visible[i].dod > 0) {
					return 'Nome: ' + qd_visible[i].name + '</br>' +
						'Sesso: ' + qd_visible[i].gender + '</br>' +
						'Anno di nascita: ' + qd_visible[i].dob + '</br>' +
						'Anno di morte: ' + qd_visible[i].dod + '</br>';
				} else {
					return "Nome: " + qd_visible[i].name + "</br>" +
						"Sesso: " + qd_visible[i].gender + "</br>" +
						"Anno di nascita: " + qd_visible[i].dob + "</br>";
				}
			});
		map.call(circle_tip);
		
		var circles = map.selectAll("circle")
			.data(hm_points)
			.enter()
			.append("circle")
				.attr("display", "block")
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; })
				.attr("r", circle_rad)
				.attr("data-provinceId", function(d) { return d.province_idx; })
				.style("stroke", "black")
				.style("stroke-width", 0.1)
				.style("fill", function(d, i) {
					switch (qd_visible[i].gender) {
						case "maschio": return "#00BFFF";
									 break;
						case "femmina": return "#FF1493";
									   break;
						default: return "#66FF66";
					}
				})
				.on("mouseover", circle_tip.show)
				.on("mouseout", circle_tip.hide)
				.on("click", function(d, i) {
					writePersonInfo(qd_visible[i]);
				});
		
		worker.postMessage({
			nodes: hm_points,
			radius: circle_rad
		});
		
		worker.onmessage = function(event) {
			switch (event.data.type) {
				case "progress": return updatePos(event.data);
				case "end": return updatePos(event.data);
			}
		};
		
		function updatePos(data) {
			var nodes = data.nodes;
			
			map.selectAll("circle")
				.attr("cx", function(d, i) { return nodes[i].x; })
				.attr("cy", function(d, i) { return nodes[i].y; });
		}
		
		/**
		var heatmapInstance = h337.create({
			container: document.querySelector(".heatmap-render")
		});
		
		heatmapInstance.setData({
			max: 100,
			data: hm_points
		});
		 */
		
		// generate density by region
		map.selectAll(".province")
			.style("fill", function(d, i) {
				var prov = d3.select(this).node();
				var m = parseInt(prov.dataset.male);
				var f = parseInt(prov.dataset.female);
				var pop = parseInt(prov.dataset.population);
				
				var total = m + f;
				var h = 240 + (60 * (f / total));
				var v = Math.floor(100 - (25000 * (total / pop)));
				return "hsl(" + h + ", 100%, " + v + "%)";
			});
			
		// Associate event handlers to page elements
		svg_map.call(d3.zoom().on("zoom", updateTransform)),
		
		slider.selectAll(".track-overlay")
			.call(d3.drag()
				.on("start.interrupt", function() { slider.interrupt(); })
				.on("start drag", function() {
					updateCursorPositions(x.invert(d3.event.x), qd_visible, htd);
				})
			),
			
		sf_mapviz.selectAll("input")
			.on("change", function(d) {
				vval = this.value;
				updateVisualizedPoints(qd_visible, false);
			}),
			
		sf_gender.selectAll("input")
			.on("change", function(d) {
				gval = this.value;
				updateVisualizedPoints(qd_visible, true);
			});
	});
});

// UTILITY FUNCTIONS AND EVENT HANDLERS
// Utilities
function stringToFloat(str) {
	return +str;
}

function findZoneIndexes(htd, pid) {
	var idx = 0;
	while (idx < htd.length) {
		var prov = htd[idx].provinces;
		var check = prov.findIndex(p => p.PID == pid);
		if (check < 0) idx++;
		else return { r: idx, p: check };
	}
	return { r: -1, p: -1 };
}

function svgNodeFromCoordinates(x, y) {
	var root = document.getElementsByClassName("map-box")[0]
						.getElementsByTagName("svg")[0];
	var rpos = root.createSVGPoint();
	rpos.x = x;
	rpos.y = y;
	var position = rpos.matrixTransform(root.getScreenCTM());
	return document.elementFromPoint(position.x, position.y);
}

function writePersonInfo(data) {
	ci.selectAll(".section")
		.html(function(d, i) {
			switch (i) {
				case 0:
					return "Nome: " + data.name;
					break;
				case 1:
					return "Sesso: " + data.gender;
					break;
				case 2:
					var str = "Occupazioni: ";
					for (idx = 0; idx < data.occupation.length; idx++) {
						if (idx == data.occupation.length - 1)
							str += data.occupation[idx];
						else str += data.occupation[idx] + ", ";
					}
					return str;
					break;
				case 3:
					return "Anno di nascita: " + data.dob;
					break;
				case 4:
					if (data.dod == 0) return "Anno di morte: -";
					else return "Anno di morte: " + data.dod;
					break;
				case 5:
					return "Luogo di nascita: " + data.pob;
					break;
				case 6:
					return 'Articolo Wikipedia: <a href="' + data.article +
							'" target="_blank">' + data.article + '</a>';
			}
		});
}

function updateVisualizedPoints(elems, vizChanged) {
	map.selectAll("circle")
		.filter(function(d) {
			return d3.select(this).attr("display") == "block";
		})
		.attr("display", "none"),
		
	map.selectAll("circle")
		.filter(function(d, i) {
			if (vval == "dotmap" && (gval == "all" || elems[i].gender == gval))
				return elems[i].dob >= minYear && elems[i].dob <= maxYear;
			else return false;
		})
		.attr("display", "block");
		
	if (vizChanged) {
		map.selectAll(".province")
			.attr("data-male", 0)
			.attr("data-female", 0),
		
		map.selectAll("circle")
			.filter(function(d, i) {
				if (elems[i].dob >= minYear && elems[i].dob <= maxYear) {
					var circle = d3.select(this).node();
					
					var prov = document.getElementById(circle.dataset.provinceId);
					if (elems[i].gender == "maschio")
						prov.dataset.male++;
					else if (elems[i].gender == "femmina")
						prov.dataset.female++;
					return true;
				} else return false;
			}),
		
		map.selectAll(".province")
			.style("fill", function(d, i) {
				var prov = d3.select(this).node();
				var m = parseInt(prov.dataset.male);
				var f = parseInt(prov.dataset.female);
				var pop = parseInt(prov.dataset.population);
				
				var total = m + f;
				var h = 240 + (60 * (f / total));
				var v = Math.floor(100 - (25000 * (total / pop)));
				switch (gval) {
					case "maschio":
						v = Math.floor(100 - (25000 * (m / pop)));
						return "hsl(240, 100%, " + v + "%)";
						break;
					case "femmina":
						v = Math.floor(100 - (25000 * (f / pop)));
						return "hsl(300, 100%, " + v + "%)";
						break;
					default: return "hsl(" + h + ", 100%, " + v + "%)";
				}
			});
	}
}

// Event handlers
function updateTransform() {
	map.attr("transform", d3.event.transform);
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
	updateVisualizedPoints(elems, true);
}