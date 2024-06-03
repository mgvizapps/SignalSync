import React from "react";
import kofi from "kofi";
import {If, Renderer} from "neutrine/lib/components";
import {DataTable} from "neutrine/lib/datatable";
import {Heading} from "neutrine/lib/components";
import {Rule} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Placeholder} from "neutrine/lib/components";
import {Row, Column} from "neutrine/lib/components";

import {KaryotypeTrack} from "common/src/tracks/Karyotype/index.js";
import {ChromosomeTrack} from "common/src/tracks/Chromosome/index.js";
import {toReadableSize} from "common/src/utils/tracks.js";
import {Editor} from "common/src/components/Editor/index.js";
import {Boxplot} from "../components/Boxplot/index.js";
import {getCNVStateName, getCNVStateLabel, getCNVStateColor} from "../utils/cnv.js";

//Build initial state from props
let buildInitialStateFromProps = function (props) {
    let newState = {
        "currentChromosome": props.chromosomes[0]
    };
    //Return the new state
    return newState;
};

//Render region state
let renderStateColumn = function (region) {
    return React.createElement("div", {
        "className": "siimple--border-rounded siimple--p-1",
        "style": {
            "color": "#ffffff",
            "fontWeight": "bold",
            "textAlign": "center",
            "backgroundColor": getCNVStateColor(region.state)
        }
    }, getCNVStateLabel(region.state)); 
};

//CNVRegions table columns
let getCNVRegionsColumns = function () {
    return kofi.values({
        "selection": {
            "title": "",
            "selectable": true,
            "selected": function (row) { return row.selected; }
        },
        "cytobands": {
            "title": "Cytobands", 
            "key": "displayCytobands",
            "width": "200px"
        },
        "state": {
            "title": "State", 
            "render": renderStateColumn,
            "width": "60px"
        },
        "size": {
            "title": "Size", 
            "key": "displaySize",
            "bodyStyle": {
                "textAlign": "center"
            },
            "width": "120px"
        },
        "genes": {
            "title": "Genes", 
            "render": function (row) { return row.genes.length; },
            "bodyStyle": {
                "textAlign": "center"
            },
            "width": "70px"
        },
        "genesList": {
            "title": "Genes list", 
            "render": function (row) { return row.genes.join(", "); },
            "width": "300px"
        },
        "slice": {
            "title": "Slice", 
            "key": "slice",
            "width": "225px"
        }
    });
};

//Export report annotation page
export class ReportAnnotationView extends React.Component {
    constructor(props) {
        super(props);
        this.state = buildInitialStateFromProps(props);
        this.ref = {
            "description": React.createRef()
        };
        //Bind methods
        this.getAnnotation = this.getAnnotation.bind(this);
        this.handleChromosomeChange = this.handleChromosomeChange.bind(this);
        this.handleRegionsTableRowSelect = this.handleRegionsTableRowSelect.bind(this);
    }
    //Handle chromosome change
    handleChromosomeChange(name) {
        let chromosome = this.props.chromosomes.filter(function (chromosome) {
            return chromosome.name === name;
        });
        //Update the state
        return this.setState({
            "currentChromosome": chromosome[0]
        });
    }
    //Handle row selection in regions table
    handleRegionsTableRowSelect(event, row, rowIndex, column, columnIndex) {
        console.log(`ROW ${rowIndex} clicked on column ${columnIndex}`);
        //Check for the first column --> select this region
        if (columnIndex === 0) {
            return this.props.onRegionSelect(row.slice);
        }
        //Other row --> nothing to do
        return null;
    }
    //Get current annotation
    getAnnotation() {
        return {
            "description": this.ref.description.current.value()
        };
    }
    //Render the summary view
    render() {
        let self = this;
        let currentChromosome = this.state.currentChromosome; //Get current chromosome
        let currentGenes = this.props.genes.filter(function (gene) {
            return gene.chromosome === currentChromosome.name;
        });
        //Filter regions --> get only regions with amplification or deletion state
        let currentRegions = this.props.regions.filter(function (region) {
            return region.state !== "neutral";
        });
        //Build the report summary view
        return (
            <React.Fragment>
                {/* Karyotype */}
                <div className="siimple--bg-white siimple--p-3 siimple--mb-3 siimple--border-rounded">
                    <Renderer render={function () {
                        return React.createElement(KaryotypeTrack, {
                            "currentChromosome": currentChromosome,
                            "chromosomes": self.props.chromosomes,
                            "cytobands": self.props.cytobands,
                            "regions": self.props.genes,
                            "onChromosomeClick": self.handleChromosomeChange
                        });
                    }} />
                </div>
                <Rule />
                {/* Chromosome and boxplot area */}
                <Heading type="h5">Chromosome {currentChromosome.name}</Heading>
                {/* If no genes on this chromosome --> display empty */}
                <If condition={currentGenes.length === 0}>
                    <Placeholder align="center" className="siimple--p-4">
                        No genes on this chromosome
                    </Placeholder>
                </If>
                {/* If genes are available on this chromosome */}
                <If condition={currentGenes.length > 0}>
                    <div className="siimple--bg-white siimple--p-4 siimple--mb-3 siimple--border-rounded">
                        <Renderer render={function () {
                            return React.createElement(ChromosomeTrack, {
                                "key": currentChromosome.name,
                                "currentChromosome": currentChromosome,
                                "cytobands": self.props.cytobands,
                                "regions": currentGenes,
                                "onRegionClick": function () { 
                                    return null;  //Nothing to do
                                }
                            });
                        }} />
                    </div>
                    <div className="siimple--bg-white siimple--p-4 siimple--mb-3 siimple--border-rounded">
                        <Renderer render={function () {
                            return React.createElement(Boxplot, {
                                "genes": currentGenes,
                                "thresholds": self.props.thresholds
                            });
                        }} />
                    </div>
                </If>
                <Rule />
                {/* Report content */}
                <Row className="siimple--mb-3">
                    <Column size="6" style={{"maxWidth":"450px"}}>
                        <div className="siimple--bg-white siimple--p-1 siimple--border-rounded">
                            <Renderer render={function () {
                                return React.createElement(DataTable, {
                                    "data": currentRegions,
                                    "columns": getCNVRegionsColumns(),
                                    "pagination": false,
                                    "height": "300px",
                                    "border": false,
                                    "onBodySelect": self.handleRegionsTableRowSelect
                                });
                            }} />
                        </div>
                    </Column>
                    <Column size="6">
                        <div className="siimple--bg-white siimple--p-4 siimple--border-rounded">
                            <Renderer render={function () {
                                return React.createElement(Editor, {
                                    "ref": self.ref.description,
                                    "defaultValue": self.props.description
                                });
                            }} />
                        </div>
                    </Column>
                </Row>
                {/* Generate report button */}
                <div className="siimple--mt-4">
                    <Btn color="success" onClick={this.props.onGenerateReportClick} fluid>
                        <strong>Download report</strong>
                    </Btn>
                </div>
            </React.Fragment>
        );
    }
}

