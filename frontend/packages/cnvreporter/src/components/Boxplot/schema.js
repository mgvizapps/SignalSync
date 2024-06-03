export const schema = {
    "width": 0,
    "height": 0,
    "margin": {"left": 20, "right": 20, "top": 5, "bottom": 5},
    "theme": "light",
    "style": {
        "background": "#ffffff"
    },
    "state": [
        {"name": "deletion", "value": 0},
        {"name": "amplification", "value": 0}
    ],
    "data": [{
        "name": "genes",
        "value": [],
        "transform": [{
            "type": "formula", 
            "expr": "datum.stats.log2ratio.q75 - datum.stats.log2ratio.q25", 
            "as": "iqr"
        }, {
            "type": "formula",
            "expr": "max(datum.stats.log2ratio.min, datum.stats.log2ratio.q25 - 1.5 * datum.iqr)",
            "as": "rangeStart"
        }, {
            "type": "formula",
            "expr": "min(datum.stats.log2ratio.max, datum.stats.log2ratio.q75 + 1.5 * datum.iqr)",
            "as": "rangeEnd"
        }]
    }, {
        "name": "chromosomes",
        "source": "genes",
        "transform": [{
            "type": "summarize",
            "groupby": "chromosome",
            "fields": ["chromosome", "name", "name", "name"],
            "op": ["first", "first", "last", "count"],
            "as": ["chromosome", "first", "last", "genes"]
        }, {
            "type": "identifier", 
            "as": "index"
        }]
    }],
    "scales": [{
        "name": "x",
        "type": "interval",
        "domain": {"data": "genes", "field": "name"},
        "range": {"draw": "width"},
        "margin": 0
    }, {
        "name": "y",
        "type": "linear",
        "domain": [-1, 1],
        "range": {"draw": "height"}
    }],
    "axes": [{
        "position": "left",
        "scale": "y",
        "values": 5,
        "line": true,
        "lineWidth": "1px",
        "lineOpacity": 0.5,
        "labelSize": "8px",
        "labelAnchor": "end"
    }, {
        "position": "right",
        "scale": "y",
        "values": 5,
        "line": true,
        "lineWidth": "1px",
        "lineOpacity": 0.5,
        "labelSize": "8px",
        "labelAnchor": "start"
    }],
    "geoms": [{
        "type": "rectangle",
        "description": "zebra-striping background",
        "source": {"data": "chromosomes"},
        "render": {
            "init": {
                "x1": {"field": "first", "scale": "x", "interval": 0},
                "x2": {"field": "last", "scale": "x", "interval": 1},
                "y1": {"value": 0},
                "y2": {"draw": "height"},
                "fill": [
                    {"test": "(datum.index % 2) === 0", "value": "transparent"},
                    {"color": "gray"}
                ],
                "opacity": {"value": 0.4}
            }
        }
    }, {
        "type": "line",
        "description": "threshold deletion line",
        "render": {
            "init": {
                "x1": {"value": 0},
                "x2": {"draw": "width"},
                "stroke": {"color": "red"},
                "strokeWidth": {"value": "1px"},
                "opacity": {"value": "0.7"}
            },
            "update": {
                "y": {"expr": "scale('y', state.deletion)"}
            }
        }
    }, {
        "type": "line",
        "description": "threshold amplification line",
        "render": {
            "init": {
                "x1": {"value": 0},
                "x2": {"draw": "width"},
                "stroke": {"color": "green"},
                "strokeWidth": {"value": "1px"},
                "opacity": {"value": "0.7"}
            },
            "update": {
                "y": {"expr": "scale('y', state.amplification)"}
            }
        }
    }, {
        "type": "line",
        "description": "line for the boxplots",
        "source": {"data": "genes"},
        "render": {
            "init": {
                "x": {"field": "name", "scale": "x", "interval": 0.5},
                "y1": {"field": "rangeStart", "scale": "y"},
                "y2": {"field": "rangeEnd", "scale": "y"},
                "stroke": {"color": "black"},
                "strokeWidth": {"value": 1}
            }
        }
    }, {
        "type": "rectangle",
        "description": "rectangle of the boxplot",
        "source": {"data": "genes"},
        "render": {
            "init": {
                "x1": {"field": "name", "scale": "x", "interval": 0.3},
                "x2": {"field": "name", "scale": "x", "interval": 0.7},
                "y1": {"field": "stats.log2ratio.q25", "scale": "y"},
                "y2": {"field": "stats.log2ratio.q75", "scale": "y"},
                "stroke": {"color": "black"},
                "strokeWidth": {"value": "0px"}
            },
            "update": {
                "fill": {"field": "displayColor"}
            }
        }
    }, {
        "type": "rectangle",
        "description": "mean zone of the boxplot",
        "source": {"data": "genes"},
        "render": {
            "init": {
                "x1": {"field": "name", "scale": "x", "interval": 0.3},
                "x2": {"field": "name", "scale": "x", "interval": 0.7},
                "yCenter": {"field": "stats.log2ratio.q50", "scale": "y"},
                "height": {"value": 1},
                "fill": {"color": "black"}
            }
        }
    }, {
        "type": "line",
        "description": "chromosomes separator line",
        "source": {"data": "chromosomes"},
        "render": {
            "init": {
                "x": {"field": "last", "scale": "x", "interval": 1},
                "y1": {"value": 0},
                "y2": {"draw": "height"},
                "stroke": {"color": "black"},
                "strokeWidth": {"value": "1px"},
                "strokeDash": {"value": "4"},
                "opacity": {"value": 0.5}
            }
        }
    }, {
        "type": "text",
        "description": "chromosomes text",
        "source": {"data": "chromosomes"},
        "transform": [{
            "type": "filter",
            "expr": "datum.genes >= 9"
        }],
        "render": {
            "init": {
                "x": {"field": "first", "scale": "x", "interval": 0},
                "y": {"value": 0},
                "offsetX": {"value": 4},
                "offsetY": {"value": 4},
                "text": {"expr": "'Chr ' + datum.chromosome"},
                "textAnchor": {"value": "start"},
                "baseline": {"value": "hanging"},
                "fontSize": {"value": "8px"},
                "fontWeight": {"value": "bold"},
                "opacity": {"value": 0.8}
            }
        }
    }, {
        "type": "rectangle",
        "description": "Mask of each boxplot for displaying the gene name",
        "source": {"data": "genes"},
        "render": {
            "init": {
                "x1": {"field": "name", "scale": "x", "interval": 0},
                "x2": {"field": "name", "scale": "x", "interval": 1},
                "y1": {"value": 0},
                "y2": {"draw": "height"}
            },
            "update": {
                "fill": {"value": "transparent"}
            },
            "hover": {
                "fill": {"color": "orange"},
                "opacity": {"value": 0.2}
            }
        },
        "tooltip": {
            "value": "datum.displayTooltip"
        }
    }]
};

