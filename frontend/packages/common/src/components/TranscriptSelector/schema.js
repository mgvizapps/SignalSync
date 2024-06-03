export const schema = {
    "width": 0,
    "height":0,
    "margin": 0,
    "theme": "light",
    "state": [
        {"name": "geneStart", "value": 0},
        {"name": "geneEnd", "value": 0},
        {"name": "geneStrand", "value": "+1"},
        {"name": "selection", "value": {}}
    ],
    "data": [{
        "name": "regions",
        "value": []
    }, {
        "name": "transcripts",
        "source": "regions",
        "transform": [{
            "type": "summarize",
            "groupby": "ensembl_transcript_id",
            "fields": ["exon_chrom_start", "exon_chrom_end", "refseq"],
            "op": ["min", "max", "first"],
            "as": ["transcript_start", "transcript_end", "refseq"]
        }, {
            "type": "formula",
            "expr": "nest(state.selection, datum.ensembl_transcript_id)",
            "as": "selected"
        }]
    }],
    "scales": [{
        "name": "x",
        "type": "linear",
        "domain": [
            {"state": "geneStart"},
            {"state": "geneEnd"}
        ],
        "range": [[
            {"test": "state.geneStrand === '+1'", "value": 5},
            {"expr": "draw.width - 5"}
        ], [
            {"test": "state.geneStrand === '-1'", "value": 5},
            {"expr": "draw.width - 5"}
        ]]
    }, {
        "name": "y",
        "type": "interval",
        "spacing": 0.1,
        "padding": 0,
        "domain": {"data": "regions", "field": "ensembl_transcript_id"},
        "range": [0, {"draw": "height"}]
    }],
    "geoms": [{
        "description": "transcript line",
        "type": "line",
        "source": {"data": "transcripts"},
        "render": {
            "init": {
                "x1": {"field": "transcript_start", "scale": "x"},
                "x2": {"field": "transcript_end", "scale": "x"},
                "y": {"field": "ensembl_transcript_id", "scale": "y", "interval": 0.3},
                "stroke": {"color": "blue"},
                "strokeWidth": {"value": "1px"}
            }
        }
    }, {
        "description": "transcript_name",
        "type": "text",
        "source": {"data": "transcripts"},
        "render": {
            "init": {
                "x": {"value": 5},
                "y": {"field": "ensembl_transcript_id", "scale": "y", "interval": 0.6},
                "text": [
                    {
                        "test": "datum.refseq !== ''",
                        "expr": "datum.ensembl_transcript_id + ' ' + datum.refseq"
                    },
                    {"field": "ensembl_transcript_id"}
                ],
                "textAnchor": {"value": "start"},
                "baseline": {"value": "hanging"},
                "fill": {"color": "blue"},
                "fontWeight": {"value": "bold"},
                "fontSize": {"value": "10px"}
            }
        }
    }, {
        "description": "exons",
        "type": "rectangle",
        "source": {"data": "regions"},
        "render": {
            "init": {
                "x1": {"field": "exon_chrom_start", "scale": "x"},
                "x2": {"field": "exon_chrom_end", "scale": "x"},
                "y1": {"field": "ensembl_transcript_id", "scale": "y", "interval": 0.2},
                "y2": {"field": "ensembl_transcript_id", "scale": "y", "interval": 0.4},
                "fill": {"color": "blue"}
            }
        }
    }, {
        "description": "transcript mask",
        "name": "transcriptMask",
        "type": "rectangle",
        "source": {"data": "transcripts"},
        "render": {
            "init": {
                "x1": {"value": 0},
                "x2": {"draw": "width"},
                "y1": {"field": "ensembl_transcript_id", "scale": "y", "interval": 0},
                "y2": {"field": "ensembl_transcript_id", "scale": "y", "interval": 1},
                "cursor": {"value": "pointer"},
                "fill": {"color": "blue"}
            },
            "hover": {
                "opacity": [
                    {"test": "datum.selected", "value": "0.2"},
                    {"value": "0.1"}
                ]
            },
            "update": {
                "opacity": [
                    {"test": "datum.selected", "value": "0.2"},
                    {"value": "0"}
                ]
            }
        }
    }],
    "events": [{
        "on": "clickdown:geom@transcriptMask",
        "fire": "select"
    }]
};

