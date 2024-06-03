import React from "react";
import jviz from "jviz";
import {schema} from "./schema.js";

//Build viewer from props
let buildViewerFromProps = function (props, parent) {
    let chromosome = props.currentChromosome; //Get current chromosome
    let viewer = jviz(schema, {
        "parent": parent
    }); 
    //Set initial state values
    viewer.state("chromosomeLength", chromosome.length);
    viewer.state("chromosomeName", chromosome.name);
    viewer.state("regionActive", props.currentRegion); //Current region
    //Set initial data
    viewer.data("cytobands", props.cytobands.filter(function (item) {
        return item.chromosome === chromosome.name;
    }));
    viewer.data("regions", props.regions);
    viewer.data("highlight", props.highlights); //Highlighted regions
    //Return the viewer instance
    return viewer;
};

//Export chromosome panel component
export class ChromosomeTrack extends React.Component {
    constructor(props) {
        super(props);
        //Referenced elements
        this.ref = {
            "parent": React.createRef()
        };
        //Viewer instance
        this.viewer = null;
    }
    //Component did mount
    componentDidMount() {
        let self = this;
        //let name = this.props.currentChromosome.replace("chr", ""); //Alias for the chromosome name
        //let chromosome = this.props.currentChromosome; //Get current chromosome
        let drawing = this.ref.parent.current.getBoundingClientRect();
        //Get the current chromosome data
        this.viewer = buildViewerFromProps(this.props, this.ref.parent.current);
        //Set plot width/height
        this.viewer.width(drawing.width);
        this.viewer.height(drawing.height);
        //Add events listeners
        this.viewer.addEventListener("click:region", function (event) {
            //console.log(event);
            return self.props.onRegionClick(event.datum.name);
        }); 
        //Draw
        this.viewer.render();
        //console.log(this.viewer);
    }
    //Component updated: change the threshold values
    componentDidUpdate() {
        //Update the viewer state values
        this.viewer.data("regions", this.props.regions);
        this.viewer.data("highlight", this.props.highlights); //Highlighted regions
        this.viewer.state("regionActive", this.props.currentRegion); //Current region
        //Update the plot
        this.viewer.render();
    }
    //Render the chromosome preview
    render() {
        return React.createElement("div", {
            "style": {
                "width": this.props.width,
                "height": this.props.height,
            },
            "ref": this.ref.parent
        });
    }
}

//Chromosome panel default props
ChromosomeTrack.defaultProps = {
    "width": "100%",
    "height": "120px",
    "currentChromosome": null,
    "currentRegion": null,
    //"selection": {},
    //"chromosomes": [],
    "cytobands": [],
    "regions": [],
    "highlights": []
};

//Generate an image of the chromosome
export function getChromosomeImage (options) {
    options = Object.assign({}, ChromosomeTrack.defaultProps, options);
    let viewer = buildViewerFromProps(options, null); //Initialize viewer
    viewer.width(options.width); //Set width value
    viewer.height(options.height); //Set height value
    //Render the viewer and generate the image in PNG format
    return viewer.render().then(function () {
        return viewer.toImageUrl("png", 1);
    });
}

