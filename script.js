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
	
var heatmapInstance = h337.create({
	container: document.querySelector(".map-box")
});
	
// Slider sector
var viewBox_slide = {
	x: 0,
	y: 0,
	width: 1000,
	height: 100
};

var svg_sldr = d3.select(".slider-box")
	.append("svg")
		.attr("xmlns", "http://www.w3.org/2000/svg")
		.attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
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
	.attr("class", "brush")
	.call(brush)
	.call(brush.move, [minYear, maxYear].map(x));
	
var brushHandle = brushSelection.selectAll(".handle--custom")
	.data([{type: "w"}, {type: "e"}])
	.enter().append("rect")
		.attr("class", "handle--custom")
		.attr("fill", "red")
		.attr("cursor", "ew-resize")
		.attr("x", function(d) {
			if (d.type == "w")
				return (parseInt(d3.select(".handle--w").attr("x")) + 2.5);
			else return (parseInt(d3.select(".handle--e").attr("x")) + 1);
		})
		.attr("y", 25)
		.attr("width", 3)
		.attr("height", 20);
	
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
	});
	
var rangeChanged = false;

// UI Selector
var sf_circleRadius = d3.select(".selector")
	.append("div")
		.attr("class", "section")
		.text("Raggio dei punti:")
	.append("div")
		.attr("class", "radius-slider");
		
var radOpts = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
		
var sliderHandle = d3.sliderBottom()
	.min(d3.min(radOpts))
	.max(d3.max(radOpts))
	.width(160)
	.tickFormat(d3.format(".1"))
	.ticks(10)
	.default(0.5)
	.handle(
		d3.symbol()
			.type(d3.symbolCircle)
			.size(100)()
	)
	.on("onchange", val => {
		circle_rad = val;
		d3.selectAll(".person").attr("r", circle_rad);
	});
	
var rs_container = d3.select(".radius-slider")
	.append("svg")
		.attr("width", "200")
		.attr("height", "50")
	.append("g")
		.attr("transform", "translate(20, 10)");
		
rs_container.call(sliderHandle);

var vval = "dotmap";
var gval = "all";

// Circle infobox
var ci = d3.select(".circleInfo");

ci.append("div")
	.attr("class", "section")
	.html("<b>Nome:</b> ");
	
ci.append("div")
	.attr("class", "section")
	.html("<b>Sesso:</b> ");
	
ci.append("div")
	.attr("class", "section")
	.html("<b>Occupazioni:</b> ");
	
ci.append("div")
	.attr("class", "section")
	.html("<b>Anno di nascita:</b> ");
	
ci.append("div")
	.attr("class", "section")
	.html("<b>Anno di morte:</b> ");
	
ci.append("div")
	.attr("class", "section")
	.html("<b>Luogo di nascita:</b> ");
	
ci.append("div")
	.attr("class", "section")
	.html("<b>Articolo Wikipedia:</b> ");
	
// Data range infobox
var ri = d3.select(".rangeInfo");

var ri_yearRange = ri.append("div")
	.attr("class", "section")
	.text("Intervallo nascite: dal " + minYear + " al " + maxYear);
	
var ri_pointQuantity = ri.append("div")
	.attr("class", "section");
	
// Occupation grid selector
var occ_categories = [
	{ name: "TUTTO", type: "special", m: 0, f: 0 },
	{ name: "Figure Sportive", type: "category", m: 0, f: 0 },
	{ name: "Calciatore", type: "subcategory", m: 0, f: 0 },
	{ name: "Allenatore", type: "subcategory", m: 0, f: 0 },
	{ name: "Pilota", type: "subcategory", m: 0, f: 0 },
	{ name: "Ciclista", type: "subcategory", m: 0, f: 0 },
	{ name: "Tennista", type: "subcategory", m: 0, f: 0 },
	{ name: "Arbitro", type: "subcategory", m: 0, f: 0 },
	{ name: "Sciatore", type: "subcategory", m: 0, f: 0 },
	{ name: "Artisti", type: "category", m: 0, f: 0 },
	{ name: "Cantante", type: "subcategory", m: 0, f: 0 },
	{ name: "Attore", type: "subcategory", m: 0, f: 0 },
	{ name: "Compositore", type: "subcategory", m: 0, f: 0 },
	{ name: "Regista", type: "subcategory", m: 0, f: 0 },
	{ name: "Direttore d'Orchestra", type: "subcategory", m: 0, f: 0 },
	{ name: "Architetto", type: "subcategory", m: 0, f: 0 },
	{ name: "Stilista", type: "subcategory", m: 0, f: 0 },
	{ name: "Fumettista", type: "subcategory", m: 0, f: 0 },
	{ name: "Pittore", type: "subcategory", m: 0, f: 0 },
	{ name: "Fotografo", type: "subcategory", m: 0, f: 0 },
	{ name: "Istituzioni", type: "category", m: 0, f: 0 },
	{ name: "Politico", type: "subcategory", m: 0, f: 0 },
	{ name: "Figura Religiosa", type: "subcategory", m: 0, f: 0 },
	{ name: "Militare", type: "subcategory", m: 0, f: 0 },
	{ name: "Giudice", type: "subcategory", m: 0, f: 0 },
	{ name: "Agente Diplomatico", type: "subcategory", m: 0, f: 0 },
	{ name: "Umanistica", type: "category", m: 0, f: 0 },
	{ name: "Scrittore", type: "subcategory", m: 0, f: 0 },
	{ name: "Giornalista", type: "subcategory", m: 0, f: 0 },
	{ name: "Filosofo", type: "subcategory", m: 0, f: 0 },
	{ name: "Scienza e Tecnologia", type: "category", m: 0, f: 0 },
	{ name: "Biologo", type: "subcategory", m: 0, f: 0 },
	{ name: "Fisico", type: "subcategory", m: 0, f: 0 },
	{ name: "Economista", type: "subcategory", m: 0, f: 0 },
	{ name: "Matematico", type: "subcategory", m: 0, f: 0 },
	{ name: "Chimico", type: "subcategory", m: 0, f: 0 },
	{ name: "Medico", type: "subcategory", m: 0, f: 0 },
	{ name: "Astronomo", type: "subcategory", m: 0, f: 0 },
	{ name: "Inventore", type: "subcategory", m: 0, f: 0 },
	{ name: "Ingegnere", type: "subcategory", m: 0, f: 0 },
	{ name: "Figure Pubbliche", type: "category", m: 0, f: 0 },
	{ name: "Modello", type: "subcategory", m: 0, f: 0 },
	{ name: "Attivista Sociale", type: "subcategory", m: 0, f: 0 },
	{ name: "Criminale", type: "subcategory", m: 0, f: 0 },
	{ name: "Business", type: "category", m: 0, f: 0 },
	{ name: "Produttore", type: "subcategory", m: 0, f: 0 },
	{ name: "Affarista", type: "subcategory", m: 0, f: 0 },
	{ name: "Esplorazione", type: "category", m: 0, f: 0 },
	{ name: "Astronauta", type: "subcategory", m: 0, f: 0 },
	{ name: "Altro", type: "special", m: 0, f: 0 }
];

function generateGridLayout() {
	var data = new Array();
	var xpos = 0;
	var ypos = 0;
	var width = 0;
	var height = 30;
	
	for (var row = 0; row < occ_categories.length; row++) {
		data.push(new Array());
		for (var column = 0; column < 3; column++) {
			width = column == 0 ? 160 : 30;
			data[row].push({
				x: xpos,
				y: ypos,
				width: width,
				height: height,
				row_idx: row
			})
			xpos += width;
		}
		xpos = 0;
		ypos += height;
	}
	return data;
}

var grid = d3.select("#occ-select-grid")
	.text("Occupazione: ")
	.append("svg")
	.attr("width", "100%")
	.attr("height", function(d) { return "" + (occ_categories.length * 30)})
	.style("margin", "2px 2px 2px 2px");
	
var row = grid.selectAll(".row")
	.data(generateGridLayout)
	.enter().append("g")
	.attr("class", "row");
	
var column = row.selectAll(".square")
	.data(function(d) { return d; })
	.enter()
	.append("g")
		.attr("class", "cell")
		.attr("data-rowId", function(d, i) { return d.row_idx; })
		.attr("data-type", function(d, i) {
			switch (i) {
				case 1: return "male-count";
						break;
				case 2: return "female-count";
						break;
				default: return "name";
			}
		})
	.append("rect")
		.attr("class", "square")
		.attr("x", function(d) { return d.x; })
		.attr("y", function(d) { return d.y; })
		.attr("width", function(d) { return d.width; })
		.attr("height", function(d) { return d.height; })
		.attr("fill", "#fff")
		.attr("stroke", "#222");
		
d3.selectAll(".cell")
	.filter(function (d) { return d3.select(this).attr("data-type") == "name"; })
	.append("text")
	.attr("x", "80")
	.attr("y", function(d) {
		var el = d3.select(this).node().parentNode;
		var idx = el.dataset.rowId;
		return "" + ((idx * 30) + 15);
	})
	.attr("dominant-baseline", "middle")
	.attr("text-anchor", "middle")
	.style("font-weight", function(d) {
		var el = d3.select(this).node().parentNode;
		var idx = el.dataset.rowId;
		if (occ_categories[idx].type == "category") return "bold";
		else return "normal";
	})
	.style("font-style", function(d) {
		var el = d3.select(this).node().parentNode;
		var idx = el.dataset.rowId;
		if (occ_categories[idx].type == "special") return "italic";
		else return "normal";
	})
	.text(function(d) {
		var el = d3.select(this).node().parentNode;
		var idx = el.dataset.rowId;
		return occ_categories[idx].name;
	});
	
var occGroupSelected = ["all"];
	
// Force simulation init
var simulation = d3.forceSimulation()
	.force("collision", d3.forceCollide().radius(circle_rad + 0.2));
	
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
					.attr("data-total_notables", 0)
					.on("mouseover", map_tip.show)
					.on("mouseout", map_tip.hide);
		}
		
		// heatmap initialization
		var hm_points = [];
		var qd_visible = [];
		var birthplace_qt = [];
		
		for (var i = 0, len = qd.length; i < len; i++) {
			var rec = qd[i];
			var elem = svgNodeFromCoordinates(rec.coords.x, rec.coords.y);
			if (elem != null && elem.classList[0] == "province") {
				elem.dataset.total_notables++;
				if (rec.gender == "maschio")
					elem.dataset.male++;
				else if (rec.gender == "femmina")
					elem.dataset.female++;
				qd_visible.push(rec);
				
				var dataPoint = {
					origX: rec.coords.x,
					origY: rec.coords.y,
					x: rec.coords.x,
					y: rec.coords.y,
					province_idx: elem.id
				};
				hm_points.push(dataPoint);
				
				var bp_idx = birthplace_qt.findIndex(v => v.place == rec.pob);
				if (bp_idx < 0) {
					var bp_record = {
						place: rec.pob,
						x: rec.coords.x,
						y: rec.coords.y,
						value: 1
					};
					birthplace_qt.push(bp_record);
				} else birthplace_qt[bp_idx].value++;
				
				if (rec.gender == "maschio") occ_categories[0].m++;
				else if (rec.gender == "femmina") occ_categories[0].f++;
				if (rec.professions.categories.length == 0) {
					var l = occ_categories.length;
					if (rec.gender == "maschio") occ_categories[l-1].m++;
					else if (rec.gender == "femmina") occ_categories[l-1].f++;
				} else {
					var prev_idx_class = -1;
					for (var j = 0; j < rec.professions.categories.length; j++) {
						var currCat = rec.professions.categories[j];
						var idx = occ_categories.findIndex(cat => cat.name == currCat);
						var idx_class = idx;
						while (occ_categories[idx_class].type != "category") idx_class--;
						if (rec.gender == "maschio") {
							occ_categories[idx].m++;
							if (prev_idx_class != idx_class) {
								occ_categories[idx_class].m++;
								prev_idx_class = idx_class;
							}
						} else if (rec.gender == "femmina") {
							occ_categories[idx].f++;
							if (prev_idx_class != idx_class) {
								occ_categories[idx_class].f++;
								prev_idx_class = idx_class;
							}
						}
					}
				}
			}
		}
		
		// occupation category frequency
		d3.selectAll(".cell")
			.filter(function (d) {
				return d3.select(this).attr("data-type") == "male-count";
			})
			.append("text")
			.attr("x", "175")
			.attr("y", function(d) {
				var el = d3.select(this).node().parentNode;
				var idx = el.dataset.rowId;
				return "" + ((idx * 30) + 15);
			})
			.attr("dominant-baseline", "middle")
			.attr("text-anchor", "middle")
			.style("font-size", "11px")
			.text(function(d) {
				var el = d3.select(this).node().parentNode;
				var idx = el.dataset.rowId;
				return "" + occ_categories[idx].m;
			});
			
		d3.selectAll(".cell")
			.filter(function (d) {
				return d3.select(this).attr("data-type") == "female-count";
			})
			.append("text")
			.attr("x", "205")
			.attr("y", function(d) {
				var el = d3.select(this).node().parentNode;
				var idx = el.dataset.rowId;
				return "" + ((idx * 30) + 15);
			})
			.attr("dominant-baseline", "middle")
			.attr("text-anchor", "middle")
			.style("font-size", "11px")
			.text(function(d) {
				var el = d3.select(this).node().parentNode;
				var idx = el.dataset.rowId;
				return "" + occ_categories[idx].f;
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
				.attr("class", "person")
				.attr("display", "block")
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; })
				.attr("r", circle_rad)
				.attr("data-provinceId", function(d) { return d.province_idx; })
				.attr("data-year", function(d, i) { return qd_visible[i].dob; })
				.attr("data-gender", function(d, i) { return qd_visible[i].gender; })
				.attr("data-categories", function(d, i) {
					var cat = qd_visible[i].professions.categories;
					if (cat.length > 0) return JSON.stringify(cat);
					else return '["other"]';
				})
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
				
		var nom = circles.filter(function(d, i) {
			return qd_visible[i].gender == "maschio";
		}).size();
		var nof = circles.filter(function(d, i) {
			return qd_visible[i].gender == "femmina";
		}).size();
		ri_pointQuantity.text(circles.size() + " persone visualizzate, " +
								"di cui " + nom + " uomini e " + nof + " donne");
		
		drawAreaChart(qd_visible);
		
		// heatmap draw
		var bp_max = Math.max.apply(Math, birthplace_qt.map(o => o.value));
		heatmapInstance.setData({
			max: bp_max,
			min: 0,
			data: birthplace_qt
		});
		
		var hmdata_url = heatmapInstance.getDataURL();
		map.append("image")
			.attr("class", "heatmap-image")
			.attr("display", "none")
			.attr("width", function(d) {
				return d3.select(".heatmap-canvas").attr("width");
			})
			.attr("height", function(d) {
				return d3.select(".heatmap-canvas").attr("height");
			})
			.attr("xlink:href", hmdata_url);
			
		// anti-collision animation
		simulation.nodes(hm_points)
			.force("x", d3.forceX(function(d) { return d.origX; }))
			.force("y", d3.forceY(function(d) { return d.origY; }))
			.on("tick", function(d) {
				map.selectAll("circle")
					.attr("cx", function(d, i) { return hm_points[i].x; })
					.attr("cy", function(d, i) { return hm_points[i].y; });
			});
		
		// generate density by region
		map.selectAll(".province")
			.style("fill", function(d, i) {
				var prov = d3.select(this).node();
				var m = parseInt(prov.dataset.male);
				var f = parseInt(prov.dataset.female);
				var tn = parseInt(prov.dataset.total_notables);
				
				var total = m + f;
				var h = 240 + Math.ceil(60 * (f / total));
				var v = 100 - Math.ceil(30 * (total / tn));
				return "hsla(" + h + ", 100%, " + v + "%, 0.5)";
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
			
		d3.select("#visualization-type")
			.selectAll("input")
			.on("change", function(d) {
				vval = this.value;
				updateVisualizedPoints(qd_visible, false);
			}),
			
		d3.select("#gender-sel")
			.selectAll("input")
			.on("change", function(d) {
				gval = this.value;
				updateVisualizedPoints(qd_visible, true);
			});
		
		d3.selectAll(".row")
			.on("click", function(d, i) {
				gridSelection(i);
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
					return "<b>Nome:</b> " + data.name;
					break;
				case 1:
					return "<b>Sesso:</b> " + data.gender;
					break;
				case 2:
					var str = "<b>Occupazioni:</b> ";
					for (idx = 0; idx < data.professions.occupations.length; idx++) {
						if (idx == data.professions.occupations.length - 1)
							str += data.professions.occupations[idx];
						else str += data.professions.occupations[idx] + ", ";
					}
					return str;
					break;
				case 3:
					return "<b>Anno di nascita:</b> " + data.dob;
					break;
				case 4:
					if (data.dod == 0) return "Anno di morte: -";
					else return "<b>Anno di morte:</b> " + data.dod;
					break;
				case 5:
					return "<b>Luogo di nascita:</b> " + data.pob;
					break;
				case 6:
					return '<b>Articolo Wikipedia:</b> <a href="' + data.article +
							'" target="_blank">' + data.article + '</a>';
			}
		});
}

function drawAreaChart(elems) {
	var areaValues = [];
	var nowYear = new Date().getFullYear();
	for (i = 1850; i < nowYear; i++) {
		var nom = elems.filter(el => {
			if (el.gender == "maschio" && el.dob == i) {
				var cat = el.professions.categories;
				if (occGroupSelected[0] == "all" || (occGroupSelected[0] == "other" && cat.length == 0))
					return true;
				else {
					for (var idx = 0; idx < cat.length; idx++) {
						if (occGroupSelected.findIndex(v => v == cat[idx]) >= 0 && el.dob >= minYear && el.dob <= maxYear)
							return true;
					}
				}
				return false;
			}
		}).length;
		var nof = elems.filter(el => {
			if (el.gender == "femmina" && el.dob == i) {
				var cat = el.professions.categories;
				if (occGroupSelected[0] == "all" || (occGroupSelected[0] == "other" && cat.length == 0))
					return true;
				else {
					for (var idx = 0; idx < cat.length; idx++) {
						if (occGroupSelected.findIndex(v => v == cat[idx]) >= 0 && el.dob >= minYear && el.dob <= maxYear)
							return true;
					}
				}
				return false;
			}
		}).length;
		areaValues.push({ year: i, m: nom, f: nof });
	}
	
	var y_max = d3.max(areaValues, function(d) {
			return d.m > d.f ? d.m + 1 : d.f + 1;
		});
	var y = d3.scaleLinear()
		.domain([0, y_max])
		.range([scaleH, 0]);
		
	slider.select(".y-axis").remove();
		
	slider.append("g")
		.attr("class", "y-axis")
		.call(d3.axisLeft(y)
				.ticks(Math.floor(y_max / 50) + 1));
				
	areaGraph.select(".male-graph").remove();
	areaGraph.select(".female-graph").remove();
	
	areaGraph.append("path")
		.datum(areaValues)
		.attr("class", "male-graph")
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
		.attr("class", "female-graph")
		.attr("fill", "rgba(255, 20, 147, 0.5)")
		.attr("stroke", "rgba(255, 20, 147, 1)")
		.attr("stroke-width", 1.5)
		.attr("d", d3.area()
			.x(function(d) { return x(d.year); })
			.y0(y(0))
			.y1(function(d) { return y(d.f); })
		);
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
		
	if (rangeChanged) {
		map.selectAll(".province")
			.attr("data-total_notables", 0);
			
		map.selectAll("circle")
			.each(function (d, i) {
				var el = elems[i];
				if (el.dob >= minYear && el.dob <= maxYear) {
					var provId = d3.select(this).attr("data-provinceId");
					var prov = document.querySelector("[id='" + provId + "']");
					prov.dataset.total_notables++;
				}
			})
		
		rangeChanged = false;
	}
	
	var indexList = [];
	var selected = map.selectAll("circle")
		.filter(function(d, i) {
			var el = elems[i];
			if (gval == "all" || el.gender == gval) {
				var cat = el.professions.categories;
				if (occGroupSelected[0] == "all" || (occGroupSelected[0] == "other" && cat.length == 0)) {
					if (el.dob >= minYear && el.dob <= maxYear) {
						indexList.push(i);
						return true;
					}
				} else {
					for (var idx = 0; idx < cat.length; idx++) {
						if (occGroupSelected.findIndex(v => v == cat[idx]) >= 0 && el.dob >= minYear && el.dob <= maxYear) {
							indexList.push(i);
							return true;
						}
					}
				}
			}
			return false;
		})
		.attr("display", function(d) {
			if (vval == "dotmap") return "block";
			else return "none";
		});
		
	map.selectAll("image")
		.attr("display", function(d) {
			if (vval == "heatmap") return "block";
			else return "none";
		});
		
	if (vizChanged) {
		map.selectAll(".province")
			.attr("data-male", 0)
			.attr("data-female", 0);
		
		var nodePos = [];
		var birthplace_qt = [];
		
		for (var i = 0, len = indexList.length; i < len; i++) {
			var il_idx = indexList[i];
			var el = elems[il_idx];
			
			var dataPoint = {
				origX: el.coords.x,
				origY: el.coords.y,
				idx: il_idx,
				x: el.coords.x,
				y: el.coords.y
			};
			nodePos.push(dataPoint);
			
			var bp_idx = birthplace_qt.findIndex(v => v.place == el.pob);
			if (bp_idx < 0) {
				var bp_record = {
					place: el.pob,
					x: el.coords.x,
					y: el.coords.y,
					value: 1
				};
				birthplace_qt.push(bp_record);
			} else birthplace_qt[bp_idx].value++;
		}
		
		selected.each(function(d) {
			var el = d3.select(this);
			var provId = el.attr("data-provinceId");
			var prov = document.querySelector("[id='" + provId + "']");
			if (el.attr("data-gender") == "maschio")
				prov.dataset.male++;
			else if (el.attr("data-gender") == "femmina")
				prov.dataset.female++;
		});
	
		var nos = selected.size();
		var nom = selected.filter(function(d, i) {
			if (i < indexList.length) {
				var idx = indexList[i];
				return elems[idx].gender == "maschio";
			}
		}).size();
		var nof = selected.filter(function(d, i) {
			if (i < indexList.length) {
				var idx = indexList[i];
				return elems[idx].gender == "femmina";
			}
		}).size();
		
		ri_pointQuantity.text(nos + " persone visualizzate, " +
								"di cui " + nom + " uomini e " + nof + " donne");
		
		drawAreaChart(elems);
		
		var bp_max = Math.max.apply(Math, birthplace_qt.map(o => o.value));
		heatmapInstance.setData({
			max: bp_max,
			min: 0,
			data: birthplace_qt
		});
		
		var hmdata_url = heatmapInstance.getDataURL();
		map.selectAll(".heatmap-image")
			.attr("xlink:href", hmdata_url);

		simulation.stop();
		simulation.nodes(nodePos)
			.force("x", d3.forceX(function(d) { return d.origX; }))
			.force("y", d3.forceY(function(d) { return d.origY; }))
			.on("tick", function(d) {
				map.selectAll("circle")
					.attr("cx", function(d, i) {
						var currIdx = indexList.findIndex(val => val == i);
						if (currIdx >= 0) return nodePos[currIdx].x;
					})
					.attr("cy", function(d, i) {
						var currIdx = indexList.findIndex(val => val == i);
						if (currIdx >= 0) return nodePos[currIdx].y;
					});
			});
		simulation.alphaTarget(.03).restart();
		
		map.selectAll(".province")
			.style("fill", function(d, i) {
				var prov = d3.select(this).node();
				var m = parseInt(prov.dataset.male);
				var f = parseInt(prov.dataset.female);
				var tn = parseInt(prov.dataset.total_notables);
				
				var total = m + f;
				var h = 240 + (60 * (f / total));
				var v = 100 - Math.ceil(30 * (total / tn));
				switch (gval) {
					case "maschio":
						v = 100 - Math.ceil(30 * (m / tn));
						return "hsla(240, 100%, " + v + "%, 0.5)";
						break;
					case "femmina":
						v = 100 - Math.ceil(30 * (f / tn));
						return "hsla(300, 100%, " + v + "%, 0.5)";
						break;
					default: return "hsla(" + h + ", 100%, " + v + "%, 0.5)";
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
	
	ri_yearRange.text("Intervallo nascite: dal " + minYear + " al " + maxYear);
	
	for (var i = 0; i < occ_categories.length; i++) {
		occ_categories[i].m = 0;
		occ_categories[i].f = 0;
	}
	
	for (var i = 0; i < elems.length; i++) {
		var rec = elems[i];
		
		if (rec.dob >= minYear && rec.dob <= maxYear) {
			if (rec.gender == "maschio") occ_categories[0].m++;
			else if (rec.gender == "femmina") occ_categories[0].f++;
			
			if (rec.professions.categories.length == 0) {
				var l = occ_categories.length;
				if (rec.gender == "maschio") occ_categories[l-1].m++;
				else if (rec.gender == "femmina") occ_categories[l-1].f++;
			} else {
				var prev_idx_class = -1;
				for (var j = 0; j < rec.professions.categories.length; j++) {
					var currCat = rec.professions.categories[j];
					var idx = occ_categories.findIndex(cat => cat.name == currCat);
					var idx_class = idx;
					while (occ_categories[idx_class].type != "category") idx_class--;
					if (rec.gender == "maschio") {
						occ_categories[idx].m++;
						if (prev_idx_class != idx_class) {
							occ_categories[idx_class].m++;
							prev_idx_class = idx_class;
						}
					} else if (rec.gender == "femmina") {
						occ_categories[idx].f++;
						if (prev_idx_class != idx_class) {
							occ_categories[idx_class].f++;
							prev_idx_class = idx_class;
						}
					}
				}
			}
		}
	}
	
	d3.selectAll(".cell")
		.filter(function (d) {
			return d3.select(this).attr("data-type") == "male-count";
		})
		.select("text")
		.text(function(d) {
			var el = d3.select(this).node().parentNode;
			var idx = el.dataset.rowId;
			return "" + occ_categories[idx].m;
		});
		
	d3.selectAll(".cell")
		.filter(function (d) {
			return d3.select(this).attr("data-type") == "female-count";
		})
		.select("text")
		.text(function(d) {
			var el = d3.select(this).node().parentNode;
			var idx = el.dataset.rowId;
			return "" + occ_categories[idx].f;
		});
	
	// Apply to points
	updateVisualizedPoints(elems, true);
}

function brushcentered(mouseEvt, elems) {
	var dx = x(1860) - x(1850),
		cx = mouseEvt[0],
		x0 = cx - dx / 2,
		x1 = cx + dx / 2;
	
	brushHandle.attr("x", function(d) {
		if (d.type == "w")
			return (parseInt(d3.select(".handle--w").attr("x")) + 2.5);
		else return (parseInt(d3.select(".handle--e").attr("x")) + 1);
	});
	brushSelection.call(
		brush.move, x1 > scaleW ? [scaleW - dx, scaleW] : x0 < 0 ? [0, dx] : [x0, x1]
	);
	
	rangeChanged = true;
	getYearLimits(elems);
}

function brushed(evt, elems) {
	if (!evt.selection) return;
	var extent = evt.selection.map(x.invert, x);
	brushHandle.attr("x", function(d) {
		if (d.type == "w")
			return (parseInt(d3.select(".handle--w").attr("x")) + 2.5);
		else return (parseInt(d3.select(".handle--e").attr("x")) + 1);
	});
	
	rangeChanged = true;
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
	
	brushHandle.attr("x", function(d) {
		if (d.type == "w")
			return (parseInt(d3.select(".handle--w").attr("x")) + 2.5);
		else return (parseInt(d3.select(".handle--e").attr("x")) + 1);
	});
	brushSelection.transition().call(brush.move, d1.map(x));
	
	rangeChanged = true;
	getYearLimits(elems);
}

function gridSelection(rowId) {
	grid.selectAll("rect")
		.attr("fill", "#fff")
		
	occGroupSelected = [];
	d3.selectAll(".cell")
		.filter(function(d) {
			var id = d3.select(this).attr("data-rowId");
			return parseInt(id) == rowId;
		})
		.selectAll("rect")
		.attr("fill", "#00cccc");
	
	if (rowId == 0) {
		occGroupSelected.push("all");
	} else if (rowId == occ_categories.length - 1) {
		occGroupSelected.push("other");
	} else {
		if (occ_categories[rowId].type == "category") {
			var subId_last = rowId + 1;
			while (occ_categories[subId_last].type == "subcategory") {
				occGroupSelected.push(occ_categories[subId_last].name);
				subId_last++;
			}
			d3.selectAll(".cell")
				.filter(function(d) {
					var id = d3.select(this).attr("data-rowId");
					return parseInt(id) > rowId && parseInt(id) < subId_last;
				})
				.selectAll("rect")
				.attr("fill", "#97eaea");
		} else occGroupSelected.push(occ_categories[rowId].name);
	}
}