import React from "react";
import jviz from "jviz";
import {schemaHorizontal} from "./schema-horizontal.js";
import {schemaVertical} from "./schema-vertical.js";

//Schema wrappers
let schema = {
    "horizontal": schemaHorizontal,
    "vertical": schemaVertical
};

//Build viewer from props
let buildViewerFromProps = function (props, parent) {
    let chromosome = props.currentChromosome; //Get current chromosome
    //let viewer = jviz(schema[self.props.orientation], {
    let viewer = jviz(schema["horizontal"], {
        "parent": parent
    }); 
    //Set data values
    viewer.data("chromosomes", props.chromosomes);
    viewer.data("cytobands", props.cytobands);
    viewer.data("regions", props.regions);
    //Set initial state values
    viewer.state("chrCurrent", chromosome ? chromosome.name : null);
    //Return the viewer instance
    return viewer;
};

//Explot karyotype component
export class KaryotypeTrack extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        //this.state = {};
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
        let parent = this.ref.parent.current;
        let drawing = parent.getBoundingClientRect();
        //Build the plot
        this.viewer = buildViewerFromProps(this.props, parent);
        //window.karyotype = this.viewer;
        //Update plot variables
        this.viewer.width(drawing.width);
        this.viewer.height(drawing.height);
        //Register event listeners
        this.viewer.addEventListener("chromosome:click", function (event) {
            console.log("Change to chromosome " + event.datum.name);
            //console.log(datum);
            return self.props.onChromosomeClick(event.datum.name);
        });
        //Render the plot
        this.viewer.render();
    }
    //Update the threshold values
    componentDidUpdate() {
        let chromosome = this.props.currentChromosome;
        //Update the current chromosome
        this.viewer.state("chrCurrent", chromosome ? chromosome.name : null);
        this.viewer.data("regions", this.props.regions);
        //this.viewer.state("amplification", this.props.thresholds.amplification);
        //this.viewer.state("deletion", this.props.thresholds.deletion);
        //Update the plot
        this.viewer.render();
    }
    //Render the karyotype overview
    render() {
        return React.createElement("div", {
            "style": {
                "width": this.props.width,
                "height": this.props.height
            },
            "ref": this.ref.parent
        });
    }
}

//Karyotype default props
KaryotypeTrack.defaultProps = {
    "width": "100%",
    "height": "100px",
    "chromosomes": [],
    "cytobands": [],
    "regions": [],
    "currentChromosome": null,
    "onChromosomeClick": null,
    "onRegionClick": null,
    "orientation": "horizontal"
};

//Generate an image of the karyotype
export function getKaryotypeImage (options) {
    options = Object.assign({}, KaryotypeTrack.defaultProps, options);
    let viewer = buildViewerFromProps(options, null); //Initialize viewer
    viewer.width(options.width); //Set width value
    viewer.height(options.height); //Set height value
    //Render the viewer and generate the image in PNG format
    return viewer.render().then(function () {
        return viewer.toImageUrl("png", 1);
    });
}

