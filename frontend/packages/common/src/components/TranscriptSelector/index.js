import React from "react";
import kofi from "kofi";
import jviz from "jviz";
import {Renderer, If} from "neutrine/lib/components";
import {Heading, Paragraph, Small} from "neutrine/lib/components";
import {Label, Input, FieldLabel, FieldHelper, Switch} from "neutrine/lib/components";
import {Btn} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {Rule} from "neutrine/lib/components";
import {Spinner} from "neutrine/lib/components";
//import {Tip} from "neutrine/lib/components";
import {Alert, AlertTitle} from "neutrine/lib/components";
import {Placeholder} from "neutrine/lib/components";
import {Media, MediaContent, MediaStart, MediaEnd} from "neutrine/lib/components";

import {BiomartClient} from "../../clients/biomart.js";
import {listTranscripts, getTranscripts, buildMetaTranscript} from "./utils.js";
//import style from "./style.scss";
import {schema} from "./schema.js";

//Export transcript selector component
export class TranscriptSelector extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = {
            "loading": false,
            "geneName": null,
            "regions": [],
            "transcripts": [],
            "selection": {},
            "metatranscript": [],
            "error": false
        };
        //Referenced elements
        this.ref = {
            "geneName": React.createRef(),
            "transcripts": React.createRef()
        };
        //Other references
        this.client = new BiomartClient({
            //"host": "http://asia.ensembl.org/biomart"
            "host": this.props.specie.biomartHost
        });
        this.viewer = null; //transcripts viewer
        //Bind methods
        this.handleGeneSubmit = this.handleGeneSubmit.bind(this);
        this.handleGeneKeyPress = this.handleGeneKeyPress.bind(this);
        this.handleTranscriptSelect = this.handleTranscriptSelect.bind(this);
        this.submit = this.submit.bind(this);
        //Bind viewer management
        this.viewerMount = this.viewerMount.bind(this);
        this.viewerUpdate = this.viewerUpdate.bind(this);
        this.viewerUnmount = this.viewerUnmount.bind(this);
        //Regions management
        this.addRegions = this.addRegions.bind(this);
    }
    //Handle gene key pressed --> check for enter
    handleGeneKeyPress(event) {
        if (event.key === "Enter") {
            return this.handleGeneSubmit();
        }
        return null; //Nothing to do
    }
    //Handle gene submit --> import gene data
    handleGeneSubmit() {
        let self = this;
        if (this.state.loading === true) {
            return null; //Gene submitted
        }
        let geneName = this.ref.geneName.current.value;
        //Check for empty gene name or null value
        if (geneName === null || geneName.trim().length === 0) {
            return null; //TODO: display error message
        }
        //Initial new state
        let newState = {
            "geneName": geneName.trim(),
            "loading": true,
            "regions": [],
            "transcripts": [], //Clear transcripts list
            "selection": {}, //Clean selected transcripts
            "metatranscript": [], //Clean metatranscript
            "error": false
        };
        //geneName = geneName.trim();
        //Update the state with the new gene
        return this.setState(newState, function () {
            getTranscripts(self.client, newState.geneName).then(function (regions) {
                console.log(regions);
                return self.addRegions(regions); //Add regions
            }).catch(function (response) {
                return self.setState({
                    "loading": false,
                    "error": true //response.error is not stored here???
                });
            });
        });
    }
    //Handle transcript select
    handleTranscriptSelect(id) {
        let self = this;
        let selection = this.state.selection; //Get current selection
        if (typeof selection[id] !== "undefined") {
            delete selection[id]; //Remove from selection
        }
        else {
            selection[id] = true; //Add to selection
        }
        //Build the new state
        let newState = {
            "selection": selection,
            "metatranscript": buildMetaTranscript(this.state.regions, selection)
        };
        return this.setState(newState, function () {
            return self.viewerUpdate();
        });
    }
    //Handle submit --> send metatranscripts
    submit() {
        if (this.state.regions.length === 0 || this.state.metatranscript.length === 0) {
            return null; //No metatranscript available
        }
        let region = this.state.regions[0]; //For getting gene info
        let data = {
            "gene": region["external_gene_name"],
            "chromosome": region["chromosome_name"],
            "start": region["start_position"],
            "end": region["end_position"],
            "strand": region["strand"],
            "regions": this.state.metatranscript,
            "transcripts": Object.keys(this.state.selection)
        };
        //Return metatranscript info
        return data;
    }
    //Add regions to the transcript selector
    addRegions(regions) {
        let self = this;
        let newState = {
            "loading": false,
            "regions": regions,
            "transcripts": listTranscripts(regions),
            "selection": {}, //Reset selection
            "metatranscript": [] //Reset metatranscript
        };
        //Update the state
        return this.setState(newState, function () {
            return self.viewerMount(); //Mount viewer
        });
    }
    //Mount the viewer component
    viewerMount() {
        let self = this;
        let drawing = this.ref.transcripts.current.getBoundingClientRect();
        this.viewer = jviz(schema, {
            "parent": this.ref.transcripts.current
        });
        this.viewer.width(drawing.width);
        this.viewer.height(drawing.height);
        //Set initial values
        this.viewer.state("geneStart", this.state.regions[0]["start_position"]);
        this.viewer.state("geneEnd", this.state.regions[0]["end_position"]);
        this.viewer.state("geneStrand", this.state.regions[0]["strand"]);
        this.viewer.state("selection", this.state.selection);
        this.viewer.data("regions", this.state.regions);
        //Register event listeners
        this.viewer.addEventListener("select", function (event) {
            //console.log(event);
            return self.handleTranscriptSelect(event.datum["ensembl_transcript_id"]);
        });
        //Draw
        this.viewer.render();
    }
    //Viewer update
    viewerUpdate() {
        let drawing = this.ref.transcripts.current.getBoundingClientRect();
        //this.viewer.width(drawing.width);
        this.viewer.height(drawing.height); //Update height
        this.viewer.state("selection", this.state.selection); //Update selection
        this.viewer.data("regions", this.state.regions); //Update visible regions
        this.viewer.render(); //Update
    }
    //Viewer unmount
    viewerUnmount() {
        if (this.viewer !== null) {
            this.viewer.destroy(); //Remove viewer
        }
        this.viewer = null;
    }
    //Render the transcript selector component
    render() {
        let self = this;
        let transcripts = this.state.transcripts; //Get transcripts list
        //TODO: check for no specie provided --> display error
        //let hasMetatranscript = this.state.metatranscript.length > 0;
        return (
            <div className="siimple--mb-3">
                {/* Gene selection */}
                <Media className="siimple--mb-3">
                    <MediaStart className="siimple--mr-2">
                        <Label className="siimple--py-2">Gene:</Label>
                    </MediaStart>
                    <MediaContent>
                        <Renderer render={function () {
                            return React.createElement(Input, {
                                "type": "text",
                                "ref": self.ref.geneName,
                                "onKeyPress": self.handleGeneKeyPress,
                                "fluid": true,
                                "placeholder": "BRCA1"
                            });
                        }} />
                    </MediaContent>
                    <MediaEnd className="siimple--ml-2">
                        <Btn className="siimple--ml-1" color="primary" onClick={this.handleGeneSubmit}>
                            <strong>Search</strong>
                        </Btn>
                    </MediaEnd>
                </Media>
                {/* Error importing data */}
                <If condition={this.state.error === true}>
                    <Alert color="error" className="siimple--mb-3">
                        <AlertTitle className="siimple--mb-1" style={{"fontSize":"20px"}}>
                            <strong>Error getting gene info</strong>
                        </AlertTitle>
                        <div className="siimple--mb-0">
                            Someting went wrong getting the list of transcripts of the provided gene. 
                            Please check the gene name and try again. If the problem persists, please contact us.
                        </div>
                    </Alert>
                </If>
                {/* Loading data */}
                <If condition={this.state.loading === true}>
                    <Placeholder className="siimple--p-7">
                        <Spinner color="primary" />
                        <div className="siimple--mt-1">
                            <Small>Getting transcripts. Wait a second...</Small>
                        </div>
                    </Placeholder>
                </If>
                {/* No regions to display */}
                {/* TODO: customize displayed message when no regions are found */}
                <If condition={!this.state.loading && this.state.regions.length === 0}>
                    <Placeholder className="siimple--p-7">
                        <div align="center" className="siimple--mb-2">
                            <Icon icon="align-center" size="30px" />
                        </div>
                        <div align="center">
                            <Heading type="h6" className="siimple--mb-0">No transcripts to display</Heading>
                            <div className="siimple--text-muted">
                                Type a <strong>gene name</strong> in the input box to get started!
                            </div>
                        </div>
                    </Placeholder>
                </If>
                {/* Display regions data */}
                <If condition={!this.state.loading && this.state.regions.length > 0}>
                    <Placeholder className="siimple--p-1 siimple--mb-2" style={{"height":"300px","overflow":"auto"}}>
                        <Renderer render={function () {
                            return React.createElement("div", {
                                "style": {
                                    "width": "100%",
                                    "height": (transcripts.length * self.props.transcriptHeight) + "px"
                                },
                                "ref": self.ref.transcripts
                            });
                        }} />
                    </Placeholder>
                </If>
                {/* Render number of transcripts */}
                <If condition={transcripts.length > 0}>
                    <div align="right" className="siimple--mb-1 siimple--text-small siimple--text-muted">
                        Showing <strong>{transcripts.length} transcripts</strong>.
                    </div>
                </If>
            </div>
        );
    }
}

TranscriptSelector.defaultProps = {
    "transcriptHeight": 35,
    "specie": null
};


