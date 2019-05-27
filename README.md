# Interactive Visualization of Notable People on Wikipedia

This repository contains an interactive map of the geographical distribution of all **notable** Italian people, registered in Wikipedia IT, born since 1850. People data was previously fetched by Wikidata archives and saved locally in order to be accessed as fast as possible. This map visualization highlights notable people density by province, adding color based on male/female and notable/total population ratios, can be filtered by birth year range, gender and/or occupation via on-page selectors, and provide also an option to switch between dotted and heatmap visual.

This project is written in Javascript using [D3.js](https://d3js.org) framework with the [d3-tip](https://github.com/VACLab/d3-tip) extension and [heatmap.js](https://www.patrick-wied.at/static/heatmapjs/) framework. Map shapes data paths are provided by [TopojsonItaly](https://github.com/qwince/TopojsonItaly).

##### Wikidata query references
  - Living people: [https://w.wiki/4Lq](https://w.wiki/4Lq)
  - Dead people: [https://w.wiki/4Lr](https://w.wiki/4Lr)
