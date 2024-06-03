import React from "react";
import Rouct from "rouct";
import {Renderer, ForEach, If} from "neutrine/lib/components";
import {Heading} from "neutrine/lib/components";
import {Row, Column} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {Select} from "neutrine/lib/components";
import {Media, MediaContent, MediaEnd} from "neutrine/lib/components";

import {GenePreview} from "../components/GenePreview/index.js";
import {GeneCard} from "../components/GeneCard/index.js";
import {CNVState} from "../utils/cnv.js";

//Build derived state from props
let buildDerivedStateFromProps = function (props) {
    let newState = {
        "gene": props.request.query.gene,
        "ready": false,
        "coverage": [],
        "background": [],
        "regions": []
    };
    //Return the new state
    return newState;
};

//Export gallery detail view
export class GalleryDetailView extends React.Component {
    constructor(props) {
        super(props);
        this.state = buildDerivedStateFromProps(props);
        //Referenced elements
        //Bind methods
        this.handleGeneClick = this.handleGeneClick.bind(this);
        this.handleGeneStateChange = this.handleGeneStateChange.bind(this);
    }
    //component did mount --> reload data
    componentDidMount() {
        let self = this;
        console.log("Getting gene data: " + this.state.gene);
        let gene = this.state.gene;
        let client = this.props.client;
        let newState = {
            "ready": true
        };
        //Import coverages and stats data
        return client.getCoverageData(gene).then(function (coverageData) {
            newState["coverage"] = coverageData; //Save coverage data
            return client.getRois(gene);
        }).then(function (roisData) {
            newState["regions"] = roisData; //Save rois data
            return client.getBackgroundData(gene);
        }).then(function (backgroundData) {
            newState["background"] = backgroundData;
            //console.log(newState);
            return self.setState(newState);
        }).catch(function (error) {
            console.error(error);
            //TODO
        });
    }
    //Get gene info by index
    getGene(index) {
        if (index < 0 || index >= this.props.genes.length) {
            return null; //No gene available
        }
        //Return the gene info
        return this.props.genes[index];
    }
    //Handle gene click
    handleGeneClick(name) {
        let chr = this.props.request.params.chromosome; //Get chromosome
        let gene = encodeURIComponent(name); //Encode gene name
        //return redirect(`/analysis/${params.analysis}/explorer/chromosome/${params.chromosome}/gene/${name}`);
        return Rouct.redirect("cnvreporter", `/dashboard/gallery/${chr}?gene=${gene}`);
    }
    //Handle gene state change --> change the state of this gene
    handleGeneStateChange(event) {
        let gene = this.state.gene; //Get gene name
        let newState = event.target.value; //Get new state value
        //console.log("NEW GENE STATE: " + newState);
        return this.props.onGeneStateChange(gene, newState);
    }
    //Render the gene detail page
    render() {
        let self = this;
        if (this.state.ready === false) {
            return "loading...";
            //return React.createElement(Loading, {}); //Display loading
        }
        //let params = this.props.request.params; //Get params reference
        let geneIndex = this.props.genesIndex[this.state.gene]; //Get current gene index
        //console.log("GENE INDEX: " + index);
        let genes = [
            this.getGene(geneIndex - 1), //Previous gene 
            this.getGene(geneIndex),     //Current gene
            this.getGene(geneIndex + 1)  //Next gene
        ];
        let genePinned = this.props.genes[geneIndex].annotation.pinnedState; //Save if gene is pinned
        let geneState = this.props.genes[geneIndex].annotation.state; //Save gene state
        let defaultGeneState = (genePinned === true) ? geneState : ""; //Default state for select
        let cnvStatesList = Object.keys(CNVState); //Get cnv state ites
        //Render gene detail page
        return (
            <React.Fragment>
                {/* Gene cards */}
                <Row className="siimple--mb-3">
                    <ForEach items={genes} render={function (gene, itemIndex) {
                        return (
                            <Column size="4" className="siimple--py-0" key={itemIndex}>
                                <If condition={gene !== null} render={function () {
                                    //let name = gene.name.toLowerCase(); //Get region name in lowercase for redirecting
                                    let index = self.props.genesIndex[gene.name]; //Get gene index
                                    return React.createElement(GeneCard, {
                                        "active": gene.name === self.state.gene,
                                        "pinned": gene.annotation.pinnedState,
                                        "state": gene.annotation.state,
                                        "name": gene.name,
                                        "image": self.props.images[index], 
                                        "grid": false, //Grid mode disabled
                                        "onClick": function (event) {
                                            event.stopPropagation(); //Stop propagation event
                                            return self.handleGeneClick(gene.name);
                                        },
                                        "onPinnedClick": function () {
                                            return self.props.onGenePinnedChange(gene.name);
                                        }
                                    });
                                }} />
                            </Column>
                        );
                    }} />
                </Row>
                {/* Gene preview */}
                <div className="siimple--bg-white siimple--p-4 siimple--border-rounded">
                    <Media className="siimple--mb-0">
                        <MediaContent>
                            <Heading type="h4" className="siimple--mb-0">
                                <strong>{self.state.gene.toUpperCase()}</strong>
                            </Heading>
                        </MediaContent>
                        <MediaEnd>
                            {/* Change gene state */}
                            <Select defaultValue={defaultGeneState} onChange={this.handleGeneStateChange}>
                                <option hidden disabled value=""> -- Change state -- </option>
                                <ForEach items={cnvStatesList} render={function (key) {
                                    return React.createElement("option", {"key": key, "value": key}, CNVState[key].name);
                                }} />
                            </Select>
                        </MediaEnd>
                    </Media>
                    {/* Gene preview */}
                    <Renderer render={function () {
                        return React.createElement(GenePreview, {
                            "coverage": self.state.coverage,
                            "regions": self.state.regions,
                            "background": self.state.background
                        });
                    }} />
                </div>
            </React.Fragment>
        );
    }
}


