import React from "react";
import Rouct from "rouct";
import {If, ForEach} from "neutrine/lib/components";
import {Heading} from "neutrine/lib/components";
import {Content} from "neutrine/lib/components";
import {Nav, NavItem} from "neutrine/lib/components";

import {CNVRegionsColumns} from "../utils/cnv.js";
import {generateReport} from "../report.js";

//Import available views
import {ReportAnnotationView} from "./ReportAnnotation.js";
import {ReportPreviewView} from "./ReportPreview.js";

//Build initial state from props
let buildInitialStateFromProps = function (props) {
    let newState = {
        "description": "",
        "tabs": {"annotation": "Annotation", "preview": "Preview"},
        "regions": []
    };
    //Generate new regions data --> clone with a selected field
    newState["regions"] = props.regions.map(function (region) {
        return Object.assign(region, {"selected": true});
    });
    //Return the new state
    return newState;
};

//Export report page
export class ReportView extends React.Component {
    constructor(props) {
        super(props);
        this.state = buildInitialStateFromProps(props);
        this.ref = {
            "annotation": React.createRef()
        };
        //Bind methods
        this.getCurrentTab = this.getCurrentTab.bind(this);
        this.generateReport = this.generateReport.bind(this);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.handleRegionSelect = this.handleRegionSelect.bind(this);
        this.handleGenerateReportClick = this.handleGenerateReportClick.bind(this);
    }
    //Get the current tab
    getCurrentTab() {
        return this.props.request.query.tab || "annotation";
    }
    //Generate the report
    generateReport() {
        let annotation = {"description": this.state.description}; //Get current annotation
        if (this.getCurrentTab() === "annotation") {
            annotation = this.ref.annotation.current.getAnnotation(); 
        }
        //Generate the report
        return generateReport(this.props.client, {
            "annotation": annotation,
            "chromosomes": this.props.chromosomes,
            "chromosomesIndex": this.props.chromosomesIndex,
            "cytobands": this.props.cytobands,
            "genes": this.props.genes,
            "regions": this.props.regions.filter(function (region) {
                return region.state !== "neutral" && region.selected === true;
            }),
            "thresholds": this.props.thresholds
        });
    }
    //Handle generate report click --> generate the report
    handleGenerateReportClick() {
        console.log("---> Generate report");
        return this.generateReport().then(function (report) {
            return report.download("report.doc");
        });
    }
    //Handle tab click --> open this tab
    handleTabClick(event) {
        let currentTab = this.props.request.query.tab || "annotation"; //Get current tab
        let newTab = event.target.dataset.tab; //Get new tab name
        console.log("NEW TAB: " + newTab);
        if (currentTab === newTab) {
            return null; //Same tab --> nothing to change
        }
        //Check if the current tab is the annotation --> save annotation message
        let newState = {}; //Initialize new state
        if (currentTab === "annotation") {
            newState.annotation = this.ref.annotation.current.getAnnotation();
        }
        //Update the state and then redirect to the new tab
        return this.setState(newState, function () {
            return Rouct.redirect("cnvreporter", `/dashboard/report?tab=${newTab}`);
        });
    }
    //Handle reported regions change --> add or remove an reported region
    handleRegionSelect(slice) {
        let newRegionsData = this.state.regions.map(function (region) {
            if (region.slice !== slice) {
                return region; //Do not update this region
            }
            //Update the region --> change the selected field
            return Object.assign(region, {
                "selected": !region.selected
            });
        });
        //Update the state
        return this.setState({
            "regions": newRegionsData
        });
    }
    //Render the report view
    render() {
        let self = this;
        let currentTab = this.props.request.query.tab || "annotation"; //Get current tab
        return (
            <Content size="fluid" className="siimple--py-0">
                <Heading type="h1" className="siimple--mb-4">
                    <strong>{this.props.title}</strong>
                </Heading>
                {/* Navigation tabs */}
                <Nav tabs className="siimple--mb-3">
                    <ForEach items={Object.keys(this.state.tabs)} render={function (name) {
                        let tabActive = currentTab === name; //This tab is active
                        return (
                            <NavItem key={name} active={tabActive} onClick={self.handleTabClick} data-tab={name}>
                                <strong data-tab={name}>{self.state.tabs[name]}</strong>
                            </NavItem>
                        );
                    }} />
                </Nav>
                {/* Annotation view */}
                <If condition={currentTab === "annotation"} render={function () {
                    return React.createElement(ReportAnnotationView, {
                        "ref": self.ref.annotation,
                        "thresholds": self.props.thresholds,
                        "chromosomes": self.props.chromosomes,
                        "cytobands": self.props.cytobands,
                        "genes": self.props.genes,
                        "regions": self.state.regions,
                        "description": self.state.description,
                        "onRegionSelect": self.handleRegionSelect,
                        "onGenerateReportClick": self.handleGenerateReportClick
                    });
                }} />
                {/* Preview view */}
                <If condition={currentTab === "preview"} render={function () {
                    return React.createElement(ReportPreviewView, {
                        "generateReport": self.generateReport
                    });
                }} />
            </Content>
        );
    }
}

//Report view default props
ReportView.defaultProps = {
    "title": "Report"
};

