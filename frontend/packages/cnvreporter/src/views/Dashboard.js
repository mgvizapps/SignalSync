import React from "react";
import kofi from "kofi";
import Rouct from "rouct";
import {If, Renderer, ForEach} from "neutrine/lib/components";
import {Heading} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";

import {Loading} from "common/src/components/Loading/index.js";
import {getChromosomes, getCytobands} from "common/src/species.js";

import {Thresholds} from "../components/Thresholds/index.js";
import {getAutomaticCNVState, getCNVStateColor, getCNVStateName} from "../utils/cnv.js";
import {getCNVRegions} from "../utils/cnv.js";
import {sortFeatures} from "../utils/features.js";

//Import views
import {SummaryView} from "./Summary.js";
import {GalleryView} from "./Gallery.js";
import {ReportView} from "./Report.js";

//Build initial state from props
let buildStateFromProps = function (props) {
    let newState = {
        "ready": false,
        "error": false,
        "name": null,
        "specie": null,
        "thresholds": {
            "amplification": 0.25,
            "deletion": -0.25
        },
        "genes": [],
        "regions": [], //CNV regions
        "chromosomes": [],
        "cytobands": []
    };
    //Return the new state
    return newState;
};

//Export dashboard view
export class DashboardView extends React.Component {
    constructor(props) {
        super(props);
        this.state = buildStateFromProps(props);
        //Bind methods
        this.handleThresholdsChange = this.handleThresholdsChange.bind(this);
        this.handleGenePinnedChange = this.handleGenePinnedChange.bind(this);
        this.handleGeneStateChange = this.handleGeneStateChange.bind(this);
        this.handleSummaryRedirect = this.handleSummaryRedirect.bind(this);
        this.handleGalleryRedirect = this.handleGalleryRedirect.bind(this);
        this.handleReportRedirect = this.handleReportRedirect.bind(this);
    }
    //Component did mount --> import data from client
    componentDidMount() {
        let self = this;
        let client = this.props.client; //Get client reference
        let thresholds = this.state.thresholds; //Get thresholds values
        let newState = {"ready": true};
        //Initialize client
        return client.init().then(function () {
            return client.getMetadata(); //Get project metadata
        }).then(function (metadata) {
            Object.assign(newState, metadata); //Update state with the new metadata
            //Import chromosomes and cytobands data
            return Promise.all([
                getCytobands(newState.specie.id, newState.specie.assembly),
                getChromosomes(newState.specie.id, newState.specie.assembly)
            ]);
        }).then(function (values) {
            //console.log(values);
            newState.chromosomesIndex = {}; //Initialize chromosomes index
            values[1].forEach(function (chromosome, index) {
                newState.chromosomesIndex[chromosome.name] = index;
            });
            //Update the state --> add chromosomes and cytobands data
            Object.assign(newState, {
                "cytobands": values[0],
                "chromosomes": values[1]
            });
            return client.getStats(); //Get genes and stats
        }).then(function (data) {
            //console.log(data);
            newState.genesIndex = {}; //Genes index
            newState.genes = sortFeatures(data, newState.chromosomes).map(function (gene, index) {
                newState.genesIndex[gene.name] = index; //Save gene index
                let geneState = getAutomaticCNVState(gene, thresholds); //Get CNA state
                return Object.assign(gene, {
                    "index": index,
                    "annotation": {
                        "state": geneState, //Current annotation state
                        "pinnedState": false //Gene pinned
                    },
                    "displayColor": getCNVStateColor(geneState),
                    "displayTooltip": `${gene.name} (${getCNVStateName(geneState)})`
                });
            });
            newState.regions = getCNVRegions(newState.genes);
            //Update the state with the new genes data
            return self.setState(newState, function () {
                //return Rouct.redirect("cnvreporter", "/dashboard/gallery/chr1");
                return self.handleSummaryRedirect();
            });
        }).catch(function (error) {
            console.error(error);
            return self.setState({"error": true});
        });
    }
    //Handle threshold values change
    handleThresholdsChange(deletion, amplification) {
        let self = this;
        let newThresholds = {"deletion": deletion, "amplification": amplification};
        let newGenesData = this.state.genes.map(function (gene, index) {
            if (gene.annotation.pinnedState === true) {
                return gene; //Nothing to update
            }
            let newState = getAutomaticCNVState(gene, newThresholds);
            //Update private state and status value
            return Object.assign(gene, {
                "annotation": Object.assign(gene.annotation, {
                    "state": newState
                }),
                "displayColor": getCNVStateColor(newState),
                "displayTooltip": `${gene.name} (${getCNVStateName(newState)})`
            });
        });
        //Return the new state
        return this.setState({
            "thresholds": newThresholds,
            "genes": newGenesData,
            "regions": getCNVRegions(newGenesData)
        });
    }
    //Handle gene state change --> change the state of the gene and set it as pinned
    handleGeneStateChange(name, newState) {
        let self = this;
        console.log(`Change state of gene '${name}' ---> '${newState}'`);
        //Build new genes data with the new gene state
        let newGenesData = this.state.genes.map(function (gene) {
            if (gene.name !== name) {
                return gene; //Nothing to change
            }
            //Update the state of the gene
            return Object.assign(gene, {
                "annotation": Object.assign(gene.annotation, {
                    "state": newState,
                    "pinnedState": true
                }),
                "displayColor": getCNVStateColor(newState),
                "displayTooltip": `${gene.name} (${getCNVStateName(newState)})`
            });
        });
        //Build the new state
        return this.setState({
            "genes": newGenesData,
            "regions": getCNVRegions(newGenesData)
        });
    }
    //Handle gene pinned change --> set or remove pinned state
    //TODO: allow remove the current pin
    handleGenePinnedChange(name) {
        let self = this;
        let thresholds = this.state.thresholds;
        let changedState = false; //To store if gene changes his state
        let newGenesData = this.state.genes.map(function (gene) {
            if (gene.name !== name) {
                return gene; //Nothing to change
            }
            //Update the pinned value of the gene
            let oldStateValue = gene.annotation.state; //Get old state value
            let newPinnedValue = !gene.annotation.pinnedState;
            let newStateValue = (newPinnedValue === false) ? getAutomaticCNVState(gene, thresholds) : oldStateValue;
            changedState = newStateValue !== oldStateValue; //Store if we have changed state
            return Object.assign(gene, {
                "annotation": Object.assign(gene.annotation, {
                    "pinnedState": newPinnedValue,
                    "state": newStateValue
                })
            });
        });
        //Check for building a new regions data
        let newRegionsData = this.state.regions; //Get regions
        if (changedState === true) {
            newRegionsData = getCNVRegions(newGenesData);
        }
        //Update the state with the new genes data
        return this.setState({
            "genes": newGenesData,
            "regions": newRegionsData
        });
    }
    //Handle summary redirect --> open summary view
    handleSummaryRedirect() {
        return Rouct.redirect("cnvreporter", "/dashboard/summary");
    }
    //Handle gallery redirect --> open gallery page
    handleGalleryRedirect(chromosome) {
        if (typeof chromosome !== "string") {
            chromosome = this.state.chromosomes[0].name; //Get first chromosome
        }
        //Redirect to the gallery page
        return Rouct.redirect("cnvreporter", `/dashboard/gallery/${chromosome}`);
    }
    //Handle report redirect
    handleReportRedirect() {
        return Rouct.redirect("cnvreporter", "/dashboard/report?tab=annotation");
    }
    //Render dashboard content
    render() {
        let self = this;
        //Check if dashboard is not ready --> display loading screen
        if (this.state.ready === false) {
            return React.createElement(Loading, {});
        }
        let menuButtonClass = "siimple--flex siimple--flex-center siimple--mt-2";
        //Render dashboard content
        return (
            <div className="siimple--flex">
                {/* Left side content */}
                <div className="siimple--mr-3" style={{"maxWidth":"350px","minWidth":"300px"}}>
                    <div className="siimple--bg-white siimple--border-rounded siimple--p-4 siimple--mb-3">
                        {/* Menu with the information of the file */}
                        <div className="siimple--mb-4" align="center">
                            <Heading type="h5" className="siimple--text-tructate siimple--mb-0" align="center">
                                <strong title={this.state.name}>{this.state.name}</strong>
                            </Heading>
                            <div className="siimple--text-small" align="center" style={{"opacity":"0.5"}}>
                                <strong>{this.state.specie.name}</strong>
                            </div>
                        </div>
                        {/* Reserved content for stats */}
                        {/* Menu buttons */}
                        <Btn fluid color="light" className={menuButtonClass} onClick={self.handleSummaryRedirect}>
                            <Icon icon="list-ul" size="24px" className="siimple--mr-2" />
                            <strong>Summary</strong>
                        </Btn>
                        <Btn fluid color="light" className={menuButtonClass} onClick={self.handleGalleryRedirect}>
                            <Icon icon="grid" size="24px" className="siimple--mr-2" />
                            <strong>Gallery</strong>
                        </Btn>
                        <Btn fluid color="light" className={menuButtonClass} onClick={self.handleReportRedirect}>
                            <Icon icon="edit" size="24px" className="siimple--mr-2" />
                            <strong>Report CNV Regions</strong>
                        </Btn>
                    </div>
                    {/* Thresholds wrapper */}
                    <Rouct.Route context="cnvreporter" path="/dashboard/:page" render={function (request) {
                        console.log(request.params.page);
                        if (request.params.page !== "summary" && request.params.page !== "gallery") {
                            return null; //Thresholds not visible for this page
                        }
                        //Render the thresholds wrapper
                        return (
                            <div className="siimple--bg-white siimple--border-rounded siimple--p-4">
                                <Renderer render={function () {
                                    return React.createElement(Thresholds, {
                                        "defaultDeletion": self.state.thresholds.deletion,
                                        "defaultAmplification": self.state.thresholds.amplification,
                                        "onChange": self.handleThresholdsChange
                                    });
                                }} />
                            </div>
                        );
                    }} />
                </div>
                {/* Dashboard partials */}
                <Rouct.Switch context="cnvreporter">
                    <Rouct.Route path="/dashboard/summary" exact render={function (request) {
                        return React.createElement(SummaryView, {
                            "thresholds": self.state.thresholds,
                            "chromosomes": self.state.chromosomes,
                            "cytobands": self.state.cytobands,
                            "genes": self.state.genes,
                            "regions": self.state.regions,
                            "onChromosomeClick": self.handleGalleryRedirect
                        });
                    }} />
                    <Rouct.Route path="/dashboard/gallery/:chromosome" render={function (request) {
                        return React.createElement(GalleryView, {
                            "key": request.params.chromosome,
                            "request": request,
                            "client": self.props.client,
                            "thresholds": self.state.thresholds,
                            "chromosomes": self.state.chromosomes,
                            "chromosomesIndex": self.state.chromosomesIndex,
                            "cytobands": self.state.cytobands,
                            "genes": self.state.genes,
                            "regions": self.state.regions,
                            "onGenePinnedChange": self.handleGenePinnedChange,
                            "onGeneStateChange": self.handleGeneStateChange
                        });
                    }} />
                    <Rouct.Route path="/dashboard/report" render={function (request) {
                        return React.createElement(ReportView, {
                            "request": request,
                            "client": self.props.client,
                            "thresholds": self.state.thresholds,
                            "chromosomes": self.state.chromosomes,
                            "chromosomesIndex": self.state.chromosomesIndex,
                            "cytobands": self.state.cytobands,
                            "genes": self.state.genes,
                            "genesIndex": self.state.genesIndex,
                            "regions": self.state.regions
                        });
                    }} />
                </Rouct.Switch>
            </div>
        );
    }
}


