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

var svg_sldr = d3.select(".slider-box")
	.append("svg")
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", viewBox_slide.x + " " + viewBox_slide.y + " " +
						+ viewBox_slide.width + " " + viewBox_slide.height);
						
var scaleW = viewBox_slide.width - 100;
var scaleH = viewBox_slide.height - 30;

var minYear = 1850;
var maxYear = new Date().getFullYear();
	
var x = d3.scaleLinear()
	.domain([minYear, maxYear])
	.range([0, scaleW]);
	
var brush = d3.brushX()
	.extent([[0, 0], [scaleW, scaleH]]);
	
var slider = svg_sldr.append("g")
	.attr("class", "slider")
	.attr("transform", "translate(50, 10)");
	
var areaGraph = slider.append("g");
	
var brushSelection = slider.append("g")
	.call(brush)
	.call(brush.move, [minYear, maxYear].map(x));
	
slider.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0, " + scaleH + ")")
	.call(d3.axisBottom(x)
			.ticks(maxYear - minYear)
			.tickFormat(function(d) {
				return (d % 10 != 0) ? '' : d.toString();
			}));
			
d3.selectAll("g.x.axis g.tick line")
	.attr("y2", function(d) {
		return (d % 10 == 0) ? 6 : (d % 10 == 5) ? 4 : 2;
	})

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
	.text("TUTTO");

var vval = "dotmap";
var gval = "all";
var occval = "0";

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
	
// Force simulation init
var simulation = d3.forceSimulation()
	.force("collision", d3.forceCollide().radius(circle_rad + 0.5));
	
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
		var provShape = d3.json("geodata/" + provinceDataFiles[i]);
		provinces.push(provShape);
	}
	return provinces;
}

var provinceData = loadProvinces();
var regionData = d3.json("geodata/italy_reg.json");
var queryData = d3.json("query_records/query_results.json");
var heatmapData = d3.json("region_dimensions.json");

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
		
		qd.forEach((rec) => {
			var elem = svgNodeFromCoordinates(rec.coords.x, rec.coords.y);
			if (elem != null && elem.classList[0] == "province") {
				if (rec.gender == "maschio")
					elem.dataset.male++;
				else if (rec.gender == "femmina")
					elem.dataset.female++;
				qd_visible.push(rec);
				
				for (i = 0; i < rec.occupation.length; i++) {
					var check = opts.selectAll("option").filter(function(d) {
						return d3.select(this).text() == rec.occupation[i];
					}).empty();
					if (check) {
						opts.append("option")
							.attr("value", rec.occupation[i])
							.text(rec.occupation[i]);
					}
				}
				
				var dataPoint = {
					origX: rec.coords.x,
					origY: rec.coords.y,
					x: rec.coords.x,
					y: rec.coords.y,
					value: 0.5,
					province_idx: elem.id
				};
				hm_points.push(dataPoint);
			}
		});
		
		// draw points
		
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
				.attr("data-year", function(d, i) { return qd_visible[i].dob; })
				.attr("data-gender", function(d, i) { return qd_visible[i].gender; })
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
				
		// draw area chart
		var areaValues = [];
		for (y = minYear; y < maxYear; y++) {
			var group = circles.filter(function(d) {
				var el = d3.select(this).node();
				return parseInt(el.dataset.year) == y;
			});
			var nom = group.filter(function(d) {
				var el = d3.select(this).node();
				return el.dataset.gender == "maschio";
			}).size();
			var nof = group.filter(function(d) {
				var el = d3.select(this).node();
				return el.dataset.gender == "femmina";
			}).size();
			areaValues.push({ year: y, m: nom, f: nof })
		}
		
		var y = d3.scaleLinear()
			.domain([0, d3.max(areaValues, function(d) {
				return d.m > d.f ? d.m + 1 : d.f + 1;
			})])
			.range([scaleH, 0]);
		
		areaGraph.append("path")
			.datum(areaValues)
			.attr("fill", "rgba(0, 191, 255, 0.5)")
			.attr("stroke", "rgba(0, 191, 255, 1)")
			.attr("stroke-width", 1.5)
			.attr("d", d3.area()
				.x(function(d) { return x(d.year); })
				.y0(y(0))
				.y1(function(d) { return y(d.m); })
			);
			
		areaGraph.append("path")
			.datum(areaValues)
			.attr("fill", "rgba(255, 20, 147, 0.5)")
			.attr("stroke", "rgba(255, 20, 147, 1)")
			.attr("stroke-width", 1.5)
			.attr("d", d3.area()
				.x(function(d) { return x(d.year); })
				.y0(y(0))
				.y1(function(d) { return y(d.f); })
			);
		
		// anti-collision animation
		simulation.nodes(hm_points)
			.force("x", d3.forceX(function(d) { return d.origX; }))
			.force("y", d3.forceY(function(d) { return d.origY; }))
			.on("tick", function(d) {
				map.selectAll("circle")
					.attr("cx", function(d, i) { return hm_points[i].x; })
					.attr("cy", function(d, i) { return hm_points[i].y; });
			});
		
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
			
		brush.on("start brush", function(d) { brushed(d3.event, qd_visible); })
			.on("end", function(d) { brushended(d3.event, qd_visible); }),
			
		brushSelection.selectAll(".overlay")
			.each(function(d) { d.type = "selection"; })
			.on("mousedown touchstart", function(d) {
				brushcentered(d3.mouse(this), qd_visible);
			}),
			
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
			
		opts.on("change", function(d) {
			occval = this.value;
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

function checkOccupation(occ) {
	return occ == occval;
}

function updateVisualizedPoints(elems, vizChanged) {
	map.selectAll("circle")
		.filter(function(d) {
			return d3.select(this).attr("display") == "block";
		})
		.attr("display", "none");
		
	map.selectAll("circle")
		.filter(function(d, i) {
			var el = elems[i];
			if (vval == "dotmap" && (gval == "all" || el.gender == gval))
				if (occval == "0" || el.occupation.findIndex(checkOccupation) >= 0)
					return el.dob >= minYear && el.dob <= maxYear;
			return false;
		})
		.attr("display", "block");
		
	if (vizChanged) {
		map.selectAll(".province")
			.attr("data-male", 0)
			.attr("data-female", 0);
		
		var nodePos = [];
		var indexList = [];
		map.selectAll("circle")
			.filter(function(d, i) {
				var el = elems[i];
				if (occval == "0" || el.occupation.findIndex(checkOccupation) >= 0) {
					if (el.dob >= minYear && el.dob <= maxYear) {
						var circle = d3.select(this).node();
						
						var dataPoint = {
							origX: el.coords.x,
							origY: el.coords.y,
							x: circle.cx,
							y: circle.cy
						};
						nodePos.push(dataPoint);
						indexList.push(i);
						
						var prov = document.getElementById(circle.dataset.provinceId);
						if (el.gender == "maschio")
							prov.dataset.male++;
						else if (el.gender == "femmina")
							prov.dataset.female++;
						return true;
					}
				}
				return false;
			});
			
		simulation.nodes(nodePos)
			.force("x", d3.forceX(function(d) { return d.origX; }))
			.force("y", d3.forceY(function(d) { return d.origY; }))
			.on("tick", function(d) {
				map.selectAll("circle")
					.attr("cx", function(d, i) {
						if (indexList.includes(i)) return nodePos[i].x;
					})
					.attr("cy", function(d, i) {
						if (indexList.includes(i)) return nodePos[i].y;
					});
			});
		
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

function getYearLimits(elems) {
	var lx = +d3.select(".selection").attr("x"),
		width = +d3.select(".selection").attr("width");
	minYear = x.invert(lx);
	maxYear = x.invert(lx + width);
	
	// Apply to points
	updateVisualizedPoints(elems, true);
}

function brushcentered(mouseEvt, elems) {
	var dx = x(1860) - x(1850),
		cx = mouseEvt[0],
		x0 = cx - dx / 2,
		x1 = cx + dx / 2;
	
	brushSelection.call(brush.move, x1 > scaleW ? [scaleW - dx, scaleW] : x0 < 0 ? [0, dx] : [x0, x1]);
	
	getYearLimits(elems);
}

function brushed(evt, elems) {
	if (!evt.selection) return;
	var extent = evt.selection.map(x.invert, x);
	getYearLimits(elems);
}

function brushended(evt, elems) {
	if (!evt.sourceEvent) return;
	if (!evt.selection) return;
	var d0 = evt.selection.map(x.invert),
		d1 = d0.map(Math.round);
		
	if (d1[0] >= d1[1]) {
		d1[0] = Math.floor(d0[0]);
		d1[1] = d1[0] + 1;
	}
	
	brushSelection.transition().call(brush.move, d1.map(x));
	getYearLimits(elems);
}
