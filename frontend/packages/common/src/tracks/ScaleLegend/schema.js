import jviz from "jviz";

//Export schema
export const schema = {
    "width": 500,
    "height": 40,
    "theme": "light",
    "state": [
        {"name": "start", "value": 140690137},
        {"name": "end", "value": 140789727},
        {"name": "strand", "value": "forward"},
        {"name": "length", "value": "15Kb"},
        {"name": "background", "value": "#ffffff"},
        {"name": "regionColor", "value": jviz.colors.red}
    ],
    "data": [{
        "name": "grid",
        "value": [],
        "transform": [
            {"type": "identifier", "as": "index"}
        ]
    }, {
        "name": "regions",
        "value": []
    }],
    "scales": [{
        "name": "x",
        "type": "linear",
        "domain": [{"state": "start"}, {"state": "end"}],
        "range": {"draw": "width"}
    }, {
        "name": "y",
        "type": "interval",
        "domain": ["arrow", "intervals", "labels"],
        "range": [0, {"draw": "height"}]
    }],
    "geoms": [{
        "type": "line",
        "source": {"data": "grid"},
        "transform": [
            {"type": "filter", "expr": "datum.index > 0"}
        ],
        "render": {
            "init": {
                "x": {"field": "start", "scale": "x"},
                "y1": {"value": 0},
                "y2": {"draw": "height"},
                "stroke": {"color": "gray"},
                "strokeWidth": {"value": "1px"}
            }
        }
    }, {
        "type": "rectangle",
        "source": {"data": "grid"},
        "render": {
            "init": {
                "x1": {"field": "start", "scale": "x"},
                "x2": {"field": "end", "scale": "x"},
                "yCenter": {"value": "intervals", "scale": "y", "interval": 0.5},
                "height": {"value": 5},
                "fill": [
                    {"test": "(datum.index % 2) === 0", "value": "#ffffff"},
                    {"color": "black"}
                ],
                "stroke": {"color": "black"},
                "strokeWidth": {"value": "1px"}
            }
        }
    }, {
        "type": "path",
        "description": "Left arrow",
        "source": null,
        "render": {
            "init": {
                "x": {"state": "start", "scale": "x"},
                "y": {"value": "arrow", "scale": "y", "interval": 0.5},
                "path": "m0,0l8,3l0,-6z",
                "fill": {"color": "black"}
            }
        }
    }, {
        "type": "path",
        "description": "Right arrow",
        "source": null,
        "render": {
            "init": {
                "x": {"state": "end", "scale": "x"},
                "y": {"value": "arrow", "scale": "y", "interval": 0.5},
                "path": "m0,0l-8,3l0,-6z",
                "fill": {"color": "black"}
            }
        }
    }, {
        "type": "line",
        "source": null,
        "render": {
            "init": {
                "x1": {"state": "start", "scale": "x"},
                "x2": {"state": "end", "scale": "x"},
                "y": {"value": "arrow", "scale": "y", "interval": 0.5},
                "fill": {"value": "none"},
                "stroke": {"color": "black"},
                "strokeWidth": {"value": "1px"},
                "strokeLineCap": {"value": "round"}
            }
        }
    }, {
        "type": "rectangle",
        "render": {
            "init": {
                "xCenter": {"expr": "draw.width / 2"},
                "width": {"value": 60},
                "y1": {"value": "arrow", "scale": "y", "interval": 0},
                "y2": {"value": "arrow", "scale": "y", "interval": 1},
                "fill": {"state": "background"}
            }
        }
    }, {
        "type": "text",
        "source": null,
        "render": {
            "init": {
                "x": {"expr": "draw.width / 2"},
                "y": {"value": "arrow", "scale": "y", "interval": 0.5},
                "text": {"state": "length"},
                "textAnchor": {"value": "middle"},
                "baseline": {"value": "middle"},
                "fontWeight": {"value": "bold"},
                "fontSize": {"value": "10px"}
            }
        }
    }, {
        "type": "text",
        "source": {"data": "grid"},
        "transform": [
            {"type": "filter", "expr": "(datum.index % 2) === 1"}
        ],
        "render": {
            "init": {
                "x": {"field": "start", "scale": "x"},
                "y": {"value": "labels", "scale": "y", "interval": 0.3},
                "text": {"field": "label"},
                "textAnchor": {"value": "start"},
                "baseline": {"value": "middle"},
                "fontWeight": {"value": "bold"},
                "fontSize": {"value": "8px"}
            }
        }
    }, {
        "description": "Custom regions highlight",
        "type": "rectangle",
        "source": {"data": "regions"},
        "render": {
            "init": {
                "x1": {"field": "start", "scale": "x"},
                "x2": {"field": "end", "scale": "x"},
                "y1": {"value": "intervals", "scale": "y", "interval": 0},
                "y2": {"draw": "height"},
                "fill": {"state": "regionColor"},
                "stroke": {"state": "regionColor"},
                "strokeWidth": {"value": "2px"},
                "opacity": {"value": 0.5}
            }
        }
    }]
};

