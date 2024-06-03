import {cytobandsColors} from "../../colors.js";

//Export schema for chromosome track
export const schema = {
    "width": 0,
    "height": 0,
    "theme": "light",
    "style": {
        "background": "#ffffff"
    },
    "state": [
        {"name": "chromosomeLength", "value": 249250621},
        {"name": "chromosomeName", "value": "chr1"},
        {"name": "regionActive", "value": ""}
    ],
    "data": [{
        "name": "cytobands",
        "value": [],
        "transform": [{
            "type": "formula", 
            "expr": "(datum.end + datum.start) / 2", 
            "as": "_center"
        }]
    }, {
        "name": "regions",
        "value": [],
        "transform": [{
            "type": "formula", 
            "expr": "(datum.end + datum.start) / 2", 
            "as": "_center"
        }, {
            "type": "formula",
            "expr": "if(state.regionActive === datum.name, 20, 32)",
            "as": "_height"
        }, {
            "type": "spacing",
            "method": "optimized",
            "field": "_center",
            "domain": [0, {"state": "chromosomeLength"}],
            "separation": {"expr": "10 / draw.width"},
            "as": "_pos"
        }]
    }, {
        "name": "highlight",
        "value": []
    }],
    "scales": [{
        "name": "position",
        "type": "linear",
        "domain": [0, {"state": "chromosomeLength"}],
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
        "description": "Cytobands rectangles",
        "type": "rectangle",
        "source": {"data": "cytobands"},
        "render": {
            "init": {
                "x1": {"scale": "position", "field": "start"},
                "x2": {"scale": "position", "field": "end"},
                "y1": {"value": 50},
                "y2": {"value": 70},
                "fill": {"field": "stain", "scale": "cytobands"}
            }
        }
    }, {
        "description": "Cytobands labels",
        "type": "text",
        "source": {"data": "cytobands"},
        "render": {
            "init": {
                "x": {"field": "_center", "scale": "position"},
                "y": {"value": 76},
                "text": {"field": "name"},
                "textAnchor": {"value": "start"},
                "rotation": {"value": 80},
                "fontSize": {"value": "8px"},
                "fontWeight": {"value": "bold"},
                "fill": {"color": "navy"}
            }
        }
    }, {
        "description": "Regions rectangle",
        "type": "rectangle",
        "source": {"data": "regions"},
        "render": {
            "init": {
                "x": {"scale": "position", "field": "start"},
                "width": {"expr": "max(1, scale('position', datum.end - datum.start))"},
                "y1": {"value": 50},
                "y2": {"value": 70},
                "fill": {"color": "red"}
            }
        }
    }, {
        "description": "Chromosome mask",
        "type": "rectangle",
        "render": {
            "init": {
                "x1": {"value": 0},
                "x2": {"draw": "width"},
                "y1": {"value": 50},
                "y2": {"value": 70},
                "radius": {"value": 7},
                "mask": {"value": true},
                "fill": {"color": "white"}
            }
        }
    }, {
        "description": "Lollipops line start",
        "type": "polyline",
        "source": {"data": "regions"},
        "render": {
            "init": {
                "points": [
                    [{"scale": "position", "field": "_center"}, {"value": 50}],
                    [{"scale": "position", "field": "_center"}, {"value": 45}],
                    [{"expr": "datum._pos * draw.width"}, { "value": 40}],
                    [{"expr": "datum._pos * draw.width"}, {"field": "_height"}]
                ],
                "fill": {"value": "none"},
                "stroke": {"color": "gray"},
                "strokeWidth": {"value": "2px"}
            }
        }
    }, {
        "description": "Lollipop circle",
        "name": "lollipopCircle",
        "type": "circle",
        "source": {"data": "regions"},
        "render": {
            "init": {
                "x": {"expr": "datum._pos * draw.width"},
                "y": {"field": "_height"},
                "radius": {"value": 5},
                "cursor": {"value": "pointer"}
            },
            "update": {
                "fill": {"field": "displayColor"},
                "stroke": {"value": "transparent"},
                "strokeWidth": {"value": "2px"}
            }
        }
    }, {
        "description": "Highlighted regions",
        "type": "rectangle",
        "source": {"data": "highlight"},
        "render": {
            "init": {
                "x1": {"field": "start", "scale": "position"},
                "x2": {"field": "end", "scale": "position"},
                "y1": {"value": 0},
                "y2": {"draw": "height"},
                "fill": {"field": "displayColor"},
                "opacity": {"value": 0.3}
            }
        }
    }],
    "events": [
        {"on": "click:geom@lollipopCircle", "fire": "click:region"}
    ]
};

