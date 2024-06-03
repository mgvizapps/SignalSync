import {cytobandsColors} from "../../colors.js";

//Export vertical karyotype schema
export const schemaVertical = {
    "width": 0,
    "height": 0,
    "margin": {"top": 5, "bottom": 5, "right": 5, "left": 25},
    "theme": "light",
    "state": [
        {"name": "chrLength", "value": 0},
        {"name": "chrHeight", "value": 8},
        {"name": "chrCurrent", "value": null},
        {"name": "chrHover", "value": null}
    ],
    "data": [{
        "name": "chromosomes",
        "value": [],
        "transform": [{
            "type": "rename", 
            "fields": ["name"], 
            "as": ["chromosome"]
        }, {
            "type": "range", 
            "field": "length", 
            "state": "chrLength"
        }]
    }, {
        "name": "cytobands",
        "value": [],
        "transform": [{
            "type": "extend", 
            "from": "chromosomes",
            "key": "chromosome",
            "fields": ["length"],
            "as": ["chrLength"]
        }]
    }, {
        "name": "regions",
        "value": [],
        "transform": [{
            "type": "extend",
            "from": "chromosomes",
            "key": "chromosome",
            "fields": ["length"],
            "as": ["chrLength"]
        }, {
            "type": "formula", 
            "expr": "(datum.end + datum.start) / 2", 
            "as": "_center"
        }]
    }],
    "scales": [{
        "name": "y",
        "type": "interval",
        "margin": 0.125,
        "spacing": 0.125,
        "domain": {"data": "chromosomes", "field": "name"},
        "range": [0, {"draw": "height"}]
    }, {
        "name": "x",
        "type": "linear",
        "domain": [0, {"state": "chrLength[1]"}],
        "range": [0, {"draw": "width"}]
    }, {
        "name": "cytobands",
        "type": "categorical",
        "domain": Object.keys(cytobandsColors),
        "range": Object.keys(cytobandsColors).map(function (key) {
            return cytobandsColors[key];
        })
    }],
    "geoms": [{
        "description": "Chromosome name",
        "type": "text",
        "source": {"data": "chromosomes"},
        "render": {
            "init":  {
                "text": {"field": "name"},
                "x": {"expr": "- draw.margin.left / 2"},
                "y": {"scale": "y", "field": "name", "interval": 0.5},
                "fontSize": {"value": "10px"},
                "fontWeight": {"value": "bold"},
                "fill": {"color": "black"}
            },
            "update": {
                "opacity": [
                    {"test": "state.chrCurrent === datum.name", "value": 1},
                    {"test": "state.chrHover === datum.name", "value": 0.7},
                    {"value": 0.3}
                ]
            }
        }
    }, {
        "description": "lollipop line",
        "type": "line",
        "source": {"data": "regions"},
        "render": {
            "init": {
                "x": {"expr": "scale('x', (datum.end + datum.start) / 2)"},
                "y1": {"scale": "y", "field": "chromosome", "interval": 0.5},
                "y2": {"scale": "y", "field": "chromosome", "interval": 0},
                "stroke": {"color": "gray"},
                "strokeWidth": {"value": "1px"}
            }
        }
    }, {
        "description": "lollipop circle",
        "type": "circle",
        "source": {"data": "regions"},
        "render": {
            "init": {
                "x": {"field": "_center", "scale": "x"},
                "y": {"scale": "y", "field": "chromosome", "interval": 0},
                "radius": {"value": 3}
            },
            "update": {
                "fill": {"color": "gray"}
            }
        }
    }, {
        "description": "cytobands colors",
        "type": "rectangle",
        "source": {"data": "cytobands"},
        "render": {
            "init": {
                "x": {"field": "start", "scale": "x"},
                "yCenter": {"scale": "y", "field": "chromosome", "interval": 0.5},
                "width": {"expr": "max(1, scale('x', datum.end - datum.start))"},
                "height": {"state": "chrHeight"},
                "fill": {"field": "stain", "scale": "cytobands"}
            }
        }
    }, {
        "description": "Regions rectangle",
        "type": "rectangle",
        "source": {"data": "regions"},
        "render": {
            "init": {
                "x": {"field": "start", "scale": "x"},
                "yCenter": {"scale": "y", "field": "chromosome", "interval": 0.5},
                "width": {"expr": "max(1, scale('x', datum.end - datum.start))"},
                "height": {"state": "chrHeight"},
                "fill": {"color": "red"}
            }
        }
    }, {
        "description": "chromosome mask",
        "type": "rectangle",
        "source": {"data": "chromosomes"},
        "render": {
            "init": {
                "x": {"value": 0},
                "yCenter": {"scale": "y", "field": "name", "interval": 0.5},
                "width": {"scale": "x", "field": "length"},
                "height": {"state": "chrHeight"},
                "radius": {"value": 4},
                "mask": {"value": true},
                "fill": {"color": "white"}
            }
        }
    }, {
        "name": "maskChromosome",
        "description": "Mask for chromosome events",
        "type": "rectangle",
        "source": {"data": "chromosomes"},
        "render": {
            "init": {
                "x1": {"value": 0},
                "x2": {"draw": "width"},
                "y1": {"scale": "y", "field": "name", "interval": 0},
                "y2": {"scale": "y", "field": "name", "interval": 1},
                "cursor": "pointer",
                "opacity": {"value": "0.2"},
                "fill": "transparent"
            }
        }
    }],
    "events": [{
        "on": "click:geom@maskChromosome", 
        "fire": "chromosome:click"
    }, {
        "on": "enter:geom@maskChromosome", 
        "update": {"state": "chrHover", "value": "event.datum.name"}
    }, {
        "on": "leave:scene",
        "update": {"state": "chrHover", "value": "null"}
    }]
};

