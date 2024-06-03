import jviz from "jviz";

//Export features track schema
export const schema = {
    "width": 500,
    "height": 80,
    "theme": "light",
    "state": [
        {"name": "start", "value": 140690137},
        {"name": "end", "value": 140789727},
        {"name": "featureHeight", "value": 24},
        {"name": "featureRectHeight", "value": 8},
        {"name": "featureRectMargin", "value": 4},
        {"name": "regionColor", "value": jviz.colors.red},
        {"name": "titleValue", "value": "::: Features track"},
        {"name": "titleHeight", "value": 15}
    ],
    "data": [{
        "name": "grid",
        "value": [],
        "transform": [
            {"type": "identifier", "as": "index"}
        ]
    }, {
        "name": "features",
        "value": []
    }, {
        "name": "regions",
        "value": []
    }],
    "scales": [{
        "name": "x",
        "type": "linear",
        "domain": [{"state": "start"}, {"state": "end"}],
        "range": {"draw": "width"}
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
        "description": "Features rectangle",
        "name": "region",
        "type": "rectangle",
        "source": {"data": "features"},
        "render": {
            "init": {
                "x1": {"field": "start", "scale": "x"},
                "x2": {"field": "end", "scale": "x"},
                "y": {"expr": "(datum.row * state.featureHeight) + state.titleHeight" },
                "height": {"state": "featureRectHeight"},
                "fill": {"field": "displayColor"},
                "stroke": {"field": "displayColor"},
                "strokeWidth": {"value": "1px"}
            }
        },
        "tooltip": {
            "value": "datum.displayTooltip"
        }
    }, {
        "description": "Features name",
        "type": "text",
        "source": {"data": "features"},
        "render": {
            "init": {
                "x": {"expr": "min(datum.start, datum.end)", "scale": "x"},
                "y": {"expr": "datum.row*state.featureHeight + state.featureRectHeight + state.featureRectMargin + state.titleHeight"},
                "text": {"field": "displayName"},
                "baseline": {"value": "hanging"},
                "textAnchor": {"value": "start"},
                "fontSize": {"value": "8px"},
                "fontWeight": {"value": "bold"}
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
                "y1": {"value": 0},
                "y2": {"draw": "height"},
                "fill": {"state": "regionColor"},
                "stroke": {"state": "regionColor"},
                "strokeWidth": {"value": "2px"},
                "opacity": {"value": 0.5}
            }
        }
    }, {
        "description": "Title",
        "type": "text",
        "render": {
            "init": {
                "x": {"value": 0},
                "y": {"value": 0},
                "text": {"state": "titleValue"},
                "fill": {"color": "black"},
                "opacity": {"value": 0.6},
                "fontWeight": {"value": "bold"},
                "fontSize": {"value": "10px"},
                "baseline": {"value": "hanging"},
                "textAnchor": {"value": "start"}
            }
        }
    }]
};

