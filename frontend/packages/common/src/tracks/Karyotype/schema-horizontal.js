import {cytobandsColors} from "../../colors.js";

//Export horizontal schema
export const schemaHorizontal = {
    "width": 0,
    "height": 0,
    "margin": {"top": 5, "bottom": 20},
    "theme": "light",
    "style": {
        "background": "#ffffff"
    },
    "state": [
        {"name": "chrLength", "value": null},
        {"name": "chrWidth", "value": 12},
        {"name": "chrCurrent", "value": null},
        {"name": "chrHover", "value": null}
    ],
    "data": [{
        "name": "chromosomes",
        "value": [],
        "transform": [
            {"type": "formula", "expr": "replace(datum.name, 'chr', '')", "as": "name"},
            {"type": "rename", "fields": ["name"], "as": ["chromosome"]},
            {"type": "range", "field": "length", "state": "chrLength"}
        ]
    }, {
        "name": "cytobands",
        "value": [],
        "transform": [{
            "type": "formula", 
            "expr": "replace(datum.chromosome, 'chr', '')",
            "as": "chromosome"
        }, {
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
        }]
    }],
    "scales": [{
        "name": "x",
        "type": "interval",
        "margin": 0.125,
        "spacing": 0.125,
        "domain": {"data": "chromosomes", "field": "name"},
        "range": {"draw": "width"}
    }, {
        "name": "y",
        "type": "linear",
        "domain": [0, {"state": "chrLength[1]"}],
        "range": [0, {"draw": "height"}]
    }, {
        "name": "cytobands",
        "type": "categorical",
        "domain": Object.keys(cytobandsColors),
        "range": Object.keys(cytobandsColors).map(function (key) {
            return cytobandsColors[key];
        })
    }],
    "geoms": [{
        "description": "Chromosomes name",
        "type": "text",
        "source": {"data": "chromosomes"},
        "render": {
            "init":  {
                "text": {"field": "name"},
                "x": {"scale": "x", "field": "name", "interval": 0.5},
                "y": {"expr": "draw.height + draw.margin.bottom / 2"},
                "fontSize": {"value": "10px"},
                "fontWeight": {"value": "bold"}
            },
            "update": {
                "opacity": [
                    {"test": "state.chrCurrent === datum.name", "value": 1.0},
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
                "x1": {"scale": "x", "field": "chromosome", "interval": 0.5},
                "x2": {"scale": "x", "field": "chromosome", "interval": 1},
                "y": {"expr": "draw.height - scale('y', datum.chrLength) + scale('y', (datum.end + datum.start) / 2)"},
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
                "x": {"scale": "x", "field": "chromosome", "interval": 1},
                "y": {"expr": "draw.height - scale('y', datum.chrLength) + scale('y', (datum.end + datum.start) / 2)"},
                "radius": {"value": 3}
            },
            "update": {
                "fill": {"field": "displayColor"}
            }
        }

    }, {
        "description": "cytobands colors",
        "type": "rectangle",
        "source": {"data": "cytobands"},
        "render": {
            "init": {
                "xCenter": {"scale": "x", "field": "chromosome", "interval": 0.5},
                "y": {"expr": "draw.height - scale('y', datum.chrLength) + scale('y', datum.start)"},
                "width": {"state": "chrWidth"},
                "height": {"expr": "max(1, scale('y', datum.end - datum.start))"},
                "fill": {"field": "stain", "scale": "cytobands"}
            }
        }
    }, {
        "description": "regions rectangle",
        "type": "rectangle",
        "source": {"data": "regions"},
        "render": {
            "init": {
                "xCenter": {"scale": "x", "field": "chromosome", "interval": 0.5},
                "y": {"expr": "draw.height - scale('y', datum.chrLength) + scale('y', datum.start)"},
                "width": {"state": "chrWidth"},
                "height": {"expr": "max(1, scale('y', datum.end - datum.start))"},
                "fill": {"color": "red"}
            }
        }
    }, {
        "description": "chromosome mask",
        "type": "rectangle",
        "source": {"data": "chromosomes"},
        "render": {
            "init": {
                "xCenter": {"scale": "x", "field": "name", "interval": 0.5},
                "y": {"expr": "draw.height - scale('y', datum.length)"},
                "width": {"state": "chrWidth"},
                "height": {"scale": "y", "field": "length"},
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
                "x1": {"scale": "x", "field": "name", "interval": 0},
                "x2": {"scale": "x", "field": "name", "interval": 1},
                "y1": {"value": 0},
                "y2": {"draw": "height"},
                "cursor": "pointer",
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
}
